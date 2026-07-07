import type { PresetDescriptor, PresetKey, TableBuilderFlags } from './table-builder.type';

export const PRESET_DESCRIPTORS: PresetDescriptor[] = [
  { key: 'minimal', label: 'Minimal' },
  { key: 'everything', label: 'Everything' }
];

export const PRESETS: Record<PresetKey, TableBuilderFlags> = {
  minimal: {
    withGlobalFilter: false,
    withPagination: false,
    withSorting: false,
    showColumnVisibility: false,
    withColumnPinning: false,
    withColumnReorder: false,
    withColumnResizing: false,
    showScrollControl: false,
    withStickyHeader: false,
    withExport: false,
    withRowSelection: false,
    withDataStates: false,
    withLocalization: false
  },
  everything: {
    withGlobalFilter: true,
    withPagination: true,
    withSorting: true,
    showColumnVisibility: true,
    withColumnPinning: true,
    withColumnReorder: true,
    withColumnResizing: true,
    showScrollControl: true,
    withStickyHeader: true,
    withExport: true,
    withRowSelection: true,
    withDataStates: true,
    withLocalization: true
  }
};
