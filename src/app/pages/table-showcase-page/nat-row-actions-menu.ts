import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { GridCellWidget } from '@angular/aria/grid';

interface DemoRowAction {
  id: string;
  label: string;
  hint: string;
}

const DEMO_ROW_ACTIONS: readonly DemoRowAction[] = [
  {
    id: 'inspect',
    label: 'Inspect tape',
    hint: 'Open a deeper simulated view',
  },
  {
    id: 'alert',
    label: 'Create alert',
    hint: 'Pretend-notify the desk on movement',
  },
  {
    id: 'handoff',
    label: 'Send to blotter',
    hint: 'Queue this row for a fake handoff',
  },
] as const;

@Component({
  selector: 'app-row-actions-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkMenuModule, GridCellWidget],
  styles: `
    :host {
      display: flex;
      justify-content: flex-end;
      inline-size: 100%;
    }

    .row-actions-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2rem;
      block-size: 2rem;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--border, #d4d8dd) 88%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface, #ffffff) 92%, transparent);
      color: var(--text-soft, #5b6672);
      cursor: pointer;
      transition:
        border-color 140ms ease,
        background-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease;
    }

    .row-actions-trigger:hover,
    .row-actions-trigger[aria-expanded='true'] {
      border-color: color-mix(in srgb, var(--accent, #1f6feb) 44%, var(--border, #d4d8dd));
      background: color-mix(in srgb, var(--accent-soft, #e7f0fe) 72%, transparent);
      color: var(--text, #0f1419);
    }

    .row-actions-trigger:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--accent, #1f6feb) 38%, transparent);
      outline-offset: 2px;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #1f6feb) 18%, transparent);
    }

    .row-actions-icon {
      inline-size: 1rem;
      block-size: 1rem;
      fill: currentColor;
    }

    .row-actions-menu {
      display: grid;
      gap: 4px;
      min-inline-size: 14rem;
      padding: 8px;
      border: 1px solid color-mix(in srgb, var(--border, #d4d8dd) 88%, transparent);
      border-radius: 14px;
      background: color-mix(in srgb, var(--surface-elevated, #ffffff) 96%, transparent);
      box-shadow:
        0 16px 36px rgba(15, 20, 25, 0.16),
        0 2px 8px rgba(15, 20, 25, 0.08);
      backdrop-filter: blur(14px);
    }

    .row-actions-menu-header {
      display: grid;
      gap: 2px;
      padding: 4px 6px 8px;
      border-bottom: 1px solid color-mix(in srgb, var(--border, #d4d8dd) 72%, transparent);
    }

    .row-actions-menu-symbol {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text, #0f1419);
    }

    .row-actions-menu-caption {
      font-size: 0.72rem;
      color: var(--text-muted, #8a94a0);
    }

    .row-actions-item {
      display: grid;
      gap: 2px;
      inline-size: 100%;
      padding: 9px 10px;
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: var(--text, #0f1419);
      text-align: left;
      cursor: pointer;
      transition:
        background-color 140ms ease,
        color 140ms ease;
    }

    .row-actions-item:hover,
    .row-actions-item:focus-visible {
      background: color-mix(in srgb, var(--surface-hover, #f1f3f5) 86%, transparent);
      outline: none;
    }

    .row-actions-item-label {
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.25;
    }

    .row-actions-item-hint {
      font-size: 0.72rem;
      color: var(--text-muted, #8a94a0);
      line-height: 1.25;
    }
  `,
  template: `
    <button
      type="button"
      ngGridCellWidget
      class="row-actions-trigger"
      [attr.aria-label]="'Open demo actions for ' + symbol()"
      [cdkMenuTriggerFor]="menu"
    >
      <svg class="row-actions-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="3" cy="8" r="1.25" />
        <circle cx="8" cy="8" r="1.25" />
        <circle cx="13" cy="8" r="1.25" />
      </svg>
    </button>

    <ng-template #menu>
      <div cdkMenu class="row-actions-menu" [attr.aria-label]="'Demo actions for ' + symbol()">
        <div class="row-actions-menu-header" aria-hidden="true">
          <span class="row-actions-menu-symbol">{{ symbol() }}</span>
          <span class="row-actions-menu-caption">Demo actions</span>
        </div>

        @for (action of actions; track action.id) {
          <button type="button" cdkMenuItem class="row-actions-item">
            <span class="row-actions-item-label">{{ action.label }}</span>
            <span class="row-actions-item-hint">{{ action.hint }}</span>
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class NatRowActionsMenu {
  readonly symbol = input.required<string>();
  protected readonly actions = DEMO_ROW_ACTIONS;
}
