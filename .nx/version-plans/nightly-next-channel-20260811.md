---
ng-advanced-table: patch
---

Publish a nightly snapshot of `main` to npm under the `next` dist-tag, and add npm provenance attestations to both publish paths.

Every green CI run on `main` now publishes `<next-patch>-next.<commits-since-last-tag>` under `next` (for example `2.12.2-next.7`), so consumers can try unreleased work with `npm i ng-advanced-table@next`. Nightlies are semver prereleases on a non-`latest` tag, so existing `^`/`~` ranges are unaffected. The nightly path deliberately bypasses `nx release` — it only stamps the built manifest — so pending version plans, the changelog, and release tags stay owned by the manual stable release. Quick Start documents both channels.
