import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets", "marketplace-calidad-iso9001-bg-2.png");
const whatsapp = path.join(root, "assets", "whatsapp.svg");
const output = path.join(root, "public", "marketplace-calidad-iso9001-2.png");

const width = 1200;
const height = 1200;

const photo = await sharp(source)
  .resize(width, width, { fit: "fill" })
  .extract({ left: 0, top: 120, width, height: 552 })
  .modulate({ brightness: 1.04, saturation: 0.9 })
  .png()
  .toBuffer();

const whatsappSvg = (await readFile(whatsapp, "utf8")).replace(
  "<path ",
  '<path fill="#FFFFFF" ',
);
const whatsappIcon = await sharp(Buffer.from(whatsappSvg))
  .resize(68, 68)
  .png()
  .toBuffer();

const overlay = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="168" fill="#071524"/>
  <rect y="720" width="1200" height="300" fill="#FFFFFF"/>
  <rect y="1020" width="1200" height="180" fill="#0D3557"/>
  <rect y="166" width="1200" height="2" fill="#5B91B5"/>

  <g font-family="Inter, Helvetica, Arial, sans-serif">
    <text x="60" y="78" fill="#FFFFFF" font-size="48" font-weight="900">J&amp;Co</text>
    <text x="61" y="119" fill="#74A9CC" font-size="13" font-weight="700" letter-spacing="4">INDUSTRIAL CONSULTING</text>
    <text x="1140" y="96" fill="#E8EEF2" font-size="17" font-weight="400" text-anchor="end">www.jco.com.ec</text>

    <text x="60" y="789" fill="#071524" font-size="50" font-weight="900" letter-spacing="0.5">CALIDAD / ISO 9001</text>
    <text x="60" y="837" fill="#333333" font-size="25" font-weight="400">Certifica tu empresa y gana contratos más grandes.</text>

    <g fill="#071524" font-size="22" font-weight="700">
      <circle cx="68" cy="904" r="7" fill="#5B91B5"/>
      <text x="88" y="912">✓ Diagnóstico de brechas ISO</text>
      <circle cx="68" cy="964" r="7" fill="#5B91B5"/>
      <text x="88" y="972">✓ Diseño del SGC</text>
      <circle cx="630" cy="904" r="7" fill="#5B91B5"/>
      <text x="650" y="912">✓ Auditorías internas</text>
      <circle cx="630" cy="964" r="7" fill="#5B91B5"/>
      <text x="650" y="972">✓ Prep. para certificación</text>
    </g>

    <text x="50" y="1127" fill="#FFFFFF" font-size="50" font-weight="900">Desde $299.99</text>
    <line x1="500" y1="1052" x2="500" y2="1169" stroke="#B8D0DF" stroke-width="2"/>
    <text x="530" y="1095" fill="#FFFFFF" font-size="19" font-weight="400">Agenda una conversación</text>
    <text x="530" y="1126" fill="#FFFFFF" font-size="19" font-weight="400">inicial gratuita</text>

    <text x="985" y="1120" fill="#FFFFFF" font-size="21" font-weight="800">Escríbenos ahora</text>
  </g>
</svg>`);

await sharp({
  create: { width, height, channels: 3, background: "#FFFFFF" },
})
  .composite([
    { input: photo, top: 168, left: 0 },
    { input: overlay, top: 0, left: 0 },
    { input: whatsappIcon, top: 1076, left: 910 },
  ])
  .png({ compressionLevel: 9, quality: 100 })
  .toColorspace("srgb")
  .toFile(output);

console.log(output);
