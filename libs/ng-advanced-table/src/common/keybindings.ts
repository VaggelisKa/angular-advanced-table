import { InjectionToken } from '@angular/core';

/** A keyboard shortcut definition matching properties of standard browser {@link KeyboardEvent}. */
export type NatTableShortcut = {
  /** The value of the key property, e.g. `'ArrowLeft'`, `'Enter'`, `'a'`. */
  readonly key: string;
  /** Whether the Ctrl key is required to be pressed. */
  readonly ctrlKey?: boolean;
  /** Whether the Alt key is required to be pressed. */
  readonly altKey?: boolean;
  /** Whether the Shift key is required to be pressed. */
  readonly shiftKey?: boolean;
  /** Whether the Meta (Command/Windows) key is required to be pressed. */
  readonly metaKey?: boolean;
  /** Maps to Command (metaKey) on Mac/iOS, and Control (ctrlKey) on other platforms. */
  readonly cmdOrCtrlKey?: boolean;
};

/** Configurable value for a keybinding, either a string shorthand, a shortcut object, or a list of them. */
export type NatTableShortcutValue = string | NatTableShortcut | (string | NatTableShortcut)[];

/** Keyboard interaction shortcuts configuration. */
export type NatTableKeybindings = {
  /** Keys that activate a row. Default: `['Enter', ' ', 'Spacebar']` */
  readonly rowActivate?: NatTableShortcutValue;
  /** Key combination to reorder a column to the left. Default: `'Mod+Shift+ArrowLeft'` */
  readonly columnReorderLeft?: NatTableShortcutValue;
  /** Key combination to reorder a column to the right. Default: `'Mod+Shift+ArrowRight'` */
  readonly columnReorderRight?: NatTableShortcutValue;
  /** Key combination to step into a cell's first interactive control. Default: `'Enter'` */
  readonly cellEnterControl?: NatTableShortcutValue;
  /** Key combination to return focus from a control back to the parent cell. Default: `'Escape'` */
  readonly cellExitControl?: NatTableShortcutValue;
  /** Key combination to move to the next interactive control inside a cell. Default: `'Tab'` */
  readonly cellTabNextControl?: NatTableShortcutValue;
  /** Key combination to move to the previous interactive control inside a cell. Default: `'Shift+Tab'` */
  readonly cellTabPrevControl?: NatTableShortcutValue;
};

/** Default keyboard shortcuts adhering to standard WCAG cell-interaction and reordering behaviors. */
export const DEFAULT_NAT_TABLE_KEYBINDINGS: Required<NatTableKeybindings> = {
  rowActivate: ['Enter', ' ', 'Spacebar'],
  columnReorderLeft: 'Mod+Shift+ArrowLeft',
  columnReorderRight: 'Mod+Shift+ArrowRight',
  cellEnterControl: 'Enter',
  cellExitControl: 'Escape',
  cellTabNextControl: 'Tab',
  cellTabPrevControl: 'Shift+Tab'
};

/** Injection token for custom keyboard shortcuts configuration. */
export const NAT_TABLE_KEYBINDINGS = new InjectionToken<NatTableKeybindings>('NAT_TABLE_KEYBINDINGS', {
  providedIn: 'root',
  factory: (): NatTableKeybindings => ({})
});

/** A compiled, functional keyboard shortcuts helper mapping KeyboardEvents to actions. */
export type NatTableKeyboard = {
  readonly cellInteraction: {
    readonly enter: (event: KeyboardEvent) => boolean;
    readonly exit: (event: KeyboardEvent) => boolean;
    readonly next: (event: KeyboardEvent) => boolean;
    readonly previous: (event: KeyboardEvent) => boolean;
  };
  readonly rowActivate: (event: KeyboardEvent) => boolean;
  readonly columnReorderDirection: (event: KeyboardEvent) => -1 | 1 | null;
};
