export const NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE = 'data-nat-table-managed-cell-widget';

export const NAT_TABLE_CELL_SELECTOR = '[natTableCell]';

/** Renderer host elements, used to tell cells owned by one renderer from nested or foreign ones. */
export const NAT_TABLE_HOST_SELECTOR = 'nat-table, nat-list';

/**
 * Mutable attributes that affect interactive-selector eligibility, preparation
 * guards, or managed tabindex state. Keep this aligned with those rules so
 * attribute changes cannot bypass cell-control preparation.
 */
export const NAT_TABLE_CELL_CONTROL_ATTRIBUTE_FILTER = [
  'contenteditable',
  'disabled',
  'href',
  'nggridcellwidget',
  'role',
  'tabindex'
] as const;
