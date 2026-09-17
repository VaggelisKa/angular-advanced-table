import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';

import type { ColumnDef } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, NatTableToolbar, NatToolbarItem, withNatTableHeaderActions } from 'ng-advanced-table/components';

/**
 * A stand-in for a Stencil (or any web-component) design-system button the
 * consumer does not author and cannot annotate from the inside.
 *
 * It is a real custom element: open shadow root, a `<button>` rendered inside,
 * the label slotted through, and an `activate` event composed across the
 * boundary. `delegates-focus` toggles `delegatesFocus` on the shadow root — the
 * shape Stencil emits for `shadow: { delegatesFocus: true }` — so the example
 * covers both kinds of sealed control with the same bare `natToolbarItem`.
 */
const STENCIL_BUTTON_TAG = 'demo-stencil-button';

const STENCIL_BUTTON_TEMPLATE = `
  <style>
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
      border: 1px dashed currentColor;
      border-radius: 100vmax;
    }

    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  </style>
  <button type="button"><slot></slot></button>
`;

/**
 * Registers the custom element once, and only in a browser: `HTMLElement` is
 * absent on the prerender server, so the class must not exist at module scope.
 */
const defineStencilButton = (): void => {
  if (typeof customElements === 'undefined' || customElements.get(STENCIL_BUTTON_TAG)) return;

  class DemoStencilButton extends HTMLElement {
    public connectedCallback(): void {
      // Attributes are not yet set when Angular constructs the element, so the
      // shadow root (and its delegatesFocus flag) is attached on connect.
      if (this.shadowRoot) return;

      const root = this.attachShadow({ mode: 'open', delegatesFocus: this.hasAttribute('delegates-focus') });

      root.innerHTML = STENCIL_BUTTON_TEMPLATE;

      const button = root.querySelector('button');

      if (!button) return;

      const innerTestId = this.getAttribute('inner-testid');

      if (innerTestId) button.setAttribute('data-testid', innerTestId);

      button.addEventListener('click', () => this.dispatchEvent(new CustomEvent('activate', { bubbles: true, composed: true })));
    }
  }

  customElements.define(STENCIL_BUTTON_TAG, DemoStencilButton);
};

type StencilDemoItem = {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly status: string;
};

const STENCIL_DEMO_DATA: StencilDemoItem[] = [
  { id: 's-1', name: 'Ingest pipeline', owner: 'Data platform', status: 'Healthy' },
  { id: 's-2', name: 'Billing sync', owner: 'Finance', status: 'Degraded' },
  { id: 's-3', name: 'Edge cache', owner: 'Infrastructure', status: 'Healthy' }
];

/**
 * Example card for bare `natToolbarItem` on custom elements — no
 * `natToolbarItemFocusTarget` selector. Kept in its own component so the shared
 * toolbar demo template stays within the file-length budget.
 */
@Component({
  selector: 'app-stencil-toolbar-example',
  imports: [NatTable, NatTableSurface, NatTableToolbar, NatToolbarItem],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<div class="grid-layout grid-layout-with-panel">
    <div class="card">
      <h2 class="card-title">Custom elements without a focus-target selector</h2>
      <p class="description">
        Both dashed controls are real custom elements with an open shadow root and a <code>&lt;button&gt;</code> inside, the shape a
        Stencil component ships. They carry only a bare <code>natToolbarItem</code> — no <code>natToolbarItemFocusTarget</code>. The
        toolbar resolves the inner control itself, whether or not the element delegates focus.
      </p>

      <nat-table-surface [enableSorting]="true">
        <nat-table-toolbar accessibleName="Custom element toolbar">
          <demo-stencil-button
            data-testid="stencil-plain-host"
            inner-testid="stencil-plain-inner-button"
            natToolbarItem="stencil-plain"
            (activate)="recordStencilAction('stencil-plain')">
            Archive
          </demo-stencil-button>

          <demo-stencil-button
            data-testid="stencil-delegating-host"
            delegates-focus
            inner-testid="stencil-delegating-inner-button"
            natToolbarItem="stencil-delegating"
            (activate)="recordStencilAction('stencil-delegating')">
            Duplicate
          </demo-stencil-button>

          <button
            class="toolbar-button"
            data-testid="stencil-native-button"
            natToolbarItem="stencil-native"
            natToolbarItemPosition="end"
            type="button"
            (click)="recordStencilAction('stencil-native')">
            Plain
          </button>
        </nat-table-toolbar>

        <nat-table [columns]="columns" [data]="data" accessibleName="Custom element table" />
      </nat-table-surface>
    </div>

    <div class="card">
      <h2 class="card-title">Custom Element Activation</h2>
      <div class="control-panel">
        <dl class="demo-state">
          <dt class="demo-state-term">Last action</dt>
          <dd class="demo-state-value" data-testid="stencil-last-action">{{ lastStencilAction() }}</dd>
        </dl>

        <div class="tip">
          Tab once to enter the toolbar, then Left/Right to move between the two custom elements and the plain button. Focus lands on
          each element's inner button, so Enter and Space activate the control itself.
        </div>
      </div>
    </div>
  </div>`
})
export class StencilToolbarExample {
  protected readonly data = STENCIL_DEMO_DATA;

  protected readonly columns: ColumnDef<StencilDemoItem, unknown>[] = withNatTableHeaderActions([
    { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
    { accessorKey: 'owner', header: 'Owner', meta: { label: 'Owner' } },
    { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } }
  ]);

  protected readonly lastStencilAction = signal('none');

  public constructor() {
    defineStencilButton();
  }

  protected recordStencilAction(action: string): void {
    this.lastStencilAction.set(action);
  }
}
