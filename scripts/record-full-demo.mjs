import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "videos");
const baseUrl = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:5173";
const lang = process.env.DEMO_LANG ?? "en";

if (!["en", "zh"].includes(lang)) {
  throw new Error(`Unsupported DEMO_LANG="${lang}". Use "en" or "zh".`);
}

const segmentDir = path.join(outputDir, "segments", lang);
mkdirSync(segmentDir, { recursive: true });

const finalName =
  lang === "en" ? "hermes-personaforge-full-demo.mp4" : `hermes-personaforge-full-demo.${lang}.mp4`;
const finalPath = path.join(outputDir, finalName);

const englishCaptions = {
  intro:
    "Hermes PersonaForge is the fourth standalone submission: a customer buys an AI Companion Persona Pack from our EC site.",
  introFlow:
    "Hermes verifies Alipay paid proof, unlocks a persona manifest download, imports it into runtime, and seals proof.",
  runtime:
    "After download, the manifest starts a Shinsekai-compatible voice-and-vision runtime.",
  runtimeProof:
    "The character sees its own product and order page, reacts surprised, then switches to a shy voice and sprite route.",
  appPayment:
    "In the workbench, the customer checkout, Alipay paid proof, and gated manifest download are visible in one flow.",
  appGate:
    "Hermes asks the business question before delivery: revenue, delivery cost, support reserve, gross profit, and margin.",
  appLicense:
    "After the margin gate, Hermes unlocks a downloadable persona manifest with voice, vision, memory, and emotion routes.",
  appRuntime:
    "The runtime imports the manifest, reads the buyer's product and order page, and reacts with a surprised-to-shy response.",
  appSafety:
    "The safety sidecar keeps local character assets and voice checkpoints out of Git, while preserving proof for judges.",
  appProof:
    "Finally, npm test regenerates the proof pack and verifies payment, margin, license, runtime, safety, and ledger.",
  compare:
    "This is not a reskin of the previous submissions. It is a new business surface in the same Hermes story.",
  proof:
    "The judging claim is reproducible: payment evidence, persona license, runtime trace, safety report, and audit ledger.",
};

const captions = {
  en: englishCaptions,
  zh: englishCaptions,
};

function caption(key) {
  return captions[lang][key];
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function injectCaption(page) {
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.id = "demo-caption";
    caption.textContent = "";
    caption.style.position = "fixed";
    caption.style.right = "34px";
    caption.style.bottom = "30px";
    caption.style.zIndex = "9999";
    caption.style.maxWidth = "780px";
    caption.style.width = "min(780px, calc(100vw - 68px))";
    caption.style.minHeight = "58px";
    caption.style.display = "flex";
    caption.style.alignItems = "center";
    caption.style.justifyContent = "center";
    caption.style.padding = "15px 24px";
    caption.style.border = "1px solid rgba(92, 214, 182, 0.36)";
    caption.style.borderRadius = "8px";
    caption.style.background = "rgba(5, 9, 12, 0.84)";
    caption.style.boxShadow = "0 24px 90px rgba(0, 0, 0, 0.48), 0 0 34px rgba(92, 214, 182, 0.18)";
    caption.style.backdropFilter = "blur(16px)";
    caption.style.color = "#fffaf0";
    caption.style.fontFamily =
      "'Microsoft YaHei', 'Noto Sans SC', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    caption.style.fontSize = "28px";
    caption.style.fontWeight = "780";
    caption.style.lineHeight = "1.28";
    caption.style.textAlign = "center";
    document.body.appendChild(caption);
  });
}

async function setCaption(page, text) {
  await page.evaluate((value) => {
    const caption = document.getElementById("demo-caption");
    if (caption) caption.textContent = value;
  }, text);
}

async function pause(page, ms) {
  await page.waitForTimeout(ms);
}

function convertToMp4(input, output) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-vf",
      "fps=30,format=yuv420p",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
}

async function recordSegment({ name, url, holdAfterActionMs, action }) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: segmentDir,
      size: { width: 1920, height: 1080 },
    },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await injectCaption(page);
  if (action) await action(page);
  await page.waitForTimeout(holdAfterActionMs);
  const video = page.video();
  await context.close();
  const rawPath = await video.path();
  const webmPath = path.join(segmentDir, `${name}.webm`);
  const mp4Path = path.join(segmentDir, `${name}.mp4`);
  if (existsSync(webmPath)) rmSync(webmPath);
  if (existsSync(mp4Path)) rmSync(mp4Path);
  await rename(rawPath, webmPath);
  convertToMp4(webmPath, mp4Path);
  return mp4Path;
}

async function openStage(page, label) {
  await page.getByRole("tab", { name: new RegExp(label, "i") }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
}

const intro = await recordSegment({
  name: "01-intro",
  url: `${baseUrl}/?scene=intro`,
  holdAfterActionMs: 2600,
  action: async (page) => {
    await setCaption(page, caption("intro"));
    await pause(page, 4200);
    await setCaption(page, caption("introFlow"));
  },
});

const runtime = await recordSegment({
  name: "02-runtime",
  url: `${baseUrl}/?scene=runtime`,
  holdAfterActionMs: 2600,
  action: async (page) => {
    await setCaption(page, caption("runtime"));
    await pause(page, 4800);
    await setCaption(page, caption("runtimeProof"));
  },
});

const app = await recordSegment({
  name: "03-workbench",
  url: `${baseUrl}/`,
  holdAfterActionMs: 3000,
  action: async (page) => {
    await setCaption(page, caption("appPayment"));
    await pause(page, 3600);
    await page.getByRole("button", { name: /Run agent/i }).click();
    await pause(page, 900);
    await openStage(page, "Profit Gate");
    await setCaption(page, caption("appGate"));
    await pause(page, 5200);
    await openStage(page, "Download");
    await setCaption(page, caption("appLicense"));
    await pause(page, 5200);
    await openStage(page, "Runtime");
    await setCaption(page, caption("appRuntime"));
    await pause(page, 5600);
    await openStage(page, "Safety");
    await setCaption(page, caption("appSafety"));
    await pause(page, 5200);
    await openStage(page, "Proof");
    await setCaption(page, caption("appProof"));
  },
});

const compare = await recordSegment({
  name: "04-compare",
  url: `${baseUrl}/?scene=compare`,
  holdAfterActionMs: 6400,
  action: async (page) => {
    await setCaption(page, caption("compare"));
  },
});

const proof = await recordSegment({
  name: "05-proof",
  url: `${baseUrl}/?scene=proof`,
  holdAfterActionMs: 6400,
  action: async (page) => {
    await setCaption(page, caption("proof"));
  },
});

await browser.close();

const concatList = path.join(segmentDir, "concat.txt");
await writeFile(
  concatList,
  [intro, runtime, app, compare, proof].map((file) => `file '${file.replaceAll("\\", "/")}'`).join("\n"),
);

execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", finalPath], {
  stdio: "inherit",
});

console.log(`FULL_DEMO: ${finalPath}`);
