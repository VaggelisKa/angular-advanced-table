import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { withRenderMetricsColumn } from './column';
import { provideNatTableUtilsIntl } from './intl';
import { NatTableRenderMetricsStore } from './store';
import { RENDER_METRIC_COLUMN_ID } from './types';

interface Row {
  id: string;
  name: string;
}

@Component({
  providers: [
    provideNatTableUtilsIntl({
      formatNumber: (value) => `n${value}`,
      renderMetrics: {
        column: {
          header: 'Provider paint',
          pendingLabel: 'Provider pending',
          duration: ({ durationMsText }) => `Provider ${durationMsText}`,
        },
      },
    }),
  ],
  template: '',
})
class ProviderColumnHost {
  readonly store = new NatTableRenderMetricsStore();
  readonly columns = withRenderMetricsColumn<Row>([], this.store);
  readonly columnsWithOptions = withRenderMetricsColumn<Row>([], this.store, {
    header: 'Input paint',
    pendingLabel: 'Input pending',
    duration: ({ durationMsText }) => `Input ${durationMsText}`,
  });
}

describe('withRenderMetricsColumn', () => {
  it('sets TanStack sizing defaults', () => {
    const columns = withRenderMetricsColumn<Row>([], new NatTableRenderMetricsStore());
    const metricsColumn = columns.at(-1);

    expect(metricsColumn?.id).toBe(RENDER_METRIC_COLUMN_ID);
    expect(metricsColumn?.size).toBe(110);
    expect(metricsColumn?.minSize).toBe(80);
    expect(metricsColumn?.maxSize).toBeUndefined();
  });

  it('keeps TanStack sizing options on the metrics column', () => {
    const baseColumns: ColumnDef<Row, unknown>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { label: 'Name' },
      },
    ];
    const columns = withRenderMetricsColumn<Row>(baseColumns, new NatTableRenderMetricsStore(), {
      header: 'Paint',
      size: 144,
      minSize: 96,
      maxSize: 180,
    });
    const metricsColumn = columns.at(-1);

    expect(columns[0]).toBe(baseColumns[0]);
    expect(metricsColumn?.header).toBe('Paint');
    expect(metricsColumn?.size).toBe(144);
    expect(metricsColumn?.minSize).toBe(96);
    expect(metricsColumn?.maxSize).toBe(180);
    expect(metricsColumn?.meta?.label).toBe('Paint');
    expect(metricsColumn?.meta?.align).toBe('end');
  });

  it('uses provider column defaults and lets per-call options override them', () => {
    TestBed.configureTestingModule({
      imports: [ProviderColumnHost],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ProviderColumnHost);
    const host = fixture.componentInstance;

    const providerColumn = host.columns.at(-1);
    const optionsColumn = host.columnsWithOptions.at(-1);

    expect(providerColumn?.header).toBe('Provider paint');
    expect(providerColumn?.meta?.label).toBe('Provider paint');
    expect(renderMetricsCell(providerColumn, 'row-1')).toBe('Provider pending');

    host.store.record({
      rowId: 'row-1',
      renderToken: 1,
      durationMs: 12.3,
    });

    expect(renderMetricsCell(providerColumn, 'row-1')).toBe('Provider n12.3');
    expect(optionsColumn?.header).toBe('Input paint');
    expect(renderMetricsCell(optionsColumn, 'missing')).toBe('Input pending');
    expect(renderMetricsCell(optionsColumn, 'row-1')).toBe('Input n12.3');
  });
});

function renderMetricsCell(column: ColumnDef<Row, unknown> | undefined, rowId: string): unknown {
  if (!column || typeof column.cell !== 'function') {
    throw new Error('Expected metrics column cell renderer.');
  }

  return column.cell({
    row: {
      id: rowId,
    },
  } as CellContext<Row, unknown>);
}
