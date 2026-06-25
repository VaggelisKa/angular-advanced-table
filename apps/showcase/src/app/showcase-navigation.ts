/* eslint-disable max-lines -- cohesive navigation model: nav data plus tightly-coupled lookup helpers */
export type ShowcaseNavItem = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
};

export type ShowcaseDoc = {
  readonly markdownPath: string;
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
    markdownPath: '/docs/quick-start.md'
  },
  {
    id: 'columns',
    label: 'Columns',
    description: 'Metadata, sizing, and cells',
    path: '/docs/columns',
    markdownPath: '/docs/columns.md'
  },
  {
    id: 'sticky-header-alternatives',
    label: 'Sticky header alternatives',
    description: 'Scrolling, max-height, and pagination',
    path: '/docs/sticky-header-alternatives',
    markdownPath: '/docs/sticky-header-alternatives.md'
  },
  {
    id: 'state',
    label: 'State',
    description: 'Controlled and uncontrolled slices',
    path: '/docs/state',
    markdownPath: '/docs/state.md'
  },
  {
    id: 'data-lifecycle',
    label: 'Data lifecycle',
    description: 'Loading, empty, error, and server data',
    path: '/docs/data-lifecycle',
    markdownPath: '/docs/data-lifecycle.md'
  },
  {
    id: 'composition',
    label: 'Overview',
    description: 'Core table and companion controls',
    path: '/docs/composition',
    markdownPath: '/docs/composition.md'
  },
  {
    id: 'selection-export',
    label: 'Selection and export',
    description: 'Bulk state and table actions',
    path: '/docs/selection-export',
    markdownPath: '/docs/selection-export.md'
  },
  {
    id: 'render-metrics',
    label: 'Render metrics',
    description: 'Opt-in row render diagnostics',
    path: '/docs/render-metrics',
    markdownPath: '/docs/render-metrics.md'
  },
  {
    id: 'theming',
    label: 'Theming',
    description: 'CSS token scopes and states',
    path: '/docs/theming',
    markdownPath: '/docs/theming.md'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Labels, state rows, and localization',
    path: '/docs/accessibility',
    markdownPath: '/docs/accessibility.md'
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
    id: 'sorting',
    label: 'Sorting',
    description: 'Column sorting',
    path: '/examples/sorting'
  },
  {
    id: 'pinning',
    label: 'Column pinning',
    description: 'Sticky boundary pinning',
    path: '/examples/pinning'
  },
  {
    id: 'reordering',
    label: 'Column reordering',
    description: 'Drag-and-drop headers',
    path: '/examples/reordering'
  },
  {
    id: 'pagination',
    label: 'Pagination',
    description: 'Row-based pagination',
    path: '/examples/pagination'
  },
  {
    id: 'visibility',
    label: 'Column visibility',
    description: 'Dynamic column display',
    path: '/examples/visibility'
  },
  {
    id: 'search',
    label: 'Global search',
    description: 'Fuzzy filter mapping',
    path: '/examples/search'
  },
  {
    id: 'states',
    label: 'Table states',
    description: 'Loading empty error',
    path: '/examples/states'
  },
  {
    id: 'sticky-header',
    label: 'Sticky header',
    description: 'Fixed viewport headers',
    path: '/examples/sticky-header'
  },
  {
    id: 'toolbar',
    label: 'Toolbar',
    description: 'Slot-based keyboard toolbar',
    path: '/examples/toolbar'
  },
  {
    id: 'keyboard-interaction',
    label: 'Keyboard interaction',
    description: 'Grid cell navigation',
    path: '/examples/keyboard-interaction'
  },
  {
    id: 'resizing',
    label: 'Column resizing',
    description: 'Drag and keyboard widths',
    path: '/examples/resizing'
  },
  {
    id: 'selection',
    label: 'Row selection',
    description: 'Checkbox row selection',
    path: '/examples/selection'
  },
  {
    id: 'simple-sorting',
    label: 'Sorting with pinned columns',
    description: 'Fixed company and total columns',
    path: '/examples/simple-sorting'
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

export const showcaseDocGroups: readonly ShowcaseNavGroup[] = [
  {
    id: 'docs-foundations',
    label: 'Foundations',
    ariaLabel: 'Foundational table documentation',
    items: [
      getShowcaseDoc('columns'),
      getShowcaseDoc('sticky-header-alternatives'),
      getShowcaseDoc('state'),
      getShowcaseDoc('data-lifecycle'),
      getShowcaseDoc('theming'),
      getShowcaseDoc('accessibility')
    ]
  },
  {
    id: 'docs-composition',
    label: 'Composition',
    ariaLabel: 'Composition table documentation',
    items: [getShowcaseDoc('composition'), getShowcaseDoc('selection-export'), getShowcaseDoc('render-metrics')]
  }
];

export const showcaseExampleGroups: readonly ShowcaseNavGroup[] = [
  {
    id: 'examples-overview',
    label: 'Overview',
    ariaLabel: 'Overview examples',
    items: [getShowcaseExample('multiple-features'), getShowcaseExample('builder')]
  },
  {
    id: 'examples-columns',
    label: 'Columns',
    ariaLabel: 'Column behavior examples',
    items: [
      getShowcaseExample('sorting'),
      getShowcaseExample('simple-sorting'),
      getShowcaseExample('pinning'),
      getShowcaseExample('reordering'),
      getShowcaseExample('resizing'),
      getShowcaseExample('visibility'),
      getShowcaseExample('sticky-header')
    ]
  },
  {
    id: 'examples-data-workflows',
    label: 'Data workflows',
    ariaLabel: 'Data workflow examples',
    items: [
      getShowcaseExample('pagination'),
      getShowcaseExample('search'),
      getShowcaseExample('states'),
      getShowcaseExample('selection')
    ]
  },
  {
    id: 'examples-controls-keyboard',
    label: 'Controls and keyboard',
    ariaLabel: 'Control and keyboard examples',
    items: [getShowcaseExample('toolbar'), getShowcaseExample('keyboard-interaction')]
  },
  {
    id: 'examples-alternative-sticky-header',
    label: 'Sticky Header Alternatives',
    ariaLabel: 'Sticky header alternatives examples',
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
    id: 'examples',
    label: 'Examples',
    ariaLabel: 'Table examples',
    items: [],
    groups: showcaseExampleGroups
  }
];

/** Returns the requested doc, or the first hardcoded doc when the route data is missing/invalid. */
export function findShowcaseDoc(docId: string | undefined): ShowcaseDoc {
  return showcaseDocs.find((doc) => doc.id === docId) ?? FALLBACK_SHOWCASE_DOC;
}
