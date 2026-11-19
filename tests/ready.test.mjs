/**
 * The placeholder rule (scripts/lib/placeholders.mjs): the untouched starter
 * may be published as it is, a site with its own name may not carry the kit's
 * words, and the list of words matches the starter the kit ships. Run by
 * `npm run build` after the pages are built.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDERS, STARTER_NAME, leftovers, verdict } from '../scripts/lib/placeholders.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const { SITE } = await import('../src/data/site.ts');

function walk(dir = DIST) {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

test('the untouched starter may be published as it is', () => {
  const page = `<h1>${PLACEHOLDERS[2]}</h1><p>${PLACEHOLDERS[9]}</p>`;
  assert.equal(leftovers(page).length, 2);
  assert.deepEqual(verdict(STARTER_NAME, { 'index.html': page }), { starter: true, found: [] });
});

test('a site with its own name is stopped while a placeholder is left, and told where', () => {
  const { starter, found } = verdict('Harbour Dental', {
    'index.html': `<h1>Gentle dentistry in Mornington</h1><p>${PLACEHOLDERS[9]}</p>`,
    'about.html': '<p>Thirty years on Main Street.</p>',
  });
  assert.equal(starter, false);
  assert.deepEqual(found, [`index.html: "${PLACEHOLDERS[9]}"`]);
});

test('a finished site passes', () => {
  assert.deepEqual(verdict('Harbour Dental', { 'index.html': '<h1>Gentle dentistry in Mornington</h1>' }), { starter: false, found: [] });
});

test('while the site is the starter, every word on the list is on its pages', () => {
  // Keeps the list in step with the starter's own words. A site with its own name has none of them left.
  if (SITE.name !== STARTER_NAME) return;
  const html = walk()
    .filter((file) => file.endsWith('.html'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  assert.deepEqual(
    PLACEHOLDERS.filter((words) => !html.includes(words)),
    [],
    'on the list but not on the starter: update scripts/lib/placeholders.mjs',
  );
});
