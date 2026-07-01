import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { PRIMARY_OUTLET } from '@angular/router';
import type { RouterStateSnapshot } from '@angular/router';

import { AppTitleStrategy } from './app.title-strategy';

const createSnapshot = (data: Record<string, unknown>, url = '/docs/quick-start'): RouterStateSnapshot =>
  ({
    url,
    root: {
      outlet: PRIMARY_OUTLET,
      data: {},
      children: [
        {
          outlet: PRIMARY_OUTLET,
          data,
          children: []
        }
      ]
    }
  }) as unknown as RouterStateSnapshot;

describe('FEATURE: AppTitleStrategy', () => {
  let strategy: AppTitleStrategy;
  let meta: Meta;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppTitleStrategy]
    });

    strategy = TestBed.inject(AppTitleStrategy);
    meta = TestBed.inject(Meta);
    title = TestBed.inject(Title);
  });

  describe('GIVEN: a route with showcase metadata is activated', () => {
    describe('WHEN: update document title and meta tags', () => {
      it('THEN: it writes search and Open Graph metadata', () => {
        vi.spyOn(strategy, 'buildTitle').mockReturnValue('Quick start | Angular Advanced Table Docs');

        strategy.updateTitle(
          createSnapshot(
            {
              description: 'Install and first table',
              ogType: 'article'
            },
            '/docs/quick-start#install'
          )
        );

        const tagContent = (selector: string): string | undefined => meta.getTag(selector)?.content;

        expect(title.getTitle()).toBe('Quick start | Angular Advanced Table Docs');
        expect(tagContent('name="description"')).toBe('Install and first table');
        expect(tagContent('property="og:title"')).toBe('Quick start | Angular Advanced Table Docs');
        expect(tagContent('property="og:description"')).toBe('Install and first table');
        expect(tagContent('property="og:type"')).toBe('article');
        expect(tagContent('property="og:url"')).toBe('/docs/quick-start');
      });
    });
  });
});
