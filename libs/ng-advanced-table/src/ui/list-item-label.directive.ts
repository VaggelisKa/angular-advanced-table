import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';

import { NatListItemOutlet } from './list-item-outlet.directive';

/**
 * Marks the element that names a list item inside a `natListItem` template:
 * `<h3 natListItemLabel>{{ order.name }}</h3>`. With `enableRowActivation`, the
 * item's activator button is named by this element. Outside an activatable
 * item it does nothing.
 */
@Directive({
  selector: '[natListItemLabel]',
  host: {
    '[attr.id]': 'elementId()'
  }
})
export class NatListItemLabel {
  private readonly outlet = inject(NatListItemOutlet, { optional: true });
  // The element's own id, restored whenever the item renders no activator.
  private readonly ownId = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.getAttribute('id');
  // Only the first label in an item carries the referenced id, so ids stay unique.
  private readonly namesItem = this.outlet?.registerLabel() ?? false;

  protected readonly elementId = computed(() => (this.namesItem ? (this.outlet?.labelId() ?? this.ownId) : this.ownId));

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.outlet?.unregisterLabel());
  }
}
