---
# The brand as values. `npm run brand` turns this block into
# src/styles/brand.css and src/data/brand.ts (both generated, never edited).
# The sections below the block explain each value and how to change it.
colors:
  paper: "#ffffff"       # the page ground
  surface: "#f4f4f5"     # cards, panels and alternate bands
  ink: "#18181b"         # headings and body text
  muted: "#52525b"       # secondary text
  line: "#e4e4e7"        # rules and borders
  accent: "#2563eb"      # buttons, marks, underlines, focus rings
  accent-ink: "#1d4ed8"  # the accent used as text; must read on paper
  # inverse:             # optional: the other ground for one band (see Colour)
  #   paper: "#18181b"
  #   surface: "#27272a"
  #   ink: "#fafafa"
  #   muted: "#a1a1aa"
  #   line: "#3f3f46"
  #   accent-ink: "#93c5fd"   # only if the main accent-ink does not read on this paper
fonts:
  display:
    family: Inter Variable
    fallback: ui-sans-serif, system-ui, sans-serif
    import: "@fontsource-variable/inter/wght.css"
  body:
    family: Inter Variable
    fallback: ui-sans-serif, system-ui, sans-serif
    import: "@fontsource-variable/inter/wght.css"
logo:
  light: null            # e.g. /brand/logo.svg; null shows the site name as text
  dark: null             # the version for dark grounds, if there is one
  width: 140             # rendered size in the header, in pixels
  height: 28
icons:
  svg: /brand/favicon.svg
  png32: /brand/icon-32.png
  png192: /brand/icon-192.png
  apple: /brand/icon-180.png
share: /brand/share.png  # 1200×630, shown when a page is shared
---

# Brand

The brand of this site, as values at the top and as words below. The values are
the source: `npm run brand` writes them into the stylesheet and the components,
and the build fails when a value is missing or text would be unreadable. The
values above are the kit's neutral placeholders, to be replaced with the
business's own.

## Where the values came from

The kit's defaults. Replace this section with where the business's values
came from: its logo, its current website (the address and the date it was
read) or its brand guide (the file and its version), and anything that was
changed on the way in, such as an accent darkened to read as text.

## Colour

Seven roles. Components only ever name a role, never a colour, so a new brand
is a new set of values here and nothing else.

| Role | Used for | Rule |
| --- | --- | --- |
| `paper` | the page ground | |
| `surface` | cards, panels, alternate bands | a step away from paper, same family |
| `ink` | headings and body text | 4.5:1 or better on paper |
| `muted` | secondary text, captions | 4.5:1 or better on paper |
| `line` | rules and borders | visible on paper and on surface |
| `accent` | buttons, marks, underlines, focus rings | the brand's main colour |
| `accent-ink` | the accent as text (links, labels) | 4.5:1 or better on paper; darken the accent until it passes |

An optional `inverse` set (`paper`, `surface`, `ink`, `muted`, `line`, and
`accent` or `accent-ink` when the main ones do not read on it) gives one band
the other ground, a light band on a dark site or the reverse. Sections of the
home page take it by being wrapped in `<Band>` (`src/components/Band.astro`);
its text roles must read on its paper too.

Dark mode is off. A brand that needs it adds a second set of values in a
`@media (prefers-color-scheme: dark)` block in `src/styles/global.css`.

## Type

Two roles: `display` for headings and `body` for everything else. Each names a
family, a fallback stack and a source, one of:

- `import`: a stylesheet from an installed package, self-hosted at build time.
  Open fonts come as `@fontsource-variable/<name>` or `@fontsource/<name>`,
  added with `npm install --save-dev --save-exact`. No font request leaves the
  site at run time.
- `faces`: font files the business already owns, copied into `public/fonts/`,
  each with its `file`, `weight` and `style`. The licence is the business's
  own; note it under "Where the values came from".
- `system: true`: nothing is loaded; the fallback stack is the font.

A commercial font served by a font service (Adobe Fonts, fonts.com, MyFonts)
is tied to the domains on that account and will not load here, so use the
nearest open lookalike and say so under "Where the values came from".

Headings use the display face at the weight and letter spacing set at the top
of `src/styles/global.css` (`--display-weight`, `--display-tracking`). A
display face that comes in one weight only needs the weight set to the one it
has, usually 400, and the spacing to 0; otherwise the browser fakes a bold.

## Logo, icons and share image

`logo.light` sits on paper and `logo.dark` on dark grounds, both with the size
they render at in the header. With no logo the header shows the site name in
the display face. Icons: the SVG favicon, 32 and 192 pixel PNGs and the 180
pixel Apple touch icon, all in `public/brand/`. `share` is the 1200×630 image
shown when a page is shared.

## Imagery

Notes on the business's photography and illustration go here: what there is,
what to keep, what to avoid.

## Changing the brand

1. Edit the values at the top of this file.
2. `npm run brand`, which also runs before every build. It prints each colour
   with its contrast on paper and stops on any problem.
3. `npm run check`. `tests/brand.test.mjs` fails the build when a role is
   missing, text is under 4.5:1 on paper, a font has no source, a brand file
   is absent, a component names a colour or font directly, or an inverse set
   does not read.
