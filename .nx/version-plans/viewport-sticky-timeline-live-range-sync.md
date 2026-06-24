---
ng-advanced-table: patch
---

Fix viewport-sticky headers drifting below page chrome on mobile by keeping scroll-timeline animation ranges anchored to cached layout measurements and nudging the range start from live table geometry during scroll. Restore transform-based scroll keyframes because animating a registered custom property prevented the sticky translate from running in production builds.
