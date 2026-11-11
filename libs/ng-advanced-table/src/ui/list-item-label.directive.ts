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
  // The element's own id, restored whenever this element does not name the item.
  private readonly ownId = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.getAttribute('id');

  // Only one label per item carries the referenced id, so ids stay unique; when
  // that label is removed the next one takes over.
  protected readonly elementId = computed(() => (this.outlet?.namesItem(this) ? (this.outlet.labelId() ?? this.ownId) : this.ownId));

  public constructor() {
    this.outlet?.registerLabel(this);
    inject(DestroyRef).onDestroy(() => this.outlet?.unregisterLabel(this));
  }
}
