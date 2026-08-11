type NatTableActiveBodyFocus = {
  readonly rowId: string | null;
  readonly columnId: string;
};

const readDataRowFocus = (target: Element): NatTableActiveBodyFocus | null => {
  const cell = target.closest<HTMLElement>('tbody [ngGridCell]');
  const row = cell?.closest<HTMLTableRowElement>('tr.data-row[data-row-id]') ?? null;
  const rowId = row?.dataset['rowId'];
  const columnId = cell?.dataset['columnId'];

  if (rowId !== undefined && columnId !== undefined) {
    return { rowId, columnId };
  }

  return null;
};

export const readNatTableActiveBodyFocus = (host: HTMLElement, firstColumnId: string | undefined): NatTableActiveBodyFocus | null => {
  const target = host.ownerDocument.activeElement;

  if (!target || !host.contains(target)) {
    return null;
  }

  const dataRowFocus = readDataRowFocus(target);

  if (dataRowFocus) {
    return dataRowFocus;
  }

  const stateCell = target.closest<HTMLElement>('tbody [ngGridCell].table-state');

  return stateCell && firstColumnId ? { rowId: null, columnId: firstColumnId } : null;
};
