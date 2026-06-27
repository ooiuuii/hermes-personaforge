import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "videos");
const segmentDir = path.join(outputDir, "segments", "live");
const screenshotDir = path.join(root, "artifacts", "screenshots");
const finalPath = path.join(outputDir, "hermes-personaforge-live-commerce-shinsekai-demo.mp4");

const storeBaseUrl = process.env.PERSONAFORGE_STORE_URL ?? "https://ec.xingyipoxiao.cloud";
const demoEmail = process.env.PERSONAFORGE_DEMO_EMAIL;
const demoPassword = process.env.PERSONAFORGE_DEMO_PASSWORD;
const workbenchUrl = process.env.PERSONAFORGE_WORKBENCH_URL ?? "http://127.0.0.1:5173";
const ffmpeg = process.env.FFMPEG_BIN ?? "ffmpeg";

const shinsekaiCapture = {
  x: Number(process.env.SHINSEKAI_CAPTURE_X ?? "130"),
  y: Number(process.env.SHINSEKAI_CAPTURE_Y ?? "170"),
  width: Number(process.env.SHINSEKAI_CAPTURE_WIDTH ?? "1110"),
  height: Number(process.env.SHINSEKAI_CAPTURE_HEIGHT ?? "590"),
  seconds: Number(process.env.SHINSEKAI_CAPTURE_SECONDS ?? "18"),
};

for (const [name, value] of Object.entries(shinsekaiCapture)) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid Shinsekai capture value ${name}=${value}`);
  }
}

if (!demoEmail || !demoPassword) {
  throw new Error(
    "Set PERSONAFORGE_DEMO_EMAIL and PERSONAFORGE_DEMO_PASSWORD before recording the live commerce segment.",
  );
}

mkdirSync(segmentDir, { recursive: true });
mkdirSync(screenshotDir, { recursive: true });

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

function convertVideo(input, output) {
  run(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-vf",
    "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x05070a,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output,
  ]);
}

async function injectCaption(page) {
  await page.evaluate(() => {
    const caption = document.createElement("div");
    caption.id = "demo-caption";
    caption.style.position = "fixed";
    caption.style.left = "34px";
    caption.style.bottom = "30px";
    caption.style.zIndex = "999999";
    caption.style.maxWidth = "930px";
    caption.style.padding = "18px 24px";
    caption.style.border = "1px solid rgba(75, 190, 255, 0.34)";
    caption.style.borderRadius = "8px";
    caption.style.background = "rgba(5, 8, 12, 0.86)";
    caption.style.boxShadow = "0 24px 80px rgba(0, 0, 0, 0.42)";
    caption.style.backdropFilter = "blur(14px)";
    caption.style.color = "#fffdf5";
    caption.style.fontFamily =
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    caption.style.fontSize = "28px";
    caption.style.fontWeight = "760";
    caption.style.lineHeight = "1.22";
    caption.style.pointerEvents = "none";
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

async function login(page) {
  await page.goto(`${storeBaseUrl}/zh/login`, { waitUntil: "domcontentloaded" });
  await injectCaption(page);
  await setCaption(page, "Real customer account logs in to the Qiance EC site.");
  await page.locator('input[name="Email"]').fill(demoEmail);
  await page.locator('input[name="Password"]').fill(demoPassword);
  await pause(page, 1200);
  await page.locator("button.login-button, input.login-button").click();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await pause(page, 2600);
}

async function clearCart(page) {
  await page.goto(`${storeBaseUrl}/zh/cart`, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 4; i += 1) {
    const removeBoxes = page.locator('input[name="removefromcart"]');
    const count = await removeBoxes.count().catch(() => 0);
    if (count === 0) return;
    for (let index = 0; index < count; index += 1) {
      await removeBoxes.nth(index).check({ force: true }).catch(() => {});
    }
    const update = page.locator('button[name="updatecart"], input[name="updatecart"], .update-cart-button').first();
    if ((await update.count()) === 0) return;
    await update.click();
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await pause(page, 800);
  }
}

async function preflightCartReset() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: true });
  page.setDefaultTimeout(20000);
  await page.goto(`${storeBaseUrl}/zh/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="Email"]').fill(demoEmail);
  await page.locator('input[name="Password"]').fill(demoPassword);
  await page.locator("button.login-button, input.login-button").click();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await clearCart(page);
  await browser.close();
}

