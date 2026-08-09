import { Component, booleanAttribute, input } from '@angular/core';

import type { DemoFact } from './demo-facts.type';

/**
 * Label/value readout of the state a demo is currently in.
 *
 * Consolidates the two readouts the demos used to mix: free-floating
 * `.info-tag` chips whose label was baked into the sentence, and a bespoke
 * `<dl class="demo-state">`. A real `<dl>` keeps the label/value pairing in the
 * accessibility tree. Set `live` when the values change in response to a user
 * action elsewhere on the page.
 */
@Component({
  selector: 'app-demo-facts',
  imports: [],
  templateUrl: './demo-facts.html',
  styleUrl: './demo-facts.css'
})
export class DemoFacts {
  public readonly facts = input.required<readonly DemoFact[]>();
  public readonly live = input(false, { transform: booleanAttribute });
}
