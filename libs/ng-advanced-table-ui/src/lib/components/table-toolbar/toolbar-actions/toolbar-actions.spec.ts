import {
  Component,
  computed,
  provideZonelessChangeDetection,
  signal,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { provideNatTableUiIntl } from '../../../shared/table-ui-intl';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import { NatToolbarActions } from './toolbar-actions';
import type { NatToolbarActionItem } from './common/toolbar-actions.type';

@Component({
  imports: [NatToolbarActions],
  template: `
    <ng-template #exportIcon><span class="export-glyph">E</span></ng-template>
    <nat-toolbar-actions locale="en" [items]="items()" />
  `,
})
class ActionsHost {
  private readonly exportIcon = viewChild<TemplateRef<unknown>>('exportIcon');
  readonly exportCalls = signal(0);
  readonly archiveCalls = signal(0);
  readonly items = computed<readonly NatToolbarActionItem[]>(() => [
    {
      label: 'Export CSV',
      icon: this.exportIcon(),
      action: () => this.exportCalls.update((count) => count + 1),
    },
    { label: 'Share', action: () => undefined },
    {
      label: 'Archive',
      disabled: true,
      action: () => this.archiveCalls.update((count) => count + 1),
    },
  ]);
}

@Component({
  imports: [NatToolbarActions],
  providers: [
    provideNatTableUiIntl({
      toolbar: {
        actionsMenuLabel: 'Provider actions',
      },
    }),
  ],
  template: `<nat-toolbar-actions locale="en" [items]="items" />`,
})
class ProviderIntlHost {
  readonly items: readonly NatToolbarActionItem[] = [
    { label: 'Export CSV', action: () => undefined },
  ];
}

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector(
    'nat-toolbar-actions .actions-trigger',
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

  const menu = Array.from(document.querySelectorAll('.actions-menu')).at(-1) as
    | HTMLElement
    | undefined;

  if (!menu) {
    throw new Error('Expected the actions menu to be open.');
  }

  return menu;
}

function getMenuItem(menu: HTMLElement, label: string): HTMLButtonElement {
  const item = menu.querySelector(
    `.actions-menu-item[data-action-label="${label}"]`,
  ) as HTMLButtonElement | null;

  if (!item) {
    throw new Error(`Expected a menu item labelled "${label}".`);
  }

  return item;
}

describe('NatToolbarActions', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsHost, ProviderIntlHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders an icon-only kebab trigger labelled from intl', async () => {
    const fixture = TestBed.createComponent(ActionsHost);

    await settle(fixture);

    const hostElement = fixture.nativeElement.querySelector(
      'nat-toolbar-actions',
    ) as HTMLElement;
    const trigger = getTrigger(fixture);

    expect(hostElement.classList.contains('nat-toolbar-item')).toBe(true);
    expect(trigger.getAttribute('aria-label')).toBe('Actions');
    expect(trigger.querySelector('.actions-trigger-icon')).toBeTruthy();
    expect(trigger.textContent?.trim()).toBe('');
    expect(trigger.disabled).toBe(false);
  });

  it('renders one menu item per entry with value, icon, and disabled state', async () => {
    const fixture = TestBed.createComponent(ActionsHost);

    await settle(fixture);

    const menu = await openMenu(fixture);
    const items = Array.from(menu.querySelectorAll('.actions-menu-item')) as HTMLButtonElement[];

    expect(items.map((item) => item.dataset['actionLabel'])).toEqual([
      'Export CSV',
      'Share',
      'Archive',
    ]);
    expect(
      getMenuItem(menu, 'Export CSV')
        .querySelector('.actions-menu-item-label')
        ?.textContent?.trim(),
    ).toBe('Export CSV');
    expect(getMenuItem(menu, 'Export CSV').querySelector('.export-glyph')).toBeTruthy();
    expect(getMenuItem(menu, 'Share').querySelector('.actions-menu-item-icon')).toBeNull();
    expect(getMenuItem(menu, 'Archive').disabled).toBe(true);
    expect(getMenuItem(menu, 'Export CSV').disabled).toBe(false);
  });

  it('invokes the action and closes the menu on activation', async () => {
    const fixture = TestBed.createComponent(ActionsHost);
    const host = fixture.componentInstance;

    await settle(fixture);

    const menu = await openMenu(fixture);

    getMenuItem(menu, 'Export CSV').click();
    await settle(fixture);

    expect(host.exportCalls()).toBe(1);
    expect(getTrigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('does not invoke disabled actions', async () => {
    const fixture = TestBed.createComponent(ActionsHost);
    const host = fixture.componentInstance;

    await settle(fixture);

    const menu = await openMenu(fixture);

    getMenuItem(menu, 'Archive').click();
    await settle(fixture);

    expect(host.archiveCalls()).toBe(0);
  });

  it('prefers provider intl labels for the trigger', async () => {
    const fixture = TestBed.createComponent(ProviderIntlHost);

    await settle(fixture);

    expect(getTrigger(fixture).getAttribute('aria-label')).toBe('Provider actions');
  });

  it('registers overflow metadata and an inner focus target on its toolbar item', async () => {
    const fixture = TestBed.createComponent(ActionsHost);

    await settle(fixture);

    const itemRef = fixture.debugElement
      .query(By.directive(NatToolbarActions))
      .injector.get(NAT_TOOLBAR_ITEM);
    const trigger = getTrigger(fixture);

    expect(itemRef.overflowSpec()).not.toBeNull();
    expect(itemRef.overflowSpec()?.label?.()).toBe('Actions');
    expect(itemRef.overflowSpec()?.menuContent?.()).toBeTruthy();
    expect(itemRef.focusTarget()).toBe(trigger);
    expect(trigger.getAttribute('tabindex')).toBe('0');

    await openMenu(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    itemRef.notifyOverflowChange(true);
    await settle(fixture);

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets effectivePriority to -100 so actions collapse into More before other items', async () => {
    const fixture = TestBed.createComponent(ActionsHost);

    await settle(fixture);

    const itemRef = fixture.debugElement
      .query(By.directive(NatToolbarActions))
      .injector.get(NAT_TOOLBAR_ITEM);

    expect(itemRef.overflowSpec()?.priority).toBe(-100);
    expect(itemRef.effectivePriority()).toBe(-100);
  });

  it('produces no console.warn when rendered without [for]', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(ActionsHost);

    await settle(fixture);

    const controllerWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('no controller resolved'),
    );

    expect(controllerWarnings.length).toBe(0);

    warnSpy.mockRestore();
  });
});
