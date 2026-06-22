/* eslint-disable max-lines -- cohesive keybinding parsing/matching module; the types and helpers are tightly coupled and splitting hurts readability. */
import { InjectionToken } from '@angular/core';

/** A keyboard shortcut definition matching properties of standard browser {@link KeyboardEvent}. */
export type NatTableShortcut = {
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
  /** Maps to Command (metaKey) on Mac/iOS, and Control (ctrlKey) on other platforms. */
  cmdOrCtrlKey?: boolean;
}

/** Configurable value for a keybinding, either a string shorthand, a shortcut object, or a list of them. */
export type NatTableShortcutValue = string | NatTableShortcut | (string | NatTableShortcut)[];

/** Keyboard interaction shortcuts configuration. */
export type NatTableKeybindings = {
  /** Keys that activate a row. Default: `['Enter', ' ', 'Spacebar']` */
  rowActivate?: NatTableShortcutValue;
  /** Key combination to reorder a column to the left. Default: `'Mod+Shift+ArrowLeft'` */
  columnReorderLeft?: NatTableShortcutValue;
  /** Key combination to reorder a column to the right. Default: `'Mod+Shift+ArrowRight'` */
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
  columnReorderLeft: 'Mod+Shift+ArrowLeft',
  columnReorderRight: 'Mod+Shift+ArrowRight',
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
    factory: (): NatTableKeybindings => ({}),
  },
);

/** Detects if the current platform is macOS or iOS. Safe for SSR. */
export function isMacPlatform(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const userAgent = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  return (
    userAgent.includes('mac') ||
    userAgent.includes('ipad') ||
    userAgent.includes('iphone') ||
    platform.includes('mac') ||
    platform.includes('ipad') ||
    platform.includes('iphone')
  );
}

/** Resolves the ctrl/alt/shift/meta flags from a set of lowercased modifier tokens. */
function resolveModifierFlags(
  modifiers: ReadonlySet<string>,
  isMac: boolean,
): Pick<NatTableShortcut, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'> {
  const hasMod =
    modifiers.has('mod') || modifiers.has('cmdorctrl') || modifiers.has('commandorcontrol');

  return {
    ctrlKey: modifiers.has('ctrl') || modifiers.has('control') || (hasMod && !isMac),
    altKey: modifiers.has('alt'),
    shiftKey: modifiers.has('shift'),
    metaKey:
      modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('win') || (hasMod && isMac),
  };
}

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
    ...resolveModifierFlags(modifiers, isMacPlatform()),
  };
}

