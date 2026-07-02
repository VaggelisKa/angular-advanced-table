import type { NatTableShortcut, NatTableShortcutValue } from '../common/keybindings.type';

/** Detects if the current platform is macOS or iOS. Safe for SSR. */
const isMacPlatform = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

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
export const normalizeShortcutKeyForComparison = (key: string): string => (isSpaceShortcutKey(key) ? 'space' : key.toLowerCase());

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
  if (!valA || !valB) return false;

  const listA = Array.isArray(valA) ? valA : [valA];
  const listB = Array.isArray(valB) ? valB : [valB];

  for (const a of listA) {
    for (const b of listB) {
      if (areShortcutsEqual(a, b)) return true;
    }
  }

  return false;
};
