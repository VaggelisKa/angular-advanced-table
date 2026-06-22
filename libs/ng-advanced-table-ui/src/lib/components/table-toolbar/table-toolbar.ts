import { Toolbar } from '@angular/aria/toolbar';
import { Component, computed, effect, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../shared/resolve-ui-controller';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';
import type { NatTableUiController } from '../../shared/table-ui.types';

const NAT_TOOLBAR_TEXT_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

/** True when the event target owns caret/arrow-key editing — toolbar keys must not steal it. */
const isNatToolbarTextEntryElement = (target: EventTarget | null): boolean => {
  if (target instanceof HTMLTextAreaElement) return true;

  if (target instanceof HTMLElement && target.isContentEditable) return true;

  return target instanceof HTMLInputElement && NAT_TOOLBAR_TEXT_INPUT_TYPES.has(target.type);
};

@Component({
  selector: 'nat-table-toolbar',
  templateUrl: './table-toolbar.html',
  styleUrl: './table-toolbar.css',
  // Keyboard navigation (roving tabindex, RTL-aware arrows, wrap, Home/End)
  // comes from @angular/aria — it binds role="toolbar", aria-orientation and
  // the keydown/click/pointerdown handlers on this host.
  hostDirectives: [{ directive: Toolbar, inputs: ['disabled', 'softDisabled', 'wrap'] }],
  host: {
    '[attr.aria-label]': 'resolvedAccessibleName()',
    '[attr.aria-controls]': 'ariaControls()',
    '(focusin)': 'syncActiveItemFromFocus($event)',
  },
})
export class NatTableToolbar<TData extends RowData = RowData> {
  public readonly for = input<NatTableUiController<TData>>();
  public readonly accessibleName = input<string>();
  public readonly locale = input<string>();

  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  private readonly controller = injectNatTableUiController(this.for, 'nat-table-toolbar');
  // The generic is the selection value type — this toolbar disables Aria's
  // selection model entirely (see the pattern patches below), so widget
  // `value`s only serve Aria's registry and must merely be unique.
  private readonly ariaToolbar = inject(Toolbar, { self: true }) as Toolbar<unknown>;

  /** Single touch point for Aria's private `_pattern` API — fix here if it ever renames. */
  private get pattern(): Toolbar<unknown>['_pattern'] {
    // eslint-disable-next-line no-underscore-dangle -- @angular/aria exposes the pattern only via `_pattern`
    return this.ariaToolbar._pattern;
  }

  protected readonly localeId = computed(
    () => this.locale() ?? this.controller()?.localeId?.() ?? NAT_TABLE_UI_ENGLISH_LOCALE,
  );

  protected readonly tableUiIntl = computed(() =>
    resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId()),
  );

  protected readonly resolvedAccessibleName = computed(
    () => this.accessibleName() ?? this.tableUiIntl().toolbar?.toolbarLabel ?? null,
  );

  protected readonly ariaControls = computed(() => this.controller()?.tableElementId() ?? null);

  public constructor() {
    this.patchAriaToolbarPattern();

    // @angular/aria never clears activeItem when a widget unregisters (items
    // removed via @if would strand the roving tab stop on a dead widget, and
    // Tab would skip the toolbar). Reset it to the first visual item.
    effect(() => {
      const pattern = this.pattern;
      const widgets = pattern.inputs.items();
      const active = pattern.activeItem();

      if (active !== undefined && !widgets.includes(active)) {
        pattern.inputs.activeItem.set(widgets[0]);
      }
    });
  }

  /**
   * Instance-level patches on the @angular/aria toolbar pattern. Each one
   * works around a behavior of the stock pattern that
   * breaks this toolbar; the aria-integration spec is the tripwire.
   * Re-verify all four on every `@angular/aria` bump.
   */
  private patchAriaToolbarPattern(): void {
    const pattern = this.pattern;

    const originalOnKeydown = pattern.onKeydown.bind(pattern);

    pattern.onKeydown = (event: KeyboardEvent): void => {
      // Aria preventDefaults Enter/Space for its selection model (unused
      // here) — that would kill native button activation and Space typing.
      if (event.key === 'Enter' || event.key === ' ') return;

      // Text-entry widgets keep their caret keys (arrows, Home/End).
      if (isNatToolbarTextEntryElement(event.target)) return;

      originalOnKeydown(event);
    };

    const originalOnPointerdown = pattern.onPointerdown.bind(pattern);

    pattern.onPointerdown = (event: PointerEvent): void => {
      // Aria preventDefaults every pointerdown — on text-entry widgets that
      // kills caret placement and drag selection.
      if (isNatToolbarTextEntryElement(event.target)) return;

      originalOnPointerdown(event);
    };

    const originalOnClick = pattern.onClick.bind(pattern);

    pattern.onClick = (event: MouseEvent): void => {
      // Aria's click handler re-focuses the resolved widget element — on
      // text-entry widgets that would steal the caret the user just placed.
      if (isNatToolbarTextEntryElement(event.target)) return;

      originalOnClick(event);
    };

    // Disable the selection model: select() would mutate the toolbar `values`
    // model on Enter/Space/click — widget values exist only for Aria's
    // registry, never as selection state.
    pattern.select = (): void => {
      // intentional no-op: selection model is disabled for this toolbar
    };
  }

  /**
   * Keeps Aria's active widget in sync with real focus. Aria only updates it
   * on arrow keys and clicks — Tab (and programmatic focus) would leave the
   * roving tab stop behind.
   */
  protected syncActiveItemFromFocus(event: FocusEvent): void {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const pattern = this.pattern;
    const item = pattern.inputs.getItem(target);

    if (item !== undefined && pattern.activeItem() !== item) {
      pattern.inputs.activeItem.set(item);
    }
  }
}
