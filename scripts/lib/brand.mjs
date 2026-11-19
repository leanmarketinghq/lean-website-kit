/**
 * The brand, read from DESIGN.md. Used by scripts/brand.mjs (which writes
 * src/styles/brand.css and src/data/brand.ts) and by tests/brand.test.mjs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/** The colour roles, in the order DESIGN.md lists them. */
export const ROLES = ['paper', 'surface', 'ink', 'muted', 'line', 'accent', 'accent-ink'];
/** The roles an optional inverse band must redefine (a light band on a dark site, or the reverse); accent and accent-ink may follow. */
export const INVERSE_ROLES = ['paper', 'surface', 'ink', 'muted', 'line'];
/** Roles used as text on paper; WCAG AA for normal text. */
export const TEXT_ON_PAPER = ['ink', 'muted', 'accent-ink'];
export const MIN_CONTRAST = 4.5;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** The values block at the top of DESIGN.md, parsed. */
export function readDesign(root) {
  const file = join(root, 'DESIGN.md');
  if (!existsSync(file)) throw new Error('DESIGN.md is missing');
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) throw new Error('DESIGN.md has no values block (a --- block at the top)');
  return parse(m[1]);
}

export function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1 to 21. */
export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** The npm package an import path belongs to, or null for a local path. */
function packageOf(importPath) {
  if (importPath.startsWith('.') || importPath.startsWith('/')) return null;
  const parts = importPath.split('/');
  return importPath.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/**
 * Every problem with the brand, in plain words. An empty list means it is
 * good. `root` is the repository root; with it, files and packages are checked.
 */
export function validate(brand, root) {
  const problems = [];
  const colors = brand?.colors ?? {};
  for (const role of ROLES) {
    const v = colors[role];
    if (typeof v !== 'string' || !HEX.test(v)) problems.push(`colors.${role}: missing or not a hex colour (got ${JSON.stringify(v ?? null)})`);
  }
  if (!problems.length) {
    for (const role of TEXT_ON_PAPER) {
      const ratio = contrast(colors[role], colors.paper);
      if (ratio < MIN_CONTRAST) problems.push(`colors.${role} on paper is ${ratio.toFixed(2)}:1; text needs ${MIN_CONTRAST}:1 or better`);
    }
  }
  const inv = colors.inverse;
  if (inv != null) {
    if (typeof inv !== 'object' || Array.isArray(inv)) {
      problems.push('colors.inverse: give paper, surface, ink, muted and line (accent and accent-ink optional)');
    } else {
      for (const role of INVERSE_ROLES) {
        if (typeof inv[role] !== 'string' || !HEX.test(inv[role])) problems.push(`colors.inverse.${role}: missing or not a hex colour (got ${JSON.stringify(inv[role] ?? null)})`);
      }
      for (const role of ['accent', 'accent-ink']) {
        if (inv[role] != null && (typeof inv[role] !== 'string' || !HEX.test(inv[role]))) problems.push(`colors.inverse.${role}: not a hex colour`);
      }
      if (INVERSE_ROLES.every((r) => typeof inv[r] === 'string' && HEX.test(inv[r]))) {
        const accentInk = inv['accent-ink'] ?? colors['accent-ink'];
        for (const [role, value] of [['ink', inv.ink], ['muted', inv.muted], ['accent-ink', accentInk]]) {
          if (typeof value !== 'string' || !HEX.test(value)) continue;
          const ratio = contrast(value, inv.paper);
          if (ratio < MIN_CONTRAST) problems.push(`colors.inverse: ${role} (${value}) on the inverse paper is ${ratio.toFixed(2)}:1; text needs ${MIN_CONTRAST}:1 or better${role === 'accent-ink' && !inv['accent-ink'] ? ' (give the inverse band its own accent-ink)' : ''}`);
        }
      }
    }
  }

  for (const slot of ['display', 'body']) {
    const f = brand?.fonts?.[slot];
    if (!f || typeof f.family !== 'string' || !f.family.trim()) {
      problems.push(`fonts.${slot}.family is missing`);
      continue;
    }
    const imports = f.import == null ? [] : [].concat(f.import);
    const faces = Array.isArray(f.faces) ? f.faces : [];
    if (!imports.length && !faces.length && f.system !== true) {
      problems.push(`fonts.${slot}: give an import (a package stylesheet), faces (self-hosted files) or system: true`);
    }
    for (const imp of imports) {
      if (typeof imp !== 'string' || !imp.trim()) {
        problems.push(`fonts.${slot}.import: each entry must be a stylesheet path`);
        continue;
      }
      const pkg = packageOf(imp);
      if (pkg && root && !existsSync(join(root, 'node_modules', pkg))) {
        problems.push(`fonts.${slot}: package ${pkg} is not installed (npm install --save-dev --save-exact ${pkg})`);
      }
    }
    faces.forEach((face, i) => {
      if (typeof face?.file !== 'string' || !face.file.startsWith('/')) {
        problems.push(`fonts.${slot}.faces[${i}].file: give a path under public/, starting with /`);
      } else if (root && !existsSync(join(root, 'public', face.file))) {
        problems.push(`fonts.${slot}.faces[${i}]: public${face.file} does not exist`);
      }
      if (face?.weight != null && !/^\d{3}( \d{3})?$/.test(String(face.weight))) {
        problems.push(`fonts.${slot}.faces[${i}].weight: use 400, 700 or a range such as "100 900"`);
      }
    });
  }

  const files = [];
  const logo = brand?.logo ?? {};
  for (const k of ['light', 'dark']) if (logo[k] != null) files.push([`logo.${k}`, logo[k]]);
  if (logo.light != null || logo.dark != null) {
    for (const k of ['width', 'height']) {
      if (!Number.isInteger(logo[k]) || logo[k] <= 0) problems.push(`logo.${k}: give the rendered size in pixels (a whole number)`);
    }
  }
  const icons = brand?.icons ?? {};
  for (const k of ['svg', 'png32', 'png192', 'apple']) {
    if (icons[k] == null) problems.push(`icons.${k} is missing`);
    else files.push([`icons.${k}`, icons[k]]);
  }
  if (brand?.share == null) problems.push('share is missing (the 1200×630 image shown when a page is shared)');
  else files.push(['share', brand.share]);
  for (const [key, path] of files) {
    if (typeof path !== 'string' || !path.startsWith('/')) problems.push(`${key}: give a path under public/, starting with /`);
    else if (root && !existsSync(join(root, 'public', path))) problems.push(`${key}: public${path} does not exist`);
  }
  return problems;
}

/** light or dark, from which of black and white reads better on the ground. */
function schemeOf(paper) {
  return contrast(paper, '#000000') >= contrast(paper, '#ffffff') ? 'light' : 'dark';
}

function stack(font) {
  const family = /[\s"']/.test(font.family) ? `"${font.family.replace(/"/g, '')}"` : font.family;
  return font.fallback ? `${family}, ${font.fallback}` : family;
}

function formatOf(file) {
  const ext = file.split('.').pop().toLowerCase();
  return { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }[ext] ?? ext;
}

/** src/styles/brand.css: the font sources and the role variables. */
export function renderCss(brand) {
  const lines = ['/* Written by scripts/brand.mjs from DESIGN.md. Edit DESIGN.md and run `npm run brand`; never edit this file. */'];
  const imports = new Set();
  for (const slot of ['display', 'body']) for (const imp of [].concat(brand.fonts[slot].import ?? [])) imports.add(imp);
  for (const imp of imports) lines.push(`@import "${imp}";`);
  if (imports.size) lines.push('');
  for (const slot of ['display', 'body']) {
    for (const face of brand.fonts[slot].faces ?? []) {
      lines.push(
        '@font-face {',
        `  font-family: "${brand.fonts[slot].family}";`,
        `  src: url("${face.file}") format("${formatOf(face.file)}");`,
        `  font-weight: ${face.weight ?? 400};`,
        `  font-style: ${face.style ?? 'normal'};`,
        '  font-display: swap;',
        '}',
      );
    }
  }
  lines.push(':root {');
  for (const role of ROLES) lines.push(`  --${role}: ${brand.colors[role].toLowerCase()};`);
  lines.push(`  --display-font: ${stack(brand.fonts.display)};`, `  --body-font: ${stack(brand.fonts.body)};`, `  color-scheme: ${schemeOf(brand.colors.paper)};`, '}');
  const inv = brand.colors.inverse;
  if (inv) {
    lines.push('', '/* One band on the other ground: <Section tone="inverse">, or any element with class="band-inverse bg-paper text-ink". */', '.band-inverse {');
    for (const role of [...INVERSE_ROLES, 'accent', 'accent-ink']) if (inv[role]) lines.push(`  --${role}: ${inv[role].toLowerCase()};`);
    lines.push(`  color-scheme: ${schemeOf(inv.paper)};`, '}');
  }
  lines.push('');
  return lines.join('\n');
}

/** src/data/brand.ts: what the components need (logo, icons, share image, names). */
export function renderTs(brand) {
  const out = {
    colors: Object.fromEntries(ROLES.map((r) => [r, brand.colors[r].toLowerCase()])),
    /** True when DESIGN.md gives an inverse set, so <Section tone="inverse"> has values to use. */
    inverse: Boolean(brand.colors.inverse),
    fonts: { display: brand.fonts.display.family, body: brand.fonts.body.family },
    logo: {
      light: brand.logo?.light ?? null,
      dark: brand.logo?.dark ?? null,
      width: brand.logo?.width ?? null,
      height: brand.logo?.height ?? null,
    },
    icons: { svg: brand.icons.svg, png32: brand.icons.png32, png192: brand.icons.png192, apple: brand.icons.apple },
    share: brand.share,
  };
  return `// Written by scripts/brand.mjs from DESIGN.md. Edit DESIGN.md and run \`npm run brand\`; never edit this file.\nexport const BRAND = ${JSON.stringify(out, null, 2)} as const;\n`;
}
