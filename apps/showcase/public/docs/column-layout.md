## Layout Responsibilities

Column layout covers how columns present at runtime: pinning, ordering, sizing, visibility, and sticky headers. Keep column meaning and cell rendering in the Columns topic; use this topic for presentation state.

## Pinning And Visibility

Pinning keeps important columns at a scroll boundary. Visibility lets users remove columns that are not useful for the current task. Both are state slices, so app-owned controls and companion controls should patch the same table state.

## Reordering And Resizing

Reordering changes the rendered column order. Resizing changes width state. Both need keyboard support because pointer-only layout controls are not accessible enough for this table library.

## Sticky Header

Use a sticky header when the table has enough rows that users lose column context while scrolling. Keep the vertical region height intentional so the sticky behavior is visible and predictable.
