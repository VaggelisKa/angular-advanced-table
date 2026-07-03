import type { Signal } from '@angular/core';
import { computed, signal } from '@angular/core';

import type { Updater } from '@tanstack/angular-table';

import { resolveUpdater } from './state-seed.util';

/**
 * One controlled/internal state "slice" of {@link NatTableUserState}: a value that's
 * either driven by the caller (controlled mode) or tracked internally (uncontrolled
 * mode), with optional read/write normalization hooks.
 */
export type ControlledSlice<T> = {
  /** The merged value: the controlled source when defined, otherwise the internal signal. */
  readonly merged: Signal<T>;
  /** Resolves an `Updater<T>` against `merged()`, applying the write hook. */
  resolve(updater: Updater<T> | undefined): T;
  /** Writes `next` to the internal signal, but only while uncontrolled (no-op otherwise). */
  commit(next: T): void;
  /** Unconditionally writes `value` to the internal signal (seed path). */
  seed(value: T): void;
};

/**
 * Builds a {@link ControlledSlice} for one `NatTableUserState` field, deduplicating the
 * controlled/internal mirroring and read/write normalization that every slice needs.
 */
export const controlledSlice = <T>(
  controlled: () => T | undefined,
  initial: T,
  hooks: { readonly read?: (value: T) => T; readonly write?: (value: T) => T } = {}
): ControlledSlice<T> => {
  const read = hooks.read ?? ((value: T): T => value);
  const write = hooks.write ?? ((value: T): T => value);
  const internal = signal<T>(initial);
  const merged = computed<T>(() => read(controlled() ?? internal()));

  return {
    merged,
    resolve: (updater): T => write(resolveUpdater(merged(), updater)),
    commit: (next): void => {
      if (controlled() === undefined) {
        internal.set(next);
      }
    },
    seed: (value): void => internal.set(value)
  };
};
