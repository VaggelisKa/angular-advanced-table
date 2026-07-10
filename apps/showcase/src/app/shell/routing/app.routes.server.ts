import { RenderMode } from '@angular/ssr';
import type { ServerRoute } from '@angular/ssr';

import { showcaseClientOnlyRoutePaths, showcasePrerenderRoutePaths } from './app.route-paths';

export const serverRoutes: ServerRoute[] = [
  ...showcasePrerenderRoutePaths.map(
    (path): ServerRoute => ({
      path,
      renderMode: RenderMode.Prerender
    })
  ),
  ...showcaseClientOnlyRoutePaths.map(
    (path): ServerRoute => ({
      path,
      renderMode: RenderMode.Client
    })
  ),
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
