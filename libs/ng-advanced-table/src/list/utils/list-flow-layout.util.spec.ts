import { resolveListFieldShares } from './list-flow-layout.util';

const column = (id: string, listFieldSpan?: unknown): { id: string; columnDef: { meta?: { listFieldSpan?: unknown } } } => ({
  id,
  columnDef: { meta: listFieldSpan === undefined ? {} : { listFieldSpan } }
});

describe('FEATURE: List flow layout field shares', () => {
  describe('GIVEN: visible columns without any listFieldSpan', () => {
    describe('WHEN: the shares are resolved', () => {
      it('THEN: it splits the line evenly, rounded down so the slots never exceed 100%', () => {
        const { shares, slots } = resolveListFieldShares([column('a'), column('b'), column('c')]);

        expect(slots).toBe(3);
        expect([...shares.entries()]).toStrictEqual([
          ['a', '0.3333'],
          ['b', '0.3333'],
          ['c', '0.3333']
        ]);
      });
    });
  });

  describe('GIVEN: columns with numeric weights and a full-width column', () => {
    describe('WHEN: the shares are resolved', () => {
      it('THEN: it weights the line fields and keeps the full-width field out of the line total', () => {
        const { shares, slots } = resolveListFieldShares([column('a', 2), column('b'), column('note', 'full'), column('c', 1)]);

        expect(slots).toBe(3);
        expect(shares.get('a')).toBe('0.5');
        expect(shares.get('b')).toBe('0.25');
        expect(shares.get('c')).toBe('0.25');
        expect(shares.get('note')).toBe('full');
      });
    });
  });

  describe('GIVEN: invalid span values', () => {
    describe('WHEN: the shares are resolved', () => {
      it('THEN: it treats zero, negative, non-finite, and non-numeric spans as a weight of 1', () => {
        const { shares, slots } = resolveListFieldShares([
          column('zero', 0),
          column('negative', -3),
          column('nan', Number.NaN),
          column('text', 'wide'),
          column('infinite', Number.POSITIVE_INFINITY)
        ]);

        expect(slots).toBe(5);
        expect(new Set(shares.values())).toStrictEqual(new Set(['0.2']));
      });
    });
  });

  describe('GIVEN: only full-width columns', () => {
    describe('WHEN: the shares are resolved', () => {
      it('THEN: it reports zero line slots and marks every field full', () => {
        const { shares, slots } = resolveListFieldShares([column('a', 'full'), column('b', 'full')]);

        expect(slots).toBe(0);
        expect(shares.get('a')).toBe('full');
        expect(shares.get('b')).toBe('full');
      });
    });
  });
});
