import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { root, setScrollMetrics } from '../../test-helpers/table-dom.helper';
import { TableHost } from '../../test-helpers/table-hosts.helper';

const dispatchKeydown = (element: HTMLElement, key: string, modifiers: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...modifiers
  });

  element.dispatchEvent(event);

  return event;
};

describe('FEATURE: NatTableScrollControl keyboard behavior', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    await fixture.whenStable();
  });

  describe('GIVEN: a focused scroll range for a horizontally scrollable table', () => {
    describe('WHEN: the focused scroll range receives keyboard commands', () => {
      const configureScrollableRange = async (
        metrics: { readonly clientWidth: number; readonly scrollWidth: number } = { clientWidth: 300, scrollWidth: 900 }
      ): Promise<{
        readonly leftButton: HTMLButtonElement;
        readonly position: HTMLElement;
        readonly range: HTMLInputElement;
        readonly rightButton: HTMLButtonElement;
        readonly tableRegion: HTMLElement;
      }> => {
        fixture.detectChanges();
        await fixture.whenStable();

        const tableRegion = root(fixture).querySelector('nat-table .table-region') as HTMLElement;
        const leftButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-left') as HTMLButtonElement;
        const rightButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-right') as HTMLButtonElement;
        const range = root(fixture).querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;
        const position = root(fixture).querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;

        setScrollMetrics(tableRegion, metrics);
        tableRegion.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        return { leftButton, position, range, rightButton, tableRegion };
      };

      it('THEN: unmodified Arrow keys move by rounded ten-percent visible-width steps, clamped to at least one pixel, and synchronize the rendered state', async () => {
        const { leftButton, position, range, rightButton, tableRegion } = await configureScrollableRange();
        const commands = [
          { expectedScrollLeft: 270, key: 'ArrowLeft' },
          { expectedScrollLeft: 270, key: 'ArrowDown' },
          { expectedScrollLeft: 330, key: 'ArrowRight' },
          { expectedScrollLeft: 330, key: 'ArrowUp' }
        ] as const;

        expect(range.type).toBe('range');
        expect(range.getAttribute('role')).toBeNull();

        for (const { expectedScrollLeft, key } of commands) {
          tableRegion.scrollLeft = 300;
          tableRegion.dispatchEvent(new Event('scroll'));
          await fixture.whenStable();

          const event = dispatchKeydown(range, key);

          await fixture.whenStable();

          expect(event.defaultPrevented).toBe(true);
          expect(tableRegion.scrollLeft).toBe(expectedScrollLeft);
          expect(range.value).toBe(String(expectedScrollLeft));
          expect(leftButton.disabled).toBe(false);
          expect(rightButton.disabled).toBe(false);
          expect(position.textContent.trim()).toBe(`${Math.round((expectedScrollLeft / 600) * 100)}% scrolled`);
          expect(range.getAttribute('aria-valuetext')).toBe(`${Math.round((expectedScrollLeft / 600) * 100)}% scrolled`);
        }

        setScrollMetrics(tableRegion, {
          clientWidth: 4,
          scrollWidth: 100
        });
        tableRegion.scrollLeft = 10;
        tableRegion.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const minimumStepEvent = dispatchKeydown(range, 'ArrowRight');

        await fixture.whenStable();

        expect(minimumStepEvent.defaultPrevented).toBe(true);
        expect(tableRegion.scrollLeft).toBe(11);
        expect(range.value).toBe('11');
        expect(leftButton.disabled).toBe(false);
        expect(rightButton.disabled).toBe(false);
        expect(position.textContent.trim()).toBe('11% scrolled');
        expect(range.getAttribute('aria-valuetext')).toBe('11% scrolled');
      });

      it('THEN: Shift plus Arrow keys move by rounded ten-percent available-scroll steps, clamped to at least one pixel, and synchronize the rendered state', async () => {
        const { leftButton, position, range, rightButton, tableRegion } = await configureScrollableRange();
        const commands = [
          { expectedScrollLeft: 240, key: 'ArrowLeft' },
          { expectedScrollLeft: 240, key: 'ArrowDown' },
          { expectedScrollLeft: 360, key: 'ArrowRight' },
          { expectedScrollLeft: 360, key: 'ArrowUp' }
        ] as const;

        for (const { expectedScrollLeft, key } of commands) {
          tableRegion.scrollLeft = 300;
          tableRegion.dispatchEvent(new Event('scroll'));
          await fixture.whenStable();

          const event = dispatchKeydown(range, key, { shiftKey: true });

          await fixture.whenStable();

          expect(event.defaultPrevented).toBe(true);
          expect(tableRegion.scrollLeft).toBe(expectedScrollLeft);
          expect(range.value).toBe(String(expectedScrollLeft));
          expect(leftButton.disabled).toBe(false);
          expect(rightButton.disabled).toBe(false);
          expect(position.textContent.trim()).toBe(`${Math.round((expectedScrollLeft / 600) * 100)}% scrolled`);
          expect(range.getAttribute('aria-valuetext')).toBe(`${Math.round((expectedScrollLeft / 600) * 100)}% scrolled`);
        }

        setScrollMetrics(tableRegion, {
          clientWidth: 100,
          scrollWidth: 104
        });
        tableRegion.scrollLeft = 2;
        tableRegion.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const minimumStepEvent = dispatchKeydown(range, 'ArrowRight', { shiftKey: true });

        await fixture.whenStable();

        expect(minimumStepEvent.defaultPrevented).toBe(true);
        expect(tableRegion.scrollLeft).toBe(3);
        expect(range.value).toBe('3');
        expect(leftButton.disabled).toBe(false);
        expect(rightButton.disabled).toBe(false);
        expect(position.textContent.trim()).toBe('75% scrolled');
        expect(range.getAttribute('aria-valuetext')).toBe('75% scrolled');
      });

      it('THEN: Page commands move one visible width while Home, End, Control, and Meta commands use their exact horizontal-scroll destinations', async () => {
        const { leftButton, position, range, rightButton, tableRegion } = await configureScrollableRange({
          clientWidth: 200,
          scrollWidth: 1000
        });
        const commands = [
          { expectedScrollLeft: 600, key: 'PageUp', modifiers: {} },
          { expectedScrollLeft: 200, key: 'PageDown', modifiers: {} },
          { expectedScrollLeft: 0, key: 'Home', modifiers: {} },
          { expectedScrollLeft: 800, key: 'End', modifiers: {} },
          { expectedScrollLeft: 0, key: 'ArrowLeft', modifiers: { ctrlKey: true } },
          { expectedScrollLeft: 800, key: 'ArrowRight', modifiers: { ctrlKey: true } },
          { expectedScrollLeft: 0, key: 'ArrowLeft', modifiers: { metaKey: true } },
          { expectedScrollLeft: 800, key: 'ArrowRight', modifiers: { metaKey: true } }
        ] as const;

        for (const { expectedScrollLeft, key, modifiers } of commands) {
          tableRegion.scrollLeft = 400;
          tableRegion.dispatchEvent(new Event('scroll'));
          await fixture.whenStable();

          const event = dispatchKeydown(range, key, modifiers);

          await fixture.whenStable();

          expect(event.defaultPrevented).toBe(true);
          expect(tableRegion.scrollLeft).toBe(expectedScrollLeft);
          expect(range.value).toBe(String(expectedScrollLeft));
          expect(leftButton.disabled).toBe(expectedScrollLeft === 0);
          expect(rightButton.disabled).toBe(expectedScrollLeft === 800);
          expect(position.textContent.trim()).toBe(`${Math.round((expectedScrollLeft / 800) * 100)}% scrolled`);
          expect(range.getAttribute('aria-valuetext')).toBe(`${Math.round((expectedScrollLeft / 800) * 100)}% scrolled`);
        }
      });

      it('THEN: modified commands outside the exact map remain native and unprevented', async () => {
        const { range, tableRegion } = await configureScrollableRange();
        const commands = [
          { key: 'ArrowLeft', modifiers: { altKey: true } },
          { key: 'ArrowRight', modifiers: { ctrlKey: true, shiftKey: true } },
          { key: 'ArrowRight', modifiers: { metaKey: true, shiftKey: true } },
          { key: 'ArrowRight', modifiers: { ctrlKey: true, metaKey: true } },
          { key: 'PageUp', modifiers: { ctrlKey: true } },
          { key: 'PageDown', modifiers: { shiftKey: true } },
          { key: 'Home', modifiers: { metaKey: true } }
        ] as const;

        for (const { key, modifiers } of commands) {
          tableRegion.scrollLeft = 300;
          tableRegion.dispatchEvent(new Event('scroll'));
          await fixture.whenStable();

          const event = dispatchKeydown(range, key, modifiers);

          await fixture.whenStable();

          expect(event.defaultPrevented).toBe(false);
          expect(tableRegion.scrollLeft).toBe(300);
        }
      });
    });
  });
});
