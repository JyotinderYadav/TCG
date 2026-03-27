#!/usr/bin/env python3
"""Local inference server for the fine-tuned test generation model."""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, sys

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ADAPTER_DIR = os.path.join(SCRIPT_DIR, "adapters")
MODEL_NAME = "mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit"

# Lazy-load model
_model = None
_tokenizer = None

def get_model():
    global _model, _tokenizer
    if _model is None:
        from mlx_lm import load
        print(f"Loading model {MODEL_NAME} with adapters from {ADAPTER_DIR}...")
        adapter_path = ADAPTER_DIR if os.path.exists(os.path.join(ADAPTER_DIR, "adapters.safetensors")) else None
        _model, _tokenizer = load(MODEL_NAME, adapter_path=adapter_path)
        print("Model loaded successfully!")
    return _model, _tokenizer

SYSTEM_PROMPT = """You are an expert software tester. Given code, generate structured test reports with exactly these sections:
## TEST CASES
## EDGE CASES
## BUGS & FIXES
Use bullet points (dash -) for all items. Format: - Item: description | Input: value | Expected: value"""

def generate_response(code, language="python", max_tokens=2000):
    from mlx_lm import generate
    model, tokenizer = get_model()

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Generate a comprehensive test report for this {language} code:\n```{language}\n{code}\n```"}
    ]

    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    response = generate(model, tokenizer, prompt=prompt, max_tokens=max_tokens, temp=0.3)
    return response

@app.route("/health", methods=["GET"])
def health():
    has_adapters = os.path.exists(os.path.join(ADAPTER_DIR, "adapters.safetensors"))
    return jsonify({"status": "ok", "model": MODEL_NAME, "adapters_loaded": has_adapters})

@app.route("/generate", methods=["POST"])
def gen():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")

    if not code.strip():
        return jsonify({"error": "Code cannot be empty"}), 400

    try:
        result = generate_response(code, language)
        return jsonify({"result": result})
    except Exception as e:
        print(f"Generate error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")

    if not code or len(code.strip()) < 10:
        return jsonify({"bugs": []})

    try:
        from mlx_lm import generate
        model, tokenizer = get_model()

        messages = [
            {"role": "system", "content": "You are a code reviewer. Respond ONLY with a JSON array of bugs. Format: [{\"line\": N, \"severity\": \"critical|warning|info\", \"bug\": \"title\", \"explanation\": \"desc\", \"fix\": \"how\"}]. If no bugs, return []."},
            {"role": "user", "content": f"Find bugs in this {language} code:\n```{language}\n{code}\n```"}
        ]

        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        raw = generate(model, tokenizer, prompt=prompt, max_tokens=800, temp=0.1)

        import json, re
        clean = re.sub(r'```json|```', '', raw).strip()
        try:
            bugs = json.loads(clean)
        except:
            bugs = []

        return jsonify({"bugs": bugs})
    except Exception as e:
        print(f"Analyze error: {e}")
        return jsonify({"bugs": []})

if __name__ == "__main__":
    print("Pre-loading model...")
    get_model()
    print(f"Local inference server starting on port 5556")
    app.run(host="0.0.0.0", port=5556, debug=False)
