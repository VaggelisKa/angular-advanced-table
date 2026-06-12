import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'nat-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-toolbar.html',
  styleUrl: './table-toolbar.css',
})
export class NatTableToolbar {}
