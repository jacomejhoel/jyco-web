import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import OpenAI from "openai";
import sharp from "sharp";

const WIDTH = 1080;
const HEIGHT = 1080;
const GOLD = "#C8A84B";
const LIGHT_GOLD = "#E2C97A";
const WHITE = "#FFFFFF";
const GRAY = "#CCCCCC";
const FONT = "Inter, Helvetica, Arial, sans-serif";
const CTA = "Agenda una conversación inicial gratuita";
const WEBSITE = "www.jco.com.ec";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "public", "catalogo");

const cards = [
  {
    filename: "01-institucional.png",
    kind: "institutional",
    prompt: "Cinematic wide photograph of a modern industrial factory interior with a professional consultant in a dark jacket working on a laptop at a wooden desk, engineering blueprints and a coffee cup on the table, blurred machinery and warm amber industrial lighting in the background, dramatic low-key lighting, large dark negative space on the left side, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional corporate photography.",
    headline: "Si tu empresa tiene procesos,",
    headlineGold: "podemos hacerla mejor.",
    subtitle: "Consultoría en operaciones, mejora de procesos y calidad que genera resultados y los sostiene en el tiempo.",
    services: "Diagnóstico · Procesos · Producción · Distribución de Planta · Logística · Inventarios · Calidad ISO 9001 · Capacitación"
  },
  {
    filename: "02-perdida-tiempo-dinero.png",
    kind: "pain",
    prompt: "Cinematic dark photograph of a modern industrial factory floor with a production line that is idle and stopped, one worker standing still looking concerned, moody low-key lighting with warm amber highlights in the background, shallow depth of field, lots of dark negative space on the left side, photorealistic, no text, no letters, no logos, no words, professional corporate photography.",
    headline: "Cada hora de proceso ineficiente",
    headlineGold: "te cuesta dinero a tu empresa.",
    subtitle: "Reprocesos, tiempos muertos y desperdicios silenciosos drenan tu rentabilidad todos los días.",
    microCta: "Nosotros los encontramos. Y los eliminamos."
  },
  {
    filename: "03-procesos-personas.png",
    kind: "pain",
    prompt: "Cinematic dark photograph of a single factory worker manually writing notes on a clipboard next to industrial machinery, emphasizing manual dependency, dramatic low-key lighting with warm amber tones, dark negative space on the left, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional corporate photography.",
    headline: "Si tu proceso depende de una persona,",
    headlineGold: "no tienes un proceso. Tienes un riesgo.",
    subtitle: "Cuando todo está en la cabeza de alguien, cada ausencia detiene tu operación.",
    microCta: "Convertimos el conocimiento en estándares."
  },
  {
    filename: "04-diagnostico-operativo.png",
    kind: "service",
    prompt: "Cinematic dark photograph of an industrial consultant in a dark jacket analyzing a factory floor while holding a tablet, observing the production line, moody professional lighting with warm amber background glow, dark negative space on the left and lower area, shallow depth of field, photorealistic, no text, no letters, no logos, no words.",
    headline: "Diagnóstico Operativo",
    subtitle: "El punto de partida. Analizamos tu operación completa y te mostramos exactamente dónde estás perdiendo y dónde puedes ganar.",
    bullets: ["Análisis integral de procesos", "Identificación de cuellos de botella", "Mapa de oportunidades priorizado", "Informe con plan de acción"]
  },
  {
    filename: "05-mejora-procesos.png",
    kind: "service",
    strongTextGradient: true,
    prompt: "Cinematic dark photograph of an engineer reviewing process flow diagrams and blueprints on a desk in an industrial setting, warm amber lighting, dark moody background with factory bokeh, negative space on the left and lower area, photorealistic, no text, no letters, no logos, no words, professional photography.",
    headline: "Mejora de Procesos",
    subtitle: "Rediseñamos tus flujos de trabajo con Lean y Six Sigma para eliminar desperdicios y estandarizar operaciones.",
    bullets: ["Mapeo de procesos (VSM)", "Estandarización con SOPs y JES", "Eliminación de desperdicios", "KPIs operacionales"]
  },
  {
    filename: "06-produccion-operaciones.png",
    kind: "service",
    strongTextGradient: true,
    prompt: "Cinematic dark photograph of an active modern manufacturing production line with machinery in motion, warm amber industrial lighting, dramatic shadows, dark negative space on the left and lower area, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional corporate photography.",
    headline: "Producción y Operaciones",
    subtitle: "Maximizamos tu capacidad productiva con los recursos que ya tienes. Más producción, menos tiempos muertos.",
    bullets: ["Balanceo de líneas", "Reducción de setups (SMED)", "Control de OEE", "Planificación de producción"]
  },
  {
    filename: "07-distribucion-planta.png",
    kind: "service",
    prompt: "Cinematic dark aerial photograph of a well-organized industrial factory floor layout seen from above, clean material flow paths, warm amber accent lighting, dark moody tones, negative space on the left and lower area, photorealistic, no text, no letters, no logos, no words, professional photography.",
    headline: "Diseño y Distribución",
    headlineGold: "de Planta",
    subtitle: "Optimizamos el layout de tu planta para que los materiales, las personas y la información fluyan sin obstáculos.",
    bullets: ["Análisis de flujo de materiales", "Optimización de espacios", "Reducción de recorridos", "Diseño de layout eficiente"]
  },
  {
    filename: "08-logistica-inventarios.png",
    kind: "service",
    prompt: "Cinematic dark photograph of an organized warehouse with neatly stacked inventory on tall shelving and a forklift, warm amber industrial lighting, dramatic shadows, dark negative space on the left and lower area, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional photography.",
    headline: "Logística e Inventarios",
    subtitle: "Reducimos tus costos de inventario y garantizamos disponibilidad con un control de stock inteligente.",
    bullets: ["Clasificación ABC", "Políticas de reposición", "Indicadores logísticos", "Trazabilidad de materiales"]
  },
  {
    filename: "09-calidad-iso.png",
    kind: "service",
    prompt: "Cinematic dark photograph of a quality control inspector examining a manufactured product with precision under focused warm light in an industrial setting, dark moody background, negative space on the left and lower area, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional photography.",
    headline: "Calidad e ISO 9001",
    subtitle: "Implementamos sistemas de gestión de calidad y te preparamos para la certificación, adaptados a tu realidad.",
    bullets: ["Diagnóstico de brechas ISO 9001:2015", "Diseño del SGC", "Auditorías internas", "Preparación para certificación"]
  },
  {
    filename: "10-capacitacion.png",
    kind: "service",
    prompt: "Cinematic photograph of a professional instructor training a small group of engaged factory workers in a modern industrial environment, the people clearly visible and well-lit with warm amber key lighting on their faces, dark moody background, dramatic but readable lighting, large dark negative space on the left side, shallow depth of field, photorealistic, no text, no letters, no logos, no words, professional corporate photography.",
    headline: "Capacitación Empresarial",
    subtitle: "Formamos a tu equipo en herramientas prácticas que aplican de inmediato en el piso de operaciones.",
    bullets: ["Lean Manufacturing", "Six Sigma", "5S y gestión visual", "KPIs y tableros de control"]
  }
];

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, { x, y, size, lineHeight, fill, weight = 400, letterSpacing = 0 }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" letter-spacing="${letterSpacing}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("")}</text>`;
}

function logoSvg() {
  return `
    <text x="72" y="103" fill="${WHITE}" font-family="${FONT}" font-size="56" font-weight="900">J&amp;Co</text>
    <line x1="73" y1="119" x2="245" y2="119" stroke="${WHITE}" stroke-width="2"/>
    <text x="73" y="143" fill="${GOLD}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="3.1">INDUSTRIAL CONSULTING</text>`;
}

