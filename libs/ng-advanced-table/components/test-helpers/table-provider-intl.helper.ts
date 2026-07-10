import { InjectionToken, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';

import type { NatTableControlsIntl, NatTableControlsIntlStaticProviderConfig } from 'ng-advanced-table/locale';

type ProviderIntlVariant = {
  readonly prefix: 'Provider' | 'Reactive';
  readonly numberPrefix: 'n' | 'r';
  readonly rowAdjective: 'provider' | 'reactive';
};

type ProviderNavigationIntl = Pick<NatTableControlsIntl, 'formatNumber' | 'columnVisibility' | 'pageSize' | 'pager' | 'scrollControl'>;

type ProviderInteractionIntl = Pick<NatTableControlsIntl, 'headerActions' | 'toolbar' | 'selection'>;

const buildProviderNavigationIntl = (variant: ProviderIntlVariant): ProviderNavigationIntl => ({
  formatNumber: (value) => `${variant.numberPrefix}${value}`,
  columnVisibility: {
    label: `${variant.prefix} columns`,
    groupAriaLabel: `${variant.prefix} column visibility`,
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${variant.prefix} ${visibleColumnCountText}/${totalColumnCountText}`
    }
  },
  pageSize: {
    groupAriaLabel: `${variant.prefix} page size`,
    accessibilityLabels: {
      groupAriaLabel: `${variant.prefix} page size group`,
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} ${variant.rowAdjective} rows`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `${variant.prefix} show ${pageSizeText} rows`
    }
  },
  pager: {
    groupAriaLabel: `${variant.prefix} pager`,
    accessibilityLabels: {
      previousPageAriaLabel: `${variant.prefix} previous`,
      nextPageAriaLabel: `${variant.prefix} next`,
      pageIndicator: ({ pageText, pageCountText }) => `${variant.prefix} page ${pageText}/${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: `${variant.prefix} horizontal scroll`,
    accessibilityLabels: {
      scrollLeftAriaLabel: `${variant.prefix} scroll left`,
      scrollRightAriaLabel: `${variant.prefix} scroll right`,
      scrollPositionAriaLabel: `${variant.prefix} scroll position`,
      scrollPositionText: ({ percentageText }) => `${variant.prefix} ${percentageText} percent`
    }
  }
});

const buildProviderInteractionIntl = (variant: ProviderIntlVariant): ProviderInteractionIntl => ({
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label }) => `${variant.prefix} sort ${label}`,
      menuButton: ({ label }) => `${variant.prefix} actions for ${label}`,
      menuLabel: ({ label }) => `${variant.prefix} menu for ${label}`,
      pinButton: ({ label, pinSide }) => `${variant.prefix} pin ${label} ${pinSide}`,
      pinButtonText: ({ pinSide }) => `${variant.prefix} ${pinSide}`,
      moveButton: ({ label, direction }) => `${variant.prefix} move ${label} ${direction}`,
      moveButtonText: ({ direction }) => `${variant.prefix} move ${direction}`
    }
  },
  toolbar: {
    toolbarLabel: `${variant.prefix} table toolbar`
  },
  selection: {
    columnLabel: `${variant.prefix} selection`,
    accessibilityLabels: {
      selectAllAriaLabel: `${variant.prefix} select all rows`,
      selectRowAriaLabel: ({ rowId }) => `${variant.prefix} select row ${rowId}`
    }
  }
});

const buildProviderControlsIntl = (variant: ProviderIntlVariant): NatTableControlsIntlStaticProviderConfig => ({
  ...buildProviderNavigationIntl(variant),
  ...buildProviderInteractionIntl(variant)
});

export const createProviderControlsIntl = (): WritableSignal<NatTableControlsIntlStaticProviderConfig> =>
  signal(buildProviderControlsIntl({ prefix: 'Provider', numberPrefix: 'n', rowAdjective: 'provider' }));

export const PROVIDER_CONTROLS_INTL = new InjectionToken<ReturnType<typeof createProviderControlsIntl>>('PROVIDER_CONTROLS_INTL');

export const REACTIVE_CONTROLS_INTL = buildProviderControlsIntl({
  prefix: 'Reactive',
  numberPrefix: 'r',
  rowAdjective: 'reactive'
});
