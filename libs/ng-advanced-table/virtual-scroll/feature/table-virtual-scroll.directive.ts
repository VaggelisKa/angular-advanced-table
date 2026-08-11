import type { ListRange } from '@angular/cdk/collections';
import type { CdkVirtualScrollRepeater } from '@angular/cdk/scrolling';
import {
  ApplicationRef,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Injector,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  isDevMode,
  signal,
  untracked
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import type { Row, RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW, NatTable } from 'ng-advanced-table';
import type { NatTableRowWindow } from 'ng-advanced-table';

import { registerVirtualScrollDevDiagnostics } from './virtual-scroll-dev-diagnostics';
import type { NatTableVirtualScrollEngineHandle } from '../common/virtual-scroll-internals.type';
import type { NatTableVirtualScrollOptions } from '../common/virtual-scroll-options.type';
import { NAT_TABLE_VIRTUAL_SCROLL_INITIAL_ROW_COUNT } from '../common/virtual-scroll.const';
import { NatTableVirtualScrollGridFocus } from '../domain-logic/virtual-scroll-grid-focus.service';
import { createVirtualScrollEngine } from '../ui/virtual-scroll-engine-host';
import { buildRowWindowIndexes } from '../utils/row-window-indexes.util';
import { normalizeVirtualScrollOptions } from '../utils/virtual-scroll-options.util';

/** Unit separator: joins row ids into an identity string without ambiguity. */
const ROW_ID_SEPARATOR = '\u001f';

/**
 * Fixed-height row virtualization for `<nat-table>`, powered by the Angular
 * CDK virtual-scroll engine.
 *
 * The directive provides the core row-window contract
 * (`NAT_TABLE_ROW_WINDOW`) on its host table: the table keeps rendering
 * native rows, sticky headers, pinned columns, and the ARIA grid, while this
 * directive decides which body-row indexes stay mounted. The decision is
 * CDK's: a real `CdkVirtualScrollViewport` (hosted headless inside the scroll
 * region by `NatTableVirtualScrollEngine`) runs the stock
 * `FixedSizeVirtualScrollStrategy` against the region as its
 * `VIRTUAL_SCROLLABLE`, and its rendered range is republished as the row
 * window. Scroll auditing, buffer math, shrunken-data clamping, and
 * `scrollToIndex` all come from the CDK, untouched.
 *
 * On top of the engine, `NatTableVirtualScrollGridFocus` owns the
 * grid-specific concerns the CDK cannot know about: the focused row is kept
 * mounted so roving focus never dangles, vertical keys whose target row is
 * unmounted are pre-scrolled with focus handed over once the row mounts, and
 * rows revealed under the sticky header are nudged clear of it. A changed row
 * order (sort, filter, page, new data) resets scrolling to the top — appends
 * keep the scroll position.
 */
@Directive({
  selector: 'nat-table[natTableVirtualScroll]',
  exportAs: 'natTableVirtualScroll',
  providers: [NatTableVirtualScrollGridFocus, { provide: NAT_TABLE_ROW_WINDOW, useExisting: forwardRef(() => NatTableVirtualScroll) }],
  host: {
    class: 'nat-table-virtual-scroll',
    '(focusin)': 'focus.trackFocusIn($event.target)',
    '(focusout)': 'focus.trackFocusOut($event.relatedTarget)'
  }
})
export class NatTableVirtualScroll<TData extends RowData = RowData> implements NatTableRowWindow {
  /** Virtualization options; `rowHeight` is the load-bearing contract. */
  public readonly natTableVirtualScroll = input.required<NatTableVirtualScrollOptions>();

  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly focus = inject(NatTableVirtualScrollGridFocus);

  /**
   * The host table, resolved lazily: `NatTable` itself resolves
   * `NAT_TABLE_ROW_WINDOW` while it is constructed, so injecting the
   * component eagerly here would close a DI cycle. Every use runs after
   * construction (computeds, effects, render hooks), where lazy resolution is
   * safe.
   */
  private tableInstance: NatTable<TData> | null = null;

  private get hostTable(): NatTable<TData> {
    this.tableInstance ??= this.injector.get(NatTable) as NatTable<TData>;

    return this.tableInstance;
  }

  private readonly options = computed(() => normalizeVirtualScrollOptions(this.natTableVirtualScroll()));

  /** Fixed body-row height in px (row-window contract). */
  public readonly rowHeight = computed(() => this.options().rowHeight);

  private readonly bodyRows = computed<readonly Row<TData>[]>(() => this.hostTable.table.getRowModel().rows);
  private readonly rowCount = computed(() => this.bodyRows().length);
  private readonly headerRowCount = computed(() => this.hostTable.table.getHeaderGroups().length);

  /**
   * Identity of the visible row sequence; a change means the user is looking
   * at a different list (sort, filter, page, replaced data). TanStack
   * memoizes the row-model array, so this O(n) join re-runs only when the
   * model is actually rebuilt.
   */
  private readonly rowIdSequence = computed(() =>
    this.bodyRows()
      .map((row) => row.id)
      .join(ROW_ID_SEPARATOR)
  );

  /** CDK's rendered range; seeded so SSR and the first frame mount real rows. */
  private readonly renderedRange = signal<ListRange>({ start: 0, end: NAT_TABLE_VIRTUAL_SCROLL_INITIAL_ROW_COUNT });

  /** Mounted body-row indexes: the CDK range plus the focused row (row-window contract). */
  public readonly renderedRowIndexes = computed(() =>
    buildRowWindowIndexes(this.renderedRange(), this.focus.focusedRowIndex(), this.rowCount())
  );

  /** The CDK engine's current half-open rendered row range. */
  public readonly renderedRowRange = this.renderedRange.asReadonly();

  /** Adapts the table's row model to the viewport's repeater contract. */
  private readonly repeater: CdkVirtualScrollRepeater<Row<TData>> = {
    dataStream: toObservable(this.bodyRows),
    measureRangeSize: (range) => (range.end - range.start) * untracked(this.rowHeight)
  };

  private engine: NatTableVirtualScrollEngineHandle | null = null;

  public constructor() {
    afterNextRender(() => this.setUpEngine());
    this.destroyRef.onDestroy(() => {
      this.engine?.destroy();
      this.engine = null;
    });
    this.registerOptionSyncEffect();
    this.registerRowModelResetEffect();

    if (isDevMode()) {
      registerVirtualScrollDevDiagnostics(this.natTableVirtualScroll, () => this.hostTable);
    }
  }

  // ─── Public imperative API ───

  /** Scrolls so the given body row sits at the top of the row viewport. */
  public scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    this.engine?.viewport().scrollToIndex(index, behavior);
  }

  /** Scrolls to an absolute offset in row space (px). */
  public scrollToOffset(offset: number, behavior: ScrollBehavior = 'auto'): void {
    this.engine?.viewport().scrollToOffset(offset, behavior);
  }

  /** Re-measures the viewport after a container resize the engine could not observe. */
  public checkViewportSize(): void {
    this.engine?.viewport().checkViewportSize();
  }

  // ─── Wiring ───

  private setUpEngine(): void {
    const region = this.hostTable.tableScrollContainer();

    if (!region) {
      return;
    }

    this.engine = createVirtualScrollEngine({
      region,
      injector: this.injector,
      environmentInjector: this.environmentInjector,
      applicationRef: this.applicationRef,
      options: untracked(this.options),
      repeater: this.repeater,
      onRenderedRange: (range) => this.renderedRange.set(range)
    });

    this.focus.connect({
      hostElement: this.hostElement.nativeElement,
      region,
      headerRowCount: this.headerRowCount,
      rowCount: this.rowCount,
      renderedRowIndexes: this.renderedRowIndexes,
      scrollToIndex: (index) => this.scrollToIndex(index)
    });
  }

  /** Forwards option changes into the live CDK strategy. */
  private registerOptionSyncEffect(): void {
    effect(() => {
      const options = this.options();

      untracked(() => this.engine?.syncOptions(options));
    });
  }

  /**
   * A changed row sequence means a different list: drop the focus pin and
   * scroll back to the top. Pure appends (infinite loading) extend the
   * sequence without reordering it and keep the scroll position; data-length
   * changes themselves are already handled by the CDK via the repeater.
   */
  private registerRowModelResetEffect(): void {
    let previousSequence: string | null = null;

    effect(() => {
      const sequence = this.rowIdSequence();
      const previous = previousSequence;

      previousSequence = sequence;

      if (previous === null || previous === sequence || (previous !== '' && sequence.startsWith(previous + ROW_ID_SEPARATOR))) {
        return;
      }

      untracked(() => {
        this.focus.releasePin();
        this.scrollToOffset(0);
      });
    });
  }
}