function footerSvg() {
  return `
    <line x1="72" y1="936" x2="1008" y2="936" stroke="${GOLD}" stroke-width="2"/>
    <text x="72" y="977" fill="${WHITE}" font-family="${FONT}" font-size="22" font-weight="700">${CTA}</text>
    <text x="1008" y="977" fill="${LIGHT_GOLD}" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="700">${WEBSITE}</text>`;
}

function painContent(card) {
  const headline = wrapText(card.headline, 25);
  const gold = wrapText(card.headlineGold, 24);
  const subtitle = wrapText(card.subtitle, 48);
  const startY = 340;
  const goldY = startY + headline.length * 66 + 10;
  const subtitleY = goldY + gold.length * 66 + 58;
  const microY = subtitleY + subtitle.length * 35 + 62;
  return `
    ${textLines(headline, { x: 72, y: startY, size: 53, lineHeight: 66, fill: WHITE, weight: 900 })}
    ${textLines(gold, { x: 72, y: goldY, size: 53, lineHeight: 66, fill: GOLD, weight: 900 })}
    ${textLines(subtitle, { x: 72, y: subtitleY, size: 27, lineHeight: 35, fill: GRAY, weight: 500 })}
    <rect x="72" y="${microY - 30}" width="6" height="38" fill="${GOLD}"/>
    <text x="96" y="${microY}" fill="${WHITE}" font-family="${FONT}" font-size="25" font-weight="800">${escapeXml(card.microCta)}</text>`;
}

