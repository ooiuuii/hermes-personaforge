# Hermes PersonaForge

Hermes PersonaForge turns paid character/persona packs into audited voice-and-vision companion sessions.

This is a fourth standalone Hermes Agent Accelerated Business Hackathon submission. It keeps a clear relationship to the earlier projects without sharing their repos:

| Submission | Business surface |
| --- | --- |
| Hermes Foundry | enterprise approval orchestration |
| Hermes Sourcing Desk | procurement sourcing and savings proof |
| Hermes Commerce Ops | paid e-commerce order operations |
| Hermes PersonaForge | paid persona-pack entitlement and runtime delivery |

## One-Line Claim

```text
A paid persona-pack order becomes a Hermes-verified license, a voice-and-vision runtime session, and a proof pack that judges can regenerate.
```

## Watch

```text
GitHub Release: https://github.com/ooiuuii/hermes-personaforge/releases/tag/v0.1-demo
Direct MP4: https://github.com/ooiuuii/hermes-personaforge/releases/download/v0.1-demo/hermes-personaforge-full-demo.en.andrew-nas-bgm.mp4
```

Local generated copy:

```text
artifacts/videos/hermes-personaforge-full-demo.en.andrew-nas-bgm.mp4
```

## Demo Story

The emotional hook is simple: a buyer pays for a persona pack, then the character "wakes up" as a runtime experience.

The business hook is what makes it a Hermes agent project:

1. A paid order from the Qiance commerce rail becomes entitlement evidence.
2. Hermes verifies the redacted payment snapshot.
3. Hermes checks margin before spending delivery/runtime effort.
4. Hermes issues a signed persona manifest.
5. A Shinsekai-compatible local runtime can launch voice, vision, memory, and sprite switching.
6. Hermes records a proof pack: payment, margin, license, runtime trace, safety policy, and audit ledger.

## Important Asset Boundary

This repository does **not** redistribute third-party character packs, voice checkpoints, model weights, copyrighted sprites, local Shinsekai runtime code, customer PII, full trade numbers, or payment credentials.

For video capture, a local Shinsekai-compatible character pack may be used privately to demonstrate voice, vision, and sprite switching. The public repo ships the generic business workflow and verifier-safe proof artifacts.

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
| `artifacts/proof/persona_license_manifest.json` | hashable persona license and manifest |
| `artifacts/proof/runtime_launch_trace.json` | voice, vision, browser context, and sprite-route runtime trace |
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

Optional audio workflow, following the previous project style:

```powershell
$env:NAS_BGM_SOURCE="\\path\to\instrumental-bgm.flac"
npm run mix:nas-voice
```

Generated video files are intentionally ignored from normal Git history and can be uploaded as GitHub release assets.

## Architecture

```text
paid store order
  -> payment reconciliation
  -> Hermes margin gate
  -> persona license manifest
  -> voice/vision runtime launch trace
  -> asset safety report
  -> audit ledger and proof manifest
```

## Safety Notes

- Do not commit `.env`, payment keys, app private keys, merchant secrets, cookies, SSH keys, or passwords.
- Do not commit `.char`, `.ckpt`, `.pth`, `.onnx`, `.safetensors`, `.webp`, `.wav`, or `.aac` local runtime assets.
- Do not commit full trade numbers, customer addresses, phone numbers, or raw payment screenshots.
- Keep local character packs under ignored paths such as `artifacts/local-character-packs/`.
