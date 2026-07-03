import { getPrism, highlightElement } from '../../shared/prism.util';

const HIGHLIGHTED_CODE_SELECTOR = 'code[class*="language-"]:not([data-docs-prism-highlighted])';

export const shouldLetBrowserHandleLink = (event: MouseEvent): boolean => {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
};

export const highlightMarkdownCode = (container: HTMLElement): void => {
  const prism = getPrism();

  if (!prism || (!prism.highlightElement && !prism.highlightAllUnder)) {
    return;
  }

  const codeElements = Array.from(container.querySelectorAll<HTMLElement>(HIGHLIGHTED_CODE_SELECTOR));

  for (const codeElement of codeElements) {
    highlightElement(codeElement);
    codeElement.setAttribute('data-docs-prism-highlighted', '');
  }
};

const copyTextWithSelection = (document: Document, text: string): boolean => {
  const textarea = document.createElement('textarea');

  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto 0';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
};

export const copyText = async (document: Document, text: string): Promise<boolean> => {
  const clipboard = navigator.clipboard as Clipboard | undefined;

  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return copyTextWithSelection(document, text);
  }

  try {
    await clipboard.writeText(text);
  } catch {
    return copyTextWithSelection(document, text);
  }

  return true;
};
