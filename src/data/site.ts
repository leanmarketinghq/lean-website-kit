/**
 * Site-wide facts. Change one here and every page follows.
 *
 * tests/site.test.mjs imports this file directly (Node strips the types), so
 * keep it plain: no enums, no imports of images. The brand (colours, fonts,
 * logo, icons) lives in DESIGN.md, not here.
 */
export const SITE = {
  /** The business name: page titles, the footer, and the header when DESIGN.md sets no logo. */
  name: 'Example Business',
  /**
   * The address the site is on, no trailing slash. Canonical links, the
   * sitemap and robots.txt use it. Until the site has its own domain, this is
   * its workers.dev address.
   */
  url: 'https://example.com',
  /** The home page's description, under 160 characters. */
  description: 'What the business does, who it is for and the result they get. Replace this line with the real one.',
  /** Analytics load on this hostname only, so previews and workers.dev visits never reach the numbers. */
  liveHost: 'example.com',
  /** The GA4 measurement id, or empty for no analytics. */
  gaId: '',
  /** The handle shown on Twitter cards, or empty. */
  xHandle: '',
} as const;

/**
 * Header navigation. Anchors point at sections of the home page. Phones get
 * the same links in a menu. An empty list makes a one-page site: the header
 * shows the logo and the button.
 */
export const NAV: { href: string; label: string }[] = [
  { href: '/#how', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/#faqs', label: 'FAQs' },
];

/**
 * The one call to action: the button in the header, in the hero and between
 * sections. `href` is a section of the home page, another page, or a full
 * address (a booking page, a checkout). An empty label means no button.
 */
export const CTA = {
  label: 'Get in touch',
  href: '/#contact',
} as const;

/** Footer navigation. */
export const FOOTER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** How to reach the business: the contact page, and the home page's contact section when there is no form. */
export const CONTACT = {
  email: 'hello@example.com',
  /** The phone number as it should be shown, or empty for none. */
  phone: '',
  /** The same number as a link, such as 'tel:+61400000000', or empty. */
  phoneHref: '',
  /** The postal address, one line per entry, or an empty list for none. */
  address: [] as string[],
};

/**
 * The contact form is a GoHighLevel embed (Lean CRM is GoHighLevel); see
 * src/lib/ghl.ts for the rules. Both values come from the form's embed code:
 * `host` is the start of its address, such as 'https://forms.example.com',
 * and `contact` is the form's id, the last part of the same address. An empty
 * `contact` means no form: the contact page and the home page's contact
 * section show the email address instead. `contactHeight` is the height the
 * embed code gives; the frame starts at that height until GHL's script sizes
 * it.
 */
export const FORMS = {
  host: '',
  contact: '',
  contactName: 'Contact',
  contactHeight: 600,
} as const;
