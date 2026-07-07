export type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

export type TableBuilderFlags = {
  readonly withPagination: boolean;
  readonly withSorting: boolean;
  readonly withGlobalFilter: boolean;
  readonly showColumnVisibility: boolean;
  readonly withColumnPinning: boolean;
  readonly withColumnReorder: boolean;
  readonly withColumnResizing: boolean;
  readonly showScrollControl: boolean;
  readonly withStickyHeader: boolean;
  readonly withExport: boolean;
  readonly withRowSelection: boolean;
  readonly withDataStates: boolean;
  readonly withLocalization: boolean;
};

export type TableBuilderFlagKey = keyof TableBuilderFlags;

export type FeatureCategory = 'data' | 'columns' | 'layout' | 'controls' | 'states' | 'i18n';

export type DataStatePreview = 'live' | 'loading' | 'empty' | 'error';

export type LocalePreview = 'en' | 'da';

export type FeatureDescriptor = {
  readonly key: TableBuilderFlagKey;
  readonly label: string;
  readonly help: string;
  readonly category: FeatureCategory;
};

export type FeatureCategoryDescriptor = {
  readonly id: FeatureCategory;
  readonly label: string;
};

export type PresetKey = 'minimal' | 'everything';

export type PresetDescriptor = {
  readonly key: PresetKey;
  readonly label: string;
};
