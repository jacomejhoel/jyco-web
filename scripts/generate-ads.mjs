import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1080;
const GOLD = "#C8A84B";
const WHITE = "#FFFFFF";
const FONT = "Inter, Helvetica, Arial, sans-serif";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "public", "ads");

const ads = [
  {
    filename: "ad-01-perdida-dinero.png",
    background: path.join(repoRoot, "assets", "ads", "ad-01-background.png"),
    whiteLines: ["Cada hora de proceso", "ineficiente"],
    goldLines: ["te cuesta dinero."]
  },
  {
    filename: "ad-02-procesos-personas.png",
    background: path.join(repoRoot, "assets", "ads", "ad-02-background.png"),
    whiteLines: ["Si tu proceso depende", "de una persona,"],
    goldLines: ["no tienes un proceso.", "Tienes un riesgo."]
  }
];

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

function textLines(lines, { x, y, size, lineHeight, fill }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${FONT}" font-size="${size}" font-weight="900">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function logoSvg() {
  return `
    <text x="72" y="103" fill="${WHITE}" font-family="${FONT}" font-size="56" font-weight="900">J&amp;Co</text>
    <line x1="73" y1="119" x2="245" y2="119" stroke="${WHITE}" stroke-width="2"/>
    <text x="73" y="143" fill="${GOLD}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="3.1">INDUSTRIAL CONSULTING</text>`;
}

function createAdOverlay(ad) {
  const size = ad.goldLines.length > 1 ? 62 : 68;
  const lineHeight = ad.goldLines.length > 1 ? 76 : 82;
  const totalLines = ad.whiteLines.length + ad.goldLines.length;
  const blockHeight = (totalLines - 1) * lineHeight + size;
  const startY = Math.round((HEIGHT - blockHeight) / 2 + size * 0.78);
  const goldY = startY + ad.whiteLines.length * lineHeight;

  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="horizontal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.99"/>
        <stop offset="0.62" stop-color="#0D0D0D" stop-opacity="0.91"/>
        <stop offset="0.82" stop-color="#0D0D0D" stop-opacity="0.54"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="0.18"/>
      </linearGradient>
      <linearGradient id="vertical" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.08"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="0.44"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#horizontal)"/>
    <rect width="1080" height="1080" fill="url(#vertical)"/>
    <rect width="1080" height="8" fill="${GOLD}"/>
    <rect y="1074" width="1080" height="6" fill="${GOLD}"/>
    ${logoSvg()}
    ${textLines(ad.whiteLines, { x: 72, y: startY, size, lineHeight, fill: WHITE })}
    ${textLines(ad.goldLines, { x: 72, y: goldY, size, lineHeight, fill: GOLD })}
  </svg>`, "utf8");
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  for (const ad of ads) {
    const destination = path.join(outputDir, ad.filename);
    await sharp(ad.background)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.80, saturation: 0.84 })
      .composite([{ input: createAdOverlay(ad), top: 0, left: 0 }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(destination);
    console.log(destination);
  }
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});

export { ads, createAdOverlay };
