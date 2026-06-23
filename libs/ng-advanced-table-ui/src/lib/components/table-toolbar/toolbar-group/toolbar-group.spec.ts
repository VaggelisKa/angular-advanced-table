import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { NatTableToolbar } from '../table-toolbar';
import { NatToolbarGroup } from './toolbar-group';
import { NatToolbarItem } from '../toolbar-item/toolbar-item.directive';

@Component({
  selector: 'nat-toolbar-group-host',
  imports: [NatTableToolbar, NatToolbarItem, NatToolbarGroup],
  template: `
    <nat-table-toolbar>
      <button id="solo-start" natToolbarItem="solo-start" natToolbarItemPosition="start" type="button">Solo start</button>
      <div [disabled]="groupDisabled()" accessibleName="View density" id="density-group" natToolbarGroup="center">
        <button id="compact" natToolbarItem="compact" type="button">Compact</button>
        <button id="comfortable" natToolbarItem="comfortable" type="button">Comfortable</button>
      </div>
      <button id="solo-end" natToolbarItem="solo-end" natToolbarItemPosition="end" type="button">Solo end</button>
    </nat-table-toolbar>
  `
})
class GroupHost {
  public readonly groupDisabled = signal(false);
}

describe('NatToolbarGroup', () => {
  let fixture: ComponentFixture<GroupHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  }

  async function focusItem(domId: string): Promise<void> {
    element(domId).focus();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function pressKey(target: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    target.dispatchEvent(event);

    return event;
  }

  it('renders a labelled role="group"', () => {
    const group = element('density-group');

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('View density');
  });

  it('projects into its slot: after the first spacer, before the second', () => {
    const group = element('density-group');
    const toolbar = group.closest('nat-table-toolbar') as HTMLElement;
    const spacers = Array.from(toolbar.querySelectorAll('.nat-toolbar-spacer'));

    expect(spacers).toHaveLength(2);
    expect(Boolean(spacers[0].compareDocumentPosition(group) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(group.compareDocumentPosition(spacers[1]) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it('keeps Left/Right linear across solo items and group members', async () => {
    await focusItem('solo-start');

    pressKey(element('solo-start'), 'ArrowRight');
    expect(document.activeElement).toBe(element('compact'));

    pressKey(element('compact'), 'ArrowRight');
    expect(document.activeElement).toBe(element('comfortable'));

    pressKey(element('comfortable'), 'ArrowRight');
    expect(document.activeElement).toBe(element('solo-end'));
  });

  it('cycles within the group on Up/Down (Aria group navigation)', async () => {
    await focusItem('compact');

    pressKey(element('compact'), 'ArrowDown');
    expect(document.activeElement).toBe(element('comfortable'));

    // Next widget (solo-end) is outside the group — Down wraps to its first member.
    pressKey(element('comfortable'), 'ArrowDown');
    expect(document.activeElement).toBe(element('compact'));

    pressKey(element('compact'), 'ArrowUp');
    expect(document.activeElement).toBe(element('comfortable'));
  });

  it('soft-disables every member through the stock group directive', async () => {
    expect(element('compact').getAttribute('aria-disabled')).toBe('false');

    fixture.componentInstance.groupDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('compact').getAttribute('aria-disabled')).toBe('true');
    expect(element('comfortable').getAttribute('aria-disabled')).toBe('true');
    expect(element('solo-end').getAttribute('aria-disabled')).toBe('false');
  });
});
