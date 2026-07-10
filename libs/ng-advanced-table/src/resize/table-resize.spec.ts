/* eslint-disable max-lines -- cohesive integration spec */
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import type { NatTableUserState } from '../common/table-state.type';
import { NatTable } from '../table/table';
import { columns, resizableColumns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { getHeaderColumnIds, query, queryAll, queryRequired, requireAt } from '../test-helpers/table-dom.helper';
import {
  TableHost,
  TestTableSurface,
  createTableHostFixture,
  getInternalStore,
  getInternalTable
} from '../test-helpers/table-hosts.helper';
import type { NatTableInternals, RecreateHostOptions } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture, host } = await createTableHostFixture());
  });

  // These specs exercise a resize-enabled surface, so the gate defaults on; a
  // test opts back out by passing enableColumnResizing: false explicitly.
  const recreateHost = async (options: RecreateHostOptions = {}): Promise<void> => {
    fixture.destroy();
    ({ fixture, host } = await createTableHostFixture({ enableColumnResizing: true, ...options }));
  };

  describe('GIVEN: a table with resizable columns', () => {
    describe('WHEN: the table renders resize handles', () => {
      it('THEN: it renders resize handles on every column when the surface enables resizing', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        // Columns that leave `enableResizing` unset fall back to the surface enabler, so
        // with the surface off none are resizable and no handles render.
        await recreateHost({ enableColumnResizing: false, columns });
        fixture.detectChanges();

        // then:
        expect(query(fixture, '.column-resize-handle')).toBeNull();

        // when:
        // With the surface resize gate on, those same fallback columns become resizable.
        await recreateHost({ columns });
        fixture.detectChanges();

        // then:
        expect(queryAll(fixture, '.column-resize-handle')).toHaveLength(4);
      });
    });

    describe('WHEN: an opted-out column receives Alt+Arrow keyboard resize', () => {
      it('THEN: it renders handles on every column except opt-outs and blocks their keyboard resize', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // Resizing is per column: one column opts out with enableResizing: false while the
        // rest stay resizable by default. Not all-or-nothing.
        const mixedColumns: ColumnDef<Row, unknown>[] = columns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, enableResizing: false } : column
        );

        // when:
        await recreateHost({ columns: mixedColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(query(fixture, 'thead th[data-column-id="name"] .column-resize-handle')).not.toBeNull();
        expect(query(fixture, 'thead th[data-column-id="region"] .column-resize-handle')).toBeNull();
        expect(queryAll(fixture, '.column-resize-handle')).toHaveLength(3);

        // The opted-out column ignores Alt+Arrow keyboard resize.
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const sizingEventsBefore = host.columnSizingEvents.length;

        // when:
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents).toHaveLength(sizingEventsBefore);
      });
    });

    describe('WHEN: a resizable column is resized from the keyboard', () => {
      it('THEN: it resizes a column from the keyboard, updates width, and emits columnSizingChange', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // when:
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

        const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

        // then:
        // The resize must drive BOTH body and header widths, or the column never visibly resizes.
        expect(regionCell.style.width).toBe('148px');
        expect(regionHeader.style.width).toBe('148px');

        const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

        // then:
        expect(liveRegion.textContent.trim()).toBe('Region column width 148 pixels.');
      });
    });

    describe('WHEN: Alt+ArrowLeft is pressed on a header in LTR', () => {
      it('THEN: it shrinks on first ArrowLeft in LTR without an opposite-direction jump', async () => {
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        regionHeader.focus();

        // LTR: the resize edge is on the right, so Alt+ArrowLeft must shrink (region 140 → 132),
        // never grow. Guards the first-keystroke direction reversal.
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 132 });
      });
    });

    describe('WHEN: keyboard resize keys are pressed on a header in RTL', () => {
      it('THEN: it inverts keyboard resize arrows in RTL and clamps to the min bound', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns, direction: 'rtl' });
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // when:
        regionHeader.focus();

        // then:
        // RTL: the resize edge is on the left, so Alt+ArrowLeft grows (region 140 → 148).
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

        // then:
        // Home jumps to the column's minSize (100).
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 100 });

        // Already at min: ArrowRight (shrink in RTL) clamps to 100 and emits nothing new.
        const eventsAtMin = host.columnSizingEvents.length;

        // then:
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents).toHaveLength(eventsAtMin);
      });
    });

    describe('WHEN: the focused header column is resized with Alt+Arrow', () => {
      it('THEN: it resizes the focused header column with Alt+Arrow without focusing the handle', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // when:
        regionHeader.focus();
        // Alt+ArrowRight grows the column one step (140 → 148).
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

        // when:
        // Alt+ArrowLeft shrinks it back (148 → 140).
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 140 });
      });
    });

    describe('WHEN: Alt+Shift+Arrow is pressed on the focused header', () => {
      it('THEN: it does not resize or reorder the focused header on Alt+Shift+Arrow', async () => {
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const sizingEventsBefore = host.columnSizingEvents.length;
        const orderBefore = getHeaderColumnIds(fixture);

        regionHeader.focus();
        regionHeader.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            altKey: true,
            shiftKey: true,
            bubbles: true
          })
        );
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // Resize needs Alt without Shift; reorder uses Control/Command+Shift. Alt+Shift+Arrow
        // matches neither, so column order and widths are both left untouched.
        expect(getHeaderColumnIds(fixture)).toStrictEqual(orderBefore);
        expect(host.columnSizingEvents).toHaveLength(sizingEventsBefore);
      });
    });

    describe('WHEN: a pointer resize starts on an unsized column', () => {
      it('THEN: it seeds an unsized column from its measured width before the first controlled pointer resize', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // An unsized column resolves to TanStack's 150px default for column.getSize(), which
        // getResizeHandler() captures synchronously as the drag start size. Under a controlled
        // columnSizing binding the seed cannot round-trip before that capture, so the transient
        // overlay must expose the measured width or the drag would start from the 150px default.
        const unsizedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, size: undefined } : column
        );

        // when:
        await recreateHost({
          state: { columnSizing: {} },
          columns: unsizedColumns
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const internal = getInternalTable(fixture);

        // when:
        // jsdom has no layout, so inject a measured width distinct from the 150px default.
        getInternalStore(fixture).measuredHeaderWidths.set({ region: 222 });

        const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

        // when:
        regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        const start = internal.table.getState().columnSizingInfo.columnSizingStart.find(([id]) => id === 'region');

        // then:
        // Captured start size must be the seeded 222px, not the stale 150px default.
        expect(start?.[1]).toBe(222);

        // when:
        // End the drag so the document-level pointer listeners detach.
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
    });

    describe('WHEN: a controlled width is set out of range', () => {
      it('THEN: it clamps an out-of-range controlled width so rendered width stays within bounds', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // A controlled binding can push columnSizing past the column's bounds (TanStack
        // only clamps in getSize(), not in stored state). Rendered widths must stay within
        // [minSize, maxSize], never the raw controlled value.
        const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
        );
        const regionCell = (): HTMLElement => queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

        // when:
        await recreateHost({
          columns: boundedColumns,
          state: { columnSizing: { region: 9999 } }
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        // Above maxSize: clamped to the 200 bound, never the raw 9999.
        expect(regionCell().style.width).toBe('200px');

        // when:
        // Below minSize: clamped up to the 100 bound.
        host.state.set({ columnSizing: { region: 1 } });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(regionCell().style.width).toBe('100px');
      });
    });

    describe('WHEN: a column is grown to the viewport edge in fill mode', () => {
      it('THEN: it fits resize to the viewport so the table never grows past the visible region', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // Fill flex caps a resize to "fit": a column can only grow into the space the
        // other columns can yield (down to their mins), so the table never exceeds the
        // visible region. A generous maxSize makes the fit budget the binding limit.
        const wideColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 1000 } : column
        );
        const regionHeader = (): HTMLTableCellElement =>
          queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const regionCell = (): HTMLElement => queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

        // when:
        await recreateHost({
          columns: wideColumns
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // jsdom has no layout, so set the region width directly. In fill flex the fit
        // budget is the region minus the OTHER columns' minimums (the space they can
        // yield); column widths come from intrinsic size, so measured headers are unused.
        const store = getInternalStore(fixture);

        // when:
        store.regionViewportWidth.set(390);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // when:
        // End grows region toward maxSize (1000), but fit caps it at the region minus the
        // other columns' mins. status and throughput declare no minSize, so they fall back
        // to the 48px default floor (name 120 + status 48 + throughput 48 = 216): 390 - 216 = 174.
        // The others collapse to their mins so the table fills the region exactly.
        regionHeader().focus();
        regionHeader().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(regionCell().style.width).toBe('174px');
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 174 });

        // The widths still sum to the region: the table fills it exactly, never overflows.
        const widths = store.resolvedColumnWidths();
        const total = Object.values(widths).reduce((sum, width) => sum + width, 0);

        // then:
        expect(total).toBe(390);

        // then:
        // Symptom guard: neighbours without an explicit minSize collapse only to the 48px
        // default floor, never TanStack's 20px — so their resize handles stay grabbable.
        expect(widths['status']).toBe(48);
        expect(widths['throughput']).toBe(48);
      });
    });

    describe('WHEN: a column without minSize is shrunk from the keyboard', () => {
      it('THEN: it floors a keyboard shrink at the default minimum for a column without minSize', async () => {
        // status declares no minSize. Alt+Home jumps to the min bound, which must be the
        // 48px default floor (>= the 24px resize handle), not TanStack's 20px default that
        // would leave the handle wider than the column and effectively ungrabbable.
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');

        statusHeader.focus();
        statusHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ status: 48 });

        const statusCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="status"]');

        expect(statusCell.style.width).toBe('48px');
        expect(statusHeader.style.width).toBe('48px');
      });
    });

    describe('WHEN: a keyboard resize starts on a column stretched past its maxSize', () => {
      it('THEN: it clamps the keyboard resize base when fill layout stretches a column past its maxSize', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // Cross-column keyboard jump repro: resizing one column in fill layout redistributes
        // slack so a neighbour's measured width stretches past its own maxSize. The resize
        // base must clamp to that bound — otherwise the first keystroke on the neighbour
        // reads the over-max width and "grows" by clamping straight back down to the bound
        // (a backwards jump) while announcing the wrong width.
        const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
        );

        // when:
        await recreateHost({ columns: boundedColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // Simulate fill-layout redistribution stretching region's measured width past maxSize.
        const store = getInternalStore(fixture);

        // when:
        store.measuredHeaderWidths.set({ region: 272 });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // Grow on a column already at its max is a no-op, not a down-clamp that jumps backwards.
        const eventsBefore = host.columnSizingEvents.length;

        // then:
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents).toHaveLength(eventsBefore);

        // then:
        // ArrowLeft steps down by exactly one keyboard step from the clamped base (200 → 192).
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 192 });
      });
    });

    describe('WHEN: a pointer resize drag exceeds the fit budget', () => {
      it('THEN: it clamps the resize guide to the fit budget, not just the column maxSize', async () => {
        // The drag guide must stop where the column would fill the region (region minus
        // the other columns' minimums), even when the column's own maxSize is much larger.
        // Every column is sized 100 with min 50 so the fit budget is deterministic.
        const sizedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column
            ? { ...column, size: 100, minSize: 50, maxSize: column.accessorKey === 'region' ? 1000 : 100 }
            : column
        );

        await recreateHost({ columns: sizedColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);
        const internal = getInternalTable(fixture) as unknown as {
          readonly table: { getState(): { readonly columnSizingInfo: { readonly isResizingColumn: string | false } } };
          columnResizeGuide(): { readonly left: number; readonly offset: number } | null;
        };
        const otherColumnsWidth = (store.visibleColumns().length - 1) * 100;

        store.regionViewportWidth.set(otherColumnsWidth + 250); // region fit budget = 250
        fixture.detectChanges();

        const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

        regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
        expect(internal.table.getState().columnSizingInfo.isResizingColumn).toBe('region');
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 1000 }));

        // Offset clamps to the fit budget: region's max (region 550 - other mins 150 = 400)
        // minus the seeded start width (137) = 263 — not the column's own maxSize (1000).
        // The flex surplus floors per-share (350/4 = 87 each, last absorbs the remainder),
        // so region starts at min 50 + 87 = 137.
        expect(internal.columnResizeGuide()?.offset).toBe(263);

        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 1000 }));
      });
    });

    describe('WHEN: a fill-flex column is resized from the keyboard', () => {
      it('THEN: it keeps the table filled in fill flex by reflowing the other columns on resize', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        // when:
        store.regionViewportWidth.set(600);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const widthsBefore = store.resolvedColumnWidths();
        const total = (widths: Record<string, number>): number => Object.values(widths).reduce((sum, width) => sum + width, 0);

        // then:
        // Flex distribution fills the region exactly before any resize.
        expect(total(widthsBefore)).toBe(600);

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // when:
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // The resized column grows by exactly one step while the others absorb the delta,
        // so the table still fills the region — no jump, no overflow.
        const widthsAfter = store.resolvedColumnWidths();

        // then:
        expect(widthsAfter['region']).toBe(widthsBefore['region'] + 8);
        expect(total(widthsAfter)).toBe(600);
      });
    });

    describe('WHEN: a pointer resize drag ends', () => {
      it('THEN: it announces the final width once an actual pointer resize drag ends', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');
        const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');
        const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

        // when:
        regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        // Pointer-down alone must not announce — no per-frame chatter while dragging.
        expect(liveRegion.textContent.trim()).toBe('');

        // when:
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 132 }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 132 }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // The announced width must match the committed and rendered width (not a stale
        // pre-drag width), even though the showcase binds columnSizing controlled.
        const announcedWidth = host.columnSizingEvents.at(-1)?.['region'];

        // then:
        expect(announcedWidth).toBeDefined();
        expect(regionCell.style.width).toBe(`${announcedWidth}px`);
        expect(liveRegion.textContent.trim()).toBe(`Region column width ${announcedWidth} pixels.`);
      });
    });

    describe('WHEN: the resolved text direction changes', () => {
      it('THEN: it forwards the resolved text direction to TanStack column resizing', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        // TanStack mirrors the pointer-drag delta only when columnResizeDirection is 'rtl';
        // leaving it unset inverts resize in RTL (the width grows when it should shrink).
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();

        // then:
        expect(getInternalTable(fixture).table.options.columnResizeDirection).toBe('ltr');

        // when:
        await recreateHost({ columns: resizableColumns, direction: 'rtl' });
        fixture.detectChanges();
        await fixture.whenStable();

        // then:
        expect(getInternalTable(fixture).table.options.columnResizeDirection).toBe('rtl');
      });
    });

    describe('WHEN: columnSizingMode is "fixed"', () => {
      it('THEN: it uses an authoritative fixed table layout when columnSizingMode is "fixed"', async () => {
        await recreateHost({ columns: resizableColumns, columnSizingMode: 'fixed' });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const table = queryRequired<HTMLElement>(fixture, 'table.data-table');

        expect(table.classList.contains('is-fixed-layout')).toBe(true);

        // A <colgroup> drives column widths so the layout is exact, not stretched.
        const cols = Array.from(table.querySelectorAll('colgroup col')) as HTMLElement[];
        const headers = queryAll(fixture, 'thead th[data-column-id]');

        expect(cols).toHaveLength(headers.length);

        const colWidths = cols.map((col) => Number.parseInt(col.style.width, 10));

        expect(colWidths.every((width) => width > 0)).toBe(true);

        // The table is exactly as wide as the sum of its columns (so the region scrolls).
        const total = colWidths.reduce((sum, width) => sum + width, 0);

        expect(Number.parseInt(table.style.width, 10)).toBe(total);
      });
    });

    describe('WHEN: a fixed-mode column is grown past the viewport', () => {
      it('THEN: it lets a fixed-mode resize grow past the viewport instead of capping at the fit budget', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // Fixed (authoritative) layout is designed to grow and scroll: the viewport "fit"
        // cap that fill mode applies must NOT bind here. A generous maxSize on region makes
        // Alt+End reach the column's own max, well past the fill-mode fit budget (174).
        const wideColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 1000 } : column
        );

        // when:
        await recreateHost({ columns: wideColumns, columnSizingMode: 'fixed' });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        store.regionViewportWidth.set(390);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        // when:
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // Fixed mode ignores the fit cap, so region reaches its own maxSize (1000), far past
        // the 174 the fill-mode cap would have allowed — the table grows and scrolls.
        const emittedWidth = host.columnSizingEvents.at(-1)?.['region'];

        // then:
        expect(emittedWidth).toBe(1000);

        if (emittedWidth === undefined) {
          throw new Error('Expected an emitted width.');
        }

        // then:
        expect(emittedWidth).toBeGreaterThan(174);
      });
    });

    describe('WHEN: a column width is reset in fixed mode after a stale measured width', () => {
      it('THEN: it resets a column width in fixed mode even after a stale measured width was recorded', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        // Regression: "Reset Widths" clears columnSizing to {} but does nothing in fixed mode.
        // Root cause: resolvedColumnWidths fell back to measuredHeaderWidths, which the
        // ResizeObserver re-confirms each frame from the colgroup — so the column was pinned
        // to its pre-reset colgroup width. The fix gates the measured fallback on
        // !usesAuthoritativeLayout(), falling through to the def size instead.
        await recreateHost({ columns: resizableColumns, columnSizingMode: 'fixed' });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        // when:
        // Inject a stale measured width (300px) that differs from the region column's def size (140).
        // This simulates the state after a resize: the ResizeObserver captured the colgroup-forced
        // width. With the bug the reset below would leave region at 300; with the fix it returns
        // to the def size because the measured fallback is skipped in authoritative layout.
        store.measuredHeaderWidths.set({ region: 300 });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // columnSizing is empty — region was never resized, so no entry exists.
        // resolvedColumnWidths must resolve to the column's def size (140), not the stale 300.
        // resizableColumns['region'] has size: 140 (confirmed from the fixture column defs above).
        const widths = store.resolvedColumnWidths();

        // then:
        expect(widths['region']).toBe(140);
        expect(widths['region']).not.toBe(300);
      });
    });

    describe('WHEN: a keyboard shrink reaches the minimum bound', () => {
      it('THEN: it announces the minimum bound on a keyboard shrink at the min without emitting a sizing change', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

        // then:
        // Alt+Home jumps region to its minSize (100).
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 100 });

        // At the min, Alt+ArrowLeft (shrink in LTR) keeps the width and emits nothing new,
        // but the live region still announces the bound so a SR user learns the range.
        const eventsAtMin = host.columnSizingEvents.length;

        // when:
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents).toHaveLength(eventsAtMin);
        expect(liveRegion.textContent.trim()).toBe('Region column width 100 pixels (minimum).');
      });
    });

    describe('WHEN: a keyboard grow reaches the maximum bound', () => {
      it('THEN: it announces the maximum bound on a keyboard grow at the max without emitting a sizing change', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        // region declares no maxSize, so the fill-mode fit budget is the binding max.
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        // when:
        store.regionViewportWidth.set(390);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

        // then:
        // Alt+End jumps region to the fit-budget max (390 - other mins 216 = 174).
        regionHeader.focus();
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 174 });

        // At the max, Alt+ArrowRight (grow in LTR) keeps the width and emits nothing new,
        // but the live region announces the maximum so a SR user learns the range.
        const eventsAtMax = host.columnSizingEvents.length;

        // when:
        regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.columnSizingEvents).toHaveLength(eventsAtMax);
        expect(liveRegion.textContent.trim()).toBe('Region column width 174 pixels (maximum).');
      });
    });

    describe('WHEN: a fill-flex column with a small maxSize is distributed surplus width', () => {
      it('THEN: it caps a fill-flex column at its maxSize and never renders it wider', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // A small maxSize on a non-resized flex column must clamp its distributed share:
        // even when its intrinsic-weight share is larger, it never renders past the cap.
        const cappedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'status' ? { ...column, maxSize: 90 } : column
        );

        // when:
        await recreateHost({ columns: cappedColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        // when:
        // A wide region hands every flex column a generous surplus share, but the
        // status would stretch well past 90.
        store.regionViewportWidth.set(900);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(store.resolvedColumnWidths()['status']).toBe(90);
      });
    });

    describe('WHEN: fill-flex surplus is distributed across columns', () => {
      it('THEN: it distributes the fill-flex surplus so the widths sum to the region exactly', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        // With four flex columns the per-share rounding can drift; the surplus must split so
        // the resolved widths sum to the region precisely — no 1–2px overflow.
        await recreateHost({ columns: resizableColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const store = getInternalStore(fixture);

        // when:
        // An odd region width forces non-integer per-share splits, exercising the rounding.
        store.regionViewportWidth.set(917);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(store.visibleColumns()).toHaveLength(4);
        const widths = store.resolvedColumnWidths();
        const total = Object.values(widths).reduce((sum, width) => sum + width, 0);

        // then:
        expect(total).toBe(917);
      });
    });

    describe('WHEN: a pointer resize drag overshoots the column bounds', () => {
      it('THEN: it clamps the resize guide to the column bounds instead of overshooting the cursor', async () => {
        const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
          'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
        );

        await recreateHost({ columns: boundedColumns });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const internal = getInternalTable(fixture) as NatTableInternals & {
          columnResizeGuide(): { readonly left: number; readonly offset: number } | null;
        };
        const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

        // Begin the drag at region's start width (140), then drag far past maxSize (200).
        regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
        expect(internal.table.getState().columnSizingInfo.isResizingColumn).toBe('region');
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 1000 }));
        expect(internal.table.getState().columnSizingInfo.deltaOffset).toBe(1000);

        const guide = internal.columnResizeGuide();

        expect(guide).not.toBeNull();
        // Offset clamps to (maxSize 200 - startSize 140) = 60px, not the raw 1000px drag.
        expect(guide?.offset).toBe(60);

        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 1000 }));
      });
    });
  });

  describe('GIVEN: columns sized from definitions and metadata', () => {
    describe('WHEN: the table is rendered', () => {
      it('THEN: it renders TanStack size hints and uses them for initial pin offsets', () => {
        host.state.set({
          columnPinning: {
            left: ['name', 'region'],
            right: []
          }
        });
        fixture.detectChanges();

        const headers = queryAll<HTMLElement>(fixture, 'thead th');
        const bodyCells = queryAll<HTMLElement>(fixture, 'tbody tr:first-child th, tbody tr:first-child td');
        const firstHeader = requireAt(headers, 0);
        const secondHeader = requireAt(headers, 1);
        const firstBodyCell = requireAt(bodyCells, 0);
        const secondBodyCell = requireAt(bodyCells, 1);

        expect(query(fixture, 'colgroup')).toBeNull();
        expect(firstHeader.style.width).toBe('');
        expect(firstHeader.style.minWidth).toBe('');
        expect(firstHeader.style.maxWidth).toBe('');
        expect(secondHeader.style.width).toBe('');
        expect(secondHeader.style.minWidth).toBe('');
        expect(secondHeader.style.maxWidth).toBe('');
        expect(firstBodyCell.style.width).toBe('180px');
        expect(firstBodyCell.style.minWidth).toBe('120px');
        expect(firstHeader.style.left).toBe('0px');
        expect(secondHeader.style.left).toBe('180px');
        expect(secondBodyCell.style.left).toBe('180px');
        expect(firstHeader.dataset['columnId']).toBe('name');
      });
    });

    describe('WHEN: a column declares header sizing metadata', () => {
      it('THEN: it applies optional header sizing from column meta without affecting body cells', async () => {
        @Component({
          selector: 'test-header-sizing-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class HeaderSizingHost {
          protected readonly rows = signal<Row[]>([
            {
              id: 'svc-header',
              name: 'Service',
              region: 'eu-central-1',
              status: 'Healthy',
              throughput: 1000
            }
          ]);

          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: 'Service',
              size: 96,
              minSize: 80,
              meta: {
                label: 'Service',
                rowHeader: true,
                headerSize: 140,
                headerMinSize: 120
              },
              cell: (info) => info.getValue<string>()
            }
          ];
        }

        const headerFixture = TestBed.createComponent(HeaderSizingHost);

        await headerFixture.whenStable();
        headerFixture.detectChanges();

        const header = queryRequired<HTMLElement>(headerFixture, 'thead th[data-column-id="name"]');
        const bodyCell = queryRequired<HTMLElement>(headerFixture, 'tbody th[data-column-id="name"]');

        expect(header.style.width).toBe('140px');
        expect(header.style.minWidth).toBe('120px');
        expect(header.style.maxWidth).toBe('140px');
        expect(header.classList.contains('is-width-constrained')).toBe(true);
        expect(bodyCell.style.width).toBe('96px');
        expect(bodyCell.style.minWidth).toBe('80px');
        expect(bodyCell.style.maxWidth).toBe('96px');
      });
    });

    describe('WHEN: columns declare fixed, maximum, and intrinsic sizing', () => {
      it('THEN: it applies fixed, maximum, and intrinsic column sizing from TanStack column definitions', async () => {
        @Component({
          selector: 'test-column-width-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface [initialState]="initialState">
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class ColumnWidthHost {
          protected readonly rows = signal<Row[]>([
            {
              id: 'svc-width',
              name: 'Very long service name that should be truncated',
              region: 'eu-central-1 with extra routing detail',
              status: 'Healthy',
              throughput: 1000
            }
          ]);

          protected readonly initialState: Partial<NatTableUserState> = {
            columnPinning: {
              left: ['name', 'region', 'status'],
              right: []
            }
          };

          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: 'Service',
              size: 96,
              minSize: 80,
              enablePinning: true,
              meta: { label: 'Service', rowHeader: true },
              cell: (info) => info.getValue<string>()
            },
            {
              accessorKey: 'region',
              header: 'Region',
              maxSize: 192,
              enablePinning: true,
              meta: { label: 'Region' },
              cell: (info) => info.getValue<string>()
            },
            {
              accessorKey: 'status',
              header: 'Status',
              enablePinning: true,
              meta: { label: 'Status' },
              cell: (info) => info.getValue<string>()
            }
          ];
        }

        const widthFixture = TestBed.createComponent(ColumnWidthHost);

        await widthFixture.whenStable();
        widthFixture.detectChanges();

        const fixedHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="name"]');
        const cappedHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="region"]');
        const fixedCell = queryRequired<HTMLElement>(widthFixture, 'tbody th[data-column-id="name"]');
        const cappedCell = queryRequired<HTMLElement>(widthFixture, 'tbody td[data-column-id="region"]');
        const intrinsicHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="status"]');
        const intrinsicCell = queryRequired<HTMLElement>(widthFixture, 'tbody td[data-column-id="status"]');

        expect(fixedHeader.style.width).toBe('');
        expect(fixedHeader.style.minWidth).toBe('');
        expect(fixedHeader.style.maxWidth).toBe('');
        expect(fixedHeader.classList.contains('is-width-constrained')).toBe(false);
        expect(cappedHeader.style.left).toBe('96px');
        expect(fixedCell.style.width).toBe('96px');
        expect(fixedCell.style.minWidth).toBe('80px');
        expect(fixedCell.style.maxWidth).toBe('96px');
        expect(fixedCell.classList.contains('is-width-constrained')).toBe(true);
        expect(fixedCell.querySelector('.data-cell-content')).toBeTruthy();
        expect(cappedHeader.style.width).toBe('');
        expect(cappedHeader.style.minWidth).toBe('');
        expect(cappedHeader.style.maxWidth).toBe('');
        expect(cappedHeader.classList.contains('is-width-constrained')).toBe(false);
        expect(cappedCell.style.maxWidth).toBe('192px');
        expect(cappedCell.classList.contains('is-width-constrained')).toBe(true);
        expect(intrinsicHeader.style.width).toBe('');
        expect(intrinsicHeader.style.minWidth).toBe('');
        expect(intrinsicHeader.style.maxWidth).toBe('');
        expect(intrinsicCell.classList.contains('is-width-constrained')).toBe(false);
      });
    });

    describe('WHEN: columns declare cell height metadata', () => {
      it('THEN: it clamps body cell content to two lines by default and applies column cell height metadata', async () => {
        @Component({
          selector: 'test-cell-height-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class CellHeightHost {
          protected readonly rows = signal<Row[]>([
            {
              id: 'svc-cell-height',
              name: 'Very long service name that should wrap onto multiple visible lines',
              region: 'eu-central-1 with additional routing detail',
              status: 'Healthy',
              throughput: 1000
            }
          ]);

          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: 'Service',
              meta: {
                label: 'Service',
                rowHeader: true,
                cellHeight: 72,
                cellMaxLines: 3
              },
              cell: (info) => info.getValue<string>()
            },
            {
              accessorKey: 'region',
              header: 'Region',
              meta: {
                label: 'Region',
                cellMaxLines: Infinity
              },
              cell: (info) => info.getValue<string>()
            },
            {
              accessorKey: 'status',
              header: 'Status',
              meta: { label: 'Status' },
              cell: (info) => info.getValue<string>()
            },
            {
              accessorKey: 'throughput',
              header: 'Throughput',
              meta: {
                label: 'Throughput',
                cellMaxLines: 0
              },
              cell: (info) => `${info.getValue<number>()} req/s`
            }
          ];
        }

        const cellHeightFixture = TestBed.createComponent(CellHeightHost);

        await cellHeightFixture.whenStable();
        cellHeightFixture.detectChanges();

        const serviceCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody th[data-column-id="name"]');
        const regionCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="region"]');
        const statusCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="status"]');
        const throughputCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="throughput"]');

        expect(serviceCell.style.height).toBe('72px');
        expect(serviceCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('3');
        expect(serviceCell.classList.contains('is-cell-clamped')).toBe(true);
        expect(regionCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('');
        expect(regionCell.classList.contains('is-cell-clamped')).toBe(false);
        expect(statusCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
        expect(statusCell.classList.contains('is-cell-clamped')).toBe(true);
        expect(throughputCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
        expect(throughputCell.classList.contains('is-cell-clamped')).toBe(true);
      });
    });
  });
});
