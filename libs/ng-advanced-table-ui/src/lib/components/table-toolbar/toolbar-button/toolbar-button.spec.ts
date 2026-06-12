import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NatToolbarButton } from './toolbar-button';

@Component({
  imports: [NatToolbarButton],
  template: `
    <button natToolbarButton id="text-btn">Export</button>
    <a natToolbarButton id="link-btn">Download</a>
  `,
})
class TestHost {}

describe('NatToolbarButton', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders on a button host and applies the nat-toolbar-button class', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('#text-btn') as HTMLElement;
    expect(btn).toBeTruthy();
    expect(btn.classList.contains('nat-toolbar-button')).toBe(true);
  });

  it('renders on an anchor host and applies the nat-toolbar-button class', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('#link-btn') as HTMLElement;
    expect(link).toBeTruthy();
    expect(link.classList.contains('nat-toolbar-button')).toBe(true);
  });

  it('projects text content', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('#text-btn') as HTMLElement;
    expect(btn.textContent?.trim()).toBe('Export');
  });
});
