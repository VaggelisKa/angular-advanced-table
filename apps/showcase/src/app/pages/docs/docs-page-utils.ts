const MARKDOWN_HEADING_SELECTOR = '.docs-markdown h2, .docs-markdown h3, .docs-markdown h4, .docs-markdown h5, .docs-markdown h6';

type PrismGlobal = typeof globalThis & {
  Prism?: {
    highlightElement?(element: Element): void;
    highlightAllUnder?(element: Element | Document): void;
  };
};

const HIGHLIGHTED_CODE_SELECTOR = 'code[class*="language-"]:not([data-docs-prism-highlighted])';

export function shouldLetBrowserHandleLink(event: MouseEvent): boolean {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export function slugifyMarkdownHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getUniqueMarkdownHeadingId(baseId: string, usedIds: ReadonlySet<string>): string {
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return id;
}

export function decorateMarkdownHeadingIds(container: HTMLElement): void {
  const usedIds = new Set(Array.from(container.querySelectorAll<HTMLElement>('[id]')).map((element) => element.id));

  for (const heading of Array.from(container.querySelectorAll<HTMLElement>(MARKDOWN_HEADING_SELECTOR))) {
    if (heading.id) {
      continue;
    }

    const baseId = slugifyMarkdownHeading(heading.textContent);

    if (!baseId) {
      continue;
    }

    const id = getUniqueMarkdownHeadingId(baseId, usedIds);

    heading.id = id;
    usedIds.add(id);
  }
}

export function highlightMarkdownCode(container: HTMLElement): void {
  const prism = (globalThis as PrismGlobal).Prism;
  const codeElements = Array.from(container.querySelectorAll<HTMLElement>(HIGHLIGHTED_CODE_SELECTOR));

  if (!prism || (!prism.highlightElement && !prism.highlightAllUnder)) {
    return;
  }

  for (const codeElement of codeElements) {
    if (typeof prism.highlightElement === 'function') {
      prism.highlightElement(codeElement);
    } else if (typeof prism.highlightAllUnder === 'function') {
      prism.highlightAllUnder(codeElement.parentElement ?? codeElement);
    }

    codeElement.setAttribute('data-docs-prism-highlighted', '');
  }
}

function copyTextWithSelection(document: Document, text: string): boolean {
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
}

export async function copyText(document: Document, text: string): Promise<boolean> {
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
}
