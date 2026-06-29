## Layout Responsibilities

Column layout covers how columns present at runtime: pinning, ordering, sizing, visibility, and sticky headers. Keep column meaning and cell rendering in the Columns topic; use this topic for presentation state.

## Pinning And Visibility

Pinning keeps important columns at a scroll boundary. Visibility lets users remove columns that are not useful for the current task. Both are state slices, so app-owned controls and companion controls should patch the same table state.

## Reordering And Resizing

Reordering changes the rendered column order. Resizing changes width state. Both need keyboard support because pointer-only layout controls are not accessible enough for this table library.

Use `columnSizingMode="fill"` when columns should stretch to the available width. Use `columnSizingMode="fixed"` when column widths should stay authoritative and the table may scroll horizontally.

```html
<nat-table-surface columnSizingMode="fixed" columnResizeMode="onEnd">
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
import type { NatTableAccessibilityScrollControlLabels } from 'ng-advanced-table/ui';

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
