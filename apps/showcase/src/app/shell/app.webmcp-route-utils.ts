import type { JsonSchema, WebMcpToolInput, WebMcpToolResult } from './app.webmcp-types';
import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors
} from './routing/app.route-paths';
import type { ShowcaseRouteDescriptor } from './routing/app.route-paths';

export const SITE_ORIGIN = 'https://angular-advanced-table.vercel.app';

export const DEFAULT_SEARCH_LIMIT = 5;

export const MAX_SEARCH_LIMIT = 10;

export const ROUTE_DESCRIPTORS = [...showcaseDocRouteDescriptors, ...showcaseExampleRouteDescriptors];

export const ROUTE_PATHS = ROUTE_DESCRIPTORS.map((route) => `/${route.path}`);

export const CURRENT_PAGE_INPUT_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: false
} satisfies JsonSchema;

export const SEARCH_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      minLength: 1,
      description: 'Search text to match against showcase documentation and example titles, descriptions, ids, and paths.'
    },
    kind: {
      type: 'string',
      enum: ['all', 'docs', 'examples'],
      default: 'all',
      description: 'Limit results to documentation, examples, or both.'
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: MAX_SEARCH_LIMIT,
      default: DEFAULT_SEARCH_LIMIT,
      description: 'Maximum number of matching routes to return.'
    }
  },
  required: ['query'],
  additionalProperties: false
} satisfies JsonSchema;

export const NAVIGATE_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    path: {
      type: 'string',
      enum: ROUTE_PATHS,
      description: 'A valid showcase route path to navigate to.'
    }
  },
  required: ['path'],
  additionalProperties: false
} satisfies JsonSchema;

export const readStringInput = (input: WebMcpToolInput, key: string): string | undefined => {
  const value = input[key];

  return typeof value === 'string' ? value.trim() : undefined;
};

export const readSearchKind = (input: WebMcpToolInput): 'all' | 'docs' | 'examples' => {
  const kind = readStringInput(input, 'kind');

  return kind === 'docs' || kind === 'examples' ? kind : 'all';
};

export const readSearchLimit = (input: WebMcpToolInput): number => {
  const value = input['limit'];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(MAX_SEARCH_LIMIT, Math.max(1, Math.trunc(value)));
};

export const normalizeRoutePath = (value: string): string => {
  const url = new URL(value, `${SITE_ORIGIN}/`);

  return url.pathname.replace(/^\/+|\/+$/gu, '');
};

export const createRouteUrl = (document: Document, route: ShowcaseRouteDescriptor): string => {
  const origin = document.location.origin !== 'null' ? document.location.origin : SITE_ORIGIN;

  return new URL(route.path, `${origin}/`).toString();
};

const canonicalizeRoutePath = (path: string): string => {
  if (path === '' || path === SHOWCASE_DOCS_INDEX_ROUTE_PATH) {
    return SHOWCASE_DEFAULT_ROUTE_PATH;
  }

  return path === SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH ? SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH : path;
};

export const findRouteDescriptor = (path: string): ShowcaseRouteDescriptor | undefined => {
  const canonicalPath = canonicalizeRoutePath(path);

  return ROUTE_DESCRIPTORS.find((route) => route.path === canonicalPath);
};

export const toRouteResult = (document: Document, route: ShowcaseRouteDescriptor): WebMcpToolResult => ({
  id: route.id,
  path: `/${route.path}`,
  title: route.title,
  description: route.description,
  url: createRouteUrl(document, route)
});

export const getCurrentHeading = (document: Document): string | null => {
  const heading = document.querySelector('h1')?.textContent.replace(/\s+/gu, ' ').trim();

  return heading && heading.length > 0 ? heading : null;
};

export const getSearchScore = (route: ShowcaseRouteDescriptor, normalizedQuery: string): number => {
  const title = route.title.toLowerCase();
  const description = route.description.toLowerCase();
  const id = route.id.toLowerCase();
  const path = route.path.toLowerCase();

  return (
    (title.includes(normalizedQuery) ? 8 : 0) +
    (description.includes(normalizedQuery) ? 4 : 0) +
    (id.includes(normalizedQuery) ? 3 : 0) +
    (path.includes(normalizedQuery) ? 2 : 0)
  );
};

export const matchesSearchKind = (route: ShowcaseRouteDescriptor, kind: 'all' | 'docs' | 'examples'): boolean => {
  return kind === 'all' || route.path.startsWith(`${kind}/`);
};
