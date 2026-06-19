import { computed, Directive, ElementRef, inject, input, signal } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../shared/resolve-ui-controller';
import type { NatTableUiController } from '../../shared/table-ui.types';
import {
  exportNatTableExcel,
  resolveNatTableExcelExportColumns,
} from './table-export-excel-client';
import { NAT_TABLE_EXCEL_EXPORT } from './table-export-excel.provider';
import type {
  NatTableExcelExportConfig,
  NatTableExcelExportContext,
  NatTableExcelExportHandler,
} from './table-export-excel.types';

const DEFAULT_EXCEL_FILE_NAME = 'table-export.xlsx';

type NativeDisableableElement =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

@Directive({
  selector: '[natTableExportExcel]',
  exportAs: 'natTableExportExcel',
  host: {
    '[attr.aria-busy]': 'ariaBusy()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '(click)': 'onHostClick($event)',
    '(keydown)': 'onHostKeydown($event)',
  },
})
export class NatTableExportExcel<TData extends RowData = RowData> {
  /** Optional explicit controller for layouts outside a `NatTableService` scope. */
  public readonly for = input<NatTableUiController<TData>>();
  /** Download file name. The `.xlsx` extension is appended when omitted. */
  public readonly exportFileName = input(DEFAULT_EXCEL_FILE_NAME);
  /** Per-instance export operation. Replaces provider or client-side handlers when present. */
  public readonly exportHandler = input<NatTableExcelExportHandler<TData> | undefined>();

  protected readonly isExporting = signal(false);
  protected readonly ariaBusy = computed(() => (this.isExporting() ? 'true' : null));
  protected readonly ariaDisabled = computed(() =>
    this.isExporting() && !isNativeDisableableElement(this.element.nativeElement) ? 'true' : null,
  );

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly controller = injectNatTableUiController(this.for, 'natTableExportExcel');
  private readonly excelExportConfig = inject(
    NAT_TABLE_EXCEL_EXPORT,
  ) as NatTableExcelExportConfig<TData>;

  private previousDisabledAttribute: string | null | undefined;

  public async trigger(event?: Event): Promise<void> {
    await this.activate(event);
  }

  protected async onHostClick(event: MouseEvent): Promise<void> {
    await this.trigger(event);
  }

  protected async onHostKeydown(event: KeyboardEvent): Promise<void> {
    if (!isActivationKey(event)) return;

    if (this.isExporting()) {
      preventActivation(event);
      return;
    }

    if (isNativeActivatableElement(this.element.nativeElement)) {
      return;
    }

    await this.trigger(event);
  }

  private async activate(event?: Event): Promise<void> {
    if (this.isExporting()) {
      if (event) {
        preventActivation(event);
      }

      return;
    }

    const controller = this.controller();

    if (!controller) {
      return;
    }

    event?.preventDefault();

    const context = this.createExportContext(controller);
    const handler = this.exportHandler() ?? this.excelExportConfig.handler ?? exportNatTableExcel;

    this.isExporting.set(true);
    this.setNativeDisabled(true);

    try {
      await handler(context);
    } finally {
      this.setNativeDisabled(false);
      this.isExporting.set(false);
    }
  }

  private createExportContext(
    controller: NatTableUiController<TData>,
  ): NatTableExcelExportContext<TData> {
    const table = controller.table;
    const context: NatTableExcelExportContext<TData> = {
      table,
      rows: table.getCoreRowModel().rows,
      columns: resolveNatTableExcelExportColumns(table.getVisibleLeafColumns()),
      fileName: normalizeNatTableExcelFileName(this.exportFileName()),
      export: () => exportNatTableExcel(context),
    };

    return context;
  }

  private setNativeDisabled(disabled: boolean): void {
    const element = this.element.nativeElement;

    if (!isNativeDisableableElement(element)) {
      return;
    }

    if (disabled) {
      if (this.previousDisabledAttribute === undefined) {
        this.previousDisabledAttribute = element.getAttribute('disabled');
      }

      element.setAttribute('disabled', '');
      element.disabled = true;
      return;
    }

    if (this.previousDisabledAttribute === undefined) {
      return;
    }

    if (this.previousDisabledAttribute === null) {
      element.removeAttribute('disabled');
      element.disabled = false;
    } else {
      element.setAttribute('disabled', this.previousDisabledAttribute);
      element.disabled = true;
    }

    this.previousDisabledAttribute = undefined;
  }
}

export function normalizeNatTableExcelFileName(fileName: string | null | undefined): string {
  const normalized = fileName?.trim() || DEFAULT_EXCEL_FILE_NAME;

  return /\.xlsx$/i.test(normalized) ? normalized : `${normalized}.xlsx`;
}

function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
}

function preventActivation(event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function isNativeDisableableElement(element: HTMLElement): element is NativeDisableableElement {
  return (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isNativeActivatableElement(element: HTMLElement): boolean {
  return (
    isNativeDisableableElement(element) || (element instanceof HTMLAnchorElement && !!element.href)
  );
}
