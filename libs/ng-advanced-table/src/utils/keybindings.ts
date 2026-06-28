/* eslint-disable max-lines -- cohesive keybinding parsing/matching/serialization helpers; tightly coupled, splitting hurts readability. */
import type { NatTableKeybindings, NatTableKeyboard, NatTableShortcut, NatTableShortcutValue } from '../common/keybindings';
import { DEFAULT_NAT_TABLE_KEYBINDINGS } from '../common/keybindings';

/** Detects if the current platform is macOS or iOS. Safe for SSR. */
const isMacPlatform = (): boolean => {
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
};

/** Returns whether a keyboard key value represents the Space key. */
export const isSpaceShortcutKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();

  return key === ' ' || lowerKey === 'space' || lowerKey === 'spacebar';
};

/** Normalizes equivalent key aliases for shortcut comparisons. */
const normalizeShortcutKeyForComparison = (key: string): string => (isSpaceShortcutKey(key) ? 'space' : key.toLowerCase());

/** Resolves the ctrl/alt/shift/meta flags from a set of lowercased modifier tokens. */
const resolveModifierFlags = (
  modifiers: ReadonlySet<string>,
  isMac: boolean
): Pick<NatTableShortcut, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'> => {
  const hasMod = modifiers.has('mod') || modifiers.has('cmdorctrl') || modifiers.has('commandorcontrol');

  return {
    ctrlKey: modifiers.has('ctrl') || modifiers.has('control') || (hasMod && !isMac),
    altKey: modifiers.has('alt'),
    shiftKey: modifiers.has('shift'),
    metaKey: modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('win') || (hasMod && isMac)
  };
};

/** Parses a string shortcut (e.g. `'Alt+Shift+ArrowLeft'`) into a structured {@link NatTableShortcut}. */
export const parseShortcutString = (shortcut: string): NatTableShortcut => {
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
    ...resolveModifierFlags(modifiers, isMacPlatform())
  };
};

/** Normalizes a shortcut string or object into a complete {@link NatTableShortcut} with explicit modifier values. */
export const normalizeShortcut = (shortcut: string | NatTableShortcut): NatTableShortcut => {
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
    metaKey: !!shortcut.metaKey || (hasMod && isMac)
  };
};

/** Checks if a keyboard event matches a given shortcut. */
export const matchShortcut = (event: KeyboardEvent, shortcut: string | NatTableShortcut): boolean => {
  const norm = normalizeShortcut(shortcut);

  return (
    normalizeShortcutKeyForComparison(event.key) === normalizeShortcutKeyForComparison(norm.key) &&
    event.altKey === norm.altKey &&
    event.ctrlKey === norm.ctrlKey &&
    event.shiftKey === norm.shiftKey &&
    event.metaKey === norm.metaKey
  );
};

/** Checks if a keyboard event matches any of the configured shortcut values. */
export const matchShortcutValue = (event: KeyboardEvent, value: NatTableShortcutValue | undefined): boolean => {
  if (!value) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((val) => matchShortcut(event, val));
  }

  return matchShortcut(event, value);
};

/** Merges multiple keybindings configurations in priority order, falling back to defaults. */
export const mergeNatTableKeybindings = (...configs: NatTableKeybindings[]): Required<NatTableKeybindings> => {
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
};

/** Serializes one normalized shortcut to its `Alt+Control+...+Key` ARIA representation. */
const serializeSingleShortcut = (norm: NatTableShortcut): string => {
  const parts: string[] = [];

  if (norm.altKey) parts.push('Alt');

  if (norm.ctrlKey) parts.push('Control');

  if (norm.metaKey) parts.push('Meta');

  if (norm.shiftKey) parts.push('Shift');

  parts.push(isSpaceShortcutKey(norm.key) ? 'Space' : norm.key);

  return parts.join('+');
};

/** Serializes a keybinding shortcut value to a string representation suitable for ARIA attributes. */
export const serializeShortcutValue = (value: NatTableShortcutValue | undefined): string => {
  if (!value) {
    return '';
  }
  const values = Array.isArray(value) ? value : [value];
  const serializedSet = new Set<string>();

  for (const val of values) {
    serializedSet.add(serializeSingleShortcut(normalizeShortcut(val)));
  }

  return Array.from(serializedSet).filter(Boolean).join(' ');
};

/** Checks if two shortcut definitions are equivalent. */
export const areShortcutsEqual = (a: string | NatTableShortcut, b: string | NatTableShortcut): boolean => {
  const normA = normalizeShortcut(a);
  const normB = normalizeShortcut(b);

  return (
    normalizeShortcutKeyForComparison(normA.key) === normalizeShortcutKeyForComparison(normB.key) &&
    normA.altKey === normB.altKey &&
    normA.ctrlKey === normB.ctrlKey &&
    normA.shiftKey === normB.shiftKey &&
    normA.metaKey === normB.metaKey
  );
};

/** Checks if there is any overlap between two shortcut configurations. */
export const areShortcutValuesOverlapping = (
  valA: NatTableShortcutValue | undefined,
  valB: NatTableShortcutValue | undefined
): boolean => {
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
};

/** Validates keybindings configuration and returns warning messages for any conflicts. */
export const validateKeybindings = (bindings: Required<NatTableKeybindings>): string[] => {
  const warnings: string[] = [];
  const keys = Object.keys(bindings) as (keyof NatTableKeybindings)[];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];

      // rowActivate and cellEnterControl operate at different focus contexts (row-level vs inside cell)
      // and can safely share shortcuts (like 'Enter') by design.
      if ((keyA === 'rowActivate' && keyB === 'cellEnterControl') || (keyA === 'cellEnterControl' && keyB === 'rowActivate')) {
        continue;
      }

      if (areShortcutValuesOverlapping(bindings[keyA], bindings[keyB])) {
        warnings.push(`Action '${keyA}' and Action '${keyB}' share overlapping shortcut combinations.`);
      }
    }
  }

  return warnings;
};

/** Compiles a functional keyboard shortcuts helper from a keybindings configuration. */
export const createNatTableKeyboard = (keybindings: Required<NatTableKeybindings>): NatTableKeyboard => ({
  cellInteraction: {
    enter: (event: KeyboardEvent): boolean => matchShortcutValue(event, keybindings.cellEnterControl),
    exit: (event: KeyboardEvent): boolean => matchShortcutValue(event, keybindings.cellExitControl),
    next: (event: KeyboardEvent): boolean => matchShortcutValue(event, keybindings.cellTabNextControl),
    previous: (event: KeyboardEvent): boolean => matchShortcutValue(event, keybindings.cellTabPrevControl)
  },
  rowActivate: (event: KeyboardEvent): boolean => matchShortcutValue(event, keybindings.rowActivate),
  columnReorderDirection: (event: KeyboardEvent): -1 | 1 | null => {
    if (matchShortcutValue(event, keybindings.columnReorderLeft)) return -1;

    if (matchShortcutValue(event, keybindings.columnReorderRight)) return 1;

    return null;
  }
});
