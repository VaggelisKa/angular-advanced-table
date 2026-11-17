import { EnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import type { WebMcpClient } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { provideShowcaseWebMcpTools, showcaseWebMcpTools } from './tools';

type ShowcaseWebMcpTool = (typeof showcaseWebMcpTools)[number];

type RegisteredTool = {
  readonly name: string;
  readonly execute: (args: Record<string, unknown>, client: WebMcpClient) => unknown;
};

type ModelContextDocument = Document & {
  modelContext?: {
    readonly registerTool: (tool: RegisteredTool, options: { readonly signal: AbortSignal }) => Promise<void>;
  };
};

const getTool = (name: string): ShowcaseWebMcpTool => {
  const tool = showcaseWebMcpTools.find((item) => item.name === name);

  if (!tool) {
    throw new Error(`Missing WebMCP tool: ${name}`);
  }

  return tool;
};

const expectRecord = (value: unknown): Record<string, unknown> => {
  expect(value).toStrictEqual(expect.any(Object));

  return value as Record<string, unknown>;
};

const createClient = (): WebMcpClient => ({ signal: new AbortController().signal });

describe('FEATURE: Showcase WebMCP tools', () => {
  let navigatedUrls: string[];

  /* Tool callbacks resolve their dependencies with `inject()`, which Angular
     makes available by running them in the providing injector's context. */
  const executeTool = async (name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> =>
    expectRecord(
      await TestBed.runInInjectionContext(() => (getTool(name).execute as RegisteredTool['execute'])(args, createClient()))
    );

  beforeEach(() => {
    globalThis.history.replaceState(null, '', '/docs/quick-start');
    document.title = 'Quick start | Angular Advanced Table Docs';
    document.body.innerHTML = '<main><h1>Quick start</h1></main>';
    navigatedUrls = [];

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Router,
          useValue: {
            navigateByUrl: async (url: string): Promise<boolean> => {
              navigatedUrls.push(url);
              await Promise.resolve();

              return true;
            }
          }
        }
      ]
    });
  });

  afterEach(() => {
    delete (document as ModelContextDocument).modelContext;
    document.body.innerHTML = '';
  });

  describe('GIVEN: agents inspect the page tools', () => {
    describe('WHEN: create tool definitions for the showcase', () => {
      it('THEN: it exposes named WebMCP tools with schemas and execute callbacks', () => {
        expect(showcaseWebMcpTools.map((tool) => tool.name)).toStrictEqual([
          'angular_advanced_table.get_current_page',
          'angular_advanced_table.search_showcase',
          'angular_advanced_table.navigate'
        ]);

        for (const tool of showcaseWebMcpTools) {
          expect(tool.description).toStrictEqual(expect.any(String));
          expect(tool.inputSchema).toStrictEqual(expect.objectContaining({ type: 'object' }));
          expect(tool.execute).toStrictEqual(expect.any(Function));
        }
      });
    });
  });

  describe('GIVEN: the browser exposes a WebMCP model context', () => {
    describe('WHEN: the app provides the showcase tools', () => {
      it('THEN: it registers every tool through Angular and unregisters them on destroy', async () => {
        const registered: { tool: RegisteredTool; signal: AbortSignal }[] = [];

        (document as ModelContextDocument).modelContext = {
          registerTool: async (tool, { signal }): Promise<void> => {
            registered.push({ tool, signal });
            await Promise.resolve();
          }
        };
        TestBed.configureTestingModule({ providers: [provideShowcaseWebMcpTools()] });
        TestBed.inject(EnvironmentInjector);

        expect(registered.map(({ tool }) => tool.name)).toStrictEqual(showcaseWebMcpTools.map((tool) => tool.name));

        const navigateTool = registered.find(({ tool }) => tool.name === 'angular_advanced_table.navigate')?.tool;
        const result = expectRecord(await navigateTool?.execute({ path: '/docs/sorting' }, createClient()));

        expect(result['ok']).toBe(true);
        expect(navigatedUrls).toStrictEqual(['/docs/sorting']);
        expect(registered.every(({ signal }) => !signal.aborted)).toBe(true);

        TestBed.resetTestingModule();

        expect(registered.every(({ signal }) => signal.aborted)).toBe(true);
      });
    });
  });

  describe('GIVEN: an agent needs page context', () => {
    describe('WHEN: it calls the current page tool', () => {
      it('THEN: it returns the active route and heading metadata', async () => {
        const result = await executeTool('angular_advanced_table.get_current_page', {});

        expect(result['path']).toBe('/docs/quick-start');
        expect(result['title']).toBe('Quick start | Angular Advanced Table Docs');
        expect(result['heading']).toBe('Quick start');
        expect(result['route']).toStrictEqual(
          expect.objectContaining({
            id: 'quick-start',
            path: '/docs/quick-start'
          })
        );

        globalThis.history.replaceState(null, '', '/');

        const rootResult = await executeTool('angular_advanced_table.get_current_page', {});

        expect(rootResult['route']).toStrictEqual(
          expect.objectContaining({
            id: 'quick-start',
            path: '/docs/quick-start'
          })
        );
      });
    });
  });

  describe('GIVEN: an agent searches showcase content', () => {
    describe('WHEN: it queries documentation routes', () => {
      it('THEN: it returns matching route metadata', async () => {
        const result = await executeTool('angular_advanced_table.search_showcase', {
          query: 'sorting',
          kind: 'docs',
          limit: 3
        });
        const results = result['results'] as readonly Record<string, unknown>[];

        expect(result['count']).toBeGreaterThan(0);
        expect(results[0]).toStrictEqual(
          expect.objectContaining({
            id: 'sorting',
            path: '/docs/sorting'
          })
        );
      });
    });
  });

  describe('GIVEN: an agent navigates the showcase', () => {
    describe('WHEN: it calls the navigate tool with a known route', () => {
      it('THEN: it delegates to the Angular router and returns the target route', async () => {
        const result = await executeTool('angular_advanced_table.navigate', {
          path: '/docs/sorting'
        });

        expect(navigatedUrls).toStrictEqual(['/docs/sorting']);
        expect(result['ok']).toBe(true);
        expect(result['route']).toStrictEqual(
          expect.objectContaining({
            id: 'sorting',
            path: '/docs/sorting'
          })
        );
      });
    });
  });
});
