import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { DocsPage } from './docs-page';

async function waitForMarkdownRender(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }): Promise<void> {
  await fixture.whenStable();
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
  fixture.detectChanges();
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
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMarkdown({
          loader: HttpClient,
          markedOptions: {
            provide: MARKED_OPTIONS,
            useValue: {
              gfm: true,
              breaks: false,
              pedantic: false
            }
          }
        }),
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

    TestBed.inject(HttpTestingController).verify();
    delete (globalThis as PrismTestGlobal).Prism;
    vi.restoreAllMocks();
  });

  describe('GIVEN: renders the selected markdown asset', () => {
    describe('WHEN: renders the selected markdown asset', () => {
      it('THEN: it renders the selected markdown asset', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('# Quick start\n\nLoaded **markdown** docs.');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.docs-markdown')?.textContent).toContain('Loaded markdown docs.');
        expect(compiled.querySelector('h1')?.textContent).toContain('Quick start');
      });
    });
  });

  describe('GIVEN: updates the markdown source when navigating between docs routes', () => {
    describe('WHEN: updates the markdown source when navigating between docs routes', () => {
      it('THEN: it updates the markdown source when navigating between docs routes', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('# Quick start');
        await waitForMarkdownRender(harness.fixture);

        await harness.navigateByUrl('/docs/state', DocsPage);
        http.expectOne('/docs/state.md').flush('# State');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('h1')?.textContent).toContain('State');
      });
    });
  });

  describe('GIVEN: reuses cached markdown when returning to a docs route', () => {
    describe('WHEN: reuses cached markdown when returning to a docs route', () => {
      it('THEN: it reuses cached markdown when returning to a docs route', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('# Quick start\n\nCached docs.');
        await waitForMarkdownRender(harness.fixture);

        await harness.navigateByUrl('/docs/state', DocsPage);
        http.expectOne('/docs/state.md').flush('# State');
        await waitForMarkdownRender(harness.fixture);

        await harness.navigateByUrl('/docs/quick-start', DocsPage);
        http.expectNone('/docs/quick-start.md');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('h1')?.textContent).toContain('Quick start');
        expect(compiled.querySelector('.docs-markdown')?.textContent).toContain('Cached docs.');
      });
    });
  });

  describe('GIVEN: renders an error message when markdown cannot be loaded', () => {
    describe('WHEN: renders an error message when markdown cannot be loaded', () => {
      it('THEN: it renders an error message when markdown cannot be loaded', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('Not found', { status: 404, statusText: 'Not Found' });
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const error = compiled.querySelector('.docs-error');

        expect(error?.getAttribute('role')).toBe('alert');
        expect(error?.textContent).toContain('Documentation could not be loaded.');
      });
    });
  });

  describe('GIVEN: runs Prism syntax highlighting for fenced code blocks', () => {
    describe('WHEN: runs Prism syntax highlighting for fenced code blocks', () => {
      it('THEN: it runs Prism syntax highlighting for fenced code blocks', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/quick-start', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('```ts\nreadonly rows = [];\n```');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;

        expect(highlightCalls).toBeGreaterThan(0);
        expect(compiled.querySelector('.docs-markdown .token.keyword')?.textContent).toBe('readonly');
      });
    });
  });

  describe('GIVEN: keeps table of contents links on the current docs route', () => {
    describe('WHEN: keeps table of contents links on the current docs route', () => {
      it('THEN: it keeps table of contents links on the current docs route', async () => {
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/state', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/state.md').flush('## State Slices\n\n## Own One Slice\n\n## Manual Data Handling');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const firstTocLink = queryRequiredElement<HTMLAnchorElement>(compiled, '.docs-topic-toc-link');

        expect(firstTocLink.getAttribute('href')).toBe('/docs/state#state-slices');

        firstTocLink.click();
        await waitForMarkdownRender(harness.fixture);

        expect(TestBed.inject(Router).url).toBe('/docs/state#state-slices');
      });
    });
  });

  describe('GIVEN: scrolls to the current fragment after markdown heading ids are generated', () => {
    describe('WHEN: scrolls to the current fragment after markdown heading ids are generated', () => {
      it('THEN: it scrolls to the current fragment after markdown heading ids are generated', async () => {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
          configurable: true,
          value: () => undefined
        });

        const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => undefined);
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/docs/state#manual-data-handling', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/state.md').flush('## State Slices\n\n## Own One Slice\n\n## Manual Data Handling');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const manualDataHeading = queryRequiredElement<HTMLElement>(compiled, '#manual-data-handling');

        expect(TestBed.inject(Router).url).toBe('/docs/state#manual-data-handling');
        expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
        expect(scrollIntoView.mock.contexts.at(0)).toBe(manualDataHeading);
      });
    });
  });

  describe('GIVEN: copies fenced code block text from the generated copy button', () => {
    describe('WHEN: copies fenced code block text from the generated copy button', () => {
      it('THEN: it copies fenced code block text from the generated copy button', async () => {
        const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
        const harness = await RouterTestingHarness.create();

        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText }
        });
        shouldRestoreClipboard = true;

        await harness.navigateByUrl('/docs/quick-start', DocsPage);

        const http = TestBed.inject(HttpTestingController);

        http.expectOne('/docs/quick-start.md').flush('```ts\nreadonly rows = [];\n```');
        await waitForMarkdownRender(harness.fixture);

        const compiled = harness.fixture.nativeElement as HTMLElement;
        const codeBlock = queryRequiredElement<HTMLElement>(compiled, 'pre.docs-code-block');
        const codeScroller = queryRequiredElement<HTMLElement>(codeBlock, '.docs-code-scroll');
        const copyButton = queryRequiredElement<HTMLButtonElement>(compiled, '.docs-code-copy');

        expect(copyButton.parentElement).toBe(codeBlock);
        expect(codeScroller.parentElement).toBe(codeBlock);
        expect(queryRequiredElement<HTMLElement>(codeScroller, 'code').textContent).toBe('readonly rows = [];');
        expect(queryRequiredElement<SVGElement>(copyButton, '.docs-code-copy-icon--copy')).toBeTruthy();
        expect(queryRequiredElement<SVGElement>(copyButton, '.docs-code-copy-icon--check')).toBeTruthy();
        expect(copyButton.getAttribute('aria-label')).toBe('Copy code block');
        expect(copyButton.title).toBe('Copy code block');

        copyButton.click();
        await Promise.resolve();
        await Promise.resolve();

        expect(writeText).toHaveBeenCalledWith('readonly rows = [];');
        expect(copyButton.classList.contains('is-copied')).toBe(true);
        expect(copyButton.getAttribute('aria-label')).toBe('Copied code block');
        expect(copyButton.title).toBe('Copied code block');
      });
    });
  });
});
