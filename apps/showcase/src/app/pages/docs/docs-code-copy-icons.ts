const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const CODE_COPY_ICON_CLASS = 'docs-code-copy-icon';
const CODE_COPY_ICON_PATHS = [
  'M5 4.5V3.25A1.25 1.25 0 0 1 6.25 2h5.5A1.25 1.25 0 0 1 13 3.25v6.5A1.25 1.25 0 0 1 11.75 11H10.5',
  'M3.25 5h5.5A1.25 1.25 0 0 1 10 6.25v6.5A1.25 1.25 0 0 1 8.75 14h-5.5A1.25 1.25 0 0 1 2 12.75v-6.5A1.25 1.25 0 0 1 3.25 5Z'
];
const CODE_COPIED_ICON_PATHS = ['M3.25 8.25 6.25 11.25 12.75 4.75'];

const createCodeCopyIcon = (document: Document, paths: readonly string[], iconClass: string): SVGSVGElement => {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg');

  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('class', iconClass);
  icon.setAttribute('fill', 'none');
  icon.setAttribute('focusable', 'false');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.setAttribute('stroke-width', '1.75');
  icon.setAttribute('viewBox', '0 0 16 16');

  for (const pathData of paths) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path');

    path.setAttribute('d', pathData);
    icon.append(path);
  }

  return icon;
};

export const createDocsCodeCopyIcons = (document: Document): [SVGSVGElement, SVGSVGElement] => [
  createCodeCopyIcon(document, CODE_COPY_ICON_PATHS, `${CODE_COPY_ICON_CLASS} docs-code-copy-icon--copy`),
  createCodeCopyIcon(document, CODE_COPIED_ICON_PATHS, `${CODE_COPY_ICON_CLASS} docs-code-copy-icon--check`)
];
