---
ng-advanced-table: patch
---

Publish a nightly snapshot of `main` to npm under the `next` dist-tag, with an npm provenance attestation.

Every green CI run on `main` now publishes `<next-stable>-next.<commits-since-last-tag>` under `next` (for example `2.13.0-next.7`), so consumers can try unreleased work with `npm i ng-advanced-table@next`. The base is the version the pending `.nx/version-plans/` entries already ask for — the highest bump any of them requests, so a tree carrying a `minor` plan previews as `2.13.0-next.…` rather than `2.12.2-next.…` — and falls back to a patch bump when nothing is pending. Nightlies are semver prereleases on a non-`latest` tag, so existing `^`/`~` ranges are unaffected. The nightly path deliberately bypasses `nx release` — it only stamps the built manifest — so pending version plans, the changelog, and release tags stay owned by the manual stable release.

Nightlies get no changelog of their own, because a snapshot is a single commit whose prose already exists as a pending version plan and lands in `CHANGELOG.md` at the next stable cut. Each Nightly run instead summarizes those pending entries alongside the source commit and a comparison against the last stable tag, so `@next` consumers can see what they are getting. Quick Start documents both channels.
