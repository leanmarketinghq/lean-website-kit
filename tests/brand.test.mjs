/**
 * The brand: DESIGN.md is complete, its text reads, the generated files match
 * it, the built stylesheet carries it, and no component names a colour or a
 * font directly. Run by `npm run check` after the build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLES, readDesign, renderCss, renderTs, validate } from '../scripts/lib/brand.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const brand = readDesign(ROOT);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

test('DESIGN.md is complete and its text reads on paper', () => {
  assert.deepEqual(validate(brand, ROOT), []);
});

test('the generated brand files match DESIGN.md', () => {
  assert.equal(readFileSync(join(ROOT, 'src/styles/brand.css'), 'utf8'), renderCss(brand), 'src/styles/brand.css is stale: run `npm run brand`');
  assert.equal(readFileSync(join(ROOT, 'src/data/brand.ts'), 'utf8'), renderTs(brand), 'src/data/brand.ts is stale: run `npm run brand`');
});

test('the built stylesheet carries every colour role and both fonts, self-hosted', () => {
  const dir = join(ROOT, 'dist/_astro');
  const css = readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
  // The minifier shortens colours (#ffffff → #fff, #ff0000 → red), so compare values, not text.
  const expand = (hex) => (hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex).toLowerCase();
  for (const role of ROLES) {
    const value = css.match(new RegExp(`--${role}:\\s*([^;}]+)`))?.[1]?.trim();
    assert.ok(value, `--${role} is not in the built CSS`);
    if (value.startsWith('#')) assert.equal(expand(value), brand.colors[role].toLowerCase(), `--${role} in the built CSS is ${value}`);
    else assert.match(value, /^[a-z]+$/i, `--${role} in the built CSS is ${value}, not a colour`);
  }
  if (brand.colors.inverse) {
    const band = css.match(/\.band-inverse\s*\{([^}]*)\}/)?.[1];
    assert.ok(band, 'DESIGN.md has an inverse set but .band-inverse is not in the built CSS');
    const v = band.match(/--paper:\s*([^;]+)/)?.[1]?.trim();
    assert.ok(v && (!v.startsWith('#') || expand(v) === brand.colors.inverse.paper.toLowerCase()), `.band-inverse paper in the built CSS is ${v}`);
  }
  for (const slot of ['display', 'body']) {
    const { family, system } = brand.fonts[slot];
    assert.ok(css.includes(family), `the ${slot} font ${family} is not in the built CSS`);
    if (!system) assert.match(css, new RegExp(`@font-face\\s*\\{[^}]*${family}`), `no @font-face for ${family}: it is not self-hosted`);
  }
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fast\.fonts\.net/, 'the built CSS requests a third-party font service');
});

test('no component, page, layout or stylesheet names a colour or a font directly', () => {
  const generated = new Set(['src/styles/brand.css', 'src/data/brand.ts']);
  const files = walk(join(ROOT, 'src')).filter((f) => /\.(astro|ts|css)$/.test(f) && !generated.has(relative(ROOT, f)));
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    assert.doesNotMatch(text, /#(?:[0-9a-f]{3}){1,2}\b(?![0-9a-f])/i, `${rel} names a colour; use a role from DESIGN.md`);
    for (const m of text.matchAll(/font-family:\s*([^;]+);/g)) {
      assert.match(m[1], /^var\(--(?:display|body)-font\)$/, `${rel} names a font (${m[1].trim()}); use var(--display-font) or var(--body-font)`);
    }
  }
});
