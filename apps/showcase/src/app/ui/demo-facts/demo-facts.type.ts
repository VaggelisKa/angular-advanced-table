/** One label/value readout in an `app-demo-facts` list. */
export type DemoFact = {
  readonly label: string;
  readonly value: string;
  /**
   * Stable hook for automated tests. Applied to the value cell, with a
   * `-label` suffixed variant on the label cell. They are separate elements
   * with no text node between them, so assert on one or the other rather than
   * on their concatenation.
   */
  readonly testId?: string;
};
