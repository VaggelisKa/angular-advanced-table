import { Component, InjectionToken, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { Table } from '@tanstack/angular-table';
import type { NatTableUiController } from 'ng-advanced-table/testing';

import { provideNatTableRenderMetricsIntl } from 'ng-advanced-table/locale';
import type {
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsIntlStaticProviderConfig,
  NatTableRenderMetricsPanelIntl,
  RowRenderFilterOption
} from 'ng-advanced-table/locale';

import { NatRenderMetricsFilter } from './feature/filter/filter';
import { NatRenderMetricsPanel } from './feature/panel/panel';
import { NatTableRenderMetricsStore } from './utils/store';

type Row = {
  readonly id: string;
  readonly name: string;
};

const providerOptions: readonly RowRenderFilterOption[] = [
  {
    value: 'all',
    label: 'Provider all',
    description: 'Provider latest'
  },
  {
    value: 'fast',
    label: 'Provider fast',
    description: 'Provider under'
  },
  {
    value: 'watch',
    label: 'Provider watch',
    description: 'Provider middle'
  },
  {
    value: 'slow',
    label: 'Provider slow',
    description: 'Provider over'
  }
];

const providerPanelLabels: NatTableRenderMetricsPanelIntl = {
  ariaLabel: 'Provider row render sample',
  toneLabel: (tone) => `Provider ${tone}`,
  rowSampleSummary: ({ rowCountText }) => `Provider ${rowCountText} rows sampled`,
  duration: ({ durationMsText }) => `Provider ${durationMsText} ms`
};

const providerFilterLabels: NatTableRenderMetricsFilterIntl = {
  heading: 'Provider render speed',
  groupAriaLabel: 'Provider row render speed',
  rowSampleCaption: ({ rowCountText }) => `Provider ${rowCountText} visible rows`,
  options: providerOptions
};

const qaPanelLabels: NatTableRenderMetricsPanelIntl = {
  ariaLabel: 'QA row render sample',
  toneLabel: (tone) => `QA ${tone}`,
  rowSampleSummary: ({ rowCountText }) => `QA ${rowCountText} rows sampled`,
  duration: ({ durationMsText }) => `QA ${durationMsText} ms`
};

const reactiveOptions: readonly RowRenderFilterOption[] = providerOptions.map((option) => ({
  ...option,
  label: `Reactive ${option.value}`,
  description: `Reactive ${option.value} description`
}));

const reactiveRenderMetricsIntl: NatTableRenderMetricsIntlStaticProviderConfig = {
  formatNumber: (value) => `r${value}`,
  renderMetrics: {
    panel: {
      ariaLabel: 'Reactive row render sample',
      toneLabel: (tone) => `Reactive ${tone}`,
      rowSampleSummary: ({ rowCountText }) => `Reactive ${rowCountText} rows sampled`,
      duration: ({ durationMsText }) => `Reactive ${durationMsText} ms`
    },
    filter: {
      heading: 'Reactive render speed',
      groupAriaLabel: 'Reactive row render speed',
      rowSampleCaption: ({ rowCountText }) => `Reactive ${rowCountText} visible rows`,
      options: reactiveOptions
    }
  }
};

const createProviderRenderMetricsIntl = (): WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig> =>
  signal<NatTableRenderMetricsIntlStaticProviderConfig>({
    locales: {
      en: {
        formatNumber: (value) => `n${value}`,
        renderMetrics: {
          panel: providerPanelLabels,
          filter: providerFilterLabels
        }
      },
      qa: {
        formatNumber: (value) => `q${value}`,
        renderMetrics: {
          panel: qaPanelLabels
        }
      }
    }
  });

const PROVIDER_RENDER_METRICS_INTL = new InjectionToken<ReturnType<typeof createProviderRenderMetricsIntl>>(
  'PROVIDER_RENDER_METRICS_INTL'
);

@Component({
  selector: 'nat-test-host',
  imports: [NatRenderMetricsFilter, NatRenderMetricsPanel],
  providers: [
    { provide: PROVIDER_RENDER_METRICS_INTL, useFactory: createProviderRenderMetricsIntl },
    provideNatTableRenderMetricsIntl(() => inject(PROVIDER_RENDER_METRICS_INTL))
  ],
  template: `
    <nat-render-metrics-panel [controller]="controller" [labels]="panelLabels()" [locale]="panelLocale()" [store]="store" />
    <nat-render-metrics-filter [controller]="controller" [labels]="filterLabels()" [store]="store" />
  `
})
class RenderMetricsIntlHost {
  protected readonly store = new NatTableRenderMetricsStore();
  public readonly controllerLocale = signal('en');
  public readonly controller: NatTableUiController<Row> = {
    table: {
      getState: () => ({ columnFilters: [] })
    } as unknown as Table<Row>,
    localeId: this.controllerLocale,
    tableElementId: signal('nat-table-mock'),
    enableGlobalFilter: () => true,
    enablePagination: () => true,
    patchState: () => undefined
  };

  public readonly panelLabels = signal<NatTableRenderMetricsPanelIntl | undefined>(undefined);
  public readonly panelLocale = signal<string | undefined>(undefined);
  public readonly filterLabels = signal<NatTableRenderMetricsFilterIntl | undefined>(undefined);
  private readonly providerIntl = inject(PROVIDER_RENDER_METRICS_INTL);

  public constructor() {
    this.store.record({
      rowId: 'row-1',
      renderToken: 1,
      durationMs: 5.5
    });
  }

  public useReactiveProviderIntl(): void {
    this.providerIntl.set(reactiveRenderMetricsIntl);
  }
}

describe('FEATURE: render metrics intl components', () => {
  let fixture: ComponentFixture<RenderMetricsIntlHost>;
  let host: RenderMetricsIntlHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenderMetricsIntlHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(RenderMetricsIntlHost);
    host = fixture.componentInstance;
  });

  describe('GIVEN: render metrics components are configured with locale providers', () => {
    describe('WHEN: uses provider render-metrics labels and lets component inputs override them', () => {
      it('THEN: it reacts to provider labels and prefers component labels over provider defaults', async () => {
        await fixture.whenStable();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const panelHost = nativeElement.querySelector('nat-render-metrics-panel') as HTMLElement;
        const filterHost = nativeElement.querySelector('nat-render-metrics-filter') as HTMLElement;
        const panelComponent = fixture.debugElement.query(By.directive(NatRenderMetricsPanel))
          .componentInstance as NatRenderMetricsPanel;
        const filterComponent = fixture.debugElement.query(By.directive(NatRenderMetricsFilter))
          .componentInstance as NatRenderMetricsFilter;
        const panel = nativeElement.querySelector('.render-kpi') as HTMLElement;
        const duration = nativeElement.querySelector('.render-kpi strong') as HTMLElement;
        const detail = nativeElement.querySelector('.render-kpi-detail') as HTMLElement;
        const filterHeading = nativeElement.querySelector('.control-label') as HTMLElement;
        const filterCaption = nativeElement.querySelector('.control-caption') as HTMLElement;
        const filterGroup = nativeElement.querySelector('.chip-row') as HTMLElement;
        const firstChip = nativeElement.querySelector('.render-chip') as HTMLButtonElement;

        expect(panel.getAttribute('aria-label')).toBe('Provider row render sample');
        expect(duration.textContent.trim()).toBe('Provider n5.5 ms');
        expect(detail.textContent.trim()).toBe('Provider fast · Provider n1 rows sampled');
        expect(filterHeading.textContent.trim()).toBe('Provider render speed');
        expect(filterCaption.textContent.trim()).toBe('Provider n1 visible rows');
        expect(filterGroup.getAttribute('aria-label')).toBe('Provider row render speed');
        expect(firstChip.textContent).toContain('Provider all');
        expect(firstChip.textContent).toContain('Provider latest');

        host.useReactiveProviderIntl();
        await fixture.whenStable();

        expect(fixture.debugElement.query(By.directive(NatRenderMetricsPanel)).componentInstance as NatRenderMetricsPanel).toBe(
          panelComponent
        );
        expect(fixture.debugElement.query(By.directive(NatRenderMetricsFilter)).componentInstance as NatRenderMetricsFilter).toBe(
          filterComponent
        );
        expect(nativeElement.querySelector('nat-render-metrics-panel')).toBe(panelHost);
        expect(nativeElement.querySelector('nat-render-metrics-filter')).toBe(filterHost);
        expect(nativeElement.querySelector('.render-kpi')).toBe(panel);
        expect(nativeElement.querySelector('.chip-row')).toBe(filterGroup);
        expect(nativeElement.querySelector('.render-chip')).toBe(firstChip);
        expect(panel.getAttribute('aria-label')).toBe('Reactive row render sample');
        expect(duration.textContent.trim()).toBe('Reactive r5.5 ms');
        expect(detail.textContent.trim()).toBe('Reactive fast · Reactive r1 rows sampled');
        expect(filterHeading.textContent.trim()).toBe('Reactive render speed');
        expect(filterCaption.textContent.trim()).toBe('Reactive r1 visible rows');
        expect(filterGroup.getAttribute('aria-label')).toBe('Reactive row render speed');
        expect(firstChip.textContent).toContain('Reactive all');
        expect(firstChip.textContent).toContain('Reactive all description');

        host.panelLabels.set({
          ariaLabel: 'Input row render sample',
          toneLabel: () => 'Input tone'
        });
        host.filterLabels.set({
          heading: 'Input render speed'
        });
        await fixture.whenStable();

        expect(panel.getAttribute('aria-label')).toBe('Input row render sample');
        expect(detail.textContent.trim()).toBe('Input tone · Reactive r1 rows sampled');
        expect(filterHeading.textContent.trim()).toBe('Input render speed');
        expect(filterGroup.getAttribute('aria-label')).toBe('Reactive row render speed');
      });
    });
  });

  describe('GIVEN: render metrics components are configured with locale providers with table and panel render metrics locales', () => {
    describe('WHEN: uses the table locale for panel labels unless the panel locale input is set', () => {
      it('THEN: it resolves panel labels from locale inputs and table locale', async () => {
        host.controllerLocale.set('qa');

        await fixture.whenStable();

        const nativeElement = fixture.nativeElement as HTMLElement;
        const panel = nativeElement.querySelector('.render-kpi') as HTMLElement;
        const duration = nativeElement.querySelector('.render-kpi strong') as HTMLElement;
        const detail = nativeElement.querySelector('.render-kpi-detail') as HTMLElement;

        expect(panel.getAttribute('aria-label')).toBe('QA row render sample');
        expect(duration.textContent.trim()).toBe('QA q5.5 ms');
        expect(detail.textContent.trim()).toBe('QA fast · QA q1 rows sampled');

        host.panelLocale.set('en');

        await fixture.whenStable();

        expect(panel.getAttribute('aria-label')).toBe('Provider row render sample');
        expect(duration.textContent.trim()).toBe('Provider n5.5 ms');
        expect(detail.textContent.trim()).toBe('Provider fast · Provider n1 rows sampled');
      });
    });
  });
});
