---
name: nat-best-practises
description: ng-advanced-table best practises. Use when building, modifying, reviewing, or documenting Angular data tables with ng-advanced-table, including setup, columns, state, custom controls, accessibility, theming, localization, export, and render metrics.
---

# ng-advanced-table Best Practises

Use this skill to generate consumer code that uses the public `ng-advanced-table` APIs correctly.

## Process

1. Map the table contract before writing code.
   Completion: row type, stable row id, data lifecycle, interactions, controlled state, imports, and custom controls are clear.

2. Choose imports from the public entry points only.
   Completion: table APIs come from `ng-advanced-table`; companion controls from `ng-advanced-table/components`; render diagnostics from `ng-advanced-table/render-metrics`; locale providers from `ng-advanced-table/locale`.

3. Open the reference files for the task branch before coding.
   Completion: only the relevant files below are read and applied.

## Context Pointers

- For setup, imports, columns, header actions, custom sort indicators, state, and table rows, read [table-patterns.md](table-patterns.md).
- For server-side sorting, filtering, pagination, requests, and retries, read [manual-data.md](manual-data.md).
- For search fields, filter menus, toolbar widgets, and bulk controls, read [consumer-ui.md](consumer-ui.md).
- For custom cells, row actions, interactive controls inside cells, or `flexRenderComponent`, read [custom-cells.md](custom-cells.md).
- For accessibility rules, keyboard flow, table naming, and control names, read [accessibility.md](accessibility.md).
- For theme tokens, density, layout styling, and consumer overrides, read [styling.md](styling.md).
- For localization, export, render metrics, and final review checks, read [quality-and-optional-features.md](quality-and-optional-features.md).

## Non-Negotiables

- Keep app-specific fetching, actions, dialogs, routing, and analytics outside the table primitives.
- Patch the intended state slice and preserve unrelated slices.
- Always include table names, column labels, keyboard-reachable controls, and WCAG AA contrast.
- Style through `--nat-table-*` custom properties, not private classes or removed shorthand tokens.
