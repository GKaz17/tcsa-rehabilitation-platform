# Phase 1 checkpoint — 4 October 2026

This records the initial Phase 1 checkpoint. The reviewed landing-page
restoration and screenshot asset limitations are documented in `LANDING_REVIEW.md`.

## Source and baseline

Read PROJECT_NODE.md, CURRENT_STATUS.md and CODEX_BUILD_SPEC.md from the canonical
`GKaz17/jarvis-os/01-PROJECTS/tcsa-rehabilitation-platform/` handoff.
Remote main and the original XAMPP checkout were both clean at
`bc70e36846498a458c52e63582768694eea25fed`. Implementation uses an isolated clone,
leaving the original XAMPP checkout untouched.

The baseline package ranges are React 19.2.8, Vite 8.3.0 and Oxlint 1.81.0.
The committed lockfile actually resolves React/React DOM 19.3.0, Vite 8.3.1 and
Oxlint 1.86.0. Baseline npm ci, lint and production build passed before editing.
Those existing locked versions and Oxlint configuration are preserved.
React Router is the sole new application dependency.

## Implemented

- Root client/API/database/docs boundaries and root ignore rules.
- Moved client/health.php to api/health.php with the documented JSON envelope.
- Same-origin client API utility and local Vite-to-PHP proxy.
- Public, staff entry and core dashboard routes, plus route-not-found states.
- Dark-green workspace, white cards, pale-green lines/text, olive/orange accents,
  controlled shadows, spacing/radius/type tokens and five overlapping ovals.
- Responsive navigation, visible focus, skip links, route focus and labelled inputs.
- Fictional overview, animal search/status filters, empty state, profile/history,
  validated in-memory intake, success state and derived reports.
- Root setup documentation covering XAMPP PHP, Vite and Apache alternatives.

## Decisions and limitations

The Figma inspection tools were unavailable during this run. The shell follows the
canonical written visual direction; it is not verified as pixel-identical to the
approved Figma frames. The system font is a provisional fallback pending confirmation
of the approved font. Exact labels, font assets, public copy and brand artwork must be
reconciled with both Figma references before the visual review is closed.

The public pages are restrained route stubs; no contact address, organisational
claims or working enquiry submission were invented. The login route is a transparent
demo entry, with no password form or authentication. No user data is persisted.
Dates are fixed to the demo day to avoid displaying stale fixtures as live work.
Loading/error behavior for animal fetches, edit flows, confirmation overlays,
exports and real authentication remain for later slices. API failures are handled
by the client utility; mock animal screens do not simulate network loading.

No deployment configuration, database credentials, connection, migrations or
production schema were added. No original generated assets or user work were lost;
unreferenced demo assets remain available in Git.

## Next slice

Reconcile Figma frames and typography, then review the MySQL animal/case schema,
implement validated prepared-statement PHP endpoints and replace the mock animal
journey with loading/error/success states. Choose hosting after local boundaries
and that vertical slice are stable.
## Verification inventory

- Baseline and final: dependency install, Oxlint, Vite production build, PHP syntax.
- All public/core dashboard routes and missing-page/record states render directly.
- Public-to-login-to-dashboard navigation and browser reload work.
- Search and status filters combine; no-match/reset behavior returns records.
- Profile/history, required/whitespace intake validation, local success, report counts
  and refresh reset behave as documented.
- Mobile menu toggles/collapses on selection and essential actions remain reachable.
- Layout review: 1440px desktop, 834px tablet, 390px and 320px mobile; no document overflow.
  Animal tables scroll inside their named keyboard-focusable region on narrow screens.
- PHP health through the Vite proxy and client utility success/error handling.
- Separate screenshots inspected for desktop, tablet and mobile. Figma parity remains pending.

## Verified results

Baseline and final Oxlint and production build: passed. PHP 8.2.12 syntax check:
passed. Vite development server started successfully; the relocated PHP health
endpoint returned the expected data through its same-origin proxy.

Chromium smoke checks passed for all 12 core/fallback routes at 1440, 834, 390 and
320 pixels, with no document-level horizontal overflow. Desktop/tablet/mobile
screenshots were reviewed. The public entry path, reload/deep links, combined
search/status filters, no-match reset, case history, required and whitespace
validation, intake success, report updates, refresh reset, mobile menu and cancel
were verified. The API utility correctly rejected a simulated JSON 503 response.
No browser runtime exceptions were observed.

React review: state changes use functional updates; filtered lists and counts are
derived during rendering; reusable components are defined outside render; form
fields and tables are labelled, and decorative rings are hidden from assistive
technology. No additional UI or icon dependencies were introduced.
