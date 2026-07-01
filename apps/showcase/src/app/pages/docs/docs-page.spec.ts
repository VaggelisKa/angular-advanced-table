import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { DocsPage } from './docs-page';
import { highlightMarkdownCode } from './docs-page-utils';

async function waitForDocsRender(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

type PrismTestGlobal = typeof globalThis & {
  Prism?: {
    highlightAllUnder(element: Element | Document): void;
  };
};

const queryRequiredElement = <T extends Element>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected ${selector} to exist.`);
  }

  return element;
};

@Component({
  selector: 'app-test-empty-route',
  template: ''
})
class TestEmptyRoute {}

describe('FEATURE: DocsPage', () => {
  let highlightCalls = 0;
  let originalClipboard: Clipboard | undefined;
  let shouldRestoreClipboard = false;

  beforeEach(async () => {
    highlightCalls = 0;
    originalClipboard = navigator.clipboard;
    shouldRestoreClipboard = false;
    (globalThis as PrismTestGlobal).Prism = {
      highlightAllUnder: (element): void => {
        highlightCalls += 1;
        const code = element.querySelector('code.language-typescript, code.language-ts');

        if (code) {
          code.innerHTML = '<span class="token keyword">readonly</span> rows = [];';
        }
      }
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          {
            path: '',
            component: TestEmptyRoute
          },
          {
            path: 'docs/quick-start',
            component: DocsPage,
            data: { docId: 'quick-start' }
          },
          {
            path: 'docs/state',
            component: DocsPage,
            data: { docId: 'state' }
          }
        ])
      ]
    }).compileComponents();
  });

  afterEach(() => {
    if (shouldRestoreClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard
      });
    }

    delete (globalThis as PrismTestGlobal).Prism;
    vi.restoreAllMocks();
  });

  describe('GIVEN: the docs page host is rendered', () => {
    describe('WHEN: renders the selected markdown asset', () => {
      it('THEN: it shows the requested markdown content', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.docs-markdown')?.textContent).toContain('Start with NatTable inside NatTableSurface.');
        expect(compiled.querySelector('h2')?.textContent).toContain('Install');
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with route-driven bundled markdown', () => {
    describe('WHEN: navigating between docs routes', () => {
      it('THEN: it renders the next route markdown content', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        await harness.navigateByUrl('/docs/state', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.docs-markdown')?.textContent).toContain(
          'NatTableUserState contains the serializable view state'
        );
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with bundled markdown content', () => {
    describe('WHEN: returning to a docs route', () => {
      it('THEN: it renders the route content again without a markdown request dependency', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        await harness.navigateByUrl('/docs/state', DocsPage);
        await waitForDocsRender(harness.fixture);

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.docs-markdown')?.textContent).toContain('Start with NatTable inside NatTableSurface.');
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with fenced code markdown', () => {
    describe('WHEN: runs Prism syntax highlighting for fenced code blocks', () => {
      it('THEN: it applies highlighted code markup', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(highlightCalls).toBeGreaterThan(0);
        expect(compiled.querySelector('.docs-markdown .token.keyword')?.textContent).toBe('readonly');
      });
    });
  });

  describe('GIVEN: a markdown code block has already been highlighted', () => {
    describe('WHEN: markdown decoration runs again', () => {
      it('THEN: it does not highlight the same code block twice', () => {
        const container = document.createElement('div');

        container.innerHTML = '<div class="docs-markdown"><pre><code class="language-ts">readonly rows = [];</code></pre></div>';

        highlightMarkdownCode(container);
        highlightMarkdownCode(container);

        expect(highlightCalls).toBe(1);
        expect(container.querySelectorAll('.token .token')).toHaveLength(0);
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with table of contents links', () => {
    describe('WHEN: keeps table of contents links on the current docs route', () => {
      it('THEN: it rewrites table of contents links locally', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/state', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const firstTocLink = queryRequiredElement<HTMLAnchorElement>(compiled, '.docs-topic-toc-link');

        expect(firstTocLink.getAttribute('href')).toBe('/docs/state#state-slices');

        firstTocLink.click();
        await waitForDocsRender(harness.fixture);

        expect(TestBed.inject(Router).url).toBe('/docs/state#state-slices');
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with a routed heading fragment', () => {
    describe('WHEN: scrolls to the current fragment after markdown heading ids are generated', () => {
      it('THEN: it scrolls to the generated heading id', async () => {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
          configurable: true,
          value: () => undefined
        });

        const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => undefined);
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/state#manual-data-handling', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const manualDataHeading = queryRequiredElement<HTMLElement>(compiled, '#manual-data-handling');

        expect(TestBed.inject(Router).url).toBe('/docs/state#manual-data-handling');
        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
        expect(scrollIntoView.mock.contexts.at(0)).toBe(manualDataHeading);
      });
    });
  });

  describe('GIVEN: the docs page host is rendered with generated code copy buttons', () => {
    describe('WHEN: copies fenced code block text from the generated copy button', () => {
      it('THEN: it writes code text to the clipboard', async () => {
        const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
        const harness = await RouterTestingHarness.create();

        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText }
        });
        shouldRestoreClipboard = true;

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        await waitForDocsRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const codeBlock = queryRequiredElement<HTMLElement>(compiled, 'pre.docs-code-block');
        const codeScroller = queryRequiredElement<HTMLElement>(codeBlock, '.docs-code-scroll');
        const copyButton = queryRequiredElement<HTMLButtonElement>(compiled, '.docs-code-copy');

        expect(copyButton.parentElement).toBe(codeBlock);
        expect(codeScroller.parentElement).toBe(codeBlock);
        expect(queryRequiredElement<HTMLElement>(codeScroller, 'code').textContent).toContain('npm install ng-advanced-table');
        expect(queryRequiredElement<SVGElement>(copyButton, '.docs-code-copy-icon--copy')).toBeTruthy();
        expect(queryRequiredElement<SVGElement>(copyButton, '.docs-code-copy-icon--check')).toBeTruthy();
        expect(copyButton.getAttribute('aria-label')).toBe('Copy code block');
        expect(copyButton.title).toBe('Copy code block');

        copyButton.click();
        await Promise.resolve();
        await Promise.resolve();

        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('npm install ng-advanced-table'));
        expect(copyButton.classList.contains('is-copied')).toBe(true);
        expect(copyButton.getAttribute('aria-label')).toBe('Copied code block');
        expect(copyButton.title).toBe('Copied code block');
      });
    });
  });
});
