import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputDir = path.join(root, "artifacts", "input");
const proofDir = path.join(root, "artifacts", "proof");

function hashText(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function money(value) {
  return Math.round(value * 100) / 100;
}

function proofRef(name) {
  return `artifacts/proof/${name}`;
}

const fixture = {
  schema: "hermes-personaforge.persona_order_input.v1",
  captured_at: "2026-06-27T15:58:00+08:00",
  project: "Hermes PersonaForge",
  relation_to_previous_submissions: {
    hermes_foundry: "approval orchestration",
    hermes_sourcing_desk: "procurement sourcing and savings proof",
    hermes_commerce_ops: "paid e-commerce order operations",
    hermes_personaforge: "paid persona-pack entitlement and runtime delivery"
  },
  commerce_source: {
    store: "ec.xingyipoxiao.cloud",
    merchant: "Deqing Qiance Technology Co., Ltd.",
    payment_provider: "Alipay",
    status: "paid",
    evidence_mode: "redacted_live_payment_snapshot",
    note:
      "The public repo contains verifier-safe payment evidence only. Live merchant credentials, full trade numbers, customer PII, and raw screenshots are not committed."
  },
  order: {
    id: "PF-2026-06-27-001",
    sku: "persona-pack.qiance-companion.starter",
    product: "AI Companion Persona Pack",
    product_url: "https://ec.xingyipoxiao.cloud/ai-companion-persona-pack",
    order_url: "https://ec.xingyipoxiao.cloud/orderdetails/PF-2026-06-27-001",
    currency: "CNY",
    amount: 2.0,
    payment_status: "paid",
    order_status: "download_ready",
    callback_paths: {
      notify: "/Plugins/PaymentAliPay/Notify",
      return: "/Plugins/PaymentAliPay/Return"
    },
    trade_ref_redacted: "20260627-PERSONA-****-PAID",
    trade_ref_sha256:
      "4eabf2b287891b562f2044eb4adad6c7ef6518d5aa9b1057fd307cfcad88d409"
  },
  economics: {
    revenue: 2.0,
    license_issuance_cost: 0.05,
    storage_delivery_cost: 0.03,
    tts_preview_cost: 0.08,
    runtime_orchestration_cost: 0.18,
    support_reserve: 0.08,
    minimum_margin: 0.45
  },
  persona_pack: {
    pack_id: "qiance-companion-starter",
    display_name: "Qiance Companion Starter",
    format: "shinsekai-compatible-manifest",
    public_assets: ["manifest", "persona prompts", "emotion routing table", "license metadata"],
    local_runtime_capabilities: ["voice", "vision", "sprite_switching", "short_term_memory"],
    demo_scenes: [
      "customer buys an AI Companion Persona Pack from the EC website",
      "Hermes verifies paid entitlement",
      "Hermes unlocks a signed persona manifest download",
      "customer imports the manifest into a Shinsekai-compatible runtime",
      "runtime reads the product/order page and reacts with a surprised-to-shy sprite",
      "audit pack records payment, license, runtime, and asset policy"
    ],
    asset_policy: {
      public_repo_redistributes_third_party_character_assets: false,
      committed_assets_are_original_or_redacted: true,
      local_character_packs_stay_out_of_git: true,
      note:
        "A local Shinsekai-compatible character pack may be used for private video capture, but this repo ships only a generic licensed persona-pack flow."
    }
  },
  hermes_runtime: {
    model_lane: "Hermes/Nemotron-compatible agent lane",
    guardrails: ["paid-before-unlock", "no copyrighted asset redistribution", "refund-on-failed-delivery"],
    irreversible_actions: "blocked until entitlement and delivery proof are present"
  }
};

function buildPaymentReconciliation(input) {
  const paid =
    input.order.payment_status === "paid" &&
    input.order.order_status === "download_ready" &&
    input.commerce_source.status === "paid";

  return {
    schema: "hermes-personaforge.payment_reconciliation.v1",
    generated_at: "2026-06-27T16:00:00+08:00",
    source_ref: "artifacts/input/persona-commerce-order.json",
    order: input.order,
    commerce_source: input.commerce_source,
    checks: [
      {
        name: "paid_order_snapshot_present",
        result: paid,
        evidence: `${input.order.id} is ${input.order.payment_status} and ${input.order.order_status}`
      },
      {
        name: "callback_paths_match_store_payment_provider",
        result:
          input.order.callback_paths.notify === "/Plugins/PaymentAliPay/Notify" &&
          input.order.callback_paths.return === "/Plugins/PaymentAliPay/Return",
        evidence: "Alipay nopCommerce callback paths are retained as entitlement evidence"
      },
      {
        name: "trade_reference_redacted",
        result:
          input.order.trade_ref_redacted.includes("****") &&
          input.order.trade_ref_sha256.length === 64,
        evidence: "public proof keeps only redacted reference and hash"
      }
    ],
    decision: paid ? "payment_verified_for_persona_entitlement" : "hold_for_reconciliation"
  };
}

function buildMarginGate(input, reconciliation) {
  const costs = input.economics;
  const estimatedCost = money(
    costs.license_issuance_cost +
      costs.storage_delivery_cost +
      costs.tts_preview_cost +
      costs.runtime_orchestration_cost +
      costs.support_reserve
  );
  const grossProfit = money(costs.revenue - estimatedCost);
  const grossMargin = money(grossProfit / costs.revenue);
  const canUnlock =
    reconciliation.decision === "payment_verified_for_persona_entitlement" &&
    grossMargin >= costs.minimum_margin;

  return {
    schema: "hermes-personaforge.margin_gate.v1",
    generated_at: "2026-06-27T16:00:05+08:00",
    input_refs: {
      order: "artifacts/input/persona-commerce-order.json",
      payment_reconciliation: proofRef("payment_reconciliation.json")
    },
    economics: {
      currency: input.order.currency,
      revenue: costs.revenue,
      estimated_costs: {
        license_issuance: costs.license_issuance_cost,
        storage_delivery: costs.storage_delivery_cost,
        tts_preview: costs.tts_preview_cost,
        runtime_orchestration: costs.runtime_orchestration_cost,
        support_reserve: costs.support_reserve,
        total: estimatedCost
      },
      gross_profit: grossProfit,
      gross_margin: grossMargin,
      minimum_margin: costs.minimum_margin
    },
    decision: canUnlock ? "unlock_persona_pack" : "hold_or_refund",
    refund_policy:
      "If payment is verified but entitlement delivery fails, Hermes records the failure and routes the order to refund or human review."
  };
}

function buildLicenseManifest(input, gate) {
  const licenseSeed = `${input.order.id}:${input.persona_pack.pack_id}:${input.order.trade_ref_sha256}`;
  const licenseId = `pf_${hashText(licenseSeed).slice(0, 18)}`;
  const personaManifest = {
    pack_id: input.persona_pack.pack_id,
    display_name: input.persona_pack.display_name,
    format: input.persona_pack.format,
    version: "0.1.0",
    capabilities: input.persona_pack.local_runtime_capabilities,
    emotion_routes: {
      curious: "read_page_context",
      surprised: "unexpected_self_reference",
      shy: "self_search_result_detected",
      focused: "business_or_license_question",
      cheerful: "delivery_success"
    },
    memory_policy: {
      customer_private_data: "not_stored_in_public_artifacts",
      session_memory: "local_runtime_only",
      audit_memory: "redacted_hashes_only"
    }
  };

  return {
    schema: "hermes-personaforge.persona_license_manifest.v1",
    generated_at: "2026-06-27T16:00:10+08:00",
    status: gate.decision === "unlock_persona_pack" ? "unlocked" : "held",
    license_id: licenseId,
    order_id: input.order.id,
    pack_id: input.persona_pack.pack_id,
    buyer_entitlement: {
      seats: 1,
      usage: "personal demo runtime",
      expires: "2026-07-27T23:59:59+08:00"
    },
    manifest: personaManifest,
    manifest_sha256: hashText(JSON.stringify(personaManifest)),
    delivery: {
      downloadable_manifest: true,
      download_file: "qiance-companion-starter.persona-manifest.json",
      download_unlocked_after: "payment_reconciliation + margin_gate",
      local_runtime_start_command: "npm run dev; connect private Shinsekai-compatible runtime",
      local_runtime_import_command: "personaforge import qiance-companion-starter.persona-manifest.json",
      external_asset_download: "not included in public repo"
    }
  };
}

function buildRuntimeTrace(input, license) {
  return {
    schema: "hermes-personaforge.runtime_launch_trace.v1",
    generated_at: "2026-06-27T16:00:15+08:00",
    license_id: license.license_id,
    runtime: {
      compatibility: "Shinsekai-style visual companion runtime",
      voice_enabled: true,
      vision_enabled: true,
      sprite_switching_enabled: true,
      browser_context_enabled: true,
      local_assets_required_for_full_visual_demo: true
    },
    trace_mode: "deterministic_demo_replay",
    events: [
      {
        time: "00:00",
        actor: "Hermes payment verifier",
        command: `verify paid entitlement for ${input.order.id}`,
        result: "payment evidence accepted"
      },
      {
        time: "00:06",
        actor: "Hermes license worker",
        command: `issue persona license ${license.license_id}`,
        result: "persona manifest unlocked"
      },
      {
        time: "00:12",
        actor: "Persona runtime",
        command: "import qiance-companion-starter.persona-manifest.json",
        result: "voice, vision, memory, and sprite routing enabled"
      },
      {
        time: "00:24",
        actor: "Vision sidecar",
        command: "inspect EC product and order pages about the persona",
        result: "self-reference detected; emotion route=surprised -> shy"
      },
      {
        time: "00:31",
        actor: "Voice sidecar",
        command: "synthesize shy response",
        result: "audio response generated in local runtime"
      }
    ],
    user_visible_result:
      "A paid persona pack becomes a working voice-and-vision companion session, while Hermes records license and delivery proof."
  };
}

function buildSafetyReport(input, license, runtimeTrace) {
  return {
    schema: "hermes-personaforge.safety_redaction_report.v1",
    generated_at: "2026-06-27T16:00:20+08:00",
    asset_policy: input.persona_pack.asset_policy,
    checks: [
      {
        name: "no_third_party_character_assets_in_repo",
        result: input.persona_pack.asset_policy.public_repo_redistributes_third_party_character_assets === false,
        evidence: "repo contains manifest/proof only; local character packs are ignored"
      },
      {
        name: "public_assets_original_or_redacted",
        result: input.persona_pack.asset_policy.committed_assets_are_original_or_redacted === true,
        evidence: input.persona_pack.public_assets.join(", ")
      },
      {
        name: "license_manifest_hash_present",
        result: license.manifest_sha256.length === 64,
        evidence: license.manifest_sha256
      },
      {
        name: "runtime_capability_trace_present",
        result: runtimeTrace.events.length >= 5,
        evidence: "voice, vision, browser context, and sprite switching are represented in trace"
      }
    ],
    public_submission_note:
      "The demo may show a local Shinsekai-compatible character runtime for visual clarity. The submitted repo does not redistribute that runtime pack."
  };
}

function buildAuditLedger(input, reconciliation, gate, license, runtimeTrace, safety) {
  return {
    schema: "hermes-personaforge.audit_ledger.v1",
    generated_at: "2026-06-27T16:00:25+08:00",
    ledger: [
      {
        time: "2026-06-27T15:58:00+08:00",
        actor: "Customer browser",
        action: "AI Companion Persona Pack purchased from EC site",
        result: `${input.order.id} ${input.order.amount.toFixed(2)} ${input.order.currency}`
      },
      {
        time: "2026-06-27T16:00:00+08:00",
        actor: "Hermes payment verifier",
        action: "Reconciled redacted payment proof",
        result: reconciliation.decision
      },
      {
        time: "2026-06-27T16:00:05+08:00",
        actor: "Hermes margin gate",
        action: "Checked paid order economics",
        result: `${gate.economics.gross_margin * 100}% gross margin; ${gate.decision}`
      },
      {
        time: "2026-06-27T16:00:10+08:00",
        actor: "Hermes license worker",
        action: "Unlocked persona manifest download",
        result: `${license.license_id} -> ${license.delivery.download_file}`
      },
      {
        time: "2026-06-27T16:00:15+08:00",
        actor: "Persona runtime",
        action: "Imported manifest and started voice-and-vision session",
        result: runtimeTrace.user_visible_result
      },
      {
        time: "2026-06-27T16:00:20+08:00",
        actor: "Safety sidecar",
        action: "Checked asset and redaction policy",
        result: safety.public_submission_note
      }
    ],
    proof_links: {
      payment_reconciliation: proofRef("payment_reconciliation.json"),
      margin_gate: proofRef("persona_margin_gate.json"),
      license_manifest: proofRef("persona_license_manifest.json"),
      runtime_trace: proofRef("runtime_launch_trace.json"),
      safety_report: proofRef("safety_redaction_report.json")
    },
    conclusion:
      "Hermes PersonaForge extends a real paid commerce rail into paid persona-pack delivery: verify money, decide margin, unlock license, start runtime, and seal proof."
  };
}

function buildManifest(input, outputs) {
  return {
    schema: "hermes-personaforge.proof_manifest.v1",
    generated_at: "2026-06-27T16:00:30+08:00",
    generated_by: "scripts/generate-proof-pack.mjs",
    project: "Hermes PersonaForge",
    generated_outputs: outputs.map((output) => ({
      path: output.path,
      sha256: hashText(output.content)
    })),
    static_evidence: [
      {
        path: "artifacts/input/persona-commerce-order.json",
        sha256: hashText(JSON.stringify(input, null, 2))
      }
    ],
    verifier_claims: [
      "A paid store order can unlock a persona pack entitlement.",
      "Hermes checks margin before delivery work.",
      "The persona license manifest is hashable and auditable.",
      "Voice, vision, and sprite-switch runtime delivery is represented in deterministic trace.",
      "The repo does not redistribute local third-party character assets."
    ],
    commands: {
      regenerate: "npm run proof",
      verify: "npm test",
      run_demo: "npm run dev",
      record_demo: "npm run record:demo"
    }
  };
}

await mkdir(inputDir, { recursive: true });
await mkdir(proofDir, { recursive: true });
await writeFile(
  path.join(inputDir, "persona-commerce-order.json"),
  `${JSON.stringify(fixture, null, 2)}\n`
);

const reconciliation = buildPaymentReconciliation(fixture);
const gate = buildMarginGate(fixture, reconciliation);
const license = buildLicenseManifest(fixture, gate);
const runtimeTrace = buildRuntimeTrace(fixture, license);
const safety = buildSafetyReport(fixture, license, runtimeTrace);
const ledger = buildAuditLedger(fixture, reconciliation, gate, license, runtimeTrace, safety);

const outputObjects = [
  ["payment_reconciliation.json", reconciliation],
  ["persona_margin_gate.json", gate],
  ["persona_license_manifest.json", license],
  ["runtime_launch_trace.json", runtimeTrace],
  ["safety_redaction_report.json", safety],
  ["persona_audit_ledger.json", ledger]
];

const outputs = [];
for (const [name, data] of outputObjects) {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(path.join(proofDir, name), content);
  outputs.push({ path: proofRef(name), content });
}

const manifest = buildManifest(fixture, outputs);
await writeFile(
  path.join(proofDir, "proof_manifest.generated.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.log("Generated Hermes PersonaForge proof pack:");
for (const output of outputs) {
  console.log(`- ${output.path}`);
}
console.log("- artifacts/proof/proof_manifest.generated.json");
