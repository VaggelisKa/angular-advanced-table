import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { DocsTopicExample } from './docs-topic-example';
import type { DocsTopicExampleBlock } from '../topics/docs-topic.type';

type PrismTestGlobal = typeof globalThis & {
  Prism?: {
    highlightAllUnder(element: Element | Document): void;
  };
};

const HIGHLIGHTED_SNIPPETS = new Map<string, string>([
  ['language-html', '<span class="token tag">&lt;nat-table-surface&gt;</span>'],
  ['language-typescript', '<span class="token keyword">readonly</span> rows = [];']
]);

const queryRequiredElement = <T extends Element>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected ${selector} to exist.`);
  }

  return element;
};

async function waitForExampleRender(fixture: ComponentFixture<unknown>): Promise<void> {
  await fixture.whenStable();
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  fixture.detectChanges();
  await fixture.whenStable();
}

@Component({
  selector: 'app-test-preview',
  template: '<p>Preview table</p>'
})
class TestPreview {}

@Component({
  selector: 'app-test-host',
  imports: [DocsTopicExample],
  template: '<app-docs-topic-example [example]="example" />'
})
class TestHost {
  protected readonly example: DocsTopicExampleBlock = {
    kind: 'example',
    id: 'pagination',
    title: 'Client and manual pagination',
    description: 'The pagination companion control can drive automatic row models or app-owned data.',
    component: TestPreview,
    snippets: [
      {
        id: 'html',
        label: 'HTML',
        language: 'html',
        code: '<nat-table-surface>\n  <nat-table />\n</nat-table-surface>'
      },
      {
        id: 'ts',
        label: 'TS',
        language: 'typescript',
        code: 'readonly rows = [];'
      }
    ]
  };
}

describe('FEATURE: docs topic example code tabs', () => {
  let highlightCalls = 0;

  beforeEach(async () => {
    highlightCalls = 0;
    (globalThis as PrismTestGlobal).Prism = {
      highlightAllUnder: (element): void => {
        highlightCalls += 1;
        const code = element.querySelector('code');

        if (code) {
          code.innerHTML = HIGHLIGHTED_SNIPPETS.get(code.className) ?? code.innerHTML;
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    delete (globalThis as PrismTestGlobal).Prism;
  });

  describe('GIVEN: an example with multiple snippets', () => {
    describe('WHEN: the preview view is active', () => {
      it('THEN: it keeps both top-level tab panels mounted and hides the inactive panel', async () => {
        const fixture = TestBed.createComponent(TestHost);

        fixture.detectChanges();
        await waitForExampleRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const previewTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-preview-tab');
        const codeTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-code-tab');
        const previewPanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-preview-panel');
        const codePanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-code-panel');
        const heading = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-title');

        expect(heading.getAttribute('data-testid')).toBe('docs-example-pagination-title');
        expect(previewPanel.getAttribute('data-testid')).toBe('docs-example-pagination-preview-panel');
        expect(compiled.querySelector('.docs-example-preview-placeholder')?.getAttribute('data-testid')).toBe(
          'docs-example-pagination-preview-placeholder'
        );
        expect(previewTab.getAttribute('aria-controls')).toBe(previewPanel.id);
        expect(codeTab.getAttribute('aria-controls')).toBe(codePanel.id);
        expect(previewPanel.hidden).toBe(false);
        expect(codePanel.hidden).toBe(true);
        expect(compiled.querySelector('.docs-example-preview-placeholder')?.textContent).toContain(
          'Client and manual pagination preview loads when it enters the viewport.'
        );

        codeTab.click();
        fixture.detectChanges();
        await waitForExampleRender(fixture);

        expect(previewPanel.hidden).toBe(true);
        expect(codePanel.hidden).toBe(false);
      });
    });

    describe('WHEN: the code view opens without a chosen snippet', () => {
      it('THEN: it selects the first snippet tab and highlights the rendered code', async () => {
        const fixture = TestBed.createComponent(TestHost);

        fixture.detectChanges();
        await waitForExampleRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;
        const codeTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-code-tab');

        codeTab.click();
        fixture.detectChanges();
        await waitForExampleRender(fixture);

        const htmlTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-html-tab');
        const tsTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-ts-tab');
        const htmlPanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-html-panel');
        const tsPanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-ts-panel');

        expect(htmlTab.getAttribute('aria-controls')).toBe(htmlPanel.id);
        expect(tsTab.getAttribute('aria-controls')).toBe(tsPanel.id);
        expect(htmlTab.getAttribute('aria-selected')).toBe('true');
        expect(tsTab.getAttribute('aria-selected')).toBe('false');
        expect(htmlPanel.hidden).toBe(false);
        expect(tsPanel.hidden).toBe(true);
        expect(highlightCalls).toBeGreaterThan(0);
        expect(queryRequiredElement<HTMLElement>(compiled, 'code.language-html .token.tag').textContent).toBe('<nat-table-surface>');
      });
    });

    describe('WHEN: a source-file tab is selected', () => {
      it('THEN: it updates the selected tab and highlights the new snippet', async () => {
        const fixture = TestBed.createComponent(TestHost);

        fixture.detectChanges();
        await waitForExampleRender(fixture);

        const compiled = fixture.nativeElement as HTMLElement;

        queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-code-tab').click();
        fixture.detectChanges();
        await waitForExampleRender(fixture);

        const initialHighlightCalls = highlightCalls;
        const htmlTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-html-tab');
        const tsTab = queryRequiredElement<HTMLButtonElement>(compiled, '#docs-example-pagination-ts-tab');
        const htmlPanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-html-panel');
        const tsPanel = queryRequiredElement<HTMLElement>(compiled, '#docs-example-pagination-ts-panel');

        tsTab.click();
        fixture.detectChanges();
        await waitForExampleRender(fixture);

        expect(htmlTab.getAttribute('aria-selected')).toBe('false');
        expect(tsTab.getAttribute('aria-selected')).toBe('true');
        expect(htmlPanel.hidden).toBe(true);
        expect(tsPanel.hidden).toBe(false);
        expect(highlightCalls).toBeGreaterThan(initialHighlightCalls);
        expect(queryRequiredElement<HTMLElement>(compiled, 'code.language-typescript .token.keyword').textContent).toBe('readonly');
      });
    });
  });
});
