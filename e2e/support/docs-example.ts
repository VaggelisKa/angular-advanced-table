import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export async function loadDocsExamplePreview(page: Page, exampleId: string, heading: string): Promise<void> {
  const exampleHeading = page.getByTestId(`docs-example-${exampleId}-title`);
  const previewPanel = page.getByTestId(`docs-example-${exampleId}-preview-panel`);

  await previewPanel.scrollIntoViewIfNeeded();
  await expect(exampleHeading).toHaveText(heading);
  await expect(exampleHeading).toBeVisible();
  await expect(previewPanel.locator('.docs-example-preview-placeholder')).toHaveCount(0);
}
