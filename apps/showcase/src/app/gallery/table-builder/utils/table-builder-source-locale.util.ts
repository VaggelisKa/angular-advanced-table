import type { TableBuilderFlags } from '../common/table-builder.type';

type LocaleSourceFragments = {
  readonly localeImport: string;
  readonly providersLine: string;
};

// The built-in dictionaries are opt-in, so the generated component registers the
// two domains the preview uses rather than hand-writing Danish copy.
const LOCALE_IMPORT_SOURCE = `
import {
  NAT_DA_CONTROLS_LOCALE_LABELS,
  NAT_DA_LOCALE_LABELS,
  provideNatTableControlsLocales,
  provideNatTableLocales
} from 'ng-advanced-table/locale';`;

const LOCALE_PROVIDERS_SOURCE = `
  providers: [
    provideNatTableLocales({ da: NAT_DA_LOCALE_LABELS }),
    provideNatTableControlsLocales({ da: NAT_DA_CONTROLS_LOCALE_LABELS }),
  ],`;

// Localization codegen fragments spliced into the generated component source when
// the localization feature is on (kept out of the main source builder to stay lean).
export const buildLocaleSourceFragments = (flags: TableBuilderFlags): LocaleSourceFragments =>
  flags.withLocalization
    ? { localeImport: LOCALE_IMPORT_SOURCE, providersLine: LOCALE_PROVIDERS_SOURCE }
    : { localeImport: '', providersLine: '' };
