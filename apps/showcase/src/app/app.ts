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
    label: 'Simple sorting',
    description: 'Mock table only',
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
