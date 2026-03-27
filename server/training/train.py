#!/usr/bin/env python3
"""Fine-tune Qwen2.5-Coder-1.5B-Instruct on test generation dataset using MLX LoRA."""
import json, os, subprocess, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(SCRIPT_DIR, "dataset.jsonl")
TRAIN_DIR = os.path.join(SCRIPT_DIR, "train_data")
ADAPTER_DIR = os.path.join(SCRIPT_DIR, "adapters")
MODEL_NAME = "mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit"

def prepare_data():
    """Convert dataset.jsonl into mlx-lm chat format (train.jsonl / valid.jsonl)."""
    os.makedirs(TRAIN_DIR, exist_ok=True)

    with open(DATASET_PATH) as f:
        examples = [json.loads(line) for line in f]

    # 85/15 split
    split = int(len(examples) * 0.85)
    train_data = examples[:split]
    valid_data = examples[split:]

    def to_chat(ex):
        return {
            "messages": [
                {"role": "system", "content": "You are an expert software tester. Given code, generate structured test reports with TEST CASES, EDGE CASES, and BUGS & FIXES sections. Use bullet points (dash -) for all items."},
                {"role": "user", "content": f"Generate a comprehensive test report for this code:\n```\n{ex['input']}\n```"},
                {"role": "assistant", "content": ex["output"]}
            ]
        }

    for name, data in [("train.jsonl", train_data), ("valid.jsonl", valid_data)]:
        path = os.path.join(TRAIN_DIR, name)
        with open(path, "w") as f:
            for ex in data:
                f.write(json.dumps(to_chat(ex)) + "\n")
        print(f"Wrote {len(data)} examples to {path}")

def train():
    """Run MLX LoRA fine-tuning."""
    os.makedirs(ADAPTER_DIR, exist_ok=True)
    prepare_data()

    cmd = [
        sys.executable, "-m", "mlx_lm.lora",
        "--model", MODEL_NAME,
        "--data", TRAIN_DIR,
        "--train",
        "--adapter-path", ADAPTER_DIR,
        "--iters", "200",
        "--batch-size", "1",
        "--num-layers", "8",
        "--learning-rate", "1e-4",
    ]

    print(f"\n{'='*60}")
    print(f"Starting LoRA fine-tuning on {MODEL_NAME}")
    print(f"Dataset: {TRAIN_DIR}")
    print(f"Adapters will be saved to: {ADAPTER_DIR}")
    print(f"{'='*60}\n")

    result = subprocess.run(cmd, cwd=SCRIPT_DIR)
    if result.returncode == 0:
        print(f"\n✅ Training complete! Adapters saved to {ADAPTER_DIR}")
    else:
        print(f"\n❌ Training failed with exit code {result.returncode}")
        sys.exit(1)

if __name__ == "__main__":
    train()
