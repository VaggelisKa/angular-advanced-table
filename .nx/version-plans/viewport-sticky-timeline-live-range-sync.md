---
ng-advanced-table: patch
---

Keep CSS scroll-timeline viewport sticky headers in sync on mobile by recomputing the animation range from the table's live document position on every scroll and visual-viewport scroll frame, and by subtracting `visualViewport.offsetTop` from the range start so the scroll-timeline translate matches the live-rect JavaScript formula (`stickyTop - rect.top + offsetTop`).
