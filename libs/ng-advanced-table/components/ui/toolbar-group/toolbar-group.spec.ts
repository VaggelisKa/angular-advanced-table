import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { NatToolbarGroup } from './toolbar-group';
import { NatTableToolbar } from '../../feature/table-toolbar/table-toolbar';
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

describe('FEATURE: NatToolbarGroup', () => {
  let fixture: ComponentFixture<GroupHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const element = (domId: string): HTMLElement => {    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  }

  const focusItem = async (domId: string): Promise<void> => {    element(domId).focus();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const pressKey = (target: HTMLElement, key: string): KeyboardEvent => {    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

    target.dispatchEvent(event);

    return event;
  }

  describe('GIVEN: a toolbar group host is rendered', () => {
    describe('WHEN: renders a labelled role="group"', () => {
      it('THEN: it adds group semantics and accessible naming', () => {
        const group = element('density-group');

        expect(group.getAttribute('role')).toBe('group');
        expect(group.getAttribute('aria-label')).toBe('View density');
      });
    });
  });

  describe('GIVEN: a toolbar group host is rendered with grouped projected toolbar content', () => {
    describe('WHEN: projects into its slot: after the first spacer, before the second', () => {
      it('THEN: it places group content in the expected toolbar slot', () => {
        const group = element('density-group');
        const toolbar = group.closest('nat-table-toolbar') as HTMLElement;
        const spacers = Array.from(toolbar.querySelectorAll('.nat-toolbar-spacer'));

        expect(spacers).toHaveLength(2);
        expect(Boolean(spacers[0].compareDocumentPosition(group) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
        expect(Boolean(group.compareDocumentPosition(spacers[1]) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
      });
    });
  });

  describe('GIVEN: a toolbar group host is rendered with solo and grouped toolbar items', () => {
    describe('WHEN: keeps Left/Right linear across solo items and group members', () => {
      it('THEN: it moves focus through solo and grouped items in order', async () => {
        await focusItem('solo-start');

        pressKey(element('solo-start'), 'ArrowRight');
        expect(document.activeElement).toBe(element('compact'));

        pressKey(element('compact'), 'ArrowRight');
        expect(document.activeElement).toBe(element('comfortable'));

        pressKey(element('comfortable'), 'ArrowRight');
        expect(document.activeElement).toBe(element('solo-end'));
      });
    });
  });

  describe('GIVEN: a toolbar group host is rendered with grouped vertical toolbar navigation', () => {
    describe('WHEN: cycles within the group on Up/Down (Aria group navigation)', () => {
      it('THEN: it loops focus inside the toolbar group', async () => {
        await focusItem('compact');

        pressKey(element('compact'), 'ArrowDown');
        expect(document.activeElement).toBe(element('comfortable'));

        // Next widget (solo-end) is outside the group — Down wraps to its first member.
        pressKey(element('comfortable'), 'ArrowDown');
        expect(document.activeElement).toBe(element('compact'));

        pressKey(element('compact'), 'ArrowUp');
        expect(document.activeElement).toBe(element('comfortable'));
      });
    });
  });

  describe('GIVEN: a toolbar group host is rendered with a disabled toolbar group', () => {
    describe('WHEN: soft-disables every member through the stock group directive', () => {
      it('THEN: it marks each grouped control disabled', async () => {
        expect(element('compact').getAttribute('aria-disabled')).toBe('false');

        fixture.componentInstance.groupDisabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(element('compact').getAttribute('aria-disabled')).toBe('true');
        expect(element('comfortable').getAttribute('aria-disabled')).toBe('true');
        expect(element('solo-end').getAttribute('aria-disabled')).toBe('false');
      });
    });
  });
});
