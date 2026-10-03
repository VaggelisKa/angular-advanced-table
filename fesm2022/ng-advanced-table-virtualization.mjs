import * as i0 from "@angular/core";
import { DestroyRef, Directive, ElementRef, Injectable, NgZone, PLATFORM_ID, afterNextRender, afterRenderEffect, computed, effect, inject, input, isDevMode, output, signal, untracked } from "@angular/core";
import { NAT_TABLE_BODY_STATE, NAT_TABLE_ROW_WINDOW_HOST, NatTableRowRenderStrategyRegistry, NatTableService, hasNatTableStateValueChanged } from "ng-advanced-table";
import { isPlatformBrowser } from "@angular/common";
const isOwnedNatTableElement = (host, element) => element.closest("nat-table") === host;
const findOwnedNatTableAncestor = (host, element, selector) => {
	if (!(element instanceof Element)) return null;
	let candidate = element.closest(selector);
	while (candidate && host.contains(candidate)) {
		if (isOwnedNatTableElement(host, candidate)) return candidate;
		candidate = candidate.parentElement?.closest(selector) ?? null;
	}
	return null;
};
const findOwnedNatTableCell = (host, target) => target instanceof Element && isOwnedNatTableElement(host, target) ? findOwnedNatTableAncestor(host, target, "[ngGridCell][data-column-id]") : null;
const findOwnedNatTablePlaceholderRow = (host, target) => findOwnedNatTableAncestor(host, target, "tr.placeholder-row[data-row-index]");
const findOwnedNatTableBodyRow = (host, target) => findOwnedNatTableAncestor(host, target, "tr.data-row[data-row-index]");
const queryOwnedNatTableElements = (host, selector) => [...host.querySelectorAll(selector)].filter((candidate) => isOwnedNatTableElement(host, candidate));
var NatTableVirtualLayoutService = class NatTableVirtualLayoutService {
	state = inject(NAT_TABLE_ROW_WINDOW_HOST);
	elementRef = inject(ElementRef);
	ngZone = inject(NgZone);
	destroyRef = inject(DestroyRef);
	isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	resizeObserver = null;
	observedCaption = null;
	viewportFrame = null;
	bodyOffset = signal(0, ...ngDevMode ? [{ debugName: "bodyOffset" }] : /* istanbul ignore next */ []);
	stickyOverlayHeight = signal(0, ...ngDevMode ? [{ debugName: "stickyOverlayHeight" }] : /* istanbul ignore next */ []);
	viewportHeight = signal(0, ...ngDevMode ? [{ debugName: "viewportHeight" }] : /* istanbul ignore next */ []);
	constructor() {
		afterRenderEffect({
			earlyRead: () => {
				this.state.resolvedCaption();
				this.state.headerRowCount();
				this.state.stickyHeader();
				return this.readMeasurements();
			},
			write: (measurements) => {
				this.syncCaptionObservation();
				this.applyMeasurements(measurements());
			}
		});
		afterNextRender(() => {
			this.observeLayout();
			this.observeViewport();
		});
		this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
	}
	measure() {
		if (!this.isBrowser) return;
		this.applyMeasurements(this.readMeasurements());
	}
	observeViewport() {
		this.ngZone.runOutsideAngular(() => {
			window.addEventListener("resize", this.onViewportChange, { passive: true });
			window.addEventListener("orientationchange", this.onViewportChange, { passive: true });
		});
		this.destroyRef.onDestroy(() => {
			window.removeEventListener("resize", this.onViewportChange);
			window.removeEventListener("orientationchange", this.onViewportChange);
			if (this.viewportFrame !== null) {
				cancelAnimationFrame(this.viewportFrame);
				this.viewportFrame = null;
			}
		});
	}
	onViewportChange = () => {
		if (this.viewportFrame !== null) return;
		this.viewportFrame = requestAnimationFrame(() => {
			this.viewportFrame = null;
			this.measure();
		});
	};
	observeLayout() {
		const region = this.state.tableRegionRef()?.nativeElement;
		const table = region?.querySelector("table");
		const header = table?.querySelector("thead");
		if (!region || !table || !header || typeof ResizeObserver === "undefined") return;
		this.resizeObserver = new ResizeObserver(() => this.measure());
		this.resizeObserver.observe(region);
		this.resizeObserver.observe(header);
		this.syncCaptionObservation();
	}
	syncCaptionObservation() {
		const caption = queryOwnedNatTableElements(this.elementRef.nativeElement, "table caption").at(0) ?? null;
		if (!this.resizeObserver || caption === this.observedCaption) return;
		if (this.observedCaption) this.resizeObserver.unobserve(this.observedCaption);
		if (caption) this.resizeObserver.observe(caption);
		this.observedCaption = caption;
	}
	readMeasurements() {
		const region = this.state.tableRegionRef()?.nativeElement;
		const table = region?.querySelector("table");
		const body = table?.querySelector("tbody");
		const header = table?.querySelector("thead");
		if (!region || !body || !header) return null;
		const regionRect = region.getBoundingClientRect();
		const bodyRect = body.getBoundingClientRect();
		const headerRect = header.getBoundingClientRect();
		const firstHeaderCell = header.querySelector("th");
		const stickyTop = firstHeaderCell ? Number.parseFloat(getComputedStyle(firstHeaderCell).top) || 0 : 0;
		return {
			bodyOffset: Math.max(0, bodyRect.top - regionRect.top - region.clientTop + region.scrollTop),
			stickyOverlayHeight: Math.max(0, headerRect.height + stickyTop),
			viewportHeight: region.clientHeight
		};
	}
	applyMeasurements(measurements) {
		if (measurements) {
			this.bodyOffset.set(measurements.bodyOffset);
			this.stickyOverlayHeight.set(measurements.stickyOverlayHeight);
			this.viewportHeight.set(measurements.viewportHeight);
		}
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualLayoutService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualLayoutService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableVirtualLayoutService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
const shouldClearNatTableFocusRetention = (event, host) => {
	if (event.target instanceof Node && !event.target.isConnected) return false;
	const relatedTarget = event.relatedTarget;
	return !(relatedTarget instanceof Node) || !host.contains(relatedTarget);
};
const readDataRowFocus = (host, target) => {
	const cell = findOwnedNatTableAncestor(host, target, "tbody [ngGridCell]");
	const rowId = (cell ? findOwnedNatTableAncestor(host, cell, "tr.data-row[data-row-id]") : null)?.dataset["rowId"];
	const columnId = cell?.dataset["columnId"];
	if (rowId !== void 0 && columnId !== void 0) return {
		rowId,
		columnId
	};
	return null;
};
const readNatTableActiveBodyFocus = (host, firstColumnId) => {
	const target = host.ownerDocument.activeElement;
	if (!target || !host.contains(target)) return null;
	const dataRowFocus = readDataRowFocus(host, target);
	if (dataRowFocus) return dataRowFocus;
	return findOwnedNatTableAncestor(host, target, "tbody [ngGridCell].table-state") && firstColumnId ? {
		rowId: null,
		columnId: firstColumnId
	} : null;
};
const resolveUnpinnedBounds = (host, regionRect) => {
	const pinnedLeft = queryOwnedNatTableElements(host, "thead .has-pinned-edge-left").at(0)?.getBoundingClientRect();
	const pinnedRight = queryOwnedNatTableElements(host, "thead .has-pinned-edge-right").at(0)?.getBoundingClientRect();
	let visibleLeft = regionRect.left;
	let visibleRight = regionRect.right;
	if (pinnedLeft && pinnedLeft.left <= regionRect.left + 1) visibleLeft = Math.min(pinnedLeft.right, regionRect.right);
	if (pinnedRight && pinnedRight.right >= regionRect.right - 1) visibleRight = Math.max(pinnedRight.left, regionRect.left);
	return visibleLeft < visibleRight ? {
		left: visibleLeft,
		right: visibleRight
	} : null;
};
const resolveHorizontalDelta = (table, cellRect, bounds) => {
	const visibleWidth = bounds.right - bounds.left;
	if (cellRect.width > visibleWidth) return table.dir === "rtl" ? cellRect.right - bounds.right : cellRect.left - bounds.left;
	if (cellRect.left < bounds.left) return cellRect.left - bounds.left;
	if (cellRect.right > bounds.right) return cellRect.right - bounds.right;
	return 0;
};
const scrollNatTableCellHorizontallyIntoView = (region, cell) => {
	const table = cell.closest("table");
	const host = cell.closest("nat-table");
	if (!table || !host || cell.matches(".is-pinned-left, .is-pinned-right")) return;
	const bounds = resolveUnpinnedBounds(host, region.getBoundingClientRect());
	if (!bounds) return;
	const delta = resolveHorizontalDelta(table, cell.getBoundingClientRect(), bounds);
	if (delta !== 0) region.scrollLeft += delta;
};
const matchingHeaderCells = (host, columnId) => {
	const matchingHeader = queryOwnedNatTableElements(host, "thead [ngGridCell][data-column-id]").find((candidate) => candidate.dataset["columnId"] === columnId);
	return matchingHeader ? [matchingHeader] : [];
};
const resolveNatTablePendingFocusCells = (host, pending) => {
	if (pending.preferHeader) return queryOwnedNatTableElements(host, "thead [ngGridCell][data-column-id]");
	if (pending.rowIndex === null) {
		const bodyFallback = queryOwnedNatTableElements(host, "tbody [ngGridCell]").at(0);
		return bodyFallback ? [bodyFallback] : matchingHeaderCells(host, pending.columnId);
	}
	const row = queryOwnedNatTableElements(host, "tr.data-row").find((candidate) => Number(candidate.dataset["rowIndex"]) === pending.rowIndex);
	return row ? [...row.querySelectorAll("[ngGridCell][data-column-id]")].filter((cell) => isOwnedNatTableElement(host, cell)) : [];
};
const isAppendedRowSequence = (previous, current) => current.length >= previous.length && (previous.length > 0 || current.length === 0) && previous.every((rowId, index) => current[index] === rowId);
const normalizeNatTableVirtualizationOptions = (options) => ({
	rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : 40,
	overscan: typeof options.overscan === "number" && Number.isFinite(options.overscan) && options.overscan >= 0 ? Math.floor(options.overscan) : 5
});
const describeNatTableVirtualizationOptionIssues = (options) => {
	const issues = [];
	if (!Number.isFinite(options.rowHeight) || options.rowHeight <= 0) issues.push(`rowHeight must be a finite number above zero; got ${String(options.rowHeight)}, using 40px.`);
	if (options.overscan !== void 0 && (!Number.isFinite(options.overscan) || options.overscan < 0)) issues.push(`overscan must be a finite number at or above zero; got ${String(options.overscan)}, using 5.`);
	return issues;
};
const normalizeNatTableRemoteRowCount = (remoteRowCount) => remoteRowCount !== void 0 && Number.isInteger(remoteRowCount) && remoteRowCount >= 0 ? remoteRowCount : null;
const normalizeNatTableRowWindowOffset = (rowWindowOffset, remoteRowCount, loadedRowCount) => {
	if (remoteRowCount === null || !Number.isInteger(rowWindowOffset) || rowWindowOffset < 0) return 0;
	return Math.min(rowWindowOffset, Math.max(0, remoteRowCount - loadedRowCount));
};
const NAT_TABLE_MAX_SCROLL_EXTENT_PX = 16e6;
const describeNatTableRemoteWindowingIssues = (context) => {
	const { remoteRowCount, rowWindowOffset, rowHeight, loadedRowCount, hasClientSorting, hasClientFiltering, hasClientPagination, hasSubHeaders } = context;
	const issues = [];
	if (remoteRowCount !== void 0 && !(Number.isInteger(remoteRowCount) && remoteRowCount >= 0)) issues.push(`remoteRowCount must be a non-negative integer; got ${String(remoteRowCount)}, ignoring it.`);
	if (!(Number.isInteger(rowWindowOffset) && rowWindowOffset >= 0)) issues.push(`rowWindowOffset must be a non-negative integer; got ${String(rowWindowOffset)}, using 0.`);
	const remote = normalizeNatTableRemoteRowCount(remoteRowCount);
	if (remote === null) return issues;
	if (remote < loadedRowCount) issues.push(`remoteRowCount (${remote}) is smaller than the ${loadedRowCount} loaded rows; using the loaded row count.`);
	else if (Number.isInteger(rowWindowOffset) && rowWindowOffset >= 0 && rowWindowOffset + loadedRowCount > remote) issues.push(`rowWindowOffset (${rowWindowOffset}) plus the ${loadedRowCount} loaded rows exceeds remoteRowCount (${remote}); clamping the window.`);
	if (hasClientSorting) issues.push("remoteRowCount requires manualSorting: client-side sorting would sort the loaded window, not the dataset.");
	if (hasClientFiltering) issues.push("remoteRowCount requires manualFiltering: client-side filtering would filter the loaded window, not the dataset.");
	if (hasClientPagination) issues.push("remoteRowCount requires manualPagination: client-side pagination would paginate the loaded window, not the dataset.");
	if (hasSubHeaders) issues.push("sub-header rows are not supported with remoteRowCount; they are disabled while it is set.");
	if (remote * rowHeight > 16e6) {
		const effectiveMaxRows = Math.floor(NAT_TABLE_MAX_SCROLL_EXTENT_PX / rowHeight);
		issues.push(`remoteRowCount (${remote}) needs ${remote * rowHeight}px of scroll extent at rowHeight ${rowHeight}px, above the ${NAT_TABLE_MAX_SCROLL_EXTENT_PX}px browsers can lay out — the extent is silently clamped and rows past about ${effectiveMaxRows} become unreachable. Keep remoteRowCount at or below ${effectiveMaxRows} for this rowHeight.`);
	}
	return issues;
};
const includeVirtualIndex = (indexes, index, count) => {
	if (index === null || index < 0 || index >= count || indexes.includes(index)) return [...indexes];
	return [...indexes, index].sort((left, right) => left - right);
};
const rangeToRowIndexes = (range, rowCount) => {
	const start = Math.max(0, Math.min(range.start, rowCount));
	const end = Math.max(start, Math.min(range.end, rowCount));
	return Array.from({ length: end - start }, (_, offset) => start + offset);
};
const opensSubHeaderGroup = (subHeaderOffsets, index) => (subHeaderOffsets[index] ?? 0) > (index > 0 ? subHeaderOffsets[index - 1] ?? 0 : 0);
const rowGridSlot = (subHeaderOffsets, index) => index + (subHeaderOffsets[index] ?? 0);
const rowBlockStartSlot = (subHeaderOffsets, index) => rowGridSlot(subHeaderOffsets, index) - (opensSubHeaderGroup(subHeaderOffsets, index) ? 1 : 0);
const createVirtualItems = (indexes, rowHeight, subHeaderOffsets) => indexes.map((index) => ({
	index,
	start: rowBlockStartSlot(subHeaderOffsets, index) * rowHeight,
	end: (rowGridSlot(subHeaderOffsets, index) + 1) * rowHeight
}));
const createInitialVirtualRange = (rowCount) => ({
	start: 0,
	end: Math.min(rowCount, 10)
});
const lowerBoundBySlot = (rowCount, slot, slotOf) => {
	let low = 0;
	let high = rowCount;
	while (low < high) {
		const middle = low + high >>> 1;
		if (slotOf(middle) < slot) low = middle + 1;
		else high = middle;
	}
	return low;
};
const computeNatTableRowWindow = (context) => {
	const { scrollOffset, viewportSize, rowHeight, rowCount, currentRange, overscan, subHeaderOffsets } = context;
	if (rowCount === 0 || rowHeight <= 0) return {
		start: 0,
		end: 0
	};
	const firstSlot = Math.max(0, Math.floor(scrollOffset / rowHeight));
	const lastSlot = Math.ceil((scrollOffset + viewportSize) / rowHeight);
	const firstVisible = Math.min(rowCount - 1, lowerBoundBySlot(rowCount, firstSlot, (index) => rowGridSlot(subHeaderOffsets, index)));
	const lastVisible = Math.max(firstVisible + 1, Math.min(rowCount, lowerBoundBySlot(rowCount, lastSlot, (index) => rowBlockStartSlot(subHeaderOffsets, index))));
	const keepRows = Math.max(1, Math.floor(overscan / 2));
	if (currentRange.end <= rowCount && currentRange.end - currentRange.start <= lastVisible - firstVisible + 2 * overscan + keepRows && (currentRange.start === 0 || currentRange.start + keepRows <= firstVisible) && (currentRange.end === rowCount || currentRange.end - keepRows >= lastVisible)) return {
		start: currentRange.start,
		end: currentRange.end
	};
	return {
		start: Math.max(0, firstVisible - overscan),
		end: Math.min(rowCount, lastVisible + overscan)
	};
};
const PAGE_DELTAS = {
	PageDown: 1,
	PageUp: -1
};
const ARROW_DELTAS = {
	ArrowDown: 1,
	ArrowUp: -1
};
const clampRowIndex = (index, rowCount) => Math.min(Math.max(index, 0), Math.max(rowCount - 1, 0));
const hasAnyModifier = (event) => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
const resolveGridEnd = (event, rowCount, lastColumnId) => {
	return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === "End" && rowCount > 0 && lastColumnId ? {
		rowIndex: rowCount - 1,
		columnId: lastColumnId,
		align: "end"
	} : null;
};
const resolveGridHome = (event, firstColumnId) => {
	return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === "Home" && firstColumnId ? {
		rowIndex: null,
		columnId: firstColumnId,
		align: "start"
	} : null;
};
const resolvePageRowIndex = (context) => {
	const { currentRowIndex, delta, rowsPerPage, rowCount, subHeaderOffsets } = context;
	const targetSlot = rowGridSlot(subHeaderOffsets, currentRowIndex) + delta * rowsPerPage;
	return clampRowIndex(lowerBoundBySlot(rowCount, targetSlot, (index) => rowGridSlot(subHeaderOffsets, index)), rowCount);
};
const resolvePage = (context) => {
	const { key, currentRowIndex, currentColumnId, rowCount, rowsPerPage, subHeaderOffsets } = context;
	const delta = PAGE_DELTAS[key];
	return delta === void 0 ? null : {
		rowIndex: resolvePageRowIndex({
			currentRowIndex,
			delta,
			rowsPerPage,
			rowCount,
			subHeaderOffsets
		}),
		columnId: currentColumnId,
		align: "start"
	};
};
const resolveArrow = (context) => {
	const { key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount } = context;
	const delta = ARROW_DELTAS[key];
	const target = delta === void 0 ? currentRowIndex : currentRowIndex + delta;
	return delta === void 0 || target < 0 || target >= rowCount || mountedRowIndexes.has(target) ? null : {
		rowIndex: target,
		columnId: currentColumnId,
		align: "auto"
	};
};
const resolveNatTableVirtualNavigation = (config) => {
	const { event, currentRowIndex, currentColumnId, firstColumnId, lastColumnId, mountedRowIndexes, rowCount, rowsPerPage, subHeaderOffsets = [] } = config;
	const gridEdge = resolveGridHome(event, firstColumnId) ?? resolveGridEnd(event, rowCount, lastColumnId);
	if (gridEdge) return gridEdge;
	if (currentRowIndex === null || hasAnyModifier(event)) return null;
	const page = resolvePage({
		key: event.key,
		currentRowIndex,
		currentColumnId,
		rowCount,
		rowsPerPage,
		subHeaderOffsets
	});
	if (page) return page;
	return resolveArrow({
		key: event.key,
		currentRowIndex,
		currentColumnId,
		mountedRowIndexes,
		rowCount
	});
};
var NatTableVirtualFocusService = class NatTableVirtualFocusService {
	elementRef = inject(ElementRef);
	state = inject(NAT_TABLE_ROW_WINDOW_HOST);
	layout = inject(NatTableVirtualLayoutService);
	destroyRef = inject(DestroyRef);
	controller = signal(null, ...ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []);
	retainedRowId = signal(null, ...ngDevMode ? [{ debugName: "retainedRowId" }] : /* istanbul ignore next */ []);
	retainedCellPosition = signal(null, ...ngDevMode ? [{ debugName: "retainedCellPosition" }] : /* istanbul ignore next */ []);
	pendingFocus = signal(null, ...ngDevMode ? [{ debugName: "pendingFocus" }] : /* istanbul ignore next */ []);
	rowIndexById = computed(() => {
		const indexById = /* @__PURE__ */ new Map();
		this.state.bodyRows().forEach((row, index) => indexById.set(row.id, index));
		return indexById;
	}, ...ngDevMode ? [{ debugName: "rowIndexById" }] : /* istanbul ignore next */ []);
	focusedLogicalIndex = computed(() => {
		const retainedRowId = this.retainedRowId();
		const loadedIndex = retainedRowId === null ? void 0 : this.rowIndexById().get(retainedRowId);
		if (loadedIndex !== void 0) return loadedIndex + this.rowWindowOffset();
		return this.retainedCellPosition()?.logicalIndex ?? null;
	}, ...ngDevMode ? [{ debugName: "focusedLogicalIndex" }] : /* istanbul ignore next */ []);
	rowWindowOffset() {
		return this.controller()?.rowWindowOffset() ?? 0;
	}
	constructor() {
		const host = this.elementRef.nativeElement;
		host.addEventListener("keydown", this.onKeydownCapture, true);
		host.addEventListener("focusin", this.onFocusIn);
		host.addEventListener("focusout", this.onFocusOut);
		this.destroyRef.onDestroy(() => {
			host.removeEventListener("keydown", this.onKeydownCapture, true);
			host.removeEventListener("focusin", this.onFocusIn);
			host.removeEventListener("focusout", this.onFocusOut);
		});
		this.registerPendingFocusEffect();
	}
	connect(controller) {
		this.controller.set(controller);
	}
	prepareRowModelReset() {
		const controller = this.controller();
		this.pendingFocus.set(null);
		const activeFocus = readNatTableActiveBodyFocus(this.elementRef.nativeElement, this.state.visibleColumns().at(0)?.id);
		const placeholderFocus = this.readActivePlaceholderFocus();
		this.retainedCellPosition.set(null);
		if (!controller || !activeFocus && !placeholderFocus) {
			this.retainedRowId.set(null);
			return null;
		}
		const columnId = activeFocus?.columnId ?? placeholderFocus?.columnId ?? "";
		const targetIndex = this.resolveResetTargetIndex(activeFocus ? activeFocus.rowId : null);
		const targetRowId = targetIndex === null ? null : this.state.bodyRows()[targetIndex]?.id ?? null;
		const logicalTargetIndex = targetIndex === null ? null : targetIndex + this.rowWindowOffset();
		this.retainedRowId.set(targetRowId);
		this.pendingFocus.set({
			rowIndex: logicalTargetIndex,
			columnId
		});
		return logicalTargetIndex;
	}
	readActivePlaceholderFocus() {
		const host = this.elementRef.nativeElement;
		const target = host.ownerDocument.activeElement;
		if (!target || !host.contains(target)) return null;
		const row = findOwnedNatTablePlaceholderRow(host, target);
		const cell = findOwnedNatTableCell(host, target);
		if (!row || !cell) return null;
		const logicalIndex = Number(row.dataset["rowIndex"]);
		return Number.isInteger(logicalIndex) ? {
			logicalIndex,
			columnId: cell.dataset["columnId"] ?? ""
		} : null;
	}
	resolveResetTargetIndex(rowId) {
		if (this.state.bodyState() !== NAT_TABLE_BODY_STATE.rows || this.state.bodyRows().length === 0) return null;
		return rowId === null ? 0 : this.rowIndexById().get(rowId) ?? 0;
	}
	onFocusIn = (event) => {
		const host = this.elementRef.nativeElement;
		const bodyRow = findOwnedNatTableBodyRow(host, event.target);
		if (!bodyRow) return;
		this.retainedRowId.set(bodyRow.dataset["rowId"] ?? null);
		const logicalIndex = Number(bodyRow.dataset["rowIndex"]);
		const cell = findOwnedNatTableCell(host, event.target);
		this.retainedCellPosition.set(Number.isInteger(logicalIndex) && cell ? {
			logicalIndex,
			columnId: cell.dataset["columnId"] ?? ""
		} : null);
	};
	onFocusOut = (event) => {
		if (!shouldClearNatTableFocusRetention(event, this.elementRef.nativeElement)) return;
		const target = event.target;
		queueMicrotask(() => {
			if (target instanceof Node && !target.isConnected) return;
			this.retainedRowId.set(null);
			this.retainedCellPosition.set(null);
		});
	};
	onKeydownCapture = (event) => {
		const controller = this.controller();
		const target = event.target instanceof HTMLElement ? event.target : null;
		const cell = findOwnedNatTableCell(this.elementRef.nativeElement, target);
		const isGridFocusTarget = target !== null && cell !== null && (target === cell || this.state.isDelegatedCellControl(cell, target));
		if (!controller || !cell || !isGridFocusTarget || event.defaultPrevented) return;
		const rowIndexValue = findOwnedNatTableBodyRow(this.elementRef.nativeElement, cell)?.dataset["rowIndex"];
		const currentRowIndex = rowIndexValue === void 0 ? null : Number(rowIndexValue);
		const request = resolveNatTableVirtualNavigation({
			event,
			currentRowIndex: Number.isInteger(currentRowIndex) ? currentRowIndex : null,
			currentColumnId: cell.dataset["columnId"] ?? "",
			firstColumnId: this.state.visibleColumns().at(0)?.id,
			lastColumnId: this.state.visibleColumns().at(-1)?.id,
			mountedRowIndexes: new Set(controller.items().map((item) => item.index)),
			rowCount: controller.rowCount(),
			rowsPerPage: this.resolveRowsPerPage(controller),
			subHeaderOffsets: this.state.subHeaderRowOffsets()
		});
		if (!request) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		this.pendingFocus.set({
			...request,
			preferHeader: request.rowIndex === null
		});
		if (request.rowIndex === null) controller.scrollToOffset(0);
		else controller.scrollToIndex(request.rowIndex, { align: request.align });
	};
	resolveRowsPerPage(controller) {
		const rowHeight = controller.rowHeight();
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!region) return 1;
		const bodyStart = Math.max(0, this.layout.bodyOffset() - region.scrollTop);
		const stickyOverlay = this.state.stickyHeader() ? this.layout.stickyOverlayHeight() : 0;
		const visibleBodyHeight = region.clientHeight - Math.max(bodyStart, stickyOverlay);
		return Math.max(1, Math.floor(visibleBodyHeight / rowHeight));
	}
	registerPendingFocusEffect() {
		afterRenderEffect(() => {
			const controller = this.controller();
			const pendingFocus = this.pendingFocus();
			controller?.items();
			this.state.bodyRows();
			const request = pendingFocus ?? this.resolveDroppedBodyFocus();
			if (!request) return;
			const cells = resolveNatTablePendingFocusCells(this.elementRef.nativeElement, request);
			const cell = cells.find((candidate) => candidate.dataset["columnId"] === request.columnId) ?? cells.at(0);
			if (cell) {
				cell.focus({ preventScroll: true });
				const region = this.state.tableRegionRef()?.nativeElement;
				if (region) scrollNatTableCellHorizontallyIntoView(region, cell);
				this.pendingFocus.set(null);
			}
		});
	}
	resolveDroppedBodyFocus() {
		const retainedPosition = this.retainedCellPosition();
		if (retainedPosition === null) return null;
		const host = this.elementRef.nativeElement;
		const activeElement = host.ownerDocument.activeElement;
		if (!(!activeElement || activeElement === host.ownerDocument.body || !activeElement.isConnected)) return null;
		this.retainedCellPosition.set(null);
		return {
			rowIndex: retainedPosition.logicalIndex,
			columnId: retainedPosition.columnId
		};
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualFocusService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualFocusService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableVirtualFocusService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
const resolveNatTableScrollTarget = (context) => {
	const { align, scrollTop, rowTop, rowHeight, stickyOverlayHeight, viewportHeight } = context;
	const startTarget = Math.max(0, rowTop - stickyOverlayHeight);
	const endTarget = Math.max(0, rowTop + rowHeight - viewportHeight);
	if (align === "start") return startTarget;
	if (align === "end") return endTarget;
	if (rowTop < scrollTop + stickyOverlayHeight) return startTarget;
	return rowTop + rowHeight > scrollTop + viewportHeight ? endTarget : null;
};
var NatTableVirtualScrollEngine = class NatTableVirtualScrollEngine {
	state = inject(NAT_TABLE_ROW_WINDOW_HOST);
	layout = inject(NatTableVirtualLayoutService);
	ngZone = inject(NgZone);
	destroyRef = inject(DestroyRef);
	options = null;
	logicalRowCount = null;
	observedRegion = null;
	scrollFrame = null;
	mountedRange = signal({
		start: 0,
		end: 10
	}, ...ngDevMode ? [{ debugName: "mountedRange" }] : /* istanbul ignore next */ []);
	range = this.mountedRange.asReadonly();
	constructor() {
		this.destroyRef.onDestroy(() => this.detachScrollListener());
	}
	connect(options, logicalRowCount) {
		this.options = options;
		this.logicalRowCount = logicalRowCount;
		this.registerRegionAttachmentEffect();
		this.registerRangeUpdateEffect();
	}
	measure() {
		this.layout.measure();
		this.updateRange();
	}
	scrollToIndex(index, align) {
		const region = this.state.tableRegionRef()?.nativeElement;
		const options = this.options;
		if (!region || !options) return;
		const rowHeight = untracked(options).rowHeight;
		const subHeaderOffsets = untracked(this.state.subHeaderRowOffsets);
		const opensGroup = opensSubHeaderGroup(subHeaderOffsets, index);
		const slot = index + (subHeaderOffsets[index] ?? 0) - (opensGroup ? 1 : 0);
		const target = resolveNatTableScrollTarget({
			align,
			scrollTop: region.scrollTop,
			rowTop: untracked(this.layout.bodyOffset) + slot * rowHeight,
			rowHeight: (opensGroup ? 2 : 1) * rowHeight,
			stickyOverlayHeight: untracked(this.state.stickyHeader) ? untracked(this.layout.stickyOverlayHeight) : 0,
			viewportHeight: untracked(this.layout.viewportHeight)
		});
		if (target !== null) {
			region.scrollTop = target;
			this.updateRange();
		}
	}
	scrollToOffset(offset) {
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!region) return;
		region.scrollTop = Math.max(0, offset);
		this.updateRange();
	}
	registerRegionAttachmentEffect() {
		effect(() => {
			const region = this.state.tableRegionRef()?.nativeElement ?? null;
			untracked(() => this.attachScrollListener(region));
		});
	}
	registerRangeUpdateEffect() {
		effect(() => {
			this.logicalRowCount?.();
			this.state.subHeaderRowOffsets();
			this.layout.viewportHeight();
			this.layout.bodyOffset();
			this.options?.();
			untracked(() => this.updateRange());
		});
	}
	attachScrollListener(region) {
		if (region === this.observedRegion) return;
		this.detachScrollListener();
		this.observedRegion = region;
		if (!region) return;
		this.ngZone.runOutsideAngular(() => region.addEventListener("scroll", this.onScroll, { passive: true }));
	}
	detachScrollListener() {
		this.observedRegion?.removeEventListener("scroll", this.onScroll);
		this.observedRegion = null;
		if (this.scrollFrame !== null) {
			cancelAnimationFrame(this.scrollFrame);
			this.scrollFrame = null;
		}
	}
	onScroll = () => {
		if (this.scrollFrame !== null) return;
		this.scrollFrame = requestAnimationFrame(() => {
			this.scrollFrame = null;
			this.updateRange();
		});
	};
	updateRange() {
		const options = this.options;
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!options || !region) return;
		const { rowHeight, overscan } = untracked(options);
		const rowCount = this.logicalRowCount === null ? untracked(this.state.bodyRows).length : untracked(this.logicalRowCount);
		const viewportSize = untracked(this.layout.viewportHeight);
		const next = viewportSize <= 0 ? createInitialVirtualRange(rowCount) : computeNatTableRowWindow({
			scrollOffset: Math.max(0, region.scrollTop - untracked(this.layout.bodyOffset)),
			viewportSize,
			rowHeight,
			rowCount,
			currentRange: untracked(this.mountedRange),
			overscan,
			subHeaderOffsets: untracked(this.state.subHeaderRowOffsets)
		});
		const current = untracked(this.mountedRange);
		if (next.start !== current.start || next.end !== current.end) this.mountedRange.set(next);
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualScrollEngine,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualScrollEngine
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableVirtualScrollEngine,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
const ROW_KINDS = [["tr.data-row", "data"], ["tr.sub-header-row", "sub-header"]];
var NatTableVirtualValidationService = class NatTableVirtualValidationService {
	elementRef = inject(ElementRef);
	state = inject(NAT_TABLE_ROW_WINDOW_HOST);
	destroyRef = inject(DestroyRef);
	regionResizeRevision = signal(0, ...ngDevMode ? [{ debugName: "regionResizeRevision" }] : /* istanbul ignore next */ []);
	regionResizeObserver = null;
	rowHeight = null;
	items = null;
	logicalRowCount = null;
	constructor() {
		this.registerBoundedRegionValidationEffect();
		if (!isDevMode()) return;
		afterNextRender(() => this.observeRegionSize());
		this.registerRowHeightValidationEffect();
		this.destroyRef.onDestroy(() => this.regionResizeObserver?.disconnect());
	}
	connect(rowHeight, items, logicalRowCount) {
		this.rowHeight = rowHeight;
		this.items = items;
		this.logicalRowCount = logicalRowCount;
	}
	observeRegionSize() {
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!region || typeof ResizeObserver === "undefined") return;
		this.regionResizeObserver = new ResizeObserver(() => this.regionResizeRevision.update((revision) => revision + 1));
		this.regionResizeObserver.observe(region);
	}
	registerBoundedRegionValidationEffect() {
		let hasWarned = false;
		afterRenderEffect({
			earlyRead: () => {
				const rowCount = this.logicalRowCount === null ? this.state.bodyRows().length : this.logicalRowCount();
				const region = this.state.tableRegionRef()?.nativeElement;
				this.regionResizeRevision();
				return region ? {
					clientHeight: region.clientHeight,
					rowCount,
					scrollHeight: region.scrollHeight
				} : null;
			},
			write: (measurementsSignal) => {
				const measurements = measurementsSignal();
				if (hasWarned || !measurements || measurements.clientHeight <= 0 || measurements.scrollHeight > measurements.clientHeight + 1 || measurements.rowCount <= 10) return;
				hasWarned = true;
				console.warn("[ng-advanced-table] natTableVirtualize needs a bounded region; set --nat-table-height or --nat-table-max-height.");
			}
		});
	}
	registerRowHeightValidationEffect() {
		const warnedKinds = /* @__PURE__ */ new Set();
		afterRenderEffect({
			earlyRead: () => {
				const expectedHeight = this.rowHeight?.() ?? 0;
				this.items?.();
				for (const [selector, label] of ROW_KINDS) {
					if (warnedKinds.has(label)) continue;
					const actualHeight = this.elementRef.nativeElement.querySelector(selector)?.getBoundingClientRect().height ?? 0;
					if (actualHeight > 0 && Math.abs(actualHeight - expectedHeight) > 1) return {
						label,
						actualHeight,
						expectedHeight
					};
				}
				return null;
			},
			write: (mismatchSignal) => {
				const mismatch = mismatchSignal();
				if (!mismatch || warnedKinds.has(mismatch.label)) return;
				warnedKinds.add(mismatch.label);
				console.warn(`[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ${mismatch.actualHeight}px on a ${mismatch.label} row.`);
			}
		});
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualValidationService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualValidationService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableVirtualValidationService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
var NatTableVirtualize = class NatTableVirtualize {
	natTableVirtualize = input.required(...ngDevMode ? [{ debugName: "natTableVirtualize" }] : /* istanbul ignore next */ []);
	remoteRowCount = input(void 0, ...ngDevMode ? [{ debugName: "remoteRowCount" }] : /* istanbul ignore next */ []);
	rowWindowOffset = input(0, ...ngDevMode ? [{ debugName: "rowWindowOffset" }] : /* istanbul ignore next */ []);
	virtualRangeChange = output();
	state = inject(NAT_TABLE_ROW_WINDOW_HOST);
	natTableService = inject(NatTableService);
	registry = inject(NatTableRowRenderStrategyRegistry);
	engine = inject(NatTableVirtualScrollEngine);
	focus = inject(NatTableVirtualFocusService);
	validation = inject(NatTableVirtualValidationService);
	destroyRef = inject(DestroyRef);
	normalizedOptions = computed(() => normalizeNatTableVirtualizationOptions(this.natTableVirtualize()), ...ngDevMode ? [{ debugName: "normalizedOptions" }] : /* istanbul ignore next */ []);
	rowHeight = computed(() => this.normalizedOptions().rowHeight, ...ngDevMode ? [{ debugName: "rowHeight" }] : /* istanbul ignore next */ []);
	normalizedRemoteRowCount = computed(() => normalizeNatTableRemoteRowCount(this.remoteRowCount()), ...ngDevMode ? [{ debugName: "normalizedRemoteRowCount" }] : /* istanbul ignore next */ []);
	logicalRowCount = computed(() => {
		const loadedRowCount = this.state.bodyRows().length;
		const remoteRowCount = this.normalizedRemoteRowCount();
		return remoteRowCount === null ? loadedRowCount : Math.max(remoteRowCount, loadedRowCount);
	}, ...ngDevMode ? [{ debugName: "logicalRowCount" }] : /* istanbul ignore next */ []);
	normalizedRowWindowOffset = computed(() => normalizeNatTableRowWindowOffset(this.rowWindowOffset(), this.normalizedRemoteRowCount(), this.state.bodyRows().length), ...ngDevMode ? [{ debugName: "normalizedRowWindowOffset" }] : /* istanbul ignore next */ []);
	virtualItems = computed(() => {
		const rowCount = this.logicalRowCount();
		const mountedIndexes = rangeToRowIndexes(this.engine.range(), rowCount);
		return createVirtualItems(includeVirtualIndex(mountedIndexes, this.focus.focusedLogicalIndex(), rowCount), this.rowHeight(), this.state.subHeaderRowOffsets());
	}, ...ngDevMode ? [{ debugName: "virtualItems" }] : /* istanbul ignore next */ []);
	totalSize = computed(() => (this.logicalRowCount() + (this.state.subHeaderRowOffsets().at(-1) ?? 0)) * this.rowHeight(), ...ngDevMode ? [{ debugName: "totalSize" }] : /* istanbul ignore next */ []);
	controller = {
		items: this.virtualItems,
		rowHeight: this.rowHeight,
		rowCount: this.logicalRowCount,
		rowWindowOffset: this.normalizedRowWindowOffset,
		measure: () => this.engine.measure(),
		scrollToIndex: (index, options) => this.engine.scrollToIndex(index, options?.align ?? "auto"),
		scrollToOffset: (offset) => this.engine.scrollToOffset(offset)
	};
	strategy = {
		items: this.virtualItems,
		totalSize: this.totalSize,
		rowHeight: this.rowHeight,
		logicalRowCount: this.normalizedRemoteRowCount,
		rowWindowOffset: this.normalizedRowWindowOffset
	};
	constructor() {
		const unregister = this.registry.register(this.strategy);
		this.engine.connect(this.normalizedOptions, this.logicalRowCount);
		this.focus.connect(this.controller);
		this.validation.connect(this.rowHeight, this.virtualItems, this.logicalRowCount);
		this.destroyRef.onDestroy(unregister);
		this.registerOptionValidationEffect();
		this.registerRowModelResetEffect();
		this.registerRangeChangeEffect();
	}
	mountedRange = computed(() => {
		const indexes = rangeToRowIndexes(this.engine.range(), this.logicalRowCount());
		return {
			startIndex: indexes.at(0) ?? 0,
			endIndex: indexes.at(-1) ?? -1,
			count: indexes.length
		};
	}, {
		...ngDevMode ? { debugName: "mountedRange" } : /* istanbul ignore next */ {},
		equal: (previous, current) => previous.startIndex === current.startIndex && previous.endIndex === current.endIndex && previous.count === current.count
	});
	registerRangeChangeEffect() {
		effect(() => {
			const range = this.mountedRange();
			untracked(() => this.virtualRangeChange.emit(range));
		});
	}
	rowModelState = computed(() => {
		const { sorting, globalFilter, columnFilters, pagination } = this.state.mergedState();
		return {
			sorting,
			globalFilter,
			columnFilters,
			pagination
		};
	}, {
		...ngDevMode ? { debugName: "rowModelState" } : /* istanbul ignore next */ {},
		equal: (previous, current) => !hasNatTableStateValueChanged(previous, current)
	});
	rowIdSequence = computed(() => this.state.bodyRows().map((row) => row.id), ...ngDevMode ? [{ debugName: "rowIdSequence" }] : /* istanbul ignore next */ []);
	registerRowModelResetEffect() {
		let previous = null;
		effect(() => {
			this.state.data();
			const bodyState = this.state.bodyState();
			const rowIdSequence = this.rowIdSequence();
			const rowModelState = this.rowModelState();
			const remoteRowCount = this.normalizedRemoteRowCount();
			this.rowHeight();
			this.normalizedRowWindowOffset();
			const shouldReset = previous !== null && (previous.bodyState !== bodyState || previous.rowModelState !== rowModelState || previous.remoteRowCount !== remoteRowCount || remoteRowCount === null && !isAppendedRowSequence(previous.rowIdSequence, rowIdSequence));
			previous = {
				bodyState,
				rowIdSequence,
				rowModelState,
				remoteRowCount
			};
			untracked(() => {
				const focusTargetIndex = shouldReset ? this.focus.prepareRowModelReset() : null;
				this.controller.measure();
				if (shouldReset) {
					if (focusTargetIndex === null) this.controller.scrollToOffset(0);
					else this.controller.scrollToIndex(focusTargetIndex, { align: "auto" });
				}
			});
		});
	}
	registerOptionValidationEffect() {
		if (!isDevMode()) return;
		effect(() => {
			for (const issue of describeNatTableVirtualizationOptionIssues(this.natTableVirtualize())) console.warn(`[ng-advanced-table] natTableVirtualize.${issue}`);
		});
		effect(() => {
			const issues = describeNatTableRemoteWindowingIssues({
				remoteRowCount: this.remoteRowCount(),
				rowWindowOffset: this.rowWindowOffset(),
				rowHeight: this.rowHeight(),
				loadedRowCount: this.state.bodyRows().length,
				hasClientSorting: !this.natTableService.manualSorting() && this.hasClientSortingInput(),
				hasClientFiltering: !this.natTableService.manualFiltering() && this.hasClientFilteringInput(),
				hasClientPagination: !this.natTableService.manualPagination() && this.natTableService.hasPagination(),
				hasSubHeaders: this.hasSubHeaderConfiguration()
			});
			for (const issue of issues) console.warn(`[ng-advanced-table] ${issue}`);
		});
	}
	hasClientSortingInput() {
		return this.natTableService.enableSorting() || this.state.mergedState().sorting.length > 0;
	}
	hasClientFilteringInput() {
		const { globalFilter, columnFilters } = this.state.mergedState();
		return this.natTableService.hasSearch() || globalFilter.trim() !== "" || columnFilters.length > 0;
	}
	hasSubHeaderConfiguration() {
		return typeof (this.natTableService.controller()?.table.options.meta)?.natTableSubHeaderColumnId === "string";
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableVirtualize,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableVirtualize,
		isStandalone: true,
		selector: "nat-table[natTableVirtualize]",
		inputs: {
			natTableVirtualize: {
				classPropertyName: "natTableVirtualize",
				publicName: "natTableVirtualize",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			remoteRowCount: {
				classPropertyName: "remoteRowCount",
				publicName: "remoteRowCount",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			rowWindowOffset: {
				classPropertyName: "rowWindowOffset",
				publicName: "rowWindowOffset",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		outputs: { virtualRangeChange: "virtualRangeChange" },
		host: { properties: { "style.--sys-nat-table-virtual-row-height.px": "rowHeight()" } },
		providers: [
			NatTableVirtualFocusService,
			NatTableVirtualLayoutService,
			NatTableVirtualScrollEngine,
			NatTableVirtualValidationService
		],
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableVirtualize,
	decorators: [{
		type: Directive,
		args: [{
			selector: "nat-table[natTableVirtualize]",
			providers: [
				NatTableVirtualFocusService,
				NatTableVirtualLayoutService,
				NatTableVirtualScrollEngine,
				NatTableVirtualValidationService
			],
			host: { "[style.--sys-nat-table-virtual-row-height.px]": "rowHeight()" }
		}]
	}],
	ctorParameters: () => [],
	propDecorators: {
		natTableVirtualize: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableVirtualize",
				required: true
			}]
		}],
		remoteRowCount: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "remoteRowCount",
				required: false
			}]
		}],
		rowWindowOffset: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "rowWindowOffset",
				required: false
			}]
		}],
		virtualRangeChange: [{
			type: i0.Output,
			args: ["virtualRangeChange"]
		}]
	}
});
export { NatTableVirtualize };

//# sourceMappingURL=ng-advanced-table-virtualization.mjs.map