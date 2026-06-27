import { chromium } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_BIN ?? "ffmpeg";
const ffprobe = process.env.FFPROBE_BIN ?? "ffprobe";
const edgeTts = process.env.EDGE_TTS_BIN ?? "edge-tts";

const videoDir = path.join(root, "artifacts", "videos");
const audioDir = path.join(root, "artifacts", "audio");
const segmentDir = path.join(videoDir, "segments", "experience");
const scratchDir = path.join(root, "artifacts", "runtime-captures", "persona-experience");

const introVideo = path.resolve(
  process.env.PERSONAFORGE_INTRO_VIDEO ??
    path.join(videoDir, "hermes-personaforge-live-commerce-shinsekai-demo.en.andrew-nas-bgm.mp4"),
);
const localSpriteDir = path.resolve(
  process.env.PERSONAFORGE_LOCAL_SPRITE_DIR ??
    "F:/AI/app/2dclaw-bridge/downloads/nanami_official_extracted/sprites/nanami",
);

const experienceSilent = path.join(videoDir, "hermes-personaforge-persona-experience.en-sub.silent.mp4");
const experienceAudio = path.join(audioDir, "hermes-personaforge-persona-experience.ja-voice.m4a");
const experienceVideo = path.join(videoDir, "hermes-personaforge-persona-experience.en-sub-ja-voice.mp4");
const finalVideo = path.join(videoDir, "hermes-personaforge-three-minute-demo.en-sub-ja-voice.mp4");

const durationSeconds = Number(process.env.PERSONAFORGE_EXPERIENCE_SECONDS ?? "88");
const viewport = { width: 1920, height: 1080 };

const spriteFiles = {
  curious: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_03.webp",
  surprised: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_13.webp",
  shy: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_21.webp",
  focused: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_10.webp",
  thinking: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_19.webp",
};

const voiceLines = [
  {
    start: 12.2,
    ja: "えっと……これは、私のペルソナパックの商品ページ、なんだよね。ちょっとびっくりした、と思うよ。",
    en: "Um... this is my own persona-pack product page, right? I think I am a little surprised.",
  },
  {
    start: 29.2,
    ja: "支払いが確認されてから、マニフェストが解放される。うん、ちゃんとした作戦だね。",
    en: "Payment is verified first, then the manifest unlocks. That is a proper plan.",
  },
  {
    start: 45.8,
    ja: "ライセンスが有効なら、音声、視覚、記憶、表情ルートを起動するよ。少し恥ずかしいけど。",
    en: "If the license is valid, I can start voice, vision, memory, and expression routes. It is a little embarrassing.",
  },
  {
    start: 63.8,
    ja: "証拠パックも残るから、これはただのチャットじゃない。買われた体験として、監査できるんだ。",
    en: "The proof pack stays behind, so this is not just chat. It is a purchased experience with an audit trail.",
  },
  {
    start: 78.0,
    ja: "準備できたよ。次は、あなたのページを一緒に見ようね。",
    en: "I am ready. Next, let us look at your page together.",
  },
];

function assertFile(file, label) {
  if (!existsSync(file)) throw new Error(`${label} not found: ${file}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed${result.stderr ? `: ${result.stderr.trim()}` : ""}`);
  }
  return result.stdout.trim();
}

