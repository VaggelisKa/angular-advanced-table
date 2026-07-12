/* eslint-disable max-lines -- Keep the reactive provider RFC contract matrix in one focused specification. */
import {
  EnvironmentInjector,
  computed,
  createEnvironmentInjector,
  provideZonelessChangeDetection,
  resource,
  signal
} from '@angular/core';
import type { Provider, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';

import { Subject, catchError, finalize, from, of } from 'rxjs';
import { vi } from 'vitest';

import { NAT_TABLE_INTL, provideNatTableIntl, provideNatTableLocales } from './accessibility.provider';
import { NAT_TABLE_CONTROLS_INTL, provideNatTableControlsIntl, provideNatTableControlsLocales } from './controls.provider';
import {
  NAT_TABLE_RENDER_METRICS_INTL,
  provideNatTableRenderMetricsIntl,
  provideNatTableRenderMetricsLocales
} from './render-metrics.provider';
import type {
  NatTableAccessibilityText,
  NatTableIntlConfig,
  NatTableIntlStaticProviderConfig,
  NatTableLocalesMap
} from '../common/accessibility.type';
import type {
  NatTableControlsIntl,
  NatTableControlsIntlConfig,
  NatTableControlsIntlStaticProviderConfig,
  NatTableControlsLocalesMap
} from '../common/controls.type';
import type {
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsIntlStaticProviderConfig,
  NatTableRenderMetricsLocalesMap,
  NatTableRenderMetricsWidgetsIntl
} from '../common/render-metrics.type';

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

const expectDefined = <T>(value: T | undefined, label: string): T => {
  if (value === undefined) {
    throw new Error(`Expected ${label} to be defined.`);
  }

  return value;
};

const tableAccess = (intl: NatTableIntlConfig, localeId = 'en'): NatTableAccessibilityText => {
  const locales = expectDefined(intl.locales, 'table locales');
  const locale = expectDefined(locales[localeId], `table locale ${localeId}`);

  return expectDefined(locale.accessibilityText, `table accessibility copy for ${localeId}`);
};

const controlsLocale = (intl: NatTableControlsIntlConfig, localeId = 'en'): NatTableControlsIntl => {
  const locales = expectDefined(intl.locales, 'controls locales');

  return expectDefined(locales[localeId], `controls locale ${localeId}`);
};

const renderMetricsWidgets = (intl: NatTableRenderMetricsIntlConfig, localeId = 'en'): NatTableRenderMetricsWidgetsIntl => {
  const locales = expectDefined(intl.locales, 'render-metrics locales');
  const locale = expectDefined(locales[localeId], `render-metrics locale ${localeId}`);

  return expectDefined(locale.renderMetrics, `render-metrics widgets for ${localeId}`);
};

const searchIntl = (intl: NatTableControlsIntlConfig, localeId = 'en'): NonNullable<NatTableControlsIntl['search']> =>
  expectDefined(controlsLocale(intl, localeId).search, `search copy for ${localeId}`);

const toolbarIntl = (intl: NatTableControlsIntlConfig): NonNullable<NatTableControlsIntl['toolbar']> =>
  expectDefined(controlsLocale(intl).toolbar, 'toolbar copy');

const renderMetricsPanelIntl = (
  intl: NatTableRenderMetricsIntlConfig,
  localeId = 'en'
): NonNullable<NatTableRenderMetricsWidgetsIntl['panel']> =>
  expectDefined(renderMetricsWidgets(intl, localeId).panel, `render-metrics panel copy for ${localeId}`);

const renderMetricsColumnIntl = (intl: NatTableRenderMetricsIntlConfig): NonNullable<NatTableRenderMetricsWidgetsIntl['column']> =>
  expectDefined(renderMetricsWidgets(intl).column, 'render-metrics column copy');

type HasOnlyLocalesProperty<T> = Exclude<keyof T, 'locales'> extends never ? ('locales' extends keyof T ? true : false) : false;

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('FEATURE: reactive intl provider sources', () => {
  describe('GIVEN: the three injected locale-domain configuration types', () => {
    describe('WHEN: constraining their common outer contract', () => {
      it('THEN: it keeps locales as their only public configuration property', () => {
        const tableContract: HasOnlyLocalesProperty<NatTableIntlConfig> = true;
        const controlsContract: HasOnlyLocalesProperty<NatTableControlsIntlConfig> = true;
        const renderMetricsContract: HasOnlyLocalesProperty<NatTableRenderMetricsIntlConfig> = true;

        expect([tableContract, controlsContract, renderMetricsContract]).toStrictEqual([true, true, true]);
      });
    });
  });

  describe('GIVEN: static full-config and locale-map providers', () => {
    beforeEach(() => {
      configure(
        provideNatTableIntl({ accessibilityText: { emptyState: 'Static table empty' } }),
        provideNatTableControlsLocales({ en: { search: { label: 'Static search' } } }),
        provideNatTableRenderMetricsLocales({ en: { renderMetrics: { panel: { ariaLabel: 'Static metrics' } } } })
      );
    });

    describe('WHEN: resolving their config-shaped injection tokens', () => {
      it('THEN: it preserves static provider behavior and built-in fallbacks', () => {
        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL)).emptyState).toBe('Static table empty');
        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL)).loadingState).toBe('Loading rows.');
        expect(searchIntl(TestBed.inject(NAT_TABLE_CONTROLS_INTL)).label).toBe('Static search');
        expect(renderMetricsPanelIntl(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL)).ariaLabel).toBe('Static metrics');
      });
    });
  });

  describe('GIVEN: a direct signal-backed table intl config', () => {
    let sourceValue: { accessibilityText: { emptyState: string } };
    let source: WritableSignal<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      sourceValue = { accessibilityText: { emptyState: 'First empty state' } };
      source = signal<NatTableIntlStaticProviderConfig>(sourceValue);
      configure(provideNatTableIntl(source));
    });

    describe('WHEN: mutating the current value before replacing it', () => {
      it('THEN: it ignores same-reference mutation and reacts to an immutable replacement', () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);
        const emptyState = computed(() => tableAccess(intl).emptyState);

        expect(emptyState()).toBe('First empty state');

        sourceValue.accessibilityText.emptyState = 'Mutated empty state';
        source.set(sourceValue);

        expect(emptyState()).toBe('First empty state');

        source.set({ accessibilityText: { emptyState: 'Second empty state' } });

        expect(TestBed.inject(NAT_TABLE_INTL)).toBe(intl);
        expect(emptyState()).toBe('Second empty state');
      });
    });
  });

  describe('GIVEN: a signal-backed table intl config with custom equality', () => {
    let source: WritableSignal<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      source = signal<NatTableIntlStaticProviderConfig>(
        { accessibilityText: { emptyState: 'Equality-selected empty state' } },
        { equal: () => true }
      );
      configure(provideNatTableIntl(source));
    });

    describe('WHEN: its equality policy suppresses a replacement value', () => {
      it('THEN: it leaves the resolved provider copy unchanged', () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);
        const emptyState = computed(() => tableAccess(intl).emptyState);

        expect(emptyState()).toBe('Equality-selected empty state');

        source.set({ accessibilityText: { emptyState: 'Suppressed replacement empty state' } });

        expect(emptyState()).toBe('Equality-selected empty state');
      });
    });
  });

  describe('GIVEN: factories returning signal-backed controls and render-metrics configs', () => {
    let controlsSource: WritableSignal<NatTableControlsIntlStaticProviderConfig>;
    let renderMetricsSource: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;
    let controlsFactoryCalls: number;
    let renderMetricsFactoryCalls: number;

    beforeEach(() => {
      controlsSource = signal<NatTableControlsIntlStaticProviderConfig>({ search: { label: 'First search' } });
      renderMetricsSource = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { panel: { ariaLabel: 'First metrics panel' } }
      });
      controlsFactoryCalls = 0;
      renderMetricsFactoryCalls = 0;

      configure(
        provideNatTableControlsIntl(() => {
          controlsFactoryCalls += 1;

          return controlsSource;
        }),
        provideNatTableRenderMetricsIntl(() => {
          renderMetricsFactoryCalls += 1;

          return renderMetricsSource;
        })
      );
    });

    describe('WHEN: resolving each token repeatedly and replacing both signal values', () => {
      it('THEN: it runs each DI factory once and keeps consuming its signal', () => {
        const controlsIntl = TestBed.inject(NAT_TABLE_CONTROLS_INTL);
        const renderMetricsIntl = TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL);

        expect(searchIntl(controlsIntl).label).toBe('First search');
        expect(renderMetricsPanelIntl(renderMetricsIntl).ariaLabel).toBe('First metrics panel');

        controlsSource.set({ search: { label: 'Second search' } });
        renderMetricsSource.set({ renderMetrics: { panel: { ariaLabel: 'Second metrics panel' } } });

        expect(TestBed.inject(NAT_TABLE_CONTROLS_INTL)).toBe(controlsIntl);
        expect(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL)).toBe(renderMetricsIntl);
        expect(searchIntl(controlsIntl).label).toBe('Second search');
        expect(renderMetricsPanelIntl(renderMetricsIntl).ariaLabel).toBe('Second metrics panel');
        expect(controlsFactoryCalls).toBe(1);
        expect(renderMetricsFactoryCalls).toBe(1);
      });
    });
  });

  describe('GIVEN: direct and factory signal-backed locale-map convenience providers', () => {
    let tableLocales: WritableSignal<NatTableLocalesMap>;
    let controlsLocales: WritableSignal<NatTableControlsLocalesMap>;
    let renderMetricsLocales: WritableSignal<NatTableRenderMetricsLocalesMap>;

    beforeEach(() => {
      tableLocales = signal<NatTableLocalesMap>({ qa: { accessibilityText: { emptyState: 'First QA table' } } });
      controlsLocales = signal<NatTableControlsLocalesMap>({ qa: { search: { label: 'First QA search' } } });
      renderMetricsLocales = signal<NatTableRenderMetricsLocalesMap>({
        qa: { renderMetrics: { panel: { ariaLabel: 'First QA metrics' } } }
      });

      configure(
        provideNatTableLocales(tableLocales),
        provideNatTableControlsLocales(() => controlsLocales),
        provideNatTableRenderMetricsLocales(() => renderMetricsLocales)
      );
    });

    describe('WHEN: replacing the locale maps', () => {
      it('THEN: it updates all three convenience-provider token facades', () => {
        const tableIntl = TestBed.inject(NAT_TABLE_INTL);
        const controlsIntl = TestBed.inject(NAT_TABLE_CONTROLS_INTL);
        const renderMetricsIntl = TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL);

        tableLocales.set({ qa: { accessibilityText: { emptyState: 'Second QA table' } } });
        controlsLocales.set({ qa: { search: { label: 'Second QA search' } } });
        renderMetricsLocales.set({ qa: { renderMetrics: { panel: { ariaLabel: 'Second QA metrics' } } } });

        expect(tableAccess(tableIntl, 'qa').emptyState).toBe('Second QA table');
        expect(searchIntl(controlsIntl, 'qa').label).toBe('Second QA search');
        expect(renderMetricsPanelIntl(renderMetricsIntl, 'qa').ariaLabel).toBe('Second QA metrics');

        tableLocales.set({});
        controlsLocales.set({});
        renderMetricsLocales.set({});

        expect(expectDefined(tableIntl.locales, 'table locale map')['qa']).toBeUndefined();
        expect(expectDefined(controlsIntl.locales, 'controls locale map')['qa']).toBeUndefined();
        expect(expectDefined(renderMetricsIntl.locales, 'render-metrics locale map')['qa']).toBeUndefined();
      });
    });
  });
});

