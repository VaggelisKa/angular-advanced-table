import type { RowData } from '@tanstack/angular-table';

import type { NatTableBodyRenderPlan, NatTableRenderedBodyRow } from '../common/row-render-strategy.type';

const SLOT_KEY_PREFIX = 'nat-table-slot:';

/**
 * Identity of one rendered body slot: loaded rows keep their stable TanStack
 * row id, placeholder slots key on their logical index. The prefix keeps a
 * placeholder key from colliding with a consumer row id.
 */
export const getNatTableBodyRowIdentity = <TData extends RowData>(renderedRow: NatTableRenderedBodyRow<TData>): string =>
  renderedRow.kind === 'row' ? renderedRow.row.id : `nat-table-placeholder:${renderedRow.logicalIndex}`;

/**
 * Freed slots in render order, consumed from the front (`next`) and, for rows
 * entering above every kept row, from the back (`end`) without reindexing.
 */
type SlotQueue = { readonly slots: number[]; next: number; end: number };

const createQueue = (): SlotQueue => ({ slots: [], next: 0, end: 0 });

const takeSlot = (queue: SlotQueue): number | undefined => (queue.next < queue.end ? queue.slots[queue.next++] : undefined);

const takeLastSlot = (queue: SlotQueue | undefined): number | undefined =>
  queue && queue.next < queue.end ? queue.slots[--queue.end] : undefined;

/** Moves a gap's unclaimed slots to the shared queue of slots freed in earlier gaps. */
const releaseGap = (gap: SlotQueue, earlierGaps: SlotQueue): void => {
  for (let index = gap.next; index < gap.end; index += 1) {
    earlierGaps.slots.push(gap.slots[index]);
  }

  earlierGaps.end = earlierGaps.slots.length;
};

/**
 * Splits the slots of rows that are not kept into the gaps between kept rows:
 * entry `n` holds, in order, the slots rendered after the `n`-th kept row.
 */
const collectFreedSlotsByGap = (
  previous: readonly (readonly [identity: string, slot: number])[],
  kept: ReadonlySet<string>
): SlotQueue[] => {
  const gaps: SlotQueue[] = [createQueue()];

  for (const [identity, slot] of previous) {
    if (kept.has(identity)) {
      gaps.push(createQueue());
    } else {
      const gap = gaps[gaps.length - 1];

      gap.slots.push(slot);
      gap.end = gap.slots.length;
    }
  }

  return gaps;
};

/**
 * Assigns every rendered identity a reusable view slot, in render order.
 *
 * Identities that stay mounted keep their slot, so a row that stays in the
 * window (the focused row included) is never handed to another row. Entering
 * identities take over freed slots in the same gap between kept rows, in
 * order, falling back to slots freed in earlier gaps and then to new slots.
 * That mirrors how Angular's `@for` reconciles from the start of the list: it
 * updates those views in place or re-attaches views it already detached, so
 * it never has to detach a kept row (which would blur a focused cell) to
 * reach a slot further down.
 *
 * Rows entering above every kept row (scrolling up) also take the slots freed
 * after the last kept row, last slot first: Angular moves each of those views
 * from the end of the list to the front on its own. With a single kept row
 * Angular would swap that row instead, so they get new slots then.
 */
export const assignNatTableBodyRowSlots = (
  identities: readonly string[],
  previous: readonly (readonly [identity: string, slot: number])[] = []
): ReadonlyMap<string, number> => {
  const previousSlots = new Map(previous);
  const kept = new Set(identities.filter((identity) => previousSlots.has(identity)));
  const gaps = collectFreedSlotsByGap(previous, kept);
  const earlierGaps = createQueue();
  const trailingGap = kept.size > 1 ? gaps[gaps.length - 1] : undefined;
  const slots = new Map<string, number>();
  let nextSlot = previous.reduce((highest, [, slot]) => Math.max(highest, slot + 1), 0);
  let gapIndex = 0;

  for (const identity of identities) {
    const keptSlot = kept.has(identity) ? previousSlots.get(identity) : undefined;

    if (slots.has(identity)) {
      continue;
    }

    if (keptSlot === undefined) {
      const borrowFrom = gapIndex === 0 ? trailingGap : undefined;

      slots.set(identity, takeSlot(gaps[gapIndex]) ?? takeLastSlot(borrowFrom) ?? takeSlot(earlierGaps) ?? nextSlot++);
      continue;
    }

    releaseGap(gaps[gapIndex], earlierGaps);
    gapIndex += 1;
    slots.set(identity, keptSlot);
  }

  return slots;
};

/**
 * Stamps every row of a windowed body plan with the `@for` track key of its
 * reusable view slot. The key has to travel on the item: Angular re-evaluates
 * the track expression for the previously rendered items too, so a key looked
 * up from the latest slot map would orphan every row that just left.
 */
export const assignNatTableBodyPlanTrackKeys = <TData extends RowData>(
  plan: NatTableBodyRenderPlan<TData>,
  previous: NatTableBodyRenderPlan<TData> | undefined
): NatTableBodyRenderPlan<TData> => {
  const previousSlots: (readonly [string, number])[] = [];

  for (const renderedRow of previous?.rows ?? []) {
    const slot = Number(renderedRow.trackKey?.slice(SLOT_KEY_PREFIX.length));

    if (renderedRow.trackKey?.startsWith(SLOT_KEY_PREFIX) && Number.isInteger(slot)) {
      previousSlots.push([getNatTableBodyRowIdentity(renderedRow), slot]);
    }
  }

  const slots = assignNatTableBodyRowSlots(plan.rows.map(getNatTableBodyRowIdentity), previousSlots);

  return {
    ...plan,
    rows: plan.rows.map((renderedRow) => ({
      ...renderedRow,
      trackKey: `${SLOT_KEY_PREFIX}${slots.get(getNatTableBodyRowIdentity(renderedRow)) ?? ''}`
    }))
  };
};
