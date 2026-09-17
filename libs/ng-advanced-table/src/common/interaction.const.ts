/** Selector for interactive controls that opt a click or keypress out of row activation. */
export const ROW_ACTIVATE_INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
  '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
  '[role="menuitemcheckbox"], [role="menuitemradio"], [role="tab"], [role="switch"], ' +
  '[role="combobox"], [role="textbox"], [role="searchbox"]';

/**
 * Attribute that opts an element (and everything inside it) out of row activation when set to
 * `"false"`. The renderers stamp it on body cells whose column sets `meta.rowActivation: false`;
 * consumers may also place it on any element inside a cell.
 */
export const ROW_ACTIVATE_OPT_OUT_ATTRIBUTE = 'data-nat-row-activation';

/** Selector for elements that opt a click or keypress out of row activation. */
export const ROW_ACTIVATE_OPT_OUT_SELECTOR = `[${ROW_ACTIVATE_OPT_OUT_ATTRIBUTE}="false"]`;
