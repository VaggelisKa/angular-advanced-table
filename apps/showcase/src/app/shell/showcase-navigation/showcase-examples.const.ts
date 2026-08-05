import type { ShowcaseNavItem } from './showcase-navigation.type';

const navExample = (id: string, label: string, description: string, path: string): ShowcaseNavItem => ({
  id,
  label,
  description,
  path
});

export const showcaseExamples: readonly ShowcaseNavItem[] = [
  navExample('multiple-features', 'Multiple features', 'Kitchen sink demo', '/examples/multiple-features'),
  navExample('builder', 'Table builder', 'Interactive config', '/examples/builder'),
  navExample('table-to-list-basic', 'Basic list', 'Standalone nat-list composition', '/examples/table-to-list/basic'),
  navExample('table-to-list', 'Toggle', 'One engine driving table and list views', '/examples/table-to-list'),
  navExample(
    'table-to-list-controls',
    'List controls',
    'Consumer-owned sort, search, and visibility',
    '/examples/table-to-list/list-controls'
  ),
  navExample(
    'table-to-list-data-states',
    'Data states',
    'Loading, empty, and error list states',
    '/examples/table-to-list/data-states'
  ),
  navExample('table-to-list-pagination', 'Paginated', 'List paged by the pagination companion', '/examples/table-to-list/pagination'),
  navExample(
    'table-to-list-custom-cells',
    'Custom cells',
    'Text, component, and template cell rendering',
    '/examples/table-to-list/custom-cells'
  ),
  navExample(
    'table-to-list-row-selection',
    'Row selection',
    'Selection column and shared selection state',
    '/examples/table-to-list/row-selection'
  ),
  navExample('table-to-list-breakpoint', 'Breakpoint', 'Table from 768px up, list below', '/examples/table-to-list/breakpoint'),
  navExample(
    'table-to-list-multi-config',
    'Multi config',
    'Different column configs for table and list',
    '/examples/table-to-list/multi-config'
  ),
  navExample(
    'sticky-header-max-height',
    'Sticky header max height',
    'Sticky header with max height',
    '/examples/sticky-header-max-height'
  ),
  navExample(
    'pagination-sticky-alt',
    'Pagination sticky alt',
    'Different layout of pagination controls',
    '/examples/pagination-sticky-alt'
  ),
  navExample('sticky-no-overflow-x', 'Sticky no overflow x', 'Sticky header with no overflow x', '/examples/sticky-no-overflow-x'),
  navExample(
    'sticky-show-detailed-view',
    'Sticky show detailed view',
    'Sticky header with show detailed view',
    '/examples/sticky-show-detailed-view'
  )
];
