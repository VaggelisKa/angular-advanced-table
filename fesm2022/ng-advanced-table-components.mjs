import * as i0 from '@angular/core';
import { InjectionToken, input, inject, computed, Component, assertInInjectionContext, isDevMode, signal, ElementRef, Directive, DestroyRef, effect, numberAttribute, afterRenderEffect, model, booleanAttribute, output, viewChild, Injector, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { NatTableService, hasNatTableStateValueChanged, stripNatTableSubHeaderSorting, NatTableA11yService } from 'ng-advanced-table';
import { NAT_TABLE_CONTROLS_INTL, NAT_EN_LOCALE_ID, resolveNatTableControlsIntl, mergeColumnVisibilityLabels, mergePageSizeLabels, mergePagerLabels, mergeScrollControlLabels, mergeHeaderActionLabels } from 'ng-advanced-table/locale';
import { DOCUMENT } from '@angular/common';
import * as i1 from '@angular/aria/toolbar';
import { Toolbar, ToolbarWidgetGroup, ToolbarWidget } from '@angular/aria/toolbar';
import { FlexRender, flexRenderComponent } from '@tanstack/angular-table';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import * as i1$1 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';

/** Token under which `NatToolbarItem` provides itself on its host element. */
const NAT_TOOLBAR_ITEM = new InjectionToken('NAT_TOOLBAR_ITEM');

const NAT_TABLE_EXPORT = new InjectionToken('NAT_TABLE_EXPORT', {
    providedIn: 'root',
    factory: () => ({})
});
const provideNatTableExport = (config) => {
    if (typeof config === 'function') {
        return [{ provide: NAT_TABLE_EXPORT, useFactory: config }];
    }
    return [{ provide: NAT_TABLE_EXPORT, useValue: config }];
};

const defaultNatTableNumberFormatter = (numberValue, numberOptions, numberLocale) => new Intl.NumberFormat(numberLocale, numberOptions).format(numberValue);
const formatNatTableAccessibilityNumber = (value, formatter, options, locale) => {
    if (formatter) {
        return formatter(value, options, locale);
    }
    return defaultNatTableNumberFormatter(value, options, locale);
};

const normalizeColumnLabel = (label) => {
    const normalized = label?.trim() ?? '';
    return normalized || null;
};
const resolveNatTableColumnLabel = (columnDef, fallbackId) => {
    const hiddenHeaderLabel = normalizeColumnLabel(columnDef.meta?.hiddenHeaderLabel);
    if (hiddenHeaderLabel)
        return hiddenHeaderLabel;
    const metaLabel = columnDef.meta?.label;
    if (metaLabel)
        return metaLabel;
    if (typeof columnDef.header === 'string')
        return columnDef.header;
    const accessorKey = columnDef.accessorKey;
    if (typeof accessorKey === 'string')
        return accessorKey;
    return fallbackId || 'Column';
};
const getNatTableColumnLabel = (column) => resolveNatTableColumnLabel(column.columnDef, column.id);

const applyColumnVisibilityToggle = (column) => {
    if (!column.canToggle)
        return;
    column.column.toggleVisibility(!column.visible);
};
class NatTableColumnVisibility {
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    label = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    groupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groupAriaLabel" }] : /* istanbul ignore next */ []));
    accessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityLabels" }] : /* istanbul ignore next */ []));
    natTableService = inject(NatTableService);
    controller = computed(() => this.natTableService.controller(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    tableElementId = computed(() => this.controller()?.tableElementId() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    allLeafColumns = computed(() => this.controller()?.table.getAllLeafColumns() ?? [], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allLeafColumns" }] : /* istanbul ignore next */ []));
    visibleColumnCount = computed(() => this.controller()?.table.getVisibleLeafColumns().length ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleColumnCount" }] : /* istanbul ignore next */ []));
    totalColumnCount = computed(() => this.allLeafColumns().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalColumnCount" }] : /* istanbul ignore next */ []));
    resolvedAccessibilityLabels = computed(() => mergeColumnVisibilityLabels(this.tableUiIntl().columnVisibility?.accessibilityLabels, this.accessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedHeading = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return this.label() ?? labels.heading ?? this.tableUiIntl().columnVisibility?.label ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedHeading" }] : /* istanbul ignore next */ []));
    resolvedAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().columnVisibility?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAriaLabel" }] : /* istanbul ignore next */ []));
    visibilitySummary = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        const visibleColumnCount = this.visibleColumnCount();
        const totalColumnCount = this.totalColumnCount();
        const context = {
            visibleColumnCountValue: visibleColumnCount,
            visibleColumnCountText: formatNatTableAccessibilityNumber(visibleColumnCount, this.tableUiIntl().formatNumber, undefined, this.localeId()),
            totalColumnCountValue: totalColumnCount,
            totalColumnCountText: formatNatTableAccessibilityNumber(totalColumnCount, this.tableUiIntl().formatNumber, undefined, this.localeId())
        };
        return labels.visibilitySummary?.(context) ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibilitySummary" }] : /* istanbul ignore next */ []));
    columns = computed(() => {
        const visibleColumnCount = this.visibleColumnCount();
        const labels = this.resolvedAccessibilityLabels();
        return this.allLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
            const visible = column.getIsVisible();
            const label = getNatTableColumnLabel(column);
            const actionContext = {
                columnLabel: label,
                visibilityState: visible ? 'visible' : 'hidden',
                toggleAction: visible ? 'hide' : 'show'
            };
            const stateContext = {
                visibilityState: visible ? 'visible' : 'hidden'
            };
            return {
                column,
                label,
                visible,
                canToggle: !visible || visibleColumnCount > 1,
                actionLabel: labels.toggleColumnAriaLabel?.(actionContext) ?? '',
                stateLabel: labels.columnState?.(stateContext) ?? ''
            };
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    toggleColumnVisibility = (applyColumnVisibilityToggle);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableColumnVisibility, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTableColumnVisibility, isStandalone: true, selector: "nat-table-column-visibility", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, groupAriaLabel: { classPropertyName: "groupAriaLabel", publicName: "groupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, accessibilityLabels: { classPropertyName: "accessibilityLabels", publicName: "accessibilityLabels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (controller()) {\n  @if (columns().length) {\n    <div class=\"control-block\">\n      <div class=\"control-heading\">\n        <span class=\"control-label\">{{ resolvedHeading() }}</span>\n        <span class=\"control-caption\"> {{ visibilitySummary() }} </span>\n      </div>\n      <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"chip-row\" role=\"group\">\n        @for (column of columns(); track column.column.id) {\n          <button\n            [attr.aria-controls]=\"tableElementId()\"\n            [attr.aria-label]=\"column.actionLabel\"\n            [attr.aria-pressed]=\"column.visible\"\n            [attr.data-column-id]=\"column.column.id\"\n            [class.is-active]=\"column.visible\"\n            [disabled]=\"!column.canToggle\"\n            class=\"chip column-chip\"\n            type=\"button\"\n            (click)=\"toggleColumnVisibility(column)\">\n            <span>{{ column.label }}</span>\n            <span class=\"chip-count\"> {{ column.stateLabel }}</span>\n          </button>\n        }\n      </div>\n    </div>\n  }\n}\n", styles: [":host{display:block}.control-block{display:grid;gap:var(--nat-table-space-control-block-gap, var(--sys-nat-table-space-control-block-gap, 10px))}.control-heading{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between}.control-label{font-size:var(--nat-table-font-size-label, var(--sys-nat-table-font-size-label, .85rem));color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, inherit));text-transform:var(--nat-table-text-transform-label, var(--sys-nat-table-text-transform-label, uppercase));letter-spacing:var(--nat-table-letter-spacing-label, var(--sys-nat-table-letter-spacing-label, .08em))}.control-caption{font-size:var(--nat-table-font-size-caption, var(--sys-nat-table-font-size-caption, .82rem));color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, inherit))}.chip-row{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px))}.chip{display:inline-flex;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px));align-items:center;min-height:var(--nat-table-chip-min-height, var(--sys-nat-table-chip-min-height, 42px));padding:0 var(--nat-table-chip-padding-x, var(--sys-nat-table-chip-padding-x, 14px));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));cursor:pointer;background:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));border:1px solid var(--nat-table-chip-border-color, var(--sys-nat-table-chip-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.chip.is-active{background:var(--nat-table-chip-background-active, var(--sys-nat-table-chip-background-active, transparent));border-color:var(--nat-table-chip-border-color-active, var(--sys-nat-table-chip-border-color-active, currentColor));box-shadow:var(--nat-table-chip-shadow-active, var(--sys-nat-table-chip-shadow-active, none))}.chip:disabled{cursor:not-allowed;opacity:var(--nat-table-disabled-opacity, var(--sys-nat-table-disabled-opacity, .45));transform:none}.chip:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.column-chip{justify-content:space-between;min-width:var(--nat-table-chip-min-width-column, var(--sys-nat-table-chip-min-width-column, 150px))}.chip-count{font-size:var(--nat-table-font-size-chip-meta, var(--sys-nat-table-font-size-chip-meta, .82rem));color:var(--nat-table-chip-count-color, var(--sys-nat-table-chip-count-color, currentColor))}@media(hover:hover)and (pointer:fine){.chip:hover:not(:disabled){background:var(--nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, transparent));border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableColumnVisibility, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-column-visibility', template: "@if (controller()) {\n  @if (columns().length) {\n    <div class=\"control-block\">\n      <div class=\"control-heading\">\n        <span class=\"control-label\">{{ resolvedHeading() }}</span>\n        <span class=\"control-caption\"> {{ visibilitySummary() }} </span>\n      </div>\n      <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"chip-row\" role=\"group\">\n        @for (column of columns(); track column.column.id) {\n          <button\n            [attr.aria-controls]=\"tableElementId()\"\n            [attr.aria-label]=\"column.actionLabel\"\n            [attr.aria-pressed]=\"column.visible\"\n            [attr.data-column-id]=\"column.column.id\"\n            [class.is-active]=\"column.visible\"\n            [disabled]=\"!column.canToggle\"\n            class=\"chip column-chip\"\n            type=\"button\"\n            (click)=\"toggleColumnVisibility(column)\">\n            <span>{{ column.label }}</span>\n            <span class=\"chip-count\"> {{ column.stateLabel }}</span>\n          </button>\n        }\n      </div>\n    </div>\n  }\n}\n", styles: [":host{display:block}.control-block{display:grid;gap:var(--nat-table-space-control-block-gap, var(--sys-nat-table-space-control-block-gap, 10px))}.control-heading{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between}.control-label{font-size:var(--nat-table-font-size-label, var(--sys-nat-table-font-size-label, .85rem));color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, inherit));text-transform:var(--nat-table-text-transform-label, var(--sys-nat-table-text-transform-label, uppercase));letter-spacing:var(--nat-table-letter-spacing-label, var(--sys-nat-table-letter-spacing-label, .08em))}.control-caption{font-size:var(--nat-table-font-size-caption, var(--sys-nat-table-font-size-caption, .82rem));color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, inherit))}.chip-row{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px))}.chip{display:inline-flex;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px));align-items:center;min-height:var(--nat-table-chip-min-height, var(--sys-nat-table-chip-min-height, 42px));padding:0 var(--nat-table-chip-padding-x, var(--sys-nat-table-chip-padding-x, 14px));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));cursor:pointer;background:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));border:1px solid var(--nat-table-chip-border-color, var(--sys-nat-table-chip-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.chip.is-active{background:var(--nat-table-chip-background-active, var(--sys-nat-table-chip-background-active, transparent));border-color:var(--nat-table-chip-border-color-active, var(--sys-nat-table-chip-border-color-active, currentColor));box-shadow:var(--nat-table-chip-shadow-active, var(--sys-nat-table-chip-shadow-active, none))}.chip:disabled{cursor:not-allowed;opacity:var(--nat-table-disabled-opacity, var(--sys-nat-table-disabled-opacity, .45));transform:none}.chip:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.column-chip{justify-content:space-between;min-width:var(--nat-table-chip-min-width-column, var(--sys-nat-table-chip-min-width-column, 150px))}.chip-count{font-size:var(--nat-table-font-size-chip-meta, var(--sys-nat-table-font-size-chip-meta, .82rem));color:var(--nat-table-chip-count-color, var(--sys-nat-table-chip-count-color, currentColor))}@media(hover:hover)and (pointer:fine){.chip:hover:not(:disabled){background:var(--nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, transparent));border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] }]
        }], propDecorators: { locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], groupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "groupAriaLabel", required: false }] }], accessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityLabels", required: false }] }] } });

/**
 * THE single controller-resolution path for the toolbar and its built-ins.
 * Must be called from an injection context (constructor / field initializer).
 *
 * Resolution order: explicit `for` input ?? `NatTableService` controller
 * (provided by `nat-table-surface`) ?? null (+ one dev-mode warning).
 * Do NOT add fallback logic at call sites.
 */
const injectNatTableUiController = (forInput, debugName, options) => {
    assertInInjectionContext(injectNatTableUiController);
    const natTableService = inject(NatTableService, { optional: true });
    let hasWarned = false;
    return computed(() => {
        const controller = forInput() ?? natTableService?.controller() ?? null;
        const shouldWarn = controller === null && isDevMode() && !hasWarned && !options?.optionalUsage;
        if (shouldWarn) {
            hasWarned = true;
            console.warn(`[ng-advanced-table/components] ${debugName}: no controller resolved. ` +
                `Pass [for]="grid" explicitly or wrap the table in <nat-table-surface>.`);
        }
        return controller;
    });
};

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
const CSV_UTF8_BOM = '﻿';
const DEFAULT_CSV_EXTENSION = '.csv';
const DANGEROUS_SPREADSHEET_TEXT_PATTERN = /^[=+\-@\t\r\n]/;
const stringifyCsvCellValue = (value) => {
    if (value instanceof Date) {
        return Number.isFinite(value.getTime()) ? value.toISOString() : '';
    }
    return String(value);
};
const serializeNatTableCsvCell = (value) => {
    if (value === null)
        return '';
    const text = stringifyCsvCellValue(value);
    const safeText = DANGEROUS_SPREADSHEET_TEXT_PATTERN.test(text) ? `'${text}` : text;
    return /[",\r\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
};
const serializeNatTableCsvRow = (row) => row.map(serializeNatTableCsvCell).join(',');
const normalizeExportHeader = (value) => {
    const normalized = value?.trim() ?? '';
    return normalized || null;
};
const normalizeExportCellValue = (value) => {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string' || typeof value === 'boolean')
        return value;
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : String(value);
    }
    if (value instanceof Date)
        return value;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        }
        catch {
            return String(value);
        }
    }
    return String(value);
};
const isAccessorColumn = (column) => {
    const columnWithAccessor = column;
    const columnDefWithAccessor = column.columnDef;
    return (typeof columnWithAccessor.accessorFn === 'function' ||
        typeof columnDefWithAccessor.accessorFn === 'function' ||
        typeof columnDefWithAccessor.accessorKey === 'string');
};
const isNatTableExportColumn = (column) => {
    const exportOptions = column.columnDef.meta?.export;
    if (exportOptions?.enabled !== undefined)
        return exportOptions.enabled;
    return isAccessorColumn(column);
};
const normalizePrimitiveHeader = (header) => typeof header === 'string' || typeof header === 'number' ? normalizeExportHeader(String(header)) : null;
const resolveNatTableExportHeader = (column) => {
    const meta = column.columnDef.meta;
    const resolvedHeader = normalizeExportHeader(meta?.export?.header) ??
        normalizeExportHeader(meta?.label) ??
        normalizeExportHeader(meta?.hiddenHeaderLabel) ??
        normalizePrimitiveHeader(column.columnDef.header);
    if (resolvedHeader)
        return resolvedHeader;
    return column.id || 'Column';
};
const resolveNatTableExportCellValue = (row, column) => {
    const value = row.getValue(column.id);
    const exportOptions = column.columnDef.meta?.export;
    const exportValue = typeof exportOptions?.value === 'function'
        ? exportOptions.value({
            row,
            column,
            value
        })
        : value;
    return normalizeExportCellValue(exportValue);
};
// ponytail: browser download lives here; promote to a data-access layer only if more I/O appears
const downloadNatTableExportBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    // `document.body` is typed non-null but is absent before <body> is parsed or in
    // non-standard document hosts; query it so the nullable fallback stays type-honest.
    const anchorRoot = document.querySelector('body') ?? document.documentElement;
    anchorRoot.append(anchor);
    try {
        anchor.click();
    }
    finally {
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl));
    }
};
const createNatTableExportData = (context) => ({
    columns: context.columns.map((column) => ({
        id: column.id,
        header: resolveNatTableExportHeader(column)
    })),
    rows: context.rows.map((row) => ({
        id: row.id,
        values: context.columns.map((column) => resolveNatTableExportCellValue(row, column))
    }))
});
const createNatTableCsvBlob = (data) => {
    const headerRow = data.columns.map((column) => column.header);
    const bodyRows = data.rows.map((row) => row.values);
    const csv = [headerRow, ...bodyRows].map(serializeNatTableCsvRow).join('\r\n');
    return new Blob([CSV_UTF8_BOM, csv], { type: CSV_MIME_TYPE });
};
const resolveNatTableExportColumns = (columns) => columns.filter((column) => isNatTableExportColumn(column));
const normalizeNatTableCsvFileName = (fileName) => {
    const normalized = fileName.trim();
    return normalized.toLowerCase().endsWith(DEFAULT_CSV_EXTENSION) ? normalized : `${normalized}${DEFAULT_CSV_EXTENSION}`;
};
const exportNatTableCsv = (context) => {
    const blob = createNatTableCsvBlob(context.getData());
    downloadNatTableExportBlob(blob, normalizeNatTableCsvFileName(context.fileName));
};

const DEFAULT_EXPORT_FILE_NAME = 'table-export';
const normalizeNatTableExportFileName = (fileName) => fileName?.trim() ? fileName.trim() : DEFAULT_EXPORT_FILE_NAME;
const isActivationKey = (event) => event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
const preventActivation = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
};
const isNativeDisableableElement = (element) => element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement;
const isNativeActivatableElement = (element) => isNativeDisableableElement(element) || (element instanceof HTMLAnchorElement && !!element.href);
class NatTableExport {
    /** Optional explicit controller for layouts outside a `NatTableService` scope. */
    for = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "for" }] : /* istanbul ignore next */ []));
    /** Base download file name. The built-in CSV handler appends `.csv` when omitted. */
    exportFileName = input(DEFAULT_EXPORT_FILE_NAME, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "exportFileName" }] : /* istanbul ignore next */ []));
    /** Per-instance export operation. Replaces provider or built-in CSV handlers when present. */
    exportHandler = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "exportHandler" }] : /* istanbul ignore next */ []));
    isExporting = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isExporting" }] : /* istanbul ignore next */ []));
    ariaBusy = computed(() => (this.isExporting() ? 'true' : null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaBusy" }] : /* istanbul ignore next */ []));
    ariaDisabled = computed(() => this.isExporting() && !isNativeDisableableElement(this.element.nativeElement) ? 'true' : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaDisabled" }] : /* istanbul ignore next */ []));
    element = inject(ElementRef);
    controller = injectNatTableUiController(this.for, 'natTableExport');
    exportConfig = inject(NAT_TABLE_EXPORT);
    previousDisabledAttribute;
    async trigger(event) {
        await this.activate(event);
    }
    async onHostClick(event) {
        await this.trigger(event);
    }
    async onHostKeydown(event) {
        if (!isActivationKey(event))
            return;
        if (this.isExporting()) {
            preventActivation(event);
            return;
        }
        if (isNativeActivatableElement(this.element.nativeElement)) {
            return;
        }
        await this.trigger(event);
    }
    async activate(event) {
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
        }
        finally {
            this.setNativeDisabled(false);
            this.isExporting.set(false);
        }
    }
    createExportContext(controller) {
        const table = controller.table;
        // Remote windowing holds only a loaded window of the dataset, so the core
        // row model this export reads is not the dataset — and export deliberately
        // does not fetch: like all data acquisition, that stays consumer-owned.
        if (isDevMode() && typeof table.options.meta?.natTableRemoteRowCount === 'number') {
            console.warn('[ng-advanced-table] natTableExport exports only the loaded row window under remote windowing (remoteRowCount); unfetched rows are not exported.');
        }
        let data;
        const context = {
            table,
            rows: table.getCoreRowModel().rows,
            columns: resolveNatTableExportColumns(table.getVisibleLeafColumns()),
            fileName: normalizeNatTableExportFileName(this.exportFileName()),
            getData: () => {
                data ??= createNatTableExportData(context);
                return data;
            },
            exportCsv: async () => {
                exportNatTableCsv(context);
                await Promise.resolve();
            }
        };
        return context;
    }
    setNativeDisabled(disabled) {
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
        }
        else {
            element.setAttribute('disabled', this.previousDisabledAttribute);
            element.disabled = true;
        }
        this.previousDisabledAttribute = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableExport, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableExport, isStandalone: true, selector: "[natTableExport]", inputs: { for: { classPropertyName: "for", publicName: "for", isSignal: true, isRequired: false, transformFunction: null }, exportFileName: { classPropertyName: "exportFileName", publicName: "exportFileName", isSignal: true, isRequired: false, transformFunction: null }, exportHandler: { classPropertyName: "exportHandler", publicName: "exportHandler", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "click": "onHostClick($event)", "keydown": "onHostKeydown($event)" }, properties: { "attr.aria-busy": "ariaBusy()", "attr.aria-disabled": "ariaDisabled()" } }, exportAs: ["natTableExport"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableExport, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTableExport]',
                    exportAs: 'natTableExport',
                    host: {
                        '[attr.aria-busy]': 'ariaBusy()',
                        '[attr.aria-disabled]': 'ariaDisabled()',
                        '(click)': 'onHostClick($event)',
                        '(keydown)': 'onHostKeydown($event)'
                    }
                }]
        }], propDecorators: { for: [{ type: i0.Input, args: [{ isSignal: true, alias: "for", required: false }] }], exportFileName: [{ type: i0.Input, args: [{ isSignal: true, alias: "exportFileName", required: false }] }], exportHandler: [{ type: i0.Input, args: [{ isSignal: true, alias: "exportHandler", required: false }] }] } });

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];
const sanitizePageSizeOptions = (options) => {
    const sanitized = options.map((value) => Math.trunc(value)).filter((value) => value > 0);
    return sanitized.length ? sanitized : [...DEFAULT_PAGE_SIZE_OPTIONS];
};

