---
ng-advanced-table: minor
---

`natToolbarItem` on a wrapper host (an Angular component host, a Stencil or other custom element with an open shadow root) now forwards roving focus to its first focusable descendant without a `natToolbarItemFocusTarget` selector, searching the open shadow root before light DOM, suppressing that control's own tab stop so the toolbar keeps a single Tab stop, and working with or without `delegatesFocus`. Native interactive hosts (`<button>`, `<input>`, …) remain their own target. `natToolbarItemFocusTarget` stays as the explicit override; clearing it on a wrapper now falls back to the implicit target instead of focusing the shell. A dev-mode warning fires once per item when a bare `natToolbarItem` sits on a custom element with a closed shadow root.
