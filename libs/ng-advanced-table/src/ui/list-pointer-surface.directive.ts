import { Directive, output } from '@angular/core';

/**
 * Reports pointer clicks on a list item's content box. Content that forms its
 * own layer paints over the stretched activator button, so the list uses these
 * clicks to keep pointer activation working there; the button itself remains
 * the keyboard and assistive-technology affordance.
 */
@Directive({
  selector: '[natListPointerSurface]',
  host: {
    '(click)': 'surfaceClick.emit($event)'
  }
})
export class NatListPointerSurface {
  public readonly surfaceClick = output<MouseEvent>();
}
