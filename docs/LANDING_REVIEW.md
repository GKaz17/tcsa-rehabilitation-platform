# Landing page milestone - 5 October 2026

This records the reviewed `22d7fc7` milestone. The subsequent colour,
font, route and tail-target corrections are documented in `FIGMA_PARITY_PATCH.md`.

The landing page follows the original TCSA content journey: pond hero, About Us,
four-photo reptile gallery, Support Us, endorsement/sponsors, and contact details.
Its colors, cards, typography and controls use the same global
tokens as the staff workspace. The client website remains the root route.

## Image provenance and limitations

The original files are absent from the repository. The supplied `website.png`
and the anonymous Figma website instance `2907:20712` in file
`HIUzMJNOBMJiqloYjQW4oe` are the reference. Export access was unavailable.

The raster images in `client/public/images/` are direct screenshots of visible portions
of that Figma preview at 100% zoom. These are temporary screenshot substitutes,
not the original source files or Figma exports. The pond image is a crop without
the overlaid headline; the heading and all other page copy remain HTML. The
coffee artwork and logo retain their original baked-in backgrounds. Sponsor
logos are captured individually. Replace these files with original assets when
available, maintaining their current URLs and alt text.

Donation and business contact details were transcribed from the original website
reference. The Facebook destination was not supplied, so no guessed link is
rendered. Mail and WhatsApp links open the user's own client; no enquiry form or
message submission was added. Other public routes and the dashboard retain their
existing scope. No authentication, database connection or deployment was added.

The current frontend was reviewed and its commit and push approved on 5 October
2026. This milestone covers the landing page, shared styling and client-facing
copy changes. Backend integration and deployment remain outside this checkpoint.

## Local verification

- Oxlint and the Vite production build pass.
- Every captured image was inspected; blank partial captures were replaced.
- All 17 landing images load after scrolling through the page.
- About, Support Us and Contact anchors lead to the original landing sections.
- Landing, dashboard overview and intake fit 320, 390 and 834px viewports,
  measured against the document's usable width including scrollbars. They share
  the same green background and show no developer/demo notes.
- The global body minimum width was removed to prevent scrollbar-induced
  overflow on a 320px viewport. Desktop, phone and full-page screenshots were
  inspected. No new dependencies or credentials were added.

The reviewed spacing refinement uses a container midway between the original
1240px cap and the available screen width (`calc(50% + 620px)`). Header, content
and footer share fluid padding (2.5vw, bounded by 20–40px), while paragraph widths
remain limited for readability. Gallery heights scale with the composition.
Verified at 1920, 1440 and 320px with no horizontal overflow; Oxlint and production
build pass.

The landing page now adds sparse shell-scute patterns down both outer margins
and beside its section headings. `turtle-shell-pattern.svg` is new decorative
vector geometry inspired by the original site's shell motifs, not a recovered
export. CSS masks tint it with the shared green token; varied offsets and low
opacity keep it behind the content. Mobile reduces its visibility and width.
Decorations are hidden from assistive technology and cannot intercept clicks.
Reviewed at 1920, 1440, 834, 390 and 320px with no horizontal overflow. Oxlint and
production build pass. The balanced content width and page journey are retained.

The visible staff workspace button is removed from public navigation, along with
the staff entry section in the public Contact stub. The bottom TCSA logo retains
its raster image; a percentage-positioned polygon link covers only its tail and
opens `/login`. The shell and remaining logo are inert. The link has a screen-reader
label and a visible keyboard-focus highlight, with no visible admin label at rest.
Desktop clicks, Tab/Enter access and the 320px phone layout/navigation were verified.
Authentication and staff authorization remain unimplemented; this entry shortcut
does not restrict direct access to workspace URLs.
