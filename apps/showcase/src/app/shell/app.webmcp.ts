import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors
} from './routing/app.route-paths';
import type { ShowcaseRouteDescriptor } from './routing/app.route-paths';

type JsonSchema = {
  readonly [key: string]: unknown;
};

type WebMcpToolInput = Record<string, unknown>;

type WebMcpToolResult = Record<string, unknown>;

type WebMcpTool = {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly inputSchema: JsonSchema;
  readonly execute: (input: WebMcpToolInput) => Promise<WebMcpToolResult> | WebMcpToolResult;
  readonly annotations?: {
    readonly readOnlyHint?: boolean;
    readonly untrustedContentHint?: boolean;
  };
};

type WebMcpRegisterOptions = {
  readonly signal?: AbortSignal;
};

type WebMcpContext = {
  readonly provideContext?: (
    context: { readonly tools: readonly WebMcpTool[] },
    options?: WebMcpRegisterOptions
  ) => Promise<void> | void;
  readonly registerTool?: (tool: WebMcpTool, options?: WebMcpRegisterOptions) => Promise<void> | void;
};

type WebMcpNavigator = Navigator & {
  readonly modelContext?: WebMcpContext;
};

type WebMcpDocument = Document & {
  readonly modelContext?: WebMcpContext;
};

type ShowcaseWebMcpToolDependencies = {
  readonly document: Document;
  readonly navigateByUrl: (url: string) => Promise<boolean>;
};

const SITE_ORIGIN = 'https://angular-advanced-table.vercel.app';
const DEFAULT_SEARCH_LIMIT = 5;
const MAX_SEARCH_LIMIT = 10;
const ROUTE_DESCRIPTORS = [...showcaseDocRouteDescriptors, ...showcaseExampleRouteDescriptors];
const ROUTE_PATHS = ROUTE_DESCRIPTORS.map((route) => `/${route.path}`);

const CURRENT_PAGE_INPUT_SCHEMA = {
  type: 'object',
  properties: {},
  additionalProperties: false
} satisfies JsonSchema;

