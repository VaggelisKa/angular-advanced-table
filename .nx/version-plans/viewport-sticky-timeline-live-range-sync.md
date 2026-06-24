---
ng-advanced-table: patch
---

Keep CSS scroll-timeline viewport sticky headers in sync on mobile by recomputing the animation range from the table's live document position on every scroll and visual-viewport scroll frame, and by folding `visualViewport.offsetTop` into the range start so URL-bar shifts no longer leave the header lagging during slow reversals.
