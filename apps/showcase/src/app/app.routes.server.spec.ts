import { RenderMode } from '@angular/ssr';

import { SHOWCASE_DOCS_INDEX_ROUTE_PATH, SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH, showcasePrerenderRoutePaths } from './app.route-paths';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

const getConcreteRouterPaths = (): string[] =>
  routes.flatMap((route) => (typeof route.path === 'string' && route.path !== '**' ? [route.path] : []));

describe('FEATURE: showcase server routes', () => {
  describe('GIVEN: the showcase app has prerendered index routes', () => {
    describe('WHEN: configuring root, docs, and examples entry points', () => {
      it('THEN: it renders content routes instead of static redirect documents', () => {
        const indexRoutes = new Map(routes.map((route) => [route.path, route]));

        for (const path of ['', SHOWCASE_DOCS_INDEX_ROUTE_PATH, SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH]) {
          const route = indexRoutes.get(path);

          expect(route).toBeDefined();
          expect(route).not.toHaveProperty('redirectTo');
          expect(route).toHaveProperty('loadComponent');
        }
      });
    });
  });

  describe('GIVEN: the showcase app has concrete router paths', () => {
    describe('WHEN: configure server prerender paths', () => {
      it('THEN: it prerenders every concrete router path once', () => {
        expect(new Set(showcasePrerenderRoutePaths)).toStrictEqual(new Set(getConcreteRouterPaths()));
        expect(showcasePrerenderRoutePaths).toHaveLength(new Set(showcasePrerenderRoutePaths).size);
      });
    });
  });

  describe('GIVEN: the showcase app has a wildcard fallback route', () => {
    describe('WHEN: configure server rendering modes', () => {
      it('THEN: it keeps the wildcard route client-rendered', () => {
        expect(serverRoutes.at(-1)).toStrictEqual({
          path: '**',
          renderMode: RenderMode.Client
        });
      });
    });
  });
});
