# Marketplace Model

PersonaForge is a marketplace and delivery layer for emotional-value agents. The thesis is that agents will not only automate work; they will also become paid entertainment, companionship, education, and fan-experience products.

## Core Insight

Most business-agent demos focus on productivity:

- agents that save time,
- agents that reduce cost,
- agents that run operations,
- agents that buy tools or execute tasks.

PersonaForge adds a second commercial surface:

```text
agent as emotional product
```

A customer is not only buying automation. They are buying a voice, a persona, an interaction style, a memory layer, a visual presentation, and a repeatable experience.

## Market Participants

| Participant | Role |
| --- | --- |
| IP owner | Licenses an existing character, world, voice, or brand for official persona-pack distribution |
| Agent artist | Creates original persona packs: character setting, voice direction, memory seeds, skills, scenes, and demo videos |
| Customer | Buys and imports a persona pack into a compatible companion runtime |
| PersonaForge marketplace | Lists packs, collects payment, verifies entitlement, gates downloads, and routes revenue |
| Hermes agent | Enforces rights, margin, delivery, refund/hold logic, and proof generation |

The phrase "agent artist" is intentional: these creators are not only prompt writers. They compose behavior, voice, memory, tools, scenes, and runtime presentation.

## Commercial Flow

```text
IP owner or agent artist creates a persona pack
  -> PersonaForge validates rights and safety metadata
  -> marketplace lists the pack
  -> customer buys the pack
  -> Hermes verifies payment
  -> Hermes checks rights, margin, and delivery policy
  -> Hermes unlocks the manifest/download
  -> compatible runtime imports the pack
  -> revenue share is recorded for creator/IP/platform
  -> audit proof is generated
```

The current hackathon repo demonstrates one paid pack flowing through payment, entitlement, margin gate, manifest unlock, runtime trace, and proof pack. The marketplace model extends that same loop to many creators and packs.

## Rights Manifest

Every commercial persona pack should have a rights manifest. This is the missing operational layer between "cool character demo" and "real business product."

Example fields:

```text
pack_id
creator_id
ip_owner_id
asset_hashes
voice_consent_status
commercial_rights_scope
allowed_runtimes
allowed_territories
license_start
license_expiry
revenue_split
takedown_contact
refund_policy
safety_review_status
```

Hermes can read this manifest before unlocking a pack. If rights are missing, expired, or territory-restricted, the agent can hold delivery or route to human review.

## Revenue Model

PersonaForge can support multiple business models:

| Model | Description |
| --- | --- |
| Direct pack sale | Customer buys one persona pack |
| Creator consignment | Agent artist lists a pack; platform collects payment and splits revenue |
| Licensed IP drop | IP owner authorizes a limited official pack release |
| Subscription | Customer pays for updates, new scenes, voice lines, memories, or skills |
| Commissioned persona | Customer pays an agent artist to create a custom original persona |

The Hermes proof pack can record the revenue split without exposing private payment credentials or customer PII.

## Why Hermes Matters

Without Hermes, a persona marketplace is only a storefront. With Hermes, it becomes a controlled autonomous business operation:

- verify payment,
- check rights manifest,
- calculate delivery margin,
- unlock or hold downloads,
- route refunds,
- log creator/IP/platform revenue split,
- prove that no raw private assets or secrets were exposed,
- produce audit-grade evidence.

That is why PersonaForge is not just a character demo. It is commerce, licensing, delivery, and proof infrastructure for paid emotional AI products.

## Asset Boundary

PersonaForge should not sell or redistribute unlicensed third-party character assets. The safe production path is:

- licensed IP packs,
- creator-owned original personas,
- consented voice assets,
- hashable manifests,
- redacted proof artifacts,
- clear takedown and refund routes.

The hackathon demo may use local private assets to show the experience, but the public repo and marketplace model are designed around licensed or original persona packs.
