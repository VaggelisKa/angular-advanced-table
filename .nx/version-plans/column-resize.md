---
ng-advanced-table: minor
ng-advanced-table-locales: minor
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
---

Add interactive column resizing: an `enableColumnResizing` input renders a pointer/touch resize handle on each resizable header (`columnResizeMode` `'onEnd'` or `'onChange'`), with keyboard resizing on the focused column header (Alt+Left / Alt+Right to step the width and Alt+Home / Alt+End for the min/max bound, RTL-aware). The new `columnSizing` state slice flows through `state`/`initialState`/`stateChange` plus a granular `columnSizingChange` output, resized widths drive both header and body cells, and every user-facing string (resize keyboard instructions, live width announcement) resolves through `ng-advanced-table-locales`. The companion UI and utils state contracts gain the matching `columnSizing` field.
