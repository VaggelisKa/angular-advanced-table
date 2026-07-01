import {
  SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH,
  SHOWCASE_DEFAULT_ROUTE_PATH,
  SHOWCASE_DOCS_INDEX_ROUTE_PATH,
  SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH
} from '../routing/app.route-paths';
import { showcaseNavSections } from '../showcase-navigation';
import type { ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from '../showcase-navigation';

const getShowcaseNavBranchIds = (sections: readonly ShowcaseNavSection[]): string[] => {
  return sections.flatMap((section) => [section.id, ...section.groups.map((group) => group.id)]);
};

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';
const SHOWCASE_NAV_BRANCH_IDS = getShowcaseNavBranchIds(showcaseNavSections);

const SHOWCASE_NAV_BRANCH_ID_SET = new Set(SHOWCASE_NAV_BRANCH_IDS);

const DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS = ['docs'];

export const createInitialExpandedNavTreeBranchIds = (): ReadonlySet<string> => new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);

export const hasKnownNavTreeBranch = (branchIds: readonly string[]): boolean =>
  branchIds.some((branchId) => SHOWCASE_NAV_BRANCH_ID_SET.has(branchId));

export const readStoredExpandedNavTreeBranchIds = (storage: Storage): ReadonlySet<string> => {
  try {
    const stored = storage.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);

    if (!stored) {
      return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
    }

    return new Set(
      parsed.filter((branchId): branchId is string => typeof branchId === 'string' && SHOWCASE_NAV_BRANCH_ID_SET.has(branchId))
    );
  } catch {
    // Storage access can throw in private/sandboxed contexts; default to top-level branches.
    return new Set(DEFAULT_EXPANDED_NAV_TREE_BRANCH_IDS);
  }
};

export const readBrowserStorage = (): Storage | null => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

export const readInitialRouteUrl = (document: Document, routerUrl: string): string => {
  if (routerUrl !== '' && routerUrl !== '/') {
    return routerUrl;
  }

  const routeUrl = `${document.location.pathname}${document.location.search}${document.location.hash}`;

  return routeUrl.startsWith('/') ? routeUrl : routerUrl;
};

export const normalizeRoutePath = (url: string): string => {
  const routePath = url.split(/[?#]/, 1)[0] ?? url;
  const routePathWithoutSlash = routePath.replace(/^\/+/, '');

  if (routePathWithoutSlash === '' || routePathWithoutSlash === SHOWCASE_DOCS_INDEX_ROUTE_PATH) {
    return `/${SHOWCASE_DEFAULT_ROUTE_PATH}`;
  }

  if (routePathWithoutSlash === SHOWCASE_EXAMPLES_INDEX_ROUTE_PATH) {
    return `/${SHOWCASE_DEFAULT_EXAMPLE_ROUTE_PATH}`;
  }

  return routePath.startsWith('/') ? routePath : `/${routePath}`;
};

export const findNavBranchIdsByRoute = (sections: readonly ShowcaseNavSection[], routePath: string): string[] => {
  for (const section of sections) {
    if (section.items.some((item) => item.path === routePath)) {
      return [section.id];
    }

    const group = section.groups.find((navGroup) => navGroup.items.some((item) => item.path === routePath));

    if (group) {
      return [section.id, group.id];
    }
  }

  return [];
};

export const branchContainsRoute = (branch: ShowcaseNavSection | ShowcaseNavGroup, routePath: string): boolean => {
  if ('groups' in branch) {
    return (
      branch.items.some((item) => item.path === routePath) || branch.groups.some((group) => branchContainsRoute(group, routePath))
    );
  }

  return branch.items.some((item) => item.path === routePath);
};

export const isDocsNavItem = (item: ShowcaseNavItem): boolean => {
  return item.path.startsWith('/docs/');
};

export const setExpandedNavTreeBranches = (
  expandedBranchIds: ReadonlySet<string>,
  branchIds: readonly string[],
  expanded: boolean
): ReadonlySet<string> => {
  const nextBranchIds = new Set(expandedBranchIds);

  for (const branchId of branchIds) {
    if (!SHOWCASE_NAV_BRANCH_ID_SET.has(branchId)) {
      continue;
    }

    if (expanded) {
      nextBranchIds.add(branchId);
    } else {
      nextBranchIds.delete(branchId);
    }
  }

  return nextBranchIds;
};

export const persistExpandedNavTreeBranchIds = (storage: Storage, expandedBranchIds: ReadonlySet<string>): void => {
  try {
    storage.setItem(
      EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY,
      JSON.stringify(SHOWCASE_NAV_BRANCH_IDS.filter((branchId) => expandedBranchIds.has(branchId)))
    );
  } catch {
    // Ignore quota / privacy-mode failures.
  }
};
