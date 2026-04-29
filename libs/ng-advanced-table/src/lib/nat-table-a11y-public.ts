/**
 * Re-exports deep accessibility formatter context types under the
 * `NatTableA11y` namespace (see package `public-api.ts`). Prefer importing
 * `NatTableAccessibilityText` from the package root; use `NatTableA11y.*`
 * when typing custom announcement callbacks explicitly.
 */
export type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySummaryContext,
} from './components/table/table.types';
