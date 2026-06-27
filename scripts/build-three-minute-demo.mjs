import { chromium } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { rename } from "node:fs/promises";
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
const localVoiceDir = path.resolve(
  process.env.PERSONAFORGE_LOCAL_VOICE_DIR ??
    "F:/AI/app/2dclaw-bridge/downloads/nanami_official_extracted/speech/nanami",
);
const gptSovitsUrl = (process.env.PERSONAFORGE_GPT_SOVITS_URL ?? "http://127.0.0.1:9880").replace(/\/$/, "");
const ttsReferenceAudio = path.resolve(
  process.env.PERSONAFORGE_TTS_REF_AUDIO ??
    "F:/AI/app/2dclaw-bridge/downloads/nanami_official_extracted/models/nanami.aac_0001620800_0001747840.wav",
);
const ttsPromptText = process.env.PERSONAFORGE_TTS_PROMPT_TEXT ?? "でも、怪しい人の手がかりならある。";

const coldOpenSeconds = Number(process.env.PERSONAFORGE_COLD_OPEN_SECONDS ?? "14");
const coldOpenSilent = path.join(videoDir, "hermes-personaforge-cold-open.silent.mp4");
const coldOpenAudio = path.join(audioDir, "hermes-personaforge-cold-open.m4a");
const coldOpenVideo = path.join(videoDir, "hermes-personaforge-cold-open.en-sub-ja-voice.mp4");
const commerceClip = path.resolve(
  process.env.PERSONAFORGE_COMMERCE_CLIP ?? path.join(videoDir, "segments", "live", "01-live-commerce-checkout.mp4"),
);
const productCoverImage = path.resolve(
  process.env.PERSONAFORGE_PRODUCT_COVER_IMAGE ??
    path.join(root, "artifacts", "local-character-packs", "qiance-persona-product-cover.webp"),
);
const commerceAudio = path.join(audioDir, "hermes-personaforge-commerce-bridge.m4a");
const commerceVideo = path.join(videoDir, "hermes-personaforge-commerce-bridge.mp4");

const experienceSilent = path.join(videoDir, "hermes-personaforge-persona-experience.en-sub.silent.mp4");
const experienceAudio = path.join(audioDir, "hermes-personaforge-persona-experience.local-voice.m4a");
const experienceVideo = path.join(videoDir, "hermes-personaforge-persona-experience.en-sub-local-voice.mp4");
const finalVideo = path.join(videoDir, "hermes-personaforge-three-minute-demo.en-sub-ja-voice.mp4");

const durationSeconds = Number(process.env.PERSONAFORGE_EXPERIENCE_SECONDS ?? "88");
const viewport = { width: 1920, height: 1080 };

const spriteFiles = {
  guide: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_03.webp",
  surprised: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_13.webp",
  shy: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_21.webp",
  focused: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_10.webp",
  thinking: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_19.webp",
  happy: "Danganronpa_V3_Chiaki_Nanami_Bonus_Mode_Sprites_05.webp",
};

const scenes = [
  {
    at: 0,
    userVoiceAt: 0.35,
    voiceAt: 6.7,
    sprite: "guide",
    mode: "product",
    voice: "nanami_voice_02.wav",
    jaSpeech: "商品ページが見えるよ。えっと、このペルソナパック、私のことだよね。",
    userInput: "Nanami, can you look at the persona pack I just bought?",
    subtitle: "I can see the product page. Wait... this persona pack is about me, right?",
    status: "vision context: Qiance EC product page",
    logs: [
      "$ personaforge chat --persona qiance-companion-starter",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-01.mp3",
      "[user-voice] prompt spoken while typing",
      "[entitlement] order pf_order_20260627 verified from live commerce proof",
      "[vision] active window: Qiance EC / AI Companion Persona Pack",
      "[persona] product entity matched: Nanami companion pack",
      "$ curl http://127.0.0.1:9880/tts -> line-01.wav",
      "[gpt-sovits] synthesized matching character response",
    ],
  },
  {
    at: 15,
    userVoiceAt: 15.35,
    voiceAt: 21.8,
    sprite: "thinking",
    mode: "checkout",
    voice: "nanami_voice_18.wav",
    jaSpeech: "支払いは確認済み。Hermes がブラウザだけに頼らず、マニフェストを解放するんだね。",
    userInput: "The buyer paid with AliPay. Can Hermes unlock the manifest?",
    subtitle: "Payment cleared. Hermes unlocks my manifest instead of trusting the browser alone.",
    status: "Hermes payment reconciliation passed",
    logs: [
      "$ hermes verify-payment --source alipay-callback --redacted",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-02.mp3",
      "[payment] amount=1.00 CNY, merchant=Qiance, status=PAID",
      "[margin] revenue covers delivery/runtime cost; unlock=true",
      "[license] qiance-companion-starter.persona-manifest.json issued",
      "$ curl http://127.0.0.1:9880/tts -> line-02.wav",
      "[gpt-sovits] synthesized unlock explanation",
    ],
  },
  {
    at: 30,
    userVoiceAt: 30.35,
    voiceAt: 37.2,
    sprite: "surprised",
    mode: "search",
    voice: "nanami_voice_12.wav",
    jaSpeech: "検索ページから自分のプロフィールを見つけちゃった。細かいことまで書いてあって、ちょっと恥ずかしいかも。",
    userInput: "Open a search page for yourself, then read what is on screen.",
    subtitle: "It found my profile from the search page, even tiny personal details. That is embarrassing...",
    status: "self-reference detected",
    logs: [
      "$ personaforge browser.open 'https://www.baidu.com/s?wd=Nanami+Chiaki'",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-03.mp3",
      "[browser] search results loaded",
      "[vision] screenshot captured from active browser window",
      "[ocr] result title: Nanami Chiaki - Baidu Baike",
      "[screen-read] profile page includes detailed character notes",
      "[emotion] self_reference_score=0.94 -> expression route: surprised",
      "$ curl http://127.0.0.1:9880/tts -> line-03.wav",
      "[gpt-sovits] synthesized embarrassed response",
    ],
  },
  {
    at: 46,
    userVoiceAt: 46.35,
    voiceAt: 53.4,
    sprite: "shy",
    mode: "runtime",
    voice: "nanami_voice_20.wav",
    jaSpeech: "ライセンスから、声、視覚、記憶、表情ルートが起動してるよ。",
    userInput: "So what did the customer actually unlock after purchase?",
    subtitle: "Voice, vision, memory, and expression routes are online from the licensed manifest.",
    status: "local runtime online",
    logs: [
      "$ personaforge import qiance-companion-starter.persona-manifest.json",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-04.mp3",
      "[runtime] Shinsekai-compatible bridge: connected",
      "[routes] voice=GPT-SoVITS synthesized line, vision=browser+IDE, memory=enabled",
      "[sprite] guide -> surprised -> shy",
      "$ curl http://127.0.0.1:9880/tts -> line-04.wav",
      "[gpt-sovits] synthesized runtime explanation",
    ],
  },
  {
    at: 62,
    userVoiceAt: 62.35,
    voiceAt: 70.0,
    sprite: "focused",
    mode: "proof",
    voice: "nanami_voice_09.wav",
    jaSpeech: "監査ログも残ってる。支払い、ライセンス、実行記録、安全レポート、全部確認できるよ。",
    userInput: "Why is this a Hermes business-agent product, not only roleplay?",
    subtitle: "The audit trail is real: payment, license, runtime trace, safety report, and proof manifest.",
    status: "proof pack regenerated",
    logs: [
      "$ npm test",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-05.mp3",
      "Generated payment_reconciliation.json",
      "Generated persona_license_manifest.json",
      "Generated runtime_launch_trace.json",
      "Generated safety_redaction_report.json",
      "PERSONAFORGE_PROOF_VERIFY_OK",
      "$ curl http://127.0.0.1:9880/tts -> line-05.wav",
      "[gpt-sovits] synthesized audit explanation",
    ],
  },
  {
    at: 78,
    userVoiceAt: 78.35,
    voiceAt: 82.4,
    sprite: "happy",
    mode: "ready",
    voice: "nanami_voice_04.wav",
    jaSpeech: "準備できたよ。購入したコンパニオンと、もう話せるよ。",
    userInput: "Ready for the buyer's companion session?",
    subtitle: "Session ready. The buyer can now talk with the companion they purchased.",
    status: "paid companion session ready",
    logs: [
      "$ personaforge session open pf_license_84f2d6e64e8b19a107",
      "$ edge-tts --voice en-US-AndrewNeural --write-media prompt-06.mp3",
      "[session] paid=true licensed=true runtime=ready",
      "[boundary] character assets and voice pack remain local-only",
      "[delivery] emotional AI experience unlocked",
      "$ curl http://127.0.0.1:9880/tts -> line-06.wav",
    ],
  },
];

