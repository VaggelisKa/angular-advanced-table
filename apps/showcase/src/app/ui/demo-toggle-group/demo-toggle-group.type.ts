/** One choice in an `app-demo-toggle-group`. */
export type DemoToggleOption<TValue extends string = string> = {
  readonly value: TValue;
  readonly label: string;
  /** Stable hook for automated tests, applied to the option's button. */
  readonly testId?: string;
};
