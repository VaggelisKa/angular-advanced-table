---
ng-advanced-table: patch
---

Fix viewport-sticky headers lagging behind the viewport during slow upward scroll on touch devices. Browsers that support CSS scroll timelines but expose a dynamic visual viewport (notably mobile Safari) now disable the scroll-timeline animation and use the live-rect JavaScript sync path instead, which tracks `getBoundingClientRect()` and `visualViewport.offsetTop` every frame so the header docks immediately instead of waiting for layout scroll to catch up.
