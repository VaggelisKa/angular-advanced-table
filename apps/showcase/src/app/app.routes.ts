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
