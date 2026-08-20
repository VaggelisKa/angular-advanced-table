export type SelectionMode = 'single' | 'multiple';

export type RowSelectionSource = {
  readonly rowIds: ReadonlySet<string>;
  readonly multiple: boolean;
};
