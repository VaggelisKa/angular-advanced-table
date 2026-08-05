import type { Route, Routes } from '@angular/router';

import type { ShowcaseDocRouteDescriptor, ShowcaseRouteDescriptor } from './app.route-paths';
import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH,
  showcaseDocRouteDescriptors,
  showcaseExampleRouteDescriptors
} from './app.route-paths';
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

/** Builds a lazily loaded example route from its registered descriptor. */
const exampleRoute = (path: string, loadComponent: Route['loadComponent']): Route => {
  const descriptor = findExampleRoute(path);

  return {
    path: descriptor.path,
    title: descriptor.title,
    data: getRouteData(descriptor),
    loadComponent
  };
};

const quickStartRoute = findDocRoute(SHOWCASE_DEFAULT_ROUTE_PATH);
const multipleFeaturesRoute = findExampleRoute(SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH);

const loadTableShowcase: Route['loadComponent'] = async () =>
  import('../../gallery/table-showcase/table-showcase').then((module) => module.TableShowcase);

const loadStickyShowDetailedView: Route['loadComponent'] = async () =>
  import('../../gallery/sticky-show-detailed-view/sticky-show-detailed-view').then((module) => module.StickyShowDetailedView);

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
    loadComponent: loadTableShowcase
  },
  exampleRoute(SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH, loadTableShowcase),
  exampleRoute('examples/builder', async () =>
    import('../../gallery/table-builder/table-builder').then((module) => module.TableBuilderPage)
  ),
  exampleRoute('examples/table-to-list', async () =>
    import('../../gallery/table-to-list/table-to-list').then((module) => module.TableToList)
  ),
  exampleRoute('examples/table-to-list/basic', async () =>
    import('../../gallery/table-to-list-basic/table-to-list-basic').then((module) => module.TableToListBasic)
  ),
  exampleRoute('examples/table-to-list/list-controls', async () =>
    import('../../gallery/table-to-list-controls/table-to-list-controls').then((module) => module.TableToListControls)
  ),
  exampleRoute('examples/table-to-list/data-states', async () =>
    import('../../gallery/table-to-list-data-states/table-to-list-data-states').then((module) => module.TableToListDataStates)
  ),
  exampleRoute('examples/table-to-list/pagination', async () =>
    import('../../gallery/table-to-list-pagination/table-to-list-pagination').then((module) => module.TableToListPagination)
  ),
  exampleRoute('examples/table-to-list/custom-cells', async () =>
    import('../../gallery/table-to-list-custom-cells/table-to-list-custom-cells').then((module) => module.TableToListCustomCells)
  ),
  exampleRoute('examples/table-to-list/row-selection', async () =>
    import('../../gallery/table-to-list-row-selection/table-to-list-row-selection').then((module) => module.TableToListRowSelection)
  ),
  exampleRoute('examples/table-to-list/breakpoint', async () =>
    import('../../gallery/table-to-list-breakpoint/table-to-list-breakpoint').then((module) => module.TableToListBreakpoint)
  ),
  exampleRoute('examples/table-to-list/multi-config', async () =>
    import('../../gallery/table-to-list-multi-config/table-to-list-multi-config').then((module) => module.TableToListMultiConfig)
  ),
  exampleRoute('examples/sticky-header-max-height', async () =>
    import('../../gallery/sticky-header-max-height/sticky-header-max-height').then((module) => module.StickyHeaderMaxHeight)
  ),
  exampleRoute('examples/pagination-sticky-alt', async () =>
    import('../../gallery/pagination-sticky-alt/pagination-sticky-alt').then((module) => module.PaginationStickyAlt)
  ),
  exampleRoute('examples/sticky-no-overflow-x', async () =>
    import('../../gallery/sticky-no-overflow-x/sticky-no-overflow-x').then((module) => module.StickyNoOverflowX)
  ),
  exampleRoute('examples/sticky-show-detailed-view', loadStickyShowDetailedView),
  exampleRoute('examples/sticky-show-detailed-view/details', loadStickyShowDetailedView),
  {
    path: '**',
    redirectTo: SHOWCASE_DEFAULT_ROUTE_PATH
  }
];
