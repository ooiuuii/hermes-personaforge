# Commerce Integration

PersonaForge uses the Qiance commerce rail as the entitlement source.

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
  Qiance Companion Persona Pack

Hermes output:
  persona license manifest
  runtime launch trace
  safety report
  proof ledger
```

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
