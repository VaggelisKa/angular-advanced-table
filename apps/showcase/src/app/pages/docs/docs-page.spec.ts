import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';

import { DocsPage } from './docs-page';

type PrismTestGlobal = typeof globalThis & {
  Prism?: {
    highlightAllUnder(element: Element | Document): void;
  };
};

@Component({
  selector: 'app-test-empty-route',
  template: '',
})
class TestEmptyRoute {}

describe('DocsPage', () => {
  let highlightCalls = 0;

  beforeEach(async () => {
    highlightCalls = 0;
    (globalThis as PrismTestGlobal).Prism = {
      highlightAllUnder: (element) => {
        highlightCalls += 1;
        const code = element.querySelector('code.language-typescript, code.language-ts');

        if (code) {
          code.innerHTML = '<span class="token keyword">readonly</span> rows = [];';
        }
      },
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
              pedantic: false,
            },
          },
        }),
        provideRouter([
          {
            path: '',
            component: TestEmptyRoute,
          },
          {
            path: 'docs/quick-start',
            component: DocsPage,
            data: { docId: 'quick-start' },
          },
          {
            path: 'docs/state',
            component: DocsPage,
            data: { docId: 'state' },
          },
        ]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    delete (globalThis as PrismTestGlobal).Prism;
  });

  it('renders the selected markdown asset', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/docs/quick-start', DocsPage);

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/docs/quick-start.md').flush('# Quick start\n\nLoaded **markdown** docs.');
    await waitForMarkdownRender(harness.fixture);

    const compiled = harness.fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.docs-markdown')?.textContent).toContain(
      'Loaded markdown docs.',
    );
    expect(compiled.querySelector('h1')?.textContent).toContain('Quick start');
  });

  it('updates the markdown source when navigating between docs routes', async () => {
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

  it('runs Prism syntax highlighting for fenced code blocks', async () => {
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

async function waitForMarkdownRender(fixture: { whenStable(): Promise<unknown> }): Promise<void> {
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve));
  await fixture.whenStable();
}
