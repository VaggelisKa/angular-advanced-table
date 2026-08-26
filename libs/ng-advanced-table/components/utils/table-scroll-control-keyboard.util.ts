type TableScrollControlKeyEvent = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'>;

type ArrowDirection = -1 | 1;

const resolveBoundaryArrowTarget = (key: string, maxScrollLeft: number): number | null => {
  switch (key) {
    case 'ArrowLeft':
      return 0;
    case 'ArrowRight':
      return maxScrollLeft;
    default:
      return null;
  }
};

const resolveArrowDirection = (key: string): ArrowDirection | null => {
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return -1;
    case 'ArrowRight':
    case 'ArrowUp':
      return 1;
    default:
      return null;
  }
};

const resolveUnmodifiedKeyTarget = (key: string, scrollLeft: number, maxScrollLeft: number, clientWidth: number): number | null => {
  switch (key) {
    case 'PageUp':
      return scrollLeft + clientWidth;
    case 'PageDown':
      return scrollLeft - clientWidth;
    case 'Home':
      return 0;
    case 'End':
      return maxScrollLeft;
    default:
      return null;
  }
};

const hasUnsupportedModifiers = (event: TableScrollControlKeyEvent): boolean =>
  event.altKey || (event.ctrlKey && event.metaKey) || ((event.ctrlKey || event.metaKey) && event.shiftKey);

export const resolveTableScrollControlKeyTarget = (
  event: TableScrollControlKeyEvent,
  clientWidth: number | null,
  scrollLeft: number,
  maxScrollLeft: number
): number | null => {
  if (clientWidth === null || hasUnsupportedModifiers(event)) return null;

  if (event.ctrlKey || event.metaKey) {
    return resolveBoundaryArrowTarget(event.key, maxScrollLeft);
  }

  const arrowDirection = resolveArrowDirection(event.key);

  if (arrowDirection !== null) {
    const distance = event.shiftKey ? maxScrollLeft : clientWidth;

    return scrollLeft + arrowDirection * Math.max(Math.round(distance * 0.1), 1);
  }

  if (event.shiftKey) return null;

  return resolveUnmodifiedKeyTarget(event.key, scrollLeft, maxScrollLeft, clientWidth);
};
