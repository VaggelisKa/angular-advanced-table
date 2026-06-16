---
ng-advanced-table: minor
ng-advanced-table-locales: minor
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
---

Add interactive column resizing: an `enableColumnResizing` input renders a focusable `role="separator"` handle on each resizable header that supports pointer drag (`columnResizeMode` `'onEnd'` or `'onChange'`) and keyboard resizing (Left/Right Arrow, Shift+Arrow for large steps, Home/End for the min/max bound, RTL-aware). The new `columnSizing` state slice flows through `state`/`initialState`/`stateChange` plus a granular `columnSizingChange` output, resized widths drive both header and body cells, and every user-facing string (handle label, `aria-valuetext`, resize keyboard instructions, live width announcement) resolves through `ng-advanced-table-locales`. The companion UI and utils state contracts gain the matching `columnSizing` field.
