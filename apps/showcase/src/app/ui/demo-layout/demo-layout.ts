import { Component, contentChild } from '@angular/core';

import { DemoAside } from './demo-aside';

/**
 * Layout shell for showcase demos: a main column plus an optional side rail
 * marked with `demoAside`.
 *
 * Sizing is driven by a container query on the host, so the same demo splits
 * into two columns on a full-width example route and stacks inside the much
 * narrower docs example card.
 */
@Component({
  selector: 'app-demo-layout',
  imports: [],
  templateUrl: './demo-layout.html',
  styleUrl: './demo-layout.css'
})
export class DemoLayout {
  protected readonly aside = contentChild(DemoAside);
}
