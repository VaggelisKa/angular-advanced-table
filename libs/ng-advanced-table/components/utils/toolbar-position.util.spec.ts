import { beforeEach, describe, expect, it } from 'vitest';

import { describeNatToolbarPositionMismatch } from './toolbar-position.util';

describe('FEATURE: Toolbar item position mismatch', () => {
  let toolbar: HTMLElement;

  const item = (testId: string): HTMLElement => toolbar.querySelector<HTMLElement>(`[data-testid="${testId}"]`) as HTMLElement;

  beforeEach(() => {
    toolbar = document.createElement('nat-table-toolbar');
    toolbar.innerHTML = `
      <button data-testid="start-item" natToolbarItemPosition="center"></button>
      <div class="nat-toolbar-spacer"></div>
      <button data-testid="center-item"></button>
      <div class="nat-toolbar-spacer"></div>
      <button data-testid="end-item" natToolbarItemPosition="end"></button>
    `;
  });

  describe('GIVEN: an item projected into the start slot whose live attribute says center', () => {
    describe('WHEN: its position input is center', () => {
      it('THEN: it reports the start slot it was projected into', () => {
        expect(describeNatToolbarPositionMismatch(item('start-item'), 'center')).toContain('renders in the start slot');
      });
    });
  });

  describe('GIVEN: items placed between and after the spacers', () => {
    describe('WHEN: their position inputs match where they sit', () => {
      it('THEN: it reports no mismatch, whatever their attributes say', () => {
        expect(describeNatToolbarPositionMismatch(item('center-item'), 'center')).toBeNull();
        expect(describeNatToolbarPositionMismatch(item('end-item'), 'end')).toBeNull();
        expect(describeNatToolbarPositionMismatch(item('start-item'), 'start')).toBeNull();
      });
    });
  });
});
