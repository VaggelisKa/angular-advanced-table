import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { afterEach, vi } from 'vitest';

import { NatTableRowRenderEmitter } from './row-render-emitter.directive';
import type { NatTableRowRenderedEvent } from '../common/row-render.type';

@Component({
  selector: 'test-row-render-emitter-host',
  imports: [NatTableRowRenderEmitter],
  template: `
    <table>
      <tbody>
        <tr
          [natTableRowRenderEmitter]="rowId()"
          [natTableRowRenderEnabled]="enabled()"
          [natTableRowRenderStartedAt]="renderStartedAt()"
          [natTableRowRenderToken]="renderToken()"
          (natTableRowRendered)="events.push($event)"></tr>
      </tbody>
    </table>
  `
})
class RowRenderEmitterHost {
  public readonly rowId = signal('row-1');
  public readonly renderToken = signal(1);
  public readonly renderStartedAt = signal(1_000);
  public readonly enabled = signal(true);
  public readonly events: NatTableRowRenderedEvent[] = [];
}

describe('FEATURE: NatTable row render emitter', () => {
  /** Pin `performance.now()` so emitted durations are exact rather than timing-dependent. */
  const setNow = (value: number): void => {
    vi.spyOn(performance, 'now').mockReturnValue(value);
  };

  const renderHost = async (): Promise<ComponentFixture<RowRenderEmitterHost>> => {
    const fixture = TestBed.createComponent(RowRenderEmitterHost);

    await fixture.whenStable();

    return fixture;
  };

  beforeEach(async () => {
    setNow(1_050);

    await TestBed.configureTestingModule({
      imports: [RowRenderEmitterHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  describe('GIVEN: row render events are enabled with a valid token and start time', () => {
    describe('WHEN: the row completes a render cycle', () => {
      it('THEN: it emits the row id, render token, and elapsed duration', async () => {
        const fixture = await renderHost();

        expect(fixture.componentInstance.events).toStrictEqual([{ rowId: 'row-1', renderToken: 1, durationMs: 50 }]);
      });
    });

    describe('WHEN: a render cycle completes in under a tenth of a millisecond', () => {
      it('THEN: it reports a floor of 0.1ms rather than zero', async () => {
        setNow(1_000);

        const fixture = await renderHost();

        expect(fixture.componentInstance.events[0]?.durationMs).toBe(0.1);
      });
    });

    describe('WHEN: a render cycle duration carries sub-decimal precision', () => {
      it('THEN: it rounds the reported duration to a single decimal place', async () => {
        setNow(1_012.3456);

        const fixture = await renderHost();

        expect(fixture.componentInstance.events[0]?.durationMs).toBe(12.3);
      });
    });
  });

  describe('GIVEN: a row that has already emitted for the current render token', () => {
    describe('WHEN: another render cycle runs with the same token and row', () => {
      it('THEN: it does not emit a duplicate event for that token', async () => {
        const fixture = await renderHost();

        fixture.componentInstance.renderStartedAt.set(1_002);

        await fixture.whenStable();

        expect(fixture.componentInstance.events).toHaveLength(1);
      });
    });

    describe('WHEN: a new render token is issued', () => {
      it('THEN: it emits again for the new token', async () => {
        const fixture = await renderHost();

        fixture.componentInstance.renderToken.set(2);

        await fixture.whenStable();

        expect(fixture.componentInstance.events.map((event) => event.renderToken)).toStrictEqual([1, 2]);
      });
    });
  });

  describe('GIVEN: row render events are disabled', () => {
    describe('WHEN: the row renders', () => {
      it('THEN: it emits nothing', async () => {
        const fixture = TestBed.createComponent(RowRenderEmitterHost);

        fixture.componentInstance.enabled.set(false);

        await fixture.whenStable();

        expect(fixture.componentInstance.events).toStrictEqual([]);
      });
    });
  });

  describe('GIVEN: a render cycle that has not been stamped yet', () => {
    describe('WHEN: the render token is still zero', () => {
      it('THEN: it emits nothing', async () => {
        const fixture = TestBed.createComponent(RowRenderEmitterHost);

        fixture.componentInstance.renderToken.set(0);

        await fixture.whenStable();

        expect(fixture.componentInstance.events).toStrictEqual([]);
      });
    });

    describe('WHEN: the render start timestamp is still zero', () => {
      it('THEN: it emits nothing', async () => {
        const fixture = TestBed.createComponent(RowRenderEmitterHost);

        fixture.componentInstance.renderStartedAt.set(0);

        await fixture.whenStable();

        expect(fixture.componentInstance.events).toStrictEqual([]);
      });
    });
  });
});
