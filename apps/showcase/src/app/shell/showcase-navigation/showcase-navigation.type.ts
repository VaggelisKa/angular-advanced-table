export type ShowcaseNavItem = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly path: string;
};

export type ShowcaseDoc = ShowcaseNavItem;

export type ShowcaseNavGroup = {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly items: readonly ShowcaseNavItem[];
};

export type ShowcaseNavSection = {
  readonly id: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly items: readonly ShowcaseNavItem[];
  readonly groups: readonly ShowcaseNavGroup[];
};
