import { Component, inject, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Table } from '@tanstack/angular-table';
import { NatTableService, type NatTableUiController } from 'ng-advanced-table';

import { NatRenderMetricsFilter } from './filter';
import {
  provideNatTableUtilsIntl,
  type NatTableRenderMetricsFilterIntl,
  type NatTableRenderMetricsPanelIntl,
} from './intl';
import { NatRenderMetricsPanel } from './panel';
import { NatTableRenderMetricsStore } from './store';
import type { RowRenderFilterOption } from './types';

interface Row {
  id: string;
  name: string;
}

const providerOptions: readonly RowRenderFilterOption[] = [
  {
    value: 'all',
    label: 'Provider all',
    description: 'Provider latest',
  },
  {
    value: 'fast',
    label: 'Provider fast',
    description: 'Provider under',
  },
  {
    value: 'watch',
    label: 'Provider watch',
    description: 'Provider middle',
  },
  {
    value: 'slow',
    label: 'Provider slow',
    description: 'Provider over',
  },
];

@Component({
  imports: [NatRenderMetricsFilter, NatRenderMetricsPanel],
  providers: [
    NatTableService,
    provideNatTableUtilsIntl({
      formatNumber: (value) => `n${value}`,
      renderMetrics: {
        panel: {
          ariaLabel: 'Provider row render sample',
          toneLabel: (tone) => `Provider ${tone}`,
          rowSampleSummary: ({ rowCountText }) => `Provider ${rowCountText} rows sampled`,
          duration: ({ durationMsText }) => `Provider ${durationMsText} ms`,
        },
        filter: {
          heading: 'Provider render speed',
          groupAriaLabel: 'Provider row render speed',
          rowSampleCaption: ({ rowCountText }) => `Provider ${rowCountText} visible rows`,
          options: providerOptions,
        },
      },
    }),
  ],
  template: `
    <nat-render-metrics-panel [store]="store" [labels]="panelLabels()" />
    <nat-render-metrics-filter [store]="store" [labels]="filterLabels()" />
  `,
})
class RenderMetricsIntlHost {
  readonly store = new NatTableRenderMetricsStore();
  readonly controller: NatTableUiController<Row> = {
    table: {
      getState: () => ({ columnFilters: [] }),
    } as unknown as Table<Row>,
    tableElementId: signal('nat-table-mock'),
    enableGlobalFilter: () => true,
    enablePagination: () => true,
    patchState: () => undefined,
  };
  readonly panelLabels = signal<NatTableRenderMetricsPanelIntl | undefined>(undefined);
  readonly filterLabels = signal<NatTableRenderMetricsFilterIntl | undefined>(undefined);

  private readonly natTableService = inject(NatTableService);

  constructor() {
    this.natTableService.setController(this.controller);
    this.store.record({
      rowId: 'row-1',
      renderToken: 1,
      durationMs: 5.5,
    });
  }
}

describe('render metrics intl components', () => {
  let fixture: ComponentFixture<RenderMetricsIntlHost>;
  let host: RenderMetricsIntlHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RenderMetricsIntlHost],
      providers: [provideZonelessChangeDetection()],
    });

    fixture = TestBed.createComponent(RenderMetricsIntlHost);
    host = fixture.componentInstance;
  });

  it('uses provider render-metrics labels and lets component inputs override them', () => {
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const panel = nativeElement.querySelector('.render-kpi') as HTMLElement;
    const duration = nativeElement.querySelector('.render-kpi strong') as HTMLElement;
    const detail = nativeElement.querySelector('.render-kpi-detail') as HTMLElement;
    const filterHeading = nativeElement.querySelector('.control-label') as HTMLElement;
    const filterCaption = nativeElement.querySelector('.control-caption') as HTMLElement;
    const filterGroup = nativeElement.querySelector('.chip-row') as HTMLElement;
    const firstChip = nativeElement.querySelector('.render-chip') as HTMLButtonElement;

    expect(panel.getAttribute('aria-label')).toBe('Provider row render sample');
    expect(duration.textContent?.trim()).toBe('Provider n5.5 ms');
    expect(detail.textContent?.trim()).toBe('Provider watch · Provider n1 rows sampled');
    expect(filterHeading.textContent?.trim()).toBe('Provider render speed');
    expect(filterCaption.textContent?.trim()).toBe('Provider n1 visible rows');
    expect(filterGroup.getAttribute('aria-label')).toBe('Provider row render speed');
    expect(firstChip.textContent).toContain('Provider all');
    expect(firstChip.textContent).toContain('Provider latest');

    host.panelLabels.set({
      ariaLabel: 'Input row render sample',
      toneLabel: () => 'Input tone',
    });
    host.filterLabels.set({
      heading: 'Input render speed',
    });
    fixture.detectChanges();

    expect(panel.getAttribute('aria-label')).toBe('Input row render sample');
    expect(detail.textContent?.trim()).toBe('Input tone · Provider n1 rows sampled');
    expect(filterHeading.textContent?.trim()).toBe('Input render speed');
    expect(filterGroup.getAttribute('aria-label')).toBe('Provider row render speed');
  });
});
