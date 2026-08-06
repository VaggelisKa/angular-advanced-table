import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { root } from '../../test-helpers/table-dom.helper';
import { SubHeaderActionsHost } from '../../test-helpers/table-sub-header-hosts.helper';

const sortButton = (fixture: ComponentFixture<unknown>, columnId: string): HTMLButtonElement | null =>
  root(fixture).querySelector(`thead th[data-column-id="${columnId}"] .sort-button`);

const priorityBadgeText = (fixture: ComponentFixture<unknown>, columnId: string): string | undefined =>
  root(fixture).querySelector(`thead th[data-column-id="${columnId}"] .sort-priority`)?.textContent.trim();

describe('FEATURE: NatTable UI - Header Actions with a sub-header column', () => {
  let fixture: ComponentFixture<SubHeaderActionsHost>;
  let host: SubHeaderActionsHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubHeaderActionsHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('GIVEN: a sorting-enabled surface with subHeaderColumn set', () => {
    describe('WHEN: headers render without user sorting', () => {
      it('THEN: the sub-header column renders no sort button while other columns keep theirs', () => {
        expect(sortButton(fixture, 'status')).toBeNull();
        expect(sortButton(fixture, 'name')).not.toBeNull();
        expect(sortButton(fixture, 'throughput')).not.toBeNull();
      });

      it('THEN: no column shows a sort indicator for the hidden forced sort', () => {
        expect(root(fixture).querySelectorAll('.sort-button.is-sorted')).toHaveLength(0);
      });
    });

    describe('WHEN: the user multi-sorts two other columns', () => {
      it('THEN: priorities count only user-visible sorting with no off-by-one from the forced entry', async () => {
        sortButton(fixture, 'name')?.click();
        await fixture.whenStable();
        fixture.detectChanges();

        // A single user sort shows no priority badge — the hidden forced entry
        // must not push the visible sort count above one.
        expect(root(fixture).querySelectorAll('.sort-priority')).toHaveLength(0);

        sortButton(fixture, 'throughput')?.dispatchEvent(new MouseEvent('click', { shiftKey: true, bubbles: true }));
        await fixture.whenStable();
        fixture.detectChanges();

        expect(priorityBadgeText(fixture, 'name')).toBe('1');
        expect(priorityBadgeText(fixture, 'throughput')).toBe('2');
        expect(host.tableState().sorting).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'throughput', desc: true }
        ]);
      });
    });
  });
});
