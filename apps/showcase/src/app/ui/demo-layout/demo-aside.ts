import { Directive } from '@angular/core';

/**
 * Marks projected content as the side rail of an `app-demo-layout`.
 *
 * The layout queries for this marker instead of guessing from the DOM, so an
 * aside-less demo keeps a single full-width column rather than reserving a
 * dead track.
 */
@Directive({
  selector: '[demoAside]'
})
export class DemoAside {}
