import { showcaseDocs } from './showcase-navigation.const';
import type { ShowcaseDoc, ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from './showcase-navigation.type';

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

const getShowcaseDoc = (docId: string): ShowcaseDoc => {
  const doc = showcaseDocs.find((item) => item.id === docId);

  if (!doc) {
    throw new Error(`Unknown showcase doc: ${docId}`);
  }

  return doc;
};

const getShowcaseExample = (exampleId: string): ShowcaseNavItem => {
  const example = showcaseExamples.find((item) => item.id === exampleId);

  if (!example) {
    throw new Error(`Unknown showcase example: ${exampleId}`);
  }

  return example;
};

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
      getShowcaseDoc('responsive-capabilities'),
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
    items: [getShowcaseDoc('virtualization'), getShowcaseDoc('export'), getShowcaseDoc('render-metrics')]
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
export const findShowcaseDoc = (docId: string | undefined): ShowcaseDoc => {
  return showcaseDocs.find((doc) => doc.id === docId) ?? FALLBACK_SHOWCASE_DOC;
};
