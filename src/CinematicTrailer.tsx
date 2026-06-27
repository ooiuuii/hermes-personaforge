import {
  BadgeCheck,
  Bot,
  CircleDollarSign,
  CreditCard,
  Download,
  Eye,
  FileText,
  KeyRound,
  Mic2,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TerminalSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { PersonaPortrait } from "./PersonaPortrait";

const introEvents = [
  "$ customer buys AI Companion Persona Pack",
  "$ alipay callback marks order paid",
  "$ hermes verify-payment --redacted",
  "$ hermes unlock download qiance-companion-starter.persona-manifest.json",
  "$ runtime import manifest --shinsekai-compatible",
  "$ character sees its own product page and reacts shyly",
  "$ npm test",
  "PERSONAFORGE_PROOF_VERIFY_OK",
];

const flowItems = [
  ["Buy", "EC product page"],
  ["Verify", "Alipay paid proof"],
  ["Download", "manifest unlocked"],
  ["Import", "runtime starts"],
  ["React", "surprised -> shy"],
  ["Proof", "ledger sealed"],
];

function IntroScene() {
  return (
    <main className="cinema-shell intro-scene">
      <header className="cinema-topline">
        <span>Hermes PersonaForge</span>
        <strong>Paid persona packs to audited companion sessions</strong>
      </header>

      <section className="cinema-copy">
        <p>FOURTH STANDALONE SUBMISSION</p>
        <h1>
          Customer buys
          <br />
          a persona pack.
          <br />
          The character
          <br />
          wakes up.
        </h1>
      </section>

      <section className="cinema-stage">
        <div className="cinema-persona">
          <PersonaPortrait emotion="curious" />
          <div className="cinema-persona-caption">
            <Mic2 size={16} />
            voice + vision runtime ready
          </div>
        </div>

        <div className="cinema-store-card">
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <strong>https://ec.xingyipoxiao.cloud/ai-companion-persona-pack</strong>
          </div>
          <div className="cinema-store-body">
            <Store size={26} />
            <div>
              <span>Qiance EC store</span>
              <strong>AI Companion Persona Pack</strong>
              <em>Voice, vision, memory, and emotion routes</em>
            </div>
            <button>
              <ShoppingCart size={16} />
              Buy CNY 2.00
            </button>
          </div>
        </div>

        <div className="cinema-download-card">
          <CreditCard size={18} />
          <span>Alipay paid</span>
          <Download size={18} />
          <strong>qiance-companion-starter.persona-manifest.json</strong>
        </div>

        <div className="cinema-process-chain">
          {flowItems.map(([title, detail], index) => (
            <div className="process-node" style={{ "--process-index": index } as CSSProperties} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <em>{detail}</em>
            </div>
          ))}
        </div>

        <div className="cinema-terminal-card">
          <div className="terminal-header">
            <TerminalSquare size={16} />
            <strong>PersonaForge Event Stream</strong>
            <em>demo replay</em>
          </div>
          <div className="cinema-terminal-lines">
            {introEvents.map((event, index) => (
              <code style={{ "--line-index": index } as CSSProperties} key={event}>
                {event}
              </code>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function RuntimeScene() {
  return (
    <main className="cinema-shell runtime-scene">
      <header className="cinema-topline">
        <span>Runtime moment</span>
        <strong>What the buyer actually receives</strong>
      </header>

      <section className="runtime-cinema-layout">
        <div className="runtime-cinema-copy">
          <p>EMOTIONAL VALUE</p>
          <h1>
            A paid product
            <br />
            becomes a speaking,
            <br />
            seeing character.
          </h1>
          <div className="cinema-proof-strip">
            <span>
              <CreditCard size={16} /> paid
            </span>
            <span>
              <KeyRound size={16} /> licensed
            </span>
            <span>
              <Eye size={16} /> sees page
            </span>
            <span>
              <Mic2 size={16} /> speaks
            </span>
          </div>
        </div>

        <div className="runtime-cinema-stack">
          <div className="runtime-demo-frame">
            <div className="runtime-top">
              <span />
              <span />
              <span />
              <strong>Persona runtime</strong>
            </div>
            <div className="runtime-import-line">
              <code>personaforge import qiance-companion-starter.persona-manifest.json</code>
              <em>verified</em>
            </div>
            <div className="runtime-body">
              <PersonaPortrait emotion="shy" />
              <div className="speech-panel">
                <span>EC order page detected</span>
                <strong>"Wait... they bought my persona pack? That's embarrassing."</strong>
                <p>emotion route: surprised to shy / sprite switch / voice response</p>
              </div>
            </div>
          </div>

          <div className="cinema-order-page-card">
            <div className="browser-bar">
              <span />
              <span />
              <span />
              <strong>https://ec.xingyipoxiao.cloud/orderdetails/PF-2026-06-27-001</strong>
            </div>
            <div>
              <span>AI Companion Persona Pack</span>
              <strong>Paid / Download delivered</strong>
              <em>Vision sidecar sees the buyer's product and order context.</em>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CompareScene() {
  const rows: Array<[string, string, LucideIcon]> = [
    ["Foundry", "approval orchestration", Store],
    ["Sourcing Desk", "procurement savings", CircleDollarSign],
    ["Commerce Ops", "paid-order operations", PackageCheck],
    ["PersonaForge", "paid character-pack delivery", Bot],
  ];

  return (
    <main className="cinema-shell compare-scene">
      <header className="cinema-topline">
        <span>Series framing</span>
        <strong>Same Hermes foundation, different business surface</strong>
      </header>

      <section className="compare-title">
        <p>PROJECT FOUR</p>
        <h1>PersonaForge is the emotional-product layer on top of real commerce ops.</h1>
      </section>

      <section className="series-grid">
        {rows.map(([name, detail, Icon], index) => (
          <article className={index === rows.length - 1 ? "series-card active" : "series-card"} key={name}>
            <Icon size={24} />
            <span>{name}</span>
            <strong>{detail}</strong>
          </article>
        ))}
      </section>

      <section className="compare-proof-row">
        <div>
          <CreditCard size={18} />
          paid order
        </div>
        <div>
          <KeyRound size={18} />
          persona license
        </div>
        <div>
          <ShieldCheck size={18} />
          asset boundary
        </div>
        <div>
          <FileText size={18} />
          proof pack
        </div>
      </section>
    </main>
  );
}

function ProofScene() {
  const proofs = [
    "payment_reconciliation.json",
    "persona_margin_gate.json",
    "persona_license_manifest.json",
    "runtime_launch_trace.json",
    "safety_redaction_report.json",
    "persona_audit_ledger.json",
  ];

  return (
    <main className="cinema-shell proof-scene">
      <header className="cinema-topline">
        <span>Verifier evidence</span>
        <strong>Judges can regenerate the claim</strong>
      </header>

      <section className="proof-cinema-layout">
        <div className="proof-cinema-copy">
          <p>NOT JUST A CHARACTER DEMO</p>
          <h1>
            Payment,
            <br />
            license,
            <br />
            runtime,
            <br />
            proof.
          </h1>
        </div>
        <div className="proof-cinema-stack">
          {proofs.map((proof, index) => (
            <article style={{ "--row-index": index } as CSSProperties} key={proof}>
              <BadgeCheck size={18} />
              <strong>{proof}</strong>
              <span>generated</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function CinematicTrailer() {
  const scene = new URLSearchParams(window.location.search).get("scene");
  if (scene === "runtime") return <RuntimeScene />;
  if (scene === "compare") return <CompareScene />;
  if (scene === "proof") return <ProofScene />;
  return <IntroScene />;
}
