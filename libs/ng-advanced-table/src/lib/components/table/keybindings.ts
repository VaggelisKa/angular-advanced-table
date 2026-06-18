import { InjectionToken } from '@angular/core';

/** A keyboard shortcut definition matching properties of standard browser {@link KeyboardEvent}. */
export interface NatTableShortcut {
  /** The value of the key property, e.g. `'ArrowLeft'`, `'Enter'`, `'a'`. */
  key: string;
  /** Whether the Ctrl key is required to be pressed. */
  ctrlKey?: boolean;
  /** Whether the Alt key is required to be pressed. */
  altKey?: boolean;
  /** Whether the Shift key is required to be pressed. */
  shiftKey?: boolean;
  /** Whether the Meta (Command/Windows) key is required to be pressed. */
  metaKey?: boolean;
}

/** Configurable value for a keybinding, either a string shorthand, a shortcut object, or a list of them. */
export type NatTableShortcutValue = string | NatTableShortcut | (string | NatTableShortcut)[];

/** Keyboard interaction shortcuts configuration. */
export interface NatTableKeybindings {
  /** Keys that activate a row. Default: `['Enter', ' ', 'Spacebar']` */
  rowActivate?: NatTableShortcutValue;
  /** Key combination to reorder a column to the left. Default: `'Alt+Shift+ArrowLeft'` */
  columnReorderLeft?: NatTableShortcutValue;
  /** Key combination to reorder a column to the right. Default: `'Alt+Shift+ArrowRight'` */
  columnReorderRight?: NatTableShortcutValue;
  /** Key combination to step into a cell's first interactive control. Default: `'Enter'` */
  cellEnterControl?: NatTableShortcutValue;
  /** Key combination to return focus from a control back to the parent cell. Default: `'Escape'` */
  cellExitControl?: NatTableShortcutValue;
  /** Key combination to move to the next interactive control inside a cell. Default: `'Tab'` */
  cellTabNextControl?: NatTableShortcutValue;
  /** Key combination to move to the previous interactive control inside a cell. Default: `'Shift+Tab'` */
  cellTabPrevControl?: NatTableShortcutValue;
}

/** Default keyboard shortcuts adhering to standard WCAG cell-interaction and reordering behaviors. */
export const DEFAULT_NAT_TABLE_KEYBINDINGS: Required<NatTableKeybindings> = {
  rowActivate: ['Enter', ' ', 'Spacebar'],
  columnReorderLeft: 'Alt+Shift+ArrowLeft',
  columnReorderRight: 'Alt+Shift+ArrowRight',
  cellEnterControl: 'Enter',
  cellExitControl: 'Escape',
  cellTabNextControl: 'Tab',
  cellTabPrevControl: 'Shift+Tab',
};

/** Injection token for custom keyboard shortcuts configuration. */
export const NAT_TABLE_KEYBINDINGS = new InjectionToken<NatTableKeybindings>(
  'NAT_TABLE_KEYBINDINGS',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);

/** Parses a string shortcut (e.g. `'Alt+Shift+ArrowLeft'`) into a structured {@link NatTableShortcut}. */
export function parseShortcutString(shortcut: string): NatTableShortcut {
  const parts = shortcut.split('+');
  let key = parts[parts.length - 1];

  if (key === '' && parts.length > 1 && shortcut.endsWith('++')) {
    key = '+';
    parts.pop();
  }

  const trimmedKey = key.trim();
  const resolvedKey = trimmedKey === '' && key.length > 0 ? key : trimmedKey;

  const modifiers = new Set(parts.slice(0, -1).map((m) => m.trim().toLowerCase()));

  return {
    key: resolvedKey,
    ctrlKey: modifiers.has('ctrl') || modifiers.has('control'),
    altKey: modifiers.has('alt'),
    shiftKey: modifiers.has('shift'),
    metaKey: modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('win'),
  };
}

/** Normalizes a shortcut string or object into a complete {@link NatTableShortcut} with explicit modifier values. */
export function normalizeShortcut(shortcut: string | NatTableShortcut): NatTableShortcut {
  if (typeof shortcut === 'string') {
    return parseShortcutString(shortcut);
  }
  return {
    key: shortcut.key,
    ctrlKey: !!shortcut.ctrlKey,
    altKey: !!shortcut.altKey,
    shiftKey: !!shortcut.shiftKey,
    metaKey: !!shortcut.metaKey,
  };
}

/** Checks if a keyboard event matches a given shortcut. */
export function matchShortcut(event: KeyboardEvent, shortcut: string | NatTableShortcut): boolean {
  const norm = normalizeShortcut(shortcut);
  return (
    event.key === norm.key &&
    event.altKey === norm.altKey &&
    event.ctrlKey === norm.ctrlKey &&
    event.shiftKey === norm.shiftKey &&
    event.metaKey === norm.metaKey
  );
}

/** Checks if a keyboard event matches any of the configured shortcut values. */
export function matchShortcutValue(
  event: KeyboardEvent,
  value: NatTableShortcutValue | undefined,
): boolean {
  if (!value) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((val) => matchShortcut(event, val));
  }
  return matchShortcut(event, value);
}

/** Merges a local configuration with service/default configurations. */
export function mergeNatTableKeybindings(
  local: NatTableKeybindings,
  service: NatTableKeybindings,
): Required<NatTableKeybindings> {
  return {
    rowActivate:
      local.rowActivate ?? service.rowActivate ?? DEFAULT_NAT_TABLE_KEYBINDINGS.rowActivate,
    columnReorderLeft:
      local.columnReorderLeft ??
      service.columnReorderLeft ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderLeft,
    columnReorderRight:
      local.columnReorderRight ??
      service.columnReorderRight ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight,
    cellEnterControl:
      local.cellEnterControl ??
      service.cellEnterControl ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.cellEnterControl,
    cellExitControl:
      local.cellExitControl ??
      service.cellExitControl ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.cellExitControl,
    cellTabNextControl:
      local.cellTabNextControl ??
      service.cellTabNextControl ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.cellTabNextControl,
    cellTabPrevControl:
      local.cellTabPrevControl ??
      service.cellTabPrevControl ??
      DEFAULT_NAT_TABLE_KEYBINDINGS.cellTabPrevControl,
  };
}
