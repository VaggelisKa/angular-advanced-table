import type { ColumnDef } from '@tanstack/angular-table';

import { withRenderMetricsColumn } from './column';
import { NatTableRenderMetricsStore } from './store';
import { RENDER_METRIC_COLUMN_ID } from './types';

interface Row {
  id: string;
  name: string;
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
});
