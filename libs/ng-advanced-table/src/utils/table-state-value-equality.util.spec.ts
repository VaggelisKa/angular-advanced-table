import { hasNatTableStateValueChanged } from './table-state-value-equality.util';

class FilterToken {
  public readonly value = 'same';
}

/** `hasNatTableStateValueChanged` returns `true` when the values differ. */
const changed = hasNatTableStateValueChanged;

describe('FEATURE: table state value equality', () => {
  describe('GIVEN: consumer filter values that JSON cannot round-trip', () => {
    describe('WHEN: comparing BigInt, Set, and class-instance filter values', () => {
      it('THEN: it compares them structurally without stringifying them', () => {
        expect(changed([{ id: 'status', value: 1n }], [{ id: 'status', value: 1n }])).toBe(false);
        expect(changed([{ id: 'status', value: new Set(['Healthy']) }], [{ id: 'status', value: new Set(['Healthy']) }])).toBe(false);
        expect(
          changed(
            [{ id: 'status', value: new Set(['Healthy', 'Warning']) }],
            [{ id: 'status', value: new Set(['Warning', 'Healthy']) }]
          )
        ).toBe(false);
        expect(
          changed(
            [{ id: 'status', value: new Set([{ value: 'Healthy' }, { value: 'Warning' }]) }],
            [{ id: 'status', value: new Set([{ value: 'Warning' }, { value: 'Healthy' }]) }]
          )
        ).toBe(false);
        expect(changed([{ id: 'status', value: 1n }], [{ id: 'status', value: 2n }])).toBe(true);
        expect(changed([{ id: 'status', value: new Set(['Healthy']) }], [{ id: 'status', value: new Set(['Alert']) }])).toBe(true);
        expect(changed([{ id: 'status', value: new FilterToken() }], [{ id: 'status', value: new FilterToken() }])).toBe(true);
      });
    });
  });

  describe('GIVEN: Date filter values', () => {
    describe('WHEN: two dates carry the same instant', () => {
      it('THEN: it reports no change', () => {
        expect(changed(new Date('2026-08-07T10:00:00Z'), new Date('2026-08-07T10:00:00Z'))).toBe(false);
      });
    });

    describe('WHEN: two dates carry different instants', () => {
      it('THEN: it reports a change', () => {
        expect(changed(new Date('2026-08-07T10:00:00Z'), new Date('2026-08-07T10:00:01Z'))).toBe(true);
      });
    });

    describe('WHEN: a date is compared against a non-date object', () => {
      it('THEN: it reports a change rather than falling through to key comparison', () => {
        expect(changed(new Date('2026-08-07T10:00:00Z'), { time: 0 })).toBe(true);
      });
    });
  });

  describe('GIVEN: RegExp filter values', () => {
    describe('WHEN: two expressions share a source and flags', () => {
      it('THEN: it reports no change', () => {
        expect(changed(/^ok$/giu, /^ok$/giu)).toBe(false);
      });
    });

    describe('WHEN: two expressions share a source but differ in flags', () => {
      it('THEN: it reports a change', () => {
        expect(changed(/^ok$/gi, /^ok$/g)).toBe(true);
      });
    });

    describe('WHEN: an expression is compared against a plain object', () => {
      it('THEN: it reports a change', () => {
        expect(changed(/^ok$/, { source: '^ok$' })).toBe(true);
      });
    });
  });

  describe('GIVEN: Map filter values', () => {
    describe('WHEN: two maps hold equal entries in the same order', () => {
      it('THEN: it reports no change', () => {
        expect(
          changed(
            new Map([
              ['a', 1],
              ['b', 2]
            ]),
            new Map([
              ['a', 1],
              ['b', 2]
            ])
          )
        ).toBe(false);
      });
    });

    describe('WHEN: two maps differ in size', () => {
      it('THEN: it reports a change', () => {
        expect(
          changed(
            new Map([['a', 1]]),
            new Map([
              ['a', 1],
              ['b', 2]
            ])
          )
        ).toBe(true);
      });
    });

    describe('WHEN: two maps hold equal entries in a different insertion order', () => {
      it('THEN: it reports a change, because Map comparison is order-sensitive', () => {
        expect(
          changed(
            new Map([
              ['a', 1],
              ['b', 2]
            ]),
            new Map([
              ['b', 2],
              ['a', 1]
            ])
          )
        ).toBe(true);
      });
    });
  });

  describe('GIVEN: Set filter values whose members only match under backtracking', () => {
    describe('WHEN: a greedy first match would strand a later member', () => {
      it('THEN: it still pairs every member and reports no change', () => {
        const left = new Set([{ a: 1 }, { a: 1, b: 2 }]);
        const right = new Set([{ a: 1, b: 2 }, { a: 1 }]);

        expect(changed(left, right)).toBe(false);
      });
    });

    describe('WHEN: one member has no counterpart', () => {
      it('THEN: it reports a change', () => {
        expect(changed(new Set([{ a: 1 }, { a: 2 }]), new Set([{ a: 1 }, { a: 3 }]))).toBe(true);
      });
    });
  });

  describe('GIVEN: array filter values', () => {
    describe('WHEN: the arrays differ in length', () => {
      it('THEN: it reports a change', () => {
        expect(changed([1, 2], [1, 2, 3])).toBe(true);
      });
    });

    describe('WHEN: nested arrays hold equal values', () => {
      it('THEN: it reports no change', () => {
        expect(changed([[1, [2, 3]]], [[1, [2, 3]]])).toBe(false);
      });
    });

    describe('WHEN: an array is compared against a non-array object', () => {
      it('THEN: it reports a change', () => {
        expect(changed([1], { 0: 1, length: 1 })).toBe(true);
      });
    });

    describe('WHEN: structurally equal arrays exceed the comparison depth budget', () => {
      it('THEN: it conservatively reports a change instead of recursing without a bound', () => {
        let left: unknown = 'value';
        let right: unknown = 'value';

        for (let depth = 0; depth < 512; depth += 1) {
          left = [left];
          right = [right];
        }

        expect(changed(left, right)).toBe(true);
      });
    });

    describe('WHEN: structurally equal arrays exceed the comparison work budget', () => {
      it('THEN: it conservatively reports a change', () => {
        const left = Array.from({ length: 10_001 }, (_, index) => index);
        const right = Array.from({ length: 10_001 }, (_, index) => index);

        expect(changed(left, right)).toBe(true);
      });
    });
  });

  describe('GIVEN: self-referencing filter values', () => {
    describe('WHEN: two structurally identical cyclic objects are compared', () => {
      it('THEN: it terminates and reports no change', () => {
        type Cyclic = { id: string; self?: Cyclic };

        const left: Cyclic = { id: 'a' };
        const right: Cyclic = { id: 'a' };

        left.self = left;
        right.self = right;

        expect(changed(left, right)).toBe(false);
      });
    });

    describe('WHEN: two cyclic objects differ outside the cycle', () => {
      it('THEN: it terminates and reports a change', () => {
        type Cyclic = { id: string; self?: Cyclic };

        const left: Cyclic = { id: 'a' };
        const right: Cyclic = { id: 'b' };

        left.self = left;
        right.self = right;

        expect(changed(left, right)).toBe(true);
      });
    });
  });

  describe('GIVEN: objects with unusual prototypes or key types', () => {
    describe('WHEN: two null-prototype objects hold equal keys', () => {
      it('THEN: it reports no change', () => {
        const left = Object.assign(Object.create(null) as object, { id: 'a' });
        const right = Object.assign(Object.create(null) as object, { id: 'a' });

        expect(changed(left, right)).toBe(false);
      });
    });

    describe('WHEN: a null-prototype object is compared against a plain object', () => {
      it('THEN: it reports a change, because prototypes differ', () => {
        const left = Object.assign(Object.create(null) as object, { id: 'a' });

        expect(changed(left, { id: 'a' })).toBe(true);
      });
    });

    describe('WHEN: two objects share an enumerable symbol key and value', () => {
      it('THEN: it reports no change', () => {
        const key = Symbol('filter');

        expect(changed({ [key]: 'a' }, { [key]: 'a' })).toBe(false);
      });
    });

    describe('WHEN: two objects hold the same key count but different keys', () => {
      it('THEN: it reports a change', () => {
        expect(changed({ a: 1 }, { b: 1 })).toBe(true);
      });
    });
  });

  describe('GIVEN: primitive filter values', () => {
    describe('WHEN: both sides are NaN', () => {
      it('THEN: it reports no change, following Object.is semantics', () => {
        expect(changed(Number.NaN, Number.NaN)).toBe(false);
      });
    });

    describe('WHEN: an object is compared against a primitive', () => {
      it('THEN: it reports a change in both directions', () => {
        expect(changed({ a: 1 }, 1)).toBe(true);
        expect(changed(1, { a: 1 })).toBe(true);
      });
    });

    describe('WHEN: null is compared against undefined', () => {
      it('THEN: it reports a change', () => {
        expect(changed(null, undefined)).toBe(true);
      });
    });
  });
});
