import { flexRenderComponent as tanstackFlexRenderComponent } from '@tanstack/angular-table';

import { flexRenderComponent } from '.';

describe('FEATURE: ng-advanced-table public barrel', () => {
  describe('GIVEN: consumer rendering helpers are exposed from the core entry point', () => {
    describe('WHEN: importing the Angular flex renderer helper', () => {
      it('THEN: it forwards the TanStack helper for consumer cell renderers', () => {
        expect(flexRenderComponent).toBe(tanstackFlexRenderComponent);
      });
    });
  });
});