function institutionalContent(card) {
  const headline = wrapText(card.headline, 25);
  const gold = wrapText(card.headlineGold, 24);
  const subtitle = wrapText(card.subtitle, 48);
  const services = wrapText(card.services, 64);
  const startY = 340;
  const goldY = startY + headline.length * 66 + 10;
  const subtitleY = goldY + gold.length * 66 + 58;
  const servicesY = subtitleY + subtitle.length * 35 + 58;
  return `
    ${textLines(headline, { x: 72, y: startY, size: 53, lineHeight: 66, fill: WHITE, weight: 900 })}
    ${textLines(gold, { x: 72, y: goldY, size: 53, lineHeight: 66, fill: GOLD, weight: 900 })}
    ${textLines(subtitle, { x: 72, y: subtitleY, size: 27, lineHeight: 35, fill: GRAY, weight: 500 })}
    ${textLines(services, { x: 72, y: servicesY, size: 19, lineHeight: 28, fill: LIGHT_GOLD, weight: 700, letterSpacing: 0.25 })}`;
}

function serviceContent(card) {
  const headline = wrapText(card.headline, 27);
  const gold = card.headlineGold ? wrapText(card.headlineGold, 27) : [];
  const subtitle = wrapText(card.subtitle, 53);
  const startY = 285;
  const goldY = startY + headline.length * 60;
  const subtitleY = (gold.length ? goldY + gold.length * 60 : goldY) + 44;
  const bulletsY = subtitleY + subtitle.length * 33 + 50;
  const bullets = card.bullets.map((bullet, index) => {
    const y = bulletsY + index * 55;
    return `<circle cx="83" cy="${y - 7}" r="6" fill="${GOLD}"/><text x="105" y="${y}" fill="${WHITE}" font-family="${FONT}" font-size="24" font-weight="600">${escapeXml(bullet)}</text>`;
  }).join("");
  return `
    ${textLines(headline, { x: 72, y: startY, size: 50, lineHeight: 60, fill: WHITE, weight: 900 })}
    ${gold.length ? textLines(gold, { x: 72, y: goldY, size: 50, lineHeight: 60, fill: GOLD, weight: 900 }) : ""}
    ${textLines(subtitle, { x: 72, y: subtitleY, size: 25, lineHeight: 33, fill: GRAY, weight: 500 })}
    ${bullets}`;
}

function createOverlaySvg(card) {
  const middleOpacity = card.strongTextGradient ? 0.92 : 0.80;
  const rightOpacity = card.strongTextGradient ? 0.42 : 0.28;
  const middleOffset = card.strongTextGradient ? 0.68 : 0.58;
  return Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="horizontal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.98"/>
        <stop offset="${middleOffset}" stop-color="#0D0D0D" stop-opacity="${middleOpacity}"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="${rightOpacity}"/>
      </linearGradient>
      <linearGradient id="vertical" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0D0D0D" stop-opacity="0.08"/>
        <stop offset="0.68" stop-color="#0D0D0D" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#0D0D0D" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#horizontal)"/>
    <rect width="1080" height="1080" fill="url(#vertical)"/>
    <rect width="1080" height="8" fill="${GOLD}"/>
    <rect y="1074" width="1080" height="6" fill="${GOLD}"/>
    ${logoSvg()}
    ${card.kind === "institutional" ? institutionalContent(card) : card.kind === "pain" ? painContent(card) : serviceContent(card)}
    ${footerSvg()}
  </svg>`, "utf8");
}

async function imageBufferFromResponse(image) {
  if (image.b64_json) return Buffer.from(image.b64_json, "base64");
  if (image.url) {
    const response = await fetch(image.url);
    if (!response.ok) throw new Error(`No se pudo descargar la imagen (${response.status}).`);
    return Buffer.from(await response.arrayBuffer());
  }
  throw new Error("La API no devolvió b64_json ni URL para la imagen.");
}

async function generateBackground(openai, card) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: card.prompt,
    size: "1024x1024",
    quality: "hd",
    response_format: "b64_json",
    n: 1
  });
  return imageBufferFromResponse(response.data[0]);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const pending = [];
  for (const card of cards) {
    try {
      await fs.access(path.join(outputDir, card.filename));
      console.log(`[skip] ${card.filename}`);
    } catch {
      pending.push(card);
    }
  }

  if (pending.length && !process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY. Configúrala en el entorno y vuelve a ejecutar npm run catalogo.");
  }

  const openai = pending.length ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  for (const [index, card] of pending.entries()) {
    const destination = path.join(outputDir, card.filename);
    console.log(`[${index + 1}/${pending.length}] Generando ${card.filename}...`);
    const background = await generateBackground(openai, card);
    await sharp(background)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.78, saturation: 0.82 })
      .composite([{ input: createOverlaySvg(card), top: 0, left: 0 }])
      .png({ compressionLevel: 9, palette: false })
      .toFile(destination);
    console.log(`[ok] ${destination}`);
  }

  console.log("\nImágenes del catálogo:");
  for (const card of cards) console.log(path.join(outputDir, card.filename));
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});

export { cards, createOverlaySvg };
