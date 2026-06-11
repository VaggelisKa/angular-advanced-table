import { Component, forwardRef, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import type { NatTableToolbarRef } from '../common/toolbar-tokens.type';
import { NatToolbarSearch } from './toolbar-search';

interface Row {
  id: string;
  name: string;
  region: string;
}

const TEST_ROWS: Row[] = [
  { id: 'r1', name: 'Alpha', region: 'us-east-1' },
  { id: 'r2', name: 'Gamma', region: 'eu-west-3' },
];

const TEST_COLUMNS: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Service', meta: { label: 'Service' } },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' } },
];

@Component({
  imports: [NatTable, NatToolbarSearch],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [enablePagination]="true"
      [enableGlobalFilter]="enableGlobalFilter()"
      accessibleName="Search host table"
      (stateChange)="onTableStateChange($event)"
    />

    <nat-toolbar-search
      natToolbarItem="start"
      [for]="grid"
      [label]="label()"
      [placeholder]="placeholder()"
    />
  `,
})
class SearchHost {
  readonly rows = TEST_ROWS;
  readonly columns = TEST_COLUMNS;
  readonly enableGlobalFilter = signal(true);
  readonly label = signal<string | undefined>(undefined);
  readonly placeholder = signal<string | undefined>(undefined);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 1, pageSize: 1 },
  };

  onTableStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatToolbarSearch],
  template: `<nat-toolbar-search />`,
})
class NoControllerSearchHost {}

describe('NatToolbarSearch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders a compact search input wired to the controller', () => {
    const fixture = TestBed.createComponent(SearchHost);

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const table = fixture.nativeElement.querySelector('nat-table table') as HTMLTableElement;

    expect(input).toBeTruthy();
    expect(input.getAttribute('aria-label')).toBe('Search rows');
    expect(input.placeholder).toBe('Search rows');
    expect(input.getAttribute('aria-controls')).toBe(table.id);
    expect(input.disabled).toBe(false);
  });

  it('patches the global filter and resets the page index', () => {
    const fixture = TestBed.createComponent(SearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    input.value = 'gamma';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.tableState().globalFilter).toBe('gamma');
    expect(host.tableState().pagination?.pageIndex).toBe(0);
  });

  it('prefers label and placeholder inputs over intl defaults', () => {
    const fixture = TestBed.createComponent(SearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();

    host.label.set('Find services');
    host.placeholder.set('Type to filter');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    expect(input.getAttribute('aria-label')).toBe('Find services');
    expect(input.placeholder).toBe('Type to filter');
  });

  it('hides the input when the controller disables global filtering', () => {
    const fixture = TestBed.createComponent(SearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();

    host.enableGlobalFilter.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.search-input')).toBeNull();
  });

  it('renders a disabled input and warns once when no controller resolves', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NoControllerSearchHost);

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-controls')).toBeNull();

    fixture.detectChanges();

    const controllerWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes('nat-toolbar-search: no controller resolved'),
    );

    expect(controllerWarnings.length).toBe(1);

    warnSpy.mockRestore();
  });

  it('registers as a never-overflow toolbar item with the input as focus target', async () => {
    const fixture = TestBed.createComponent(SearchHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const searchDebug = fixture.debugElement.query(By.directive(NatToolbarSearch));
    const itemRef = searchDebug.injector.get(NAT_TOOLBAR_ITEM);
    const hostElement = searchDebug.nativeElement as HTMLElement;
    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    expect(itemRef.id).toMatch(/^nat-toolbar-item-\d+$/);
    expect(itemRef.position()).toBe('start');
    expect(itemRef.overflowSpec()?.mode).toBe('never');
    expect(itemRef.effectiveOverflowMode()).toBe('never');
    expect(itemRef.focusTarget()).toBe(input);
    expect(hostElement.hasAttribute('tabindex')).toBe(false);
    expect(input.getAttribute('tabindex')).toBe('0');
  });
});

@Component({
  imports: [NatTable, NatToolbarSearch],
  providers: [
    { provide: NAT_TABLE_TOOLBAR, useExisting: forwardRef(() => CollapsibleSearchHost) },
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows"
      [columns]="columns"
      accessibleName="Collapsible search host table"
    />

    <nat-toolbar-search [for]="grid" [collapseBelow]="collapseBelow()" />
  `,
})
class CollapsibleSearchHost implements NatTableToolbarRef {
  readonly rows = TEST_ROWS;
  readonly columns = TEST_COLUMNS;
  readonly collapseBelow = signal(480);
  readonly hiddenIds = signal<ReadonlySet<string>>(new Set<string>());
  readonly activeItemId = signal<string | null>(null);
  readonly containerWidth = signal(0);
  readonly focusedItemIds: string[] = [];

  registerFocus(itemId: string): void {
    this.focusedItemIds.push(itemId);
  }
}

describe('NatToolbarSearch (collapse)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('stays expanded while the toolbar width is unmeasured (0)', () => {
    const fixture = TestBed.createComponent(CollapsibleSearchHost);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.search-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.search-toggle')).toBeNull();
  });

  it('collapses to an icon button below collapseBelow and expands on click', async () => {
    const fixture = TestBed.createComponent(CollapsibleSearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    host.containerWidth.set(320);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.search-toggle') as HTMLButtonElement;

    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-label')).toBe('Expand search');
    expect(fixture.nativeElement.querySelector('.search-input')).toBeNull();

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    const itemRef = fixture.debugElement
      .query(By.directive(NatToolbarSearch))
      .injector.get(NAT_TOOLBAR_ITEM);

    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
    expect(host.focusedItemIds).toContain(itemRef.id);
  });

  it('collapses on Escape and returns focus to the toggle button', async () => {
    const fixture = TestBed.createComponent(CollapsibleSearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    host.containerWidth.set(320);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.search-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const toggle = fixture.nativeElement.querySelector('.search-toggle') as HTMLButtonElement;

    expect(fixture.nativeElement.querySelector('.search-input')).toBeNull();
    expect(toggle).toBeTruthy();
    expect(document.activeElement).toBe(toggle);
  });

  it('collapses on blur when empty and stays open when the input has text', async () => {
    const fixture = TestBed.createComponent(CollapsibleSearchHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    host.containerWidth.set(320);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.search-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    let input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.search-input')).toBeNull();

    (fixture.nativeElement.querySelector('.search-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    input = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    input.value = 'alpha';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.search-input')).toBeTruthy();
  });

  it('honors a custom collapseBelow threshold', () => {
    const fixture = TestBed.createComponent(CollapsibleSearchHost);
    const host = fixture.componentInstance;

    host.collapseBelow.set(200);
    fixture.detectChanges();
    host.containerWidth.set(320);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.search-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.search-toggle')).toBeNull();
  });
});
