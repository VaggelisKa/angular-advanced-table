import type { ElementRef } from '@angular/core';
import { Component, afterRenderEffect, input, viewChildren } from '@angular/core';

import { highlightElement } from '../../shared/prism.util';

/**
 * Prism-highlighted code example block for gallery demo pages.
 *
 * Takes the template and component parts of an example as separate inputs so
 * each `<code>` element carries one Prism language; a mixed block would leave
 * the TypeScript half unhighlighted. Either part may be omitted.
 */
@Component({
  selector: 'app-demo-code',
  templateUrl: './demo-code.html',
  styleUrl: './demo-code.css'
})
export class DemoCode {
  /** Section heading shown above the code. */
  public readonly heading = input.required<string>();
  /** Template/markup part of the example, rendered first. */
  public readonly markup = input('');
  /** TypeScript part of the example, rendered after the markup. */
  public readonly typescript = input('');
  /** CSS part of the example, rendered last. */
  public readonly css = input('');

  private readonly codeElements = viewChildren<ElementRef<HTMLElement>>('codeEl');

  public constructor() {
    // Re-highlight whenever the inputs change, after Angular writes textContent.
    afterRenderEffect(() => {
      this.markup();
      this.typescript();
      this.css();

      for (const codeElement of this.codeElements()) {
        highlightElement(codeElement.nativeElement);
      }
    });
  }
}
