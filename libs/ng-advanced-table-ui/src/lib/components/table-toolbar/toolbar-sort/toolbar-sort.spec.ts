import { Component, TemplateRef, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NatToolbarSort } from './toolbar-sort';

interface Row {
  id: string;
  name: string;
  region: string;
  status: string;
}

const TEST_ROWS: Row[] = [
  { id: 'r1', name: 'Alpha', region: 'us-east-1', status: 'Healthy' },
  { id: 'r2', name: 'Gamma', region: 'eu-west-3', status: 'Pending' },
];

const TEST_COLUMNS: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Service', meta: { label: 'Service' } },
  { accessorKey: 'region', header: 'Region', enableSorting: false, meta: { label: 'Region' } },
  { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } },
];

@Component({
  imports: [NatTable, NatToolbarSort],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows"
      [columns]="columns"
      [state]="tableState()"
      accessibleName="Sort host table"
      (stateChange)="onTableStateChange($event)"
    />

    <nat-toolbar-sort [for]="grid" />
  `,
})
class SortHost {
  readonly rows = TEST_ROWS;
  readonly columns = TEST_COLUMNS;
  readonly tableState = signal<Partial<NatTableState>>({});

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatToolbarSort],
  template: `<nat-toolbar-sort />`,
})
class NoControllerSortHost {}

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('.sort-trigger') as HTMLButtonElement;
}

function getOpenSortMenu(): HTMLElement | null {
  return document.querySelector('.sort-menu');
}

function getMenuItem(columnId: string, direction: string): HTMLButtonElement {
  const item = document.querySelector(
    `.sort-menu-item[data-column-id="${columnId}"][data-direction="${direction}"]`,
  ) as HTMLButtonElement | null;

  if (!item) {
    throw new Error(`Expected a sort menu item for "${columnId}" / "${direction}".`);
  }

  return item;
}

async function openMenu(
  fixture: ComponentFixture<unknown>,
  trigger: HTMLButtonElement,
): Promise<void> {
  trigger.click();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('NatToolbarSort', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the sort menu trigger with the intl label', () => {
    const fixture = TestBed.createComponent(SortHost);

    fixture.detectChanges();

    const trigger = getTrigger(fixture);

    expect(trigger).toBeTruthy();
    expect(trigger.textContent?.trim()).toBe('Sort');
    expect(trigger.getAttribute('aria-label')).toBe('Sort');
    expect(trigger.hasAttribute('disabled')).toBe(false);
  });

  it('disables the trigger and warns once when no controller resolves', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NoControllerSortHost);

    fixture.detectChanges();

    const trigger = getTrigger(fixture);

    expect(trigger.hasAttribute('disabled')).toBe(true);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');

    fixture.detectChanges();

    const controllerWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes('nat-toolbar-sort: no controller resolved'),
    );

    expect(controllerWarnings.length).toBe(1);

    warnSpy.mockRestore();
  });

  it('lists ascending, descending, and clear entries for each sortable column', async () => {
    const fixture = TestBed.createComponent(SortHost);

    fixture.detectChanges();
    await openMenu(fixture, getTrigger(fixture));

    const menu = getOpenSortMenu();

    expect(menu).toBeTruthy();
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(menu?.getAttribute('aria-label')).toBe('Sort');
    expect(getTrigger(fixture).getAttribute('aria-expanded')).toBe('true');

    const items = Array.from(document.querySelectorAll('.sort-menu-item')) as HTMLButtonElement[];

    expect(items.length).toBe(6);
    expect(document.querySelector('.sort-menu-item[data-column-id="region"]')).toBeNull();

    const nameAscending = getMenuItem('name', 'ascending');
    const nameDescending = getMenuItem('name', 'descending');
    const nameNone = getMenuItem('name', 'none');

    expect(nameAscending.getAttribute('role')).toBe('menuitemradio');
    expect(nameAscending.getAttribute('aria-label')).toBe('Sort Service ascending');
    expect(nameAscending.getAttribute('aria-checked')).toBe('false');
    expect(nameDescending.getAttribute('aria-label')).toBe('Sort Service descending');
    expect(nameDescending.getAttribute('aria-checked')).toBe('false');
    expect(nameNone.getAttribute('role')).toBe('menuitemradio');
    expect(nameNone.getAttribute('aria-label')).toBe('Clear sorting for Service');
    expect(nameNone.getAttribute('aria-checked')).toBe('true');

    expect(getMenuItem('status', 'ascending').getAttribute('aria-label')).toBe(
      'Sort Status ascending',
    );
  });

  it('applies ascending and descending sorting through patchState and closes the menu', async () => {
    const fixture = TestBed.createComponent(SortHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    await openMenu(fixture, getTrigger(fixture));

    getMenuItem('name', 'ascending').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().sorting).toEqual([{ id: 'name', desc: false }]);
    expect(getOpenSortMenu()).toBeNull();

    await openMenu(fixture, getTrigger(fixture));

    expect(getMenuItem('name', 'ascending').getAttribute('aria-checked')).toBe('true');
    expect(getMenuItem('name', 'none').getAttribute('aria-checked')).toBe('false');

    getMenuItem('name', 'descending').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().sorting).toEqual([{ id: 'name', desc: true }]);
  });

  it('clears only the targeted column sort', async () => {
    const fixture = TestBed.createComponent(SortHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    await openMenu(fixture, getTrigger(fixture));

    getMenuItem('status', 'ascending').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().sorting).toEqual([{ id: 'status', desc: false }]);

    await openMenu(fixture, getTrigger(fixture));

    getMenuItem('status', 'none').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().sorting).toEqual([]);
  });

  it('registers overflow metadata and closes its menu when collapsed into the More menu', async () => {
    const fixture = TestBed.createComponent(SortHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const sortDebug = fixture.debugElement.query(By.directive(NatToolbarSort));
    const itemRef = sortDebug.injector.get(NAT_TOOLBAR_ITEM);
    const trigger = getTrigger(fixture);

    expect(itemRef.overflowSpec()?.label?.()).toBe('Sort');
    expect(itemRef.resolveOverflowLabel()).toBe('Sort');
    expect(itemRef.effectiveOverflowMode()).toBe('auto');
    expect(itemRef.overflowSpec()?.menuContent?.()).toBeInstanceOf(TemplateRef);
    expect(itemRef.focusTarget()).toBe(trigger);
    expect(trigger.getAttribute('tabindex')).toBe('0');

    await openMenu(fixture, trigger);

    expect(getOpenSortMenu()).toBeTruthy();

    itemRef.notifyOverflowChange(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getOpenSortMenu()).toBeNull();
  });
});
