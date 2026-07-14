import { Directive, inject } from '@angular/core';

import { handleCellInteractionFocusIn, handleCellInteractionKeydown } from './utils/cell-interaction.util';
import { NatTableService } from '../domain-logic/table.service';

@Directive({
  selector: '[natTableCell]',
  host: {
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)'
  }
})
export class NatTableCell {
  private readonly natTableService = inject(NatTableService);

  protected onKeydown(event: KeyboardEvent): void {
    handleCellInteractionKeydown(event, this.natTableService.keyboard().cellInteraction);
  }

  // Host (focusin) handler. Bound to the imported helper directly — the cell
  // delegation rule needs no instance state, so this is a function reference,
  // not a method (keeps it off `class-methods-use-this`).
  protected readonly onFocusIn = handleCellInteractionFocusIn;
}