class NatTablePageSize {
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    pageSizeOptions = input(DEFAULT_PAGE_SIZE_OPTIONS, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSizeOptions" }] : /* istanbul ignore next */ []));
    groupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groupAriaLabel" }] : /* istanbul ignore next */ []));
    accessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityLabels" }] : /* istanbul ignore next */ []));
    natTableService = inject(NatTableService);
    destroyRef = inject(DestroyRef);
    controller = computed(() => this.natTableService.controller(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    constructor() {
        this.natTableService.registerPagination();
        this.destroyRef.onDestroy(() => {
            this.natTableService.unregisterPagination();
        });
    }
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    table = computed(() => this.controller()?.table, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "table" }] : /* istanbul ignore next */ []));
    tableElementId = computed(() => this.controller()?.tableElementId() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    selectedPageSize = computed(() => this.table()?.getState().pagination.pageSize ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedPageSize" }] : /* istanbul ignore next */ []));
    resolvedAccessibilityLabels = computed(() => mergePageSizeLabels(this.tableUiIntl().pageSize?.accessibilityLabels, this.accessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pageSize?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAriaLabel" }] : /* istanbul ignore next */ []));
    resolvedPageSizeOptions = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        const selectedPageSize = this.selectedPageSize();
        return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
            const pageSizeText = formatNatTableAccessibilityNumber(pageSize, this.tableUiIntl().formatNumber, undefined, this.localeId());
            const context = {
                pageSizeValue: pageSize,
                pageSizeText,
                selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected'
            };
            return {
                pageSize,
                text: labels.pageSizeOptionText?.(context) ?? '',
                ariaLabel: labels.pageSizeOptionAriaLabel?.(context) ?? ''
            };
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPageSizeOptions" }] : /* istanbul ignore next */ []));
    setPageSize(pageSize) {
        if (pageSize === this.selectedPageSize()) {
            return;
        }
        this.controller()?.patchState({
            pagination: () => ({
                pageIndex: 0,
                pageSize
            })
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePageSize, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTablePageSize, isStandalone: true, selector: "nat-table-page-size", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, pageSizeOptions: { classPropertyName: "pageSizeOptions", publicName: "pageSizeOptions", isSignal: true, isRequired: false, transformFunction: null }, groupAriaLabel: { classPropertyName: "groupAriaLabel", publicName: "groupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, accessibilityLabels: { classPropertyName: "accessibilityLabels", publicName: "accessibilityLabels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"page-size-container\" role=\"group\">\n      <select\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"resolvedAriaLabel()\"\n        [value]=\"selectedPageSize()\"\n        class=\"page-size-select\"\n        (change)=\"setPageSize(+$any($event.target).value)\">\n        @for (option of resolvedPageSizeOptions(); track option.pageSize) {\n          <option [attr.aria-label]=\"option.ariaLabel\" [value]=\"option.pageSize\">{{ option.text }}</option>\n        }\n      </select>\n    </div>\n  }\n}\n", styles: [":host{display:block}.page-size-container{display:inline-flex}.page-size-select{display:inline-flex;align-items:center;min-height:var(--nat-table-chip-min-height-compact, var(--sys-nat-table-chip-min-height-compact, 36px));padding:0 32px 0 var(--nat-table-chip-padding-x-compact, var(--sys-nat-table-chip-padding-x-compact, 12px));font-family:inherit;font-size:var(--nat-table-font-size-chip-compact, var(--sys-nat-table-font-size-chip-compact, .92rem));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));appearance:none;cursor:pointer;outline:none;background-color:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));background-image:linear-gradient(45deg,transparent 50%,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%),linear-gradient(135deg,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%,transparent 50%);background-repeat:no-repeat;background-position:right 18px center,right 12px center;background-size:6px 6px,6px 6px;border:1px solid var( --nat-table-chip-border-color, var( --sys-nat-table-chip-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent))) ) );border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.page-size-select:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.page-size-select:hover{background-color:var( --nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) );border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePageSize, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-page-size', template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"page-size-container\" role=\"group\">\n      <select\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"resolvedAriaLabel()\"\n        [value]=\"selectedPageSize()\"\n        class=\"page-size-select\"\n        (change)=\"setPageSize(+$any($event.target).value)\">\n        @for (option of resolvedPageSizeOptions(); track option.pageSize) {\n          <option [attr.aria-label]=\"option.ariaLabel\" [value]=\"option.pageSize\">{{ option.text }}</option>\n        }\n      </select>\n    </div>\n  }\n}\n", styles: [":host{display:block}.page-size-container{display:inline-flex}.page-size-select{display:inline-flex;align-items:center;min-height:var(--nat-table-chip-min-height-compact, var(--sys-nat-table-chip-min-height-compact, 36px));padding:0 32px 0 var(--nat-table-chip-padding-x-compact, var(--sys-nat-table-chip-padding-x-compact, 12px));font-family:inherit;font-size:var(--nat-table-font-size-chip-compact, var(--sys-nat-table-font-size-chip-compact, .92rem));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));appearance:none;cursor:pointer;outline:none;background-color:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));background-image:linear-gradient(45deg,transparent 50%,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%),linear-gradient(135deg,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%,transparent 50%);background-repeat:no-repeat;background-position:right 18px center,right 12px center;background-size:6px 6px,6px 6px;border:1px solid var( --nat-table-chip-border-color, var( --sys-nat-table-chip-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent))) ) );border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.page-size-select:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.page-size-select:hover{background-color:var( --nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) );border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], pageSizeOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeOptions", required: false }] }], groupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "groupAriaLabel", required: false }] }], accessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityLabels", required: false }] }] } });

class NatTablePager {
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    groupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groupAriaLabel" }] : /* istanbul ignore next */ []));
    accessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityLabels" }] : /* istanbul ignore next */ []));
    natTableService = inject(NatTableService);
    destroyRef = inject(DestroyRef);
    controller = computed(() => this.natTableService.controller(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    constructor() {
        this.natTableService.registerPagination();
        this.destroyRef.onDestroy(() => {
            this.natTableService.unregisterPagination();
        });
    }
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    table = computed(() => this.controller()?.table, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "table" }] : /* istanbul ignore next */ []));
    tableElementId = computed(() => this.controller()?.tableElementId() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    pageIndex = computed(() => this.table()?.getState().pagination.pageIndex ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageIndex" }] : /* istanbul ignore next */ []));
    pageCount = computed(() => Math.max(1, this.table()?.getPageCount() ?? 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageCount" }] : /* istanbul ignore next */ []));
    currentPage = computed(() => this.pageIndex() + 1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentPage" }] : /* istanbul ignore next */ []));
    canPreviousPage = computed(() => this.table()?.getCanPreviousPage() ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canPreviousPage" }] : /* istanbul ignore next */ []));
    canNextPage = computed(() => this.table()?.getCanNextPage() ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canNextPage" }] : /* istanbul ignore next */ []));
    resolvedAccessibilityLabels = computed(() => mergePagerLabels(this.tableUiIntl().pager?.accessibilityLabels, this.accessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pager?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAriaLabel" }] : /* istanbul ignore next */ []));
    previousPageAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return labels.previousPageAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previousPageAriaLabel" }] : /* istanbul ignore next */ []));
    nextPageAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return labels.nextPageAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nextPageAriaLabel" }] : /* istanbul ignore next */ []));
    pageIndicator = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        const page = this.currentPage();
        const pageCount = this.pageCount();
        const context = {
            pageValue: page,
            pageText: formatNatTableAccessibilityNumber(page, this.tableUiIntl().formatNumber, undefined, this.localeId()),
            pageCountValue: pageCount,
            pageCountText: formatNatTableAccessibilityNumber(pageCount, this.tableUiIntl().formatNumber, undefined, this.localeId())
        };
        return labels.pageIndicator?.(context) ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageIndicator" }] : /* istanbul ignore next */ []));
    previousPage() {
        if (!this.canPreviousPage()) {
            return;
        }
        this.table()?.previousPage();
    }
    nextPage() {
        if (!this.canNextPage()) {
            return;
        }
        this.table()?.nextPage();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePager, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTablePager, isStandalone: true, selector: "nat-table-pager", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, groupAriaLabel: { classPropertyName: "groupAriaLabel", publicName: "groupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, accessibilityLabels: { classPropertyName: "accessibilityLabels", publicName: "accessibilityLabels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"pager\" role=\"group\">\n      <button\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"previousPageAriaLabel()\"\n        [disabled]=\"!canPreviousPage()\"\n        class=\"pager-button\"\n        type=\"button\"\n        (click)=\"previousPage()\">\n        <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n          <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n        </svg>\n      </button>\n      <span class=\"pager-label\">{{ pageIndicator() }}</span>\n      <button\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"nextPageAriaLabel()\"\n        [disabled]=\"!canNextPage()\"\n        class=\"pager-button\"\n        type=\"button\"\n        (click)=\"nextPage()\">\n        <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n          <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n        </svg>\n      </button>\n    </div>\n  }\n}\n", styles: [":host{display:block}.pager{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-pager-gap, var(--sys-nat-table-space-pager-gap, 8px));align-items:center}.pager-button{display:inline-flex;align-items:center;justify-content:center;min-width:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));min-height:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));padding:0 var(--nat-table-pager-padding-x, var(--sys-nat-table-pager-padding-x, 18px));font-weight:var(--nat-table-font-weight-pager, var(--sys-nat-table-font-weight-pager, 700));color:var(--nat-table-pager-color, var(--sys-nat-table-pager-color, inherit));letter-spacing:var(--nat-table-letter-spacing-pager, var(--sys-nat-table-letter-spacing-pager, .01em));cursor:pointer;background:var(--nat-table-pager-background, var(--sys-nat-table-pager-background, transparent));border:1px solid var(--nat-table-pager-border-color, var(--sys-nat-table-pager-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.pager-button:disabled{cursor:not-allowed;opacity:var(--nat-table-pager-disabled-opacity, var(--sys-nat-table-pager-disabled-opacity, .45));transform:none}.pager-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.pager-label{font-size:var(--nat-table-font-size-pager-label, var(--sys-nat-table-font-size-pager-label, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-pager-label-color, var(--sys-nat-table-pager-label-color, currentColor))}.pager-icon{display:block;width:1rem;height:1rem}@media(hover:hover)and (pointer:fine){.pager-button:hover:not(:disabled){background:var(--nat-table-pager-background-hover, var(--sys-nat-table-pager-background-hover, transparent));box-shadow:var(--nat-table-pager-shadow-hover, var(--sys-nat-table-pager-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePager, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-pager', template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"pager\" role=\"group\">\n      <button\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"previousPageAriaLabel()\"\n        [disabled]=\"!canPreviousPage()\"\n        class=\"pager-button\"\n        type=\"button\"\n        (click)=\"previousPage()\">\n        <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n          <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n        </svg>\n      </button>\n      <span class=\"pager-label\">{{ pageIndicator() }}</span>\n      <button\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"nextPageAriaLabel()\"\n        [disabled]=\"!canNextPage()\"\n        class=\"pager-button\"\n        type=\"button\"\n        (click)=\"nextPage()\">\n        <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n          <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n        </svg>\n      </button>\n    </div>\n  }\n}\n", styles: [":host{display:block}.pager{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-pager-gap, var(--sys-nat-table-space-pager-gap, 8px));align-items:center}.pager-button{display:inline-flex;align-items:center;justify-content:center;min-width:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));min-height:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));padding:0 var(--nat-table-pager-padding-x, var(--sys-nat-table-pager-padding-x, 18px));font-weight:var(--nat-table-font-weight-pager, var(--sys-nat-table-font-weight-pager, 700));color:var(--nat-table-pager-color, var(--sys-nat-table-pager-color, inherit));letter-spacing:var(--nat-table-letter-spacing-pager, var(--sys-nat-table-letter-spacing-pager, .01em));cursor:pointer;background:var(--nat-table-pager-background, var(--sys-nat-table-pager-background, transparent));border:1px solid var(--nat-table-pager-border-color, var(--sys-nat-table-pager-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.pager-button:disabled{cursor:not-allowed;opacity:var(--nat-table-pager-disabled-opacity, var(--sys-nat-table-pager-disabled-opacity, .45));transform:none}.pager-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.pager-label{font-size:var(--nat-table-font-size-pager-label, var(--sys-nat-table-font-size-pager-label, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-pager-label-color, var(--sys-nat-table-pager-label-color, currentColor))}.pager-icon{display:block;width:1rem;height:1rem}@media(hover:hover)and (pointer:fine){.pager-button:hover:not(:disabled){background:var(--nat-table-pager-background-hover, var(--sys-nat-table-pager-background-hover, transparent));box-shadow:var(--nat-table-pager-shadow-hover, var(--sys-nat-table-pager-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], groupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "groupAriaLabel", required: false }] }], accessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityLabels", required: false }] }] } });

/**
 * Bundled page-size + pager control row.
 *
 * Deliberately **not** a `<nat-table-toolbar>`: the two controls are ordinary
 * tab stops. A roving tabindex would collapse the select and both pager
 * buttons into one Tab stop — unexpected for a pager — and projecting this
 * component into a consumer toolbar nested `role="toolbar"` inside
 * `role="toolbar"`. Compose it beside `<nat-table-toolbar>`, not inside it.
 */
class NatTablePagination {
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    pageSizeOptions = input(DEFAULT_PAGE_SIZE_OPTIONS, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSizeOptions" }] : /* istanbul ignore next */ []));
    pageSizeGroupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSizeGroupAriaLabel" }] : /* istanbul ignore next */ []));
    pageSizeAccessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSizeAccessibilityLabels" }] : /* istanbul ignore next */ []));
    pagerGroupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagerGroupAriaLabel" }] : /* istanbul ignore next */ []));
    pagerAccessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagerAccessibilityLabels" }] : /* istanbul ignore next */ []));
    natTableService = inject(NatTableService);
    destroyRef = inject(DestroyRef);
    controller = computed(() => this.natTableService.controller(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    constructor() {
        this.natTableService.registerPagination();
        this.destroyRef.onDestroy(() => {
            this.natTableService.unregisterPagination();
        });
        // Ensure we have a valid page size selected from the available options.
        effect(() => {
            const selected = this.selectedPageSize();
            const options = this.resolvedPageSizeOptions();
            if (options.length > 0 && !options.some((opt) => opt.pageSize === selected)) {
                this.setPageSize(options[0].pageSize);
            }
        });
    }
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    table = computed(() => this.controller()?.table, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "table" }] : /* istanbul ignore next */ []));
    tableElementId = computed(() => this.controller()?.tableElementId() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    // Page Size Logic
    selectedPageSize = computed(() => this.table()?.getState().pagination.pageSize ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedPageSize" }] : /* istanbul ignore next */ []));
    resolvedPageSizeAccessibilityLabels = computed(() => mergePageSizeLabels(this.tableUiIntl().pageSize?.accessibilityLabels, this.pageSizeAccessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPageSizeAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedPageSizeAriaLabel = computed(() => {
        const labels = this.resolvedPageSizeAccessibilityLabels();
        return this.pageSizeGroupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pageSize?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPageSizeAriaLabel" }] : /* istanbul ignore next */ []));
    resolvedPageSizeOptions = computed(() => {
        const labels = this.resolvedPageSizeAccessibilityLabels();
        const selectedPageSize = this.selectedPageSize();
        return sanitizePageSizeOptions(this.pageSizeOptions()).map((pageSize) => {
            const pageSizeText = formatNatTableAccessibilityNumber(pageSize, this.tableUiIntl().formatNumber, undefined, this.localeId());
            const context = {
                pageSizeValue: pageSize,
                pageSizeText,
                selectionState: selectedPageSize === pageSize ? 'selected' : 'not-selected'
            };
            return {
                pageSize,
                text: labels.pageSizeOptionText?.(context) ?? '',
                ariaLabel: labels.pageSizeOptionAriaLabel?.(context) ?? ''
            };
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPageSizeOptions" }] : /* istanbul ignore next */ []));
    setPageSize(pageSize) {
        if (pageSize === this.selectedPageSize()) {
            return;
        }
        this.controller()?.patchState({
            pagination: () => ({
                pageIndex: 0,
                pageSize
            })
        });
    }
    // Pager Logic
    pageIndex = computed(() => this.table()?.getState().pagination.pageIndex ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageIndex" }] : /* istanbul ignore next */ []));
    pageCount = computed(() => Math.max(1, this.table()?.getPageCount() ?? 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageCount" }] : /* istanbul ignore next */ []));
    currentPage = computed(() => this.pageIndex() + 1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentPage" }] : /* istanbul ignore next */ []));
    canPreviousPage = computed(() => this.table()?.getCanPreviousPage() ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canPreviousPage" }] : /* istanbul ignore next */ []));
    canNextPage = computed(() => this.table()?.getCanNextPage() ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canNextPage" }] : /* istanbul ignore next */ []));
    resolvedPagerAccessibilityLabels = computed(() => mergePagerLabels(this.tableUiIntl().pager?.accessibilityLabels, this.pagerAccessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPagerAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedPagerAriaLabel = computed(() => {
        const labels = this.resolvedPagerAccessibilityLabels();
        return this.pagerGroupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().pager?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPagerAriaLabel" }] : /* istanbul ignore next */ []));
    previousPageAriaLabel = computed(() => {
        const labels = this.resolvedPagerAccessibilityLabels();
        return labels.previousPageAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previousPageAriaLabel" }] : /* istanbul ignore next */ []));
    nextPageAriaLabel = computed(() => {
        const labels = this.resolvedPagerAccessibilityLabels();
        return labels.nextPageAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nextPageAriaLabel" }] : /* istanbul ignore next */ []));
    pageIndicator = computed(() => {
        const labels = this.resolvedPagerAccessibilityLabels();
        const page = this.currentPage();
        const pageCount = this.pageCount();
        const context = {
            pageValue: page,
            pageText: formatNatTableAccessibilityNumber(page, this.tableUiIntl().formatNumber, undefined, this.localeId()),
            pageCountValue: pageCount,
            pageCountText: formatNatTableAccessibilityNumber(pageCount, this.tableUiIntl().formatNumber, undefined, this.localeId())
        };
        return labels.pageIndicator?.(context) ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageIndicator" }] : /* istanbul ignore next */ []));
    previousPage() {
        if (!this.canPreviousPage()) {
            return;
        }
        this.table()?.previousPage();
    }
    nextPage() {
        if (!this.canNextPage()) {
            return;
        }
        this.table()?.nextPage();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePagination, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTablePagination, isStandalone: true, selector: "nat-table-pagination", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, pageSizeOptions: { classPropertyName: "pageSizeOptions", publicName: "pageSizeOptions", isSignal: true, isRequired: false, transformFunction: null }, pageSizeGroupAriaLabel: { classPropertyName: "pageSizeGroupAriaLabel", publicName: "pageSizeGroupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, pageSizeAccessibilityLabels: { classPropertyName: "pageSizeAccessibilityLabels", publicName: "pageSizeAccessibilityLabels", isSignal: true, isRequired: false, transformFunction: null }, pagerGroupAriaLabel: { classPropertyName: "pagerGroupAriaLabel", publicName: "pagerGroupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, pagerAccessibilityLabels: { classPropertyName: "pagerAccessibilityLabels", publicName: "pagerAccessibilityLabels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div class=\"pagination-row\">\n      <!-- Page Size Selection -->\n      <div [attr.aria-label]=\"resolvedPageSizeAriaLabel()\" class=\"page-size-container\" role=\"group\">\n        <select\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"resolvedPageSizeAriaLabel()\"\n          [value]=\"selectedPageSize()\"\n          class=\"page-size-select\"\n          (change)=\"setPageSize(+$any($event.target).value)\">\n          @for (option of resolvedPageSizeOptions(); track option.pageSize) {\n            <option [attr.aria-label]=\"option.ariaLabel\" [value]=\"option.pageSize\">{{ option.text }}</option>\n          }\n        </select>\n      </div>\n\n      <!-- Pager Navigation -->\n      <div [attr.aria-label]=\"resolvedPagerAriaLabel()\" class=\"pager\" role=\"group\">\n        <button\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"previousPageAriaLabel()\"\n          [disabled]=\"!canPreviousPage()\"\n          class=\"pager-button\"\n          type=\"button\"\n          (click)=\"previousPage()\">\n          <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n            <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n          </svg>\n        </button>\n        <span class=\"pager-label\">{{ pageIndicator() }}</span>\n        <button\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"nextPageAriaLabel()\"\n          [disabled]=\"!canNextPage()\"\n          class=\"pager-button\"\n          type=\"button\"\n          (click)=\"nextPage()\">\n          <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n            <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n          </svg>\n        </button>\n      </div>\n    </div>\n  }\n}\n", styles: [":host{display:block}.page-size-container{display:inline-flex}.page-size-select{display:inline-flex;align-items:center;min-height:var(--nat-table-chip-min-height-compact, var(--sys-nat-table-chip-min-height-compact, 36px));padding:0 32px 0 var(--nat-table-chip-padding-x-compact, var(--sys-nat-table-chip-padding-x-compact, 12px));font-family:inherit;font-size:var(--nat-table-font-size-chip-compact, var(--sys-nat-table-font-size-chip-compact, .92rem));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));appearance:none;cursor:pointer;outline:none;background-color:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));background-image:linear-gradient(45deg,transparent 50%,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%),linear-gradient(135deg,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%,transparent 50%);background-repeat:no-repeat;background-position:right 18px center,right 12px center;background-size:6px 6px,6px 6px;border:1px solid var( --nat-table-chip-border-color, var( --sys-nat-table-chip-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent))) ) );border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.page-size-select:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.page-size-select:hover{background-color:var( --nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) );border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n", ":host{display:block}.pager{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-pager-gap, var(--sys-nat-table-space-pager-gap, 8px));align-items:center}.pager-button{display:inline-flex;align-items:center;justify-content:center;min-width:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));min-height:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));padding:0 var(--nat-table-pager-padding-x, var(--sys-nat-table-pager-padding-x, 18px));font-weight:var(--nat-table-font-weight-pager, var(--sys-nat-table-font-weight-pager, 700));color:var(--nat-table-pager-color, var(--sys-nat-table-pager-color, inherit));letter-spacing:var(--nat-table-letter-spacing-pager, var(--sys-nat-table-letter-spacing-pager, .01em));cursor:pointer;background:var(--nat-table-pager-background, var(--sys-nat-table-pager-background, transparent));border:1px solid var(--nat-table-pager-border-color, var(--sys-nat-table-pager-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.pager-button:disabled{cursor:not-allowed;opacity:var(--nat-table-pager-disabled-opacity, var(--sys-nat-table-pager-disabled-opacity, .45));transform:none}.pager-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.pager-label{font-size:var(--nat-table-font-size-pager-label, var(--sys-nat-table-font-size-pager-label, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-pager-label-color, var(--sys-nat-table-pager-label-color, currentColor))}.pager-icon{display:block;width:1rem;height:1rem}@media(hover:hover)and (pointer:fine){.pager-button:hover:not(:disabled){background:var(--nat-table-pager-background-hover, var(--sys-nat-table-pager-background-hover, transparent));box-shadow:var(--nat-table-pager-shadow-hover, var(--sys-nat-table-pager-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n", ":host{display:block}.pagination-row{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:var(--nat-table-toolbar-gap, var(--nat-table-space-toolbar-gap, var(--sys-nat-table-space-toolbar-gap, 14px)));align-items:center;justify-content:space-between;padding:var(--nat-table-toolbar-padding, var(--nat-table-space-card-compact, var(--sys-nat-table-space-card-compact, 10px 20px)));background:var(--nat-table-toolbar-background, var(--nat-table-color-surface, var(--sys-nat-table-color-surface, canvas)));border-bottom:1px solid var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent)))}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePagination, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-pagination', template: "@if (controller(); as ctrl) {\n  @if (ctrl.enablePagination()) {\n    <div class=\"pagination-row\">\n      <!-- Page Size Selection -->\n      <div [attr.aria-label]=\"resolvedPageSizeAriaLabel()\" class=\"page-size-container\" role=\"group\">\n        <select\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"resolvedPageSizeAriaLabel()\"\n          [value]=\"selectedPageSize()\"\n          class=\"page-size-select\"\n          (change)=\"setPageSize(+$any($event.target).value)\">\n          @for (option of resolvedPageSizeOptions(); track option.pageSize) {\n            <option [attr.aria-label]=\"option.ariaLabel\" [value]=\"option.pageSize\">{{ option.text }}</option>\n          }\n        </select>\n      </div>\n\n      <!-- Pager Navigation -->\n      <div [attr.aria-label]=\"resolvedPagerAriaLabel()\" class=\"pager\" role=\"group\">\n        <button\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"previousPageAriaLabel()\"\n          [disabled]=\"!canPreviousPage()\"\n          class=\"pager-button\"\n          type=\"button\"\n          (click)=\"previousPage()\">\n          <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n            <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n          </svg>\n        </button>\n        <span class=\"pager-label\">{{ pageIndicator() }}</span>\n        <button\n          [attr.aria-controls]=\"tableElementId()\"\n          [attr.aria-label]=\"nextPageAriaLabel()\"\n          [disabled]=\"!canNextPage()\"\n          class=\"pager-button\"\n          type=\"button\"\n          (click)=\"nextPage()\">\n          <svg aria-hidden=\"true\" class=\"pager-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n            <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n          </svg>\n        </button>\n      </div>\n    </div>\n  }\n}\n", styles: [":host{display:block}.page-size-container{display:inline-flex}.page-size-select{display:inline-flex;align-items:center;min-height:var(--nat-table-chip-min-height-compact, var(--sys-nat-table-chip-min-height-compact, 36px));padding:0 32px 0 var(--nat-table-chip-padding-x-compact, var(--sys-nat-table-chip-padding-x-compact, 12px));font-family:inherit;font-size:var(--nat-table-font-size-chip-compact, var(--sys-nat-table-font-size-chip-compact, .92rem));color:var(--nat-table-chip-color, var(--sys-nat-table-chip-color, inherit));appearance:none;cursor:pointer;outline:none;background-color:var(--nat-table-chip-background, var(--sys-nat-table-chip-background, transparent));background-image:linear-gradient(45deg,transparent 50%,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%),linear-gradient(135deg,var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor)) 50%,transparent 50%);background-repeat:no-repeat;background-position:right 18px center,right 12px center;background-size:6px 6px,6px 6px;border:1px solid var( --nat-table-chip-border-color, var( --sys-nat-table-chip-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent))) ) );border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.page-size-select:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.page-size-select:hover{background-color:var( --nat-table-chip-background-hover, var(--sys-nat-table-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) );border-color:var(--nat-table-chip-border-color-hover, var(--sys-nat-table-chip-border-color-hover, currentColor));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n", ":host{display:block}.pager{display:flex;flex-wrap:wrap;gap:var(--nat-table-space-pager-gap, var(--sys-nat-table-space-pager-gap, 8px));align-items:center}.pager-button{display:inline-flex;align-items:center;justify-content:center;min-width:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));min-height:var(--nat-table-pager-min-height, var(--sys-nat-table-pager-min-height, 44px));padding:0 var(--nat-table-pager-padding-x, var(--sys-nat-table-pager-padding-x, 18px));font-weight:var(--nat-table-font-weight-pager, var(--sys-nat-table-font-weight-pager, 700));color:var(--nat-table-pager-color, var(--sys-nat-table-pager-color, inherit));letter-spacing:var(--nat-table-letter-spacing-pager, var(--sys-nat-table-letter-spacing-pager, .01em));cursor:pointer;background:var(--nat-table-pager-background, var(--sys-nat-table-pager-background, transparent));border:1px solid var(--nat-table-pager-border-color, var(--sys-nat-table-pager-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.pager-button:disabled{cursor:not-allowed;opacity:var(--nat-table-pager-disabled-opacity, var(--sys-nat-table-pager-disabled-opacity, .45));transform:none}.pager-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.pager-label{font-size:var(--nat-table-font-size-pager-label, var(--sys-nat-table-font-size-pager-label, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-pager-label-color, var(--sys-nat-table-pager-label-color, currentColor))}.pager-icon{display:block;width:1rem;height:1rem}@media(hover:hover)and (pointer:fine){.pager-button:hover:not(:disabled){background:var(--nat-table-pager-background-hover, var(--sys-nat-table-pager-background-hover, transparent));box-shadow:var(--nat-table-pager-shadow-hover, var(--sys-nat-table-pager-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}}\n", ":host{display:block}.pagination-row{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:var(--nat-table-toolbar-gap, var(--nat-table-space-toolbar-gap, var(--sys-nat-table-space-toolbar-gap, 14px)));align-items:center;justify-content:space-between;padding:var(--nat-table-toolbar-padding, var(--nat-table-space-card-compact, var(--sys-nat-table-space-card-compact, 10px 20px)));background:var(--nat-table-toolbar-background, var(--nat-table-color-surface, var(--sys-nat-table-color-surface, canvas)));border-bottom:1px solid var(--nat-table-color-border, var(--sys-nat-table-color-border, color-mix(in srgb, currentColor 16%, transparent)))}\n"] }]
        }], ctorParameters: () => [], propDecorators: { locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], pageSizeOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeOptions", required: false }] }], pageSizeGroupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeGroupAriaLabel", required: false }] }], pageSizeAccessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeAccessibilityLabels", required: false }] }], pagerGroupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "pagerGroupAriaLabel", required: false }] }], pagerAccessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "pagerAccessibilityLabels", required: false }] }] } });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
/** Builds the horizontal scroll-position context passed to generated label formatters. */
const buildScrollPositionContext = (scrollLeft, maxScrollLeft, formatNumber, localeId) => {
    const percentage = maxScrollLeft ? Math.round((scrollLeft / maxScrollLeft) * 100) : 0;
    return {
        scrollLeftValue: scrollLeft,
        scrollLeftText: formatNatTableAccessibilityNumber(scrollLeft, formatNumber, undefined, localeId),
        maxScrollLeftValue: maxScrollLeft,
        maxScrollLeftText: formatNatTableAccessibilityNumber(maxScrollLeft, formatNumber, undefined, localeId),
        percentageValue: percentage,
        percentageText: formatNatTableAccessibilityNumber(percentage, formatNumber, undefined, localeId)
    };
};

const resolveBoundaryArrowTarget = (key, maxScrollLeft) => {
    switch (key) {
        case 'ArrowLeft':
            return 0;
        case 'ArrowRight':
            return maxScrollLeft;
        default:
            return null;
    }
};
const resolveArrowDirection = (key) => {
    switch (key) {
        case 'ArrowLeft':
        case 'ArrowDown':
            return -1;
        case 'ArrowRight':
        case 'ArrowUp':
            return 1;
        default:
            return null;
    }
};
const resolveUnmodifiedKeyTarget = (key, scrollLeft, maxScrollLeft, clientWidth) => {
    switch (key) {
        case 'PageUp':
            return scrollLeft + clientWidth;
        case 'PageDown':
            return scrollLeft - clientWidth;
        case 'Home':
            return 0;
        case 'End':
            return maxScrollLeft;
        default:
            return null;
    }
};
const hasUnsupportedModifiers = (event) => event.altKey || (event.ctrlKey && event.metaKey) || ((event.ctrlKey || event.metaKey) && event.shiftKey);
const resolveTableScrollControlKeyTarget = (event, clientWidth, scrollLeft, maxScrollLeft) => {
    if (clientWidth === null || hasUnsupportedModifiers(event))
        return null;
    if (event.ctrlKey || event.metaKey) {
        return resolveBoundaryArrowTarget(event.key, maxScrollLeft);
    }
    const arrowDirection = resolveArrowDirection(event.key);
    if (arrowDirection !== null) {
        const distance = event.shiftKey ? maxScrollLeft : clientWidth;
        return scrollLeft + arrowDirection * Math.max(Math.round(distance * 0.1), 1);
    }
    if (event.shiftKey)
        return null;
    return resolveUnmodifiedKeyTarget(event.key, scrollLeft, maxScrollLeft, clientWidth);
};

const DEFAULT_SCROLL_STEP = 240;
class NatTableScrollControl {
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    groupAriaLabel = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groupAriaLabel" }] : /* istanbul ignore next */ []));
    scrollStep = input(DEFAULT_SCROLL_STEP, { ...(ngDevMode ? { debugName: "scrollStep" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    accessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityLabels" }] : /* istanbul ignore next */ []));
    natTableService = inject(NatTableService);
    controller = computed(() => this.natTableService.controller(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    document = inject(DOCUMENT);
    destroyRef = inject(DestroyRef);
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    scrollContainer = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollContainer" }] : /* istanbul ignore next */ []));
    cleanupScrollTarget = null;
    tableElementId = computed(() => this.controller()?.tableElementId() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    scrollLeft = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollLeft" }] : /* istanbul ignore next */ []));
    maxScrollLeft = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxScrollLeft" }] : /* istanbul ignore next */ []));
    canScroll = computed(() => this.maxScrollLeft() > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canScroll" }] : /* istanbul ignore next */ []));
    canScrollLeft = computed(() => this.scrollLeft() > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canScrollLeft" }] : /* istanbul ignore next */ []));
    canScrollRight = computed(() => this.scrollLeft() < this.maxScrollLeft(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "canScrollRight" }] : /* istanbul ignore next */ []));
    resolvedAccessibilityLabels = computed(() => mergeScrollControlLabels(this.tableUiIntl().scrollControl?.accessibilityLabels, this.accessibilityLabels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibilityLabels" }] : /* istanbul ignore next */ []));
    resolvedAriaLabel = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        return this.groupAriaLabel() ?? labels.groupAriaLabel ?? this.tableUiIntl().scrollControl?.groupAriaLabel ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAriaLabel" }] : /* istanbul ignore next */ []));
    scrollLeftAriaLabel = computed(() => this.resolvedAccessibilityLabels().scrollLeftAriaLabel ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollLeftAriaLabel" }] : /* istanbul ignore next */ []));
    scrollRightAriaLabel = computed(() => this.resolvedAccessibilityLabels().scrollRightAriaLabel ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollRightAriaLabel" }] : /* istanbul ignore next */ []));
    scrollPositionAriaLabel = computed(() => this.resolvedAccessibilityLabels().scrollPositionAriaLabel ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollPositionAriaLabel" }] : /* istanbul ignore next */ []));
    positionText = computed(() => {
        const labels = this.resolvedAccessibilityLabels();
        const context = buildScrollPositionContext(this.scrollLeft(), this.maxScrollLeft(), this.tableUiIntl().formatNumber, this.localeId());
        return labels.scrollPositionText?.(context) ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "positionText" }] : /* istanbul ignore next */ []));
    sanitizedScrollStep = computed(() => {
        const step = Math.trunc(this.scrollStep());
        return step > 0 ? step : DEFAULT_SCROLL_STEP;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sanitizedScrollStep" }] : /* istanbul ignore next */ []));
    constructor() {
        afterRenderEffect(() => {
            const controller = this.controller();
            if (!controller) {
                this.setScrollContainer(null);
                return;
            }
            const container = controller.tableScrollContainer?.() ?? this.resolveScrollContainer(controller.tableElementId());
            this.setScrollContainer(container);
        });
        this.destroyRef.onDestroy(() => this.cleanupScrollTarget?.());
    }
    scrollByStep(direction) {
        this.setScrollLeft(this.scrollLeft() + direction * this.sanitizedScrollStep());
    }
    onRangeInput(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement))
            return;
        const nextScrollLeft = Number(target.value);
        if (Number.isFinite(nextScrollLeft))
            this.setScrollLeft(nextScrollLeft);
    }
    onRangeKeydown(event) {
        const nextScrollLeft = resolveTableScrollControlKeyTarget(event, this.scrollContainer()?.clientWidth ?? null, this.scrollLeft(), this.maxScrollLeft());
        if (nextScrollLeft === null)
            return;
        event.preventDefault();
        this.setScrollLeft(nextScrollLeft);
    }
    setScrollContainer(container) {
        if (container === this.scrollContainer()) {
            this.updateMetrics();
            return;
        }
        this.cleanupScrollTarget?.();
        this.cleanupScrollTarget = null;
        this.scrollContainer.set(container);
        if (!container) {
            this.scrollLeft.set(0);
            this.maxScrollLeft.set(0);
            return;
        }
        const update = () => this.updateMetrics();
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
        container.addEventListener('scroll', update, { passive: true });
        resizeObserver?.observe(container);
        if (container.firstElementChild instanceof HTMLElement) {
            resizeObserver?.observe(container.firstElementChild);
        }
        this.cleanupScrollTarget = () => {
            container.removeEventListener('scroll', update);
            resizeObserver?.disconnect();
        };
        this.updateMetrics();
    }
    setScrollLeft(value) {
        const container = this.scrollContainer();
        if (!container) {
            return;
        }
        const nextScrollLeft = clamp(Math.round(value), 0, this.maxScrollLeft());
        container.scrollLeft = nextScrollLeft;
        if (typeof container.scrollTo === 'function') {
            container.scrollTo({ left: nextScrollLeft, behavior: 'auto' });
        }
        this.updateMetrics();
    }
    updateMetrics() {
        const container = this.scrollContainer();
        if (!container) {
            this.scrollLeft.set(0);
            this.maxScrollLeft.set(0);
            return;
        }
        const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
        const scrollLeft = clamp(Math.round(container.scrollLeft), 0, maxScrollLeft);
        this.maxScrollLeft.set(maxScrollLeft);
        this.scrollLeft.set(scrollLeft);
    }
    resolveScrollContainer(tableElementId) {
        const table = this.document.getElementById(tableElementId);
        return table?.parentElement ?? null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableScrollControl, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTableScrollControl, isStandalone: true, selector: "nat-table-scroll-control", inputs: { locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, groupAriaLabel: { classPropertyName: "groupAriaLabel", publicName: "groupAriaLabel", isSignal: true, isRequired: false, transformFunction: null }, scrollStep: { classPropertyName: "scrollStep", publicName: "scrollStep", isSignal: true, isRequired: false, transformFunction: null }, accessibilityLabels: { classPropertyName: "accessibilityLabels", publicName: "accessibilityLabels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (controller()) {\n  <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"scroll-control\" role=\"group\">\n    <button\n      [attr.aria-controls]=\"tableElementId()\"\n      [attr.aria-label]=\"scrollLeftAriaLabel()\"\n      [disabled]=\"!canScrollLeft()\"\n      class=\"scroll-button scroll-button-left\"\n      type=\"button\"\n      (click)=\"scrollByStep(-1)\">\n      <svg aria-hidden=\"true\" class=\"scroll-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n        <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n      </svg>\n    </button>\n\n    <label class=\"scroll-range-label\">\n      <span class=\"scroll-range-copy\">{{ positionText() }}</span>\n      <input\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"scrollPositionAriaLabel()\"\n        [attr.aria-valuetext]=\"positionText()\"\n        [disabled]=\"!canScroll()\"\n        [max]=\"maxScrollLeft()\"\n        [value]=\"scrollLeft()\"\n        class=\"scroll-range\"\n        min=\"0\"\n        type=\"range\"\n        (input)=\"onRangeInput($event)\"\n        (keydown)=\"onRangeKeydown($event)\" />\n    </label>\n\n    <button\n      [attr.aria-controls]=\"tableElementId()\"\n      [attr.aria-label]=\"scrollRightAriaLabel()\"\n      [disabled]=\"!canScrollRight()\"\n      class=\"scroll-button scroll-button-right\"\n      type=\"button\"\n      (click)=\"scrollByStep(1)\">\n      <svg aria-hidden=\"true\" class=\"scroll-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n        <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n      </svg>\n    </button>\n  </div>\n}\n", styles: [":host{display:block}.scroll-control{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--nat-table-scroll-control-gap, var(--sys-nat-table-scroll-control-gap, 10px));align-items:center;inline-size:100%}.scroll-button{display:inline-flex;align-items:center;justify-content:center;min-inline-size:var( --nat-table-scroll-button-min-inline-size, var( --sys-nat-table-scroll-button-min-inline-size, var(--nat-table-scroll-button-min-height, var(--sys-nat-table-scroll-button-min-height, 44px)) ) );min-block-size:var( --nat-table-scroll-button-min-block-size, var( --sys-nat-table-scroll-button-min-block-size, var(--nat-table-scroll-button-min-height, var(--sys-nat-table-scroll-button-min-height, 44px)) ) );padding:0 var(--nat-table-scroll-button-padding-x, var(--sys-nat-table-scroll-button-padding-x, 18px));color:var(--nat-table-scroll-button-color, var(--sys-nat-table-scroll-button-color, inherit));cursor:pointer;background:var(--nat-table-scroll-button-background, var(--sys-nat-table-scroll-button-background, transparent));border:1px solid var(--nat-table-scroll-button-border-color, var(--sys-nat-table-scroll-button-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.scroll-button:hover:not(:disabled){background:var(--nat-table-scroll-button-background-hover, var(--sys-nat-table-scroll-button-background-hover, transparent));box-shadow:var(--nat-table-scroll-button-shadow-hover, var(--sys-nat-table-scroll-button-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}.scroll-button:disabled{cursor:not-allowed;opacity:var(--nat-table-scroll-button-disabled-opacity, var(--sys-nat-table-scroll-button-disabled-opacity, .45));transform:none}.scroll-button:focus-visible,.scroll-range:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.scroll-icon{display:block;width:var(--nat-table-scroll-icon-size, var(--sys-nat-table-scroll-icon-size, 1rem));height:var(--nat-table-scroll-icon-size, var(--sys-nat-table-scroll-icon-size, 1rem))}.scroll-range-label{display:grid;grid-template-columns:minmax(var(--nat-table-scroll-position-min-inline-size, var(--sys-nat-table-scroll-position-min-inline-size, 7ch)),auto) minmax(var(--nat-table-scroll-range-min-inline-size, var(--sys-nat-table-scroll-range-min-inline-size, 120px)),1fr);gap:var(--nat-table-scroll-range-gap, var(--sys-nat-table-scroll-range-gap, 10px));align-items:center;min-width:0}.scroll-range-copy{font-size:var(--nat-table-font-size-scroll-position, var(--sys-nat-table-font-size-scroll-position, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-scroll-position-color, var(--sys-nat-table-scroll-position-color, currentColor));white-space:nowrap}.scroll-range{inline-size:100%;min-inline-size:var(--nat-table-scroll-range-min-inline-size, var(--sys-nat-table-scroll-range-min-inline-size, 120px));block-size:max(var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px)),var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px)));padding:0;appearance:none;accent-color:var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor));cursor:pointer;background:transparent;border:0}.scroll-range:disabled{cursor:not-allowed;opacity:var(--nat-table-scroll-range-disabled-opacity, var(--sys-nat-table-scroll-range-disabled-opacity, .5))}.scroll-range::-webkit-slider-runnable-track{box-sizing:border-box;height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:var( --nat-table-scroll-range-track-color, var( --sys-nat-table-scroll-range-track-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-track-border, var(--sys-nat-table-scroll-range-track-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-webkit-slider-thumb{box-sizing:border-box;width:var(--nat-table-scroll-range-thumb-inline-size, var(--sys-nat-table-scroll-range-thumb-inline-size, 16px));height:var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px));margin-top:calc(var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px)) / 2);appearance:none;background:var( --nat-table-scroll-range-thumb-color, var( --sys-nat-table-scroll-range-thumb-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-thumb-border, var(--sys-nat-table-scroll-range-thumb-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-thumb-radius, var(--sys-nat-table-scroll-range-thumb-radius, 100vmax));transform:translateY(-50%)}.scroll-range::-moz-range-track{box-sizing:border-box;height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:var( --nat-table-scroll-range-track-color, var( --sys-nat-table-scroll-range-track-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-track-border, var(--sys-nat-table-scroll-range-track-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-moz-range-progress{height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:transparent;border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-moz-range-thumb{box-sizing:border-box;width:var(--nat-table-scroll-range-thumb-inline-size, var(--sys-nat-table-scroll-range-thumb-inline-size, 16px));height:var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px));appearance:none;background:var( --nat-table-scroll-range-thumb-color, var( --sys-nat-table-scroll-range-thumb-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-thumb-border, var(--sys-nat-table-scroll-range-thumb-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-thumb-radius, var(--sys-nat-table-scroll-range-thumb-radius, 100vmax))}@media(forced-colors:active){.scroll-range{forced-color-adjust:none}.scroll-range:focus-visible{outline-color:Highlight}.scroll-range::-webkit-slider-runnable-track{background:Canvas;border:1px solid CanvasText}.scroll-range::-webkit-slider-thumb{background:Highlight;border:1px solid HighlightText}.scroll-range::-moz-range-track{background:Canvas;border:1px solid CanvasText}.scroll-range::-moz-range-progress{background:transparent}.scroll-range::-moz-range-thumb{background:Highlight;border:1px solid HighlightText}}@media(width<=520px){.scroll-control{grid-template-columns:auto auto}.scroll-range-label{grid-row:1;grid-column:1 / -1}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableScrollControl, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-scroll-control', template: "@if (controller()) {\n  <div [attr.aria-label]=\"resolvedAriaLabel()\" class=\"scroll-control\" role=\"group\">\n    <button\n      [attr.aria-controls]=\"tableElementId()\"\n      [attr.aria-label]=\"scrollLeftAriaLabel()\"\n      [disabled]=\"!canScrollLeft()\"\n      class=\"scroll-button scroll-button-left\"\n      type=\"button\"\n      (click)=\"scrollByStep(-1)\">\n      <svg aria-hidden=\"true\" class=\"scroll-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n        <path d=\"M10.5 3.5 5 8l5.5 4.5-1 1.2L2.8 8l6.7-5.7 1 1.2Z\" fill=\"currentColor\" />\n      </svg>\n    </button>\n\n    <label class=\"scroll-range-label\">\n      <span class=\"scroll-range-copy\">{{ positionText() }}</span>\n      <input\n        [attr.aria-controls]=\"tableElementId()\"\n        [attr.aria-label]=\"scrollPositionAriaLabel()\"\n        [attr.aria-valuetext]=\"positionText()\"\n        [disabled]=\"!canScroll()\"\n        [max]=\"maxScrollLeft()\"\n        [value]=\"scrollLeft()\"\n        class=\"scroll-range\"\n        min=\"0\"\n        type=\"range\"\n        (input)=\"onRangeInput($event)\"\n        (keydown)=\"onRangeKeydown($event)\" />\n    </label>\n\n    <button\n      [attr.aria-controls]=\"tableElementId()\"\n      [attr.aria-label]=\"scrollRightAriaLabel()\"\n      [disabled]=\"!canScrollRight()\"\n      class=\"scroll-button scroll-button-right\"\n      type=\"button\"\n      (click)=\"scrollByStep(1)\">\n      <svg aria-hidden=\"true\" class=\"scroll-icon\" focusable=\"false\" viewBox=\"0 0 16 16\">\n        <path d=\"m5.5 3.5 1-1.2L13.2 8l-6.7 5.7-1-1.2L10 8 5.5 3.5Z\" fill=\"currentColor\" />\n      </svg>\n    </button>\n  </div>\n}\n", styles: [":host{display:block}.scroll-control{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--nat-table-scroll-control-gap, var(--sys-nat-table-scroll-control-gap, 10px));align-items:center;inline-size:100%}.scroll-button{display:inline-flex;align-items:center;justify-content:center;min-inline-size:var( --nat-table-scroll-button-min-inline-size, var( --sys-nat-table-scroll-button-min-inline-size, var(--nat-table-scroll-button-min-height, var(--sys-nat-table-scroll-button-min-height, 44px)) ) );min-block-size:var( --nat-table-scroll-button-min-block-size, var( --sys-nat-table-scroll-button-min-block-size, var(--nat-table-scroll-button-min-height, var(--sys-nat-table-scroll-button-min-height, 44px)) ) );padding:0 var(--nat-table-scroll-button-padding-x, var(--sys-nat-table-scroll-button-padding-x, 18px));color:var(--nat-table-scroll-button-color, var(--sys-nat-table-scroll-button-color, inherit));cursor:pointer;background:var(--nat-table-scroll-button-background, var(--sys-nat-table-scroll-button-background, transparent));border:1px solid var(--nat-table-scroll-button-border-color, var(--sys-nat-table-scroll-button-border-color, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax));transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.scroll-button:hover:not(:disabled){background:var(--nat-table-scroll-button-background-hover, var(--sys-nat-table-scroll-button-background-hover, transparent));box-shadow:var(--nat-table-scroll-button-shadow-hover, var(--sys-nat-table-scroll-button-shadow-hover, none));transform:var(--nat-table-hover-lift, var(--sys-nat-table-hover-lift, translateY(-1px)))}.scroll-button:disabled{cursor:not-allowed;opacity:var(--nat-table-scroll-button-disabled-opacity, var(--sys-nat-table-scroll-button-disabled-opacity, .45));transform:none}.scroll-button:focus-visible,.scroll-range:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.scroll-icon{display:block;width:var(--nat-table-scroll-icon-size, var(--sys-nat-table-scroll-icon-size, 1rem));height:var(--nat-table-scroll-icon-size, var(--sys-nat-table-scroll-icon-size, 1rem))}.scroll-range-label{display:grid;grid-template-columns:minmax(var(--nat-table-scroll-position-min-inline-size, var(--sys-nat-table-scroll-position-min-inline-size, 7ch)),auto) minmax(var(--nat-table-scroll-range-min-inline-size, var(--sys-nat-table-scroll-range-min-inline-size, 120px)),1fr);gap:var(--nat-table-scroll-range-gap, var(--sys-nat-table-scroll-range-gap, 10px));align-items:center;min-width:0}.scroll-range-copy{font-size:var(--nat-table-font-size-scroll-position, var(--sys-nat-table-font-size-scroll-position, .92rem));font-variant-numeric:tabular-nums;color:var(--nat-table-scroll-position-color, var(--sys-nat-table-scroll-position-color, currentColor));white-space:nowrap}.scroll-range{inline-size:100%;min-inline-size:var(--nat-table-scroll-range-min-inline-size, var(--sys-nat-table-scroll-range-min-inline-size, 120px));block-size:max(var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px)),var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px)));padding:0;appearance:none;accent-color:var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor));cursor:pointer;background:transparent;border:0}.scroll-range:disabled{cursor:not-allowed;opacity:var(--nat-table-scroll-range-disabled-opacity, var(--sys-nat-table-scroll-range-disabled-opacity, .5))}.scroll-range::-webkit-slider-runnable-track{box-sizing:border-box;height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:var( --nat-table-scroll-range-track-color, var( --sys-nat-table-scroll-range-track-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-track-border, var(--sys-nat-table-scroll-range-track-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-webkit-slider-thumb{box-sizing:border-box;width:var(--nat-table-scroll-range-thumb-inline-size, var(--sys-nat-table-scroll-range-thumb-inline-size, 16px));height:var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px));margin-top:calc(var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px)) / 2);appearance:none;background:var( --nat-table-scroll-range-thumb-color, var( --sys-nat-table-scroll-range-thumb-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-thumb-border, var(--sys-nat-table-scroll-range-thumb-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-thumb-radius, var(--sys-nat-table-scroll-range-thumb-radius, 100vmax));transform:translateY(-50%)}.scroll-range::-moz-range-track{box-sizing:border-box;height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:var( --nat-table-scroll-range-track-color, var( --sys-nat-table-scroll-range-track-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-track-border, var(--sys-nat-table-scroll-range-track-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-moz-range-progress{height:var(--nat-table-scroll-range-track-block-size, var(--sys-nat-table-scroll-range-track-block-size, 4px));background:transparent;border-radius:var(--nat-table-scroll-range-track-radius, var(--sys-nat-table-scroll-range-track-radius, 100vmax))}.scroll-range::-moz-range-thumb{box-sizing:border-box;width:var(--nat-table-scroll-range-thumb-inline-size, var(--sys-nat-table-scroll-range-thumb-inline-size, 16px));height:var(--nat-table-scroll-range-thumb-block-size, var(--sys-nat-table-scroll-range-thumb-block-size, 16px));appearance:none;background:var( --nat-table-scroll-range-thumb-color, var( --sys-nat-table-scroll-range-thumb-color, var(--nat-table-scroll-range-accent, var(--sys-nat-table-scroll-range-accent, currentColor)) ) );border:var(--nat-table-scroll-range-thumb-border, var(--sys-nat-table-scroll-range-thumb-border, 0 solid transparent));border-radius:var(--nat-table-scroll-range-thumb-radius, var(--sys-nat-table-scroll-range-thumb-radius, 100vmax))}@media(forced-colors:active){.scroll-range{forced-color-adjust:none}.scroll-range:focus-visible{outline-color:Highlight}.scroll-range::-webkit-slider-runnable-track{background:Canvas;border:1px solid CanvasText}.scroll-range::-webkit-slider-thumb{background:Highlight;border:1px solid HighlightText}.scroll-range::-moz-range-track{background:Canvas;border:1px solid CanvasText}.scroll-range::-moz-range-progress{background:transparent}.scroll-range::-moz-range-thumb{background:Highlight;border:1px solid HighlightText}}@media(width<=520px){.scroll-control{grid-template-columns:auto auto}.scroll-range-label{grid-row:1;grid-column:1 / -1}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], groupAriaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "groupAriaLabel", required: false }] }], scrollStep: [{ type: i0.Input, args: [{ isSignal: true, alias: "scrollStep", required: false }] }], accessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityLabels", required: false }] }] } });

const serializeSelectedRowIds = (selection) => Object.keys(selection)
    .filter((rowId) => selection[rowId])
    .sort()
    .join('|');
const computeNatTableStateDiff = (prev, next) => ({
    sortingChanged: hasNatTableStateValueChanged(prev.sorting, next.sorting),
    globalFilterChanged: prev.globalFilter !== next.globalFilter,
    columnFiltersChanged: hasNatTableStateValueChanged(prev.columnFilters, next.columnFilters),
    columnVisibilityChanged: hasNatTableStateValueChanged(prev.columnVisibility, next.columnVisibility),
    columnOrderChanged: hasNatTableStateValueChanged(prev.columnOrder, next.columnOrder),
    columnPinningChanged: hasNatTableStateValueChanged(prev.columnPinning, next.columnPinning),
    columnSizingChanged: hasNatTableStateValueChanged(prev.columnSizing, next.columnSizing),
    paginationChanged: hasNatTableStateValueChanged(prev.pagination, next.pagination),
    rowSelectionChanged: serializeSelectedRowIds(prev.rowSelection) !== serializeSelectedRowIds(next.rowSelection)
});

class NatTableSurface {
    /** Two-way bindable state representing the current table view state. */
    state = model({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    /** One-time seed configuration for the table state. */
    initialState = input({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initialState" }] : /* istanbul ignore next */ []));
    /** Operation mode: 'auto' (client-side) or 'manual' (server-side/external), or custom per-slice configuration. */
    mode = input('auto', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    /** Total page count for manual (server-side) pagination. */
    manualPageCount = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualPageCount" }] : /* istanbul ignore next */ []));
    /** Enables polite live announcements for sort/filter/pagination changes. */
    enableAnnouncements = input(true, { ...(ngDevMode ? { debugName: "enableAnnouncements" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Enables sticky positioning for the table header row. */
    stickyHeader = input(true, { ...(ngDevMode ? { debugName: "stickyHeader" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Allows multiple simultaneous sort columns. Default false (single-column sort). */
    enableMultiSort = input(false, { ...(ngDevMode ? { debugName: "enableMultiSort" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Locale id used to resolve generated table accessibility copy. */
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    /** Optional accessibility copy and live-announcement formatters. */
    accessibilityText = input({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityText" }] : /* istanbul ignore next */ []));
    /** Optional overrides for keyboard interaction shortcuts. */
    keybindings = input({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "keybindings" }] : /* istanbul ignore next */ []));
    /** When to apply resize: `'onEnd'` (default, on pointer release) or `'onChange'` (live). */
    columnResizeMode = input('onEnd', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnResizeMode" }] : /* istanbul ignore next */ []));
    /** Width model: `'fill'` (default — columns stretch to fill the container) or `'fixed'` (column widths are authoritative and the region scrolls horizontally, giving pixel-exact resizing). */
    columnSizingMode = input('fill', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnSizingMode" }] : /* istanbul ignore next */ []));
    /** Enables column resizing across the surface. Off by default; a column opts in with `enableResizing: true` or, once the surface is on, opts out with `enableResizing: false`. */
    enableColumnResizing = input(false, { ...(ngDevMode ? { debugName: "enableColumnResizing" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Enables column drag/drop, keyboard reordering, and table-owned move-column metadata across the surface. Off by default; `meta.reorderable: true` opts one column into reordering (drag, keyboard, menu) while the surface is off, and `meta.reorderable: false` opts one column out once the surface is on. */
    enableReordering = input(false, { ...(ngDevMode ? { debugName: "enableReordering" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Enables the built-in header sort UI across the surface. Off by default; a column opts in with `enableSorting: true` or, once the surface is on, opts out with `enableSorting: false`. Gates only the sort button and indicator — sort state and programmatic `setSorting` work regardless of this flag. (`enableSortActions` on the header-actions helper is a second, independent UI gate.) */
    enableSorting = input(false, { ...(ngDevMode ? { debugName: "enableSorting" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Enables column pinning across the surface. Off by default; a column opts in with `enablePinning: true` or, once the surface is on, opts out with `enablePinning: false`. */
    enablePinning = input(false, { ...(ngDevMode ? { debugName: "enablePinning" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Text direction. Falls back to the inherited CDK direction, then `'ltr'`. */
    direction = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "direction" }] : /* istanbul ignore next */ []));
    // Slice-specific change outputs
    sortingChange = output();
    globalFilterChange = output();
    columnFiltersChange = output();
    columnVisibilityChange = output();
    columnOrderChange = output();
    columnPinningChange = output();
    columnSizingChange = output();
    paginationChange = output();
    rowSelectionChange = output();
    natTableService = inject(NatTableService);
    previousTableState = {
        sorting: [],
        globalFilter: '',
        columnFilters: [],
        columnVisibility: {},
        columnOrder: [],
        columnPinning: { left: [], right: [] },
        columnSizing: {},
        rowSelection: {},
        pagination: { pageIndex: 0, pageSize: 0 }
    };
    firstStateChange = true;
    constructor() {
        effect(() => {
            const nextState = this.natTableService.stateChangeEvent();
            if (nextState) {
                this.emitStateSliceChanges(nextState);
            }
        });
        effect(() => {
            this.natTableService.patchState({
                state: this.state(),
                initialState: this.initialState(),
                mode: this.mode(),
                manualPageCount: this.manualPageCount(),
                enableAnnouncements: this.enableAnnouncements(),
                stickyHeader: this.stickyHeader(),
                enableMultiSort: this.enableMultiSort(),
                locale: this.locale(),
                accessibilityText: this.accessibilityText(),
                keybindings: this.keybindings(),
                columnResizeMode: this.columnResizeMode(),
                columnSizingMode: this.columnSizingMode(),
                enableColumnResizing: this.enableColumnResizing(),
                enableReordering: this.enableReordering(),
                enableSorting: this.enableSorting(),
                enablePinning: this.enablePinning(),
                direction: this.direction()
            });
        });
    }
    /** Diff incoming table state against the previous and emit each changed slice. */
    emitStateSliceChanges(nextState) {
        if (this.firstStateChange) {
            this.previousTableState = nextState;
            this.firstStateChange = false;
        }
        const prev = this.previousTableState;
        this.previousTableState = nextState;
        const diff = computeNatTableStateDiff(prev, nextState);
        if (Object.values(diff).some((changed) => changed)) {
            this.state.set(nextState);
        }
        // One emit per changed slice, in declaration order. Table-driven so the
        // method stays under the complexity budget without losing the 1:1 mapping.
        const sliceEmitters = [
            [diff.sortingChanged, () => this.sortingChange.emit(nextState.sorting)],
            [diff.globalFilterChanged, () => this.globalFilterChange.emit(nextState.globalFilter)],
            [diff.columnFiltersChanged, () => this.columnFiltersChange.emit(nextState.columnFilters)],
            [diff.columnVisibilityChanged, () => this.columnVisibilityChange.emit(nextState.columnVisibility)],
            [diff.columnOrderChanged, () => this.columnOrderChange.emit(nextState.columnOrder)],
            [diff.columnPinningChanged, () => this.columnPinningChange.emit(nextState.columnPinning)],
            [diff.columnSizingChanged, () => this.columnSizingChange.emit(nextState.columnSizing)],
            [diff.paginationChanged, () => this.paginationChange.emit(nextState.pagination)],
            [diff.rowSelectionChanged, () => this.rowSelectionChange.emit(nextState.rowSelection)]
        ];
        for (const [changed, emit] of sliceEmitters) {
            if (changed) {
                emit();
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSurface, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.1.1", type: NatTableSurface, isStandalone: true, selector: "nat-table-surface", inputs: { state: { classPropertyName: "state", publicName: "state", isSignal: true, isRequired: false, transformFunction: null }, initialState: { classPropertyName: "initialState", publicName: "initialState", isSignal: true, isRequired: false, transformFunction: null }, mode: { classPropertyName: "mode", publicName: "mode", isSignal: true, isRequired: false, transformFunction: null }, manualPageCount: { classPropertyName: "manualPageCount", publicName: "manualPageCount", isSignal: true, isRequired: false, transformFunction: null }, enableAnnouncements: { classPropertyName: "enableAnnouncements", publicName: "enableAnnouncements", isSignal: true, isRequired: false, transformFunction: null }, stickyHeader: { classPropertyName: "stickyHeader", publicName: "stickyHeader", isSignal: true, isRequired: false, transformFunction: null }, enableMultiSort: { classPropertyName: "enableMultiSort", publicName: "enableMultiSort", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, accessibilityText: { classPropertyName: "accessibilityText", publicName: "accessibilityText", isSignal: true, isRequired: false, transformFunction: null }, keybindings: { classPropertyName: "keybindings", publicName: "keybindings", isSignal: true, isRequired: false, transformFunction: null }, columnResizeMode: { classPropertyName: "columnResizeMode", publicName: "columnResizeMode", isSignal: true, isRequired: false, transformFunction: null }, columnSizingMode: { classPropertyName: "columnSizingMode", publicName: "columnSizingMode", isSignal: true, isRequired: false, transformFunction: null }, enableColumnResizing: { classPropertyName: "enableColumnResizing", publicName: "enableColumnResizing", isSignal: true, isRequired: false, transformFunction: null }, enableReordering: { classPropertyName: "enableReordering", publicName: "enableReordering", isSignal: true, isRequired: false, transformFunction: null }, enableSorting: { classPropertyName: "enableSorting", publicName: "enableSorting", isSignal: true, isRequired: false, transformFunction: null }, enablePinning: { classPropertyName: "enablePinning", publicName: "enablePinning", isSignal: true, isRequired: false, transformFunction: null }, direction: { classPropertyName: "direction", publicName: "direction", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { state: "stateChange", sortingChange: "sortingChange", globalFilterChange: "globalFilterChange", columnFiltersChange: "columnFiltersChange", columnVisibilityChange: "columnVisibilityChange", columnOrderChange: "columnOrderChange", columnPinningChange: "columnPinningChange", columnSizingChange: "columnSizingChange", paginationChange: "paginationChange", rowSelectionChange: "rowSelectionChange" }, providers: [NatTableService], ngImport: i0, template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`, isInline: true, styles: [":host{--sys-nat-table-color-text: var(--nat-table-color-text);--sys-nat-table-color-text-muted: var(--nat-table-color-text-muted);--sys-nat-table-color-accent: var(--nat-table-color-accent);--sys-nat-table-color-success: var(--nat-table-color-success);--sys-nat-table-color-warning: var(--nat-table-color-warning);--sys-nat-table-color-danger: var(--nat-table-color-danger);--sys-nat-table-color-surface: var(--nat-table-color-surface);--sys-nat-table-color-surface-elevated: var(--nat-table-color-surface-elevated);--sys-nat-table-color-surface-sticky: var(--nat-table-color-surface-sticky);--sys-nat-table-color-border: var(--nat-table-color-border);--sys-nat-table-color-divider: var(--nat-table-color-divider);--sys-nat-table-color-divider-subtle: var(--nat-table-color-divider-subtle);--sys-nat-table-font-size-header: var(--nat-table-font-size-header);--sys-nat-table-font-size-label: var(--nat-table-font-size-label);--sys-nat-table-font-size-caption: var(--nat-table-font-size-caption);--sys-nat-table-font-size-chip-meta: var(--nat-table-font-size-chip-meta);--sys-nat-table-font-size-chip-compact: var(--nat-table-font-size-chip-compact);--sys-nat-table-font-size-pager-label: var(--nat-table-font-size-pager-label);--sys-nat-table-font-size-pin-button: var(--nat-table-font-size-pin-button);--sys-nat-table-font-size-empty-state: var(--nat-table-font-size-empty-state);--sys-nat-table-font-weight-pager: var(--nat-table-font-weight-pager);--sys-nat-table-letter-spacing-header: var(--nat-table-letter-spacing-header);--sys-nat-table-letter-spacing-label: var(--nat-table-letter-spacing-label);--sys-nat-table-letter-spacing-pin-button: var(--nat-table-letter-spacing-pin-button);--sys-nat-table-letter-spacing-pager: var(--nat-table-letter-spacing-pager);--sys-nat-table-text-transform-header: var(--nat-table-text-transform-header);--sys-nat-table-text-transform-label: var(--nat-table-text-transform-label);--sys-nat-table-line-height-empty-state: var(--nat-table-line-height-empty-state);--sys-nat-table-font-weight-row-header: var(--nat-table-font-weight-row-header);--sys-nat-table-space-card: var(--nat-table-space-card);--sys-nat-table-space-card-compact: var(--nat-table-space-card-compact);--sys-nat-table-space-card-list: var(--nat-table-space-card-list);--sys-nat-table-space-controls-gap: var(--nat-table-space-controls-gap);--sys-nat-table-space-control-block-gap: var(--nat-table-space-control-block-gap);--sys-nat-table-space-toolbar-gap: var(--nat-table-space-toolbar-gap);--sys-nat-table-space-pager-gap: var(--nat-table-space-pager-gap);--sys-nat-table-space-chip-row-gap: var(--nat-table-space-chip-row-gap);--sys-nat-table-space-header-content-gap: var(--nat-table-space-header-content-gap);--sys-nat-table-space-cell-y: var(--nat-table-space-cell-y);--sys-nat-table-space-cell-x: var(--nat-table-space-cell-x);--sys-nat-table-space-header-cell-x: var(--nat-table-space-header-cell-x);--sys-nat-table-space-data-cell-x: var(--nat-table-space-data-cell-x);--sys-nat-table-space-empty-state: var(--nat-table-space-empty-state);--sys-nat-table-radius-card: var(--nat-table-radius-card);--sys-nat-table-radius-card-compact: var(--nat-table-radius-card-compact);--sys-nat-table-radius-region: var(--nat-table-radius-region);--sys-nat-table-radius-input: var(--nat-table-radius-input);--sys-nat-table-radius-chip: var(--nat-table-radius-chip);--sys-nat-table-search-min-height: var(--nat-table-search-min-height);--sys-nat-table-chip-min-height: var(--nat-table-chip-min-height);--sys-nat-table-chip-min-height-compact: var(--nat-table-chip-min-height-compact);--sys-nat-table-chip-padding-x: var(--nat-table-chip-padding-x);--sys-nat-table-chip-padding-x-compact: var(--nat-table-chip-padding-x-compact);--sys-nat-table-chip-min-width-column: var(--nat-table-chip-min-width-column);--sys-nat-table-pager-min-height: var(--nat-table-pager-min-height);--sys-nat-table-pager-padding-x: var(--nat-table-pager-padding-x);--sys-nat-table-pin-min-height: var(--nat-table-pin-min-height);--sys-nat-table-pin-padding-x: var(--nat-table-pin-padding-x);--sys-nat-table-search-padding-x: var(--nat-table-search-padding-x);--sys-nat-table-sort-icon-min-width: var(--nat-table-sort-icon-min-width);--sys-nat-table-sort-icon-svg-width: var(--nat-table-sort-icon-svg-width);--sys-nat-table-sort-icon-svg-height: var(--nat-table-sort-icon-svg-height);--sys-nat-table-sort-icon-chip-radius: var(--nat-table-sort-icon-chip-radius);--sys-nat-table-sort-icon-chip-padding: var(--nat-table-sort-icon-chip-padding);--sys-nat-table-transition-fast: var(--nat-table-transition-fast);--sys-nat-table-transition-medium: var(--nat-table-transition-medium);--sys-nat-table-transition-slow: var(--nat-table-transition-slow);--sys-nat-table-hover-lift: var(--nat-table-hover-lift);--sys-nat-table-focus-ring-color: var(--nat-table-focus-ring-color);--sys-nat-table-focus-ring-width: var(--nat-table-focus-ring-width);--sys-nat-table-focus-ring-offset: var(--nat-table-focus-ring-offset);--sys-nat-table-disabled-opacity: var(--nat-table-disabled-opacity);--sys-nat-table-card-background: var(--nat-table-card-background);--sys-nat-table-card-border-color: var(--nat-table-card-border-color);--sys-nat-table-card-border-color-hover: var(--nat-table-card-border-color-hover);--sys-nat-table-card-border-width: var(--nat-table-card-border-width);--sys-nat-table-card-shadow: var(--nat-table-card-shadow);--sys-nat-table-card-backdrop-filter: var(--nat-table-card-backdrop-filter);--sys-nat-table-card-divider-color: var(--nat-table-card-divider-color);--sys-nat-table-search-background: var(--nat-table-search-background);--sys-nat-table-search-background-focus: var(--nat-table-search-background-focus);--sys-nat-table-search-color: var(--nat-table-search-color);--sys-nat-table-search-placeholder-color: var(--nat-table-search-placeholder-color);--sys-nat-table-search-border-color: var(--nat-table-search-border-color);--sys-nat-table-search-border-color-hover: var(--nat-table-search-border-color-hover);--sys-nat-table-search-border-color-focus: var(--nat-table-search-border-color-focus);--sys-nat-table-search-focus-ring: var(--nat-table-search-focus-ring);--sys-nat-table-chip-background: var(--nat-table-chip-background);--sys-nat-table-chip-background-hover: var(--nat-table-chip-background-hover);--sys-nat-table-chip-background-active: var(--nat-table-chip-background-active);--sys-nat-table-chip-border-color: var(--nat-table-chip-border-color);--sys-nat-table-chip-border-color-hover: var(--nat-table-chip-border-color-hover);--sys-nat-table-chip-border-color-active: var(--nat-table-chip-border-color-active);--sys-nat-table-chip-shadow-active: var(--nat-table-chip-shadow-active);--sys-nat-table-chip-count-color: var(--nat-table-chip-count-color);--sys-nat-table-pager-background: var(--nat-table-pager-background);--sys-nat-table-pager-background-hover: var(--nat-table-pager-background-hover);--sys-nat-table-pager-border-color: var(--nat-table-pager-border-color);--sys-nat-table-pager-shadow-hover: var(--nat-table-pager-shadow-hover);--sys-nat-table-pager-label-color: var(--nat-table-pager-label-color);--sys-nat-table-pager-disabled-opacity: var(--nat-table-pager-disabled-opacity);--sys-nat-table-region-overflow-x: var(--nat-table-region-overflow-x);--sys-nat-table-region-overflow-y: var(--nat-table-region-overflow-y);--sys-nat-table-region-overscroll-behavior-x: var(--nat-table-region-overscroll-behavior-x);--sys-nat-table-region-overscroll-behavior-y: var(--nat-table-region-overscroll-behavior-y);--sys-nat-table-min-height: var(--nat-table-min-height);--sys-nat-table-sticky-top: var(--nat-table-sticky-top);--sys-nat-table-z-index-sticky-header: var(--nat-table-z-index-sticky-header);--sys-nat-table-z-index-pinned-cell: var(--nat-table-z-index-pinned-cell);--sys-nat-table-z-index-pinned-header: var(--nat-table-z-index-pinned-header);--sys-nat-table-z-index-focus-cell: var(--nat-table-z-index-focus-cell);--sys-nat-table-z-index-resize-handle: var(--nat-table-z-index-resize-handle);--sys-nat-table-z-index-resize-guide: var(--nat-table-z-index-resize-guide);--sys-nat-table-z-index-drag-preview: var(--nat-table-z-index-drag-preview);--sys-nat-table-drag-preview-shadow: var(--nat-table-drag-preview-shadow);--sys-nat-table-region-background: var(--nat-table-region-background);--sys-nat-table-region-border-color: var(--nat-table-region-border-color);--sys-nat-table-region-border-width: var(--nat-table-region-border-width);--sys-nat-table-header-background: var(--nat-table-header-background);--sys-nat-table-header-color: var(--nat-table-header-color);--sys-nat-table-header-border-color: var(--nat-table-header-border-color);--sys-nat-table-header-border-width: var(--nat-table-header-border-width);--sys-nat-table-sort-icon-color: var(--nat-table-sort-icon-color);--sys-nat-table-sort-icon-color-active: var(--nat-table-sort-icon-color-active);--sys-nat-table-sort-icon-color-idle: var(--nat-table-sort-icon-color-idle);--sys-nat-table-sort-icon-color-muted: var(--nat-table-sort-icon-color-muted);--sys-nat-table-sort-icon-color-hover: var(--nat-table-sort-icon-color-hover);--sys-nat-table-sort-icon-color-disabled: var(--nat-table-sort-icon-color-disabled);--sys-nat-table-sort-icon-chip-background: var(--nat-table-sort-icon-chip-background);--sys-nat-table-sort-icon-chip-background-hover: var(--nat-table-sort-icon-chip-background-hover);--sys-nat-table-sort-icon-chip-background-active: var(--nat-table-sort-icon-chip-background-active);--sys-nat-table-sort-icon-muted-opacity: var(--nat-table-sort-icon-muted-opacity);--sys-nat-table-sort-button-color-sorted: var(--nat-table-sort-button-color-sorted);--sys-nat-table-pin-background: var(--nat-table-pin-background);--sys-nat-table-pin-border-color: var(--nat-table-pin-border-color);--sys-nat-table-pin-color-pinned: var(--nat-table-pin-color-pinned);--sys-nat-table-pin-border-color-pinned: var(--nat-table-pin-border-color-pinned);--sys-nat-table-pin-shadow-pinned: var(--nat-table-pin-shadow-pinned);--sys-nat-table-row-background: var(--nat-table-row-background);--sys-nat-table-row-background-focus: var(--nat-table-row-background-focus);--sys-nat-table-row-background-focus-pinned: var(--nat-table-row-background-focus-pinned);--sys-nat-table-row-background-hover: var(--nat-table-row-background-hover);--sys-nat-table-row-background-hover-pinned: var(--nat-table-row-background-hover-pinned);--sys-nat-table-cell-border-color: var(--nat-table-cell-border-color);--sys-nat-table-cell-color-positive: var(--nat-table-cell-color-positive);--sys-nat-table-cell-color-negative: var(--nat-table-cell-color-negative);--sys-nat-table-cell-color-warning: var(--nat-table-cell-color-warning);--sys-nat-table-cell-color-neutral: var(--nat-table-cell-color-neutral);--sys-nat-table-pinned-background: var(--nat-table-pinned-background);--sys-nat-table-pinned-header-background: var(--nat-table-pinned-header-background);--sys-nat-table-pinned-divider-color: var(--nat-table-pinned-divider-color);--sys-nat-table-pinned-divider-shadow-color: var(--nat-table-pinned-divider-shadow-color);--sys-nat-table-pinned-edge-shadow-size: var(--nat-table-pinned-edge-shadow-size);--sys-nat-table-empty-state-color: var(--nat-table-empty-state-color);--sys-nat-table-loading-state-color: var(--nat-table-loading-state-color);--sys-nat-table-error-state-color: var(--nat-table-error-state-color);display:block;font-family:var(--nat-table-font-family, inherit);color:var(--nat-table-color-text, var(--sys-nat-table-color-text))}.surface{padding:var(--nat-table-space-card, var(--sys-nat-table-space-card));background:var(--nat-table-card-background, var(--sys-nat-table-card-background));border:var(--nat-table-card-border-width, var(--sys-nat-table-card-border-width)) solid var(--nat-table-card-border-color, var(--sys-nat-table-card-border-color));border-radius:var(--nat-table-radius-card, var(--sys-nat-table-radius-card));box-shadow:var(--nat-table-card-shadow, var(--sys-nat-table-card-shadow));-webkit-backdrop-filter:var(--nat-table-card-backdrop-filter, var(--sys-nat-table-card-backdrop-filter));backdrop-filter:var(--nat-table-card-backdrop-filter, var(--sys-nat-table-card-backdrop-filter));transition:border-color var(--nat-table-transition-slow, var(--sys-nat-table-transition-slow)),background-color var(--nat-table-transition-slow, var(--sys-nat-table-transition-slow))}.surface:has(nat-list){padding:var(--nat-table-space-card-list, var(--sys-nat-table-space-card-list, 0))}@media(width<=720px){.surface{padding:var(--nat-table-space-card-compact, var(--sys-nat-table-space-card-compact));border-radius:var(--nat-table-radius-card-compact, var(--sys-nat-table-radius-card-compact))}}@media(hover:hover)and (pointer:fine){.surface:hover{border-color:var(--nat-table-card-border-color-hover, var(--sys-nat-table-card-border-color-hover))}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSurface, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-surface', template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`, providers: [NatTableService], styles: [":host{--sys-nat-table-color-text: var(--nat-table-color-text);--sys-nat-table-color-text-muted: var(--nat-table-color-text-muted);--sys-nat-table-color-accent: var(--nat-table-color-accent);--sys-nat-table-color-success: var(--nat-table-color-success);--sys-nat-table-color-warning: var(--nat-table-color-warning);--sys-nat-table-color-danger: var(--nat-table-color-danger);--sys-nat-table-color-surface: var(--nat-table-color-surface);--sys-nat-table-color-surface-elevated: var(--nat-table-color-surface-elevated);--sys-nat-table-color-surface-sticky: var(--nat-table-color-surface-sticky);--sys-nat-table-color-border: var(--nat-table-color-border);--sys-nat-table-color-divider: var(--nat-table-color-divider);--sys-nat-table-color-divider-subtle: var(--nat-table-color-divider-subtle);--sys-nat-table-font-size-header: var(--nat-table-font-size-header);--sys-nat-table-font-size-label: var(--nat-table-font-size-label);--sys-nat-table-font-size-caption: var(--nat-table-font-size-caption);--sys-nat-table-font-size-chip-meta: var(--nat-table-font-size-chip-meta);--sys-nat-table-font-size-chip-compact: var(--nat-table-font-size-chip-compact);--sys-nat-table-font-size-pager-label: var(--nat-table-font-size-pager-label);--sys-nat-table-font-size-pin-button: var(--nat-table-font-size-pin-button);--sys-nat-table-font-size-empty-state: var(--nat-table-font-size-empty-state);--sys-nat-table-font-weight-pager: var(--nat-table-font-weight-pager);--sys-nat-table-letter-spacing-header: var(--nat-table-letter-spacing-header);--sys-nat-table-letter-spacing-label: var(--nat-table-letter-spacing-label);--sys-nat-table-letter-spacing-pin-button: var(--nat-table-letter-spacing-pin-button);--sys-nat-table-letter-spacing-pager: var(--nat-table-letter-spacing-pager);--sys-nat-table-text-transform-header: var(--nat-table-text-transform-header);--sys-nat-table-text-transform-label: var(--nat-table-text-transform-label);--sys-nat-table-line-height-empty-state: var(--nat-table-line-height-empty-state);--sys-nat-table-font-weight-row-header: var(--nat-table-font-weight-row-header);--sys-nat-table-space-card: var(--nat-table-space-card);--sys-nat-table-space-card-compact: var(--nat-table-space-card-compact);--sys-nat-table-space-card-list: var(--nat-table-space-card-list);--sys-nat-table-space-controls-gap: var(--nat-table-space-controls-gap);--sys-nat-table-space-control-block-gap: var(--nat-table-space-control-block-gap);--sys-nat-table-space-toolbar-gap: var(--nat-table-space-toolbar-gap);--sys-nat-table-space-pager-gap: var(--nat-table-space-pager-gap);--sys-nat-table-space-chip-row-gap: var(--nat-table-space-chip-row-gap);--sys-nat-table-space-header-content-gap: var(--nat-table-space-header-content-gap);--sys-nat-table-space-cell-y: var(--nat-table-space-cell-y);--sys-nat-table-space-cell-x: var(--nat-table-space-cell-x);--sys-nat-table-space-header-cell-x: var(--nat-table-space-header-cell-x);--sys-nat-table-space-data-cell-x: var(--nat-table-space-data-cell-x);--sys-nat-table-space-empty-state: var(--nat-table-space-empty-state);--sys-nat-table-radius-card: var(--nat-table-radius-card);--sys-nat-table-radius-card-compact: var(--nat-table-radius-card-compact);--sys-nat-table-radius-region: var(--nat-table-radius-region);--sys-nat-table-radius-input: var(--nat-table-radius-input);--sys-nat-table-radius-chip: var(--nat-table-radius-chip);--sys-nat-table-search-min-height: var(--nat-table-search-min-height);--sys-nat-table-chip-min-height: var(--nat-table-chip-min-height);--sys-nat-table-chip-min-height-compact: var(--nat-table-chip-min-height-compact);--sys-nat-table-chip-padding-x: var(--nat-table-chip-padding-x);--sys-nat-table-chip-padding-x-compact: var(--nat-table-chip-padding-x-compact);--sys-nat-table-chip-min-width-column: var(--nat-table-chip-min-width-column);--sys-nat-table-pager-min-height: var(--nat-table-pager-min-height);--sys-nat-table-pager-padding-x: var(--nat-table-pager-padding-x);--sys-nat-table-pin-min-height: var(--nat-table-pin-min-height);--sys-nat-table-pin-padding-x: var(--nat-table-pin-padding-x);--sys-nat-table-search-padding-x: var(--nat-table-search-padding-x);--sys-nat-table-sort-icon-min-width: var(--nat-table-sort-icon-min-width);--sys-nat-table-sort-icon-svg-width: var(--nat-table-sort-icon-svg-width);--sys-nat-table-sort-icon-svg-height: var(--nat-table-sort-icon-svg-height);--sys-nat-table-sort-icon-chip-radius: var(--nat-table-sort-icon-chip-radius);--sys-nat-table-sort-icon-chip-padding: var(--nat-table-sort-icon-chip-padding);--sys-nat-table-transition-fast: var(--nat-table-transition-fast);--sys-nat-table-transition-medium: var(--nat-table-transition-medium);--sys-nat-table-transition-slow: var(--nat-table-transition-slow);--sys-nat-table-hover-lift: var(--nat-table-hover-lift);--sys-nat-table-focus-ring-color: var(--nat-table-focus-ring-color);--sys-nat-table-focus-ring-width: var(--nat-table-focus-ring-width);--sys-nat-table-focus-ring-offset: var(--nat-table-focus-ring-offset);--sys-nat-table-disabled-opacity: var(--nat-table-disabled-opacity);--sys-nat-table-card-background: var(--nat-table-card-background);--sys-nat-table-card-border-color: var(--nat-table-card-border-color);--sys-nat-table-card-border-color-hover: var(--nat-table-card-border-color-hover);--sys-nat-table-card-border-width: var(--nat-table-card-border-width);--sys-nat-table-card-shadow: var(--nat-table-card-shadow);--sys-nat-table-card-backdrop-filter: var(--nat-table-card-backdrop-filter);--sys-nat-table-card-divider-color: var(--nat-table-card-divider-color);--sys-nat-table-search-background: var(--nat-table-search-background);--sys-nat-table-search-background-focus: var(--nat-table-search-background-focus);--sys-nat-table-search-color: var(--nat-table-search-color);--sys-nat-table-search-placeholder-color: var(--nat-table-search-placeholder-color);--sys-nat-table-search-border-color: var(--nat-table-search-border-color);--sys-nat-table-search-border-color-hover: var(--nat-table-search-border-color-hover);--sys-nat-table-search-border-color-focus: var(--nat-table-search-border-color-focus);--sys-nat-table-search-focus-ring: var(--nat-table-search-focus-ring);--sys-nat-table-chip-background: var(--nat-table-chip-background);--sys-nat-table-chip-background-hover: var(--nat-table-chip-background-hover);--sys-nat-table-chip-background-active: var(--nat-table-chip-background-active);--sys-nat-table-chip-border-color: var(--nat-table-chip-border-color);--sys-nat-table-chip-border-color-hover: var(--nat-table-chip-border-color-hover);--sys-nat-table-chip-border-color-active: var(--nat-table-chip-border-color-active);--sys-nat-table-chip-shadow-active: var(--nat-table-chip-shadow-active);--sys-nat-table-chip-count-color: var(--nat-table-chip-count-color);--sys-nat-table-pager-background: var(--nat-table-pager-background);--sys-nat-table-pager-background-hover: var(--nat-table-pager-background-hover);--sys-nat-table-pager-border-color: var(--nat-table-pager-border-color);--sys-nat-table-pager-shadow-hover: var(--nat-table-pager-shadow-hover);--sys-nat-table-pager-label-color: var(--nat-table-pager-label-color);--sys-nat-table-pager-disabled-opacity: var(--nat-table-pager-disabled-opacity);--sys-nat-table-region-overflow-x: var(--nat-table-region-overflow-x);--sys-nat-table-region-overflow-y: var(--nat-table-region-overflow-y);--sys-nat-table-region-overscroll-behavior-x: var(--nat-table-region-overscroll-behavior-x);--sys-nat-table-region-overscroll-behavior-y: var(--nat-table-region-overscroll-behavior-y);--sys-nat-table-min-height: var(--nat-table-min-height);--sys-nat-table-sticky-top: var(--nat-table-sticky-top);--sys-nat-table-z-index-sticky-header: var(--nat-table-z-index-sticky-header);--sys-nat-table-z-index-pinned-cell: var(--nat-table-z-index-pinned-cell);--sys-nat-table-z-index-pinned-header: var(--nat-table-z-index-pinned-header);--sys-nat-table-z-index-focus-cell: var(--nat-table-z-index-focus-cell);--sys-nat-table-z-index-resize-handle: var(--nat-table-z-index-resize-handle);--sys-nat-table-z-index-resize-guide: var(--nat-table-z-index-resize-guide);--sys-nat-table-z-index-drag-preview: var(--nat-table-z-index-drag-preview);--sys-nat-table-drag-preview-shadow: var(--nat-table-drag-preview-shadow);--sys-nat-table-region-background: var(--nat-table-region-background);--sys-nat-table-region-border-color: var(--nat-table-region-border-color);--sys-nat-table-region-border-width: var(--nat-table-region-border-width);--sys-nat-table-header-background: var(--nat-table-header-background);--sys-nat-table-header-color: var(--nat-table-header-color);--sys-nat-table-header-border-color: var(--nat-table-header-border-color);--sys-nat-table-header-border-width: var(--nat-table-header-border-width);--sys-nat-table-sort-icon-color: var(--nat-table-sort-icon-color);--sys-nat-table-sort-icon-color-active: var(--nat-table-sort-icon-color-active);--sys-nat-table-sort-icon-color-idle: var(--nat-table-sort-icon-color-idle);--sys-nat-table-sort-icon-color-muted: var(--nat-table-sort-icon-color-muted);--sys-nat-table-sort-icon-color-hover: var(--nat-table-sort-icon-color-hover);--sys-nat-table-sort-icon-color-disabled: var(--nat-table-sort-icon-color-disabled);--sys-nat-table-sort-icon-chip-background: var(--nat-table-sort-icon-chip-background);--sys-nat-table-sort-icon-chip-background-hover: var(--nat-table-sort-icon-chip-background-hover);--sys-nat-table-sort-icon-chip-background-active: var(--nat-table-sort-icon-chip-background-active);--sys-nat-table-sort-icon-muted-opacity: var(--nat-table-sort-icon-muted-opacity);--sys-nat-table-sort-button-color-sorted: var(--nat-table-sort-button-color-sorted);--sys-nat-table-pin-background: var(--nat-table-pin-background);--sys-nat-table-pin-border-color: var(--nat-table-pin-border-color);--sys-nat-table-pin-color-pinned: var(--nat-table-pin-color-pinned);--sys-nat-table-pin-border-color-pinned: var(--nat-table-pin-border-color-pinned);--sys-nat-table-pin-shadow-pinned: var(--nat-table-pin-shadow-pinned);--sys-nat-table-row-background: var(--nat-table-row-background);--sys-nat-table-row-background-focus: var(--nat-table-row-background-focus);--sys-nat-table-row-background-focus-pinned: var(--nat-table-row-background-focus-pinned);--sys-nat-table-row-background-hover: var(--nat-table-row-background-hover);--sys-nat-table-row-background-hover-pinned: var(--nat-table-row-background-hover-pinned);--sys-nat-table-cell-border-color: var(--nat-table-cell-border-color);--sys-nat-table-cell-color-positive: var(--nat-table-cell-color-positive);--sys-nat-table-cell-color-negative: var(--nat-table-cell-color-negative);--sys-nat-table-cell-color-warning: var(--nat-table-cell-color-warning);--sys-nat-table-cell-color-neutral: var(--nat-table-cell-color-neutral);--sys-nat-table-pinned-background: var(--nat-table-pinned-background);--sys-nat-table-pinned-header-background: var(--nat-table-pinned-header-background);--sys-nat-table-pinned-divider-color: var(--nat-table-pinned-divider-color);--sys-nat-table-pinned-divider-shadow-color: var(--nat-table-pinned-divider-shadow-color);--sys-nat-table-pinned-edge-shadow-size: var(--nat-table-pinned-edge-shadow-size);--sys-nat-table-empty-state-color: var(--nat-table-empty-state-color);--sys-nat-table-loading-state-color: var(--nat-table-loading-state-color);--sys-nat-table-error-state-color: var(--nat-table-error-state-color);display:block;font-family:var(--nat-table-font-family, inherit);color:var(--nat-table-color-text, var(--sys-nat-table-color-text))}.surface{padding:var(--nat-table-space-card, var(--sys-nat-table-space-card));background:var(--nat-table-card-background, var(--sys-nat-table-card-background));border:var(--nat-table-card-border-width, var(--sys-nat-table-card-border-width)) solid var(--nat-table-card-border-color, var(--sys-nat-table-card-border-color));border-radius:var(--nat-table-radius-card, var(--sys-nat-table-radius-card));box-shadow:var(--nat-table-card-shadow, var(--sys-nat-table-card-shadow));-webkit-backdrop-filter:var(--nat-table-card-backdrop-filter, var(--sys-nat-table-card-backdrop-filter));backdrop-filter:var(--nat-table-card-backdrop-filter, var(--sys-nat-table-card-backdrop-filter));transition:border-color var(--nat-table-transition-slow, var(--sys-nat-table-transition-slow)),background-color var(--nat-table-transition-slow, var(--sys-nat-table-transition-slow))}.surface:has(nat-list){padding:var(--nat-table-space-card-list, var(--sys-nat-table-space-card-list, 0))}@media(width<=720px){.surface{padding:var(--nat-table-space-card-compact, var(--sys-nat-table-space-card-compact));border-radius:var(--nat-table-radius-card-compact, var(--sys-nat-table-radius-card-compact))}}@media(hover:hover)and (pointer:fine){.surface:hover{border-color:var(--nat-table-card-border-color-hover, var(--sys-nat-table-card-border-color-hover))}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { state: [{ type: i0.Input, args: [{ isSignal: true, alias: "state", required: false }] }, { type: i0.Output, args: ["stateChange"] }], initialState: [{ type: i0.Input, args: [{ isSignal: true, alias: "initialState", required: false }] }], mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: false }] }], manualPageCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "manualPageCount", required: false }] }], enableAnnouncements: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableAnnouncements", required: false }] }], stickyHeader: [{ type: i0.Input, args: [{ isSignal: true, alias: "stickyHeader", required: false }] }], enableMultiSort: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableMultiSort", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], accessibilityText: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityText", required: false }] }], keybindings: [{ type: i0.Input, args: [{ isSignal: true, alias: "keybindings", required: false }] }], columnResizeMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "columnResizeMode", required: false }] }], columnSizingMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "columnSizingMode", required: false }] }], enableColumnResizing: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableColumnResizing", required: false }] }], enableReordering: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableReordering", required: false }] }], enableSorting: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableSorting", required: false }] }], enablePinning: [{ type: i0.Input, args: [{ isSignal: true, alias: "enablePinning", required: false }] }], direction: [{ type: i0.Input, args: [{ isSignal: true, alias: "direction", required: false }] }], sortingChange: [{ type: i0.Output, args: ["sortingChange"] }], globalFilterChange: [{ type: i0.Output, args: ["globalFilterChange"] }], columnFiltersChange: [{ type: i0.Output, args: ["columnFiltersChange"] }], columnVisibilityChange: [{ type: i0.Output, args: ["columnVisibilityChange"] }], columnOrderChange: [{ type: i0.Output, args: ["columnOrderChange"] }], columnPinningChange: [{ type: i0.Output, args: ["columnPinningChange"] }], columnSizingChange: [{ type: i0.Output, args: ["columnSizingChange"] }], paginationChange: [{ type: i0.Output, args: ["paginationChange"] }], rowSelectionChange: [{ type: i0.Output, args: ["rowSelectionChange"] }] } });

const NAT_TOOLBAR_TEXT_INPUT_TYPES = new Set([
    'text',
    'search',
    'email',
    'url',
    'tel',
    'password',
    'number',
    'date',
    'datetime-local',
    'month',
    'time',
    'week'
]);
/** True when the event target owns caret/arrow-key editing — toolbar keys must not steal it. */
const isNatToolbarTextEntryElement = (target) => {
    if (target instanceof HTMLTextAreaElement)
        return true;
    if (target instanceof HTMLSelectElement)
        return true;
    if (target instanceof HTMLElement && target.isContentEditable)
        return true;
    return target instanceof HTMLInputElement && NAT_TOOLBAR_TEXT_INPUT_TYPES.has(target.type);
};
/** Any modifier that changes an arrow's meaning inside a text field (word-jump, select, …). */
const hasCaretModifier = (event) => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
/** Collapsed caret sits at the value edge the arrow would exit toward (RTL flips which arrow is "forward"). */
const caretAtExitEdge = (field, key, rtl) => {
    const { selectionStart, value } = field;
    const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (key === forwardKey)
        return selectionStart === value.length;
    if (key === backwardKey)
        return selectionStart === 0;
    return false;
};
/**
 * Boundary-aware handoff for a single-line text `<input>`: true when the pressed
 * arrow should give up the caret and let roving navigation advance — i.e. the
 * caret is collapsed at the value edge in the arrow's travel direction (#249).
 */
const shouldHandOffCaretToToolbar = (event, rtl) => {
    const { target } = event;
    // Only a single-line text input exposes a logical caret we can trust;
    // textarea / select / contentEditable keep every key.
    // ponytail: number/date/email inputs report selectionStart === null, so they
    // stay dead-ends here — the platform gives us no caret position to test.
    if (!(target instanceof HTMLInputElement))
        return false;
    if (hasCaretModifier(event))
        return false;
    const { selectionStart, selectionEnd } = target;
    if (selectionStart === null || selectionStart !== selectionEnd)
        return false;
    return caretAtExitEdge(target, event.key, rtl);
};
class NatTableToolbar {
    for = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "for" }] : /* istanbul ignore next */ []));
    accessibleName = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    locale = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "locale" }] : /* istanbul ignore next */ []));
    /**
     * `'roving'` (default) keeps the WAI-ARIA single-Tab-stop toolbar pattern.
     * `'none'` disables all focus management: no host or item tabindex, no
     * arrow-key navigation — every projected control keeps its native Tab stop.
     * Use `'none'` when projected controls are sealed custom elements (closed
     * shadow root) that cannot register as `natToolbarItem`s.
     */
    focusManagement = input('roving', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "focusManagement" }] : /* istanbul ignore next */ []));
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    controller = injectNatTableUiController(this.for, 'nat-table-toolbar');
    // The generic is the selection value type — this toolbar disables Aria's
    // selection model entirely (see the pattern patches below), so widget
    // `value`s only serve Aria's registry and must merely be unique.
    ariaToolbar = inject(Toolbar, { self: true });
    /** Single touch point for Aria's private `_pattern` API — fix here if it ever renames. */
    get pattern() {
        const { _pattern: pattern } = this.ariaToolbar;
        return pattern;
    }
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    resolvedAccessibleName = computed(() => this.accessibleName() ?? this.tableUiIntl().toolbar?.toolbarLabel ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibleName" }] : /* istanbul ignore next */ []));
    ariaControls = computed(() => this.controller()?.tableElementId() ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaControls" }] : /* istanbul ignore next */ []));
    hostTabIndex = computed(() => (this.focusManagement() === 'none' ? null : this.pattern.tabIndex()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostTabIndex" }] : /* istanbul ignore next */ []));
    hostAriaDisabled = computed(() => {
        if (this.focusManagement() === 'none') {
            // Reflect only an explicit consumer `disabled`, never the pattern's
            // derived "no focusable items" state — that state is meaningless here.
            return this.pattern.inputs.disabled() ? true : null;
        }
        return this.pattern.disabled();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostAriaDisabled" }] : /* istanbul ignore next */ []));
    constructor() {
        this.patchAriaToolbarPattern();
        // Registered widgets would still receive Aria's roving item tabindex
        // (active `0`, rest `-1`) even in `focusManagement="none"`, splitting the
        // toolbar between two contradictory focus models.
        if (isDevMode()) {
            effect(() => {
                if (this.focusManagement() === 'none' && this.pattern.inputs.items().length > 0) {
                    console.warn('[ng-advanced-table/components] <nat-table-toolbar focusManagement="none"> contains registered ' +
                        'natToolbarItem/NatToolbarGroup widgets. Their roving tabindex still applies and will conflict ' +
                        'with native Tab order — remove the markers, or use the default roving mode.');
                }
            });
        }
        // @angular/aria never clears activeItem when a widget unregisters (items
        // removed via @if would strand the roving tab stop on a dead widget, and
        // Tab would skip the toolbar). Reset it to the first visual item.
        effect(() => {
            const pattern = this.pattern;
            const widgets = pattern.inputs.items();
            const active = pattern.activeItem();
            if (active !== undefined && !widgets.includes(active)) {
                pattern.inputs.activeItem.set(widgets[0]);
            }
        });
    }
    /**
     * Instance-level patches on the @angular/aria toolbar pattern. Each one
     * works around a behavior of the stock pattern that
     * breaks this toolbar; the aria-integration spec is the tripwire.
     * Re-verify all four on every `@angular/aria` bump.
     */
    patchAriaToolbarPattern() {
        const pattern = this.pattern;
        const originalOnKeydown = pattern.onKeydown.bind(pattern);
        pattern.onKeydown = (event) => {
            // No focus management: arrows, Home/End and friends belong to the
            // controls themselves.
            if (this.focusManagement() === 'none')
                return;
            // Aria preventDefaults Enter/Space for its selection model (unused
            // here) — that would kill native button activation and Space typing.
            if (event.key === 'Enter' || event.key === ' ')
                return;
            // Text-entry widgets keep their caret keys — but a single-line <input>
            // hands Left/Right off to roving nav once the caret sits at the matching
            // edge, so the input isn't a dead-end for arrow traversal (#249).
            if (isNatToolbarTextEntryElement(event.target)) {
                const rtl = pattern.inputs.textDirection() === 'rtl';
                if (!shouldHandOffCaretToToolbar(event, rtl))
                    return;
            }
            originalOnKeydown(event);
        };
        const originalOnPointerdown = pattern.onPointerdown.bind(pattern);
        pattern.onPointerdown = (event) => {
            if (this.focusManagement() === 'none')
                return;
            // Aria preventDefaults every pointerdown — on text-entry widgets that
            // kills caret placement and drag selection.
            if (isNatToolbarTextEntryElement(event.target))
                return;
            originalOnPointerdown(event);
        };
        const originalOnClick = pattern.onClick.bind(pattern);
        pattern.onClick = (event) => {
            if (this.focusManagement() === 'none')
                return;
            // Aria's click handler re-focuses the resolved widget element — on
            // text-entry widgets that would steal the caret the user just placed.
            if (isNatToolbarTextEntryElement(event.target))
                return;
            originalOnClick(event);
        };
        // Disable the selection model: select() would mutate the toolbar `values`
        // model on Enter/Space/click — widget values exist only for Aria's
        // registry, never as selection state.
        pattern.select = () => {
            // intentional no-op: selection model is disabled for this toolbar
        };
    }
    /**
     * Keeps Aria's active widget in sync with real focus. Aria only updates it
     * on arrow keys and clicks — Tab (and programmatic focus) would leave the
     * roving tab stop behind.
     */
    syncActiveItemFromFocus(event) {
        if (this.focusManagement() === 'none')
            return;
        const target = event.target;
        if (!(target instanceof Element))
            return;
        const pattern = this.pattern;
        const item = pattern.inputs.getItem(target);
        if (item !== undefined && pattern.activeItem() !== item) {
            pattern.inputs.activeItem.set(item);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableToolbar, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.1.1", type: NatTableToolbar, isStandalone: true, selector: "nat-table-toolbar", inputs: { for: { classPropertyName: "for", publicName: "for", isSignal: true, isRequired: false, transformFunction: null }, accessibleName: { classPropertyName: "accessibleName", publicName: "accessibleName", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, focusManagement: { classPropertyName: "focusManagement", publicName: "focusManagement", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "focusin": "syncActiveItemFromFocus($event)" }, properties: { "attr.aria-label": "resolvedAccessibleName()", "attr.aria-controls": "ariaControls()", "attr.tabindex": "hostTabIndex()", "attr.aria-disabled": "hostAriaDisabled()" } }, hostDirectives: [{ directive: i1.Toolbar, inputs: ["disabled", "disabled", "softDisabled", "softDisabled", "wrap", "wrap"] }], ngImport: i0, template: "<!-- Selector-less slot is first so position-less items default to the start slot. -->\n<ng-content />\n<div class=\"nat-toolbar-spacer\" data-testid=\"toolbar-spacer-start\"></div>\n<ng-content select=\"[natToolbarItemPosition='center'], [natToolbarGroup='center']\" />\n<div class=\"nat-toolbar-spacer\" data-testid=\"toolbar-spacer-end\"></div>\n<ng-content select=\"[natToolbarItemPosition='end'], [natToolbarGroup='end']\" />\n", styles: [":host{box-sizing:border-box;display:flex;flex-wrap:nowrap;gap:var(--nat-table-toolbar-gap, var(--sys-nat-table-toolbar-gap, 12px));align-items:center;width:100%;min-width:0;padding:var(--nat-table-toolbar-padding, var(--sys-nat-table-toolbar-padding, 10px));background:var(--nat-table-toolbar-background, var(--sys-nat-table-toolbar-background, transparent))}.nat-toolbar-spacer{flex:1 1 0;min-width:0}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableToolbar, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-toolbar', hostDirectives: [{ directive: Toolbar, inputs: ['disabled', 'softDisabled', 'wrap'] }], host: {
                        '[attr.aria-label]': 'resolvedAccessibleName()',
                        '[attr.aria-controls]': 'ariaControls()',
                        // These two override the same bindings from the Toolbar host directive —
                        // in `focusManagement="none"` the pattern's empty-toolbar fallback
                        // (`tabindex="0"` + `aria-disabled="true"` when no widget is registered)
                        // must not surface on a toolbar whose controls tab natively.
                        '[attr.tabindex]': 'hostTabIndex()',
                        '[attr.aria-disabled]': 'hostAriaDisabled()',
                        '(focusin)': 'syncActiveItemFromFocus($event)'
                    }, template: "<!-- Selector-less slot is first so position-less items default to the start slot. -->\n<ng-content />\n<div class=\"nat-toolbar-spacer\" data-testid=\"toolbar-spacer-start\"></div>\n<ng-content select=\"[natToolbarItemPosition='center'], [natToolbarGroup='center']\" />\n<div class=\"nat-toolbar-spacer\" data-testid=\"toolbar-spacer-end\"></div>\n<ng-content select=\"[natToolbarItemPosition='end'], [natToolbarGroup='end']\" />\n", styles: [":host{box-sizing:border-box;display:flex;flex-wrap:nowrap;gap:var(--nat-table-toolbar-gap, var(--sys-nat-table-toolbar-gap, 12px));align-items:center;width:100%;min-width:0;padding:var(--nat-table-toolbar-padding, var(--sys-nat-table-toolbar-padding, 10px));background:var(--nat-table-toolbar-background, var(--sys-nat-table-toolbar-background, transparent))}.nat-toolbar-spacer{flex:1 1 0;min-width:0}\n"] }]
        }], ctorParameters: () => [], propDecorators: { for: [{ type: i0.Input, args: [{ isSignal: true, alias: "for", required: false }] }], accessibleName: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibleName", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], focusManagement: [{ type: i0.Input, args: [{ isSignal: true, alias: "focusManagement", required: false }] }] } });

/** Pin sides offered in the column actions menu for pinnable columns. */
const NAT_HEADER_ACTIONS_PIN_SIDES = ['left', 'right'];
/** Move directions offered in the column actions menu for reorderable columns. */
const NAT_HEADER_ACTIONS_MOVE_DIRECTIONS = ['left', 'right'];
/** Connected-overlay fallback positions for the pin actions menu. */
const NAT_HEADER_ACTIONS_PIN_MENU_POSITIONS = [
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offsetY: 6
    },
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 6
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offsetY: -6
    }
];

// Header-control availability follows the surface-enabler + per-column override model:
// a column resolves `columnDef.<flag> ?? surface.<enabler> ?? false`, then AND's TanStack's
// own `getCanSort()`/`getCanPin()` (which contribute the accessor/leaf safety checks).
/**
 * Whether the header sort button should render and be operable for a column.
 * The active sub-header column is never sortable: its forced primary sort is
 * hidden, so a sort button on it would toggle state with no visible effect.
 */
const canSortColumn = (column, surfaceSortingEnabled, enableSortActions, subHeaderColumnId = null) => enableSortActions &&
    column.id !== subHeaderColumnId &&
    (column.columnDef.enableSorting ?? surfaceSortingEnabled ?? false) &&
    column.getCanSort();
/** Table-level `canSortColumn` overload reading the surface enabler and sub-header column from the table meta. */
const canSortHeaderColumn = (table, column, enableSortActions) => canSortColumn(column, table.options.meta?.natTableSortingEnabled, enableSortActions, table.options.meta?.natTableSubHeaderColumnId ?? null);
/** User-visible sorting for header controls: TanStack state minus the hidden forced sub-header entry. */
const getVisibleSorting = (table) => stripNatTableSubHeaderSorting(table.getState().sorting, table.options.meta?.natTableSubHeaderColumnId ?? null);
/** One-based visible multi-sort priority for a column, or `null` when at most one user sort is active. */
const getVisibleSortPriority = (sorting, columnId) => {
    if (sorting.length <= 1) {
        return null;
    }
    const index = sorting.findIndex((sortEntry) => sortEntry.id === columnId);
    return index >= 0 ? index + 1 : null;
};
/** Visible sort direction for a column, or `false` when it is not user-sorted. */
const getVisibleSortState = (sorting, columnId) => {
    const entry = sorting.find((sortEntry) => sortEntry.id === columnId);
    if (!entry) {
        return false;
    }
    return entry.desc ? 'desc' : 'asc';
};
/** Whether the header pin menu should render and be operable for a column. */
const canPinColumn = (column, surfacePinningEnabled, enableColumnPinActions) => enableColumnPinActions && (column.columnDef.enablePinning ?? surfacePinningEnabled ?? false) && column.getCanPin();

const buildSortContext = (label, sort) => ({
    label,
    sortState: sort.ariaSort,
    sortPriority: sort.sortPriority,
    sortCount: sort.sortCount
});
const buildPinContext = (label, side, pinnedSide) => ({
    label,
    pinState: pinnedSide ? 'pinned' : 'unpinned',
    toggleAction: pinnedSide === side ? 'unpin' : 'pin',
    pinSide: side,
    pinnedSide
});
const buildMoveContext = (label, direction) => ({
    label,
    direction
});
const buildMenuContext = (label) => ({ label });
const resolveSortLabel = (labels, label, sort) => labels.sortButton?.(buildSortContext(label, sort)) ?? '';
const resolvePinLabel = (labels, label, side, pinnedSide) => labels.pinButton?.(buildPinContext(label, side, pinnedSide)) ?? '';
const resolvePinText = (labels, label, side, pinnedSide) => labels.pinButtonText?.(buildPinContext(label, side, pinnedSide)) ?? '';
const resolveMoveLabel = (labels, label, direction) => labels.moveButton?.(buildMoveContext(label, direction)) ?? '';
const resolveMoveText = (labels, label, direction) => labels.moveButtonText?.(buildMoveContext(label, direction)) ?? '';
const resolveMenuButtonLabel = (labels, label) => labels.menuButton?.(buildMenuContext(label)) ?? '';
const resolveMenuLabel = (labels, label) => labels.menuLabel?.(buildMenuContext(label)) ?? '';
/** Maps a TanStack sort direction to its ARIA sort token. */
const toAriaSort = (sortState) => {
    if (sortState === 'asc')
        return 'ascending';
    if (sortState === 'desc')
        return 'descending';
    return 'none';
};
/** Builds the context passed to companion sort-indicator renderers. */
const buildSortIndicatorContext = (sortState, ariaSort, column, label) => ({
    $implicit: sortState,
    sortState,
    ariaSort,
    column,
    label
});

/* eslint-disable max-lines -- header-actions component: presentational header controls plus the aria-menu keyboard and focus wiring (overlay attach, deferred-item focus, post-reorder refocus) that must live beside the overlay template it drives. */
class NatTableHeaderActions {
    a11yService = inject(NatTableA11yService);
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    localeId = computed(() => this.locale() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableUiIntl = computed(() => resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableUiIntl" }] : /* istanbul ignore next */ []));
    pinSides = NAT_HEADER_ACTIONS_PIN_SIDES;
    moveDirections = NAT_HEADER_ACTIONS_MOVE_DIRECTIONS;
    pinMenu = viewChild('pinMenu', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pinMenu" }] : /* istanbul ignore next */ []));
    menuOrigin = viewChild('menuOrigin', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "menuOrigin" }] : /* istanbul ignore next */ []));
    menuTriggerRef = viewChild('menuTrigger', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "menuTriggerRef" }] : /* istanbul ignore next */ []));
    injector = inject(Injector);
    changeDetectorRef = inject(ChangeDetectorRef);
    pinMenuPositions = [...NAT_HEADER_ACTIONS_PIN_MENU_POSITIONS];
    context = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "context" }] : /* istanbul ignore next */ []));
    content = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "content" }] : /* istanbul ignore next */ []));
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    hideLabel = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hideLabel" }] : /* istanbul ignore next */ []));
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    sortIndicator = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortIndicator" }] : /* istanbul ignore next */ []));
    accessibilityLabels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityLabels" }] : /* istanbul ignore next */ []));
    enableSortActions = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableSortActions" }] : /* istanbul ignore next */ []));
    enableColumnPinActions = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableColumnPinActions" }] : /* istanbul ignore next */ []));
    enableColumnReorderActions = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableColumnReorderActions" }] : /* istanbul ignore next */ []));
    // `!= null` (not `!== null`) so an unset (`undefined`) indicator falls through to the default arrow.
    hasCustomSortIndicator = computed(() => this.sortIndicator() != null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasCustomSortIndicator" }] : /* istanbul ignore next */ []));
    canSort() {
        return canSortHeaderColumn(this.context().table, this.column(), this.enableSortActions());
    }
    canPin() {
        return canPinColumn(this.column(), this.context().table.options.meta?.natTablePinningEnabled, this.enableColumnPinActions());
    }
    canShowMenu() {
        return this.canPin() || this.hasColumnMoveActions();
    }
    hasColumnMoveActions() {
        return this.enableColumnReorderActions() && (this.canMoveColumn('left') || this.canMoveColumn('right'));
    }
    isPinned(side) {
        return side ? this.pinnedSide() === side : this.pinnedSide() !== null;
    }
    isAlignedEnd() {
        return this.column().columnDef.meta?.align === 'end';
    }
    // `getVisibleSorting` strips the hidden forced sub-header entry, so sort
    // state, priorities, and labels only ever reflect user-visible sorting.
    sortState() {
        return getVisibleSortState(getVisibleSorting(this.context().table), this.column().id);
    }
    sortIndicatorContext() {
        return buildSortIndicatorContext(this.sortState(), toAriaSort(this.sortState()), this.column(), this.label());
    }
    /**
     * Single activation path for menu items. @angular/aria menus activate items
     * (Enter, Space, and pointer click) by emitting `itemSelected` with the item
     * value and closing the menu with refocus; they never fire a DOM click on the
     * item element.
     */
    /**
     * The overlay attaches its embedded view outside change detection, so under
     * zoneless CD nothing re-runs the `#pinMenu` view query or the `[menu]`
     * binding afterwards — the trigger never learns its menu exists. Worse, the
     * trigger's pending "focus the first item" intent is consumed as soon as the
     * menu resolves, which is still before the menu's deferred content has
     * rendered any items, so keyboard opens strand focus on the trigger. Mark the
     * view to complete the wiring, then re-issue the trigger's open once the
     * items have rendered so the first item receives focus.
     */
    onMenuOverlayAttach() {
        this.changeDetectorRef.markForCheck();
        afterNextRender({
            write: () => {
                // One macrotask later: the menu registers its items through a
                // MutationObserver whose callback is queued behind this render task,
                // so re-opening synchronously would still find an itemless menu.
                setTimeout(() => {
                    const trigger = this.menuTriggerRef();
                    if (trigger?.expanded())
                        trigger.open();
                });
            }
        }, { injector: this.injector });
    }
    onMenuItemSelected(value) {
        for (const side of NAT_HEADER_ACTIONS_PIN_SIDES) {
            if (value === `pin:${side}`)
                this.togglePin(side);
        }
        for (const direction of NAT_HEADER_ACTIONS_MOVE_DIRECTIONS) {
            if (value === `move:${direction}`)
                this.moveColumn(direction);
        }
        // Pinning or moving a column re-inserts its <th> elsewhere in the DOM, which
        // drops focus to <body> after the menu's own close-with-refocus. This
        // component moves with its column, so put focus back on the trigger once the
        // re-render has landed.
        afterNextRender({ write: () => this.menuOrigin()?.nativeElement.focus() }, { injector: this.injector });
    }
    togglePin(side) {
        this.column().pin(this.isPinned(side) ? false : side);
    }
    onSortClick(event) {
        this.column().toggleSorting(undefined, event.shiftKey);
    }
    sortPriority() {
        return getVisibleSortPriority(getVisibleSorting(this.context().table), this.column().id);
    }
    getSortLabel() {
        return resolveSortLabel(this.resolveAccessibilityLabels(), this.label(), {
            ariaSort: toAriaSort(this.sortState()),
            sortPriority: this.sortPriority(),
            sortCount: getVisibleSorting(this.context().table).length
        });
    }
    getPinLabel(side) {
        return resolvePinLabel(this.resolveAccessibilityLabels(), this.label(), side, this.pinnedSide());
    }
    getPinText(side) {
        return resolvePinText(this.resolveAccessibilityLabels(), this.label(), side, this.pinnedSide());
    }
    canMoveColumn(direction) {
        return this.context().table.options.meta?.natTableCanMoveColumn?.(this.column().id, direction) ?? false;
    }
    moveColumn(direction) {
        if (!this.canMoveColumn(direction))
            return;
        const result = this.context().table.options.meta?.natTableMoveColumn?.(this.column().id, direction) ?? null;
        if (result) {
            this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
        }
    }
    getMoveLabel(direction) {
        return resolveMoveLabel(this.resolveAccessibilityLabels(), this.label(), direction);
    }
    getMoveText(direction) {
        return resolveMoveText(this.resolveAccessibilityLabels(), this.label(), direction);
    }
    getMenuButtonLabel() {
        return resolveMenuButtonLabel(this.resolveAccessibilityLabels(), this.label());
    }
    getMenuLabel() {
        return resolveMenuLabel(this.resolveAccessibilityLabels(), this.label());
    }
    column() {
        return this.context().column;
    }
    pinnedSide() {
        const pinState = this.column().getIsPinned();
        return pinState === 'left' || pinState === 'right' ? pinState : null;
    }
    resolveAccessibilityLabels() {
        return mergeHeaderActionLabels(this.tableUiIntl().headerActions?.accessibilityLabels, this.accessibilityLabels());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderActions, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTableHeaderActions, isStandalone: true, selector: "nat-table-header-actions", inputs: { context: { classPropertyName: "context", publicName: "context", isSignal: true, isRequired: true, transformFunction: null }, content: { classPropertyName: "content", publicName: "content", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, hideLabel: { classPropertyName: "hideLabel", publicName: "hideLabel", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, sortIndicator: { classPropertyName: "sortIndicator", publicName: "sortIndicator", isSignal: true, isRequired: false, transformFunction: null }, accessibilityLabels: { classPropertyName: "accessibilityLabels", publicName: "accessibilityLabels", isSignal: true, isRequired: false, transformFunction: null }, enableSortActions: { classPropertyName: "enableSortActions", publicName: "enableSortActions", isSignal: true, isRequired: false, transformFunction: null }, enableColumnPinActions: { classPropertyName: "enableColumnPinActions", publicName: "enableColumnPinActions", isSignal: true, isRequired: false, transformFunction: null }, enableColumnReorderActions: { classPropertyName: "enableColumnReorderActions", publicName: "enableColumnReorderActions", isSignal: true, isRequired: false, transformFunction: null } }, viewQueries: [{ propertyName: "pinMenu", first: true, predicate: ["pinMenu"], descendants: true, isSignal: true }, { propertyName: "menuOrigin", first: true, predicate: ["menuOrigin"], descendants: true, isSignal: true }, { propertyName: "menuTriggerRef", first: true, predicate: ["menuTrigger"], descendants: true, isSignal: true }], ngImport: i0, template: "<!--\n  Deliberately NOT an ngGridCellWidget: the header cell never registers a widget\n  (GridCell's content query cannot see into this flexRender-created view), yet the\n  widget directive still self-assigns tabindex=\"0\" while its cell is active \u2014 a\n  focus stop between the cell and its controls that swallows Tab. The header\n  keyboard model (Enter into controls, Tab between them, Escape back) is owned by\n  the table's cell-interaction layer instead.\n-->\n<div [class.is-align-end]=\"isAlignedEnd()\" class=\"header-content\">\n  <div class=\"header-actions-row\">\n    <div class=\"header-leading\">\n      @if (canSort()) {\n        <button\n          [attr.aria-label]=\"getSortLabel()\"\n          [class.is-sorted]=\"!!sortState()\"\n          class=\"sort-button\"\n          type=\"button\"\n          (click)=\"onSortClick($event)\"\n          (pointerdown)=\"$event.stopPropagation()\">\n          <span [class.sr-only]=\"hideLabel()\" class=\"header-label\">\n            @if (hideLabel()) {\n              {{ label() }}\n            } @else {\n              <ng-container *flexRender=\"content(); props: context(); let rendered\"> {{ rendered }} </ng-container>\n            }\n          </span>\n          <span aria-hidden=\"true\" class=\"sort-icon\">\n            @if (hasCustomSortIndicator()) {\n              <ng-container *flexRender=\"sortIndicator(); props: sortIndicatorContext(); let rendered\"> {{ rendered }} </ng-container>\n            } @else {\n              <span [attr.data-sort-state]=\"sortState() === false ? 'none' : sortState()\" class=\"nat-default-sort\">\n                <svg aria-hidden=\"true\" class=\"nat-default-sort__svg\" focusable=\"false\" viewBox=\"0 0 12 14\">\n                  <path class=\"nat-default-sort__up\" d=\"M6 2 10 6 H2z\" />\n                  <path class=\"nat-default-sort__down\" d=\"M6 12 2 8 H10z\" />\n                </svg>\n              </span>\n            }\n          </span>\n          @if (sortPriority() !== null) {\n            <span aria-hidden=\"true\" class=\"sort-priority\">{{ sortPriority() }}</span>\n          }\n        </button>\n      } @else {\n        <span [class.sr-only]=\"hideLabel()\" class=\"header-label\">\n          @if (hideLabel()) {\n            {{ label() }}\n          } @else {\n            <ng-container *flexRender=\"content(); props: context(); let rendered\"> {{ rendered }} </ng-container>\n          }\n        </span>\n      }\n    </div>\n\n    @if (canShowMenu()) {\n      <div class=\"header-controls\">\n        <button\n          #menuOrigin\n          #menuTrigger=\"ngMenuTrigger\"\n          [attr.aria-label]=\"getMenuButtonLabel()\"\n          [attr.data-testid]=\"`nat-table-header-actions-menu-${column().id}`\"\n          [menu]=\"pinMenu()\"\n          class=\"menu-button\"\n          ngMenuTrigger\n          type=\"button\"\n          (pointerdown)=\"$event.stopPropagation()\">\n          <svg aria-hidden=\"true\" class=\"menu-button__icon\" focusable=\"false\" viewBox=\"0 0 14 14\">\n            <circle cx=\"7\" cy=\"2.25\" r=\"1.15\" />\n            <circle cx=\"7\" cy=\"7\" r=\"1.15\" />\n            <circle cx=\"7\" cy=\"11.75\" r=\"1.15\" />\n          </svg>\n        </button>\n\n        <ng-template\n          [cdkConnectedOverlay]=\"{ origin: menuOrigin, usePopover: 'inline' }\"\n          [cdkConnectedOverlayOpen]=\"menuTrigger.expanded()\"\n          [cdkConnectedOverlayPositions]=\"pinMenuPositions\"\n          cdkAttachPopoverAsChild\n          (attach)=\"onMenuOverlayAttach()\">\n          <!--\n            Activation is wired through the menu's itemSelected output, not per-item\n            (click): @angular/aria activates menu items on Enter/Space (and pointer\n            click) by emitting itemSelected with the item's value \u2014 it never fires a\n            DOM click on the item, so a (click)-only item is keyboard-dead.\n          -->\n          <div\n            #pinMenu=\"ngMenu\"\n            [attr.aria-label]=\"getMenuLabel()\"\n            class=\"column-menu\"\n            ngMenu\n            (itemSelected)=\"onMenuItemSelected($event)\">\n            <ng-template ngMenuContent>\n              @if (canPin()) {\n                @for (side of pinSides; track side) {\n                  <button\n                    [attr.aria-label]=\"getPinLabel(side)\"\n                    [attr.data-pin-side]=\"side\"\n                    [attr.data-testid]=\"`nat-table-header-pin-${side}-${column().id}`\"\n                    [class.is-active]=\"isPinned(side)\"\n                    [value]=\"`pin:${side}`\"\n                    class=\"column-menu-item\"\n                    ngMenuItem\n                    type=\"button\">\n                    <span [class.is-visible]=\"isPinned(side)\" aria-hidden=\"true\" class=\"column-menu-item__check\">\n                      <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 12 12\">\n                        <path d=\"M2 6.25 4.55 8.8 10 3.35\" />\n                      </svg>\n                    </span>\n                    <span class=\"column-menu-item__label\">{{ getPinText(side) }}</span>\n                    <span [attr.data-pin-side]=\"side\" aria-hidden=\"true\" class=\"column-menu-item__dock\">\n                      @if (side === 'left') {\n                        <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                          <path class=\"column-menu-item__dock-rail\" d=\"M3.25 4.25v9.5\" />\n                          <rect class=\"column-menu-item__dock-panel\" height=\"7.5\" rx=\"2\" width=\"8.5\" x=\"6.25\" y=\"5.25\" />\n                        </svg>\n                      } @else {\n                        <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                          <path class=\"column-menu-item__dock-rail\" d=\"M14.75 4.25v9.5\" />\n                          <rect class=\"column-menu-item__dock-panel\" height=\"7.5\" rx=\"2\" width=\"8.5\" x=\"3.25\" y=\"5.25\" />\n                        </svg>\n                      }\n                    </span>\n                  </button>\n                }\n              }\n              @if (hasColumnMoveActions()) {\n                @for (direction of moveDirections; track direction) {\n                  <button\n                    [attr.aria-label]=\"getMoveLabel(direction)\"\n                    [attr.data-move-direction]=\"direction\"\n                    [attr.data-testid]=\"`nat-table-header-move-${direction}-${column().id}`\"\n                    [disabled]=\"!canMoveColumn(direction)\"\n                    [value]=\"`move:${direction}`\"\n                    class=\"column-menu-item\"\n                    ngMenuItem\n                    type=\"button\">\n                    <span aria-hidden=\"true\" class=\"column-menu-item__check\"></span>\n                    <span class=\"column-menu-item__label\">{{ getMoveText(direction) }}</span>\n                    <span [attr.data-move-direction]=\"direction\" aria-hidden=\"true\" class=\"column-menu-item__move\">\n                      <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                        @if (direction === 'left') {\n                          <path d=\"M10.75 4.25 6 9l4.75 4.75\" />\n                          <path d=\"M6.5 9h7\" />\n                        } @else {\n                          <path d=\"M7.25 4.25 12 9l-4.75 4.75\" />\n                          <path d=\"M11.5 9h-7\" />\n                        }\n                      </svg>\n                    </span>\n                  </button>\n                }\n              }\n            </ng-template>\n          </div>\n        </ng-template>\n      </div>\n    }\n  </div>\n</div>\n", styles: [":host{display:block;inline-size:100%}.header-content{display:flex;inline-size:100%;max-width:100%}.header-actions-row{display:flex;flex-wrap:nowrap;gap:var(--nat-table-space-header-actions-gap, var(--sys-nat-table-space-header-actions-gap, 12px));align-items:center;justify-content:space-between;inline-size:100%;min-width:0}.header-leading{display:flex;flex:1 1 auto;align-items:center;min-width:0}.header-content.is-align-end .header-leading{justify-content:flex-end}.header-controls{display:inline-flex;flex:0 0 auto;flex-wrap:nowrap;gap:var(--nat-table-space-header-controls-gap, var(--sys-nat-table-space-header-controls-gap, 6px));align-items:center}.header-label{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.header-content.is-align-end .header-label{text-align:right}.header-label.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}.menu-button{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;inline-size:1.9rem;block-size:1.9rem;padding:0;color:color-mix(in srgb,currentcolor 54%,transparent);cursor:pointer;background:transparent;border:0;border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax))}.sort-button,.menu-button{transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.sort-button{display:inline-flex;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px));align-items:center;min-width:0;max-width:100%;padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;background:none;border:0}.sort-button .header-label{flex:1 1 auto}.sort-button.is-sorted{color:var(--nat-table-sort-button-color-sorted, var(--sys-nat-table-sort-button-color-sorted, inherit))}.menu-button[aria-expanded=true]{color:inherit;background:color-mix(in srgb,currentcolor 8%,transparent);transform:translateY(-1px)}@media(hover:hover)and (pointer:fine){.menu-button:hover{color:inherit;background:color-mix(in srgb,currentcolor 8%,transparent)}}.sort-button:focus-visible,.menu-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.sort-icon{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;min-width:var(--nat-table-sort-icon-min-width, var(--sys-nat-table-sort-icon-min-width, 1.05rem));line-height:0}.sort-priority{display:inline-flex;align-items:center;justify-content:center;min-inline-size:1rem;block-size:1rem;padding:0 .25rem;margin-inline-start:.25rem;font-size:.66rem;font-weight:700;line-height:1;color:var(--nat-table-sort-priority-color, var(--sys-nat-table-sort-priority-color, inherit));background:var(--nat-table-sort-icon-chip-background-active, var(--sys-nat-table-sort-icon-chip-background-active, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax))}.menu-button__icon{display:block;inline-size:.9rem;block-size:.9rem;fill:currentcolor}.nat-default-sort{display:inline-flex;align-items:center;justify-content:center;padding:var(--nat-table-sort-icon-chip-padding, var(--sys-nat-table-sort-icon-chip-padding, 2px 3px));line-height:0;background:var(--nat-table-sort-icon-chip-background, var(--sys-nat-table-sort-icon-chip-background, transparent));border-radius:var(--nat-table-sort-icon-chip-radius, var(--sys-nat-table-sort-icon-chip-radius, 6px));transition:background-color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),box-shadow var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.nat-default-sort[data-sort-state=asc],.nat-default-sort[data-sort-state=desc]{background:var( --nat-table-sort-icon-chip-background-active, var( --sys-nat-table-sort-icon-chip-background-active, color-mix(in srgb, var(--nat-table-sort-icon-color, var(--sys-nat-table-sort-icon-color, currentColor)) 14%, transparent) ) )}.nat-default-sort__svg{display:block;flex-shrink:0;width:var(--nat-table-sort-icon-svg-width, var(--sys-nat-table-sort-icon-svg-width, 10px));height:var(--nat-table-sort-icon-svg-height, var(--sys-nat-table-sort-icon-svg-height, 12px));overflow:visible}.nat-default-sort__up,.nat-default-sort__down{fill:var( --nat-table-sort-icon-color-idle, var(--sys-nat-table-sort-icon-color-idle, color-mix(in srgb, currentColor 45%, transparent)) );stroke:none;transform-origin:center;transition:fill var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),opacity var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.nat-default-sort[data-sort-state=asc] .nat-default-sort__up,.nat-default-sort[data-sort-state=desc] .nat-default-sort__down{fill:var( --nat-table-sort-icon-color-active, var(--sys-nat-table-sort-icon-color-active, var(--nat-table-sort-icon-color, var(--sys-nat-table-sort-icon-color, currentColor))) );transform:scale(1.05)}.nat-default-sort[data-sort-state=asc] .nat-default-sort__down,.nat-default-sort[data-sort-state=desc] .nat-default-sort__up{opacity:var(--nat-table-sort-icon-muted-opacity, var(--sys-nat-table-sort-icon-muted-opacity, .75));fill:var( --nat-table-sort-icon-color-muted, var(--sys-nat-table-sort-icon-color-muted, color-mix(in srgb, currentColor 22%, transparent)) )}.sort-button[disabled] .nat-default-sort__up,.sort-button[disabled] .nat-default-sort__down{opacity:1;fill:var( --nat-table-sort-icon-color-disabled, var(--sys-nat-table-sort-icon-color-disabled, color-mix(in srgb, currentColor 22%, transparent)) );transform:none}.column-menu{display:grid;gap:2px;min-width:12rem;padding:6px;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:linear-gradient(180deg,color-mix(in srgb,var(--nat-table-region-background, var(--sys-nat-table-region-background, canvas)) 96%,currentcolor 4%),color-mix(in srgb,var(--nat-table-region-background, var(--sys-nat-table-region-background, canvas)) 90%,currentcolor 10%));border:1px solid color-mix(in srgb,currentcolor 12%,transparent);border-radius:14px;box-shadow:0 18px 48px color-mix(in srgb,black 28%,transparent),0 2px 8px color-mix(in srgb,black 12%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);animation:header-menu-enter .14s ease-out}.column-menu-item{display:grid;grid-template-columns:16px minmax(0,1fr) 18px;gap:10px;align-items:center;min-height:2.25rem;padding:0 10px;font:inherit;color:inherit;text-align:left;cursor:pointer;background:transparent;border:0;border-radius:10px;transition:background-color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.column-menu-item[data-active=true]:not([disabled]),.column-menu-item:focus-visible:not([disabled]){outline:none;background:color-mix(in srgb,currentcolor 10%,transparent)}@media(hover:hover)and (pointer:fine){.sort-button:hover:not([disabled]) .nat-default-sort{background:var( --nat-table-sort-icon-chip-background-hover, var(--sys-nat-table-sort-icon-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) )}.sort-button:hover:not([disabled]) .nat-default-sort[data-sort-state=none] .nat-default-sort__up,.sort-button:hover:not([disabled]) .nat-default-sort[data-sort-state=none] .nat-default-sort__down{fill:var( --nat-table-sort-icon-color-hover, var(--sys-nat-table-sort-icon-color-hover, color-mix(in srgb, currentColor 78%, transparent)) )}.column-menu-item:hover:not([disabled]){outline:none;background:color-mix(in srgb,currentcolor 10%,transparent)}}.column-menu-item:focus-visible:not([disabled]){box-shadow:inset 0 0 0 1px color-mix(in srgb,currentcolor 22%,transparent)}@media(forced-colors:active){.column-menu-item:focus-visible:not([disabled]){outline:2px solid Highlight;outline-offset:-2px}}.column-menu-item.is-active{color:var(--nat-table-pin-color-pinned, var(--sys-nat-table-pin-color-pinned, inherit));background:color-mix(in srgb,var(--nat-table-pin-color-pinned, var(--sys-nat-table-pin-color-pinned, currentColor)) 12%,transparent)}.column-menu-item[disabled]{cursor:not-allowed;opacity:.48}.column-menu-item__check{color:currentcolor;opacity:0;transform:scale(.75);transition:opacity var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.column-menu-item__check.is-visible{opacity:1;transform:scale(1)}.column-menu-item__check svg,.column-menu-item__dock svg,.column-menu-item__move svg{display:block;overflow:visible;fill:none}.column-menu-item__check svg{inline-size:.75rem;block-size:.75rem}.column-menu-item__check path{stroke:currentcolor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.column-menu-item__label{min-width:0;white-space:nowrap}.column-menu-item__dock{color:color-mix(in srgb,currentcolor 50%,transparent)}.column-menu-item__move{color:color-mix(in srgb,currentcolor 58%,transparent)}.column-menu-item.is-active .column-menu-item__dock{color:currentcolor}.column-menu-item__dock svg,.column-menu-item__move svg{inline-size:1rem;block-size:1rem}.column-menu-item__dock-rail,.column-menu-item__dock-panel{vector-effect:non-scaling-stroke}.column-menu-item__dock-rail{opacity:.42;stroke:currentcolor;stroke-width:1.5;stroke-linecap:round}.column-menu-item__dock-panel{opacity:.84;stroke:currentcolor;stroke-width:1.5}.column-menu-item__move path{stroke:currentcolor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}@keyframes header-menu-enter{0%{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}\n"], dependencies: [{ kind: "directive", type: FlexRender, selector: "[flexRender]", inputs: ["flexRender", "flexRenderProps", "flexRenderInjector"] }, { kind: "directive", type: Menu, selector: "[ngMenu]", inputs: ["id", "wrap", "typeaheadDelay", "disabled", "softDisabled", "expansionDelay"], outputs: ["itemSelected"], exportAs: ["ngMenu"] }, { kind: "directive", type: MenuContent, selector: "ng-template[ngMenuContent]", exportAs: ["ngMenuContent"] }, { kind: "directive", type: MenuItem, selector: "[ngMenuItem]", inputs: ["id", "value", "disabled", "searchTerm", "role", "submenu"], outputs: ["searchTermChange"], exportAs: ["ngMenuItem"] }, { kind: "directive", type: MenuTrigger, selector: "[ngMenuTrigger]", inputs: ["menu", "disabled", "softDisabled"], exportAs: ["ngMenuTrigger"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i1$1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation", "cdkConnectedOverlayUsePopover", "cdkConnectedOverlayMatchWidth", "cdkConnectedOverlay"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderActions, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-header-actions', imports: [FlexRender, Menu, MenuContent, MenuItem, MenuTrigger, OverlayModule], template: "<!--\n  Deliberately NOT an ngGridCellWidget: the header cell never registers a widget\n  (GridCell's content query cannot see into this flexRender-created view), yet the\n  widget directive still self-assigns tabindex=\"0\" while its cell is active \u2014 a\n  focus stop between the cell and its controls that swallows Tab. The header\n  keyboard model (Enter into controls, Tab between them, Escape back) is owned by\n  the table's cell-interaction layer instead.\n-->\n<div [class.is-align-end]=\"isAlignedEnd()\" class=\"header-content\">\n  <div class=\"header-actions-row\">\n    <div class=\"header-leading\">\n      @if (canSort()) {\n        <button\n          [attr.aria-label]=\"getSortLabel()\"\n          [class.is-sorted]=\"!!sortState()\"\n          class=\"sort-button\"\n          type=\"button\"\n          (click)=\"onSortClick($event)\"\n          (pointerdown)=\"$event.stopPropagation()\">\n          <span [class.sr-only]=\"hideLabel()\" class=\"header-label\">\n            @if (hideLabel()) {\n              {{ label() }}\n            } @else {\n              <ng-container *flexRender=\"content(); props: context(); let rendered\"> {{ rendered }} </ng-container>\n            }\n          </span>\n          <span aria-hidden=\"true\" class=\"sort-icon\">\n            @if (hasCustomSortIndicator()) {\n              <ng-container *flexRender=\"sortIndicator(); props: sortIndicatorContext(); let rendered\"> {{ rendered }} </ng-container>\n            } @else {\n              <span [attr.data-sort-state]=\"sortState() === false ? 'none' : sortState()\" class=\"nat-default-sort\">\n                <svg aria-hidden=\"true\" class=\"nat-default-sort__svg\" focusable=\"false\" viewBox=\"0 0 12 14\">\n                  <path class=\"nat-default-sort__up\" d=\"M6 2 10 6 H2z\" />\n                  <path class=\"nat-default-sort__down\" d=\"M6 12 2 8 H10z\" />\n                </svg>\n              </span>\n            }\n          </span>\n          @if (sortPriority() !== null) {\n            <span aria-hidden=\"true\" class=\"sort-priority\">{{ sortPriority() }}</span>\n          }\n        </button>\n      } @else {\n        <span [class.sr-only]=\"hideLabel()\" class=\"header-label\">\n          @if (hideLabel()) {\n            {{ label() }}\n          } @else {\n            <ng-container *flexRender=\"content(); props: context(); let rendered\"> {{ rendered }} </ng-container>\n          }\n        </span>\n      }\n    </div>\n\n    @if (canShowMenu()) {\n      <div class=\"header-controls\">\n        <button\n          #menuOrigin\n          #menuTrigger=\"ngMenuTrigger\"\n          [attr.aria-label]=\"getMenuButtonLabel()\"\n          [attr.data-testid]=\"`nat-table-header-actions-menu-${column().id}`\"\n          [menu]=\"pinMenu()\"\n          class=\"menu-button\"\n          ngMenuTrigger\n          type=\"button\"\n          (pointerdown)=\"$event.stopPropagation()\">\n          <svg aria-hidden=\"true\" class=\"menu-button__icon\" focusable=\"false\" viewBox=\"0 0 14 14\">\n            <circle cx=\"7\" cy=\"2.25\" r=\"1.15\" />\n            <circle cx=\"7\" cy=\"7\" r=\"1.15\" />\n            <circle cx=\"7\" cy=\"11.75\" r=\"1.15\" />\n          </svg>\n        </button>\n\n        <ng-template\n          [cdkConnectedOverlay]=\"{ origin: menuOrigin, usePopover: 'inline' }\"\n          [cdkConnectedOverlayOpen]=\"menuTrigger.expanded()\"\n          [cdkConnectedOverlayPositions]=\"pinMenuPositions\"\n          cdkAttachPopoverAsChild\n          (attach)=\"onMenuOverlayAttach()\">\n          <!--\n            Activation is wired through the menu's itemSelected output, not per-item\n            (click): @angular/aria activates menu items on Enter/Space (and pointer\n            click) by emitting itemSelected with the item's value \u2014 it never fires a\n            DOM click on the item, so a (click)-only item is keyboard-dead.\n          -->\n          <div\n            #pinMenu=\"ngMenu\"\n            [attr.aria-label]=\"getMenuLabel()\"\n            class=\"column-menu\"\n            ngMenu\n            (itemSelected)=\"onMenuItemSelected($event)\">\n            <ng-template ngMenuContent>\n              @if (canPin()) {\n                @for (side of pinSides; track side) {\n                  <button\n                    [attr.aria-label]=\"getPinLabel(side)\"\n                    [attr.data-pin-side]=\"side\"\n                    [attr.data-testid]=\"`nat-table-header-pin-${side}-${column().id}`\"\n                    [class.is-active]=\"isPinned(side)\"\n                    [value]=\"`pin:${side}`\"\n                    class=\"column-menu-item\"\n                    ngMenuItem\n                    type=\"button\">\n                    <span [class.is-visible]=\"isPinned(side)\" aria-hidden=\"true\" class=\"column-menu-item__check\">\n                      <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 12 12\">\n                        <path d=\"M2 6.25 4.55 8.8 10 3.35\" />\n                      </svg>\n                    </span>\n                    <span class=\"column-menu-item__label\">{{ getPinText(side) }}</span>\n                    <span [attr.data-pin-side]=\"side\" aria-hidden=\"true\" class=\"column-menu-item__dock\">\n                      @if (side === 'left') {\n                        <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                          <path class=\"column-menu-item__dock-rail\" d=\"M3.25 4.25v9.5\" />\n                          <rect class=\"column-menu-item__dock-panel\" height=\"7.5\" rx=\"2\" width=\"8.5\" x=\"6.25\" y=\"5.25\" />\n                        </svg>\n                      } @else {\n                        <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                          <path class=\"column-menu-item__dock-rail\" d=\"M14.75 4.25v9.5\" />\n                          <rect class=\"column-menu-item__dock-panel\" height=\"7.5\" rx=\"2\" width=\"8.5\" x=\"3.25\" y=\"5.25\" />\n                        </svg>\n                      }\n                    </span>\n                  </button>\n                }\n              }\n              @if (hasColumnMoveActions()) {\n                @for (direction of moveDirections; track direction) {\n                  <button\n                    [attr.aria-label]=\"getMoveLabel(direction)\"\n                    [attr.data-move-direction]=\"direction\"\n                    [attr.data-testid]=\"`nat-table-header-move-${direction}-${column().id}`\"\n                    [disabled]=\"!canMoveColumn(direction)\"\n                    [value]=\"`move:${direction}`\"\n                    class=\"column-menu-item\"\n                    ngMenuItem\n                    type=\"button\">\n                    <span aria-hidden=\"true\" class=\"column-menu-item__check\"></span>\n                    <span class=\"column-menu-item__label\">{{ getMoveText(direction) }}</span>\n                    <span [attr.data-move-direction]=\"direction\" aria-hidden=\"true\" class=\"column-menu-item__move\">\n                      <svg aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 18 18\">\n                        @if (direction === 'left') {\n                          <path d=\"M10.75 4.25 6 9l4.75 4.75\" />\n                          <path d=\"M6.5 9h7\" />\n                        } @else {\n                          <path d=\"M7.25 4.25 12 9l-4.75 4.75\" />\n                          <path d=\"M11.5 9h-7\" />\n                        }\n                      </svg>\n                    </span>\n                  </button>\n                }\n              }\n            </ng-template>\n          </div>\n        </ng-template>\n      </div>\n    }\n  </div>\n</div>\n", styles: [":host{display:block;inline-size:100%}.header-content{display:flex;inline-size:100%;max-width:100%}.header-actions-row{display:flex;flex-wrap:nowrap;gap:var(--nat-table-space-header-actions-gap, var(--sys-nat-table-space-header-actions-gap, 12px));align-items:center;justify-content:space-between;inline-size:100%;min-width:0}.header-leading{display:flex;flex:1 1 auto;align-items:center;min-width:0}.header-content.is-align-end .header-leading{justify-content:flex-end}.header-controls{display:inline-flex;flex:0 0 auto;flex-wrap:nowrap;gap:var(--nat-table-space-header-controls-gap, var(--sys-nat-table-space-header-controls-gap, 6px));align-items:center}.header-label{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.header-content.is-align-end .header-label{text-align:right}.header-label.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}.menu-button{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;inline-size:1.9rem;block-size:1.9rem;padding:0;color:color-mix(in srgb,currentcolor 54%,transparent);cursor:pointer;background:transparent;border:0;border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax))}.sort-button,.menu-button{transition:background-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),border-color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),box-shadow var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),transform var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease)),color var(--nat-table-transition-medium, var(--sys-nat-table-transition-medium, .18s ease))}.sort-button{display:inline-flex;gap:var(--nat-table-space-chip-row-gap, var(--sys-nat-table-space-chip-row-gap, 10px));align-items:center;min-width:0;max-width:100%;padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer;background:none;border:0}.sort-button .header-label{flex:1 1 auto}.sort-button.is-sorted{color:var(--nat-table-sort-button-color-sorted, var(--sys-nat-table-sort-button-color-sorted, inherit))}.menu-button[aria-expanded=true]{color:inherit;background:color-mix(in srgb,currentcolor 8%,transparent);transform:translateY(-1px)}@media(hover:hover)and (pointer:fine){.menu-button:hover{color:inherit;background:color-mix(in srgb,currentcolor 8%,transparent)}}.sort-button:focus-visible,.menu-button:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}.sort-icon{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;min-width:var(--nat-table-sort-icon-min-width, var(--sys-nat-table-sort-icon-min-width, 1.05rem));line-height:0}.sort-priority{display:inline-flex;align-items:center;justify-content:center;min-inline-size:1rem;block-size:1rem;padding:0 .25rem;margin-inline-start:.25rem;font-size:.66rem;font-weight:700;line-height:1;color:var(--nat-table-sort-priority-color, var(--sys-nat-table-sort-priority-color, inherit));background:var(--nat-table-sort-icon-chip-background-active, var(--sys-nat-table-sort-icon-chip-background-active, transparent));border-radius:var(--nat-table-radius-chip, var(--sys-nat-table-radius-chip, 100vmax))}.menu-button__icon{display:block;inline-size:.9rem;block-size:.9rem;fill:currentcolor}.nat-default-sort{display:inline-flex;align-items:center;justify-content:center;padding:var(--nat-table-sort-icon-chip-padding, var(--sys-nat-table-sort-icon-chip-padding, 2px 3px));line-height:0;background:var(--nat-table-sort-icon-chip-background, var(--sys-nat-table-sort-icon-chip-background, transparent));border-radius:var(--nat-table-sort-icon-chip-radius, var(--sys-nat-table-sort-icon-chip-radius, 6px));transition:background-color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),box-shadow var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.nat-default-sort[data-sort-state=asc],.nat-default-sort[data-sort-state=desc]{background:var( --nat-table-sort-icon-chip-background-active, var( --sys-nat-table-sort-icon-chip-background-active, color-mix(in srgb, var(--nat-table-sort-icon-color, var(--sys-nat-table-sort-icon-color, currentColor)) 14%, transparent) ) )}.nat-default-sort__svg{display:block;flex-shrink:0;width:var(--nat-table-sort-icon-svg-width, var(--sys-nat-table-sort-icon-svg-width, 10px));height:var(--nat-table-sort-icon-svg-height, var(--sys-nat-table-sort-icon-svg-height, 12px));overflow:visible}.nat-default-sort__up,.nat-default-sort__down{fill:var( --nat-table-sort-icon-color-idle, var(--sys-nat-table-sort-icon-color-idle, color-mix(in srgb, currentColor 45%, transparent)) );stroke:none;transform-origin:center;transition:fill var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),opacity var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.nat-default-sort[data-sort-state=asc] .nat-default-sort__up,.nat-default-sort[data-sort-state=desc] .nat-default-sort__down{fill:var( --nat-table-sort-icon-color-active, var(--sys-nat-table-sort-icon-color-active, var(--nat-table-sort-icon-color, var(--sys-nat-table-sort-icon-color, currentColor))) );transform:scale(1.05)}.nat-default-sort[data-sort-state=asc] .nat-default-sort__down,.nat-default-sort[data-sort-state=desc] .nat-default-sort__up{opacity:var(--nat-table-sort-icon-muted-opacity, var(--sys-nat-table-sort-icon-muted-opacity, .75));fill:var( --nat-table-sort-icon-color-muted, var(--sys-nat-table-sort-icon-color-muted, color-mix(in srgb, currentColor 22%, transparent)) )}.sort-button[disabled] .nat-default-sort__up,.sort-button[disabled] .nat-default-sort__down{opacity:1;fill:var( --nat-table-sort-icon-color-disabled, var(--sys-nat-table-sort-icon-color-disabled, color-mix(in srgb, currentColor 22%, transparent)) );transform:none}.column-menu{display:grid;gap:2px;min-width:12rem;padding:6px;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:linear-gradient(180deg,color-mix(in srgb,var(--nat-table-region-background, var(--sys-nat-table-region-background, canvas)) 96%,currentcolor 4%),color-mix(in srgb,var(--nat-table-region-background, var(--sys-nat-table-region-background, canvas)) 90%,currentcolor 10%));border:1px solid color-mix(in srgb,currentcolor 12%,transparent);border-radius:14px;box-shadow:0 18px 48px color-mix(in srgb,black 28%,transparent),0 2px 8px color-mix(in srgb,black 12%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);animation:header-menu-enter .14s ease-out}.column-menu-item{display:grid;grid-template-columns:16px minmax(0,1fr) 18px;gap:10px;align-items:center;min-height:2.25rem;padding:0 10px;font:inherit;color:inherit;text-align:left;cursor:pointer;background:transparent;border:0;border-radius:10px;transition:background-color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),color var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.column-menu-item[data-active=true]:not([disabled]),.column-menu-item:focus-visible:not([disabled]){outline:none;background:color-mix(in srgb,currentcolor 10%,transparent)}@media(hover:hover)and (pointer:fine){.sort-button:hover:not([disabled]) .nat-default-sort{background:var( --nat-table-sort-icon-chip-background-hover, var(--sys-nat-table-sort-icon-chip-background-hover, color-mix(in srgb, currentColor 8%, transparent)) )}.sort-button:hover:not([disabled]) .nat-default-sort[data-sort-state=none] .nat-default-sort__up,.sort-button:hover:not([disabled]) .nat-default-sort[data-sort-state=none] .nat-default-sort__down{fill:var( --nat-table-sort-icon-color-hover, var(--sys-nat-table-sort-icon-color-hover, color-mix(in srgb, currentColor 78%, transparent)) )}.column-menu-item:hover:not([disabled]){outline:none;background:color-mix(in srgb,currentcolor 10%,transparent)}}.column-menu-item:focus-visible:not([disabled]){box-shadow:inset 0 0 0 1px color-mix(in srgb,currentcolor 22%,transparent)}@media(forced-colors:active){.column-menu-item:focus-visible:not([disabled]){outline:2px solid Highlight;outline-offset:-2px}}.column-menu-item.is-active{color:var(--nat-table-pin-color-pinned, var(--sys-nat-table-pin-color-pinned, inherit));background:color-mix(in srgb,var(--nat-table-pin-color-pinned, var(--sys-nat-table-pin-color-pinned, currentColor)) 12%,transparent)}.column-menu-item[disabled]{cursor:not-allowed;opacity:.48}.column-menu-item__check{color:currentcolor;opacity:0;transform:scale(.75);transition:opacity var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease)),transform var(--nat-table-transition-fast, var(--sys-nat-table-transition-fast, .12s ease))}.column-menu-item__check.is-visible{opacity:1;transform:scale(1)}.column-menu-item__check svg,.column-menu-item__dock svg,.column-menu-item__move svg{display:block;overflow:visible;fill:none}.column-menu-item__check svg{inline-size:.75rem;block-size:.75rem}.column-menu-item__check path{stroke:currentcolor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.column-menu-item__label{min-width:0;white-space:nowrap}.column-menu-item__dock{color:color-mix(in srgb,currentcolor 50%,transparent)}.column-menu-item__move{color:color-mix(in srgb,currentcolor 58%,transparent)}.column-menu-item.is-active .column-menu-item__dock{color:currentcolor}.column-menu-item__dock svg,.column-menu-item__move svg{inline-size:1rem;block-size:1rem}.column-menu-item__dock-rail,.column-menu-item__dock-panel{vector-effect:non-scaling-stroke}.column-menu-item__dock-rail{opacity:.42;stroke:currentcolor;stroke-width:1.5;stroke-linecap:round}.column-menu-item__dock-panel{opacity:.84;stroke:currentcolor;stroke-width:1.5}.column-menu-item__move path{stroke:currentcolor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}@keyframes header-menu-enter{0%{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}\n"] }]
        }], propDecorators: { pinMenu: [{ type: i0.ViewChild, args: ['pinMenu', { isSignal: true }] }], menuOrigin: [{ type: i0.ViewChild, args: ['menuOrigin', { isSignal: true }] }], menuTriggerRef: [{ type: i0.ViewChild, args: ['menuTrigger', { isSignal: true }] }], context: [{ type: i0.Input, args: [{ isSignal: true, alias: "context", required: true }] }], content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], hideLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "hideLabel", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], sortIndicator: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortIndicator", required: false }] }], accessibilityLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibilityLabels", required: false }] }], enableSortActions: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableSortActions", required: false }] }], enableColumnPinActions: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableColumnPinActions", required: false }] }], enableColumnReorderActions: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableColumnReorderActions", required: false }] }] } });

const NAT_TABLE_HEADER_ACTIONS_CONTENT = Symbol('NatTableHeaderActionsContent');
const resolveColumnId = (column) => {
    if (column.id) {
        return column.id;
    }
    const accessorKey = column.accessorKey;
    return typeof accessorKey === 'string' ? accessorKey : 'column';
};
const isNatTableHeaderActionsRenderer = (header) => typeof header === 'function' && NAT_TABLE_HEADER_ACTIONS_CONTENT in header;
const resolveOriginalHeader = (column) => {
    const header = column.header;
    if (isNatTableHeaderActionsRenderer(header)) {
        return header[NAT_TABLE_HEADER_ACTIONS_CONTENT];
    }
    return header;
};
const mergeAccessibilityLabels = (globalLabels, columnLabels) => {
    if (!globalLabels) {
        return columnLabels;
    }
    if (!columnLabels) {
        return globalLabels;
    }
    return {
        ...globalLabels,
        ...columnLabels
    };
};
const resolveBooleanOption = (columnValue, helperValue, fallback) => columnValue ?? helperValue ?? fallback;
const resolveHeaderActionsOptions = (column, options) => {
    const columnOptions = column.meta?.headerActions;
    if (columnOptions === false) {
        return false;
    }
    return {
        sortIndicator: columnOptions?.sortIndicator ?? options.sortIndicator,
        locale: options.locale,
        enableSortActions: resolveBooleanOption(columnOptions?.enableSortActions, options.enableSortActions, true),
        enableColumnPinActions: resolveBooleanOption(columnOptions?.enableColumnPinActions, options.enableColumnPinActions, true),
        enableColumnReorderActions: resolveBooleanOption(columnOptions?.enableColumnReorderActions, options.enableColumnReorderActions, false),
        accessibilityLabels: mergeAccessibilityLabels(options.accessibilityLabels, columnOptions?.accessibilityLabels)
    };
};
const resolveTableLocale = (context) => {
    const tableMeta = context.table.options.meta;
    return typeof tableMeta?.natTableLocaleId === 'string' ? tableMeta.natTableLocaleId : undefined;
};
const resolveHeaderActionLabel = (context, content, fallbackId) => {
    const label = resolveNatTableColumnLabel(context.column.columnDef, context.column.id);
    if (label !== context.column.id || typeof content !== 'string') {
        return label;
    }
    const columnDef = {
        ...context.column.columnDef,
        header: content
    };
    return resolveNatTableColumnLabel(columnDef, fallbackId);
};
const flexRenderOriginalHeader = (content, context) => {
    if (typeof content !== 'function') {
        return content;
    }
    return content(context);
};
const wrapColumnHeader = (column, options) => {
    const nextColumn = {
        ...column
    };
    if (nextColumn.columns) {
        nextColumn.columns = nextColumn.columns.map((child) => wrapColumnHeader(child, options));
    }
    const fallbackId = resolveColumnId(nextColumn);
    const originalHeader = resolveOriginalHeader(nextColumn);
    const fallbackContent = originalHeader ?? resolveNatTableColumnLabel(nextColumn, fallbackId);
    if (nextColumn.meta?.headerActions === false) {
        const optedOutColumn = {
            ...nextColumn,
            header: fallbackContent
        };
        return optedOutColumn;
    }
    const header = ((context) => {
        const actionOptions = resolveHeaderActionsOptions(context.column.columnDef, options);
        if (actionOptions === false) {
            return flexRenderOriginalHeader(fallbackContent, context);
        }
        return flexRenderComponent(NatTableHeaderActions, {
            inputs: {
                context: context,
                content: fallbackContent,
                label: resolveHeaderActionLabel(context, fallbackContent, fallbackId),
                hideLabel: !!context.column.columnDef.meta?.hiddenHeaderLabel?.trim(),
                locale: actionOptions.locale ?? resolveTableLocale(context),
                accessibilityLabels: actionOptions.accessibilityLabels,
                sortIndicator: actionOptions.sortIndicator,
                enableSortActions: actionOptions.enableSortActions,
                enableColumnPinActions: actionOptions.enableColumnPinActions,
                enableColumnReorderActions: actionOptions.enableColumnReorderActions
            }
        });
    });
    header[NAT_TABLE_HEADER_ACTIONS_CONTENT] = fallbackContent;
    const wrappedColumn = {
        ...nextColumn,
        header
    };
    return wrappedColumn;
};
/**
 * Wraps column headers with the shared sort and column action UI from
 * `ng-advanced-table/components`.
 *
 * The helper preserves the original header content, applies the wrapper
 * recursively to grouped columns, and optionally injects custom sort-indicator
 * content through `options.sortIndicator`. Use this composable instead of
 * adding extra header rows or replacing the table header DOM when the design
 * only needs custom sort icons or badges.
 *
 * Applying the helper repeatedly is safe. Wrapped headers are unwrapped before
 * the next wrapper is installed, so reactive column builders can compose this
 * helper with other column helpers without nesting the generated controls.
 *
 * Set `column.meta.headerActions` to `false` to opt a column out, or provide an
 * object to override `sortIndicator`, `enableSortActions`, `enableColumnPinActions`,
 * `enableColumnReorderActions`, or `accessibilityLabels` for that column.
 *
 * For Angular sort indicator components, return `flexRenderComponent(...)`
 * from `sortIndicator`; the generated sort button keeps ownership of sorting,
 * focus, keyboard, accessible-name, multi-sort, and `aria-sort` behavior.
 *
 * Set `enableSortActions: false` to remove the sort button/indicator for wrapped
 * columns while keeping programmatic sorting (`NatTable.patchState({ sorting })`, or
 * `natTable.table.setSorting(...)` on the underlying TanStack instance) and columnDef-level
 * `enableSorting` working. To toggle this reactively (e.g. per breakpoint), rebuild the
 * columns inside a `computed()` keyed on the breakpoint signal rather than mutating the
 * wrapped columns in place.
 */
const withNatTableHeaderActions = (columns, options = {}) => columns.map((column) => wrapColumnHeader(column, options));

/**
 * Accessible selection checkbox rendered by {@link withNatTableSelectionColumn}.
 *
 * In `'all'` mode it reflects and toggles the whole current row model (with an
 * indeterminate state for partial selection); in `'row'` mode it reflects and
 * toggles a single row. Generated labels resolve from the active UI locale
 * unless explicit overrides are provided.
 */
class NatTableSelectionCheckbox {
    tableUiIntlConfig = inject(NAT_TABLE_CONTROLS_INTL);
    mode = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    table = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "table" }] : /* istanbul ignore next */ []));
    row = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "row" }] : /* istanbul ignore next */ []));
    /** Explicit `aria-label` override; falls back to the active UI locale. */
    ariaLabel = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    /** Explicit column label override; falls back to the active UI locale. */
    label = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    checked() {
        return this.mode() === 'all' ? this.table().getIsAllRowsSelected() : (this.row()?.getIsSelected() ?? false);
    }
    indeterminate() {
        if (this.mode() !== 'all')
            return false;
        const table = this.table();
        return table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
    }
    isSingleSelectHeader() {
        return this.mode() === 'all' && this.table().options.enableMultiRowSelection === false;
    }
    resolvedColumnLabel() {
        const explicit = this.label().trim();
        if (explicit)
            return explicit;
        return this.tableUiIntl().selection?.columnLabel ?? '';
    }
    resolvedAriaLabel() {
        const explicit = this.ariaLabel().trim();
        if (explicit)
            return explicit;
        const labels = this.tableUiIntl().selection?.accessibilityLabels ?? {};
        if (this.mode() === 'all') {
            return labels.selectAllAriaLabel ?? '';
        }
        return labels.selectRowAriaLabel?.({ rowId: this.row()?.id ?? '' }) ?? '';
    }
    onChange(event) {
        const handler = this.mode() === 'all' ? this.table().getToggleAllRowsSelectedHandler() : this.row()?.getToggleSelectedHandler();
        handler?.(event);
    }
    tableUiIntl() {
        return resolveNatTableControlsIntl(this.tableUiIntlConfig, this.localeId());
    }
    localeId() {
        const tableMeta = this.table().options.meta;
        return typeof tableMeta?.natTableLocaleId === 'string' ? tableMeta.natTableLocaleId : NAT_EN_LOCALE_ID;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSelectionCheckbox, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTableSelectionCheckbox, isStandalone: true, selector: "nat-table-selection-checkbox", inputs: { mode: { classPropertyName: "mode", publicName: "mode", isSignal: true, isRequired: true, transformFunction: null }, table: { classPropertyName: "table", publicName: "table", isSignal: true, isRequired: true, transformFunction: null }, row: { classPropertyName: "row", publicName: "row", isSignal: true, isRequired: false, transformFunction: null }, ariaLabel: { classPropertyName: "ariaLabel", publicName: "ariaLabel", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (isSingleSelectHeader()) {\n  <!-- Select-all only makes sense in multi-select mode. In single mode the\n       toggle-all handler is a no-op (or selects all then collapses to one),\n       so render the plain column label instead of a dead checkbox. -->\n  {{ resolvedColumnLabel() }}\n} @else {\n  <input\n    [attr.aria-label]=\"resolvedAriaLabel()\"\n    [checked]=\"checked()\"\n    [indeterminate]=\"indeterminate()\"\n    class=\"nat-selection-checkbox\"\n    type=\"checkbox\"\n    (change)=\"onChange($event)\"\n    (click)=\"$event.stopPropagation()\" />\n}\n", styles: [":host{display:inline-flex;align-items:center;justify-content:center}.nat-selection-checkbox{inline-size:var(--nat-table-selection-size, var(--sys-nat-table-selection-size, 18px));block-size:var(--nat-table-selection-size, var(--sys-nat-table-selection-size, 18px));accent-color:var( --nat-table-selection-accent, var(--sys-nat-table-selection-accent, var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor))) );cursor:pointer}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSelectionCheckbox, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-selection-checkbox', template: "@if (isSingleSelectHeader()) {\n  <!-- Select-all only makes sense in multi-select mode. In single mode the\n       toggle-all handler is a no-op (or selects all then collapses to one),\n       so render the plain column label instead of a dead checkbox. -->\n  {{ resolvedColumnLabel() }}\n} @else {\n  <input\n    [attr.aria-label]=\"resolvedAriaLabel()\"\n    [checked]=\"checked()\"\n    [indeterminate]=\"indeterminate()\"\n    class=\"nat-selection-checkbox\"\n    type=\"checkbox\"\n    (change)=\"onChange($event)\"\n    (click)=\"$event.stopPropagation()\" />\n}\n", styles: [":host{display:inline-flex;align-items:center;justify-content:center}.nat-selection-checkbox{inline-size:var(--nat-table-selection-size, var(--sys-nat-table-selection-size, 18px));block-size:var(--nat-table-selection-size, var(--sys-nat-table-selection-size, 18px));accent-color:var( --nat-table-selection-accent, var(--sys-nat-table-selection-accent, var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor))) );cursor:pointer}\n"] }]
        }], propDecorators: { mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: true }] }], table: [{ type: i0.Input, args: [{ isSignal: true, alias: "table", required: true }] }], row: [{ type: i0.Input, args: [{ isSignal: true, alias: "row", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/** Default id for the generated selection column. */
const SELECTION_COLUMN_ID = '__natSelect';

/**
 * Prepends a leading selection column with a select-all header checkbox and a
 * per-row checkbox. Pair with `<nat-table [enableRowSelection]="true">`.
 *
 * Follows the same `(columns) => columns` shape as
 * `withNatTableHeaderActions(...)` so it composes with the other helpers.
 * Generated English copy lives in `ng-advanced-table/locale`; pass explicit
 * label options only to override the active locale.
 */
const withNatTableSelectionColumn = (columns, options = {}) => {
    const columnId = options.columnId ?? SELECTION_COLUMN_ID;
    const selectionColumn = {
        id: columnId,
        size: options.size ?? 48,
        minSize: 44,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        enableGlobalFilter: false,
        enablePinning: options.enablePinning ?? true,
        meta: options.label !== undefined ? { label: options.label } : {},
        header: (context) => flexRenderComponent(NatTableSelectionCheckbox, {
            inputs: {
                mode: 'all',
                table: context.table,
                ariaLabel: options.selectAllAriaLabel ?? '',
                label: options.label ?? ''
            }
        }),
        cell: (context) => flexRenderComponent(NatTableSelectionCheckbox, {
            inputs: {
                mode: 'row',
                table: context.table,
                row: context.row,
                ariaLabel: options.selectRowAriaLabel?.(context.row) ?? ''
            }
        })
    };
    return [selectionColumn, ...columns];
};

/**
 * Groups related toolbar items, proxying `ngToolbarWidgetGroup` from
 * `@angular/aria/toolbar` and adding what the stock directive leaves out:
 * `role="group"`, an accessible name, slot positioning and flex styling.
 *
 * `natToolbarGroup="start" | "center" | "end"` (default start) picks the
 * toolbar slot, same contract as `natToolbarItem` — static attribute only.
 * Items inside keep their own `natToolbarItem` (their Aria value); they are
 * projected with the group, so their own `natToolbarItemPosition` is ignored.
 *
 * Keyboard: Left/Right (and Home/End) traverse all toolbar items linearly;
 * Up/Down cycle within this group (Aria's group navigation). `disabled`
 * (from the stock directive) soft-disables every item in the group.
 *
 * @example
 * ```html
 * <div natToolbarGroup="end" accessibleName="View density">
 *   <button natToolbarItem="compact">Compact</button>
 *   <button natToolbarItem="comfortable">Comfortable</button>
 * </div>
 * ```
 */
class NatToolbarGroup {
    natToolbarGroup = input('start', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natToolbarGroup" }] : /* istanbul ignore next */ []));
    accessibleName = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatToolbarGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.1.1", type: NatToolbarGroup, isStandalone: true, selector: "div[natToolbarGroup], section[natToolbarGroup]", inputs: { natToolbarGroup: { classPropertyName: "natToolbarGroup", publicName: "natToolbarGroup", isSignal: true, isRequired: false, transformFunction: null }, accessibleName: { classPropertyName: "accessibleName", publicName: "accessibleName", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "group" }, properties: { "attr.aria-label": "accessibleName() ?? null" } }, hostDirectives: [{ directive: i1.ToolbarWidgetGroup, inputs: ["disabled", "disabled"] }], ngImport: i0, template: `<ng-content />`, isInline: true, styles: [":host{display:flex;flex-wrap:nowrap;gap:var(--nat-table-toolbar-group-gap, var(--sys-nat-table-toolbar-group-gap, 4px));align-items:center;min-width:0}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatToolbarGroup, decorators: [{
            type: Component,
            args: [{ selector: 'div[natToolbarGroup], section[natToolbarGroup]', template: `<ng-content />`, hostDirectives: [{ directive: ToolbarWidgetGroup, inputs: ['disabled'] }], host: {
                        role: 'group',
                        '[attr.aria-label]': 'accessibleName() ?? null'
                    }, styles: [":host{display:flex;flex-wrap:nowrap;gap:var(--nat-table-toolbar-group-gap, var(--sys-nat-table-toolbar-group-gap, 4px));align-items:center;min-width:0}\n"] }]
        }], propDecorators: { natToolbarGroup: [{ type: i0.Input, args: [{ isSignal: true, alias: "natToolbarGroup", required: false }] }], accessibleName: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibleName", required: false }] }] } });

/**
 * Resolution helpers for a toolbar item's focus target — the descendant that
 * should actually receive focus, either nominated through
 * `natToolbarItemFocusTarget` or resolved implicitly for a wrapper host.
 *
 * `@angular/aria` focuses a toolbar widget by calling `element.focus()` on the
 * element carrying the directive, so a wrapper component (an Angular component
 * host, a Stencil custom element, any design-system control) would otherwise
 * take focus on a non-interactive shell while the real control sits inside it.
 */
/**
 * Finds the nominated focus target beneath `host`.
 *
 * An **open** shadow root is searched first, so a custom element that renders
 * its control into shadow DOM resolves without the consumer knowing where the
 * boundary is; light DOM is the fallback. A closed shadow root is unreachable
 * by construction and yields `null`.
 */
const resolveNatToolbarFocusTarget = (host, selector) => {
    const trimmed = selector.trim();
    if (!trimmed)
        return null;
    // `querySelector` throws on a malformed selector; a bad selector is a
    // consumer typo, not a reason to tear down the whole toolbar.
    try {
        return host.shadowRoot?.querySelector(trimmed) ?? host.querySelector(trimmed);
    }
    catch {
        return null;
    }
};
/**
 * Elements that take focus on their own. A `natToolbarItem` sitting on one of
 * these *is* the control, so nothing inside it is ever nominated implicitly.
 */
const NAT_TOOLBAR_INTRINSIC_CONTROL_SELECTOR = 'button, input, select, textarea, a[href], area[href], summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';
/**
 * Candidates for the implicit focus target, in DOM order. `[tabindex]` is kept
 * regardless of value because the resolved control is itself pulled to
 * `tabindex="-1"` and must still be found again on the next pass.
 */
const NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR = 'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), ' +
    'a[href], area[href], summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';
/** True when `host` is itself an interactive element rather than a wrapper around one. */
const isNatToolbarIntrinsicControl = (host) => host.matches(NAT_TOOLBAR_INTRINSIC_CONTROL_SELECTOR);
/**
 * True when a structural match can actually receive focus right now:
 * not `:disabled` (which also covers a disabled `<fieldset>` ancestor), not
 * inside an `inert` subtree, and not under a `hidden` ancestor.
 *
 * Only attribute-level state is checked. CSS `display: none` would need
 * layout the resolver has no business forcing, and the result must be the
 * same in a DOM without layout (unit tests, SSR hydration).
 */
const canCandidateTakeFocus = (candidate) => {
    if (candidate.matches(':disabled'))
        return false;
    if (candidate.closest('[inert]') !== null)
        return false;
    return candidate.closest('[hidden]') === null;
};
const firstFocusableCandidate = (candidates) => {
    if (!candidates)
        return null;
    for (const candidate of candidates) {
        if (canCandidateTakeFocus(candidate))
            return candidate;
    }
    return null;
};
/**
 * Finds the control a wrapper host should forward focus to when the consumer
 * nominated none — the first focusable descendant, searching an **open**
 * shadow root before light DOM exactly like {@link resolveNatToolbarFocusTarget}.
 *
 * An intrinsic control resolves to `null`: it is the target already.
 * Candidates that cannot currently take focus are skipped, so a hidden or
 * disabled leading control never strands navigation on the wrapper shell
 * while a later control is operable.
 */
const resolveNatToolbarImplicitFocusTarget = (host) => {
    if (isNatToolbarIntrinsicControl(host))
        return null;
    return (firstFocusableCandidate(host.shadowRoot?.querySelectorAll(NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR)) ??
        firstFocusableCandidate(host.querySelectorAll(NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR)));
};
/**
 * True when `host` hides its content behind a closed shadow root — the one
 * case `resolveNatToolbarFocusTarget` can never satisfy, and worth telling the
 * consumer apart from a plain selector typo.
 *
 * A closed root is not exposed on the element at all, so it is detected by
 * elimination: a defined custom element with no reachable `shadowRoot` and no
 * light-DOM children of its own.
 */
const hasUnreachableShadowRoot = (host) => {
    if (host.shadowRoot)
        return false;
    if (!host.tagName.includes('-'))
        return false;
    const registry = globalThis.customElements;
    // `typeof` rather than a falsy check: the DOM lib types the registry as
    // always present, but it is absent on the server.
    if (typeof registry === 'undefined')
        return false;
    return registry.get(host.tagName.toLowerCase()) !== undefined && host.childElementCount === 0;
};
/**
 * Keeps the nominated target out of the sequential tab order.
 *
 * Without this the wrapper host (carrying the toolbar's roving `tabindex`) and
 * the inner control would both be tab stops, so Tab would land inside the
 * toolbar twice instead of moving past it — defeating the single-tab-stop
 * contract the toolbar pattern exists to provide.
 */
const suppressNatToolbarFocusTargetTabStop = (target) => {
    if (target.getAttribute('tabindex') === '-1')
        return;
    target.setAttribute('tabindex', '-1');
};
/**
 * Undoes {@link suppressNatToolbarFocusTargetTabStop} when an element stops
 * being the nominated target (selector changed, cleared, or re-resolved to a
 * different control), so the former control returns to the sequential tab
 * order it had before suppression.
 *
 * `previousTabIndex` is the `tabindex` attribute value the element carried
 * before suppression (`null` when it carried none). A current value other than
 * `-1` means another owner has taken over the attribute since, and is left
 * untouched.
 */
const restoreNatToolbarFocusTargetTabStop = (target, previousTabIndex) => {
    if (target.getAttribute('tabindex') !== '-1')
        return;
    if (previousTabIndex === null) {
        target.removeAttribute('tabindex');
    }
    else {
        target.setAttribute('tabindex', previousTabIndex);
    }
};

/**
 * Marks an interactive element (a `<button>`, `<input>`, …) as a toolbar item,
 * so it joins the toolbar's roving keyboard focus (Left/Right, Home/End) and
 * matches screen-reader order.
 *
 * Plain action buttons need nothing more than the bare attribute:
 * ```html
 * <button natToolbarItem natToolbarItemPosition="start">Export</button>
 * ```
 *
 * For toggle or otherwise selectable items, give each one a unique `value` as a
 * stable identity — one string per item, unique within the toolbar:
 * ```html
 * <button natToolbarItem="bold">Bold</button>
 * <button natToolbarItem="italic">Italic</button>
 * ```
 *
 * `natToolbarItemPosition="start" | "center" | "end"` (default `start`) picks
 * the toolbar slot. It MUST be a static attribute — a binding
 * (`[natToolbarItemPosition]="expr"`) always lands in the start slot.
 *
 * When the item is a wrapper rather than the control itself — an Angular
 * component host, a Stencil custom element, any design-system button — focus
 * is forwarded to the first focusable descendant (an open shadow root is
 * searched before light DOM), so a bare marker is enough:
 * ```html
 * <my-button natToolbarItem="filters">Filters</my-button>
 * ```
 *
 * `natToolbarItemFocusTarget` overrides that choice with a CSS selector when a
 * wrapper renders more than one control, or the first one is not the one that
 * should own focus:
 * ```html
 * <my-split-button natToolbarItem="filters" natToolbarItemFocusTarget=".primary">Filters</my-split-button>
 * ```
 *
 * Items only work inside a `<nat-table-toolbar>`.
 *
 * @example
 * ```html
 * <nat-table-toolbar>
 *   <button natToolbarItem natToolbarItemPosition="start">Export</button>
 *   <input natToolbarItem type="search" aria-label="Filter" />
 * </nat-table-toolbar>
 * ```
 */
class NatToolbarItem {
    natToolbarItemPosition = input('start', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natToolbarItemPosition" }] : /* istanbul ignore next */ []));
    /**
     * CSS selector for the descendant that should receive focus instead of this
     * host — for items that wrap their real control rather than being it.
     *
     * Optional: a wrapper host with no selector forwards focus to its first
     * focusable descendant. Set it when that default picks the wrong control.
     *
     * An open shadow root is searched before light DOM, so a custom element
     * resolves without the consumer knowing where its boundary is. The resolved
     * element is pulled out of the sequential tab order (`tabindex="-1"`) so the
     * toolbar keeps exactly one Tab stop.
     *
     * Registration and hit-testing deliberately stay on the host: Aria resolves
     * events with `item.element().contains(target)`, and shadow-DOM events
     * retarget to the host — so repointing the widget element itself would break
     * click, focusin and keydown routing.
     */
    natToolbarItemFocusTarget = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natToolbarItemFocusTarget" }] : /* istanbul ignore next */ []));
    widget = inject(ToolbarWidget, { self: true });
    destroyRef = inject(DestroyRef);
    /** Re-applies the tab-stop suppression when the wrapper re-renders its control away. */
    observer = null;
    /** Root the observer is attached to — a shadow root may appear after the first pass. */
    observedRoot = null;
    /** One warning per item — a mis-typed selector should not spam every focus. */
    hasWarnedUnresolved = false;
    /** One warning per item for a sealed wrapper nothing can be resolved inside of. */
    hasWarnedSealed = false;
    /** Guards against queueing a `whenDefined` continuation on every observer tick. */
    isAwaitingUpgrade = false;
    /** The control currently pulled out of the tab order, so a selector change or clear can restore it. */
    suppressedTarget = null;
    /** The `tabindex` attribute the suppressed control carried beforehand (`null` = none). */
    suppressedTargetPriorTabIndex = null;
    isDestroyed = false;
    constructor() {
        afterNextRender(() => this.syncFocusTarget());
        // A changed selector invalidates whatever was suppressed before.
        effect(() => {
            this.natToolbarItemFocusTarget();
            this.hasWarnedUnresolved = false;
            this.syncFocusTarget();
        });
        this.destroyRef.onDestroy(() => {
            this.isDestroyed = true;
            this.observer?.disconnect();
            this.restoreSuppressedTarget();
        });
    }
    get id() {
        return this.widget.id();
    }
    /**
     * Host element — the widget's identity for Aria registration and hit-testing,
     * never the nominated focus target. See `natToolbarItemFocusTarget`.
     */
    get element() {
        return this.widget.element;
    }
    position = this.natToolbarItemPosition;
    focus() {
        (this.resolveFocusTarget() ?? this.element).focus();
    }
    /**
     * Forwards focus from the wrapper host to the nominated control.
     *
     * `focus` does not bubble, so this fires only when the host itself is
     * focused — no redirect loop when the target below it takes over. It covers
     * every path Aria uses, since all of them end in `element.focus()`.
     */
    redirectFocusToTarget(event) {
        if (event.target !== this.element)
            return;
        const target = this.resolveFocusTarget();
        if (!target || target === this.element)
            return;
        // Shift+Tab out of the control lands on the host, because the host carries
        // the roving tabindex and precedes the control in sequential order.
        // Redirecting there would throw focus straight back in and trap the user —
        // the exact failure this input exists to prevent, in reverse. `relatedTarget`
        // on `focus` is the element being left, so an arrival *from* the target is
        // a backward exit and must be allowed through.
        if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))
            return;
        this.suppressTargetTabStop(target);
        target.focus();
    }
    /**
     * True when this item forwards focus somewhere below its host: either a
     * selector is set, or the host is a wrapper (not itself an interactive
     * element) whose control is resolved implicitly. A plain `<button>` or
     * `<input>` item is the control and skips all target bookkeeping.
     */
    get forwardsFocus() {
        return this.natToolbarItemFocusTarget() !== undefined || !isNatToolbarIntrinsicControl(this.element);
    }
    /**
     * Resolves the target — nominated by selector, or the first focusable
     * descendant of a wrapper host — warning once in dev mode when a selector
     * cannot be satisfied, or a sealed wrapper hides its control entirely.
     */
    resolveFocusTarget() {
        const selector = this.natToolbarItemFocusTarget();
        const host = this.element;
        if (selector === undefined) {
            const implicitTarget = resolveNatToolbarImplicitFocusTarget(host);
            if (!implicitTarget && isDevMode() && !this.hasWarnedSealed && hasUnreachableShadowRoot(host)) {
                this.hasWarnedSealed = true;
                console.warn(`[ng-advanced-table/components] natToolbarItem on <${host.tagName.toLowerCase()}>: the element renders into a closed ` +
                    'shadow root, so no inner control can receive roving focus. Author it with an open shadow root (Stencil: ' +
                    '`shadow: true`, or `delegatesFocus: true`), or opt the toolbar out with focusManagement="none".');
            }
            return implicitTarget;
        }
        const target = resolveNatToolbarFocusTarget(host, selector);
        if (!target && isDevMode() && !this.hasWarnedUnresolved) {
            this.hasWarnedUnresolved = true;
            const reason = hasUnreachableShadowRoot(host)
                ? `<${host.tagName.toLowerCase()}> renders into a closed shadow root, which cannot be reached. ` +
                    'Author the element with an open shadow root (Stencil: `shadow: true`, or `delegatesFocus: true`).'
                : `no descendant of <${host.tagName.toLowerCase()}> matches it.`;
            console.warn(`[ng-advanced-table/components] natToolbarItemFocusTarget="${selector}": ${reason}`);
        }
        return target;
    }
    /**
     * Applies tab-stop suppression to the currently resolved target, and keeps
     * the re-render watch pointed at the right root.
     *
     * Suppression has to land before the user first reaches the toolbar — an
     * un-suppressed inner control is a second Tab stop, which is exactly the
     * failure this input exists to remove — so it cannot wait for first focus.
     */
    syncFocusTarget() {
        if (this.isDestroyed)
            return;
        if (!this.forwardsFocus) {
            // Intrinsic control with no selector: the host is the target, so the
            // re-render watch has nothing to guard and nothing stays suppressed.
            this.observer?.disconnect();
            this.observedRoot = null;
            this.restoreSuppressedTarget();
            return;
        }
        this.observeFocusTarget();
        this.awaitCustomElementUpgrade();
        const target = this.resolveFocusTarget();
        if (target && target !== this.element) {
            this.suppressTargetTabStop(target);
        }
        else {
            // Selector no longer resolves (changed, or the wrapper re-rendered the
            // control away) — whatever was suppressed before is no longer ours.
            this.restoreSuppressedTarget();
        }
    }
    /**
     * Suppresses `target`, first restoring any previously suppressed control so
     * a selector change never leaves the former target out of the tab order.
     * Re-suppressing the same element keeps its original tabindex record.
     */
    suppressTargetTabStop(target) {
        if (this.suppressedTarget !== target) {
            this.restoreSuppressedTarget();
            this.suppressedTarget = target;
            this.suppressedTargetPriorTabIndex = target.getAttribute('tabindex');
        }
        suppressNatToolbarFocusTargetTabStop(target);
    }
    /** Returns the previously suppressed control to the tab order it had before. */
    restoreSuppressedTarget() {
        const target = this.suppressedTarget;
        if (!target)
            return;
        this.suppressedTarget = null;
        restoreNatToolbarFocusTargetTabStop(target, this.suppressedTargetPriorTabIndex);
        this.suppressedTargetPriorTabIndex = null;
    }
    /**
     * Watches the wrapper for re-renders. A component that rebuilds its control
     * drops the `tabindex="-1"` we set, which would silently restore the second
     * Tab stop. Re-attaches when a shadow root appears after the first pass.
     *
     * Only `childList` is observed, so writing the attribute back cannot feed
     * the observer its own mutation.
     */
    observeFocusTarget() {
        const mutationObserverCtor = globalThis.MutationObserver;
        if (typeof mutationObserverCtor === 'undefined')
            return;
        const host = this.element;
        const root = host.shadowRoot ?? host;
        if (this.observedRoot === root)
            return;
        this.observer?.disconnect();
        this.observer = new mutationObserverCtor(() => this.syncFocusTarget());
        this.observer.observe(root, { childList: true, subtree: true });
        this.observedRoot = root;
    }
    /**
     * Re-syncs once a not-yet-upgraded custom element defines itself. Until then
     * it has neither a shadow root nor rendered children, so nothing to resolve.
     */
    awaitCustomElementUpgrade() {
        const host = this.element;
        const tagName = host.tagName.toLowerCase();
        const registry = globalThis.customElements;
        // `typeof` rather than a falsy check: the DOM lib types the registry as
        // always present, but it is absent on the server.
        if (typeof registry === 'undefined')
            return;
        if (this.isAwaitingUpgrade || !tagName.includes('-') || registry.get(tagName))
            return;
        this.isAwaitingUpgrade = true;
        void registry.whenDefined(tagName).then(() => {
            this.isAwaitingUpgrade = false;
            this.syncFocusTarget();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatToolbarItem, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatToolbarItem, isStandalone: true, selector: "[natToolbarItem]", inputs: { natToolbarItemPosition: { classPropertyName: "natToolbarItemPosition", publicName: "natToolbarItemPosition", isSignal: true, isRequired: false, transformFunction: null }, natToolbarItemFocusTarget: { classPropertyName: "natToolbarItemFocusTarget", publicName: "natToolbarItemFocusTarget", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "focus": "redirectFocusToTarget($event)" } }, providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }], hostDirectives: [{ directive: i1.ToolbarWidget, inputs: ["value", "natToolbarItem", "disabled", "disabled", "id", "id"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatToolbarItem, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natToolbarItem]',
                    providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
                    // Aria's `value` is required; aliasing it to the always-present
                    // selector attribute lets a bare `natToolbarItem` satisfy it with `''`. Bare
                    // items then share value `''` (non-unique) — harmless while selection is
                    // disabled; pass a string per item if Aria selection is ever re-enabled.
                    hostDirectives: [{ directive: ToolbarWidget, inputs: ['value: natToolbarItem', 'disabled', 'id'] }],
                    host: {
                        '(focus)': 'redirectFocusToTarget($event)'
                    }
                }]
        }], ctorParameters: () => [], propDecorators: { natToolbarItemPosition: [{ type: i0.Input, args: [{ isSignal: true, alias: "natToolbarItemPosition", required: false }] }], natToolbarItemFocusTarget: [{ type: i0.Input, args: [{ isSignal: true, alias: "natToolbarItemFocusTarget", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { NAT_TABLE_EXPORT, NAT_TOOLBAR_ITEM, NatTableColumnVisibility, NatTableExport, NatTablePageSize, NatTablePager, NatTablePagination, NatTableScrollControl, NatTableSelectionCheckbox, NatTableSurface, NatTableToolbar, NatToolbarGroup, NatToolbarItem, provideNatTableExport, withNatTableHeaderActions, withNatTableSelectionColumn };
//# sourceMappingURL=ng-advanced-table-components.mjs.map
