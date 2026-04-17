---
'ng-advanced-table': minor
---

Expose a fully CSS-variable-driven theming API for `<nat-table>`. Every color, border, radius, spacing, font, transition, focus ring, and shadow used by the component is now resolved from a `--nat-table-*` custom property, so any visual detail can be overridden without targeting internal class names. A semantic palette layer (`--nat-table-color-accent`, `--nat-table-color-text`, `--nat-table-color-surface`, etc.) drives the rest of the tokens via `color-mix()`, and legacy shorthand variables (`--accent`, `--surface`, `--text`, …) continue to work as fallbacks for the new color tokens.
