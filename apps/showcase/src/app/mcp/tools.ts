import {
  CURRENT_PAGE_INPUT_SCHEMA,
  NAVIGATE_INPUT_SCHEMA,
  ROUTE_DESCRIPTORS,
  ROUTE_PATHS,
  SEARCH_INPUT_SCHEMA,
  findRouteDescriptor,
  getCurrentHeading,
  getSearchScore,
  matchesSearchKind,
  normalizeRoutePath,
  readSearchKind,
  readSearchLimit,
  readStringInput,
  toRouteResult
} from './route-utils';
import type { WebMcpTool, WebMcpToolInput, WebMcpToolResult } from './types';

type ShowcaseWebMcpToolDependencies = {
  readonly document: Document;
  readonly navigateByUrl: (url: string) => Promise<boolean>;
};

const createEmptySearchResult = (): WebMcpToolResult => ({
  query: '',
  count: 0,
  results: [],
  error: 'Provide a non-empty query string.'
});

const createInvalidNavigationResult = (error: string, requestedPath: string | undefined): WebMcpToolResult => ({
  ok: false,
  error,
  requestedPath,
  availablePaths: ROUTE_PATHS
});

const searchRoutes = (
  document: Document,
  query: string,
  kind: 'all' | 'docs' | 'examples',
  limit: number
): readonly WebMcpToolResult[] => {
  const normalizedQuery = query.toLowerCase();

  return ROUTE_DESCRIPTORS.map((route) => ({
    route,
    score: matchesSearchKind(route, kind) ? getSearchScore(route, normalizedQuery) : 0
  }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.route.title.localeCompare(right.route.title))
    .slice(0, limit)
    .map((match) => toRouteResult(document, match.route));
};

const createCurrentPageTool = (document: Document): WebMcpTool => ({
  name: 'angular_advanced_table.get_current_page',
  title: 'Get current page',
  description: 'Return the current Angular Advanced Table showcase page URL, title, heading, and matching route metadata.',
  inputSchema: CURRENT_PAGE_INPUT_SCHEMA,
  annotations: {
    readOnlyHint: true
  },
  execute: (): WebMcpToolResult => {
    const path = normalizeRoutePath(document.location.pathname);
    const route = findRouteDescriptor(path);

    return {
      url: document.location.href,
      path: `/${path}`,
      title: document.title,
      heading: getCurrentHeading(document),
      route: route ? toRouteResult(document, route) : null
    };
  }
});

const createSearchTool = (document: Document): WebMcpTool => ({
  name: 'angular_advanced_table.search_showcase',
  title: 'Search showcase',
  description: 'Search the Angular Advanced Table documentation and examples by title, description, id, and route path.',
  inputSchema: SEARCH_INPUT_SCHEMA,
  annotations: {
    readOnlyHint: true
  },
  execute: (input: WebMcpToolInput): WebMcpToolResult => {
    const query = readStringInput(input, 'query');

    if (!query) {
      return createEmptySearchResult();
    }

    const kind = readSearchKind(input);
    const results = searchRoutes(document, query, kind, readSearchLimit(input));

    return {
      query,
      kind,
      count: results.length,
      results
    };
  }
});

const createNavigateTool = ({ document, navigateByUrl }: ShowcaseWebMcpToolDependencies): WebMcpTool => ({
  name: 'angular_advanced_table.navigate',
  title: 'Navigate showcase',
  description: 'Navigate the browser to a known Angular Advanced Table documentation or example route.',
  inputSchema: NAVIGATE_INPUT_SCHEMA,
  execute: async (input: WebMcpToolInput): Promise<WebMcpToolResult> => {
    const rawPath = readStringInput(input, 'path');

    if (!rawPath) {
      return createInvalidNavigationResult('Provide a route path.', undefined);
    }

    const routePath = normalizeRoutePath(rawPath);
    const route = findRouteDescriptor(routePath);

    if (!route) {
      return createInvalidNavigationResult('Unknown showcase route path.', rawPath);
    }

    return {
      ok: await navigateByUrl(`/${route.path}`),
      route: toRouteResult(document, route)
    };
  }
});

export const createShowcaseWebMcpTools = (dependencies: ShowcaseWebMcpToolDependencies): readonly WebMcpTool[] => [
  createCurrentPageTool(dependencies.document),
  createSearchTool(dependencies.document),
  createNavigateTool(dependencies)
];
