import type { DocsSearchResult, DocsSearchSnippet } from './docs-search.type';
import { groupDocsSearchResults } from './docs-search.util';

export type DocsSearchSnippetSegment = {
  readonly text: string;
  readonly marked: boolean;
};

export type DocsSearchResultView = DocsSearchResult & {
  readonly index: number;
  readonly optionId: string;
  readonly segments: readonly DocsSearchSnippetSegment[];
};

export type DocsSearchResultGroupView = {
  readonly label: string;
  readonly results: readonly DocsSearchResultView[];
};

/** Splits a snippet into plain/marked text segments from its match offsets, so the template never needs innerHTML. */
export const buildSnippetSegments = (snippet: DocsSearchSnippet | null): readonly DocsSearchSnippetSegment[] => {
  if (!snippet) {
    return [];
  }

  const segments: DocsSearchSnippetSegment[] = [];
  let cursor = 0;

  for (const range of snippet.ranges) {
    if (range.start > cursor) {
      segments.push({ text: snippet.text.slice(cursor, range.start), marked: false });
    }

    segments.push({ text: snippet.text.slice(range.start, range.start + range.length), marked: true });
    cursor = range.start + range.length;
  }

  if (cursor < snippet.text.length) {
    segments.push({ text: snippet.text.slice(cursor), marked: false });
  }

  return segments;
};

/** Groups results for the listbox and assigns option ids in DOM order for `aria-activedescendant`. */
export const buildDocsSearchResultGroupViews = (results: readonly DocsSearchResult[]): readonly DocsSearchResultGroupView[] => {
  let index = 0;

  return groupDocsSearchResults(results).map((group) => ({
    label: group.label,
    results: group.results.map((result) => {
      const view: DocsSearchResultView = {
        ...result,
        index,
        optionId: `docs-search-option-${index}`,
        segments: buildSnippetSegments(result.snippet)
      };

      index += 1;

      return view;
    })
  }));
};

/**
 * Next `aria-activedescendant` index for ArrowDown/ArrowUp, wrapping at both
 * ends. `current` is -1 while no option is active, so ArrowDown starts at the
 * first option and ArrowUp at the last.
 */
export const getNextDocsSearchActiveIndex = (current: number, key: 'ArrowDown' | 'ArrowUp', count: number): number => {
  if (count === 0) {
    return -1;
  }

  if (key === 'ArrowDown') {
    return (current + 1) % count;
  }

  return current < 0 ? count - 1 : (current - 1 + count) % count;
};
