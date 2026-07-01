export type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

export type TableBuilderFlags = {
  readonly withPagination: boolean;
  readonly withGlobalFilter: boolean;
  readonly showColumnVisibility: boolean;
  readonly withColumnPinning: boolean;
  readonly withColumnReorder: boolean;
  readonly showScrollControl: boolean;
  readonly withStickyHeader: boolean;
};
