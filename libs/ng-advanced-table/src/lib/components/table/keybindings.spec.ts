import {
  parseShortcutString,
  normalizeShortcut,
  matchShortcut,
  matchShortcutValue,
  mergeNatTableKeybindings,
  DEFAULT_NAT_TABLE_KEYBINDINGS,
  type NatTableShortcut,
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
});
