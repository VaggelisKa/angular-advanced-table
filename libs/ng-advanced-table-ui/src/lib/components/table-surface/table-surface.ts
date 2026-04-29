import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nat-table-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="surface"><ng-content /></div>',
  styleUrl: './table-surface.css',
})
export class NatTableSurface {}
