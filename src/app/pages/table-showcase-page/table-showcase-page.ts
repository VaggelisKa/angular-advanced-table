import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Table } from 'advanced-table';
import {
  DATASET_OPTIONS,
  PAGE_SIZE_OPTIONS,
  SIMULATION_PROFILES,
  TableSimulation,
  type SimulationProfile,
} from './table-simulation';

const integerFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-table-showcase-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table],
  templateUrl: './table-showcase-page.html',
  styleUrl: './table-showcase-page.css',
})
export class TableShowcasePage {
  protected readonly simulation = inject(TableSimulation);
  protected readonly datasetOptions = DATASET_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly profiles = Object.entries(SIMULATION_PROFILES).map(
    ([value, config]) => ({
      value: value as SimulationProfile,
      ...config,
    }),
  );

  protected setDatasetSize(size: number): void {
    this.simulation.setDatasetSize(size);
  }

  protected setProfile(profile: SimulationProfile): void {
    this.simulation.setProfile(profile);
  }

  protected toggleSimulation(): void {
    this.simulation.toggleRunning();
  }

  protected runManualPulse(): void {
    this.simulation.pulse();
  }

  protected formatInteger(value: number): string {
    return integerFormatter.format(value);
  }

  protected formatCompact(value: number): string {
    return compactFormatter.format(value);
  }
}
