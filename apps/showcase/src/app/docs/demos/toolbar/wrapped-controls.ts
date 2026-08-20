import { Component, ViewEncapsulation, input, output, signal } from '@angular/core';

import type { ColumnDef } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, NatTableToolbar, NatToolbarItem, withNatTableHeaderActions } from 'ng-advanced-table/components';

/**
 * Two stand-ins for a design-system control the consumer does not author.
 *
 * Neither component's host element is interactive — each renders a real
 * `<button>` inside itself, which is exactly the shape `natToolbarItem` cannot
 * handle on its own: `@angular/aria` focuses the element carrying the
 * directive, so focus would land on the wrapper shell and the inner button
 * would sit in the tab order as a second stop.
 *
 * `natToolbarItemFocusTarget="button"` is what makes them usable, and the two
 * encapsulation modes cover the two resolution paths — light DOM, and an open
 * shadow root (the shape a Stencil `shadow: true` component ships).
 */

const WRAPPED_BUTTON_STYLES = `
  :host {
    display: inline-flex;
  }

  button {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    font: inherit;
    font-size: 0.92rem;
    color: inherit;
    cursor: pointer;
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 100vmax;
  }

  button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

/** Wrapper whose control lives in light DOM — the plain component-host case. */
@Component({
  selector: 'app-wrapped-button',
  template: `
    <button [attr.data-testid]="testId()" type="button" (click)="activate.emit()">
      <ng-content />
    </button>
  `,
  styles: WRAPPED_BUTTON_STYLES
})
export class WrappedButton {
  public readonly testId = input<string>();
  public readonly activate = output();
}

/**
 * Wrapper whose control lives behind an **open shadow root**, standing in for a
 * Stencil/web-component design system. `natToolbarItemFocusTarget` searches the
 * shadow root before light DOM, so the consumer writes the same selector.
 */
@Component({
  selector: 'app-shadow-wrapped-button',
  template: `
    <button [attr.data-testid]="testId()" type="button" (click)="activate.emit()">
      <ng-content />
    </button>
  `,
  styles: WRAPPED_BUTTON_STYLES,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ShadowWrappedButton {
  public readonly testId = input<string>();
  public readonly activate = output();
}

type WrappedDemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly value: number;
};

const WRAPPED_DEMO_DATA: WrappedDemoItem[] = [
  { id: 'w-1', name: 'Alpha Searcher', category: 'Analytics', value: 4500 },
  { id: 'w-2', name: 'Beta Runner', category: 'Infrastructure', value: 1200 },
  { id: 'w-3', name: 'Delta Watcher', category: 'Security', value: 3100 }
];

/**
 * Example card for `natToolbarItemFocusTarget`, kept in its own component so the
 * shared toolbar demo template stays within the file-length budget.
 */
@Component({
  selector: 'app-wrapped-toolbar-example',
  imports: [NatTable, NatTableSurface, NatTableToolbar, NatToolbarItem, ShadowWrappedButton, WrappedButton],
  template: `<div class="grid-layout grid-layout-with-panel">
    <div class="card">
      <h2 class="card-title">Wrapped controls (design-system buttons)</h2>
      <p class="description">
        Neither control below is a button — each is a wrapper component that renders one inside itself, the shape a design-system or
        Stencil control ships. <code>natToolbarItemFocusTarget</code> nominates the inner element, so roving focus reaches the real
        control and the wrapper never becomes a second Tab stop. <code>Duplicate</code> keeps its button behind an open shadow root;
        the selector is the same.
      </p>

      <nat-table-surface [enableSorting]="true">
        <nat-table-toolbar accessibleName="Wrapped controls toolbar">
          <app-wrapped-button
            natToolbarItem="wrapped-light"
            natToolbarItemFocusTarget="button"
            testId="wrapped-light-button"
            (activate)="recordWrappedAction('wrapped-light')">
            Archive
          </app-wrapped-button>

          <app-shadow-wrapped-button
            natToolbarItem="wrapped-shadow"
            natToolbarItemFocusTarget="button"
            testId="wrapped-shadow-button"
            (activate)="recordWrappedAction('wrapped-shadow')">
            Duplicate
          </app-shadow-wrapped-button>

          <button
            class="toolbar-button"
            data-testid="wrapped-plain-button"
            natToolbarItem="wrapped-plain"
            natToolbarItemPosition="end"
            type="button"
            (click)="recordWrappedAction('wrapped-plain')">
            Plain
          </button>
        </nat-table-toolbar>

        <nat-table [columns]="columns" [data]="data" accessibleName="Wrapped controls table" />
      </nat-table-surface>
    </div>

    <div class="card">
      <h2 class="card-title">Wrapped Activation</h2>
      <div class="control-panel">
        <dl class="demo-state">
          <dt class="demo-state-term">Last action</dt>
          <dd class="demo-state-value" data-testid="wrapped-last-action">{{ lastWrappedAction() }}</dd>
        </dl>

        <div class="tip">
          Tab once to enter the toolbar, then Left/Right to move between the two wrappers and the plain button. Focus lands on each
          wrapper's inner button, so Enter and Space activate the control itself.
        </div>
      </div>
    </div>
  </div>`
})
export class WrappedToolbarExample {
  protected readonly data = WRAPPED_DEMO_DATA;

  protected readonly columns: ColumnDef<WrappedDemoItem, unknown>[] = withNatTableHeaderActions([
    { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
    { accessorKey: 'category', header: 'Category', meta: { label: 'Category' } },
    { accessorKey: 'value', header: 'Value', meta: { label: 'Value', align: 'end' } }
  ]);

  protected readonly lastWrappedAction = signal('none');

  protected recordWrappedAction(action: string): void {
    this.lastWrappedAction.set(action);
  }
}
