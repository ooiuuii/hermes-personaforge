import {
  BadgeCheck,
  Bot,
  Check,
  CircleDollarSign,
  CreditCard,
  Eye,
  FileText,
  KeyRound,
  LockKeyhole,
  Mic2,
  PackageCheck,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Store,
  TerminalSquare,
  Video,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { proofArtifacts } from "./proofData";
import {
  agentEvents,
  defaultTaskPrompt,
  goalText,
  ledgerByStep,
  metricCards,
  personaOrder,
  stages,
} from "./scenarioData";
import type { DemoViewId, LedgerEntry, StageStatus } from "./scenarioData";

function stageStatus(index: number, currentStep: number): StageStatus {
  if (index < currentStep) return "complete";
  if (index === currentStep) return "active";
  return "idle";
}

function flattenLedger(step: number): LedgerEntry[] {
  return ledgerByStep.slice(0, step + 1).flat();
}

function viewIcon(id: DemoViewId) {
  switch (id) {
    case "payment":
      return <CreditCard size={17} />;
    case "gate":
      return <CircleDollarSign size={17} />;
    case "license":
      return <KeyRound size={17} />;
    case "runtime":
      return <Bot size={17} />;
    case "safety":
      return <ShieldCheck size={17} />;
    case "proof":
      return <TerminalSquare size={17} />;
  }
}

function PersonaPortrait({ emotion = "curious" }: { emotion?: "curious" | "shy" | "focused" }) {
  return (
    <div className={`persona-portrait ${emotion}`} aria-label="original demo persona portrait">
      <div className="portrait-hair" />
      <div className="portrait-face">
        <span className="eye left-eye" />
        <span className="eye right-eye" />
        <span className="mouth" />
        <span className="blush blush-left" />
        <span className="blush blush-right" />
      </div>
      <div className="portrait-ribbon" />
      <div className="portrait-badge">
        <Sparkles size={14} />
        demo persona
      </div>
    </div>
  );
}

function PaymentView() {
  const fields = [
    ["Store", personaOrder.store],
    ["Product", personaOrder.product],
    ["SKU", personaOrder.sku],
    ["Payment", personaOrder.paymentProvider],
    ["Status", `${personaOrder.paidStatus} / ${personaOrder.orderStatus}`],
    ["Trade ref", personaOrder.tradeRef],
  ];

  return (
    <section className="view-grid payment-view">
      <article className="proof-card hero-card">
        <div className="card-title">
          <CreditCard size={24} />
          <div>
            <span>Paid persona pack</span>
            <strong>{personaOrder.amount}</strong>
          </div>
          <BadgeCheck size={22} />
        </div>
        <div className="field-grid">
          {fields.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="notice-line">
          <LockKeyhole size={15} />
          customer PII, full trade number, payment keys, and raw screenshots stay out of Git
        </div>
      </article>

      <article className="story-card">
        <Store size={28} />
        <span>Why this is project four</span>
        <h3>Commerce Ops proved the payment rail. PersonaForge sells an emotional AI product on top of it.</h3>
        <p>
          The buyer is not purchasing a generic service report. They are unlocking a licensed persona-pack
          experience that Hermes can provision, audit, and revoke.
        </p>
      </article>
    </section>
  );
}

function GateView() {
  const rows = [
    ["Revenue", "CNY 9.90", "paid digital product"],
    ["Delivery cost", "CNY 1.80", "license, storage, TTS preview, runtime, support"],
    ["Gross profit", "CNY 8.10", "revenue minus estimated cost"],
    ["Decision", "UNLOCK", "81.8% margin clears 45% policy"],
  ];

  return (
    <section className="view-grid gate-view">
      <article className="margin-meter proof-card">
        <span>Hermes margin gate</span>
        <strong>{personaOrder.margin}</strong>
        <p>minimum required margin: {personaOrder.minimumMargin}</p>
        <div className="meter-track">
          <i />
        </div>
      </article>
      <div className="row-stack">
        {rows.map(([label, value, detail]) => (
          <article className="mini-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <article className="wide-note">
        <ShieldCheck size={20} />
        <div>
          <strong>If delivery is not worth doing, Hermes can hold or refund.</strong>
          <p>
            This keeps the project aligned with the hackathon theme: the agent earns, spends, and runs a real
            operation, but it does not blindly fulfill every paid order.
          </p>
        </div>
      </article>
    </section>
  );
}

function LicenseView() {
  const manifestRows = [
    ["pack_id", personaOrder.packId],
    ["license", personaOrder.licenseId],
    ["format", "shinsekai-compatible-manifest"],
    ["usage", "personal demo runtime"],
    ["memory", "session local, audit redacted"],
    ["expires", "2026-07-27"],
  ];

  return (
    <section className="view-grid license-view">
      <article className="manifest-card proof-card">
        <div className="card-title">
          <KeyRound size={24} />
          <div>
            <span>Persona license manifest</span>
            <strong>Unlocked after paid proof</strong>
          </div>
        </div>
        <div className="manifest-grid">
          {manifestRows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </article>
      <article className="capability-panel">
        <div>
          <Mic2 size={21} />
          <strong>Voice</strong>
          <span>TTS preview and runtime response</span>
        </div>
        <div>
          <Eye size={21} />
          <strong>Vision</strong>
          <span>Browser/page context inspection</span>
        </div>
        <div>
          <Sparkles size={21} />
          <strong>Emotion route</strong>
          <span>curious, surprised, shy, focused, cheerful</span>
        </div>
        <div>
          <FileText size={21} />
          <strong>Audit hash</strong>
          <span>manifest and entitlement proof</span>
        </div>
      </article>
    </section>
  );
}

function RuntimeView() {
  return (
    <section className="runtime-layout">
      <article className="runtime-window">
        <div className="runtime-top">
          <span />
          <span />
          <span />
          <strong>PersonaForge Runtime</strong>
        </div>
        <div className="runtime-body">
          <PersonaPortrait emotion="shy" />
          <div className="speech-panel">
            <span>browser context detected</span>
            <strong>"This page is about me? I'm a little embarrassed."</strong>
            <p>emotion route: shy / sprite switch / voice response queued</p>
          </div>
        </div>
      </article>
      <article className="browser-context-card">
        <div className="card-title">
          <Video size={22} />
          <div>
            <span>Demo beat</span>
            <strong>Self-search surprise</strong>
          </div>
        </div>
        <p>
          The video can mirror the Shinsekai-style flow: open a page about the character, let the runtime read
          it, then switch expression and speak. Hermes adds the paid entitlement and proof layer around that
          emotional moment.
        </p>
        <div className="runtime-tags">
          <span>voice</span>
          <span>vision</span>
          <span>sprite</span>
          <span>memory</span>
        </div>
      </article>
    </section>
  );
}

function SafetyView() {
  const checks = [
    ["Public repo", "manifest/proof only"],
    ["Local packs", "ignored by .gitignore"],
    ["Third-party assets", "not redistributed"],
    ["Payment proof", "redacted and hashed"],
    ["Failed delivery", "hold/refund route"],
  ];

  return (
    <section className="view-grid safety-view">
      <article className="story-card">
        <ShieldCheck size={28} />
        <span>Submission boundary</span>
        <h3>The character runtime can be cinematic without putting copyrighted assets in Git.</h3>
        <p>
          PersonaForge is the business wrapper: paid entitlement, manifest delivery, runtime launch trace,
          refund route, and proof. Local demo assets stay local.
        </p>
      </article>
      <div className="check-stack">
        {checks.map(([label, value], index) => (
          <article style={{ "--row-index": index } as CSSProperties} key={label}>
            <Check size={16} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProofView() {
  return (
    <section className="proof-view">
      <article className="terminal-card">
        <div className="terminal-header">
          <TerminalSquare size={17} />
          <strong>Reproducible verifier</strong>
          <em>npm test</em>
        </div>
        <div className="terminal-lines">
          <code>$ npm run proof</code>
          <code>payment_reconciliation.json</code>
          <code>persona_margin_gate.json</code>
          <code>persona_license_manifest.json</code>
          <code>runtime_launch_trace.json</code>
          <code>safety_redaction_report.json</code>
          <code>PERSONAFORGE_PROOF_VERIFY_OK</code>
        </div>
      </article>
      <div className="proof-pack">
        {proofArtifacts.map((artifact) => (
          <article className={`proof-artifact ${artifact.tone}`} key={artifact.file}>
            <FileText size={17} />
            <div>
              <span>{artifact.label}</span>
              <strong>{artifact.file}</strong>
              <p>{artifact.detail}</p>
            </div>
            <em>{artifact.status}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderView(id: DemoViewId) {
  switch (id) {
    case "payment":
      return <PaymentView />;
    case "gate":
      return <GateView />;
    case "license":
      return <LicenseView />;
    case "runtime":
      return <RuntimeView />;
    case "safety":
      return <SafetyView />;
    case "proof":
      return <ProofView />;
  }
}

function EventStream({ step }: { step: number }) {
  const visibleEvents = agentEvents.slice(0, Math.min(agentEvents.length, step + 4));
  const recent = visibleEvents.slice(-7);

  return (
    <aside className="event-panel" aria-label="Hermes PersonaForge event stream">
      <div className="terminal-header">
        <TerminalSquare size={17} />
        <strong>Hermes Persona Event Stream</strong>
        <em>{step === stages.length - 1 ? "SEALED" : "RUNNING"}</em>
      </div>
      <div className="event-list">
        {recent.map((event) => (
          <article className={`event-line ${event.tone}`} key={event.id}>
            <time>{event.time}</time>
            <div>
              <span>{event.actor}</span>
              <code>$ {event.command}</code>
              <p>{event.result}</p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export function App() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState(defaultTaskPrompt);
  const timers = useRef<number[]>([]);
  const current = stages[step];
  const ledger = useMemo(() => flattenLedger(step), [step]);
  const progress = Math.round(((step + 1) / stages.length) * 100);

  function clearTimers() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }

  function runReplay() {
    if (isRunning) return;
    clearTimers();
    setIsRunning(true);
    stages.forEach((_, index) => {
      schedule(() => setStep(index), index * 1150);
    });
    schedule(() => setIsRunning(false), stages.length * 1150 + 200);
  }

  function reset() {
    clearTimers();
    setStep(0);
    setIsRunning(false);
  }

  return (
    <main className="app-shell">
      <section className="workbench">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Bot size={24} />
            </div>
            <div>
              <h1>Hermes PersonaForge</h1>
              <p>Paid persona packs to audited companion sessions</p>
            </div>
          </div>
          <div className="system-strip">
            <span>
              <Store size={15} /> Qiance store
            </span>
            <span>
              <CreditCard size={15} /> Alipay paid proof
            </span>
            <span>
              <Mic2 size={15} /> voice runtime
            </span>
            <span>
              <ShieldCheck size={15} /> asset boundary
            </span>
          </div>
        </header>

        <section className="hero-grid">
          <aside className="control-panel">
            <div className="demo-copy">
              <span>Fourth standalone hackathon submission</span>
              <strong>A paid character pack should unlock an experience, not just a download link.</strong>
              <p>{goalText}</p>
            </div>
            <div className="task-composer">
              <label htmlFor="task-input">Hermes operating instruction</label>
              <textarea id="task-input" value={taskPrompt} onChange={(event) => setTaskPrompt(event.target.value)} />
            </div>
            <div className="stage-tabs" role="tablist" aria-label="PersonaForge demo stages">
              {stages.map((stage, index) => {
                const status = stageStatus(index, step);
                return (
                  <button
                    className={`stage-tab ${status}`}
                    key={stage.id}
                    role="tab"
                    aria-selected={index === step}
                    onClick={() => setStep(index)}
                  >
                    <span className="tab-icon">{viewIcon(stage.id)}</span>
                    <span>
                      <em>{stage.eyebrow}</em>
                      <strong>{stage.label}</strong>
                    </span>
                    <i>{status === "complete" ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</i>
                  </button>
                );
              })}
            </div>
            <div className="demo-actions">
              <button className="primary-action" onClick={runReplay} disabled={isRunning}>
                <Play size={17} />
                Run agent
              </button>
              <button className="icon-action" onClick={reset} aria-label="Reset replay">
                <RefreshCcw size={17} />
              </button>
            </div>
          </aside>

          <section className="stage-panel" aria-live="polite">
            <div className="stage-heading">
              <span>{current.eyebrow}</span>
              <h2>{current.headline}</h2>
              <p>{current.detail}</p>
            </div>
            <div className="metric-row">
              {metricCards.map((metric) => (
                <article className={`metric-card ${metric.tone}`} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </article>
              ))}
            </div>
            <div className="view-body">{renderView(current.id)}</div>
          </section>

          <EventStream step={step} />
        </section>

        <section className="pipeline-row" aria-label="persona delivery pipeline">
          <div className="progress-rail" style={{ "--progress": `${progress}%` } as CSSProperties} />
          {stages.map((stage, index) => {
            const status = stageStatus(index, step);
            return (
              <article className={`pipeline-tile ${status}`} key={stage.id}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div className="pipeline-icon">{status === "complete" ? <Check size={16} /> : viewIcon(stage.id)}</div>
                <span>{stage.eyebrow}</span>
                <h2>{stage.label}</h2>
                <p>{stage.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="bottom-grid">
          <article className="ledger-section">
            <div className="section-title">
              <div>
                <span>Audit ledger</span>
                <h2>Paid pack to companion session</h2>
              </div>
              <PackageCheck size={22} />
            </div>
            <div className="ledger-list">
              {ledger.map((entry) => (
                <article className={`ledger-entry ${entry.tone}`} key={`${entry.time}-${entry.action}`}>
                  <time>{entry.time}</time>
                  <div>
                    <span>{entry.actor}</span>
                    <strong>{entry.action}</strong>
                    <p>{entry.result}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="submission-card">
            <div className="section-title">
              <div>
                <span>Story line</span>
                <h2>Not a reskin of the last project</h2>
              </div>
              <Sparkles size={22} />
            </div>
            <p>
              Foundry handled approval orchestration. Sourcing Desk handled procurement savings. Commerce Ops
              handled paid-order operations. PersonaForge turns the same real commerce foundation into a new
              product category: paid, licensed, voice-and-vision AI persona experiences.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
