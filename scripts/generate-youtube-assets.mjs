import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(import.meta.dirname, "..");
const assetsDir = path.join(repoRoot, "assets");
const outputDir = path.join(assetsDir, "youtube");
const backgroundPath = path.join(outputDir, "youtube-background-generated.png");
const whiteLogoPath = path.join(assetsDir, "logo-jco-blanco.png");
const blackLogoPath = path.join(assetsDir, "logo-jco.png");

await fs.mkdir(outputDir, { recursive: true });

const bannerOverlay = Buffer.from(`
<svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg">
  <rect width="2560" height="1440" fill="#080808" fill-opacity="0.52"/>
  <rect x="507" y="508" width="1546" height="424" fill="#050505" fill-opacity="0.30"/>
  <line x1="1020" y1="802" x2="1930" y2="802" stroke="#C9A85E" stroke-width="5"/>
  <text x="1020" y="660" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="600">Si tu empresa tiene procesos,</text>
  <text x="1020" y="742" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="600">podemos hacerla mejor.</text>
  <text x="1020" y="858" fill="#D8C38B" font-family="Segoe UI, Arial, sans-serif" font-size="26">OPERACIONES · PROCESOS · CALIDAD</text>
</svg>`);

const bannerLogo = await sharp(whiteLogoPath)
  .resize(360, 360, { fit: "contain" })
  .png()
  .toBuffer();

await sharp(backgroundPath)
  .resize(2560, 1440, { fit: "cover", position: "centre" })
  .composite([
    { input: bannerOverlay, left: 0, top: 0 },
    { input: bannerLogo, left: 600, top: 540 },
  ])
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(path.join(outputDir, "jco-youtube-banner-2560x1440.jpg"));

const profileLogo = await sharp(whiteLogoPath)
  .resize(700, 700, { fit: "contain" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 800, height: 800, channels: 3, background: "#050505" },
})
  .composite([{ input: profileLogo, left: 50, top: 50 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputDir, "jco-youtube-profile-800x800.png"));

const { data: grayLogo, info } = await sharp(blackLogoPath)
  .resize(150, 150, { fit: "contain", background: "#FFFFFF" })
  .flatten({ background: "#FFFFFF" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const watermarkPixels = Buffer.alloc(info.width * info.height * 4);
for (let i = 0; i < grayLogo.length; i += 1) {
  const alpha = 255 - grayLogo[i];
  const offset = i * 4;
  watermarkPixels[offset] = 255;
  watermarkPixels[offset + 1] = 255;
  watermarkPixels[offset + 2] = 255;
  watermarkPixels[offset + 3] = alpha;
}

await sharp(watermarkPixels, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputDir, "jco-youtube-watermark-150x150.png"));

console.log(`YouTube assets created in ${outputDir}`);