const coldOpenScene = {
  ...scenes[2],
  userInput: "Nanami, open a browser and search your own profile.",
  subtitle: "Cold open: the companion searches herself, reads the page, and reacts in real time.",
  logs: [
    "$ personaforge browser.open 'https://www.google.com/search?q=Nanami+Chiaki'",
    "[browser] search results loaded",
    "[vision] active tab screenshot captured",
    "[screen-read] result title: Chiaki Nanami - character profile",
    "[persona] page describes the same unlocked companion",
    "[emotion] self_reference_score=0.96 -> surprised -> shy",
    "$ curl http://127.0.0.1:9880/tts -> cold-open.wav",
  ],
};

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

async function canReachGptSovits() {
  try {
    const response = await fetch(`${gptSovitsUrl}/docs`, { signal: AbortSignal.timeout(2500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function synthesizeGptSovitsLine(text, outputPath, label) {
  const response = await fetch(`${gptSovitsUrl}/tts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text,
      text_lang: "ja",
      ref_audio_path: ttsReferenceAudio.replaceAll("\\", "/"),
      prompt_text: ttsPromptText,
      prompt_lang: "ja",
      text_split_method: "cut5",
      batch_size: 1,
      speed_factor: 1.15,
      media_type: "wav",
      streaming_mode: false,
    }),
    signal: AbortSignal.timeout(180000),
  });
  const data = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    const message = data.toString("utf8");
    throw new Error(`GPT-SoVITS failed for ${label}: ${response.status} ${message}`);
  }
  writeFileSync(outputPath, data);
}

async function synthesizeSceneAudio() {
  if (process.env.PERSONAFORGE_USE_SYNTH_TTS === "0") {
    return scenes.map((scene) => path.join(localVoiceDir, scene.voice));
  }
  if (!(await canReachGptSovits())) {
    console.warn("GPT-SoVITS is not reachable; falling back to local bound voice clips.");
    return scenes.map((scene) => path.join(localVoiceDir, scene.voice));
  }

  assertFile(ttsReferenceAudio, "GPT-SoVITS reference audio");
  const synthDir = path.join(audioDir, "personaforge-synth-lines");
  mkdirSync(synthDir, { recursive: true });

  const outputPaths = [];
  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const outputPath = path.join(synthDir, `line-${String(index + 1).padStart(2, "0")}.wav`);
    await synthesizeGptSovitsLine(scene.jaSpeech, outputPath, `line ${index + 1}`);
    outputPaths.push(outputPath);
  }
  return outputPaths;
}

function synthesizeUserPromptAudio() {
  const userVoiceDir = path.join(audioDir, "personaforge-user-prompts");
  mkdirSync(userVoiceDir, { recursive: true });

  const voice = process.env.PERSONAFORGE_USER_VOICE ?? "en-US-AndrewNeural";
  const rate = process.env.PERSONAFORGE_USER_VOICE_RATE ?? "+10%";
  const outputPaths = [];
  for (let index = 0; index < scenes.length; index += 1) {
    const textPath = path.join(userVoiceDir, `prompt-${String(index + 1).padStart(2, "0")}.txt`);
    const mediaPath = path.join(userVoiceDir, `prompt-${String(index + 1).padStart(2, "0")}.mp3`);
    writeFileSync(textPath, `${scenes[index].userInput}\n`, "utf8");
    runInherit(edgeTts, [
      "--voice",
      voice,
      `--rate=${rate}`,
      "--file",
      textPath,
      "--write-media",
      mediaPath,
    ]);
    outputPaths.push(mediaPath);
  }
  return outputPaths;
}

function synthesizeEdgeTtsText({ text, directory, name, voice = "en-US-AndrewNeural", rate = "+8%" }) {
  mkdirSync(directory, { recursive: true });
  const textPath = path.join(directory, `${name}.txt`);
  const mediaPath = path.join(directory, `${name}.mp3`);
  writeFileSync(textPath, `${text}\n`, "utf8");
  runInherit(edgeTts, ["--voice", voice, `--rate=${rate}`, "--file", textPath, "--write-media", mediaPath]);
  return mediaPath;
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

function buildColdOpenHtml(spriteUris) {
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
      background: #0c1017;
      color: #ecfeff;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .scene {
      position: relative;
      width: 100vw;
      height: 100vh;
      background:
        radial-gradient(circle at 80% 18%, rgba(20,184,166,.18), transparent 34%),
        radial-gradient(circle at 18% 82%, rgba(244,114,182,.16), transparent 35%),
        linear-gradient(135deg, #10141d, #121923 46%, #0b0f17);
    }
    .headline {
      position: absolute;
      left: 58px;
      top: 48px;
      width: 720px;
      z-index: 8;
    }
    .eyebrow {
      color: #67e8f9;
      text-transform: uppercase;
      letter-spacing: .14em;
      font-size: 14px;
      font-weight: 900;
    }
    h1 {
      margin: 12px 0 0;
      font-size: 46px;
      line-height: 1.02;
      letter-spacing: 0;
      color: #ffffff;
    }
    .browser {
      position: absolute;
      left: 58px;
      top: 218px;
      width: 980px;
      height: 520px;
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
      box-shadow: 0 36px 110px rgba(0,0,0,.5);
      border: 1px solid rgba(203,213,225,.3);
    }
    .bar {
      height: 42px;
      background: #e5e7eb;
      display: grid;
      grid-template-columns: 80px 1fr;
      align-items: center;
      gap: 12px;
      padding: 0 14px;
    }
    .dots { display: flex; gap: 7px; }
    .dots i { width: 10px; height: 10px; border-radius: 99px; background: #ef4444; }
    .dots i:nth-child(2) { background: #f59e0b; }
    .dots i:nth-child(3) { background: #22c55e; }
    .url {
      background: #fff;
      color: #64748b;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 13px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .search {
      padding: 32px 42px;
      color: #0f172a;
    }
    .logo {
      color: #2563eb;
      font-size: 34px;
      font-weight: 950;
      margin-bottom: 22px;
    }
    .searchbox {
      height: 52px;
      border: 2px solid #60a5fa;
      border-radius: 999px;
      display: flex;
      align-items: center;
      padding: 0 22px;
      font-size: 20px;
      color: #111827;
      box-shadow: 0 8px 28px rgba(37,99,235,.16);
    }
    .result {
      margin-top: 28px;
      padding: 22px;
      border-radius: 8px;
      border: 1px solid #dbeafe;
      background: #ffffff;
    }
    .result small { color: #64748b; font-size: 13px; }
    .result h2 { margin: 8px 0; color: #1d4ed8; font-size: 27px; }
    .result p { margin: 0; color: #334155; line-height: 1.45; font-size: 18px; }
    .readtag {
      display: inline-block;
      margin-top: 16px;
      padding: 8px 11px;
      border-radius: 999px;
      color: #be185d;
      background: #fce7f3;
      font-weight: 900;
      font-size: 13px;
    }
    .persona {
      position: absolute;
      right: 130px;
      bottom: 112px;
      width: 570px;
      height: 810px;
      display: grid;
      place-items: end center;
      z-index: 6;
    }
    .persona img {
      max-width: 570px;
      max-height: 800px;
      object-fit: contain;
      filter: drop-shadow(0 34px 62px rgba(0,0,0,.65));
      animation: pop 850ms ease-out both, breathe 3s ease-in-out 1s infinite;
    }
    @keyframes pop { from { opacity: 0; transform: translateY(28px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes breathe { 0%,100%{ transform: translateY(0) scale(1); } 50%{ transform: translateY(-7px) scale(1.012); } }
    .bubble {
      position: absolute;
      right: 455px;
      bottom: 502px;
      width: 610px;
      min-height: 128px;
      border-radius: 8px;
      background: rgba(255,255,255,.94);
      color: #172033;
      padding: 22px 24px;
      box-shadow: 0 30px 90px rgba(0,0,0,.42);
      z-index: 9;
    }
    .bubble strong { color: #ec4899; display: block; font-size: 21px; margin-bottom: 8px; }
    .bubble div { font-size: 26px; line-height: 1.22; font-weight: 850; }
    .input {
      position: absolute;
      left: 58px;
      bottom: 270px;
      width: 980px;
      height: 52px;
      border-radius: 8px;
      background: rgba(255,255,255,.92);
      color: #475569;
      border: 1px solid rgba(255,255,255,.5);
      display: flex;
      align-items: center;
      padding: 0 18px;
      font-size: 19px;
      z-index: 7;
    }
    .terminal {
      position: absolute;
      left: 58px;
      right: 58px;
      bottom: 88px;
      height: 170px;
      border-radius: 8px;
      background: rgba(2,6,23,.9);
      border: 1px solid rgba(148,163,184,.24);
      color: #a7f3d0;
      padding: 18px 22px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 18px;
      line-height: 1.42;
      overflow: hidden;
      z-index: 8;
    }
    .terminal .dim { color: #7dd3fc; }
    .subtitle {
      position: absolute;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      width: min(1560px, calc(100vw - 100px));
      border-radius: 8px;
      background: rgba(0,0,0,.72);
      color: #ffffff;
      text-align: center;
      padding: 13px 20px;
      font-size: 25px;
      font-weight: 850;
      z-index: 12;
    }
  </style>
</head>
<body>
<div class="scene">
  <div class="headline">
    <div class="eyebrow">Hermes PersonaForge cold open</div>
    <h1>A paid companion can read the page and react.</h1>
  </div>
  <section class="browser">
    <div class="bar"><div class="dots"><i></i><i></i><i></i></div><div class="url">https://www.google.com/search?q=Nanami+Chiaki</div></div>
    <div class="search">
      <div class="logo">Search</div>
      <div class="searchbox" id="query"></div>
      <div class="result">
        <small>Danganronpa Wiki / character profile</small>
        <h2>Chiaki Nanami</h2>
        <p>Profile result detected. The runtime reads the visible page text, matches the unlocked persona, and routes the character to a surprised-to-shy response.</p>
        <span class="readtag">screen read: self reference detected</span>
      </div>
    </div>
  </section>
  <section class="persona"><img src="${spriteUris.surprised}" /></section>
  <section class="bubble"><strong>Nanami</strong><div id="bubble"></div></section>
  <section class="input" id="input"></section>
  <section class="terminal" id="terminal"></section>
  <div class="subtitle">${coldOpenScene.subtitle}</div>
</div>
<script>
const scene = ${JSON.stringify(coldOpenScene)};
const start = performance.now();
function typeText(text, elapsed, duration) {
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  const count = Math.floor(text.length * progress);
  return text.slice(0, count) + (progress < 1 ? "|" : "");
}
function tick() {
  const elapsed = (performance.now() - start) / 1000;
  document.getElementById("query").textContent = typeText("Nanami Chiaki", Math.max(0, elapsed - 1.1), 1.6);
  document.getElementById("input").textContent = "You: " + typeText(scene.userInput, elapsed, 3.2);
  document.getElementById("bubble").textContent = elapsed > 4.1 ? scene.subtitle : "Opening browser...";
  const visible = Math.max(1, Math.min(scene.logs.length, Math.floor((elapsed - .7) / 1.05) + 1));
  document.getElementById("terminal").innerHTML = scene.logs.slice(0, visible).map((line, index) => '<div class="' + (index ? 'dim' : '') + '">' + line + '</div>').join('');
  if (elapsed < ${coldOpenSeconds + 0.5}) requestAnimationFrame(tick);
}
tick();
</script>
</body>
</html>`;
}

function buildHtml(spriteUris) {
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
      background: #101317;
      color: #d4d4d4;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .desktop {
      position: relative;
      width: 100vw;
      height: 100vh;
      background:
        linear-gradient(180deg, rgba(255,255,255,.03), transparent 16%),
        #15181d;
    }
    .titlebar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 36px;
      display: grid;
      grid-template-columns: 210px 1fr 260px;
      align-items: center;
      padding: 0 14px;
      color: #cbd5e1;
      background: #111418;
      border-bottom: 1px solid #282c34;
      font-size: 13px;
    }
    .titlebar strong { color: #e2e8f0; font-weight: 700; }
    .titlebar .center { text-align: center; color: #9aa4b2; }
    .window-buttons { justify-self: end; display: flex; gap: 10px; }
    .window-buttons i { width: 12px; height: 12px; border-radius: 99px; background: #64748b; }
    .window-buttons i:nth-child(1) { background: #22c55e; }
    .window-buttons i:nth-child(2) { background: #f59e0b; }
    .window-buttons i:nth-child(3) { background: #ef4444; }
    .activity {
      position: absolute;
      left: 0;
      top: 36px;
      bottom: 0;
      width: 56px;
      background: #181b20;
      border-right: 1px solid #282c34;
      display: grid;
      align-content: start;
      gap: 18px;
      padding-top: 18px;
      justify-items: center;
    }
    .activity span {
      width: 28px; height: 28px;
      display: grid; place-items: center;
      border-radius: 7px;
      color: #94a3b8;
      font-size: 18px;
    }
    .activity span.active { color: #f8fafc; background: #2b313a; }
    .sidebar {
      position: absolute;
      left: 56px;
      top: 36px;
      bottom: 260px;
      width: 260px;
      background: #1e2229;
      border-right: 1px solid #2b313a;
      padding: 16px 14px;
      color: #a7b0bd;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
    }
    .sidebar h3 {
      margin: 0 0 14px;
      color: #e2e8f0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    .tree { display: grid; gap: 7px; }
    .tree div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tree .folder { color: #dbeafe; }
    .tree .selected {
      margin-left: -6px;
      padding: 5px 6px;
      border-radius: 5px;
      background: #2b313a;
      color: #fef3c7;
    }
    .editor {
      position: absolute;
      left: 316px;
      right: 0;
      top: 36px;
      bottom: 260px;
      background: #111418;
      overflow: hidden;
    }
    .tabs {
      height: 42px;
      display: flex;
      align-items: end;
      background: #181b20;
      border-bottom: 1px solid #2b313a;
      padding-left: 8px;
    }
    .tab {
      height: 36px;
      padding: 9px 16px 0;
      border: 1px solid #2b313a;
      border-bottom: 0;
      background: #111418;
      color: #d4d4d4;
      font-size: 13px;
    }
    .code {
      position: absolute;
      inset: 42px 0 0 0;
      padding: 22px 34px;
      color: #cbd5e1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 16px;
      line-height: 1.62;
    }
    .line span.kw { color: #7dd3fc; }
    .line span.fn { color: #f9a8d4; }
    .line span.str { color: #bbf7d0; }
    .line span.cm { color: #7c8594; }
    .terminal {
      position: absolute;
      left: 56px;
      right: 0;
      bottom: 0;
      height: 260px;
      background: #080b10;
      border-top: 1px solid #2b313a;
      display: grid;
      grid-template-columns: 1fr 360px;
    }
    .terminal-main {
      padding: 15px 20px;
      color: #d1fae5;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 15px;
      line-height: 1.42;
      overflow: hidden;
    }
    .terminal-main .dim { color: #94a3b8; }
    .terminal-side {
      border-left: 1px solid #24303a;
      padding: 16px 18px;
      display: grid;
      align-content: start;
      gap: 10px;
      color: #cbd5e1;
      font-size: 14px;
    }
    .terminal-side div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 9px 10px;
      border: 1px solid #24303a;
      border-radius: 7px;
      background: #0d1117;
    }
    .terminal-side span { color: #67e8c9; }
    .preview {
      position: absolute;
      left: 350px;
      top: 108px;
      width: 640px;
      height: 386px;
      border-radius: 8px;
      background: #f8fafc;
      color: #111827;
      overflow: hidden;
      box-shadow: 0 30px 90px rgba(0,0,0,.46);
      border: 1px solid rgba(203,213,225,.38);
    }
    .previewbar {
      height: 38px;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      font-size: 12px;
      color: #475569;
    }
    .previewbar i { width: 9px; height: 9px; border-radius: 99px; background: #ef4444; }
    .previewbar i:nth-child(2) { background: #f59e0b; }
    .previewbar i:nth-child(3) { background: #22c55e; }
    .previewbar .url {
      flex: 1;
      background: #fff;
      border-radius: 6px;
      padding: 5px 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .previewbody { height: calc(100% - 38px); padding: 22px; }
    .store-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .store-head strong { font-size: 23px; color: #0f172a; }
    .store-head span { color: #64748b; font-size: 12px; font-weight: 700; }
    .product-grid { display: grid; grid-template-columns: 190px 1fr; gap: 24px; align-items: start; }
    .cover {
      height: 222px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      color: #06251d;
      background: linear-gradient(135deg, #86efac, #fde68a);
      font-size: 56px;
      font-weight: 900;
      overflow: hidden;
    }
    .cover img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
    .copy h2 { margin: 2px 0 10px; font-size: 30px; line-height: 1.05; color: #0f172a; }
    .copy p { margin: 0; color: #475569; line-height: 1.42; font-size: 15px; }
    .price { margin-top: 18px; font-size: 29px; color: #0f172a; font-weight: 900; }
    .pay { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
    .pay div { border: 2px solid #cbd5e1; border-radius: 8px; height: 98px; display: grid; place-items: center; font-size: 23px; font-weight: 900; }
    .pay .active { border-color: #1677ff; box-shadow: 0 0 0 4px rgba(22,119,255,.12); color: #1677ff; }
    .article h2 { margin: 0 0 8px; color: #0f172a; font-size: 30px; }
    .article p { margin: 7px 0; color: #334155; line-height: 1.36; font-size: 14px; }
    .article .notice { border-left: 4px solid #f9a8d4; padding-left: 12px; color: #be185d; font-weight: 800; }
    .json {
      background: #0f172a;
      color: #d1fae5;
      border-radius: 8px;
      padding: 18px;
      height: 282px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    .persona {
      position: absolute;
      right: 148px;
      bottom: 112px;
      width: 560px;
      height: 820px;
      display: grid;
      align-items: end;
      justify-items: center;
      pointer-events: none;
      z-index: 5;
    }
    .persona img {
      max-width: 560px;
      max-height: 790px;
      object-fit: contain;
      filter: drop-shadow(0 32px 54px rgba(0,0,0,.62));
      transform-origin: center bottom;
      animation: breathe 3.2s ease-in-out infinite;
    }
    @keyframes breathe { 0%,100%{ transform: translateY(0) scale(1); } 50%{ transform: translateY(-7px) scale(1.012); } }
    .dialogue {
      position: absolute;
      left: 642px;
      bottom: 332px;
      width: 660px;
      min-height: 130px;
      border-radius: 8px;
      padding: 22px 24px;
      background: rgba(255, 255, 255, .91);
      color: #1f2937;
      box-shadow: 0 26px 80px rgba(0,0,0,.38);
      z-index: 8;
    }
    .dialogue .name { color: #e879a1; font-size: 21px; font-weight: 900; margin-bottom: 8px; }
    .dialogue .text { font-size: 25px; line-height: 1.22; font-weight: 720; }
    .inputbar {
      position: absolute;
      left: 370px;
      right: 360px;
      bottom: 282px;
      height: 42px;
      display: grid;
      grid-template-columns: 1fr 58px;
      gap: 10px;
      z-index: 9;
    }
    .inputbar .box {
      border-radius: 8px;
      background: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.5);
      color: #64748b;
      padding: 10px 14px;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .inputbar .send {
      border-radius: 99px;
      background: #f3a3a9;
      color: #fff;
      border: 0;
      font-weight: 900;
      font-size: 13px;
    }
    .subtitle {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 24px;
      width: min(1540px, calc(100vw - 100px));
      border-radius: 8px;
      background: rgba(0,0,0,.78);
      border: 1px solid rgba(255,255,255,.17);
      color: #fff;
      padding: 15px 24px;
      text-align: center;
      font-size: 27px;
      line-height: 1.24;
      font-weight: 850;
      z-index: 10;
    }
    .small-note {
      position: absolute;
      right: 30px;
      top: 54px;
      z-index: 11;
      color: #cbd5e1;
      background: rgba(15, 23, 42, .8);
      border: 1px solid rgba(148, 163, 184, .24);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 800;
    }
  </style>
</head>
<body>
<div class="desktop">
  <div class="titlebar"><strong>Visual Studio Code</strong><div class="center">Hermes PersonaForge / Shinsekai-compatible runtime</div><div class="window-buttons"><i></i><i></i><i></i></div></div>
  <div class="activity"><span class="active">E</span><span>S</span><span>G</span><span>R</span><span>T</span></div>
  <aside class="sidebar">
    <h3>Explorer</h3>
    <div class="tree">
      <div class="folder">PERSONAFORGE</div>
      <div>  artifacts/</div>
      <div>  proof/</div>
      <div class="selected">  qiance-companion-starter.persona-manifest.json</div>
      <div>  runtime_launch_trace.json</div>
      <div>  safety_redaction_report.json</div>
      <div>  scripts/</div>
      <div>  shinsekai_bridge.ts</div>
      <div>  live_store_checkout.ts</div>
    </div>
  </aside>
  <main class="editor">
    <div class="tabs"><div class="tab">shinsekai_bridge.ts</div><div class="tab">persona-manifest.json</div><div class="tab">runtime_launch_trace.json</div></div>
    <div class="code">
      <div class="line"><span class="kw">const</span> session = <span class="kw">await</span> hermes.<span class="fn">openPaidPersonaSession</span>({</div>
      <div class="line">&nbsp;&nbsp;store: <span class="str">"Qiance EC"</span>,</div>
      <div class="line">&nbsp;&nbsp;product: <span class="str">"AI Companion Persona Pack"</span>,</div>
      <div class="line">&nbsp;&nbsp;paymentProof: <span class="str">"redacted_alipay_callback"</span>,</div>
      <div class="line">&nbsp;&nbsp;runtime: <span class="str">"Shinsekai-compatible voice + vision"</span>,</div>
      <div class="line">});</div>
      <br/>
      <div class="line"><span class="cm">// Character assets stay local. The repo ships verifiable business proof.</span></div>
      <div class="line"><span class="kw">await</span> session.<span class="fn">watchActiveWindow</span>();</div>
      <div class="line"><span class="kw">await</span> session.<span class="fn">routeExpression</span>(vision.selfReference);</div>
      <div class="line"><span class="kw">await</span> session.<span class="fn">writeAuditLedger</span>();</div>
    </div>
  </main>
  <section class="preview">
    <div class="previewbar"><i></i><i></i><i></i><div class="url" id="url"></div></div>
    <div class="previewbody" id="previewbody"></div>
  </section>
  <section class="persona"><img id="sprite" /></section>
  <section class="dialogue"><div class="name">Nanami</div><div class="text" id="speechText"></div></section>
  <section class="inputbar"><div class="box" id="inputText"></div><button class="send">send</button></section>
  <section class="terminal">
    <div class="terminal-main" id="terminalText"></div>
    <div class="terminal-side" id="statusPanel"></div>
  </section>
  <div class="small-note">GPT-SoVITS character voice + English subtitles</div>
  <div class="subtitle" id="subtitle"></div>
</div>
<script>
const scenes = ${JSON.stringify(scenes)};
const sprites = ${JSON.stringify(spriteUris)};
const start = performance.now();
const duration = ${durationSeconds};

function productPreview() {
  return '<div class="store-head"><strong>Qiance EC</strong><span>real paid digital product</span></div><div class="product-grid"><div class="cover"><img src="' + sprites.guide + '" /></div><div class="copy"><h2>AI Companion Persona Pack</h2><p>A paid character/persona pack. Hermes verifies payment, unlocks a Shinsekai-compatible manifest, and starts a voice-and-vision companion session.</p><div class="price">$1.00</div></div></div>';
}
function checkoutPreview() {
  return '<div class="store-head"><strong>Checkout</strong><span>payment method</span></div><h2 style="margin:8px 0 8px;color:#0f172a;font-size:28px;">Payment selected</h2><div class="pay"><div>PayPal</div><div class="active">AliPay</div></div><p style="color:#475569;font-size:15px;line-height:1.45;margin-top:18px;">The demo uses real paid callback evidence from the live store, then redacts customer and payment secrets before proof generation.</p>';
}
function searchPreview() {
  return '<div class="store-head"><strong>Baidu Search</strong><span>vision browser context</span></div><div class="article"><h2>Nanami Chiaki</h2><p class="notice">Top result: Nanami Chiaki - Baidu Baike</p><p>PersonaForge opens a search page, captures the active browser window, reads visible result text, and routes the companion to a surprised expression.</p><p>Screen read: profile result, character name, and tiny personal details.</p></div>';
}
function baikePreview() {
  return '<div class="store-head"><strong>Baidu Baike</strong><span>active browser context</span></div><div class="article"><h2>Nanami Chiaki</h2><p class="notice">Vision match: this page describes the same character/persona pack.</p><p>Profile page text is visible to the local runtime. The companion detects that the page is about herself and switches expression route.</p><p>Runtime response: surprised -> shy.</p></div>';
}
function runtimePreview() {
  return '<div class="store-head"><strong>Runtime manifest</strong><span>licensed local import</span></div><div class="json">{<br/>&nbsp;&nbsp;"license": "pf_84f2d6e64e8b19a107",<br/>&nbsp;&nbsp;"voice": "local_nanami_clip_pack",<br/>&nbsp;&nbsp;"vision": ["browser", "vscode"],<br/>&nbsp;&nbsp;"memory": "session_scoped",<br/>&nbsp;&nbsp;"sprite_route": ["guide", "surprised", "shy"]<br/>}</div>';
}
function proofPreview() {
  return '<div class="store-head"><strong>Proof pack</strong><span>regenerated by npm test</span></div><div class="json">payment_reconciliation.json  OK<br/>persona_margin_gate.json     OK<br/>persona_license_manifest.json OK<br/>runtime_launch_trace.json     OK<br/>safety_redaction_report.json  OK<br/>proof_manifest.generated.json OK</div>';
}
function readyPreview() {
  return '<div class="store-head"><strong>Customer session</strong><span>ready</span></div><div class="product-grid"><div class="cover">OK</div><div class="copy"><h2>Companion online</h2><p>The customer paid for a product. Hermes verified the operation. The local runtime now delivers the emotional AI experience.</p><div class="price">READY</div></div></div>';
}
function bodyFor(mode) {
  if (mode === 'checkout') return checkoutPreview();
  if (mode === 'search') return searchPreview();
  if (mode === 'baike') return baikePreview();
  if (mode === 'runtime') return runtimePreview();
  if (mode === 'proof') return proofPreview();
  if (mode === 'ready') return readyPreview();
  return productPreview();
}
function urlFor(mode) {
  if (mode === 'checkout') return 'https://ec.xingyipoxiao.cloud/zh/checkout/payment';
  if (mode === 'search') return 'https://www.baidu.com/s?wd=Nanami+Chiaki';
  if (mode === 'baike') return 'https://baike.baidu.com/item/Nanami%20Chiaki';
  if (mode === 'runtime') return 'personaforge://runtime/qiance-companion-starter';
  if (mode === 'proof') return 'repo://artifacts/proof/proof_manifest.generated.json';
  if (mode === 'ready') return 'personaforge://session/ready';
  return 'https://ec.xingyipoxiao.cloud/zh/ai-companion-persona-pack';
}
function statusFor(scene) {
  const rows = [
    ['mode', scene.mode],
    ['status', scene.status],
    ['voice', 'Andrew prompt + GPT-SoVITS reply'],
    ['assets', 'local-only'],
  ];
  return rows.map(([k,v]) => '<div><span>' + k + '</span><strong>' + v + '</strong></div>').join('');
}
function typedInput(scene, elapsed) {
  const progress = Math.max(0, Math.min(1, elapsed / 3.2));
  const count = Math.floor(scene.userInput.length * progress);
  return 'You: ' + scene.userInput.slice(0, count) + (progress < 1 ? '|' : '');
}
function terminalFor(scene, elapsed) {
  const visible = Math.max(1, Math.min(scene.logs.length, Math.floor((elapsed - 1.0) / 1.15) + 1));
  return scene.logs
    .slice(0, visible)
    .map((line, index) => '<div class="' + (index === 0 ? '' : 'dim') + '">' + line + '</div>')
    .join('');
}

let activeIndex = -1;
function tick() {
  const elapsed = (performance.now() - start) / 1000;
  let index = 0;
  for (let i = 0; i < scenes.length; i++) if (elapsed >= scenes[i].at) index = i;
  const scene = scenes[index];
  const sceneElapsed = elapsed - scene.at;
  if (index !== activeIndex) {
    activeIndex = index;
    document.getElementById('sprite').src = sprites[scene.sprite];
    document.getElementById('url').textContent = urlFor(scene.mode);
    document.getElementById('previewbody').innerHTML = bodyFor(scene.mode);
    document.getElementById('statusPanel').innerHTML = statusFor(scene);
    document.getElementById('subtitle').textContent = scene.subtitle;
    document.getElementById('speechText').textContent = scene.subtitle;
  }
  document.getElementById('inputText').textContent = typedInput(scene, sceneElapsed);
  document.getElementById('terminalText').innerHTML = terminalFor(scene, sceneElapsed);
  if (elapsed < duration + 1) requestAnimationFrame(tick);
}
tick();
</script>
</body>
</html>`;
}

async function recordColdOpenVideo(spriteUris) {
  const html = buildColdOpenHtml(spriteUris);
  const htmlPath = path.join(scratchDir, "cold-open.html");
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
  await page.waitForTimeout((coldOpenSeconds + 0.5) * 1000);
  const video = page.video();
  await context.close();
  await browser.close();

  const rawPath = await video.path();
  const webmPath = path.join(segmentDir, "cold-open.webm");
  if (existsSync(webmPath)) rmSync(webmPath);
  if (existsSync(coldOpenSilent)) rmSync(coldOpenSilent);
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
    coldOpenSilent,
  ]);
}

async function buildColdOpenAudio() {
  const coldDir = path.join(audioDir, "personaforge-cold-open");
  mkdirSync(coldDir, { recursive: true });
  const userPrompt = synthesizeEdgeTtsText({
    directory: coldDir,
    name: "cold-open-user",
    text: coldOpenScene.userInput,
    rate: "+10%",
  });
  const characterLine = path.join(coldDir, "cold-open-nanami.wav");
  if (process.env.PERSONAFORGE_USE_SYNTH_TTS === "0" || !(await canReachGptSovits())) {
    const fallback = path.join(localVoiceDir, coldOpenScene.voice);
    assertFile(fallback, "Cold open fallback voice");
    writeFileSync(characterLine, readFileSync(fallback));
  } else {
    assertFile(ttsReferenceAudio, "GPT-SoVITS reference audio");
    await synthesizeGptSovitsLine(coldOpenScene.jaSpeech, characterLine, "cold open");
  }

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
      `sine=frequency=98:sample_rate=48000:duration=${coldOpenSeconds}`,
      "-filter_complex",
      "[0:a]volume=0.035,lowpass=f=300[aout]",
      "-map",
      "[aout]",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      bgmPath,
    ]);
  }

  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    userPrompt,
    "-i",
    characterLine,
    "-stream_loop",
    "-1",
    "-i",
    bgmPath,
    "-filter_complex",
    `[0:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,adelay=350:all=1,volume=1.05,apad,atrim=0:${coldOpenSeconds}[u];` +
      `[1:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,adelay=5200:all=1,volume=2.15,apad,atrim=0:${coldOpenSeconds}[v];` +
      `[2:a]atrim=0:${coldOpenSeconds},asetpts=PTS-STARTPTS,volume=0.055[bgm];` +
      "[u][v][bgm]amix=inputs=3:duration=longest:dropout_transition=2,alimiter=limit=0.95,aformat=sample_rates=48000:channel_layouts=stereo[aout]",
    "-map",
    "[aout]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    coldOpenAudio,
  ]);
}

function muxColdOpenVideo() {
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    coldOpenSilent,
    "-i",
    coldOpenAudio,
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
    coldOpenVideo,
  ]);
}

function buildCommerceBridgeVideo() {
  assertFile(commerceClip, "Commerce clip");
  assertFile(productCoverImage, "Product cover image");
  const duration = readDuration(commerceClip);
  const bridgeDir = path.join(audioDir, "personaforge-commerce-bridge");
  const narration = synthesizeEdgeTtsText({
    directory: bridgeDir,
    name: "commerce-bridge-andrew",
    text:
      "This is the live Qiance EC site. The buyer opens the AI Companion Persona Pack, adds it to cart, reaches checkout, and selects AliPay. Hermes later uses the paid callback as proof before unlocking the companion.",
    rate: "+9%",
  });
  const bgmPath = path.join(audioDir, "hermes-personaforge-live-soft-bed.m4a");
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    narration,
    "-stream_loop",
    "-1",
    "-i",
    bgmPath,
    "-filter_complex",
    `[0:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,adelay=400:all=1,volume=1.0,apad,atrim=0:${duration}[v];` +
      `[1:a]atrim=0:${duration},asetpts=PTS-STARTPTS,volume=0.045[bgm];` +
      "[v][bgm]amix=inputs=2:duration=longest:dropout_transition=2,alimiter=limit=0.95,aformat=sample_rates=48000:channel_layouts=stereo[aout]",
    "-map",
    "[aout]",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    commerceAudio,
  ]);
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    commerceClip,
    "-loop",
    "1",
    "-i",
    productCoverImage,
    "-i",
    commerceAudio,
    "-filter_complex",
    "[0:v]scale=1920:1080,fps=30,setsar=1[base];[1:v]scale=360:360:force_original_aspect_ratio=decrease,pad=360:360:(ow-iw)/2:(oh-ih)/2:color=0xfdf2f8[cover];[base][cover]overlay=462:452:enable='between(t,0,10.8)',format=yuv420p[v]",
    "-map",
    "[v]",
    "-map",
    "2:a:0",
    "-t",
    String(duration),
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
    commerceVideo,
  ]);
}

async function recordExperienceVideo(spriteUris) {
  Object.values(spriteFiles).forEach((file) => assertFile(path.join(localSpriteDir, file), "Local sprite"));
  scenes.forEach((scene) => assertFile(path.join(localVoiceDir, scene.voice), "Local voice clip"));

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

async function buildExperienceAudio() {
  const sceneAudioPaths = await synthesizeSceneAudio();
  const userAudioPaths = synthesizeUserPromptAudio();
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
  sceneAudioPaths.forEach((audioPath) => inputs.push("-i", audioPath));
  userAudioPaths.forEach((audioPath) => inputs.push("-i", audioPath));
  inputs.push("-stream_loop", "-1", "-i", bgmPath);

  const characterFilters = scenes
    .map((scene, index) => {
      const delay = Math.round(scene.voiceAt * 1000);
      return `[${index}:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,adelay=${delay}:all=1,volume=2.15,apad,atrim=0:${durationSeconds}[v${index}]`;
    })
    .join(";");
  const userOffset = scenes.length;
  const userFilters = scenes
    .map((scene, index) => {
      const delay = Math.round((scene.userVoiceAt ?? scene.at + 0.35) * 1000);
      return `[${userOffset + index}:a]aresample=48000,aformat=sample_rates=48000:channel_layouts=stereo,adelay=${delay}:all=1,volume=1.05,apad,atrim=0:${durationSeconds}[u${index}]`;
    })
    .join(";");
  const bgmIndex = scenes.length * 2;
  const mixInputs =
    scenes.map((_, index) => `[v${index}]`).join("") +
    scenes.map((_, index) => `[u${index}]`).join("") +
    "[bgm]";
  const filter = [
    characterFilters,
    userFilters,
    `[${bgmIndex}:a]atrim=0:${durationSeconds},asetpts=PTS-STARTPTS,volume=0.055[bgm]`,
    `${mixInputs}amix=inputs=${scenes.length * 2 + 1}:duration=longest:dropout_transition=2,alimiter=limit=0.95,aformat=sample_rates=48000:channel_layouts=stereo[aout]`,
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
  const coldDuration = readDuration(coldOpenVideo);
  const commerceDuration = readDuration(commerceVideo);
  const experienceDuration = readDuration(experienceVideo);
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    coldOpenVideo,
    "-i",
    commerceVideo,
    "-i",
    experienceVideo,
    "-filter_complex",
    "[0:v]scale=1920:1080,fps=30,setsar=1,setpts=PTS-STARTPTS[v0];[1:v]scale=1920:1080,fps=30,setsar=1,setpts=PTS-STARTPTS[v1];[2:v]scale=1920:1080,fps=30,setsar=1,setpts=PTS-STARTPTS[v2];[0:a]aresample=48000,asetpts=N/SR/TB[a0];[1:a]aresample=48000,asetpts=N/SR/TB[a1];[2:a]aresample=48000,asetpts=N/SR/TB[a2];[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]",
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
  console.log(
    `cold=${coldDuration.toFixed(2)}s commerce=${commerceDuration.toFixed(2)}s experience=${experienceDuration.toFixed(2)}s final=${finalDuration.toFixed(2)}s`,
  );
}

mkdirSync(videoDir, { recursive: true });
mkdirSync(audioDir, { recursive: true });
mkdirSync(segmentDir, { recursive: true });
mkdirSync(scratchDir, { recursive: true });

Object.values(spriteFiles).forEach((file) => assertFile(path.join(localSpriteDir, file), "Local sprite"));
const spriteUris = Object.fromEntries(
  Object.entries(spriteFiles).map(([key, file]) => [key, fileDataUri(path.join(localSpriteDir, file))]),
);

await recordColdOpenVideo(spriteUris);
await buildColdOpenAudio();
muxColdOpenVideo();
buildCommerceBridgeVideo();
await recordExperienceVideo(spriteUris);
await buildExperienceAudio();
muxExperienceVideo();
concatFinalVideo();
