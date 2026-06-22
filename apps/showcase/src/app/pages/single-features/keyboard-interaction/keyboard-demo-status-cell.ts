import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo-status',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-toggle {
      width: 16px;
      height: 16px;
      accent-color: var(--showcase-page-accent);
    }
  `,
  template: `
    <input
      [attr.aria-label]="'Active ' + name()"
      [checked]="isActive()"
      class="status-toggle"
      type="checkbox"
      (change)="toggled.emit()"
    />
    <span class="status-text">{{ status() }}</span>
  `,
})
export class KeyboardDemoStatusCell {
  public readonly name = input.required<string>();
  public readonly status = input.required<string>();
  public readonly toggled = output();

  protected readonly isActive = computed(() => this.status() === 'Active');
}
