import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { createDropEvent, getHeaderColumnIds, mockClientRect, queryRequired } from '../test-helpers/table-dom.helper';
import { TableHost, createTableHostFixture, getInternalStore, getInternalTable } from '../test-helpers/table-hosts.helper';
import type { RecreateHostOptions } from '../test-helpers/table-hosts.helper';

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

  const recreateHost = async (options: RecreateHostOptions = {}): Promise<void> => {
    fixture.destroy();
    ({ fixture, host } = await createTableHostFixture(options));
  };

  describe('GIVEN: a table whose columns can be reordered by drag and drop', () => {
    describe('WHEN: a controlled columnOrder is patched', () => {
      it('THEN: it keeps controlled columnOrder external while still emitting the requested next state', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({
          state: {
            columnOrder: ['throughput', 'name', 'region', 'status']
          }
        });
        fixture.detectChanges();

        // then:
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'region', 'status']);

        // when:
        getInternalStore(fixture).updateState({
          columnOrder: ['name', 'region', 'status', 'throughput']
        });
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'region', 'status']);
        expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'region', 'status', 'throughput']);
      });
    });

    describe('WHEN: a hidden column is reordered and shown again', () => {
      it('THEN: it keeps hidden columns in their stored order when they are shown again', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const table = getInternalTable(fixture);

        // when:
        getInternalStore(fixture).updateState({
          columnVisibility: {
            status: false
          }
        });
        fixture.detectChanges();

        const updatedLeafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!updatedLeafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        table.onHeaderDrop(createDropEvent('throughput', 2, 1), updatedLeafHeaderGroup);
        fixture.detectChanges();

        // when:
        getInternalStore(fixture).updateState({
          columnVisibility: {
            status: true
          }
        });
        fixture.detectChanges();

        expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'throughput', 'status', 'region']);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'status', 'region']);
      });
    });

    describe('WHEN: pinned columns are reordered within their zones', () => {
      it('THEN: it reorders pinned left and right columns within their own zones', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({
          enableReordering: true,
          initialState: {
            ...host.initialState,
            columnPinning: {
              left: ['name', 'region'],
              right: ['status', 'throughput']
            }
          }
        });
        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        table.onHeaderDrop(createDropEvent('name', 0, 1), leafHeaderGroup);
        fixture.detectChanges();
        table.onHeaderDrop(createDropEvent('status', 2, 3), leafHeaderGroup);
        fixture.detectChanges();

        expect(host.stateEvents.at(-1)?.columnPinning).toStrictEqual({
          left: ['region', 'name'],
          right: ['throughput', 'status']
        });
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'name', 'throughput', 'status']);
      });
    });

    describe('WHEN: a cross-zone drop is attempted', () => {
      it('THEN: it ignores attempted cross-zone drops', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({
          enableReordering: true,
          initialState: {
            ...host.initialState,
            columnPinning: {
              left: ['name'],
              right: []
            }
          }
        });
        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        host.stateEvents.length = 0;

        table.onHeaderDrop(createDropEvent('region', 1, 0), leafHeaderGroup);
        fixture.detectChanges();

        expect(host.stateEvents).toHaveLength(0);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
      });
    });
  });

  describe('GIVEN: a table whose column reordering is disabled', () => {
    describe('WHEN: drag/drop and keyboard reordering are attempted', () => {
      it('THEN: it ignores both paths without consuming keyboard shortcuts', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost();
        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        host.stateEvents.length = 0;

        table.onHeaderDrop(createDropEvent('region', 1, 2), leafHeaderGroup);
        fixture.detectChanges();

        const reorderEvent = new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });

        regionHeader.focus();
        regionHeader.dispatchEvent(reorderEvent);
        fixture.detectChanges();

        expect(reorderEvent.defaultPrevented).toBe(false);
        expect(host.stateEvents).toStrictEqual([]);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
      });
    });
  });

  describe('GIVEN: a table whose columns can be reordered from the keyboard', () => {
    describe('WHEN: Ctrl+Shift+Arrow is pressed on a header', () => {
      it('THEN: it reorders columns with Ctrl+Shift+Arrow from the keyboard and announces the move', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

        regionHeader.focus();
        regionHeader.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
            cancelable: true
          })
        );
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(liveRegion.textContent.trim()).toBe('Moved Region column to position 2 of 3 in the unpinned region.');
      });
    });

    describe('WHEN: Command+Shift+Arrow is pressed on a header on macOS', () => {
      it('THEN: it reorders columns with Command+Shift+Arrow from the keyboard', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const originalPlatform = navigator.platform;
        const originalUserAgent = navigator.userAgent;

        Object.defineProperty(navigator, 'platform', {
          value: 'MacIntel',
          writable: true,
          configurable: true
        });
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          writable: true,
          configurable: true
        });

        try {
          await recreateHost({ enableReordering: true });
          fixture.detectChanges();

          const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

          regionHeader.focus();
          regionHeader.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              metaKey: true,
              shiftKey: true,
              bubbles: true,
              cancelable: true
            })
          );
          fixture.detectChanges();
          await fixture.whenStable();
          fixture.detectChanges();

          expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        } finally {
          Object.defineProperty(navigator, 'platform', {
            value: originalPlatform,
            configurable: true
          });
          Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
          });
        }
      });
    });

    describe('WHEN: a header is keyboard-moved right past the viewport edge', () => {
      it('THEN: it scrolls the reordered header into view when keyboard moving right past the viewport edge', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const tableRegion = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, '[data-testid="nat-table-header-region"]');

        mockClientRect(tableRegion, { left: 0, right: 300, width: 300, height: 200 });
        mockClientRect(regionHeader, { left: 280, right: 420, width: 140, height: 40 });

        tableRegion.scrollLeft = 10;
        regionHeader.focus();
        regionHeader.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
            cancelable: true
          })
        );
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(tableRegion.scrollLeft).toBe(130);
      });
    });

    describe('WHEN: a reorder shortcut uses an unsupported modifier combination', () => {
      it('THEN: it does not reorder columns unless a single primary modifier and Shift are used', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');
        const expectedColumnIds = ['name', 'region', 'status', 'throughput'];

        const blockedEvents: readonly KeyboardEventInit[] = [
          { key: 'ArrowLeft', shiftKey: true },
          { key: 'ArrowLeft', ctrlKey: true },
          { key: 'ArrowLeft', metaKey: true },
          { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, altKey: true },
          { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, metaKey: true },
          { key: 'ArrowLeft', metaKey: true, shiftKey: true, altKey: true }
        ];

        for (const eventInit of blockedEvents) {
          statusHeader.focus();
          statusHeader.dispatchEvent(
            new KeyboardEvent('keydown', {
              ...eventInit,
              bubbles: true,
              cancelable: true
            })
          );
          fixture.detectChanges();

          expect(getHeaderColumnIds(fixture)).toStrictEqual(expectedColumnIds);
        }
      });
    });

    describe('WHEN: a reorder shortcut is pressed at a region edge', () => {
      it('THEN: it consumes keyboard reorder shortcuts at region edges without moving focus', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
        const edgeEvent = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });

        host.stateEvents.length = 0;
        regionHeader.focus();
        regionHeader.dispatchEvent(edgeEvent);
        fixture.detectChanges();

        expect(edgeEvent.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(regionHeader);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
        expect(host.stateEvents).toStrictEqual([]);
      });
    });
  });
});
