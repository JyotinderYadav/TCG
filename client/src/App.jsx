import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const LANGUAGES = ["javascript", "python", "java", "go", "c++"];
const FRAMEWORKS = {
  javascript: "Jest",
  python: "pytest",
  java: "JUnit",
  go: "testing",
  "c++": "GoogleTest",
};

const SAMPLES = {
  "Code Snippet": {
    javascript: `function divide(a, b) {\n  return a / b;\n}`,
    python: `def divide(a, b):\n    return a / b`,
    java: `public double divide(double a, double b) {\n    return a / b;\n}`,
    go: `func divide(a, b float64) float64 {\n    return a / b\n}`,
    "c++": `class Solution {\npublic:\n    static vector<vector<int>> reverseSubmatrix(\n        vector<vector<int>>& grid, int x, int y, int k) {\n        for(int t=x, b=x+k-1; t<b; t++, b--){\n            for(int j=y; j<y+k; j++)\n                swap(grid[t][j], grid[b][j]);\n        }\n        return grid;\n    }\n};`,
  },
  "API Definition": {
    javascript: `POST /api/login\nHeaders: Content-Type: application/json\nBody: {\n  "email": "string (required)",\n  "password": "string (required)"\n}\nSuccess (200): { "token": "jwt_token" }\nErrors:\n  401 - Invalid credentials\n  400 - Missing fields`,
    python: `GET /api/users/{id}\nHeaders: Authorization: Bearer <token>\nSuccess (200): { "id": 1, "name": "John" }\nErrors:\n  404 - Not found\n  401 - Unauthorized`,
    java: `POST /api/products\nBody: { "name": string, "price": number }\nSuccess (201): { "id": 1 }\nErrors:\n  400 - Validation error\n  401 - Unauthorized`,
    go: `DELETE /api/items/{id}\nHeaders: Authorization: Bearer <token>\nSuccess (200): { "message": "Deleted" }\nErrors:\n  404 - Not found\n  403 - Forbidden`,
    "c++": `POST /api/matrix/reverse\nBody: { "grid": 2D array, "x": int, "y": int, "k": int }\nSuccess (200): { "result": 2D array }\nErrors:\n  400 - Invalid bounds\n  422 - k exceeds grid size`,
  },
  "User Story": {
    javascript: `Feature: User Login\n\nAs a registered user,\nI want to log in with email and password,\nSo that I can access my dashboard.\n\nAcceptance Criteria:\n- Valid credentials → redirect to dashboard\n- Wrong password → show error\n- Lock after 5 failed attempts`,
    python: `Feature: Shopping Cart\n\nAs a customer,\nI want to add products to cart,\nSo that I can buy multiple items.\n\nAcceptance Criteria:\n- Add product to cart\n- Update quantity\n- Remove items\n- Cart persists after refresh`,
    java: `Feature: Registration\n\nAs a new visitor,\nI want to create an account,\nSo that I can use the platform.\n\nAcceptance Criteria:\n- Register with email + password\n- Unique email required\n- Verify email before login`,
    go: `Feature: File Upload\n\nAs a user,\nI want to upload profile pictures,\nSo others can identify me.\n\nAcceptance Criteria:\n- Accept jpg, png, gif only\n- Max 5MB file size\n- Resize to 200x200`,
    "c++": `Feature: Matrix Operations\n\nAs a developer,\nI want to reverse submatrices,\nSo that I can process grid data.\n\nAcceptance Criteria:\n- Handle k=1 (no change)\n- Reject out of bounds inputs\n- Return original on invalid input`,
  },
};

const MODE_CONFIG = {
  "Code Snippet": {
    icon: "💻",
    hint: "Paste any function — AI detects bugs live as you type",
    editorMode: true,
  },
  "API Definition": {
    icon: "🌐",
    hint: "Describe your REST endpoint — AI generates full API tests",
    editorMode: false,
  },
  "User Story": {
    icon: "📖",
    hint: "Write feature requirements — AI generates acceptance tests",
    editorMode: false,
  },
};

const SEVERITY = {
  critical: {
    color: "#fc814a",
    bg: "rgba(252,129,74,0.12)",
    border: "rgba(252,129,74,0.3)",
    label: "🔴 CRITICAL",
  },
  warning: {
    color: "#f6ad55",
    bg: "rgba(246,173,85,0.10)",
    border: "rgba(246,173,85,0.3)",
    label: "🟡 WARNING",
  },
  info: {
    color: "#63b3ed",
    bg: "rgba(99,179,237,0.08)",
    border: "rgba(99,179,237,0.25)",
    label: "🔵 INFO",
  },
};

