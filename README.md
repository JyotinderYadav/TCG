# Dual-Mode AI Testcase Generator & Self-Healing Debugger 🚀

An intelligent AI-powered tool that goes beyond standard generation. It features a unique **Self-Healing AI Debugger loop** that automatically executes tests, catches crashes, and proposes code fixes in real-time.

## 📋 Features

- **Dual-Mode AI Engine**: Toggle between **Cloud** (Groq/Llama 3.3) and **Local** (Fine-tuned Qwen2.5-Coder).
- **Self-Healing Debugger 🛡️**: Automatically executes tests, catches crashes (like `ZeroDivisionError`), and proposes fixes.
- **MLX Performance**: Native Apple Silicon optimization (M1/M2/M3) for zero-latency local inference.
- **Privacy-First**: Option to process sensitive code entirely offline using your own hardware.
- **Three Input Modes**: Code Snippet, API Definition, and User Story.
- **Structured Output**: Test cases, edge cases, bug detection, and executable code.

## 📁 Project Structure

```
Automatic_Testcase_Generator/
├── client/                 # React frontend application
├── server/                 # Node.js backend & AI Orchestrator
│   ├── index.js            # Main routing & execution logic
│   └── training/           # Local MLX models & Inference server
└── README.md
```

## 🚀 Getting Started (Run the Project)

### 1. Prerequisites
- Node.js (v18+)
- Python 3.12+ (on Apple Silicon for MLX)
- Groq API key ([Get one here](https://console.groq.com))

### 2. Setup Backend (Node.js)
```bash
cd server
npm install
# Create/Edit .env file
echo "GROQ_API_KEY=your_api_key" > .env
echo "PORT=5555" >> .env
npm run dev
```

### 3. Setup Local AI Server (Python/MLX)
*Crucial for "Local Mode" and the "Self-Healing" feature.*
```bash
cd server
# Install dependencies
pip3 install flask flask-cors mlx-lm pytest axios --break-system-packages
# Start local inference
python3 -u training/local_server.py
```

### 4. Setup Frontend (React)
```bash
cd client
npm install
npm run dev
```

**Access the App at**: `http://localhost:5173`

## 📚 Usage Guide

1. **Paste your Code**: Add a function or class to the editor.
2. **Generate Tests**: Click the generate button (Cloud or Local).
3. **Run & Auto-Fix**: If tests fail, click **"▶️ Run Tests & Auto-Fix"**. 
4. **Apply Fix**: The AI will analyze the crash logs from the sandbox and suggest a fix. Click **"Apply Fix"** to heal your code!

---
**TEAM 24 - 1 Step Ahead 🏁**
Made with ❤️ for the Hackathon.
