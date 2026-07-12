import { DEFAULT_FLAGS } from '../common';
import { buildSeedState, reconcileToggleState } from './table-builder.util';

describe('FEATURE: table builder column state', () => {
  describe('GIVEN: column reordering is enabled', () => {
    describe('WHEN: building the initial table state', () => {
      it('THEN: column order includes Owner before Value', () => {
        expect(buildSeedState(DEFAULT_FLAGS).columnOrder).toEqual(['name', 'category', 'status', 'owner', 'value']);
      });

      it('THEN: column visibility includes Owner', () => {
        expect(buildSeedState(DEFAULT_FLAGS).columnVisibility).toMatchObject({ owner: true });
      });
    });

    describe('WHEN: re-enabling column reordering', () => {
      it('THEN: seeded column order includes Owner before Value', () => {
        expect(reconcileToggleState({}, 'withColumnReorder', true).columnOrder).toEqual([
          'name',
          'category',
          'status',
          'owner',
          'value'
        ]);
      });
    });
  });
});
