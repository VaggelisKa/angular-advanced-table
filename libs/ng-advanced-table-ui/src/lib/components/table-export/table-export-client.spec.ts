import { describe, expect, it } from 'vitest';

import { createNatTableCsvBlob, normalizeNatTableCsvFileName } from './table-export-client';
import type { NatTableExportData } from './table-export.types';

describe('table export CSV client', () => {
  it('serializes export data as UTF-8 CSV with escaping and spreadsheet formula guards', async () => {
    const data: NatTableExportData = {
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'amount', header: 'Amount' },
        { id: 'created', header: 'Created' },
      ],
      rows: [
        {
          id: 'row-1',
          values: ['Alpha, "Beta"', 12.5, new Date(Date.UTC(2026, 0, 2, 3, 4, 5))],
        },
        {
          id: 'row-2',
          values: ['=SUM(A1:A2)', null, false],
        },
      ],
    };

    const blob = createNatTableCsvBlob(data);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    expect([...bytes.slice(0, 3)]).toStrictEqual([0xef, 0xbb, 0xbf]);
    await expect(blob.text()).resolves.toBe(
      'Name,Amount,Created\r\n' +
        '"Alpha, ""Beta""",12.5,2026-01-02T03:04:05.000Z\r\n' +
        "'=SUM(A1:A2),,false",
    );
  });

  it('appends the csv extension only when missing', () => {
    expect(normalizeNatTableCsvFileName('orders')).toBe('orders.csv');
    expect(normalizeNatTableCsvFileName('orders.CSV')).toBe('orders.CSV');
  });
});