async function fillBillingAddress(page) {
  const nextButton = page.locator("#billing-buttons-container .new-address-next-step-button");
  const existingAddressButton = page
    .locator('#billing-buttons-container button[name="save"]:visible, #billing-buttons-container .select-billing-address-button:visible')
    .first();
  const savedAddressSelect = page.locator("#billing-address-select:visible, select[name='billing_address_id']:visible").first();

  if (await savedAddressSelect.isVisible().catch(() => false)) {
    await setCaption(page, "Checkout reuses the saved customer billing address.");
    await pause(page, 1400);
    await existingAddressButton.click();
    await pause(page, 3200);
    return;
  }

  if (!(await nextButton.isVisible().catch(() => false))) return;

  await page.locator("#BillingNewAddress_FirstName").fill("Persona").catch(() => {});
  await page.locator("#BillingNewAddress_LastName").fill("Demo").catch(() => {});
  await page.locator("#BillingNewAddress_Email").fill(demoEmail).catch(() => {});
  await page.locator("#BillingNewAddress_Company").fill("Qiance Demo Customer").catch(() => {});
  await page
    .locator("#BillingNewAddress_CountryId")
    .selectOption({ label: "China" })
    .catch(async () => page.locator("#BillingNewAddress_CountryId").selectOption("44").catch(() => {}));
  await pause(page, 900);
  await page.locator("#BillingNewAddress_StateProvinceId").selectOption("242").catch(() => {});
  await page.locator("#BillingNewAddress_City").fill("Huzhou").catch(() => {});
  await page.locator("#BillingNewAddress_Address1").fill("Demo billing address").catch(() => {});
  await page.locator("#BillingNewAddress_ZipPostalCode").fill("313000").catch(() => {});
  await page.locator("#BillingNewAddress_PhoneNumber").fill("13000000000").catch(() => {});
  await pause(page, 1400);
  await setCaption(page, "Checkout reaches billing: a paid persona pack is a real commerce order, not a mock invoice.");
  await nextButton.click();
  await pause(page, 3200);
}

async function recordPageSegment({ name, action }) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      recordVideo: {
        dir: segmentDir,
        size: { width: 1920, height: 1080 },
      },
    });

  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  let actionError;
  try {
    await action(page);
  } catch (error) {
    actionError = error;
  }
  const video = page.video();
  await context.close();
  await browser.close();

  const rawPath = await video.path();
  const webmPath = path.join(segmentDir, `${name}.webm`);
  const mp4Path = path.join(segmentDir, `${name}.mp4`);
  if (existsSync(webmPath)) rmSync(webmPath);
  if (existsSync(mp4Path)) rmSync(mp4Path);
  await rename(rawPath, webmPath);
  convertVideo(webmPath, mp4Path);
  if (actionError) throw actionError;
  return mp4Path;
}

