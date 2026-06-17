---
ng-advanced-table: patch
---

Fix vertical viewport-sticky header custom offset property parsing to correctly resolve non-pixel units (such as rem, em, vh, etc.) to absolute pixel offsets, preventing offset layout issues when using non-pixel styling units on --nat-table-sticky-top. Guard IntersectionObserver instantiation to support non-browser or test environments where it is undefined.
