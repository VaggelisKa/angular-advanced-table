---
ng-advanced-table: patch
---

Fix viewport-sticky headers detaching and floating over rows on mobile browsers. The JavaScript fallback now reads the header's live position from the table rect (instead of a cached `window.scrollY` page offset) and compensates for `visualViewport.offsetTop`, and both the fallback and the CSS scroll-timeline range now re-measure on `visualViewport` scroll/resize. This keeps the header docked during compositor-driven momentum scrolling and while the mobile URL bar collapses/expands, which previously caused the header to drift out of position on real devices.
