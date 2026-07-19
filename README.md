# gitor.uk

`gitor.uk` is a static Astro library of spiritual literature, sacred texts, philosophy, poetry, and daily quotations. Cloudflare deploys the live website automatically when `main` is pushed to GitHub.

## Local development

The project requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

`npm run dev` regenerates the date-specific diary entries and quote fragments before starting Astro. Generated files under `public/diary/` and `public/quotes/` are intentionally not committed.

## Production build

```sh
npm run build
npm run preview
```

The build must finish without errors. Astro writes the deployable site to `dist/client` and generates the XML sitemap from the configured production URL, `https://gitor.uk`.

## Content sources

Primary source material lives in `src/data`:

- `spiritual_diary.txt` supplies the Europe/Rome daily quotation.
- `quotes.txt` supplies the quotation that changes at 00:00, 06:00, 12:00, and 18:00 Europe/Rome time.
- `gita.txt`, `bible.txt`, and `lawrence_presence.txt` are split into static reading routes during the Astro build.
- `autobiography_of_a_yogi/yogi.html` supplies the 48 Autobiography chapters and their footnotes.

Run `npm run generate-content` after changing either quotation source. The generator validates that it found quotation and diary entries, removes obsolete fragments, and writes deterministic output.

## Search engines

Every public route provides an indexable description, canonical URL, social metadata, and structured data. Astro generates `sitemap-index.xml`, while `public/robots.txt` permits legitimate crawlers.

After a domain or URL-structure change:

1. Confirm `https://gitor.uk/robots.txt` and `https://gitor.uk/sitemap-index.xml` return successfully.
2. Add the domain property to Google Search Console.
3. Submit `https://gitor.uk/sitemap-index.xml` in Search Console.
4. Request indexing for the homepage after major content or metadata changes.

Technical crawlability does not guarantee ranking; indexing timing remains controlled by each search engine.

## Offline installation

The website includes a web app manifest and a versioned service worker. Browsers can install it from the normal browser install menu.

- The homepage and offline fallback are saved during installation.
- Visited pages and assets are cached for later offline reading.
- Navigations, daily entries, and rotating quotations use the network first so returning visitors receive current content and deployments.
- When the network is unavailable, previously visited pages are used; an unvisited route shows the offline page.

When changing caching behavior, update `CACHE_VERSION` in `public/sw.js` so existing installations discard obsolete caches.

## Security and Cloudflare

`public/_headers` defines repository-managed response hardening and cache rules. Cloudflare must also have **Always Use HTTPS** enabled under **SSL/TLS → Edge Certificates**. Enable HSTS at the Cloudflare edge only after confirming that the full site and every asset work over HTTPS.

A strict Content Security Policy is not currently enabled because the reading pages still contain necessary inline styles and scripts. Add CSP only after those inline resources have been moved into hashable or external assets; do not deploy a policy that silently breaks the readers.

## Verification before release

Run:

```sh
npm run build
npm audit
```

Then verify the homepage at desktop and mobile widths, keyboard navigation, the daily and rotating quotations, chapter selection, Autobiography footnotes, the offline fallback, metadata, sitemap, and all homepage destinations.

## Deployment

After verification:

```sh
git add .
git commit -m "Describe the change"
git push
```

Cloudflare automatically builds and deploys the pushed `main` branch.
