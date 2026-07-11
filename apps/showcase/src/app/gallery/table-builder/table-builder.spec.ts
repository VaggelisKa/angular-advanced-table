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

const findRequired = <T>(items: T[], predicate: (item: T) => boolean, message: string): T => {
  const match = items.find(predicate);

  if (!match) {
    throw new Error(message);
  }

  return match;
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

    describe('WHEN: the Everything preset is applied', () => {
      it('THEN: the generated HTML and TS snippets reflect export, fixed sizing, and row selection', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const everythingPreset = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.preset-row button')).find((button) =>
          button.textContent.includes('Everything')
        );

        if (!everythingPreset) {
          throw new Error('Expected the Everything preset button to exist.');
        }

        // when: the user applies the Everything preset (turns every feature on)
        everythingPreset.click();
        await flushRender(fixture);

        const htmlCode = queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code');

        // then: the HTML snippet (default tab) reflects export + fixed-width resizing + row selection
        expect(htmlCode.classList.contains('language-markup')).toBe(true);
        expect(htmlCode.textContent).toContain('natTableExport');
        expect(htmlCode.textContent).toContain('columnSizingMode');
        expect(htmlCode.textContent).toContain('[enableRowSelection]');
        expect(htmlCode.textContent).toContain('natTableLoading');

        const tsTab = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.tab-btn')).find((button) =>
          button.textContent.includes('custom-table.ts')
        );

        if (!tsTab) {
          throw new Error('Expected the custom-table.ts tab button to exist.');
        }

        // when: the user switches to the TypeScript source tab
        tsTab.click();
        await flushRender(fixture);

        const tsCode = queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code');

        // then: the TS snippet wraps the columns with the selection helper
        expect(tsCode.textContent).toContain('withNatTableSelectionColumn');
        expect(tsCode.textContent).toContain('NatTableDataStatus');
      });
    });

    describe('WHEN: localization is enabled and the preview language is toggled', () => {
      it('THEN: the language selector appears and defaults to Danish, then flips to English on click', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const localizationToggle = findRequired(
          Array.from(compiled.querySelectorAll<HTMLLabelElement>('.toggle-control')),
          (control) => control.querySelector('.toggle-label')?.textContent === 'Localization',
          'Expected the Localization feature toggle to exist.'
        );
        const localizationCheckbox = queryRequiredElement<HTMLInputElement>(localizationToggle, 'input.toggle-checkbox');

        // when: the user enables the localization feature
        localizationCheckbox.click();
        await flushRender(fixture);

        const languageSelector = queryRequiredElement<HTMLElement>(compiled, '[aria-label="Preview language"]');
        const languageButtons = Array.from(languageSelector.querySelectorAll<HTMLButtonElement>('button'));
        const englishButton = findRequired(
          languageButtons,
          (button) => button.textContent.includes('English'),
          'Expected the English language button to exist.'
        );
        const danishButton = findRequired(
          languageButtons,
          (button) => button.textContent.includes('Dansk'),
          'Expected the Dansk language button to exist.'
        );

        // then: the preview language selector renders with Danish active by default
        expect(danishButton.classList.contains('is-active')).toBe(true);
        expect(englishButton.classList.contains('is-active')).toBe(false);

        // when: the user clicks the English button
        englishButton.click();
        await flushRender(fixture);

        // then: English becomes active and Danish is no longer active
        expect(englishButton.classList.contains('is-active')).toBe(true);
        expect(danishButton.classList.contains('is-active')).toBe(false);
      });
    });

    describe('WHEN: column resizing is enabled', () => {
      it('THEN: resize handles render on name, category, status, and owner but not value', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const resizingToggle = findRequired(
          Array.from(compiled.querySelectorAll<HTMLLabelElement>('.toggle-control')),
          (control) => control.querySelector('.toggle-label')?.textContent === 'Column Resizing',
          'Expected the Column Resizing feature toggle to exist.'
        );
        const resizingCheckbox = queryRequiredElement<HTMLInputElement>(resizingToggle, 'input.toggle-checkbox');

        // when: the user enables column resizing
        resizingCheckbox.click();
        await flushRender(fixture);

        // then: resize handles render on the four leading columns, not on the trailing value column
        const handleIds = Array.from(compiled.querySelectorAll<HTMLElement>('.column-resize-handle')).map((handle) =>
          handle.getAttribute('data-testid')
        );

        expect(handleIds).toContain('nat-table-resize-handle-name');
        expect(handleIds).toContain('nat-table-resize-handle-category');
        expect(handleIds).toContain('nat-table-resize-handle-status');
        expect(handleIds).toContain('nat-table-resize-handle-owner');
        expect(handleIds).not.toContain('nat-table-resize-handle-value');
      });
    });

    describe('WHEN: fixed sizing is selected while resizing is enabled', () => {
      it('THEN: it marks Fixed active and emits fixed sizing in the generated HTML', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const resizingToggle = findRequired(
          Array.from(compiled.querySelectorAll<HTMLLabelElement>('.toggle-control')),
          (control) => control.querySelector('.toggle-label')?.textContent === 'Column Resizing',
          'Expected the Column Resizing feature toggle to exist.'
        );

        queryRequiredElement<HTMLInputElement>(resizingToggle, 'input.toggle-checkbox').click();
        await flushRender(fixture);

        const sizingMode = queryRequiredElement<HTMLElement>(compiled, '[aria-label="Column sizing mode"]');
        const fixedButton = findRequired(
          Array.from(sizingMode.querySelectorAll<HTMLButtonElement>('button')),
          (button) => button.textContent.trim() === 'Fixed',
          'Expected the Fixed column sizing mode button to exist.'
        );

        fixedButton.click();
        await flushRender(fixture);

        expect(fixedButton.getAttribute('aria-pressed')).toBe('true');
        expect(queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code').textContent).toContain(
          `[columnSizingMode]="'fixed'"`
        );
      });
    });

    describe('WHEN: column reordering is toggled off', () => {
      it('THEN: the generated TS snippet never mentions meta.reorderable (reordering is a surface-level default)', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const tsTab = findRequired(
          Array.from(compiled.querySelectorAll<HTMLButtonElement>('.tab-btn')),
          (button) => button.textContent.includes('custom-table.ts'),
          'Expected the custom-table.ts tab button to exist.'
        );

        // when: the user switches to the TypeScript source tab (reordering is on by default)
        tsTab.click();
        await flushRender(fixture);

        // then: the generated columns carry no per-column reorderable flag
        expect(queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code').textContent).not.toContain('reorderable');

        const reorderToggle = findRequired(
          Array.from(compiled.querySelectorAll<HTMLLabelElement>('.toggle-control')),
          (control) => control.querySelector('.toggle-label')?.textContent === 'Column Reordering',
          'Expected the Column Reordering feature toggle to exist.'
        );

        // when: the user disables column reordering
        queryRequiredElement<HTMLInputElement>(reorderToggle, 'input.toggle-checkbox').click();
        await flushRender(fixture);

        // then: the snippet still never mentions reorderable
        expect(queryRequiredElement<HTMLElement>(compiled, 'code.code-content-code').textContent).not.toContain('reorderable');
      });
    });

    describe('WHEN: the Minimal preset is applied then column resizing is enabled', () => {
      it('THEN: resize handles render on name, category and status but not value', async () => {
        const fixture = TestBed.createComponent(TableBuilderPage);

        await flushRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const minimalPreset = findRequired(
          Array.from(compiled.querySelectorAll<HTMLButtonElement>('.preset-row button')),
          (button) => button.textContent.includes('Minimal'),
          'Expected the Minimal preset button to exist.'
        );

        // when: the user applies the Minimal preset then enables column resizing
        minimalPreset.click();
        await flushRender(fixture);

        const resizingToggle = findRequired(
          Array.from(compiled.querySelectorAll<HTMLLabelElement>('.toggle-control')),
          (control) => control.querySelector('.toggle-label')?.textContent === 'Column Resizing',
          'Expected the Column Resizing feature toggle to exist.'
        );

        queryRequiredElement<HTMLInputElement>(resizingToggle, 'input.toggle-checkbox').click();
        await flushRender(fixture);

        // then: the trailing value column still has no resize handle
        const handleIds = Array.from(compiled.querySelectorAll<HTMLElement>('.column-resize-handle')).map((handle) =>
          handle.getAttribute('data-testid')
        );

        expect(handleIds).not.toContain('nat-table-resize-handle-value');
      });
    });
  });
});
