/**
 * Payload emitted by {@link NatTable.rowRendered} when row render
 * instrumentation is enabled.
 */
export type NatTableRowRenderedEvent = {
  /** Stable row identifier resolved from `getRowId`, `row.id`, or the namespaced positional fallback. */
  readonly rowId: string;
  /** Monotonic token for the render cycle that produced this row measurement. */
  readonly renderToken: number;
  /** Time, in milliseconds, between cycle start and this row becoming painted. */
  readonly durationMs: number;
};
