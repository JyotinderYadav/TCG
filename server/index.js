import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Groq from 'groq-sdk'
import axios from 'axios'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

dotenv.config()

const app = express()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.use(cors())
app.use(express.json())

// ─── LOCAL MODEL PROXY ──────────────────────────────────────────────────────
const LOCAL_MODEL_URL = 'http://localhost:5556'

async function isLocalModelAvailable() {
  try {
    const resp = await fetch(`${LOCAL_MODEL_URL}/health`, { signal: AbortSignal.timeout(2000) })
    return resp.ok
  } catch { return false }
}

async function proxyToLocal(endpoint, body) {
  const resp = await fetch(`${LOCAL_MODEL_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  })
  if (!resp.ok) throw new Error(`Local model error: ${resp.status}`)
  return resp.json()
}

// ─── PROMPT BUILDERS ────────────────────────────────────────────────────────

function buildCodeSnippetPrompt(code, language, framework) {
  return `You are an expert software tester analyzing ${language} code.
FRAMEWORK TO USE: ${framework}
CODE TO TEST:
\`\`\`${language}
${code}
\`\`\`

Generate a STRUCTURED test report with EXACTLY these 4 sections:

## TEST CASES
List 3 to 5 comprehensive test cases (happy path, normal scenarios). YOU MUST USE BULLET POINTS (dash -):
- Test case 1: [name] | Input: [value] | Expected: [value]
- Test case 2: [name] | Input: [value] | Expected: [value]

## EDGE CASES
List 2 to 4 edge/boundary cases. YOU MUST USE BULLET POINTS (dash -):
- Edge case 1: [description] | Input: [value] | Expected: [value]
- Edge case 2: [description] | Input: [value] | Expected: [value]

## BUGS & FIXES
List up to 3 critical bugs found, or state "None" if perfectly safe. YOU MUST USE BULLET POINTS (dash -):
- Bug 1: [bug description] | Fix: [how to fix it]
- Bug 2: [bug description] | Fix: [how to fix it]

## EXECUTABLE CODE
\`\`\`${language}
[write the complete ${framework} test file here]
\`\`\`

Be thorough. Cover null inputs, empty values, type errors, boundary values.`
}

function buildApiPrompt(apiDefinition, framework) {
  return `You are an expert API tester. Analyze this API definition and generate comprehensive test cases.
FRAMEWORK TO USE: ${framework}
API DEFINITION:
${apiDefinition}

Generate a STRUCTURED test report with EXACTLY these 4 sections:

## TEST CASES
- Test case 1: [HTTP method + endpoint] | Input: [request body/params] | Expected: [status code + response]
- Test case 2: [HTTP method + endpoint] | Input: [request body/params] | Expected: [status code + response]

## EDGE CASES
- Edge case 1: [description] | Input: [request] | Expected: [status + response]
- Edge case 2: [description] | Input: [request] | Expected: [status + response]
Include: missing fields, wrong types, empty strings, long inputs, unauthorized access

## BUGS & FIXES
- Bug 1: [issue description] | Fix: [recommendation]
- Bug 2: [issue description] | Fix: [recommendation]
Include: missing validation, security issues, missing error handling

## EXECUTABLE CODE
\`\`\`javascript
[write complete ${framework} API test file using supertest or axios]
\`\`\``
}

function buildUserStoryPrompt(userStory, framework) {
  return `You are an expert QA engineer. Analyze this user story and generate comprehensive test cases.
FRAMEWORK TO USE: ${framework}
USER STORY:
${userStory}

Generate a STRUCTURED test report with EXACTLY these 4 sections:

## TEST CASES
- Test case 1: [scenario] | Given: [precondition] | When: [action] | Then: [result]
- Test case 2: [scenario] | Given: [precondition] | When: [action] | Then: [result]

## EDGE CASES
- Edge case 1: [scenario] | Given: [precondition] | When: [action] | Then: [result]
- Edge case 2: [scenario] | Given: [precondition] | When: [action] | Then: [result]
Include: invalid inputs, unauthorized users, missing data

## BUGS & FIXES
- Bug 1: [missing requirement or ambiguity] | Fix: [clarification needed]
- Bug 2: [potential issue] | Fix: [recommendation]

## EXECUTABLE CODE
\`\`\`javascript
[write complete ${framework} test file]
\`\`\``
}

// ─── LIVE BUG DETECTION PROMPT ───────────────────────────────────────────────

function buildLiveBugPrompt(code, language) {
  return `You are a senior ${language} code reviewer doing INSTANT bug detection.

Analyze this code and respond ONLY with a JSON array. No explanation, no markdown, just raw JSON.

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond with this exact JSON format:
[
  {
    "line": <line_number>,
    "severity": "critical" | "warning" | "info",
    "bug": "<short bug title>",
    "explanation": "<1 sentence explanation>",
    "fix": "<exact fix code or instruction>"
  }
]

Severity rules:
- critical = crash, security issue, undefined behavior, out of bounds
- warning = missing validation, logic error, potential null pointer
- info = best practice, performance, code style

If no bugs found, return: []
Return ONLY the JSON array, nothing else.`
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// Full test generation
app.post('/api/generate', async (req, res) => {
  const { code, language, framework, inputType, mode } = req.body

  if (!code || !code.trim())
    return res.status(400).json({ error: 'Input cannot be empty' })

  // ── LOCAL MODE ──
  if (mode === 'local') {
    try {
      const data = await proxyToLocal('/generate', { code, language, framework, inputType })
      return res.json(data)
    } catch (err) {
      console.error('Local model error, falling back to cloud:', err.message)
      // fallthrough to cloud
    }
  }

  // ── CLOUD MODE (Groq) ──
  let prompt
  if (inputType === 'API Definition') prompt = buildApiPrompt(code, framework || 'Jest')
  else if (inputType === 'User Story') prompt = buildUserStoryPrompt(code, framework || 'Jest')
  else prompt = buildCodeSnippetPrompt(code, language || 'javascript', framework || 'Jest')

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.3,
    })
    res.json({ result: completion.choices[0].message.content })
  } catch (err) {
    console.error('Generate error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Live bug detection (fast, lightweight)
app.post('/api/analyze', async (req, res) => {
  const { code, language, mode } = req.body

  if (!code || code.trim().length < 10)
    return res.json({ bugs: [] })

  // ── LOCAL MODE ──
  if (mode === 'local') {
    try {
      const data = await proxyToLocal('/analyze', { code, language })
      return res.json(data)
    } catch (err) {
      console.error('Local analyze error, falling back to cloud:', err.message)
    }
  }

  // ── CLOUD MODE (Groq) ──
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildLiveBugPrompt(code, language || 'javascript') }],
      max_tokens: 800,
      temperature: 0.1,
    })
    const raw = completion.choices[0].message.content.trim()
    const clean = raw.replace(/```json|```/g, '').trim()

    let bugs = []
    try { bugs = JSON.parse(clean) } catch { bugs = [] }

    res.json({ bugs })
  } catch (err) {
    console.error('Analyze error:', err.message)
    res.json({ bugs: [] })
  }
})

