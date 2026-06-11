import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../../shared/resolve-ui-controller';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../../shared/table-ui-intl';
import type { NatTableUiController } from '../../../shared/table-ui.types';
import { NatToolbarItem } from '../toolbar-item.directive';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';

@Component({
  selector: 'nat-toolbar-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar-search.html',
  styleUrl: './toolbar-search.css',
  hostDirectives: [{ directive: NatToolbarItem, inputs: ['natToolbarItem'] }],
})
export class NatToolbarSearch<TData extends RowData = RowData> {
  readonly for = input<NatTableUiController<TData> | undefined>(undefined);
  readonly locale = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly collapseBelow = input(480, { transform: numberAttribute });

  protected readonly toolbarItem = inject(NAT_TOOLBAR_ITEM, { self: true });
  private readonly toolbar = inject(NAT_TABLE_TOOLBAR, { optional: true });
  private readonly injector = inject(Injector);
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  protected readonly controller = injectNatTableUiController(this.for, 'nat-toolbar-search');

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly expandButton = viewChild<ElementRef<HTMLButtonElement>>('expandButton');

  protected readonly expanded = signal(false);

  private readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );
  private readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );
  protected readonly visible = computed(() => this.controller()?.enableGlobalFilter() ?? true);
  protected readonly value = computed(() => this.controller()?.table.getState().globalFilter ?? '');
  protected readonly tableElementId = computed(() => this.controller()?.tableElementId() ?? null);
  protected readonly resolvedLabel = computed(
    () => this.label() ?? this.tableUiIntl().search?.label ?? '',
  );
  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.tableUiIntl().search?.placeholder ?? '',
  );
  protected readonly expandButtonLabel = computed(
    () => this.tableUiIntl().toolbar?.accessibilityLabels?.searchExpandButton?.() ?? '',
  );
  protected readonly collapsed = computed(() => {
    const containerWidth = this.toolbar?.containerWidth() ?? 0;

    return containerWidth > 0 && containerWidth < this.collapseBelow();
  });
  protected readonly showInput = computed(() => !this.collapsed() || this.expanded());

  constructor() {
    this.toolbarItem.setOverflowSpec({ mode: 'never' });

    effect(() => {
      const target =
        this.searchInput()?.nativeElement ?? this.expandButton()?.nativeElement ?? null;

      this.toolbarItem.setFocusTarget(target);
    });
  }

  protected expand(): void {
    this.expanded.set(true);
    afterNextRender(
      () => {
        const input = this.searchInput()?.nativeElement;

        if (input) {
          input.focus();
          this.toolbar?.registerFocus(this.toolbarItem.id);
        }
      },
      { injector: this.injector },
    );
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.collapsed()) {
      return;
    }

    event.stopPropagation();
    this.expanded.set(false);
    afterNextRender(
      () => this.expandButton()?.nativeElement.focus(),
      { injector: this.injector },
    );
  }

  protected onSearchBlur(): void {
    if (this.collapsed() && this.value() === '') {
      this.expanded.set(false);
    }
  }

  protected onInput(event: Event): void {
    const controller = this.controller();
    const target = event.target;

    if (controller === null || !(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.value === this.value()) {
      return;
    }

    controller.patchState({
      globalFilter: target.value,
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
  }
}
