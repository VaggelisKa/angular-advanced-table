---
ng-advanced-table: patch
---

Fix build-time CSS optimization where the viewport-sticky scroll animation keyframes were being purged during production builds (hosted on Vercel). By referencing the animation name outside of the `@supports` condition block, CSS minifiers (e.g. cssnano's postcss-discard-unused) now correctly recognize the keyframe as used and preserve it in the compiled stylesheet.
