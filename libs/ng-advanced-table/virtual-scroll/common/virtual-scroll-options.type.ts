/**
 * Configuration for `natTableVirtualScroll`, mirroring the vocabulary of the
 * CDK fixed-size virtual-scroll strategy that powers the directive.
 */
export type NatTableVirtualScrollOptions = {
  /**
   * Fixed rendered height of one body row in px, including its borders.
   * Every body row must render at exactly this height; the table pins mounted
   * data rows to it and sizes gap spacers from it.
   */
  readonly rowHeight: number;
  /**
   * Minimum amount of buffered content to keep rendered beyond the viewport
   * edges, in px. When the remaining buffer drops below this, more rows are
   * mounted. Defaults to the CDK fixed-size default of 100.
   */
  readonly minBufferPx?: number;
  /**
   * Amount of buffer to render back up to once the minimum is breached, in
   * px. Must be at least `minBufferPx`. Defaults to the CDK fixed-size
   * default of 200.
   */
  readonly maxBufferPx?: number;
};

/** `NatTableVirtualScrollOptions` with every default applied. */
export type NatTableResolvedVirtualScrollOptions = Required<NatTableVirtualScrollOptions>;
