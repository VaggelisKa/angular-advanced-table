import { RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr';

import { showcasePrerenderRoutePaths } from './app.route-paths';

export const serverRoutes: ServerRoute[] = [
  ...showcasePrerenderRoutePaths.map(
    (path): ServerRoute => ({
      path,
      renderMode: RenderMode.Prerender
    })
  ),
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
