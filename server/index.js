import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Groq from 'groq-sdk'

dotenv.config()

const app = express()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.use(cors())
app.use(express.json())

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
List every test case (happy path, normal scenarios):
- Test case 1: [name] | Input: [value] | Expected: [value]
- Test case 2: [name] | Input: [value] | Expected: [value]

## EDGE CASES
List all edge/boundary cases:
- Edge case 1: [description] | Input: [value] | Expected: [value]
- Edge case 2: [description] | Input: [value] | Expected: [value]

## BUGS & FIXES
List all bugs found and how to fix them:
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
  const { code, language, framework, inputType } = req.body

  if (!code || !code.trim())
    return res.status(400).json({ error: 'Input cannot be empty' })

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
  const { code, language } = req.body

  if (!code || code.trim().length < 10)
    return res.json({ bugs: [] })

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildLiveBugPrompt(code, language || 'javascript') }],
      max_tokens: 800,
      temperature: 0.1,
    })

    const raw = completion.choices[0].message.content.trim()
    // Strip markdown fences if model adds them
    const clean = raw.replace(/```json|```/g, '').trim()

    let bugs = []
    try { bugs = JSON.parse(clean) } catch { bugs = [] }

    res.json({ bugs })
  } catch (err) {
    console.error('Analyze error:', err.message)
    res.json({ bugs: [] })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})