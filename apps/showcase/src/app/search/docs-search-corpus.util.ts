import type { DocsSearchCorpusEntry } from './docs-search.type';
import type { DocsSearchDocument } from '../docs/docs-search-index';
import type { ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from '../shell/showcase-navigation';

export const DOCS_SEARCH_EXAMPLES_GROUP_LABEL = 'Examples';

export type DocsSearchCorpusSources = {
  readonly index: Readonly<Record<string, DocsSearchDocument>>;
  readonly docs: readonly ShowcaseNavItem[];
  readonly examples: readonly ShowcaseNavItem[];
  /** Nav item path to nav group label, from `buildNavGroupLabelMap`. */
  readonly groupLabels: Readonly<Record<string, string>>;
};

/** Index-signature lookup behind a function boundary so absent keys keep their `undefined` type (cf. `findDocsHtmlEntry`). */
const findRecordValue = <T>(record: Readonly<Record<string, T>>, key: string): T | undefined => record[key];

/** Maps every nav item path to the label of its closest nav grouping. */
export const buildNavGroupLabelMap = (sections: readonly ShowcaseNavSection[]): Readonly<Record<string, string>> => {
  const labels: Record<string, string> = {};
  const assignGroup = (group: Pick<ShowcaseNavGroup, 'items' | 'label'>): void => {
    for (const item of group.items) {
      labels[item.path] = group.label;
    }
  };

  for (const section of sections) {
    assignGroup(section);

    for (const group of section.groups) {
      assignGroup(group);
    }
  }

  return labels;
};

const createEntry = (
  entry: Pick<
    DocsSearchCorpusEntry,
    'description' | 'fragment' | 'groupLabel' | 'heading' | 'id' | 'kind' | 'routePath' | 'topicLabel'
  > & {
    readonly body?: string;
  }
): DocsSearchCorpusEntry => {
  const body = entry.body ?? '';
  const heading = entry.heading;

  return {
    ...entry,
    body,
    searchTitle: entry.topicLabel.toLowerCase(),
    searchHeading: heading === null ? '' : heading.toLowerCase(),
    searchDescription: entry.description.toLowerCase(),
    searchBody: body.toLowerCase()
  };
};

const buildDocEntries = (doc: ShowcaseNavItem, sources: DocsSearchCorpusSources): readonly DocsSearchCorpusEntry[] => {
  const sections = findRecordValue(sources.index, `/docs/${doc.id}.md`)?.sections ?? [];
  const groupLabel = findRecordValue(sources.groupLabels, doc.path);
  /* The intro prose and the page-level h1 section (when present) belong to
     the doc entry itself; anchored sub-sections become their own entries. */
  const introText = sections
    .filter((section) => section.depth <= 1)
    .map((section) => section.text)
    .join(' ')
    .trim();
  const docEntry = createEntry({
    id: `doc:${doc.id}`,
    kind: 'doc',
    topicLabel: doc.label,
    groupLabel: groupLabel ?? 'Docs',
    heading: null,
    routePath: doc.path,
    fragment: null,
    description: doc.description,
    body: introText
  });
  const sectionEntries = sections
    .filter((section) => section.depth > 1 && section.heading !== null)
    .map((section) =>
      createEntry({
        id: `doc-section:${doc.id}:${section.headingId ?? section.heading}`,
        kind: 'doc-section',
        topicLabel: doc.label,
        groupLabel: groupLabel ?? 'Docs',
        heading: section.heading,
        routePath: doc.path,
        fragment: section.headingId,
        description: doc.description,
        body: section.text
      })
    );

  return [docEntry, ...sectionEntries];
};

/**
 * Joins the generated docs search index with the nav metadata into a flat,
 * search-ready corpus: one `doc` entry per topic (title, description, and the
 * intro/h1 prose), one `doc-section` entry per anchored section, and one
 * `example` entry per registered example route.
 *
 * Relies on the repo convention that markdown filenames match topic ids
 * (`/docs/<id>.md` <-> `/docs/<id>`), which the docs search index contract
 * spec locks against `docs-topics.ts`.
 */
export const buildDocsSearchCorpus = (sources: DocsSearchCorpusSources): readonly DocsSearchCorpusEntry[] => {
  const docEntries = sources.docs.flatMap((doc) => buildDocEntries(doc, sources));
  const exampleEntries = sources.examples.map((example) => {
    const groupLabel = findRecordValue(sources.groupLabels, example.path);

    return createEntry({
      id: `example:${example.id}`,
      kind: 'example',
      topicLabel: example.label,
      groupLabel: groupLabel ?? DOCS_SEARCH_EXAMPLES_GROUP_LABEL,
      heading: null,
      routePath: example.path,
      fragment: null,
      description: example.description
    });
  });

  return [...docEntries, ...exampleEntries];
};
