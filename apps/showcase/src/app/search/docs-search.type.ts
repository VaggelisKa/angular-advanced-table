export type DocsSearchResultKind = 'doc' | 'doc-section' | 'example';

export type DocsSearchMatchRange = {
  readonly start: number;
  readonly length: number;
};

export type DocsSearchSnippet = {
  readonly text: string;
  readonly ranges: readonly DocsSearchMatchRange[];
};

export type DocsSearchResult = {
  readonly id: string;
  readonly kind: DocsSearchResultKind;
  readonly topicLabel: string;
  readonly groupLabel: string;
  readonly heading: string | null;
  readonly snippet: DocsSearchSnippet | null;
  readonly routePath: string;
  readonly fragment: string | null;
};

export type DocsSearchResultGroup = {
  readonly label: string;
  readonly results: readonly DocsSearchResult[];
};

export type DocsSearchCorpusEntry = {
  readonly id: string;
  readonly kind: DocsSearchResultKind;
  readonly topicLabel: string;
  readonly groupLabel: string;
  readonly heading: string | null;
  readonly routePath: string;
  readonly fragment: string | null;
  /** Lowercased searchable fields, precomputed once at corpus build time. */
  readonly searchTitle: string;
  readonly searchHeading: string;
  readonly searchDescription: string;
  readonly searchBody: string;
  /** Original-case text used to build result snippets. */
  readonly description: string;
  readonly body: string;
};
