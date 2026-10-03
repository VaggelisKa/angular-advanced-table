import { assignNatTableBodyRowSlots } from './body-row-slot.util';

const slotsOf = (identities: readonly string[], previous: readonly (readonly [string, number])[] = []): number[] => {
  const slots = assignNatTableBodyRowSlots(identities, previous);

  return identities.map((identity) => slots.get(identity) ?? -1);
};

const asPrevious = (identities: readonly string[], slots: readonly number[]): (readonly [string, number])[] =>
  identities.map((identity, index) => [identity, slots[index]] as const);

describe('FEATURE: body row view slots', () => {
  describe('GIVEN: no rows were rendered before', () => {
    describe('WHEN: a window renders', () => {
      it('THEN: it numbers the slots in render order', () => {
        expect(slotsOf(['a', 'b', 'c'])).toStrictEqual([0, 1, 2]);
      });
    });
  });

  describe('GIVEN: a window scrolls down by two rows', () => {
    describe('WHEN: the next window renders', () => {
      it('THEN: it keeps the slots of rows that stayed and hands the freed slots to entering rows in order', () => {
        const previous = asPrevious(['r0', 'r1', 'r2', 'r3'], [0, 1, 2, 3]);

        expect(slotsOf(['r2', 'r3', 'r4', 'r5'], previous)).toStrictEqual([2, 3, 0, 1]);
      });
    });
  });

  describe('GIVEN: a kept row sits between rows that leave', () => {
    describe('WHEN: more rows enter before it than left before it', () => {
      it('THEN: it never hands an entering row a slot from after the kept row', () => {
        // r5 stays mounted (a focused row). r6's slot (3) comes after it, so
        // reusing it for a row placed before r5 would make Angular detach r5.
        const previous = asPrevious(['r3', 'r4', 'r5', 'r6'], [0, 1, 2, 3]);

        expect(slotsOf(['r0', 'r1', 'r2', 'r5'], previous)).toStrictEqual([0, 1, 4, 2]);
      });
    });

    describe('WHEN: rows enter after it', () => {
      it('THEN: it reuses slots freed before the kept row once the gap after it runs out', () => {
        const previous = asPrevious(['r0', 'r1', 'r5', 'r6'], [0, 1, 2, 3]);

        expect(slotsOf(['r5', 'r6', 'r7', 'r8', 'r9'], previous)).toStrictEqual([2, 3, 0, 1, 4]);
      });
    });
  });

  describe('GIVEN: an identity appears twice', () => {
    describe('WHEN: the slots are assigned', () => {
      it('THEN: it gives the identity a single slot', () => {
        const slots = assignNatTableBodyRowSlots(['a', 'a', 'b']);

        expect([...slots.entries()]).toStrictEqual([
          ['a', 0],
          ['b', 1]
        ]);
      });
    });
  });
});
