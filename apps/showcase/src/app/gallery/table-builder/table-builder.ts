import { Component, afterRenderEffect, computed, signal, viewChild } from '@angular/core';
import type { ElementRef } from '@angular/core';

import { NatTable, NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTableExport,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableToolbar,
  NatToolbarItem
} from 'ng-advanced-table/components';
import { provideNatTableControlsLocales } from 'ng-advanced-table/locale';

import {
  DATA_STATE_PREVIEWS,
  DEFAULT_FLAGS,
  DEMO_DATA,
  DEMO_LOCALE_ID,
  FEATURE_CATEGORIES,
  FEATURE_DESCRIPTORS,
  LOCALE_PREVIEWS,
  NAT_DA_CONTROLS_LABELS,
  PRESETS,
  PRESET_DESCRIPTORS
} from './common';
import type {
  DataStatePreview,
  DemoItem,
  FeatureCategory,
  FeatureDescriptor,
  LocalePreview,
  PresetKey,
  TableBuilderFlagKey,
  TableBuilderFlags
} from './common';
import {
  buildBuilderColumns,
  buildComponentSource,
  buildSeedState,
  buildStateObject,
  buildTemplateSource,
  formatStateLiteral,
  reconcileToggleState,
  resolvePreviewData,
  resolvePreviewDataStatus,
  resolvePreviewError,
  toBuilderColumnFlags
} from './utils';
import { highlightElement } from '../../shared/prism.util';
import { TableSearch } from '../../ui/table-search/table-search';

@Component({
  selector: 'app-table-builder',
  imports: [
    NatTable,
    NatTableSurface,
    TableSearch,
    NatTableColumnVisibility,
    NatTableExport,
    NatToolbarItem,
    NatTablePagination,
    NatTableScrollControl,
    NatTableToolbar,
    NatTableLoadingTemplate,
    NatTableEmptyTemplate,
    NatTableErrorTemplate
  ],
  providers: [provideNatTableControlsLocales({ da: NAT_DA_CONTROLS_LABELS })],
  templateUrl: './table-builder.html',
  styleUrl: './table-builder.css'
})
export class TableBuilderPage {
  // Single feature-flag source of truth
  protected readonly flags = signal<TableBuilderFlags>(DEFAULT_FLAGS);

  // Locale id switched onto the surface when the localization feature is on.
  protected readonly demoLocaleId = DEMO_LOCALE_ID;

  // Descriptor-driven menu model
  protected readonly featureCategories = FEATURE_CATEGORIES;
  protected readonly presets = PRESET_DESCRIPTORS;
  private readonly featureDescriptors = FEATURE_DESCRIPTORS;

  private readonly codeElement = viewChild<ElementRef<HTMLElement>>('codeEl');

  // Active Code Tab ('html' | 'ts')
  protected readonly activeTab = signal<'html' | 'ts'>('html');

  // Copy Status Tracker
  protected readonly copied = signal(false);

  // Table Data
  protected readonly data: DemoItem[] = DEMO_DATA;

  // Data-states preview selector (preview-only affordance; the generated code ships a
  // `dataStatus` signal defaulting to 'success').
  protected readonly dataStatePreviews = DATA_STATE_PREVIEWS;
  protected readonly previewState = signal<DataStatePreview>('live');

  // Preview-only language selector — flips the live surface between English and Danish
  // when localization is on (the generated snippet always ships the Danish setup).
  protected readonly localePreviews = LOCALE_PREVIEWS;
  protected readonly previewLocale = signal<LocalePreview>('da');
  protected readonly surfaceLocale = computed(() =>
    this.flags().withLocalization && this.previewLocale() === 'da' ? this.demoLocaleId : undefined
  );

  // Explicit English copy when localization is off; undefined when on so the field
  // inherits the active locale's search labels from the controls provider.
  protected readonly searchLabel = computed(() => (this.flags().withLocalization ? undefined : 'Search rows'));
  protected readonly searchPlaceholder = computed(() => (this.flags().withLocalization ? undefined : "Try 'Alpha' or 'Security'..."));

  // Preview data/status/error for the data-states demo (resolvers keep this file lean).
  protected readonly previewData = computed(() => resolvePreviewData(this.flags().withDataStates, this.previewState(), this.data));
  protected readonly previewDataStatus = computed(() => resolvePreviewDataStatus(this.flags().withDataStates, this.previewState()));
  protected readonly previewError = computed(() => resolvePreviewError(this.flags().withDataStates, this.previewState()));

  // 'da' only when localization is on and the Danish preview is selected; drives
  // both the surface locale and the app-owned column-header language.
  protected readonly previewColumnLocale = computed<LocalePreview>(() =>
    this.flags().withLocalization && this.previewLocale() === 'da' ? 'da' : 'en'
  );

  // Columns definition
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() =>
    buildBuilderColumns(toBuilderColumnFlags(this.flags()), this.previewColumnLocale())
  );

  // Table State
  protected readonly tableState = signal<Partial<NatTableUserState>>(buildSeedState(DEFAULT_FLAGS));

  // Generated HTML code
  protected readonly generatedHtml = computed(() => buildTemplateSource(this.flags()));

  // Generated TS code
  protected readonly generatedTs = computed(() =>
    buildComponentSource(this.flags(), formatStateLiteral(buildStateObject(this.flags(), this.tableState())))
  );

  // Code shown in the active tab (html / ts)
  protected readonly activeCode = computed(() => {
    const sources = { html: this.generatedHtml, ts: this.generatedTs };

    return sources[this.activeTab()]();
  });

  public constructor() {
    afterRenderEffect(() => {
      // Re-run Prism whenever the generated source or active tab changes, after Angular writes textContent.
      this.activeCode();

      const codeElement = this.codeElement()?.nativeElement;

      if (codeElement) {
        highlightElement(codeElement);
      }
    });
  }

  protected featuresFor(category: FeatureCategory): FeatureDescriptor[] {
    return this.featureDescriptors.filter((feature) => feature.category === category);
  }

  protected toggleFeature(key: TableBuilderFlagKey): void {
    const next = !this.flags()[key];

    this.flags.update((current) => ({ ...current, [key]: next }));
    this.tableState.update((current) => reconcileToggleState(current, key, next));
  }

  protected applyPreset(key: PresetKey): void {
    const presetFlags = PRESETS[key];

    this.flags.set(presetFlags);
    this.tableState.set(buildSeedState(presetFlags));
  }

  protected setTab(tab: 'html' | 'ts'): void {
    this.activeTab.set(tab);
  }

  protected copyCode(): void {
    navigator.clipboard
      .writeText(this.activeCode())
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(() => {
        this.copied.set(false);
      });
  }
}