function runInherit(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

function fileDataUri(file) {
  const data = readFileSync(file).toString("base64");
  return `data:image/webp;base64,${data}`;
}

function readDuration(file) {
  const output = run(ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  const duration = Number(output);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read duration for ${file}`);
  return duration;
}

function buildHtml(spriteUris) {
  const scenes = [
    {
      at: 0,
      sprite: "curious",
      mode: "product",
      prompt: "Can you look at the product page and tell me what you see?",
      subtitle: "Unlocked persona runtime opens the buyer's product page.",
      status: "persona manifest imported",
    },
    {
      at: 12,
      sprite: "surprised",
      mode: "product",
      prompt: "That product page is about you. Does the runtime understand it?",
      subtitle: voiceLines[0].en,
      status: "vision: self-reference detected",
    },
    {
      at: 29,
      sprite: "thinking",
      mode: "checkout",
      prompt: "Hermes only wakes the persona after payment clears. Is that visible?",
      subtitle: voiceLines[1].en,
      status: "payment: AliPay paid evidence accepted",
    },
    {
      at: 46,
      sprite: "shy",
      mode: "runtime",
      prompt: "What does the buyer receive after the manifest unlocks?",
      subtitle: voiceLines[2].en,
      status: "runtime: voice + vision + memory + sprite route",
    },
    {
      at: 64,
      sprite: "focused",
      mode: "proof",
      prompt: "Why is this a Hermes business-agent product, not only roleplay?",
      subtitle: voiceLines[3].en,
      status: "proof: payment -> license -> runtime -> safety",
    },
    {
      at: 78,
      sprite: "shy",
      mode: "ready",
      prompt: "Ready for a customer session?",
      subtitle: voiceLines[4].en,
      status: "session ready, asset boundary enforced",
    },
  ];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #05070a;
      color: #fffaf0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .stage {
      position: relative;
      width: 100vw;
      height: 100vh;
      background:
        radial-gradient(circle at 72% 20%, rgba(91, 206, 250, 0.16), transparent 28%),
        radial-gradient(circle at 18% 86%, rgba(255, 205, 86, 0.11), transparent 32%),
        linear-gradient(120deg, #06080c 0%, #101822 56%, #07100f 100%);
    }
    .topbar {
      position: absolute;
      left: 32px;
      right: 32px;
      top: 24px;
      height: 74px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(152, 176, 172, .22);
      border-radius: 8px;
      padding: 0 22px;
      background: rgba(8, 12, 17, .72);
      box-shadow: 0 18px 70px rgba(0,0,0,.42);
      backdrop-filter: blur(14px);
    }
    .brand { display: flex; gap: 16px; align-items: center; }
    .mark {
      width: 46px; height: 46px; border-radius: 8px;
      display: grid; place-items: center;
      background: linear-gradient(135deg, #67e8c9, #ffd86b);
      color: #07100f; font-size: 24px; font-weight: 900;
    }
    .brand strong { display:block; font-size: 28px; line-height: 1; letter-spacing: 0; }
    .brand span { display:block; margin-top: 5px; color: #d5e6df; font-size: 13px; text-transform: uppercase; }
    .chips { display:flex; gap: 12px; align-items:center; }
    .chips span {
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 8px;
      padding: 9px 12px;
      background: rgba(255,255,255,.05);
      color: #ecfdf5;
      font-size: 14px;
      font-weight: 700;
    }
    .browser {
      position: absolute;
      left: 42px;
      top: 128px;
      width: 1010px;
      height: 660px;
      border: 1px solid rgba(166, 185, 182, .22);
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
      color: #111827;
      box-shadow: 0 28px 96px rgba(0,0,0,.45);
    }
    .browserbar {
      height: 44px;
      display:flex; align-items:center; gap: 8px;
      background: #e8edf3;
      padding: 0 16px;
      color: #304050;
      font-size: 13px;
      font-weight: 700;
    }
    .dot { width: 10px; height: 10px; border-radius: 99px; background: #ef4444; }
    .dot:nth-child(2) { background: #f59e0b; }
    .dot:nth-child(3) { background: #22c55e; }
    .url {
      margin-left: 10px; flex: 1;
      border-radius: 7px;
      background: #fff;
      padding: 7px 12px;
      color: #475569;
    }
    .browserbody {
      position: relative;
      height: calc(100% - 44px);
      padding: 34px 42px;
      background: #fbfbfd;
    }
    .store-head {
      height: 58px;
      display:flex; justify-content:space-between; align-items:center;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 28px;
    }
    .logo { font-size: 28px; font-weight: 900; color: #1f2937; }
    .nav { display:flex; gap: 24px; color:#64748b; font-size:15px; }
    .product-layout { display:grid; grid-template-columns: 350px 1fr; gap: 38px; align-items:start; }
    .product-cover {
      height: 360px;
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(103, 232, 201, .22), rgba(255, 216, 107, .12)),
        #f1f5f9;
      display:grid; place-items:center;
      border: 1px solid #e5e7eb;
    }
    .cover-icon { width: 150px; height: 150px; border-radius: 32px; display:grid; place-items:center; background:#111827; color:#67e8c9; font-size:68px; }
    .product-copy span { color:#64748b; text-transform:uppercase; font-weight:800; font-size:13px; }
    .product-copy h2 { font-size: 42px; line-height:1.02; margin: 10px 0 16px; color:#111827; letter-spacing:0; }
    .product-copy p { font-size: 18px; line-height: 1.5; color:#334155; max-width: 500px; }
    .price { font-size: 40px; font-weight: 900; color:#111827; margin: 22px 0; }
    .buy { border:0; border-radius:7px; background:#1f9bd1; color:white; font-weight:900; font-size:20px; padding:16px 22px; }
    .checkout-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 24px; }
    .pay-card {
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      height: 210px;
      display:grid; place-items:center;
      background:#fff;
    }
    .pay-card.active { border-color:#0ea5e9; box-shadow:0 0 0 4px rgba(14,165,233,.12); }
    .pay-card strong { font-size: 36px; color:#0f172a; }
    .pay-card em { color:#64748b; font-style:normal; font-weight:800; }
    .manifest {
      display:grid; gap: 12px; margin-top: 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .manifest div {
      border:1px solid #d8dee7; border-radius:8px; padding:12px 14px; background:#fff;
      display:flex; justify-content:space-between; gap:18px;
    }
    .manifest span { color:#64748b; }
    .manifest strong { color:#0f172a; }
    .proof-list { display:grid; gap:14px; margin-top: 10px; }
    .proof-list article {
      border: 1px solid #d8dee7;
      border-radius: 8px;
      padding: 16px 18px;
      background:#fff;
      display:flex; justify-content:space-between; align-items:center;
      font-weight:800;
      color:#111827;
    }
    .proof-list em { color:#059669; font-style:normal; }
    .runtime-terminal {
      height: 315px;
      border-radius: 8px;
      background:#080d12;
      color:#d1fae5;
      padding: 18px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 17px;
      line-height: 1.62;
      box-shadow: inset 0 0 0 1px rgba(148, 163, 184, .18);
    }
    .prompt {
      position: absolute;
      left: 72px;
      right: 930px;
      bottom: 64px;
      min-height: 96px;
      border-radius: 8px;
      border: 1px solid rgba(112, 232, 201, .34);
      background: rgba(5, 9, 14, .86);
      color:#fffaf0;
      padding: 20px 24px;
      font-size: 26px;
      line-height: 1.25;
      font-weight: 760;
      box-shadow: 0 22px 80px rgba(0,0,0,.45);
    }
    .prompt span { display:block; color:#67e8c9; font-size:13px; text-transform:uppercase; margin-bottom:8px; }
    .persona {
      position:absolute;
      right: 24px;
      bottom: -80px;
      width: 760px;
      height: 1030px;
      display:grid;
      align-items:end;
      justify-items:center;
      pointer-events:none;
    }
    .persona img {
      max-height: 960px;
      max-width: 760px;
      object-fit:contain;
      filter: drop-shadow(0 34px 54px rgba(0,0,0,.62));
      transform-origin: center bottom;
      animation: breathe 3.6s ease-in-out infinite;
    }
    @keyframes breathe { 0%,100%{ transform: translateY(0) scale(1); } 50%{ transform: translateY(-8px) scale(1.012); } }
    .nameplate {
      position:absolute;
      right: 535px;
      bottom: 282px;
      color:#ffb7c5;
      text-shadow: 0 4px 16px rgba(0,0,0,.62);
      font-size: 39px;
      font-weight: 900;
    }
    .speech {
      position:absolute;
      right: 64px;
      bottom: 112px;
      width: 770px;
      min-height: 156px;
      border-radius: 8px;
      padding: 25px 30px;
      background: rgba(8, 10, 13, .74);
      border: 1px solid rgba(255,255,255,.16);
      box-shadow: 0 28px 90px rgba(0,0,0,.48);
      backdrop-filter: blur(12px);
    }
    .speech span { display:block; color:#dbeafe; font-size:17px; font-weight:800; text-transform:uppercase; margin-bottom:10px; }
    .speech strong { display:block; color:#fffdf5; font-size:34px; line-height:1.16; letter-spacing:0; }
    .subline {
      position:absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20px;
      width: min(1500px, calc(100vw - 80px));
      border-radius: 8px;
      background: rgba(0,0,0,.76);
      color:#fff;
      padding: 16px 24px;
      text-align:center;
      font-size: 28px;
      line-height:1.24;
      font-weight:850;
      border: 1px solid rgba(255,255,255,.18);
      box-shadow: 0 20px 60px rgba(0,0,0,.45);
    }
    .side-status {
      position:absolute;
      right: 34px;
      top: 124px;
      width: 774px;
      border-radius: 8px;
      border: 1px solid rgba(103,232,201,.24);
      background: rgba(4,10,12,.76);
      padding: 16px 18px;
      display:grid; gap: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      box-shadow:0 22px 78px rgba(0,0,0,.45);
    }
    .side-status div { display:flex; justify-content:space-between; gap:12px; color:#d1fae5; font-size: 16px; }
    .side-status span { color:#67e8c9; }
  </style>
</head>
<body>
<div class="stage">
  <div class="topbar">
    <div class="brand"><div class="mark">PF</div><div><strong>Hermes PersonaForge</strong><span>live persona-pack experience demo</span></div></div>
    <div class="chips"><span>real EC checkout</span><span>manifest unlock</span><span>Japanese voice</span><span>English subtitles</span></div>
  </div>
  <section class="browser">
    <div class="browserbar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><div class="url" id="url"></div></div>
    <div class="browserbody" id="browserbody"></div>
  </section>
  <section class="side-status" id="statusPanel"></section>
  <section class="prompt"><span>you ask</span><div id="prompt"></div></section>
  <section class="persona"><img id="sprite" /></section>
  <div class="nameplate">七海千秋</div>
  <section class="speech"><span>Nanami replies · Japanese voice</span><strong id="speechText"></strong></section>
  <div class="subline" id="subtitle"></div>
</div>
<script>
const scenes = ${JSON.stringify(scenes)};
const sprites = ${JSON.stringify(spriteUris)};
const start = performance.now();
const duration = ${durationSeconds};

function productBody() {
  return '<div class="store-head"><div class="logo">Qiance EC</div><div class="nav"><span>Home</span><span>New products</span><span>Account</span><span>Cart</span></div></div><div class="product-layout"><div class="product-cover"><div class="cover-icon">PF</div></div><div class="product-copy"><span>Digital product</span><h2>AI Companion Persona Pack</h2><p>A paid persona pack: Hermes verifies payment, unlocks a Shinsekai-compatible manifest, and starts a voice-and-vision companion session.</p><div class="price">$1.00</div><button class="buy">Buy pack</button></div></div>';
}
function checkoutBody() {
  return '<div class="store-head"><div class="logo">Checkout</div><div class="nav"><span>Billing</span><span>Payment</span><span>Confirm</span></div></div><h2 style="font-size:38px;margin:14px 0 28px;">Select payment method</h2><div class="checkout-grid"><div class="pay-card"><strong>PayPal</strong><em>available</em></div><div class="pay-card active"><strong>AliPay</strong><em>selected / paid proof source</em></div></div><div class="manifest"><div><span>order</span><strong>AI Companion Persona Pack</strong></div><div><span>total</span><strong>$1.00</strong></div><div><span>callback</span><strong>verified, redacted</strong></div></div>';
}
function runtimeBody() {
  return '<div class="store-head"><div class="logo">Shinsekai-compatible runtime</div><div class="nav"><span>voice</span><span>vision</span><span>memory</span><span>sprite</span></div></div><div class="runtime-terminal">$ personaforge import qiance-companion-starter.persona-manifest.json<br/>manifest verified: license pf_84f2d6e64e8b19a107<br/>vision context: product page + checkout evidence<br/>sprite route: curious -> surprised -> shy<br/>voice locale: ja-JP<br/>session status: READY</div>';
}
function proofBody() {
  return '<div class="store-head"><div class="logo">Proof pack</div><div class="nav"><span>regenerate</span><span>audit</span><span>safety</span></div></div><div class="proof-list"><article><span>payment_reconciliation.json</span><em>generated</em></article><article><span>persona_margin_gate.json</span><em>generated</em></article><article><span>persona_license_manifest.json</span><em>generated</em></article><article><span>runtime_launch_trace.json</span><em>generated</em></article><article><span>safety_redaction_report.json</span><em>generated</em></article></div>';
}
function readyBody() {
  return '<div class="store-head"><div class="logo">Customer session ready</div><div class="nav"><span>paid</span><span>licensed</span><span>running</span></div></div><div class="product-layout"><div class="product-cover"><div class="cover-icon">OK</div></div><div class="product-copy"><span>Experience unlocked</span><h2>Voice + vision companion is online.</h2><p>The user bought a product. Hermes verified the business operation. The runtime delivers the emotional experience.</p><div class="price">READY</div></div></div>';
}
function bodyFor(mode) {
  if (mode === 'checkout') return checkoutBody();
  if (mode === 'runtime') return runtimeBody();
  if (mode === 'proof') return proofBody();
  if (mode === 'ready') return readyBody();
  return productBody();
}
function urlFor(mode) {
  if (mode === 'checkout') return 'https://ec.xingyipoxiao.cloud/zh/onepagecheckout#opc-payment_method';
  if (mode === 'runtime') return 'personaforge://runtime/qiance-companion-starter';
  if (mode === 'proof') return 'repo://artifacts/proof/persona_audit_ledger.json';
  if (mode === 'ready') return 'personaforge://session/ready';
  return 'https://ec.xingyipoxiao.cloud/zh/ai-companion-persona-pack';
}
function statusFor(scene) {
  const rows = [
    ['manifest', 'qiance-companion-starter'],
    ['scene', scene.mode],
    ['status', scene.status],
    ['asset boundary', 'local sprites and voice are not in Git'],
  ];
  return rows.map(([k,v]) => '<div><span>' + k + '</span><strong>' + v + '</strong></div>').join('');
}
let activeIndex = -1;
function tick() {
  const elapsed = (performance.now() - start) / 1000;
  let index = 0;
  for (let i = 0; i < scenes.length; i++) if (elapsed >= scenes[i].at) index = i;
  const scene = scenes[index];
  if (index !== activeIndex) {
    activeIndex = index;
    document.getElementById('sprite').src = sprites[scene.sprite];
    document.getElementById('url').textContent = urlFor(scene.mode);
    document.getElementById('browserbody').innerHTML = bodyFor(scene.mode);
    document.getElementById('statusPanel').innerHTML = statusFor(scene);
    document.getElementById('prompt').textContent = scene.prompt;
    document.getElementById('subtitle').textContent = scene.subtitle;
    document.getElementById('speechText').textContent = scene.subtitle;
  }
  if (elapsed < duration + 1) requestAnimationFrame(tick);
}
tick();
</script>
</body>
</html>`;
}

async function recordExperienceVideo() {
  assertFile(introVideo, "Intro video");
  Object.values(spriteFiles).forEach((file) => assertFile(path.join(localSpriteDir, file), "Local sprite"));

  const spriteUris = Object.fromEntries(
    Object.entries(spriteFiles).map(([key, file]) => [key, fileDataUri(path.join(localSpriteDir, file))]),
  );
  const html = buildHtml(spriteUris);
  const htmlPath = path.join(scratchDir, "persona-experience.html");
  writeFileSync(htmlPath, html, "utf8");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: segmentDir,
      size: viewport,
    },
  });
  const page = await context.newPage();
  await page.goto(`file://${htmlPath.replaceAll("\\", "/")}`);
  await page.waitForTimeout((durationSeconds + 0.5) * 1000);
  const video = page.video();
  await context.close();
  await browser.close();

  const rawPath = await video.path();
  const webmPath = path.join(segmentDir, "persona-experience.webm");
  if (existsSync(webmPath)) rmSync(webmPath);
  if (existsSync(experienceSilent)) rmSync(experienceSilent);
  await rename(rawPath, webmPath);
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    webmPath,
    "-vf",
    "fps=30,format=yuv420p",
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    experienceSilent,
  ]);
}

