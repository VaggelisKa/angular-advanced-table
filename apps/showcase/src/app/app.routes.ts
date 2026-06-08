import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Advanced Table - Live Tape',
    loadComponent: () =>
      import('./pages/table-showcase-page/table-showcase-page').then(
        (module) => module.TableShowcasePage,
      ),
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
      import('./pages/single-features/search-showcase').then(
        (module) => module.SearchShowcasePage,
      ),
  },
  {
    path: 'sticky-header',
    title: 'Advanced Table - Sticky Header',
    loadComponent: () =>
      import('./pages/single-features/sticky-header-showcase').then(
        (module) => module.StickyHeaderShowcasePage,
      ),
  },
];
