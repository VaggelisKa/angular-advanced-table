/* eslint-disable max-lines -- large integration spec */
import {
  createNatTableKeyboard,
  matchShortcut,
  matchShortcutValue,
  mergeNatTableKeybindings,
  serializeShortcutValue,
  validateKeybindings
} from './keybindings.util';
import { areShortcutValuesOverlapping, areShortcutsEqual, normalizeShortcut, parseShortcutString } from './shortcut-parsing.util';
import { DEFAULT_NAT_TABLE_KEYBINDINGS } from '../common/keybindings.const';
import type { NatTableKeybindings, NatTableShortcut } from '../common/keybindings.type';

describe('FEATURE: NatTable Keybindings Utilities', () => {
  describe('GIVEN: parseShortcutString', () => {
    describe('WHEN: parse single keys with no modifiers', () => {
      it('THEN: it returns a shortcut object with no modifier flags', () => {
        const parsed = parseShortcutString('Enter');

        expect(parsed).toStrictEqual({
          key: 'Enter',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false
        });
      });
    });

    describe('WHEN: parse key combinations with modifiers', () => {
      it('THEN: it returns a shortcut object with the requested modifier flags', () => {
        const parsed = parseShortcutString('Alt+Shift+ArrowLeft');

        expect(parsed).toStrictEqual({
          key: 'ArrowLeft',
          ctrlKey: false,
          altKey: true,
          shiftKey: true,
          metaKey: false
        });
      });
    });

    describe('WHEN: support alternative modifier names like Control/Cmd/Win', () => {
      it('THEN: it recognizes the supported modifier aliases', () => {
        const parsed = parseShortcutString('Control+Cmd+a');

        expect(parsed).toStrictEqual({
          key: 'a',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
          metaKey: true
        });
      });
    });

    describe('WHEN: correctly handle the plus (+) key when used with modifiers', () => {
      it('THEN: it keeps the plus key distinct from modifier separators', () => {
        const parsed = parseShortcutString('Ctrl++');

        expect(parsed).toStrictEqual({
          key: '+',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
          metaKey: false
        });
      });
    });
  });

  describe('GIVEN: Mod / CmdOrCtrl key translation', () => {
    let originalNavigator: Navigator;

    beforeEach(() => {
      originalNavigator = globalThis.navigator;
    });

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true
      });
    });

    describe('WHEN: map Mod to metaKey on Mac', () => {
      it('THEN: it sets the macOS meta modifier flag', () => {
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'macintosh',
            platform: 'macintel'
          },
          configurable: true,
          writable: true
        });
        const parsed = parseShortcutString('Mod+a');

        expect(parsed).toStrictEqual({
          key: 'a',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: true
        });
      });
    });

    describe('WHEN: map Mod to ctrlKey on Windows/Linux', () => {
      it('THEN: it sets the non-macOS control modifier flag', () => {
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'windows',
            platform: 'win32'
          },
          configurable: true,
          writable: true
        });
        const parsed = parseShortcutString('Mod+a');

        expect(parsed).toStrictEqual({
          key: 'a',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
          metaKey: false
        });
      });
    });

    describe('WHEN: map cmdOrCtrlKey object property correctly based on platform', () => {
      it('THEN: it normalizes cmdOrCtrlKey for each platform', () => {
        // Mac
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'macintosh',
            platform: 'macintel'
          },
          configurable: true,
          writable: true
        });
        expect(normalizeShortcut({ key: 'ArrowLeft', cmdOrCtrlKey: true })).toStrictEqual({
          key: 'ArrowLeft',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: true
        });

        // Windows/Linux
        Object.defineProperty(globalThis, 'navigator', {
          value: {
            userAgent: 'windows',
            platform: 'win32'
          },
          configurable: true,
          writable: true
        });
        expect(normalizeShortcut({ key: 'ArrowLeft', cmdOrCtrlKey: true })).toStrictEqual({
          key: 'ArrowLeft',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
          metaKey: false
        });
      });
    });
  });

  describe('GIVEN: normalizeShortcut', () => {
    describe('WHEN: parse a string representation', () => {
      it('THEN: it returns the normalized shortcut value', () => {
        const parsed = normalizeShortcut('Ctrl+Alt+Delete');

        expect(parsed.key).toBe('Delete');
        expect(parsed.ctrlKey).toBe(true);
        expect(parsed.altKey).toBe(true);
      });
    });

    describe('WHEN: normalize a partial shortcut object, filling in missing modifiers with false', () => {
      it('THEN: it fills all omitted modifier flags with false', () => {
        const partial: NatTableShortcut = { key: 'ArrowDown', ctrlKey: true };
        const normalized = normalizeShortcut(partial);

        expect(normalized).toStrictEqual({
          key: 'ArrowDown',
          ctrlKey: true,
          altKey: false,
          shiftKey: false,
          metaKey: false
        });
      });
    });
  });

  describe('GIVEN: matchShortcut', () => {
    describe('WHEN: match a KeyboardEvent against a string shortcut', () => {
      it('THEN: it reports a match for the configured key event', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          altKey: true,
          shiftKey: true
        });

        expect(matchShortcut(event, 'Alt+Shift+ArrowLeft')).toBe(true);
      });
    });

    describe('WHEN: not match if modifier keys do not match exactly', () => {
      it('THEN: it rejects events with different modifier state', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          altKey: true,
          shiftKey: false // missing Shift
        });

        expect(matchShortcut(event, 'Alt+Shift+ArrowLeft')).toBe(false);
      });
    });

    describe('WHEN: match a KeyboardEvent against a shortcut object', () => {
      it('THEN: it accepts the matching object shortcut', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter'
        });

        expect(matchShortcut(event, { key: 'Enter' })).toBe(true);
      });
    });

    describe('WHEN: normalize Space aliases when matching KeyboardEvents', () => {
      it('THEN: it accepts supported Space key aliases', () => {
        const modernSpaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        const legacySpaceEvent = new KeyboardEvent('keydown', { key: 'Spacebar' });

        expect(matchShortcut(modernSpaceEvent, 'Space')).toBe(true);
        expect(matchShortcut(modernSpaceEvent, 'space')).toBe(true);
        expect(matchShortcut(modernSpaceEvent, 'Spacebar')).toBe(true);
        expect(matchShortcut(legacySpaceEvent, 'Space')).toBe(true);
      });
    });
  });

  describe('GIVEN: matchShortcutValue', () => {
    describe('WHEN: match against a single value', () => {
      it('THEN: it accepts the configured shortcut value', () => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });

        expect(matchShortcutValue(event, 'Escape')).toBe(true);
      });
    });

    describe('WHEN: match against an array of values', () => {
      it('THEN: it accepts any matching shortcut candidate', () => {
        const event = new KeyboardEvent('keydown', { key: 'Spacebar' });

        expect(matchShortcutValue(event, ['Enter', ' ', 'Spacebar'])).toBe(true);
      });
    });

    describe('WHEN: return false if value is undefined', () => {
      it('THEN: it reports no match for missing shortcut values', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        expect(matchShortcutValue(event, undefined)).toBe(false);
      });
    });
  });

  describe('GIVEN: mergeNatTableKeybindings', () => {
    describe('WHEN: fall back to defaults when empty overrides are provided', () => {
      it('THEN: it preserves default keybinding values', () => {
        const merged = mergeNatTableKeybindings({}, {});

        expect(merged).toStrictEqual(DEFAULT_NAT_TABLE_KEYBINDINGS);
      });
    });

    describe('WHEN: merge and prioritize overrides', () => {
      it('THEN: it applies override values over defaults', () => {
        const merged = mergeNatTableKeybindings({ rowActivate: 'Space' }, { columnReorderLeft: 'Ctrl+ArrowLeft' });

        expect(merged.rowActivate).toBe('Space');
        expect(merged.columnReorderLeft).toBe('Ctrl+ArrowLeft');
        expect(merged.columnReorderRight).toBe(DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight);
      });
    });
  });

  describe('GIVEN: serializeShortcutValue', () => {
    describe('WHEN: handle undefined and empty input', () => {
      it('THEN: it returns an empty serialized shortcut string', () => {
        expect(serializeShortcutValue(undefined)).toBe('');
      });
    });

    describe('WHEN: serialize simple string shortcuts', () => {
      it('THEN: it returns the original shortcut text', () => {
        expect(serializeShortcutValue('Enter')).toBe('Enter');
        expect(serializeShortcutValue(' ')).toBe('Space');
        expect(serializeShortcutValue('Spacebar')).toBe('Space');
        expect(serializeShortcutValue('space')).toBe('Space');
      });
    });

    describe('WHEN: serialize single shortcut objects with modifiers alphabetically', () => {
      it('THEN: it emits modifiers in stable order', () => {
        const shortcut: NatTableShortcut = {
          key: 'a',
          ctrlKey: true,
          altKey: true,
          shiftKey: true,
          metaKey: true
        };

        // Alphabetical order: Alt, Control, Meta, Shift
        expect(serializeShortcutValue(shortcut)).toBe('Alt+Control+Meta+Shift+a');
      });
    });

    describe('WHEN: serialize array shortcut values separated by spaces', () => {
      it('THEN: it joins serialized shortcuts with spaces', () => {
        const value = ['Enter', ' ', { key: 'ArrowLeft', altKey: true, shiftKey: true }];

        expect(serializeShortcutValue(value)).toBe('Enter Space Alt+Shift+ArrowLeft');
      });
    });
  });

  describe('GIVEN: areShortcutsEqual', () => {
    describe('WHEN: return true for identical shortcuts in different formats', () => {
      it('THEN: it recognizes equivalent shortcut definitions', () => {
        expect(areShortcutsEqual('Ctrl+Enter', { key: 'Enter', ctrlKey: true })).toBe(true);
        expect(areShortcutsEqual('Alt+Shift+a', 'Alt+Shift+A')).toBe(true);
        expect(areShortcutsEqual('Space', 'Spacebar')).toBe(true);
        expect(areShortcutsEqual('Space', { key: ' ' })).toBe(true);
      });
    });

    describe('WHEN: return false for different key combinations', () => {
      it('THEN: it rejects different shortcut definitions', () => {
        expect(areShortcutsEqual('Ctrl+Enter', 'Enter')).toBe(false);
        expect(areShortcutsEqual('Ctrl+Enter', 'Alt+Enter')).toBe(false);
      });
    });
  });

  describe('GIVEN: areShortcutValuesOverlapping', () => {
    describe('WHEN: return true if there is any overlap between values', () => {
      it('THEN: it detects shared shortcut values', () => {
        expect(areShortcutValuesOverlapping(['Enter', 'Space'], 'Space')).toBe(true);
        expect(areShortcutValuesOverlapping(['Alt+ArrowLeft'], ['Alt+ArrowLeft', 'ArrowLeft'])).toBe(true);
      });
    });

    describe('WHEN: return false if there is no overlap', () => {
      it('THEN: it reports no conflict for distinct shortcut values', () => {
        expect(areShortcutValuesOverlapping(['Enter', 'Space'], 'ArrowLeft')).toBe(false);
      });
    });
  });

  describe('GIVEN: validateKeybindings', () => {
    describe('WHEN: return no warnings for standard/default keybindings', () => {
      it('THEN: it keeps the default configuration warning-free', () => {
        const warnings = validateKeybindings(DEFAULT_NAT_TABLE_KEYBINDINGS);

        expect(warnings).toStrictEqual([]);
      });
    });

    describe('WHEN: return warnings when multiple actions register conflicting shortcuts', () => {
      it('THEN: it reports the conflicting actions and shortcut', () => {
        const conflicting: Required<NatTableKeybindings> = {
          ...DEFAULT_NAT_TABLE_KEYBINDINGS,
          columnReorderLeft: 'Alt+Shift+ArrowLeft',
          columnReorderRight: 'Alt+Shift+ArrowLeft' // conflict!
        };
        const warnings = validateKeybindings(conflicting);

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('columnReorderLeft');
        expect(warnings[0]).toContain('columnReorderRight');
      });
    });
  });

  describe('GIVEN: createNatTableKeyboard', () => {
    describe('WHEN: compile functional helper mapping matching KeyboardEvents', () => {
      it('THEN: it exposes helper functions that match keyboard events', () => {
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
        const leftVal = DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderLeft;
        const rightVal = DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight;
        const leftShortcut = normalizeShortcut(Array.isArray(leftVal) ? leftVal[0] : leftVal);
        const rightShortcut = normalizeShortcut(Array.isArray(rightVal) ? rightVal[0] : rightVal);
        const leftEvent = new KeyboardEvent('keydown', {
          key: leftShortcut.key,
          altKey: leftShortcut.altKey,
          ctrlKey: leftShortcut.ctrlKey,
          metaKey: leftShortcut.metaKey,
          shiftKey: leftShortcut.shiftKey
        });
        const rightEvent = new KeyboardEvent('keydown', {
          key: rightShortcut.key,
          altKey: rightShortcut.altKey,
          ctrlKey: rightShortcut.ctrlKey,
          metaKey: rightShortcut.metaKey,
          shiftKey: rightShortcut.shiftKey
        });

        expect(keyboard.columnReorderDirection(leftEvent)).toBe(-1);
        expect(keyboard.columnReorderDirection(rightEvent)).toBe(1);
        expect(keyboard.columnReorderDirection(enterEvent)).toBeNull();
      });
    });
  });
});