// ─── PARSER ──────────────────────────────────────────────────────────────────
function parseOutput(raw) {
  const sections = { testCases: [], edgeCases: [], bugs: [], rawCode: "" };
  if (!raw) return sections;
  const lines = raw.split("\n");
  let currentSection = null;
  let codeLines = [],
    inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      if (!inCode && codeLines.length > 0) {
        sections.rawCode += codeLines.join("\n") + "\n\n";
        codeLines = [];
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    const low = line.toLowerCase();
    if (low.match(/^(?:#|\*\*)*\s*edge case/)) {
      currentSection = "edge";
      continue;
    } else if (low.match(/^(?:#|\*\*)*\s*(bug|fix)/)) {
      currentSection = "bug";
      continue;
    } else if (low.match(/^(?:#|\*\*)*\s*(test case|executable)/)) {
      currentSection = "test";
      continue;
    }
    const isBullet = /^\s*(?:[-*•]|\d+\.)\s+/.test(line) && line.trim().length > 5;
    if (isBullet) {
      const clean = line.replace(/^\s*(?:[-*•]|\d+\.)\s+/, "").trim();
      if (!clean) continue;
      if (currentSection === "edge") sections.edgeCases.push(clean);
      else if (currentSection === "bug") sections.bugs.push(clean);
      else if (currentSection === "test") sections.testCases.push(clean);
    }
  }
  if (sections.testCases.length === 0 && sections.edgeCases.length === 0) {
    lines
      .filter((l) => l.trim().length > 10 && !l.includes("```"))
      .forEach((l) => {
        const low = l.toLowerCase();
        if (
          low.includes("edge") ||
          low.includes("boundary") ||
          low.includes("null")
        )
          sections.edgeCases.push(l.trim());
        else if (
          low.includes("bug") ||
          low.includes("fix") ||
          low.includes("missing")
        )
          sections.bugs.push(l.trim());
        else if (/^\s*[-*•\d]/.test(l)) sections.testCases.push(l.trim());
      });
  }
  return sections;
}

// ─── GLASS CARD ──────────────────────────────────────────────────────────────
function GlassCard({ icon, title, color, items, emptyMsg }) {
  const colors = {
    blue: {
      border: "rgba(99,179,237,0.3)",
      bg: "rgba(99,179,237,0.07)",
      accent: "#63b3ed",
      badge: "rgba(99,179,237,0.15)",
      text: "#90cdf4",
    },
    amber: {
      border: "rgba(246,173,85,0.3)",
      bg: "rgba(246,173,85,0.07)",
      accent: "#f6ad55",
      badge: "rgba(246,173,85,0.15)",
      text: "#fbd38d",
    },
    red: {
      border: "rgba(252,129,74,0.3)",
      bg: "rgba(252,129,74,0.07)",
      accent: "#fc814a",
      badge: "rgba(252,129,74,0.15)",
      text: "#feb2b2",
    },
  };
  const c = colors[color];
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${c.bg}, rgba(255,255,255,0.02))`,
        border: `1px solid ${c.border}`,
        borderRadius: "16px",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "13px 18px",
          borderBottom: `1px solid ${c.border}`,
          background: `linear-gradient(90deg, ${c.badge}, transparent)`,
        }}
      >
        <span style={{ fontSize: "17px" }}>{icon}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: c.accent,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span
          style={{
            marginLeft: "auto",
            background: c.badge,
            color: c.text,
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: "20px",
            border: `1px solid ${c.border}`,
          }}
        >
          {items.length} found
        </span>
      </div>
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "7px",
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "13px",
              fontStyle: "italic",
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            {emptyMsg}
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "9px 12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  minWidth: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: c.badge,
                  border: `1px solid ${c.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: c.text,
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: "1.6",
                }}
              >
                {item}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  if (!code?.trim()) return null;
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(255,255,255,0.02))",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderBottom: "1px solid rgba(139,92,246,0.2)",
          background:
            "linear-gradient(90deg, rgba(139,92,246,0.12), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚡</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: "#a78bfa",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Executable Test Code
          </span>
        </div>
        <button
          onClick={copy}
          style={{
            background: copied ? "rgba(34,197,94,0.2)" : "rgba(139,92,246,0.2)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(139,92,246,0.4)"}`,
            color: copied ? "#86efac" : "#c4b5fd",
            padding: "4px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {copied ? "✓ Copied!" : "Copy Code"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 18px",
          fontSize: "12px",
          lineHeight: "1.7",
          color: "rgba(255,255,255,0.8)",
          fontFamily: '"Fira Code", monospace',
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code.trim()}
      </pre>
    </div>
  );
}

// ─── LIVE BUG PANEL ──────────────────────────────────────────────────────────
function LiveBugPanel({ bugs, analyzing }) {
  if (analyzing)
    return (
      <div
        style={{
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "14px",
          padding: "16px 18px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid rgba(139,92,246,0.4)",
            borderTopColor: "#a78bfa",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          Scanning for bugs...
        </span>
      </div>
    );

  if (!bugs || bugs.length === 0)
    return (
      <div
        style={{
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "14px",
          padding: "14px 18px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>✅</span>
        <span
          style={{
            fontSize: "13px",
            color: "rgba(34,197,94,0.9)",
            fontWeight: 600,
          }}
        >
          No bugs detected in current code
        </span>
      </div>
    );

  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "14px" }}>🔴</span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#fc814a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Live Bugs Detected
        </span>
        <span
          style={{
            background: "rgba(252,129,74,0.15)",
            color: "#feb2b2",
            fontSize: "11px",
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(252,129,74,0.3)",
          }}
        >
          {bugs.length} found
        </span>
      </div>
      {bugs.map((bug, i) => {
        const s = SEVERITY[bug.severity] || SEVERITY.info;
        return (
          <div
            key={i}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "8px",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: s.color,
                  background: `${s.bg}`,
                  border: `1px solid ${s.border}`,
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {s.label}
              </span>
              {bug.line && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Line {bug.line}
                </span>
              )}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {bug.bug}
              </span>
            </div>
            {/* Explanation */}
            <div
              style={{
                fontSize: "12.5px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: "1.6",
                marginBottom: "10px",
              }}
            >
              {bug.explanation}
            </div>
            {/* Fix box */}
            <div
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#86efac",
                  marginBottom: "5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                ✅ How to Fix
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: '"Fira Code", monospace',
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {bug.fix}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [inputType, setInputType] = useState("Code Snippet");
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(SAMPLES["Code Snippet"]["cpp"]);
  const [parsed, setParsed] = useState(null);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("structured");
  const [liveBugs, setLiveBugs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [aiMode, setAiMode] = useState("cloud"); // "cloud" or "local"
  const [localAvailable, setLocalAvailable] = useState(false);
  const [execResult, setExecResult] = useState(null);
  const [execLoading, setExecLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixedCode, setFixedCode] = useState("");
  const debounceRef = useRef(null);

  // Poll local model availability every 5s
  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get("http://localhost:5555/api/local-status");
        setLocalAvailable(res.data.available);
      } catch { setLocalAvailable(false); }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const mode = MODE_CONFIG[inputType];

  // ── Live analysis debounced ──────────────────────────────────────────────
  const runLiveAnalysis = useCallback(
    async (codeVal, lang) => {
      if (!liveEnabled || !codeVal || codeVal.trim().length < 20) {
        setLiveBugs([]);
        return;
      }
      setAnalyzing(true);
      try {
        const res = await axios.post("http://localhost:5555/api/analyze", {
          code: codeVal,
          language: lang,
          mode: aiMode,
        });
        setLiveBugs(res.data.bugs || []);
      } catch {
        setLiveBugs([]);
      }
      setAnalyzing(false);
    },
    [liveEnabled],
  );

  // Debounce: wait 1.5s after user stops typing
  useEffect(() => {
    if (inputType !== "Code Snippet") return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => runLiveAnalysis(code, language),
      1500,
    );
    return () => clearTimeout(debounceRef.current);
  }, [code, language, inputType, runLiveAnalysis]);

  const switchMode = (newMode) => {
    setInputType(newMode);
    setParsed(null);
    setRawResult("");
    setActiveTab("structured");
    setLiveBugs([]);
    const sample =
      SAMPLES[newMode]?.[language] || SAMPLES[newMode]?.["javascript"] || "";
    setCode(sample);
  };

  const switchLanguage = (lang) => {
    setLanguage(lang);
    const sample = SAMPLES[inputType]?.[lang] || "";
    setCode(sample);
    setLiveBugs([]);
  };

  const generate = async () => {
    setLoading(true);
    setParsed(null);
    setRawResult("");
    try {
      const res = await axios.post("http://localhost:5555/api/generate", {
        code,
        language,
        framework: FRAMEWORKS[language],
        inputType,
        mode: aiMode,
      });
      const raw = res.data.result;
      setRawResult(raw);
      setParsed(parseOutput(raw));
      setActiveTab("structured");
    } catch (err) {
      setRawResult("Error: " + err.message);
    }
    setLoading(false);
  };

  const handleExecute = async () => {
    if (!parsed?.rawCode) return;
    setExecLoading(true);
    setExecResult(null);
    setFixedCode("");
    try {
      const res = await axios.post("http://localhost:5555/api/execute", {
        code,
        tests: parsed.rawCode,
        language,
      });
      setExecResult(res.data);
      if (!res.data.success) {
        // Automatically request a fix if tests fail
        handleFix(res.data.output);
      }
    } catch (err) {
      setExecResult({ success: false, output: "Execution failed: " + err.message });
    }
    setExecLoading(false);
  };

  const handleFix = async (errorLog) => {
    setFixLoading(true);
    try {
      const res = await axios.post("http://localhost:5555/api/fix", {
        code,
        error: errorLog,
        mode: aiMode,
        language,
      });
      setFixedCode(res.data.fixedCode);
    } catch (err) {
      console.error("Fix failed", err);
    }
    setFixLoading(false);
  };

  const applyFix = () => {
    if (fixedCode) {
      // Extract code from markdown if present
      const cleanCode = fixedCode.includes("```") 
        ? fixedCode.split("```")[1].split("\n").slice(1).join("\n")
        : fixedCode;
      setCode(cleanCode.trim());
      setFixedCode("");
      setExecResult(null);
    }
  };

  const totalFound = parsed
    ? parsed.testCases.length + parsed.edgeCases.length + parsed.bugs.length
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 40%, #0a0f0a 100%)",
        fontFamily: '"Inter", system-ui, sans-serif',
        color: "white",
      }}
    >
      {/* Ambient orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px 20px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "20px",
              padding: "4px 16px",
            }}
          >
            <span style={{ fontSize: "12px" }}>⚡</span>
            <span
              style={{
                fontSize: "12px",
                color: "#c4b5fd",
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              AI POWERED{" "}
            </span>
          </div>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              margin: "0 0 6px",
              background:
                "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Automatic Testcase Generator
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Type code → bugs appear live · Click Generate → full test suite
          </p>

          {/* ── AI Mode Toggle ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "14px", alignItems: "center" }}>
            <button
              onClick={() => setAiMode("cloud")}
              style={{
                padding: "7px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                background: aiMode === "cloud" ? "rgba(99,179,237,0.25)" : "rgba(255,255,255,0.05)",
                color: aiMode === "cloud" ? "#90cdf4" : "rgba(255,255,255,0.4)",
                outline: aiMode === "cloud" ? "1px solid rgba(99,179,237,0.5)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ☁️ Cloud API
            </button>
            <button
              onClick={() => setAiMode("local")}
              style={{
                padding: "7px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                background: aiMode === "local" ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.05)",
                color: aiMode === "local" ? "#86efac" : "rgba(255,255,255,0.4)",
                outline: aiMode === "local" ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              🖥️ Local Model
            </button>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: localAvailable ? "rgba(34,197,94,0.8)" : "rgba(255,255,255,0.3)",
              marginLeft: "6px",
            }}>
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: localAvailable ? "#22c55e" : "rgba(255,255,255,0.2)",
                boxShadow: localAvailable ? "0 0 6px rgba(34,197,94,0.6)" : "none",
              }} />
              {localAvailable ? "Local model ready" : "Local model offline"}
            </span>
          </div>

          {/* Model Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "10px",
            background: aiMode === "cloud" ? "rgba(99,179,237,0.1)" : "rgba(34,197,94,0.1)",
            border: `1px solid ${aiMode === "cloud" ? "rgba(99,179,237,0.2)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: "16px",
            padding: "3px 12px",
          }}>
            <span style={{ fontSize: "10px" }}>{aiMode === "cloud" ? "🚀" : "🧠"}</span>
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              color: aiMode === "cloud" ? "#90cdf4" : "#86efac",
              letterSpacing: "0.05em",
            }}>
              {aiMode === "cloud" ? "Powered by Llama 3.3 70B" : "Powered by Local Qwen 1.5B"}
            </span>
          </div>
        </div>

        {/* Mode Tabs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "14px",
            justifyContent: "center",
          }}
        >
          {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              style={{
                padding: "9px 18px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                background:
                  inputType === key
                    ? "rgba(139,92,246,0.25)"
                    : "rgba(255,255,255,0.05)",
                color: inputType === key ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                outline:
                  inputType === key
                    ? "1px solid rgba(139,92,246,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span>{cfg.icon}</span> {key}
            </button>
          ))}
        </div>

        {/* Hint */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.04)",
              padding: "5px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            💡 {mode.hint}
          </span>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* LEFT — Editor */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Editor toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ff5f57",
                  }}
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ffbd2e",
                  }}
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#28ca40",
                  }}
                />
              </div>

              {mode.editorMode ? (
                <select
                  value={language}
                  onChange={(e) => switchLanguage(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l} style={{ background: "#1a1a2e" }}>
                      {l} → {FRAMEWORKS[l]}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {mode.icon} {inputType}
                </span>
              )}

              {/* Live toggle — only for code mode */}
              {mode.editorMode && (
                <button
                  onClick={() => setLiveEnabled((p) => !p)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s",
                    background: liveEnabled
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(255,255,255,0.06)",
                    color: liveEnabled ? "#86efac" : "rgba(255,255,255,0.35)",
                    outline: liveEnabled
                      ? "1px solid rgba(34,197,94,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {liveEnabled ? "🟢 Live ON" : "⚪ Live OFF"}
                </button>
              )}

              <button
                onClick={generate}
                disabled={loading}
                style={{
                  marginLeft: "auto",
                  background: loading
                    ? "rgba(139,92,246,0.2)"
                    : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "white",
                  padding: "7px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(124,58,237,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />{" "}
                    Analyzing...
                  </>
                ) : (
                  " Generate Tests"
                )}
              </button>
            </div>

            {/* Monaco editor */}
            {mode.editorMode && (
              <Editor
                height="460px"
                language={language === "cpp" ? "cpp" : language}
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  fontFamily: '"Fira Code", monospace',
                  fontLigatures: true,
                }}
              />
            )}

            {/* Textarea for API / User Story */}
            {!mode.editorMode && (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: "100%",
                  height: "460px",
                  boxSizing: "border-box",
                  background: "#1e1e2e",
                  color: "rgba(255,255,255,0.85)",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  padding: "20px",
                  fontSize: "13px",
                  lineHeight: "1.8",
                  fontFamily: '"Fira Code", monospace',
                }}
              />
            )}

            {/* Live bug count bar at bottom of editor */}
            {mode.editorMode && (
              <div
                style={{
                  padding: "8px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {analyzing ? (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        border: "1.5px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#a78bfa",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />{" "}
                    Scanning...
                  </span>
                ) : liveBugs.length > 0 ? (
                  <>
                    {liveBugs.filter((b) => b.severity === "critical").length >
                      0 && (
                      <span style={{ fontSize: "11px", color: "#fc814a" }}>
                        🔴{" "}
                        {
                          liveBugs.filter((b) => b.severity === "critical")
                            .length
                        }{" "}
                        critical
                      </span>
                    )}
                    {liveBugs.filter((b) => b.severity === "warning").length >
                      0 && (
                      <span style={{ fontSize: "11px", color: "#f6ad55" }}>
                        🟡{" "}
                        {
                          liveBugs.filter((b) => b.severity === "warning")
                            .length
                        }{" "}
                        warning
                      </span>
                    )}
                    {liveBugs.filter((b) => b.severity === "info").length >
                      0 && (
                      <span style={{ fontSize: "11px", color: "#63b3ed" }}>
                        🔵{" "}
                        {liveBugs.filter((b) => b.severity === "info").length}{" "}
                        info
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    style={{ fontSize: "11px", color: "rgba(34,197,94,0.7)" }}
                  >
                    ✓ No issues detected
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  {liveEnabled ? "Live analysis on" : "Live analysis off"}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — Output */}
          <div>
            {/* Tab switcher for generated output */}
            {(parsed || loading || rawResult) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "10px",
                    padding: "3px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {["structured", "raw"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        background:
                          activeTab === tab
                            ? "rgba(139,92,246,0.3)"
                            : "transparent",
                        color:
                          activeTab === tab
                            ? "#c4b5fd"
                            : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {tab === "structured" ? " Structured" : " Raw"}
                    </button>
                  ))}
                </div>
                {parsed && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    ✓ {totalFound} items detected
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div
                style={{
                  background: "rgba(139,92,246,0.06)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "20px",
                  padding: "40px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "12px",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                >
                  🔬
                </div>
                <div
                  style={{
                    color: "#c4b5fd",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Generating full test suite...
                </div>
                <div
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}
                >
                  Building test cases, edge cases & executable code
                </div>
              </div>
            )}

            {/* Structured output */}
            {!loading && parsed && activeTab === "structured" && (
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  paddingRight: "2px",
                }}
              >
                <GlassCard
                  icon="✅"
                  title="Test Cases"
                  color="blue"
                  items={parsed.testCases}
                  emptyMsg="No test cases found"
                />
                <GlassCard
                  icon="⚠️"
                  title="Edge Cases"
                  color="amber"
                  items={parsed.edgeCases}
                  emptyMsg="No edge cases detected"
                />
                {inputType === "Code Snippet" && liveEnabled && (
                  <LiveBugPanel bugs={liveBugs} analyzing={analyzing} />
                )}
                <GlassCard
                  icon="🐛"
                  title="Bugs & Fixes"
                  color="red"
                  items={parsed.bugs}
                  emptyMsg="No bugs detected"
                />

                {/* SELF-HEALING SECTION */}
                <div style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "rgba(139,92,246,0.05)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: "16px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>🛡️</span>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#a78bfa" }}>Self-Healing Debugger</span>
                    </div>
                    <button
                      onClick={handleExecute}
                      disabled={execLoading}
                      style={{
                        padding: "6px 15px",
                        borderRadius: "8px",
                        background: "#7c3aed",
                        color: "white",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: execLoading ? 0.6 : 1
                      }}
                    >
                      {execLoading ? "Running..." : "▶️ Run Tests & Auto-Fix"}
                    </button>
                  </div>

                  {execResult && (
                    <div style={{ 
                      background: "#000", 
                      borderRadius: "8px", 
                      padding: "12px", 
                      fontFamily: "monospace", 
                      fontSize: "12px",
                      border: `1px solid ${execResult.success ? "#22c55e44" : "#ef444444"}`,
                      marginBottom: "15px"
                    }}>
                      <div style={{ color: execResult.success ? "#22c55e" : "#ef4444", marginBottom: "8px", fontWeight: "bold" }}>
                        {execResult.success ? "✓ ALL TESTS PASSED" : "✗ TESTS FAILED"}
                      </div>
                      <pre style={{ margin: 0, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-wrap" }}>
                        {execResult.output}
                      </pre>
                    </div>
                  )}

                  {fixLoading && (
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textAlign: "center", padding: "10px" }}>
                      🧠 AI is analyzing the failure and generating a fix...
                    </div>
                  )}

                  {fixedCode && (
                    <div style={{ 
                      background: "rgba(34,197,94,0.1)", 
                      border: "1px solid rgba(34,197,94,0.3)", 
                      borderRadius: "12px", 
                      padding: "15px" 
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ color: "#86efac", fontWeight: 700, fontSize: "12px" }}>✨ SUGGESTED FIX</span>
                        <button
                          onClick={applyFix}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            background: "#22c55e",
                            color: "white",
                            border: "none",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Apply Fix to Editor
                        </button>
                      </div>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: "11px", 
                        color: "rgba(255,255,255,0.8)", 
                        fontFamily: "monospace",
                        maxHeight: "200px",
                        overflow: "auto"
                      }}>
                        {fixedCode}
                      </pre>
                    </div>
                  )}
                </div>

                <CodeBlock code={parsed.rawCode} />
              </div>
            )}

            {/* Raw output */}
            {!loading && rawResult && activeTab === "raw" && (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.75)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.7",
                    margin: 0,
                    fontFamily: '"Fira Code", monospace',
                  }}
                >
                  {rawResult}
                </pre>
              </div>
            )}

            {/* Empty state */}
            {!loading && !parsed && !rawResult && !liveEnabled && (
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "60px 40px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                    opacity: 0.3,
                  }}
                >
                  {mode.icon}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "14px",
                    lineHeight: "1.9",
                  }}
                >
                  Paste code on the left
                  <br />
                  and click{" "}
                  <strong style={{ color: "rgba(139,92,246,0.7)" }}>
                    Generate Tests
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        select option { background: #1a1a2e; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}
