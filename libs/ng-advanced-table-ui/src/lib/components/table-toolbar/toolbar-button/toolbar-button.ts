import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Attribute component that marks a plain button or anchor as a toolbar button.
 * Applies the `nat-toolbar-button` host class and the matching visual styles
 * (border, radius, height, padding, hover, focus ring) using the same
 * `--nat-table-*` tokens as the built-in trigger buttons.
 *
 * @example
 * ```html
 * <button natToolbarButton natToolbarItem value="export">Export</button>
 * <a href="/export" natToolbarButton natToolbarItem value="download">Download</a>
 * ```
 */
@Component({
  selector: 'button[natToolbarButton], a[natToolbarButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'nat-toolbar-button' },
  styleUrl: './toolbar-button.css',
})
export class NatToolbarButton {}
