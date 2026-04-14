import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Angular Advanced Table',
    loadComponent: () =>
      import('./pages/table-showcase-page/table-showcase-page').then(
        (module) => module.TableShowcasePage,
      ),
  },
];
