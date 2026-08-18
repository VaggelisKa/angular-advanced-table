---
ng-advanced-table: patch
---

Cut stable releases on a weekly schedule instead of only on demand.

The Release workflow now runs every Friday at 09:00 UTC as well as on `workflow_dispatch`, so pending version plans ship on a predictable cadence rather than waiting for someone to press the button. Both triggers take the same release path — consume `.nx/version-plans/`, write the changelog and release commit, tag, and publish to `latest`.

A preflight job gates the scheduled run, because nobody is watching it: it releases only when version plans are actually pending and the push CI run for the exact commit it would ship concluded `success`. Anything else — nothing pending, CI missing, still running, or red — skips the week with a run summary explaining which, and the release goes out by hand once the cause is cleared. A manual dispatch is unchanged in spirit: it skips the CI gate as a deliberate act, and fails loudly instead of silently no-opping when there is nothing pending.

Both jobs check out `${{ github.sha }}` explicitly — already the `actions/checkout` default, but stated so the preflight verdict and the released tree provably name one commit — and the release job re-checks that `main` is still at that commit immediately before publishing. An npm publish is permanent while the release commit still has to fast-forward `main`, so a run that started before `main` moved now fails ahead of the registry write instead of leaving a published version with no commit, tag, or changelog behind it.
