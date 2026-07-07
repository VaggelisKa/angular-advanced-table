# Styling

Use this reference for themes, density, cell alignment, semantic tones, and layout.

## Theme Contract

- Use the public `--nat-table-*` CSS custom-property contract.
- Scope product themes on a wrapper around `<nat-table-surface>` or the table feature component. Wrapper tokens always win over the stock surface theme: the library never declares public tokens, only internal `--sys-nat-table-*` fallback bridges.
- Do not set or reference internal `--sys-nat-table-*` variables.
- Canonical shape — copy this, then override more tokens as needed:

```html
<section class="orders-theme">
  <nat-table-surface>
    <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
  </nat-table-surface>
</section>
```

```css
.orders-theme {
  --nat-table-color-text: #111827;
  --nat-table-color-accent: #2563eb;
  --nat-table-color-surface: #ffffff;
  --nat-table-header-background: #f9fafb;
}
```

- Keep overrides local unless you intentionally define a global table theme.
- Do not target private library classes.
- Do not use removed shorthand tokens such as `--text`, `--accent`, or `--surface`.

## Column And Cell Styling

- Prefer column metadata before CSS: `meta.align`, `meta.cellTone`, `meta.cellHeight`, and `meta.cellMaxLines`.
- Use `meta.align: 'end'` for numeric columns.
- Do not rely on semantic tone color alone.
- Use `cellMaxLines: Infinity` only when row height may grow.
- Keep row actions and compact utility columns explicitly sized through column sizing metadata.

## Layout

- Choose `columnSizingMode="fill"` when the table should stretch to the available width.
- Choose `columnSizingMode="fixed"` when configured column widths should drive horizontal scrolling.
- Pair wide fixed tables with `NatTableScrollControl` from `ng-advanced-table/components`.
- Avoid hiding headers, transforming rows, or changing internal display values.

## Consumer Components

- Style custom cells inside the cell component or design-system tokens.
- Keep focus indicators visible for custom buttons, menus, links, and inputs.
- Keep icons decorative only when the control already has visible text or an accessible name.
- Test pinned columns, row hover, selected rows, loading rows, empty rows, and error rows against the product theme.
