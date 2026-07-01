/* eslint-disable max-lines -- cohesive navigation model: nav data plus tightly-coupled lookup helpers */
export type ShowcaseNavItem = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
};

export type ShowcaseDoc = {
  readonly markdownPaths: readonly string[];
} & ShowcaseNavItem;

export type ShowcaseNavGroup = {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly items: readonly ShowcaseNavItem[];
};

export type ShowcaseNavSection = {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly items: readonly ShowcaseNavItem[];
  readonly groups: readonly ShowcaseNavGroup[];
};

export const showcaseDocs: readonly ShowcaseDoc[] = [
  {
    id: 'quick-start',
    label: 'Quick start',
    description: 'Install and first table',
    path: '/docs/quick-start',
    markdownPaths: ['/docs/quick-start.md']
  },
  {
    id: 'composition',
    label: 'Composition',
    description: 'Core table and companion controls',
    path: '/docs/composition',
    markdownPaths: ['/docs/composition.md']
  },
  {
    id: 'columns',
    label: 'Columns',
    description: 'Metadata, sizing, and cells',
    path: '/docs/columns',
    markdownPaths: ['/docs/columns.md']
  },
  {
    id: 'state',
    label: 'State',
    description: 'Controlled and uncontrolled slices',
    path: '/docs/state',
    markdownPaths: ['/docs/state.md']
  },
  {
    id: 'data-lifecycle',
    label: 'Data lifecycle',
    description: 'Loading, empty, error, and manual data',
    path: '/docs/data-lifecycle',
    markdownPaths: ['/docs/data-lifecycle.md']
  },
  {
    id: 'sorting',
    label: 'Sorting',
    description: 'Single, multi, and controlled sorting',
    path: '/docs/sorting',
    markdownPaths: ['/docs/sorting.md']
  },
  {
    id: 'filtering-search',
    label: 'Filtering and search',
    description: 'Consumer-owned search and filters',
    path: '/docs/filtering-search',
    markdownPaths: ['/docs/filtering-search.md']
  },
  {
    id: 'pagination',
    label: 'Pagination',
    description: 'Client and manual pagination',
    path: '/docs/pagination',
    markdownPaths: ['/docs/pagination.md']
  },
  {
    id: 'column-layout',
    label: 'Column layout',
    description: 'Pinning, resizing, order, visibility',
    path: '/docs/column-layout',
    markdownPaths: ['/docs/column-layout.md']
  },
  {
    id: 'row-selection',
    label: 'Row selection',
    description: 'Selection state and bulk workflows',
    path: '/docs/row-selection',
    markdownPaths: ['/docs/row-selection.md']
  },
  {
    id: 'toolbar-actions',
    label: 'Toolbar and actions',
    description: 'Toolbar shell and table actions',
    path: '/docs/toolbar-actions',
    markdownPaths: ['/docs/toolbar-actions.md']
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Names, state rows, and custom cells',
    path: '/docs/accessibility',
    markdownPaths: ['/docs/accessibility.md']
  },
  {
    id: 'keyboard-interaction',
    label: 'Keyboard interaction',
    description: 'Grid navigation and shortcuts',
    path: '/docs/keyboard-interaction',
    markdownPaths: ['/docs/keyboard-interaction.md']
  },
  {
    id: 'theming',
    label: 'Theming',
    description: 'CSS token scopes and states',
    path: '/docs/theming',
    markdownPaths: ['/docs/theming.md']
  },
  {
    id: 'localization',
    label: 'Localization',
    description: 'Locale providers and accessible copy',
    path: '/docs/localization',
    markdownPaths: ['/docs/localization.md']
  },
  {
    id: 'export',
    label: 'Export',
    description: 'CSV defaults and custom handlers',
    path: '/docs/export',
    markdownPaths: ['/docs/export.md']
  },
  {
    id: 'render-metrics',
    label: 'Render metrics',
    description: 'Opt-in row render diagnostics',
    path: '/docs/render-metrics',
    markdownPaths: ['/docs/render-metrics.md']
  }
];

const firstShowcaseDoc = showcaseDocs.at(0);

if (!firstShowcaseDoc) {
  throw new Error('showcaseDocs must define at least one document');
}

const FALLBACK_SHOWCASE_DOC: ShowcaseDoc = firstShowcaseDoc;

