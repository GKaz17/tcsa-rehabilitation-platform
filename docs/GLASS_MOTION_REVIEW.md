# Glass and motion checkpoint - 5 October 2026

This checkpoint was reviewed and approved for commit and push on 5 October 2026.
No deployment was performed.

The user's restored teal palette and existing content order remain. Shared glass
tokens supply lightly frosted navigation, page headers, contact and white cards.
Highlights, thin borders and soft ambient light give depth while maintaining
readable text. Browsers without backdrop-filter retain solid base surfaces.

References inspected: React Bits [Glass Surface](https://reactbits.dev/components/glass-surface)
and [Fade Content](https://reactbits.dev/animations/fade-content), including their
official source in `DavidHDev/react-bits`. This implementation is an original,
lightweight adaptation using CSS, IntersectionObserver and Web Animations. No
React Bits code was vendored and no GSAP/WebGL dependency was added.

The public navbar contains an original decorative turtle vector. Separate CSS
transforms move it along a bounded track, turn it at each end, bob its body and
alternate its legs. The 44px labelled pause/resume control stops all of those
animations together. The turtle cannot intercept navigation clicks and is hidden
from assistive technology. It is separate from the unchanged footer staff entry.

The hero has a brief staggered entrance and gentle photo settle. Public sections
reveal once as they enter view; content remains visible if animation APIs are
unavailable. Focused destinations skip reveals. Section navigation scrolls
smoothly, while reduced-motion preferences disable turtle/hero motion and bypass
section reveals. Enabling that preference cancels active reveal animations.
Observers and animations clean up on unmount; React does not update each frame.

Oxlint and the production build pass. Browser checks confirm blur on shared
surfaces, fully visible finished reveals, section focus/scroll destinations,
running and paused turtle states, and no horizontal overflow on public and task
screens at 320px and 834px. Navbar links and pause control meet 44px targets, and
the turtle track stays below the links. The normal viewport was restored.
Source review confirms reduced-motion and solid-background fallbacks. Desktop
screenshots are saved in the task outputs folder outside the repository.