/** Normalizes a shortcut string or object into a complete {@link NatTableShortcut} with explicit modifier values. */
export function normalizeShortcut(shortcut: string | NatTableShortcut): NatTableShortcut {
  if (typeof shortcut === 'string') {
    return parseShortcutString(shortcut);
  }
  const isMac = isMacPlatform();
  const hasMod = !!shortcut.cmdOrCtrlKey;

  return {
    key: shortcut.key,
    ctrlKey: !!shortcut.ctrlKey || (hasMod && !isMac),
    altKey: !!shortcut.altKey,
    shiftKey: !!shortcut.shiftKey,
    metaKey: !!shortcut.metaKey || (hasMod && isMac),
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

/** Merges multiple keybindings configurations in priority order, falling back to defaults. */
export function mergeNatTableKeybindings(
  ...configs: NatTableKeybindings[]
): Required<NatTableKeybindings> {
  const keys = Object.keys(DEFAULT_NAT_TABLE_KEYBINDINGS) as (keyof NatTableKeybindings)[];

  const entries = keys.map((key): [keyof NatTableKeybindings, NatTableShortcutValue] => {
    for (const config of configs) {
      if (config[key] !== undefined) {
        return [key, config[key]];
      }
    }

    return [key, DEFAULT_NAT_TABLE_KEYBINDINGS[key]];
  });

  return Object.fromEntries(entries) as Required<NatTableKeybindings>;
}

/** Serializes one normalized shortcut to its `Alt+Control+...+Key` ARIA representation. */
function serializeSingleShortcut(norm: NatTableShortcut): string {
  const parts: string[] = [];

  if (norm.altKey) parts.push('Alt');

  if (norm.ctrlKey) parts.push('Control');

  if (norm.metaKey) parts.push('Meta');

  if (norm.shiftKey) parts.push('Shift');

  const lowerKey = norm.key.toLowerCase();
  const isSpace = norm.key === ' ' || lowerKey === 'spacebar' || lowerKey === 'space';

  parts.push(isSpace ? 'Space' : norm.key);

  return parts.join('+');
}

/** Serializes a keybinding shortcut value to a string representation suitable for ARIA attributes. */
export function serializeShortcutValue(value: NatTableShortcutValue | undefined): string {
  if (!value) {
    return '';
  }
  const values = Array.isArray(value) ? value : [value];
  const serializedSet = new Set<string>();

  for (const val of values) {
    serializedSet.add(serializeSingleShortcut(normalizeShortcut(val)));
  }

  return Array.from(serializedSet).filter(Boolean).join(' ');
}

/** Checks if two shortcut definitions are equivalent. */
export function areShortcutsEqual(
  a: string | NatTableShortcut,
  b: string | NatTableShortcut,
): boolean {
  const normA = normalizeShortcut(a);
  const normB = normalizeShortcut(b);

  return (
    normA.key.toLowerCase() === normB.key.toLowerCase() &&
    normA.altKey === normB.altKey &&
    normA.ctrlKey === normB.ctrlKey &&
    normA.shiftKey === normB.shiftKey &&
    normA.metaKey === normB.metaKey
  );
}

/** Checks if there is any overlap between two shortcut configurations. */
export function areShortcutValuesOverlapping(
  valA: NatTableShortcutValue | undefined,
  valB: NatTableShortcutValue | undefined,
): boolean {
  if (!valA || !valB) {
    return false;
  }
  const listA = Array.isArray(valA) ? valA : [valA];
  const listB = Array.isArray(valB) ? valB : [valB];

  for (const a of listA) {
    for (const b of listB) {
      if (areShortcutsEqual(a, b)) {
        return true;
      }
    }
  }

  return false;
}

/** Validates keybindings configuration and returns warning messages for any conflicts. */
export function validateKeybindings(bindings: Required<NatTableKeybindings>): string[] {
  const warnings: string[] = [];
  const keys = Object.keys(bindings) as (keyof NatTableKeybindings)[];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];
      
      // rowActivate and cellEnterControl operate at different focus contexts (row-level vs inside cell)
      // and can safely share shortcuts (like 'Enter') by design.
      if (
        (keyA === 'rowActivate' && keyB === 'cellEnterControl') ||
        (keyA === 'cellEnterControl' && keyB === 'rowActivate')
      ) {
        continue;
      }

      if (areShortcutValuesOverlapping(bindings[keyA], bindings[keyB])) {
        warnings.push(
          `Action '${keyA}' and Action '${keyB}' share overlapping shortcut combinations.`,
        );
      }
    }
  }

  return warnings;
}

/** A compiled, functional keyboard shortcuts helper mapping KeyboardEvents to actions. */
export type NatTableKeyboard = {
  cellInteraction: {
    enter: (event: KeyboardEvent) => boolean;
    exit: (event: KeyboardEvent) => boolean;
    next: (event: KeyboardEvent) => boolean;
    previous: (event: KeyboardEvent) => boolean;
  };
  rowActivate: (event: KeyboardEvent) => boolean;
  columnReorderDirection: (event: KeyboardEvent) => -1 | 1 | null;
};

/** Compiles a functional keyboard shortcuts helper from a keybindings configuration. */
export function createNatTableKeyboard(keybindings: Required<NatTableKeybindings>): NatTableKeyboard {
  return {
    cellInteraction: {
      enter: (event: KeyboardEvent): boolean =>
        matchShortcutValue(event, keybindings.cellEnterControl),
      exit: (event: KeyboardEvent): boolean =>
        matchShortcutValue(event, keybindings.cellExitControl),
      next: (event: KeyboardEvent): boolean =>
        matchShortcutValue(event, keybindings.cellTabNextControl),
      previous: (event: KeyboardEvent): boolean =>
        matchShortcutValue(event, keybindings.cellTabPrevControl),
    },
    rowActivate: (event: KeyboardEvent): boolean =>
      matchShortcutValue(event, keybindings.rowActivate),
    columnReorderDirection: (event: KeyboardEvent): -1 | 1 | null => {
      if (matchShortcutValue(event, keybindings.columnReorderLeft)) return -1;

      if (matchShortcutValue(event, keybindings.columnReorderRight)) return 1;

      return null;
    },
  };
}



