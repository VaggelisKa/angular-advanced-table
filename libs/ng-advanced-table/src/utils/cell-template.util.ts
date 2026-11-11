import type { TemplateRef } from '@angular/core';

/**
 * Indexes projected cell templates by column id. The first template declared
 * for an id wins, so a duplicate never swaps the rendered template at runtime.
 */
export const indexCellTemplates = <TContext>(
  templates: readonly { readonly columnId: () => string; readonly templateRef: TemplateRef<unknown> }[]
): ReadonlyMap<string, TemplateRef<TContext>> => {
  const byColumnId = new Map<string, TemplateRef<TContext>>();

  for (const template of templates) {
    const columnId = template.columnId();

    if (!byColumnId.has(columnId)) {
      byColumnId.set(columnId, template.templateRef as TemplateRef<TContext>);
    }
  }

  return byColumnId;
};
