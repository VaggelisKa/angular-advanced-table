import { ChangeDetectionStrategy, Component, contentChild, effect, inject } from '@angular/core';
import { NatTable } from 'ng-advanced-table';
import { NAT_TABLE_UI_CONTROLLER, NatTableUiService } from '../../shared/table-ui.service';

@Component({
  selector: 'nat-table-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`,
  styleUrl: './table-surface.css',
  providers: [NatTableUiService],
})
export class NatTableSurface {
  private readonly uiService = inject(NatTableUiService);
  private readonly tableControllerQuery = contentChild(NAT_TABLE_UI_CONTROLLER);
  private readonly coreTableQuery = contentChild(NatTable);

  private readonly _controllerEffect = effect(() => {
    const controller = this.tableControllerQuery() ?? this.coreTableQuery();

    if (controller) {
      this.uiService.setController(controller);
    }
  });
}
