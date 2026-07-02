import { AxeBuilder } from '@axe-core/playwright';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Result } from 'axe-core';

/** WCAG 2.0 / 2.1 Level A + AA — the conformance bar AGENTS.md mandates for the table. */
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

/** Human-readable failure text so a red axe run names the rule + offending nodes, not just `[] !== [...]`. */
const formatViolations = (violations: readonly Result[]): string =>
  violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `    ${node.target.join(' ')}`).join('\n');

      return `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join('\n\n');

/**
 * Runs an axe-core WCAG A/AA scan and asserts zero violations.
 *
 * Pass `include` (a CSS selector) to scope the scan to one subtree — e.g. a single
 * docs-example preview — so the assertion covers the table under test, not unrelated
 * showcase chrome elsewhere on the page.
 */
export async function expectNoAxeViolations(page: Page, include?: string): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags([...WCAG_AA_TAGS]);
  const results = await (include ? builder.include(include) : builder).analyze();

  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}
