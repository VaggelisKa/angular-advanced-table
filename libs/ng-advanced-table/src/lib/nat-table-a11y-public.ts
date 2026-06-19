/**
 * Re-exports deep accessibility formatter context types under the
 * `NatTableA11y` namespace (see package `public-api.ts`). Prefer importing
 * `NatTableAccessibilityText` from the package root; use `NatTableA11y.*`
 * when typing custom announcement callbacks explicitly.
 */
export type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySummaryContext,
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext,
  NatTableStateTemplateContext,
} from './components/table/table.types';
