import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nat-table-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-action-bar.html',
  styleUrl: './table-action-bar.css',
})
export class NatTableActionBar {}
