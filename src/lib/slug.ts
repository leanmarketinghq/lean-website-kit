/**
 * A page's address, made from its file name:
 * "Our Team.md" → "our-team".
 *
 * Changing this changes live URLs. If it ever has to change, add a 301 for
 * every old address to public/_redirects in the same commit.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
