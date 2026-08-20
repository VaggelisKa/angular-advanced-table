---
ng-advanced-table: patch
---

Keep focused scrolled cells beneath the sticky header and pinned zones.

Every focused grid cell took `--nat-table-z-index-focus-cell` (7), which sits above pinned body cells (5) and pinned headers (6). A focused center cell that scrolled beneath a pinned column was therefore painted on top of the pinned zone — the pinned column looked broken whenever the cell sliding under it happened to hold focus. The same inversion applied to a focused center sticky-header cell over pinned headers.

Focused cells now stay inside their own zone's stacking layer:

- A focused non-pinned body cell gets `position: relative; z-index: 1` — above its static row siblings so the focus ring stays visible, below the sticky header and both pinned zones.
- Only pinned cells (body and header) still take `--nat-table-z-index-focus-cell`; as the top cell zone, raising them cannot pull scrolled content over a pinned column.
- A focused non-pinned sticky-header cell keeps the sticky-header z-index instead of rising above pinned headers.

The focus ring itself is unchanged (inset box-shadow on every focused cell).

Additionally, the hovered-row and focused-row tints on pinned cells (`--nat-table-row-background-hover-pinned`, `--nat-table-row-background-focus-pinned`) no longer replace the pinned background. The tints are translucent by design, so assigning them as the cell's whole `background` turned pinned cells see-through on hovered and focus-containing rows — center content scrolling beneath the pinned zone bled through the pinned text. Each tint now renders as a `linear-gradient` layer above the opaque pinned background chain, keeping the tint visuals identical while restoring pinned opacity.
