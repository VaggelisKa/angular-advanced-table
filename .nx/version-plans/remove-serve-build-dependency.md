---
ng-advanced-table: patch
---

Keep the normal Nx `serve` target building upstream package outputs, compile showcase unit tests against library source, and add a dedicated `serve-e2e` target so Playwright can start the showcase dev server without recursively re-entering package builds.
