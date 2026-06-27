import type { Tone } from "./scenarioData";

export type ProofArtifact = {
  label: string;
  file: string;
  status: string;
  detail: string;
  tone: Tone;
};

export const proofArtifacts: ProofArtifact[] = [
  {
    label: "Payment reconciliation",
    file: "artifacts/proof/payment_reconciliation.json",
    status: "verified",
    detail: "Redacted paid-order evidence becomes a persona entitlement source.",
    tone: "payment",
  },
  {
    label: "Persona margin gate",
    file: "artifacts/proof/persona_margin_gate.json",
    status: "accepted",
    detail: "Revenue, delivery cost, support reserve, gross profit, and margin are checked before unlock.",
    tone: "profit",
  },
  {
    label: "License manifest",
    file: "artifacts/proof/persona_license_manifest.json",
    status: "unlocked",
    detail: "Hashable manifest records voice, vision, memory, emotion routes, and entitlement scope.",
    tone: "license",
  },
  {
    label: "Runtime trace",
    file: "artifacts/proof/runtime_launch_trace.json",
    status: "launched",
    detail: "Deterministic trace shows browser context, voice synthesis, and sprite emotion routing.",
    tone: "runtime",
  },
  {
    label: "Safety report",
    file: "artifacts/proof/safety_redaction_report.json",
    status: "clean",
    detail: "Public repo includes proof and manifests, not local character packs or third-party assets.",
    tone: "safety",
  },
  {
    label: "Audit ledger",
    file: "artifacts/proof/persona_audit_ledger.json",
    status: "sealed",
    detail: "Links payment, margin, license, runtime, safety, and verifier claims.",
    tone: "proof",
  },
  {
    label: "Proof manifest",
    file: "artifacts/proof/proof_manifest.generated.json",
    status: "hashed",
    detail: "Hashes generated outputs and records reproducible commands.",
    tone: "proof",
  },
];
