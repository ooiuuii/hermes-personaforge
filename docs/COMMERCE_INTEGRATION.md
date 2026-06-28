# Commerce Integration

PersonaForge uses the Qiance commerce rail as the entitlement source.

In production, the same rail can support a marketplace model: licensed IP owners and independent agent artists list persona packs, customers buy them, Hermes verifies entitlement, and PersonaForge records revenue split proof.

The public proof pack is intentionally redacted. It can show:

- store domain,
- merchant name,
- product SKU,
- order/payment status,
- redacted trade reference,
- callback path names,
- payment provider name,
- proof hashes,
- cost and margin model.

It must not show:

- full Alipay trade number,
- customer address,
- customer phone,
- customer card data,
- cookies,
- app private key,
- merchant private key,
- PayPal/Alipay live credentials,
- raw payment screenshots.

## Product Mapping

```text
Store product:
  AI Companion Persona Pack

Hermes output:
  gated persona manifest download
  Shinsekai-compatible runtime import command
  runtime launch trace
  safety report
  proof ledger
```

## Marketplace Entitlement Mapping

```text
Marketplace listing:
  licensed IP pack or original agent-artist pack

Commerce output:
  paid order + redacted trade reference

Hermes output:
  rights manifest check
  creator/IP/platform revenue split record
  entitlement unlock or hold/refund decision
  gated persona manifest download
  proof ledger
```

## Rights Manifest Fields

The commerce layer should not unlock a commercial persona pack from payment alone. Hermes should also check a rights manifest:

```text
pack_id
creator_id
ip_owner_id
asset_hashes
voice_consent_status
commercial_rights_scope
allowed_runtimes
allowed_territories
license_expiry
revenue_split
takedown_contact
safety_review_status
```

If the rights manifest is missing, expired, or out of scope, delivery should be held for review even if payment succeeded.

## Failure Modes

If payment is not verified:

```text
hold_for_reconciliation
```

If margin is below the policy:

```text
hold_or_refund
```

If license delivery fails:

```text
route_to_refund_or_human_review
```

If local assets are missing:

```text
ship manifest only, mark runtime launch pending
```

If rights metadata is missing or invalid:

```text
hold_for_rights_review
```

If a creator/IP revenue split cannot be calculated:

```text
hold_for_settlement_review
```
