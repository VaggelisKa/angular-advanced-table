import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const outputRoots = ['dist/apps/showcase/browser', 'dist/apps/showcase'];
const outputRoot = outputRoots.find((candidate) => existsSync(join(candidate, 'index.html')));

if (!outputRoot) {
  throw new Error(`Could not find a built showcase output under ${outputRoots.join(' or ')}.`);
}

function readRouteHtml(routePath) {
  const htmlPaths = [join(outputRoot, routePath, 'index.html'), join(outputRoot, `${routePath}.html`)];
  const htmlPath = htmlPaths.find((candidate) => existsSync(candidate));

  if (!htmlPath) {
    throw new Error(`Could not find prerendered HTML for /${routePath}. Checked: ${htmlPaths.join(', ')}`);
  }

  return readFileSync(htmlPath, 'utf8');
}

function assertContains(html, expectedText, routePath) {
  if (!html.includes(expectedText)) {
    throw new Error(`Expected /${routePath} prerendered HTML to contain "${expectedText}".`);
  }
}

function assertNotBlankShell(html, routePath) {
  if (/<app-root[^>]*>\s*<\/app-root>/.test(html)) {
    throw new Error(`Expected /${routePath} to contain prerendered app content, but it only has a blank app shell.`);
  }
}

function assertNotRedirectDocument(html, routePath) {
  if (html.includes('<title>Redirecting</title>') || html.includes('Redirecting to <a')) {
    throw new Error(`Expected /${routePath || ''} to contain prerendered app content, but it is a static redirect document.`);
  }
}

const quickStartRoute = 'docs/quick-start';
const quickStartHtml = readRouteHtml(quickStartRoute);

assertNotBlankShell(quickStartHtml, quickStartRoute);
assertContains(quickStartHtml, 'Start with', quickStartRoute);
assertContains(quickStartHtml, 'First Table', quickStartRoute);
assertContains(quickStartHtml, 'Angular Advanced Table Docs', quickStartRoute);
assertContains(quickStartHtml, 'property="og:url"', quickStartRoute);
assertContains(quickStartHtml, 'content="/docs/quick-start"', quickStartRoute);

const docsIndexHtml = readRouteHtml('docs');

assertContains(docsIndexHtml, 'id="showcase-initial-theme"', 'docs');
assertContains(docsIndexHtml, '--sc-bg: #0b0d10', 'docs');
assertContains(docsIndexHtml, 'data-testid="showcase-nav-link-quick-start"', 'docs');
assertContains(docsIndexHtml, 'aria-current="page"', 'docs');

for (const routePath of ['', 'docs', 'examples']) {
  const routeHtml = readRouteHtml(routePath);

  assertNotRedirectDocument(routeHtml, routePath);

  if (routePath === '' || routePath === 'docs') {
    assertContains(routeHtml, 'data-testid="showcase-nav-link-quick-start"', routePath);
  }
}

console.log(`Verified prerendered showcase docs HTML in ${outputRoot}.`);
