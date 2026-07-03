import { signal } from '@angular/core';

import { controlledSlice } from './controlled-slice.util';

describe('FEATURE: NatTable controlledSlice', () => {
  describe('GIVEN: no read/write hooks', () => {
    describe('WHEN: the controlled source is undefined', () => {
      it('THEN: merged() reads the internal value', () => {
        const controlled = signal<number | undefined>(undefined);
        const slice = controlledSlice(controlled, 1);

        expect(slice.merged()).toBe(1);
      });
    });

    describe('WHEN: the controlled source is defined', () => {
      it('THEN: merged() reads the controlled value instead of the internal one', () => {
        const controlled = signal<number | undefined>(5);
        const slice = controlledSlice(controlled, 1);

        expect(slice.merged()).toBe(5);
      });
    });
  });

  describe('GIVEN: a read hook', () => {
    const controlled = signal<number | undefined>(undefined);
    const slice = controlledSlice(controlled, 1, { read: (value) => value * 10 });

    describe('WHEN: sourced from the internal value', () => {
      it('THEN: merged() applies the read hook to it', () => {
        expect(slice.merged()).toBe(10);
      });
    });

    describe('WHEN: sourced from the controlled value', () => {
      it('THEN: merged() applies the read hook to it too', () => {
        controlled.set(2);

        expect(slice.merged()).toBe(20);
      });
    });
  });

  describe('GIVEN: distinct read and write hooks', () => {
    const controlled = signal<number | undefined>(undefined);
    const slice = controlledSlice(controlled, 1, {
      read: (value) => value + 100,
      write: (value) => value + 1000
    });

    describe('WHEN: reading the merged value', () => {
      it('THEN: it applies only the read hook', () => {
        expect(slice.merged()).toBe(101);
      });
    });

    describe('WHEN: resolving an updater', () => {
      it('THEN: it applies only the write hook, to write(resolveUpdater(merged(), updater))', () => {
        // when: merged() is 101 (1 + 100), the updater adds 1 -> resolveUpdater = 102
        // then: the write hook adds 1000 on top -> 1102
        expect(slice.resolve((current) => current + 1)).toBe(1102);
      });
    });
  });

  describe('GIVEN: resolve with no updater', () => {
    it('THEN: it applies the write hook to the current merged value', () => {
      const controlled = signal<number | undefined>(undefined);
      const slice = controlledSlice(controlled, 4, { write: (value) => value * 2 });

      expect(slice.resolve(undefined)).toBe(8);
    });
  });

  describe('GIVEN: commit', () => {
    describe('WHEN: the slice is uncontrolled (controlled source is undefined)', () => {
      it('THEN: it writes the next value to the internal signal', () => {
        const controlled = signal<number | undefined>(undefined);
        const slice = controlledSlice(controlled, 1);

        slice.commit(9);

        expect(slice.merged()).toBe(9);
      });
    });

    describe('WHEN: the slice is controlled (controlled source is defined)', () => {
      it('THEN: it no-ops instead of writing the internal signal', () => {
        const controlled = signal<number | undefined>(7);
        const slice = controlledSlice(controlled, 1);

        slice.commit(9);
        controlled.set(undefined);

        // when: controlled becomes undefined, merged() falls back to internal
        // then: internal was never written by commit(), so it's still the initial value
        expect(slice.merged()).toBe(1);
      });
    });
  });

  describe('GIVEN: seed', () => {
    describe('WHEN: the slice is controlled (controlled source is defined)', () => {
      it('THEN: it unconditionally writes the internal signal, unlike commit', () => {
        const controlled = signal<number | undefined>(7);
        const slice = controlledSlice(controlled, 1);

        slice.seed(9);
        controlled.set(undefined);

        expect(slice.merged()).toBe(9);
      });
    });
  });
});
