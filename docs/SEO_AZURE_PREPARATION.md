# Public SEO and Azure preparation

This checkpoint preserves the public page's content, images, section order and visual system. No Azure resource, domain, deployment or production credentials were created.

## Public discovery

- The title names TCSA and Tortoise Conservation South Africa. The description covers conservation, reptile rehabilitation, donations and the existing contact journey.
- `npm run build` renders the existing public React components into the homepage HTML. Content and links are available without waiting for JavaScript; React hydrates the same page for navigation and animation.
- Open Graph and Twitter metadata use the existing pond image once a public origin is configured. Replace the screenshot-derived photos/logo with original approved assets before the final launch where possible.
- Organization JSON-LD uses only existing public facts: organization name, founding year, South Africa, contact email and telephone. No street address, social account, legal status, opening hours or animal cases are invented.
- The public site remains one page. About, Support, Contact and Education are sections, so the sitemap includes only `/`. Legacy page paths redirect to those sections in the routing contract.
- Staff, login and error pages use `noindex, nofollow`; staff HTML contains no public-page content or organization metadata. Authentication still controls staff data. SEO directives are not access controls.
- JSON API responses also carry `X-Robots-Tag: noindex, nofollow`.

## Domain still pending

The original Figma website frame, `HIUzMJNOBMJiqloYjQW4oe`, node `2907:20712`, was inspected in the anonymous viewer. Its footer lists the existing Gmail and WhatsApp contacts, but no TCSA website domain. The Rescue Roast shop URL is an external partner link, not TCSA's canonical origin. No domain has been selected or registered.

Copy `client/.env.example` to `client/.env.local` for local configuration. Only public build settings belong there:

```dotenv
VITE_SITE_URL=
VITE_ALLOW_INDEXING=false
```

With no domain, builds are previews: `robots.txt` blocks crawling, HTML uses noindex, canonical/absolute image URLs are omitted and no sitemap is generated. Once the real HTTPS domain is chosen, set `VITE_SITE_URL` to its origin and enable `VITE_ALLOW_INDEXING=true` only for the public production build. The build rejects indexing without an origin and rejects HTTP, local origins, URL credentials, query strings or section paths. Azure preview slots must retain indexing disabled.

Do not put database credentials or PHP secrets in `VITE_` variables. These settings are embedded in the browser bundle.

## Azure hosting direction

Azure App Service on Linux supports the current PHP backend. Serving `client/dist` and the endpoint whitelist from one origin retains same-origin session cookies and `/api` requests. Static Web Apps is an alternative for the frontend, but PHP must run on a separate supported backend such as App Service; backend linking and the chosen plan need review.

`deployment/azure-routing.conf` is an unapplied Nginx routing excerpt. Merge it into the selected PHP runtime's existing server configuration and review its upstream and HTTPS proxy handling. Do not replace the whole platform configuration with this excerpt. It specifies:

- The static document root is `client/dist`, never the repository root.
- `/` serves the pre-rendered homepage. Staff deep links use `staff.html` with an HTTP noindex header, rather than the public homepage fallback.
- Unknown paths and missing files return HTTP 404. The separate error HTML is noindex.
- Public legacy paths use permanent redirects to homepage sections.
- Only the listed PHP API endpoints execute. Internal libraries, provisioning scripts, environment files, SQL and session storage are never exposed.

PHP's production HTTPS detection must be verified against the actual Azure forwarded-header setup. The excerpt's `HTTPS $https` assumes the selected Nginx runtime's TLS handling; Azure may terminate HTTPS before Nginx. Use only trusted platform proxy information in the final configuration, and verify Secure session cookies and origin checks end to end. Database provisioning, production password setup, shared session storage/scaling and secret management are separate launch prerequisites.

## Local checks and launch follow-up

Run `npm run lint`, `npm run build`, `npm test` and `npm run test:seo` from `client`. The build checks inspect the actual HTML, sitemap/robots output, public content, image references and absence of staff fixtures. Unit checks verify that production indexing cannot leak into staff, error or preview pages. `npm run preview` uses the built route contract; it serves the frontend only and does not proxy the PHP API.

Before launch, select the domain, attach it to Azure, verify HTTPS and the routing excerpt, and rebuild with the production SEO settings. Use Google Search Console to verify ownership, submit `/sitemap.xml` and inspect the live homepage. Check a staff URL, missing route and missing image over HTTP. Check social previews against the real origin. Search engines cannot index the current localhost preview and no ranking or indexing time is guaranteed.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google robots meta directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), [Vite pre-rendering](https://vite.dev/guide/ssr.html), [Azure PHP configuration](https://learn.microsoft.com/en-us/azure/app-service/configure-language-php), [Static Web Apps with App Service APIs](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-app-service).

Verified locally on 14 October 2026: Oxlint, six frontend/unit tests, production and preview builds, three artifact checks in each build mode, and ten isolated PHP sign-in integration groups passed. A reserved `.example` origin was used only for the production-mode test, then the build was restored to preview/noindex. HTTP checks confirmed homepage 200, staff deep links with noindex and no public markup, missing pages/assets/sitemap 404, robots 200 and permanent public-alias/index redirects. Browser inspection found the expected page metadata, one h1, no broken loaded images, and no console or hydration warnings. The Azure excerpt has not been validated on an Azure runtime or applied.
