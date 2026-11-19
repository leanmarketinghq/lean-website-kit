#!/usr/bin/env node
/**
 * The placeholder check, the last step of every build (`npm run build`): a
 * site with its own name may not carry the kit's placeholder words. Stops the
 * build and lists what it found. The rule and the words are in
 * scripts/lib/placeholders.mjs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STARTER_NAME, verdict } from './lib/placeholders.mjs';
// Node strips the types, as it does for the tests.
import { SITE } from '../src/data/site.ts';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/** Every file under dist/, as a path relative to it. */
function walk(dir = DIST) {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [relative(DIST, file)];
  });
}

const pages = Object.fromEntries(
  walk()
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file, readFileSync(join(DIST, file), 'utf8')]),
);
const { starter, found } = verdict(SITE.name, pages);

if (found.length) {
  console.error(
    `Stopped. The kit's placeholder words are still on the site:\n${found.map((line) => `  - ${line}`).join('\n')}\nReplace them with the real words, or take out the section they are in, then build again.`,
  );
  process.exit(1);
}
console.log(
  starter
    ? `ready: this is the kit's starter, still named "${STARTER_NAME}". The placeholder check begins once the site has its own name.`
    : 'ready: no placeholder words left on the site',
);
