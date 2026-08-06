/**
 * Parks the body scrollbar while a fullscreen overlay is open and returns the
 * restore callback. Touch scrolls on an overlay chain to the page behind it
 * even while that page is inert, so hiding body overflow is required in
 * addition to `overscroll-behavior` on the overlay's own scroll containers.
 */
export const lockBodyScroll = (body: HTMLElement): (() => void) => {
  const previousOverflow = body.style.overflow;

  body.style.overflow = 'hidden';

  return (): void => {
    body.style.overflow = previousOverflow;
  };
};
