/**
 * Payload emitted by {@link NatTable.rowRendered} when row render
 * instrumentation is enabled.
 */
export interface NatTableRowRenderedEvent {
  /** Stable row identifier resolved from `getRowId` or the row index fallback. */
  rowId: string;
  /** Monotonic token for the render cycle that produced this row measurement. */
  renderToken: number;
  /** Time, in milliseconds, between cycle start and this row becoming painted. */
  durationMs: number;
}
