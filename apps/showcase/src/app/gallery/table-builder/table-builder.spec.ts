import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { TableBuilderPage } from './table-builder';

type PrismTestGlobal = typeof globalThis & {
  Prism?: {
    highlightElement(element: Element): void;
  };
};

const queryRequiredElement = <T extends Element>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected ${selector} to exist.`);
  }

  return element;
};

// afterRenderEffect writes after Angular flushes textContent; cycle detectChanges + whenStable
// (plus a macrotask) so the after-render phase has a chance to run before we assert.
async function flushRender(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let cycle = 0; cycle < 3; cycle += 1) {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
  }
}

describe('FEATURE: table builder code snippet highlighting', () => {
  let highlightCalls = 0;
  let lastHighlightedClassName = '';

  beforeEach(async () => {
    highlightCalls = 0;
    lastHighlightedClassName = '';
    (globalThis as PrismTestGlobal).Prism = {
      highlightElement: (element): void => {
        highlightCalls += 1;
        lastHighlightedClassName = element.className;
      }
    };

    await TestBed.configureTestingModule({
      imports: [TableBuilderPage],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    delete (globalThis as PrismTestGlobal).Prism;
  });

  describe('GIVEN: the builder renders its generated snippets', () => {
    describe('WHEN: the HTML tab is active on first render', () => {
      it('THEN: the code element is tagged language-markup and Prism runs', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const codeElement = queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code');

        // then: markup language class is applied and Prism highlighted the element at least once
        expect(codeElement.classList.contains('language-markup')).toBe(true);
        expect(codeElement.classList.contains('language-typescript')).toBe(false);
        expect(codeElement.textContent).toContain('nat-table');
        expect(highlightCalls).toBeGreaterThan(0);
        expect(lastHighlightedClassName).toContain('language-markup');
      });
    });

    describe('WHEN: the custom-table.ts tab is selected', () => {
      it('THEN: the code element switches to language-typescript and Prism re-runs', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const tsTab = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.tab-btn')).find((button) =>
          button.textContent.includes('custom-table.ts')
        );

        if (!tsTab) {
          throw new Error('Expected the custom-table.ts tab button to exist.');
        }

        const callsBeforeSwitch = highlightCalls;

        // when: the user activates the TypeScript source tab
        tsTab.click();
        await flushRender(fixture);

        const codeElement = queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code');

        // then: the language class flips to typescript, content switches, and Prism runs again
        expect(codeElement.classList.contains('language-typescript')).toBe(true);
        expect(codeElement.classList.contains('language-markup')).toBe(false);
        expect(codeElement.textContent).toContain('export class');
        expect(highlightCalls).toBeGreaterThan(callsBeforeSwitch);
        expect(lastHighlightedClassName).toContain('language-typescript');
      });
    });
  });
});