export const showcaseExamples: readonly ShowcaseNavItem[] = [
  {
    id: 'multiple-features',
    label: 'Multiple features',
    description: 'Kitchen sink demo',
    path: '/examples/multiple-features'
  },
  {
    id: 'builder',
    label: 'Table builder',
    description: 'Interactive config',
    path: '/examples/builder'
  },
  {
    id: 'sticky-header-max-height',
    label: 'Sticky header max height',
    description: 'Sticky header with max height',
    path: '/examples/sticky-header-max-height'
  },
  {
    id: 'pagination-sticky-alt',
    label: 'Pagination sticky alt',
    description: 'Different layout of pagination controls',
    path: '/examples/pagination-sticky-alt'
  },
  {
    id: 'sticky-no-overflow-x',
    label: 'Sticky no overflow x',
    description: 'Sticky header with no overflow x',
    path: '/examples/sticky-no-overflow-x'
  },
  {
    id: 'sticky-show-detailed-view',
    label: 'Sticky show detailed view',
    description: 'Sticky header with show detailed view',
    path: '/examples/sticky-show-detailed-view'
  }
];

function getShowcaseDoc(docId: string): ShowcaseDoc {
  const doc = showcaseDocs.find((item) => item.id === docId);

  if (!doc) {
    throw new Error(`Unknown showcase doc: ${docId}`);
  }

  return doc;
}

function getShowcaseExample(exampleId: string): ShowcaseNavItem {
  const example = showcaseExamples.find((item) => item.id === exampleId);

  if (!example) {
    throw new Error(`Unknown showcase example: ${exampleId}`);
  }

  return example;
}

const showcaseDocGroups: readonly ShowcaseNavGroup[] = [
  {
    id: 'docs-core-model',
    label: 'Core principles',
    ariaLabel: 'Core table principles documentation',
    items: [getShowcaseDoc('composition'), getShowcaseDoc('columns'), getShowcaseDoc('state'), getShowcaseDoc('data-lifecycle')]
  },
  {
    id: 'docs-capabilities',
    label: 'Capabilities',
    ariaLabel: 'Table capability documentation',
    items: [
      getShowcaseDoc('sorting'),
      getShowcaseDoc('filtering-search'),
      getShowcaseDoc('pagination'),
      getShowcaseDoc('column-layout'),
      getShowcaseDoc('row-selection'),
      getShowcaseDoc('toolbar-actions')
    ]
  },
  {
    id: 'docs-accessibility-ux',
    label: 'Accessibility and UX',
    ariaLabel: 'Accessibility and user experience documentation',
    items: [
      getShowcaseDoc('accessibility'),
      getShowcaseDoc('keyboard-interaction'),
      getShowcaseDoc('theming'),
      getShowcaseDoc('localization')
    ]
  },
  {
    id: 'docs-advanced',
    label: 'Advanced',
    ariaLabel: 'Advanced table documentation',
    items: [getShowcaseDoc('export'), getShowcaseDoc('render-metrics')]
  }
];

const showcaseExampleGroups: readonly ShowcaseNavGroup[] = [
  {
    id: 'examples-sticky-header',
    label: 'Sticky headers',
    ariaLabel: 'Sticky header examples',
    items: [
      getShowcaseExample('sticky-header-max-height'),
      getShowcaseExample('pagination-sticky-alt'),
      getShowcaseExample('sticky-no-overflow-x'),
      getShowcaseExample('sticky-show-detailed-view')
    ]
  }
];

export const showcaseNavSections: readonly ShowcaseNavSection[] = [
  {
    id: 'docs',
    label: 'Docs',
    ariaLabel: 'Table documentation',
    items: [getShowcaseDoc('quick-start')],
    groups: showcaseDocGroups
  },
  {
    id: 'gallery',
    label: 'Gallery',
    ariaLabel: 'Standalone table gallery',
    items: [getShowcaseExample('multiple-features'), getShowcaseExample('builder')],
    groups: showcaseExampleGroups
  }
];

/** Returns the requested doc, or the first hardcoded doc when the route data is missing/invalid. */
export function findShowcaseDoc(docId: string | undefined): ShowcaseDoc {
  return showcaseDocs.find((doc) => doc.id === docId) ?? FALLBACK_SHOWCASE_DOC;
}
