import { RenderMode } from '@angular/ssr';

import { showcasePrerenderRoutePaths } from './app.route-paths';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

const getConcreteRouterPaths = (): string[] =>
  routes.flatMap((route) => (typeof route.path === 'string' && route.path !== '**' ? [route.path] : []));

describe('FEATURE: showcase server routes', () => {
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
