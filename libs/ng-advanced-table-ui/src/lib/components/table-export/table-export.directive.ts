import { computed, Directive, ElementRef, inject, input, signal } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import { injectNatTableUiController } from '../../shared/resolve-ui-controller';
import type { NatTableUiController } from '../../shared/table-ui.types';
import {
  createNatTableExportData,
  exportNatTableCsv,
  resolveNatTableExportColumns,
} from './table-export-client';
import { NAT_TABLE_EXPORT } from './table-export.provider';
import type {
  NatTableExportConfig,
  NatTableExportContext,
  NatTableExportData,
  NatTableExportHandler,
} from './table-export.types';

const DEFAULT_EXPORT_FILE_NAME = 'table-export';

type NativeDisableableElement =
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

@Directive({
  selector: '[natTableExport]',
  exportAs: 'natTableExport',
  host: {
    '[attr.aria-busy]': 'ariaBusy()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '(click)': 'onHostClick($event)',
    '(keydown)': 'onHostKeydown($event)',
  },
})
export class NatTableExport<TData extends RowData = RowData> {
  /** Optional explicit controller for layouts outside a `NatTableService` scope. */
  public readonly for = input<NatTableUiController<TData>>();
  /** Base download file name. The built-in CSV handler appends `.csv` when omitted. */
  public readonly exportFileName = input(DEFAULT_EXPORT_FILE_NAME);
  /** Per-instance export operation. Replaces provider or built-in CSV handlers when present. */
  public readonly exportHandler = input<NatTableExportHandler<TData> | undefined>();

  protected readonly isExporting = signal(false);
  protected readonly ariaBusy = computed(() => (this.isExporting() ? 'true' : null));
  protected readonly ariaDisabled = computed(() =>
    this.isExporting() && !isNativeDisableableElement(this.element.nativeElement) ? 'true' : null,
  );

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly controller = injectNatTableUiController(this.for, 'natTableExport');
  private readonly exportConfig = inject(NAT_TABLE_EXPORT) as NatTableExportConfig<TData>;

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
    const handler = this.exportHandler() ?? this.exportConfig.handler ?? exportNatTableCsv;

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
  ): NatTableExportContext<TData> {
    const table = controller.table;
    let data: NatTableExportData | undefined;
    const context: NatTableExportContext<TData> = {
      table,
      rows: table.getCoreRowModel().rows,
      columns: resolveNatTableExportColumns(table.getVisibleLeafColumns()),
      fileName: normalizeNatTableExportFileName(this.exportFileName()),
      getData: () => {
        data ??= createNatTableExportData(context);

        return data;
      },
      exportCsv: () => exportNatTableCsv(context),
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

export function normalizeNatTableExportFileName(fileName: string | null | undefined): string {
  return fileName?.trim() || DEFAULT_EXPORT_FILE_NAME;
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
