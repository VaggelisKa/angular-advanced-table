import { GridCellWidget } from '@angular/aria/grid';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, input } from '@angular/core';

type DemoRowAction = {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
};

const DEMO_ROW_ACTIONS: readonly DemoRowAction[] = [
  {
    id: 'inspect',
    label: 'Inspect tape',
    hint: 'Open a deeper simulated view'
  },
  {
    id: 'alert',
    label: 'Create alert',
    hint: 'Pretend-notify the desk on movement'
  },
  {
    id: 'handoff',
    label: 'Send to blotter',
    hint: 'Queue this row for a fake handoff'
  }
] as const;

@Component({
  selector: 'app-row-actions-menu',
  imports: [CdkMenuModule, GridCellWidget],
  styleUrl: './nat-row-actions-menu.css',
  template: `
    <button
      [attr.aria-label]="'Open demo actions for ' + symbol()"
      [cdkMenuTriggerFor]="menu"
      class="row-actions-trigger"
      ngGridCellWidget
      type="button">
      <svg aria-hidden="true" class="row-actions-icon" focusable="false" viewBox="0 0 16 16">
        <circle cx="3" cy="8" r="1.25" />
        <circle cx="8" cy="8" r="1.25" />
        <circle cx="13" cy="8" r="1.25" />
      </svg>
    </button>

    <ng-template #menu>
      <div [attr.aria-label]="'Demo actions for ' + symbol()" cdkMenu class="row-actions-menu">
        <div aria-hidden="true" class="row-actions-menu-header">
          <span class="row-actions-menu-symbol">{{ symbol() }}</span>
          <span class="row-actions-menu-caption">Demo actions</span>
        </div>

        @for (action of actions; track action.id) {
          <button cdkMenuItem class="row-actions-item" type="button">
            <span class="row-actions-item-label">{{ action.label }}</span>
            <span class="row-actions-item-hint">{{ action.hint }}</span>
          </button>
        }
      </div>
    </ng-template>
  `
})
export class NatRowActionsMenu {
  public readonly symbol = input.required<string>();
  protected readonly actions = DEMO_ROW_ACTIONS;
}
