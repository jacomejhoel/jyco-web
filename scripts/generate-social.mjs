import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const COVER_WIDTH = 1640;
const COVER_HEIGHT = 664;
const POST_SIZE = 1080;
const GOLD = "#C8A84B";
const LIGHT_GOLD = "#E2C97A";
const WHITE = "#FFFFFF";
const GRAY = "#CCCCCC";
const FONT = "Inter, Helvetica, Arial, sans-serif";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coverBackground = path.join(repoRoot, "assets", "social", "facebook-cover-background.png");
const postBackground = path.join(repoRoot, "assets", "social", "toyota-jit-background.png");
const outputDir = path.join(repoRoot, "public", "social");
const coverOutput = path.join(outputDir, "facebook-portada.png");
const postOutput = path.join(outputDir, "post-toyota-jit.png");

function createCoverOverlay() {
  return Buffer.from(`<svg width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="horizontal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.99"/>
        <stop offset="0.48" stop-color="#0D0D0D" stop-opacity="0.91"/>
        <stop offset="0.70" stop-color="#0D0D0D" stop-opacity="0.63"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="0.22"/>
      </linearGradient>
      <linearGradient id="vertical" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.22"/>
        <stop offset="0.50" stop-color="#0D0D0D" stop-opacity="0.05"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="0.46"/>
      </linearGradient>
    </defs>

    <rect width="1640" height="664" fill="url(#horizontal)"/>
    <rect width="1640" height="664" fill="url(#vertical)"/>
    <rect width="1640" height="8" fill="${GOLD}"/>
    <rect y="657" width="1640" height="7" fill="${GOLD}"/>

    <text x="310" y="146" fill="${WHITE}" font-family="${FONT}" font-size="58" font-weight="900">J&amp;Co</text>
    <line x1="311" y1="162" x2="492" y2="162" stroke="${GOLD}" stroke-width="3"/>
    <text x="311" y="188" fill="${GOLD}" font-family="${FONT}" font-size="14" font-weight="700" letter-spacing="3.4">INDUSTRIAL CONSULTING</text>

    <text x="310" y="320" fill="${WHITE}" font-family="${FONT}" font-size="61" font-weight="900">Si tu empresa tiene procesos,</text>
    <text x="310" y="396" fill="${GOLD}" font-family="${FONT}" font-size="61" font-weight="900">podemos hacerla mejor.</text>
    <text x="312" y="452" fill="${GRAY}" font-family="${FONT}" font-size="27" font-weight="400">Consultoría en operaciones, mejora de procesos y calidad.</text>

    <text x="1360" y="555" fill="${LIGHT_GOLD}" text-anchor="end" font-family="${FONT}" font-size="22" font-weight="700" letter-spacing="0.3">jco.com.ec</text>
  </svg>`, "utf8");
}

function createPostOverlay() {
  return Buffer.from(`<svg width="${POST_SIZE}" height="${POST_SIZE}" viewBox="0 0 ${POST_SIZE} ${POST_SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="8" fill="${GOLD}"/>
    <rect y="1074" width="1080" height="6" fill="${GOLD}"/>
    <text x="44" y="1025" fill="${WHITE}" fill-opacity="0.82" font-family="${FONT}" font-size="30" font-weight="900">J&amp;Co</text>
  </svg>`, "utf8");
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await sharp(coverBackground)
    .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.79, saturation: 0.84 })
    .composite([{ input: createCoverOverlay(), top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(coverOutput);

  await sharp(postBackground)
    .resize(POST_SIZE, POST_SIZE, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.82, saturation: 0.82 })
    .composite([{ input: createPostOverlay(), top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(postOutput);

  console.log(coverOutput);
  console.log(postOutput);
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});
