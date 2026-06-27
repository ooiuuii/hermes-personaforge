import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputDir = path.join(root, "artifacts", "input");
const proofDir = path.join(root, "artifacts", "proof");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readProof(name) {
  return readJson(path.join(proofDir, name));
}

const input = await readJson(path.join(inputDir, "persona-commerce-order.json"));
const reconciliation = await readProof("payment_reconciliation.json");
const marginGate = await readProof("persona_margin_gate.json");
const license = await readProof("persona_license_manifest.json");
const runtimeTrace = await readProof("runtime_launch_trace.json");
const safety = await readProof("safety_redaction_report.json");
const ledger = await readProof("persona_audit_ledger.json");
const manifest = await readProof("proof_manifest.generated.json");

const generatedPaths = new Set(manifest.generated_outputs.map((output) => output.path));
const staticPaths = new Set(manifest.static_evidence.map((output) => output.path));

assert.equal(input.project, "Hermes PersonaForge");
assert.equal(input.order.payment_status, "paid");
assert.equal(input.commerce_source.status, "paid");
assert.equal(input.order.sku, "persona-pack.qiance-companion.starter");
assert.equal(input.persona_pack.asset_policy.public_repo_redistributes_third_party_character_assets, false);
assert.equal(input.persona_pack.asset_policy.local_character_packs_stay_out_of_git, true);

assert.equal(reconciliation.decision, "payment_verified_for_persona_entitlement");
assert.equal(reconciliation.checks.every((check) => check.result === true), true);
assert.equal(reconciliation.order.callback_paths.notify, "/Plugins/PaymentAliPay/Notify");
assert.equal(reconciliation.order.callback_paths.return, "/Plugins/PaymentAliPay/Return");

assert.equal(marginGate.economics.revenue, 9.9);
assert.equal(marginGate.economics.estimated_costs.total, 1.8);
assert.equal(marginGate.economics.gross_profit, 8.1);
assert.equal(marginGate.economics.gross_margin >= marginGate.economics.minimum_margin, true);
assert.equal(marginGate.decision, "unlock_persona_pack");

assert.equal(license.status, "unlocked");
assert.match(license.license_id, /^pf_[a-f0-9]{18}$/);
assert.equal(license.manifest.capabilities.includes("voice"), true);
assert.equal(license.manifest.capabilities.includes("vision"), true);
assert.equal(license.manifest.capabilities.includes("sprite_switching"), true);
assert.equal(license.manifest_sha256.length, 64);

assert.equal(runtimeTrace.runtime.voice_enabled, true);
assert.equal(runtimeTrace.runtime.vision_enabled, true);
assert.equal(runtimeTrace.runtime.sprite_switching_enabled, true);
assert.match(JSON.stringify(runtimeTrace.events), /emotion route=shy/);
assert.match(runtimeTrace.user_visible_result, /voice-and-vision companion session/);

assert.equal(safety.checks.every((check) => check.result === true), true);
assert.match(safety.public_submission_note, /does not redistribute/);

assert.match(ledger.conclusion, /paid persona-pack delivery/i);
assert.match(JSON.stringify(ledger), /Issued persona pack license/);
assert.match(JSON.stringify(ledger), /Started voice-and-vision session/);

assert.equal(generatedPaths.has("artifacts/proof/payment_reconciliation.json"), true);
assert.equal(generatedPaths.has("artifacts/proof/persona_margin_gate.json"), true);
assert.equal(generatedPaths.has("artifacts/proof/persona_license_manifest.json"), true);
assert.equal(generatedPaths.has("artifacts/proof/runtime_launch_trace.json"), true);
assert.equal(generatedPaths.has("artifacts/proof/safety_redaction_report.json"), true);
assert.equal(generatedPaths.has("artifacts/proof/persona_audit_ledger.json"), true);
assert.equal(staticPaths.has("artifacts/input/persona-commerce-order.json"), true);

assert.deepEqual(manifest.commands, {
  regenerate: "npm run proof",
  verify: "npm test",
  run_demo: "npm run dev",
  record_demo: "npm run record:demo"
});

console.log("PERSONAFORGE_PROOF_VERIFY_OK");
