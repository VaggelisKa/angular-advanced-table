import type { Routes } from '@angular/router';

import type { DocsPage } from './pages/docs/docs-page';
import { showcaseDocs } from './showcase-navigation';

export const loadDocsPage = async (): Promise<typeof DocsPage> => import('./pages/docs/docs-page').then((module) => module.DocsPage);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'docs/quick-start'
  },
  {
    path: 'docs',
    pathMatch: 'full',
    redirectTo: 'docs/quick-start'
  },
  ...showcaseDocs.map((doc) => ({
    path: doc.path.slice(1),
    title: `${doc.label} | Angular Advanced Table Docs`,
    data: { docId: doc.id },
    loadComponent: loadDocsPage
  })),
  {
    path: 'examples',
    pathMatch: 'full',
    redirectTo: 'examples/multiple-features'
  },
  {
    path: 'examples/multiple-features',
    title: 'Multiple features | Angular Advanced Table',
    loadComponent: async () => import('./pages/table-showcase-page/table-showcase-page').then((module) => module.TableShowcasePage)
  },
  {
    path: 'examples/builder',
    title: 'Table builder | Angular Advanced Table',
    loadComponent: async () => import('./pages/table-builder/table-builder').then((module) => module.TableBuilderPage)
  },
  {
    path: 'examples/sorting',
    title: 'Advanced Table - Sorting',
    loadComponent: async () => import('./pages/single-features/sorting/sorting-showcase').then((module) => module.SortingShowcasePage)
  },
  {
    path: 'examples/pinning',
    title: 'Advanced Table - Column Pinning',
    loadComponent: async () => import('./pages/single-features/pinning-showcase').then((module) => module.PinningShowcasePage)
  },
  {
    path: 'examples/reordering',
    title: 'Advanced Table - Column Reordering',
    loadComponent: async () => import('./pages/single-features/reordering-showcase').then((module) => module.ReorderingShowcasePage)
  },
  {
    path: 'examples/pagination',
    title: 'Advanced Table - Table Pagination',
    loadComponent: async () => import('./pages/single-features/pagination-showcase').then((module) => module.PaginationShowcasePage)
  },
  {
    path: 'examples/visibility',
    title: 'Advanced Table - Column Visibility',
    loadComponent: async () => import('./pages/single-features/visibility-showcase').then((module) => module.VisibilityShowcasePage)
  },
  {
    path: 'examples/search',
    title: 'Advanced Table - Global Search',
    loadComponent: async () => import('./pages/single-features/search-showcase').then((module) => module.SearchShowcasePage)
  },
  {
    path: 'examples/states',
    title: 'Advanced Table - Table States',
    loadComponent: async () => import('./pages/single-features/states-showcase').then((module) => module.StatesShowcasePage)
  },
  {
    path: 'examples/sticky-header',
    title: 'Advanced Table - Sticky Header',
    loadComponent: async () =>
      import('./pages/single-features/sticky-header-showcase').then((module) => module.StickyHeaderShowcasePage)
  },
  {
    path: 'examples/toolbar',
    title: 'Advanced Table - Table Toolbar',
    loadComponent: async () =>
      import('./pages/single-features/toolbar-showcase/toolbar-showcase').then((module) => module.ToolbarShowcasePage)
  },
  {
    path: 'examples/keyboard-interaction',
    title: 'Advanced Table - Keyboard Interaction',
    loadComponent: async () =>
      import('./pages/single-features/keyboard-interaction/keyboard-interaction-showcase').then(
        (module) => module.KeyboardInteractionShowcasePage
      )
  },
  {
    path: 'examples/resizing',
    title: 'Advanced Table - Column Resizing',
    loadComponent: async () =>
      import('./pages/single-features/resizing-showcase/resizing-showcase').then((module) => module.ResizingShowcasePage)
  },
  {
    path: 'examples/selection',
    title: 'Advanced Table - Row Selection',
    loadComponent: async () =>
      import('./pages/single-features/selection/selection-showcase').then((module) => module.SelectionShowcasePage)
  },
  {
    path: 'examples/simple-sorting',
    title: 'Sorting with pinned columns | Angular Advanced Table',
    loadComponent: async () => import('./pages/simple-sorting-page/simple-sorting-page').then((module) => module.SimpleSortingPage)
  },
  {
    path: '**',
    redirectTo: 'docs/quick-start'
  }
];
