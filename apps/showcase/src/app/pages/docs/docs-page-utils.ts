const MARKDOWN_HEADING_SELECTOR = '.docs-markdown h2, .docs-markdown h3, .docs-markdown h4, .docs-markdown h5, .docs-markdown h6';

export function shouldLetBrowserHandleLink(event: MouseEvent): boolean {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getUniqueHeadingId(baseId: string, usedIds: ReadonlySet<string>): string {
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

    const baseId = slugifyHeading(heading.textContent);

    if (!baseId) {
      continue;
    }

    const id = getUniqueHeadingId(baseId, usedIds);

    heading.id = id;
    usedIds.add(id);
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
