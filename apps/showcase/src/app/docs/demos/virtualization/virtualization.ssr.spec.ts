import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';

import { Virtualization } from './virtualization';

const renderVirtualization = async (): Promise<string> =>
  renderApplication(
    async (context) =>
      bootstrapApplication(
        Virtualization,
        {
          providers: [provideZonelessChangeDetection(), provideClientHydration()]
        },
        context
      ),
    {
      allowedHosts: ['example.test'],
      document: '<!doctype html><html><head></head><body><app-virtualization></app-virtualization></body></html>',
      url: 'https://example.test/docs/virtualization'
    }
  );

const renderedRowIndexes = (html: string): string[] =>
  [...html.matchAll(/data-row-index="(\d+)"/g)].map((match) => match[1] as string);

describe('FEATURE: virtualized table server rendering', () => {
  describe('GIVEN: the ten-thousand-row showcase is rendered without a browser viewport', () => {
    describe('WHEN: two independent server renders create the bootstrap window', () => {
      it('THEN: they emit the same bounded logical rows and total ARIA row count', async () => {
        const firstHtml = await renderVirtualization();
        const secondHtml = await renderVirtualization();
        const firstIndexes = renderedRowIndexes(firstHtml);

        expect(firstIndexes.length).toBeGreaterThan(0);
        expect(firstIndexes.length).toBeLessThan(40);
        expect(firstIndexes).toStrictEqual(renderedRowIndexes(secondHtml));
        expect(firstHtml).toContain('aria-rowcount="10001"');
        expect(firstHtml).toContain('data-testid="nat-table-virtual-spacer"');
        expect(firstHtml).toContain('ngh=');
      });
    });
  });
});
