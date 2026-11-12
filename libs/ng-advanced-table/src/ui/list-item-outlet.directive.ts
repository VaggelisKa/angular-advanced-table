import { Directive, Injector, computed, inject, input, output, signal } from '@angular/core';

/**
 * Insertion point of a projected `natListItem` template inside one list item.
 * Exposes its element injector so the template's directives can reach it, and
 * tracks which `natListItemLabel` element names the item.
 */
@Directive({
  selector: '[natListItemOutlet]',
  exportAs: 'natListItemOutlet',
  host: {
    '(click)': 'contentClick.emit($event)'
  }
})
export class NatListItemOutlet {
  /** Id the item's activator button references, or `null` while the item renders no activator. */
  public readonly labelId = input<string | null>(null, { alias: 'natListItemOutlet' });
  /** Render index of the item. */
  public readonly itemIndex = input.required<number>();

  /**
   * Pointer clicks on the projected content. The list uses them to activate an
   * item whose content paints over the stretched activator button; the button
   * itself remains the keyboard and assistive-technology affordance.
   */
  public readonly contentClick = output<MouseEvent>();

  public readonly injector = inject(Injector);

  // Registration order, so the earliest label still rendered names the item.
  private readonly labels = signal<readonly object[]>([]);

  /** Whether the projected template holds at least one `natListItemLabel` element. */
  public readonly hasLabel = computed(() => this.labels().length > 0);

  public registerLabel(label: object): void {
    this.labels.update((labels) => [...labels, label]);
  }

  /** Removes a label; the next one registered, if any, takes over naming the item. */
  public unregisterLabel(label: object): void {
    this.labels.update((labels) => labels.filter((candidate) => candidate !== label));
  }

  /** Whether `label` is the one carrying the id the activator references. */
  public namesItem(label: object): boolean {
    return this.labels().at(0) === label;
  }
}
