/**
 * Returns the optionally injected `NatTableService`, or throws a branded error
 * that names the renderer and both ways to provide the service. A renderer
 * cannot work without it, so this throws in every mode, not only dev mode.
 *
 * The companion entry point is named in the message text only: core never
 * imports a companion.
 */
export const requireNatTableService = <TService>(service: TService | null, selector: string): TService => {
  if (service === null) {
    throw new Error(
      `[ng-advanced-table] <${selector}> could not find a NatTableService. Wrap it in <nat-table-surface> ` +
        `(ng-advanced-table/components), or add providers: [NatTableService] to a host component or directive.`
    );
  }

  return service;
};
