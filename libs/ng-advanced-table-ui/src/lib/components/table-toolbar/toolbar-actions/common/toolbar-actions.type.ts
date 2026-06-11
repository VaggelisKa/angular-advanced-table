import type { TemplateRef } from '@angular/core';

export type NatToolbarActionItem = {
  /** Visible menu item label (also used as ngMenuItem [value] for typeahead). */
  readonly label: string;
  /** Optional icon template rendered before the label. */
  readonly icon?: TemplateRef<unknown>;
  /** Disables the menu item without removing it. */
  readonly disabled?: boolean;
  /** Invoked when the menu item is activated; the menu closes afterwards. */
  readonly action: () => void;
};