async function recordCommerceSegment() {
  await preflightCartReset();
  return recordPageSegment({
    name: "01-live-commerce-checkout",
    action: async (page) => {
      await login(page);
      await page.goto(`${storeBaseUrl}/zh/ai-companion-persona-pack`, { waitUntil: "domcontentloaded" });
      await injectCaption(page);
      await setCaption(page, "The live store product is the AI Companion Persona Pack.");
      await pause(page, 3800);
      await page.locator("#add-to-cart-button-2, button.product-box-add-to-cart-button").first().click();
      await pause(page, 1800);
      await page.goto(`${storeBaseUrl}/zh/cart`, { waitUntil: "domcontentloaded" });
      await setCaption(page, "The customer cart shows the paid digital product and checkout total.");
      await pause(page, 3600);
      const terms = page.locator('#termsofservice, input[name="termsofservice"]');
      if (await terms.count()) await terms.first().check({ force: true }).catch(() => {});
      await page.locator("#checkout, button.checkout-button, .checkout-button").first().click();
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await pause(page, 1800);
      await fillBillingAddress(page);
      await page.locator('input[value="Payments.AliPay"]').waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
      await setCaption(page, "The buyer selects AliPay. The recorder stops before making a new charge.");
      await page.locator('input[value="Payments.AliPay"]').check({ force: true }).catch(() => {});
      await page.screenshot({ path: path.join(screenshotDir, "live-checkout-alipay-selected.png"), fullPage: true });
      await pause(page, 7600);
      await setCaption(page, "Once the buyer pays, Hermes reconciles the callback and unlocks the persona manifest.");
      await pause(page, 5200);
    },
  });
}

async function recordWorkbenchSegment() {
  return recordPageSegment({
    name: "02-hermes-proof-workbench",
    action: async (page) => {
      await page.goto(workbenchUrl, { waitUntil: "domcontentloaded" });
      await injectCaption(page);
      await setCaption(page, "Hermes verifies payment, checks margin, unlocks the manifest, and seals proof.");
      await pause(page, 3500);
      await page.getByRole("button", { name: /Run agent/i }).click();
      await pause(page, 1600);
      const tabs = ["Profit Gate", "Download", "Runtime", "Safety", "Proof"];
      for (const tab of tabs) {
        await page.getByRole("tab", { name: new RegExp(tab, "i") }).click();
        if (tab === "Runtime") {
          await setCaption(page, "The manifest starts a Shinsekai-compatible voice and vision runtime.");
        } else if (tab === "Proof") {
          await setCaption(page, "The public repo proves the business flow without shipping local character assets.");
        }
        await pause(page, 3600);
      }
    },
  });
}

function recordShinsekaiSegment() {
  const rawPath = path.join(segmentDir, "03-shinsekai-live-crop.raw.mp4");
  const mp4Path = path.join(segmentDir, "03-shinsekai-live-crop.mp4");
  const vf =
    "fps=30,scale=1760:990:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x05070a,format=yuv420p";

  if (existsSync(rawPath)) rmSync(rawPath);
  if (existsSync(mp4Path)) rmSync(mp4Path);

  run(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "gdigrab",
    "-framerate",
    "30",
    "-offset_x",
    String(Math.round(shinsekaiCapture.x)),
    "-offset_y",
    String(Math.round(shinsekaiCapture.y)),
    "-video_size",
    `${Math.round(shinsekaiCapture.width)}x${Math.round(shinsekaiCapture.height)}`,
    "-i",
    "desktop",
    "-t",
    String(shinsekaiCapture.seconds),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    rawPath,
  ]);

  run(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    rawPath,
    "-vf",
    vf,
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4Path,
  ]);

  return mp4Path;
}

async function recordProofSegment() {
  return recordPageSegment({
    name: "04-proof-close",
    action: async (page) => {
      await page.goto(`${workbenchUrl}/?scene=proof`, { waitUntil: "domcontentloaded" });
      await injectCaption(page);
      await setCaption(page, "The final artifact is reproducible: payment, license, runtime trace, safety, and audit ledger.");
      await pause(page, 8000);
    },
  });
}

const commerce = await recordCommerceSegment();
const workbench = await recordWorkbenchSegment();
const shinsekai = recordShinsekaiSegment();
const proof = await recordProofSegment();

const concatList = path.join(segmentDir, "concat-live.txt");
await writeFile(
  concatList,
  [commerce, workbench, shinsekai, proof].map((file) => `file '${file.replaceAll("\\", "/")}'`).join("\n"),
);

run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", finalPath]);

console.log(`LIVE_DEMO: ${finalPath}`);
