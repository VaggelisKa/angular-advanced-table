import {
  Component,
  computed,
  inject,
  provideZonelessChangeDetection,
  signal,
  viewChild,
  viewChildren,
  type TemplateRef,
  type WritableSignal,
} from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MenuItem } from '@angular/aria/menu';

import {
  NAT_TABLE_UI_DEFAULT_INTL,
  NAT_TABLE_UI_ENGLISH_LOCALE,
  resolveNatTableUiIntl,
} from '../../../shared/table-ui-intl';
import { NatToolbarItem } from '../toolbar-item.directive';
import { NatToolbarOverflowMenu } from './toolbar-overflow-menu';
import {
  NAT_TABLE_TOOLBAR,
  NAT_TOOLBAR_ITEM,
  NAT_TOOLBAR_MORE_BUTTON_ID,
} from '../common/toolbar-tokens.const';
import type { NatTableToolbarRef } from '../common/toolbar-tokens.type';

class FakeToolbar implements NatTableToolbarRef {
  readonly hiddenIds: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(new Set());
  readonly activeItemId = signal<string | null>(null);
  readonly containerWidth = signal(600);
  readonly focusRegistrations: string[] = [];

  registerFocus(itemId: string): void {
    this.focusRegistrations.push(itemId);
    this.activeItemId.set(itemId);
  }
}

const ENGLISH_INTL = resolveNatTableUiIntl(NAT_TABLE_UI_DEFAULT_INTL, NAT_TABLE_UI_ENGLISH_LOCALE);

function getFakeToolbar(fixture: ComponentFixture<unknown>): FakeToolbar {
  return fixture.debugElement.injector.get(NAT_TABLE_TOOLBAR) as FakeToolbar;
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

async function openMoreMenu(fixture: ComponentFixture<unknown>): Promise<void> {
  (fixture.nativeElement.querySelector('.more-button') as HTMLButtonElement).click();
  await settle(fixture);
}

function queryMoreMenu(): HTMLElement | null {
  return document.querySelector('.more-menu');
}

@Component({
  imports: [NatToolbarItem, NatToolbarOverflowMenu],
  providers: [{ provide: NAT_TABLE_TOOLBAR, useFactory: () => new FakeToolbar() }],
  template: `
    <button natToolbarItem aria-label="Export rows" (click)="exportClicks = exportClicks + 1">
      Export
    </button>
    <button natToolbarItem="start" (click)="shareClicks = shareClicks + 1">Share</button>
    <nat-toolbar-overflow-menu
      [items]="toolbarItems()"
      [intl]="intl"
      [localeId]="localeId"
      [moreButtonTabIndex]="moreButtonTabIndex()"
    />
  `,
})
class OverflowMenuHost {
  // Component-level providers are visible to the component's own injector.
  private readonly toolbar = inject(NAT_TABLE_TOOLBAR);

  readonly toolbarItems = viewChildren(NatToolbarItem);
  readonly intl = ENGLISH_INTL;
  readonly localeId = NAT_TABLE_UI_ENGLISH_LOCALE;
  /** Mirrors the shell's public `moreButtonTabIndex` computed (section B2). */
  readonly moreButtonTabIndex = computed<0 | -1>(() =>
    this.toolbar.activeItemId() === NAT_TOOLBAR_MORE_BUTTON_ID ? 0 : -1,
  );
  exportClicks = 0;
  shareClicks = 0;
}

describe('NatToolbarOverflowMenu More button', () => {
  let fixture: ComponentFixture<OverflowMenuHost>;
  let host: OverflowMenuHost;
  let toolbar: FakeToolbar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverflowMenuHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverflowMenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    toolbar = getFakeToolbar(fixture);
  });

  it('keeps the More button in the DOM but hides the host while nothing is collapsed', async () => {
    const overflowHost = fixture.nativeElement.querySelector(
      'nat-toolbar-overflow-menu',
    ) as HTMLElement;

    expect(overflowHost.querySelector('.more-button')).toBeTruthy();
    expect(overflowHost.style.display).toBe('none');

    toolbar.hiddenIds.set(new Set([host.toolbarItems()[0].id]));
    await settle(fixture);

    expect(overflowHost.style.display).toBe('');
  });

  it('labels the More button with the formatted hidden count', async () => {
    const moreButton = fixture.nativeElement.querySelector('.more-button') as HTMLButtonElement;

    toolbar.hiddenIds.set(new Set([host.toolbarItems()[0].id]));
    await settle(fixture);

    expect(moreButton.getAttribute('type')).toBe('button');
    expect(moreButton.getAttribute('aria-haspopup')).toBe('true');
    expect(moreButton.getAttribute('aria-label')).toBe('More toolbar items (1 hidden)');

    toolbar.hiddenIds.set(new Set(host.toolbarItems().map((item) => item.id)));
    await settle(fixture);

    expect(moreButton.getAttribute('aria-label')).toBe('More toolbar items (2 hidden)');
  });

  it('participates in the roving tabindex under NAT_TOOLBAR_MORE_BUTTON_ID', async () => {
    const moreButton = fixture.nativeElement.querySelector('.more-button') as HTMLButtonElement;

    toolbar.hiddenIds.set(new Set([host.toolbarItems()[0].id]));
    await settle(fixture);

    expect(moreButton.tabIndex).toBe(-1);

    toolbar.activeItemId.set(NAT_TOOLBAR_MORE_BUTTON_ID);
    await settle(fixture);

    expect(moreButton.tabIndex).toBe(0);

    moreButton.focus();
    expect(toolbar.focusRegistrations).toContain(NAT_TOOLBAR_MORE_BUTTON_ID);
  });

  it('exposes the More-button element for the shell registerMoreButtonElement seam', async () => {
    toolbar.hiddenIds.set(new Set([host.toolbarItems()[0].id]));
    await settle(fixture);

    const overflowMenu = fixture.debugElement.query(
      By.directive(NatToolbarOverflowMenu),
    ).componentInstance as NatToolbarOverflowMenu;

    // The integration task passes this element to the shell's single
    // registerMoreButtonElement(...) seam (width measurement, focus rescue, roving).
    expect(overflowMenu['moreButtonElement']()).toBe(
      fixture.nativeElement.querySelector('.more-button'),
    );
  });
});

