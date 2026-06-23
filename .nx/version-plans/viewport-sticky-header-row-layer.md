---
ng-advanced-table: patch
---

Move viewport-sticky header synchronization from individual header-cell transforms to a single header-row transform layer. This reduces mobile scroll synchronization work and prevents CSS scroll-timeline keyframes from overriding the JavaScript fallback in browsers without scroll-timeline support.
