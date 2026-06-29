import { mergeNatTableAccessibilityText, resolveNatTableIntl } from './accessibility.util';
import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';

describe('FEATURE: accessibility intl merge', () => {
  describe('GIVEN: a parent and an override accessibility text', () => {
    describe('WHEN: merging field by field', () => {
      const merged = mergeNatTableAccessibilityText(
        { emptyState: 'Parent empty', loadingState: 'Parent loading' },
        { emptyState: 'Child empty' }
      );

      it('THEN: the override wins', () => {
        expect(merged.emptyState).toBe('Child empty');
      });

      it('THEN: the parent fills the gaps', () => {
        expect(merged.loadingState).toBe('Parent loading');
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'zz');

      it('THEN: it falls back to built-in English copy', () => {
        expect(resolved.accessibilityText?.emptyState).toBe('No rows match the current view.');
      });
    });
  });
});
