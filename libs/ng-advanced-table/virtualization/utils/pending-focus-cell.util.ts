import { isOwnedNatTableElement, queryOwnedNatTableElements } from './table-ownership.util';

type NatTablePendingFocus = {
  readonly rowIndex: number | null;
  readonly columnId: string;
  readonly preferHeader?: boolean;
};

const matchingHeaderCells = (host: HTMLElement, columnId: string): HTMLElement[] => {
  const headers = queryOwnedNatTableElements<HTMLElement>(host, 'thead [ngGridCell][data-column-id]');
  const matchingHeader = headers.find((candidate) => candidate.dataset['columnId'] === columnId);

  return matchingHeader ? [matchingHeader] : [];
};

export const resolveNatTablePendingFocusCells = (host: HTMLElement, pending: NatTablePendingFocus): HTMLElement[] => {
  if (pending.preferHeader) {
    return queryOwnedNatTableElements<HTMLElement>(host, 'thead [ngGridCell][data-column-id]');
  }

  if (pending.rowIndex === null) {
    const bodyFallback = queryOwnedNatTableElements<HTMLElement>(host, 'tbody [ngGridCell]').at(0);

    return bodyFallback ? [bodyFallback] : matchingHeaderCells(host, pending.columnId);
  }

  const row = queryOwnedNatTableElements<HTMLTableRowElement>(host, 'tr.data-row').find(
    (candidate) => Number(candidate.dataset['rowIndex']) === pending.rowIndex
  );

  return row
    ? [...row.querySelectorAll<HTMLElement>('[ngGridCell][data-column-id]')].filter((cell) => isOwnedNatTableElement(host, cell))
    : [];
};