function synthesizeLineAudio() {
  for (let i = 0; i < voiceLines.length; i += 1) {
    const textPath = path.join(scratchDir, `line-${String(i + 1).padStart(2, "0")}.ja.txt`);
    const mediaPath = path.join(scratchDir, `line-${String(i + 1).padStart(2, "0")}.mp3`);
    writeFileSync(textPath, `${voiceLines[i].ja}\n`, "utf8");
    runInherit(edgeTts, [
      "--voice",
      "ja-JP-NanamiNeural",
      "--rate=-6%",
      "--file",
      textPath,
      "--write-media",
      mediaPath,
    ]);
  }
}

function buildExperienceAudio() {
  const bgmPath = path.join(audioDir, "hermes-personaforge-live-soft-bed.m4a");
  if (!existsSync(bgmPath)) {
    runInherit(ffmpeg, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=98:sample_rate=48000:duration=${durationSeconds}`,
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=130.81:sample_rate=48000:duration=${durationSeconds}`,
      "-filter_complex",
      "[0:a]volume=0.045,lowpass=f=260[a0];[1:a]volume=0.030,lowpass=f=360[a1];[a0][a1]amix=inputs=2:duration=longest,alimiter=limit=0.08[aout]",
      "-map",
      "[aout]",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      bgmPath,
    ]);
  }

  const inputs = [];
  for (let i = 0; i < voiceLines.length; i += 1) {
    inputs.push("-i", path.join(scratchDir, `line-${String(i + 1).padStart(2, "0")}.mp3`));
  }
  inputs.push("-stream_loop", "-1", "-i", bgmPath);

  const filters = voiceLines
    .map((line, index) => {
      const delay = Math.round(line.start * 1000);
      return `[${index}:a]adelay=${delay}:all=1,apad,atrim=0:${durationSeconds},volume=1.25[v${index}]`;
    })
    .join(";");
  const bgmIndex = voiceLines.length;
  const mixInputs = voiceLines.map((_, index) => `[v${index}]`).join("") + "[bgm]";
  const filter = [
    filters,
    `[${bgmIndex}:a]atrim=0:${durationSeconds},asetpts=PTS-STARTPTS,volume=0.07[bgm]`,
    `${mixInputs}amix=inputs=${voiceLines.length + 1}:duration=longest:dropout_transition=2,alimiter=limit=0.95,aformat=sample_rates=48000:channel_layouts=stereo[aout]`,
  ].join(";");

  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputs,
    "-filter_complex",
    filter,
    "-map",
    "[aout]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    experienceAudio,
  ]);
}

