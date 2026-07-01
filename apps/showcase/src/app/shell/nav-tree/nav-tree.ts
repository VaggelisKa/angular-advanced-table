import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { DOCUMENT } from '@angular/common';
import { Component, afterNextRender, computed, effect, inject, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import * as navUtil from './nav-tree.util';
import { loadDocsPage } from '../routing/app.routes';
import { showcaseNavSections } from '../showcase-navigation';
import type { ShowcaseNavGroup, ShowcaseNavItem, ShowcaseNavSection } from '../showcase-navigation';

@Component({
  selector: 'app-nav-tree',
  imports: [RouterLink, Tree, TreeItem, TreeItemGroup],
  templateUrl: './nav-tree.html',
  styleUrl: './nav-tree.css'
})
export class NavTree {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private navTreeStorage: Storage | null = null;
  private readonly initialRouteUrl = navUtil.readInitialRouteUrl(this.document, this.router.url);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.initialRouteUrl)
    ),
    { initialValue: this.initialRouteUrl }
  );

  protected readonly navSections = showcaseNavSections;
  protected readonly expandedNavTreeBranchIds = signal<ReadonlySet<string>>(navUtil.createInitialExpandedNavTreeBranchIds());
  protected readonly navTreeHydrated = signal(false);
  protected readonly docsPagePrefetched = signal(false);
  protected readonly navigate = output();
  protected readonly activeNavRoutePath = computed(() => navUtil.normalizeRoutePath(this.currentUrl()));
  protected readonly activeNavTreeValues = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? [activeRoutePath] : [];
  });

  protected readonly activeNavBranchIds = computed(() => {
    const activeRoutePath = this.activeNavRoutePath();

    return activeRoutePath ? navUtil.findNavBranchIdsByRoute(this.navSections, activeRoutePath) : [];
  });

  public constructor() {
    effect(() => {
      const activeBranchIds = this.activeNavBranchIds();

      if (!activeBranchIds.length) {
        return;
      }

      untracked(() => this.setNavTreeBranchesExpanded(activeBranchIds, true));
    });

    afterNextRender(() => {
      this.restoreExpandedNavTreeBranches();
      this.navTreeHydrated.set(true);
    });
  }

  protected isNavTreeBranchExpanded(sectionId: string): boolean {
    return this.expandedNavTreeBranchIds().has(sectionId);
  }

  protected navTreeBranchContainsCurrentRoute(branch: ShowcaseNavSection | ShowcaseNavGroup): boolean {
    const activeRoutePath = this.activeNavRoutePath();

    return navUtil.branchContainsRoute(branch, activeRoutePath);
  }

  protected navItemIsCurrentRoute(item: ShowcaseNavItem): boolean {
    return item.path === this.activeNavRoutePath();
  }

  protected setNavTreeBranchExpanded(branchId: string, expanded: boolean): void {
    this.setNavTreeBranchesExpanded([branchId], expanded);
  }

  protected prefetchNavItem(item: ShowcaseNavItem): void {
    if (navUtil.isDocsNavItem(item) && !this.docsPagePrefetched()) {
      this.docsPagePrefetched.set(true);
      void loadDocsPage();
    }
  }

  private setNavTreeBranchesExpanded(branchIds: readonly string[], expanded: boolean): void {
    if (!navUtil.hasKnownNavTreeBranch(branchIds)) {
      return;
    }

    const nextBranchIds = navUtil.setExpandedNavTreeBranches(this.expandedNavTreeBranchIds(), branchIds, expanded);

    this.expandedNavTreeBranchIds.set(nextBranchIds);

    if (this.navTreeStorage) {
      navUtil.persistExpandedNavTreeBranchIds(this.navTreeStorage, nextBranchIds);
    }
  }

  private restoreExpandedNavTreeBranches(): void {
    const storage = navUtil.readBrowserStorage();

    if (!storage) {
      return;
    }

    this.navTreeStorage = storage;
    const storedBranchIds = navUtil.readStoredExpandedNavTreeBranchIds(storage);
    const expandedBranchIds = navUtil.setExpandedNavTreeBranches(storedBranchIds, this.activeNavBranchIds(), true);

    this.expandedNavTreeBranchIds.set(expandedBranchIds);
  }
}
