import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { ColumnDef } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';

import { provideNatTableUiIntl } from '../../../shared/table-ui-intl';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NatToolbarView } from './toolbar-view';

interface Row {
  name: string;
  region: string;
  status: string;
  audit: string;
}

const rows: Row[] = [
  { name: 'Alpha', region: 'us-east-1', status: 'Healthy', audit: 'a1' },
  { name: 'Beta', region: 'eu-west-3', status: 'Pending', audit: 'a2' },
];

const hideableColumns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Service' },
  { accessorKey: 'region', header: 'Region' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'audit', header: 'Audit', enableHiding: false },
];

@Component({
  imports: [NatTable, NatToolbarView],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows"
      [columns]="columns"
      accessibleName="Ops table"
      (stateChange)="onStateChange($event)"
    />
    <nat-toolbar-view [for]="grid" />
  `,
})
class ColumnsHost {
  readonly rows = rows;
  readonly columns = hideableColumns;
  readonly tableState = signal<Partial<NatTableState>>({});

  onStateChange(state: NatTableState): void {
    this.tableState.set(state);
  }
}

@Component({
  imports: [NatTable, NatToolbarView],
  template: `
    <nat-table #grid="natTable" [data]="rows" [columns]="columns" accessibleName="Guard table" />
    <nat-toolbar-view [for]="grid" />
  `,
})
class LastColumnGuardHost {
  readonly rows = rows;
  readonly columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: 'name', header: 'Service' },
    { accessorKey: 'region', header: 'Region' },
  ];
}

@Component({
  imports: [NatToolbarView],
  template: `<nat-toolbar-view />`,
})
class NoControllerHost {}

@Component({
  imports: [NatTable, NatToolbarView],
  providers: [
    provideNatTableUiIntl({
      toolbar: {
        viewMenuLabel: 'Provider columns',
        accessibilityLabels: {
          viewMenuItem: ({ columnLabel, visible }) =>
            `${visible ? 'Hide' : 'Show'} ${columnLabel}`,
        },
      },
    }),
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows"
      [columns]="columns"
      accessibleName="Provider table"
    />
    <nat-toolbar-view [for]="grid" />
  `,
})
class ProviderIntlHost {
  readonly rows = rows;
  readonly columns = hideableColumns;
}

@Component({
  imports: [NatTable, NatToolbarView],
  providers: [
    provideNatTableUiIntl({
      locales: {
        da: {
          toolbar: {
            viewMenuLabel: 'Kolonner',
            accessibilityLabels: {
              viewMenuItem: ({ columnLabel, visible }) =>
                `${visible ? 'Skjul' : 'Vis'} ${columnLabel}`,
            },
          },
        },
      },
    }),
  ],
  template: `
    <nat-table #grid="natTable" [data]="rows" [columns]="columns" accessibleName="Locale table" />
    <nat-toolbar-view [for]="grid" [locale]="locale()" />
  `,
})
class LocaleFlipHost {
  readonly rows = rows;
  readonly columns = hideableColumns;
  readonly locale = signal('en');
}

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector(
    'nat-toolbar-view .columns-trigger',
  ) as HTMLButtonElement;
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function openMenu(fixture: ComponentFixture<unknown>): Promise<HTMLElement> {
  getTrigger(fixture).click();
  await settle(fixture);

  const menu = Array.from(document.querySelectorAll('.columns-menu')).at(-1) as
    | HTMLElement
    | undefined;

  if (!menu) {
    throw new Error('Expected the columns menu to be open.');
  }

  return menu;
}

async function reopenMenu(fixture: ComponentFixture<unknown>): Promise<HTMLElement> {
  if (getTrigger(fixture).getAttribute('aria-expanded') === 'true') {
    getTrigger(fixture).click();
    await settle(fixture);
  }

  return openMenu(fixture);
}

