#!/usr/bin/env node
/**
 * DESIGN.md → src/styles/brand.css and src/data/brand.ts.
 * Runs before every build and dev server (`npm run build`, `npm run dev`).
 * Stops, with the problems listed, when the brand is incomplete or text
 * would be unreadable. Writes a file only when its content changes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLES, TEXT_ON_PAPER, contrast, readDesign, renderCss, renderTs, validate } from './lib/brand.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const brand = readDesign(root);
const problems = validate(brand, root);
if (problems.length) {
  console.error(`DESIGN.md has ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}

const outputs = { 'src/styles/brand.css': renderCss(brand), 'src/data/brand.ts': renderTs(brand) };
for (const [rel, text] of Object.entries(outputs)) {
  const file = join(root, rel);
  if (existsSync(file) && readFileSync(file, 'utf8') === text) continue;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

const swatch = (role) => {
  const hex = brand.colors[role];
  return TEXT_ON_PAPER.includes(role) ? `${role} ${hex} (${contrast(hex, brand.colors.paper).toFixed(1)}:1 on paper)` : `${role} ${hex}`;
};
console.log(`brand: ${ROLES.map(swatch).join(', ')}`);
console.log(`brand: display ${brand.fonts.display.family}, body ${brand.fonts.body.family}; logo ${brand.logo?.light ?? 'none, so the site name is shown as text'}`);
