---
ng-advanced-table: patch
---

Optimize vertical viewport-sticky header scrolling performance to achieve 60fps/120fps with zero layout reflows/thrashing. This is achieved by caching vertical offsets, dimensions, and element references on renders, resizes, and visibility changes, and using simple scroll-arithmetic calculations during scroll events. Includes visibility tracking using IntersectionObserver.
