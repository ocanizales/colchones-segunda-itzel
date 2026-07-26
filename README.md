# Colchones Segunda Itzel

Landing page for a used-mattress store in Mexicali, Baja California.
Vite + React 18 + Tailwind 4. Originally exported from Figma Make.

Pipeline: **Figma → Claude (SEO) → GitHub → cPanel**

Deploys automatically to HostGator over FTPS on every push to `main`.
A manual cPanel Git Version Control path is kept as a fallback.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # writes dist/ — ALWAYS run before committing
npm run preview  # serve dist/ locally, exactly as cPanel will
```

**`dist/` is committed**, which is unusual and worth understanding. The FTPS
workflow builds its own copy and does not read the committed one, so for the
primary deploy path it is dead weight. It exists only so the cPanel Git
fallback has something to copy when the server cannot build. Nothing enforces
that it stays current any more, so treat it as possibly stale: run
`npm run build` and commit before relying on the fallback.

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

Host: HostGator, cPanel user `larva`, document root
`/home3/larva/segundaitzel.mx/`.

Two paths exist. **The FTPS workflow is the primary one** — it is the only one
that is actually automatic. The cPanel Git path is a manual fallback for when
FTP is unavailable.

### Primary — GitHub Actions over FTPS

`.github/workflows/deploy.yml` runs on every push to `main`: `npm ci`,
`npm run build`, then uploads `dist/` over FTPS. Only changed files are sent;
sync state lives in `.ftp-deploy-sync-state.json` on the server. Delete that
file to force a full re-upload.

Required repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
| --- | --- |
| `FTP_SERVER` | FTP hostname, e.g. `ftp.segundaitzel.mx` — hostname only, no `ftp://` |
| `FTP_USERNAME` | Full FTP username, e.g. `larva` or `deploy@segundaitzel.mx` |
| `FTP_PASSWORD` | That account's password |

`server-dir` is set in the workflow, not a secret, because a directory name is
not sensitive. It is **relative to where the FTP account lands on login**, not
an absolute filesystem path — the most common cause of a deploy that reports
success while the site never changes. A main cPanel login lands in
`/home3/larva`, so the target is `segundaitzel.mx/`. A domain-scoped FTP
account lands directly in the document root, so it would be `./`.

Prefer a dedicated FTP account (**cPanel → FTP Accounts**) over the main login:
it can be scoped to this one directory and revoked without changing the cPanel
password.

### Fallback — cPanel Git Version Control

1. **SSL/TLS Status** → run *AutoSSL* **before the first deploy**. `.htaccess`
   forces HTTPS, so deploying first would redirect to a certificate that does
   not exist yet.
2. **Git Version Control** → *Create*:
   - Clone URL: `https://github.com/ocanizales/colchones-segunda-itzel.git`
   - Repository Path: `/home3/larva/repositories/colchones-segunda-itzel`
   - Branch: `main`

   The repo is public, so no deploy key is needed. If it is ever made private,
   cPanel needs an SSH deploy key added to GitHub first.

Then per update, in **Manage → Pull or Deploy**: **Update from Remote**, then
**Deploy HEAD Commit**, in that order. Deploying without pulling redeploys the
old commit. cPanel has **no webhook and does not auto-pull**, so this path is
always two manual clicks.

`.cpanel.yml` attempts `npm ci && npm run build` on the server, then copies
`dist/.` to the document root. The build is best-effort: shared hosting often
has no `npm` on the deploy PATH and enforces a memory limit that kills Vite. On
failure it logs `SERVER BUILD SKIPPED` and copies the committed `dist/`
instead, so a deploy never leaves the site half-written. Check the deploy log
for that string to know which one you got.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `Input required and not supplied: server` | The three FTP secrets have not been added yet |
| Action succeeds but the site never changes | `server-dir` is wrong — files landed in the wrong directory |
| `530 Login authentication failed` | Wrong username form; try the full `user@domain` |
| FTPS handshake fails | Host does not support FTPS on 21; try `protocol: ftp` or port 990 |
| Deploy button greyed out (cPanel path) | `.cpanel.yml` missing, or no new commit to deploy |
| Site shows an old version after a cPanel deploy | Pulled without deploying, or the server build was skipped and the committed `dist/` is stale |
| Blank white page | Assets 404ing — deployed to the wrong document root |
| Redirect loop | AutoSSL has not issued a certificate yet |
| `Repository is not empty` on clone | Point Git Version Control at a fresh path, not the document root |
