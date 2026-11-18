import type { JsonSchema, WebMcpToolInput, WebMcpToolResult } from './types';
import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors
} from '../shell/routing/app.route-paths';
import type { ShowcaseRouteDescriptor } from '../shell/routing/app.route-paths';

export const SITE_ORIGIN = 'https://angular-advanced-table.vercel.app';

export const DEFAULT_SEARCH_LIMIT = 5;

export const MAX_SEARCH_LIMIT = 10;

/* Bounds agent-supplied search text; the schema advertises it, and the
   reader enforces it because browsers do not validate tool arguments. */
export const MAX_SEARCH_QUERY_LENGTH = 200;

const MAX_SEARCH_TERMS = 8;

/* Every route title carries the site name, so scoring it would make generic
   queries such as "table" match every route equally. */
const SITE_TITLE_SUFFIX = / \| Angular Advanced Table(?: Docs)?$/u;

export const ROUTE_DESCRIPTORS = [...showcaseDocRouteDescriptors, ...showcaseExampleRouteDescriptors];

export const ROUTE_PATHS = ROUTE_DESCRIPTORS.map((route) => `/${route.path}`);

export const CURRENT_PAGE_INPUT_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: false
} as const satisfies JsonSchema;

export const SEARCH_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      minLength: 1,
      maxLength: MAX_SEARCH_QUERY_LENGTH,
      description:
        'Search text to match against showcase documentation and example titles, descriptions, ids, and paths. Multiple words are matched individually.'
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
} as const satisfies JsonSchema;

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
} as const satisfies JsonSchema;

export const readStringInput = (input: WebMcpToolInput, key: string): string | undefined => {
  const value = input[key];

  return typeof value === 'string' ? value.trim() : undefined;
};

export const readSearchQuery = (input: WebMcpToolInput): string | undefined =>
  readStringInput(input, 'query')?.slice(0, MAX_SEARCH_QUERY_LENGTH);

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

/**
 * Resolves a site-relative path (or a same-site absolute URL) to a route path
 * without leading or trailing slashes. Returns `undefined` for malformed
 * input and for URLs on another origin, so a foreign URL is never silently
 * reinterpreted as a local route.
 */
export const normalizeRoutePath = (value: string, origin: string = SITE_ORIGIN): string | undefined => {
  let url: URL;

  /* try/catch rather than `URL.canParse`, which Safari 16.5 lacks. */
  try {
    url = new URL(value, `${origin}/`);
  } catch {
    return undefined;
  }

  return url.origin === new URL(origin).origin ? url.pathname.replace(/^\/+|\/+$/gu, '') : undefined;
};

export const getDocumentOrigin = (document: Document): string =>
  document.location.origin !== 'null' ? document.location.origin : SITE_ORIGIN;

export const createRouteUrl = (document: Document, route: ShowcaseRouteDescriptor): string => {
  return new URL(route.path, `${getDocumentOrigin(document)}/`).toString();
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

export const toSearchTerms = (query: string): readonly string[] =>
  [
    ...new Set(
      query
        .toLowerCase()
        .split(/\s+/u)
        .filter((term) => term.length > 0)
    )
  ].slice(0, MAX_SEARCH_TERMS);

const getTermScore = (route: ShowcaseRouteDescriptor, term: string): number => {
  const title = route.title.replace(SITE_TITLE_SUFFIX, '').toLowerCase();
  const description = route.description.toLowerCase();
  const id = route.id.toLowerCase();
  const path = route.path.toLowerCase();

  return (
    (title.includes(term) ? 8 : 0) + (description.includes(term) ? 4 : 0) + (id.includes(term) ? 3 : 0) + (path.includes(term) ? 2 : 0)
  );
};

/** Sums per-term scores, so routes matching more of the query's words rank first. */
export const getSearchScore = (route: ShowcaseRouteDescriptor, terms: readonly string[]): number =>
  terms.reduce((score, term) => score + getTermScore(route, term), 0);

export const matchesSearchKind = (route: ShowcaseRouteDescriptor, kind: 'all' | 'docs' | 'examples'): boolean => {
  return kind === 'all' || route.path.startsWith(`${kind}/`);
};
