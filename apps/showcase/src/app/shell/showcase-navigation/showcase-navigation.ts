import { showcaseExamples } from './showcase-examples.const';
import { showcaseDocs } from './showcase-navigation.const';
import type { ShowcaseDoc, ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from './showcase-navigation.type';

const firstShowcaseDoc = showcaseDocs.at(0);

if (!firstShowcaseDoc) {
  throw new Error('showcaseDocs must define at least one document');
}

const FALLBACK_SHOWCASE_DOC: ShowcaseDoc = firstShowcaseDoc;

export { showcaseExamples };

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
      getShowcaseDoc('sub-header-rows'),
      getShowcaseDoc('filtering-search'),
      getShowcaseDoc('pagination'),
      getShowcaseDoc('column-layout'),
      getShowcaseDoc('responsive-capabilities'),
      getShowcaseDoc('list-renderer'),
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
    id: 'examples-table-to-list',
    label: 'Table to list',
    ariaLabel: 'Table to list examples',
    items: [
      getShowcaseExample('table-to-list-basic'),
      getShowcaseExample('table-to-list'),
      getShowcaseExample('table-to-list-breakpoint'),
      getShowcaseExample('table-to-list-multi-config'),
      getShowcaseExample('table-to-list-controls'),
      getShowcaseExample('table-to-list-custom-cells'),
      getShowcaseExample('table-to-list-row-selection'),
      getShowcaseExample('table-to-list-data-states'),
      getShowcaseExample('table-to-list-pagination')
    ]
  },
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
    items: [getShowcaseExample('multiple-features'), getShowcaseExample('builder'), getShowcaseExample('table-to-static')],
    groups: showcaseExampleGroups
  }
];

/** Returns the requested doc, or the first hardcoded doc when the route data is missing/invalid. */
export const findShowcaseDoc = (docId: string | undefined): ShowcaseDoc => {
  return showcaseDocs.find((doc) => doc.id === docId) ?? FALLBACK_SHOWCASE_DOC;
};
