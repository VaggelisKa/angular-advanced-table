import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import {
  getHeaderActionsMenuButton,
  getHeaderColumnIds,
  getOpenMenuHarness,
  getOpenMoveMenuItem,
  queryByTestId,
  root
} from '../../test-helpers/table-dom.helper';
import {
  CustomSortIndicatorHost,
  HiddenHeaderActionLabelHost,
  MoveOnlyHeaderActionsHost
} from '../../test-helpers/table-header-hosts.helper';
import { TableHost } from '../../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable UI - Header Actions Reorder', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost, CustomSortIndicatorHost, MoveOnlyHeaderActionsHost, HiddenHeaderActionLabelHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('GIVEN: a table with header sort and column actions', () => {
    describe('WHEN: a column is moved via the header actions menu', () => {
      it('THEN: it moves columns through the header actions menu and announces the move', async () => {
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');
        const liveRegion = root(fixture).querySelector('nat-table p[aria-live="polite"]') as HTMLElement;

        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const moveRightMenuItem = getOpenMoveMenuItem('right', 'region');

        expect(moveRightMenuItem.disabled).toBe(false);

        moveRightMenuItem.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(host.tableState().columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
        expect(liveRegion.textContent.trim()).toBe('Moved Region column to position 3 of 4 in the unpinned region.');
      });
    });

    describe('WHEN: a pinned column is moved via the header actions menu', () => {
      it('THEN: it moves pinned columns through the header actions menu inside the pinned region', async () => {
        host.tableState.set({
          columnPinning: {
            left: ['name', 'region'],
            right: []
          }
        });
        fixture.detectChanges();

        const regionMenuButton = getHeaderActionsMenuButton(fixture, 'region');

        regionMenuButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        getOpenMoveMenuItem('left', 'region').click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'name', 'status', 'throughput']);
        expect(host.tableState().columnPinning).toStrictEqual({
          left: ['region', 'name'],
          right: []
        });
      });
    });

    describe('WHEN: the table with move-only actions renders', () => {
      it('THEN: it renders move-only header action menus without pin actions', async () => {
        const moveOnlyFixture = TestBed.createComponent(MoveOnlyHeaderActionsHost);

        moveOnlyFixture.detectChanges();

        const menuButton = getHeaderActionsMenuButton(moveOnlyFixture, 'region');

        menuButton.click();
        moveOnlyFixture.detectChanges();
        await moveOnlyFixture.whenStable();
        moveOnlyFixture.detectChanges();

        const menu = await getOpenMenuHarness(moveOnlyFixture);

        expect(queryByTestId('nat-table-header-pin-left-region')).toBeNull();
        expect(queryByTestId('nat-table-header-pin-right-region')).toBeNull();
        expect(await menu.getItems({ text: /Pin/ })).toHaveLength(0);
        expect(await menu.getItems({ text: /Move left/ })).toHaveLength(1);
        expect(await menu.getItems({ text: /Move right/ })).toHaveLength(1);

        moveOnlyFixture.destroy();
      });
    });
  });
});
