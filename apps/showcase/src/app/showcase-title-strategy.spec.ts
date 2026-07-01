import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { PRIMARY_OUTLET } from '@angular/router';
import type { RouterStateSnapshot } from '@angular/router';

import { ShowcaseTitleStrategy } from './showcase-title-strategy';

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

describe('FEATURE: ShowcaseTitleStrategy', () => {
  let strategy: ShowcaseTitleStrategy;
  let meta: Meta;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShowcaseTitleStrategy]
    });

    strategy = TestBed.inject(ShowcaseTitleStrategy);
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

        expect(title.getTitle()).toBe('Quick start | Angular Advanced Table Docs');
        expect(meta.getTag('name="description"')?.content).toBe('Install and first table');
        expect(meta.getTag('property="og:title"')?.content).toBe('Quick start | Angular Advanced Table Docs');
        expect(meta.getTag('property="og:description"')?.content).toBe('Install and first table');
        expect(meta.getTag('property="og:type"')?.content).toBe('article');
        expect(meta.getTag('property="og:url"')?.content).toBe('/docs/quick-start');
      });
    });
  });
});
