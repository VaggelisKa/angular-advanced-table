import { NgTemplateOutlet } from '@angular/common';
import type { ElementRef } from '@angular/core';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import type { NatTableUserState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { mockOrderColumns } from '../../mock-order/mock-order-columns';
import { generateMockOrderRows, getMockOrderRowId } from '../../mock-order/mock-order.util';

const mockOrderRows = generateMockOrderRows(5);

@Component({
  selector: 'app-sticky-show-detailed-view',
  imports: [NatTable, NatTableSurface, NgTemplateOutlet],
  templateUrl: './sticky-show-detailed-view.html',
  styleUrl: './sticky-show-detailed-view.css'
})
export class StickyShowDetailedView {
  private readonly router = inject(Router);

  public readonly detailDialog = viewChild.required<ElementRef<HTMLDialogElement>>('detailDialog');

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

  protected openDetail(type: string): void {
    if (type === 'dialog') {
      this.detailDialog().nativeElement.showModal();
    } else {
      void this.router.navigate(['/examples/sticky-show-detailed-view/details']);
    }
  }

  protected closeDialog(): void {
    this.detailDialog().nativeElement.close();
  }

  protected goBack(): void {
    void this.router.navigate(['/examples/sticky-show-detailed-view']);
  }

  protected onDialogClick(event: MouseEvent): void {
    const dialog = this.detailDialog().nativeElement;

    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isInside) {
        dialog.close();
      }
    }
  }

  protected onDialogKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }
}
