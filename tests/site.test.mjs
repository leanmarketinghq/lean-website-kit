/**
 * Checks the built site in dist/ before it can deploy. Run `npm run check`
 * (brand, build, then these). Workers Builds runs the same command, so a
 * failure here stops the deploy and the live site stays as it was.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
// Node 22.18 and later strip the types, so the site's own facts are the expectations.
const { SITE, NAV, CONTACT, FORMS } = await import('../src/data/site.ts');
const ORIGIN = SITE.url.replace(/\/$/, '');

const read = (file) => readFileSync(join(DIST, file), 'utf8');
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/** Every file under dist/, as a path relative to it. */
function walk(dir = DIST) {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [relative(DIST, file)];
  });
}
const htmlFiles = () => walk().filter((f) => f.endsWith('.html'));
/** Every page the site built, by address: index.html → "/", about.html → "/about", team/jo.html → "/team/jo". */
const pages = () =>
  Object.fromEntries(
    htmlFiles()
      .filter((f) => f !== '404.html')
      .map((f) => [f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`, f]),
  );
const canonicalFor = (path) => (path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`);

test('the site has been built', () => {
  assert.ok(existsSync(join(DIST, 'index.html')), 'dist/index.html is missing: run `npm run build` first');
  assert.ok(existsSync(join(DIST, '404.html')), 'the 404 page is missing');
  assert.ok(Object.keys(pages()).length >= 1, 'expected at least the home page');
});

test('every page has a language, a title, a description and its canonical address', () => {
  for (const [path, file] of Object.entries(pages())) {
    const html = read(file);
    assert.match(html, /<html lang="[a-z]{2}(-[A-Za-z]{2})?">/, `${path}: no lang`);
    assert.match(html, /<title>[^<]{3,}<\/title>/, `${path}: no title`);
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    assert.ok(description.length >= 20, `${path}: description missing or too short`);
    assert.equal(html.match(/<link rel="canonical" href="([^"]*)"/)?.[1], canonicalFor(path), `${path}: wrong canonical`);
    assert.match(html, /<meta property="og:image" content="https?:\/\/[^"]+"/, `${path}: no share image`);
  }
});

test('the header shows the site name or logo and lists every nav link inline and in the phone menu', () => {
  const header = read('index.html').match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
  assert.ok(header.includes(SITE.name), 'the header has neither the site name nor a logo with the name as alt text');
  if (NAV.length === 0) {
    assert.doesNotMatch(header, /<nav\b/, 'a site with no navigation should have no nav in the header');
    return;
  }
  assert.match(header, /<details[^>]*class="[^"]*\bmenu\b/, 'the phone menu is missing');
  // Counted inside the nav, so a button with the same words as a link doesn't add to the count.
  const nav = header.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
  for (const { label } of NAV) {
    const count = [...nav.matchAll(new RegExp(`>\\s*${label}\\s*<`, 'g'))].length;
    assert.equal(count, 2, `the header should list ${label} twice (inline and in the phone menu), found ${count}`);
  }
});

test('analytics are guarded to the live hostname', () => {
  for (const [path, file] of Object.entries(pages())) {
    assert.ok(read(file).includes(JSON.stringify(SITE.liveHost)), `${path}: the analytics guard for ${SITE.liveHost} is missing`);
  }
});

test('nothing is hidden from search engines', () => {
  for (const file of htmlFiles().filter((f) => f !== '404.html')) {
    assert.doesNotMatch(read(file), /<meta[^>]+name="robots"[^>]+noindex/i, `${file} is noindexed`);
  }
});

test('form iframes are never lazy and their ids are unique on each page', () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    assert.doesNotMatch(html, /loading="lazy"[^>]*widget\/form|widget\/form[^>]*loading="lazy"/, `${file}: a lazy GHL iframe never gets sized`);
    const ids = [...html.matchAll(/<iframe[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${file} repeats an iframe id`);
  }
});

test('every internal link, anchor and image resolves', () => {
  const built = pages();
  const pageFor = (path) => (path === '' || path === '/' ? 'index.html' : built[path]);
  for (const file of htmlFiles()) {
    const html = read(file);
    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const url = m[1];
      if (url.startsWith('//')) continue;
      const [path, hash] = url.split('#');
      const clean = path.split('?')[0];
      const page = pageFor(clean);
      if (page) {
        if (hash) assert.match(read(page), new RegExp(`\\sid="${hash}"`), `${file}: ${url} points at a missing section`);
        continue;
      }
      assert.ok(existsSync(join(DIST, decodeURI(clean))), `${file}: ${url} does not exist`);
    }
  }
});

test('every image has a size and alt text', () => {
  for (const file of htmlFiles()) {
    for (const [tag] of read(file).matchAll(/<img\b[^>]*>/g)) {
      assert.notEqual(attr(tag, 'alt'), undefined, `${file}: image without alt: ${tag}`);
      assert.ok(attr(tag, 'width') && attr(tag, 'height'), `${file}: image without width/height: ${tag}`);
    }
  }
});

test('every redirect is permanent, points at a page this site builds, and hides no live page', () => {
  const built = pages();
  const rules = read('_redirects')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/));
  for (const rule of rules) {
    assert.equal(rule.length, 3, `a redirect rule needs three fields (from, to, 301): ${rule.join(' ')}`);
    const [from, to, code] = rule;
    assert.equal(code, '301', `${from} should redirect with a 301`);
    assert.ok(built[to] || existsSync(join(DIST, to)), `${from} redirects to ${to}, which this site doesn't build`);
    assert.ok(!built[from], `${from} is a live page; a redirect from it would hide the page`);
  }
});

test('no id is used twice on a page', () => {
  // The header's links and the button point at section ids; a repeated id sends them to the wrong place.
  for (const file of htmlFiles()) {
    const ids = [...read(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(repeated, [], `${file} repeats an id`);
  }
});

test('the contact page gives the contact details, and every footer links to it', () => {
  const html = read('contact.html');
  assert.ok(html.includes(`href="mailto:${CONTACT.email}"`), 'the contact page does not give the email address');
  if (CONTACT.phone) assert.ok(html.includes(CONTACT.phone), 'the contact page does not give the phone number');
  for (const line of CONTACT.address) assert.ok(html.includes(line), `the contact page is missing the address line "${line}"`);
  for (const file of htmlFiles()) {
    const footer = read(file).match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    assert.match(footer, /href="\/contact"/, `${file}: the footer has no link to the contact page`);
  }
});

test('a contact form, when one is set, is embedded with the script that sizes it', () => {
  if (!FORMS.contact) return;
  assert.match(FORMS.host, /^https:\/\/[^/]+$/, 'FORMS.host in src/data/site.ts should be the start of the form’s address, like https://forms.example.com');
  const html = read('contact.html');
  assert.ok(html.includes(`src="${FORMS.host}/widget/form/${FORMS.contact}"`), 'the contact page does not embed the contact form');
  assert.ok(html.includes(`src="${FORMS.host}/js/form_embed.js"`), 'the contact page does not load GHL’s form script, so the form is never sized');
});

test('the sitemap lists exactly the pages, and robots.txt points at it', () => {
  const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const expected = Object.keys(pages()).map(canonicalFor).sort();
  assert.deepEqual(locs, expected);
  assert.ok(read('robots.txt').includes(`Sitemap: ${ORIGIN}/sitemap.xml`), 'robots.txt does not point at the sitemap');
});
