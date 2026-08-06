import type { Type } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ListControls } from './list-controls';
import { ListCustomCells } from './list-custom-cells';
import { ListDataStates } from './list-data-states';
import { ListSelection } from './list-selection';

const createFixture = async <T>(component: Type<T>): Promise<ComponentFixture<T>> => {
  await TestBed.configureTestingModule({
    imports: [component],
    providers: [provideZonelessChangeDetection()]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return fixture;
};

const render = async (fixture: ComponentFixture<unknown>): Promise<void> => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

const host = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

describe('FEATURE: List custom cells docs demo', () => {
  describe('GIVEN: the demo renders', () => {
    describe('WHEN: the list items appear', () => {
      it('THEN: text, component, and template cells render through flexRender', async () => {
        const fixture = await createFixture(ListCustomCells);

        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"]')).toHaveLength(6);
        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"] app-order-status-badge')).toHaveLength(6);
        expect(host(fixture).querySelector('.list-custom-cells-total')?.textContent.trim()).toBe('$4,820.00');
      });
    });
  });
});

describe('FEATURE: List data states docs demo', () => {
  describe('GIVEN: the demo renders in the success scenario', () => {
    describe('WHEN: the error scenario is selected', () => {
      it('THEN: the built-in error item replaces the data items', async () => {
        const fixture = await createFixture(ListDataStates);

        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"]')).toHaveLength(6);

        const errorButton = Array.from(host(fixture).querySelectorAll('button')).find(
          (candidate) => candidate.textContent.trim() === 'Error'
        );

        errorButton?.click();
        await render(fixture);

        expect(host(fixture).querySelectorAll('[data-testid="nat-list-item"]')).toHaveLength(0);
        expect(host(fixture).querySelector('[data-state="error"]')).not.toBeNull();
        expect(errorButton?.classList.contains('is-active')).toBe(true);
      });
    });
  });
});

describe('FEATURE: List selection docs demo', () => {
  describe('GIVEN: the demo renders with selection enabled', () => {
    describe('WHEN: an item checkbox is toggled and the selection is cleared', () => {
      it('THEN: the selected count and data-selected attribute follow the shared slice', async () => {
        const fixture = await createFixture(ListSelection);
        const checkbox = host(fixture).querySelector('[data-testid="nat-list-item"] input[type="checkbox"]') as HTMLInputElement;

        checkbox.click();
        await render(fixture);

        expect(host(fixture).querySelector('.list-selection-count')?.textContent.trim()).toBe('1 selected');
        expect(host(fixture).querySelector('[data-testid="nat-list-item"][data-selected="true"]')).not.toBeNull();

        const clearButton = Array.from(host(fixture).querySelectorAll('button')).find(
          (candidate) => candidate.textContent.trim() === 'Clear selection'
        );

        clearButton?.click();
        await render(fixture);

        expect(host(fixture).querySelector('.list-selection-count')?.textContent.trim()).toBe('0 selected');
        expect(host(fixture).querySelector('[data-testid="nat-list-item"][data-selected="true"]')).toBeNull();
      });
    });
  });
});

describe('FEATURE: List companion controls docs demo', () => {
  describe('GIVEN: the demo renders with pagination and column visibility', () => {
    describe('WHEN: the first page renders', () => {
      it('THEN: the companions page the list and toggle its fields', async () => {
        const fixture = await createFixture(ListControls);
        const items = host(fixture).querySelectorAll('[data-testid="nat-list-item"]');

        expect(items.length).toBeLessThan(23);
        expect(host(fixture).querySelector('nat-table-pagination')).not.toBeNull();

        const customerChip = host(fixture).querySelector('.column-chip[data-column-id="customer"]') as HTMLButtonElement;

        customerChip.click();
        await render(fixture);

        expect(host(fixture).querySelector('[data-testid="nat-list-item"] [data-column-id="customer"]')).toBeNull();
      });
    });
  });
});
