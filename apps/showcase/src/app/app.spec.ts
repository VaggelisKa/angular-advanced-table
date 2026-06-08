import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';

@Component({
  selector: 'app-test-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: 'Example route',
})
class TestExamplePage {}

describe('App', () => {
  beforeEach(async () => {
    try {
      globalThis.localStorage?.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'examples/multiple-features',
          },
          {
            path: 'examples/multiple-features',
            component: TestExamplePage,
          },
          {
            path: 'examples/simple-sorting',
            component: TestExamplePage,
          },
        ]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the examples navigation shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('.showcase-nav')?.textContent).toContain('Table examples');
    const links = Array.from(compiled.querySelectorAll('.showcase-nav-link'));
    const linkLabels = links.map((link) => link.textContent);
    const linkTargets = links.map((link) => link.getAttribute('href'));

    const expectedLabels = fixture.componentInstance['examples'].map(
      (example) => expect.stringContaining(example.label)
    );
    const expectedTargets = fixture.componentInstance['examples'].map(
      (example) => example.path
    );

    expect(linkLabels).toEqual(expectedLabels);
    expect(linkTargets).toEqual(expectedTargets);
    expect(compiled.querySelector('.showcase-theme-toggle')).not.toBeNull();
  });

  it('should toggle the showcase theme from the sidenav', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const shell = compiled.querySelector('.showcase-shell') as HTMLDivElement;
    const darkOption = compiled.querySelectorAll('.showcase-theme-option')[1] as HTMLButtonElement;
    const lightOption = compiled.querySelectorAll('.showcase-theme-option')[0] as HTMLButtonElement;

    darkOption.click();
    fixture.detectChanges();

    expect(shell.getAttribute('data-theme')).toBe('dark');
    expect(darkOption.getAttribute('aria-pressed')).toBe('true');

    lightOption.click();
    fixture.detectChanges();

    expect(shell.getAttribute('data-theme')).toBe('light');
    expect(lightOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('should route the default page to the multiple features example', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.textContent).toContain('Example route');
  });
});
