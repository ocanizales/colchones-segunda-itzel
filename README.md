# Colchones Segunda Itzel

Landing page for a used-mattress store in Mexicali, Baja California.
Vite + React 18 + Tailwind 4. Originally exported from Figma Make.

Pipeline: **Figma → Claude (SEO) → GitHub → cPanel**

cPanel pulls this repo directly through Git Version Control and deploys the
committed `dist/`.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # writes dist/ — ALWAYS run before committing
npm run preview  # serve dist/ locally, exactly as cPanel will
```

**`dist/` is committed on purpose.** cPanel's Git Version Control copies files
but cannot run a build, so the compiled output has to be in the repo or there is
nothing for it to deploy. The cost is that source and build can drift: edit
`src/` without rebuilding and cPanel will redeploy the *old* version while the
commit looks correct. CI guards this — it rebuilds from source and fails if the
result differs from the committed `dist/`.

## SEO

Domain: **segundaitzel.mx**. Done so far:

- Removed the `noindex, nofollow` that shipped with the Figma Make export
- Title (55 chars) and meta description (158) targeting *colchones + Mexicali*
- Canonical, Open Graph, and Twitter card — WhatsApp link previews depend on
  these being in the static HTML, which matters here because WhatsApp is the
  primary CTA and its crawler does not run JavaScript
- `FurnitureStore` JSON-LD (the right Schema.org subtype for a mattress
  retailer; generic `LocalBusiness` scores worse for rich results)
- `robots.txt` + `sitemap.xml`
- `tel:` click-to-call on the phone number, which was previously plain text
- City in the `<h1>`, working nav anchors, lazy-loaded cards, eager LCP hero

Business data now in both the schema and the visible page (these must stay in
sync — mismatched NAP is a scored local-SEO defect):

- **Hours** Mon–Sun 09:00–16:00, closed Wednesday
- **Address** Local 16, Río Sena, Col. Virreyes, C.P. 21190, Mexicali, B.C.
- **Geo** 32.6179382, -115.5212309

### Still needed — real data, do not invent

| Field | Why it matters |
| --- | --- |
| `priceRange` | Shown in rich results |
| A real storefront photo | `og:image` currently points at Unsplash stock |
| GBP place link | The coordinates came from the Río Sena street geocode, not the storefront itself. Once the Google Business Profile is claimed, swap `LAT_LNG` in `App.tsx` for the real place link — better directions and an exact pin. |

### Known limits

- **Client-side SPA.** Google renders JS, but WhatsApp, Facebook, and Bing
  crawlers largely do not. Everything crawler-critical is therefore static in
  `index.html`. Prerendering the body copy would be the next real upgrade.
- **Both languages share one URL.** The ES/EN toggle is React state, so there
  is nothing to point `hreflang` at. Spanish is what gets indexed. Splitting to
  `/` and `/en/` is the only way to index both, and is probably not worth it
  for a Mexicali storefront.
- **One page, no service pages.** Dedicated per-service pages are the single
  biggest local-organic factor; this is a one-pager and ranks accordingly.
- Google Business Profile matters more than the site for map-pack visibility.
  Claim it, plus Bing Places — Bing is what ChatGPT reads for local answers.

## Deployment

### One-time cPanel setup

1. **Domains** → add `segundaitzel.mx`. Note the document root, usually
   `public_html`.
2. **SSL/TLS Status** → run *AutoSSL* **before the first deploy**. `.htaccess`
   forces HTTPS, so deploying first would redirect to a certificate that does
   not exist yet.
3. **Git Version Control** → *Create*:
   - Clone URL: `https://github.com/ocanizales/colchones-segunda-itzel.git`
   - Repository Path: `/home/<user>/repositories/colchones-segunda-itzel`
   - Branch: `main`

   The repo is public, so no deploy key is needed. If it is ever made private,
   cPanel needs an SSH deploy key added to GitHub first.

`.cpanel.yml` at the repo root is what makes the Deploy button work — it copies
`dist/.` into `$HOME/public_html/`. cPanel refuses to deploy without it.

### Every update

In **Git Version Control → Manage → Pull or Deploy**:

1. **Update from Remote** — pulls new commits from GitHub into cPanel's clone
2. **Deploy HEAD Commit** — runs `.cpanel.yml`, copying `dist/` to `public_html`

Both, in that order. Deploying without pulling redeploys the old commit.

### Making it automatic

cPanel does **not** auto-pull on push — there is no webhook. Until a cron job
exists, every update needs those two button clicks. To automate, add a cPanel
cron job (**Cron Jobs**, every 15 min or so):

```sh
cd $HOME/repositories/colchones-segunda-itzel && git pull && \
  uapi VersionControlDeployment create repository_root=$HOME/repositories/colchones-segunda-itzel
```

Run it once by hand over SSH first — the `git` and `uapi` paths vary by host,
and some shared plans disable `uapi` from cron.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Deploy button greyed out | `.cpanel.yml` missing, or the branch has no new commit to deploy |
| Deployed but the site is unchanged | Pulled without deploying, or deployed without pulling |
| Site shows an old version despite deploying | `dist/` was committed stale — check the CI run |
| Blank white page | Assets 404ing — `.cpanel.yml` copied to the wrong document root |
| Redirect loop | AutoSSL has not issued a certificate yet |
| `Repository is not empty` on clone | Point Git Version Control at a fresh path, not `public_html` |

The deleted FTPS workflow is in git history (`Add cPanel deployment pipeline`)
if a fully automatic push-to-deploy is ever wanted instead.