describe('NatToolbarOverflowMenu default button mirrors', () => {
  let fixture: ComponentFixture<OverflowMenuHost>;
  let host: OverflowMenuHost;
  let toolbar: FakeToolbar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverflowMenuHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverflowMenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    toolbar = getFakeToolbar(fixture);
    toolbar.hiddenIds.set(new Set(host.toolbarItems().map((item) => item.id)));
    await settle(fixture);
  });

  it('opens an aria menu labelled from the intl bag', async () => {
    await openMoreMenu(fixture);

    const menu = queryMoreMenu();
    const moreButton = fixture.nativeElement.querySelector('.more-button') as HTMLButtonElement;

    expect(menu).not.toBeNull();
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(menu?.getAttribute('aria-label')).toBe('More toolbar items');
    expect(moreButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders one mirror per collapsed item in registry order with resolved labels', async () => {
    await openMoreMenu(fixture);

    const entries = Array.from(document.querySelectorAll('.more-menu-item')) as HTMLButtonElement[];

    // Registry (DOM) order, NOT visual order: "Share" is a start item declared second.
    expect(entries.length).toBe(2);
    // aria-label chain: no natToolbarOverflowLabel, no spec -> host aria-label wins.
    expect(entries[0].getAttribute('aria-label')).toBe('Export rows');
    expect(entries[0].getAttribute('role')).toBe('menuitem');
    // No aria-label on the original -> textContent fallback.
    expect(entries[1].getAttribute('aria-label')).toBe('Share');
    expect(entries[0].getAttribute('data-toolbar-item-id')).toBe(host.toolbarItems()[0].id);
    expect(entries[1].getAttribute('data-toolbar-item-id')).toBe(host.toolbarItems()[1].id);
  });

  it('resolves mirror labels lazily at menu open', async () => {
    host.toolbarItems()[0].element.setAttribute('aria-label', 'Export CSV');

    await openMoreMenu(fixture);

    const firstEntry = document.querySelector('.more-menu-item') as HTMLButtonElement;

    expect(firstEntry.getAttribute('aria-label')).toBe('Export CSV');
  });

  it('forwards activation to the hidden original and closes the menu', async () => {
    await openMoreMenu(fixture);

    const entries = Array.from(document.querySelectorAll('.more-menu-item')) as HTMLButtonElement[];

    entries[0].click();
    await settle(fixture);

    expect(host.exportClicks).toBe(1);
    expect(host.shareClicks).toBe(0);
    expect(queryMoreMenu()).toBeNull();
  });
});

