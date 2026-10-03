import { FlexRender, createAngularTable, flexRenderComponent, getCoreRowModel, getFilteredRowModel, getMemoOptions, getPaginationRowModel, getSortedRowModel, memo, reSplitAlphaNumeric, sortingFns } from "@tanstack/angular-table";
import * as i0 from "@angular/core";
import { ApplicationRef, Component, DestroyRef, Directive, ElementRef, Injectable, InjectionToken, Injector, Renderer2, TemplateRef, afterEveryRender, afterNextRender, afterRenderEffect, booleanAttribute, computed, contentChild, effect, inject, input, isDevMode, output, signal, untracked, viewChild } from "@angular/core";
import { Directionality } from "@angular/cdk/bidi";
import { NAT_EN_LOCALE_ID, NAT_TABLE_INTL, formatNatTableNumber, matchNatTableLocaleId, mergeNatTableAccessibilityText, resolveNatTableIntl } from "ng-advanced-table/locale";
import { Grid, GridCell, GridRow } from "@angular/aria/grid";
import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { NgTemplateOutlet } from "@angular/common";
var NatTableLoadingTemplate = class NatTableLoadingTemplate {
	templateRef = inject(TemplateRef);
	static ngTemplateContextGuard(_directive, context) {
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableLoadingTemplate,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableLoadingTemplate,
		isStandalone: true,
		selector: "ng-template[natTableLoading]",
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableLoadingTemplate,
	decorators: [{
		type: Directive,
		args: [{ selector: "ng-template[natTableLoading]" }]
	}]
});
var NatTableEmptyTemplate = class NatTableEmptyTemplate {
	templateRef = inject(TemplateRef);
	static ngTemplateContextGuard(_directive, context) {
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableEmptyTemplate,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableEmptyTemplate,
		isStandalone: true,
		selector: "ng-template[natTableEmpty]",
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableEmptyTemplate,
	decorators: [{
		type: Directive,
		args: [{ selector: "ng-template[natTableEmpty]" }]
	}]
});
var NatTableErrorTemplate = class NatTableErrorTemplate {
	templateRef = inject(TemplateRef);
	static ngTemplateContextGuard(_directive, context) {
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableErrorTemplate,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableErrorTemplate,
		isStandalone: true,
		selector: "ng-template[natTableError]",
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableErrorTemplate,
	decorators: [{
		type: Directive,
		args: [{ selector: "ng-template[natTableError]" }]
	}]
});
var NatTableRowPlaceholderTemplate = class NatTableRowPlaceholderTemplate {
	templateRef = inject(TemplateRef);
	static ngTemplateContextGuard(_directive, context) {
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableRowPlaceholderTemplate,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableRowPlaceholderTemplate,
		isStandalone: true,
		selector: "ng-template[natTableRowPlaceholder]",
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableRowPlaceholderTemplate,
	decorators: [{
		type: Directive,
		args: [{ selector: "ng-template[natTableRowPlaceholder]" }]
	}]
});
var NatTableSubHeaderTemplate = class NatTableSubHeaderTemplate {
	templateRef = inject(TemplateRef);
	static ngTemplateContextGuard(_directive, context) {
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableSubHeaderTemplate,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableSubHeaderTemplate,
		isStandalone: true,
		selector: "ng-template[natTableSubHeader]",
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableSubHeaderTemplate,
	decorators: [{
		type: Directive,
		args: [{ selector: "ng-template[natTableSubHeader]" }]
	}]
});
const NAT_TABLE_DATA_STATUS = {
	loading: "loading",
	error: "error",
	success: "success"
};
const NAT_TABLE_BODY_STATE = {
	rows: "rows",
	loading: "loading",
	empty: "empty",
	error: "error"
};
const NAT_TABLE_ROW_WINDOW_HOST = new InjectionToken("NAT_TABLE_ROW_WINDOW_HOST");
const NAT_TABLE_KEYBINDINGS = new InjectionToken("NAT_TABLE_KEYBINDINGS", {
	providedIn: "root",
	factory: () => ({})
});
const DEFAULT_NAT_TABLE_KEYBINDINGS = {
	rowActivate: [
		"Enter",
		" ",
		"Spacebar"
	],
	columnReorderLeft: "Mod+Shift+ArrowLeft",
	columnReorderRight: "Mod+Shift+ArrowRight",
	cellEnterControl: "Enter",
	cellExitControl: "Escape",
	cellTabNextControl: "Tab",
	cellTabPrevControl: "Shift+Tab"
};
const isMacPlatform = () => {
	if (typeof window === "undefined" || typeof navigator === "undefined") return false;
	const userAgent = (navigator.userAgent || "").toLowerCase();
	const platform = (navigator.platform || "").toLowerCase();
	return userAgent.includes("mac") || userAgent.includes("ipad") || userAgent.includes("iphone") || platform.includes("mac") || platform.includes("ipad") || platform.includes("iphone");
};
const isSpaceShortcutKey = (key) => {
	const lowerKey = key.toLowerCase();
	return key === " " || lowerKey === "space" || lowerKey === "spacebar";
};
const normalizeShortcutKeyForComparison = (key) => isSpaceShortcutKey(key) ? "space" : key.toLowerCase();
const resolveModifierFlags = (modifiers, isMac) => {
	const hasMod = modifiers.has("mod") || modifiers.has("cmdorctrl") || modifiers.has("commandorcontrol");
	return {
		ctrlKey: modifiers.has("ctrl") || modifiers.has("control") || hasMod && !isMac,
		altKey: modifiers.has("alt"),
		shiftKey: modifiers.has("shift"),
		metaKey: modifiers.has("meta") || modifiers.has("cmd") || modifiers.has("win") || hasMod && isMac
	};
};
const parseShortcutString = (shortcut) => {
	const parts = shortcut.split("+");
	let key = parts[parts.length - 1];
	if (key === "" && parts.length > 1 && shortcut.endsWith("++")) {
		key = "+";
		parts.pop();
	}
	const trimmedKey = key.trim();
	const resolvedKey = trimmedKey === "" && key.length > 0 ? key : trimmedKey;
	const modifiers = new Set(parts.slice(0, -1).map((m) => m.trim().toLowerCase()));
	return {
		key: resolvedKey,
		...resolveModifierFlags(modifiers, isMacPlatform())
	};
};
const normalizeShortcut = (shortcut) => {
	if (typeof shortcut === "string") return parseShortcutString(shortcut);
	const isMac = isMacPlatform();
	const hasMod = !!shortcut.cmdOrCtrlKey;
	return {
		key: shortcut.key,
		ctrlKey: !!shortcut.ctrlKey || hasMod && !isMac,
		altKey: !!shortcut.altKey,
		shiftKey: !!shortcut.shiftKey,
		metaKey: !!shortcut.metaKey || hasMod && isMac
	};
};
const areShortcutsEqual = (a, b) => {
	const normA = normalizeShortcut(a);
	const normB = normalizeShortcut(b);
	return normalizeShortcutKeyForComparison(normA.key) === normalizeShortcutKeyForComparison(normB.key) && normA.altKey === normB.altKey && normA.ctrlKey === normB.ctrlKey && normA.shiftKey === normB.shiftKey && normA.metaKey === normB.metaKey;
};
const areShortcutValuesOverlapping = (valA, valB) => {
	if (!valA || !valB) return false;
	const listA = Array.isArray(valA) ? valA : [valA];
	const listB = Array.isArray(valB) ? valB : [valB];
	for (const a of listA) for (const b of listB) if (areShortcutsEqual(a, b)) return true;
	return false;
};
const matchShortcut = (event, shortcut) => {
	const norm = normalizeShortcut(shortcut);
	return normalizeShortcutKeyForComparison(event.key) === normalizeShortcutKeyForComparison(norm.key) && event.altKey === norm.altKey && event.ctrlKey === norm.ctrlKey && event.shiftKey === norm.shiftKey && event.metaKey === norm.metaKey;
};
const matchShortcutValue = (event, value) => {
	if (!value) return false;
	if (Array.isArray(value)) return value.some((val) => matchShortcut(event, val));
	return matchShortcut(event, value);
};
const mergeNatTableKeybindings = (...configs) => {
	const entries = Object.keys(DEFAULT_NAT_TABLE_KEYBINDINGS).map((key) => {
		for (const config of configs) if (config[key] !== void 0) return [key, config[key]];
		return [key, DEFAULT_NAT_TABLE_KEYBINDINGS[key]];
	});
	return Object.fromEntries(entries);
};
const serializeSingleShortcut = (norm) => {
	const parts = [];
	if (norm.altKey) parts.push("Alt");
	if (norm.ctrlKey) parts.push("Control");
	if (norm.metaKey) parts.push("Meta");
	if (norm.shiftKey) parts.push("Shift");
	parts.push(isSpaceShortcutKey(norm.key) ? "Space" : norm.key);
	return parts.join("+");
};
const serializeShortcutValue = (value) => {
	if (!value) return "";
	const values = Array.isArray(value) ? value : [value];
	const serializedSet = /* @__PURE__ */ new Set();
	for (const val of values) serializedSet.add(serializeSingleShortcut(normalizeShortcut(val)));
	return Array.from(serializedSet).filter(Boolean).join(" ");
};
const validateKeybindings = (bindings) => {
	const warnings = [];
	const keys = Object.keys(bindings);
	for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
		const keyA = keys[i];
		const keyB = keys[j];
		if (keyA === "rowActivate" && keyB === "cellEnterControl" || keyA === "cellEnterControl" && keyB === "rowActivate") continue;
		if (areShortcutValuesOverlapping(bindings[keyA], bindings[keyB])) warnings.push(`Action '${keyA}' and Action '${keyB}' share overlapping shortcut combinations.`);
	}
	return warnings;
};
const createNatTableKeyboard = (keybindings) => ({
	cellInteraction: {
		enter: (event) => matchShortcutValue(event, keybindings.cellEnterControl),
		exit: (event) => matchShortcutValue(event, keybindings.cellExitControl),
		next: (event) => matchShortcutValue(event, keybindings.cellTabNextControl),
		previous: (event) => matchShortcutValue(event, keybindings.cellTabPrevControl)
	},
	rowActivate: (event) => matchShortcutValue(event, keybindings.rowActivate),
	columnReorderDirection: (event) => {
		if (matchShortcutValue(event, keybindings.columnReorderLeft)) return -1;
		if (matchShortcutValue(event, keybindings.columnReorderRight)) return 1;
		return null;
	}
});
const MAX_STATE_COMPARISON_DEPTH = 128;
const MAX_STATE_COMPARISON_WORK = 1e3;
let valuesMatch = () => false;
const isObject = (value) => typeof value === "object" && value !== null;
const enumerableKeys = (value) => Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
const hasSeenPair = (left, right, seen) => {
	const rightValues = seen.get(left);
	if (rightValues?.has(right)) return true;
	if (rightValues) rightValues.add(right);
	else seen.set(left, /* @__PURE__ */ new Set([right]));
	return false;
};
const cloneSeenPairs = (seen) => new Map(Array.from(seen, ([left, rightValues]) => [left, new Set(rightValues)]));
const replaceSeenPairs = (target, source) => {
	target.clear();
	for (const [left, rightValues] of source) target.set(left, new Set(rightValues));
};
const valuesMatchWithoutFailedPairSideEffects = (left, right, context) => {
	const trialSeen = cloneSeenPairs(context.seen);
	if (!valuesMatch(left, right, {
		...context,
		seen: trialSeen
	})) return false;
	replaceSeenPairs(context.seen, trialSeen);
	return true;
};
const datesMatch = (left, right) => left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime());
const regexpsMatch = (left, right) => left instanceof RegExp && right instanceof RegExp && left.source === right.source && left.flags === right.flags;
const isDateComparison = (left, right) => left instanceof Date || right instanceof Date;
const isRegExpComparison = (left, right) => left instanceof RegExp || right instanceof RegExp;
const isMapComparison = (left, right) => left instanceof Map || right instanceof Map;
const isSetComparison = (left, right) => left instanceof Set || right instanceof Set;
const valuesMatchNested = (left, right, context) => valuesMatch(left, right, {
	...context,
	depth: context.depth + 1
});
const arraysMatch = (left, right, context) => Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => valuesMatchNested(value, right[index], context));
const mapsMatch = (left, right, context) => {
	if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) return false;
	if (left.size * 2 > context.budget.remainingWork) return false;
	const leftMap = left;
	const rightEntries = Array.from(right.entries());
	return Array.from(leftMap.entries()).every(([key, value], index) => valuesMatchNested(key, rightEntries[index]?.[0], context) && valuesMatchNested(value, rightEntries[index]?.[1], context));
};
const setsMatch = (left, right, context) => {
	if (!(left instanceof Set) || !(right instanceof Set) || left.size !== right.size) return false;
	if (left.size > context.budget.remainingWork) return false;
	const leftSet = left;
	const unmatchedRightValues = Array.from(right.values());
	return Array.from(leftSet.values()).every((leftValue) => {
		const matchingIndex = unmatchedRightValues.findIndex((rightValue) => valuesMatchWithoutFailedPairSideEffects(leftValue, rightValue, {
			...context,
			depth: context.depth + 1
		}));
		if (matchingIndex < 0) return false;
		unmatchedRightValues.splice(matchingIndex, 1);
		return true;
	});
};
const plainObjectsMatch = (left, right, context) => {
	const leftPrototype = Object.getPrototypeOf(left);
	if (leftPrototype !== Object.getPrototypeOf(right)) return false;
	if (leftPrototype !== Object.prototype && leftPrototype !== null) return false;
	const leftKeys = enumerableKeys(left);
	const rightKeys = new Set(enumerableKeys(right));
	const leftRecord = left;
	const rightRecord = right;
	return leftKeys.length === rightKeys.size && leftKeys.length <= context.budget.remainingWork && leftKeys.every((key) => rightKeys.has(key) && valuesMatchNested(leftRecord[key], rightRecord[key], context));
};
const specialObjectsMatch = (left, right, context) => {
	if (isDateComparison(left, right)) return datesMatch(left, right);
	if (isRegExpComparison(left, right)) return regexpsMatch(left, right);
	if (Array.isArray(left) || Array.isArray(right)) return arraysMatch(left, right, context);
	if (isMapComparison(left, right)) return mapsMatch(left, right, context);
	if (isSetComparison(left, right)) return setsMatch(left, right, context);
	return null;
};
valuesMatch = (left, right, context) => {
	if (context.depth > MAX_STATE_COMPARISON_DEPTH || context.budget.remainingWork <= 0) return false;
	context.budget.remainingWork -= 1;
	if (Object.is(left, right)) return true;
	if (!isObject(left)) return false;
	if (!isObject(right)) return false;
	if (hasSeenPair(left, right, context.seen)) return true;
	return specialObjectsMatch(left, right, context) ?? plainObjectsMatch(left, right, context);
};
const hasNatTableStateValueChanged = (left, right) => !valuesMatch(left, right, {
	seen: /* @__PURE__ */ new Map(),
	budget: { remainingWork: MAX_STATE_COMPARISON_WORK },
	depth: 0
});
const setSignalIfChanged = (target, value) => {
	if (target() !== value) target.set(value);
};
const setSignalIfDefinedChanged = (target, value) => {
	if (value !== void 0 && target() !== value) target.set(value);
};
var NatTableService = class NatTableService {
	controllerSignal = signal(null, ...ngDevMode ? [{ debugName: "controllerSignal" }] : /* istanbul ignore next */ []);
	controller = this.controllerSignal.asReadonly();
	stateSignal = signal({}, ...ngDevMode ? [{ debugName: "stateSignal" }] : /* istanbul ignore next */ []);
	state = this.stateSignal.asReadonly();
	surfaceInitialState = signal({}, ...ngDevMode ? [{ debugName: "surfaceInitialState" }] : /* istanbul ignore next */ []);
	surfaceMode = signal("auto", ...ngDevMode ? [{ debugName: "surfaceMode" }] : /* istanbul ignore next */ []);
	manualPageCount = signal(void 0, ...ngDevMode ? [{ debugName: "manualPageCount" }] : /* istanbul ignore next */ []);
	enableAnnouncements = signal(true, ...ngDevMode ? [{ debugName: "enableAnnouncements" }] : /* istanbul ignore next */ []);
	stickyHeader = signal(true, ...ngDevMode ? [{ debugName: "stickyHeader" }] : /* istanbul ignore next */ []);
	enableMultiSort = signal(false, ...ngDevMode ? [{ debugName: "enableMultiSort" }] : /* istanbul ignore next */ []);
	locale = signal(void 0, ...ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []);
	accessibilityText = signal({}, ...ngDevMode ? [{ debugName: "accessibilityText" }] : /* istanbul ignore next */ []);
	columnResizeMode = signal("onEnd", ...ngDevMode ? [{ debugName: "columnResizeMode" }] : /* istanbul ignore next */ []);
	columnSizingMode = signal("fill", ...ngDevMode ? [{ debugName: "columnSizingMode" }] : /* istanbul ignore next */ []);
	enableColumnResizing = signal(false, ...ngDevMode ? [{ debugName: "enableColumnResizing" }] : /* istanbul ignore next */ []);
	enableReordering = signal(false, ...ngDevMode ? [{ debugName: "enableReordering" }] : /* istanbul ignore next */ []);
	enableSorting = signal(false, ...ngDevMode ? [{ debugName: "enableSorting" }] : /* istanbul ignore next */ []);
	enablePinning = signal(false, ...ngDevMode ? [{ debugName: "enablePinning" }] : /* istanbul ignore next */ []);
	direction = signal(void 0, ...ngDevMode ? [{ debugName: "direction" }] : /* istanbul ignore next */ []);
	globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
	surfaceKeybindings = signal({}, ...ngDevMode ? [{ debugName: "surfaceKeybindings" }] : /* istanbul ignore next */ []);
	keybindings = computed(() => mergeNatTableKeybindings(this.surfaceKeybindings(), this.globalKeybindings), ...ngDevMode ? [{ debugName: "keybindings" }] : /* istanbul ignore next */ []);
	keyboard = computed(() => createNatTableKeyboard(this.keybindings()), ...ngDevMode ? [{ debugName: "keyboard" }] : /* istanbul ignore next */ []);
	manualPagination = computed(() => {
		const mode = this.surfaceMode();
		return typeof mode === "string" ? mode === "manual" : mode.pagination === "manual";
	}, ...ngDevMode ? [{ debugName: "manualPagination" }] : /* istanbul ignore next */ []);
	manualSorting = computed(() => {
		const mode = this.surfaceMode();
		return typeof mode === "string" ? mode === "manual" : mode.sorting === "manual";
	}, ...ngDevMode ? [{ debugName: "manualSorting" }] : /* istanbul ignore next */ []);
	manualFiltering = computed(() => {
		const mode = this.surfaceMode();
		return typeof mode === "string" ? mode === "manual" : mode.filtering === "manual";
	}, ...ngDevMode ? [{ debugName: "manualFiltering" }] : /* istanbul ignore next */ []);
	paginationRegistrations = signal(0, ...ngDevMode ? [{ debugName: "paginationRegistrations" }] : /* istanbul ignore next */ []);
	hasPagination = computed(() => this.paginationRegistrations() > 0, ...ngDevMode ? [{ debugName: "hasPagination" }] : /* istanbul ignore next */ []);
	searchRegistrations = signal(0, ...ngDevMode ? [{ debugName: "searchRegistrations" }] : /* istanbul ignore next */ []);
	hasSearch = computed(() => this.searchRegistrations() > 0, ...ngDevMode ? [{ debugName: "hasSearch" }] : /* istanbul ignore next */ []);
	stateChangeEvent = signal(null, ...ngDevMode ? [{ debugName: "stateChangeEvent" }] : /* istanbul ignore next */ []);
	setController(controller) {
		this.controllerSignal.set(controller);
	}
	clearController(controller) {
		this.controllerSignal.update((current) => current === controller ? null : current);
	}
	notifyStateChange(state) {
		this.stateChangeEvent.set(state);
	}
	updateState(updater) {
		this.stateSignal.update(updater);
	}
	setState(value) {
		this.stateSignal.set(value);
	}
	patchState(config) {
		if (config.state !== void 0) this.stateSignal.set(config.state);
		if (config.initialState !== void 0) this.surfaceInitialState.set(config.initialState);
		if (config.mode !== void 0) this.surfaceMode.set(config.mode);
		if (config.accessibilityText !== void 0 && hasNatTableStateValueChanged(this.accessibilityText(), config.accessibilityText)) this.accessibilityText.set(config.accessibilityText);
		if (config.keybindings !== void 0 && hasNatTableStateValueChanged(this.surfaceKeybindings(), config.keybindings)) this.surfaceKeybindings.set(config.keybindings);
		setSignalIfChanged(this.manualPageCount, config.manualPageCount);
		setSignalIfChanged(this.locale, config.locale);
		setSignalIfChanged(this.direction, config.direction);
		setSignalIfDefinedChanged(this.enableAnnouncements, config.enableAnnouncements);
		setSignalIfDefinedChanged(this.stickyHeader, config.stickyHeader);
		setSignalIfDefinedChanged(this.enableMultiSort, config.enableMultiSort);
		setSignalIfDefinedChanged(this.columnResizeMode, config.columnResizeMode);
		setSignalIfDefinedChanged(this.columnSizingMode, config.columnSizingMode);
		setSignalIfDefinedChanged(this.enableColumnResizing, config.enableColumnResizing);
		setSignalIfDefinedChanged(this.enableReordering, config.enableReordering);
		setSignalIfDefinedChanged(this.enableSorting, config.enableSorting);
		setSignalIfDefinedChanged(this.enablePinning, config.enablePinning);
	}
	registerPagination() {
		this.paginationRegistrations.update((count) => count + 1);
	}
	unregisterPagination() {
		this.paginationRegistrations.update((count) => Math.max(0, count - 1));
	}
	registerSearch() {
		this.searchRegistrations.update((count) => count + 1);
	}
	unregisterSearch() {
		this.searchRegistrations.update((count) => Math.max(0, count - 1));
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableService,
	decorators: [{ type: Injectable }]
});
var NatTableLocaleWarningState = class NatTableLocaleWarningState {
	warnedLocaleIds = /* @__PURE__ */ new Set();
	claim(localeId) {
		if (this.warnedLocaleIds.has(localeId)) return false;
		this.warnedLocaleIds.add(localeId);
		return true;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableLocaleWarningState,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableLocaleWarningState,
		providedIn: "root"
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableLocaleWarningState,
	decorators: [{
		type: Injectable,
		args: [{ providedIn: "root" }]
	}]
});
var NatTableRowRenderStrategyRegistry = class NatTableRowRenderStrategyRegistry {
	registeredStrategy = signal(null, ...ngDevMode ? [{ debugName: "registeredStrategy" }] : /* istanbul ignore next */ []);
	strategy = this.registeredStrategy.asReadonly();
	register(strategy) {
		const current = this.registeredStrategy();
		if (current && current !== strategy) throw new Error("[ng-advanced-table] Only one body-row rendering strategy may be registered per table.");
		this.registeredStrategy.set(strategy);
		return () => {
			this.registeredStrategy.update((registered) => registered === strategy ? null : registered);
		};
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableRowRenderStrategyRegistry,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableRowRenderStrategyRegistry
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableRowRenderStrategyRegistry,
	decorators: [{ type: Injectable }]
});
const ROW_ACTIVATE_INTERACTIVE_SELECTOR = "a[href], button, input, select, textarea, summary, [contenteditable=\"true\"], [role=\"button\"], [role=\"link\"], [role=\"checkbox\"], [role=\"menuitem\"], [role=\"menuitemcheckbox\"], [role=\"menuitemradio\"], [role=\"tab\"], [role=\"switch\"], [role=\"combobox\"], [role=\"textbox\"], [role=\"searchbox\"]";
const ROW_ACTIVATE_OPT_OUT_SELECTOR = `[data-nat-row-activation="false"]`;
const NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE = "data-nat-table-managed-cell-widget";
const NAT_TABLE_CELL_SELECTOR = "[natTableCell]";
const NAT_TABLE_HOST_SELECTOR = "nat-table, nat-list";
const NAT_TABLE_CELL_CONTROL_ATTRIBUTE_FILTER = [
	"contenteditable",
	"disabled",
	"href",
	"nggridcellwidget",
	"role",
	"tabindex"
];
const GRID_CELL_SELECTOR = "[role=\"gridcell\"], [role=\"columnheader\"], [role=\"rowheader\"]";
const DELEGATED_CONTROL_SELECTOR = "a[href], button, summary, input[type=\"checkbox\"], input[type=\"button\"], input[type=\"submit\"], input[type=\"reset\"], [role=\"button\"], [role=\"link\"], [role=\"checkbox\"], [role=\"switch\"]";
const focusAndConsume = (event, control) => {
	event.preventDefault();
	event.stopPropagation();
	control.focus();
	return true;
};
const isReachableControl = (element) => !element.hasAttribute("disabled") && (element.tabIndex >= 0 || element.hasAttribute("ngGridCellWidget") || element.hasAttribute("data-nat-table-managed-cell-widget")) && !element.closest("[hidden], [inert], [aria-hidden=\"true\"]");
const cellInteractiveControls = (cell) => Array.from(cell.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)).filter((control) => isReachableControl(control) && !control.closest("[role=\"menu\"], [role=\"menubar\"]"));
const hasContentOutsideControl = (cell, control) => {
	const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		if (!node.textContent?.trim() || control.contains(node)) continue;
		if (node.parentElement?.closest("[hidden], [inert], [aria-hidden=\"true\"]")) continue;
		return true;
	}
	return false;
};
const delegatedCellControl = (cell) => {
	const controls = cellInteractiveControls(cell);
	if (controls.length !== 1) return null;
	const [control] = controls;
	if (!control.matches(DELEGATED_CONTROL_SELECTOR)) return null;
	return hasContentOutsideControl(cell, control) ? null : control;
};
const isNatTableDelegatedCellControl = (cell, target) => delegatedCellControl(cell) === target;
const enterFirstCellControl = (event, cell, target) => {
	if (target !== cell) return false;
	const firstControl = cellInteractiveControls(cell).at(0);
	if (!firstControl) return false;
	return focusAndConsume(event, firstControl);
};
const escapeBackToCell = (event, cell, target) => {
	if (target === cell) return false;
	if (delegatedCellControl(cell) === target) return false;
	return focusAndConsume(event, cell);
};
const tabBetweenCellControls = (event, cell, target, cellInteraction) => {
	if (target === cell) return false;
	const controls = cellInteractiveControls(cell);
	const index = controls.indexOf(target);
	if (index === -1) return false;
	const nextIndex = index + (cellInteraction.previous(event) ? -1 : 1);
	if (nextIndex < 0 || nextIndex >= controls.length) return false;
	return focusAndConsume(event, controls[nextIndex]);
};
const handleCellInteractionKeydown = (event, cellInteraction) => {
	if (event.defaultPrevented) return false;
	const target = event.target;
	if (!(target instanceof HTMLElement)) return false;
	const cell = target.closest(GRID_CELL_SELECTOR);
	if (!cell) return false;
	if (cellInteraction.enter(event)) return enterFirstCellControl(event, cell, target);
	if (cellInteraction.exit(event)) return escapeBackToCell(event, cell, target);
	if (cellInteraction.next(event) || cellInteraction.previous(event)) return tabBetweenCellControls(event, cell, target, cellInteraction);
	return false;
};
const handleCellInteractionFocusIn = (event) => {
	const target = event.target;
	if (!(target instanceof HTMLElement) || !target.matches(GRID_CELL_SELECTOR)) return false;
	if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return false;
	const control = delegatedCellControl(target);
	if (!control) return false;
	control.focus();
	return true;
};
const DEFAULT_TABLE_STATE = {
	sorting: [],
	globalFilter: "",
	columnFilters: [],
	columnVisibility: {},
	columnOrder: [],
	columnPinning: {
		left: [],
		right: []
	},
	columnSizing: {},
	rowSelection: {},
	pagination: {
		pageIndex: 0,
		pageSize: 10
	}
};
const readColumnEntry = (record, columnId) => record[columnId];
const resolveColumnDefId = (column) => {
	if (column.id) return column.id;
	const accessorKey = column.accessorKey;
	if (typeof accessorKey === "string") return accessorKey.replace(/\./g, "_");
	return typeof column.header === "string" ? column.header : null;
};
const getColumnDefLeafIds = (columns) => {
	return columns.flatMap((column) => {
		const childColumns = column.columns;
		if (childColumns?.length) return getColumnDefLeafIds(childColumns);
		const columnId = resolveColumnDefId(column);
		return columnId ? [columnId] : [];
	});
};
const someLeafColumnDef = (columns, predicate) => columns.some((column) => {
	const childColumns = column.columns;
	return childColumns?.length ? someLeafColumnDef(childColumns, predicate) : predicate(column);
});
const patchLeafColumnDefSorting = (columns, columnId, sortingFn) => {
	const patched = columns.map((column) => {
		const childColumns = column.columns;
		if (childColumns?.length) {
			const patchedChildren = patchLeafColumnDefSorting(childColumns, columnId, sortingFn);
			return patchedChildren === childColumns ? column : {
				...column,
				columns: patchedChildren
			};
		}
		return resolveColumnDefId(column) === columnId ? {
			...column,
			sortingFn
		} : column;
	});
	return patched.some((column, index) => column !== columns[index]) ? patched : columns;
};
const getUserColumnSizing = (columns) => {
	const result = {};
	const keepFirst = (columnId, sizing) => {
		if (!(columnId in result)) result[columnId] = sizing;
	};
	for (const column of columns) {
		const childColumns = column.columns;
		if (childColumns?.length) {
			for (const [childId, childSizing] of Object.entries(getUserColumnSizing(childColumns))) keepFirst(childId, childSizing);
			continue;
		}
		const columnId = resolveColumnDefId(column);
		if (!columnId) continue;
		keepFirst(columnId, {
			hasSize: column.size !== void 0,
			hasMinSize: column.minSize !== void 0,
			hasMaxSize: column.maxSize !== void 0
		});
	}
	return result;
};
const normalizeColumnDimension = (value) => {
	if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? `${Math.round(value)}px` : null;
	if (typeof value === "string") {
		const trimmedValue = value.trim();
		return trimmedValue ? trimmedValue : null;
	}
	return null;
};
const normalizeCellMaxLines = (value) => {
	if (!Number.isFinite(value) && value > 0) return null;
	return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 2;
};
const getNumericColumnWidth = (value) => {
	if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
	if (typeof value !== "string") return null;
	const pixelMatch = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());
	if (!pixelMatch) return null;
	const width = Number(pixelMatch[1]);
	return Number.isFinite(width) && width >= 0 ? Math.round(width) : null;
};
const getColumnResizeBounds = (column, userColumnSizing, minWidth = 48) => {
	const rawMin = readColumnEntry(userColumnSizing, column.id)?.hasMinSize === true ? column.columnDef.minSize : minWidth;
	const min = Math.max(Math.round(typeof rawMin === "number" && Number.isFinite(rawMin) ? rawMin : minWidth), 1);
	const rawMax = column.columnDef.maxSize;
	return {
		min,
		max: typeof rawMax === "number" && Number.isFinite(rawMax) && rawMax < Number.MAX_SAFE_INTEGER ? Math.round(rawMax) : null
	};
};
const clampWidth = (width, bounds) => {
	const { min, max } = bounds;
	return Math.max(Math.round(Math.max(Number.isFinite(min) ? min : 1, max !== null ? Math.min(max, width) : width)), 1);
};
const computeKeyboardResizeWidth = ({ key, current, min, max, isRtl }) => {
	const towardEdge = isRtl ? -8 : 8;
	let next;
	switch (key) {
		case "ArrowLeft":
			next = current - towardEdge;
			break;
		case "ArrowRight":
			next = current + towardEdge;
			break;
		case "Home":
			next = min;
			break;
		case "End":
			next = max ?? current + 40;
			break;
		default: return null;
	}
	return Math.max(min, max !== null ? Math.min(max, next) : next);
};
const clampColumnSizingWidths = (sizing, getColumn, clampColumnWidth) => {
	let result = null;
	for (const columnId of Object.keys(sizing)) {
		const column = getColumn(columnId);
		if (!column) continue;
		const clamped = clampColumnWidth(column, sizing[columnId]);
		if (clamped !== sizing[columnId]) (result ??= { ...sizing })[columnId] = clamped;
	}
	return result ?? sizing;
};
const isUsableVirtualItem = (item, rowCount, totalSize) => Number.isInteger(item.index) && item.index >= 0 && item.index < rowCount && Number.isFinite(item.start) && item.start >= 0 && Number.isFinite(item.end) && item.end > item.start && item.end <= totalSize;
const renderAllRows = (rows, windowOffset) => ({
	rows: rows.map((row, index) => ({
		kind: "row",
		row,
		logicalIndex: windowOffset + index,
		beforeSize: 0
	})),
	afterSize: 0
});
const warned = /* @__PURE__ */ new Set();
const warnOnce = (tag, message) => {
	if (!isDevMode() || warned.has(tag)) return;
	warned.add(tag);
	console.warn(`[ng-advanced-table] Row-render strategy: ${message}`);
};
const resolveLogicalExtent = (strategy, loadedRowCount) => {
	const logicalRowCount = strategy.logicalRowCount?.() ?? null;
	if (logicalRowCount === null) return null;
	if (!Number.isInteger(logicalRowCount) || logicalRowCount < 0) {
		warnOnce("logical-count", `unusable logicalRowCount ${logicalRowCount}; treating the loaded rows as the full extent.`);
		return null;
	}
	const rowCount = Math.max(logicalRowCount, loadedRowCount);
	const suppliedOffset = strategy.rowWindowOffset?.() ?? 0;
	const windowOffset = Number.isInteger(suppliedOffset) ? Math.min(Math.max(suppliedOffset, 0), rowCount - loadedRowCount) : 0;
	if (windowOffset !== suppliedOffset) warnOnce("window-offset", `rowWindowOffset ${suppliedOffset} does not fit the logical extent; clamping to ${windowOffset}.`);
	return {
		rowCount,
		windowOffset
	};
};
const buildNatTableBodyRenderPlan = (rows, strategy) => {
	if (!strategy) return renderAllRows(rows, 0);
	const extent = resolveLogicalExtent(strategy, rows.length);
	const rowCount = extent?.rowCount ?? rows.length;
	const windowOffset = extent?.windowOffset ?? 0;
	const rowHeight = strategy.rowHeight();
	const totalSize = strategy.totalSize();
	if (!Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(totalSize) || totalSize < rowCount * rowHeight) {
		warnOnce("metrics", `unusable metrics (rowHeight ${rowHeight}, totalSize ${totalSize}, rows ${rowCount}); rendering every loaded row.`);
		return renderAllRows(rows, windowOffset);
	}
	const supplied = strategy.items();
	const items = supplied.filter((item) => isUsableVirtualItem(item, rowCount, totalSize)).sort((left, right) => left.index - right.index);
	if (rowCount > 0 && items.length === 0) {
		warnOnce("empty", "no usable items for a non-empty row model; rendering every loaded row.");
		return renderAllRows(rows, windowOffset);
	}
	const renderedRows = [];
	let previousEnd = 0;
	let previousIndex = -1;
	for (const item of items) {
		if (item.index === previousIndex || item.start < previousEnd) continue;
		const loadedIndex = item.index - windowOffset;
		const row = loadedIndex >= 0 && loadedIndex < rows.length ? rows[loadedIndex] : void 0;
		const beforeSize = Math.max(0, item.start - previousEnd);
		previousIndex = item.index;
		renderedRows.push(row === void 0 ? {
			kind: "placeholder",
			logicalIndex: item.index,
			beforeSize
		} : {
			kind: "row",
			row,
			logicalIndex: item.index,
			beforeSize
		});
		previousEnd = Math.max(previousEnd, item.end);
	}
	if (renderedRows.length < supplied.length) warnOnce("items", `${supplied.length - renderedRows.length} of ${supplied.length} items discarded; indices must be unique in-range integers and extents finite and increasing.`);
	return {
		rows: renderedRows,
		afterSize: Math.max(0, totalSize - previousEnd)
	};
};
const uniqueStringValues = (values) => {
	const seen = /* @__PURE__ */ new Set();
	return values.filter((value) => {
		if (seen.has(value)) return false;
		seen.add(value);
		return true;
	});
};
const normalizeColumnOrder = (columnOrder, allLeafColumnIds) => {
	const validColumnIds = new Set(allLeafColumnIds);
	const nextOrder = uniqueStringValues(columnOrder.filter((columnId) => validColumnIds.has(columnId)));
	for (const columnId of allLeafColumnIds) if (!nextOrder.includes(columnId)) nextOrder.push(columnId);
	return nextOrder;
};
const retainColumnOrder = (columnOrder, allLeafColumnIds) => {
	const nextOrder = uniqueStringValues(columnOrder);
	for (const columnId of allLeafColumnIds) if (!nextOrder.includes(columnId)) nextOrder.push(columnId);
	return nextOrder;
};
const retainColumnPinning = (columnPinning) => ({
	left: uniqueStringValues(columnPinning.left ?? []),
	right: uniqueStringValues(columnPinning.right ?? [])
});
const normalizeColumnPinning = (columnPinning, allLeafColumnIds) => {
	const validColumnIds = new Set(allLeafColumnIds);
	const leftColumnIds = columnPinning.left ?? [];
	const rightColumnIds = columnPinning.right ?? [];
	return {
		left: uniqueStringValues(leftColumnIds.filter((columnId) => validColumnIds.has(columnId))),
		right: uniqueStringValues(rightColumnIds.filter((columnId) => validColumnIds.has(columnId)))
	};
};
const moveItemInArrayCopy = (values, fromIndex, toIndex) => {
	const nextValues = [...values];
	const movedValue = nextValues.splice(fromIndex, 1).at(0);
	if (movedValue === void 0) return nextValues;
	nextValues.splice(toIndex, 0, movedValue);
	return nextValues;
};
const getColumnMoveTargetIndex = (columnIds, columnId, directionDelta) => {
	const currentIndex = columnIds.indexOf(columnId);
	const nextIndex = currentIndex + directionDelta;
	return currentIndex !== -1 && nextIndex >= 0 && nextIndex < columnIds.length ? nextIndex : null;
};
const replaceIdsInSlots = (currentOrder, nextVisibleOrder, movableIds) => {
	const nextValues = [...nextVisibleOrder];
	return currentOrder.map((columnId) => {
		if (!movableIds.has(columnId)) return columnId;
		return nextValues.shift() ?? columnId;
	});
};
const hasSameStringOrder = (left, right) => {
	if (left.length !== right.length) return false;
	return left.every((value, index) => value === right[index]);
};
const accumulatePinnedOffsets = (columns, widths) => {
	const offsets = {};
	let offset = 0;
	for (const column of columns) {
		offsets[column.id] = offset;
		offset += widths[column.id] ?? 0;
	}
	return offsets;
};
const resolvePinnedZoneColumns = (zoneColumnIds, visibleColumnsById) => (zoneColumnIds ?? []).map((columnId) => visibleColumnsById.get(columnId)).filter((column) => !!column);
const getColumnZone = (column) => {
	const pinnedState = column.getIsPinned();
	if (pinnedState === "left") return "left";
	if (pinnedState === "right") return "right";
	return "center";
};
const normalizeColumnLabel = (label) => {
	return (label?.trim() ?? "") || null;
};
const resolveColumnLabel = (column) => {
	const hiddenHeaderLabel = normalizeColumnLabel(column.columnDef.meta?.hiddenHeaderLabel);
	if (hiddenHeaderLabel) return hiddenHeaderLabel;
	const metaLabel = normalizeColumnLabel(column.columnDef.meta?.label);
	if (metaLabel) return metaLabel;
	if (typeof column.columnDef.header === "string") {
		const headerLabel = normalizeColumnLabel(column.columnDef.header);
		if (headerLabel) return headerLabel;
	}
	const accessorKey = column.columnDef.accessorKey;
	return typeof accessorKey === "string" ? accessorKey : column.id || "Column";
};
const isPrimitiveHeaderContent = (header) => {
	return typeof header === "string" || typeof header === "number";
};
const getHeaderRowColumnIds = (headerGroup) => headerGroup.headers.filter((header) => !header.isPlaceholder).map((header) => header.column.id);
const shouldHidePrimitiveHeaderLabel = (header, columnState) => !!columnState?.hiddenHeaderLabel && isPrimitiveHeaderContent(header.column.columnDef.header);
const resolveColumnRenderWidth = (column, sizing, resizedWidth, widths) => {
	if (!(sizing?.hasSize === true || resizedWidth !== void 0)) return null;
	const numeric = resizedWidth !== void 0 ? widths[column.id] ?? column.getSize() : column.getSize();
	return normalizeColumnDimension(numeric);
};
const resolveSizedDimension = (hasBound, boundValue, width) => {
	if (hasBound) return normalizeColumnDimension(boundValue);
	return width;
};
const normalizeMetaDimension = (value) => value !== void 0 ? normalizeColumnDimension(value) : null;
const resolveHeaderBound = (metaValue, headerWidth) => {
	if (metaValue !== void 0) return normalizeColumnDimension(metaValue);
	return headerWidth;
};
const buildColumnWidths = (column, sizing, resizedWidth, widths) => {
	const width = resolveColumnRenderWidth(column, sizing, resizedWidth, widths);
	return {
		width,
		minWidth: resolveSizedDimension(sizing?.hasMinSize === true, column.columnDef.minSize, width),
		maxWidth: resolveSizedDimension(sizing?.hasMaxSize === true, column.columnDef.maxSize, width)
	};
};
const buildHeaderWidths = (meta, resizedDimension) => {
	const headerWidth = resizedDimension ?? normalizeMetaDimension(meta?.headerSize);
	return {
		headerWidth,
		headerMinWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMinSize, headerWidth),
		headerMaxWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMaxSize, headerWidth)
	};
};
const buildPinnedEdges = (column, context) => {
	const pinnedLeft = context.leftPinnedIds.has(column.id);
	const pinnedRight = context.rightPinnedIds.has(column.id);
	return {
		pinnedLeft,
		pinnedRight,
		hasPinnedEdgeLeft: pinnedLeft && context.leftVisibleColumns.at(-1)?.id === column.id,
		hasPinnedEdgeRight: pinnedRight && context.rightVisibleColumns.at(0)?.id === column.id,
		left: pinnedLeft ? context.leftOffsets[column.id] ?? 0 : null,
		right: pinnedRight ? context.rightOffsets[column.id] ?? 0 : null
	};
};
const findPrimarySortEntry = (context, columnId) => {
	if (context.primarySortColumnId !== columnId) return null;
	return context.state.sorting.find((entry) => entry.id === columnId) ?? null;
};
const resolveAriaSort = (primarySortEntry) => {
	if (!primarySortEntry) return null;
	return primarySortEntry.desc ? "descending" : "ascending";
};
const buildClassMap = (entries) => entries.filter(Boolean).join(" ");
const buildHeaderClassMap = (edges, flags) => buildClassMap([
	"header-cell",
	edges.hasPinnedEdgeLeft && "has-pinned-edge-left",
	edges.hasPinnedEdgeRight && "has-pinned-edge-right",
	flags.alignEnd && "is-align-end",
	edges.pinnedLeft && "is-pinned-left",
	edges.pinnedRight && "is-pinned-right",
	flags.headerConstrainedWidth && "is-width-constrained"
]);
const buildCellClassMap = (edges, flags) => buildClassMap([
	"data-cell",
	flags.isRowHeader && "data-row-header",
	edges.hasPinnedEdgeLeft && "has-pinned-edge-left",
	edges.hasPinnedEdgeRight && "has-pinned-edge-right",
	flags.alignEnd && "is-align-end",
	flags.cellClamped && "is-cell-clamped",
	edges.pinnedLeft && "is-pinned-left",
	edges.pinnedRight && "is-pinned-right",
	flags.constrainedWidth && "is-width-constrained"
]);
const resolveRowActivationAttribute = (meta) => meta?.rowActivation === false ? "false" : null;
const buildColumnRenderState = (column, context) => {
	const { state, userColumnSizing, widths } = context;
	const sizing = userColumnSizing[column.id];
	const resizedWidth = readColumnEntry(state.columnSizing, column.id);
	const meta = column.columnDef.meta;
	const { width, minWidth, maxWidth } = buildColumnWidths(column, sizing, resizedWidth, widths);
	const { headerWidth, headerMinWidth, headerMaxWidth } = buildHeaderWidths(meta, resizedWidth !== void 0 ? width : null);
	const edges = buildPinnedEdges(column, context);
	const primarySortEntry = findPrimarySortEntry(context, column.id);
	const cellMaxLines = normalizeCellMaxLines(meta?.cellMaxLines ?? 2);
	const flags = {
		alignEnd: meta?.align === "end",
		isRowHeader: !!meta?.rowHeader,
		cellClamped: cellMaxLines !== null,
		constrainedWidth: width !== null || maxWidth !== null,
		headerConstrainedWidth: headerWidth !== null || headerMaxWidth !== null
	};
	return {
		label: resolveColumnLabel(column),
		hiddenHeaderLabel: normalizeColumnLabel(meta?.hiddenHeaderLabel),
		alignEnd: flags.alignEnd,
		...edges,
		width,
		minWidth,
		maxWidth,
		constrainedWidth: flags.constrainedWidth,
		headerWidth,
		headerMinWidth,
		headerMaxWidth,
		headerConstrainedWidth: flags.headerConstrainedWidth,
		cellHeight: normalizeMetaDimension(meta?.cellHeight),
		cellMaxLines,
		ariaSort: resolveAriaSort(primarySortEntry),
		rowHeader: flags.isRowHeader,
		rowActivationAttribute: resolveRowActivationAttribute(meta),
		headerClassMap: buildHeaderClassMap(edges, flags),
		cellClassMap: buildCellClassMap(edges, flags)
	};
};
const computeFillFlexWidths = (visibleColumns, columnSizing, deps) => {
	const { container, clamp, getBounds, getColumn } = deps;
	const widths = {};
	const flex = [];
	let sumPinned = 0;
	let totalWeight = 0;
	let sumFlexMins = 0;
	for (const column of visibleColumns) {
		const resizedWidth = readColumnEntry(columnSizing, column.id);
		if (resizedWidth !== void 0) {
			const width = clamp(column, resizedWidth);
			widths[column.id] = width;
			sumPinned += width;
		} else {
			const rawSize = column.getSize();
			const weight = Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1;
			const min = getBounds(column).min;
			flex.push({
				id: column.id,
				weight,
				min
			});
			totalWeight += weight;
			sumFlexMins += min;
		}
	}
	if (flex.length === 0) return widths;
	const surplus = Math.max(0, container - sumPinned - sumFlexMins);
	let distributedSurplus = 0;
	flex.forEach(({ id, weight, min }, index) => {
		const extra = index === flex.length - 1 ? surplus - distributedSurplus : Math.floor(surplus * weight / totalWeight);
		distributedSurplus += extra;
		const flexColumn = getColumn(id);
		const flexMax = flexColumn ? getBounds(flexColumn).max : null;
		const width = min + Math.max(0, extra);
		widths[id] = flexMax !== null ? Math.min(width, flexMax) : width;
	});
	return widths;
};
const resolveIntrinsicColumnWidth = (column, context, clamp) => {
	const { measuredWidth, sizing, resizedWidth, usesAuthoritativeLayout } = context;
	if (resizedWidth !== void 0) return clamp(column, resizedWidth);
	if (!usesAuthoritativeLayout && measuredWidth !== void 0 && measuredWidth > 0) return measuredWidth;
	const rawSize = column.getSize();
	return (sizing?.hasSize === true ? getNumericColumnWidth(rawSize) : null) ?? (Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1);
};
const computeIntrinsicWidths = (visibleColumns, columnSizing, deps) => {
	const { measured, userSizing, usesAuthoritativeLayout, clamp } = deps;
	const result = {};
	for (const column of visibleColumns) result[column.id] = resolveIntrinsicColumnWidth(column, {
		measuredWidth: measured[column.id],
		sizing: userSizing[column.id],
		resizedWidth: columnSizing[column.id],
		usesAuthoritativeLayout
	}, clamp);
	return result;
};
const DEFAULT_ROW_ID_INDEX_PREFIX = "__nat-table-row-index__:";
const MAX_FILTER_VALUE_NODES = 1e4;
const primitiveMatchesFilterQuery = (value, normalizedQuery) => {
	if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean" && typeof value !== "bigint") return false;
	return String(value).toLowerCase().includes(normalizedQuery);
};
const dateMatchesFilterQuery = (value, normalizedQuery) => value instanceof Date && Number.isFinite(value.getTime()) && value.toISOString().toLowerCase().includes(normalizedQuery);
const isNullish = (value) => value === null || value === void 0;
const scalarMatchesFilterQuery = (value, normalizedQuery) => primitiveMatchesFilterQuery(value, normalizedQuery) || dateMatchesFilterQuery(value, normalizedQuery);
const shouldSkipArrayTraversal = (value, visitedArrays) => !Array.isArray(value) || visitedArrays.has(value);
const resolveDefaultRowId = (row, index, parent) => {
	const id = typeof row === "object" && row !== null ? row.id : void 0;
	if (typeof id === "string" && id.trim()) return id;
	if (typeof id === "number" && Number.isFinite(id)) return String(id);
	const fallbackId = `${DEFAULT_ROW_ID_INDEX_PREFIX}${index}`;
	return parent ? `${parent.id}.${fallbackId}` : fallbackId;
};
const normalizeRowSelection = (selection, allowMulti) => {
	if (allowMulti) return selection;
	const selectedIds = Object.keys(selection).filter((id) => selection[id]).sort();
	if (selectedIds.length <= 1) return selection;
	return { [selectedIds[0]]: true };
};
const serializeRowSelection = (selection) => {
	return Object.keys(selection).filter((id) => selection[id]).sort().join("|");
};
const normalizeDataStatus = (status) => {
	return status === NAT_TABLE_DATA_STATUS.loading || status === NAT_TABLE_DATA_STATUS.error ? status : NAT_TABLE_DATA_STATUS.success;
};
const matchesFilterQuery = (value, query) => {
	const normalizedQuery = query.toLowerCase();
	if (!Array.isArray(value)) return scalarMatchesFilterQuery(value, normalizedQuery);
	const pendingValues = [value];
	const visitedArrays = /* @__PURE__ */ new WeakSet();
	let examinedNodes = 0;
	while (pendingValues.length > 0 && examinedNodes < MAX_FILTER_VALUE_NODES) {
		const currentValue = pendingValues.pop();
		examinedNodes += 1;
		if (isNullish(currentValue)) continue;
		if (scalarMatchesFilterQuery(currentValue, normalizedQuery)) return true;
		if (currentValue instanceof Date) continue;
		if (shouldSkipArrayTraversal(currentValue, visitedArrays)) continue;
		const currentArray = currentValue;
		visitedArrays.add(currentArray);
		const remainingCapacity = MAX_FILTER_VALUE_NODES - examinedNodes - pendingValues.length;
		const scheduledItemCount = Math.min(currentArray.length, Math.max(remainingCapacity, 0));
		for (let index = scheduledItemCount - 1; index >= 0; index -= 1) pendingValues.push(currentArray[index]);
	}
	return false;
};
const hasSameWidths = (left, right) => {
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	for (const key of leftKeys) if (left[key] !== right[key]) return false;
	return true;
};
const hasSameColumnVisibility = (current, next) => {
	if (current.length !== next.length) return false;
	return current.every((column) => {
		const nextColumn = next.find((candidate) => candidate.id === column.id);
		if (!nextColumn) return false;
		return nextColumn.visible === column.visible;
	});
};
let lastFilterValue = void 0;
let lastQuery = "";
let lastRowId = null;
let lastIdQuery = "";
let lastIdMatch = false;
const toQuery = (filterValue) => String(filterValue ?? "").trim().toLowerCase();
const normalizeQuery = (filterValue) => {
	if (typeof filterValue === "object" && filterValue !== null || typeof filterValue === "function") return toQuery(filterValue);
	if (filterValue !== lastFilterValue) {
		lastFilterValue = filterValue;
		lastQuery = toQuery(filterValue);
	}
	return lastQuery;
};
const rowIdMatches = (rowId, query) => {
	if (rowId !== lastRowId || query !== lastIdQuery) {
		lastRowId = rowId;
		lastIdQuery = query;
		lastIdMatch = matchesFilterQuery(rowId, query);
	}
	return lastIdMatch;
};
const genericGlobalFilter = (row, columnId, filterValue) => {
	const query = normalizeQuery(filterValue);
	if (!query) return true;
	return matchesFilterQuery(row.getValue(columnId), query) || rowIdMatches(row.id, query);
};
const RESIZE_KEYS = /* @__PURE__ */ new Set([
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End"
]);
const isResizeKey = (event) => RESIZE_KEYS.has(event.key);
const isColumnResizable = (column, surfaceEnabled) => column.columnDef.enableResizing ?? surfaceEnabled;
const isColumnReorderable = (column, surfaceEnabled) => column.columnDef.meta?.reorderable ?? surfaceEnabled;
const canResizeColumn = (header, surfaceEnabled) => !header.isPlaceholder && isColumnResizable(header.column, surfaceEnabled);
const getCellTone = (column, context) => column.columnDef.meta?.cellTone?.(context) ?? null;
const resolveDraggedColumnId = (event, rowColumnIds) => {
	const draggedColumnId = event.item.data;
	if (typeof draggedColumnId === "string" && rowColumnIds.includes(draggedColumnId)) return draggedColumnId;
	return rowColumnIds[event.previousIndex] ?? null;
};
const originatesFromInteractiveDescendant = (event) => {
	const target = event.target;
	const currentTarget = event.currentTarget;
	if (!(target instanceof Element) || !(currentTarget instanceof Element)) return false;
	const guarded = target.closest(`${ROW_ACTIVATE_INTERACTIVE_SELECTOR}, ${ROW_ACTIVATE_OPT_OUT_SELECTOR}`);
	if (!guarded) return false;
	return guarded !== currentTarget && currentTarget.contains(guarded);
};
const renderWithoutTransitions = (elements, render) => {
	const targets = Array.from(elements);
	for (const element of targets) element.style.transition = "none";
	try {
		render();
	} finally {
		for (const element of targets) {
			element.offsetWidth;
			element.style.transition = "";
		}
	}
};
const scrollElementHorizontallyIntoView = (scrollContainer, element) => {
	const containerRect = scrollContainer.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	if (elementRect.left < containerRect.left) {
		scrollContainer.scrollLeft -= containerRect.left - elementRect.left;
		return;
	}
	if (elementRect.right > containerRect.right) scrollContainer.scrollLeft += elementRect.right - containerRect.right;
};
const PINNED_LEFT_CLASS = "is-pinned-left";
const PINNED_RIGHT_CLASS = "is-pinned-right";
const isPinnedCell = (cell) => cell.classList.contains(PINNED_LEFT_CLASS) || cell.classList.contains(PINNED_RIGHT_CLASS);
const resolveUnobscuredSpan = (scrollContainer, cell) => {
	const containerRect = scrollContainer.getBoundingClientRect();
	let left = containerRect.left;
	let right = containerRect.right;
	for (const sibling of Array.from(cell.parentElement?.children ?? [])) {
		if (sibling === cell || !(sibling instanceof HTMLElement)) continue;
		if (sibling.classList.contains(PINNED_LEFT_CLASS)) left = Math.max(left, sibling.getBoundingClientRect().right);
		else if (sibling.classList.contains(PINNED_RIGHT_CLASS)) right = Math.min(right, sibling.getBoundingClientRect().left);
	}
	return {
		left,
		right
	};
};
const scrollCellIntoUnobscuredView = (scrollContainer, cell) => {
	if (isPinnedCell(cell)) return;
	const span = resolveUnobscuredSpan(scrollContainer, cell);
	const cellRect = cell.getBoundingClientRect();
	const isFullyVisible = cellRect.left >= span.left && cellRect.right <= span.right;
	if (span.right <= span.left || isFullyVisible) return;
	scrollContainer.scrollLeft += (cellRect.left + cellRect.right) / 2 - (span.left + span.right) / 2;
};
const toSortString = (value) => {
	if (typeof value === "number") return Number.isNaN(value) || value === Infinity || value === -Infinity ? "" : String(value);
	return typeof value === "string" ? value : "";
};
const compareBasic = (a, b) => {
	if (a === b) return 0;
	return a > b ? 1 : -1;
};
const compareDatetime = (a, b) => {
	if (a > b) return 1;
	return a < b ? -1 : 0;
};
const toAlphanumericChunks = (value) => value.split(reSplitAlphaNumeric).filter(Boolean).map((text) => {
	const number = Number.parseInt(text, 10);
	return Number.isNaN(number) ? text : number;
});
const compareText = (a, b) => {
	if (a > b) return 1;
	return b > a ? -1 : 0;
};
const compareAlphanumericChunk = (a, b) => {
	const aIsText = typeof a === "string";
	const bIsText = typeof b === "string";
	if (aIsText && bIsText) return compareText(a, b);
	if (aIsText || bIsText) return aIsText ? -1 : 1;
	return compareBasic(a, b);
};
const compareAlphanumericChunks = (a, b) => {
	const aChunks = a;
	const bChunks = b;
	const length = Math.min(aChunks.length, bChunks.length);
	for (let index = 0; index < length; index++) {
		const result = compareAlphanumericChunk(aChunks[index], bChunks[index]);
		if (result !== 0) return result;
	}
	return aChunks.length - bChunks.length;
};
const toValue = (value) => value;
const toTime = (value) => value instanceof Date && Object.getPrototypeOf(value) === Date.prototype ? value.getTime() : value;
const toLowerText = (value) => toSortString(value).toLowerCase();
const toLowerChunks = (value) => toAlphanumericChunks(toLowerText(value));
const toChunks = (value) => toAlphanumericChunks(toSortString(value));
const KEYED_SORTING_FNS = /* @__PURE__ */ new Map([
	[sortingFns.basic, {
		toKey: toValue,
		compare: compareBasic
	}],
	[sortingFns.datetime, {
		toKey: toTime,
		compare: compareDatetime
	}],
	[sortingFns.text, {
		toKey: toLowerText,
		compare: compareBasic
	}],
	[sortingFns.textCaseSensitive, {
		toKey: toSortString,
		compare: compareBasic
	}],
	[sortingFns.alphanumeric, {
		toKey: toLowerChunks,
		compare: compareAlphanumericChunks
	}],
	[sortingFns.alphanumericCaseSensitive, {
		toKey: toChunks,
		compare: compareAlphanumericChunks
	}]
]);
const resolveKeyedSortingFn = (sortingFn) => KEYED_SORTING_FNS.get(sortingFn) ?? null;
const NOT_READ = Symbol("notRead");
const lazyByIndex = (length, read) => {
	const cache = new Array(length).fill(NOT_READ);
	return (index) => {
		let value = cache[index];
		if (value === NOT_READ) {
			value = read(index);
			cache[index] = value;
		}
		return value;
	};
};
const readValues = (rows, id) => {
	const values = new Array(rows.length);
	for (let index = 0; index < rows.length; index++) values[index] = rows[index].getValue(id);
	return values;
};
const resolveValueAccess = (rows, id, keyed, eager) => {
	if (keyed && eager) {
		const values = readValues(rows, id);
		return {
			value: (index) => values[index],
			key: null,
			keys: values.map((value) => keyed.toKey(value))
		};
	}
	const value = lazyByIndex(rows.length, (index) => rows[index].getValue(id));
	return {
		value,
		key: keyed ? lazyByIndex(rows.length, (index) => keyed.toKey(value(index))) : null,
		keys: null
	};
};
const resolveSortEntries = (table, sorting, rows) => {
	const entries = [];
	for (const sort of sorting) {
		const column = table.getColumn(sort.id);
		if (!column?.getCanSort()) continue;
		const sortingFn = column.getSortingFn();
		const keyed = resolveKeyedSortingFn(sortingFn);
		entries.push({
			id: sort.id,
			desc: sort.desc,
			invertSorting: column.columnDef.invertSorting ?? false,
			sortUndefined: column.columnDef.sortUndefined,
			...resolveValueAccess(rows, sort.id, keyed, entries.length === 0),
			compareKeys: keyed?.compare ?? null,
			sortingFn
		});
	}
	return entries;
};
const compareUndefined = (sortUndefined, aUndefined, bUndefined) => {
	if (!sortUndefined || !aUndefined && !bUndefined) return null;
	if (sortUndefined === "first" || sortUndefined === "last") return {
		order: aUndefined === (sortUndefined === "first") ? -1 : 1,
		placement: true
	};
	if (aUndefined && bUndefined) return null;
	return {
		order: aUndefined ? sortUndefined : -sortUndefined,
		placement: false
	};
};
const compareValues = (entry, rows, a, b) => {
	if (entry.keys && entry.compareKeys) return entry.compareKeys(entry.keys[a], entry.keys[b]);
	return entry.key && entry.compareKeys ? entry.compareKeys(entry.key(a), entry.key(b)) : entry.sortingFn(rows[a], rows[b], entry.id);
};
const compareEntry = (entry, rows, a, b) => {
	const undefinedOrder = entry.sortUndefined ? compareUndefined(entry.sortUndefined, entry.value(a) === void 0, entry.value(b) === void 0) : null;
	if (undefinedOrder?.placement) return undefinedOrder.order;
	const result = undefinedOrder?.order ?? compareValues(entry, rows, a, b);
	const direction = (entry.desc ? -1 : 1) * (entry.invertSorting ? -1 : 1);
	return result === 0 ? 0 : result * direction;
};
const sortFlatRows = (table, sorting, rowModel) => {
	const rows = rowModel.rows;
	const entries = resolveSortEntries(table, sorting, rows);
	const order = rows.map((_, index) => index);
	order.sort((a, b) => {
		for (const entry of entries) {
			const result = compareEntry(entry, rows, a, b);
			if (result !== 0) return result;
		}
		return rows[a].index - rows[b].index;
	});
	const sortedRows = order.map((index) => rows[index]);
	return {
		rows: sortedRows,
		flatRows: sortedRows,
		rowsById: rowModel.rowsById
	};
};
const natGetSortedRowModel = () => (table) => memo(() => [table.getState().sorting, table.getPreSortedRowModel()], (sorting, rowModel) => {
	if (!rowModel.rows.length || !sorting.length) return rowModel;
	if (rowModel.rows.some((row) => row.subRows.length > 0)) return getSortedRowModel()(table)();
	return sortFlatRows(table, sorting, rowModel);
}, getMemoOptions(table.options, "debugTable", "getSortedRowModel", () => table._autoResetPageIndex()));
const dedupeSortEntries = (sorting) => {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const entry of sorting) {
		if (seen.has(entry.id)) continue;
		seen.add(entry.id);
		deduped.push(entry);
	}
	return deduped;
};
const normalizeSortingState = (sorting, allowMulti) => {
	if (!sorting.length) return sorting;
	const deduped = dedupeSortEntries(sorting);
	if (allowMulti) return deduped.length === sorting.length ? sorting : deduped;
	const normalized = deduped.slice(0, 1);
	if (normalized.length === sorting.length && normalized[0] === sorting[0]) return sorting;
	const single = normalized[0];
	const original = sorting[0];
	if (normalized.length === 1 && sorting.length === 1 && single.id === original.id && single.desc === original.desc) return sorting;
	return normalized;
};
const serializeSorting = (sorting) => {
	return sorting.map((entry) => `${entry.id}:${entry.desc ? "desc" : "asc"}`).join("|");
};
const serializeColumnFilterValue = (value) => {
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return "[unserializable]";
	}
};
const serializeColumnFilters = (columnFilters) => {
	return columnFilters.map((entry) => `${entry.id}:${serializeColumnFilterValue(entry.value)}`).join("|");
};
const sortDirection = (desc) => desc ? "descending" : "ascending";
const resolveFilterState = (hasGlobalFilter, hasColumnFilters) => {
	if (hasGlobalFilter) return hasColumnFilters ? "global-and-column" : "global";
	return hasColumnFilters ? "column" : "none";
};
const resolveUpdater = (currentValue, updater) => {
	if (updater === void 0) return currentValue;
	return updater instanceof Function ? updater(currentValue) : updater;
};
const firstPageUpdater = (currentPagination) => ({
	...currentPagination,
	pageIndex: 0
});
const orDefault = (value, fallback) => value ?? fallback;
const resolveSeedState = (initialState, defaults) => ({
	sorting: orDefault(initialState.sorting, defaults.sorting),
	globalFilter: orDefault(initialState.globalFilter, defaults.globalFilter),
	columnFilters: orDefault(initialState.columnFilters, defaults.columnFilters),
	columnVisibility: orDefault(initialState.columnVisibility, defaults.columnVisibility),
	columnOrder: orDefault(initialState.columnOrder, defaults.columnOrder),
	columnPinning: orDefault(initialState.columnPinning, defaults.columnPinning),
	columnSizing: orDefault(initialState.columnSizing, defaults.columnSizing),
	rowSelection: orDefault(initialState.rowSelection, defaults.rowSelection),
	pagination: {
		pageIndex: orDefault(initialState.pagination?.pageIndex, defaults.pagination.pageIndex),
		pageSize: orDefault(initialState.pagination?.pageSize, defaults.pagination.pageSize)
	}
});
const prependForcedSortingEntry = (userSorting, columnId) => {
	if (columnId === null) return userSorting;
	return [{
		id: columnId,
		desc: false
	}, ...userSorting.filter((entry) => entry.id !== columnId)];
};
const stripNatTableSubHeaderSorting = (sorting, columnId) => {
	if (columnId === null) return sorting;
	const stripped = sorting.filter((entry) => entry.id !== columnId);
	return stripped.length === sorting.length ? sorting : stripped;
};
const compareNumbersAscending = (a, b) => {
	if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1;
	if (Number.isNaN(b)) return -1;
	if (a === b) return 0;
	return a > b ? 1 : -1;
};
const compareNaturalAscending = (a, b) => {
	if (typeof a === "number" && typeof b === "number") return compareNumbersAscending(a, b);
	const aText = String(a ?? "").toLowerCase();
	const bText = String(b ?? "").toLowerCase();
	if (aText === bText) return 0;
	return aText > bText ? 1 : -1;
};
const resolveOrderRank = (order, value) => {
	const rank = order.findIndex((candidate) => Object.is(candidate, value));
	return rank === -1 ? order.length : rank;
};
const createSubHeaderOrderSortingFn = (order) => {
	return (rowA, rowB, columnId) => {
		const valueA = rowA.getValue(columnId);
		const valueB = rowB.getValue(columnId);
		const rankA = resolveOrderRank(order, valueA);
		const rankB = resolveOrderRank(order, valueB);
		if (rankA !== rankB) return rankA < rankB ? -1 : 1;
		return rankA === order.length ? compareNaturalAscending(valueA, valueB) : 0;
	};
};
const buildSubHeaderRowGroups = (pageRows, prePaginationRows, columnId) => {
	const groups = /* @__PURE__ */ new Map();
	if (!pageRows.length) return groups;
	const groupRowCounts = /* @__PURE__ */ new Map();
	for (const row of prePaginationRows) {
		const value = row.getValue(columnId);
		groupRowCounts.set(value, (groupRowCounts.get(value) ?? 0) + 1);
	}
	let previousValue;
	let hasPreviousValue = false;
	for (const row of pageRows) {
		const value = row.getValue(columnId);
		if (!hasPreviousValue || !Object.is(value, previousValue)) groups.set(row.id, {
			value,
			rowCountValue: groupRowCounts.get(value) ?? 0,
			row
		});
		previousValue = value;
		hasPreviousValue = true;
	}
	return groups;
};
const resolveSubHeaderValueText = (value) => value == null ? "" : String(value);
const buildSubHeaderRowOffsets = (pageRows, groups) => {
	if (groups.size === 0) return [];
	let renderedSubHeaders = 0;
	return pageRows.map((row) => {
		if (groups.has(row.id)) renderedSubHeaders += 1;
		return renderedSubHeaders;
	});
};
let nextTableId = 0;
var NatTableState = class NatTableState {
	natTableService = inject(NatTableService);
	localeWarnings = inject(NatTableLocaleWarningState);
	directionality = inject(Directionality, { optional: true });
	rowRenderStrategies = inject(NatTableRowRenderStrategyRegistry, {
		optional: true,
		self: true
	});
	rowRenderStrategy = computed(() => this.rowRenderStrategies?.strategy() ?? null, ...ngDevMode ? [{ debugName: "rowRenderStrategy" }] : /* istanbul ignore next */ []);
	hasRowRenderStrategy = computed(() => this.rowRenderStrategy() !== null, ...ngDevMode ? [{ debugName: "hasRowRenderStrategy" }] : /* istanbul ignore next */ []);
	strategyLogicalRowCount = computed(() => {
		const logicalRowCount = this.rowRenderStrategy()?.logicalRowCount?.() ?? null;
		return logicalRowCount !== null && Number.isInteger(logicalRowCount) && logicalRowCount >= 0 ? logicalRowCount : null;
	}, ...ngDevMode ? [{ debugName: "strategyLogicalRowCount" }] : /* istanbul ignore next */ []);
	remoteRowCount = computed(() => {
		const logicalRowCount = this.strategyLogicalRowCount();
		return logicalRowCount === null ? null : Math.max(logicalRowCount, this.bodyRows().length);
	}, ...ngDevMode ? [{ debugName: "remoteRowCount" }] : /* istanbul ignore next */ []);
	isDelegatedCellControl(cell, target) {
		return isNatTableDelegatedCellControl(cell, target);
	}
	data = signal([], ...ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []);
	columnDefs = signal([], ...ngDevMode ? [{ debugName: "columnDefs" }] : /* istanbul ignore next */ []);
	dataStatus = signal(NAT_TABLE_DATA_STATUS.success, ...ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []);
	error = signal(null, ...ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []);
	enableRowSelection = signal(false, ...ngDevMode ? [{ debugName: "enableRowSelection" }] : /* istanbul ignore next */ []);
	selectionMode = signal("multiple", ...ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []);
	globalFilterFn = signal(void 0, ...ngDevMode ? [{ debugName: "globalFilterFn" }] : /* istanbul ignore next */ []);
	getRowId = signal(void 0, ...ngDevMode ? [{ debugName: "getRowId" }] : /* istanbul ignore next */ []);
	accessibleName = signal(void 0, ...ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []);
	caption = signal(void 0, ...ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []);
	emitRowRenderEvents = signal(false, ...ngDevMode ? [{ debugName: "emitRowRenderEvents" }] : /* istanbul ignore next */ []);
	subHeaderColumn = signal(void 0, ...ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []);
	subHeaderOrder = signal(void 0, ...ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []);
	enableSubHeaders = signal(true, ...ngDevMode ? [{ debugName: "enableSubHeaders" }] : /* istanbul ignore next */ []);
	initialState = computed(() => this.natTableService.surfaceInitialState(), ...ngDevMode ? [{ debugName: "initialState" }] : /* istanbul ignore next */ []);
	state = computed(() => this.natTableService.state(), ...ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []);
	enablePagination = computed(() => this.natTableService.hasPagination(), ...ngDevMode ? [{ debugName: "enablePagination" }] : /* istanbul ignore next */ []);
	enableGlobalFilter = computed(() => this.natTableService.hasSearch(), ...ngDevMode ? [{ debugName: "enableGlobalFilter" }] : /* istanbul ignore next */ []);
	manualPagination = computed(() => this.natTableService.manualPagination(), ...ngDevMode ? [{ debugName: "manualPagination" }] : /* istanbul ignore next */ []);
	manualSorting = computed(() => this.natTableService.manualSorting(), ...ngDevMode ? [{ debugName: "manualSorting" }] : /* istanbul ignore next */ []);
	manualFiltering = computed(() => this.natTableService.manualFiltering(), ...ngDevMode ? [{ debugName: "manualFiltering" }] : /* istanbul ignore next */ []);
	manualPageCount = computed(() => this.natTableService.manualPageCount(), ...ngDevMode ? [{ debugName: "manualPageCount" }] : /* istanbul ignore next */ []);
	enableAnnouncements = computed(() => this.natTableService.enableAnnouncements(), ...ngDevMode ? [{ debugName: "enableAnnouncements" }] : /* istanbul ignore next */ []);
	stickyHeader = computed(() => this.natTableService.stickyHeader(), ...ngDevMode ? [{ debugName: "stickyHeader" }] : /* istanbul ignore next */ []);
	enableMultiSort = computed(() => this.natTableService.enableMultiSort(), ...ngDevMode ? [{ debugName: "enableMultiSort" }] : /* istanbul ignore next */ []);
	locale = computed(() => this.natTableService.locale(), ...ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []);
	accessibilityText = computed(() => this.natTableService.accessibilityText(), ...ngDevMode ? [{ debugName: "accessibilityText" }] : /* istanbul ignore next */ []);
	columnResizeMode = computed(() => this.natTableService.columnResizeMode(), ...ngDevMode ? [{ debugName: "columnResizeMode" }] : /* istanbul ignore next */ []);
	columnSizingMode = computed(() => this.natTableService.columnSizingMode(), ...ngDevMode ? [{ debugName: "columnSizingMode" }] : /* istanbul ignore next */ []);
	resizingEnabled = computed(() => this.natTableService.enableColumnResizing(), ...ngDevMode ? [{ debugName: "resizingEnabled" }] : /* istanbul ignore next */ []);
	enableReordering = computed(() => this.natTableService.enableReordering(), ...ngDevMode ? [{ debugName: "enableReordering" }] : /* istanbul ignore next */ []);
	enableSorting = computed(() => this.natTableService.enableSorting(), ...ngDevMode ? [{ debugName: "enableSorting" }] : /* istanbul ignore next */ []);
	enablePinning = computed(() => this.natTableService.enablePinning(), ...ngDevMode ? [{ debugName: "enablePinning" }] : /* istanbul ignore next */ []);
	isFixedLayout = computed(() => this.columnSizingMode() === "fixed", ...ngDevMode ? [{ debugName: "isFixedLayout" }] : /* istanbul ignore next */ []);
	direction = computed(() => this.natTableService.direction(), ...ngDevMode ? [{ debugName: "direction" }] : /* istanbul ignore next */ []);
	internalSorting = signal(DEFAULT_TABLE_STATE.sorting, ...ngDevMode ? [{ debugName: "internalSorting" }] : /* istanbul ignore next */ []);
	internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter, ...ngDevMode ? [{ debugName: "internalGlobalFilter" }] : /* istanbul ignore next */ []);
	internalColumnFilters = signal(DEFAULT_TABLE_STATE.columnFilters, ...ngDevMode ? [{ debugName: "internalColumnFilters" }] : /* istanbul ignore next */ []);
	internalColumnVisibility = signal(DEFAULT_TABLE_STATE.columnVisibility, ...ngDevMode ? [{ debugName: "internalColumnVisibility" }] : /* istanbul ignore next */ []);
	internalColumnOrder = signal(DEFAULT_TABLE_STATE.columnOrder, ...ngDevMode ? [{ debugName: "internalColumnOrder" }] : /* istanbul ignore next */ []);
	internalColumnPinning = signal(DEFAULT_TABLE_STATE.columnPinning, ...ngDevMode ? [{ debugName: "internalColumnPinning" }] : /* istanbul ignore next */ []);
	internalColumnSizing = signal(DEFAULT_TABLE_STATE.columnSizing, ...ngDevMode ? [{ debugName: "internalColumnSizing" }] : /* istanbul ignore next */ []);
	resizeSeedSizing = signal({}, ...ngDevMode ? [{ debugName: "resizeSeedSizing" }] : /* istanbul ignore next */ []);
	internalRowSelection = signal(DEFAULT_TABLE_STATE.rowSelection, ...ngDevMode ? [{ debugName: "internalRowSelection" }] : /* istanbul ignore next */ []);
	internalPagination = signal(DEFAULT_TABLE_STATE.pagination, ...ngDevMode ? [{ debugName: "internalPagination" }] : /* istanbul ignore next */ []);
	hasSeededInitialState = signal(false, ...ngDevMode ? [{ debugName: "hasSeededInitialState" }] : /* istanbul ignore next */ []);
	tableElementId = signal(`nat-table-${nextTableId++}`, ...ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []);
	tableCaptionId = computed(() => `${this.tableElementId()}-caption`, ...ngDevMode ? [{ debugName: "tableCaptionId" }] : /* istanbul ignore next */ []);
	tableSummaryId = computed(() => `${this.tableElementId()}-summary`, ...ngDevMode ? [{ debugName: "tableSummaryId" }] : /* istanbul ignore next */ []);
	tableDescriptionId = computed(() => `${this.tableElementId()}-description`, ...ngDevMode ? [{ debugName: "tableDescriptionId" }] : /* istanbul ignore next */ []);
	tableKeyboardInstructionsId = computed(() => `${this.tableElementId()}-instructions`, ...ngDevMode ? [{ debugName: "tableKeyboardInstructionsId" }] : /* istanbul ignore next */ []);
	tableIntlConfig = inject(NAT_TABLE_INTL);
	localeId = computed(() => this.locale() ?? NAT_EN_LOCALE_ID, ...ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []);
	tableIntl = computed(() => resolveNatTableIntl(this.tableIntlConfig, this.localeId()), ...ngDevMode ? [{ debugName: "tableIntl" }] : /* istanbul ignore next */ []);
	resolvedAccessibilityText = computed(() => mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.accessibilityText()), ...ngDevMode ? [{ debugName: "resolvedAccessibilityText" }] : /* istanbul ignore next */ []);
	allLeafColumnIds = computed(() => getColumnDefLeafIds(this.columnDefs()), ...ngDevMode ? [{ debugName: "allLeafColumnIds" }] : /* istanbul ignore next */ []);
	userColumnSizing = computed(() => getUserColumnSizing(this.columnDefs()), ...ngDevMode ? [{ debugName: "userColumnSizing" }] : /* istanbul ignore next */ []);
	resolvedSubHeaderColumnId = computed(() => {
		const columnId = this.subHeaderColumn();
		if (!this.enableSubHeaders() || columnId === void 0 || columnId === "") return null;
		return this.allLeafColumnIds().includes(columnId) ? columnId : null;
	}, ...ngDevMode ? [{ debugName: "resolvedSubHeaderColumnId" }] : /* istanbul ignore next */ []);
	resolvedColumnDefs = computed(() => {
		const columnId = this.resolvedSubHeaderColumnId();
		const order = this.subHeaderOrder();
		if (columnId === null || !order?.length) return this.columnDefs();
		return patchLeafColumnDefSorting(this.columnDefs(), columnId, createSubHeaderOrderSortingFn(order));
	}, ...ngDevMode ? [{ debugName: "resolvedColumnDefs" }] : /* istanbul ignore next */ []);
	resolvedColumnOrder = computed(() => retainColumnOrder(this.state().columnOrder ?? this.internalColumnOrder(), this.allLeafColumnIds()), ...ngDevMode ? [{ debugName: "resolvedColumnOrder" }] : /* istanbul ignore next */ []);
	resolvedColumnPinning = computed(() => retainColumnPinning(this.state().columnPinning ?? this.internalColumnPinning()), ...ngDevMode ? [{ debugName: "resolvedColumnPinning" }] : /* istanbul ignore next */ []);
	tanstackColumnOrder = computed(() => normalizeColumnOrder(this.resolvedColumnOrder(), this.allLeafColumnIds()), ...ngDevMode ? [{ debugName: "tanstackColumnOrder" }] : /* istanbul ignore next */ []);
	tanstackColumnPinning = computed(() => normalizeColumnPinning(this.resolvedColumnPinning(), this.allLeafColumnIds()), ...ngDevMode ? [{ debugName: "tanstackColumnPinning" }] : /* istanbul ignore next */ []);
	resolvedColumnSizing = computed(() => {
		const resolved = this.state().columnSizing ?? this.internalColumnSizing();
		const seed = this.resizeSeedSizing();
		let merged = null;
		for (const columnId of Object.keys(seed)) if (!(columnId in resolved)) (merged ??= { ...resolved })[columnId] = seed[columnId];
		return merged ?? resolved;
	}, ...ngDevMode ? [{ debugName: "resolvedColumnSizing" }] : /* istanbul ignore next */ []);
	userGlobalFilter = computed(() => this.state().globalFilter ?? this.internalGlobalFilter(), ...ngDevMode ? [{ debugName: "userGlobalFilter" }] : /* istanbul ignore next */ []);
	mergedState = computed(() => ({
		sorting: normalizeSortingState(this.state().sorting ?? this.internalSorting(), this.enableMultiSort()),
		globalFilter: this.enableGlobalFilter() ? this.userGlobalFilter() : "",
		columnFilters: this.state().columnFilters ?? this.internalColumnFilters(),
		columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
		columnOrder: this.resolvedColumnOrder(),
		columnPinning: this.resolvedColumnPinning(),
		columnSizing: this.resolvedColumnSizing(),
		rowSelection: normalizeRowSelection(this.state().rowSelection ?? this.internalRowSelection(), this.selectionMode() === "multiple"),
		pagination: this.state().pagination ?? this.internalPagination()
	}), ...ngDevMode ? [{ debugName: "mergedState" }] : /* istanbul ignore next */ []);
	tanstackSortingState = computed(() => {
		this.subHeaderOrder();
		return prependForcedSortingEntry(this.mergedState().sorting, this.resolvedSubHeaderColumnId());
	}, ...ngDevMode ? [{ debugName: "tanstackSortingState" }] : /* istanbul ignore next */ []);
	resolvedDescription = computed(() => this.resolvedAccessibilityText().description ?? "", ...ngDevMode ? [{ debugName: "resolvedDescription" }] : /* istanbul ignore next */ []);
	resolvedEmptyState = computed(() => this.resolvedAccessibilityText().emptyState ?? "", ...ngDevMode ? [{ debugName: "resolvedEmptyState" }] : /* istanbul ignore next */ []);
	resolvedLoadingState = computed(() => this.resolvedAccessibilityText().loadingState ?? "", ...ngDevMode ? [{ debugName: "resolvedLoadingState" }] : /* istanbul ignore next */ []);
	resolvedErrorState = computed(() => this.resolvedAccessibilityText().errorState ?? "", ...ngDevMode ? [{ debugName: "resolvedErrorState" }] : /* istanbul ignore next */ []);
	resolvedDataStatus = computed(() => normalizeDataStatus(this.dataStatus()), ...ngDevMode ? [{ debugName: "resolvedDataStatus" }] : /* istanbul ignore next */ []);
	resolvedCaption = computed(() => this.caption()?.trim() ?? "", ...ngDevMode ? [{ debugName: "resolvedCaption" }] : /* istanbul ignore next */ []);
	resolvedDirection = computed(() => this.direction() ?? this.directionality?.value ?? "ltr", ...ngDevMode ? [{ debugName: "resolvedDirection" }] : /* istanbul ignore next */ []);
	table = createAngularTable(() => ({
		data: this.data(),
		columns: this.resolvedColumnDefs(),
		state: {
			...this.mergedState(),
			sorting: this.tanstackSortingState(),
			columnOrder: this.tanstackColumnOrder(),
			columnPinning: this.tanstackColumnPinning()
		},
		pageCount: this.manualPagination() ? this.manualPageCount() : void 0,
		manualPagination: this.manualPagination(),
		manualSorting: this.manualSorting(),
		manualFiltering: this.manualFiltering(),
		enableMultiSort: this.enableMultiSort(),
		isMultiSortEvent: (event) => this.enableMultiSort() && event.shiftKey === true,
		enableSorting: true,
		enableColumnPinning: true,
		enableColumnOrdering: this.hasReorderableColumns(),
		enableColumnResizing: true,
		columnResizeMode: this.columnResizeMode(),
		columnResizeDirection: this.resolvedDirection(),
		enableRowSelection: this.enableRowSelection(),
		enableMultiRowSelection: this.selectionMode() === "multiple",
		meta: {
			natTableLocaleId: this.localeId(),
			natTableCanMoveColumn: (columnId, direction) => this.canMoveColumn(columnId, direction),
			natTableMoveColumn: (columnId, direction) => this.moveColumn(columnId, direction),
			natTableSortingEnabled: this.enableSorting(),
			natTablePinningEnabled: this.enablePinning(),
			natTableSubHeaderColumnId: this.resolvedSubHeaderColumnId(),
			natTableRemoteRowCount: this.strategyLogicalRowCount()
		},
		autoResetPageIndex: false,
		globalFilterFn: this.globalFilterFn() ?? genericGlobalFilter,
		getRowId: (row, index, parent) => this.resolveRowId(row, index, parent),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: this.manualFiltering() ? void 0 : getFilteredRowModel(),
		getSortedRowModel: this.manualSorting() ? void 0 : natGetSortedRowModel(),
		getPaginationRowModel: !this.manualPagination() && this.enablePagination() ? getPaginationRowModel() : void 0,
		onSortingChange: (updater) => this.applySortingChange(updater),
		onGlobalFilterChange: (updater) => this.updateState({
			globalFilter: updater,
			pagination: firstPageUpdater
		}),
		onColumnFiltersChange: (updater) => this.updateState({
			columnFilters: updater,
			pagination: firstPageUpdater
		}),
		onColumnVisibilityChange: (updater) => this.updateState({ columnVisibility: updater }),
		onColumnOrderChange: (updater) => this.updateState({ columnOrder: updater }),
		onColumnPinningChange: (updater) => this.updateState({ columnPinning: updater }),
		onColumnSizingChange: (updater) => this.applyColumnSizingChange(updater),
		onRowSelectionChange: (updater) => this.updateState({ rowSelection: updater }),
		onPaginationChange: (updater) => this.updateState({ pagination: updater })
	}));
	headerGroups = computed(() => this.table.getHeaderGroups(), ...ngDevMode ? [{ debugName: "headerGroups" }] : /* istanbul ignore next */ []);
	bodyRows = computed(() => this.table.getRowModel().rows, ...ngDevMode ? [{ debugName: "bodyRows" }] : /* istanbul ignore next */ []);
	bodyRenderPlan = computed(() => buildNatTableBodyRenderPlan(this.bodyRows(), this.rowRenderStrategy()), ...ngDevMode ? [{ debugName: "bodyRenderPlan" }] : /* istanbul ignore next */ []);
	allLeafColumns = computed(() => this.table.getAllLeafColumns(), ...ngDevMode ? [{ debugName: "allLeafColumns" }] : /* istanbul ignore next */ []);
	hasResizableColumns = computed(() => this.allLeafColumns().some((column) => isColumnResizable(column, this.resizingEnabled())), ...ngDevMode ? [{ debugName: "hasResizableColumns" }] : /* istanbul ignore next */ []);
	hasReorderableColumns = computed(() => someLeafColumnDef(this.columnDefs(), (column) => column.meta?.reorderable ?? this.enableReordering()), ...ngDevMode ? [{ debugName: "hasReorderableColumns" }] : /* istanbul ignore next */ []);
	visibleColumns = computed(() => [
		...this.table.getLeftVisibleLeafColumns(),
		...this.table.getCenterVisibleLeafColumns(),
		...this.table.getRightVisibleLeafColumns()
	], ...ngDevMode ? [{ debugName: "visibleColumns" }] : /* istanbul ignore next */ []);
	leafHeaderRowId = computed(() => this.table.getHeaderGroups().at(-1)?.id ?? null, ...ngDevMode ? [{ debugName: "leafHeaderRowId" }] : /* istanbul ignore next */ []);
	visibleColumnCount = computed(() => this.visibleColumns().length, ...ngDevMode ? [{ debugName: "visibleColumnCount" }] : /* istanbul ignore next */ []);
	visibleRowCount = computed(() => this.bodyRows().length, ...ngDevMode ? [{ debugName: "visibleRowCount" }] : /* istanbul ignore next */ []);
	totalRowCount = computed(() => this.data().length, ...ngDevMode ? [{ debugName: "totalRowCount" }] : /* istanbul ignore next */ []);
	logicalRowCount = computed(() => this.remoteRowCount() ?? this.visibleRowCount(), ...ngDevMode ? [{ debugName: "logicalRowCount" }] : /* istanbul ignore next */ []);
	resolvedPageCount = computed(() => {
		if (this.manualPagination()) return this.manualPageCount() ?? 1;
		return this.enablePagination() ? Math.max(this.table.getPageCount(), 1) : 1;
	}, ...ngDevMode ? [{ debugName: "resolvedPageCount" }] : /* istanbul ignore next */ []);
	visibleColumnIds = computed(() => this.visibleColumns().map((column) => column.id).join("|"), ...ngDevMode ? [{ debugName: "visibleColumnIds" }] : /* istanbul ignore next */ []);
	emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1), ...ngDevMode ? [{ debugName: "emptyStateColSpan" }] : /* istanbul ignore next */ []);
	tableAriaBusy = computed(() => this.resolvedDataStatus() === NAT_TABLE_DATA_STATUS.loading ? "true" : null, ...ngDevMode ? [{ debugName: "tableAriaBusy" }] : /* istanbul ignore next */ []);
	bodyState = computed(() => {
		const dataStatus = this.resolvedDataStatus();
		if (dataStatus === NAT_TABLE_DATA_STATUS.error) return NAT_TABLE_BODY_STATE.error;
		if (dataStatus === NAT_TABLE_DATA_STATUS.loading && this.totalRowCount() === 0) return NAT_TABLE_BODY_STATE.loading;
		return this.logicalRowCount() > 0 ? NAT_TABLE_BODY_STATE.rows : NAT_TABLE_BODY_STATE.empty;
	}, ...ngDevMode ? [{ debugName: "bodyState" }] : /* istanbul ignore next */ []);
	headerRowCount = computed(() => this.headerGroups().length, ...ngDevMode ? [{ debugName: "headerRowCount" }] : /* istanbul ignore next */ []);
	renderedVisibleRowCount = computed(() => this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.visibleRowCount() : 0, ...ngDevMode ? [{ debugName: "renderedVisibleRowCount" }] : /* istanbul ignore next */ []);
	subHeaderGroups = computed(() => {
		const columnId = this.resolvedSubHeaderColumnId();
		if (columnId === null || this.bodyState() !== NAT_TABLE_BODY_STATE.rows || this.remoteRowCount() !== null) return /* @__PURE__ */ new Map();
		return buildSubHeaderRowGroups(this.bodyRows(), this.table.getPrePaginationRowModel().rows, columnId);
	}, ...ngDevMode ? [{ debugName: "subHeaderGroups" }] : /* istanbul ignore next */ []);
	subHeaderRowOffsets = computed(() => buildSubHeaderRowOffsets(this.bodyRows(), this.subHeaderGroups()), ...ngDevMode ? [{ debugName: "subHeaderRowOffsets" }] : /* istanbul ignore next */ []);
	gridRowCount = computed(() => this.headerRowCount() + this.subHeaderGroups().size + (this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.logicalRowCount() : 1), ...ngDevMode ? [{ debugName: "gridRowCount" }] : /* istanbul ignore next */ []);
	stateTotalRowCount = computed(() => {
		const bodyState = this.bodyState();
		if (bodyState === NAT_TABLE_BODY_STATE.loading || bodyState === NAT_TABLE_BODY_STATE.error) return 0;
		return this.remoteRowCount() ?? this.totalRowCount();
	}, ...ngDevMode ? [{ debugName: "stateTotalRowCount" }] : /* istanbul ignore next */ []);
	renderedPageIndex = computed(() => this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.mergedState().pagination.pageIndex : 0, ...ngDevMode ? [{ debugName: "renderedPageIndex" }] : /* istanbul ignore next */ []);
	renderedPageCount = computed(() => this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.resolvedPageCount() : 1, ...ngDevMode ? [{ debugName: "renderedPageCount" }] : /* istanbul ignore next */ []);
	tableRegionRef = signal(void 0, ...ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []);
	resolvedKeyboardInstructions = computed(() => {
		const text = this.resolvedAccessibilityText();
		const instructions = (text.keyboardInstructions ?? "").trim();
		const reorderInstructions = text.reorderKeyboardInstructions?.trim() ?? "";
		const resizeInstructions = text.resizeKeyboardInstructions?.trim() ?? "";
		const parts = [instructions];
		if (this.hasReorderableColumns()) parts.push(reorderInstructions);
		if (this.hasResizableColumns()) parts.push(resizeInstructions);
		return parts.filter((value) => !!value).join(" ");
	}, ...ngDevMode ? [{ debugName: "resolvedKeyboardInstructions" }] : /* istanbul ignore next */ []);
	resolvedListKeyboardInstructions = computed(() => {
		const text = this.resolvedAccessibilityText();
		return (text.listKeyboardInstructions ?? text.keyboardInstructions ?? "").trim();
	}, ...ngDevMode ? [{ debugName: "resolvedListKeyboardInstructions" }] : /* istanbul ignore next */ []);
	tableAriaLabel = computed(() => {
		if (this.resolvedCaption()) return null;
		const name = this.accessibleName()?.trim();
		return name === void 0 || name === "" ? null : name;
	}, ...ngDevMode ? [{ debugName: "tableAriaLabel" }] : /* istanbul ignore next */ []);
	tableAriaLabelledBy = computed(() => this.resolvedCaption() ? this.tableCaptionId() : null, ...ngDevMode ? [{ debugName: "tableAriaLabelledBy" }] : /* istanbul ignore next */ []);
	tableClassMap = computed(() => [
		"data-table",
		this.stickyHeader() && "has-sticky-header",
		this.usesAuthoritativeLayout() && "is-fixed-layout",
		this.hasRowRenderStrategy() && "is-virtualized"
	].filter(Boolean).join(" "), ...ngDevMode ? [{ debugName: "tableClassMap" }] : /* istanbul ignore next */ []);
	measuredHeaderWidths = signal({}, ...ngDevMode ? [{ debugName: "measuredHeaderWidths" }] : /* istanbul ignore next */ []);
	regionViewportWidth = signal(0, ...ngDevMode ? [{ debugName: "regionViewportWidth" }] : /* istanbul ignore next */ []);
	isFillFlexLayout = computed(() => !this.isFixedLayout() && (this.hasResizableColumns() || this.hasRowRenderStrategy()) && this.regionViewportWidth() > 0, ...ngDevMode ? [{ debugName: "isFillFlexLayout" }] : /* istanbul ignore next */ []);
	usesAuthoritativeLayout = computed(() => this.isFixedLayout() || this.isFillFlexLayout() || this.hasRowRenderStrategy(), ...ngDevMode ? [{ debugName: "usesAuthoritativeLayout" }] : /* istanbul ignore next */ []);
	resolvedColumnWidths = computed(() => {
		const visibleColumns = this.visibleColumns();
		const columnSizing = this.mergedState().columnSizing;
		const clamp = (column, width) => this.clampColumnWidth(column, width);
		if (this.isFillFlexLayout()) return computeFillFlexWidths(visibleColumns, columnSizing, {
			container: this.regionViewportWidth(),
			clamp,
			getBounds: (column) => this.getResizeBounds(column),
			getColumn: (columnId) => this.table.getColumn(columnId)
		});
		return computeIntrinsicWidths(visibleColumns, columnSizing, {
			measured: this.measuredHeaderWidths(),
			userSizing: this.userColumnSizing(),
			usesAuthoritativeLayout: this.usesAuthoritativeLayout(),
			clamp
		});
	}, ...ngDevMode ? [{ debugName: "resolvedColumnWidths" }] : /* istanbul ignore next */ []);
	fixedLayoutTableWidth = computed(() => {
		const widths = this.resolvedColumnWidths();
		return this.visibleColumns().reduce((total, column) => total + (widths[column.id] ?? 0), 0);
	}, ...ngDevMode ? [{ debugName: "fixedLayoutTableWidth" }] : /* istanbul ignore next */ []);
	columnRenderStates = computed(() => {
		const visibleColumns = this.visibleColumns();
		const widths = this.resolvedColumnWidths();
		const state = this.mergedState();
		const visibleColumnsById = new Map(visibleColumns.map((column) => [column.id, column]));
		const leftVisibleColumns = resolvePinnedZoneColumns(state.columnPinning.left, visibleColumnsById);
		const rightVisibleColumns = resolvePinnedZoneColumns(state.columnPinning.right, visibleColumnsById);
		const context = {
			widths,
			state,
			userColumnSizing: this.userColumnSizing(),
			primarySortColumnId: state.sorting.at(0)?.id ?? null,
			leftVisibleColumns,
			rightVisibleColumns,
			leftPinnedIds: new Set(leftVisibleColumns.map((column) => column.id)),
			rightPinnedIds: new Set(rightVisibleColumns.map((column) => column.id)),
			leftOffsets: accumulatePinnedOffsets(leftVisibleColumns, widths),
			rightOffsets: accumulatePinnedOffsets([...rightVisibleColumns].reverse(), widths)
		};
		const result = {};
		for (const column of visibleColumns) result[column.id] = buildColumnRenderState(column, context);
		return result;
	}, ...ngDevMode ? [{ debugName: "columnRenderStates" }] : /* istanbul ignore next */ []);
	renderCycleToken = signal(0, ...ngDevMode ? [{ debugName: "renderCycleToken" }] : /* istanbul ignore next */ []);
	renderCycleStartedAt = signal(0, ...ngDevMode ? [{ debugName: "renderCycleStartedAt" }] : /* istanbul ignore next */ []);
	resizeCommit = null;
	getResizeBounds(column) {
		return getColumnResizeBounds(column, this.userColumnSizing());
	}
	getResizeFitBounds(column) {
		const { min, max: ownMax } = this.getResizeBounds(column);
		const fit = this.getViewportFitMax(column, this.regionViewportWidth());
		if (fit === null) return {
			min,
			max: ownMax
		};
		return {
			min,
			max: Math.max(Math.round(ownMax !== null ? Math.min(ownMax, fit) : fit), min)
		};
	}
	getViewportFitMax(column, region) {
		if (region <= 0) return null;
		if (this.isFixedLayout()) return column.getIsPinned() !== false ? this.getPinnedFixedFitMax(column, region) : null;
		return this.getFillFitMax(column, region);
	}
	getPinnedFixedFitMax(column, region) {
		const widths = this.resolvedColumnWidths();
		let sumOtherPinned = 0;
		let widestNonPinned = 0;
		for (const other of this.visibleColumns()) {
			if (other.id === column.id) continue;
			if (other.getIsPinned() === false) widestNonPinned = Math.max(widestNonPinned, widths[other.id] ?? this.getColumnEffectiveWidth(other));
			else sumOtherPinned += widths[other.id] ?? this.getColumnEffectiveWidth(other);
		}
		const nonPinnedReserve = Math.min(widestNonPinned, region / 2);
		const current = widths[column.id] ?? this.getColumnEffectiveWidth(column);
		return Math.max(current, region - sumOtherPinned - nonPinnedReserve);
	}
	getFillFitMax(column, region) {
		const widths = this.resolvedColumnWidths();
		const columnSizing = this.mergedState().columnSizing;
		let sumOthers = 0;
		for (const other of this.visibleColumns()) {
			if (other.id === column.id) continue;
			sumOthers += this.isFillFlexLayout() && readColumnEntry(columnSizing, other.id) === void 0 ? this.getResizeBounds(other).min : widths[other.id] ?? 0;
		}
		const current = widths[column.id] ?? this.getColumnEffectiveWidth(column);
		return Math.max(current, region - sumOthers);
	}
	clampColumnWidth(column, width) {
		return clampWidth(width, this.getResizeBounds(column));
	}
	clampColumnSizing(sizing) {
		return clampColumnSizingWidths(sizing, (columnId) => this.table.getColumn(columnId), (column, width) => this.clampColumnWidth(column, width));
	}
	getColumnEffectiveWidth(column) {
		return this.clampColumnWidth(column, this.resolvedColumnWidths()[column.id] ?? column.getSize());
	}
	seedColumnSizingFromMeasuredWidth(column) {
		const alreadyResized = readColumnEntry(this.mergedState().columnSizing, column.id) !== void 0;
		const explicitlySized = readColumnEntry(this.userColumnSizing(), column.id)?.hasSize === true;
		if (alreadyResized || explicitlySized && !this.isFillFlexLayout()) return;
		const measuredWidth = this.getColumnEffectiveWidth(column);
		this.updateState({ columnSizing: (current) => ({
			...current,
			[column.id]: measuredWidth
		}) });
		this.resizeSeedSizing.set({ [column.id]: measuredWidth });
		this.table.getState();
	}
	resizeColumnFromKey(event, column) {
		if (!isColumnResizable(column, this.resizingEnabled())) return null;
		const { min, max } = this.getResizeFitBounds(column);
		const current = this.getColumnEffectiveWidth(column);
		const clamped = computeKeyboardResizeWidth({
			key: event.key,
			current,
			min,
			max,
			isRtl: this.resolvedDirection() === "rtl"
		});
		if (clamped === null) return null;
		event.preventDefault();
		event.stopPropagation();
		if (clamped === current) return {
			width: current,
			changed: false
		};
		this.updateState({ columnSizing: (currentSizing) => ({
			...currentSizing,
			[column.id]: clamped
		}) });
		return {
			width: clamped,
			changed: true
		};
	}
	applyColumnSizingChange(updater) {
		const resizingColumnId = this.table.getState().columnSizingInfo.isResizingColumn;
		if (typeof resizingColumnId !== "string") {
			this.updateState({ columnSizing: updater });
			return;
		}
		const next = { ...resolveUpdater(this.mergedState().columnSizing, updater) };
		const column = this.table.getColumn(resizingColumnId);
		const raw = readColumnEntry(next, resizingColumnId);
		if (column && raw !== void 0) {
			const { min, max } = this.getResizeFitBounds(column);
			const capped = Math.max(min, max !== null ? Math.min(max, raw) : raw);
			next[resizingColumnId] = capped;
			this.resizeCommit = {
				columnId: resizingColumnId,
				width: Math.round(capped)
			};
		} else this.resizeCommit = null;
		this.updateState({ columnSizing: next });
	}
	canMoveColumn(columnId, direction) {
		return this.canMoveColumnByDelta(columnId, direction === "left" ? -1 : 1);
	}
	moveColumn(columnId, direction) {
		return this.moveColumnByDelta(columnId, direction === "left" ? -1 : 1);
	}
	canMoveColumnByDelta(columnId, directionDelta) {
		const column = this.table.getColumn(columnId);
		if (!column || !isColumnReorderable(column, this.enableReordering())) return false;
		const zone = this.getColumnZoneById(columnId);
		if (!zone) return false;
		const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
		return getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta) !== null;
	}
	moveColumnByDelta(columnId, directionDelta) {
		const column = this.table.getColumn(columnId);
		if (!column || !isColumnReorderable(column, this.enableReordering())) return null;
		const zone = this.getColumnZoneById(columnId);
		if (!zone) return null;
		const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
		const currentIndex = visibleZoneColumnIds.indexOf(columnId);
		const nextIndex = getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta);
		if (nextIndex === null) return null;
		const nextVisibleZoneOrder = moveItemInArrayCopy(visibleZoneColumnIds, currentIndex, nextIndex);
		return this.applyVisibleZoneReorder(zone, columnId, nextVisibleZoneOrder);
	}
	applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder) {
		const movingColumn = this.table.getColumn(movingColumnId);
		if (!movingColumn || !isColumnReorderable(movingColumn, this.enableReordering())) return null;
		const currentState = this.mergedState();
		const currentVisibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
		if (!currentVisibleZoneColumnIds.length || hasSameStringOrder(currentVisibleZoneColumnIds, nextVisibleZoneOrder)) return null;
		const result = {
			movingColumnId,
			zone,
			nextVisibleZoneOrder
		};
		if (zone === "center") {
			const nextColumnOrder = replaceIdsInSlots(currentState.columnOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));
			if (hasSameStringOrder(currentState.columnOrder, nextColumnOrder)) return null;
			this.updateState({ columnOrder: nextColumnOrder });
			return result;
		}
		const currentPinnedZoneOrder = currentState.columnPinning[zone] ?? [];
		const nextPinnedZoneOrder = replaceIdsInSlots(currentPinnedZoneOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));
		if (hasSameStringOrder(currentPinnedZoneOrder, nextPinnedZoneOrder)) return null;
		this.updateState({ columnPinning: {
			...currentState.columnPinning,
			[zone]: nextPinnedZoneOrder
		} });
		return result;
	}
	isDropIndexWithinZone(rowColumnIds, zone, currentIndex) {
		const zoneIndices = rowColumnIds.reduce((indices, columnId, index) => {
			if (this.getColumnZoneById(columnId) === zone) indices.push(index);
			return indices;
		}, []);
		if (!zoneIndices.length) return false;
		return currentIndex >= zoneIndices[0] && currentIndex <= zoneIndices[zoneIndices.length - 1];
	}
	getColumnZoneById(columnId) {
		const column = this.table.getColumn(columnId);
		return column ? getColumnZone(column) : null;
	}
	getVisibleZoneColumnIds(zone) {
		return this.visibleColumns().filter((column) => getColumnZone(column) === zone).map((column) => column.id);
	}
	seedInitialState(initialState) {
		const seed = resolveSeedState(initialState, DEFAULT_TABLE_STATE);
		this.internalSorting.set(normalizeSortingState(seed.sorting, this.enableMultiSort()));
		this.internalGlobalFilter.set(seed.globalFilter);
		this.internalColumnFilters.set(seed.columnFilters);
		this.internalColumnVisibility.set(seed.columnVisibility);
		this.internalColumnOrder.set(seed.columnOrder);
		this.internalColumnPinning.set(seed.columnPinning);
		this.internalColumnSizing.set(seed.columnSizing);
		this.internalRowSelection.set(normalizeRowSelection(seed.rowSelection, this.selectionMode() === "multiple"));
		this.internalPagination.set(seed.pagination);
		this.hasSeededInitialState.set(true);
		this.natTableService.notifyStateChange({
			...this.mergedState(),
			globalFilter: this.userGlobalFilter()
		});
	}
	patchState(updaters) {
		this.updateState(updaters);
	}
	applySortingChange(updater) {
		const next = resolveUpdater(this.tanstackSortingState(), updater);
		this.updateState({ sorting: stripNatTableSubHeaderSorting(next, this.resolvedSubHeaderColumnId()) });
	}
	updateState(updaters) {
		const currentState = this.mergedState();
		const nextState = {
			sorting: normalizeSortingState(resolveUpdater(currentState.sorting, updaters.sorting), this.enableMultiSort()),
			globalFilter: resolveUpdater(this.userGlobalFilter(), updaters.globalFilter),
			columnFilters: resolveUpdater(currentState.columnFilters, updaters.columnFilters),
			columnVisibility: resolveUpdater(currentState.columnVisibility, updaters.columnVisibility),
			columnOrder: retainColumnOrder(resolveUpdater(currentState.columnOrder, updaters.columnOrder), this.allLeafColumnIds()),
			columnPinning: retainColumnPinning(resolveUpdater(currentState.columnPinning, updaters.columnPinning)),
			columnSizing: this.clampColumnSizing(resolveUpdater(currentState.columnSizing, updaters.columnSizing)),
			rowSelection: normalizeRowSelection(resolveUpdater(currentState.rowSelection, updaters.rowSelection), this.selectionMode() === "multiple"),
			pagination: resolveUpdater(currentState.pagination, updaters.pagination)
		};
		this.commitInternalState(nextState);
		this.natTableService.notifyStateChange(nextState);
	}
	commitInternalState(nextState) {
		const controlled = this.state();
		if (controlled.sorting === void 0) this.internalSorting.set(nextState.sorting);
		if (controlled.globalFilter === void 0) this.internalGlobalFilter.set(nextState.globalFilter);
		if (controlled.columnFilters === void 0) this.internalColumnFilters.set(nextState.columnFilters);
		if (controlled.columnVisibility === void 0) this.internalColumnVisibility.set(nextState.columnVisibility);
		if (controlled.columnOrder === void 0) this.internalColumnOrder.set(nextState.columnOrder);
		if (controlled.columnPinning === void 0) this.internalColumnPinning.set(nextState.columnPinning);
		if (controlled.columnSizing === void 0) this.internalColumnSizing.set(nextState.columnSizing);
		if (controlled.rowSelection === void 0) this.internalRowSelection.set(nextState.rowSelection);
		if (controlled.pagination === void 0) this.internalPagination.set(nextState.pagination);
	}
	getStateTemplateBaseContext() {
		return {
			table: this.table,
			visibleRowsValue: this.renderedVisibleRowCount(),
			totalRowsValue: this.stateTotalRowCount(),
			visibleColumnsValue: this.visibleColumnCount(),
			filtered: this.isFiltered()
		};
	}
	getSubHeaderTemplateContext(group) {
		return {
			$implicit: group.value,
			value: group.value,
			rowCountValue: group.rowCountValue,
			row: group.row,
			table: this.table
		};
	}
	getRowPlaceholderTemplateContext(logicalIndex, column) {
		return {
			$implicit: logicalIndex,
			logicalIndex,
			column,
			table: this.table
		};
	}
	getRowPlaceholderAnnouncement(logicalIndex) {
		const formatter = this.resolvedAccessibilityText().placeholderRow;
		if (!formatter) return "";
		const totalRowsValue = this.logicalRowCount();
		return formatter({
			positionValue: logicalIndex + 1,
			positionText: this.formatAccessibilityNumber(logicalIndex + 1),
			totalRowsValue,
			totalRowsText: this.formatAccessibilityNumber(totalRowsValue)
		});
	}
	getSubHeaderAnnouncement(group, renderer) {
		const accessibilityText = this.resolvedAccessibilityText();
		const formatter = renderer === "list" ? accessibilityText.listSubHeaderRow ?? accessibilityText.subHeaderRow : accessibilityText.subHeaderRow;
		if (!formatter) return "";
		return formatter({
			value: group.value,
			valueText: resolveSubHeaderValueText(group.value),
			rowCountValue: group.rowCountValue,
			rowCountText: this.formatAccessibilityNumber(group.rowCountValue)
		});
	}
	isFiltered() {
		const state = this.mergedState();
		return !!state.globalFilter.trim() || state.columnFilters.length > 0;
	}
	formatAccessibilityNumber(value) {
		return formatNatTableNumber(this.tableIntl(), value, void 0, this.localeId());
	}
	resolveRowId(row, index, parent) {
		const getRowIdFn = this.getRowId();
		return getRowIdFn ? getRowIdFn(row, index, parent) : resolveDefaultRowId(row, index, parent);
	}
	registerSeedEffect() {
		effect(() => {
			if (this.hasSeededInitialState()) return;
			this.seedInitialState(this.initialState());
		});
	}
	registerSubHeaderValidationEffect() {
		effect(() => {
			if (!isDevMode() || !this.enableSubHeaders()) return;
			const columnId = this.subHeaderColumn();
			const hasColumnKey = columnId !== void 0 && columnId !== "";
			const leafColumnIds = this.allLeafColumnIds();
			if (hasColumnKey && leafColumnIds.length > 0 && !leafColumnIds.includes(columnId)) console.warn(`[ng-advanced-table] subHeaderColumn "${columnId}" does not match any leaf column id; sub-headers are disabled.`);
			if (!hasColumnKey && this.subHeaderOrder() !== void 0) console.warn("[ng-advanced-table] subHeaderOrder is set but subHeaderColumn is not; the order has no effect.");
		});
	}
	registerLocaleValidationEffect() {
		effect(() => {
			if (!isDevMode()) return;
			const localeId = this.localeId();
			if (localeId === NAT_EN_LOCALE_ID || matchNatTableLocaleId(this.tableIntlConfig.locales, localeId) !== null) return;
			if (!this.localeWarnings.claim(localeId)) return;
			console.warn(`[ng-advanced-table] locale "${localeId}" has no dictionary registered with provideNatTableLocales(), so table copy falls back to English. Register one — the built-in dictionaries are exported from ng-advanced-table/locale — or register {} to keep English copy with this locale's number formatting. Companion controls and render-metrics copy is registered separately and falls back to English without warning.`);
		});
	}
	registerRenderCycleEffect() {
		let previousRows = null;
		effect(() => {
			if (!this.emitRowRenderEvents()) {
				previousRows = null;
				this.renderCycleToken.set(0);
				this.renderCycleStartedAt.set(0);
				return;
			}
			const rows = this.bodyRows();
			this.bodyRenderPlan();
			this.renderCycleStartedAt.set(performance.now());
			if (rows !== previousRows) {
				previousRows = rows;
				this.renderCycleToken.update((token) => token + 1);
			}
		});
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableState,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableState
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableState,
	decorators: [{ type: Injectable }]
});
const getPaginationAnnouncementContext = (snapshot, formatNumber) => {
	const page = snapshot.pagination.pageIndex + 1;
	const pageCount = snapshot.pageCount;
	const pageSize = snapshot.pagination.pageSize;
	return {
		pageIndex: snapshot.pagination.pageIndex,
		pageValue: page,
		pageText: formatNumber(page),
		pageCountValue: pageCount,
		pageCountText: formatNumber(pageCount),
		pageSizeValue: pageSize,
		pageSizeText: formatNumber(pageSize),
		visibleRowsValue: snapshot.visibleRows,
		visibleRowsText: formatNumber(snapshot.visibleRows)
	};
};
const describePageSizeChange = (snapshot, text, formatNumber, renderer = "table") => {
	const formatter = (renderer === "list" ? text.listPageSizeChange : void 0) ?? text.pageSizeChange;
	const context = getPaginationAnnouncementContext(snapshot, formatNumber);
	if (formatter) return formatter(context);
	return "";
};
const describePageChange = (snapshot, text, formatNumber, renderer = "table") => {
	const formatter = (renderer === "list" ? text.listPageChange : void 0) ?? text.pageChange;
	const context = getPaginationAnnouncementContext(snapshot, formatNumber);
	if (formatter) return formatter(context);
	return "";
};
const describeDataStatusChange = (snapshot, text) => {
	if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.loading) return text.loadingState ?? "";
	if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.error) return text.errorState ?? "";
	if (snapshot.visibleRows === 0) return text.emptyState ?? "";
	return "";
};
const describeSortingChange = (snapshot, text) => {
	const sortingState = snapshot.sorting;
	const formatter = text.sortingChange;
	const entry = sortingState.at(0);
	const columnLabel = entry ? snapshot.columns.find((column) => column.id === entry.id)?.label ?? entry.id : null;
	const sortState = entry ? sortDirection(entry.desc) : "none";
	const sortedColumns = sortingState.map((sortEntry) => ({
		id: sortEntry.id,
		label: snapshot.columns.find((column) => column.id === sortEntry.id)?.label ?? sortEntry.id,
		sortState: sortDirection(sortEntry.desc)
	}));
	const context = {
		columnId: entry?.id ?? null,
		columnLabel,
		sortState,
		sortedColumns
	};
	return formatter?.(context) ?? "";
};
const describeFilteringChange = (snapshot, text, formatNumber) => {
	const formatter = text.filteringChange;
	const query = snapshot.globalFilter;
	const hasColumnFilters = !!snapshot.columnFiltersKey;
	const context = {
		query: snapshot.globalFilter,
		filterState: resolveFilterState(!!query, hasColumnFilters),
		visibleRowsValue: snapshot.visibleRows,
		visibleRowsText: formatNumber(snapshot.visibleRows),
		totalRowsValue: snapshot.totalRows,
		totalRowsText: formatNumber(snapshot.totalRows)
	};
	if (formatter) return formatter(context);
	return "";
};
const describeColumnVisibilityChange = (previous, next, text, formatNumber, renderer = "table") => {
	const changedColumns = next.reduce((result, column) => {
		if (previous.find((candidate) => candidate.id === column.id)?.visible !== column.visible) result.push({
			id: column.id,
			label: column.label,
			visibilityState: column.visible ? "visible" : "hidden"
		});
		return result;
	}, []);
	for (const column of previous) if (!next.some((candidate) => candidate.id === column.id)) changedColumns.push({
		id: column.id,
		label: column.label,
		visibilityState: "hidden"
	});
	const visibleCount = next.filter((column) => column.visible).length;
	const formatter = (renderer === "list" ? text.listColumnVisibilityChange : void 0) ?? text.columnVisibilityChange;
	const context = {
		changedColumns,
		visibleColumnsValue: visibleCount,
		visibleColumnsText: formatNumber(visibleCount),
		totalColumnsValue: next.length,
		totalColumnsText: formatNumber(next.length)
	};
	if (formatter) return formatter(context);
	return "";
};
const describeSelectionChange = (snapshot, text, formatNumber) => {
	const formatter = text.selectionChange;
	const count = snapshot.selectedRowCount;
	const total = snapshot.totalRows;
	const context = {
		selectedCountValue: count,
		selectedCountText: formatNumber(count),
		totalRowsValue: total,
		totalRowsText: formatNumber(total)
	};
	return formatter?.(context) ?? "";
};
const describeAccessibilityChange = (previous, next, resolveText, formatNumber, renderer = "table") => {
	if (previous.dataStatus !== next.dataStatus) return describeDataStatusChange(next, resolveText());
	if (previous.sortingKey !== next.sortingKey) return describeSortingChange(next, resolveText());
	if (previous.globalFilter !== next.globalFilter || previous.columnFiltersKey !== next.columnFiltersKey) return describeFilteringChange(next, resolveText(), formatNumber);
	if (!hasSameColumnVisibility(previous.columns, next.columns)) return describeColumnVisibilityChange(previous.columns, next.columns, resolveText(), formatNumber, renderer);
	if (previous.rowSelectionKey !== next.rowSelectionKey) return describeSelectionChange(next, resolveText(), formatNumber);
	if (previous.pagination.pageSize !== next.pagination.pageSize) return describePageSizeChange(next, resolveText(), formatNumber, renderer);
	if (previous.pagination.pageIndex !== next.pagination.pageIndex) return describePageChange(next, resolveText(), formatNumber, renderer);
	return null;
};
const getSummaryContext = (snapshot, formatNumber) => {
	const page = snapshot.pageIndex + 1;
	return {
		visibleRowsValue: snapshot.visibleRows,
		visibleRowsText: formatNumber(snapshot.visibleRows),
		totalRowsValue: snapshot.totalRows,
		totalRowsText: formatNumber(snapshot.totalRows),
		visibleColumnsValue: snapshot.visibleColumns,
		visibleColumnsText: formatNumber(snapshot.visibleColumns),
		pageIndex: snapshot.pageIndex,
		pageValue: page,
		pageText: formatNumber(page),
		pageCountValue: snapshot.pageCount,
		pageCountText: formatNumber(snapshot.pageCount),
		filterState: snapshot.isFiltered ? "filtered" : "unfiltered",
		paginationState: snapshot.paginationEnabled ? "enabled" : "disabled"
	};
};
const buildColumnReorderContext = (input, formatNumber) => ({
	columnId: input.columnId,
	label: input.label,
	zone: input.zone,
	positionValue: input.positionValue,
	positionText: formatNumber(input.positionValue),
	totalValue: input.totalValue,
	totalText: formatNumber(input.totalValue)
});
const buildColumnResizeContext = (input, formatNumber) => ({
	columnId: input.columnId,
	label: input.label,
	widthValue: input.widthValue,
	widthText: formatNumber(input.widthValue),
	atMinimum: input.widthValue <= input.min,
	atMaximum: input.max !== null && input.widthValue >= input.max
});
const NAT_TABLE_REPEAT_ANNOUNCEMENT_DELAY_MS = 100;
var NatTableA11yService = class NatTableA11yService {
	natTableService = inject(NatTableService);
	state = inject(NatTableState);
	injector = inject(Injector);
	destroyRef = inject(DestroyRef);
	renderer = "table";
	lastAccessibilitySnapshot = null;
	previousResizingColumnId = null;
	announcementSequence = 0;
	repeatAnnouncementTimer = null;
	lastAnnouncedMessage = "";
	liveMessage = signal("", ...ngDevMode ? [{ debugName: "liveMessage" }] : /* istanbul ignore next */ []);
	enableAnnouncements = this.natTableService.enableAnnouncements;
	tableSummary = computed(() => this.buildTableSummary(), ...ngDevMode ? [{ debugName: "tableSummary" }] : /* istanbul ignore next */ []);
	listSummary = computed(() => this.buildTableSummary("listSummary"), ...ngDevMode ? [{ debugName: "listSummary" }] : /* istanbul ignore next */ []);
	constructor() {
		this.registerAnnouncementEffect();
		this.registerAccessibleNameValidationEffect();
		this.destroyRef.onDestroy(() => this.cancelRepeatAnnouncement());
	}
	setRenderer(renderer) {
		this.renderer = renderer;
	}
	registerGridEffects() {
		this.registerResizeAnnouncementEffect();
		this.registerAriaMultiSelectableEffect();
		this.registerKeybindingValidationEffect();
	}
	registerListEffects() {
		this.registerAriaMultiSelectableEffect();
		this.registerKeybindingValidationEffect();
	}
	announce(message) {
		const sequence = ++this.announcementSequence;
		const isRepeat = message !== "" && message === this.lastAnnouncedMessage;
		const clearedRegionRendered = this.repeatAnnouncementTimer !== null;
		this.lastAnnouncedMessage = message;
		this.cancelRepeatAnnouncement();
		this.liveMessage.set("");
		if (!isRepeat) {
			queueMicrotask(() => {
				if (sequence === this.announcementSequence) this.liveMessage.set(message);
			});
			return;
		}
		if (clearedRegionRendered) {
			this.scheduleRepeatAnnouncement(message);
			return;
		}
		afterNextRender({ write: () => {
			if (sequence === this.announcementSequence) this.scheduleRepeatAnnouncement(message);
		} }, { injector: this.injector });
	}
	scheduleRepeatAnnouncement(message) {
		this.repeatAnnouncementTimer = setTimeout(() => {
			this.repeatAnnouncementTimer = null;
			this.liveMessage.set(message);
		}, NAT_TABLE_REPEAT_ANNOUNCEMENT_DELAY_MS);
	}
	cancelRepeatAnnouncement() {
		if (this.repeatAnnouncementTimer !== null) {
			clearTimeout(this.repeatAnnouncementTimer);
			this.repeatAnnouncementTimer = null;
		}
	}
	formatAccessibilityNumber(value) {
		return this.state.formatAccessibilityNumber(value);
	}
	announceColumnReorder(movingColumnId, zone, nextVisibleZoneOrder) {
		const movingColumn = this.state.table.getColumn(movingColumnId);
		if (!movingColumn) return;
		const label = resolveColumnLabel(movingColumn);
		const nextIndex = nextVisibleZoneOrder.indexOf(movingColumnId);
		if (nextIndex === -1) return;
		const formatter = this.state.resolvedAccessibilityText().columnReorder;
		const context = buildColumnReorderContext({
			columnId: movingColumnId,
			label,
			zone,
			positionValue: nextIndex + 1,
			totalValue: nextVisibleZoneOrder.length
		}, (value) => this.formatAccessibilityNumber(value));
		this.announce(formatter?.(context) ?? "");
	}
	announceColumnResize(column, width) {
		const label = resolveColumnLabel(column);
		const formatter = this.state.resolvedAccessibilityText().columnResize;
		const { min } = this.state.getResizeBounds(column);
		const { max } = this.state.getResizeFitBounds(column);
		const context = buildColumnResizeContext({
			columnId: column.id,
			label,
			widthValue: width,
			min,
			max
		}, (value) => this.formatAccessibilityNumber(value));
		this.announce(formatter?.(context) ?? "");
	}
	registerAnnouncementEffect() {
		effect(() => {
			if (!this.state.hasSeededInitialState()) return;
			const snapshot = this.captureAccessibilitySnapshot();
			const previousSnapshot = this.lastAccessibilitySnapshot;
			this.lastAccessibilitySnapshot = snapshot;
			if (!previousSnapshot || !this.enableAnnouncements()) return;
			const message = describeAccessibilityChange(previousSnapshot, snapshot, () => this.state.resolvedAccessibilityText(), (value) => this.formatAccessibilityNumber(value), this.renderer);
			if (message) this.announce(message);
		});
	}
	registerResizeAnnouncementEffect() {
		effect(() => {
			const resizingColumnId = this.state.table.getState().columnSizingInfo.isResizingColumn || null;
			untracked(() => this.handleResizeEnd(resizingColumnId));
		});
	}
	handleResizeEnd(resizingColumnId) {
		const previous = this.previousResizingColumnId;
		this.previousResizingColumnId = resizingColumnId;
		if (!previous || resizingColumnId || !this.enableAnnouncements()) return;
		const commit = this.state.resizeCommit;
		this.state.resizeCommit = null;
		if (commit?.columnId !== previous) return;
		const column = this.state.table.getColumn(previous);
		if (column) this.announceColumnResize(column, commit.width);
	}
	registerAriaMultiSelectableEffect() {
		afterRenderEffect(() => {
			const multiSelectable = this.state.enableRowSelection() && this.state.selectionMode() === "multiple";
			const grid = this.state.tableRegionRef()?.nativeElement.querySelector(":scope > table, :scope > ul[role=\"grid\"]");
			if (!grid) return;
			if (multiSelectable) grid.setAttribute("aria-multiselectable", "true");
			else grid.removeAttribute("aria-multiselectable");
		});
	}
	buildTableSummary(formatterKey = "tableSummary") {
		const summaryContext = getSummaryContext({
			visibleRows: this.state.renderedVisibleRowCount(),
			totalRows: this.state.stateTotalRowCount(),
			visibleColumns: this.state.visibleColumnCount(),
			pageIndex: this.state.renderedPageIndex(),
			pageCount: this.state.renderedPageCount(),
			isFiltered: this.state.isFiltered(),
			paginationEnabled: this.state.enablePagination()
		}, (value) => this.formatAccessibilityNumber(value));
		const accessibilityText = this.state.resolvedAccessibilityText();
		return (accessibilityText[formatterKey] ?? accessibilityText.tableSummary)?.(summaryContext) ?? "";
	}
	captureAccessibilitySnapshot() {
		const state = this.state.mergedState();
		return {
			dataStatus: this.state.resolvedDataStatus(),
			sorting: state.sorting,
			sortingKey: serializeSorting(state.sorting),
			globalFilter: state.globalFilter.trim(),
			columnFiltersKey: serializeColumnFilters(state.columnFilters),
			rowSelectionKey: serializeRowSelection(state.rowSelection),
			selectedRowCount: Object.values(state.rowSelection).filter(Boolean).length,
			pagination: {
				...state.pagination,
				pageIndex: this.state.renderedPageIndex()
			},
			pageCount: this.state.renderedPageCount(),
			visibleRows: this.state.renderedVisibleRowCount(),
			totalRows: this.state.stateTotalRowCount(),
			columns: this.state.allLeafColumns().map((column) => ({
				id: column.id,
				label: resolveColumnLabel(column),
				visible: column.getIsVisible()
			}))
		};
	}
	registerAccessibleNameValidationEffect() {
		afterRenderEffect(() => {
			if (!isDevMode() || this.state.resolvedCaption() || this.state.accessibleName()?.trim()) return;
			const requirement = this.renderer === "table" ? "either `caption` or `accessibleName`" : "`accessibleName`";
			console.warn(`[ng-advanced-table] <nat-${this.renderer}> requires ${requirement} for an accessible name.`);
		});
	}
	registerKeybindingValidationEffect() {
		effect(() => {
			const bindings = this.natTableService.keybindings();
			if (isDevMode()) {
				const warnings = validateKeybindings(bindings);
				for (const warning of warnings) console.warn(`[ng-advanced-table] ${warning}`);
			}
		});
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableA11yService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableA11yService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableA11yService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
var NatTableHeaderMeasurementService = class NatTableHeaderMeasurementService {
	state = inject(NatTableState);
	destroyRef = inject(DestroyRef);
	headerResizeObserver = null;
	constructor() {
		this.destroyRef.onDestroy(() => this.headerResizeObserver?.disconnect());
		afterNextRender(() => this.initializeHeaderObservation());
		afterRenderEffect(() => {
			this.state.visibleColumnIds();
			this.reattachHeaderObservers();
		});
	}
	initializeHeaderObservation() {
		if (typeof ResizeObserver === "undefined" || this.headerResizeObserver) return;
		this.headerResizeObserver = new ResizeObserver(() => {
			this.measureHeaderWidths();
			this.measureRegionViewportWidth();
		});
		this.reattachHeaderObservers();
	}
	reattachHeaderObservers() {
		const observer = this.headerResizeObserver;
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!observer || !region) return;
		observer.disconnect();
		observer.observe(region);
		const headerCells = region.querySelectorAll("thead th[data-column-id]");
		for (const cell of headerCells) observer.observe(cell);
		this.measureHeaderWidths();
		this.measureRegionViewportWidth();
	}
	measureHeaderWidths() {
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!region) return;
		const headerCells = region.querySelectorAll("thead th[data-column-id]");
		const next = {};
		for (const cell of headerCells) {
			const columnId = cell.dataset["columnId"];
			if (!columnId) continue;
			next[columnId] = cell.getBoundingClientRect().width;
		}
		if (hasSameWidths(this.state.measuredHeaderWidths(), next)) return;
		this.state.measuredHeaderWidths.set(next);
	}
	measureRegionViewportWidth() {
		const region = this.state.tableRegionRef()?.nativeElement;
		if (!region) return;
		const width = region.clientWidth;
		if (width > 0 && width !== this.state.regionViewportWidth()) this.state.regionViewportWidth.set(width);
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableHeaderMeasurementService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableHeaderMeasurementService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableHeaderMeasurementService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
const elementDepth = (element) => {
	let value = 0;
	for (let parent = element.parentElement; parent; parent = parent.parentElement) value += 1;
	return value;
};
const getNatTableCellsWithin = (root) => {
	const cells = Array.from(root.querySelectorAll(NAT_TABLE_CELL_SELECTOR));
	if (root.matches("[natTableCell]")) cells.unshift(root);
	return cells;
};
const getOutermostElementRoots = (roots) => {
	const candidates = Array.from(roots).sort((left, right) => elementDepth(left) - elementDepth(right));
	const selectedRoots = /* @__PURE__ */ new WeakSet();
	return candidates.filter((root) => {
		for (let parent = root.parentElement; parent; parent = parent.parentElement) if (selectedRoots.has(parent)) return false;
		selectedRoots.add(root);
		return true;
	});
};
const natTableCellControlPreparation = { prepare(control) {
	if (control.hasAttribute("ngGridCellWidget") || control.hasAttribute("disabled")) return;
	if (control.closest("[role=\"menu\"], [role=\"menubar\"]")) return;
	if (!control.hasAttribute("data-nat-table-managed-cell-widget") && control.tabIndex < 0) return;
	if (!control.hasAttribute("data-nat-table-managed-cell-widget")) control.setAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, "");
	if (control.tabIndex !== -1) control.tabIndex = -1;
} };
const prepareNatTableCellControl = (control) => natTableCellControlPreparation.prepare(control);
const forgetDetachedNatTableCells = (removedNodes, knownCells, host) => {
	for (const removedNode of removedNodes) {
		if (!(removedNode instanceof HTMLElement)) continue;
		if (removedNode.closest("nat-table, nat-list") === host) continue;
		for (const cell of getNatTableCellsWithin(removedNode)) if (cell.closest("nat-table, nat-list") !== host) knownCells.delete(cell);
	}
};
var NatTableCellControlManager = class NatTableCellControlManager {
	host = inject(ElementRef).nativeElement;
	destroyRef = inject(DestroyRef);
	knownCells = /* @__PURE__ */ new WeakSet();
	started = false;
	observer = null;
	startCellControlPreparation() {
		if (this.started) return;
		this.started = true;
		const mutationObserverCtor = globalThis.MutationObserver;
		if (typeof mutationObserverCtor === "undefined") {
			afterEveryRender({
				earlyRead: () => this.readSnapshot(),
				write: (snapshot) => this.prepareSnapshot(snapshot)
			});
			return;
		}
		afterNextRender({
			earlyRead: () => {
				const snapshot = this.readSnapshot();
				this.observe(mutationObserverCtor);
				return snapshot;
			},
			write: (snapshot) => {
				this.prepareSnapshot(snapshot);
				const pendingMutations = this.observer?.takeRecords() ?? [];
				if (pendingMutations.length > 0) this.prepareMutations(pendingMutations);
			}
		});
		this.destroyRef.onDestroy(() => this.observer?.disconnect());
	}
	readSnapshot() {
		return {
			cells: Array.from(this.host.querySelectorAll(NAT_TABLE_CELL_SELECTOR)).filter((cell) => this.isOwnedCell(cell)),
			controls: Array.from(this.host.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)).filter((control) => this.isOwnedControl(control))
		};
	}
	prepareSnapshot(snapshot) {
		for (const cell of snapshot.cells) this.knownCells.add(cell);
		for (const control of snapshot.controls) prepareNatTableCellControl(control);
	}
	observe(mutationObserverCtor) {
		this.observer = new mutationObserverCtor((mutations) => this.prepareMutations(mutations));
		this.observer.observe(this.host, {
			attributes: true,
			attributeFilter: [...NAT_TABLE_CELL_CONTROL_ATTRIBUTE_FILTER],
			childList: true,
			subtree: true
		});
	}
	prepareMutations(mutations) {
		const newCells = /* @__PURE__ */ new Set();
		const newCellRoots = /* @__PURE__ */ new Set();
		const addedSubtrees = /* @__PURE__ */ new Set();
		for (const mutation of mutations) this.collectMutationWork(mutation, newCells, newCellRoots, addedSubtrees);
		for (const root of getOutermostElementRoots(newCellRoots)) this.prepareSubtree(root);
		for (const cell of newCells) this.knownCells.add(cell);
		for (const subtree of getOutermostElementRoots(addedSubtrees)) {
			const owner = subtree.closest(NAT_TABLE_CELL_SELECTOR);
			if (owner && !newCells.has(owner) && this.knownCells.has(owner)) this.prepareSubtree(subtree, owner);
		}
	}
	collectMutationWork(mutation, newCells, newCellRoots, addedSubtrees) {
		if (mutation.type === "attributes") {
			const target = mutation.target;
			if (target instanceof HTMLElement && target.matches("a[href], button, input, select, textarea, summary, [contenteditable=\"true\"], [role=\"button\"], [role=\"link\"], [role=\"checkbox\"], [role=\"menuitem\"], [role=\"menuitemcheckbox\"], [role=\"menuitemradio\"], [role=\"tab\"], [role=\"switch\"], [role=\"combobox\"], [role=\"textbox\"], [role=\"searchbox\"]") && this.isOwnedControl(target)) prepareNatTableCellControl(target);
			return;
		}
		forgetDetachedNatTableCells(mutation.removedNodes, this.knownCells, this.host);
		for (const addedNode of mutation.addedNodes) if (addedNode instanceof HTMLElement) this.collectAddedSubtree(addedNode, newCells, newCellRoots, addedSubtrees);
	}
	collectAddedSubtree(addedNode, newCells, newCellRoots, addedSubtrees) {
		const containedCells = getNatTableCellsWithin(addedNode).filter((cell) => this.isOwnedCell(cell));
		let containsNewCell = false;
		for (const cell of containedCells) if (!this.knownCells.has(cell)) {
			newCells.add(cell);
			containsNewCell = true;
		}
		if (containsNewCell) {
			newCellRoots.add(addedNode);
			return;
		}
		if (addedNode.matches("[natTableCell]")) return;
		const owner = addedNode.closest(NAT_TABLE_CELL_SELECTOR);
		if (owner && this.isOwnedCell(owner)) addedSubtrees.add(addedNode);
	}
	prepareSubtree(root, ownerCell) {
		if (root.matches("a[href], button, input, select, textarea, summary, [contenteditable=\"true\"], [role=\"button\"], [role=\"link\"], [role=\"checkbox\"], [role=\"menuitem\"], [role=\"menuitemcheckbox\"], [role=\"menuitemradio\"], [role=\"tab\"], [role=\"switch\"], [role=\"combobox\"], [role=\"textbox\"], [role=\"searchbox\"]") && this.isOwnedControl(root, ownerCell)) prepareNatTableCellControl(root);
		for (const control of root.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)) if (this.isOwnedControl(control, ownerCell)) prepareNatTableCellControl(control);
	}
	isOwnedCell(cell) {
		return cell.closest(NAT_TABLE_HOST_SELECTOR) === this.host;
	}
	isOwnedControl(control, ownerCell) {
		const cell = control.closest(NAT_TABLE_CELL_SELECTOR);
		return cell !== null && (ownerCell ? cell === ownerCell : this.isOwnedCell(cell));
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableCellControlManager,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableCellControlManager
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableCellControlManager,
	decorators: [{ type: Injectable }]
});
var NatTableCell = class NatTableCell {
	natTableService = inject(NatTableService);
	onKeydown(event) {
		handleCellInteractionKeydown(event, this.natTableService.keyboard().cellInteraction);
	}
	onFocusIn = handleCellInteractionFocusIn;
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableCell,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "14.0.0",
		version: "22.2.1",
		type: NatTableCell,
		isStandalone: true,
		selector: "[natTableCell]",
		host: { listeners: {
			"keydown": "onKeydown($event)",
			"focusin": "onFocusIn($event)"
		} },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableCell,
	decorators: [{
		type: Directive,
		args: [{
			selector: "[natTableCell]",
			host: {
				"(keydown)": "onKeydown($event)",
				"(focusin)": "onFocusIn($event)"
			}
		}]
	}]
});
var NatTableReorderService = class NatTableReorderService {
	injector = inject(Injector);
	appRef = inject(ApplicationRef);
	state = inject(NatTableState);
	a11yService = inject(NatTableA11yService);
	isLeafHeaderRow(headerGroup) {
		return headerGroup.id === this.state.leafHeaderRowId();
	}
	isReorderingEnabled() {
		return this.state.enableReordering();
	}
	hasReorderableColumns() {
		return this.state.hasReorderableColumns();
	}
	canReorderHeader(column) {
		return isColumnReorderable(column, this.isReorderingEnabled()) && this.state.getVisibleZoneColumnIds(getColumnZone(column)).length > 1;
	}
	onHeaderDrop(event, headerGroup) {
		try {
			if (!this.isLeafHeaderRow(headerGroup)) return;
			const rowColumnIds = getHeaderRowColumnIds(headerGroup);
			const movingColumnId = resolveDraggedColumnId(event, rowColumnIds);
			if (!movingColumnId) return;
			const movingColumn = this.state.table.getColumn(movingColumnId);
			if (!movingColumn || !isColumnReorderable(movingColumn, this.isReorderingEnabled())) return;
			const zone = this.state.getColumnZoneById(movingColumnId);
			if (!zone) return;
			const nextVisibleZoneOrder = this.resolveDropZoneOrder(event, rowColumnIds, zone, movingColumnId);
			if (!nextVisibleZoneOrder) return;
			const result = this.state.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);
			if (!result) return;
			this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
			this.scrollHeaderIntoView(movingColumnId);
			renderWithoutTransitions(this.getHeaderElements(), () => this.appRef.tick());
		} finally {
			this.restoreDraggedHeaderPinnedOffset(event);
		}
	}
	restoreDraggedHeaderPinnedOffset(event) {
		const draggedColumnId = typeof event.item.data === "string" ? event.item.data : null;
		if (!draggedColumnId) return;
		const headerElement = this.getHeaderElement(draggedColumnId);
		const left = readColumnEntry(this.state.columnRenderStates(), draggedColumnId)?.left ?? null;
		if (headerElement && left !== null) headerElement.style.left = `${left}px`;
	}
	resolveDropZoneOrder(event, rowColumnIds, zone, movingColumnId) {
		const neighborIds = rowColumnIds.filter((id) => id !== movingColumnId && this.state.getColumnZoneById(id) === zone);
		const dropX = event.dropPoint?.x;
		if (typeof dropX === "number" && Number.isFinite(dropX)) {
			const centers = neighborIds.map((id) => this.getHeaderCenterX(id));
			if (!centers.every((center) => center === null)) {
				const isRtl = this.state.resolvedDirection() === "rtl";
				const beyondDrop = centers.findIndex((center) => center !== null && (isRtl ? dropX > center : dropX < center));
				const nextOrder = [...neighborIds];
				nextOrder.splice(beyondDrop === -1 ? neighborIds.length : beyondDrop, 0, movingColumnId);
				return nextOrder;
			}
		}
		if (!this.state.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) return null;
		return moveItemInArrayCopy(rowColumnIds, event.previousIndex, event.currentIndex).filter((id) => this.state.getColumnZoneById(id) === zone);
	}
	getHeaderCenterX(columnId) {
		const rect = this.getHeaderElement(columnId)?.getBoundingClientRect();
		return rect && rect.width > 0 ? rect.left + rect.width / 2 : null;
	}
	handleKeyboardReorder(event, column, directionDelta) {
		if (!isColumnReorderable(column, this.isReorderingEnabled())) return false;
		const zone = getColumnZone(column);
		const visibleZoneColumnIds = this.state.getVisibleZoneColumnIds(zone);
		if (visibleZoneColumnIds.indexOf(column.id) === -1 || visibleZoneColumnIds.length < 2) return false;
		event.preventDefault();
		event.stopPropagation();
		const result = this.state.moveColumnByDelta(column.id, directionDelta);
		if (result) this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
		this.scrollHeaderIntoView(column.id);
		return true;
	}
	scrollHeaderIntoView(columnId) {
		afterNextRender({ write: () => {
			const scrollContainer = this.state.tableRegionRef()?.nativeElement ?? null;
			const headerElement = this.getHeaderElement(columnId);
			if (!scrollContainer || !headerElement) return;
			scrollElementHorizontallyIntoView(scrollContainer, headerElement);
		} }, { injector: this.injector });
	}
	getHeaderElements() {
		return Array.from(this.state.tableRegionRef()?.nativeElement.querySelectorAll("thead th[data-column-id]") ?? []);
	}
	getHeaderElement(columnId) {
		for (const header of this.getHeaderElements()) if (header.getAttribute("data-column-id") === columnId) return header;
		return null;
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableReorderService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableReorderService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableReorderService,
	decorators: [{ type: Injectable }]
});
var NatTableResizeService = class NatTableResizeService {
	state = inject(NatTableState);
	a11yService = inject(NatTableA11yService);
	resizeGuideOrigin = signal(null, ...ngDevMode ? [{ debugName: "resizeGuideOrigin" }] : /* istanbul ignore next */ []);
	resizeGuidePinned = signal(false, ...ngDevMode ? [{ debugName: "resizeGuidePinned" }] : /* istanbul ignore next */ []);
	resizeStartScrollLeft = signal(0, ...ngDevMode ? [{ debugName: "resizeStartScrollLeft" }] : /* istanbul ignore next */ []);
	regionScrollLeft = signal(0, ...ngDevMode ? [{ debugName: "regionScrollLeft" }] : /* istanbul ignore next */ []);
	constructor() {
		effect((onCleanup) => {
			const region = this.state.tableRegionRef()?.nativeElement;
			if (!region) return;
			const onScroll = () => {
				if (this.isColumnResizing()) this.regionScrollLeft.set(region.scrollLeft);
			};
			region.addEventListener("scroll", onScroll, { passive: true });
			onCleanup(() => region.removeEventListener("scroll", onScroll));
		});
	}
	columnResizeGuide = computed(() => {
		const info = this.state.table.getState().columnSizingInfo;
		const origin = this.resizeGuideOrigin();
		const resizingId = info.isResizingColumn;
		if (resizingId === false || origin === null) return null;
		const left = this.resizeGuidePinned() ? origin + (this.regionScrollLeft() - this.resizeStartScrollLeft()) : origin;
		const widthDelta = info.deltaOffset ?? 0;
		const column = this.state.table.getColumn(resizingId);
		if (!column) return {
			left,
			offset: widthDelta
		};
		const { min, max } = this.state.getResizeFitBounds(column);
		const startSize = info.startSize ?? this.state.getColumnEffectiveWidth(column);
		const clampedDelta = Math.max(min - startSize, max !== null ? Math.min(max - startSize, widthDelta) : widthDelta);
		return {
			left,
			offset: this.state.resolvedDirection() === "rtl" ? -clampedDelta : clampedDelta
		};
	}, ...ngDevMode ? [{ debugName: "columnResizeGuide" }] : /* istanbul ignore next */ []);
	isColumnResizing = computed(() => this.state.table.getState().columnSizingInfo.isResizingColumn !== false, ...ngDevMode ? [{ debugName: "isColumnResizing" }] : /* istanbul ignore next */ []);
	startResize(event, header) {
		if (!canResizeColumn(header, this.state.resizingEnabled())) return;
		event.stopPropagation();
		this.state.seedColumnSizingFromMeasuredWidth(header.column);
		this.captureGuideOrigin(event, header);
		header.getResizeHandler()(event);
		this.state.resizeSeedSizing.set({});
	}
	resizeFromKey(event, column) {
		const result = this.state.resizeColumnFromKey(event, column);
		if (result) this.a11yService.announceColumnResize(column, result.width);
	}
	captureGuideOrigin(event, header) {
		const region = this.state.tableRegionRef()?.nativeElement;
		const handle = event.currentTarget;
		if (!region || !handle) {
			this.resizeGuideOrigin.set(null);
			return;
		}
		const regionRect = region.getBoundingClientRect();
		const handleRect = handle.getBoundingClientRect();
		const edge = this.state.resolvedDirection() === "rtl" ? handleRect.left : handleRect.right;
		const scrollLeft = region.scrollLeft;
		this.resizeGuidePinned.set(header.column.getIsPinned() !== false);
		this.resizeStartScrollLeft.set(scrollLeft);
		this.regionScrollLeft.set(scrollLeft);
		this.resizeGuideOrigin.set(edge - regionRect.left + scrollLeft);
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableResizeService,
		deps: [],
		target: i0.ɵɵFactoryTarget.Injectable
	});
	static ɵprov = i0.ɵɵngDeclareInjectable({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableResizeService
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableResizeService,
	decorators: [{ type: Injectable }],
	ctorParameters: () => []
});
const roundToSingleDecimal = (value) => Number(value.toFixed(1));
var NatTableRowRenderEmitter = class NatTableRowRenderEmitter {
	rowId = input.required({
		...ngDevMode ? { debugName: "rowId" } : /* istanbul ignore next */ {},
		alias: "natTableRowRenderEmitter"
	});
	natTableRowRenderToken = input.required(...ngDevMode ? [{ debugName: "natTableRowRenderToken" }] : /* istanbul ignore next */ []);
	natTableRowRenderStartedAt = input.required(...ngDevMode ? [{ debugName: "natTableRowRenderStartedAt" }] : /* istanbul ignore next */ []);
	natTableRowRenderEnabled = input(false, {
		...ngDevMode ? { debugName: "natTableRowRenderEnabled" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	natTableRowRendered = output();
	lastEmissionKey = "";
	constructor() {
		afterRenderEffect({ read: () => {
			if (!this.natTableRowRenderEnabled()) return;
			const rowId = this.rowId();
			const renderToken = this.natTableRowRenderToken();
			const renderStartedAt = this.natTableRowRenderStartedAt();
			if (renderToken <= 0 || renderStartedAt <= 0) return;
			const emissionKey = `${renderToken}:${rowId}`;
			if (this.lastEmissionKey === emissionKey) return;
			this.lastEmissionKey = emissionKey;
			this.natTableRowRendered.emit({
				rowId,
				renderToken,
				durationMs: roundToSingleDecimal(Math.max(performance.now() - renderStartedAt, .1))
			});
		} });
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableRowRenderEmitter,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableRowRenderEmitter,
		isStandalone: true,
		selector: "tr[natTableRowRenderEmitter]",
		inputs: {
			rowId: {
				classPropertyName: "rowId",
				publicName: "natTableRowRenderEmitter",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			natTableRowRenderToken: {
				classPropertyName: "natTableRowRenderToken",
				publicName: "natTableRowRenderToken",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			natTableRowRenderStartedAt: {
				classPropertyName: "natTableRowRenderStartedAt",
				publicName: "natTableRowRenderStartedAt",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			natTableRowRenderEnabled: {
				classPropertyName: "natTableRowRenderEnabled",
				publicName: "natTableRowRenderEnabled",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		outputs: { natTableRowRendered: "natTableRowRendered" },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableRowRenderEmitter,
	decorators: [{
		type: Directive,
		args: [{ selector: "tr[natTableRowRenderEmitter]" }]
	}],
	ctorParameters: () => [],
	propDecorators: {
		rowId: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableRowRenderEmitter",
				required: true
			}]
		}],
		natTableRowRenderToken: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableRowRenderToken",
				required: true
			}]
		}],
		natTableRowRenderStartedAt: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableRowRenderStartedAt",
				required: true
			}]
		}],
		natTableRowRenderEnabled: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableRowRenderEnabled",
				required: false
			}]
		}],
		natTableRowRendered: [{
			type: i0.Output,
			args: ["natTableRowRendered"]
		}]
	}
});
var NatTableHeaderCellLayout = class NatTableHeaderCellLayout {
	state = input.required({
		...ngDevMode ? { debugName: "state" } : /* istanbul ignore next */ {},
		alias: "natTableHeaderCellLayout"
	});
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableHeaderCellLayout,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableHeaderCellLayout,
		isStandalone: true,
		selector: "th[natTableHeaderCellLayout]",
		inputs: { state: {
			classPropertyName: "state",
			publicName: "natTableHeaderCellLayout",
			isSignal: true,
			isRequired: true,
			transformFunction: null
		} },
		host: { properties: {
			"style.left.px": "state()?.left",
			"style.right.px": "state()?.right",
			"style.width": "state()?.headerWidth",
			"style.min-width": "state()?.headerMinWidth",
			"style.max-width": "state()?.headerMaxWidth"
		} },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableHeaderCellLayout,
	decorators: [{
		type: Directive,
		args: [{
			selector: "th[natTableHeaderCellLayout]",
			host: {
				"[style.left.px]": "state()?.left",
				"[style.right.px]": "state()?.right",
				"[style.width]": "state()?.headerWidth",
				"[style.min-width]": "state()?.headerMinWidth",
				"[style.max-width]": "state()?.headerMaxWidth"
			}
		}]
	}],
	propDecorators: { state: [{
		type: i0.Input,
		args: [{
			isSignal: true,
			alias: "natTableHeaderCellLayout",
			required: true
		}]
	}] }
});
var NatTableBodyCellLayout = class NatTableBodyCellLayout {
	state = input.required({
		...ngDevMode ? { debugName: "state" } : /* istanbul ignore next */ {},
		alias: "natTableBodyCellLayout"
	});
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableBodyCellLayout,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableBodyCellLayout,
		isStandalone: true,
		selector: "[natTableBodyCellLayout]",
		inputs: { state: {
			classPropertyName: "state",
			publicName: "natTableBodyCellLayout",
			isSignal: true,
			isRequired: true,
			transformFunction: null
		} },
		host: { properties: {
			"style.--nat-table-cell-max-lines": "state()?.cellMaxLines",
			"style.height": "state()?.cellHeight",
			"style.left.px": "state()?.left",
			"style.right.px": "state()?.right",
			"style.width": "state()?.width",
			"style.min-width": "state()?.minWidth",
			"style.max-width": "state()?.maxWidth"
		} },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableBodyCellLayout,
	decorators: [{
		type: Directive,
		args: [{
			selector: "[natTableBodyCellLayout]",
			host: {
				"[style.--nat-table-cell-max-lines]": "state()?.cellMaxLines",
				"[style.height]": "state()?.cellHeight",
				"[style.left.px]": "state()?.left",
				"[style.right.px]": "state()?.right",
				"[style.width]": "state()?.width",
				"[style.min-width]": "state()?.minWidth",
				"[style.max-width]": "state()?.maxWidth"
			}
		}]
	}],
	propDecorators: { state: [{
		type: i0.Input,
		args: [{
			isSignal: true,
			alias: "natTableBodyCellLayout",
			required: true
		}]
	}] }
});
var NatTablePxWidth = class NatTablePxWidth {
	natTablePxWidth = input.required(...ngDevMode ? [{ debugName: "natTablePxWidth" }] : /* istanbul ignore next */ []);
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTablePxWidth,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTablePxWidth,
		isStandalone: true,
		selector: "[natTablePxWidth]",
		inputs: { natTablePxWidth: {
			classPropertyName: "natTablePxWidth",
			publicName: "natTablePxWidth",
			isSignal: true,
			isRequired: true,
			transformFunction: null
		} },
		host: { properties: { "style.width.px": "natTablePxWidth()" } },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTablePxWidth,
	decorators: [{
		type: Directive,
		args: [{
			selector: "[natTablePxWidth]",
			host: { "[style.width.px]": "natTablePxWidth()" }
		}]
	}],
	propDecorators: { natTablePxWidth: [{
		type: i0.Input,
		args: [{
			isSignal: true,
			alias: "natTablePxWidth",
			required: true
		}]
	}] }
});
var NatTablePxHeight = class NatTablePxHeight {
	natTablePxHeight = input.required(...ngDevMode ? [{ debugName: "natTablePxHeight" }] : /* istanbul ignore next */ []);
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTablePxHeight,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTablePxHeight,
		isStandalone: true,
		selector: "[natTablePxHeight]",
		inputs: { natTablePxHeight: {
			classPropertyName: "natTablePxHeight",
			publicName: "natTablePxHeight",
			isSignal: true,
			isRequired: true,
			transformFunction: null
		} },
		host: { properties: { "style.height.px": "natTablePxHeight()" } },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTablePxHeight,
	decorators: [{
		type: Directive,
		args: [{
			selector: "[natTablePxHeight]",
			host: { "[style.height.px]": "natTablePxHeight()" }
		}]
	}],
	propDecorators: { natTablePxHeight: [{
		type: i0.Input,
		args: [{
			isSignal: true,
			alias: "natTablePxHeight",
			required: true
		}]
	}] }
});
var NatTableResizeGuide = class NatTableResizeGuide {
	guide = input.required({
		...ngDevMode ? { debugName: "guide" } : /* istanbul ignore next */ {},
		alias: "natTableResizeGuide"
	});
	constructor() {
		const element = inject(ElementRef).nativeElement;
		const renderer = inject(Renderer2);
		afterRenderEffect({ write: () => {
			const guide = this.guide()();
			if (guide === null) {
				renderer.setAttribute(element, "hidden", "");
				return;
			}
			renderer.removeAttribute(element, "hidden");
			renderer.setStyle(element, "left", `${guide.left}px`);
			renderer.setStyle(element, "transform", `translateX(${guide.offset}px)`);
		} });
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableResizeGuide,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableResizeGuide,
		isStandalone: true,
		selector: "[natTableResizeGuide]",
		inputs: { guide: {
			classPropertyName: "guide",
			publicName: "natTableResizeGuide",
			isSignal: true,
			isRequired: true,
			transformFunction: null
		} },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableResizeGuide,
	decorators: [{
		type: Directive,
		args: [{ selector: "[natTableResizeGuide]" }]
	}],
	ctorParameters: () => [],
	propDecorators: { guide: [{
		type: i0.Input,
		args: [{
			isSignal: true,
			alias: "natTableResizeGuide",
			required: true
		}]
	}] }
});
const requireNatTableService = (service, selector) => {
	if (service === null) throw new Error(`[ng-advanced-table] <${selector}> could not find a NatTableService. Wrap it in <nat-table-surface> (ng-advanced-table/components), or add providers: [NatTableService] to a host component or directive.`);
	return service;
};
const trackNatTableBodyRow = (renderedRow) => renderedRow.kind === "row" ? renderedRow.row.id : `nat-table-placeholder:${renderedRow.logicalIndex}`;
var NatTable = class NatTable {
	data = input.required(...ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []);
	columns = input.required(...ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []);
	accessibleName = input(void 0, ...ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []);
	caption = input(void 0, ...ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []);
	dataStatus = input(NAT_TABLE_DATA_STATUS.success, ...ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []);
	error = input(null, ...ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []);
	enableRowSelection = input(false, {
		...ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	selectionMode = input("multiple", ...ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []);
	globalFilterFn = input(...ngDevMode ? [void 0, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []);
	getRowId = input(...ngDevMode ? [void 0, { debugName: "getRowId" }] : /* istanbul ignore next */ []);
	emitRowRenderEvents = input(false, {
		...ngDevMode ? { debugName: "emitRowRenderEvents" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	subHeaderColumn = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []);
	subHeaderOrder = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []);
	enableSubHeaders = input(true, {
		...ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	subHeaderLayout = input("colspan", ...ngDevMode ? [{ debugName: "subHeaderLayout" }] : /* istanbul ignore next */ []);
	rowRendered = output();
	rowActivate = output();
	natTableService = requireNatTableService(inject(NatTableService, { optional: true }), "nat-table");
	state = inject(NatTableState);
	a11yService = inject(NatTableA11yService);
	resizeService = inject(NatTableResizeService);
	reorderService = inject(NatTableReorderService);
	destroyRef = inject(DestroyRef);
	enablePagination = this.state.enablePagination;
	enableGlobalFilter = this.state.enableGlobalFilter;
	table = this.state.table;
	tableElementId = this.state.tableElementId;
	tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null, ...ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []);
	localeId = this.state.localeId;
	headerGroups = this.state.headerGroups;
	bodyRows = this.state.bodyRows;
	bodyRenderPlan = this.state.bodyRenderPlan;
	headerRowCount = this.state.headerRowCount;
	gridRowCount = this.state.gridRowCount;
	visibleColumns = this.state.visibleColumns;
	bodyState = this.state.bodyState;
	resolvedDataStatus = this.state.resolvedDataStatus;
	resolvedCaption = this.state.resolvedCaption;
	resolvedDirection = this.state.resolvedDirection;
	stickyHeader = this.state.stickyHeader;
	usesAuthoritativeLayout = this.state.usesAuthoritativeLayout;
	tableClassMap = this.state.tableClassMap;
	fixedLayoutTableWidth = this.state.fixedLayoutTableWidth;
	resolvedColumnWidths = this.state.resolvedColumnWidths;
	columnRenderStates = this.state.columnRenderStates;
	visibleColumnCount = this.state.visibleColumnCount;
	emptyStateColSpan = this.state.emptyStateColSpan;
	tableAriaBusy = this.state.tableAriaBusy;
	renderCycleToken = this.state.renderCycleToken;
	renderCycleStartedAt = this.state.renderCycleStartedAt;
	resolvedDescription = this.state.resolvedDescription;
	resolvedEmptyState = this.state.resolvedEmptyState;
	resolvedLoadingState = this.state.resolvedLoadingState;
	resolvedErrorState = this.state.resolvedErrorState;
	tableCaptionId = this.state.tableCaptionId;
	tableSummaryId = this.state.tableSummaryId;
	tableDescriptionId = this.state.tableDescriptionId;
	tableKeyboardInstructionsId = this.state.tableKeyboardInstructionsId;
	tableAriaLabel = this.state.tableAriaLabel;
	tableAriaLabelledBy = this.state.tableAriaLabelledBy;
	resolvedKeyboardInstructions = this.state.resolvedKeyboardInstructions;
	ariaDescribedBy = computed(() => {
		const ids = [];
		if (this.tableSummary().trim()) ids.push(this.tableSummaryId());
		if (this.resolvedDescription().trim()) ids.push(this.tableDescriptionId());
		if (this.resolvedKeyboardInstructions().trim()) ids.push(this.tableKeyboardInstructionsId());
		return ids.length ? ids.join(" ") : null;
	}, ...ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []);
	loadingTemplate = contentChild(NatTableLoadingTemplate, ...ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []);
	emptyTemplate = contentChild(NatTableEmptyTemplate, ...ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []);
	errorTemplate = contentChild(NatTableErrorTemplate, ...ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []);
	subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, ...ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []);
	rowPlaceholderTemplate = contentChild(NatTableRowPlaceholderTemplate, ...ngDevMode ? [{ debugName: "rowPlaceholderTemplate" }] : /* istanbul ignore next */ []);
	loadingTemplateRef = computed(() => {
		const templateRef = this.loadingTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "loadingTemplateRef" }] : /* istanbul ignore next */ []);
	emptyTemplateRef = computed(() => {
		const templateRef = this.emptyTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "emptyTemplateRef" }] : /* istanbul ignore next */ []);
	errorTemplateRef = computed(() => {
		const templateRef = this.errorTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "errorTemplateRef" }] : /* istanbul ignore next */ []);
	subHeaderTemplateRef = computed(() => {
		const templateRef = this.subHeaderTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []);
	rowPlaceholderTemplateRef = computed(() => {
		const templateRef = this.rowPlaceholderTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "rowPlaceholderTemplateRef" }] : /* istanbul ignore next */ []);
	subHeaderGroups = this.state.subHeaderGroups;
	subHeaderRowOffsets = this.state.subHeaderRowOffsets;
	getSubHeaderContext(group) {
		return this.state.getSubHeaderTemplateContext(group);
	}
	getSubHeaderAriaText(group) {
		return this.state.getSubHeaderAnnouncement(group, "table");
	}
	getRowPlaceholderContext(logicalIndex, column) {
		return this.state.getRowPlaceholderTemplateContext(logicalIndex, column);
	}
	getRowPlaceholderAriaText(logicalIndex) {
		return this.state.getRowPlaceholderAnnouncement(logicalIndex);
	}
	bodyRowTrackId = trackNatTableBodyRow;
	loadingTemplateContext = computed(() => ({
		...this.state.getStateTemplateBaseContext(),
		$implicit: NAT_TABLE_BODY_STATE.loading,
		status: NAT_TABLE_BODY_STATE.loading
	}), ...ngDevMode ? [{ debugName: "loadingTemplateContext" }] : /* istanbul ignore next */ []);
	emptyTemplateContext = computed(() => ({
		...this.state.getStateTemplateBaseContext(),
		$implicit: NAT_TABLE_BODY_STATE.empty,
		status: NAT_TABLE_BODY_STATE.empty
	}), ...ngDevMode ? [{ debugName: "emptyTemplateContext" }] : /* istanbul ignore next */ []);
	errorTemplateContext = computed(() => {
		const error = this.error();
		return {
			...this.state.getStateTemplateBaseContext(),
			$implicit: error,
			status: NAT_TABLE_BODY_STATE.error,
			error
		};
	}, ...ngDevMode ? [{ debugName: "errorTemplateContext" }] : /* istanbul ignore next */ []);
	tableSummary = this.a11yService.tableSummary;
	liveMessage = this.a11yService.liveMessage;
	columnResizeGuide = this.resizeService.columnResizeGuide;
	isColumnResizing = this.resizeService.isColumnResizing;
	tableRegionRef = viewChild("tableRegion", ...ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []);
	getHeaderRowColumnIds = getHeaderRowColumnIds;
	shouldHidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel;
	getCellTone = getCellTone;
	canResizeColumn = (header) => canResizeColumn(header, this.state.resizingEnabled());
	isLeafHeaderRow = (headerGroup) => this.reorderService.isLeafHeaderRow(headerGroup);
	hasReorderableColumns = () => this.reorderService.hasReorderableColumns();
	canReorderHeader = (header) => !header.isPlaceholder && this.reorderService.canReorderHeader(header.column);
	onRegionFocusIn(event) {
		const region = this.tableRegionRef()?.nativeElement;
		const cell = event.target instanceof Element ? event.target.closest("td, th") : null;
		if (!region || !cell || cell.closest("table")?.parentElement !== region) return;
		scrollCellIntoUnobscuredView(region, cell);
	}
	constructor() {
		inject(NatTableHeaderMeasurementService);
		inject(NatTableCellControlManager).startCellControlPreparation();
		this.natTableService.setController(this);
		this.a11yService.registerGridEffects();
		effect(() => this.state.data.set(this.data()));
		effect(() => this.state.columnDefs.set(this.columns()));
		effect(() => this.state.dataStatus.set(this.dataStatus()));
		effect(() => this.state.error.set(this.error()));
		effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
		effect(() => this.state.selectionMode.set(this.selectionMode()));
		effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
		effect(() => this.state.getRowId.set(this.getRowId()));
		effect(() => this.state.accessibleName.set(this.accessibleName()));
		effect(() => this.state.caption.set(this.caption()));
		effect(() => this.state.emitRowRenderEvents.set(this.emitRowRenderEvents()));
		effect(() => this.state.subHeaderColumn.set(this.subHeaderColumn()));
		effect(() => this.state.subHeaderOrder.set(this.subHeaderOrder()));
		effect(() => this.state.enableSubHeaders.set(this.enableSubHeaders()));
		effect(() => this.state.tableRegionRef.set(this.tableRegionRef()));
		this.state.registerSeedEffect();
		this.state.registerRenderCycleEffect();
		this.state.registerSubHeaderValidationEffect();
		this.state.registerLocaleValidationEffect();
		this.destroyRef.onDestroy(() => {
			this.natTableService.clearController(this);
		});
	}
	patchState(updaters) {
		this.state.patchState(updaters);
	}
	onHeaderDrop(event, headerGroup) {
		this.reorderService.onHeaderDrop(event, headerGroup);
	}
	onHeaderKeydown(event, column) {
		const keyboard = this.natTableService.keyboard();
		if (event.defaultPrevented) return;
		if (handleCellInteractionKeydown(event, keyboard.cellInteraction)) return;
		if (event.altKey && !event.shiftKey && isResizeKey(event)) {
			this.resizeService.resizeFromKey(event, column);
			return;
		}
		const directionDelta = keyboard.columnReorderDirection(event);
		if (directionDelta === null) return;
		this.reorderService.handleKeyboardReorder(event, column, directionDelta);
	}
	onResizeStart(event, header) {
		this.resizeService.startResize(event, header);
	}
	onRowRendered(event) {
		this.rowRendered.emit(event);
	}
	rowAriaSelected(row) {
		return this.state.enableRowSelection() ? row.getIsSelected() : null;
	}
	onRowClick(event, row) {
		if (event.button !== 0 || event.defaultPrevented) return;
		if (originatesFromInteractiveDescendant(event)) return;
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	onRowKeydown(event, row) {
		if (event.defaultPrevented) return;
		if (!this.natTableService.keyboard().rowActivate(event)) return;
		if (originatesFromInteractiveDescendant(event)) return;
		if (isSpaceShortcutKey(event.key)) event.preventDefault();
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTable,
		deps: [],
		target: i0.ɵɵFactoryTarget.Component
	});
	static ɵcmp = i0.ɵɵngDeclareComponent({
		minVersion: "17.0.0",
		version: "22.2.1",
		type: NatTable,
		isStandalone: true,
		selector: "nat-table",
		inputs: {
			data: {
				classPropertyName: "data",
				publicName: "data",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			columns: {
				classPropertyName: "columns",
				publicName: "columns",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			accessibleName: {
				classPropertyName: "accessibleName",
				publicName: "accessibleName",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			caption: {
				classPropertyName: "caption",
				publicName: "caption",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			dataStatus: {
				classPropertyName: "dataStatus",
				publicName: "dataStatus",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			error: {
				classPropertyName: "error",
				publicName: "error",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableRowSelection: {
				classPropertyName: "enableRowSelection",
				publicName: "enableRowSelection",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			selectionMode: {
				classPropertyName: "selectionMode",
				publicName: "selectionMode",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			globalFilterFn: {
				classPropertyName: "globalFilterFn",
				publicName: "globalFilterFn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			getRowId: {
				classPropertyName: "getRowId",
				publicName: "getRowId",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			emitRowRenderEvents: {
				classPropertyName: "emitRowRenderEvents",
				publicName: "emitRowRenderEvents",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderColumn: {
				classPropertyName: "subHeaderColumn",
				publicName: "subHeaderColumn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderOrder: {
				classPropertyName: "subHeaderOrder",
				publicName: "subHeaderOrder",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableSubHeaders: {
				classPropertyName: "enableSubHeaders",
				publicName: "enableSubHeaders",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderLayout: {
				classPropertyName: "subHeaderLayout",
				publicName: "subHeaderLayout",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		outputs: {
			rowRendered: "rowRendered",
			rowActivate: "rowActivate"
		},
		providers: [
			NatTableRowRenderStrategyRegistry,
			NatTableState,
			{
				provide: NAT_TABLE_ROW_WINDOW_HOST,
				useExisting: NatTableState
			},
			NatTableA11yService,
			NatTableResizeService,
			NatTableReorderService,
			NatTableHeaderMeasurementService,
			NatTableCellControlManager
		],
		queries: [
			{
				propertyName: "loadingTemplate",
				first: true,
				predicate: NatTableLoadingTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "emptyTemplate",
				first: true,
				predicate: NatTableEmptyTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "errorTemplate",
				first: true,
				predicate: NatTableErrorTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "subHeaderTemplate",
				first: true,
				predicate: NatTableSubHeaderTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "rowPlaceholderTemplate",
				first: true,
				predicate: NatTableRowPlaceholderTemplate,
				descendants: true,
				isSignal: true
			}
		],
		viewQueries: [{
			propertyName: "tableRegionRef",
			first: true,
			predicate: ["tableRegion"],
			descendants: true,
			isSignal: true
		}],
		exportAs: ["natTable"],
		ngImport: i0,
		template: "<!-- eslint-disable max-lines -- single cohesive table template (header/body/state rows + resize guide); splitting into partials would fragment the grid structure. -->\n<div\n  #tableRegion\n  [class.is-resizing]=\"isColumnResizing()\"\n  class=\"table-region\"\n  data-testid=\"nat-table-region\"\n  (focusin)=\"onRegionFocusIn($event)\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\" data-testid=\"nat-table-summary\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (resolvedKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedKeyboardInstructions() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.aria-rowcount]=\"gridRowCount()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\"\n    colWrap=\"nowrap\"\n    ngGrid\n    rowWrap=\"nowrap\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      <ng-template #headerCellContent let-columnState=\"columnState\" let-header=\"header\">\n        @if (!header.isPlaceholder) {\n          @let headerContext = header.getContext();\n          @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n          @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n          <div class=\"header-cell-content\">\n            <span class=\"header-cell-primary\">\n              @if (hiddenHeaderLabel) {\n                <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n              }\n\n              @if (!hidePrimitiveHeaderLabel) {\n                <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                  {{ rendered }}\n                </ng-container>\n              }\n            </span>\n          </div>\n\n          @if (canResizeColumn(header)) {\n            <span\n              [attr.data-testid]=\"`nat-table-resize-handle-${header.column.id}`\"\n              [class.is-resizing]=\"header.column.getIsResizing()\"\n              aria-hidden=\"true\"\n              class=\"column-resize-handle\"\n              (click)=\"$event.stopPropagation()\"\n              (mousedown)=\"onResizeStart($event, header)\"\n              (pointerdown)=\"$event.stopPropagation()\"\n              (touchstart)=\"onResizeStart($event, header)\"></span>\n          }\n        }\n      </ng-template>\n      @let tableHeaderGroups = headerGroups();\n      @for (headerGroup of tableHeaderGroups; track headerGroup.id; let headerRowIndex = $index) {\n        @let isReorderableHeaderRow = hasReorderableColumns() && isLeafHeaderRow(headerGroup);\n        @if (isReorderableHeaderRow) {\n          <tr\n            [cdkDropListData]=\"getHeaderRowColumnIds(headerGroup)\"\n            [rowIndex]=\"headerRowIndex + 1\"\n            cdkDropList\n            cdkDropListOrientation=\"horizontal\"\n            ngGridRow\n            (cdkDropListDropped)=\"onHeaderDrop($event, headerGroup)\">\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [cdkDragData]=\"header.column.id\"\n                [cdkDragDisabled]=\"!canReorderHeader(header)\"\n                [class]=\"columnState?.headerClassMap\"\n                [class.is-reorderable]=\"canReorderHeader(header)\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                cdkDrag\n                cdkDragLockAxis=\"x\"\n                cdkDragPreviewContainer=\"parent\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        } @else {\n          <tr [rowIndex]=\"headerRowIndex + 1\" ngGridRow>\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [class]=\"columnState?.headerClassMap\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        }\n      }\n    </thead>\n    <tbody>\n      @let bodyPlan = bodyRenderPlan();\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @let subHeaderOffsets = subHeaderRowOffsets();\n          @for (renderedRow of bodyPlan.rows; track bodyRowTrackId(renderedRow)) {\n            @let dataRowIndex = headerRowCount() + renderedRow.logicalIndex + (subHeaderOffsets.at(renderedRow.logicalIndex) ?? 0) + 1;\n            @if (renderedRow.beforeSize > 0) {\n              <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n                <td\n                  [colSpan]=\"emptyStateColSpan()\"\n                  [natTablePxHeight]=\"renderedRow.beforeSize\"\n                  aria-hidden=\"true\"\n                  class=\"virtual-spacer-cell\"></td>\n              </tr>\n            }\n            @if (renderedRow.kind === 'placeholder') {\n              <!-- An unfetched logical slot under remote windowing: a real grid row\n                   holding one structurally correct fixed-height cell per column, told\n                   apart from data by aria-busy and the loading copy — never by fake\n                   content. -->\n              <tr\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [rowIndex]=\"dataRowIndex\"\n                aria-busy=\"true\"\n                class=\"data-row placeholder-row\"\n                data-testid=\"nat-table-row-placeholder\"\n                ngGridRow>\n                @for (column of visibleColumns(); track column.id; let columnIndex = $index) {\n                  @let columnState = columnStates[column.id];\n                  <td\n                    [attr.data-column-id]=\"column.id\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    natTableCell\n                    ngGridCell>\n                    <span class=\"data-cell-content\">\n                      @if (columnIndex === 0) {\n                        @if (getRowPlaceholderAriaText(renderedRow.logicalIndex); as ariaText) {\n                          <span class=\"sr-only\">{{ ariaText }}</span>\n                        }\n                      }\n                      @if (rowPlaceholderTemplateRef(); as templateRef) {\n                        <ng-container\n                          [ngTemplateOutlet]=\"templateRef\"\n                          [ngTemplateOutletContext]=\"getRowPlaceholderContext(renderedRow.logicalIndex, column)\" />\n                      }\n                    </span>\n                  </td>\n                }\n              </tr>\n            } @else {\n              @let row = renderedRow.row;\n              @let visibleCells = row.getVisibleCells();\n              @let subHeader = groups.get(row.id);\n              @if (subHeader) {\n                <ng-template #subHeaderInnerContent>\n                  <div class=\"sub-header-content\">\n                    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                      <span class=\"sr-only\">{{ ariaText }}</span>\n                    }\n                    @if (subHeaderTemplateRef(); as templateRef) {\n                      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                    } @else {\n                      <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                    }\n                  </div>\n                </ng-template>\n                <tr [rowIndex]=\"dataRowIndex - 1\" class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\" ngGridRow>\n                  @if (subHeaderLayout() === 'colspan') {\n                    <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\" natTableCell ngGridCell>\n                      <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                    </td>\n                  } @else {\n                    <!-- `cells` layout: one td per visible column instead of one\n                         full-width colspan cell. A colspan cell cannot be pinned, so\n                         with the colspan layout a horizontally scrolled table shows\n                         pinned columns' sticky offsets and backgrounds stopping at\n                         every group row. Here each td takes its own column's layout\n                         state (width, pinned offset, pinned background) via\n                         natTableBodyCellLayout, so the pinned zones run unbroken\n                         through the sub-header row. The group label renders once,\n                         inside the first cell; the rest stay empty. -->\n                    @for (cell of visibleCells; track cell.id; let first = $first) {\n                      @let columnState = columnStates[cell.column.id];\n                      <td\n                        [attr.data-column-id]=\"cell.column.id\"\n                        [class]=\"columnState?.cellClassMap\"\n                        [class.sub-header-cell]=\"true\"\n                        [natTableBodyCellLayout]=\"columnState\"\n                        natTableCell\n                        ngGridCell>\n                        @if (first) {\n                          <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                        }\n                      </td>\n                    }\n                  }\n                </tr>\n              }\n              <tr\n                [attr.aria-selected]=\"rowAriaSelected(row)\"\n                [attr.data-row-id]=\"row.id\"\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [natTableRowRenderEmitter]=\"row.id\"\n                [natTableRowRenderEnabled]=\"emitRowRenderEvents()\"\n                [natTableRowRenderStartedAt]=\"renderCycleStartedAt()\"\n                [natTableRowRenderToken]=\"renderCycleToken()\"\n                [rowIndex]=\"dataRowIndex\"\n                class=\"data-row\"\n                data-testid=\"nat-table-row\"\n                ngGridRow\n                (click)=\"onRowClick($event, row)\"\n                (keydown)=\"onRowKeydown($event, row)\"\n                (natTableRowRendered)=\"onRowRendered($event)\">\n                @for (cell of visibleCells; track cell.id) {\n                  @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                  @let cellTone = getCellTone(cell.column, cellContext);\n                  @if (columnState?.rowHeader) {\n                    <th\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell\n                      role=\"rowheader\"\n                      scope=\"row\">\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </th>\n                  } @else {\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell>\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </td>\n                  }\n                }\n              </tr>\n            }\n          }\n          @if (bodyPlan.afterSize > 0) {\n            <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n              <td\n                [colSpan]=\"emptyStateColSpan()\"\n                [natTablePxHeight]=\"bodyPlan.afterSize\"\n                aria-hidden=\"true\"\n                class=\"virtual-spacer-cell\"></td>\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  @if (isColumnResizing()) {\n    <div\n      [natTableResizeGuide]=\"columnResizeGuide\"\n      aria-hidden=\"true\"\n      class=\"column-resize-guide\"\n      data-testid=\"nat-table-resize-guide\"\n      hidden></div>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n",
		styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom-color:var( --nat-table-last-row-border-color, var( --sys-nat-table-last-row-border-color, var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%))) ) );border-bottom-width:var(--nat-table-last-row-border-width, var(--sys-nat-table-last-row-border-width, 0))}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{height:var(--nat-table-row-min-height, var(--sys-nat-table-row-min-height, auto));background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:end}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;inset-inline-start:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;inset-inline-start:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}.column-resize-handle:after,.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder),.header-cell.cdk-drag-animating,.data-cell{transition:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"],
		dependencies: [
			{
				kind: "directive",
				type: NgTemplateOutlet,
				selector: "[ngTemplateOutlet]",
				inputs: [
					"ngTemplateOutletContext",
					"ngTemplateOutlet",
					"ngTemplateOutletInjector"
				]
			},
			{
				kind: "directive",
				type: Grid,
				selector: "[ngGrid]",
				inputs: [
					"enableSelection",
					"disabled",
					"softDisabled",
					"focusMode",
					"rowWrap",
					"colWrap",
					"multi",
					"selectionMode",
					"tabindex"
				],
				exportAs: ["ngGrid"]
			},
			{
				kind: "directive",
				type: GridCell,
				selector: "[ngGridCell]",
				inputs: [
					"id",
					"role",
					"rowSpan",
					"colSpan",
					"rowIndex",
					"colIndex",
					"disabled",
					"selected",
					"selectable",
					"tabindex"
				],
				outputs: ["selectedChange"],
				exportAs: ["ngGridCell"]
			},
			{
				kind: "directive",
				type: GridRow,
				selector: "[ngGridRow]",
				inputs: ["rowIndex"],
				exportAs: ["ngGridRow"]
			},
			{
				kind: "directive",
				type: CdkDropList,
				selector: "[cdkDropList], cdk-drop-list",
				inputs: [
					"cdkDropListConnectedTo",
					"cdkDropListData",
					"cdkDropListOrientation",
					"id",
					"cdkDropListLockAxis",
					"cdkDropListDisabled",
					"cdkDropListSortingDisabled",
					"cdkDropListEnterPredicate",
					"cdkDropListSortPredicate",
					"cdkDropListAutoScrollDisabled",
					"cdkDropListAutoScrollStep",
					"cdkDropListElementContainer",
					"cdkDropListHasAnchor"
				],
				outputs: [
					"cdkDropListDropped",
					"cdkDropListEntered",
					"cdkDropListExited",
					"cdkDropListSorted"
				],
				exportAs: ["cdkDropList"]
			},
			{
				kind: "directive",
				type: CdkDrag,
				selector: "[cdkDrag]",
				inputs: [
					"cdkDragData",
					"cdkDragLockAxis",
					"cdkDragRootElement",
					"cdkDragBoundary",
					"cdkDragStartDelay",
					"cdkDragFreeDragPosition",
					"cdkDragDisabled",
					"cdkDragConstrainPosition",
					"cdkDragPreviewClass",
					"cdkDragPreviewContainer",
					"cdkDragScale"
				],
				outputs: [
					"cdkDragStarted",
					"cdkDragReleased",
					"cdkDragEnded",
					"cdkDragEntered",
					"cdkDragExited",
					"cdkDragDropped",
					"cdkDragMoved"
				],
				exportAs: ["cdkDrag"]
			},
			{
				kind: "directive",
				type: FlexRender,
				selector: "[flexRender]",
				inputs: [
					"flexRender",
					"flexRenderProps",
					"flexRenderInjector"
				]
			},
			{
				kind: "directive",
				type: NatTableRowRenderEmitter,
				selector: "tr[natTableRowRenderEmitter]",
				inputs: [
					"natTableRowRenderEmitter",
					"natTableRowRenderToken",
					"natTableRowRenderStartedAt",
					"natTableRowRenderEnabled"
				],
				outputs: ["natTableRowRendered"]
			},
			{
				kind: "directive",
				type: NatTableCell,
				selector: "[natTableCell]"
			},
			{
				kind: "directive",
				type: NatTableHeaderCellLayout,
				selector: "th[natTableHeaderCellLayout]",
				inputs: ["natTableHeaderCellLayout"]
			},
			{
				kind: "directive",
				type: NatTableBodyCellLayout,
				selector: "[natTableBodyCellLayout]",
				inputs: ["natTableBodyCellLayout"]
			},
			{
				kind: "directive",
				type: NatTablePxHeight,
				selector: "[natTablePxHeight]",
				inputs: ["natTablePxHeight"]
			},
			{
				kind: "directive",
				type: NatTablePxWidth,
				selector: "[natTablePxWidth]",
				inputs: ["natTablePxWidth"]
			},
			{
				kind: "directive",
				type: NatTableResizeGuide,
				selector: "[natTableResizeGuide]",
				inputs: ["natTableResizeGuide"]
			}
		]
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTable,
	decorators: [{
		type: Component,
		args: [{
			selector: "nat-table",
			exportAs: "natTable",
			imports: [
				NgTemplateOutlet,
				Grid,
				GridCell,
				GridRow,
				CdkDropList,
				CdkDrag,
				FlexRender,
				NatTableRowRenderEmitter,
				NatTableCell,
				NatTableHeaderCellLayout,
				NatTableBodyCellLayout,
				NatTablePxHeight,
				NatTablePxWidth,
				NatTableResizeGuide
			],
			providers: [
				NatTableRowRenderStrategyRegistry,
				NatTableState,
				{
					provide: NAT_TABLE_ROW_WINDOW_HOST,
					useExisting: NatTableState
				},
				NatTableA11yService,
				NatTableResizeService,
				NatTableReorderService,
				NatTableHeaderMeasurementService,
				NatTableCellControlManager
			],
			template: "<!-- eslint-disable max-lines -- single cohesive table template (header/body/state rows + resize guide); splitting into partials would fragment the grid structure. -->\n<div\n  #tableRegion\n  [class.is-resizing]=\"isColumnResizing()\"\n  class=\"table-region\"\n  data-testid=\"nat-table-region\"\n  (focusin)=\"onRegionFocusIn($event)\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\" data-testid=\"nat-table-summary\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (resolvedKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedKeyboardInstructions() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.aria-rowcount]=\"gridRowCount()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\"\n    colWrap=\"nowrap\"\n    ngGrid\n    rowWrap=\"nowrap\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      <ng-template #headerCellContent let-columnState=\"columnState\" let-header=\"header\">\n        @if (!header.isPlaceholder) {\n          @let headerContext = header.getContext();\n          @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n          @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n          <div class=\"header-cell-content\">\n            <span class=\"header-cell-primary\">\n              @if (hiddenHeaderLabel) {\n                <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n              }\n\n              @if (!hidePrimitiveHeaderLabel) {\n                <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                  {{ rendered }}\n                </ng-container>\n              }\n            </span>\n          </div>\n\n          @if (canResizeColumn(header)) {\n            <span\n              [attr.data-testid]=\"`nat-table-resize-handle-${header.column.id}`\"\n              [class.is-resizing]=\"header.column.getIsResizing()\"\n              aria-hidden=\"true\"\n              class=\"column-resize-handle\"\n              (click)=\"$event.stopPropagation()\"\n              (mousedown)=\"onResizeStart($event, header)\"\n              (pointerdown)=\"$event.stopPropagation()\"\n              (touchstart)=\"onResizeStart($event, header)\"></span>\n          }\n        }\n      </ng-template>\n      @let tableHeaderGroups = headerGroups();\n      @for (headerGroup of tableHeaderGroups; track headerGroup.id; let headerRowIndex = $index) {\n        @let isReorderableHeaderRow = hasReorderableColumns() && isLeafHeaderRow(headerGroup);\n        @if (isReorderableHeaderRow) {\n          <tr\n            [cdkDropListData]=\"getHeaderRowColumnIds(headerGroup)\"\n            [rowIndex]=\"headerRowIndex + 1\"\n            cdkDropList\n            cdkDropListOrientation=\"horizontal\"\n            ngGridRow\n            (cdkDropListDropped)=\"onHeaderDrop($event, headerGroup)\">\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [cdkDragData]=\"header.column.id\"\n                [cdkDragDisabled]=\"!canReorderHeader(header)\"\n                [class]=\"columnState?.headerClassMap\"\n                [class.is-reorderable]=\"canReorderHeader(header)\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                cdkDrag\n                cdkDragLockAxis=\"x\"\n                cdkDragPreviewContainer=\"parent\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        } @else {\n          <tr [rowIndex]=\"headerRowIndex + 1\" ngGridRow>\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [class]=\"columnState?.headerClassMap\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        }\n      }\n    </thead>\n    <tbody>\n      @let bodyPlan = bodyRenderPlan();\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @let subHeaderOffsets = subHeaderRowOffsets();\n          @for (renderedRow of bodyPlan.rows; track bodyRowTrackId(renderedRow)) {\n            @let dataRowIndex = headerRowCount() + renderedRow.logicalIndex + (subHeaderOffsets.at(renderedRow.logicalIndex) ?? 0) + 1;\n            @if (renderedRow.beforeSize > 0) {\n              <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n                <td\n                  [colSpan]=\"emptyStateColSpan()\"\n                  [natTablePxHeight]=\"renderedRow.beforeSize\"\n                  aria-hidden=\"true\"\n                  class=\"virtual-spacer-cell\"></td>\n              </tr>\n            }\n            @if (renderedRow.kind === 'placeholder') {\n              <!-- An unfetched logical slot under remote windowing: a real grid row\n                   holding one structurally correct fixed-height cell per column, told\n                   apart from data by aria-busy and the loading copy — never by fake\n                   content. -->\n              <tr\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [rowIndex]=\"dataRowIndex\"\n                aria-busy=\"true\"\n                class=\"data-row placeholder-row\"\n                data-testid=\"nat-table-row-placeholder\"\n                ngGridRow>\n                @for (column of visibleColumns(); track column.id; let columnIndex = $index) {\n                  @let columnState = columnStates[column.id];\n                  <td\n                    [attr.data-column-id]=\"column.id\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    natTableCell\n                    ngGridCell>\n                    <span class=\"data-cell-content\">\n                      @if (columnIndex === 0) {\n                        @if (getRowPlaceholderAriaText(renderedRow.logicalIndex); as ariaText) {\n                          <span class=\"sr-only\">{{ ariaText }}</span>\n                        }\n                      }\n                      @if (rowPlaceholderTemplateRef(); as templateRef) {\n                        <ng-container\n                          [ngTemplateOutlet]=\"templateRef\"\n                          [ngTemplateOutletContext]=\"getRowPlaceholderContext(renderedRow.logicalIndex, column)\" />\n                      }\n                    </span>\n                  </td>\n                }\n              </tr>\n            } @else {\n              @let row = renderedRow.row;\n              @let visibleCells = row.getVisibleCells();\n              @let subHeader = groups.get(row.id);\n              @if (subHeader) {\n                <ng-template #subHeaderInnerContent>\n                  <div class=\"sub-header-content\">\n                    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                      <span class=\"sr-only\">{{ ariaText }}</span>\n                    }\n                    @if (subHeaderTemplateRef(); as templateRef) {\n                      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                    } @else {\n                      <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                    }\n                  </div>\n                </ng-template>\n                <tr [rowIndex]=\"dataRowIndex - 1\" class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\" ngGridRow>\n                  @if (subHeaderLayout() === 'colspan') {\n                    <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\" natTableCell ngGridCell>\n                      <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                    </td>\n                  } @else {\n                    <!-- `cells` layout: one td per visible column instead of one\n                         full-width colspan cell. A colspan cell cannot be pinned, so\n                         with the colspan layout a horizontally scrolled table shows\n                         pinned columns' sticky offsets and backgrounds stopping at\n                         every group row. Here each td takes its own column's layout\n                         state (width, pinned offset, pinned background) via\n                         natTableBodyCellLayout, so the pinned zones run unbroken\n                         through the sub-header row. The group label renders once,\n                         inside the first cell; the rest stay empty. -->\n                    @for (cell of visibleCells; track cell.id; let first = $first) {\n                      @let columnState = columnStates[cell.column.id];\n                      <td\n                        [attr.data-column-id]=\"cell.column.id\"\n                        [class]=\"columnState?.cellClassMap\"\n                        [class.sub-header-cell]=\"true\"\n                        [natTableBodyCellLayout]=\"columnState\"\n                        natTableCell\n                        ngGridCell>\n                        @if (first) {\n                          <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                        }\n                      </td>\n                    }\n                  }\n                </tr>\n              }\n              <tr\n                [attr.aria-selected]=\"rowAriaSelected(row)\"\n                [attr.data-row-id]=\"row.id\"\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [natTableRowRenderEmitter]=\"row.id\"\n                [natTableRowRenderEnabled]=\"emitRowRenderEvents()\"\n                [natTableRowRenderStartedAt]=\"renderCycleStartedAt()\"\n                [natTableRowRenderToken]=\"renderCycleToken()\"\n                [rowIndex]=\"dataRowIndex\"\n                class=\"data-row\"\n                data-testid=\"nat-table-row\"\n                ngGridRow\n                (click)=\"onRowClick($event, row)\"\n                (keydown)=\"onRowKeydown($event, row)\"\n                (natTableRowRendered)=\"onRowRendered($event)\">\n                @for (cell of visibleCells; track cell.id) {\n                  @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                  @let cellTone = getCellTone(cell.column, cellContext);\n                  @if (columnState?.rowHeader) {\n                    <th\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell\n                      role=\"rowheader\"\n                      scope=\"row\">\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </th>\n                  } @else {\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell>\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </td>\n                  }\n                }\n              </tr>\n            }\n          }\n          @if (bodyPlan.afterSize > 0) {\n            <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n              <td\n                [colSpan]=\"emptyStateColSpan()\"\n                [natTablePxHeight]=\"bodyPlan.afterSize\"\n                aria-hidden=\"true\"\n                class=\"virtual-spacer-cell\"></td>\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  @if (isColumnResizing()) {\n    <div\n      [natTableResizeGuide]=\"columnResizeGuide\"\n      aria-hidden=\"true\"\n      class=\"column-resize-guide\"\n      data-testid=\"nat-table-resize-guide\"\n      hidden></div>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n",
			styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom-color:var( --nat-table-last-row-border-color, var( --sys-nat-table-last-row-border-color, var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%))) ) );border-bottom-width:var(--nat-table-last-row-border-width, var(--sys-nat-table-last-row-border-width, 0))}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{height:var(--nat-table-row-min-height, var(--sys-nat-table-row-min-height, auto));background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:end}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;inset-inline-start:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;inset-inline-start:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}.column-resize-handle:after,.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder),.header-cell.cdk-drag-animating,.data-cell{transition:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"]
		}]
	}],
	ctorParameters: () => [],
	propDecorators: {
		data: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "data",
				required: true
			}]
		}],
		columns: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "columns",
				required: true
			}]
		}],
		accessibleName: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "accessibleName",
				required: false
			}]
		}],
		caption: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "caption",
				required: false
			}]
		}],
		dataStatus: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "dataStatus",
				required: false
			}]
		}],
		error: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "error",
				required: false
			}]
		}],
		enableRowSelection: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableRowSelection",
				required: false
			}]
		}],
		selectionMode: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "selectionMode",
				required: false
			}]
		}],
		globalFilterFn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "globalFilterFn",
				required: false
			}]
		}],
		getRowId: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "getRowId",
				required: false
			}]
		}],
		emitRowRenderEvents: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "emitRowRenderEvents",
				required: false
			}]
		}],
		subHeaderColumn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderColumn",
				required: false
			}]
		}],
		subHeaderOrder: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderOrder",
				required: false
			}]
		}],
		enableSubHeaders: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableSubHeaders",
				required: false
			}]
		}],
		subHeaderLayout: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderLayout",
				required: false
			}]
		}],
		rowRendered: [{
			type: i0.Output,
			args: ["rowRendered"]
		}],
		rowActivate: [{
			type: i0.Output,
			args: ["rowActivate"]
		}],
		loadingTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }]
		}],
		emptyTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }]
		}],
		errorTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }]
		}],
		subHeaderTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }]
		}],
		rowPlaceholderTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableRowPlaceholderTemplate), { isSignal: true }]
		}],
		tableRegionRef: [{
			type: i0.ViewChild,
			args: ["tableRegion", { isSignal: true }]
		}]
	}
});
const NAT_LIST_ITEM_LAYOUT = {
	grid: "grid",
	flow: "flow"
};
var NatListFieldArea = class NatListFieldArea {
	natListFieldArea = input.required(...ngDevMode ? [{ debugName: "natListFieldArea" }] : /* istanbul ignore next */ []);
	natListFieldWidth = input(null, ...ngDevMode ? [{ debugName: "natListFieldWidth" }] : /* istanbul ignore next */ []);
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatListFieldArea,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatListFieldArea,
		isStandalone: true,
		selector: "[natListFieldArea]",
		inputs: {
			natListFieldArea: {
				classPropertyName: "natListFieldArea",
				publicName: "natListFieldArea",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			natListFieldWidth: {
				classPropertyName: "natListFieldWidth",
				publicName: "natListFieldWidth",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		host: { properties: {
			"style.grid-area": "natListFieldArea()",
			"style.--sys-nat-table-list-field-width": "natListFieldWidth()"
		} },
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatListFieldArea,
	decorators: [{
		type: Directive,
		args: [{
			selector: "[natListFieldArea]",
			host: {
				"[style.grid-area]": "natListFieldArea()",
				"[style.--sys-nat-table-list-field-width]": "natListFieldWidth()"
			}
		}]
	}],
	propDecorators: {
		natListFieldArea: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natListFieldArea",
				required: true
			}]
		}],
		natListFieldWidth: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natListFieldWidth",
				required: false
			}]
		}]
	}
});
const findRowCell = (row, columnId) => row._getAllCellsByColumnId()[columnId] ?? null;
const hasStaticLabel = (column) => {
	const { header, meta } = column.columnDef;
	return typeof header === "string" || !!meta?.label || !!meta?.hiddenHeaderLabel;
};
const isSrOnlyLabel = (column) => !!column.columnDef.meta?.hiddenHeaderLabel;
const escapeCssIdent = (value) => value.replaceAll(/[^\w-]/gu, (char) => `\\${char}`);
const resolveListFieldWidth = (columnId, visibleFieldCount) => `var(--nat-list-field-width-${escapeCssIdent(columnId)}, calc(100% / ${String(Math.max(visibleFieldCount, 1))}))`;
const LIST_STATE_VIEWS = {
	[NAT_TABLE_BODY_STATE.loading]: {
		className: "list-state list-state-loading",
		testId: "nat-list-loading-state"
	},
	[NAT_TABLE_BODY_STATE.empty]: {
		className: "list-state list-state-empty",
		testId: "nat-list-empty-state"
	},
	[NAT_TABLE_BODY_STATE.error]: {
		className: "list-state list-state-error",
		testId: "nat-list-error-state"
	}
};
const resolveListStateView = (bodyState, messages) => {
	if (bodyState === NAT_TABLE_BODY_STATE.rows) return null;
	return {
		...LIST_STATE_VIEWS[bodyState],
		state: bodyState,
		message: messages[bodyState]
	};
};
const buildListStateTemplateContext = (base, bodyState, error) => {
	if (bodyState === NAT_TABLE_BODY_STATE.error) return {
		...base,
		$implicit: error,
		status: NAT_TABLE_BODY_STATE.error,
		error
	};
	if (bodyState === NAT_TABLE_BODY_STATE.loading) return {
		...base,
		$implicit: NAT_TABLE_BODY_STATE.loading,
		status: NAT_TABLE_BODY_STATE.loading
	};
	return {
		...base,
		$implicit: NAT_TABLE_BODY_STATE.empty,
		status: NAT_TABLE_BODY_STATE.empty
	};
};
var NatList = class NatList {
	data = input.required(...ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []);
	columns = input.required(...ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []);
	accessibleName = input(void 0, ...ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []);
	dataStatus = input(NAT_TABLE_DATA_STATUS.success, ...ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []);
	error = input(null, ...ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []);
	globalFilterFn = input(...ngDevMode ? [void 0, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []);
	getRowId = input(...ngDevMode ? [void 0, { debugName: "getRowId" }] : /* istanbul ignore next */ []);
	enableRowSelection = input(false, {
		...ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	selectionMode = input("multiple", ...ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []);
	enableRowActivation = input(false, {
		...ngDevMode ? { debugName: "enableRowActivation" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	subHeaderColumn = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []);
	subHeaderOrder = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []);
	enableSubHeaders = input(true, {
		...ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	enableItemNavigation = input(false, {
		...ngDevMode ? { debugName: "enableItemNavigation" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	itemLayout = input(NAT_LIST_ITEM_LAYOUT.grid, ...ngDevMode ? [{ debugName: "itemLayout" }] : /* istanbul ignore next */ []);
	rowActivate = output();
	natTableService = requireNatTableService(inject(NatTableService, { optional: true }), "nat-list");
	state = inject(NatTableState);
	a11yService = inject(NatTableA11yService);
	destroyRef = inject(DestroyRef);
	enablePagination = this.state.enablePagination;
	enableGlobalFilter = this.state.enableGlobalFilter;
	table = this.state.table;
	tableElementId = this.state.tableElementId;
	tableScrollContainer = computed(() => this.listRegionRef()?.nativeElement ?? null, ...ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []);
	localeId = this.state.localeId;
	bodyRows = this.state.bodyRows;
	visibleColumns = this.state.visibleColumns;
	bodyState = this.state.bodyState;
	hasActivatableField = computed(() => this.visibleColumns().some((column) => column.columnDef.meta?.rowActivation !== false), ...ngDevMode ? [{ debugName: "hasActivatableField" }] : /* istanbul ignore next */ []);
	rendersActivator = computed(() => this.enableRowActivation() && this.hasActivatableField(), ...ngDevMode ? [{ debugName: "rendersActivator" }] : /* istanbul ignore next */ []);
	defaultItemAreas = computed(() => this.visibleColumns().map((column) => `'${column.id}'`).join(" "), ...ngDevMode ? [{ debugName: "defaultItemAreas" }] : /* istanbul ignore next */ []);
	isFlowLayout = computed(() => this.itemLayout() === NAT_LIST_ITEM_LAYOUT.flow, ...ngDevMode ? [{ debugName: "isFlowLayout" }] : /* istanbul ignore next */ []);
	flowFieldWidths = computed(() => {
		if (!this.isFlowLayout()) return null;
		const columns = this.visibleColumns();
		return new Map(columns.map((column) => [column.id, resolveListFieldWidth(column.id, columns.length)]));
	}, ...ngDevMode ? [{ debugName: "flowFieldWidths" }] : /* istanbul ignore next */ []);
	tableAriaBusy = this.state.tableAriaBusy;
	resolvedDirection = this.state.resolvedDirection;
	resolvedDescription = this.state.resolvedDescription;
	resolvedEmptyState = this.state.resolvedEmptyState;
	resolvedLoadingState = this.state.resolvedLoadingState;
	resolvedErrorState = this.state.resolvedErrorState;
	listSummaryId = this.state.tableSummaryId;
	tableDescriptionId = this.state.tableDescriptionId;
	tableKeyboardInstructionsId = this.state.tableKeyboardInstructionsId;
	resolvedListKeyboardInstructions = this.state.resolvedListKeyboardInstructions;
	listAriaLabel = this.state.tableAriaLabel;
	stateView = computed(() => resolveListStateView(this.bodyState(), {
		[NAT_TABLE_BODY_STATE.loading]: this.resolvedLoadingState(),
		[NAT_TABLE_BODY_STATE.empty]: this.resolvedEmptyState(),
		[NAT_TABLE_BODY_STATE.error]: this.resolvedErrorState()
	}), ...ngDevMode ? [{ debugName: "stateView" }] : /* istanbul ignore next */ []);
	loadingTemplate = contentChild(NatTableLoadingTemplate, ...ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []);
	emptyTemplate = contentChild(NatTableEmptyTemplate, ...ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []);
	errorTemplate = contentChild(NatTableErrorTemplate, ...ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []);
	subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, ...ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []);
	subHeaderGroups = this.state.subHeaderGroups;
	subHeaderTemplateRef = computed(() => {
		const templateRef = this.subHeaderTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []);
	getSubHeaderContext(group) {
		return this.state.getSubHeaderTemplateContext(group);
	}
	getSubHeaderAriaText(group) {
		return this.state.getSubHeaderAnnouncement(group, "list");
	}
	stateTemplateView = computed(() => {
		const bodyState = this.bodyState();
		if (bodyState === NAT_TABLE_BODY_STATE.rows) return null;
		const templateRef = {
			[NAT_TABLE_BODY_STATE.loading]: this.loadingTemplate()?.templateRef,
			[NAT_TABLE_BODY_STATE.empty]: this.emptyTemplate()?.templateRef,
			[NAT_TABLE_BODY_STATE.error]: this.errorTemplate()?.templateRef
		}[bodyState];
		return templateRef ? {
			templateRef,
			context: buildListStateTemplateContext(this.state.getStateTemplateBaseContext(), bodyState, this.error())
		} : null;
	}, ...ngDevMode ? [{ debugName: "stateTemplateView" }] : /* istanbul ignore next */ []);
	listSummary = this.a11yService.listSummary;
	liveMessage = this.a11yService.liveMessage;
	ariaDescribedBy = computed(() => {
		const ids = [];
		if (this.listSummary().trim()) ids.push(this.listSummaryId());
		if (this.resolvedDescription().trim()) ids.push(this.tableDescriptionId());
		if (this.enableItemNavigation() && this.resolvedListKeyboardInstructions().trim()) ids.push(this.tableKeyboardInstructionsId());
		return ids.length ? ids.join(" ") : null;
	}, ...ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []);
	listRegionRef = viewChild("listRegion", ...ngDevMode ? [{ debugName: "listRegionRef" }] : /* istanbul ignore next */ []);
	resolveColumnLabel = resolveColumnLabel;
	cellForColumn = findRowCell;
	fieldWidth(columnId) {
		return this.flowFieldWidths()?.get(columnId) ?? null;
	}
	hasStaticLabel = hasStaticLabel;
	isSrOnlyLabel = isSrOnlyLabel;
	rowSelectedAttribute(row) {
		return this.enableRowSelection() ? String(row.getIsSelected()) : null;
	}
	rowAriaSelected(row) {
		return this.enableRowSelection() ? row.getIsSelected() : null;
	}
	leafHeaderContexts = computed(() => {
		const leafHeaders = this.state.headerGroups().at(-1)?.headers ?? [];
		return new Map(leafHeaders.filter((header) => !header.isPlaceholder).map((header) => [header.column.id, header.getContext()]));
	}, ...ngDevMode ? [{ debugName: "leafHeaderContexts" }] : /* istanbul ignore next */ []);
	constructor() {
		inject(NatTableCellControlManager).startCellControlPreparation();
		this.natTableService.setController(this);
		this.a11yService.setRenderer("list");
		this.a11yService.registerListEffects();
		effect(() => this.state.data.set(this.data()));
		effect(() => this.state.columnDefs.set(this.columns()));
		effect(() => this.state.dataStatus.set(this.dataStatus()));
		effect(() => this.state.error.set(this.error()));
		effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
		effect(() => this.state.getRowId.set(this.getRowId()));
		effect(() => this.state.accessibleName.set(this.accessibleName()));
		effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
		effect(() => this.state.selectionMode.set(this.selectionMode()));
		effect(() => this.state.subHeaderColumn.set(this.subHeaderColumn()));
		effect(() => this.state.subHeaderOrder.set(this.subHeaderOrder()));
		effect(() => this.state.enableSubHeaders.set(this.enableSubHeaders()));
		effect(() => this.state.tableRegionRef.set(this.listRegionRef()));
		this.state.registerSeedEffect();
		this.state.registerSubHeaderValidationEffect();
		this.state.registerLocaleValidationEffect();
		this.destroyRef.onDestroy(() => {
			this.natTableService.clearController(this);
		});
	}
	activatorLabelId(index) {
		return `${this.tableElementId()}-item-${index}-label`;
	}
	onActivatorClick(event, row) {
		if (event.defaultPrevented || event.button !== 0) return;
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	onActivatorKeydown(event, row) {
		if (event.defaultPrevented || !this.natTableService.keyboard().rowActivate(event)) return;
		event.preventDefault();
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	onItemClick(event, row) {
		if (event.button !== 0 || event.defaultPrevented || !this.hasActivatableField()) return;
		if (originatesFromInteractiveDescendant(event)) return;
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	onItemKeydown(event, row) {
		if (event.defaultPrevented || !this.hasActivatableField()) return;
		if (!this.natTableService.keyboard().rowActivate(event)) return;
		if (originatesFromInteractiveDescendant(event)) return;
		if (isSpaceShortcutKey(event.key)) event.preventDefault();
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	patchState(updaters) {
		this.state.patchState(updaters);
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatList,
		deps: [],
		target: i0.ɵɵFactoryTarget.Component
	});
	static ɵcmp = i0.ɵɵngDeclareComponent({
		minVersion: "17.0.0",
		version: "22.2.1",
		type: NatList,
		isStandalone: true,
		selector: "nat-list",
		inputs: {
			data: {
				classPropertyName: "data",
				publicName: "data",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			columns: {
				classPropertyName: "columns",
				publicName: "columns",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			accessibleName: {
				classPropertyName: "accessibleName",
				publicName: "accessibleName",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			dataStatus: {
				classPropertyName: "dataStatus",
				publicName: "dataStatus",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			error: {
				classPropertyName: "error",
				publicName: "error",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			globalFilterFn: {
				classPropertyName: "globalFilterFn",
				publicName: "globalFilterFn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			getRowId: {
				classPropertyName: "getRowId",
				publicName: "getRowId",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableRowSelection: {
				classPropertyName: "enableRowSelection",
				publicName: "enableRowSelection",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			selectionMode: {
				classPropertyName: "selectionMode",
				publicName: "selectionMode",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableRowActivation: {
				classPropertyName: "enableRowActivation",
				publicName: "enableRowActivation",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderColumn: {
				classPropertyName: "subHeaderColumn",
				publicName: "subHeaderColumn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderOrder: {
				classPropertyName: "subHeaderOrder",
				publicName: "subHeaderOrder",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableSubHeaders: {
				classPropertyName: "enableSubHeaders",
				publicName: "enableSubHeaders",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableItemNavigation: {
				classPropertyName: "enableItemNavigation",
				publicName: "enableItemNavigation",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			itemLayout: {
				classPropertyName: "itemLayout",
				publicName: "itemLayout",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		outputs: { rowActivate: "rowActivate" },
		host: { properties: {
			"attr.data-item-layout": "itemLayout()",
			"style.--sys-nat-table-list-item-areas": "defaultItemAreas()"
		} },
		providers: [
			NatTableState,
			NatTableA11yService,
			NatTableCellControlManager
		],
		queries: [
			{
				propertyName: "loadingTemplate",
				first: true,
				predicate: NatTableLoadingTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "emptyTemplate",
				first: true,
				predicate: NatTableEmptyTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "errorTemplate",
				first: true,
				predicate: NatTableErrorTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "subHeaderTemplate",
				first: true,
				predicate: NatTableSubHeaderTemplate,
				descendants: true,
				isSignal: true
			}
		],
		viewQueries: [{
			propertyName: "listRegionRef",
			first: true,
			predicate: ["listRegion"],
			descendants: true,
			isSignal: true
		}],
		exportAs: ["natList"],
		ngImport: i0,
		template: "<!-- eslint-disable max-lines -- single cohesive list template (shared field/sub-header/state templates + the plain and composite ul branches); splitting into partials would fragment the renderer switch. -->\n<div #listRegion class=\"list-region\" data-testid=\"nat-list-region\">\n  @if (listSummary().trim()) {\n    <p [id]=\"listSummaryId()\" class=\"sr-only\">{{ listSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (enableItemNavigation() && resolvedListKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedListKeyboardInstructions() }}</p>\n  }\n\n  <!-- One item's fields, shared by the plain and composite branches. The\n       activator label id only exists while the plain branch renders the\n       stretched activator button (`withActivator`); the composite branch has\n       no activator to name. -->\n  <ng-template\n    #itemFields\n    let-headerContexts=\"headerContexts\"\n    let-itemIndex=\"itemIndex\"\n    let-listColumns=\"listColumns\"\n    let-row=\"row\"\n    let-withActivator=\"withActivator\">\n    <!-- The fields' own layout box (grid areas, or wrapping flow slots), kept\n         separate from the item so the item's padding, border, and the\n         stretched activator stay out of the layout maths. -->\n    <div class=\"list-item-fields\">\n      @for (column of listColumns; track column.id) {\n        @let cell = cellForColumn(row, column.id);\n        @if (cell) {\n          <div\n            [attr.data-column-id]=\"column.id\"\n            [attr.data-nat-row-activation]=\"column.columnDef.meta?.rowActivation === false ? 'false' : null\"\n            [attr.id]=\"withActivator && $first ? activatorLabelId(itemIndex) : null\"\n            [natListFieldArea]=\"column.id\"\n            [natListFieldWidth]=\"fieldWidth(column.id)\"\n            class=\"list-field\"\n            data-testid=\"nat-list-field\">\n            <span [class.sr-only]=\"isSrOnlyLabel(column)\" class=\"list-field-label\" data-testid=\"nat-list-field-label\">\n              @let headerDef = column.columnDef.header;\n              @let headerContext = headerContexts.get(column.id);\n              @if (!hasStaticLabel(column) && headerDef && headerContext) {\n                <ng-container *flexRender=\"headerDef; props: headerContext; let renderedLabel\">\n                  {{ renderedLabel }}\n                </ng-container>\n              } @else {\n                {{ resolveColumnLabel(column) }}\n              }\n            </span>\n            <span [class.list-field-value--fill]=\"isSrOnlyLabel(column)\" class=\"list-field-value\" data-testid=\"nat-list-field-value\">\n              <ng-container *flexRender=\"cell.column.columnDef.cell; props: cell.getContext(); let rendered\">\n                @if (isFlowLayout() && isSrOnlyLabel(column)) {\n                  <!-- A real flex item lets oversized plain text shrink too. -->\n                  <span data-testid=\"nat-list-field-text\">{{ rendered }}</span>\n                } @else {\n                  {{ rendered }}\n                }\n              </ng-container>\n            </span>\n          </div>\n        }\n      }\n    </div>\n  </ng-template>\n\n  <!-- One group's sub-header content (sr-only announcement + template or value),\n       shared by both branches. -->\n  <ng-template #subHeaderContent let-subHeader=\"subHeader\">\n    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n      <span class=\"sr-only\">{{ ariaText }}</span>\n    }\n    @if (subHeaderTemplateRef(); as templateRef) {\n      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-sub-header-value\">{{ subHeader.value }}</span>\n    }\n  </ng-template>\n\n  <!-- Loading/empty/error item content, shared by both branches. -->\n  <ng-template #stateItemContent let-state=\"state\">\n    @if (stateTemplateView(); as stateTemplate) {\n      <ng-container [ngTemplateOutlet]=\"stateTemplate.templateRef\" [ngTemplateOutletContext]=\"stateTemplate.context\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-state-indicator\"></span>\n      <span class=\"list-state-message\">{{ state.message }}</span>\n    }\n  </ng-template>\n\n  @if (enableItemNavigation()) {\n    <!-- Composite item navigation: the APG layout-grid pattern shared with\n         NatTable. One tab stop for the whole list, roving focus between items\n         via `@angular/aria`'s grid, one gridcell per item, and the\n         cell-interaction model (Enter/Tab/Escape) for controls inside items.\n         The `<ul>` keeps HTML validity (ul only permits li children), while\n         `role=\"grid\"`/`role=\"row\"`/`role=\"gridcell\"` replace list semantics. -->\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      colWrap=\"nowrap\"\n      data-testid=\"nat-list\"\n      ngGrid\n      rowWrap=\"nowrap\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <!-- Sub-headers join the grid as rows with one gridcell, exactly\n                   like the table's sub-header rows, so arrow navigation passes\n                   through them instead of skipping the group boundary. -->\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\" ngGridRow>\n                <div class=\"list-sub-header-content\" natTableCell ngGridCell>\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <!-- Activation handlers sit on the row, not the gridcell: the\n                 cell-interaction model on the cell handles Enter/Tab/Escape\n                 first and stops propagation when it does, so only unhandled\n                 events reach the row — same layering as the table. -->\n            <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- focus lives on the roving gridcell child; the row only receives bubbled events, mirroring the table's tr handlers. -->\n            <li\n              [attr.aria-selected]=\"rowAriaSelected(row)\"\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"list-row\"\n              data-testid=\"nat-list-item\"\n              ngGridRow\n              (click)=\"onItemClick($event, row)\"\n              (keydown)=\"onItemKeydown($event, row)\">\n              <div [class.list-item--flow]=\"isFlowLayout()\" class=\"list-item\" data-testid=\"nat-list-item-cell\" natTableCell ngGridCell>\n                <ng-container\n                  [ngTemplateOutlet]=\"itemFields\"\n                  [ngTemplateOutletContext]=\"{ row, itemIndex: $index, listColumns, headerContexts, withActivator: false }\" />\n              </div>\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li class=\"list-row\" ngGridRow>\n              <div [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\" ngGridCell>\n                <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n              </div>\n            </li>\n          }\n        }\n      }\n    </ul>\n  } @else {\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      data-testid=\"nat-list\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          <!-- Iterate the reactive visibleColumns() signal (not row.getVisibleCells())\n               so column order and visibility changes re-render the fields. -->\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\">\n                <div class=\"list-sub-header-content\">\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <li\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              [class.is-activatable]=\"rendersActivator()\"\n              [class.list-item--flow]=\"isFlowLayout()\"\n              class=\"list-item\"\n              data-testid=\"nat-list-item\">\n              @if (rendersActivator()) {\n                <!-- A real button, so the activation affordance has an interactive\n                     role (WCAG 4.1.2) — a focusable listitem announces as plain\n                     text. A stretched sibling rather than a wrapper: nesting the\n                     fields (and e.g. a selection checkbox) inside a button would\n                     be invalid HTML and can hide the nested controls from\n                     assistive technology. Interactive descendants stack above it\n                     in CSS, which replaces the old event-origin guard. Named by\n                     the item's FIRST visible field (label + value), so screen\n                     readers get a concise name instead of re-hearing the whole\n                     item; the id is index-keyed because row ids are consumer\n                     input and may contain characters invalid in an id list.\n                     Trade-off, documented in the docs topic: the stretched\n                     overlay owns mousedown, so field text cannot be mouse-\n                     selected while activation is enabled. -->\n                <!-- eslint-disable-next-line @angular-eslint/template/elements-content -- named via aria-labelledby from the item's first field; visible content would duplicate it. -->\n                <button\n                  [attr.aria-labelledby]=\"activatorLabelId($index)\"\n                  class=\"list-item-activator\"\n                  data-testid=\"nat-list-item-activator\"\n                  type=\"button\"\n                  (click)=\"onActivatorClick($event, row)\"\n                  (keydown)=\"onActivatorKeydown($event, row)\"></button>\n              }\n              <ng-container\n                [ngTemplateOutlet]=\"itemFields\"\n                [ngTemplateOutletContext]=\"{\n                  row,\n                  itemIndex: $index,\n                  listColumns,\n                  headerContexts,\n                  withActivator: rendersActivator()\n                }\" />\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\">\n              <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n            </li>\n          }\n        }\n      }\n    </ul>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-list-live-region\">{{ liveMessage() }}</p>\n</div>\n",
		styles: [".list-region{position:relative}.nat-list{display:flex;flex-direction:column;gap:var(--nat-list-gap, var(--sys-nat-table-list-gap, .5rem));padding:0;margin:0;list-style:none}.list-sub-header{display:flex;align-items:center;font-weight:var(--nat-list-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-list-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));background:var(--nat-list-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-list-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-list-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.list-sub-header-content{position:relative;padding:var(--nat-list-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 0))}.list-item{position:relative;padding:var(--nat-list-item-padding, var(--sys-nat-table-list-item-padding, .75rem 1rem));background:var(--nat-list-item-background, var(--sys-nat-table-list-item-background, transparent));border-color:var( --nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent)) );border-style:solid;border-width:var(--nat-list-item-border-width, var(--sys-nat-table-list-item-border-width, 1px));border-radius:var(--nat-list-item-radius, var(--sys-nat-table-list-item-radius, 8px))}.list-item-fields{display:grid;grid-template-areas:var(--nat-list-item-areas, var(--sys-nat-table-list-item-areas, none));grid-template-columns:var(--nat-list-item-columns, var(--sys-nat-table-list-item-columns, 1fr));gap:var(--nat-list-item-gap, var(--sys-nat-table-list-item-gap, .25rem))}.list-item--flow>.list-item-fields{--sys-nat-table-list-flow-gutter: calc(var(--nat-list-flow-column-gap, var(--sys-nat-table-list-flow-column-gap, 1rem)) / 2);display:flex;flex-wrap:wrap;column-gap:0;margin-inline:calc(-1 * var(--sys-nat-table-list-flow-gutter))}.list-item--flow>.list-item-fields>.list-field{box-sizing:border-box;flex:0 0 auto;flex-basis:var(--sys-nat-table-list-field-width, auto);min-width:auto;max-width:100%;padding-inline:var(--sys-nat-table-list-flow-gutter)}.list-item--flow>.list-item-fields>.list-field>.list-field-value{max-width:100%;overflow-wrap:break-word}.list-item--flow>.list-item-fields>.list-field>.list-field-value--fill ::ng-deep>*{min-width:0;max-width:100%}.nat-list>.list-item:last-child,.nat-list>.list-row:last-child>.list-item{border-bottom-color:var( --nat-list-last-item-border-color, var( --sys-nat-table-list-last-item-border-color, var(--nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent))) ) );border-bottom-width:var(--nat-list-last-item-border-width, var(--sys-nat-table-list-last-item-border-width, 0))}.list-item-activator{position:absolute;inset:0;padding:0;appearance:none;cursor:pointer;background:none;border:0;border-radius:inherit}.list-item-activator:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentcolor));outline-offset:-2px}.list-item.is-activatable .list-field :is(a[href],button,input,select,textarea,summary,[contenteditable=true],[role=button],[role=link],[role=checkbox],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=tab],[role=switch],[role=combobox],[role=textbox],[role=searchbox],label,[tabindex]){position:relative;z-index:1}.list-item.is-activatable .list-field[data-nat-row-activation=false]{position:relative;z-index:1}.list-item[data-selected=true],.list-row[data-selected=true]>.list-item{background:var(--nat-list-item-background-selected, var(--sys-nat-table-list-item-background-selected, transparent))}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.list-field{display:flex;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));min-width:0}.list-field-value{min-width:0;overflow-wrap:anywhere}.list-field-value--fill{display:flex;flex:1;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));width:100%;height:100%}.list-field-label{font-size:var(--nat-list-label-font-size, var(--sys-nat-table-list-label-font-size, 14px));font-weight:var(--nat-list-label-font-weight, var(--sys-nat-table-list-label-font-weight, 400));color:var(--nat-list-label-color, var(--sys-nat-table-list-label-color, currentColor))}.list-state{display:flex;gap:var(--nat-list-state-gap, var(--sys-nat-table-list-state-gap, .625rem));align-items:center;justify-content:var(--nat-list-state-justify, var(--sys-nat-table-list-state-justify, flex-start));min-height:var(--nat-list-state-min-height, var(--sys-nat-table-list-state-min-height, auto));padding:var(--nat-list-state-padding, var(--sys-nat-table-list-state-padding, 1.25rem 1rem));color:var(--nat-list-state-color, var(--sys-nat-table-list-state-color, inherit));background:var(--nat-list-state-background, var(--sys-nat-table-list-state-background, transparent));border:1px var(--nat-list-state-border-style, var(--sys-nat-table-list-state-border-style, dashed)) var(--nat-list-state-border-color, var(--sys-nat-table-list-state-border-color, color-mix(in srgb, currentcolor 20%, transparent)));border-radius:var(--nat-list-state-radius, var(--sys-nat-table-list-state-radius, 8px))}.list-state-indicator{flex:none;width:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));height:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));border-radius:999px}.list-state-message{min-width:0;overflow-wrap:anywhere}.list-state-loading .list-state-indicator{background:var(--nat-list-loading-accent, var(--sys-nat-table-list-loading-accent, var(--nat-table-color-accent, currentcolor)));animation:nat-list-state-pulse 1.2s ease-in-out infinite}.list-state-empty .list-state-indicator{border:1px solid var(--nat-list-empty-accent, var(--sys-nat-table-list-empty-accent, var(--nat-table-color-text-muted, currentcolor)))}.list-state-error{color:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, inherit)))}.list-state-error .list-state-indicator{background:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, currentcolor)))}@keyframes nat-list-state-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}@media(prefers-reduced-motion:reduce){.list-state-loading .list-state-indicator{animation:none}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"],
		dependencies: [
			{
				kind: "directive",
				type: FlexRender,
				selector: "[flexRender]",
				inputs: [
					"flexRender",
					"flexRenderProps",
					"flexRenderInjector"
				]
			},
			{
				kind: "directive",
				type: Grid,
				selector: "[ngGrid]",
				inputs: [
					"enableSelection",
					"disabled",
					"softDisabled",
					"focusMode",
					"rowWrap",
					"colWrap",
					"multi",
					"selectionMode",
					"tabindex"
				],
				exportAs: ["ngGrid"]
			},
			{
				kind: "directive",
				type: GridCell,
				selector: "[ngGridCell]",
				inputs: [
					"id",
					"role",
					"rowSpan",
					"colSpan",
					"rowIndex",
					"colIndex",
					"disabled",
					"selected",
					"selectable",
					"tabindex"
				],
				outputs: ["selectedChange"],
				exportAs: ["ngGridCell"]
			},
			{
				kind: "directive",
				type: GridRow,
				selector: "[ngGridRow]",
				inputs: ["rowIndex"],
				exportAs: ["ngGridRow"]
			},
			{
				kind: "directive",
				type: NatListFieldArea,
				selector: "[natListFieldArea]",
				inputs: ["natListFieldArea", "natListFieldWidth"]
			},
			{
				kind: "directive",
				type: NatTableCell,
				selector: "[natTableCell]"
			},
			{
				kind: "directive",
				type: NgTemplateOutlet,
				selector: "[ngTemplateOutlet]",
				inputs: [
					"ngTemplateOutletContext",
					"ngTemplateOutlet",
					"ngTemplateOutletInjector"
				]
			}
		]
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatList,
	decorators: [{
		type: Component,
		args: [{
			selector: "nat-list",
			exportAs: "natList",
			host: {
				"[attr.data-item-layout]": "itemLayout()",
				"[style.--sys-nat-table-list-item-areas]": "defaultItemAreas()"
			},
			imports: [
				FlexRender,
				Grid,
				GridCell,
				GridRow,
				NatListFieldArea,
				NatTableCell,
				NgTemplateOutlet
			],
			providers: [
				NatTableState,
				NatTableA11yService,
				NatTableCellControlManager
			],
			template: "<!-- eslint-disable max-lines -- single cohesive list template (shared field/sub-header/state templates + the plain and composite ul branches); splitting into partials would fragment the renderer switch. -->\n<div #listRegion class=\"list-region\" data-testid=\"nat-list-region\">\n  @if (listSummary().trim()) {\n    <p [id]=\"listSummaryId()\" class=\"sr-only\">{{ listSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (enableItemNavigation() && resolvedListKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedListKeyboardInstructions() }}</p>\n  }\n\n  <!-- One item's fields, shared by the plain and composite branches. The\n       activator label id only exists while the plain branch renders the\n       stretched activator button (`withActivator`); the composite branch has\n       no activator to name. -->\n  <ng-template\n    #itemFields\n    let-headerContexts=\"headerContexts\"\n    let-itemIndex=\"itemIndex\"\n    let-listColumns=\"listColumns\"\n    let-row=\"row\"\n    let-withActivator=\"withActivator\">\n    <!-- The fields' own layout box (grid areas, or wrapping flow slots), kept\n         separate from the item so the item's padding, border, and the\n         stretched activator stay out of the layout maths. -->\n    <div class=\"list-item-fields\">\n      @for (column of listColumns; track column.id) {\n        @let cell = cellForColumn(row, column.id);\n        @if (cell) {\n          <div\n            [attr.data-column-id]=\"column.id\"\n            [attr.data-nat-row-activation]=\"column.columnDef.meta?.rowActivation === false ? 'false' : null\"\n            [attr.id]=\"withActivator && $first ? activatorLabelId(itemIndex) : null\"\n            [natListFieldArea]=\"column.id\"\n            [natListFieldWidth]=\"fieldWidth(column.id)\"\n            class=\"list-field\"\n            data-testid=\"nat-list-field\">\n            <span [class.sr-only]=\"isSrOnlyLabel(column)\" class=\"list-field-label\" data-testid=\"nat-list-field-label\">\n              @let headerDef = column.columnDef.header;\n              @let headerContext = headerContexts.get(column.id);\n              @if (!hasStaticLabel(column) && headerDef && headerContext) {\n                <ng-container *flexRender=\"headerDef; props: headerContext; let renderedLabel\">\n                  {{ renderedLabel }}\n                </ng-container>\n              } @else {\n                {{ resolveColumnLabel(column) }}\n              }\n            </span>\n            <span [class.list-field-value--fill]=\"isSrOnlyLabel(column)\" class=\"list-field-value\" data-testid=\"nat-list-field-value\">\n              <ng-container *flexRender=\"cell.column.columnDef.cell; props: cell.getContext(); let rendered\">\n                @if (isFlowLayout() && isSrOnlyLabel(column)) {\n                  <!-- A real flex item lets oversized plain text shrink too. -->\n                  <span data-testid=\"nat-list-field-text\">{{ rendered }}</span>\n                } @else {\n                  {{ rendered }}\n                }\n              </ng-container>\n            </span>\n          </div>\n        }\n      }\n    </div>\n  </ng-template>\n\n  <!-- One group's sub-header content (sr-only announcement + template or value),\n       shared by both branches. -->\n  <ng-template #subHeaderContent let-subHeader=\"subHeader\">\n    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n      <span class=\"sr-only\">{{ ariaText }}</span>\n    }\n    @if (subHeaderTemplateRef(); as templateRef) {\n      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-sub-header-value\">{{ subHeader.value }}</span>\n    }\n  </ng-template>\n\n  <!-- Loading/empty/error item content, shared by both branches. -->\n  <ng-template #stateItemContent let-state=\"state\">\n    @if (stateTemplateView(); as stateTemplate) {\n      <ng-container [ngTemplateOutlet]=\"stateTemplate.templateRef\" [ngTemplateOutletContext]=\"stateTemplate.context\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-state-indicator\"></span>\n      <span class=\"list-state-message\">{{ state.message }}</span>\n    }\n  </ng-template>\n\n  @if (enableItemNavigation()) {\n    <!-- Composite item navigation: the APG layout-grid pattern shared with\n         NatTable. One tab stop for the whole list, roving focus between items\n         via `@angular/aria`'s grid, one gridcell per item, and the\n         cell-interaction model (Enter/Tab/Escape) for controls inside items.\n         The `<ul>` keeps HTML validity (ul only permits li children), while\n         `role=\"grid\"`/`role=\"row\"`/`role=\"gridcell\"` replace list semantics. -->\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      colWrap=\"nowrap\"\n      data-testid=\"nat-list\"\n      ngGrid\n      rowWrap=\"nowrap\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <!-- Sub-headers join the grid as rows with one gridcell, exactly\n                   like the table's sub-header rows, so arrow navigation passes\n                   through them instead of skipping the group boundary. -->\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\" ngGridRow>\n                <div class=\"list-sub-header-content\" natTableCell ngGridCell>\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <!-- Activation handlers sit on the row, not the gridcell: the\n                 cell-interaction model on the cell handles Enter/Tab/Escape\n                 first and stops propagation when it does, so only unhandled\n                 events reach the row — same layering as the table. -->\n            <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- focus lives on the roving gridcell child; the row only receives bubbled events, mirroring the table's tr handlers. -->\n            <li\n              [attr.aria-selected]=\"rowAriaSelected(row)\"\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"list-row\"\n              data-testid=\"nat-list-item\"\n              ngGridRow\n              (click)=\"onItemClick($event, row)\"\n              (keydown)=\"onItemKeydown($event, row)\">\n              <div [class.list-item--flow]=\"isFlowLayout()\" class=\"list-item\" data-testid=\"nat-list-item-cell\" natTableCell ngGridCell>\n                <ng-container\n                  [ngTemplateOutlet]=\"itemFields\"\n                  [ngTemplateOutletContext]=\"{ row, itemIndex: $index, listColumns, headerContexts, withActivator: false }\" />\n              </div>\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li class=\"list-row\" ngGridRow>\n              <div [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\" ngGridCell>\n                <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n              </div>\n            </li>\n          }\n        }\n      }\n    </ul>\n  } @else {\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      data-testid=\"nat-list\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          <!-- Iterate the reactive visibleColumns() signal (not row.getVisibleCells())\n               so column order and visibility changes re-render the fields. -->\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\">\n                <div class=\"list-sub-header-content\">\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <li\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              [class.is-activatable]=\"rendersActivator()\"\n              [class.list-item--flow]=\"isFlowLayout()\"\n              class=\"list-item\"\n              data-testid=\"nat-list-item\">\n              @if (rendersActivator()) {\n                <!-- A real button, so the activation affordance has an interactive\n                     role (WCAG 4.1.2) — a focusable listitem announces as plain\n                     text. A stretched sibling rather than a wrapper: nesting the\n                     fields (and e.g. a selection checkbox) inside a button would\n                     be invalid HTML and can hide the nested controls from\n                     assistive technology. Interactive descendants stack above it\n                     in CSS, which replaces the old event-origin guard. Named by\n                     the item's FIRST visible field (label + value), so screen\n                     readers get a concise name instead of re-hearing the whole\n                     item; the id is index-keyed because row ids are consumer\n                     input and may contain characters invalid in an id list.\n                     Trade-off, documented in the docs topic: the stretched\n                     overlay owns mousedown, so field text cannot be mouse-\n                     selected while activation is enabled. -->\n                <!-- eslint-disable-next-line @angular-eslint/template/elements-content -- named via aria-labelledby from the item's first field; visible content would duplicate it. -->\n                <button\n                  [attr.aria-labelledby]=\"activatorLabelId($index)\"\n                  class=\"list-item-activator\"\n                  data-testid=\"nat-list-item-activator\"\n                  type=\"button\"\n                  (click)=\"onActivatorClick($event, row)\"\n                  (keydown)=\"onActivatorKeydown($event, row)\"></button>\n              }\n              <ng-container\n                [ngTemplateOutlet]=\"itemFields\"\n                [ngTemplateOutletContext]=\"{\n                  row,\n                  itemIndex: $index,\n                  listColumns,\n                  headerContexts,\n                  withActivator: rendersActivator()\n                }\" />\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\">\n              <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n            </li>\n          }\n        }\n      }\n    </ul>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-list-live-region\">{{ liveMessage() }}</p>\n</div>\n",
			styles: [".list-region{position:relative}.nat-list{display:flex;flex-direction:column;gap:var(--nat-list-gap, var(--sys-nat-table-list-gap, .5rem));padding:0;margin:0;list-style:none}.list-sub-header{display:flex;align-items:center;font-weight:var(--nat-list-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-list-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));background:var(--nat-list-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-list-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-list-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.list-sub-header-content{position:relative;padding:var(--nat-list-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 0))}.list-item{position:relative;padding:var(--nat-list-item-padding, var(--sys-nat-table-list-item-padding, .75rem 1rem));background:var(--nat-list-item-background, var(--sys-nat-table-list-item-background, transparent));border-color:var( --nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent)) );border-style:solid;border-width:var(--nat-list-item-border-width, var(--sys-nat-table-list-item-border-width, 1px));border-radius:var(--nat-list-item-radius, var(--sys-nat-table-list-item-radius, 8px))}.list-item-fields{display:grid;grid-template-areas:var(--nat-list-item-areas, var(--sys-nat-table-list-item-areas, none));grid-template-columns:var(--nat-list-item-columns, var(--sys-nat-table-list-item-columns, 1fr));gap:var(--nat-list-item-gap, var(--sys-nat-table-list-item-gap, .25rem))}.list-item--flow>.list-item-fields{--sys-nat-table-list-flow-gutter: calc(var(--nat-list-flow-column-gap, var(--sys-nat-table-list-flow-column-gap, 1rem)) / 2);display:flex;flex-wrap:wrap;column-gap:0;margin-inline:calc(-1 * var(--sys-nat-table-list-flow-gutter))}.list-item--flow>.list-item-fields>.list-field{box-sizing:border-box;flex:0 0 auto;flex-basis:var(--sys-nat-table-list-field-width, auto);min-width:auto;max-width:100%;padding-inline:var(--sys-nat-table-list-flow-gutter)}.list-item--flow>.list-item-fields>.list-field>.list-field-value{max-width:100%;overflow-wrap:break-word}.list-item--flow>.list-item-fields>.list-field>.list-field-value--fill ::ng-deep>*{min-width:0;max-width:100%}.nat-list>.list-item:last-child,.nat-list>.list-row:last-child>.list-item{border-bottom-color:var( --nat-list-last-item-border-color, var( --sys-nat-table-list-last-item-border-color, var(--nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent))) ) );border-bottom-width:var(--nat-list-last-item-border-width, var(--sys-nat-table-list-last-item-border-width, 0))}.list-item-activator{position:absolute;inset:0;padding:0;appearance:none;cursor:pointer;background:none;border:0;border-radius:inherit}.list-item-activator:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentcolor));outline-offset:-2px}.list-item.is-activatable .list-field :is(a[href],button,input,select,textarea,summary,[contenteditable=true],[role=button],[role=link],[role=checkbox],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=tab],[role=switch],[role=combobox],[role=textbox],[role=searchbox],label,[tabindex]){position:relative;z-index:1}.list-item.is-activatable .list-field[data-nat-row-activation=false]{position:relative;z-index:1}.list-item[data-selected=true],.list-row[data-selected=true]>.list-item{background:var(--nat-list-item-background-selected, var(--sys-nat-table-list-item-background-selected, transparent))}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.list-field{display:flex;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));min-width:0}.list-field-value{min-width:0;overflow-wrap:anywhere}.list-field-value--fill{display:flex;flex:1;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));width:100%;height:100%}.list-field-label{font-size:var(--nat-list-label-font-size, var(--sys-nat-table-list-label-font-size, 14px));font-weight:var(--nat-list-label-font-weight, var(--sys-nat-table-list-label-font-weight, 400));color:var(--nat-list-label-color, var(--sys-nat-table-list-label-color, currentColor))}.list-state{display:flex;gap:var(--nat-list-state-gap, var(--sys-nat-table-list-state-gap, .625rem));align-items:center;justify-content:var(--nat-list-state-justify, var(--sys-nat-table-list-state-justify, flex-start));min-height:var(--nat-list-state-min-height, var(--sys-nat-table-list-state-min-height, auto));padding:var(--nat-list-state-padding, var(--sys-nat-table-list-state-padding, 1.25rem 1rem));color:var(--nat-list-state-color, var(--sys-nat-table-list-state-color, inherit));background:var(--nat-list-state-background, var(--sys-nat-table-list-state-background, transparent));border:1px var(--nat-list-state-border-style, var(--sys-nat-table-list-state-border-style, dashed)) var(--nat-list-state-border-color, var(--sys-nat-table-list-state-border-color, color-mix(in srgb, currentcolor 20%, transparent)));border-radius:var(--nat-list-state-radius, var(--sys-nat-table-list-state-radius, 8px))}.list-state-indicator{flex:none;width:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));height:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));border-radius:999px}.list-state-message{min-width:0;overflow-wrap:anywhere}.list-state-loading .list-state-indicator{background:var(--nat-list-loading-accent, var(--sys-nat-table-list-loading-accent, var(--nat-table-color-accent, currentcolor)));animation:nat-list-state-pulse 1.2s ease-in-out infinite}.list-state-empty .list-state-indicator{border:1px solid var(--nat-list-empty-accent, var(--sys-nat-table-list-empty-accent, var(--nat-table-color-text-muted, currentcolor)))}.list-state-error{color:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, inherit)))}.list-state-error .list-state-indicator{background:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, currentcolor)))}@keyframes nat-list-state-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}@media(prefers-reduced-motion:reduce){.list-state-loading .list-state-indicator{animation:none}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"]
		}]
	}],
	ctorParameters: () => [],
	propDecorators: {
		data: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "data",
				required: true
			}]
		}],
		columns: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "columns",
				required: true
			}]
		}],
		accessibleName: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "accessibleName",
				required: false
			}]
		}],
		dataStatus: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "dataStatus",
				required: false
			}]
		}],
		error: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "error",
				required: false
			}]
		}],
		globalFilterFn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "globalFilterFn",
				required: false
			}]
		}],
		getRowId: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "getRowId",
				required: false
			}]
		}],
		enableRowSelection: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableRowSelection",
				required: false
			}]
		}],
		selectionMode: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "selectionMode",
				required: false
			}]
		}],
		enableRowActivation: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableRowActivation",
				required: false
			}]
		}],
		subHeaderColumn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderColumn",
				required: false
			}]
		}],
		subHeaderOrder: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderOrder",
				required: false
			}]
		}],
		enableSubHeaders: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableSubHeaders",
				required: false
			}]
		}],
		enableItemNavigation: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableItemNavigation",
				required: false
			}]
		}],
		itemLayout: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "itemLayout",
				required: false
			}]
		}],
		rowActivate: [{
			type: i0.Output,
			args: ["rowActivate"]
		}],
		loadingTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }]
		}],
		emptyTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }]
		}],
		errorTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }]
		}],
		subHeaderTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }]
		}],
		listRegionRef: [{
			type: i0.ViewChild,
			args: ["listRegion", { isSignal: true }]
		}]
	}
});
var NatTableStatic = class NatTableStatic {
	data = input.required(...ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []);
	columns = input.required(...ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []);
	accessibleName = input(void 0, ...ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []);
	caption = input(void 0, ...ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []);
	dataStatus = input(NAT_TABLE_DATA_STATUS.success, ...ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []);
	error = input(null, ...ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []);
	enableRowSelection = input(false, {
		...ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	selectionMode = input("multiple", ...ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []);
	globalFilterFn = input(...ngDevMode ? [void 0, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []);
	getRowId = input(...ngDevMode ? [void 0, { debugName: "getRowId" }] : /* istanbul ignore next */ []);
	subHeaderColumn = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []);
	subHeaderOrder = input(void 0, ...ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []);
	enableSubHeaders = input(true, {
		...ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {},
		transform: booleanAttribute
	});
	subHeaderLayout = input("colspan", ...ngDevMode ? [{ debugName: "subHeaderLayout" }] : /* istanbul ignore next */ []);
	rowActivate = output();
	natTableService = requireNatTableService(inject(NatTableService, { optional: true }), "nat-table-static");
	state = inject(NatTableState);
	a11yService = inject(NatTableA11yService);
	destroyRef = inject(DestroyRef);
	enablePagination = this.state.enablePagination;
	enableGlobalFilter = this.state.enableGlobalFilter;
	table = this.state.table;
	tableElementId = this.state.tableElementId;
	tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null, ...ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []);
	localeId = this.state.localeId;
	headerGroups = this.state.headerGroups;
	bodyRows = this.state.bodyRows;
	visibleColumns = this.state.visibleColumns;
	bodyState = this.state.bodyState;
	resolvedCaption = this.state.resolvedCaption;
	resolvedDirection = this.state.resolvedDirection;
	usesAuthoritativeLayout = this.state.usesAuthoritativeLayout;
	tableClassMap = this.state.tableClassMap;
	fixedLayoutTableWidth = this.state.fixedLayoutTableWidth;
	resolvedColumnWidths = this.state.resolvedColumnWidths;
	columnRenderStates = this.state.columnRenderStates;
	emptyStateColSpan = this.state.emptyStateColSpan;
	tableAriaBusy = this.state.tableAriaBusy;
	resolvedDescription = this.state.resolvedDescription;
	resolvedEmptyState = this.state.resolvedEmptyState;
	resolvedLoadingState = this.state.resolvedLoadingState;
	resolvedErrorState = this.state.resolvedErrorState;
	tableCaptionId = this.state.tableCaptionId;
	tableSummaryId = this.state.tableSummaryId;
	tableDescriptionId = this.state.tableDescriptionId;
	tableAriaLabel = this.state.tableAriaLabel;
	tableAriaLabelledBy = this.state.tableAriaLabelledBy;
	ariaDescribedBy = computed(() => {
		const ids = [];
		if (this.tableSummary().trim()) ids.push(this.tableSummaryId());
		if (this.resolvedDescription().trim()) ids.push(this.tableDescriptionId());
		return ids.length ? ids.join(" ") : null;
	}, ...ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []);
	loadingTemplate = contentChild(NatTableLoadingTemplate, ...ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []);
	emptyTemplate = contentChild(NatTableEmptyTemplate, ...ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []);
	errorTemplate = contentChild(NatTableErrorTemplate, ...ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []);
	subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, ...ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []);
	loadingTemplateRef = computed(() => {
		const templateRef = this.loadingTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "loadingTemplateRef" }] : /* istanbul ignore next */ []);
	emptyTemplateRef = computed(() => {
		const templateRef = this.emptyTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "emptyTemplateRef" }] : /* istanbul ignore next */ []);
	errorTemplateRef = computed(() => {
		const templateRef = this.errorTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "errorTemplateRef" }] : /* istanbul ignore next */ []);
	subHeaderTemplateRef = computed(() => {
		const templateRef = this.subHeaderTemplate()?.templateRef;
		return templateRef ? templateRef : null;
	}, ...ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []);
	loadingTemplateContext = computed(() => ({
		...this.state.getStateTemplateBaseContext(),
		$implicit: NAT_TABLE_BODY_STATE.loading,
		status: NAT_TABLE_BODY_STATE.loading
	}), ...ngDevMode ? [{ debugName: "loadingTemplateContext" }] : /* istanbul ignore next */ []);
	emptyTemplateContext = computed(() => ({
		...this.state.getStateTemplateBaseContext(),
		$implicit: NAT_TABLE_BODY_STATE.empty,
		status: NAT_TABLE_BODY_STATE.empty
	}), ...ngDevMode ? [{ debugName: "emptyTemplateContext" }] : /* istanbul ignore next */ []);
	errorTemplateContext = computed(() => {
		const error = this.error();
		return {
			...this.state.getStateTemplateBaseContext(),
			$implicit: error,
			status: NAT_TABLE_BODY_STATE.error,
			error
		};
	}, ...ngDevMode ? [{ debugName: "errorTemplateContext" }] : /* istanbul ignore next */ []);
	subHeaderGroups = this.state.subHeaderGroups;
	getSubHeaderContext(group) {
		return this.state.getSubHeaderTemplateContext(group);
	}
	getSubHeaderAriaText(group) {
		return this.state.getSubHeaderAnnouncement(group, "table");
	}
	tableSummary = this.a11yService.tableSummary;
	liveMessage = this.a11yService.liveMessage;
	tableRegionRef = viewChild("tableRegion", ...ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []);
	shouldHidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel;
	getCellTone = getCellTone;
	rowSelectedAttribute(row) {
		return this.enableRowSelection() ? String(row.getIsSelected()) : null;
	}
	constructor() {
		this.natTableService.setController(this);
		effect(() => this.state.data.set(this.data()));
		effect(() => this.state.columnDefs.set(this.columns()));
		effect(() => this.state.dataStatus.set(this.dataStatus()));
		effect(() => this.state.error.set(this.error()));
		effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
		effect(() => this.state.getRowId.set(this.getRowId()));
		effect(() => this.state.accessibleName.set(this.accessibleName()));
		effect(() => this.state.caption.set(this.caption()));
		effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
		effect(() => this.state.selectionMode.set(this.selectionMode()));
		effect(() => this.state.subHeaderColumn.set(this.subHeaderColumn()));
		effect(() => this.state.subHeaderOrder.set(this.subHeaderOrder()));
		effect(() => this.state.enableSubHeaders.set(this.enableSubHeaders()));
		effect(() => this.state.tableRegionRef.set(this.tableRegionRef()));
		this.state.registerSeedEffect();
		this.state.registerSubHeaderValidationEffect();
		this.state.registerLocaleValidationEffect();
		this.destroyRef.onDestroy(() => {
			this.natTableService.clearController(this);
		});
	}
	patchState(updaters) {
		this.state.patchState(updaters);
	}
	onRowClick(event, row) {
		if (event.button !== 0 || event.defaultPrevented) return;
		if (originatesFromInteractiveDescendant(event)) return;
		this.rowActivate.emit({
			rowData: row.original,
			row,
			originalEvent: event
		});
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableStatic,
		deps: [],
		target: i0.ɵɵFactoryTarget.Component
	});
	static ɵcmp = i0.ɵɵngDeclareComponent({
		minVersion: "17.0.0",
		version: "22.2.1",
		type: NatTableStatic,
		isStandalone: true,
		selector: "nat-table-static",
		inputs: {
			data: {
				classPropertyName: "data",
				publicName: "data",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			columns: {
				classPropertyName: "columns",
				publicName: "columns",
				isSignal: true,
				isRequired: true,
				transformFunction: null
			},
			accessibleName: {
				classPropertyName: "accessibleName",
				publicName: "accessibleName",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			caption: {
				classPropertyName: "caption",
				publicName: "caption",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			dataStatus: {
				classPropertyName: "dataStatus",
				publicName: "dataStatus",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			error: {
				classPropertyName: "error",
				publicName: "error",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableRowSelection: {
				classPropertyName: "enableRowSelection",
				publicName: "enableRowSelection",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			selectionMode: {
				classPropertyName: "selectionMode",
				publicName: "selectionMode",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			globalFilterFn: {
				classPropertyName: "globalFilterFn",
				publicName: "globalFilterFn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			getRowId: {
				classPropertyName: "getRowId",
				publicName: "getRowId",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderColumn: {
				classPropertyName: "subHeaderColumn",
				publicName: "subHeaderColumn",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderOrder: {
				classPropertyName: "subHeaderOrder",
				publicName: "subHeaderOrder",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			enableSubHeaders: {
				classPropertyName: "enableSubHeaders",
				publicName: "enableSubHeaders",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			subHeaderLayout: {
				classPropertyName: "subHeaderLayout",
				publicName: "subHeaderLayout",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		outputs: { rowActivate: "rowActivate" },
		providers: [NatTableState, NatTableA11yService],
		queries: [
			{
				propertyName: "loadingTemplate",
				first: true,
				predicate: NatTableLoadingTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "emptyTemplate",
				first: true,
				predicate: NatTableEmptyTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "errorTemplate",
				first: true,
				predicate: NatTableErrorTemplate,
				descendants: true,
				isSignal: true
			},
			{
				propertyName: "subHeaderTemplate",
				first: true,
				predicate: NatTableSubHeaderTemplate,
				descendants: true,
				isSignal: true
			}
		],
		viewQueries: [{
			propertyName: "tableRegionRef",
			first: true,
			predicate: ["tableRegion"],
			descendants: true,
			isSignal: true
		}],
		exportAs: ["natTableStatic"],
		ngImport: i0,
		template: "<!-- eslint-disable max-lines -- single cohesive static-table template (header/body/state rows); splitting into partials would fragment the table structure. -->\n<div #tableRegion class=\"table-region\" data-testid=\"nat-table-static-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      @for (headerGroup of headerGroups(); track headerGroup.id) {\n        <tr>\n          @for (header of headerGroup.headers; track header.id) {\n            @let columnState = columnStates[header.column.id];\n            <th\n              [attr.aria-sort]=\"columnState?.ariaSort\"\n              [attr.colspan]=\"header.colSpan > 1 ? header.colSpan : null\"\n              [attr.data-column-id]=\"header.column.id\"\n              [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n              [attr.scope]=\"header.colSpan > 1 ? 'colgroup' : 'col'\"\n              [class]=\"columnState?.headerClassMap\"\n              [natTableHeaderCellLayout]=\"columnState\">\n              @if (!header.isPlaceholder) {\n                @let headerContext = header.getContext();\n                @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n                @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n                <div class=\"header-cell-content\">\n                  <span class=\"header-cell-primary\">\n                    @if (hiddenHeaderLabel) {\n                      <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n                    }\n\n                    @if (!hidePrimitiveHeaderLabel) {\n                      <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    }\n                  </span>\n                </div>\n              }\n            </th>\n          }\n        </tr>\n      }\n    </thead>\n    <tbody>\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let visibleCells = row.getVisibleCells();\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <ng-template #subHeaderInnerContent>\n                <div class=\"sub-header-content\">\n                  @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                    <span class=\"sr-only\">{{ ariaText }}</span>\n                  }\n                  @if (subHeaderTemplateRef(); as templateRef) {\n                    <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                  } @else {\n                    <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                  }\n                </div>\n              </ng-template>\n              <tr class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\">\n                @if (subHeaderLayout() === 'colspan') {\n                  <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\">\n                    <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                  </td>\n                } @else {\n                  <!-- `cells` layout mirrors NatTable: one td per visible column so\n                       pinned zones run unbroken through the sub-header row. -->\n                  @for (cell of visibleCells; track cell.id; let first = $first) {\n                    @let columnState = columnStates[cell.column.id];\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [class.sub-header-cell]=\"true\"\n                      [natTableBodyCellLayout]=\"columnState\">\n                      @if (first) {\n                        <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                      }\n                    </td>\n                  }\n                }\n              </tr>\n            }\n            <tr\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"data-row\"\n              data-testid=\"nat-table-row\"\n              (click)=\"onRowClick($event, row)\">\n              @for (cell of visibleCells; track cell.id) {\n                @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                @let cellTone = getCellTone(cell.column, cellContext);\n                @if (columnState?.rowHeader) {\n                  <th\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    scope=\"row\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </th>\n                } @else {\n                  <td\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </td>\n                }\n              }\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\">\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\">\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\">\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n",
		styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom-color:var( --nat-table-last-row-border-color, var( --sys-nat-table-last-row-border-color, var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%))) ) );border-bottom-width:var(--nat-table-last-row-border-width, var(--sys-nat-table-last-row-border-width, 0))}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{height:var(--nat-table-row-min-height, var(--sys-nat-table-row-min-height, auto));background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:end}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;inset-inline-start:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;inset-inline-start:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}.column-resize-handle:after,.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder),.header-cell.cdk-drag-animating,.data-cell{transition:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"],
		dependencies: [
			{
				kind: "directive",
				type: FlexRender,
				selector: "[flexRender]",
				inputs: [
					"flexRender",
					"flexRenderProps",
					"flexRenderInjector"
				]
			},
			{
				kind: "directive",
				type: NatTableBodyCellLayout,
				selector: "[natTableBodyCellLayout]",
				inputs: ["natTableBodyCellLayout"]
			},
			{
				kind: "directive",
				type: NatTableHeaderCellLayout,
				selector: "th[natTableHeaderCellLayout]",
				inputs: ["natTableHeaderCellLayout"]
			},
			{
				kind: "directive",
				type: NatTablePxWidth,
				selector: "[natTablePxWidth]",
				inputs: ["natTablePxWidth"]
			},
			{
				kind: "directive",
				type: NgTemplateOutlet,
				selector: "[ngTemplateOutlet]",
				inputs: [
					"ngTemplateOutletContext",
					"ngTemplateOutlet",
					"ngTemplateOutletInjector"
				]
			}
		]
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableStatic,
	decorators: [{
		type: Component,
		args: [{
			selector: "nat-table-static",
			exportAs: "natTableStatic",
			imports: [
				FlexRender,
				NatTableBodyCellLayout,
				NatTableHeaderCellLayout,
				NatTablePxWidth,
				NgTemplateOutlet
			],
			providers: [NatTableState, NatTableA11yService],
			template: "<!-- eslint-disable max-lines -- single cohesive static-table template (header/body/state rows); splitting into partials would fragment the table structure. -->\n<div #tableRegion class=\"table-region\" data-testid=\"nat-table-static-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      @for (headerGroup of headerGroups(); track headerGroup.id) {\n        <tr>\n          @for (header of headerGroup.headers; track header.id) {\n            @let columnState = columnStates[header.column.id];\n            <th\n              [attr.aria-sort]=\"columnState?.ariaSort\"\n              [attr.colspan]=\"header.colSpan > 1 ? header.colSpan : null\"\n              [attr.data-column-id]=\"header.column.id\"\n              [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n              [attr.scope]=\"header.colSpan > 1 ? 'colgroup' : 'col'\"\n              [class]=\"columnState?.headerClassMap\"\n              [natTableHeaderCellLayout]=\"columnState\">\n              @if (!header.isPlaceholder) {\n                @let headerContext = header.getContext();\n                @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n                @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n                <div class=\"header-cell-content\">\n                  <span class=\"header-cell-primary\">\n                    @if (hiddenHeaderLabel) {\n                      <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n                    }\n\n                    @if (!hidePrimitiveHeaderLabel) {\n                      <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    }\n                  </span>\n                </div>\n              }\n            </th>\n          }\n        </tr>\n      }\n    </thead>\n    <tbody>\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let visibleCells = row.getVisibleCells();\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <ng-template #subHeaderInnerContent>\n                <div class=\"sub-header-content\">\n                  @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                    <span class=\"sr-only\">{{ ariaText }}</span>\n                  }\n                  @if (subHeaderTemplateRef(); as templateRef) {\n                    <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                  } @else {\n                    <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                  }\n                </div>\n              </ng-template>\n              <tr class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\">\n                @if (subHeaderLayout() === 'colspan') {\n                  <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\">\n                    <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                  </td>\n                } @else {\n                  <!-- `cells` layout mirrors NatTable: one td per visible column so\n                       pinned zones run unbroken through the sub-header row. -->\n                  @for (cell of visibleCells; track cell.id; let first = $first) {\n                    @let columnState = columnStates[cell.column.id];\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [class.sub-header-cell]=\"true\"\n                      [natTableBodyCellLayout]=\"columnState\">\n                      @if (first) {\n                        <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                      }\n                    </td>\n                  }\n                }\n              </tr>\n            }\n            <tr\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"data-row\"\n              data-testid=\"nat-table-row\"\n              (click)=\"onRowClick($event, row)\">\n              @for (cell of visibleCells; track cell.id) {\n                @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                @let cellTone = getCellTone(cell.column, cellContext);\n                @if (columnState?.rowHeader) {\n                  <th\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    scope=\"row\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </th>\n                } @else {\n                  <td\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-nat-row-activation]=\"columnState?.rowActivationAttribute ?? null\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </td>\n                }\n              }\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\">\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\">\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\">\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n",
			styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom-color:var( --nat-table-last-row-border-color, var( --sys-nat-table-last-row-border-color, var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%))) ) );border-bottom-width:var(--nat-table-last-row-border-width, var(--sys-nat-table-last-row-border-width, 0))}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{height:var(--nat-table-row-min-height, var(--sys-nat-table-row-min-height, auto));background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:end}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;inset-inline-start:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;inset-inline-start:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}.column-resize-handle:after,.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder),.header-cell.cdk-drag-animating,.data-cell{transition:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"]
		}]
	}],
	ctorParameters: () => [],
	propDecorators: {
		data: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "data",
				required: true
			}]
		}],
		columns: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "columns",
				required: true
			}]
		}],
		accessibleName: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "accessibleName",
				required: false
			}]
		}],
		caption: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "caption",
				required: false
			}]
		}],
		dataStatus: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "dataStatus",
				required: false
			}]
		}],
		error: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "error",
				required: false
			}]
		}],
		enableRowSelection: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableRowSelection",
				required: false
			}]
		}],
		selectionMode: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "selectionMode",
				required: false
			}]
		}],
		globalFilterFn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "globalFilterFn",
				required: false
			}]
		}],
		getRowId: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "getRowId",
				required: false
			}]
		}],
		subHeaderColumn: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderColumn",
				required: false
			}]
		}],
		subHeaderOrder: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderOrder",
				required: false
			}]
		}],
		enableSubHeaders: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "enableSubHeaders",
				required: false
			}]
		}],
		subHeaderLayout: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "subHeaderLayout",
				required: false
			}]
		}],
		rowActivate: [{
			type: i0.Output,
			args: ["rowActivate"]
		}],
		loadingTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }]
		}],
		emptyTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }]
		}],
		errorTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }]
		}],
		subHeaderTemplate: [{
			type: i0.ContentChild,
			args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }]
		}],
		tableRegionRef: [{
			type: i0.ViewChild,
			args: ["tableRegion", { isSignal: true }]
		}]
	}
});
const readTrimmedText = (nativeEl) => (nativeEl.textContent || nativeEl.innerText || "").trim();
var NatTableHotkeyA11y = class NatTableHotkeyA11y {
	el = inject(ElementRef);
	renderer = inject(Renderer2);
	destroyRef = inject(DestroyRef);
	natTableService = inject(NatTableService, { optional: true });
	globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
	tableIntlConfig = inject(NAT_TABLE_INTL);
	natHotkeyA11y = input("", ...ngDevMode ? [{ debugName: "natHotkeyA11y" }] : /* istanbul ignore next */ []);
	natTableHotkeyA11y = input("", ...ngDevMode ? [{ debugName: "natTableHotkeyA11y" }] : /* istanbul ignore next */ []);
	appHotkeyA11y = input("", ...ngDevMode ? [{ debugName: "appHotkeyA11y" }] : /* istanbul ignore next */ []);
	actionKey = computed(() => {
		const val = this.natHotkeyA11y() || this.natTableHotkeyA11y() || this.appHotkeyA11y();
		return val ? val : null;
	}, ...ngDevMode ? [{ debugName: "actionKey" }] : /* istanbul ignore next */ []);
	keybindings = computed(() => {
		if (this.natTableService) return this.natTableService.keybindings();
		return mergeNatTableKeybindings({}, this.globalKeybindings);
	}, ...ngDevMode ? [{ debugName: "keybindings" }] : /* istanbul ignore next */ []);
	shortcut = computed(() => {
		const key = this.actionKey();
		if (!key) return "";
		const value = this.keybindings()[key];
		return serializeShortcutValue(value);
	}, ...ngDevMode ? [{ debugName: "shortcut" }] : /* istanbul ignore next */ []);
	formatShortcutLabel = computed(() => {
		const localeId = this.natTableService?.locale() ?? NAT_EN_LOCALE_ID;
		return mergeNatTableAccessibilityText(resolveNatTableIntl(this.tableIntlConfig, localeId).accessibilityText, this.natTableService?.accessibilityText()).shortcutLabel;
	}, ...ngDevMode ? [{ debugName: "formatShortcutLabel" }] : /* istanbul ignore next */ []);
	lastWrittenAriaLabel = null;
	originalAriaLabel = signal(null, ...ngDevMode ? [{ debugName: "originalAriaLabel" }] : /* istanbul ignore next */ []);
	originalInnerText = signal("", ...ngDevMode ? [{ debugName: "originalInnerText" }] : /* istanbul ignore next */ []);
	baseLabel = computed(() => {
		return this.originalAriaLabel() ?? this.originalInnerText();
	}, ...ngDevMode ? [{ debugName: "baseLabel" }] : /* istanbul ignore next */ []);
	updatingAttributes = false;
	constructor() {
		const nativeEl = this.el.nativeElement;
		this.originalAriaLabel.set(nativeEl.getAttribute("aria-label"));
		this.originalInnerText.set(readTrimmedText(nativeEl));
		const observer = this.createMutationObserver(nativeEl);
		if (!observer) afterEveryRender(() => {
			this.syncExternalAriaLabel(nativeEl);
			this.originalInnerText.set(readTrimmedText(nativeEl));
		});
		this.destroyRef.onDestroy(() => observer?.disconnect());
		effect(() => {
			const currentShortcut = this.shortcut();
			const base = this.baseLabel();
			const formatShortcutLabel = this.formatShortcutLabel();
			this.updatingAttributes = true;
			try {
				this.writeAriaAttributes(nativeEl, currentShortcut, base, formatShortcutLabel);
			} finally {
				this.updatingAttributes = false;
			}
		});
	}
	createMutationObserver(nativeEl) {
		const mutationObserverCtor = globalThis.MutationObserver;
		if (typeof mutationObserverCtor === "undefined") return null;
		const observer = new mutationObserverCtor((mutations) => this.syncFromMutations(nativeEl, mutations));
		observer.observe(nativeEl, {
			attributes: true,
			attributeFilter: ["aria-label"],
			childList: true,
			characterData: true,
			subtree: true
		});
		return observer;
	}
	syncFromMutations(nativeEl, mutations) {
		if (this.updatingAttributes) return;
		const isAriaLabel = (mutation) => mutation.type === "attributes" && mutation.attributeName === "aria-label";
		const isTextMutation = (mutation) => mutation.type === "childList" || mutation.type === "characterData";
		if (mutations.some(isAriaLabel)) this.syncExternalAriaLabel(nativeEl);
		if (mutations.some(isTextMutation)) this.originalInnerText.set(readTrimmedText(nativeEl));
	}
	syncExternalAriaLabel(nativeEl) {
		const newAriaLabel = nativeEl.getAttribute("aria-label");
		if (!newAriaLabel) {
			this.originalAriaLabel.set(null);
			return;
		}
		if (!this.shortcut() || newAriaLabel !== this.lastWrittenAriaLabel) this.originalAriaLabel.set(newAriaLabel);
	}
	writeAriaAttributes(nativeEl, currentShortcut, base, formatShortcutLabel) {
		if (!currentShortcut) {
			this.renderer.removeAttribute(nativeEl, "aria-keyshortcuts");
			this.writeAriaLabel(nativeEl, this.originalAriaLabel());
			return;
		}
		this.renderer.setAttribute(nativeEl, "aria-keyshortcuts", currentShortcut);
		this.writeAriaLabel(nativeEl, base ? formatShortcutLabel?.({
			label: base,
			shortcutText: currentShortcut
		}) ?? base : null);
	}
	writeAriaLabel(nativeEl, label) {
		if (label) {
			this.lastWrittenAriaLabel = label;
			this.renderer.setAttribute(nativeEl, "aria-label", label);
		} else {
			this.lastWrittenAriaLabel = null;
			this.renderer.removeAttribute(nativeEl, "aria-label");
		}
	}
	static ɵfac = i0.ɵɵngDeclareFactory({
		minVersion: "12.0.0",
		version: "22.2.1",
		ngImport: i0,
		type: NatTableHotkeyA11y,
		deps: [],
		target: i0.ɵɵFactoryTarget.Directive
	});
	static ɵdir = i0.ɵɵngDeclareDirective({
		minVersion: "17.1.0",
		version: "22.2.1",
		type: NatTableHotkeyA11y,
		isStandalone: true,
		selector: "[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]",
		inputs: {
			natHotkeyA11y: {
				classPropertyName: "natHotkeyA11y",
				publicName: "natHotkeyA11y",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			natTableHotkeyA11y: {
				classPropertyName: "natTableHotkeyA11y",
				publicName: "natTableHotkeyA11y",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			},
			appHotkeyA11y: {
				classPropertyName: "appHotkeyA11y",
				publicName: "appHotkeyA11y",
				isSignal: true,
				isRequired: false,
				transformFunction: null
			}
		},
		ngImport: i0
	});
};
i0.ɵɵngDeclareClassMetadata({
	minVersion: "12.0.0",
	version: "22.2.1",
	ngImport: i0,
	type: NatTableHotkeyA11y,
	decorators: [{
		type: Directive,
		args: [{ selector: "[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]" }]
	}],
	ctorParameters: () => [],
	propDecorators: {
		natHotkeyA11y: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natHotkeyA11y",
				required: false
			}]
		}],
		natTableHotkeyA11y: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "natTableHotkeyA11y",
				required: false
			}]
		}],
		appHotkeyA11y: [{
			type: i0.Input,
			args: [{
				isSignal: true,
				alias: "appHotkeyA11y",
				required: false
			}]
		}]
	}
});
const provideNatTableKeybindings = (keybindings) => ({
	provide: NAT_TABLE_KEYBINDINGS,
	useValue: keybindings
});
export { NAT_LIST_ITEM_LAYOUT, NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS, NAT_TABLE_KEYBINDINGS, NAT_TABLE_ROW_WINDOW_HOST, NatList, NatTable, NatTableA11yService, NatTableEmptyTemplate, NatTableErrorTemplate, NatTableHeaderMeasurementService, NatTableHotkeyA11y, NatTableLoadingTemplate, NatTableReorderService, NatTableResizeService, NatTableRowPlaceholderTemplate, NatTableRowRenderStrategyRegistry, NatTableService, NatTableStatic, NatTableSubHeaderTemplate, createNatTableKeyboard, flexRenderComponent, hasNatTableStateValueChanged, provideNatTableKeybindings, serializeShortcutValue, stripNatTableSubHeaderSorting };

//# sourceMappingURL=ng-advanced-table.mjs.map