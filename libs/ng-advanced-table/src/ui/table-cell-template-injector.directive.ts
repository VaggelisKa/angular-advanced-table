import { Directive, Injector, inject } from '@angular/core';

/**
 * Exposes the element injector at a projected cell template's insertion point.
 * A template is declared in the consumer's view, so without it the template's
 * directives cannot inject what the renderer provides around the cell — the
 * Aria grid cell that `ngGridCellWidget` requires, for one.
 */
@Directive({
  selector: '[natTableCellTemplateInjector]',
  exportAs: 'natTableCellTemplateInjector'
})
export class NatTableCellTemplateInjector {
  public readonly injector = inject(Injector);
}