@Component({
  selector: 'test-menu-content-widget',
  imports: [MenuItem],
  hostDirectives: [NatToolbarItem],
  template: `
    <button type="button" class="widget-trigger">Sort</button>
    <ng-template #mirror>
      <button
        type="button"
        ngMenuItem
        class="widget-option"
        value="Name ascending"
        (click)="lastSort = 'asc'"
      >
        Name ascending
      </button>
    </ng-template>
  `,
})
class MenuContentWidget {
  private readonly toolbarItem = inject(NAT_TOOLBAR_ITEM, { self: true });
  private readonly mirror = viewChild.required<TemplateRef<unknown>>('mirror');
  lastSort: string | null = null;
  readonly overflowChanges: boolean[] = [];

  constructor() {
    this.toolbarItem.setOverflowSpec({
      label: () => 'Sort',
      menuContent: () => this.mirror(),
      onOverflowChange: (hidden) => this.overflowChanges.push(hidden),
    });
  }
}

@Component({
  imports: [MenuContentWidget, MenuItem, NatToolbarItem, NatToolbarOverflowMenu],
  providers: [{ provide: NAT_TABLE_TOOLBAR, useFactory: () => new FakeToolbar() }],
  template: `
    <button natToolbarItem aria-label="Refresh">Refresh</button>
    <div natToolbarItem class="density-host" [natToolbarOverflowTemplate]="densityMirror">
      Density widget
    </div>
    <test-menu-content-widget />
    <ng-template #densityMirror>
      <button
        type="button"
        ngMenuItem
        class="density-mirror"
        value="Compact density"
        (click)="density = 'compact'"
      >
        Compact density
      </button>
    </ng-template>
    <nat-toolbar-overflow-menu [items]="toolbarItems()" [intl]="intl" [localeId]="localeId" />
  `,
})
class RichMirrorHost {
  readonly toolbarItems = viewChildren(NatToolbarItem);
  readonly widget = viewChild.required(MenuContentWidget);
  readonly intl = ENGLISH_INTL;
  readonly localeId = NAT_TABLE_UI_ENGLISH_LOCALE;
  density: string | null = null;
}

describe('NatToolbarOverflowMenu template and submenu mirrors', () => {
  let fixture: ComponentFixture<RichMirrorHost>;
  let host: RichMirrorHost;
  let toolbar: FakeToolbar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichMirrorHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RichMirrorHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    toolbar = getFakeToolbar(fixture);
    toolbar.hiddenIds.set(new Set(host.toolbarItems().map((item) => item.id)));
    await settle(fixture);
  });

  it('renders natToolbarOverflowTemplate content raw via ngTemplateOutlet', async () => {
    await openMoreMenu(fixture);

    const densityMirror = document.querySelector('.density-mirror') as HTMLButtonElement;

    expect(densityMirror).not.toBeNull();
    expect(densityMirror.getAttribute('role')).toBe('menuitem');

    densityMirror.click();
    await settle(fixture);

    expect(host.density).toBe('compact');
  });

  it('renders menuContent items as a labelled submenu entry', async () => {
    await openMoreMenu(fixture);

    const submenuEntry = document.querySelector(
      '.more-menu-item--submenu',
    ) as HTMLButtonElement;

    expect(submenuEntry).not.toBeNull();
    // Label chain: spec.label() wins for the widget.
    expect(submenuEntry.getAttribute('aria-label')).toBe('Sort');
    expect(submenuEntry.getAttribute('aria-haspopup')).toBe('true');
    expect(submenuEntry.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('.widget-option')).toBeNull();
  });

  it('expands the submenu mirror and activates the wrapped menu content', async () => {
    await openMoreMenu(fixture);

    const submenuEntry = document.querySelector(
      '.more-menu-item--submenu',
    ) as HTMLButtonElement;

    submenuEntry.click();
    await settle(fixture);

    const widgetOption = document.querySelector('.widget-option') as HTMLButtonElement;

    expect(submenuEntry.getAttribute('aria-expanded')).toBe('true');
    expect(widgetOption).not.toBeNull();
    expect(widgetOption.getAttribute('role')).toBe('menuitem');

    widgetOption.click();
    await settle(fixture);

    expect(host.widget().lastSort).toBe('asc');
  });

  it('keeps the plain item as a default button mirror alongside rich mirrors', async () => {
    await openMoreMenu(fixture);

    const buttonMirrors = Array.from(
      document.querySelectorAll('.more-menu-item:not(.more-menu-item--submenu)'),
    ) as HTMLButtonElement[];

    expect(buttonMirrors.length).toBe(1);
    expect(buttonMirrors[0].getAttribute('aria-label')).toBe('Refresh');
  });
});

