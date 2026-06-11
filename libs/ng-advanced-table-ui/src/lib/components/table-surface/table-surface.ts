import { ChangeDetectionStrategy, Component, contentChild, effect, inject } from '@angular/core';
import { NatTable } from 'ng-advanced-table';
import { NAT_TABLE_UI_CONTROLLER, NatTableService } from '../../shared/table.service';

@Component({
  selector: 'nat-table-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`,
  styleUrl: './table-surface.css',
  providers: [NatTableService],
})
export class NatTableSurface {
  private readonly natTableService = inject(NatTableService);
  private readonly tableControllerQuery = contentChild(NAT_TABLE_UI_CONTROLLER);
  private readonly coreTableQuery = contentChild(NatTable);

  private readonly _controllerEffect = effect(() => {
    const controller = this.tableControllerQuery() ?? this.coreTableQuery() ?? null;
    this.natTableService.setController(controller);
  });
}
