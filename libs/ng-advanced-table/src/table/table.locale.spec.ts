import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NAT_DA_LOCALE_LABELS, provideNatTableLocales } from 'ng-advanced-table/locale';

import { NatTable } from './table';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-locale-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface [locale]="locale()">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations" />
    </nat-table-surface>
  `
})
class LocaleHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly locale = signal<string | undefined>(undefined);
}

describe('FEATURE: NatTable locale registration', () => {
  let warnings: string[];

  beforeEach(() => {
    warnings = [];
    vi.spyOn(console, 'warn').mockImplementation((message: unknown) => {
      warnings.push(String(message));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithLocale = async (locale: string | undefined, providers: unknown[] = []): Promise<ComponentFixture<LocaleHost>> => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...providers]
    }).compileComponents();

    const fixture = TestBed.createComponent(LocaleHost);

    fixture.componentInstance.locale.set(locale);
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  };

  // The zoneless test harness logs NG0914 of its own, so only this feature's warnings are asserted.
  const localeWarnings = (): string[] => warnings.filter((warning) => warning.includes('[ng-advanced-table] locale'));

  const summaryText = (fixture: ComponentFixture<LocaleHost>): string =>
    queryRequired(fixture, '[data-testid="nat-table-summary"]').textContent.trim();

  describe('GIVEN: a locale id that no provider registered', () => {
    describe('WHEN: the surface requests it', () => {
      it('THEN: it warns naming the id and the provider that registers it', async () => {
        await renderWithLocale('da');

        expect(localeWarnings().some((warning) => warning.includes('locale "da" has no dictionary registered'))).toBe(true);
        expect(localeWarnings().some((warning) => warning.includes('provideNatTableLocales'))).toBe(true);
      });

      it('THEN: it falls back to the built-in English copy', async () => {
        const fixture = await renderWithLocale('fi');

        expect(summaryText(fixture).startsWith('Showing ')).toBe(true);
      });
    });
  });

  describe('GIVEN: two tables bound to the same unregistered locale id', () => {
    describe('WHEN: both render', () => {
      it('THEN: it warns once for the id, not once per table', async () => {
        await renderWithLocale('nb');

        const second = TestBed.createComponent(LocaleHost);

        second.componentInstance.locale.set('nb');
        await second.whenStable();
        second.detectChanges();

        expect(localeWarnings().filter((warning) => warning.includes('"nb"'))).toHaveLength(1);
      });
    });
  });

  describe('GIVEN: a locale registered through provideNatTableLocales', () => {
    describe('WHEN: the surface requests it', () => {
      it('THEN: it renders that dictionary without warning', async () => {
        const fixture = await renderWithLocale('da', provideNatTableLocales({ da: NAT_DA_LOCALE_LABELS }));

        expect(summaryText(fixture).startsWith('Viser ')).toBe(true);
        expect(localeWarnings()).toStrictEqual([]);
      });
    });
  });

  describe('GIVEN: no locale on the surface', () => {
    describe('WHEN: the table renders with built-in defaults', () => {
      it('THEN: it uses English copy without warning', async () => {
        const fixture = await renderWithLocale(undefined);

        expect(summaryText(fixture).startsWith('Showing ')).toBe(true);
        expect(localeWarnings()).toStrictEqual([]);
      });
    });
  });
});
