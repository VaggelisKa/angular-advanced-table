import { Injectable } from '@angular/core';

/**
 * Remembers which unregistered locale ids the dev-mode warning has already
 * reported, so a misconfigured id is named once rather than once per table.
 *
 * Application-scoped rather than module-scoped: two Angular applications
 * sharing this bundle each warn for their own misconfiguration, and the ids a
 * `[locale]` binding accumulates are released with the application injector.
 */
@Injectable({ providedIn: 'root' })
export class NatTableLocaleWarningState {
  private readonly warnedLocaleIds = new Set<string>();

  /**
   * Claims `localeId` for this application, returning `true` for the caller
   * that should emit the warning and `false` once it has been reported.
   */
  public claim(localeId: string): boolean {
    if (this.warnedLocaleIds.has(localeId)) {
      return false;
    }

    this.warnedLocaleIds.add(localeId);

    return true;
  }
}