function muxExperienceVideo() {
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    experienceSilent,
    "-i",
    experienceAudio,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    experienceVideo,
  ]);
}

function concatFinalVideo() {
  const introDuration = readDuration(introVideo);
  const experienceDuration = readDuration(experienceVideo);
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    introVideo,
    "-i",
    experienceVideo,
    "-filter_complex",
    "[0:v]scale=1920:1080,fps=30,setsar=1,setpts=PTS-STARTPTS[v0];[1:v]scale=1920:1080,fps=30,setsar=1,setpts=PTS-STARTPTS[v1];[0:a]aresample=48000,asetpts=N/SR/TB[a0];[1:a]aresample=48000,asetpts=N/SR/TB[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]",
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    finalVideo,
  ]);
  const finalDuration = readDuration(finalVideo);
  console.log(`THREE_MINUTE_DEMO: ${finalVideo}`);
  console.log(`intro=${introDuration.toFixed(2)}s experience=${experienceDuration.toFixed(2)}s final=${finalDuration.toFixed(2)}s`);
}

mkdirSync(videoDir, { recursive: true });
mkdirSync(audioDir, { recursive: true });
mkdirSync(segmentDir, { recursive: true });
mkdirSync(scratchDir, { recursive: true });

await recordExperienceVideo();
synthesizeLineAudio();
buildExperienceAudio();
muxExperienceVideo();
concatFinalVideo();