describe('FEATURE: reactive intl provider hierarchy', () => {
  describe('GIVEN: signal-backed parent and child providers in all three locale domains', () => {
    let childInjector: EnvironmentInjector;
    let parentTable: WritableSignal<NatTableIntlStaticProviderConfig>;
    let childTable: WritableSignal<NatTableIntlStaticProviderConfig>;
    let parentControls: WritableSignal<NatTableControlsIntlStaticProviderConfig>;
    let childControls: WritableSignal<NatTableControlsIntlStaticProviderConfig>;
    let parentRenderMetrics: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;
    let childRenderMetrics: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;

    beforeEach(() => {
      parentTable = signal<NatTableIntlStaticProviderConfig>({ accessibilityText: { emptyState: 'Parent empty' } });
      childTable = signal<NatTableIntlStaticProviderConfig>({
        accessibilityText: { description: 'Child description', emptyState: 'Child empty' }
      });
      parentControls = signal<NatTableControlsIntlStaticProviderConfig>({ toolbar: { toolbarLabel: 'Parent toolbar' } });
      childControls = signal<NatTableControlsIntlStaticProviderConfig>({ search: { label: 'Child search' } });
      parentRenderMetrics = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { panel: { ariaLabel: 'Parent panel' } }
      });
      childRenderMetrics = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { column: { header: 'Child column' } }
      });

      configure(
        provideNatTableIntl(parentTable),
        provideNatTableControlsIntl(parentControls),
        provideNatTableRenderMetricsIntl(parentRenderMetrics)
      );

      childInjector = createEnvironmentInjector(
        [
          provideNatTableIntl(childTable),
          provideNatTableControlsIntl(childControls),
          provideNatTableRenderMetricsIntl(childRenderMetrics)
        ],
        TestBed.inject(EnvironmentInjector)
      );
    });

    afterEach(() => {
      childInjector.destroy();
    });

    describe('WHEN: parent and child sources change after resolving the child tokens', () => {
      it('THEN: it re-merges all domains and reveals parent copy when a child field is omitted', () => {
        const tableIntl = childInjector.get(NAT_TABLE_INTL);
        const controlsIntl = childInjector.get(NAT_TABLE_CONTROLS_INTL);
        const renderMetricsIntl = childInjector.get(NAT_TABLE_RENDER_METRICS_INTL);

        expect(tableAccess(tableIntl).emptyState).toBe('Child empty');

        parentTable.set({ accessibilityText: { emptyState: 'Updated parent empty' } });
        childTable.set({ accessibilityText: { description: 'Updated child description' } });
        parentControls.set({ toolbar: { toolbarLabel: 'Updated parent toolbar' } });
        childControls.set({ search: { label: 'Updated child search' } });
        parentRenderMetrics.set({ renderMetrics: { panel: { ariaLabel: 'Updated parent panel' } } });
        childRenderMetrics.set({ renderMetrics: { column: { header: 'Updated child column' } } });

        expect(tableAccess(tableIntl).emptyState).toBe('Updated parent empty');
        expect(tableAccess(tableIntl).description).toBe('Updated child description');
        expect(toolbarIntl(controlsIntl).toolbarLabel).toBe('Updated parent toolbar');
        expect(searchIntl(controlsIntl).label).toBe('Updated child search');
        expect(renderMetricsPanelIntl(renderMetricsIntl).ariaLabel).toBe('Updated parent panel');
        expect(renderMetricsColumnIntl(renderMetricsIntl).header).toBe('Updated child column');
      });
    });
  });

  describe('GIVEN: a reactive parent table provider and a static child override', () => {
    let childInjector: EnvironmentInjector;
    let parentTable: WritableSignal<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      parentTable = signal<NatTableIntlStaticProviderConfig>({
        accessibilityText: { emptyState: 'First parent empty state' }
      });
      configure(provideNatTableIntl(parentTable));

      childInjector = createEnvironmentInjector(
        [provideNatTableIntl({ accessibilityText: { description: 'Static child description' } })],
        TestBed.inject(EnvironmentInjector)
      );
    });

    afterEach(() => {
      childInjector.destroy();
    });

    describe('WHEN: the parent source changes after resolving the child token', () => {
      it('THEN: it updates inherited copy while preserving the static child override', () => {
        const childIntl = childInjector.get(NAT_TABLE_INTL);

        expect(tableAccess(childIntl).emptyState).toBe('First parent empty state');
        expect(tableAccess(childIntl).description).toBe('Static child description');

        parentTable.set({ accessibilityText: { emptyState: 'Second parent empty state' } });

        expect(tableAccess(childIntl).emptyState).toBe('Second parent empty state');
        expect(tableAccess(childIntl).description).toBe('Static child description');
      });
    });
  });

  describe('GIVEN: a static parent controls provider and a reactive child override', () => {
    let childControls: WritableSignal<NatTableControlsIntlStaticProviderConfig>;
    let childInjector: EnvironmentInjector;

    beforeEach(() => {
      childControls = signal<NatTableControlsIntlStaticProviderConfig>({ search: { label: 'First child search' } });
      configure(provideNatTableControlsIntl({ toolbar: { toolbarLabel: 'Static parent toolbar' } }));

      childInjector = createEnvironmentInjector([provideNatTableControlsIntl(childControls)], TestBed.inject(EnvironmentInjector));
    });

    afterEach(() => {
      childInjector.destroy();
    });

    describe('WHEN: the child source changes after resolving the child token', () => {
      it('THEN: it updates child copy while preserving the static parent copy', () => {
        const childIntl = childInjector.get(NAT_TABLE_CONTROLS_INTL);

        expect(toolbarIntl(childIntl).toolbarLabel).toBe('Static parent toolbar');
        expect(searchIntl(childIntl).label).toBe('First child search');

        childControls.set({ search: { label: 'Second child search' } });

        expect(toolbarIntl(childIntl).toolbarLabel).toBe('Static parent toolbar');
        expect(searchIntl(childIntl).label).toBe('Second child search');
      });
    });
  });

  describe('GIVEN: two child injectors with isolated overrides under one reactive parent', () => {
    let firstChild: EnvironmentInjector;
    let secondChild: EnvironmentInjector;
    let parentRenderMetrics: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;
    let firstChildRenderMetrics: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;
    let secondChildRenderMetrics: WritableSignal<NatTableRenderMetricsIntlStaticProviderConfig>;

    beforeEach(() => {
      parentRenderMetrics = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { panel: { ariaLabel: 'First parent panel' } }
      });
      firstChildRenderMetrics = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { column: { header: 'First child column' } }
      });
      secondChildRenderMetrics = signal<NatTableRenderMetricsIntlStaticProviderConfig>({
        renderMetrics: { column: { header: 'Second child column' } }
      });
      configure(provideNatTableRenderMetricsIntl(parentRenderMetrics));

      const parentInjector = TestBed.inject(EnvironmentInjector);

      firstChild = createEnvironmentInjector([provideNatTableRenderMetricsIntl(firstChildRenderMetrics)], parentInjector);
      secondChild = createEnvironmentInjector([provideNatTableRenderMetricsIntl(secondChildRenderMetrics)], parentInjector);
    });

    afterEach(() => {
      firstChild.destroy();
      secondChild.destroy();
    });

    describe('WHEN: one child and the shared parent change', () => {
      it('THEN: it isolates the child update and propagates only the parent update to both siblings', () => {
        const firstIntl = firstChild.get(NAT_TABLE_RENDER_METRICS_INTL);
        const secondIntl = secondChild.get(NAT_TABLE_RENDER_METRICS_INTL);

        firstChildRenderMetrics.set({ renderMetrics: { column: { header: 'Updated first child column' } } });

        expect(renderMetricsColumnIntl(firstIntl).header).toBe('Updated first child column');
        expect(renderMetricsColumnIntl(secondIntl).header).toBe('Second child column');

        parentRenderMetrics.set({ renderMetrics: { panel: { ariaLabel: 'Updated parent panel' } } });

        expect(renderMetricsPanelIntl(firstIntl).ariaLabel).toBe('Updated parent panel');
        expect(renderMetricsPanelIntl(secondIntl).ariaLabel).toBe('Updated parent panel');
        expect(renderMetricsColumnIntl(firstIntl).header).toBe('Updated first child column');
        expect(renderMetricsColumnIntl(secondIntl).header).toBe('Second child column');
      });
    });
  });

  describe('GIVEN: a child provider adapted from an Observable', () => {
    let childInjector: EnvironmentInjector;
    let childCopy$: Subject<NatTableIntlStaticProviderConfig>;
    let parentTable: WritableSignal<NatTableIntlStaticProviderConfig>;
    let subscriptionCleanup = vi.fn<() => void>();

    beforeEach(() => {
      childCopy$ = new Subject<NatTableIntlStaticProviderConfig>();
      parentTable = signal<NatTableIntlStaticProviderConfig>({
        accessibilityText: { description: 'First parent description' }
      });
      subscriptionCleanup = vi.fn<() => void>();
      configure(provideNatTableIntl(parentTable));

      childInjector = createEnvironmentInjector(
        [
          provideNatTableIntl(() =>
            toSignal(childCopy$.pipe(finalize(subscriptionCleanup)), {
              initialValue: {}
            })
          )
        ],
        TestBed.inject(EnvironmentInjector)
      );
    });

    afterEach(() => {
      if (!childInjector.destroyed) {
        childInjector.destroy();
      }
    });

    describe('WHEN: the child injector is destroyed after its stream has emitted', () => {
      it('THEN: it unsubscribes the child stream without affecting the parent provider', () => {
        const childIntl = childInjector.get(NAT_TABLE_INTL);
        const parentIntl = TestBed.inject(NAT_TABLE_INTL);

        expect(childCopy$.observed).toBe(true);

        childCopy$.next({ accessibilityText: { emptyState: 'Streamed child empty state' } });

        expect(tableAccess(childIntl).emptyState).toBe('Streamed child empty state');
        expect(tableAccess(childIntl).description).toBe('First parent description');

        childInjector.destroy();

        expect(childCopy$.observed).toBe(false);
        expect(subscriptionCleanup).toHaveBeenCalledOnce();

        parentTable.set({ accessibilityText: { description: 'Second parent description' } });

        expect(tableAccess(parentIntl).description).toBe('Second parent description');
      });
    });
  });

  describe('GIVEN: two application-scoped injectors with separate reactive providers', () => {
    let firstApplication: EnvironmentInjector;
    let secondApplication: EnvironmentInjector;
    let firstApplicationCopy: WritableSignal<NatTableIntlStaticProviderConfig>;
    let secondApplicationCopy: WritableSignal<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      configure();
      firstApplicationCopy = signal<NatTableIntlStaticProviderConfig>({
        accessibilityText: { emptyState: 'First application empty state' }
      });
      secondApplicationCopy = signal<NatTableIntlStaticProviderConfig>({
        accessibilityText: { emptyState: 'Second application empty state' }
      });

      const platformInjector = TestBed.inject(EnvironmentInjector);

      firstApplication = createEnvironmentInjector([provideNatTableIntl(firstApplicationCopy)], platformInjector);
      secondApplication = createEnvironmentInjector([provideNatTableIntl(secondApplicationCopy)], platformInjector);
    });

    afterEach(() => {
      if (!firstApplication.destroyed) {
        firstApplication.destroy();
      }
      secondApplication.destroy();
    });

    describe('WHEN: the first application updates and is destroyed', () => {
      it('THEN: it never changes the second application token or source state', () => {
        const firstIntl = firstApplication.get(NAT_TABLE_INTL);
        const secondIntl = secondApplication.get(NAT_TABLE_INTL);

        expect(firstIntl).not.toBe(secondIntl);

        firstApplicationCopy.set({ accessibilityText: { emptyState: 'Updated first application empty state' } });

        expect(tableAccess(firstIntl).emptyState).toBe('Updated first application empty state');
        expect(tableAccess(secondIntl).emptyState).toBe('Second application empty state');

        firstApplication.destroy();
        secondApplicationCopy.set({ accessibilityText: { emptyState: 'Updated second application empty state' } });

        expect(tableAccess(secondIntl).emptyState).toBe('Updated second application empty state');
      });
    });
  });
});

