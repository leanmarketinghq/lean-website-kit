# Lean Website Kit

A website for your business that Claude builds and publishes for you. You bring your words and your logo. Claude does the building, your site's files are kept in your own GitHub account, and the site goes live on your own Cloudflare account. All of it is yours.

## What you need

- **The Claude desktop app** on a paid plan (Pro or higher): [claude.com/download](https://claude.com/download)
- **A free GitHub account**: [github.com/signup](https://github.com/signup)
- **A free Cloudflare account**: [dash.cloudflare.com/sign-up/workers-and-pages](https://dash.cloudflare.com/sign-up/workers-and-pages)

There is nothing else to install.

## Four steps

1. **Click this button.**

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/leanmarketinghq/lean-website-kit)

   Cloudflare asks you to connect your GitHub account and to name your site. It then makes two things: your own copy of this kit in your GitHub account, and a starter site, live at an address that ends in `workers.dev`. Keep that address.

2. **Open your copy in Claude.** In Claude, click the **Code** tab. Under the message box, click the first control and choose **Cloud** (if it lists more than one, **Default**). Then click the control beside it and pick the repository Cloudflare just made. The first time, Claude asks to connect to your GitHub account: follow its prompts, and when it offers to install the Claude GitHub App on your account, accept, so Claude can open your copy.

3. **Type `Build my website` and attach your documents.** Click the **+** beside the message box and add your messaging guide, your tone of voice guide, the copy for your page and your logo. PDF or plain text files work best. Claude asks you a few questions, builds the site and gives you a link to look at. Tell it what to change, in plain words, until you're happy.

4. **Type: `Put it live.`** Claude saves the finished site to your GitHub account, and Cloudflare publishes it at your address about a minute later.

**Your own domain.** Type `Connect my domain` and the domain's name. If your email runs on that domain, say so first.

**Changing the site later.** Open your repository in Claude again, as in step 2. Say what to change, look at the link Claude gives you, then type `Put it live.`

**Every version is kept.** Your site's files live in your GitHub account with their whole history, so any change can be undone.

## What's in the kit

For the technically minded. Claude reads `CLAUDE.md` for the full instructions; this is the map.

A static [Astro](https://astro.build) site (TypeScript, Tailwind) published to Cloudflare Workers as static files. There is no server code and nothing to maintain. Your repository is connected to your Cloudflare account: every change to its `main` branch is built and published, and a branch named `draft` gets a preview address of its own when preview builds are on.

| What | Where |
| --- | --- |
| Your documents and logo, as you supplied them | `brief/` |
| The brand: colours, fonts, logo, icons, share image | `DESIGN.md`, values at the top and the explanation below them. `npm run brand` writes `src/styles/brand.css` and `src/data/brand.ts`, both generated. |
| Site facts: name, address, navigation, the button, contact details, the form, analytics | `src/data/site.ts` |
| The home page's words | `src/data/home.ts` |
| The home page's sections and their order | `src/pages/index.astro`, built from the parts in `src/components/`: Hero with Proof, TextBlock, Cards, Checklist, Steps, Testimonials, MediaText, Rows, Faq, Cta, Video, LeadForm |
| The contact page | `src/pages/contact.astro` → `/contact` |
| Other pages | `content/pages/*.md`, with `title` and `description` at the top (`About.md` → `/about`) |
| Photographs | `src/assets/`; logo, icons and share image in `public/brand/` |
| Old addresses → new ones | `public/_redirects` |
| Design rules shared by every part | `src/styles/global.css` |
| Tests | `tests/site.test.mjs` (pages, links, images, redirects, sitemap, contact), `tests/brand.test.mjs` (the brand) and `tests/ready.test.mjs` (the placeholder rule) |

```
npm install
npm run dev      # the site on this computer, at http://localhost:4321
npm run check    # brand, build, tests, placeholder check
npm run deploy   # the same, then publish from this computer with Wrangler
```

Node 22.23.4 or newer. Every build runs the tests and the placeholder check; if one fails, nothing is published and the live site stays as it was. `scripts/check-live.sh https://<address>` checks a published site end to end, read-only.
