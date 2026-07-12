import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { createDropEvent, getHeaderColumnIds, mockClientRect, queryRequired } from '../test-helpers/table-dom.helper';
import { TableHost, createTableHostFixture, getInternalTable } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable RTL column reordering', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a right-to-left table whose columns can be reordered by pointer', () => {
    describe('WHEN: a pointer drop is resolved from header geometry', () => {
      it('THEN: it inserts the dragged column at the matching right-to-left visual position', async () => {
        const { fixture, host } = await createTableHostFixture({ direction: 'rtl', enableReordering: true });

        fixture.detectChanges();

        const table = getInternalTable(fixture);
        const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

        if (!leafHeaderGroup) {
          throw new Error('Expected a leaf header group.');
        }

        const nameHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]');
        const regionHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"]');
        const statusHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="status"]');
        const throughputHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="throughput"]');

        mockClientRect(nameHeader, { left: 300, width: 100 });
        mockClientRect(regionHeader, { left: 200, width: 100 });
        mockClientRect(statusHeader, { left: 100, width: 100 });
        mockClientRect(throughputHeader, { left: 0, width: 100 });

        const dropEvent = createDropEvent('region', 1, 2);

        Object.assign(dropEvent, { dropPoint: { x: 75, y: 0 } });
        table.onHeaderDrop(dropEvent, leafHeaderGroup);
        fixture.detectChanges();

        expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
      });
    });
  });
});
