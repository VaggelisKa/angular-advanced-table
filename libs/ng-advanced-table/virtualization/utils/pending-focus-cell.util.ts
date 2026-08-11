type NatTablePendingFocus = {
  readonly rowIndex: number | null;
  readonly columnId: string;
  readonly preferHeader?: boolean;
};

const matchingHeaderCells = (host: HTMLElement, columnId: string): HTMLElement[] => {
  const headers = [...host.querySelectorAll<HTMLElement>('thead [ngGridCell][data-column-id]')];
  const matchingHeader = headers.find((candidate) => candidate.dataset['columnId'] === columnId);

  return matchingHeader ? [matchingHeader] : [];
};

export const resolveNatTablePendingFocusCells = (host: HTMLElement, pending: NatTablePendingFocus): HTMLElement[] => {
  if (pending.preferHeader) {
    return [...host.querySelectorAll<HTMLElement>('thead [ngGridCell][data-column-id]')];
  }

  if (pending.rowIndex === null) {
    const bodyFallback = host.querySelector<HTMLElement>('tbody [ngGridCell]');

    return bodyFallback ? [bodyFallback] : matchingHeaderCells(host, pending.columnId);
  }

  const row = [...host.querySelectorAll<HTMLTableRowElement>('tr.data-row')].find(
    (candidate) => Number(candidate.dataset['rowIndex']) === pending.rowIndex
  );

  return row ? [...row.querySelectorAll<HTMLElement>('[ngGridCell][data-column-id]')] : [];
};
