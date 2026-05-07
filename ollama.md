# Using Ollama with Cloud Models in VSCode

This guide walks you through creating an Ollama account, signing in to access cloud models, and integrating them into VSCode.

## 1. Create an Ollama Account

1. Go to [https://ollama.com/signup](https://ollama.com/signup).
2. Sign up using your email address (or GitHub / Google).
3. Verify your email by clicking the confirmation link sent to your inbox.
4. Log in at [https://ollama.com](https://ollama.com) to confirm your account is active.

## 2. Install Ollama Locally

Ollama runs as a local service that bridges your machine to its cloud models.

### macOS
Download and install from [https://ollama.com/download](https://ollama.com/download), or use Homebrew:

```bash
brew install ollama
```

### Windows / Linux
Follow the platform installer at [https://ollama.com/download](https://ollama.com/download).

After installing, verify it works:

```bash
ollama --version
```

## 3. Sign In to Use Cloud Models

Cloud models run on Ollama's infrastructure rather than your local machine. They require authentication.

```bash
ollama signin
```

This opens a browser window and links your local Ollama installation to your account.

To confirm you are signed in:

```bash
ollama whoami
```

## 4. Run a Cloud Model

Cloud models are identified with a `-cloud` suffix. Examples:

- `gpt-oss:120b-cloud`
- `qwen3-coder:480b-cloud`
- `deepseek-v3.1:671b-cloud`

Pull and run a model:

```bash
ollama run gpt-oss:120b-cloud
```

You will be dropped into a chat prompt that runs against the cloud model — no local GPU required.

To list available models:

```bash
ollama list
```

## 5. Use Ollama in VSCode

There are two common ways to wire Ollama into VSCode.

### Option A: Continue Extension (recommended)

1. Install the **Continue** extension from the VSCode Marketplace.
2. Open the Continue side panel and click the model selector → **Add Model**.
3. Choose **Ollama** as the provider.
4. Set the model name to a cloud model, e.g. `gpt-oss:120b-cloud`.
5. Leave the API base URL as the default `http://localhost:11434` — your local Ollama process forwards requests to the cloud.

Example `~/.continue/config.json` snippet:

```json
{
  "models": [
    {
      "title": "Ollama Cloud — GPT-OSS 120B",
      "provider": "ollama",
      "model": "gpt-oss:120b-cloud",
      "apiBase": "http://localhost:11434"
    }
  ]
}
```

### Option B: Cline / Roo Code

1. Install **Cline** (or **Roo Code**) from the VSCode Marketplace.
2. Open the extension settings and choose **Ollama** as the API provider.
3. Set the base URL to `http://localhost:11434`.
4. Pick a cloud model from the dropdown (e.g. `qwen3-coder:480b-cloud`).

### Option C: Direct API access from your own code

Ollama exposes an OpenAI-compatible endpoint locally:

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss:120b-cloud",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'
```

Any VSCode extension or script that supports an OpenAI-compatible base URL can point at `http://localhost:11434/v1` and use a cloud model name.

## 6. Troubleshooting

- **`ollama: command not found`** — restart your terminal after installing, or check that `/usr/local/bin` is in your `PATH`.
- **`unauthorized` errors on cloud models** — re-run `ollama signin`.
- **VSCode extension cannot connect** — make sure the Ollama app is running (look for the icon in the menu bar / system tray) and that `http://localhost:11434` is reachable.
- **Model not found** — run `ollama pull <model>:<tag>-cloud` first, then retry.

## References

- Ollama docs: [https://docs.ollama.com](https://docs.ollama.com)
- Cloud models overview: [https://ollama.com/cloud](https://ollama.com/cloud)
- Continue extension: [https://continue.dev](https://continue.dev)
