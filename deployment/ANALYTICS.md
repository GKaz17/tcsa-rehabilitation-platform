# Public website analytics

The TCSA Web stream Measurement ID supplied during setup is `G-Z0XK8ERT14`.
This public identifier is not a password or Measurement Protocol API secret.

The production build inserts one Google tag initializer immediately after the
public HTML head. It loads gtag.js only at the configured HTTPS origin and root
path. Staff and error documents contain no tag. The turtle-tail staff entry and
links returning from private pages load a new document so public tracking does
not carry into the care workspace. The public journey and appearance are retained.

The tag uses the canonical public root as page_location. Referrers are reduced
to an external origin; private same-site referrer paths are omitted. No staff
email, user ID, care record, password, form value or query string is deliberately
added to analytics parameters. Google Signals and advertising personalization
are disabled. This does not itself implement a visitor consent interface or
establish compliance with every applicable privacy requirement.

## Production build

Set these public build variables before running the client build:

```text
VITE_SITE_URL=https://tcsa-rehabilitation-gkaz17-hebyf0hnd4cze8cb.southafricanorth-01.azurewebsites.net
VITE_ALLOW_INDEXING=true
VITE_GA4_ID=G-Z0XK8ERT14
```

Run `npm run lint`, `npm test`, `npm run build` and `npm run test:seo` in client/.
Use the normal runtime allowlist packager and its inventory test to make a fresh
release. Preview builds omit tracking; do not use preview visits as production
traffic. The draft Azure workflow includes the ID but has not been activated.
Do not replace the current Azure startup script with the older release that
predates the session-file ownership correction.

## Acceptance after deployment

1. Check the actual homepage contains the ID and one public initializer; staff
   and 404 HTML must have no Google tag. Confirm the session endpoint still works.
2. Run Google Analytics Test installation against the actual public hostname.
3. Open the public site in a browser, visit its sections and use the Google
   Analytics Realtime report or DebugView to confirm receipt. An HTTP response
   or code-presence check alone is not proof that Google received an event.
4. Record setup/test time, the report date range and the fact that developer
   verification visits are test traffic. Do not call them independent visitors
   or organic search results. Check subsequent standard reports after processing.
5. Capture actual users/new users, sessions, acquisition, engagement, geography,
   devices and available events/insights. Missing or limited data is a report
   limitation, not a reason to invent results.

Google Search Console verification, sitemap submission, actual indexing status
and search-performance evidence are separate steps and remain pending.

References:
- https://developers.google.com/tag-platform/gtagjs/configure
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot
