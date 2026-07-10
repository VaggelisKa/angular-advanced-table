/* eslint-disable max-lines -- large integration spec */
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { ColumnDef } from '@tanstack/angular-table';

import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { NatTable } from './table';
import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction/cell-interaction.const';
import type { NatTableRowActivateEvent } from '../common/row.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, getRowIdValue } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import {
  createDropEvent,
  describedBySelectors,
  getGridHarness,
  getHeaderColumnIds,
  query,
  queryAll,
  queryRequired,
  requireLast
} from '../test-helpers/table-dom.helper';
import {
  AccessibleNameHost,
  CaptionHost,
  CaptionOnlyHost,
  DestroyableTableHost,
  ProviderAccessibilityHost,
  StateTemplatesHost,
  TableHost,
  TestTableSurface,
  createTableHostFixture,
  getInternalStore,
  getInternalTable
} from '../test-helpers/table-hosts.helper';
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

  describe('GIVEN: a rendered table with structure and accessibility metadata', () => {
    describe('WHEN: the table is rendered', () => {
      it('THEN: it renders a bare table surface with no built-in controls', () => {
        fixture.detectChanges();

        const rows = queryAll(fixture, 'tbody tr');
        const headers = queryAll<HTMLElement>(fixture, 'thead th');
        const headerLabels = headers.map((header) => header.textContent.replaceAll(/\s+/g, ' ').trim());

        expect(rows).toHaveLength(6);
        expect(headerLabels).toStrictEqual(['Service', 'Region', 'Status', 'Throughput']);
        expect(query(fixture, 'tbody tr')?.textContent).toContain('Zeta');
        expect(query(fixture, '#table-search')).toBeNull();
        expect(query(fixture, '.column-chip')).toBeNull();
        expect(query(fixture, '.pager')).toBeNull();
        expect(query(fixture, '.sort-button')).toBeNull();
        expect(query(fixture, '.pin-button')).toBeNull();
      });
    });

    describe('WHEN: a primitive header has a hidden header label', () => {
      it('THEN: it visually hides primitive header labels while keeping accessible text', async () => {
        @Component({
          selector: 'test-hidden-header-label-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class HiddenHeaderLabelHost {
          protected readonly rows = signal<Row[]>(buildRows(1));
          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: 'Menu',
              meta: {
                hiddenHeaderLabel: 'Row actions'
              },
              cell: (info) => info.getValue<string>()
            }
          ];
        }

        const hiddenHeaderFixture = TestBed.createComponent(HiddenHeaderLabelHost);

        await hiddenHeaderFixture.whenStable();
        hiddenHeaderFixture.detectChanges();

        const header = queryRequired<HTMLElement>(hiddenHeaderFixture, 'thead th[data-column-id="name"]');
        const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

        expect(hiddenLabel.textContent.trim()).toBe('Row actions');
        expect(header.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');
        expect(header.textContent).not.toContain('Menu');

        hiddenHeaderFixture.destroy();
      });
    });

    describe('WHEN: a non-primitive header has a hidden header label', () => {
      it('THEN: it renders hidden header labels for non-primitive headers', async () => {
        @Component({
          selector: 'test-non-primitive-hidden-header-label-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class NonPrimitiveHiddenHeaderLabelHost {
          protected readonly rows = signal<Row[]>(buildRows(1));
          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: () => '',
              meta: {
                hiddenHeaderLabel: 'Row actions'
              },
              cell: (info) => info.getValue<string>()
            }
          ];
        }

        const hiddenHeaderFixture = TestBed.createComponent(NonPrimitiveHiddenHeaderLabelHost);

        await hiddenHeaderFixture.whenStable();
        hiddenHeaderFixture.detectChanges();

        const header = queryRequired<HTMLElement>(hiddenHeaderFixture, 'thead th[data-column-id="name"]');
        const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

        expect(hiddenLabel.textContent.trim()).toBe('Row actions');
        expect(header.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');

        hiddenHeaderFixture.destroy();
      });
    });

    describe('WHEN: the rendered table exposes tone and structure metadata', () => {
      it('THEN: it applies semantic tone attributes from column metadata', () => {
        fixture.detectChanges();

        const throughputCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child td[data-column-id="throughput"]');

        expect(throughputCell.getAttribute('data-tone')).toBe('positive');
      });

      it('THEN: it describes the current view and exposes the row header column to assistive technology', () => {
        fixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const describedBy = table.getAttribute('aria-describedby');
        const summary = queryRequired<HTMLElement>(fixture, `#${describedBy?.split(' ').at(0) ?? ''}`);
        const rowHeaderCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child th[scope="row"]');

        expect(describedBy).toContain('nat-table-');
        expect(summary.textContent).toContain('Showing 6 rows across 4 visible columns.');
        expect(rowHeaderCell.getAttribute('role')).toBe('rowheader');
        expect(rowHeaderCell.getAttribute('data-column-id')).toBe('name');
      });

      it('THEN: it removes the final rendered data-row separator from body cells', () => {
        fixture.detectChanges();

        const tableStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const finalRowRule = tableStyles.find((rule) =>
          ['tbody', '.data-row', ':last-child', '.data-cell'].every((selectorPart) => rule.selectorText.includes(selectorPart))
        );

        expect(finalRowRule?.style.borderBottom).toBe('0px');
      });

      it('THEN: it keeps table boundary and divider widths configurable', () => {
        fixture.detectChanges();

        const tableStyles = Array.from(document.styleSheets).flatMap((styleSheet) =>
          Array.from(styleSheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        );
        const cssText = tableStyles.map((rule) => rule.cssText).join('\n');

        expect(cssText).toContain('--nat-table-region-border-width');
        expect(cssText).toContain('--nat-table-cell-border-width');
        expect(cssText).toContain('--nat-table-header-border-width');
      });
    });

    describe('WHEN: all hidden descriptions are suppressed', () => {
      it('THEN: it omits aria-describedby when all hidden descriptions are suppressed', async () => {
        await recreateHost({
          accessibilityText: {
            keyboardInstructions: '',
            reorderKeyboardInstructions: '',
            tableSummary: () => ''
          }
        });
        fixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');

        expect(table.getAttribute('aria-describedby')).toBeNull();
        expect(query(fixture, 'p[id$="-summary"]')).toBeNull();
        expect(query(fixture, 'p[id$="-instructions"]')).toBeNull();
      });
    });

    describe('WHEN: accessibleName is supplied', () => {
      it('THEN: it accepts accessibleName as the preferred grid name input', () => {
        const nameFixture = TestBed.createComponent(AccessibleNameHost);

        nameFixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(nameFixture, 'table');

        expect(table.getAttribute('aria-label')).toBe('Latency table');
        expect(table.getAttribute('aria-labelledby')).toBeNull();

        nameFixture.destroy();
      });
    });

    describe('WHEN: a caption is provided', () => {
      it('THEN: it renders caption as a semantic table label when provided', () => {
        const captionFixture = TestBed.createComponent(CaptionHost);

        captionFixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(captionFixture, 'table');
        const caption = queryRequired<HTMLTableCaptionElement>(captionFixture, 'caption');

        expect(caption.textContent.trim()).toBe('Visible operations');
        expect(table.getAttribute('aria-label')).toBeNull();
        expect(table.getAttribute('aria-labelledby')).toBe(caption.id);

        captionFixture.destroy();
      });

      it('THEN: it allows caption-only tables to compile and use the caption as the accessible name', () => {
        const captionFixture = TestBed.createComponent(CaptionOnlyHost);

        captionFixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(captionFixture, 'table');
        const caption = queryRequired<HTMLTableCaptionElement>(captionFixture, 'caption');

        expect(caption.textContent.trim()).toBe('Visible operations');
        expect(table.getAttribute('aria-label')).toBeNull();
        expect(table.getAttribute('aria-labelledby')).toBe(caption.id);

        captionFixture.destroy();
      });
    });

    describe('WHEN: the rendered table reflects the active sort', () => {
      it('THEN: it only applies aria-sort to the actively sorted header', () => {
        fixture.detectChanges();

        const sortedHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="throughput"]');
        const unsortedHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="name"]');

        expect(sortedHeader.getAttribute('aria-sort')).toBe('descending');
        expect(unsortedHeader.getAttribute('aria-sort')).toBeNull();
      });
    });

    describe('WHEN: enablePagination is true', () => {
      it('THEN: it only paginates when enablePagination is true', async () => {
        await recreateHost({ enablePagination: true });
        fixture.detectChanges();

        const rows = queryAll(fixture, 'tbody tr');

        expect(rows).toHaveLength(2);
        expect(query(fixture, 'tbody tr')?.textContent).toContain('Zeta');
      });
    });

    describe('WHEN: column reordering is disabled by default', () => {
      it('THEN: it removes drag/drop affordances and reorder instructions', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const dragDirectives = fixture.debugElement.queryAll(By.directive(CdkDrag));
        const dropLists = fixture.debugElement.queryAll(By.directive(CdkDropList));
        const screenReaderText = queryAll<HTMLParagraphElement>(fixture, 'p.sr-only')
          .map((element) => element.textContent.trim())
          .join(' ');

        expect(queryAll(fixture, '.header-cell.is-reorderable')).toHaveLength(0);
        expect(dragDirectives).toStrictEqual([]);
        expect(dropLists).toStrictEqual([]);
        expect(screenReaderText).not.toContain('reorder columns');
      });
    });

    describe('WHEN: column reordering is enabled', () => {
      it('THEN: it renders reorder handles on movable headers', async () => {
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        expect(queryAll(fixture, '.header-cell.is-reorderable')).toHaveLength(3);
        expect(fixture.debugElement.queryAll(By.directive(CdkDrag))).toHaveLength(4);
        expect(fixture.debugElement.queryAll(By.directive(CdkDropList))).toHaveLength(1);
      });
    });
  });

  describe('GIVEN: a table whose lifecycle is bound to the scoped table service', () => {
    describe('WHEN: the host removes the table from the view', () => {
      it('THEN: it clears the scoped table controller when the table is destroyed', async () => {
        const destroyFixture = TestBed.createComponent(DestroyableTableHost);

        await destroyFixture.whenStable();
        destroyFixture.detectChanges();

        const surface = destroyFixture.debugElement.query(By.directive(TestTableSurface));
        const service = surface.injector.get(NatTableService);

        // then:
        expect(service.controller()).not.toBeNull();

        // when:
        destroyFixture.componentInstance.showTable.set(false);
        destroyFixture.detectChanges();
        await destroyFixture.whenStable();

        // then:
        expect(service.controller()).toBeNull();

        destroyFixture.destroy();
      });
    });
  });

  describe('GIVEN: a table whose state can be patched or controlled', () => {
    describe('WHEN: a caller patches state', () => {
      it('THEN: it lets callers patch state and emit the next state', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        // when:
        getInternalStore(fixture).updateState({
          globalFilter: 'gamma',
          pagination: (currentPagination) => ({
            ...currentPagination,
            pageIndex: 0
          })
        });
        fixture.detectChanges();

        const lastState = requireLast(host.stateEvents);

        // then:
        expect(lastState.globalFilter).toBe('gamma');
        expect(lastState.pagination?.pageIndex).toBe(0);
        expect(host.globalFilterEvents.at(-1)).toBe('gamma');
        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(query(fixture, 'tbody tr')?.textContent).toContain('Gamma');
      });
    });

    describe('WHEN: state slices are patched', () => {
      it('THEN: it only emits granular slice outputs when the corresponding slice actually changed', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enablePagination: true });
        fixture.detectChanges();

        host.sortingEvents.length = 0;
        host.paginationEvents.length = 0;
        host.globalFilterEvents.length = 0;
        host.columnFiltersEvents.length = 0;
        host.columnVisibilityEvents.length = 0;
        host.columnOrderEvents.length = 0;
        host.columnPinningEvents.length = 0;

        // when:
        getInternalStore(fixture).updateState({ sorting: [{ id: 'name', desc: false }] });
        fixture.detectChanges();

        // then:
        expect(host.sortingEvents).toStrictEqual([[{ id: 'name', desc: false }]]);
        expect(host.globalFilterEvents).toStrictEqual([]);
        expect(host.paginationEvents).toStrictEqual([]);
        expect(host.columnFiltersEvents).toStrictEqual([]);
        expect(host.columnVisibilityEvents).toStrictEqual([]);
        expect(host.columnOrderEvents).toStrictEqual([]);
        expect(host.columnPinningEvents).toStrictEqual([]);

        // when:
        getInternalStore(fixture).updateState({ sorting: [{ id: 'name', desc: false }] });
        fixture.detectChanges();

        // then:
        expect(host.sortingEvents).toHaveLength(1);

        // when:
        getInternalStore(fixture).updateState({ globalFilter: 'gamma' });
        fixture.detectChanges();

        // then:
        expect(host.globalFilterEvents).toStrictEqual(['gamma']);
        expect(host.sortingEvents).toHaveLength(1);
        expect(host.columnVisibilityEvents).toStrictEqual([]);
      });
    });

    describe('WHEN: the underlying TanStack filter changes', () => {
      it('THEN: it resets the page index and emits both globalFilterChange and paginationChange when the underlying TanStack filter changes', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enablePagination: true });
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        // when:
        getInternalStore(fixture).updateState({
          pagination: (currentPagination) => ({ ...currentPagination, pageIndex: 1 })
        });
        fixture.detectChanges();

        host.paginationEvents.length = 0;
        host.globalFilterEvents.length = 0;

        // when:
        table.table.setGlobalFilter('gamma');
        fixture.detectChanges();

        // then:
        expect(host.globalFilterEvents).toStrictEqual(['gamma']);
        expect(host.paginationEvents.at(-1)?.pageIndex).toBe(0);
      });
    });

    describe('WHEN: visible center columns are reordered', () => {
      it('THEN: it reorders visible center columns and emits the next column order when uncontrolled', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableReordering: true });
        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        // when:
        table.onHeaderDrop(createDropEvent('region', 1, 2), leafHeaderGroup);
        fixture.detectChanges();

        // then:
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
      });
    });

    describe('WHEN: a global filter is applied without an id column', () => {
      it('THEN: it matches the stable row id during global filtering without requiring an id column', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        // when:
        getInternalStore(fixture).updateState({
          globalFilter: 'svc-00003',
          pagination: (currentPagination) => ({
            ...currentPagination,
            pageIndex: 0
          })
        });
        fixture.detectChanges();

        // then:
        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(query(fixture, 'tbody tr')?.textContent).toContain('Gamma');
      });
    });

    describe('WHEN: no custom row id resolver is supplied', () => {
      it('THEN: it uses the row id property for table row identity', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        // then:
        expect(table.table.getCoreRowModel().rows.map((row) => row.id)).toStrictEqual([
          'svc-00001',
          'svc-00002',
          'svc-00003',
          'svc-00004',
          'svc-00005',
          'svc-00006'
        ]);
      });
    });

    describe('WHEN: a custom row id resolver is supplied', () => {
      it('THEN: it overrides the row id property default', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({
          getRowId: (row) => `custom-${getRowIdValue(row)}`
        });
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        // then:
        expect(table.table.getCoreRowModel().rows.map((row) => row.id)).toStrictEqual([
          'custom-svc-00001',
          'custom-svc-00002',
          'custom-svc-00003',
          'custom-svc-00004',
          'custom-svc-00005',
          'custom-svc-00006'
        ]);
      });
    });

    describe('WHEN: a controlled state slice is set', () => {
      it('THEN: it respects controlled state slices without mutating the rendered table', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        host.state.set({
          columnVisibility: {
            region: false
          }
        });
        fixture.detectChanges();

        // then:
        expect(query(fixture, 'thead')?.textContent).not.toContain('Region');

        // when:
        getInternalStore(fixture).updateState({
          columnVisibility: (currentVisibility) => ({
            ...currentVisibility,
            region: true
          })
        });
        fixture.detectChanges();

        // then:
        expect(query(fixture, 'thead')?.textContent).not.toContain('Region');
        expect(host.stateEvents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GIVEN: a table resolving accessibility text and announcements', () => {
    describe('WHEN: accessibility summaries and live announcements are overridden', () => {
      it('THEN: it lets callers override accessibility summaries and live announcements', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const accessibilityText: NatTableAccessibilityText = {
          reorderKeyboardInstructions: 'Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.',
          tableSummary: ({ visibleRowsText, totalRowsText, visibleColumnsText, pageText, pageCountText }) =>
            `Oversigt ${visibleRowsText}/${totalRowsText}/${visibleColumnsText}/${pageText}/${pageCountText}`,
          filteringChange: ({ query: searchQuery, visibleRowsText }) => `Filter ${searchQuery}:${visibleRowsText}`,
          sortingChange: ({ columnLabel, sortState }) => `Sortering ${columnLabel}:${sortState}`,
          pageChange: ({ pageText, pageCountText, visibleRowsText }) => `Side ${pageText}/${pageCountText}:${visibleRowsText}`
        };

        // when:
        await recreateHost({
          enableReordering: true,
          enablePagination: true,
          accessibilityText
        });
        fixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const describedBy = describedBySelectors(table);
        const summary = queryRequired<HTMLElement>(fixture, describedBy.first);
        const instructions = queryRequired<HTMLElement>(fixture, describedBy.last);
        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');
        const tableComponent = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        // then:
        expect(summary.textContent.trim()).toBe('Oversigt 2/6/4/1/3');
        expect(instructions.textContent).toContain(
          'Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.'
        );

        // when:
        tableComponent.table.nextPage();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(liveRegion.textContent.trim()).toBe('Side 2/3:2');

        // when:
        getInternalStore(fixture).updateState({
          globalFilter: 'gamma',
          pagination: (currentPagination) => ({
            ...currentPagination,
            pageIndex: 0
          })
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(liveRegion.textContent.trim()).toBe('Filter gamma:1');

        // when:
        getInternalStore(fixture).updateState({
          sorting: [{ id: 'name', desc: false }]
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(liveRegion.textContent.trim()).toBe('Sortering Service:ascending');
      });
    });

    describe('WHEN: provider defaults and table inputs supply accessibility text', () => {
      it('THEN: it reacts to provider accessibility defaults without remounting and lets table inputs override them', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        const providerFixture = TestBed.createComponent(ProviderAccessibilityHost);
        const providerHost = providerFixture.componentInstance;

        // when:
        providerFixture.detectChanges();

        let summary = queryRequired<HTMLElement>(providerFixture, 'p[id$="-summary"]');
        let emptyState = queryRequired<HTMLElement>(providerFixture, '.empty-state');
        let instructions = queryRequired<HTMLElement>(providerFixture, 'p[id$="-instructions"]');
        const tableElement = queryRequired<HTMLTableElement>(providerFixture, 'table');
        const tableComponent = providerFixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;
        const tableController = tableComponent.table;
        const tableElementId = tableElement.id;
        const tableService = providerFixture.debugElement.query(By.directive(TestTableSurface)).injector.get(NatTableService);
        const surfaceController = tableService.controller();
        const statusHeader = queryRequired<HTMLTableCellElement>(providerFixture, 'thead th[data-column-id="status"]');
        const liveRegion = queryRequired<HTMLElement>(providerFixture, '[data-testid="nat-table-live-region"]');

        // then:
        expect(tableElementId).not.toBe('');
        expect(surfaceController).toBe(tableComponent);
        expect(summary.textContent.trim()).toBe('Provider summary n0/n0');
        expect(emptyState.textContent.trim()).toBe('Provider empty state');
        expect(instructions.textContent.trim()).toBe(
          'Provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
        );

        // when: existing controller state and a live-region message are established before the translation changes
        tableComponent.setColumnSort('name', 'asc');
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();
        statusHeader.focus();

        const liveMessageBeforeProviderUpdate = liveRegion.textContent.trim();

        // then:
        expect(liveMessageBeforeProviderUpdate).toBe('Sorted by Service ascending.');
        expect(document.activeElement).toBe(statusHeader);

        // when: the consumer publishes a new provider value through its signal
        providerHost.providerIntl.set({
          formatNumber: (value) => `r${value}`,
          accessibilityText: {
            emptyState: 'Reactive provider empty state',
            loadingState: 'Reactive provider loading state',
            errorState: 'Reactive provider error state',
            keyboardInstructions: 'Reactive provider keyboard instructions.',
            tableSummary: ({ visibleRowsText, totalRowsText }) => `Reactive provider summary ${visibleRowsText}/${totalRowsText}`,
            columnReorder: ({ label, positionText, totalText }) => `Reactive provider moved ${label} to ${positionText}/${totalText}`
          }
        });
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        // then: the existing table, controller state, DOM, and focus remain in place without a new announcement
        expect(providerFixture.debugElement.query(By.directive(NatTable)).componentInstance).toBe(tableComponent);
        expect(tableComponent.table).toBe(tableController);
        expect(tableService.controller()).toBe(surfaceController);
        expect(tableController.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(queryRequired<HTMLTableElement>(providerFixture, 'table')).toBe(tableElement);
        expect(tableElement.id).toBe(tableElementId);
        expect(queryRequired<HTMLElement>(providerFixture, '.empty-state')).toBe(emptyState);
        expect(document.activeElement).toBe(statusHeader);
        expect(liveRegion.textContent.trim()).toBe(liveMessageBeforeProviderUpdate);
        expect(summary.textContent.trim()).toBe('Reactive provider summary r0/r0');
        expect(emptyState.textContent.trim()).toBe('Reactive provider empty state');
        expect(instructions.textContent.trim()).toBe(
          'Reactive provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
        );

        // when: the next user interaction requests a column move
        statusHeader.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
            cancelable: true
          })
        );
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        // then: its announcement uses the latest formatter and number formatting
        expect(getHeaderColumnIds(providerFixture)).toStrictEqual(['name', 'region', 'throughput', 'status']);
        expect(liveRegion.textContent.trim()).toBe('Reactive provider moved Status to r4/r4');

        // when:
        providerHost.accessibilityText.set({
          emptyState: 'Input empty state',
          tableSummary: ({ visibleRowsText }) => `Input summary ${visibleRowsText}`
        });
        providerFixture.detectChanges();

        summary = queryRequired<HTMLElement>(providerFixture, 'p[id$="-summary"]');
        emptyState = queryRequired<HTMLElement>(providerFixture, '.empty-state');
        instructions = queryRequired<HTMLElement>(providerFixture, 'p[id$="-instructions"]');

        // then:
        expect(summary.textContent.trim()).toBe('Input summary r0');
        expect(emptyState.textContent.trim()).toBe('Input empty state');
        expect(instructions.textContent.trim()).toBe(
          'Reactive provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
        );

        // when: table-owned loading and error rows render after the provider update
        providerHost.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        // then:
        expect(queryRequired<HTMLElement>(providerFixture, '.loading-state').textContent.trim()).toBe(
          'Reactive provider loading state'
        );
        expect(queryRequired<HTMLTableElement>(providerFixture, 'table')).toBe(tableElement);
        expect(liveRegion.textContent.trim()).toBe('Reactive provider loading state');

        // when:
        providerHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        // then:
        expect(queryRequired<HTMLElement>(providerFixture, '.error-state').textContent.trim()).toBe('Reactive provider error state');
        expect(queryRequired<HTMLTableElement>(providerFixture, 'table')).toBe(tableElement);
        expect(liveRegion.textContent.trim()).toBe('Reactive provider error state');

        providerFixture.destroy();
      });
    });
  });

  describe('GIVEN: a table in a loading, error, or empty state', () => {
    describe('WHEN: the data status changes to loading then error', () => {
      it('THEN: it renders built-in loading and error rows as spanning table body cells', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        host.rows.set([]);
        host.accessibilityText = {
          loadingState: 'Loading operations.',
          errorState: 'Operations failed.'
        };
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        fixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const loadingCell = queryRequired<HTMLTableCellElement>(fixture, '.loading-state');

        // then:
        expect(table.getAttribute('aria-busy')).toBe('true');
        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(loadingCell.colSpan).toBe(4);
        expect(loadingCell.textContent.trim()).toBe('Loading operations.');

        // when:
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const errorCell = queryRequired<HTMLTableCellElement>(fixture, '.error-state');
        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

        // then:
        expect(table.getAttribute('aria-busy')).toBeNull();
        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(errorCell.colSpan).toBe(4);
        expect(errorCell.textContent.trim()).toBe('Operations failed.');
        expect(liveRegion.textContent.trim()).toBe('Operations failed.');
      });
    });

    describe('WHEN: the data status changes to background loading', () => {
      it('THEN: it keeps existing rows visible during background loading while exposing aria-busy', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        // when:
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        fixture.detectChanges();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');

        // then:
        expect(table.getAttribute('aria-busy')).toBe('true');
        expect(query(fixture, '.loading-state')).toBeNull();
        expect(queryAll(fixture, 'tbody tr')).toHaveLength(6);
      });
    });

    describe('WHEN: an error state hides cached rows', () => {
      it('THEN: it reports rendered row counts when an error state hides cached rows', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        const stateFixture = TestBed.createComponent(StateTemplatesHost);
        const stateHost = stateFixture.componentInstance;

        // when:
        stateHost.rows.set(buildRows(6));
        stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        stateHost.error.set(new Error('Cached refresh failed'));
        stateFixture.detectChanges();
        await stateFixture.whenStable();
        stateFixture.detectChanges();

        const summary = queryRequired<HTMLElement>(stateFixture, 'p[id$="-summary"]');
        const errorCell = queryRequired<HTMLElement>(stateFixture, '.error-state');
        const errorButton = errorCell.querySelector('.custom-error') as HTMLButtonElement;

        // then:
        expect(queryAll(stateFixture, 'tbody tr')).toHaveLength(1);
        expect(queryAll(stateFixture, 'tbody tr.data-row')).toHaveLength(0);
        expect(summary.textContent.trim()).toBe('No rows are currently shown. 4 visible columns.');
        expect(errorButton.dataset['rowCounts']).toBe('0/0');

        // when:
        stateFixture.destroy();
      });
    });

    describe('WHEN: caller-provided state templates render across states', () => {
      it('THEN: it renders caller-provided state templates with table state context', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        const stateFixture = TestBed.createComponent(StateTemplatesHost);
        const stateHost = stateFixture.componentInstance;

        // when:
        stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        stateFixture.detectChanges();

        queryRequired<HTMLElement>(stateFixture, '.loading-state');
        const controllerProbe = queryRequired<HTMLElement>(stateFixture, '.custom-template-controller');
        const table = queryRequired<HTMLTableElement>(stateFixture, 'table');
        const loadingContent = queryRequired<HTMLElement>(stateFixture, '.custom-loading');

        // then:
        expect(loadingContent.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('loading 0');
        expect(controllerProbe.textContent.trim()).toBe(table.id);

        // when:
        stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.success);
        stateHost.state.set({ globalFilter: 'missing' });
        stateFixture.detectChanges();
        await stateFixture.whenStable();
        stateFixture.detectChanges();

        const emptyStateCell = queryRequired<HTMLElement>(stateFixture, '.empty-state');

        // then:
        expect(emptyStateCell.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Filtered empty 4');

        // when:
        stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        stateHost.error.set(new Error('API unavailable'));
        stateFixture.detectChanges();
        await stateFixture.whenStable();
        stateFixture.detectChanges();

        const stateCell = queryRequired<HTMLElement>(stateFixture, '.error-state');
        const errorButton = stateCell.querySelector('.custom-error') as HTMLButtonElement;

        // then:
        expect(stateCell.textContent.trim()).toBe('API unavailable');
        expect(errorButton.textContent).toContain('API unavailable');
        expect(errorButton.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
        expect(errorButton.tabIndex).toBe(-1);

        // when:
        stateCell.focus();
        stateCell.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          })
        );
        stateFixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(errorButton);

        // when:
        stateFixture.destroy();
      });
    });
  });

  describe('GIVEN: a sortable table', () => {
    describe('WHEN: multiple sorting entries are supplied in single-sort mode', () => {
      it('THEN: it normalizes sorting state to a single column when multiple entries are supplied', async () => {
        await recreateHost({
          state: {
            sorting: [
              { id: 'name', desc: false },
              { id: 'region', desc: true }
            ]
          }
        });
        fixture.detectChanges();

        const table = getInternalTable(fixture);

        expect(table.table.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);

        const sortedHeaders = queryAll<HTMLTableCellElement>(fixture, 'thead th[aria-sort]');

        expect(sortedHeaders).toHaveLength(1);
        expect(sortedHeaders[0].dataset['columnId']).toBe('name');
      });
    });

    describe('WHEN: many sorting entries are patched in single-sort mode', () => {
      it('THEN: it normalizes many sorting entries to the first column and announces a single-column sort', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ initialState: {} });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const table = getInternalTable(fixture);

        // when:
        getInternalStore(fixture).updateState({
          sorting: [
            { id: 'name', desc: false },
            { id: 'region', desc: true },
            { id: 'status', desc: false },
            { id: 'throughput', desc: true }
          ]
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(table.table.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
        expect(host.sortingEvents.at(-1)).toStrictEqual([{ id: 'name', desc: false }]);

        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

        // then:
        expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending.');
      });
    });

    describe('WHEN: multiple sort columns are supplied with enableMultiSort', () => {
      it('THEN: it keeps multiple sort columns but only exposes aria-sort on the primary header', async () => {
        await recreateHost({
          enableMultiSort: true,
          state: {
            sorting: [
              { id: 'name', desc: false },
              { id: 'region', desc: true }
            ]
          }
        });
        fixture.detectChanges();

        const table = getInternalTable(fixture);

        expect(table.table.getState().sorting).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'region', desc: true }
        ]);

        const sortedHeaders = queryAll<HTMLTableCellElement>(fixture, 'thead th[aria-sort]');

        expect(sortedHeaders.map((header) => header.dataset['columnId'])).toStrictEqual(['name']);
      });
    });

    describe('WHEN: multiple sort columns are patched with enableMultiSort', () => {
      it('THEN: it emits the full sorting array and announces a multi-column sort when enableMultiSort is true', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableMultiSort: true, initialState: {} });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // when:
        getInternalStore(fixture).updateState({
          sorting: [
            { id: 'name', desc: false },
            { id: 'region', desc: true }
          ]
        });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.sortingEvents.at(-1)).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'region', desc: true }
        ]);

        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

        // then:
        expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending, then Region descending.');
      });
    });
  });

  describe('GIVEN: row selection is enabled', () => {
    describe('WHEN: row selection is disabled', () => {
      it('THEN: it does not expose aria-selected unless enableRowSelection is true', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const row = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row');
        const grid = await getGridHarness(fixture);

        // then:
        expect(row.getAttribute('aria-selected')).toBeNull();
        expect(await grid.isMultiSelectable()).toBe(false);
      });
    });

    describe('WHEN: the selection mode changes', () => {
      it('THEN: it marks the grid aria-multiselectable only for multiple-mode row selection', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableRowSelection: true });
        fixture.detectChanges();

        // then:
        expect(await (await getGridHarness(fixture)).isMultiSelectable()).toBe(true);

        // when:
        await recreateHost({ enableRowSelection: true, selectionMode: 'single' });
        fixture.detectChanges();

        // then:
        expect(await (await getGridHarness(fixture)).isMultiSelectable()).toBe(false);
      });
    });

    describe('WHEN: controlled rowSelection is supplied', () => {
      it('THEN: it reflects controlled rowSelection through aria-selected', async () => {
        await recreateHost({
          enableRowSelection: true,
          state: { rowSelection: { 'svc-00002': true } }
        });
        fixture.detectChanges();

        const selected = queryAll(fixture, 'tbody tr.data-row').filter(
          (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true'
        );

        expect(selected).toHaveLength(1);
      });
    });

    describe('WHEN: multiple selected keys are supplied in single mode', () => {
      it('THEN: it collapses to the first selected row (by key order) in single mode', async () => {
        await recreateHost({
          enableRowSelection: true,
          selectionMode: 'single',
          state: { rowSelection: { 'svc-00002': true, 'svc-00001': true } }
        });
        fixture.detectChanges();

        const selected = queryAll(fixture, 'tbody tr.data-row').filter(
          (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true'
        );

        expect(selected).toHaveLength(1);
        // Deterministic by sort order: svc-00001 wins even though svc-00002 was inserted first.
        expect(getInternalTable(fixture).table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });
      });
    });

    describe('WHEN: controlled rowSelection is supplied while selection is disabled', () => {
      it('THEN: it preserves controlled rowSelection while selection is disabled', async () => {
        await recreateHost({
          enableRowSelection: false,
          state: { rowSelection: { 'svc-00001': true } }
        });
        fixture.detectChanges();
        await fixture.whenStable();

        // The disabled flag must not wipe the controlled slice (continuity for runtime toggles).
        expect(getInternalTable(fixture).table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });
      });
    });

    describe('WHEN: a row is selected via updateState', () => {
      it('THEN: it emits rowSelectionChange and announces the selection', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableRowSelection: true, initialState: {} });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // when:
        getInternalStore(fixture).updateState({ rowSelection: { 'svc-00001': true } });
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // then:
        expect(host.rowSelectionEvents.at(-1)).toStrictEqual({ 'svc-00001': true });

        const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

        // then:
        expect(liveRegion.textContent.trim()).toBe('1 row selected.');
      });
    });

    describe('WHEN: pagination changes after a row is selected', () => {
      it('THEN: it retains row selection across pagination changes', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({
          enableRowSelection: true,
          enablePagination: true,
          initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
        });
        fixture.detectChanges();
        await fixture.whenStable();

        const table = getInternalTable(fixture);

        // when:
        // Select a row rendered on the first page.
        getInternalStore(fixture).updateState({ rowSelection: { 'svc-00001': true } });
        fixture.detectChanges();

        // when:
        // Page past it so the selected row is no longer rendered.
        getInternalStore(fixture).updateState({ pagination: (pagination) => ({ ...pagination, pageIndex: 2 }) });
        fixture.detectChanges();

        // then:
        expect(table.table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });

        // when:
        // Returning to the first page still shows the row selected.
        getInternalStore(fixture).updateState({ pagination: (pagination) => ({ ...pagination, pageIndex: 0 }) });
        fixture.detectChanges();

        const firstRow = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row');

        // then:
        expect(firstRow.getAttribute('aria-selected')).toBe('true');
      });
    });

    describe('WHEN: a selected row is filtered out of view', () => {
      it('THEN: it retains row selection when a selected row is filtered out of view', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enableRowSelection: true });
        fixture.detectChanges();
        await fixture.whenStable();

        const table = getInternalTable(fixture);

        // when:
        // Select Alpha (svc-00001).
        getInternalStore(fixture).updateState({ rowSelection: { 'svc-00001': true } });
        fixture.detectChanges();

        // when:
        // Filter to "gamma" so Alpha is no longer rendered.
        getInternalStore(fixture).updateState({ globalFilter: 'gamma' });
        fixture.detectChanges();

        const visibleRows = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(visibleRows).toHaveLength(1);
        expect((visibleRows[0] as HTMLElement).textContent).toContain('Gamma');
        // Selection is keyed by row id, so it survives the filter.
        expect(table.table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });

        // when:
        // Clearing the filter brings Alpha back, still selected.
        getInternalStore(fixture).updateState({ globalFilter: '' });
        fixture.detectChanges();

        const selectedRows = queryAll(fixture, 'tbody tr.data-row').filter((row) => row.getAttribute('aria-selected') === 'true');

        // then:
        expect(selectedRows).toHaveLength(1);
        expect((selectedRows[0] as HTMLElement).textContent).toContain('Alpha');
      });
    });
  });

  describe('GIVEN: a table whose rows activate and whose cells host controls', () => {
    describe('WHEN: a row is clicked or Enter / Space is pressed', () => {
      it('THEN: it emits rowActivate for primary clicks and Enter / Space presses on the row', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const firstRow = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const expectedRowId = table.table.getRowModel().rows[0]?.original.id;

        // then:
        expect(expectedRowId).toBeDefined();

        // when:
        firstRow.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
        fixture.detectChanges();

        // then:
        expect(host.rowActivateEvents).toHaveLength(1);

        const clickEvent = requireLast(host.rowActivateEvents);

        // then:
        expect(clickEvent.rowData.id).toBe(expectedRowId);
        expect(clickEvent.originalEvent).toBeInstanceOf(MouseEvent);

        // when:
        firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();

        // then:
        expect(host.rowActivateEvents).toHaveLength(2);
        expect(requireLast(host.rowActivateEvents).originalEvent).toBeInstanceOf(KeyboardEvent);

        const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

        // when:
        firstRow.dispatchEvent(spaceEvent);
        fixture.detectChanges();

        // then:
        expect(host.rowActivateEvents).toHaveLength(3);
        expect(spaceEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: activation originates from an interactive cell descendant', () => {
      it('THEN: it does not emit rowActivate when activation originates from an interactive cell descendant', async () => {
        @Component({
          selector: 'test-interactive-cell-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface>
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" (rowActivate)="onRowActivate($event)" />
            </nat-table-surface>
          `
        })
        class InteractiveCellHost {
          protected readonly rows = signal<Row[]>(buildRows(2));
          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              id: 'select',
              header: 'Select',
              enableSorting: false,
              enableGlobalFilter: false,
              cell: () => '<button type="button" class="row-action">Select</button>'
            },
            {
              accessorKey: 'name',
              header: 'Service',
              meta: { label: 'Service', rowHeader: true },
              cell: (info) => info.getValue<string>()
            }
          ];

          public readonly events: NatTableRowActivateEvent<Row>[] = [];

          protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
            this.events.push(event);
          }
        }

        const interactiveFixture = TestBed.createComponent(InteractiveCellHost);

        await interactiveFixture.whenStable();
        interactiveFixture.detectChanges();

        const cell = queryRequired<HTMLElement>(interactiveFixture, 'tbody tr.data-row td[data-column-id="select"]');

        cell.innerHTML = '<button type="button" class="row-action">Select</button>';
        interactiveFixture.detectChanges();

        const button = cell.querySelector('button.row-action') as HTMLButtonElement;

        button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
        interactiveFixture.detectChanges();

        expect(interactiveFixture.componentInstance.events).toHaveLength(0);
      });
    });

    describe('WHEN: Enter then Escape are pressed on a cell with a control', () => {
      it('THEN: it moves focus into a cell control with Enter and back to the cell with Escape', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML =
          '<button type="button" class="cell-action">Edit</button><button type="button" class="cell-action">Delete</button>';

        const [editButton] = Array.from(cell.querySelectorAll<HTMLButtonElement>('button.cell-action'));

        // when:
        cell.focus();

        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true
        });

        // when:
        cell.dispatchEvent(enterEvent);
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(editButton);
        expect(enterEvent.defaultPrevented).toBe(true);
        expect(host.rowActivateEvents).toHaveLength(0);

        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        });

        // when:
        editButton.dispatchEvent(escapeEvent);
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(cell);
        expect(escapeEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: Enter is pressed on a control-less cell', () => {
      it('THEN: it lets Enter on a control-less cell fall through to row activation', () => {
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.focus();
        cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        expect(host.rowActivateEvents).toHaveLength(1);
      });
    });

    describe("WHEN: Tab and Shift+Tab walk a cell's controls", () => {
      it("THEN: it walks the cell's controls with Tab and Shift+Tab and releases Tab at the cell edges", () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML = '<button type="button" class="first">First</button><button type="button" class="second">Second</button>';

        const firstButton = cell.querySelector('button.first') as HTMLButtonElement;
        const secondButton = cell.querySelector('button.second') as HTMLButtonElement;

        // when:
        // Plain Tab on a focused cell is not intercepted, so focus can leave the grid.
        cell.focus();

        const tabFromCell = new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true
        });

        // when:
        cell.dispatchEvent(tabFromCell);
        fixture.detectChanges();

        // then:
        expect(tabFromCell.defaultPrevented).toBe(false);

        // when:
        // Tab from a control walks to the next control of the same cell.
        firstButton.focus();
        firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(secondButton);

        // when:
        // Shift+Tab walks back.
        secondButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(firstButton);

        // Tab past the cell's last control is not handled, so focus can leave the grid.
        const leaveEvent = new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true
        });

        // when:
        secondButton.dispatchEvent(leaveEvent);
        fixture.detectChanges();

        // then:
        expect(leaveEvent.defaultPrevented).toBe(false);
      });
    });

    describe('WHEN: Tab walks past non-tabbable cell controls', () => {
      it('THEN: it skips non-tabbable controls but keeps roving grid-cell widgets reachable', () => {
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML =
          '<button type="button" class="first">First</button>' +
          '<button type="button" tabindex="-1">Removed from tab order</button>' +
          '<span inert><button type="button">Inert</button></span>' +
          '<span aria-hidden="true"><button type="button">Hidden</button></span>' +
          '<button type="button" ngGridCellWidget tabindex="-1" class="widget">Widget</button>';

        const firstButton = cell.querySelector('button.first') as HTMLButtonElement;
        const widgetButton = cell.querySelector('button.widget') as HTMLButtonElement;

        // The roving widget sits at tabindex="-1" (flexRender keeps it unregistered),
        // but the model still treats it as the cell's next control.
        firstButton.focus();
        firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        expect(document.activeElement).toBe(widgetButton);
      });
    });

    describe('WHEN: focus arrives on a header cell whose only content is its sort button', () => {
      it('THEN: it delegates focus to a header cell whose only content is its sort button', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const headerCell = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"]');

        headerCell.innerHTML = '<button type="button" class="header-action">Sort by Region</button>';

        const sortButton = headerCell.querySelector('button') as HTMLButtonElement;

        // when:
        // Arriving on the cell moves focus straight to its sole control — no Enter needed.
        headerCell.focus();
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(sortButton);

        // The delegated control is the cell's focus stop, so Escape stays native.
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        });

        // when:
        sortButton.dispatchEvent(escapeEvent);
        fixture.detectChanges();

        // then:
        expect(escapeEvent.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(sortButton);
      });
    });

    describe('WHEN: focus arrives on a body cell with one arrow-safe control', () => {
      it('THEN: it delegates focus to a body cell whose only perceivable content is one arrow-safe control', () => {
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        // Decorative content hidden from assistive technology does not block delegation.
        cell.innerHTML = '<span aria-hidden="true">icon</span><button type="button" class="cell-action">Acknowledge</button>';

        const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

        cell.focus();
        fixture.detectChanges();

        expect(document.activeElement).toBe(button);
      });
    });

    describe('WHEN: a single control sits next to other cell content', () => {
      it('THEN: it keeps the Enter model when a single control sits next to other cell content', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML = 'EMEA <button type="button" class="cell-action">Edit</button>';

        const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

        // when:
        // Focus stays on the cell so screen readers announce the text content too.
        cell.focus();
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(cell);

        // when:
        cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(button);
      });
    });

    describe('WHEN: a single arrow-consuming control occupies a cell', () => {
      it('THEN: it keeps the Enter model for a single arrow-consuming control', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();

        const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML = '<input type="text" class="cell-input" aria-label="Region" />';

        const inputEl = cell.querySelector('input.cell-input') as HTMLInputElement;

        // when:
        // A text input needs arrow keys for itself, so the grid keeps focus on the cell.
        cell.focus();
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(cell);

        // when:
        cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(inputEl);
      });
    });
  });

  describe('GIVEN: a table with a sticky header', () => {
    describe('WHEN: stickyHeader is toggled', () => {
      it('THEN: it applies sticky class and toggles vertical sticky header positioning', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        fixture.detectChanges();
        let tableElement = queryRequired<HTMLTableElement>(fixture, 'table');

        // then:
        expect(tableElement.classList.contains('has-sticky-header')).toBe(true);

        // then:
        await recreateHost({ stickyHeader: false });
        fixture.detectChanges();
        tableElement = queryRequired<HTMLTableElement>(fixture, 'table');
        expect(tableElement.classList.contains('has-sticky-header')).toBe(false);
      });
    });
  });

  describe('GIVEN: manual mode', () => {
    describe('WHEN: state changes are triggered in manual mode', () => {
      it('THEN: it does not paginate, sort, or filter client-side, but still tracks and emits state changes', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({
          mode: 'manual',
          enablePagination: true,
          initialState: {
            sorting: [{ id: 'throughput', desc: true }],
            pagination: { pageIndex: 0, pageSize: 2 }
          },
          manualPageCount: 3
        });

        // when:
        fixture.detectChanges();

        // In manual mode, all rows must be rendered since client-side pagination, sorting, and filtering are disabled.
        const rows = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(rows).toHaveLength(6);

        // then:
        // Verify the rendered order is the original order (Alpha first), not sorted by throughput descending
        expect(rows[0].textContent).toContain('Alpha');

        // Trigger pagination change

        // when:
        getInternalStore(fixture).updateState({
          pagination: { pageIndex: 1, pageSize: 2 }
        });
        fixture.detectChanges();

        // then:
        // State should have updated, raising the output event
        expect(host.paginationEvents.at(-1)).toStrictEqual({ pageIndex: 1, pageSize: 2 });

        // Rows must still not be sliced client-side
        const rowsAfterPage = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(rowsAfterPage).toHaveLength(6);

        // when:
        // Trigger sorting change
        getInternalStore(fixture).updateState({
          sorting: [{ id: 'name', desc: false }]
        });
        fixture.detectChanges();

        // then:
        // State should have updated, raising the output event
        expect(host.sortingEvents.at(-1)).toStrictEqual([{ id: 'name', desc: false }]);

        // Rows must still not be sorted client-side (Alpha first)
        const rowsAfterSort = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(rowsAfterSort[0].textContent).toContain('Alpha');
      });
    });

    describe('WHEN: pagination changes in mixed mode', () => {
      it('THEN: it supports mixed mode configuration (e.g. manual pagination, auto sorting)', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({
          mode: {
            pagination: 'manual',
            sorting: 'auto'
          },
          enablePagination: true,
          initialState: {
            sorting: [{ id: 'throughput', desc: true }],
            pagination: { pageIndex: 0, pageSize: 2 }
          },
          manualPageCount: 3
        });

        // when:
        fixture.detectChanges();

        // In mixed mode: pagination is manual, sorting is auto.
        // So sorting should be applied client-side (throughput desc).
        // But pagination is manual, so data should NOT be sliced client-side (all 6 rows rendered).
        const rows = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(rows).toHaveLength(6);

        // then:
        // Verify the rendered order is sorted by throughput descending (Zeta has highest throughput)
        expect(rows[0].textContent).toContain('Zeta');

        // Trigger pagination change

        // when:
        getInternalStore(fixture).updateState({
          pagination: { pageIndex: 1, pageSize: 2 }
        });
        fixture.detectChanges();

        // then:
        // State should have updated, raising the output event
        expect(host.paginationEvents.at(-1)).toStrictEqual({ pageIndex: 1, pageSize: 2 });

        // Rows must still not be sliced client-side
        const rowsAfterPage = queryAll(fixture, 'tbody tr.data-row');

        // then:
        expect(rowsAfterPage).toHaveLength(6);
      });
    });
  });
});
