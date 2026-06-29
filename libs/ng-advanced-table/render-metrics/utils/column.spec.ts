import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';

import { provideNatTableUtilsIntl } from 'ng-advanced-table/locale';

import { withRenderMetricsColumn } from './column';
import { NatTableRenderMetricsStore } from './store';
import { RENDER_METRIC_COLUMN_ID } from '../common/type';

type Row = {
  readonly id: string;
  readonly name: string;
};

@Component({
  providers: [
    provideNatTableUtilsIntl({
      formatNumber: (value) => `n${value}`,
      renderMetrics: {
        column: {
          header: 'Provider paint',
          pendingLabel: 'Provider pending',
          duration: ({ durationMsText }) => `Provider ${durationMsText}`
        }
      }
    })
  ],
  selector: 'nat-test-host',
  template: ''
})
class ProviderColumnHost {
  public readonly store = new NatTableRenderMetricsStore();
  public readonly columns = withRenderMetricsColumn<Row>([], this.store);
  public readonly columnsWithOptions = withRenderMetricsColumn<Row>([], this.store, {
    header: 'Input paint',
    pendingLabel: 'Input pending',
    duration: ({ durationMsText }) => `Input ${durationMsText}`
  });
}

const requireDefined = <T>(value: T | undefined): T => {
  if (value === undefined) {
    throw new Error('Expected value to be defined.');
  }

  return value;
};

const renderMetricsCell = (column: ColumnDef<Row, unknown> | undefined, rowId: string): unknown => {
  if (!column || typeof column.cell !== 'function') {
    throw new Error('Expected metrics column cell renderer.');
  }

  return column.cell({
    row: {
      id: rowId
    }
  } as CellContext<Row, unknown>);
};

describe('FEATURE: withRenderMetricsColumn', () => {
  describe('GIVEN: render metrics column helpers are configured', () => {
    describe('WHEN: sets TanStack sizing defaults', () => {
      it('THEN: it adds default sizing values to the metrics column', () => {
        const columns = withRenderMetricsColumn<Row>([], new NatTableRenderMetricsStore());
        const metricsColumn = requireDefined(columns.at(-1));

        expect(metricsColumn.id).toBe(RENDER_METRIC_COLUMN_ID);
        expect(metricsColumn.size).toBe(110);
        expect(metricsColumn.minSize).toBe(80);
        expect(metricsColumn.maxSize).toBeUndefined();
      });
    });
  });

  describe('GIVEN: render metrics column helpers are configured with metrics column sizing options', () => {
    describe('WHEN: keeps TanStack sizing options on the metrics column', () => {
      it('THEN: it preserves explicit sizing values on the metrics column', () => {
        const baseColumns: ColumnDef<Row, unknown>[] = [
          {
            accessorKey: 'name',
            header: 'Name',
            meta: { label: 'Name' }
          }
        ];
        const columns = withRenderMetricsColumn<Row>(baseColumns, new NatTableRenderMetricsStore(), {
          header: 'Paint',
          size: 144,
          minSize: 96,
          maxSize: 180
        });
        const metricsColumn = requireDefined(columns.at(-1));
        const meta = requireDefined(metricsColumn.meta);

        expect(columns[0]).toBe(baseColumns[0]);
        expect(metricsColumn.header).toBe('Paint');
        expect(metricsColumn.size).toBe(144);
        expect(metricsColumn.minSize).toBe(96);
        expect(metricsColumn.maxSize).toBe(180);
        expect(meta.label).toBe('Paint');
        expect(meta.align).toBe('end');
      });
    });
  });

  describe('GIVEN: render metrics column helpers are configured with provider and per-call column defaults', () => {
    describe('WHEN: uses provider column defaults and lets per-call options override them', () => {
      it('THEN: it merges provider defaults with per-call overrides', () => {
        TestBed.configureTestingModule({
          imports: [ProviderColumnHost],
          providers: [provideZonelessChangeDetection()]
        });
        const fixture = TestBed.createComponent(ProviderColumnHost);
        const host = fixture.componentInstance;

        const providerColumn = requireDefined(host.columns.at(-1));
        const optionsColumn = requireDefined(host.columnsWithOptions.at(-1));
        const providerMeta = requireDefined(providerColumn.meta);

        expect(providerColumn.header).toBe('Provider paint');
        expect(providerMeta.label).toBe('Provider paint');
        expect(renderMetricsCell(providerColumn, 'row-1')).toBe('Provider pending');

        host.store.record({
          rowId: 'row-1',
          renderToken: 1,
          durationMs: 12.3
        });

        expect(renderMetricsCell(providerColumn, 'row-1')).toBe('Provider n12.3');
        expect(optionsColumn.header).toBe('Input paint');
        expect(renderMetricsCell(optionsColumn, 'missing')).toBe('Input pending');
        expect(renderMetricsCell(optionsColumn, 'row-1')).toBe('Input n12.3');
      });
    });
  });
});
