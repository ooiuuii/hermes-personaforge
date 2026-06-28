# Hermes PersonaForge

Hermes PersonaForge turns a purchased AI Companion Persona Pack into an audited voice-and-vision companion session.

This is a fourth standalone Hermes Agent Accelerated Business Hackathon submission. It keeps a clear relationship to the earlier projects without sharing their repos:

| Submission | Business surface |
| --- | --- |
| Hermes Foundry | enterprise approval orchestration |
| Hermes Sourcing Desk | procurement sourcing and savings proof |
| Hermes Commerce Ops | paid e-commerce order operations |
| Hermes PersonaForge | paid persona-pack entitlement and runtime delivery |

## One-Line Claim

```text
A customer buys an AI Companion Persona Pack, Hermes verifies payment, unlocks a Shinsekai-compatible manifest, launches the character runtime, and generates a proof pack judges can regenerate.
```

## Commercial Thesis

Most agent products focus on productivity: automate work, save time, reduce cost. PersonaForge explores the other side of the same agent economy: paid emotional-value agents.

The long-term product is a marketplace and delivery layer for licensed persona packs:

- IP owners can authorize official character/persona packs.
- Independent agent artists can create original personas with voice style, memory, interaction scripts, skills, and demo videos.
- PersonaForge can list those packs, verify payment, unlock manifests, route revenue shares, and generate audit proof.
- Hermes acts as the controlled business agent: it checks rights, entitlement, margin, refund/hold paths, runtime delivery, and proof.

See [Marketplace model](docs/MARKETPLACE_MODEL.md).

## Watch

```text
GitHub Release: https://github.com/ooiuuii/hermes-personaforge/releases/tag/v0.1-demo
Direct MP4: https://github.com/ooiuuii/hermes-personaforge/releases/download/v0.1-demo/hermes-personaforge-live-commerce-shinsekai-demo.en.andrew-nas-bgm.mp4
Extended 3-minute MP4: https://github.com/ooiuuii/hermes-personaforge/releases/download/v0.1-demo/hermes-personaforge-three-minute-demo.en-sub-ja-voice.mp4
```

Local generated copy:

```text
artifacts/videos/hermes-personaforge-live-commerce-shinsekai-demo.en.andrew-nas-bgm.mp4
artifacts/videos/hermes-personaforge-three-minute-demo.en-sub-ja-voice.mp4
```

## Demo Story

The emotional hook is simple: a buyer pays for a persona pack, downloads the manifest, imports it into a visual runtime, and the character reacts to its own product/order page.

The business hook is what makes it a Hermes agent project:

1. A customer buys `AI Companion Persona Pack` on the Qiance EC site.
2. Alipay callback proof marks the order paid, with sensitive data redacted.
3. Hermes verifies payment and checks margin before spending delivery/runtime effort.
4. Hermes unlocks `qiance-companion-starter.persona-manifest.json`.
5. The buyer imports that manifest into a Shinsekai-compatible local runtime.
6. The runtime sees the product/order page, reacts surprised, switches to a shy sprite/voice route, and Hermes records the proof pack.

## Important Asset Boundary

This repository does **not** redistribute third-party character packs, voice checkpoints, model weights, copyrighted sprites, local Shinsekai runtime code, customer PII, full trade numbers, or payment credentials.

For video capture, a local Shinsekai-compatible character pack may be used privately to demonstrate voice, vision, and sprite switching. The public repo ships the generic business workflow and verifier-safe proof artifacts.

## What This Repo Is

PersonaForge is currently a hackathon proof-of-business repo, not a packaged official Hermes plugin yet.

| Layer | Current repo | Future plugin direction |
| --- | --- | --- |
| Commerce | Redacted Qiance EC paid-order proof and entitlement model | Real storefront/payment webhook adapter |
| Decisioning | Hermes-style margin gate and unlock/hold policy | Hermes skill/tool policy for paid persona delivery |
| Delivery | Hashable persona license manifest and gated download model | Installable `PERSONAFORGE_SKILL.md` plus manifest import tools |
| Runtime | Shinsekai-compatible local demo runtime trace | Hermes plugin that launches or controls compatible companion runtimes |
| Evidence | Regenerable proof pack and audit ledger | Append-only proof pack for payment, license, runtime, and safety events |

The local video runtime is deliberately a demo harness: it proves the emotional product experience, while the repo proves the business operation around that experience.

More detail:

- [Hermes plugin roadmap](docs/HERMES_PLUGIN_ROADMAP.md)
- [Marketplace model](docs/MARKETPLACE_MODEL.md)
- [Originality and attribution](docs/ORIGINALITY_AND_ATTRIBUTION.md)
- [Asset policy](docs/ASSET_POLICY.md)

## Proof Pack

Run:

```powershell
npm install
npm test
npm run build
```

Expected test output:

```text
PERSONAFORGE_PROOF_VERIFY_OK
```

Generated proof files:

| File | What it proves |
| --- | --- |
| `artifacts/input/persona-commerce-order.json` | redacted paid persona-pack order input |
| `artifacts/proof/payment_reconciliation.json` | payment evidence was accepted as entitlement source |
| `artifacts/proof/persona_margin_gate.json` | revenue, cost, profit, and unlock decision |
| `artifacts/proof/persona_license_manifest.json` | hashable license, gated download, import command, and manifest |
| `artifacts/proof/runtime_launch_trace.json` | manifest import, voice, vision, EC page context, and sprite-route runtime trace |
| `artifacts/proof/safety_redaction_report.json` | no local third-party character assets are redistributed |
| `artifacts/proof/persona_audit_ledger.json` | end-to-end business trail |
| `artifacts/proof/proof_manifest.generated.json` | hashes and verifier commands |

## Run The Demo UI

```powershell
npm run dev -- --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

Record a local demo after the dev server is running:

```powershell
npm run record:demo
```

Record the fuller live-commerce version used for the final submission video:

```powershell
$env:PERSONAFORGE_DEMO_EMAIL="customer@example.com"
$env:PERSONAFORGE_DEMO_PASSWORD="..."
npm run record:live-demo
npm run mix:live-nas-voice
npm run build:three-minute-demo
```

This records the real Qiance EC customer flow, stops before making a new payment, then captures a local
Shinsekai-compatible runtime window. `SHINSEKAI_CAPTURE_X`, `SHINSEKAI_CAPTURE_Y`,
`SHINSEKAI_CAPTURE_WIDTH`, and `SHINSEKAI_CAPTURE_HEIGHT` can be adjusted if the runtime window moves.

Optional audio workflow, following the previous project style:

```powershell
$env:NAS_BGM_SOURCE="\\path\to\instrumental-bgm.flac"
npm run mix:nas-voice
```

Generated video files are intentionally ignored from normal Git history and can be uploaded as GitHub release assets.

## Architecture

```text
customer buys AI Companion Persona Pack
  -> payment reconciliation
  -> Hermes margin gate
  -> persona manifest download
  -> Shinsekai-compatible runtime import
  -> voice/vision runtime launch trace
  -> asset safety report
  -> audit ledger and proof manifest
```

## Safety Notes

- Do not commit `.env`, payment keys, app private keys, merchant secrets, cookies, SSH keys, or passwords.
- Do not commit `.char`, `.ckpt`, `.pth`, `.onnx`, `.safetensors`, `.webp`, `.wav`, or `.aac` local runtime assets.
- Do not commit full trade numbers, customer addresses, phone numbers, or raw payment screenshots.
- Keep local character packs under ignored paths such as `artifacts/local-character-packs/`.