describe('NatToolbarView', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders an intl-labelled trigger registered as a toolbar item', async () => {
    const fixture = TestBed.createComponent(ColumnsHost);

    await settle(fixture);

    const hostElement = fixture.nativeElement.querySelector(
      'nat-toolbar-view',
    ) as HTMLElement;
    const trigger = getTrigger(fixture);
    const table = fixture.nativeElement.querySelector('nat-table table') as HTMLTableElement;

    expect(hostElement.classList.contains('nat-toolbar-item')).toBe(true);
    expect(trigger.textContent?.trim()).toBe('View');
    expect(trigger.getAttribute('aria-label')).toBe('View');
    expect(trigger.getAttribute('aria-controls')).toBe(table.id);
    expect(trigger.disabled).toBe(false);
  });

  it('lists one checkbox menu item per hideable column', async () => {
    const fixture = TestBed.createComponent(ColumnsHost);

    await settle(fixture);

    const menu = await openMenu(fixture);
    const items = Array.from(menu.querySelectorAll('.columns-menu-item')) as HTMLButtonElement[];

    expect(items.map((item) => item.dataset['columnId'])).toEqual(['name', 'region', 'status']);
    expect(items[0].getAttribute('role')).toBe('menuitemcheckbox');
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[0].getAttribute('aria-label')).toBe('Toggle Service column');
    expect(items[0].querySelector('.columns-menu-item-label')?.textContent?.trim()).toBe(
      'Service',
    );
    expect(
      items[0].querySelector('.columns-menu-item-check')?.classList.contains('is-visible'),
    ).toBe(true);
  });

  it('toggles column visibility through patchState', async () => {
    const fixture = TestBed.createComponent(ColumnsHost);
    const host = fixture.componentInstance;

    await settle(fixture);

    const menu = await openMenu(fixture);
    const regionItem = menu.querySelector(
      '.columns-menu-item[data-column-id="region"]',
    ) as HTMLButtonElement;

    regionItem.click();
    await settle(fixture);

    expect(host.tableState().columnVisibility?.['region']).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(3);

    const reopened = await reopenMenu(fixture);
    const refreshedRegionItem = reopened.querySelector(
      '.columns-menu-item[data-column-id="region"]',
    ) as HTMLButtonElement;

    expect(refreshedRegionItem.getAttribute('aria-checked')).toBe('false');

    refreshedRegionItem.click();
    await settle(fixture);

    expect(host.tableState().columnVisibility?.['region']).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(4);
  });

  it('disables the last visible column entry', async () => {
    const fixture = TestBed.createComponent(LastColumnGuardHost);

    await settle(fixture);

    const menu = await openMenu(fixture);

    (
      menu.querySelector('.columns-menu-item[data-column-id="name"]') as HTMLButtonElement
    ).click();
    await settle(fixture);

    const reopened = await reopenMenu(fixture);
    const regionItem = reopened.querySelector(
      '.columns-menu-item[data-column-id="region"]',
    ) as HTMLButtonElement;
    const nameItem = reopened.querySelector(
      '.columns-menu-item[data-column-id="name"]',
    ) as HTMLButtonElement;

    expect(regionItem.disabled).toBe(true);
    expect(nameItem.disabled).toBe(false);

    regionItem.click();
    await settle(fixture);

    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(1);
  });

  it('prefers provider intl labels', async () => {
    const fixture = TestBed.createComponent(ProviderIntlHost);

    await settle(fixture);

    expect(getTrigger(fixture).textContent?.trim()).toBe('Provider columns');

    const menu = await openMenu(fixture);
    const nameItem = menu.querySelector(
      '.columns-menu-item[data-column-id="name"]',
    ) as HTMLButtonElement;

    expect(nameItem.getAttribute('aria-label')).toBe('Hide Service');
  });

  it('re-resolves intl labels when the locale input flips at runtime', async () => {
    const fixture = TestBed.createComponent(LocaleFlipHost);
    const host = fixture.componentInstance;

    await settle(fixture);

    expect(getTrigger(fixture).getAttribute('aria-label')).toBe('View');

    const menu = await openMenu(fixture);
    const nameItem = menu.querySelector(
      '.columns-menu-item[data-column-id="name"]',
    ) as HTMLButtonElement;

    expect(nameItem.getAttribute('aria-label')).toBe('Toggle Service column');

    host.locale.set('da');
    await settle(fixture);

    expect(getTrigger(fixture).getAttribute('aria-label')).toBe('Kolonner');
    expect(nameItem.getAttribute('aria-label')).toBe('Skjul Service');
  });

  it('registers overflow metadata and an inner focus target on its toolbar item', async () => {
    const fixture = TestBed.createComponent(ColumnsHost);

    await settle(fixture);

    const itemRef = fixture.debugElement
      .query(By.directive(NatToolbarView))
      .injector.get(NAT_TOOLBAR_ITEM);
    const hostElement = fixture.nativeElement.querySelector(
      'nat-toolbar-view',
    ) as HTMLElement;
    const trigger = getTrigger(fixture);

    expect(itemRef.overflowSpec()).not.toBeNull();
    expect(itemRef.overflowSpec()?.label?.()).toBe('View');
    expect(itemRef.overflowSpec()?.menuContent?.()).toBeTruthy();
    expect(itemRef.focusTarget()).toBe(trigger);
    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(hostElement.hasAttribute('tabindex')).toBe(false);

    await openMenu(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    itemRef.notifyOverflowChange(true);
    await settle(fixture);

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('disables the trigger and warns once when no controller resolves', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const fixture = TestBed.createComponent(NoControllerHost);

      await settle(fixture);

      const trigger = getTrigger(fixture);

      expect(trigger.disabled).toBe(true);
      expect(trigger.textContent?.trim()).toBe('View');
      expect(trigger.hasAttribute('aria-controls')).toBe(false);

      fixture.detectChanges();

      const toolbarWarnings = warnSpy.mock.calls.filter(([message]) =>
        String(message).includes('nat-toolbar-view'),
      );

      expect(toolbarWarnings.length).toBe(1);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
