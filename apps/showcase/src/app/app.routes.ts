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
    path: 'examples/sticky-header-max-height',
    title: 'Sticky header max height | Angular Advanced Table',
    loadComponent: async () =>
      import('./pages/sticky-header-max-height/sticky-header-max-height').then((module) => module.StickyHeaderMaxHeight)
  },
  {
    path: 'examples/pagination-sticky-alt',
    title: 'Pagination sticky alt | Angular Advanced Table',
    loadComponent: async () =>
      import('./pages/pagination-sticky-alt/pagination-sticky-alt').then((module) => module.PaginationStickyAlt)
  },
  {
    path: 'examples/sticky-no-overflow-x',
    title: 'Sticky header no overflow x | Angular Advanced Table',
    loadComponent: async () => import('./pages/sticky-no-overflow-x/sticky-no-overflow-x').then((module) => module.StickyNoOverflowX)
  },
  {
    path: 'examples/sticky-show-detailed-view',
    title: 'Sticky header show detailed view | Angular Advanced Table',
    loadComponent: async () =>
      import('./pages/sticky-show-detailed-view/sticky-show-detailed-view').then((module) => module.StickyShowDetailedView)
  },
  {
    path: 'examples/sticky-show-detailed-view/details',
    title: 'Detailed view | Angular Advanced Table',
    loadComponent: async () =>
      import('./pages/sticky-show-detailed-view/sticky-show-detailed-view').then((module) => module.StickyShowDetailedView)
  },
  {
    path: '**',
    redirectTo: 'docs/quick-start'
  }
];
