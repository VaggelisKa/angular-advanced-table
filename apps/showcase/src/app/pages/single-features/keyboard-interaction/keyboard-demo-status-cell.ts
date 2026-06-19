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
      type="checkbox"
      class="status-toggle"
      [checked]="isActive()"
      [attr.aria-label]="'Active ' + name()"
      (change)="toggled.emit()"
    />
    <span class="status-text">{{ status() }}</span>
  `,
})
export class KeyboardDemoStatusCell {
  readonly name = input.required<string>();
  readonly status = input.required<string>();
  readonly toggled = output<void>();

  protected readonly isActive = computed(() => this.status() === 'Active');
}
