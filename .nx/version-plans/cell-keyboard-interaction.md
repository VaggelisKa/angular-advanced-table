---
ng-advanced-table: minor
ng-advanced-table-locales: minor
---

Add the ARIA grid cell-interaction keyboard model: Enter moves focus from a focused grid cell into its first interactive control, Tab and Shift+Tab walk between the grid's controls, and Escape returns focus to the cell. This closes a WCAG 2.1.1 gap where `flexRender`-ed in-cell widgets (sort buttons, action buttons) were not keyboard reachable, and updates the English `keyboardInstructions` copy to describe the new behavior.
