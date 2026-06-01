import { type ColumnDef } from '@tanstack/angular-table';

import {
  getNatTableHeaderActionsColumnState,
  isNatTableHeaderActionsWrapped,
} from './header-actions.helpers';
import { withNatTableHeaderActions } from './with-table-header-actions';

interface Row {
  id: string;
  name: string;
}

const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' },
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: {
      label: 'Actions',
      headerActions: false,
    },
  },
];

describe('withNatTableHeaderActions', () => {
  it('wraps sortable headers and marks columns as wrapped', () => {
    const [wrapped] = withNatTableHeaderActions(baseColumns);

    expect(typeof wrapped.header).toBe('function');
    expect(isNatTableHeaderActionsWrapped(wrapped)).toBe(true);
    expect(getNatTableHeaderActionsColumnState(wrapped)?.sourceHeader).toBe('Name');
  });

  it('is idempotent when applied more than once', () => {
    const once = withNatTableHeaderActions(baseColumns);
    const twice = withNatTableHeaderActions(once);

    expect(twice[0]).toBe(once[0]);
    expect(twice[0].header).toBe(once[0].header);
    expect(twice[1]).toBe(once[1]);
    expect(isNatTableHeaderActionsWrapped(twice[0])).toBe(true);
  });

  it('skips columns opted out through meta.headerActions', () => {
    const wrapped = withNatTableHeaderActions(baseColumns);

    expect(isNatTableHeaderActionsWrapped(wrapped[1])).toBe(false);
    expect(wrapped[1].header).toBe('Actions');
  });

  it('merges per-column accessibility label overrides', () => {
    const columns: ColumnDef<Row, unknown>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: {
          label: 'Name',
          headerActions: {
            accessibilityLabels: {
              menuButton: ({ label }) => `Custom menu for ${label}`,
            },
          },
        },
      },
    ];

    const wrapped = withNatTableHeaderActions(columns, {
      accessibilityLabels: {
        sortButton: ({ label }) => `Sort ${label}`,
      },
    });

    expect(typeof wrapped[0].header).toBe('function');
    expect(isNatTableHeaderActionsWrapped(wrapped[0])).toBe(true);
  });
});