// Local model status check
app.get('/api/local-status', async (req, res) => {
    try {
        await axios.get('http://localhost:5556/health', { timeout: 1000 });
        res.json({ online: true });
    } catch (err) {
        res.json({ online: false });
    }
});

app.post('/api/execute', async (req, res) => {
    const { code, tests, language } = req.body;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-'));
    let fileName, testFileName, command;

    try {
        if (language === 'python') {
            fileName = path.join(tempDir, 'solution.py');
            testFileName = path.join(tempDir, 'test_solution.py');
            fs.writeFileSync(fileName, code);
            
            // Basic wrapper to run tests
            const fullTestCode = `
import pytest
import sys
${code}

def test_generated():
    # Attempt to parse and run the generated tests if they are in a specific format
    # For now, we expect the AI to provide readable test cases or we run a simple check
    pass 

${tests}
`;
            fs.writeFileSync(testFileName, fullTestCode);
            command = `pytest ${testFileName} --tb=short`;
        } else if (language === 'javascript') {
            fileName = path.join(tempDir, 'solution.js');
            fs.writeFileSync(fileName, `${code}\n\n${tests}`);
            command = `node ${fileName}`;
        } else {
            return res.status(400).json({ error: "Execution only supported for Python/JS currently" });
        }

        exec(command, (error, stdout, stderr) => {
            const output = stdout + stderr;
            const success = !error;
            res.json({ success, output, error: error ? error.message : null });
            
            // Cleanup
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/fix', async (req, res) => {
    const { code, error, mode, language } = req.body;
    const prompt = `### [CODE FIXING]
Language: ${language}
Original Code:
${code}

Error Log:
${error}

Instructions: Analyze the error and provide ONLY the corrected code block. No explanations.`;

    try {
        if (mode === 'local') {
            try {
                const localResp = await axios.post('http://localhost:5556/generate', { 
                    code: `ERROR_FIX: ${code}\nLOG: ${error}`, 
                    language 
                });
                return res.json({ fixedCode: localResp.data.result });
            } catch (err) {
                console.warn("Local fix failed, falling back to cloud");
            }
        }

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        res.json({ fixedCode: completion.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})