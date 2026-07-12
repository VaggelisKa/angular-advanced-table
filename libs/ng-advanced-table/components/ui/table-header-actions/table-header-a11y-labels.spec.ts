import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getOpenMenuHarness,
  getOpenMenuItem,
  getOpenMoveMenuItem,
  getOpenPinMenu,
  requireOpenMenu,
  textOf
} from '../../test-helpers/table-dom.helper';
import { CustomAccessibilityLabelsHost } from '../../test-helpers/table-label-hosts.helper';
import { ProviderAccessibilityLabelsHost } from '../../test-helpers/table-provider-host.helper';

describe('FEATURE: NatTable UI', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAccessibilityLabelsHost, ProviderAccessibilityLabelsHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: custom and provider accessibility labels', () => {
    describe('WHEN: custom accessibility labels drive the table controls and their interactions', () => {
      it('THEN: it uses caller-provided labels throughout the interaction flow', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const customFixture = TestBed.createComponent(CustomAccessibilityLabelsHost);

        customFixture.detectChanges();

        const nativeElement = customFixture.nativeElement as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const firstColumnChip = nativeElement.querySelector('nat-table-column-visibility .column-chip') as HTMLButtonElement;
        const firstColumnState = firstColumnChip.querySelector('.chip-count') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .page-size-container') as HTMLElement;
        const pageSizeSelect = nativeElement.querySelector('nat-table-page-size select') as HTMLSelectElement;
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

        expect(visibilityHeading.textContent.trim()).toBe('Kolonner');
        expect(visibilityCaption.textContent.trim()).toBe('4 af 4 synlige');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Kolonnesynlighed');
        expect(firstColumnChip.getAttribute('aria-label')).toBe('Skjul kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Synlig');

        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
        const firstPageSizeOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;

        expect(firstPageSizeOption.textContent.trim()).toBe('2 rækker');
        expect(firstPageSizeOption.getAttribute('aria-label')).toBe('Vis 2 rækker');

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

        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

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

        leftPinMenuItem.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        menuButton.click();
        customFixture.detectChanges();
        await customFixture.whenStable();
        customFixture.detectChanges();

        const updatedLeftPinMenuItem = getOpenMenuItem('left');
        const updatedRightPinMenuItem = getOpenMenuItem('right');

        expect(updatedLeftPinMenuItem.getAttribute('aria-label')).toBe('Frigør kolonne Service fra venstre');
        expect(textOf(updatedLeftPinMenuItem, '.column-menu-item__label')).toBe('Venstre');
        expect(updatedRightPinMenuItem.getAttribute('aria-label')).toBe('Fastgør kolonne Service til højre');
        expect(textOf(updatedRightPinMenuItem, '.column-menu-item__label')).toBe('Højre');

        firstColumnChip.click();
        customFixture.detectChanges();

        expect(firstColumnChip.getAttribute('aria-label')).toBe('Vis kolonne Service');
        expect(firstColumnState.textContent.trim()).toBe('Skjult');

        customFixture.destroy();
      });
    });

    describe('WHEN: provider accessibility labels update before a component input overrides them', () => {
      it('THEN: it updates existing controls before honoring the component input', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const providerFixture = TestBed.createComponent(ProviderAccessibilityLabelsHost);
        const providerHost = providerFixture.componentInstance;

        providerFixture.detectChanges();

        const nativeElement = providerFixture.nativeElement as HTMLElement;
        const toolbar = nativeElement.querySelector('nat-table-toolbar') as HTMLElement;
        const visibilityHeading = nativeElement.querySelector('nat-table-column-visibility .control-label') as HTMLElement;
        const visibilityCaption = nativeElement.querySelector('nat-table-column-visibility .control-caption') as HTMLElement;
        const visibilityGroup = nativeElement.querySelector('nat-table-column-visibility .chip-row') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .page-size-container') as HTMLElement;
        const pageSizeSelect = nativeElement.querySelector('nat-table-page-size select') as HTMLSelectElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const previousButton = nativeElement.querySelector('nat-table-pager .pager-button:first-child') as HTMLButtonElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;
        const scrollControl = nativeElement.querySelector('nat-table-scroll-control .scroll-control') as HTMLElement;
        const scrollPosition = nativeElement.querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;
        const sortButton = nativeElement.querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const menuButton = nativeElement.querySelector('thead th[data-column-id="name"] .menu-button') as HTMLButtonElement;
        const selectAllCheckbox = nativeElement.querySelector(
          'thead th[data-column-id="__natSelect"] input.nat-selection-checkbox'
        ) as HTMLInputElement;
        const firstRowCheckbox = nativeElement.querySelector(
          'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox'
        ) as HTMLInputElement;

        expect(toolbar.getAttribute('aria-label')).toBe('Provider table toolbar');
        expect(visibilityHeading.textContent.trim()).toBe('Provider columns');
        expect(visibilityCaption.textContent.trim()).toBe('Provider n5/n5');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Provider column visibility');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Provider page size group');
        const firstProviderOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;

        expect(firstProviderOption.textContent.trim()).toBe('n2 provider rows');
        expect(firstProviderOption.getAttribute('aria-label')).toBe('Provider show n2 rows');
        expect(pager.getAttribute('aria-label')).toBe('Provider pager');
        expect(pagerLabel.textContent.trim()).toBe('Provider page n2/n3');
        expect(previousButton.getAttribute('aria-label')).toBe('Provider previous');
        expect(nextButton.getAttribute('aria-label')).toBe('Provider next');
        expect(scrollControl.getAttribute('aria-label')).toBe('Provider horizontal scroll');
        expect(scrollPosition.textContent.trim()).toBe('Provider n0 percent');
        expect(sortButton.getAttribute('aria-label')).toBe('Provider sort Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Provider actions for Service');
        expect(selectAllCheckbox.getAttribute('aria-label')).toBe('Provider select all rows');
        expect(firstRowCheckbox.getAttribute('aria-label')).toBe('Provider select row svc-00003');

        menuButton.click();
        providerFixture.detectChanges();
        await providerFixture.whenStable();
        providerFixture.detectChanges();

        const providerMenu = await getOpenMenuHarness(providerFixture);

        const openMenu = getOpenPinMenu();
        const focusedMenuItem = getOpenMenuItem('left');

        expect(openMenu?.getAttribute('aria-label')).toBe('Provider menu for Service');
        expect(await (await providerMenu.getItems({ text: /Provider left/ }))[0].getText()).toContain('Provider left');
        expect(await (await providerMenu.getItems({ text: /Provider move right/ }))[0].getText()).toContain('Provider move right');

        focusedMenuItem.focus();

        expect(document.activeElement).toBe(focusedMenuItem);

        providerHost.useReactiveProviderIntl();
        await providerFixture.whenStable();

        const firstReactiveOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;
        const reactiveMenu = await getOpenMenuHarness(providerFixture);

        expect(nativeElement.querySelector('nat-table-toolbar')).toBe(toolbar);
        expect(nativeElement.querySelector('thead th[data-column-id="__natSelect"] input.nat-selection-checkbox')).toBe(
          selectAllCheckbox
        );
        expect(nativeElement.querySelector('tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox')).toBe(
          firstRowCheckbox
        );
        expect(getOpenPinMenu()).toBe(openMenu);
        expect(getOpenMenuItem('left')).toBe(focusedMenuItem);
        expect(document.activeElement).toBe(focusedMenuItem);
        expect(toolbar.getAttribute('aria-label')).toBe('Reactive table toolbar');
        expect(visibilityHeading.textContent.trim()).toBe('Reactive columns');
        expect(visibilityCaption.textContent.trim()).toBe('Reactive r5/r5');
        expect(visibilityGroup.getAttribute('aria-label')).toBe('Reactive column visibility');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Reactive page size group');
        expect(firstReactiveOption.textContent.trim()).toBe('r2 reactive rows');
        expect(firstReactiveOption.getAttribute('aria-label')).toBe('Reactive show r2 rows');
        expect(pager.getAttribute('aria-label')).toBe('Reactive pager');
        expect(pagerLabel.textContent.trim()).toBe('Reactive page r2/r3');
        expect(previousButton.getAttribute('aria-label')).toBe('Reactive previous');
        expect(nextButton.getAttribute('aria-label')).toBe('Reactive next');
        expect(scrollControl.getAttribute('aria-label')).toBe('Reactive horizontal scroll');
        expect(scrollPosition.textContent.trim()).toBe('Reactive r0 percent');
        expect(sortButton.getAttribute('aria-label')).toBe('Reactive sort Service');
        expect(menuButton.getAttribute('aria-label')).toBe('Reactive actions for Service');
        expect(selectAllCheckbox.getAttribute('aria-label')).toBe('Reactive select all rows');
        expect(firstRowCheckbox.getAttribute('aria-label')).toBe('Reactive select row svc-00003');
        expect(getOpenPinMenu()?.getAttribute('aria-label')).toBe('Reactive menu for Service');
        expect(await (await reactiveMenu.getItems({ text: /Reactive left/ }))[0].getText()).toContain('Reactive left');
        expect(await (await reactiveMenu.getItems({ text: /Reactive move right/ }))[0].getText()).toContain('Reactive move right');

        providerHost.pageSizeGroupAriaLabel.set('Input page size');
        await providerFixture.whenStable();

        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Input page size');

        providerFixture.destroy();
      });
    });
  });
});
