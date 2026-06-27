import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_BIN ?? "ffmpeg";

const input = resolve(
  process.env.NAS_VOICE_INPUT ??
    join(root, "artifacts", "videos", "hermes-personaforge-live-commerce-shinsekai-demo.mp4"),
);
const output = resolve(
  process.env.NAS_VOICE_OUTPUT ??
    join(root, "artifacts", "videos", "hermes-personaforge-live-commerce-shinsekai-demo.en.andrew-nas-bgm.mp4"),
);
const textFile = resolve(
  process.env.NAS_VOICE_TEXT ??
    join(root, "artifacts", "audio", "hermes-personaforge-live-voiceover.andrew.txt"),
);
const bgmSource = resolve(
  process.env.NAS_BGM_SOURCE ?? join(root, "artifacts", "audio", "hermes-personaforge-live-soft-bed.m4a"),
);

const defaultVoiceover = [
  "Hermes PersonaForge is the fourth standalone submission in the same Hermes business agent story.",
  "This version starts with the real customer surface: a customer logs in to the Qiance EC site and opens the AI Companion Persona Pack.",
  "The buyer reaches checkout and selects AliPay. The recording stops before making a new charge.",
  "The proof pack uses paid callback evidence from the live store.",
  "",
  "After payment, Hermes treats the order as an entitlement source.",
  "It reconciles payment, checks delivery margin, unlocks a persona manifest, and records the license.",
  "",
  "Then the manifest opens a Shinsekai compatible runtime.",
  "The character window is real on this machine, using the installed local persona assets.",
  "The public repository does not ship private character packs, voice checkpoints, or payment secrets.",
  "",
  "It ships the business proof instead: payment reconciliation, margin gate, license manifest, runtime trace, safety report, audit ledger, and proof manifest.",
  "PersonaForge shows that Hermes can sell emotional AI experiences, not only productivity tools."
].join("\n");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`);
  }
}

if (!existsSync(input)) {
  throw new Error(`Input video not found: ${input}`);
}

mkdirSync(dirname(textFile), { recursive: true });
mkdirSync(dirname(output), { recursive: true });
mkdirSync(dirname(bgmSource), { recursive: true });

const resetVoiceText = process.env.RESET_VOICE_TEXT === "1";

if (!existsSync(textFile) || resetVoiceText) {
  writeFileSync(textFile, `${defaultVoiceover}\n`, "utf8");
}

if (!existsSync(bgmSource)) {
  run(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=98:sample_rate=48000:duration=180",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=130.81:sample_rate=48000:duration=180",
    "-filter_complex",
    "[0:a]volume=0.06,lowpass=f=260[a0];[1:a]volume=0.035,lowpass=f=360[a1];[a0][a1]amix=inputs=2:duration=longest,alimiter=limit=0.08[aout]",
    "-map",
    "[aout]",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    bgmSource,
  ]);
}

process.env.NAS_VOICE_INPUT = input;
process.env.NAS_VOICE_OUTPUT = output;
process.env.NAS_VOICE_TEXT = textFile;
process.env.NAS_BGM_SOURCE = bgmSource;
process.env.NAS_VOICE_RATE ??= "-10%";
process.env.FIT_SHORT_VOICE ??= "0";
process.env.NAS_BGM_VOLUME ??= "0.075";
process.env.NAS_OUTPUT_GAIN ??= "2.0";
delete process.env.RESET_VOICE_TEXT;

await import("./add-nas-voiceover.mjs");
