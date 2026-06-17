---
ng-advanced-table: patch
---

Strengthen column-resize test coverage in the core table package. Add an explicit LTR ArrowLeft regression test asserting the first keystroke shrinks the column (region 140 → 132) instead of reversing direction, guarding the reported first-keystroke direction bug. Rework the pointer-drag announcement test to dispatch a real `mousemove`/`mouseup` with movement deltas rather than a no-op down/up sequence, so it exercises an actual resize and can catch a frozen-width regression instead of passing on a zero-delta gesture.
