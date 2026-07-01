import { Injectable, afterNextRender, computed, effect, signal } from '@angular/core';

import { DEFAULT_SIMULATION_TIMESTAMP, SIMULATION_PROFILES } from '../common';
import type { SimulationProfile, SimulationRow, SimulationStatusCounts } from '../common';
import { buildDataset, mutateRows, roundToSingleDecimal } from '../utils/table-simulation.util';

@Injectable({
  providedIn: 'root'
})
export class TableSimulation {
  private readonly datasetSizeSignal = signal<number>(12000);
  private readonly profileSignal = signal<SimulationProfile>('balanced');
  private readonly isRunningSignal = signal(true);
  private readonly rowsSignal = signal<SimulationRow[]>(buildDataset(this.datasetSizeSignal()));
  private readonly lastMutationSizeSignal = signal(0);
  private readonly lastCycleDurationMsSignal = signal(0);
  private readonly lastTickAtSignal = signal(DEFAULT_SIMULATION_TIMESTAMP);
  private readonly totalMutationsSignal = signal(0);
  private readonly browserReadySignal = signal(false);

  public readonly datasetSize = this.datasetSizeSignal.asReadonly();
  public readonly profile = this.profileSignal.asReadonly();
  public readonly isRunning = this.isRunningSignal.asReadonly();
  public readonly rows = this.rowsSignal.asReadonly();
  public readonly lastMutationSize = this.lastMutationSizeSignal.asReadonly();
  public readonly lastCycleDurationMs = this.lastCycleDurationMsSignal.asReadonly();
  public readonly lastTickAt = this.lastTickAtSignal.asReadonly();
  public readonly totalMutations = this.totalMutationsSignal.asReadonly();
  public readonly profilePreset = computed(() => SIMULATION_PROFILES[this.profileSignal()]);

  private readonly marketSnapshot = computed(() => {
    const counts: SimulationStatusCounts = {
      Advancing: 0,
      Watching: 0,
      Declining: 0,
      Halted: 0
    };
    let positiveMoverCount = 0;
    const rows = this.rowsSignal();

    for (const row of rows) {
      counts[row.status] += 1;

      if (row.changePercent > 0) {
        positiveMoverCount += 1;
      }
    }

    const total = rows.length || 1;
    const weightedPositive = counts.Advancing + counts.Watching * 0.5;
    const marketBreadth = Math.round((weightedPositive / total) * 100);

    return {
      counts,
      positiveMoverCount,
      marketBreadth
    };
  });

  public readonly statusCounts = computed<SimulationStatusCounts>(() => this.marketSnapshot().counts);

  public readonly marketBreadth = computed(() => this.marketSnapshot().marketBreadth);
  public readonly positiveMoverCount = computed(() => this.marketSnapshot().positiveMoverCount);

  public constructor() {
    afterNextRender({ write: () => this.browserReadySignal.set(true) });

    effect((onCleanup) => {
      if (!this.browserReadySignal() || !this.isRunningSignal()) {
        return;
      }

      const timer = globalThis.setInterval(() => this.pulse(), this.profilePreset().tickIntervalMs);

      onCleanup(() => globalThis.clearInterval(timer));
    });
  }

  public setDatasetSize(size: number): void {
    if (size === this.datasetSizeSignal()) {
      return;
    }

    this.datasetSizeSignal.set(size);
    this.rowsSignal.set(buildDataset(size));
    this.resetMutationStats();
  }

  public setProfile(profile: SimulationProfile): void {
    this.profileSignal.set(profile);
  }

  public toggleRunning(): void {
    this.isRunningSignal.update((value) => !value);
  }

  public pause(): void {
    this.isRunningSignal.set(false);
  }

  public pulse(): void {
    const currentRows = this.rowsSignal();

    if (!currentRows.length) {
      return;
    }

    const now = Date.now();
    const startedAt = performance.now();
    const { rows, updatedCount } = mutateRows(currentRows, this.profilePreset().mutationBatchSize, now);

    this.rowsSignal.set(rows);
    this.lastMutationSizeSignal.set(updatedCount);
    this.lastTickAtSignal.set(now);
    this.lastCycleDurationMsSignal.set(roundToSingleDecimal(performance.now() - startedAt));
    this.totalMutationsSignal.update((total) => total + updatedCount);
  }

  private resetMutationStats(): void {
    this.lastMutationSizeSignal.set(0);
    this.lastCycleDurationMsSignal.set(0);
    this.lastTickAtSignal.set(DEFAULT_SIMULATION_TIMESTAMP);
    this.totalMutationsSignal.set(0);
  }
}
