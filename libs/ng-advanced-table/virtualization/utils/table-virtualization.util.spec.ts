import {
  NAT_TABLE_FALLBACK_ROW_HEIGHT,
  NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT,
  NAT_TABLE_MAX_SCROLL_EXTENT_PX,
  createInitialVirtualRange,
  createVirtualItems,
  describeNatTableRemoteWindowingIssues,
  includeVirtualIndex,
  isAppendedRowSequence,
  normalizeNatTableRemoteRowCount,
  normalizeNatTableRowWindowOffset,
  normalizeNatTableVirtualizationOptions,
  opensSubHeaderGroup,
  rangeToRowIndexes
} from './table-virtualization.util';

const remoteDiagnosticsContext = {
  remoteRowCount: 1000 as number | undefined,
  rowWindowOffset: 0,
  rowHeight: 40,
  loadedRowCount: 100,
  hasClientSorting: false,
  hasClientFiltering: false,
  hasClientPagination: false,
  hasSubHeaders: false
};

describe('FEATURE: NatTable virtualization options and ranges', () => {
  describe('GIVEN: fixed-row virtualization options', () => {
    describe('WHEN: options contain invalid runtime values', () => {
      it('THEN: it normalizes them to safe fixed-row defaults', () => {
        // A readable fallback height, not 1px: a one-pixel grid hides every
        // row and mounts roughly viewportHeight rows.
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: Number.NaN, overscan: -2 })).toStrictEqual({
          rowHeight: NAT_TABLE_FALLBACK_ROW_HEIGHT,
          overscan: 5
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 0, overscan: Number.NaN })).toStrictEqual({
          rowHeight: NAT_TABLE_FALLBACK_ROW_HEIGHT,
          overscan: 5
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: Number.POSITIVE_INFINITY })).toStrictEqual({
          rowHeight: NAT_TABLE_FALLBACK_ROW_HEIGHT,
          overscan: 5
        });
      });
    });

    describe('WHEN: only the row height is provided', () => {
      it('THEN: it applies the default overscan', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 40 })).toStrictEqual({
          rowHeight: 40,
          overscan: 5
        });
      });
    });

    describe('WHEN: a valid custom overscan is provided', () => {
      it('THEN: it keeps it, including a zero-row overscan', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 32, overscan: 0 })).toStrictEqual({
          rowHeight: 32,
          overscan: 0
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 32, overscan: 12 })).toStrictEqual({
          rowHeight: 32,
          overscan: 12
        });
      });
    });

    describe('WHEN: a fractional overscan is provided', () => {
      it('THEN: it floors the overscan to whole rows', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 40, overscan: 7.9 })).toStrictEqual({
          rowHeight: 40,
          overscan: 7
        });
      });
    });
  });

  describe('GIVEN: a default range that omits the focused row', () => {
    describe('WHEN: the focus index is included', () => {
      it('THEN: it returns a sorted unique index list', () => {
        expect(includeVirtualIndex([4, 5, 6], 1, 10)).toStrictEqual([1, 4, 5, 6]);
        expect(includeVirtualIndex([4, 5, 6], 5, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex([4, 5, 6], 12, 10)).toStrictEqual([4, 5, 6]);
      });
    });

    describe('WHEN: there is no focus index to include', () => {
      it('THEN: it returns a copy of the mounted indexes', () => {
        const indexes = [4, 5, 6];

        expect(includeVirtualIndex(indexes, null, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex(indexes, -1, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex(indexes, null, 10)).not.toBe(indexes);
      });
    });
  });

  describe('GIVEN: a mounted range projected onto the logical row count', () => {
    describe('WHEN: the range fits within the row count', () => {
      it('THEN: it lists every mounted row index', () => {
        expect(rangeToRowIndexes({ start: 2, end: 5 }, 10)).toStrictEqual([2, 3, 4]);
        expect(rangeToRowIndexes({ start: 0, end: 0 }, 10)).toStrictEqual([]);
      });
    });

    describe('WHEN: the range exceeds the row count', () => {
      it('THEN: it clamps the indexes to the logical rows', () => {
        expect(rangeToRowIndexes({ start: 8, end: 15 }, 10)).toStrictEqual([8, 9]);
        expect(rangeToRowIndexes({ start: 12, end: 15 }, 10)).toStrictEqual([]);
      });
    });

    describe('WHEN: the range is inverted', () => {
      it('THEN: it yields no row indexes', () => {
        expect(rangeToRowIndexes({ start: 5, end: 2 }, 10)).toStrictEqual([]);
      });
    });
  });

  describe('GIVEN: mounted row indexes on the fixed row grid', () => {
    describe('WHEN: virtual items are materialized without sub-headers', () => {
      it('THEN: it derives body-local extents from the row height', () => {
        expect(createVirtualItems([0, 3], 40, [])).toStrictEqual([
          { index: 0, start: 0, end: 40 },
          { index: 3, start: 120, end: 160 }
        ]);
      });
    });

    describe('WHEN: virtual items are materialized across sub-header groups', () => {
      it('THEN: it shifts extents by the sub-header slots and grows group-opening blocks upward', () => {
        // Rows 0 and 2 open groups: offsets [1, 1, 2]. Row 0's block spans its
        // sub-header (slot 0) plus itself (slot 1); row 1 sits alone at slot 2;
        // row 2's block spans slots 3 (sub-header) and 4.
        expect(createVirtualItems([0, 1, 2], 40, [1, 1, 2])).toStrictEqual([
          { index: 0, start: 0, end: 80 },
          { index: 1, start: 80, end: 120 },
          { index: 2, start: 120, end: 200 }
        ]);
      });
    });

    describe('WHEN: a group opens at an index beyond the offsets array', () => {
      it('THEN: it treats missing offsets as zero sub-header slots', () => {
        expect(createVirtualItems([5], 40, [])).toStrictEqual([{ index: 5, start: 200, end: 240 }]);
      });
    });

    describe('WHEN: group membership is resolved from the running offsets', () => {
      it('THEN: it marks exactly the rows whose offset steps up', () => {
        expect(opensSubHeaderGroup([1, 1, 2], 0)).toBe(true);
        expect(opensSubHeaderGroup([1, 1, 2], 1)).toBe(false);
        expect(opensSubHeaderGroup([1, 1, 2], 2)).toBe(true);
        expect(opensSubHeaderGroup([], 4)).toBe(false);
      });
    });
  });

  describe('GIVEN: a first paint before any layout measurement', () => {
    describe('WHEN: the row count exceeds the initial window', () => {
      it('THEN: it mounts the fixed initial row count', () => {
        expect(createInitialVirtualRange(1000)).toStrictEqual({ start: 0, end: NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT });
      });
    });

    describe('WHEN: the row count is below the initial window', () => {
      it('THEN: it mounts every logical row', () => {
        expect(createInitialVirtualRange(3)).toStrictEqual({ start: 0, end: 3 });
        expect(createInitialVirtualRange(0)).toStrictEqual({ start: 0, end: 0 });
      });
    });
  });

  describe('GIVEN: two row-id sequences from consecutive row models', () => {
    describe('WHEN: the newer sequence extends the older one', () => {
      it('THEN: it reads as an append, so the mounted window survives', () => {
        expect(isAppendedRowSequence(['a', 'b'], ['a', 'b'])).toBe(true);
        expect(isAppendedRowSequence(['a', 'b'], ['a', 'b', 'c'])).toBe(true);
      });
    });

    describe('WHEN: the newer sequence rewrites, truncates, or reorders the older one', () => {
      it('THEN: it reads as a rebuild, so the window resets', () => {
        expect(isAppendedRowSequence(['a', 'b'], ['b', 'a'])).toBe(false);
        expect(isAppendedRowSequence(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
        expect(isAppendedRowSequence(['a', 'b'], ['c', 'a', 'b'])).toBe(false);
      });
    });

    describe('WHEN: IDs contain text that could collide in a flattened representation', () => {
      it('THEN: it preserves row boundaries and reads the replacement as a rebuild', () => {
        expect(isAppendedRowSequence(['a', 'b'], ['a\u001Fb', 'c'])).toBe(false);
        expect(isAppendedRowSequence([], ['a'])).toBe(false);
      });
    });
  });

  describe('GIVEN: remote windowing inputs on the virtualize directive', () => {
    describe('WHEN: the remote row count is normalized', () => {
      it('THEN: it keeps non-negative integers and rejects every other shape as inactive', () => {
        expect(normalizeNatTableRemoteRowCount(2_000_000)).toBe(2_000_000);
        expect(normalizeNatTableRemoteRowCount(0)).toBe(0);
        expect(normalizeNatTableRemoteRowCount(undefined)).toBeNull();
        expect(normalizeNatTableRemoteRowCount(10.5)).toBeNull();
        expect(normalizeNatTableRemoteRowCount(-1)).toBeNull();
        expect(normalizeNatTableRemoteRowCount(Number.POSITIVE_INFINITY)).toBeNull();
        expect(normalizeNatTableRemoteRowCount(Number.NaN)).toBeNull();
      });
    });

    describe('WHEN: the window offset is normalized against the remote extent', () => {
      it('THEN: it clamps the loaded window into the extent and zeroes unusable values', () => {
        expect(normalizeNatTableRowWindowOffset(500, 1000, 100)).toBe(500);
        expect(normalizeNatTableRowWindowOffset(950, 1000, 100)).toBe(900);
        expect(normalizeNatTableRowWindowOffset(5, null, 100)).toBe(0);
        expect(normalizeNatTableRowWindowOffset(-5, 1000, 100)).toBe(0);
        expect(normalizeNatTableRowWindowOffset(10.5, 1000, 100)).toBe(0);
        expect(normalizeNatTableRowWindowOffset(50, 40, 100)).toBe(0);
      });
    });

    describe('WHEN: the diagnostics inspect a valid remote configuration', () => {
      it('THEN: it reports no issues', () => {
        expect(describeNatTableRemoteWindowingIssues(remoteDiagnosticsContext)).toStrictEqual([]);
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: undefined })).toStrictEqual([]);
      });
    });

    describe('WHEN: the diagnostics inspect unusable input values', () => {
      it('THEN: it names each invalid input and the value received', () => {
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: 10.5 })).toStrictEqual([
          'remoteRowCount must be a non-negative integer; got 10.5, ignoring it.'
        ]);
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: -1 })[0]).toContain(
          'remoteRowCount must be a non-negative integer'
        );
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: Number.NaN })[0]).toContain(
          'got NaN'
        );
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, rowWindowOffset: -2 })).toStrictEqual([
          'rowWindowOffset must be a non-negative integer; got -2, using 0.'
        ]);
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, rowWindowOffset: 0.5 })[0]).toContain(
          'rowWindowOffset must be a non-negative integer'
        );
      });
    });

    describe('WHEN: the diagnostics inspect a window that does not fit the extent', () => {
      it('THEN: it reports the undersized extent or the overflowing offset, never both', () => {
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: 40 })).toStrictEqual([
          'remoteRowCount (40) is smaller than the 100 loaded rows; using the loaded row count.'
        ]);
        expect(describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, rowWindowOffset: 950 })).toStrictEqual([
          'rowWindowOffset (950) plus the 100 loaded rows exceeds remoteRowCount (1000); clamping the window.'
        ]);
      });
    });

    describe('WHEN: the diagnostics inspect client-side row-model transformations', () => {
      it('THEN: it requires the manual mode for each active transformation', () => {
        const issues = describeNatTableRemoteWindowingIssues({
          ...remoteDiagnosticsContext,
          hasClientSorting: true,
          hasClientFiltering: true,
          hasClientPagination: true,
          hasSubHeaders: true
        });

        expect(issues).toStrictEqual([
          'remoteRowCount requires manualSorting: client-side sorting would sort the loaded window, not the dataset.',
          'remoteRowCount requires manualFiltering: client-side filtering would filter the loaded window, not the dataset.',
          'remoteRowCount requires manualPagination: client-side pagination would paginate the loaded window, not the dataset.',
          'sub-header rows are not supported with remoteRowCount; they are disabled while it is set.'
        ]);
      });
    });

    describe('WHEN: the diagnostics inspect an extent beyond the browser layout ceiling', () => {
      it('THEN: it names the effective maximum row count at the configured row height', () => {
        const issues = describeNatTableRemoteWindowingIssues({
          ...remoteDiagnosticsContext,
          remoteRowCount: 2_000_000,
          rowHeight: 44
        });
        const effectiveMaxRows = Math.floor(NAT_TABLE_MAX_SCROLL_EXTENT_PX / 44);

        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('88000000px');
        expect(issues[0]).toContain(`${NAT_TABLE_MAX_SCROLL_EXTENT_PX}px`);
        expect(issues[0]).toContain(`at or below ${effectiveMaxRows}`);
        // The largest extent that fits stays silent.
        expect(
          describeNatTableRemoteWindowingIssues({ ...remoteDiagnosticsContext, remoteRowCount: effectiveMaxRows, rowHeight: 44 })
        ).toStrictEqual([]);
      });
    });
  });
});
