import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'examples/multiple-features',
  },
  {
    path: 'examples/multiple-features',
    title: 'Multiple features | Angular Advanced Table',
    loadComponent: () =>
      import('./pages/table-showcase-page/table-showcase-page').then(
        (module) => module.TableShowcasePage,
      ),
  },
  {
    path: 'builder',
    title: 'Table builder | Angular Advanced Table',
    loadComponent: () =>
      import('./pages/table-builder/table-builder').then((module) => module.TableBuilderPage),
  },
  {
    path: 'sorting',
    title: 'Advanced Table - Sorting',
    loadComponent: () =>
      import('./pages/single-features/sorting-showcase').then(
        (module) => module.SortingShowcasePage,
      ),
  },
  {
    path: 'pinning',
    title: 'Advanced Table - Column Pinning',
    loadComponent: () =>
      import('./pages/single-features/pinning-showcase').then(
        (module) => module.PinningShowcasePage,
      ),
  },
  {
    path: 'reordering',
    title: 'Advanced Table - Column Reordering',
    loadComponent: () =>
      import('./pages/single-features/reordering-showcase').then(
        (module) => module.ReorderingShowcasePage,
      ),
  },
  {
    path: 'pagination',
    title: 'Advanced Table - Table Pagination',
    loadComponent: () =>
      import('./pages/single-features/pagination-showcase').then(
        (module) => module.PaginationShowcasePage,
      ),
  },
  {
    path: 'visibility',
    title: 'Advanced Table - Column Visibility',
    loadComponent: () =>
      import('./pages/single-features/visibility-showcase').then(
        (module) => module.VisibilityShowcasePage,
      ),
  },
  {
    path: 'search',
    title: 'Advanced Table - Global Search',
    loadComponent: () =>
      import('./pages/single-features/search-showcase').then((module) => module.SearchShowcasePage),
  },
  {
    path: 'sticky-header',
    title: 'Advanced Table - Sticky Header',
    loadComponent: () =>
      import('./pages/single-features/sticky-header-showcase').then(
        (module) => module.StickyHeaderShowcasePage,
      ),
  },
  {
    path: 'keyboard-interaction',
    title: 'Advanced Table - Keyboard Interaction',
    loadComponent: () =>
      import('./pages/single-features/keyboard-interaction-showcase').then(
        (module) => module.KeyboardInteractionShowcasePage,
      ),
  },
  {
    path: 'value-formatting',
    title: 'Advanced Table - Value Formatting',
    loadComponent: () =>
      import('./pages/single-features/value-formatting-showcase').then(
        (module) => module.ValueFormattingShowcasePage,
      ),
  },
  {
    path: 'examples/simple-sorting',
    title: 'Sorting with pinned columns | Angular Advanced Table',
    loadComponent: () =>
      import('./pages/simple-sorting-page/simple-sorting-page').then(
        (module) => module.SimpleSortingPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'examples/multiple-features',
  },
];
