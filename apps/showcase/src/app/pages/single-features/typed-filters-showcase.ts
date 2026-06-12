import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
} from '@tanstack/angular-table';
import {
  NatTable,
  natTypedFilterFn,
  type NatTableColumnFilterValue,
  type NatTableFilterOperator,
  type NatTableState,
} from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800,
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
  { id: 'item-7', name: 'Eta Collector', category: 'Analytics', status: 'Paused', value: 2600 },
  { id: 'item-8', name: 'Theta Relay', category: 'Infrastructure', status: 'Halted', value: 6400 },
];

const STATUS_OPTIONS = ['Active', 'Paused', 'Alert', 'Halted'] as const;

// `natTypedFilterFn` is published as `FilterFn<RowData>`; narrow it once for this page's row type.
const typedFilter = natTypedFilterFn as FilterFn<DemoItem>;

type NameOperator = Extract<NatTableFilterOperator, 'contains' | 'startsWith' | 'equals'>;
type ValueOperator = Extract<NatTableFilterOperator, 'gt' | 'lt' | 'between'>;

const NAME_OPERATOR_LABELS: Record<NameOperator, string> = {
  contains: 'Contains',
  startsWith: 'Starts with',
  equals: 'Equals',
};

const VALUE_OPERATOR_LABELS: Record<ValueOperator, string> = {
  gt: 'Greater than',
  lt: 'Less than',
  between: 'Between',
};

