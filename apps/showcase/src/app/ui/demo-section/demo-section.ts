import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Labelled box for a demo sub-area — a side rail of controls, or one cell of a
 * multi-state grid.
 *
 * Deliberately lighter than the page-level `.card`: docs examples already draw
 * a bordered, shadowed card around every preview, so repeating that chrome
 * inside it reads as a card-in-a-card. Set `flush` when the projected content
 * paints its own edges (a table region) and should meet the border directly.
 */
@Component({
  selector: 'app-demo-section',
  imports: [],
  templateUrl: './demo-section.html',
  styleUrl: './demo-section.css'
})
export class DemoSection {
  public readonly heading = input<string>();
  public readonly flush = input(false, { transform: booleanAttribute });
}
