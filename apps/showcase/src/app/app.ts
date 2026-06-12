import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ShowcaseThemeStore, type ShowcaseTheme } from './showcase-theme';

const showcaseExamples = [
  {
    label: 'Multiple features',
    description: 'Kitchen sink demo',
    path: '/examples/multiple-features',
  },
  {
    label: 'Table builder',
    description: 'Interactive config',
    path: '/builder',
  },
  {
    label: 'Sorting',
    description: 'Column sorting',
    path: '/sorting',
  },
  {
    label: 'Locale-aware sorting',
    description: 'Intl.Collator string sorting',
    path: '/locale-sorting',
  },
  {
    label: 'Column pinning',
    description: 'Sticky boundary pinning',
    path: '/pinning',
  },
  {
    label: 'Column reordering',
    description: 'Drag-and-drop headers',
    path: '/reordering',
  },
  {
    label: 'Pagination',
    description: 'Row-based pagination',
    path: '/pagination',
  },
  {
    label: 'Column visibility',
    description: 'Dynamic column display',
    path: '/visibility',
  },
  {
    label: 'Global search',
    description: 'Fuzzy filter mapping',
    path: '/search',
  },
  {
    label: 'Sticky header',
    description: 'Fixed viewport headers',
    path: '/sticky-header',
  },
  {
    label: 'Sorting with pinned columns',
    description: 'Fixed owner and total columns',
    path: '/examples/simple-sorting',
  },
];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly themeStore = inject(ShowcaseThemeStore);

  protected readonly examples = showcaseExamples;
  protected readonly exactLinkMatch = { exact: true };
  protected readonly theme = this.themeStore.theme;

  protected setTheme(theme: ShowcaseTheme): void {
    this.themeStore.setTheme(theme);
  }
}
