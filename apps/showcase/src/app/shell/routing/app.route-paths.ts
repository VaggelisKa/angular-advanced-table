import { showcaseDocs, showcaseExamples } from '../showcase-navigation';

const toRoutePath = (path: string): string => path.replace(/^\/+/, '');

export const SHOWCASE_DEFAULT_ROUTE_PATH = 'docs/quick-start';

export const SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH = 'examples/multiple-features';

export const SHOWCASE_DOCS_INDEX_ROUTE_PATH = 'docs';

export const SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH = 'examples';

export type ShowcaseRouteDescriptor = {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly ogType: 'article' | 'website';
};

export type ShowcaseDocRouteDescriptor = ShowcaseRouteDescriptor & {
  readonly docId: string;
};

export const showcaseDocRouteDescriptors: readonly ShowcaseDocRouteDescriptor[] = showcaseDocs.map((doc) => ({
  id: doc.id,
  docId: doc.id,
  path: toRoutePath(doc.path),
  title: `${doc.label} | Angular Advanced Table Docs`,
  description: doc.description,
  ogType: 'article'
}));

export const showcaseExampleRouteDescriptors: readonly ShowcaseRouteDescriptor[] = [
  ...showcaseExamples.map((example) => ({
    id: example.id,
    path: toRoutePath(example.path),
    title: `${example.label} | Angular Advanced Table`,
    description: example.description,
    ogType: 'website' as const
  })),
  {
    id: 'sticky-show-detailed-view-details',
    path: 'examples/sticky-show-detailed-view/details',
    title: 'Detailed view | Angular Advanced Table',
    description: 'Sticky header detailed view route',
    ogType: 'website'
  }
];

export const showcasePrerenderRoutePaths: readonly string[] = [
  '',
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  ...showcaseDocRouteDescriptors.map((route) => route.path),
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  ...showcaseExampleRouteDescriptors.map((route) => route.path)
];

export const findShowcaseRouteDescriptor = (path: string): ShowcaseRouteDescriptor | undefined => {
  return [...showcaseDocRouteDescriptors, ...showcaseExampleRouteDescriptors].find((route) => route.path === path);
};
