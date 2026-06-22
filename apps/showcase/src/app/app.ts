import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import {
  type ShowcaseNavGroup,
  type ShowcaseNavSection,
  showcaseNavSections,
} from './showcase-navigation';
import { ShowcaseThemeStore, type ShowcaseTheme } from './showcase-theme';

const EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY = 'nat-showcase-expanded-nav-tree-items';
const SHOWCASE_NAV_BRANCH_IDS = getShowcaseNavBranchIds(showcaseNavSections);
const SHOWCASE_NAV_BRANCH_ID_SET = new Set(SHOWCASE_NAV_BRANCH_IDS);

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, Tree, TreeItem, TreeItemGroup],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly themeStore = inject(ShowcaseThemeStore);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');
  private readonly mobileNavCloseButton =
    viewChild<ElementRef<HTMLButtonElement>>('mobileNavCloseButton');
  private readonly mobileNavPanel = viewChild<ElementRef<HTMLElement>>('mobileNavPanel');
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly navSections = showcaseNavSections;
  protected readonly expandedNavTreeBranchIds = signal<ReadonlySet<string>>(
    readInitialExpandedNavTreeBranchIds(),
  );
  protected readonly mobileNavOpen = signal(false);
  protected readonly theme = this.themeStore.theme;
  protected readonly activeNavRoutePath = computed(() => normalizeRoutePath(this.currentUrl()));
  protected readonly activeNavTreeValues = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? [activeRoutePath] : [];
  });
  protected readonly activeNavBranchIds = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? findNavBranchIdsByRoute(this.navSections, activeRoutePath) : [];
  });

  constructor() {
    effect(() => {
      const activeBranchIds = this.activeNavBranchIds();

      if (!activeBranchIds.length) {
        return;
      }

      untracked(() => this.setNavTreeBranchesExpanded(activeBranchIds, true));
    });
  }

  protected setTheme(theme: ShowcaseTheme): void {
    this.themeStore.setTheme(theme);
  }

  protected isNavTreeBranchExpanded(sectionId: string): boolean {
    return this.expandedNavTreeBranchIds().has(sectionId);
  }

  protected navTreeBranchContainsCurrentRoute(
    branch: ShowcaseNavSection | ShowcaseNavGroup,
  ): boolean {
    const activeRoutePath = this.activeNavRoutePath();

    return branchContainsRoute(branch, activeRoutePath);
  }

  protected setNavTreeBranchExpanded(branchId: string, expanded: boolean): void {
    this.setNavTreeBranchesExpanded([branchId], expanded);
  }

  private setNavTreeBranchesExpanded(branchIds: readonly string[], expanded: boolean): void {
    if (!branchIds.some((branchId) => SHOWCASE_NAV_BRANCH_ID_SET.has(branchId))) {
      return;
    }

    const nextBranchIds = setExpandedNavTreeBranches(
      this.expandedNavTreeBranchIds(),
      branchIds,
      expanded,
    );

    this.expandedNavTreeBranchIds.set(nextBranchIds);
    persistExpandedNavTreeBranchIds(nextBranchIds);
  }

  protected toggleMobileNav(): void {
    if (this.mobileNavOpen()) {
      this.closeMobileNav();
      return;
    }

    this.openMobileNav();
  }

  protected openMobileNav(): void {
    this.mobileNavOpen.set(true);
    this.focusAfterRender(() => this.mobileNavCloseButton()?.nativeElement);
  }

  protected closeMobileNav(restoreFocus = true): void {
    if (!this.mobileNavOpen()) {
      return;
    }

    this.mobileNavOpen.set(false);

    if (restoreFocus) {
      this.focusAfterRender(() => this.mobileMenuButton()?.nativeElement);
    }
  }

  protected trapMobileNavFocus(event: KeyboardEvent): void {
    if (!this.mobileNavOpen() || event.key !== 'Tab') {
      return;
    }

    const panel = this.mobileNavPanel()?.nativeElement;

    if (!panel) {
      return;
    }

    const focusableElements = this.getFocusableElements(panel);
    const firstElement = focusableElements.at(0);
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      return;
    }

    const activeElement = this.document.activeElement;

    if (!(activeElement instanceof HTMLElement) || !panel.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]'),
    ).filter((element) => element.tabIndex >= 0 && !element.closest('[hidden]'));
  }

  private focusAfterRender(getElement: () => HTMLElement | undefined): void {
    afterNextRender({ write: () => getElement()?.focus() }, { injector: this.injector });
  }
}

function readInitialExpandedNavTreeBranchIds(): ReadonlySet<string> {
  try {
    const stored = globalThis.localStorage?.getItem(EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY);

    if (!stored) {
      return new Set(SHOWCASE_NAV_BRANCH_IDS);
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set(SHOWCASE_NAV_BRANCH_IDS);
    }

    return new Set(
      parsed.filter(
        (branchId): branchId is string =>
          typeof branchId === 'string' && SHOWCASE_NAV_BRANCH_ID_SET.has(branchId),
      ),
    );
  } catch {
    // Storage access can throw in private/sandboxed contexts; default to expanded branches.
    return new Set(SHOWCASE_NAV_BRANCH_IDS);
  }
}

function setExpandedNavTreeBranches(
  expandedBranchIds: ReadonlySet<string>,
  branchIds: readonly string[],
  expanded: boolean,
): ReadonlySet<string> {
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
}

function persistExpandedNavTreeBranchIds(expandedBranchIds: ReadonlySet<string>): void {
  try {
    globalThis.localStorage?.setItem(
      EXPANDED_NAV_TREE_ITEMS_STORAGE_KEY,
      JSON.stringify(SHOWCASE_NAV_BRANCH_IDS.filter((branchId) => expandedBranchIds.has(branchId))),
    );
  } catch {
    // Ignore quota / privacy-mode failures.
  }
}

function normalizeRoutePath(url: string): string {
  return url.split(/[?#]/, 1)[0] ?? url;
}

function getShowcaseNavBranchIds(sections: readonly ShowcaseNavSection[]): string[] {
  return sections.flatMap((section) => [section.id, ...section.groups.map((group) => group.id)]);
}

function findNavBranchIdsByRoute(
  sections: readonly ShowcaseNavSection[],
  routePath: string,
): string[] {
  for (const section of sections) {
    const group = section.groups.find((navGroup) =>
      navGroup.items.some((item) => item.path === routePath),
    );

    if (group) {
      return [section.id, group.id];
    }
  }

  return [];
}

function branchContainsRoute(
  branch: ShowcaseNavSection | ShowcaseNavGroup,
  routePath: string,
): boolean {
  if ('groups' in branch) {
    return branch.groups.some((group) => branchContainsRoute(group, routePath));
  }

  return branch.items.some((item) => item.path === routePath);
}
