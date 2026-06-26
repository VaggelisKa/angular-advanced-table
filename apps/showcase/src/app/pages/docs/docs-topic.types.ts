import type { Type } from '@angular/core';

export type DocsCodeSnippet = {
  readonly id: string;
  readonly label: string;
  readonly language: string;
  readonly code: string;
};

export type DocsMarkdownBlock = {
  readonly kind: 'markdown';
  readonly id: string;
  readonly markdownPath: string;
};

export type DocsTopicExampleBlock = {
  readonly kind: 'example';
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly component: Type<unknown>;
  readonly snippets: readonly DocsCodeSnippet[];
};

export type DocsRelatedTopic = {
  readonly label: string;
  readonly path: string;
};

export type DocsTopicBlock = DocsMarkdownBlock | DocsTopicExampleBlock;

export type DocsTopicContent = {
  readonly id: string;
  readonly contents?: readonly DocsRelatedTopic[];
  readonly blocks: readonly DocsTopicBlock[];
  readonly related?: readonly DocsRelatedTopic[];
};
