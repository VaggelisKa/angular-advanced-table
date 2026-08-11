import { Component, computed, viewChild } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { NatTableVirtualScroll } from 'ng-advanced-table/virtual-scroll';

import { DemoAside, DemoFacts, DemoLayout, DemoSection } from '../../../ui';
import type { DemoFact } from '../../../ui';
import { buildDemoItems, demoItemColumns } from '../demo-data';
import type { DemoItem } from '../demo-data';

@Component({
  selector: 'app-virtual-scroll',
  imports: [NatTable, NatTableSurface, NatTableVirtualScroll, DemoAside, DemoFacts, DemoLayout, DemoSection],
  templateUrl: './virtual-scroll.html',
  styleUrl: './virtual-scroll.css'
})
export class VirtualScroll {
  protected readonly data = buildDemoItems(5000);
  protected readonly columns = demoItemColumns;

  protected readonly virtualScroll = viewChild.required<NatTableVirtualScroll<DemoItem>>('virtualScroll');

  protected readonly facts = computed<DemoFact[]>(() => {
    const range = this.virtualScroll().renderedRowRange();

    return [
      { label: 'Total rows', value: String(this.data.length), testId: 'virtual-scroll-total-rows' },
      {
        label: 'Mounted window',
        value: `${range.start + 1} – ${Math.min(range.end, this.data.length)}`,
        testId: 'virtual-scroll-mounted-window'
      }
    ];
  });

  protected scrollToRow(index: number): void {
    this.virtualScroll().scrollToIndex(index);
  }
}
