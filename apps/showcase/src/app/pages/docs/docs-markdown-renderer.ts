import { Marked, Renderer } from 'marked';
import type { Tokens } from 'marked';

import { getUniqueMarkdownHeadingId, slugifyMarkdownHeading } from './docs-page-utils';

export type RenderedMarkdownHeading = {
  readonly depth: number;
  readonly id: string;
};

export type RenderedMarkdownHtml = {
  readonly html: string;
  readonly headings: readonly RenderedMarkdownHeading[];
};

const createDocsMarkdownRenderer = (): {
  readonly renderer: Renderer;
  readonly headings: readonly RenderedMarkdownHeading[];
} => {
  const renderer = new Renderer();
  const headings: RenderedMarkdownHeading[] = [];
  const usedHeadingIds = new Set<string>();

  renderer.heading = function heading(this: Renderer, { tokens, depth, text }: Tokens.Heading): string {
    const headingHtml = this.parser.parseInline(tokens);
    const baseId = slugifyMarkdownHeading(text);

    if (!baseId) {
      return `<h${depth}>${headingHtml}</h${depth}>\n`;
    }

    const id = getUniqueMarkdownHeadingId(baseId, usedHeadingIds);

    usedHeadingIds.add(id);
    headings.push({ depth, id });

    return `<h${depth}>${headingHtml}</h${depth}>\n`;
  };

  return { renderer, headings };
};

export const renderMarkdownToHtml = (markdown: string): RenderedMarkdownHtml => {
  const { renderer, headings } = createDocsMarkdownRenderer();
  const html = new Marked({
    async: false,
    breaks: false,
    gfm: true,
    pedantic: false,
    renderer
  }).parse(markdown, { async: false });

  return { html, headings };
};
