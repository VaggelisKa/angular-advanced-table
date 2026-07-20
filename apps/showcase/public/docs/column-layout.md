## Layout Responsibilities

Column layout covers how columns present at runtime: pinning, ordering, sizing, visibility, and sticky headers. Keep column meaning and cell rendering in the Columns topic; use this topic for presentation state.

## Pinning And Visibility

Pinning keeps important columns at a scroll boundary. Visibility lets users remove columns that are not useful for the current task. Both are state slices, so app-owned controls and companion controls should patch the same table state.

Pin controls are disabled by default; set `[enablePinning]="true"` on the surface to expose the pin menu for all header-action columns, then opt a single column out with `enablePinning: false`. A column's pin availability resolves as `column.enablePinning ?? surface.enablePinning`.

Pinned boundaries use a one-pixel divider by default. A divider shadow is opt-in: set one shared shadow-color token on a wrapper when the table needs stronger separation during horizontal scrolling. The library renders it as a single soft shadow that fades off the pinned edge, mirrors the direction per zone, and applies it only to the outermost visible cell in each pinned zone.

```css
.positions-table {
  --nat-table-pinned-divider-shadow-color: light-dark(rgb(232 235 238 / 35%), rgb(17 20 24 / 50%));
}
```

The shadow supplements the existing divider. Leave the token unset or set it to `transparent` to disable the shadow. The stock theme does not enable divider shadows.

To make the fade softer or more pronounced, set the shared `--nat-table-pinned-edge-shadow-size` token. It scales the fade for both pinned zones while keeping the one-pixel divider, and the library still mirrors the direction per zone — the left zone fades rightward and the right zone leftward onto the scrollable content — so you never author a side-specific offset.

```css
.positions-table {
  --nat-table-pinned-divider-shadow-color: light-dark(rgb(15 23 42 / 25%), rgb(0 0 0 / 55%));
  --nat-table-pinned-edge-shadow-size: 10px;
}
```

## Reordering And Resizing

Reordering changes the rendered column order. It is disabled by default; set `[enableReordering]="true"` on the surface to enable drag/drop, header move menus, and keyboard column moves for every column, then opt one out with `meta: { reorderable: false }`. Leave the surface off and set `meta: { reorderable: true }` when only specific columns should expose those reordering paths. Resizing changes width state and is also disabled by default; set `[enableColumnResizing]="true"` on the surface to enable it for all columns, then opt a single column out with `enableResizing: false`. Both need keyboard support because pointer-only layout controls are not accessible enough for this table library.

Use `columnSizingMode="fill"` when columns should stretch to the available width. Use `columnSizingMode="fixed"` when column widths should stay authoritative and the table may scroll horizontally.

```html
<nat-table-surface [enableReordering]="true" [enableColumnResizing]="true" columnSizingMode="fixed" columnResizeMode="onEnd">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
  <nat-table-scroll-control />
</nat-table-surface>
```

`columnResizeMode="onEnd"` commits a pointer resize after release. Use `"onChange"` only when live resizing is important enough to update layout continuously during the drag.

## Horizontal Scroll Controls

`NatTableScrollControl` provides buttons, a range input, and position text for the table's horizontal scroll container. It is most useful with fixed sizing, pinned columns, or wide comparison tables where native horizontal scrollbars are easy to miss.

```html
<nat-table-scroll-control [scrollStep]="320" groupAriaLabel="Horizontal table scroll" [accessibilityLabels]="scrollLabels" />
```

```ts
import type { NatTableAccessibilityScrollControlLabels } from 'ng-advanced-table/locale';

readonly scrollLabels = {
  scrollLeftAriaLabel: 'Scroll positions left',
  scrollRightAriaLabel: 'Scroll positions right',
  scrollPositionAriaLabel: 'Horizontal position',
  scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`,
} satisfies NatTableAccessibilityScrollControlLabels;
```

Place the control inside the same `NatTableSurface` as the table. The control resolves the table scroll container through the surface controller and disables itself when there is no horizontal overflow. Keep `scrollStep` large enough to feel useful but smaller than the visible table width, so each button press preserves context.

## Sticky Header

Use a sticky header when the table has enough rows that users lose column context while scrolling. Keep the vertical region height intentional so the sticky behavior is visible and predictable.
