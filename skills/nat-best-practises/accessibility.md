# Accessibility

Use this reference for custom cells, custom controls, toolbar commands, localized copy, and state rows.

## Table And Column Names

- Give every table a visible `caption` or an `accessibleName`.
- Put `meta.label` on every visible column, even when the current `header` is a string.
- Mark the identifying column with `meta.rowHeader: true`.
- Use `meta.hiddenHeaderLabel` for action, selection, icon-only, or component headers.
- Localize generated labels with the matching locale providers.

## Custom Cells

- Use `flexRenderComponent(...)` for Angular component cells.
- Put `ngGridCellWidget` from `@angular/aria/grid` on the real focusable element inside an interactive cell component.
- Use native `<button>` for actions and `<a>` for navigation.
- Include row identity in visible text or the accessible name.
- Avoid nested interactive controls inside one button/link.
- Do not rely on color alone for status cells; pair color with text, icon labels, or other semantic signals.

## Toolbar And Consumer Controls

- Put toolbar controls on `natToolbarItem` or inside `NatToolbarGroup`.
- Keep DOM order aligned with the visual, screen-reader, and roving-keyboard order.
- Label search fields, filter menus, bulk actions, and row action menus.
- Keep visible words inside accessible names when a control has visible text.

## State Rows And Focus

- Render loading, empty, and error UI through `dataStatus` plus `natTableLoading`, `natTableEmpty`, or `natTableError` templates.
- Include visible text in custom state templates; do not communicate state only with an icon, spinner, or color.
- After a row action opens and closes a menu or dialog, return focus intentionally.
- After a row disappears because of delete/archive/filtering, move focus to a predictable remaining control or row.
- Verify keyboard flow through cells, controls, and toolbar items.

## Review Checks

- The table has its own name.
- Column labels are meaningful when read outside the visual grid.
- Custom controls expose names, roles, states, and keyboard behavior through real controls.
- State rows communicate loading, empty, and error states through text.
- Text, focus indicators, pinned columns, semantic tones, and custom controls meet WCAG AA contrast.
