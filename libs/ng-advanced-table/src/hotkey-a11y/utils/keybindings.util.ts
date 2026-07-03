import {
  areShortcutValuesOverlapping,
  isSpaceShortcutKey,
  normalizeShortcut,
  normalizeShortcutKeyForComparison
} from './shortcut-parsing.util';
import { DEFAULT_NAT_TABLE_KEYBINDINGS } from '../common/keybindings.const';
import type { NatTableKeybindings, NatTableKeyboard, NatTableShortcut, NatTableShortcutValue } from '../common/keybindings.type';

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
  if (!value) return false;

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
      if (config[key] !== undefined) return [key, config[key]];
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
  if (!value) return '';

  const values = Array.isArray(value) ? value : [value];
  const serializedSet = new Set<string>();

  for (const val of values) {
    serializedSet.add(serializeSingleShortcut(normalizeShortcut(val)));
  }

  return Array.from(serializedSet).filter(Boolean).join(' ');
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
