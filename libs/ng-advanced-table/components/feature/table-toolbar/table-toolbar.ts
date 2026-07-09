import { Toolbar } from '@angular/aria/toolbar';
import { Component, computed, effect, inject, input } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableUiController } from 'ng-advanced-table';
import { NAT_EN_LOCALE_ID, NAT_TABLE_CONTROLS_INTL, resolveNatTableControlsIntl } from 'ng-advanced-table/locale';

import { injectNatTableUiController } from '../../domain-logic/ui-controller.provider';

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
  'week'
]);

/** True when the event target owns caret/arrow-key editing — toolbar keys must not steal it. */
const isNatToolbarTextEntryElement = (target: EventTarget | null): boolean => {
  if (target instanceof HTMLTextAreaElement) return true;

  if (target instanceof HTMLSelectElement) return true;

  if (target instanceof HTMLElement && target.isContentEditable) return true;

  return target instanceof HTMLInputElement && NAT_TOOLBAR_TEXT_INPUT_TYPES.has(target.type);
};

/** Any modifier that changes an arrow's meaning inside a text field (word-jump, select, …). */
const hasCaretModifier = (event: KeyboardEvent): boolean => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

/** Collapsed caret sits at the value edge the arrow would exit toward (RTL flips which arrow is "forward"). */
const caretAtExitEdge = (field: HTMLInputElement, key: string, rtl: boolean): boolean => {
  const { selectionStart, value } = field;
  const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
  const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

  if (key === forwardKey) return selectionStart === value.length;

  if (key === backwardKey) return selectionStart === 0;

  return false;
};

/**
 * Boundary-aware handoff for a single-line text `<input>`: true when the pressed
 * arrow should give up the caret and let roving navigation advance — i.e. the
 * caret is collapsed at the value edge in the arrow's travel direction (#249).
 */
const shouldHandOffCaretToToolbar = (event: KeyboardEvent, rtl: boolean): boolean => {
  const { target } = event;

  // Only a single-line text input exposes a logical caret we can trust;
  // textarea / select / contentEditable keep every key.
  // ponytail: number/date/email inputs report selectionStart === null, so they
  // stay dead-ends here — the platform gives us no caret position to test.
  if (!(target instanceof HTMLInputElement)) return false;

  if (hasCaretModifier(event)) return false;

  const { selectionStart, selectionEnd } = target;

  if (selectionStart === null || selectionStart !== selectionEnd) return false;

  return caretAtExitEdge(target, event.key, rtl);
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
    '(focusin)': 'syncActiveItemFromFocus($event)'
  }
})
export class NatTableToolbar<TData extends RowData = RowData> {
  public readonly for = input<NatTableUiController<TData>>();
  public readonly accessibleName = input<string>();
  public readonly locale = input<string>();

  private readonly tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
  private readonly controller = injectNatTableUiController(this.for, 'nat-table-toolbar');
  // The generic is the selection value type — this toolbar disables Aria's
  // selection model entirely (see the pattern patches below), so widget
  // `value`s only serve Aria's registry and must merely be unique.
  private readonly ariaToolbar = inject(Toolbar, { self: true }) as Toolbar<unknown>;

  /** Single touch point for Aria's private `_pattern` API — fix here if it ever renames. */
  private get pattern(): Toolbar<unknown>['_pattern'] {
    const { _pattern: pattern } = this.ariaToolbar;

    return pattern;
  }

  protected readonly localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID);

  protected readonly tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()));

  protected readonly resolvedAccessibleName = computed(
    () => this.accessibleName() ?? this.tableUiIntl().toolbar?.toolbarLabel ?? null
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

      // Text-entry widgets keep their caret keys — but a single-line <input>
      // hands Left/Right off to roving nav once the caret sits at the matching
      // edge, so the input isn't a dead-end for arrow traversal (#249).
      if (isNatToolbarTextEntryElement(event.target)) {
        const rtl = pattern.inputs.textDirection() === 'rtl';

        if (!shouldHandOffCaretToToolbar(event, rtl)) return;
      }

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
