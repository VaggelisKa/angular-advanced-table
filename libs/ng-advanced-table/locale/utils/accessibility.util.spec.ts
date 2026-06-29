import { mergeNatTableAccessibilityText, resolveNatTableIntl } from './accessibility.util';
import { NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';

describe('FEATURE: accessibility intl merge', () => {
  describe('GIVEN: a parent and an override accessibility text', () => {
    describe('WHEN: merging field by field', () => {
      it('THEN: the override wins and the parent fills the gaps', () => {
        const merged = mergeNatTableAccessibilityText(
          { emptyState: 'Parent empty', loadingState: 'Parent loading' },
          { emptyState: 'Child empty' }
        );

        // then: override value wins
        expect(merged.emptyState).toBe('Child empty');
        // then: unset override field falls back to the parent
        expect(merged.loadingState).toBe('Parent loading');
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      it('THEN: it falls back to built-in English copy', () => {
        const resolved = resolveNatTableIntl({ locales: NAT_TABLE_BUILT_IN_LOCALES }, 'zz');

        // then: English default empty-state copy is used
        expect(resolved.accessibilityText?.emptyState).toBe('No rows match the current view.');
      });
    });
  });
});
