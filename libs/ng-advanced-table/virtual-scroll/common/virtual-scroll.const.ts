/**
 * Body rows mounted before the CDK engine has measured the viewport — the
 * server-side render, and the first client frame. Large enough to fill any
 * reasonable initial viewport, small enough to keep first paint cheap.
 */
export const NAT_TABLE_VIRTUAL_SCROLL_INITIAL_ROW_COUNT = 25;

/** CDK fixed-size defaults, restated for the options normalizer. */
export const NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MIN_BUFFER_PX = 100;

export const NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MAX_BUFFER_PX = 200;

/**
 * Fallback row height applied in place of a non-finite or non-positive
 * `rowHeight` so dev-mode misconfiguration degrades to a working table.
 */
export const NAT_TABLE_VIRTUAL_SCROLL_FALLBACK_ROW_HEIGHT = 48;
