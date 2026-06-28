# Originality And Attribution

PersonaForge is a Hermes business layer around a local companion-agent runtime. The public repo owns the commerce, entitlement, proof, and packaging workflow; the local video runtime is an integration target used to make the paid persona-pack experience visible.

## Original Work In This Repo

The following parts are original to this hackathon submission:

- paid persona-pack business flow,
- Qiance commerce entitlement mapping,
- redacted payment reconciliation proof,
- delivery margin gate,
- persona license manifest schema,
- runtime launch trace schema,
- safety redaction report,
- persona audit ledger,
- proof-manifest verification flow,
- React/Vite judging workbench,
- cinematic demo scenes and recording scripts,
- early-access kit structure,
- Hermes plugin roadmap,
- hackathon submission copy and documentation.

These pieces are what make PersonaForge a business-agent project rather than only a character demo.

## Local Runtime Prototype

The companion experience shown in the video is produced by a local desktop runtime prototype. PersonaForge does not redistribute that runtime; it treats it as a compatible target that can be launched after Hermes verifies payment and issues a manifest.

The local prototype is built from these major layers:

| Layer | Role in the demo |
| --- | --- |
| Desktop shell | A Python/PySide settings app plus a focused chat window for the actual character session |
| Character package system | Imports persona files, sprites, emotion tags, dialogue templates, history, and per-character state |
| LLM adapter layer | Routes chat turns to configured model providers or OpenAI-compatible endpoints |
| Tool manager | Exposes registered Python tools to the model, including file, memory, search, browser, and character-related tools |
| Plugin host | Loads in-process plugins from a YAML manifest and merges adapters, tools, settings pages, and chat UI widgets |
| MCP bridge | Registers external MCP tools into the same model tool list through YAML configuration |
| Voice input | Uses local ASR adapters for microphone input when enabled |
| Voice output | Uses TTS adapters or pre-bound character audio to speak model responses |
| Vision/browser extensions | Let the agent inspect pages or operate a browser during the session |
| Runtime trace | Produces visible logs for page reading, tool calls, audio generation, expression changes, and safety/proof events |

PersonaForge adds the business wrapper around this: payment verification, margin decisioning, manifest unlock, runtime launch trace, redaction policy, and audit proof.

## Public Upstream Components Used By The Local Prototype

The local runtime prototype relies on or is designed to integrate with several public upstream projects and libraries. PersonaForge does not claim authorship over these components.

| Component or ecosystem | How it is used |
| --- | --- |
| PySide6 / Qt | Desktop settings UI and runtime windows |
| OpenAI-compatible APIs | LLM request/response and tool-call protocol surface |
| Anthropic and Google model SDKs | Optional model-provider adapters |
| Model Context Protocol (`mcp`) | External tool connection through SSE or stdio servers |
| Playwright | Browser automation plugin used when the companion opens or inspects pages |
| Moondream-style vision plugin | Lightweight visual understanding for page/screen context |
| Vosk | Local speech recognition option |
| Faster-Whisper class adapters | Optional Whisper-style ASR path |
| GPT-SoVITS | Local character voice synthesis option |
| Genie TTS / CosyVoice-style engines | Alternative TTS options for lighter or different voice stacks |
| ComfyUI-style workflows | Optional text-to-image / visual generation adapter surface |
| mem0 | Optional long-term memory tooling |
| sentence-transformers / fastembed | Optional local embedding support for memory/search |

The demo uses these capabilities as an integration environment. The submitted repo stores only verifier-safe artifacts and does not vendor the upstream runtime, its plugins, or character assets.

## Agent Construction In The Demo

The video flow can be understood as a composed agent session:

1. Hermes verifies a paid persona-pack order from the commerce site.
2. Hermes checks margin and decides whether the pack can be unlocked.
3. Hermes issues a hashable persona manifest rather than shipping raw private assets.
4. The local runtime imports the manifest and starts a character session.
5. User input enters the chat window.
6. The LLM adapter sends the turn to the configured model.
7. The tool manager exposes browser, memory, file, MCP, and character tools.
8. Browser/vision tools let the agent inspect product pages, wiki pages, or store pages.
9. The model response is routed to text display, voice synthesis, and expression selection.
10. PersonaForge records the session as a runtime trace and audit ledger.

That is the boundary: Hermes controls entitlement and proof; the local companion runtime handles the expressive interaction.

## Not Redistributed Here

This repository does not include:

- local companion runtime source code,
- third-party character packages,
- anime/game character sprites,
- voice checkpoints or samples,
- model weights,
- private OAuth/API credentials,
- payment secrets,
- raw customer payment data.

If a local demo uses private character assets, those assets remain outside Git and outside the downloadable public proof artifacts.

## Review Boundary

Judges and reviewers should evaluate the repo on:

- whether a paid order can be turned into an entitlement,
- whether the agent decides when to unlock or hold delivery,
- whether the manifest/runtime action is traceable,
- whether unsafe assets and secrets are kept out of the repo,
- whether the proof pack can be regenerated.

They should not treat the repo as a redistribution of any specific desktop companion runtime, third-party character package, or character IP.