@Component({
  imports: [NatToolbarItem, NatToolbarOverflowMenu],
  providers: [{ provide: NAT_TABLE_TOOLBAR, useFactory: () => new FakeToolbar() }],
  template: `
    <button natToolbarItem aria-label="Export rows">Export</button>
    <button natToolbarItem class="icon-only">
      <svg viewBox="0 0 4 4" aria-hidden="true"></svg>
    </button>
    <nat-toolbar-overflow-menu [items]="toolbarItems()" [intl]="intl" [localeId]="localeId" />
  `,
})
class UnlabeledItemHost {
  readonly toolbarItems = viewChildren(NatToolbarItem);
  readonly intl = ENGLISH_INTL;
  readonly localeId = NAT_TABLE_UI_ENGLISH_LOCALE;
}

describe('NatToolbarOverflowMenu unlabeled-item demotion', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnlabeledItemHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('demotes a collapsed item without label or template to never — silently', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(UnlabeledItemHost);
    const host = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = getFakeToolbar(fixture);
    const labeledItem = host.toolbarItems()[0];
    const unlabeledItem = host.toolbarItems()[1];

    toolbar.hiddenIds.set(new Set([labeledItem.id, unlabeledItem.id]));
    await settle(fixture);

    expect(unlabeledItem.effectiveOverflowMode()).toBe('never');
    expect(labeledItem.effectiveOverflowMode()).toBe('auto');

    // Re-trigger the effect: the demotion stays idempotent and stays silent.
    toolbar.hiddenIds.set(new Set([labeledItem.id]));
    await settle(fixture);
    toolbar.hiddenIds.set(new Set([labeledItem.id, unlabeledItem.id]));
    await settle(fixture);

    // The one-shot missing-label warning belongs to
    // NatToolbarItem.resolveOverflowLabel() (section B2). This component
    // must emit NO warning of its own.
    const overflowMenuWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes('nat-toolbar-overflow-menu'),
    );

    expect(overflowMenuWarnings.length).toBe(0);

    await openMoreMenu(fixture);

    const entries = Array.from(document.querySelectorAll('.more-menu-item'));

    expect(entries.length).toBe(1);
    expect(entries[0].getAttribute('aria-label')).toBe('Export rows');

    warnSpy.mockRestore();
  });
});

describe('NatToolbarOverflowMenu close-on-hidden-set-change', () => {
  let fixture: ComponentFixture<OverflowMenuHost>;
  let host: OverflowMenuHost;
  let toolbar: FakeToolbar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverflowMenuHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverflowMenuHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    toolbar = getFakeToolbar(fixture);
  });

  it('closes the open menu and refocuses the More button when the hidden set changes', async () => {
    const [exportItem, shareItem] = host.toolbarItems();

    toolbar.hiddenIds.set(new Set([exportItem.id, shareItem.id]));
    await settle(fixture);
    await openMoreMenu(fixture);

    expect(queryMoreMenu()).not.toBeNull();

    // Toolbar grew: one item fits again while the menu is open.
    toolbar.hiddenIds.set(new Set([shareItem.id]));
    await settle(fixture);

    expect(queryMoreMenu()).toBeNull();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.more-button'));
  });

  it('moves focus to the first visible item when every item is restored', async () => {
    const [exportItem] = host.toolbarItems();

    toolbar.hiddenIds.set(new Set([exportItem.id]));
    await settle(fixture);
    await openMoreMenu(fixture);

    toolbar.hiddenIds.set(new Set());
    await settle(fixture);

    expect(queryMoreMenu()).toBeNull();
    expect(document.activeElement).toBe(exportItem.element);
  });

  it('does not close the menu when the hidden set is unchanged', async () => {
    const [exportItem, shareItem] = host.toolbarItems();

    toolbar.hiddenIds.set(new Set([exportItem.id, shareItem.id]));
    await settle(fixture);
    await openMoreMenu(fixture);

    // Same membership, new Set identity: must NOT close.
    toolbar.hiddenIds.set(new Set([exportItem.id, shareItem.id]));
    await settle(fixture);

    expect(queryMoreMenu()).not.toBeNull();
  });
});
