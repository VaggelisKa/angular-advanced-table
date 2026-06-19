import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';

@Component({
  selector: 'app-test-example',
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

    const expectedLabels = fixture.componentInstance['examples'].map((example) =>
      expect.stringContaining(example.label),
    );
    const expectedTargets = fixture.componentInstance['examples'].map((example) => example.path);

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

  it('should open and close the mobile navigation drawer from the trigger', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('.showcase-nav') as HTMLElement;
    const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-controls')).toBe('showcase-navigation');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(nav.classList.contains('is-open')).toBe(false);

    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(nav.classList.contains('is-open')).toBe(true);
    expect(nav.getAttribute('role')).toBe('dialog');
    expect(nav.getAttribute('aria-modal')).toBe('true');
    expect(compiled.querySelector('.showcase-nav-backdrop')).not.toBeNull();

    const closeButton = compiled.querySelector('.showcase-nav-close') as HTMLButtonElement;
    closeButton.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(nav.classList.contains('is-open')).toBe(false);
    expect(nav.getAttribute('role')).toBeNull();
    expect(nav.getAttribute('aria-modal')).toBeNull();
    expect(compiled.querySelector('.showcase-nav-backdrop')).toBeNull();
  });

  it('should move focus into the mobile drawer and restore it on close', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;
    const closeButton = compiled.querySelector('.showcase-nav-close') as HTMLButtonElement;

    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    await waitForFocusHandoff();

    expect(document.activeElement).toBe(closeButton);

    closeButton.click();
    await fixture.whenStable();
    await waitForFocusHandoff();

    expect(document.activeElement).toBe(trigger);
  });

  it('should close the mobile drawer after choosing a navigation link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector('.showcase-menu-button') as HTMLButtonElement;
    const nav = compiled.querySelector('.showcase-nav') as HTMLElement;
    const firstLink = compiled.querySelector('.showcase-nav-link') as HTMLAnchorElement;

    trigger.click();
    await fixture.whenStable();

    expect(nav.classList.contains('is-open')).toBe(true);

    firstLink.click();
    await fixture.whenStable();

    expect(nav.classList.contains('is-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
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

function waitForFocusHandoff(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}
