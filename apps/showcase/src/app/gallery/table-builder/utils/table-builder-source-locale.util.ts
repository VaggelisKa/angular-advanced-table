import type { TableBuilderFlags } from '../common/table-builder.type';

type LocaleSourceFragments = {
  readonly localeImport: string;
  readonly localeConst: string;
  readonly providersLine: string;
};

const DANISH_LABELS_SOURCE = `const DANISH_LABELS: NatTableControlsIntl = {
  search: { label: 'Søg i rækker', placeholder: 'Søg i rækker' },
  columnVisibility: { label: 'Kolonner', groupAriaLabel: 'Kolonnesynlighed' },
  pageSize: {
    groupAriaLabel: 'Rækker pr. side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => \`\${pageSizeText} rækker\`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => \`\${pageSizeText} rækker pr. side\`,
    },
  },
  pager: {
    groupAriaLabel: 'Tabelpaginering',
    accessibilityLabels: {
      previousPageAriaLabel: 'Forrige side',
      nextPageAriaLabel: 'Næste side',
      pageIndicator: ({ pageText, pageCountText }) => \`Side \${pageText} af \${pageCountText}\`,
    },
  },
  toolbar: { toolbarLabel: 'Tabelværktøjslinje' },
  selection: { columnLabel: 'Markering' },
};

`;

// Localization codegen fragments spliced into the generated component source when
// the localization feature is on (kept out of the main source builder to stay lean).
export const buildLocaleSourceFragments = (flags: TableBuilderFlags): LocaleSourceFragments =>
  flags.withLocalization
    ? {
        localeImport: `\nimport { provideNatTableControlsLocales } from 'ng-advanced-table/locale';\nimport type { NatTableControlsIntl } from 'ng-advanced-table/locale';`,
        localeConst: DANISH_LABELS_SOURCE,
        providersLine: `\n  providers: [provideNatTableControlsLocales({ da: DANISH_LABELS })],`
      }
    : { localeImport: '', localeConst: '', providersLine: '' };
