import type { LIST_STATE_VIEWS } from './list-state.const';

/** Body states that render a state item rather than rows. */
export type NatListStateKey = keyof typeof LIST_STATE_VIEWS;

/** Rendered presentation for one non-row body state. */
export type NatListStateView = {
  /** `list-state` base class plus the per-state modifier. */
  readonly className: string;
  /** Stable test hook for the state item. */
  readonly testId: string;
  /** The body state this item represents. */
  readonly state: NatListStateKey;
  /** Localized message rendered when no consumer template is projected. */
  readonly message: string;
};
