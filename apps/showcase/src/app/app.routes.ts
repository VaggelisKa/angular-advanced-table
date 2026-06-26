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
    path: '**',
    redirectTo: 'docs/quick-start'
  }
];
