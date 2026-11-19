/**
 * The kit's placeholder words, and the rule about them: once the site has its
 * own name, none of them may be left on it. The untouched starter, still
 * named STARTER_NAME, passes, so a new copy of the kit can be published as it
 * is. `scripts/ready.mjs` applies the rule at the end of every build.
 */

/** The name the kit ships with: `SITE.name` in src/data/site.ts. */
export const STARTER_NAME = 'Example Business';

/** Words from the starter's own pages. tests/ready.test.mjs keeps this list in step with them. */
export const PLACEHOLDERS = [
  STARTER_NAME,
  'hello@example.com',
  'A headline that says what you do',
  'Who it is for, in a few words',
  'What happens after they press the button',
  'Problem one',
  'The outcome in one line',
  'The first step',
  'The result in a few words',
  'Customer name',
  'A placeholder picture',
  'The parts of the offer, in plain words',
  'A question a customer asks before they buy',
  'A placeholder until the real page is written',
  'This page is a placeholder',
];

/** The placeholder words in one page's HTML. */
export function leftovers(html) {
  return PLACEHOLDERS.filter((words) => html.includes(words));
}

/**
 * The verdict on a built site. `name` is the site's name and `pages` maps
 * each built file to its HTML. `found` lists what has to go, as
 * `file: "words"`; it is empty for the starter and for a finished site.
 */
export function verdict(name, pages) {
  if (name === STARTER_NAME) return { starter: true, found: [] };
  const found = Object.entries(pages).flatMap(([file, html]) => leftovers(html).map((words) => `${file}: "${words}"`));
  return { starter: false, found };
}
