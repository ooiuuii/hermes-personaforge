export type StageStatus = "idle" | "active" | "complete";
export type DemoViewId = "payment" | "gate" | "license" | "runtime" | "safety" | "proof";
export type Tone = "payment" | "hermes" | "profit" | "license" | "runtime" | "safety" | "proof";

export type Stage = {
  id: DemoViewId;
  label: string;
  eyebrow: string;
  headline: string;
  detail: string;
};

export type AgentEvent = {
  id: string;
  time: string;
  actor: string;
  command: string;
  result: string;
  tone: Tone;
};

export type LedgerEntry = {
  time: string;
  actor: string;
  action: string;
  result: string;
  tone: Tone;
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
};

export const personaOrder = {
  store: "ec.xingyipoxiao.cloud",
  merchant: "Deqing Qiance Technology Co., Ltd.",
  project: "Hermes PersonaForge",
  sku: "persona-pack.qiance-companion.starter",
  product: "Qiance Companion Persona Pack",
  paymentProvider: "Alipay",
  amount: "CNY 9.90",
  revenue: 9.9,
  estimatedCost: 1.8,
  grossProfit: 8.1,
  margin: "81.8%",
  minimumMargin: "45%",
  paidStatus: "paid",
  orderStatus: "ready for digital delivery",
  licenseId: "pf_84f2d6e64e8b19a107",
  packId: "qiance-companion-starter",
  runtime: "Shinsekai-compatible voice + vision session",
  tradeRef: "20260627-PERSONA-****-PAID",
};

export const stages: Stage[] = [
  {
    id: "payment",
    label: "Paid Pack",
    eyebrow: "live commerce rail",
    headline: "A paid store order becomes a persona-pack entitlement.",
    detail:
      "The demo starts from the Qiance EC payment rail and uses redacted proof instead of payment secrets or raw customer data.",
  },
  {
    id: "gate",
    label: "Profit Gate",
    eyebrow: "Hermes business check",
    headline: "Hermes decides if this digital delivery is worth fulfilling.",
    detail:
      "Revenue, runtime cost, TTS preview, storage, and support reserve are checked before the persona pack is unlocked.",
  },
  {
    id: "license",
    label: "License",
    eyebrow: "entitlement worker",
    headline: "A paid buyer receives a signed persona manifest.",
    detail:
      "The manifest describes voice, vision, memory, and emotion routing without committing third-party character assets.",
  },
  {
    id: "runtime",
    label: "Runtime",
    eyebrow: "voice + vision companion",
    headline: "The character session reacts to browser context and switches emotion.",
    detail:
      "The private runtime can read a page, notice self-reference, answer with voice, and switch to a shy sprite route.",
  },
  {
    id: "safety",
    label: "Safety",
    eyebrow: "asset boundary",
    headline: "The repo proves the business flow without redistributing local character packs.",
    detail:
      "Hermes records the difference between a licensed persona-product workflow and private local runtime assets.",
  },
  {
    id: "proof",
    label: "Proof",
    eyebrow: "npm run proof",
    headline: "Judges can regenerate the payment, license, runtime, and safety trail.",
    detail:
      "The proof pack links redacted payment evidence, margin decision, license manifest, runtime trace, and audit ledger.",
  },
];

export const metricCards: MetricCard[] = [
  {
    label: "Paid persona pack",
    value: personaOrder.amount,
    detail: "Digital product order is treated as a paid entitlement source.",
    tone: "payment",
  },
  {
    label: "Estimated delivery cost",
    value: "CNY 1.80",
    detail: "License issuance, storage, TTS preview, runtime orchestration, support reserve.",
    tone: "runtime",
  },
  {
    label: "Gross profit",
    value: "CNY 8.10",
    detail: `${personaOrder.margin} margin clears the ${personaOrder.minimumMargin} policy.`,
    tone: "profit",
  },
  {
    label: "Runtime capabilities",
    value: "4",
    detail: "Voice, vision, sprite switching, and short-term memory.",
    tone: "license",
  },
];

