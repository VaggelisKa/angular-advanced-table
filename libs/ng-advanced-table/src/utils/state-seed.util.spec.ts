import type { PaginationState } from '@tanstack/angular-table';

import {
  firstPageUpdater,
  isUnavailableRequiredInputError,
  readRequiredInput,
  resolveSeedState,
  resolveUpdater
} from './state-seed.util';
import type { NatTableUserState } from '../common/table-state.type';

/** firstPageUpdater is always the function member of the Updater<PaginationState> union; narrow it once for direct calls below. */
const applyFirstPageUpdater = firstPageUpdater as (pagination: PaginationState) => PaginationState;

describe('FEATURE: NatTable state-seed utilities', () => {
  describe('GIVEN: resolveUpdater', () => {
    describe('WHEN: the updater is undefined', () => {
      it('THEN: it returns the current value unchanged', () => {
        expect(resolveUpdater(5, undefined)).toBe(5);
      });
    });

    describe('WHEN: the updater is a plain value', () => {
      it('THEN: it returns that value instead of the current one', () => {
        expect(resolveUpdater(5, 9)).toBe(9);
      });
    });

    describe('WHEN: the updater is a function', () => {
      it('THEN: it calls the function with the current value and returns its result', () => {
        expect(resolveUpdater(5, (current) => current + 1)).toBe(6);
      });
    });
  });

  describe('GIVEN: firstPageUpdater', () => {
    describe('WHEN: applied to a pagination state on a later page', () => {
      it('THEN: it resets pageIndex to 0 while preserving pageSize', () => {
        const current: PaginationState = { pageIndex: 5, pageSize: 25 };

        expect(applyFirstPageUpdater(current)).toStrictEqual({ pageIndex: 0, pageSize: 25 });
      });
    });

    describe('WHEN: applied to a pagination state', () => {
      it('THEN: it does not mutate the input object', () => {
        const current: PaginationState = { pageIndex: 5, pageSize: 25 };

        applyFirstPageUpdater(current);

        expect(current).toStrictEqual({ pageIndex: 5, pageSize: 25 });
      });
    });
  });

  describe('GIVEN: resolveSeedState', () => {
    const defaults: NatTableUserState = {
      sorting: [{ id: 'name', desc: false }],
      globalFilter: 'default-query',
      columnFilters: [{ id: 'status', value: 'active' }],
      columnVisibility: { email: true },
      columnOrder: ['name', 'email'],
      columnPinning: { left: ['name'] },
      columnSizing: { name: 120 },
      rowSelection: { 'row-1': true },
      pagination: { pageIndex: 2, pageSize: 25 }
    };

    describe('WHEN: the initial state is empty', () => {
      it('THEN: it returns the defaults untouched', () => {
        expect(resolveSeedState({}, defaults)).toStrictEqual(defaults);
      });
    });

    describe('WHEN: the initial state provides only some top-level fields', () => {
      it('THEN: it overrides just those fields and fills the rest from defaults', () => {
        const resolved = resolveSeedState(
          {
            sorting: [{ id: 'email', desc: true }],
            columnFilters: [{ id: 'role', value: 'admin' }]
          },
          defaults
        );

        expect(resolved.sorting).toStrictEqual([{ id: 'email', desc: true }]);
        expect(resolved.columnFilters).toStrictEqual([{ id: 'role', value: 'admin' }]);
        expect(resolved.globalFilter).toBe(defaults.globalFilter);
        expect(resolved.columnVisibility).toStrictEqual(defaults.columnVisibility);
      });
    });

    describe('WHEN: the initial state provides a full pagination override', () => {
      it('THEN: it uses both provided pagination fields instead of the defaults', () => {
        const resolved = resolveSeedState({ pagination: { pageIndex: 4, pageSize: 100 } }, defaults);

        expect(resolved.pagination).toStrictEqual({ pageIndex: 4, pageSize: 100 });
      });
    });

    describe('WHEN: the initial state provides only a partial pagination object', () => {
      it('THEN: it fills the missing pagination field from defaults instead of replacing the whole object', () => {
        const resolved = resolveSeedState({ pagination: { pageIndex: 9 } as PaginationState }, defaults);

        expect(resolved.pagination).toStrictEqual({ pageIndex: 9, pageSize: defaults.pagination.pageSize });
      });
    });

    describe('WHEN: the initial state sets globalFilter to an explicit empty string', () => {
      it('THEN: it keeps the empty string instead of falling back to the default', () => {
        const resolved = resolveSeedState({ globalFilter: '' }, defaults);

        expect(resolved.globalFilter).toBe('');
      });
    });

    describe('WHEN: the initial state sets rowSelection to an explicit empty object', () => {
      it('THEN: it keeps the empty selection instead of falling back to the default', () => {
        const resolved = resolveSeedState({ rowSelection: {} }, defaults);

        expect(resolved.rowSelection).toStrictEqual({});
      });
    });
  });

  describe('GIVEN: isUnavailableRequiredInputError', () => {
    describe('WHEN: the error is an NG0950-shaped Error with a negative code', () => {
      it('THEN: it returns true', () => {
        expect(isUnavailableRequiredInputError(Object.assign(new Error('NG0950'), { code: -950 }))).toBe(true);
      });
    });

    describe('WHEN: the error is an NG0950-shaped Error with a positive code', () => {
      it('THEN: it returns true', () => {
        expect(isUnavailableRequiredInputError(Object.assign(new Error('NG0950'), { code: 950 }))).toBe(true);
      });
    });

    describe('WHEN: the Error carries an unrelated numeric code', () => {
      it('THEN: it returns false', () => {
        expect(isUnavailableRequiredInputError(Object.assign(new Error('other'), { code: 100 }))).toBe(false);
      });
    });

    describe('WHEN: the Error has no code property', () => {
      it('THEN: it returns false', () => {
        expect(isUnavailableRequiredInputError(new Error('plain'))).toBe(false);
      });
    });

    describe('WHEN: the thrown value is not an Error instance', () => {
      it('THEN: it returns false even when it carries a matching code', () => {
        expect(isUnavailableRequiredInputError({ code: 950 })).toBe(false);
      });
    });
  });

  describe('GIVEN: readRequiredInput', () => {
    describe('WHEN: the reader resolves without throwing', () => {
      it('THEN: it returns the read value instead of the fallback', () => {
        expect(readRequiredInput(() => 'value', 'fallback')).toBe('value');
      });
    });

    describe('WHEN: the reader throws an NG0950-shaped error', () => {
      it('THEN: it returns the fallback instead of throwing', () => {
        const reader = (): string => {
          throw Object.assign(new Error('NG0950'), { code: -950 });
        };

        expect(readRequiredInput(reader, 'fallback')).toBe('fallback');
      });
    });

    describe('WHEN: the reader throws an unrelated error', () => {
      it('THEN: it re-throws instead of swallowing it', () => {
        const reader = (): string => {
          throw new Error('boom');
        };

        expect(() => readRequiredInput(reader, 'fallback')).toThrow('boom');
      });
    });
  });
});
