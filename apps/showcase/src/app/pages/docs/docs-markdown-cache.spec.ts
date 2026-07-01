import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DocsMarkdownCache, getDocsHtmlTransferStateKey } from './docs-markdown-cache';

async function waitForRenderedMarkdown(): Promise<void> {
  await Promise.resolve();
}

describe('FEATURE: DocsMarkdownCache', () => {
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

  describe('GIVEN: a docs markdown cache is created', () => {
    describe('WHEN: loads markdown and exposes the cached content synchronously', () => {
      it('THEN: it stores loaded markdown for synchronous reads', async () => {
        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'idle',
          html: ''
        });

        cache.load('/docs/quick-start.md');

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loading',
          html: ''
        });

        http.expectOne('/docs/quick-start.md').flush('# Quick start\n\nLoaded **markdown** docs.');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<h1 id="quick-start">Quick start</h1>\n<p>Loaded <strong>markdown</strong> docs.</p>\n'
        });
      });
    });
  });

  describe('GIVEN: a docs markdown cache receives headings', () => {
    describe('WHEN: it renders markdown to HTML', () => {
      it('THEN: it adds deterministic heading ids during rendering', async () => {
        cache.load('/docs/quick-start.md');

        http.expectOne('/docs/quick-start.md').flush('## First Table\n\n## First Table');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<h2 id="first-table">First Table</h2>\n<h2 id="first-table-2">First Table</h2>\n'
        });
      });
    });
  });

  describe('GIVEN: a docs markdown cache receives raw markdown HTML', () => {
    describe('WHEN: it renders markdown to trusted HTML', () => {
      it('THEN: it escapes raw HTML before exposing the rendered output', async () => {
        cache.load('/docs/quick-start.md');

        http.expectOne('/docs/quick-start.md').flush('Press <kbd>Shift</kbd> to extend sorting.');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<p>Press &lt;kbd&gt;Shift&lt;/kbd&gt; to extend sorting.</p>\n'
        });
      });
    });
  });

  describe('GIVEN: a docs markdown cache receives markdown links', () => {
    describe('WHEN: it renders links before trusting HTML', () => {
      it('THEN: it keeps safe links and removes unsafe link targets', async () => {
        cache.load('/docs/quick-start.md');

        http.expectOne('/docs/quick-start.md').flush('Read [state](/docs/state) and [unsafe](javascript:alert(1)).');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<p>Read <a href="/docs/state">state</a> and unsafe.</p>\n'
        });
      });
    });
  });

  describe('GIVEN: a server-rendered docs HTML entry exists in transfer state', () => {
    describe('WHEN: loading the matching markdown path on the browser', () => {
      it('THEN: it uses the transferred HTML without requesting markdown again', () => {
        TestBed.inject(TransferState).set(
          getDocsHtmlTransferStateKey('/docs/quick-start.md'),
          '<h1 id="quick-start">Quick start</h1>\n'
        );

        cache.load('/docs/quick-start.md');

        http.expectNone('/docs/quick-start.md');
        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<h1 id="quick-start">Quick start</h1>\n'
        });
      });
    });
  });

  describe('GIVEN: a docs markdown cache is created with duplicate markdown requests', () => {
    describe('WHEN: dedupes loading and loaded markdown requests', () => {
      it('THEN: it shares one request for repeated markdown loads', async () => {
        cache.load('/docs/quick-start.md');
        cache.load('/docs/quick-start.md');

        const req = http.expectOne('/docs/quick-start.md');

        expect(req.request.method).toBe('GET');
        req.flush('# Quick start');
        await waitForRenderedMarkdown();

        cache.load('/docs/quick-start.md');
        http.expectNone('/docs/quick-start.md');
        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<h1 id="quick-start">Quick start</h1>\n'
        });
      });
    });
  });

  describe('GIVEN: a docs markdown cache is created with uncached markdown paths', () => {
    describe('WHEN: preloads each uncached markdown path', () => {
      it('THEN: it starts loading only uncached markdown paths', async () => {
        cache.preload(['/docs/quick-start.md', '/docs/state.md']);

        http.expectOne('/docs/quick-start.md').flush('# Quick start');
        http.expectOne('/docs/state.md').flush('# State');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md').status).toBe('loaded');
        expect(cache.getState('/docs/state.md').status).toBe('loaded');
      });
    });
  });

  describe('GIVEN: a docs markdown cache is created with a recoverable markdown load failure', () => {
    describe('WHEN: records load failures and allows a later retry', () => {
      it('THEN: it stores failures and permits retry loads', async () => {
        cache.load('/docs/quick-start.md');
        http.expectOne('/docs/quick-start.md').flush('Not found', { status: 404, statusText: 'Not Found' });
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md').status).toBe('error');

        cache.load('/docs/quick-start.md');
        http.expectOne('/docs/quick-start.md').flush('# Quick start');
        await waitForRenderedMarkdown();

        expect(cache.getState('/docs/quick-start.md')).toMatchObject({
          status: 'loaded',
          html: '<h1 id="quick-start">Quick start</h1>\n'
        });
      });
    });
  });
});
