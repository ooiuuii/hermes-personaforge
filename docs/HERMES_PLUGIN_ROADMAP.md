# Hermes Plugin Roadmap

Hermes PersonaForge is designed to become a Hermes plugin, even though the hackathon submission uses a local Shinsekai-compatible demo runtime to make the experience visible.

## Current Hackathon Shape

The current repository proves the business operation:

```text
paid commerce order
  -> payment reconciliation
  -> margin gate
  -> persona license manifest
  -> runtime launch trace
  -> safety redaction report
  -> audit ledger
```

The live-looking companion session in the video is a local demo harness. It exists to show what the paid persona unlock feels like after Hermes has already verified the business conditions.

## Why It Is Not Packaged As A Full Plugin Yet

The current submission intentionally avoids shipping:

- third-party character packages,
- copyrighted sprites or voice samples,
- local runtime source code from other projects,
- model checkpoints or weights,
- OAuth/API tokens,
- payment credentials,
- customer private data.

That keeps the public repo safe for review and makes the proof pack reproducible without private assets.

## Target Hermes Plugin Shape

The production version should split into marketplace-facing and runtime-facing pieces.

| Piece | Responsibility |
| --- | --- |
| Entitlement verifier | Read payment or store webhook evidence and decide whether the buyer can unlock a persona pack |
| Rights manifest checker | Verify creator/IP ownership, voice consent, territory, expiry, allowed runtimes, and takedown route |
| Margin gate | Check whether delivery/runtime cost is worth fulfilling automatically |
| Revenue split writer | Record creator, IP owner, and platform settlement shares without exposing payment secrets |
| Persona manifest tool | Produce a signed or hashable manifest with voice, vision, memory, and expression routes |
| Runtime adapter | Launch or control a compatible companion runtime through a local tool/MCP bridge |
| Proof writer | Append payment, license, runtime, redaction, and refund/hold events into a verifier-safe proof pack |

The downloadable early-access kit uses this same shape conceptually: a runtime preview, a voice/persona pack placeholder, and a skill file that explains how Hermes should treat the pack.

## Plugin Flow

```text
Hermes receives paid-order evidence
  -> verifies provider callback and store order state
  -> checks rights manifest
  -> checks margin policy
  -> unlocks persona manifest
  -> calls runtime adapter
  -> records revenue split event
  -> records voice/vision/session events
  -> writes proof pack
```

If payment cannot be verified, the plugin should hold delivery. If margin is not acceptable, it should hold or route to refund. If local runtime assets are missing, it should ship the manifest and mark runtime launch as pending.

## Minimal MVP Scope

The first real Hermes plugin should support:

1. `verify_entitlement(order_reference)`
2. `verify_rights_manifest(pack_id)`
3. `calculate_revenue_split(pack_id, order_reference)`
4. `issue_persona_manifest(pack_id, customer_id)`
5. `launch_runtime(manifest_path)`
6. `write_persona_proof(event)`
7. `hold_or_refund(reason)`

That is enough to turn the current demo into a clean Hermes-controlled workflow without pretending that the public repo owns third-party character assets.

## Non-Goals

The plugin itself should not be a raw asset marketplace, a model hosting service, or a redistribution channel for copyrighted persona assets. PersonaForge as a product can include a marketplace, but the Hermes plugin should remain the controlled business layer that verifies payment, checks rights, grants access, launches compatible runtimes, records settlement events, and proves what happened.