describe('FEATURE: asynchronous intl source adaptation', () => {
  describe('GIVEN: a multi-emission Observable adapted with toSignal in the provider factory', () => {
    let copyStream$: Subject<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      copyStream$ = new Subject<NatTableIntlStaticProviderConfig>();
      configure(
        provideNatTableIntl(() =>
          toSignal(copyStream$, {
            initialValue: {}
          })
        )
      );
    });

    describe('WHEN: the stream emits multiple values and completes', () => {
      it('THEN: it exposes each replacement and retains the last successful value', () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);

        expect(tableAccess(intl).emptyState).toBe('No rows match the current view.');

        copyStream$.next({ accessibilityText: { emptyState: 'First streamed empty state' } });
        expect(tableAccess(intl).emptyState).toBe('First streamed empty state');

        copyStream$.next({ accessibilityText: { emptyState: 'Second streamed empty state' } });
        expect(tableAccess(intl).emptyState).toBe('Second streamed empty state');

        copyStream$.complete();
        expect(tableAccess(intl).emptyState).toBe('Second streamed empty state');
      });
    });
  });

  describe('GIVEN: an Observable adapter that catches translation failures', () => {
    let copyStream$: Subject<NatTableIntlStaticProviderConfig>;
    let reportedErrors: unknown[];

    beforeEach(() => {
      copyStream$ = new Subject<NatTableIntlStaticProviderConfig>();
      reportedErrors = [];
      configure(
        provideNatTableIntl(() =>
          toSignal(
            copyStream$.pipe(
              catchError((error: unknown) => {
                reportedErrors.push(error);

                return of({});
              })
            ),
            { initialValue: {} }
          )
        )
      );
    });

    describe('WHEN: the stream errors after a successful value', () => {
      it('THEN: it reports the error and safely falls back to built-in copy', () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);
        const translationError = new Error('Translation stream failed');

        copyStream$.next({ accessibilityText: { emptyState: 'Successfully streamed empty state' } });
        expect(tableAccess(intl).emptyState).toBe('Successfully streamed empty state');

        copyStream$.error(translationError);

        expect(reportedErrors).toStrictEqual([translationError]);
        expect(() => tableAccess(intl).emptyState).not.toThrow();
        expect(tableAccess(intl).emptyState).toBe('No rows match the current view.');
      });
    });
  });

  describe('GIVEN: a Promise-backed Observable adapted with toSignal in the provider factory', () => {
    let resolveCopy!: (copy: NatTableIntlStaticProviderConfig) => void;
    let copyPromise: Promise<NatTableIntlStaticProviderConfig>;

    beforeEach(() => {
      copyPromise = new Promise<NatTableIntlStaticProviderConfig>((resolve) => {
        resolveCopy = resolve;
      });

      configure(
        provideNatTableIntl(() =>
          toSignal(from(copyPromise), {
            initialValue: {}
          })
        )
      );
    });

    describe('WHEN: the asynchronous copy resolves after the token is injected', () => {
      it('THEN: it keeps built-in copy while loading and exposes the resolved copy', async () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);

        expect(tableAccess(intl).emptyState).toBe('No rows match the current view.');

        resolveCopy({ accessibilityText: { emptyState: 'Asynchronously translated empty state' } });

        await vi.waitFor(() => {
          expect(tableAccess(intl).emptyState).toBe('Asynchronously translated empty state');
        });
      });
    });
  });

  describe('GIVEN: a resource-backed provider with a successful value', () => {
    let reloadResource!: () => boolean;
    let resolveLoads: Array<(copy: NatTableIntlStaticProviderConfig) => void>;

    beforeEach(() => {
      resolveLoads = [];
      configure(
        provideNatTableIntl(() => {
          const bundle = resource({
            params: () => 'en',
            loader: async (): Promise<NatTableIntlStaticProviderConfig> =>
              new Promise<NatTableIntlStaticProviderConfig>((resolve) => {
                resolveLoads.push(resolve);
              })
          });

          reloadResource = (): boolean => bundle.reload();

          return computed(() => (bundle.hasValue() ? bundle.value() : {}));
        })
      );
    });

    describe('WHEN: reloading after the first resource request resolves', () => {
      it('THEN: it retains the last good copy until the reload resolves', async () => {
        const intl = TestBed.inject(NAT_TABLE_INTL);

        await vi.waitFor(() => {
          expect(resolveLoads).toHaveLength(1);
        });
        expect(tableAccess(intl).emptyState).toBe('No rows match the current view.');

        resolveLoads[0]({ accessibilityText: { emptyState: 'First resource empty state' } });
        await vi.waitFor(() => {
          expect(tableAccess(intl).emptyState).toBe('First resource empty state');
        });

        expect(reloadResource()).toBe(true);
        await vi.waitFor(() => {
          expect(resolveLoads).toHaveLength(2);
        });
        expect(tableAccess(intl).emptyState).toBe('First resource empty state');

        resolveLoads[1]({ accessibilityText: { emptyState: 'Reloaded resource empty state' } });
        await vi.waitFor(() => {
          expect(tableAccess(intl).emptyState).toBe('Reloaded resource empty state');
        });
      });
    });
  });
});