@Component({
  selector: 'app-typed-filters-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Typed Column Filters</h1>
        <p class="description">
          Demonstrates declarative typed filters: columns describe their filter through
          <code>meta.filter</code> and share the <code>natTypedFilterFn</code> predicate, so one
          panel can drive text, number, and set filters across several columns at once.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Filtered Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              accessibleName="Typed filters demo table"
            />
          </nat-table-surface>

          <p class="instructions">
            Keyboard: <strong>Tab</strong> moves through the filter controls and into the grid,
            <strong>Arrow</strong> keys move between cells, <strong>Enter</strong> steps into a
            cell's controls, and <strong>Escape</strong> returns focus to the cell. Filter changes
            are announced to screen readers as you type.
          </p>
        </div>

        <div class="card">
          <h2 class="card-title">Filter Panel</h2>

          <div class="filter-panel">
            <fieldset class="filter-group">
              <legend class="filter-group-title">Name (text)</legend>
              <div class="filter-field">
                <label class="filter-label" for="typed-filter-name-operator">Operator</label>
                <select
                  class="filter-control"
                  id="typed-filter-name-operator"
                  [value]="nameOperator()"
                  (change)="onNameOperatorChange($event)"
                >
                  @for (operator of nameOperators; track operator) {
                    <option [value]="operator">{{ nameOperatorLabels[operator] }}</option>
                  }
                </select>
              </div>
              <div class="filter-field">
                <label class="filter-label" for="typed-filter-name-query">Search text</label>
                <input
                  class="filter-control"
                  id="typed-filter-name-query"
                  type="text"
                  placeholder="e.g. alpha"
                  [value]="nameQuery()"
                  (input)="onNameQueryInput($event)"
                />
              </div>
            </fieldset>

            <fieldset class="filter-group">
              <legend class="filter-group-title">Value (number)</legend>
              <div class="filter-field">
                <label class="filter-label" for="typed-filter-value-operator">Operator</label>
                <select
                  class="filter-control"
                  id="typed-filter-value-operator"
                  [value]="valueOperator()"
                  (change)="onValueOperatorChange($event)"
                >
                  @for (operator of valueOperators; track operator) {
                    <option [value]="operator">{{ valueOperatorLabels[operator] }}</option>
                  }
                </select>
              </div>
              @if (valueOperator() === 'between') {
                <div class="filter-field">
                  <label class="filter-label" for="typed-filter-value-from">From</label>
                  <input
                    class="filter-control"
                    id="typed-filter-value-from"
                    type="number"
                    placeholder="e.g. 1000"
                    [value]="valueFrom()"
                    (input)="onValueFromInput($event)"
                  />
                </div>
                <div class="filter-field">
                  <label class="filter-label" for="typed-filter-value-to">To</label>
                  <input
                    class="filter-control"
                    id="typed-filter-value-to"
                    type="number"
                    placeholder="e.g. 8000"
                    [value]="valueTo()"
                    (input)="onValueToInput($event)"
                  />
                </div>
              } @else {
                <div class="filter-field">
                  <label class="filter-label" for="typed-filter-value-bound">Value</label>
                  <input
                    class="filter-control"
                    id="typed-filter-value-bound"
                    type="number"
                    placeholder="e.g. 3000"
                    [value]="valueFrom()"
                    (input)="onValueFromInput($event)"
                  />
                </div>
              }
            </fieldset>

            <fieldset class="filter-group">
              <legend class="filter-group-title">Status (set)</legend>
              @for (status of statusOptions; track status) {
                <label class="toggle-label filter-option">
                  <input
                    type="checkbox"
                    [checked]="selectedStatuses().includes(status)"
                    (change)="onStatusToggle(status, $event)"
                  />
                  {{ status }}
                </label>
              }
            </fieldset>
          </div>

          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="clearFilters()">
              Clear all filters
            </button>
          </div>

          <div class="info-tag">
            @if (activeFilterSummaries().length) {
              Active filters: {{ activeFilterSummaries().join('; ') }}
            } @else {
              Active filters: none
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .filter-panel {
      display: grid;
      gap: 14px;
      padding: 16px 20px 0;
    }

    .filter-group {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 12px 14px 14px;
      border: 1px solid var(--showcase-page-border);
      border-radius: var(--showcase-page-radius-sm);
    }

    .filter-group-title {
      padding: 0 4px;
      color: var(--showcase-page-text);
      font-size: 0.82rem;
      font-weight: 650;
    }

    .filter-field {
      display: grid;
      gap: 4px;
    }

    .filter-label {
      color: var(--showcase-page-text);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .filter-control {
      padding: 8px 10px;
      border: 1px solid var(--showcase-page-border-strong, var(--showcase-page-border));
      border-radius: var(--showcase-page-radius-sm);
      background: var(--showcase-page-surface-contrast);
      color: var(--showcase-page-text);
      font: inherit;
      font-size: 0.85rem;
    }

    .filter-control:focus-visible {
      outline: 2px solid var(--showcase-page-accent);
      outline-offset: 1px;
    }

    .filter-option {
      font-weight: 500;
    }
  `,
})
export class TypedFiltersShowcasePage {
  readonly data = DEMO_DATA;

  readonly nameOperators: readonly NameOperator[] = ['contains', 'startsWith', 'equals'];
  readonly nameOperatorLabels = NAME_OPERATOR_LABELS;
  readonly valueOperators: readonly ValueOperator[] = ['gt', 'lt', 'between'];
  readonly valueOperatorLabels = VALUE_OPERATOR_LABELS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      filterFn: typedFilter,
      meta: {
        label: 'Name',
        rowHeader: true,
        filter: { type: 'text', operators: ['contains', 'startsWith', 'equals'] },
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: typedFilter,
      meta: {
        label: 'Status',
        filter: { type: 'set', operators: ['in'], options: STATUS_OPTIONS },
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      filterFn: typedFilter,
      meta: {
        label: 'Value',
        align: 'end',
        filter: { type: 'number', operators: ['gt', 'lt', 'between'] },
      },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ]);

  readonly nameOperator = signal<NameOperator>('contains');
  readonly nameQuery = signal('');
  readonly valueOperator = signal<ValueOperator>('gt');
  readonly valueFrom = signal('');
  readonly valueTo = signal('');
  readonly selectedStatuses = signal<readonly string[]>([]);

  readonly columnFilters = computed<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];

    const query = this.nameQuery().trim();
    if (query) {
      filters.push({
        id: 'name',
        value: { operator: this.nameOperator(), value: query } satisfies NatTableColumnFilterValue,
      });
    }

    const operator = this.valueOperator();
    const from = this.valueFrom().trim();
    const to = this.valueTo().trim();
    if (operator === 'between') {
      if (from !== '' || to !== '') {
        filters.push({
          id: 'value',
          value: {
            operator,
            value: [from === '' ? null : Number(from), to === '' ? null : Number(to)],
          } satisfies NatTableColumnFilterValue,
        });
      }
    } else if (from !== '') {
      filters.push({
        id: 'value',
        value: { operator, value: Number(from) } satisfies NatTableColumnFilterValue,
      });
    }

    const statuses = this.selectedStatuses();
    if (statuses.length) {
      filters.push({
        id: 'status',
        value: { operator: 'in', value: statuses } satisfies NatTableColumnFilterValue,
      });
    }

    return filters;
  });

  readonly tableState = computed<Partial<NatTableState>>(() => ({
    columnFilters: this.columnFilters(),
  }));

  readonly activeFilterSummaries = computed<readonly string[]>(() => {
    const summaries: string[] = [];

    const query = this.nameQuery().trim();
    if (query) {
      summaries.push(`Name ${NAME_OPERATOR_LABELS[this.nameOperator()].toLowerCase()} "${query}"`);
    }

    const operator = this.valueOperator();
    const from = this.valueFrom().trim();
    const to = this.valueTo().trim();
    if (operator === 'between' && (from !== '' || to !== '')) {
      summaries.push(`Value between ${from || 'open'} and ${to || 'open'}`);
    } else if (operator !== 'between' && from !== '') {
      summaries.push(`Value ${VALUE_OPERATOR_LABELS[operator].toLowerCase()} ${from}`);
    }

    const statuses = this.selectedStatuses();
    if (statuses.length) {
      summaries.push(`Status in ${statuses.join(', ')}`);
    }

    return summaries;
  });

  onNameOperatorChange(event: Event): void {
    this.nameOperator.set((event.target as HTMLSelectElement).value as NameOperator);
  }

  onNameQueryInput(event: Event): void {
    this.nameQuery.set((event.target as HTMLInputElement).value);
  }

  onValueOperatorChange(event: Event): void {
    this.valueOperator.set((event.target as HTMLSelectElement).value as ValueOperator);
  }

  onValueFromInput(event: Event): void {
    this.valueFrom.set((event.target as HTMLInputElement).value);
  }

  onValueToInput(event: Event): void {
    this.valueTo.set((event.target as HTMLInputElement).value);
  }

  onStatusToggle(status: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedStatuses.update((current) =>
      checked ? [...current, status] : current.filter((entry) => entry !== status),
    );
  }

  clearFilters(): void {
    this.nameQuery.set('');
    this.valueFrom.set('');
    this.valueTo.set('');
    this.selectedStatuses.set([]);
  }
}
