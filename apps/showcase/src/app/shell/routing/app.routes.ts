import type { Routes } from '@angular/router';

import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  SHOWCASE_PIN_REORDER_RESIZE_FIXTURE_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors
} from './app.route-paths';
import type { ShowcaseDocRouteDescriptor, ShowcaseRouteDescriptor } from './app.route-paths';
import type { DocsPage } from '../../docs/docs-page/docs-page';

export const loadDocsPage = async (): Promise<typeof DocsPage> =>
  import('../../docs/docs-page/docs-page').then((module) => module.DocsPage);

const getRouteData = (route: { readonly description: string; readonly ogType: string }): Record<string, string> => ({
  description: route.description,
  ogType: route.ogType
});

const findExampleRoute = (path: string): ShowcaseRouteDescriptor => {
  const route = showcaseExampleRouteDescriptors.find((descriptor) => descriptor.path === path);

  if (!route) {
    throw new Error(`Unknown showcase example route: ${path}`);
  }

  return route;
};

const findDocRoute = (path: string): ShowcaseDocRouteDescriptor => {
  const route = showcaseDocRouteDescriptors.find((descriptor) => descriptor.path === path);

  if (!route) {
    throw new Error(`Unknown showcase docs route: ${path}`);
  }

  return route;
};

const quickStartRoute = findDocRoute(SHOWCASE_DEFAULT_ROUTE_PATH);
const multipleFeaturesRoute = findExampleRoute(SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH);
const builderRoute = findExampleRoute('examples/builder');
const stickyHeaderMaxHeightRoute = findExampleRoute('examples/sticky-header-max-height');
const paginationStickyAltRoute = findExampleRoute('examples/pagination-sticky-alt');
const stickyNoOverflowXRoute = findExampleRoute('examples/sticky-no-overflow-x');
const stickyShowDetailedViewRoute = findExampleRoute('examples/sticky-show-detailed-view');
const stickyShowDetailedViewDetailsRoute = findExampleRoute('examples/sticky-show-detailed-view/details');

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: quickStartRoute.title,
    data: { ...getRouteData(quickStartRoute), docId: quickStartRoute.docId },
    loadComponent: loadDocsPage
  },
  {
    path: SHOWCASE_DOCS_INDEX_ROUTE_PATH,
    pathMatch: 'full',
    title: quickStartRoute.title,
    data: { ...getRouteData(quickStartRoute), docId: quickStartRoute.docId },
    loadComponent: loadDocsPage
  },
  ...showcaseDocRouteDescriptors.map((doc) => ({
    path: doc.path,
    title: doc.title,
    data: { ...getRouteData(doc), docId: doc.docId },
    loadComponent: loadDocsPage
  })),
  {
    path: SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
    pathMatch: 'full',
    title: multipleFeaturesRoute.title,
    data: getRouteData(multipleFeaturesRoute),
    loadComponent: async () => import('../../gallery/table-showcase/table-showcase').then((module) => module.TableShowcase)
  },
  {
    path: multipleFeaturesRoute.path,
    title: multipleFeaturesRoute.title,
    data: getRouteData(multipleFeaturesRoute),
    loadComponent: async () => import('../../gallery/table-showcase/table-showcase').then((module) => module.TableShowcase)
  },
  {
    path: builderRoute.path,
    title: builderRoute.title,
    data: getRouteData(builderRoute),
    loadComponent: async () => import('../../gallery/table-builder/table-builder').then((module) => module.TableBuilderPage)
  },
  {
    path: stickyHeaderMaxHeightRoute.path,
    title: stickyHeaderMaxHeightRoute.title,
    data: getRouteData(stickyHeaderMaxHeightRoute),
    loadComponent: async () =>
      import('../../gallery/sticky-header-max-height/sticky-header-max-height').then((module) => module.StickyHeaderMaxHeight)
  },
  {
    path: paginationStickyAltRoute.path,
    title: paginationStickyAltRoute.title,
    data: getRouteData(paginationStickyAltRoute),
    loadComponent: async () =>
      import('../../gallery/pagination-sticky-alt/pagination-sticky-alt').then((module) => module.PaginationStickyAlt)
  },
  {
    path: stickyNoOverflowXRoute.path,
    title: stickyNoOverflowXRoute.title,
    data: getRouteData(stickyNoOverflowXRoute),
    loadComponent: async () =>
      import('../../gallery/sticky-no-overflow-x/sticky-no-overflow-x').then((module) => module.StickyNoOverflowX)
  },
  {
    path: stickyShowDetailedViewRoute.path,
    title: stickyShowDetailedViewRoute.title,
    data: getRouteData(stickyShowDetailedViewRoute),
    loadComponent: async () =>
      import('../../gallery/sticky-show-detailed-view/sticky-show-detailed-view').then((module) => module.StickyShowDetailedView)
  },
  {
    path: stickyShowDetailedViewDetailsRoute.path,
    title: stickyShowDetailedViewDetailsRoute.title,
    data: getRouteData(stickyShowDetailedViewDetailsRoute),
    loadComponent: async () =>
      import('../../gallery/sticky-show-detailed-view/sticky-show-detailed-view').then((module) => module.StickyShowDetailedView)
  },
  {
    // Client-only e2e fixture (issue #273); intentionally not prerendered or listed in navigation.
    path: SHOWCASE_PIN_REORDER_RESIZE_FIXTURE_ROUTE_PATH,
    loadComponent: async () =>
      import('../../fixtures/pin-reorder-resize/pin-reorder-resize').then((module) => module.PinReorderResizeFixture)
  },
  {
    path: '**',
    redirectTo: SHOWCASE_DEFAULT_ROUTE_PATH
  }
];
