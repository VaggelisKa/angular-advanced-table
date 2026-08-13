---
ng-advanced-table: patch
---

Refresh the workspace dependency overrides so security patches can reach the tree again.

The overrides exist because Nx exact-pins its transitive dependencies — `nx@22.7.3` declares `axios: 1.16.0`, `brace-expansion: 5.0.5`, `tmp: 0.2.4`, `yaml: 2.8.0`, `form-data: 4.0.5` as exact versions rather than ranges, so an upstream patch release never reaches the graph on its own and only a workspace override lifts it. That nested Nx arrives through `lint-suite`, so it lags the root Nx version independently of what the root is on.

Two properties of the old block had quietly inverted its purpose. The entries were exact pins, so `brace-expansion: '5.0.6'` — added to fix one advisory — became the reason the three later `brace-expansion` fixes could not land. The selectors were also keyed to a parent version (`nx@22.7.3>…`, `@nx/webpack@23.1.0-beta.0>…`), which stops applying the moment that parent bumps, with no install error to signal that the tree went back to resolving vulnerable versions on its own. Entries are now scoped by the major being replaced and expressed as ranges, so later patches flow in automatically and a parent bump cannot silently disable them. A new `axios@1` entry covers the same exact-pin class, which had no override at all.

This is workspace tooling only: no library source, public API, or published dependency range changes.
