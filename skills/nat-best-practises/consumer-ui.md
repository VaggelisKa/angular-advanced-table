# Consumer UI Integration

Put product controls in the app: search, filters, bulk actions, density, refresh, route state, analytics, and destructive actions.

## Integration Choices

- Put controls inside `<nat-table-surface>` when they need the active table controller through dependency injection.
- Inject the public `NatTableService` from `ng-advanced-table` in descendant controls that need table state.
- Use typed controller commands (`setGlobalFilter`, `setColumnFilter`, `setPageSize`, `goToPage`, `nextPage`, `previousPage`) to update table state from consumer controls.
- Use `natToolbarItem` or `NatToolbarGroup` for controls inside `<nat-table-toolbar>`.
- Pass `[for]` to companion controls that support it when a control lives outside the surface or needs an explicit table controller.
- Keep unrelated controls as ordinary Angular components with inputs and outputs.

## Search Control Pattern

A search field can register global filtering, read the table controller, and set the global filter (which resets pagination to the first page).

```ts
import { Component, DestroyRef, computed, inject, input } from '@angular/core';
import type { RowData } from 'ng-advanced-table';
import { NatTableService } from 'ng-advanced-table';
import { NatToolbarItem } from 'ng-advanced-table/components';

@Component({
  selector: 'app-table-search',
  imports: [NatToolbarItem],
  template: `
    @if (controller()?.enableGlobalFilter()) {
      <input
        [attr.aria-label]="label()"
        [placeholder]="placeholder()"
        [value]="value()"
        natToolbarItem
        type="search"
        (input)="onInput($event)" />
    }
  `
})
export class TableSearch<TData extends RowData = RowData> {
  readonly label = input('Search table');
  readonly placeholder = input('Type to search...');

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controller = computed(() => this.natTableService.controller());
  protected readonly value = computed(() => this.controller()?.globalFilter() ?? '');

  constructor() {
    this.natTableService.registerSearch();
    this.destroyRef.onDestroy(() => this.natTableService.unregisterSearch());
  }

  protected onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || target.value === this.value()) return;

    this.controller()?.setGlobalFilter(target.value);
  }
}
```

## Toolbar Composition

```html
<nat-table-surface [(state)]="tableState">
  <nat-table-toolbar accessibleName="Table actions">
    <app-table-search label="Search rows" placeholder="Type to filter" natToolbarItemPosition="start" />

    <div accessibleName="Density" natToolbarGroup="end">
      <button type="button" natToolbarItem (click)="setDensity('compact')">Compact</button>
      <button type="button" natToolbarItem (click)="setDensity('comfortable')">Comfortable</button>
    </div>

    <button type="button" natToolbarItem natTableExport exportFileName="positions">Export CSV</button>
  </nat-table-toolbar>

  <nat-table [columns]="columns" [data]="rows()" accessibleName="Open positions" />
</nat-table-surface>
```

Toolbar DOM order is screen-reader and keyboard order. Use visible button text when possible; icon-only controls need accessible names.

## Filter Menus

- Keep presets and predicates in the app component.
- If a preset changes the data array before it reaches the table, update the app signal/computed and let the table receive the filtered data.
- If a preset maps to table state, patch `globalFilter` or `columnFilters` through the controller.
- Close disclosure menus after selection and return focus to the trigger.
- Use `aria-expanded`, `aria-controls`, and `aria-current` or selected state copy for custom menus.

## Row Actions And Custom Cells

For row action buttons, custom cell renderers, and interactive controls inside cells, read [custom-cells.md](custom-cells.md).

## Bulk Workflows

- Use `withNatTableSelectionColumn(...)` and controlled `rowSelection`.
- Derive selected rows in the consuming component from stable row ids.
- Keep confirmation, API calls, optimistic updates, and error recovery outside the table.
- Disable bulk action controls when no rows are selected, and expose selected-count copy near the controls when useful.
