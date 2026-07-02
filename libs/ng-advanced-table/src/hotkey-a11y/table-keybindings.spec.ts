import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import type { NatTableRowActivateEvent } from '../common/row.type';
import { NatTable } from '../table/table';
import { buildRows } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryRequired } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: custom keybindings', () => {
    describe('WHEN: keybindings are overridden via the [keybindings] input', () => {
      it('THEN: it allows overriding keybindings via the [keybindings] input', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        @Component({
          selector: 'test-custom-keybindings-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface [keybindings]="keybindings">
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" (rowActivate)="onRowActivate($event)" />
            </nat-table-surface>
          `
        })
        class CustomKeybindingsHost {
          protected readonly rows = signal<Row[]>(buildRows(3));
          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'name',
              header: 'Service',
              meta: { label: 'Service', rowHeader: true },
              cell: (info) => info.getValue<string>()
            }
          ];

          protected readonly keybindings = {
            rowActivate: 'Space',
            columnReorderLeft: 'Ctrl+ArrowLeft',
            columnReorderRight: 'Ctrl+ArrowRight'
          };

          public readonly events: NatTableRowActivateEvent<Row>[] = [];

          protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
            this.events.push(event);
          }
        }

        // when:
        const customFixture = TestBed.createComponent(CustomKeybindingsHost);

        await customFixture.whenStable();
        customFixture.detectChanges();

        const firstRow = queryRequired<HTMLTableRowElement>(customFixture, 'tbody tr.data-row');

        // when:
        // 1. Try default 'Enter' - should NOT activate
        firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        customFixture.detectChanges();
        // then:
        expect(customFixture.componentInstance.events).toHaveLength(0);

        // when:
        // 2. Press the browser Space key value for the custom 'Space' shortcut - should activate.
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

        firstRow.dispatchEvent(spaceEvent);
        customFixture.detectChanges();
        // then:
        expect(customFixture.componentInstance.events).toHaveLength(1);
        expect(spaceEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: keybindings are partially customized', () => {
      it('THEN: it falls back to default keybindings for non-overridden properties when keybindings are partially customized', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        @Component({
          selector: 'test-partial-keybindings-host',
          imports: [NatTable, TestTableSurface],
          template: `
            <nat-table-surface [keybindings]="keybindings">
              <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
            </nat-table-surface>
          `
        })
        class PartialKeybindingsHost {
          protected readonly rows = signal<Row[]>(buildRows(3));
          protected readonly columns: ColumnDef<Row, unknown>[] = [
            {
              accessorKey: 'region',
              header: 'Region',
              meta: { label: 'Region' },
              cell: (info) => info.getValue<string>()
            }
          ];

          protected readonly keybindings = {
            rowActivate: 'a'
          };
        }

        // when:
        const partialFixture = TestBed.createComponent(PartialKeybindingsHost);

        await partialFixture.whenStable();
        partialFixture.detectChanges();

        const cell = queryRequired<HTMLElement>(partialFixture, 'tbody tr.data-row td[data-column-id="region"]');

        cell.innerHTML = '<button type="button" class="first">First</button><button type="button" class="second">Second</button>';
        const firstButton = cell.querySelector('button.first') as HTMLButtonElement;

        // when:
        cell.focus();
        // then:
        expect(document.activeElement).toBe(cell);

        // when:
        // Trigger 'Enter' (default cellEnterControl) on the cell
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true
        });

        cell.dispatchEvent(enterEvent);
        partialFixture.detectChanges();

        // then:
        // Should focus the first button inside the cell because default cellEnterControl is Enter
        expect(document.activeElement).toBe(firstButton);
        expect(enterEvent.defaultPrevented).toBe(true);
      });
    });
  });
});
