import { Directive, Injector, computed, inject, input, signal } from '@angular/core';

/**
 * Insertion point of a projected `natListItem` template inside one list item.
 * Exposes its element injector so the template's directives can reach it, and
 * tracks whether the template marked a naming element with `natListItemLabel`.
 */
@Directive({
  selector: '[natListItemOutlet]',
  exportAs: 'natListItemOutlet'
})
export class NatListItemOutlet {
  /** Id the item's activator button references, or `null` while the item renders no activator. */
  public readonly labelId = input<string | null>(null, { alias: 'natListItemOutlet' });
  /** Render index of the item. */
  public readonly itemIndex = input.required<number>();

  public readonly injector = inject(Injector);

  private readonly labelCount = signal(0);

  /** Whether the projected template holds at least one `natListItemLabel` element. */
  public readonly hasLabel = computed(() => this.labelCount() > 0);

  /** Registers a label and reports whether it is the item's first, which carries the id. */
  public registerLabel(): boolean {
    const isFirst = this.labelCount() === 0;

    this.labelCount.update((count) => count + 1);

    return isFirst;
  }

  public unregisterLabel(): void {
    this.labelCount.update((count) => Math.max(0, count - 1));
  }
}
