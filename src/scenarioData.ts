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
  product: "AI Companion Persona Pack",
  productUrl: "https://ec.xingyipoxiao.cloud/ai-companion-persona-pack",
  orderUrl: "https://ec.xingyipoxiao.cloud/orderdetails/PF-2026-06-27-001",
  paymentProvider: "Alipay",
  amount: "CNY 2.00",
  revenue: 2,
  estimatedCost: 0.42,
  grossProfit: 1.58,
  margin: "79.0%",
  minimumMargin: "45%",
  paidStatus: "paid",
  orderStatus: "download ready",
  licenseId: "pf_84f2d6e64e8b19a107",
  packId: "qiance-companion-starter",
  downloadFile: "qiance-companion-starter.persona-manifest.json",
  importCommand: "personaforge import qiance-companion-starter.persona-manifest.json",
  runtime: "Shinsekai-compatible voice + vision session",
  tradeRef: "20260627-PERSONA-****-PAID",
};

export const stages: Stage[] = [
  {
    id: "payment",
    label: "Buy Pack",
    eyebrow: "live commerce rail",
    headline: "A customer buys an AI Companion Persona Pack from the EC site.",
    detail:
      "The demo starts at the Qiance EC product page, follows Alipay paid proof, then exposes a gated download.",
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
    label: "Download",
    eyebrow: "entitlement worker",
    headline: "Hermes unlocks a signed persona manifest for download.",
    detail:
      "The buyer downloads a Shinsekai-compatible manifest that points to local voice, vision, memory, and emotion routes.",
  },
  {
    id: "runtime",
    label: "Runtime",
    eyebrow: "voice + vision companion",
    headline: "The downloaded pack launches a Shinsekai-compatible runtime.",
    detail:
      "The character sees its own product and order page, becomes surprised, then switches to a shy voice and sprite route.",
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
    label: "Customer checkout",
    value: personaOrder.amount,
    detail: "A real commerce order becomes the paid entitlement source.",
    tone: "payment",
  },
  {
    label: "Estimated delivery cost",
    value: "CNY 0.42",
    detail: "License issuance, storage, TTS preview, runtime orchestration, support reserve.",
    tone: "runtime",
  },
  {
    label: "Gross profit",
    value: "CNY 1.58",
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
    actor: "Customer browser",
    command: "buy ai-companion-persona-pack --site ec.xingyipoxiao.cloud",
    result: "checkout completed through Alipay; customer and full trade reference redacted",
    tone: "payment",
  },
  {
    id: "verify",
    time: "00:08",
    actor: "Payment verifier",
    command: "reconcile alipay callbacks --redacted",
    result: "paid order accepted as persona-pack entitlement source",
    tone: "payment",
  },
  {
    id: "gate",
    time: "00:13",
    actor: "Hermes profit gate",
    command: "evaluate revenue=2.00 cost=0.42 min_margin=0.45",
    result: "unlock accepted; gross profit CNY 1.58",
    tone: "profit",
  },
  {
    id: "license",
    time: "00:19",
    actor: "License worker",
    command: "issue persona manifest --pack qiance-companion-starter",
    result: "download qiance-companion-starter.persona-manifest.json unlocked",
    tone: "license",
  },
  {
    id: "runtime",
    time: "00:25",
    actor: "Persona runtime",
    command: "import manifest && launch shinsekai-compatible runtime",
    result: "browser context, voice, memory, and sprite routes online",
    tone: "runtime",
  },
  {
    id: "vision",
    time: "00:32",
    actor: "Vision sidecar",
    command: "inspect product and order pages --detect self reference",
    result: "emotion route=surprised -> shy; runtime switches expression and queues voice",
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
      actor: "Customer browser",
      action: "Bought persona pack on the EC site",
      result: `${personaOrder.product} is paid on ${personaOrder.store} and gated behind Hermes verification.`,
      tone: "payment",
    },
  ],
  [
    {
      time: "00:13",
      actor: "Hermes margin gate",
      action: "Accepted profitable digital delivery",
      result: "CNY 2.00 revenue minus CNY 0.42 estimated cost produces CNY 1.58 gross profit.",
      tone: "profit",
    },
  ],
  [
    {
      time: "00:19",
      actor: "License worker",
      action: "Unlocked persona manifest download",
      result: "The buyer receives qiance-companion-starter.persona-manifest.json after paid proof clears.",
      tone: "license",
    },
  ],
  [
    {
      time: "00:32",
      actor: "Runtime sidecars",
      action: "Imported manifest and started companion session",
      result: "The runtime reads the product/order page, reacts surprised, then switches to a shy voice and sprite route.",
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
  "When a customer buys an AI Companion Persona Pack, verify payment, check margin, unlock the manifest download, import it into a Shinsekai-compatible runtime, react to the product/order page, and seal an audit proof pack.";

export const goalText =
  "Hermes PersonaForge is the emotional-value sequel to Commerce Ops: real payment unlocks a licensed persona-pack experience, while Hermes keeps the business logic auditable.";
