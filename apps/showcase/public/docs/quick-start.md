Using an AI assistant? Start with the `/nat-best-practises` skill so generated code follows the table API, state model, accessibility rules, and styling contract.

## Recommended Agent Setup

Install the table package and Angular companion peers:

```bash
pnpm add ng-advanced-table @angular/aria @angular/cdk
# or: npm install ng-advanced-table @angular/aria @angular/cdk
# or: yarn add ng-advanced-table @angular/aria @angular/cdk
```

Keep `@angular/core` and `@angular/common` in your Angular app dependencies. This installs the stable release; see [Release Channels](#release-channels) for the nightly channel.

Install the agent skill:

```bash
npx skills add VaggelisKa/angular-advanced-table --skill nat-best-practises
```

Start by asking for the table contract:

```text
Use /nat-best-practises to build an Angular table for invoices with columns for number, customer, status, and total. Start with the row type, row id, columns, and accessibility checks.
```

Review that contract before generating code.

## Manual Setup

If you are wiring the table by hand, start with `NatTable` inside `NatTableSurface`.

## First Table

Create rows and columns, then render `NatTable` inside `NatTableSurface`. Give every table an `accessibleName` or `caption`.

```ts
import { Component } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

interface PositionRow {
  id: string;
  symbol: string;
  company: string;
}

@Component({
  selector: 'app-positions-table',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [data]="rows" [columns]="columns" accessibleName="Open positions" />
    </nat-table-surface>
  `
})
export class PositionsTable {
  readonly rows: readonly PositionRow[] = [
    { id: 'pos-1', symbol: 'AAPL', company: 'Apple' },
    { id: 'pos-2', symbol: 'MSFT', company: 'Microsoft' }
  ];

  readonly columns = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true }
    },
    {
      accessorKey: 'company',
      header: 'Company',
      meta: { label: 'Company' }
    }
  ];
}
```

Rows with a string or number `id` property get stable table identity automatically. Use `getRowId` when identity lives somewhere else.

The table above is visually headless: it inherits page colors and system defaults. For the polished stock look, `import 'ng-advanced-table/components/theme.css'` once (see `/docs/theming`), or theme it yourself with `--nat-table-*` tokens.

## Core-Only Scope

For a core-only table, provide `NatTableService` at the local wrapper that owns the table. Use `NatTableSurface` for the standard scoped controller and companion-control wiring.

```ts
import { Component } from '@angular/core';
import { NatTable, NatTableService } from 'ng-advanced-table';

interface PositionRow {
  id: string;
  symbol: string;
}

@Component({
  selector: 'app-core-only-table',
  imports: [NatTable],
  providers: [NatTableService],
  template: ` <nat-table [data]="rows" [columns]="columns" accessibleName="Core-only positions" /> `
})
export class CoreOnlyTable {
  readonly rows: readonly PositionRow[] = [];
  readonly columns = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true }
    }
  ];
}
```

## Add Companion Controls

Use `ng-advanced-table/components` when you want pagination controls, column visibility, horizontal scroll controls, toolbar behavior, header actions, selection checkbox columns, or export actions.

```ts
import { Component, signal } from '@angular/core';

import { NatTable, type NatTableUserState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  withNatTableHeaderActions
} from 'ng-advanced-table/components';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
}

@Component({
  selector: 'app-positions-table',
  imports: [NatTable, NatTableColumnVisibility, NatTablePagination, NatTableScrollControl, NatTableSurface],
  template: `
    <nat-table-surface [enableSorting]="true" [enablePinning]="true" [initialState]="initialState">
      <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

      <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />

      <nat-table-scroll-control />
      <nat-table-column-visibility />
    </nat-table-surface>
  `
})
export class PositionsTable {
  readonly rows = signal<readonly PositionRow[]>([]);
  readonly initialState: Partial<NatTableUserState> = {
    pagination: { pageIndex: 0, pageSize: 25 }
  };

  readonly columns = withNatTableHeaderActions([
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true }
    },
    {
      accessorKey: 'desk',
      header: 'Desk',
      meta: { label: 'Desk' }
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: { label: 'Price', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toFixed(2)}`
    }
  ]);
}
```

`NatTableSurface` provides the scoped table controller used by companion controls. Controls inside the same surface can read table state, patch state, bind `aria-controls`, and resolve locale labels without extra wiring.

## Authoring Defaults

Start with these defaults unless the feature needs something else:

| Need                       | Default choice                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Table identity             | `accessibleName` or visible `caption`                                              |
| Row identity               | String or number `row.id`; `getRowId` for custom, composite, or nested identifiers |
| Column labels              | `meta.label` on every column                                                       |
| Row header                 | `meta.rowHeader: true` on the primary identifying column                           |
| Numeric columns            | `meta.align: 'end'`                                                                |
| Initial page size or sort  | `[initialState]`                                                                   |
| Persisting one state slice | `[state]` with only that slice plus the matching `*Change` output                  |
| Search and domain filters  | Consumer-owned controls that patch table state                                     |
| Loading, empty, and error  | `dataStatus` plus `natTableLoading`, `natTableEmpty`, or `natTableError` templates |

## Release Channels

The package publishes on two npm dist-tags.

| Tag      | Install                        | What it is                                                                                   |
| -------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| `latest` | `npm i ng-advanced-table`      | Stable releases, cut weekly on Friday. The default — you get this unless you ask for `next`. |
| `next`   | `npm i ng-advanced-table@next` | A snapshot of `main`, published on every green commit.                                       |

Nightly versions look like `2.13.0-next.7`, where the base is the version the next stable release is currently headed for — it reflects the largest pending change, so a nightly carrying a new feature reads as `2.13.0-next.…` and one carrying only fixes as `2.12.2-next.…` — and the counter is the number of commits since the last stable release. They are semver prereleases, so a range such as `^2.12.0` never resolves to one — opting in is always explicit. Each nightly carries an npm provenance attestation, so you can trace a published version back to the exact commit and CI run it was built from.

Use `next` to try an unreleased fix or feature, or to check a change against your app before it ships. It is built from the same CI-verified commit as `main`, but its API is not frozen: anything in a nightly can change or be removed before the next stable release. Pin the exact version rather than tracking the tag if you depend on one in CI.

### What is in a nightly

Nightlies have no changelog of their own — a snapshot is a single commit, and the same prose becomes a changelog entry when a stable release is cut. To see what a nightly contains ahead of that, the Nightly workflow run summarises it: it lists the pending release notes and links a full comparison against the last stable tag. The [`CHANGELOG`](https://github.com/VaggelisKa/angular-advanced-table/blob/main/libs/ng-advanced-table/CHANGELOG.md) remains the record for released versions.

## Next Steps

- Use `/docs/columns` for column metadata, sizing, custom cell components, header actions, and row activation.
- Use `/docs/state` for controlled and uncontrolled state patterns.
- Use `/docs/data-lifecycle` for loading, empty, error, background refresh, and Manual Data Handling.
- Use `/docs/filtering-search` for search and filtering controls.
- Use `/docs/row-selection` for selection checkboxes and bulk state.
- Use `/docs/export` for CSV defaults and custom export handlers.
