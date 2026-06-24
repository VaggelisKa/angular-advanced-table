import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DocsMarkdownCache } from './docs-markdown-cache';

describe('DocsMarkdownCache', () => {
  let cache: DocsMarkdownCache;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    cache = TestBed.inject(DocsMarkdownCache);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads markdown and exposes the cached content synchronously', () => {
    expect(cache.getState('/docs/quick-start.md')).toStrictEqual({
      status: 'idle',
      content: ''
    });

    cache.load('/docs/quick-start.md');

    expect(cache.getState('/docs/quick-start.md')).toStrictEqual({
      status: 'loading',
      content: ''
    });

    http.expectOne('/docs/quick-start.md').flush('# Quick start');

    expect(cache.getState('/docs/quick-start.md')).toStrictEqual({
      status: 'loaded',
      content: '# Quick start'
    });
  });

  it('dedupes loading and loaded markdown requests', () => {
    cache.load('/docs/quick-start.md');
    cache.load('/docs/quick-start.md');

    const req = http.expectOne('/docs/quick-start.md');

    expect(req.request.method).toBe('GET');
    req.flush('# Quick start');

    cache.load('/docs/quick-start.md');
    http.expectNone('/docs/quick-start.md');
    expect(cache.getState('/docs/quick-start.md')).toStrictEqual({
      status: 'loaded',
      content: '# Quick start'
    });
  });

  it('preloads each uncached markdown path', () => {
    cache.preload(['/docs/quick-start.md', '/docs/state.md']);

    http.expectOne('/docs/quick-start.md').flush('# Quick start');
    http.expectOne('/docs/state.md').flush('# State');

    expect(cache.getState('/docs/quick-start.md').status).toBe('loaded');
    expect(cache.getState('/docs/state.md').status).toBe('loaded');
  });

  it('records load failures and allows a later retry', () => {
    cache.load('/docs/quick-start.md');
    http.expectOne('/docs/quick-start.md').flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(cache.getState('/docs/quick-start.md').status).toBe('error');

    cache.load('/docs/quick-start.md');
    http.expectOne('/docs/quick-start.md').flush('# Quick start');

    expect(cache.getState('/docs/quick-start.md')).toStrictEqual({
      status: 'loaded',
      content: '# Quick start'
    });
  });
});