const SEARCH_INPUT_SCHEMA = {
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

const NAVIGATE_INPUT_SCHEMA = {
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

const readStringInput = (input: WebMcpToolInput, key: string): string | undefined => {
  const value = input[key];

  return typeof value === 'string' ? value.trim() : undefined;
};

const readSearchKind = (input: WebMcpToolInput): 'all' | 'docs' | 'examples' => {
  const kind = readStringInput(input, 'kind');

  return kind === 'docs' || kind === 'examples' ? kind : 'all';
};

const readSearchLimit = (input: WebMcpToolInput): number => {
  const value = input['limit'];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(MAX_SEARCH_LIMIT, Math.max(1, Math.trunc(value)));
};

const normalizeRoutePath = (value: string): string => {
  const url = new URL(value, `${SITE_ORIGIN}/`);

  return url.pathname.replace(/^\/+|\/+$/gu, '');
};

const getDocumentOrigin = (document: Document): string => {
  const origin = document.location?.origin;

  return origin && origin !== 'null' ? origin : SITE_ORIGIN;
};

const createRouteUrl = (document: Document, route: ShowcaseRouteDescriptor): string => {
  return new URL(route.path, `${getDocumentOrigin(document)}/`).toString();
};

const canonicalizeRoutePath = (path: string): string => {
  if (path === '' || path === SHOWCASE_DOCS_INDEX_ROUTE_PATH) {
    return SHOWCASE_DEFAULT_ROUTE_PATH;
  }

  if (path === SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH) {
    return SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH;
  }

  return path;
};

const toRouteResult = (document: Document, route: ShowcaseRouteDescriptor): WebMcpToolResult => ({
  id: route.id,
  path: `/${route.path}`,
  title: route.title,
  description: route.description,
  url: createRouteUrl(document, route)
});

const findRouteDescriptor = (path: string): ShowcaseRouteDescriptor | undefined => {
  const canonicalPath = canonicalizeRoutePath(path);

  return ROUTE_DESCRIPTORS.find((route) => route.path === canonicalPath);
};

const getCurrentHeading = (document: Document): string | null => {
  const heading = document.querySelector('h1')?.textContent?.replace(/\s+/gu, ' ').trim();

  return heading || null;
};

const getSearchScore = (route: ShowcaseRouteDescriptor, normalizedQuery: string): number => {
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

const matchesSearchKind = (route: ShowcaseRouteDescriptor, kind: 'all' | 'docs' | 'examples'): boolean => {
  return kind === 'all' || route.path.startsWith(`${kind}/`);
};

export const createShowcaseWebMcpTools = ({ document, navigateByUrl }: ShowcaseWebMcpToolDependencies): readonly WebMcpTool[] => [
  {
    name: 'angular_advanced_table.get_current_page',
    title: 'Get current page',
    description: 'Return the current Angular Advanced Table showcase page URL, title, heading, and matching route metadata.',
    inputSchema: CURRENT_PAGE_INPUT_SCHEMA,
    annotations: {
      readOnlyHint: true
    },
    execute: () => {
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
  },
  {
    name: 'angular_advanced_table.search_showcase',
    title: 'Search showcase',
    description: 'Search the Angular Advanced Table documentation and examples by title, description, id, and route path.',
    inputSchema: SEARCH_INPUT_SCHEMA,
    annotations: {
      readOnlyHint: true
    },
    execute: (input) => {
      const query = readStringInput(input, 'query');

      if (!query) {
        return {
          query: '',
          count: 0,
          results: [],
          error: 'Provide a non-empty query string.'
        };
      }

      const kind = readSearchKind(input);
      const limit = readSearchLimit(input);
      const normalizedQuery = query.toLowerCase();
      const matches = ROUTE_DESCRIPTORS.map((route) => ({
        route,
        score: matchesSearchKind(route, kind) ? getSearchScore(route, normalizedQuery) : 0
      }))
        .filter((match) => match.score > 0)
        .sort((left, right) => right.score - left.score || left.route.title.localeCompare(right.route.title))
        .slice(0, limit)
        .map((match) => toRouteResult(document, match.route));

      return {
        query,
        kind,
        count: matches.length,
        results: matches
      };
    }
  },
  {
    name: 'angular_advanced_table.navigate',
    title: 'Navigate showcase',
    description: 'Navigate the browser to a known Angular Advanced Table documentation or example route.',
    inputSchema: NAVIGATE_INPUT_SCHEMA,
    execute: async (input) => {
      const rawPath = readStringInput(input, 'path');

      if (!rawPath) {
        return {
          ok: false,
          error: 'Provide a route path.',
          availablePaths: ROUTE_PATHS
        };
      }

      const routePath = normalizeRoutePath(rawPath);
      const route = findRouteDescriptor(routePath);

      if (!route) {
        return {
          ok: false,
          error: 'Unknown showcase route path.',
          requestedPath: rawPath,
          availablePaths: ROUTE_PATHS
        };
      }

      const navigated = await navigateByUrl(`/${route.path}`);

      return {
        ok: navigated,
        route: toRouteResult(document, route)
      };
    }
  }
];

@Injectable({
  providedIn: 'root'
})
export class ShowcaseWebMcp {
  private readonly abortController = new AbortController();
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private registered = false;

  public constructor() {
    this.destroyRef.onDestroy(() => this.abortController.abort());
    afterNextRender({ write: () => void this.registerTools() });
  }

  private async registerTools(): Promise<void> {
    if (this.registered) {
      return;
    }

    const navigatorContext = (globalThis.navigator as WebMcpNavigator | undefined)?.modelContext;
    const documentContext = (this.document as WebMcpDocument).modelContext;

    if (!navigatorContext && !documentContext) {
      return;
    }

    const tools = createShowcaseWebMcpTools({
      document: this.document,
      navigateByUrl: (url) => this.router.navigateByUrl(url)
    });
    const registerContext = navigatorContext?.registerTool
      ? navigatorContext
      : documentContext?.registerTool
        ? documentContext
        : undefined;
    const registrations: Promise<void>[] = [];

    this.registered = true;

    if (navigatorContext?.provideContext) {
      registrations.push(Promise.resolve(navigatorContext.provideContext({ tools }, { signal: this.abortController.signal })));
    }

    if (registerContext) {
      registrations.push(
        ...tools.map((tool) => Promise.resolve(registerContext.registerTool?.(tool, { signal: this.abortController.signal })))
      );
    }

    const results = await Promise.allSettled(registrations);

    if (results.length > 0 && results.every((result) => result.status === 'rejected')) {
      this.registered = false;
    }
  }
}
