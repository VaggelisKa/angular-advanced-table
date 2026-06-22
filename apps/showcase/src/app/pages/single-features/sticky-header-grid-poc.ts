import { afterNextRender, Component, ElementRef, viewChild } from '@angular/core';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  region: string;
  utilization: string;
  value: number;
}

// Generate 50 items to ensure long vertical scrollability
const DEMO_DATA: DemoItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = index + 1;
  const categories = [
    'Cloud Compute',
    'Storage Bucket',
    'Serverless Function',
    'Database Instance',
  ];
  const statuses = ['Healthy', 'Degraded', 'Maintenance', 'Provisioning'];
  const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1'];

  return {
    id: `node-${id}`,
    name: `Resource Node ${id}`,
    category: categories[id % categories.length]!,
    status: statuses[id % statuses.length]!,
    region: regions[id % regions.length]!,
    utilization: `${30 + ((id * 17) % 65)}%`,
    value: 500 + ((id * 380) % 9500),
  };
});

@Component({
  selector: 'app-sticky-header-grid-poc',
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Sticky Header (CSS Grid)</h1>
        <p class="description">
          Demonstrates a sticky table header with horizontal scroll using CSS Grid and ARIA roles.
          The header sticks to the browser viewport without container height restrictions while the
          body scrolls horizontally.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Grid Table</h2>

          <div role="table" aria-label="Resource Node Utilization" class="grid-table">
            <!-- Header scroll container. Horizontally synced, vertically sticky. -->
            <div #headerScroll class="grid-header-scroll-wrapper">
              <div role="rowgroup" class="grid-header">
                <div role="row" class="grid-row header-row">
                  <div role="columnheader" class="grid-cell header-cell">Node Name</div>
                  <div role="columnheader" class="grid-cell header-cell">Category</div>
                  <div role="columnheader" class="grid-cell header-cell">Status</div>
                  <div role="columnheader" class="grid-cell header-cell">Region</div>
                  <div role="columnheader" class="grid-cell header-cell">CPU Utilization</div>
                  <div role="columnheader" class="grid-cell header-cell">Monthly Cost</div>
                </div>
              </div>
            </div>

            <!-- Body scroll container. Handles horizontal scrolling natively. -->
            <div #bodyScroll class="grid-body-scroll-wrapper">
              <div role="rowgroup" class="grid-body">
                @for (item of data; track item.id) {
                  <div role="row" class="grid-row body-row">
                    <div role="cell" class="grid-cell node-name">{{ item.name }}</div>
                    <div role="cell" class="grid-cell">{{ item.category }}</div>
                    <div role="cell" class="grid-cell">
                      <span class="status-badge" [class]="item.status.toLowerCase()">
                        {{ item.status }}
                      </span>
                    </div>
                    <div role="cell" class="grid-cell code-font">{{ item.region }}</div>
                    <div role="cell" class="grid-cell">{{ item.utilization }}</div>
                    <div role="cell" class="grid-cell cost-cell">
                      \${{ item.value.toLocaleString() }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Grid Table Layout</h2>
          <div class="control-panel">
            <p>
              This implementation uses CSS Grid and explicit ARIA roles to allow the header to stick
              to the viewport (without a parent height limit) while the table body scrolls
              horizontally.
            </p>
            <div class="tip">
              Scroll the page vertically to see the header stay pinned, and scroll the table body
              horizontally to see columns align.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* Ensure cards and grid container allow vertical overflow for viewport sticky header */
    .card {
      overflow: visible !important;
    }

    .grid-table {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--surface-border, #e5e7eb);
      border-radius: 8px;
      background-color: var(--surface-card, #ffffff);
      overflow: visible;
    }

    /* Declare animation outside @supports so Angular compiler can scope the animation-name correctly */
    .grid-header {
      animation-name: sync-scroll;
      animation-timing-function: linear;
      animation-fill-mode: both;
    }

    /* Support for native CSS scroll-driven animations (jank-free horizontal sync) */
    @supports (scroll-timeline-axis: inline) and (timeline-scope: --foo) {
      .grid-table {
        timeline-scope: --body-scroll;
      }
      .grid-header-scroll-wrapper {
        container-type: inline-size;
      }
      .grid-body-scroll-wrapper {
        scroll-timeline-name: --body-scroll;
        scroll-timeline-axis: inline;
      }
      .grid-header {
        animation-timeline: --body-scroll;
      }
    }

    @keyframes sync-scroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(calc(-100% + 100cqw));
      }
    }


    /* Header Container - sticky vertically, hides scrollbar horizontally */
    .grid-header-scroll-wrapper {
      position: sticky;
      top: 0;
      z-index: 10;
      overflow-x: hidden;
      background-color: var(--surface-ground, #f9fafb);
      border-bottom: 2px solid var(--surface-border, #e5e7eb);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    /* Body scroll container - normal vertical flow, horizontal scrollable */
    .grid-body-scroll-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }



    /* Ensure both header and body scroll elements have the same content width */
    .grid-header,
    .grid-body {
      min-width: max-content;
    }

    /* Grid layout matching columns exactly */
    .grid-row {
      display: grid;
      grid-template-columns: 200px 180px 140px 140px 150px 130px;
    }

    .grid-cell {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--text-color, #374151);
      border-bottom: 1px solid var(--surface-border, #f3f4f6);
    }

    .header-cell {
      font-weight: 600;
      color: var(--text-color-secondary, #4b5563);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: var(--surface-ground, #f9fafb);
      height: 48px;
    }

    .body-row:hover .grid-cell {
      background-color: var(--surface-hover, #f3f4f6);
    }

    .node-name {
      font-weight: 500;
      color: var(--primary-color, #2563eb);
    }

    .code-font {
      font-family: monospace;
      font-size: 13px;
      background-color: var(--surface-hover, #f3f4f6);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
    }

    .cost-cell {
      justify-content: flex-end;
      font-weight: 600;
    }

    /* Badge Styles */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.healthy {
      background-color: #d1fae5;
      color: #065f46;
    }

    .status-badge.degraded {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-badge.maintenance {
      background-color: #e0f2fe;
      color: #075985;
    }

    .status-badge.provisioning {
      background-color: #f3f4f6;
      color: #374151;
    }

    .features-list {
      margin: 16px 0;
      padding-left: 20px;
    }

    .features-list li {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
    }
  `,
})
export class StickyHeaderGridPocPage {
  protected readonly data = DEMO_DATA;

  private readonly headerScroll = viewChild<ElementRef<HTMLElement>>('headerScroll');
  private readonly bodyScroll = viewChild<ElementRef<HTMLElement>>('bodyScroll');

  constructor() {
    afterNextRender(() => {
      const bodyEl = this.bodyScroll()?.nativeElement;
      const headerEl = this.headerScroll()?.nativeElement;

      if (bodyEl && headerEl) {
        // Detect native CSS scroll-timeline and timeline-scope support
        const supportsScrollTimeline =
          CSS.supports('timeline-scope', '--foo') &&
          (CSS.supports('(scroll-timeline-axis: inline)') ||
            CSS.supports('(scroll-timeline: --foo inline)'));

        if (supportsScrollTimeline) {
          return; // Skip JS syncing if native CSS scroll-timeline is supported
        }

        let ticking = false;
        let lastKnownScrollLeft = 0;

        bodyEl.addEventListener(
          'scroll',
          () => {
            lastKnownScrollLeft = bodyEl.scrollLeft;

            if (!ticking) {
              window.requestAnimationFrame(() => {
                headerEl.scrollLeft = lastKnownScrollLeft;
                ticking = false;
              });
              ticking = true;
            }
          },
          { passive: true },
        );
      }
    });
  }
}
