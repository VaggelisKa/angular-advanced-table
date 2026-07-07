import type { NatTableDataStatus } from 'ng-advanced-table';

import type { DataStatePreview, DemoItem } from '../common/table-builder.type';

// Empty/Loading previews need zero rows to surface their template (loading with rows
// is treated as a background refresh); Live/Error keep the sample rows.
export const resolvePreviewData = (withDataStates: boolean, state: DataStatePreview, data: DemoItem[]): DemoItem[] => {
  if (!withDataStates) {
    return data;
  }

  return state === 'loading' || state === 'empty' ? [] : data;
};

export const resolvePreviewDataStatus = (withDataStates: boolean, state: DataStatePreview): NatTableDataStatus => {
  if (!withDataStates) {
    return 'success';
  }

  if (state === 'loading') {
    return 'loading';
  }

  return state === 'error' ? 'error' : 'success';
};

export const resolvePreviewError = (withDataStates: boolean, state: DataStatePreview): unknown =>
  withDataStates && state === 'error' ? new Error('Sample data failed to load.') : null;
