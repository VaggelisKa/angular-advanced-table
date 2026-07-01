export type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

export type RowSelectionSource = {
  readonly rowIds: ReadonlySet<string>;
  readonly multiple: boolean;
};
