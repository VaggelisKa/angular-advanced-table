import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type ColumnDef, type SortingState } from '@tanstack/angular-table';
import { NatTable, localeSortingFn, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoPerson {
  id: string;
  name: string;
  city: string;
}

const DEMO_DATA: DemoPerson[] = [
  { id: 'person-1', name: 'Aalborg', city: 'Copenhagen' },
  { id: 'person-2', name: 'Andersen', city: 'Odense' },
  { id: 'person-3', name: 'Åse', city: 'Aarhus' },
  { id: 'person-4', name: 'Ærø', city: 'Svendborg' },
  { id: 'person-5', name: 'Bjerg', city: 'Esbjerg' },
  { id: 'person-6', name: 'Østergaard', city: 'Aalborg' },
  { id: 'person-7', name: 'Vestergaard', city: 'Randers' },
  { id: 'person-8', name: 'Zacho', city: 'Kolding' },
];

const DEMO_NAMES = DEMO_DATA.map((person) => person.name);

type DemoLocale = 'en-US' | 'da-DK';

function namesInLocaleOrder(locale: DemoLocale): string[] {
  const collator = new Intl.Collator(locale);
  return [...DEMO_NAMES].sort((first, second) => collator.compare(first, second));
}

@Component({
  selector: 'app-locale-sorting-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Locale-Aware Sorting</h1>
        <p class="description">
          The Name column sorts through <code>localeSortingFn</code>, an
          <code>Intl.Collator</code>-backed sorting function. Switch the locale to see Danish
          collation move Æ, Ø and Å after Z and treat the digraph "Aa" as Å, so "Aalborg" jumps
          from first (en-US) to last (da-DK).
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Danish Names Grid ({{ locale() }})</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns()"
              [state]="tableState()"
              [locale]="locale()"
              accessibleName="Locale-aware sorting demo table"
              (sortingChange)="onSortingChange($event)"
            />
          </nat-table-surface>
          <div class="info-tag">
            Keyboard: Tab to the grid, arrow keys move between cells, Enter on the Name header
            reaches the sort button, Enter sorts, Escape returns to the cell.
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Locale Switch &amp; Comparison</h2>
          <div class="actions-panel">
            <button
              type="button"
              class="btn"
              [class.btn-primary]="locale() === 'en-US'"
              [class.btn-outline]="locale() !== 'en-US'"
              [attr.aria-pressed]="locale() === 'en-US'"
              (click)="setLocale('en-US')"
            >
              English (en-US)
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-primary]="locale() === 'da-DK'"
              [class.btn-outline]="locale() !== 'da-DK'"
              [attr.aria-pressed]="locale() === 'da-DK'"
              (click)="setLocale('da-DK')"
            >
              Danish (da-DK)
            </button>
          </div>

          <div class="info-tag" role="status">
            Active locale: {{ locale() }} — current sort: {{ currentSortLabel() }}
          </div>

          <h3 class="card-title">Ascending order, en-US (æ ≈ ae, ø ≈ o, å ≈ a)</h3>
          <ol class="order-list">
            @for (name of englishOrder; track name; let idx = $index) {
              <li class="order-item">
                <span class="order-badge">{{ idx + 1 }}</span>
                <span class="column-name">{{ name }}</span>
              </li>
            }
          </ol>

          <h3 class="card-title">Ascending order, da-DK (…X, Y, Z, Æ, Ø, Å — and Aa = Å)</h3>
          <ol class="order-list">
            @for (name of danishOrder; track name; let idx = $index) {
              <li class="order-item">
                <span class="order-badge">{{ idx + 1 }}</span>
                <span class="column-name">{{ name }}</span>
              </li>
            }
          </ol>
        </div>
      </div>
    </div>
  `,
})
export class LocaleSortingShowcasePage {
  readonly data = DEMO_DATA;

  readonly locale = signal<DemoLocale>('en-US');

  /**
   * The collator inside `localeSortingFn` is fixed when the factory runs, so the
   * column defs are recreated whenever the demo locale changes.
   */
  readonly columns = computed<ColumnDef<DemoPerson, unknown>[]>(() =>
    withNatTableHeaderActions([
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { label: 'Name', rowHeader: true },
        sortingFn: localeSortingFn<DemoPerson>(this.locale()),
      },
      {
        accessorKey: 'city',
        header: 'City',
        meta: { label: 'City' },
      },
    ]),
  );

  readonly tableState = signal<Partial<NatTableState>>({
    sorting: [{ id: 'name', desc: false }],
  });

  readonly englishOrder = namesInLocaleOrder('en-US');
  readonly danishOrder = namesInLocaleOrder('da-DK');

  readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;
    if (!sorting?.length) {
      return 'none';
    }
    const entry = sorting[0]!;
    return `${entry.id} (${entry.desc ? 'descending' : 'ascending'})`;
  });

  onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  setLocale(locale: DemoLocale): void {
    this.locale.set(locale);
    // TanStack memoizes the sorted row model on the sorting state and the
    // pre-sorted rows, so swapping the column `sortingFn` alone does not
    // re-sort. Refreshing the sorting array reference busts that memo.
    this.tableState.update((current) => ({ ...current, sorting: [...(current.sorting ?? [])] }));
  }
}
