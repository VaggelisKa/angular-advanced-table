import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PRIMARY_OUTLET, TitleStrategy } from '@angular/router';
import type { ActivatedRouteSnapshot, Data, RouterStateSnapshot } from '@angular/router';

const DEFAULT_SHOWCASE_TITLE = 'Angular Advanced Table';
const DEFAULT_SHOWCASE_DESCRIPTION = 'Angular Advanced Table documentation and interactive examples.';
const DEFAULT_OPEN_GRAPH_TYPE = 'website';
const DEFAULT_OPEN_GRAPH_URL = '/';

type ShowcaseRouteMetaData = {
  readonly description?: unknown;
  readonly ogType?: unknown;
};

function findDeepestPrimaryRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  let currentRoute = route;
  let nextRoute = currentRoute.children.find((child) => child.outlet === PRIMARY_OUTLET);

  while (nextRoute) {
    currentRoute = nextRoute;
    nextRoute = currentRoute.children.find((child) => child.outlet === PRIMARY_OUTLET);
  }

  return currentRoute;
}

function readRouteMetaData(data: Data): ShowcaseRouteMetaData {
  return {
    description: data['description'],
    ogType: data['ogType']
  };
}

function normalizeMetaContent(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeOpenGraphUrl(url: string): string {
  const [routeUrl = DEFAULT_OPEN_GRAPH_URL] = url.split('#', 1);
  const normalizedRouteUrl = routeUrl || DEFAULT_OPEN_GRAPH_URL;

  return normalizedRouteUrl.startsWith('/') ? normalizedRouteUrl : `/${normalizedRouteUrl}`;
}

@Injectable({ providedIn: 'root' })
export class ShowcaseTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  public override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? DEFAULT_SHOWCASE_TITLE;
    const routeData = readRouteMetaData(findDeepestPrimaryRoute(snapshot.root).data);
    const description = normalizeMetaContent(routeData.description, DEFAULT_SHOWCASE_DESCRIPTION);
    const ogType = normalizeMetaContent(routeData.ogType, DEFAULT_OPEN_GRAPH_TYPE);
    const ogUrl = normalizeOpenGraphUrl(snapshot.url);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:url', content: ogUrl });
  }
}
