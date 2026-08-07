/** One label/value readout in an `app-demo-facts` list. */
export type DemoFact = {
  readonly label: string;
  readonly value: string;
  /** Stable hook for automated tests, applied to the value cell. */
  readonly testId?: string;
};
