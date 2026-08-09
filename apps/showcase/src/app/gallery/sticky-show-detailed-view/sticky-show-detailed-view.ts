import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import { NgTemplateOutlet } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { Component, ViewContainerRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(5);

@Component({
  selector: 'app-sticky-show-detailed-view',
  imports: [NatTable, NatTableSurface, NgTemplateOutlet],
  providers: [Dialog],
  templateUrl: './sticky-show-detailed-view.html',
  styleUrl: './sticky-show-detailed-view.css'
})
export class StickyShowDetailedView {
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private detailDialogRef: DialogRef<unknown> | null = null;

  public readonly detailDialogTemplate = viewChild.required<TemplateRef<unknown>>('detailDialogTemplate');

  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = getMockOrderRowId;

  protected readonly detailedRows = generateMockOrderRows(50);
  protected readonly isDetailsPage = computed(() => this.router.url.endsWith('/details'));

  public readonly tables = [
    {
      type: 'dialog',
      label: 'Detailed View in Modal Dialog',
      description:
        'The table below is a summary view. Clicking the button opens the full-height scrollable table in an accessible dialog overlay.'
    },
    {
      type: 'page',
      label: 'Detailed View in Separate Page',
      description:
        'The table below is a summary view. Clicking the button navigates to a new page route where the table occupies the full viewport height.'
    }
  ];

  public readonly tableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 5
    },
    columnVisibility: {
      customer: false,
      owner: false,
      region: false,
      items: false,
      updatedAt: false,
      total: false,
      actions: false
    }
  });

  public readonly detailedTableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 25
    },
    columnVisibility: {
      customer: true,
      owner: true,
      region: true,
      updatedAt: true,
      total: true,
      actions: true
    }
  });

  protected openDetail(type: string, event?: Event): void {
    if (type === 'dialog') {
      // CDK owns focus trapping, Escape/backdrop dismissal, scroll blocking,
      // background aria-hidden management, and focus restore on close.
      // Closing an already-closed ref is a no-op, so the ref may go stale
      // after Escape/backdrop dismissal without needing a closed-subscription.
      // Restore focus to the clicked trigger explicitly: Safari and Firefox on
      // macOS do not focus buttons on click, so CDK's default (the previously
      // focused element) would restore to `body` there.
      const trigger = event?.currentTarget;

      this.detailDialogRef = this.dialog.open(this.detailDialogTemplate(), {
        ariaLabel: 'Detailed order table',
        viewContainerRef: this.viewContainerRef,
        panelClass: 'sc-detail-dialog-panel',
        backdropClass: 'sc-detail-dialog-backdrop',
        restoreFocus: trigger instanceof HTMLElement ? trigger : true
      });
    } else {
      void this.router.navigate(['/examples/sticky-show-detailed-view/details']);
    }
  }

  protected closeDialog(): void {
    this.detailDialogRef?.close();
  }

  protected goBack(): void {
    void this.router.navigate(['/examples/sticky-show-detailed-view']);
  }
}
