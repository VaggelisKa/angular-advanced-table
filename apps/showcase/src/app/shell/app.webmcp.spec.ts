import { createShowcaseWebMcpTools } from './app.webmcp-tools';

type ShowcaseWebMcpTool = ReturnType<typeof createShowcaseWebMcpTools>[number];

const getTool = (tools: readonly ShowcaseWebMcpTool[], name: string): ShowcaseWebMcpTool => {
  const tool = tools.find((item) => item.name === name);

  if (!tool) {
    throw new Error(`Missing WebMCP tool: ${name}`);
  }

  return tool;
};

const expectRecord = (value: unknown): Record<string, unknown> => {
  expect(value).toStrictEqual(expect.any(Object));

  return value as Record<string, unknown>;
};

describe('FEATURE: Showcase WebMCP tools', () => {
  let navigateByUrl: (url: string) => Promise<boolean>;
  let navigatedUrls: string[];
  let tools: readonly ShowcaseWebMcpTool[];

  beforeEach(() => {
    globalThis.history.replaceState(null, '', '/docs/quick-start');
    document.title = 'Quick start | Angular Advanced Table Docs';
    document.body.innerHTML = '<main><h1>Quick start</h1></main>';
    navigatedUrls = [];
    navigateByUrl = async (url: string): Promise<boolean> => {
      navigatedUrls.push(url);
      await Promise.resolve();

      return true;
    };
    tools = createShowcaseWebMcpTools({ document, navigateByUrl });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('GIVEN: agents inspect the page tools', () => {
    describe('WHEN: create tool definitions for the showcase', () => {
      it('THEN: it exposes named WebMCP tools with schemas and execute callbacks', () => {
        expect(tools.map((tool) => tool.name)).toStrictEqual([
          'angular_advanced_table.get_current_page',
          'angular_advanced_table.search_showcase',
          'angular_advanced_table.navigate'
        ]);

        for (const tool of tools) {
          expect(tool.description).toStrictEqual(expect.any(String));
          expect(tool.inputSchema).toStrictEqual(expect.objectContaining({ type: 'object' }));
          expect(tool.execute).toStrictEqual(expect.any(Function));
        }
      });
    });
  });

  describe('GIVEN: an agent needs page context', () => {
    describe('WHEN: it calls the current page tool', () => {
      it('THEN: it returns the active route and heading metadata', async () => {
        const result = expectRecord(await getTool(tools, 'angular_advanced_table.get_current_page').execute({}));

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

        const rootResult = expectRecord(await getTool(tools, 'angular_advanced_table.get_current_page').execute({}));

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
        const result = expectRecord(
          await getTool(tools, 'angular_advanced_table.search_showcase').execute({
            query: 'sorting',
            kind: 'docs',
            limit: 3
          })
        );
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
        const result = expectRecord(
          await getTool(tools, 'angular_advanced_table.navigate').execute({
            path: '/docs/sorting'
          })
        );

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
