import { Marked, Renderer } from 'marked';
import type { Tokens } from 'marked';

import { getUniqueMarkdownHeadingId, slugifyMarkdownHeading } from './docs-page-utils';

const HTML_ESCAPE_LOOKUP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const SAFE_MARKDOWN_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const MARKDOWN_URL_PROTOCOL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

const escapeMarkdownHtml = (html: string): string => html.replace(/[&<>"']/g, (character) => HTML_ESCAPE_LOOKUP[character]);

const isSafeMarkdownUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();

  if (!MARKDOWN_URL_PROTOCOL_PATTERN.test(trimmedUrl)) {
    return true;
  }

  try {
    return SAFE_MARKDOWN_URL_PROTOCOLS.has(new URL(trimmedUrl).protocol);
  } catch {
    return false;
  }
};

const createDocsMarkdownRenderer = (): Renderer => {
  const renderer = new Renderer();
  const usedHeadingIds = new Set<string>();

  renderer.html = ({ text }: Tokens.HTML | Tokens.Tag): string => escapeMarkdownHtml(text);

  renderer.link = function link(this: Renderer, { href, title, tokens }: Tokens.Link): string {
    const linkText = this.parser.parseInline(tokens);

    if (!isSafeMarkdownUrl(href)) {
      return linkText;
    }

    const titleAttribute = title ? ` title="${escapeMarkdownHtml(title)}"` : '';

    return `<a href="${escapeMarkdownHtml(href)}"${titleAttribute}>${linkText}</a>`;
  };

  renderer.image = ({ href, title, text }: Tokens.Image): string => {
    const escapedAltText = escapeMarkdownHtml(text);

    if (!isSafeMarkdownUrl(href)) {
      return escapedAltText;
    }

    const titleAttribute = title ? ` title="${escapeMarkdownHtml(title)}"` : '';

    return `<img src="${escapeMarkdownHtml(href)}" alt="${escapedAltText}"${titleAttribute}>`;
  };

  renderer.heading = function heading(this: Renderer, { tokens, depth, text }: Tokens.Heading): string {
    const headingHtml = this.parser.parseInline(tokens);
    const baseId = slugifyMarkdownHeading(text);

    if (!baseId) {
      return `<h${depth}>${headingHtml}</h${depth}>\n`;
    }

    const id = getUniqueMarkdownHeadingId(baseId, usedHeadingIds);

    usedHeadingIds.add(id);

    return `<h${depth} id="${id}">${headingHtml}</h${depth}>\n`;
  };

  return renderer;
};

export const renderMarkdownToHtml = (markdown: string): string =>
  new Marked({
    async: false,
    breaks: false,
    gfm: true,
    pedantic: false,
    renderer: createDocsMarkdownRenderer()
  }).parse(markdown, { async: false });