export const agentEvents: AgentEvent[] = [
  {
    id: "boot",
    time: "00:00",
    actor: "Hermes PersonaForge",
    command: "boot --mode paid-persona-pack --guarded",
    result: "payment, margin, license, runtime, and asset-policy gates loaded",
    tone: "hermes",
  },
  {
    id: "order",
    time: "00:04",
    actor: "Qiance store",
    command: "read paid order --sku persona-pack.qiance-companion.starter",
    result: "CNY 9.90 paid; customer and full trade reference redacted",
    tone: "payment",
  },
  {
    id: "verify",
    time: "00:08",
    actor: "Payment verifier",
    command: "reconcile alipay callbacks --redacted",
    result: "entitlement source accepted",
    tone: "payment",
  },
  {
    id: "gate",
    time: "00:13",
    actor: "Hermes profit gate",
    command: "evaluate revenue=9.90 cost=1.80 min_margin=0.45",
    result: "unlock accepted; gross profit CNY 8.10",
    tone: "profit",
  },
  {
    id: "license",
    time: "00:19",
    actor: "License worker",
    command: "issue persona manifest --pack qiance-companion-starter",
    result: "license pf_84f2d6e64e8b19a107 unlocked",
    tone: "license",
  },
  {
    id: "runtime",
    time: "00:25",
    actor: "Persona runtime",
    command: "launch voice+vision companion --manifest signed",
    result: "browser context, voice, memory, and sprite routes online",
    tone: "runtime",
  },
  {
    id: "vision",
    time: "00:32",
    actor: "Vision sidecar",
    command: "inspect browser page --detect self reference",
    result: "emotion route=shy; runtime switches expression",
    tone: "runtime",
  },
  {
    id: "safety",
    time: "00:38",
    actor: "Asset guard",
    command: "check public repo --no local character packs",
    result: "third-party runtime assets stay out of Git",
    tone: "safety",
  },
  {
    id: "proof",
    time: "00:45",
    actor: "Proof runner",
    command: "npm run proof",
    result: "payment, margin, license, runtime, safety, and ledger artifacts regenerated",
    tone: "proof",
  },
];

export const ledgerByStep: LedgerEntry[][] = [
  [
    {
      time: "00:04",
      actor: "Qiance store",
      action: "Captured paid persona-pack order",
      result: `${personaOrder.product} is paid on ${personaOrder.store}.`,
      tone: "payment",
    },
  ],
  [
    {
      time: "00:13",
      actor: "Hermes margin gate",
      action: "Accepted profitable digital delivery",
      result: "CNY 9.90 revenue minus CNY 1.80 estimated cost produces CNY 8.10 gross profit.",
      tone: "profit",
    },
  ],
  [
    {
      time: "00:19",
      actor: "License worker",
      action: "Issued persona manifest",
      result: "Voice, vision, memory, and emotion routes are included in a hashable manifest.",
      tone: "license",
    },
  ],
  [
    {
      time: "00:32",
      actor: "Runtime sidecars",
      action: "Started companion session",
      result: "The runtime can read page context, speak, and switch to a shy sprite route.",
      tone: "runtime",
    },
  ],
  [
    {
      time: "00:38",
      actor: "Asset guard",
      action: "Enforced public repo boundary",
      result: "Local character packs and voice checkpoints are ignored; public proof uses redacted manifests.",
      tone: "safety",
    },
  ],
  [
    {
      time: "00:45",
      actor: "Audit ledger",
      action: "Sealed PersonaForge proof",
      result: "Payment, margin, license, runtime trace, safety policy, and manifest hashes are linked.",
      tone: "proof",
    },
  ],
];

export const defaultTaskPrompt =
  "When a customer buys a persona pack, verify paid evidence, check margin, issue a license manifest, start a voice-and-vision companion runtime, and seal an audit proof pack.";

export const goalText =
  "Hermes PersonaForge is the emotional-value sequel to Commerce Ops: real payment unlocks a licensed persona-pack experience, while Hermes keeps the business logic auditable.";
