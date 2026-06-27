import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_BIN ?? "ffmpeg";
const ffprobe = process.env.FFPROBE_BIN ?? "ffprobe";

const input = resolve(
  process.env.SOFT_BGM_INPUT ??
    join(root, "artifacts", "videos", "hermes-personaforge-full-demo.mp4")
);
const audio = resolve(
  process.env.SOFT_BGM_AUDIO ??
    join(root, "artifacts", "audio", "hermes-personaforge-soft-launch-bed.m4a")
);
const output = resolve(
  process.env.SOFT_BGM_OUTPUT ??
    join(root, "artifacts", "videos", "hermes-personaforge-full-demo.en.soft-bgm.mp4")
);
const finalVolume = Number(process.env.SOFT_BGM_VOLUME ?? "0.32");

if (!existsSync(input)) {
  throw new Error(`Input video not found: ${input}`);
}

if (!Number.isFinite(finalVolume) || finalVolume <= 0 || finalVolume > 1) {
  throw new Error("SOFT_BGM_VOLUME must be a number between 0 and 1.");
}

mkdirSync(dirname(audio), { recursive: true });
mkdirSync(dirname(output), { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(`${command} failed${stderr ? `: ${stderr}` : ""}`);
  }

  return result.stdout.trim();
}

function runInherit(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`);
  }
}

function formatSeconds(value) {
  return value.toFixed(3).replace(/\.?0+$/, "");
}

const durationText = run(ffprobe, [
  "-v",
  "error",
  "-show_entries",
  "format=duration",
  "-of",
  "default=noprint_wrappers=1:nokey=1",
  input
]);
const duration = Number(durationText);

if (!Number.isFinite(duration) || duration <= 0) {
  throw new Error(`Could not read a valid duration from ${input}`);
}

const durationArg = formatSeconds(duration);
const fadeDuration = Math.min(5, Math.max(1.5, duration * 0.04));
const fadeArg = formatSeconds(fadeDuration);
const fadeOutStart = formatSeconds(Math.max(0, duration - fadeDuration));

const bedFilter = [
  "[0:a]volume=0.110,lowpass=f=280[a0]",
  "[1:a]volume=0.075,lowpass=f=360[a1]",
  "[2:a]volume=0.040,lowpass=f=460[a2]",
  "[3:a]volume=0.012,lowpass=f=560[a3]",
  `[a0][a1][a2][a3]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.09,afade=t=in:st=0:d=${fadeArg},afade=t=out:st=${fadeOutStart}:d=${fadeArg},volume=${finalVolume}[bgm]`
].join(";");

runInherit(ffmpeg, [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-f",
  "lavfi",
  "-i",
  `sine=frequency=98.00:sample_rate=48000:duration=${durationArg}`,
  "-f",
  "lavfi",
  "-i",
  `sine=frequency=130.81:sample_rate=48000:duration=${durationArg}`,
  "-f",
  "lavfi",
  "-i",
  `sine=frequency=196.00:sample_rate=48000:duration=${durationArg}`,
  "-f",
  "lavfi",
  "-i",
  `sine=frequency=261.63:sample_rate=48000:duration=${durationArg}`,
  "-filter_complex",
  bedFilter,
  "-map",
  "[bgm]",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  audio
]);

const audioStreams = run(ffprobe, [
  "-v",
  "error",
  "-select_streams",
  "a",
  "-show_entries",
  "stream=index",
  "-of",
  "csv=p=0",
  input
]);

if (audioStreams.length > 0) {
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-i",
    audio,
    "-filter_complex",
    "[0:a]volume=1.0[src];[1:a]volume=1.0[bed];[src][bed]amix=inputs=2:duration=first:dropout_transition=2[aout]",
    "-map",
    "0:v:0",
    "-map",
    "[aout]",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    output
  ]);
} else {
  runInherit(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-i",
    audio,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    output
  ]);
}

console.log(`Soft BGM mixed:
input:  ${input}
audio:  ${audio}
output: ${output}
duration: ${duration.toFixed(2)}s
volume: ${finalVolume}`);
