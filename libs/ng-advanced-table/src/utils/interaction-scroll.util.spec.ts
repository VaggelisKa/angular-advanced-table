import { scrollCellIntoUnobscuredView, scrollElementHorizontallyIntoView } from './interaction.util';

const mockRect = (element: HTMLElement, left: number, right: number): void => {
  element.getBoundingClientRect = (): DOMRect => ({ left, right }) as DOMRect;
};

describe('FEATURE: horizontal scroll utilities', () => {
  describe('GIVEN: scrollElementHorizontallyIntoView', () => {
    describe('WHEN: the element sits left of the visible container', () => {
      it('THEN: it scrolls left by the difference between the edges', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 60, 140);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(10);
      });
    });

    describe('WHEN: the element sits right of the visible container', () => {
      it('THEN: it scrolls right by the difference between the edges', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 520, 600);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(150);
      });
    });

    describe('WHEN: the element is already fully within the container', () => {
      it('THEN: it leaves the scroll position unchanged', () => {
        const container = document.createElement('div');
        const element = document.createElement('div');

        mockRect(container, 100, 500);
        container.scrollLeft = 50;
        mockRect(element, 150, 450);

        scrollElementHorizontallyIntoView(container, element);

        expect(container.scrollLeft).toBe(50);
      });
    });
  });

  describe('GIVEN: scrollCellIntoUnobscuredView with a start- and an end-pinned sibling', () => {
    const renderRow = (
      direction: 'ltr' | 'rtl'
    ): { container: HTMLElement; cell: HTMLElement; start: HTMLElement; end: HTMLElement } => {
      const container = document.createElement('div');
      const row = document.createElement('div');
      const start = document.createElement('div');
      const cell = document.createElement('div');
      const end = document.createElement('div');

      start.className = 'is-pinned-left';
      end.className = 'is-pinned-right';
      cell.style.direction = direction;
      row.append(start, cell, end);
      container.append(row);
      document.body.append(container);
      mockRect(container, 0, 300);
      container.scrollLeft = 200;

      return { container, cell, start, end };
    };

    afterEach(() => {
      document.body.replaceChildren();
    });

    describe('WHEN: the table is left-to-right and the cell sits under the start-pinned column on the left', () => {
      it('THEN: it centers the cell between the pinned columns', () => {
        const { container, cell, start, end } = renderRow('ltr');

        mockRect(start, 0, 100);
        mockRect(end, 250, 300);
        mockRect(cell, 50, 150);

        scrollCellIntoUnobscuredView(container, cell);

        expect(container.scrollLeft).toBe(125);
      });
    });

    describe('WHEN: the table is right-to-left and the cell sits under the start-pinned column on the right', () => {
      it('THEN: it centers the cell between the pinned columns', () => {
        const { container, cell, start, end } = renderRow('rtl');

        mockRect(start, 200, 300);
        mockRect(end, 0, 50);
        mockRect(cell, 150, 250);

        scrollCellIntoUnobscuredView(container, cell);

        expect(container.scrollLeft).toBe(275);
      });
    });
  });
});
