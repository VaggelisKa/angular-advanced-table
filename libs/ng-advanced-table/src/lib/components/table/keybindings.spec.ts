import { vi } from 'vitest';
import * as keybindingsModule from './keybindings';
import {
  parseShortcutString,
  normalizeShortcut,
  matchShortcut,
  matchShortcutValue,
  mergeNatTableKeybindings,
  serializeShortcutValue,
  validateKeybindings,
  areShortcutsEqual,
  areShortcutValuesOverlapping,
  DEFAULT_NAT_TABLE_KEYBINDINGS,
  createNatTableKeyboard,
  type NatTableShortcut,
  type NatTableKeybindings,
} from './keybindings';

describe('NatTable Keybindings Utilities', () => {
  describe('parseShortcutString', () => {
    it('should parse single keys with no modifiers', () => {
      const parsed = parseShortcutString('Enter');
      expect(parsed).toEqual({
        key: 'Enter',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
    });

    it('should parse key combinations with modifiers', () => {
      const parsed = parseShortcutString('Alt+Shift+ArrowLeft');
      expect(parsed).toEqual({
        key: 'ArrowLeft',
        ctrlKey: false,
        altKey: true,
        shiftKey: true,
        metaKey: false,
      });
    });

    it('should support alternative modifier names like Control/Cmd/Win', () => {
      const parsed = parseShortcutString('Control+Cmd+a');
      expect(parsed).toEqual({
        key: 'a',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: true,
      });
    });

    it('should correctly handle the plus (+) key when used with modifiers', () => {
      const parsed = parseShortcutString('Ctrl++');
      expect(parsed).toEqual({
        key: '+',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
    });
  });

  describe('Mod / CmdOrCtrl key translation', () => {
    let originalNavigator: any;

    beforeEach(() => {
      originalNavigator = globalThis.navigator;
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    });

    it('should map Mod to metaKey on Mac', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'macintosh',
          platform: 'macintel',
        },
        configurable: true,
        writable: true,
      });
      const parsed = parseShortcutString('Mod+a');
      expect(parsed).toEqual({
        key: 'a',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: true,
      });
    });

    it('should map Mod to ctrlKey on Windows/Linux', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'windows',
          platform: 'win32',
        },
        configurable: true,
        writable: true,
      });
      const parsed = parseShortcutString('Mod+a');
      expect(parsed).toEqual({
        key: 'a',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
    });

    it('should map cmdOrCtrlKey object property correctly based on platform', () => {
      // Mac
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'macintosh',
          platform: 'macintel',
        },
        configurable: true,
        writable: true,
      });
      expect(normalizeShortcut({ key: 'ArrowLeft', cmdOrCtrlKey: true })).toEqual({
        key: 'ArrowLeft',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: true,
      });

      // Windows/Linux
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent: 'windows',
          platform: 'win32',
        },
        configurable: true,
        writable: true,
      });
      expect(normalizeShortcut({ key: 'ArrowLeft', cmdOrCtrlKey: true })).toEqual({
        key: 'ArrowLeft',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
    });
  });

  describe('normalizeShortcut', () => {
    it('should parse a string representation', () => {
      const parsed = normalizeShortcut('Ctrl+Alt+Delete');
      expect(parsed.key).toBe('Delete');
      expect(parsed.ctrlKey).toBe(true);
      expect(parsed.altKey).toBe(true);
    });

    it('should normalize a partial shortcut object, filling in missing modifiers with false', () => {
      const partial: NatTableShortcut = { key: 'ArrowDown', ctrlKey: true };
      const normalized = normalizeShortcut(partial);
      expect(normalized).toEqual({
        key: 'ArrowDown',
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
    });
  });

  describe('matchShortcut', () => {
    it('should match a KeyboardEvent against a string shortcut', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        altKey: true,
        shiftKey: true,
      });
      expect(matchShortcut(event, 'Alt+Shift+ArrowLeft')).toBe(true);
    });

    it('should not match if modifier keys do not match exactly', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        altKey: true,
        shiftKey: false, // missing Shift
      });
      expect(matchShortcut(event, 'Alt+Shift+ArrowLeft')).toBe(false);
    });

    it('should match a KeyboardEvent against a shortcut object', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
      });
      expect(matchShortcut(event, { key: 'Enter' })).toBe(true);
    });
  });

  describe('matchShortcutValue', () => {
    it('should match against a single value', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      expect(matchShortcutValue(event, 'Escape')).toBe(true);
    });

    it('should match against an array of values', () => {
      const event = new KeyboardEvent('keydown', { key: 'Spacebar' });
      expect(matchShortcutValue(event, ['Enter', ' ', 'Spacebar'])).toBe(true);
    });

    it('should return false if value is undefined', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(matchShortcutValue(event, undefined)).toBe(false);
    });
  });

  describe('mergeNatTableKeybindings', () => {
    it('should fall back to defaults when empty overrides are provided', () => {
      const merged = mergeNatTableKeybindings({}, {});
      expect(merged).toEqual(DEFAULT_NAT_TABLE_KEYBINDINGS);
    });

    it('should merge and prioritize overrides', () => {
      const merged = mergeNatTableKeybindings(
        { rowActivate: 'Space' },
        { columnReorderLeft: 'Ctrl+ArrowLeft' },
      );
      expect(merged.rowActivate).toBe('Space');
      expect(merged.columnReorderLeft).toBe('Ctrl+ArrowLeft');
      expect(merged.columnReorderRight).toBe(DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight);
    });
  });

  describe('serializeShortcutValue', () => {
    it('should handle undefined and empty input', () => {
      expect(serializeShortcutValue(undefined)).toBe('');
    });

    it('should serialize simple string shortcuts', () => {
      expect(serializeShortcutValue('Enter')).toBe('Enter');
      expect(serializeShortcutValue(' ')).toBe('Space');
    });

    it('should serialize single shortcut objects with modifiers alphabetically', () => {
      const shortcut: NatTableShortcut = {
        key: 'a',
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        metaKey: true,
      };
      // Alphabetical order: Alt, Control, Meta, Shift
      expect(serializeShortcutValue(shortcut)).toBe('Alt+Control+Meta+Shift+a');
    });

    it('should serialize array shortcut values separated by spaces', () => {
      const value = ['Enter', ' ', { key: 'ArrowLeft', altKey: true, shiftKey: true }];
      expect(serializeShortcutValue(value)).toBe('Enter Space Alt+Shift+ArrowLeft');
    });
  });

  describe('areShortcutsEqual', () => {
    it('should return true for identical shortcuts in different formats', () => {
      expect(areShortcutsEqual('Ctrl+Enter', { key: 'Enter', ctrlKey: true })).toBe(true);
      expect(areShortcutsEqual('Alt+Shift+a', 'Alt+Shift+A')).toBe(true);
    });

    it('should return false for different key combinations', () => {
      expect(areShortcutsEqual('Ctrl+Enter', 'Enter')).toBe(false);
      expect(areShortcutsEqual('Ctrl+Enter', 'Alt+Enter')).toBe(false);
    });
  });

  describe('areShortcutValuesOverlapping', () => {
    it('should return true if there is any overlap between values', () => {
      expect(areShortcutValuesOverlapping(['Enter', 'Space'], 'Space')).toBe(true);
      expect(areShortcutValuesOverlapping(['Alt+ArrowLeft'], ['Alt+ArrowLeft', 'ArrowLeft'])).toBe(true);
    });

    it('should return false if there is no overlap', () => {
      expect(areShortcutValuesOverlapping(['Enter', 'Space'], 'ArrowLeft')).toBe(false);
    });
  });

  describe('validateKeybindings', () => {
    it('should return no warnings for standard/default keybindings', () => {
      const warnings = validateKeybindings(DEFAULT_NAT_TABLE_KEYBINDINGS);
      expect(warnings).toEqual([]);
    });

    it('should return warnings when multiple actions register conflicting shortcuts', () => {
      const conflicting: Required<NatTableKeybindings> = {
        ...DEFAULT_NAT_TABLE_KEYBINDINGS,
        columnReorderLeft: 'Alt+Shift+ArrowLeft',
        columnReorderRight: 'Alt+Shift+ArrowLeft', // conflict!
      };
      const warnings = validateKeybindings(conflicting);
      expect(warnings.length).toBe(1);
      expect(warnings[0]).toContain("columnReorderLeft");
      expect(warnings[0]).toContain("columnReorderRight");
    });
  });

  describe('createNatTableKeyboard', () => {
    it('should compile functional helper mapping matching KeyboardEvents', () => {
      const keyboard = createNatTableKeyboard(DEFAULT_NAT_TABLE_KEYBINDINGS);

      // Test enter
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      expect(keyboard.cellInteraction.enter(enterEvent)).toBe(true);
      expect(keyboard.cellInteraction.enter(escapeEvent)).toBe(false);

      // Test exit
      expect(keyboard.cellInteraction.exit(escapeEvent)).toBe(true);

      // Test rowActivate
      expect(keyboard.rowActivate(enterEvent)).toBe(true);
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      expect(keyboard.rowActivate(spaceEvent)).toBe(true);

      // Test columnReorderDirection
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, shiftKey: true });
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, shiftKey: true });
      expect(keyboard.columnReorderDirection(leftEvent)).toBe(-1);
      expect(keyboard.columnReorderDirection(rightEvent)).toBe(1);
      expect(keyboard.columnReorderDirection(enterEvent)).toBeNull();
    });
  });
});

