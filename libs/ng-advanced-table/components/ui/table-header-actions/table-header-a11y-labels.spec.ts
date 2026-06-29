import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getOpenMenuHarness,
  getOpenMenuItem,
  getOpenMoveMenuItem,
  getOpenPinMenu,
  requireOpenMenu,
  textOf
} from '../../test-helpers/table-ui-dom.helper';
import { CustomAccessibilityLabelsHost } from '../../test-helpers/table-ui-label-hosts.helper';
import { ProviderAccessibilityLabelsHost } from '../../test-helpers/table-ui-provider-host.helper';

describe('FEATURE: NatTable UI', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAccessibilityLabelsHost, ProviderAccessibilityLabelsHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: custom and provider accessibility labels', () => {
    describe('WHEN: the table with custom accessibility labels renders', () => {
      it('THEN: it renders caller-provided accessibility labels across the UI controls', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const customFixture = TestBed.createComponent(CustomAccessibilityLabelsHost);

        customFixture.detectChanges();

        const nativeElement = customFixture.nativeElement as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const firstColumnChip = nativeElement.querySelector('nat-table-column-visibility .column-chip') as HTMLButtonElement;
        const firstColumnState = firstColumnChip.querySelector('.chip-count') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .chip-row') as HTMLElement;
        const pageSizeButton = nativeElement.querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const scrollControl = nativeElement.querySelector('nat-table-scroll-control .scroll-control') as HTMLElement;
        const scrollLeftButton = nativeElement.querySelector('nat-table-scroll-control .scroll-button-left') as HTMLButtonElement;
        const scrollRightButton = nativeElement.querySelector('nat-table-scroll-control .scroll-button-right') as HTMLButtonElement;
        const scrollRange = nativeElement.querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;
        const scrollPosition = nativeElement.querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;
        const previousButton = nativeElement.querySelector('nat-table-pager .pager-button:first-child') as HTMLButtonElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;
        const sortButton = nativeElement.querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = nativeElement.querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;

        // then: all custom labels are rendered in the UI controls
        expect(visibilityHeading.textContent.trim()).toBe('Kolonner');
        expect(visibilityCaption.textContent.trim()).toBe('4 af 4 synlige');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Kolonnesynlighed');
        expect(firstColumnChip.getAttribute('aria-label')).toBe('Skjul kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Synlig');

        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
        expect(pageSizeButton.textContent.trim()).toBe('2 rækker');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('Vis 2 rækker');

        expect(pager.getAttribute('aria-label')).toBe('Sideskift');
        expect(pagerLabel.textContent.trim()).toBe('Side 2 af 3');
        expect(previousButton.getAttribute('aria-label')).toBe('Forrige side');
        expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

        expect(scrollControl.getAttribute('aria-label')).toBe('Vandret tabelrulning');
        expect(scrollLeftButton.getAttribute('aria-label')).toBe('Rul tabel til venstre');
        expect(scrollRightButton.getAttribute('aria-label')).toBe('Rul tabel til højre');
        expect(scrollRange.getAttribute('aria-label')).toBe('Vandret rulleposition');
        expect(scrollPosition.textContent.trim()).toBe('0 procent');

        expect(sortButton.getAttribute('aria-label')).toBe('Sorter Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Kolonnehandlinger for Service');

        // when: the column actions menu is opened
        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        // then: menu and pin items use custom labels
        expect(requireOpenMenu().getAttribute('aria-label')).toBe('Kolonnehandlinger for Service');

        const leftPinMenuItem = getOpenMenuItem('left');
        const rightPinMenuItem = getOpenMenuItem('right');
        const leftMoveMenuItem = getOpenMoveMenuItem('left');
        const rightMoveMenuItem = getOpenMoveMenuItem('right');

        expect(leftPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til venstre');
        expect(textOf(leftPinMenuItem, '.column-menu-item__label')).toBe('Venstre');
        expect(rightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
        expect(textOf(rightPinMenuItem, '.column-menu-item__label')).toBe('Højre');
        expect(leftMoveMenuItem.getAttribute('aria-label')).toBe('Flyt kolonne Service til venstre');
        expect(rightMoveMenuItem.getAttribute('aria-label')).toBe('Flyt kolonne Service til højre');
        expect(textOf(rightMoveMenuItem, '.column-menu-item__label')).toBe('Flyt til højre');

        // when: the left pin item is clicked then the menu is reopened
        leftPinMenuItem.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        // when: menu is reopened after pinning
        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        // then: unpin label is shown with custom text
        expect(updatedLeftPinMenuItem.getAttribute('aria-label')).toBe('Frigør kolonne Service fra venstre');
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Venstre');
        expect(updatedRightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
        expect(textOf(updatedRightPinMenuItem, '.column-menu-item__label')).toBe('Højre');

        // when: the column chip is clicked to hide the column
        firstColumnChip.click();
        customFixture.detectChanges();

        // then: chip label and state update
        expect(firstColumnChip.getAttribute('aria-label')).toBe('Vis kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Skjult');

        customFixture.destroy();
      });
    });

    describe('WHEN: the table with provider accessibility labels renders', () => {
      it('THEN: it uses provider accessibility labels and lets component inputs override them', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const providerFixture = TestBed.createComponent(ProviderAccessibilityLabelsHost);
        const providerHost = providerFixture.componentInstance;

        providerFixture.detectChanges();

        const nativeElement = providerFixture.nativeElement as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .chip-row') as HTMLElement;
        const pageSizeButton = nativeElement.querySelector('nat-table-page-size .chip') as HTMLButtonElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const previousButton = nativeElement.querySelector('nat-table-pager .pager-button:first-child') as HTMLButtonElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;
        const scrollControl = nativeElement.querySelector('nat-table-scroll-control .scroll-control') as HTMLElement;
        const scrollPosition = nativeElement.querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;
        const sortButton = nativeElement.querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = nativeElement.querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;

        // then: provider labels are rendered
        expect(visibilityHeading.textContent.trim()).toBe('Provider columns');
        expect(visibilityCaption.textContent.trim()).toBe('Provider n4/n4');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Provider column visibility');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Provider page size group');
        expect(pageSizeButton.textContent.trim()).toBe('n2 provider rows');
        expect(pageSizeButton.getAttribute('aria-label')).toBe('Provider show n2 rows');
        expect(pager.getAttribute('aria-label')).toBe('Provider pager');
        expect(pagerLabel.textContent.trim()).toBe('Provider page n2/n3');
        expect(previousButton.getAttribute('aria-label')).toBe('Provider previous');
        expect(nextButton.getAttribute('aria-label')).toBe('Provider next');
        expect(scrollControl.getAttribute('aria-label')).toBe('Provider horizontal scroll');
        expect(scrollPosition.textContent.trim()).toBe('Provider n0 percent');
        expect(sortButton.getAttribute('aria-label')).toBe('Provider sort Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Provider actions for Service');

        // when: the menu is opened
        menuButton.click();
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        const providerMenu = await getOpenMenuHarness(providerFixture);

        // then: provider menu labels are used
        expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Provider menu for Service');
        expect(await (await providerMenu.getItems({ text: /Provider left/ }))[0].getText()).toContain('Provider left');
        expect(await (await providerMenu.getItems({ text: /Provider move right/ }))[0].getText()).toContain('Provider move right');

        // when: a component-input label overrides the provider label
        providerHost.pageSizeGroupAriaLabel.set('Input page size');
        providerFixture.detectChanges();

        // then: component input takes precedence
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Input page size');

        providerFixture.destroy();
      });
    });
  });
});
