import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const pricingPath = path.join(root, 'pricing.js');

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

if (!fs.existsSync(pricingPath)) {
  fail('pricing.js is missing from the site root.');
  process.exit();
}

const pricingCode = fs.readFileSync(pricingPath, 'utf8');
const sandboxWindow = {};
const sandboxDocument = {
  readyState: 'complete',
  querySelectorAll() {
    return [];
  },
};

vm.runInNewContext(pricingCode, {
  window: sandboxWindow,
  document: sandboxDocument,
});

const pricing = sandboxWindow.JCO_PRICING;
const priceFor = sandboxWindow.JCO_priceFor;
const requiredSizes = ['micro', 'pequena', 'mediana', 'grande'];
const missingAssets = [];
const pricingIssues = [];
const scriptIssues = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const needsPricing = html.includes('JCO_PRICING') || html.includes('data-pricing=');
  const hasPricingScript = /<script\s+src=["']pricing\.js["']\s*><\/script>/i.test(html);

  if (needsPricing && !hasPricingScript) {
    scriptIssues.push(`${file}: uses pricing but does not load pricing.js from the root`);
  }

  const referenceRegex = /(?:src|href)=["']([^"']+)["']/g;
  for (const match of html.matchAll(referenceRegex)) {
    let url = match[1];
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(url)) continue;
    if (url.startsWith('/')) url = url.slice(1);
    url = url.split('?')[0];
    url = url.split('#')[0];
    if (!url || url.endsWith('/')) continue;
    if (!fs.existsSync(path.join(root, url))) {
      missingAssets.push(`${file} -> ${url}`);
    }
  }

  for (const match of html.matchAll(/data-pricing=["']([^"']+)["']/g)) {
    const key = match[1];
    if (!pricing[key]) {
      pricingIssues.push(`${file}: unknown pricing key "${key}"`);
      continue;
    }

    const block = html.slice(match.index, match.index + 3000);
    for (const size of requiredSizes) {
      if (!block.includes(`data-price="${size}"`) && !block.includes(`data-price='${size}'`)) {
        pricingIssues.push(`${file}: "${key}" is missing data-price="${size}"`);
      }
      if (!priceFor(pricing[key], size)) {
        pricingIssues.push(`${file}: "${key}" has no calculated price for "${size}"`);
      }
    }
  }
}

console.log(`HTML files checked: ${htmlFiles.length}`);
console.log(`Pricing services: ${Object.keys(pricing).join(', ')}`);
console.log(`Missing local assets: ${missingAssets.length}`);
console.log(`Pricing markup issues: ${pricingIssues.length}`);
console.log(`Pricing script issues: ${scriptIssues.length}`);

if (missingAssets.length) fail(missingAssets.join('\n'));
if (pricingIssues.length) fail(pricingIssues.join('\n'));
if (scriptIssues.length) fail(scriptIssues.join('\n'));

if (!process.exitCode) {
  console.log('Site validation passed.');
}
