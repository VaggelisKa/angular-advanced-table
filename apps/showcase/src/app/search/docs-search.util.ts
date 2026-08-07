import { DOCS_SEARCH_EXAMPLES_GROUP_LABEL } from './docs-search-corpus.util';
import type {
  DocsSearchCorpusEntry,
  DocsSearchMatchRange,
  DocsSearchResult,
  DocsSearchResultGroup,
  DocsSearchSnippet
} from './docs-search.type';

export const DOCS_SEARCH_MAX_RESULTS = 10;

const TITLE_MATCH_WEIGHT = 8;
const HEADING_MATCH_WEIGHT = 6;
const DESCRIPTION_MATCH_WEIGHT = 4;
const SECTION_TOPIC_MATCH_WEIGHT = 3;
const BODY_MATCH_WEIGHT = 2;

const SNIPPET_LENGTH = 120;
const SNIPPET_LEAD = 40;

export const tokenizeDocsSearchQuery = (query: string): readonly string[] => {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/u)
        .filter((token) => token.length > 0)
    )
  );
};

/**
 * Case-insensitive substring score for one query token against one entry.
 * Weighting follows title > heading > description > body; a section entry
 * matches its topic title only at a low secondary weight so topic-level
 * results outrank their own sections on pure title queries.
 */
const getTokenScore = (entry: DocsSearchCorpusEntry, token: string): number => {
  const titleWeight = entry.kind === 'doc-section' ? SECTION_TOPIC_MATCH_WEIGHT : TITLE_MATCH_WEIGHT;

  return (
    (entry.searchTitle.includes(token) ? titleWeight : 0) +
    (entry.searchHeading.includes(token) ? HEADING_MATCH_WEIGHT : 0) +
    (entry.searchDescription.includes(token) ? DESCRIPTION_MATCH_WEIGHT : 0) +
    (entry.searchBody.includes(token) ? BODY_MATCH_WEIGHT : 0)
  );
};

/** AND semantics: zero when any token matches nowhere; otherwise the per-token score sum. */
const getEntryScore = (entry: DocsSearchCorpusEntry, tokens: readonly string[]): number => {
  let total = 0;

  for (const token of tokens) {
    const tokenScore = getTokenScore(entry, token);

    if (tokenScore === 0) {
      return 0;
    }

    total += tokenScore;
  }

  return total;
};

const mergeMatchRanges = (ranges: readonly DocsSearchMatchRange[]): readonly DocsSearchMatchRange[] => {
  const sorted = [...ranges].sort((first, second) => first.start - second.start);
  const merged: DocsSearchMatchRange[] = [];

  for (const range of sorted) {
    const previous = merged.at(-1);

    if (previous && range.start <= previous.start + previous.length) {
      const end = Math.max(previous.start + previous.length, range.start + range.length);

      merged[merged.length - 1] = { start: previous.start, length: end - previous.start };
      continue;
    }

    merged.push(range);
  }

  return merged;
};

/**
 * Builds a short plain-text window around the first token match, with the
 * matched substrings returned as offsets so the component can render the
 * highlight from template bindings instead of HTML.
 */
const buildSnippet = (source: string, tokens: readonly string[]): DocsSearchSnippet | null => {
  if (source.length === 0) {
    return null;
  }

  const lowerSource = source.toLowerCase();
  const matchIndexes = tokens.map((token) => lowerSource.indexOf(token)).filter((index) => index >= 0);
  const firstMatchIndex = matchIndexes.length > 0 ? Math.min(...matchIndexes) : 0;
  const windowStart = Math.max(0, Math.min(firstMatchIndex - SNIPPET_LEAD, source.length - SNIPPET_LENGTH));
  const windowEnd = Math.min(source.length, windowStart + SNIPPET_LENGTH);
  const prefix = windowStart > 0 ? '…' : '';
  const suffix = windowEnd < source.length ? '…' : '';
  const text = `${prefix}${source.slice(windowStart, windowEnd)}${suffix}`;
  const lowerText = text.toLowerCase();
  const ranges: DocsSearchMatchRange[] = [];

  for (const token of tokens) {
    let index = lowerText.indexOf(token);

    while (index >= 0) {
      ranges.push({ start: index, length: token.length });
      index = lowerText.indexOf(token, index + token.length);
    }
  }

  return { text, ranges: mergeMatchRanges(ranges) };
};

const pickSnippetSource = (entry: DocsSearchCorpusEntry, tokens: readonly string[]): string => {
  if (entry.kind === 'doc-section') {
    return entry.body;
  }

  const bodyMatches = tokens.some((token) => entry.searchBody.includes(token));
  const descriptionMatches = tokens.some((token) => entry.searchDescription.includes(token));

  return bodyMatches && !descriptionMatches ? entry.body : entry.description;
};

const toSearchResult = (entry: DocsSearchCorpusEntry, tokens: readonly string[]): DocsSearchResult => ({
  id: entry.id,
  kind: entry.kind,
  topicLabel: entry.topicLabel,
  groupLabel: entry.groupLabel,
  heading: entry.heading,
  snippet: buildSnippet(pickSnippetSource(entry, tokens), tokens),
  routePath: entry.routePath,
  fragment: entry.fragment
});

/**
 * Case-insensitive substring search over the corpus with AND semantics: every
 * query token must match somewhere in an entry, and scores sum per token.
 * Ties keep corpus (navigation) order via the stable sort.
 */
export const searchDocsCorpus = (
  corpus: readonly DocsSearchCorpusEntry[],
  query: string,
  limit: number = DOCS_SEARCH_MAX_RESULTS
): readonly DocsSearchResult[] => {
  const tokens = tokenizeDocsSearchQuery(query);

  if (tokens.length === 0) {
    return [];
  }

  return corpus
    .map((entry) => ({ entry, score: getEntryScore(entry, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map(({ entry }) => toSearchResult(entry, tokens));
};

/**
 * Groups flat results for display: docs group under their topic label,
 * examples under one shared "Examples" group. Group order follows the first
 * result of each group; results keep their relative order within a group.
 */
export const groupDocsSearchResults = (results: readonly DocsSearchResult[]): readonly DocsSearchResultGroup[] => {
  const groups: { label: string; results: DocsSearchResult[] }[] = [];

  for (const result of results) {
    const label = result.kind === 'example' ? DOCS_SEARCH_EXAMPLES_GROUP_LABEL : result.topicLabel;
    const group = groups.find((candidate) => candidate.label === label);

    if (group) {
      group.results.push(result);
      continue;
    }

    groups.push({ label, results: [result] });
  }

  return groups;
};
