import { mergePageSizeLabels } from './controls-labels.util';

describe('FEATURE: controls label merge', () => {
  describe('GIVEN: parent and override page-size labels', () => {
    describe('WHEN: merging field by field', () => {
      const merged = mergePageSizeLabels({ groupAriaLabel: 'Parent group' }, { pageSizeOptionText: () => 'override' });

      it('THEN: the override wins and the parent fills the gaps', () => {
        // then: unset override field falls back to the parent
        expect(merged.groupAriaLabel).toBe('Parent group');
        // then: supplied override formatter wins
        expect(merged.pageSizeOptionText?.({ pageSizeValue: 1, pageSizeText: '1', selectionState: 'not-selected' })).toBe('override');
      });
    });
  });
});
