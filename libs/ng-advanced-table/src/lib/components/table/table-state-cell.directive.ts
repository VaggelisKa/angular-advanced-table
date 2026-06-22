import { Directive, ElementRef, afterEveryRender, inject } from '@angular/core';

import {
  NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE,
  ROW_ACTIVATE_INTERACTIVE_SELECTOR,
  handleCellInteractionFocusIn,
  handleCellInteractionKeydown,
} from './cell-interaction';
import { NatTableService } from './table.service';

@Directive({
  selector: '[natTableStateCell]',
  host: {
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
})
export class NatTableStateCell {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly natTableService = inject(NatTableService);

  public constructor() {
    afterEveryRender(() => this.prepareControls());
  }

  protected onKeydown(event: KeyboardEvent): void {
    handleCellInteractionKeydown(event, this.natTableService.keyboard().cellInteraction);
  }

  // Host (focusin) handler. Bound to the imported helper directly — the cell
  // delegation rule needs no instance state, so this is a function reference,
  // not a method (keeps it off `class-methods-use-this`).
  protected readonly onFocusIn = handleCellInteractionFocusIn;

  private prepareControls(): void {
    const controls = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      ROW_ACTIVATE_INTERACTIVE_SELECTOR,
    );

    for (const control of controls) {
      if (control.hasAttribute('ngGridCellWidget') || control.hasAttribute('disabled')) {
        continue;
      }

      if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex < 0) {
        continue;
      }

      if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)) {
        control.setAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, '');
      }

      if (control.tabIndex !== -1) {
        control.tabIndex = -1;
      }
    }
  }
}
