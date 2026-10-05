# Frontend correction milestone - 5 October 2026

This patch starts from `main` at `22d7fc78db9a164d6576cf77fdbd167645fcf3cd`.
The dashboard corrections, restored teal palette, glass styling and motion were
reviewed and approved for commit and push on 5 October 2026.
No deployment or database credentials were added.

## Design and behavior

The canonical PROJECT_NODE, CURRENT_STATUS and CODEX_BUILD_SPEC handoff files were
read again. The approved desktop Today’s Tasks, Animal Management and Staff Login
frames were inspected in the anonymous Figma viewer at
`https://www.figma.com/design/rAYI0hpuL3R3WQlJ9gpVuc`.

After reviewing the correction on 5 October, the user requested the earlier teal
palette again. Both surfaces therefore use the previous shared colour tokens:
teal `#123E35`, raised teal `#10362F`, pale green `#DFECCB`, green `#C9D89B` and
soft orange `#F3A36A`, including their original text, border, status and shadow
colours. This is the reviewed palette for both public and staff surfaces. Primary
buttons and selected navigation use the earlier pale-green fills. The new layouts,
behaviour and typography remain: Londrina Solid supplies display type, Poppins
headings, and Instrument Sans body copy. Fonts are self-hosted from
the official `google/fonts` repository with their OFL licenses in `public/fonts/`:
`ofl/londrinasolid`, `ofl/poppins` and `ofl/instrumentsans`. The restored colour
system remains global, including inputs, rings and decorative shell patterns.

Today has six fictional tasks across medication, feeding, photo and measurement.
Counts and priority order derive from shared in-memory task state. Completion and
undo update the counts and filtered timeline, persist through client navigation,
and reset on refresh. The reproducible fixture clock is 10:00 on 5 October 2026,
initially showing 1 overdue, 4 upcoming and 1 completed task. Medication names,
doses and clinical instructions are intentionally absent from these fixtures.

Animal Management uses four summary metrics, care-status filter chips, combined
search/species/status filters, linked animal cards and an empty/reset state.
The fictional records now represent reptiles consistent with TCSA's focus.
The medication metric counts animals with outstanding medication tasks today;
it is not a count of prescriptions or ongoing courses. Decorative portrait
placeholders follow the design without implying gallery photos depict cases.
Existing profile, intake and report flows remain available. Profile next-care
details follow outstanding tasks when an animal has tasks in today's timeline.

Staff Login provides labelled username/password fields, a password visibility
toggle, required/whitespace validation and an unavailable-sign-in alert.
Submitting never transmits or persists credentials, never creates a session,
and never claims authentication succeeded. It clears the password and stays on
the form. Workspace URLs remain directly accessible for local frontend review.
The tail shortcut is navigation only, with a transparent 44px square target,
a screen-reader label and keyboard focus ring. The rest of the logo is inert.

Public width, images and section order are preserved. Existing shell patterns
remain; five overlapping rings appear on the hero and Support Us transition.
No implementation or design notes appear in product copy.

## Route contract

| Route | Destination |
| --- | --- |
| `/` | Reviewed public landing page |
| `/about` | `/#about-us` |
| `/contact` | `/#contact-dirk` |
| `/support` | `/#support-us` |
| `/education` | `/#education`, the existing educational-talk mission paragraph |
| `/staff/login` | Staff login UI |
| `/login` | Redirect to `/staff/login` |
| `/dashboard` | Redirect to `/dashboard/today` |
| `/dashboard/today` | Task summary and priority timeline |
| `/dashboard/animals` | Animal Management cards |
| `/dashboard/animals/new` | Existing intake form |
| `/dashboard/animals/:id` | Existing animal profile |
| `/dashboard/reports` | Existing derived report counts |

Public navigation uses the same real landing sections from every public route.
Section redirects scroll and focus the destination. There is no duplicate
generic About or Contact page. Education is a documented section alias, not a
new educational content page. Production deep links still need host fallback.

## Verification

Oxlint, production build and the three Node task-state tests pass. Browser checks
cover completion/undo, counts, task filters, combined animal filters, no-results
reset, profile links, login required fields and password visibility, unavailable
sign-in without navigation, route aliases, mobile navigation, and the tail link.
All six public/workspace screens fit 320px and 834px viewports without horizontal
overflow or controls extending beyond the usable width. Phone task actions are
44px high. Mobile navigation closes after route selection. A task disappearing
from a filtered view returns keyboard focus to its filter. The tail measures
44 by 44px on a phone, works with Enter, and leaves the logo centre inert.

The built frontend was also opened through `npm run preview` on port 4173.
Its task counts and completion action work, all fonts load, and the browser
reports no warnings or errors. Intake adds a fictional record and updates the
animal summary; refreshing resets it. All 17 public images load, and the public
desktop page has no horizontal overflow. PHP syntax and the Vite-proxied health
endpoint still pass. Git whitespace checks pass with CRLF line endings accounted
for. Checks were performed before staging this milestone. Review screenshots were saved
outside the repository in the task's outputs folder.

## Remaining work

The public photos, coffee artwork and sponsor logos are still the documented
screenshot substitutes. Original exports remain unavailable and must replace
them before final submission; no original assets were recovered in this patch.
This is a correction of the reviewed screens, not a claim of complete
pixel parity across all Figma pages. Task creation/editing, clinical records,
authentication, authorization, API persistence and fuller report tools remain
future reviewed slices. No database credentials or deployment were added.
