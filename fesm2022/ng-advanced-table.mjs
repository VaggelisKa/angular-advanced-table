import { createAngularTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getCoreRowModel, FlexRender } from '@tanstack/angular-table';
export { flexRenderComponent } from '@tanstack/angular-table';
import * as i0 from '@angular/core';
import { inject, TemplateRef, Directive, InjectionToken, signal, computed, Injectable, isDevMode, effect, untracked, afterRenderEffect, DestroyRef, afterNextRender, ElementRef, afterEveryRender, Injector, input, booleanAttribute, output, contentChild, viewChild, Component, Renderer2 } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { NAT_TABLE_INTL, NAT_EN_LOCALE_ID, resolveNatTableIntl, mergeNatTableAccessibilityText, formatNatTableNumber } from 'ng-advanced-table/locale';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';

// State slots must be templates because NatTable renders them inside its generated tbody row.
/**
 * Captures the custom loading body-row template rendered when
 * `<nat-table dataStatus="loading">` has no visible rows.
 */
class NatTableLoadingTemplate {
    templateRef = inject((TemplateRef));
    static ngTemplateContextGuard(_directive, context) {
        // `context` is the subject of this type predicate; the runtime guard always
        // narrows. `void` marks it intentionally unused without an eslint-disable.
        void context;
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableLoadingTemplate, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableLoadingTemplate, isStandalone: true, selector: "ng-template[natTableLoading]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableLoadingTemplate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[natTableLoading]'
                }]
        }] });
/**
 * Captures the custom empty body-row template rendered when a successful table
 * view has no matching rows.
 */
class NatTableEmptyTemplate {
    templateRef = inject((TemplateRef));
    static ngTemplateContextGuard(_directive, context) {
        // `context` is the subject of this type predicate; the runtime guard always
        // narrows. `void` marks it intentionally unused without an eslint-disable.
        void context;
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableEmptyTemplate, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableEmptyTemplate, isStandalone: true, selector: "ng-template[natTableEmpty]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableEmptyTemplate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[natTableEmpty]'
                }]
        }] });
/**
 * Captures the custom error body-row template rendered when
 * `<nat-table dataStatus="error">` is active.
 */
class NatTableErrorTemplate {
    templateRef = inject((TemplateRef));
    static ngTemplateContextGuard(_directive, context) {
        // `context` is the subject of this type predicate; the runtime guard always
        // narrows. `void` marks it intentionally unused without an eslint-disable.
        void context;
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableErrorTemplate, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableErrorTemplate, isStandalone: true, selector: "ng-template[natTableError]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableErrorTemplate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[natTableError]'
                }]
        }] });

/**
 * Captures the custom placeholder cell content rendered for logical row slots
 * the table does not hold under remote windowing (`remoteRowCount` on
 * `natTableVirtualize`). The template renders once per visible column cell of
 * each placeholder row. Without it, placeholder cells render empty but keep
 * the fixed-height row structure.
 */
class NatTableRowPlaceholderTemplate {
    templateRef = inject((TemplateRef));
    static ngTemplateContextGuard(_directive, context) {
        // `context` is the subject of this type predicate; the runtime guard always
        // narrows. `void` marks it intentionally unused without an eslint-disable.
        void context;
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowPlaceholderTemplate, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableRowPlaceholderTemplate, isStandalone: true, selector: "ng-template[natTableRowPlaceholder]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowPlaceholderTemplate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[natTableRowPlaceholder]'
                }]
        }] });

/**
 * Captures the custom sub-header content template rendered at the start of
 * each sub-header group when `subHeaderColumn` is set on `<nat-table>` or
 * `<nat-list>`. Without it, the group value renders as plain text.
 */
class NatTableSubHeaderTemplate {
    templateRef = inject((TemplateRef));
    static ngTemplateContextGuard(_directive, context) {
        // `context` is the subject of this type predicate; the runtime guard always
        // narrows. `void` marks it intentionally unused without an eslint-disable.
        void context;
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSubHeaderTemplate, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableSubHeaderTemplate, isStandalone: true, selector: "ng-template[natTableSubHeader]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableSubHeaderTemplate, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[natTableSubHeader]'
                }]
        }] });

/** Named data lifecycle states accepted by `<nat-table>`. */
const NAT_TABLE_DATA_STATUS = {
    loading: 'loading',
    error: 'error',
    success: 'success'
};
/** Named state rows rendered in the table body. */
const NAT_TABLE_BODY_STATE = {
    rows: 'rows',
    loading: 'loading',
    empty: 'empty',
    error: 'error'
};

/** Resolves the row-window host for the enclosing table. Provided by `NatTable`. */
const NAT_TABLE_ROW_WINDOW_HOST = new InjectionToken('NAT_TABLE_ROW_WINDOW_HOST');

/** Injection token for custom keyboard shortcuts configuration. */
const NAT_TABLE_KEYBINDINGS = new InjectionToken('NAT_TABLE_KEYBINDINGS', {
    providedIn: 'root',
    factory: () => ({})
});
/** Default keyboard shortcuts adhering to standard WCAG cell-interaction and reordering behaviors. */
const DEFAULT_NAT_TABLE_KEYBINDINGS = {
    rowActivate: ['Enter', ' ', 'Spacebar'],
    columnReorderLeft: 'Mod+Shift+ArrowLeft',
    columnReorderRight: 'Mod+Shift+ArrowRight',
    cellEnterControl: 'Enter',
    cellExitControl: 'Escape',
    cellTabNextControl: 'Tab',
    cellTabPrevControl: 'Shift+Tab'
};

/** Detects if the current platform is macOS or iOS. Safe for SSR. */
const isMacPlatform = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined')
        return false;
    const userAgent = (navigator.userAgent || '').toLowerCase();
    const platform = (navigator.platform || '').toLowerCase();
    return (userAgent.includes('mac') ||
        userAgent.includes('ipad') ||
        userAgent.includes('iphone') ||
        platform.includes('mac') ||
        platform.includes('ipad') ||
        platform.includes('iphone'));
};
/** Returns whether a keyboard key value represents the Space key. */
const isSpaceShortcutKey = (key) => {
    const lowerKey = key.toLowerCase();
    return key === ' ' || lowerKey === 'space' || lowerKey === 'spacebar';
};
/** Normalizes equivalent key aliases for shortcut comparisons. */
const normalizeShortcutKeyForComparison = (key) => (isSpaceShortcutKey(key) ? 'space' : key.toLowerCase());
/** Resolves the ctrl/alt/shift/meta flags from a set of lowercased modifier tokens. */
const resolveModifierFlags = (modifiers, isMac) => {
    const hasMod = modifiers.has('mod') || modifiers.has('cmdorctrl') || modifiers.has('commandorcontrol');
    return {
        ctrlKey: modifiers.has('ctrl') || modifiers.has('control') || (hasMod && !isMac),
        altKey: modifiers.has('alt'),
        shiftKey: modifiers.has('shift'),
        metaKey: modifiers.has('meta') || modifiers.has('cmd') || modifiers.has('win') || (hasMod && isMac)
    };
};
/** Parses a string shortcut (e.g. `'Alt+Shift+ArrowLeft'`) into a structured {@link NatTableShortcut}. */
const parseShortcutString = (shortcut) => {
    const parts = shortcut.split('+');
    let key = parts[parts.length - 1];
    if (key === '' && parts.length > 1 && shortcut.endsWith('++')) {
        key = '+';
        parts.pop();
    }
    const trimmedKey = key.trim();
    const resolvedKey = trimmedKey === '' && key.length > 0 ? key : trimmedKey;
    const modifiers = new Set(parts.slice(0, -1).map((m) => m.trim().toLowerCase()));
    return {
        key: resolvedKey,
        ...resolveModifierFlags(modifiers, isMacPlatform())
    };
};
/** Normalizes a shortcut string or object into a complete {@link NatTableShortcut} with explicit modifier values. */
const normalizeShortcut = (shortcut) => {
    if (typeof shortcut === 'string') {
        return parseShortcutString(shortcut);
    }
    const isMac = isMacPlatform();
    const hasMod = !!shortcut.cmdOrCtrlKey;
    return {
        key: shortcut.key,
        ctrlKey: !!shortcut.ctrlKey || (hasMod && !isMac),
        altKey: !!shortcut.altKey,
        shiftKey: !!shortcut.shiftKey,
        metaKey: !!shortcut.metaKey || (hasMod && isMac)
    };
};
/** Checks if two shortcut definitions are equivalent. */
const areShortcutsEqual = (a, b) => {
    const normA = normalizeShortcut(a);
    const normB = normalizeShortcut(b);
    return (normalizeShortcutKeyForComparison(normA.key) === normalizeShortcutKeyForComparison(normB.key) &&
        normA.altKey === normB.altKey &&
        normA.ctrlKey === normB.ctrlKey &&
        normA.shiftKey === normB.shiftKey &&
        normA.metaKey === normB.metaKey);
};
/** Checks if there is any overlap between two shortcut configurations. */
const areShortcutValuesOverlapping = (valA, valB) => {
    if (!valA || !valB)
        return false;
    const listA = Array.isArray(valA) ? valA : [valA];
    const listB = Array.isArray(valB) ? valB : [valB];
    for (const a of listA) {
        for (const b of listB) {
            if (areShortcutsEqual(a, b))
                return true;
        }
    }
    return false;
};

/** Checks if a keyboard event matches a given shortcut. */
const matchShortcut = (event, shortcut) => {
    const norm = normalizeShortcut(shortcut);
    return (normalizeShortcutKeyForComparison(event.key) === normalizeShortcutKeyForComparison(norm.key) &&
        event.altKey === norm.altKey &&
        event.ctrlKey === norm.ctrlKey &&
        event.shiftKey === norm.shiftKey &&
        event.metaKey === norm.metaKey);
};
/** Checks if a keyboard event matches any of the configured shortcut values. */
const matchShortcutValue = (event, value) => {
    if (!value)
        return false;
    if (Array.isArray(value)) {
        return value.some((val) => matchShortcut(event, val));
    }
    return matchShortcut(event, value);
};
/** Merges multiple keybindings configurations in priority order, falling back to defaults. */
const mergeNatTableKeybindings = (...configs) => {
    const keys = Object.keys(DEFAULT_NAT_TABLE_KEYBINDINGS);
    const entries = keys.map((key) => {
        for (const config of configs) {
            if (config[key] !== undefined)
                return [key, config[key]];
        }
        return [key, DEFAULT_NAT_TABLE_KEYBINDINGS[key]];
    });
    return Object.fromEntries(entries);
};
/** Serializes one normalized shortcut to its `Alt+Control+...+Key` ARIA representation. */
const serializeSingleShortcut = (norm) => {
    const parts = [];
    if (norm.altKey)
        parts.push('Alt');
    if (norm.ctrlKey)
        parts.push('Control');
    if (norm.metaKey)
        parts.push('Meta');
    if (norm.shiftKey)
        parts.push('Shift');
    parts.push(isSpaceShortcutKey(norm.key) ? 'Space' : norm.key);
    return parts.join('+');
};
/** Serializes a keybinding shortcut value to a string representation suitable for ARIA attributes. */
const serializeShortcutValue = (value) => {
    if (!value)
        return '';
    const values = Array.isArray(value) ? value : [value];
    const serializedSet = new Set();
    for (const val of values) {
        serializedSet.add(serializeSingleShortcut(normalizeShortcut(val)));
    }
    return Array.from(serializedSet).filter(Boolean).join(' ');
};
/** Validates keybindings configuration and returns warning messages for any conflicts. */
const validateKeybindings = (bindings) => {
    const warnings = [];
    const keys = Object.keys(bindings);
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            const keyA = keys[i];
            const keyB = keys[j];
            // rowActivate and cellEnterControl operate at different focus contexts (row-level vs inside cell)
            // and can safely share shortcuts (like 'Enter') by design.
            if ((keyA === 'rowActivate' && keyB === 'cellEnterControl') || (keyA === 'cellEnterControl' && keyB === 'rowActivate')) {
                continue;
            }
            if (areShortcutValuesOverlapping(bindings[keyA], bindings[keyB])) {
                warnings.push(`Action '${keyA}' and Action '${keyB}' share overlapping shortcut combinations.`);
            }
        }
    }
    return warnings;
};
/** Compiles a functional keyboard shortcuts helper from a keybindings configuration. */
const createNatTableKeyboard = (keybindings) => ({
    cellInteraction: {
        enter: (event) => matchShortcutValue(event, keybindings.cellEnterControl),
        exit: (event) => matchShortcutValue(event, keybindings.cellExitControl),
        next: (event) => matchShortcutValue(event, keybindings.cellTabNextControl),
        previous: (event) => matchShortcutValue(event, keybindings.cellTabPrevControl)
    },
    rowActivate: (event) => matchShortcutValue(event, keybindings.rowActivate),
    columnReorderDirection: (event) => {
        if (matchShortcutValue(event, keybindings.columnReorderLeft))
            return -1;
        if (matchShortcutValue(event, keybindings.columnReorderRight))
            return 1;
        return null;
    }
});

const MAX_STATE_COMPARISON_DEPTH = 128;
const MAX_STATE_COMPARISON_WORK = 1_000;
let valuesMatch = () => false;
const isObject = (value) => typeof value === 'object' && value !== null;
const enumerableKeys = (value) => Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
const hasSeenPair = (left, right, seen) => {
    const rightValues = seen.get(left);
    if (rightValues?.has(right)) {
        return true;
    }
    if (rightValues) {
        rightValues.add(right);
    }
    else {
        seen.set(left, new Set([right]));
    }
    return false;
};
const cloneSeenPairs = (seen) => new Map(Array.from(seen, ([left, rightValues]) => [left, new Set(rightValues)]));
const replaceSeenPairs = (target, source) => {
    target.clear();
    for (const [left, rightValues] of source) {
        target.set(left, new Set(rightValues));
    }
};
const valuesMatchWithoutFailedPairSideEffects = (left, right, context) => {
    const trialSeen = cloneSeenPairs(context.seen);
    if (!valuesMatch(left, right, { ...context, seen: trialSeen })) {
        return false;
    }
    replaceSeenPairs(context.seen, trialSeen);
    return true;
};
const datesMatch = (left, right) => left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime());
const regexpsMatch = (left, right) => left instanceof RegExp && right instanceof RegExp && left.source === right.source && left.flags === right.flags;
const isDateComparison = (left, right) => left instanceof Date || right instanceof Date;
const isRegExpComparison = (left, right) => left instanceof RegExp || right instanceof RegExp;
const isMapComparison = (left, right) => left instanceof Map || right instanceof Map;
const isSetComparison = (left, right) => left instanceof Set || right instanceof Set;
const valuesMatchNested = (left, right, context) => valuesMatch(left, right, { ...context, depth: context.depth + 1 });
const arraysMatch = (left, right, context) => Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => valuesMatchNested(value, right[index], context));
const mapsMatch = (left, right, context) => {
    if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) {
        return false;
    }
    if (left.size * 2 > context.budget.remainingWork) {
        return false;
    }
    const leftMap = left;
    const rightEntries = Array.from(right.entries());
    return Array.from(leftMap.entries()).every(([key, value], index) => valuesMatchNested(key, rightEntries[index]?.[0], context) && valuesMatchNested(value, rightEntries[index]?.[1], context));
};
const setsMatch = (left, right, context) => {
    if (!(left instanceof Set) || !(right instanceof Set) || left.size !== right.size) {
        return false;
    }
    if (left.size > context.budget.remainingWork) {
        return false;
    }
    const leftSet = left;
    const unmatchedRightValues = Array.from(right.values());
    return Array.from(leftSet.values()).every((leftValue) => {
        const matchingIndex = unmatchedRightValues.findIndex((rightValue) => valuesMatchWithoutFailedPairSideEffects(leftValue, rightValue, { ...context, depth: context.depth + 1 }));
        if (matchingIndex < 0) {
            return false;
        }
        unmatchedRightValues.splice(matchingIndex, 1);
        return true;
    });
};
const plainObjectsMatch = (left, right, context) => {
    const leftPrototype = Object.getPrototypeOf(left);
    if (leftPrototype !== Object.getPrototypeOf(right)) {
        return false;
    }
    if (leftPrototype !== Object.prototype && leftPrototype !== null) {
        return false;
    }
    const leftKeys = enumerableKeys(left);
    const rightKeys = new Set(enumerableKeys(right));
    const leftRecord = left;
    const rightRecord = right;
    return (leftKeys.length === rightKeys.size &&
        leftKeys.length <= context.budget.remainingWork &&
        leftKeys.every((key) => rightKeys.has(key) && valuesMatchNested(leftRecord[key], rightRecord[key], context)));
};
const specialObjectsMatch = (left, right, context) => {
    if (isDateComparison(left, right)) {
        return datesMatch(left, right);
    }
    if (isRegExpComparison(left, right)) {
        return regexpsMatch(left, right);
    }
    if (Array.isArray(left) || Array.isArray(right)) {
        return arraysMatch(left, right, context);
    }
    if (isMapComparison(left, right)) {
        return mapsMatch(left, right, context);
    }
    if (isSetComparison(left, right)) {
        return setsMatch(left, right, context);
    }
    return null;
};
valuesMatch = (left, right, context) => {
    if (context.depth > MAX_STATE_COMPARISON_DEPTH || context.budget.remainingWork <= 0) {
        return false;
    }
    context.budget.remainingWork -= 1;
    if (Object.is(left, right)) {
        return true;
    }
    if (!isObject(left)) {
        return false;
    }
    if (!isObject(right)) {
        return false;
    }
    if (hasSeenPair(left, right, context.seen)) {
        return true;
    }
    const specialMatch = specialObjectsMatch(left, right, context);
    return specialMatch ?? plainObjectsMatch(left, right, context);
};
/**
 * Avoid JSON serialization: consumer-owned filter values can include BigInt,
 * Sets, Maps, Dates, or RegExps that either throw or stringify incorrectly.
 * Extremely deep or broad values are treated as changed once the comparison
 * budget is exhausted so state checks terminate predictably.
 */
const hasNatTableStateValueChanged = (left, right) => !valuesMatch(left, right, {
    seen: new Map(),
    budget: { remainingWork: MAX_STATE_COMPARISON_WORK },
    depth: 0
});

/** Set `target` to `value` when they differ, treating `undefined` as a real value. */
const setSignalIfChanged = (target, value) => {
    if (target() !== value) {
        target.set(value);
    }
};
/** Set `target` only when `value` is defined and differs from the current value. */
const setSignalIfDefinedChanged = (target, value) => {
    if (value !== undefined && target() !== value) {
        target.set(value);
    }
};
/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable / table-surface (providers: [NatTableService]), not root.
class NatTableService {
    controllerSignal = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controllerSignal" }] : /* istanbul ignore next */ []));
    controller = this.controllerSignal.asReadonly();
    // Model state bound from the surface component
    stateSignal = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stateSignal" }] : /* istanbul ignore next */ []));
    state = this.stateSignal.asReadonly();
    surfaceInitialState = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "surfaceInitialState" }] : /* istanbul ignore next */ []));
    surfaceMode = signal('auto', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "surfaceMode" }] : /* istanbul ignore next */ []));
    manualPageCount = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualPageCount" }] : /* istanbul ignore next */ []));
    enableAnnouncements = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableAnnouncements" }] : /* istanbul ignore next */ []));
    stickyHeader = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stickyHeader" }] : /* istanbul ignore next */ []));
    enableMultiSort = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableMultiSort" }] : /* istanbul ignore next */ []));
    locale = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    accessibilityText = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityText" }] : /* istanbul ignore next */ []));
    columnResizeMode = signal('onEnd', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnResizeMode" }] : /* istanbul ignore next */ []));
    columnSizingMode = signal('fill', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnSizingMode" }] : /* istanbul ignore next */ []));
    enableColumnResizing = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableColumnResizing" }] : /* istanbul ignore next */ []));
    enableReordering = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableReordering" }] : /* istanbul ignore next */ []));
    enableSorting = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableSorting" }] : /* istanbul ignore next */ []));
    enablePinning = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enablePinning" }] : /* istanbul ignore next */ []));
    direction = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "direction" }] : /* istanbul ignore next */ []));
    globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
    surfaceKeybindings = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "surfaceKeybindings" }] : /* istanbul ignore next */ []));
    keybindings = computed(() => mergeNatTableKeybindings(this.surfaceKeybindings(), this.globalKeybindings), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "keybindings" }] : /* istanbul ignore next */ []));
    keyboard = computed(() => createNatTableKeyboard(this.keybindings()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "keyboard" }] : /* istanbul ignore next */ []));
    manualPagination = computed(() => {
        const mode = this.surfaceMode();
        return typeof mode === 'string' ? mode === 'manual' : mode.pagination === 'manual';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualPagination" }] : /* istanbul ignore next */ []));
    manualSorting = computed(() => {
        const mode = this.surfaceMode();
        return typeof mode === 'string' ? mode === 'manual' : mode.sorting === 'manual';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualSorting" }] : /* istanbul ignore next */ []));
    manualFiltering = computed(() => {
        const mode = this.surfaceMode();
        return typeof mode === 'string' ? mode === 'manual' : mode.filtering === 'manual';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualFiltering" }] : /* istanbul ignore next */ []));
    // Self-registrations for components
    paginationRegistrations = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginationRegistrations" }] : /* istanbul ignore next */ []));
    hasPagination = computed(() => this.paginationRegistrations() > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasPagination" }] : /* istanbul ignore next */ []));
    searchRegistrations = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "searchRegistrations" }] : /* istanbul ignore next */ []));
    hasSearch = computed(() => this.searchRegistrations() > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasSearch" }] : /* istanbul ignore next */ []));
    // Writable signal to emit state updates from NatTable back to NatTableSurface
    stateChangeEvent = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stateChangeEvent" }] : /* istanbul ignore next */ []));
    setController(controller) {
        this.controllerSignal.set(controller);
    }
    clearController(controller) {
        this.controllerSignal.update((current) => (current === controller ? null : current));
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
        if (config.state !== undefined) {
            this.stateSignal.set(config.state);
        }
        if (config.initialState !== undefined) {
            this.surfaceInitialState.set(config.initialState);
        }
        if (config.mode !== undefined) {
            this.surfaceMode.set(config.mode);
        }
        if (config.accessibilityText !== undefined && hasNatTableStateValueChanged(this.accessibilityText(), config.accessibilityText)) {
            this.accessibilityText.set(config.accessibilityText);
        }
        if (config.keybindings !== undefined && hasNatTableStateValueChanged(this.surfaceKeybindings(), config.keybindings)) {
            this.surfaceKeybindings.set(config.keybindings);
        }
        // `manualPageCount`, `locale`, and `direction` treat `undefined` as a real value.
        setSignalIfChanged(this.manualPageCount, config.manualPageCount);
        setSignalIfChanged(this.locale, config.locale);
        setSignalIfChanged(this.direction, config.direction);
        // Defined-only scalar options: applied when present in the config and actually changed.
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableService, decorators: [{
            type: Injectable
        }] });

/** Per-table registry for an optional body-row rendering strategy. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table registry, provided by NatTable; absent on renderers that never virtualize.
class NatTableRowRenderStrategyRegistry {
    registeredStrategy = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "registeredStrategy" }] : /* istanbul ignore next */ []));
    strategy = this.registeredStrategy.asReadonly();
    register(strategy) {
        const current = this.registeredStrategy();
        if (current && current !== strategy) {
            throw new Error('[ng-advanced-table] Only one body-row rendering strategy may be registered per table.');
        }
        this.registeredStrategy.set(strategy);
        return () => {
            this.registeredStrategy.update((registered) => (registered === strategy ? null : registered));
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowRenderStrategyRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowRenderStrategyRegistry });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowRenderStrategyRegistry, decorators: [{
            type: Injectable
        }] });

/** Selector for interactive controls that opt a click or keypress out of row activation. */
const ROW_ACTIVATE_INTERACTIVE_SELECTOR = 'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
    '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
    '[role="menuitemcheckbox"], [role="menuitemradio"], [role="tab"], [role="switch"], ' +
    '[role="combobox"], [role="textbox"], [role="searchbox"]';

const NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE = 'data-nat-table-managed-cell-widget';
const NAT_TABLE_CELL_SELECTOR = '[natTableCell]';
/** Renderer host elements, used to tell cells owned by one renderer from nested or foreign ones. */
const NAT_TABLE_HOST_SELECTOR = 'nat-table, nat-list';
/**
 * Mutable attributes that affect interactive-selector eligibility, preparation
 * guards, or managed tabindex state. Keep this aligned with those rules so
 * attribute changes cannot bypass cell-control preparation.
 */
const NAT_TABLE_CELL_CONTROL_ATTRIBUTE_FILTER = [
    'contenteditable',
    'disabled',
    'href',
    'nggridcellwidget',
    'role',
    'tabindex'
];

/**
 * ARIA grid cell-interaction keyboard model (APG "Editing and Navigating Inside a Cell"):
 * Enter moves focus from a cell into its first interactive control, Tab / Shift+Tab cycle
 * through the controls of that cell only (past the first/last control Tab stays native so
 * focus can leave the grid), and Escape returns focus to the cell. The controls are rendered
 * through `flexRender` (separate views), so `@angular/aria`'s `GridCell` content query never
 * registers them; this supplies the keyboard path the grid pattern otherwise cannot.
 *
 * Per APG "Whether to Focus on a Cell or an Element Inside It" (and `@angular/aria`'s
 * single-widget mode), a cell whose entire content is one control that does not consume
 * arrow keys delegates focus straight to that control: arriving on the cell focuses the
 * control, Enter activates it natively, and Escape stays native because the control is
 * the cell's focus stop. Cells with several controls, extra content, or an
 * arrow-consuming control keep the Enter / Tab / Escape model above.
 */
const GRID_CELL_SELECTOR = '[role="gridcell"], [role="columnheader"], [role="rowheader"]';
/**
 * Controls that operate without arrow keys or typing, so the grid keeps arrow
 * navigation while one of them holds focus. Text-entry and arrow-driven controls
 * (inputs, selects, comboboxes, radios) stay on the Enter-to-interact model.
 * Must stay a subset of {@link ROW_ACTIVATE_INTERACTIVE_SELECTOR} — a control
 * has to be reachable before it can be delegated to.
 */
const DELEGATED_CONTROL_SELECTOR = 'a[href], button, summary, input[type="checkbox"], input[type="button"], ' +
    'input[type="submit"], input[type="reset"], ' +
    '[role="button"], [role="link"], [role="checkbox"], [role="switch"]';
const focusAndConsume = (event, control) => {
    event.preventDefault();
    event.stopPropagation();
    control.focus();
    return true;
};
/**
 * Controls the model may focus: not disabled and not hidden on the element or an
 * ancestor (`hidden`, `inert`, `aria-hidden`). Controls removed from the tab order
 * (`tabindex="-1"`) are skipped — except grid-cell widgets, whose `tabindex="-1"`
 * comes from `@angular/aria`'s roving model and not from an author opting them out
 * (flexRender keeps them unregistered, so the grid never restores their tab stop).
 * CSS-only visibility (display/clip) is not checked: jsdom reports no layout, and
 * hidden columns leave the DOM entirely.
 */
const isReachableControl = (element) => !element.hasAttribute('disabled') &&
    (element.tabIndex >= 0 ||
        element.hasAttribute('ngGridCellWidget') ||
        element.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)) &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]');
/**
 * The cell's action controls in document order — what Enter steps into and Tab
 * walks. Controls inside a menu attached within the cell are the menu's own
 * (its roving model handles them while it is open), never the cell's.
 */
const cellInteractiveControls = (cell) => Array.from(cell.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)).filter((control) => isReachableControl(control) && !control.closest('[role="menu"], [role="menubar"]'));
/** Whether the cell renders perceivable text outside the given control. */
const hasContentOutsideControl = (cell, control) => {
    const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim() || control.contains(node))
            continue;
        // Content hidden from assistive technology does not block delegation.
        if (node.parentElement?.closest('[hidden], [inert], [aria-hidden="true"]'))
            continue;
        return true;
    }
    return false;
};
/**
 * The control a cell delegates focus to: its only reachable control, arrow-safe,
 * with no other perceivable content in the cell (text outside the control would be
 * skipped by screen readers when focus lands on the control directly).
 */
const delegatedCellControl = (cell) => {
    const controls = cellInteractiveControls(cell);
    if (controls.length !== 1)
        return null;
    const [control] = controls;
    if (!control.matches(DELEGATED_CONTROL_SELECTOR))
        return null;
    return hasContentOutsideControl(cell, control) ? null : control;
};
/** Whether `target` is the arrow-safe control acting as this grid cell's focus stop. */
const isNatTableDelegatedCellControl = (cell, target) => delegatedCellControl(cell) === target;
/** Enter on a focused cell steps into the cell's first control. */
const enterFirstCellControl = (event, cell, target) => {
    // Enter on a control keeps its native behavior.
    if (target !== cell)
        return false;
    // `.at(0)` is honestly typed `HTMLElement | undefined`, so a control-less cell
    // falls through to row activation.
    const firstControl = cellInteractiveControls(cell).at(0);
    if (!firstControl)
        return false;
    return focusAndConsume(event, firstControl);
};
/** Escape inside a control returns focus to the owning cell. */
const escapeBackToCell = (event, cell, target) => {
    if (target === cell)
        return false;
    // A delegated control is the cell's focus stop; refocusing the cell would only
    // bounce focus back through the focusin redirect, so Escape stays native.
    if (delegatedCellControl(cell) === target)
        return false;
    return focusAndConsume(event, cell);
};
const tabBetweenCellControls = (event, cell, target, cellInteraction) => {
    // Tab on the cell itself is not intercepted so focus can leave the grid; Enter is the entry point.
    if (target === cell)
        return false;
    const controls = cellInteractiveControls(cell);
    const index = controls.indexOf(target);
    if (index === -1)
        return false;
    const isPrev = cellInteraction.previous(event);
    const nextIndex = index + (isPrev ? -1 : 1);
    // Past the first/last control of the cell: let Tab leave the grid. An explicit
    // bounds check (the `-1` index rules out `.at()`, which would wrap to the last control).
    if (nextIndex < 0 || nextIndex >= controls.length)
        return false;
    return focusAndConsume(event, controls[nextIndex]);
};
/**
 * Routes a keydown on a grid cell (or a control inside one) through the
 * cell-interaction model. Returns `true` when it handled the event, so the
 * caller skips its own behavior (e.g. row activation).
 */
const handleCellInteractionKeydown = (event, cellInteraction) => {
    if (event.defaultPrevented)
        return false;
    const target = event.target;
    if (!(target instanceof HTMLElement))
        return false;
    const cell = target.closest(GRID_CELL_SELECTOR);
    if (!cell)
        return false;
    if (cellInteraction.enter(event)) {
        return enterFirstCellControl(event, cell, target);
    }
    if (cellInteraction.exit(event)) {
        return escapeBackToCell(event, cell, target);
    }
    if (cellInteraction.next(event) || cellInteraction.previous(event)) {
        return tabBetweenCellControls(event, cell, target, cellInteraction);
    }
    return false;
};
/**
 * Routes a focusin on a grid cell through the single-control delegation rule:
 * when the cell's whole content is one arrow-safe control, focus moves on to
 * that control so it activates with a single Enter (APG "Whether to Focus on
 * a Cell or an Element Inside It"). Returns `true` when it redirected focus.
 */
const handleCellInteractionFocusIn = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(GRID_CELL_SELECTOR))
        return false;
    // Delegation must only fire when focus is *arriving* at the cell. Shift+Tab
    // walks backwards out of a delegated cell through the cell element itself, so
    // redirecting then throws focus straight back into the control and the two
    // ping-pong forever — the header becomes impossible to leave backwards (#311).
    // `relatedTarget` on focusin is the element being left, so an arrival from
    // inside this cell is an exit in progress and must be allowed through.
    if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))
        return false;
    const control = delegatedCellControl(target);
    if (!control)
        return false;
    control.focus();
    return true;
};

const EMPTY_COLUMN_PINNING = {
    left: [],
    right: []
};
const DEFAULT_PAGINATION = {
    pageIndex: 0,
    pageSize: 10
};
const DEFAULT_COLUMN_ORDER = [];
const EMPTY_COLUMN_SIZING = {};
/** @internal */
const DEFAULT_TABLE_STATE = {
    sorting: [],
    globalFilter: '',
    columnFilters: [],
    columnVisibility: {},
    columnOrder: DEFAULT_COLUMN_ORDER,
    columnPinning: EMPTY_COLUMN_PINNING,
    columnSizing: EMPTY_COLUMN_SIZING,
    rowSelection: {},
    pagination: DEFAULT_PAGINATION
};

/** Default body-cell content-line clamp used when `meta.cellMaxLines` is not set. */
const DEFAULT_CELL_MAX_LINES = 2;

/**
 * Reads a column-keyed record entry, honestly typed `T | undefined`: a column id
 * absent from the record is `undefined` at runtime despite the value type. Lets
 * callers guard the result without a `no-unnecessary-condition` suppression.
 */
const readColumnEntry = (record, columnId) => record[columnId];
const resolveColumnDefId = (column) => {
    if (column.id)
        return column.id;
    const accessorKey = column.accessorKey;
    if (typeof accessorKey === 'string')
        return accessorKey.replace(/\./g, '_');
    return typeof column.header === 'string' ? column.header : null;
};
const getColumnDefLeafIds = (columns) => {
    return columns.flatMap((column) => {
        const childColumns = column.columns;
        if (childColumns?.length) {
            return getColumnDefLeafIds(childColumns);
        }
        const columnId = resolveColumnDefId(column);
        return columnId ? [columnId] : [];
    });
};
/**
 * Whether any leaf column definition satisfies `predicate`. Recurses into grouped
 * columns so nested leaves are checked. Reads the raw column defs (not the TanStack
 * table), so it is safe to call from within the table's options factory.
 */
const someLeafColumnDef = (columns, predicate) => columns.some((column) => {
    const childColumns = column.columns;
    return childColumns?.length ? someLeafColumnDef(childColumns, predicate) : predicate(column);
});
/**
 * Returns a copy of `columns` where the leaf definition matching `columnId`
 * carries `sortingFn`, recursing into grouped columns. Only the changed path
 * is copied; when no leaf matches, the input array is returned unchanged so
 * reference equality keeps downstream computeds stable.
 */
const patchLeafColumnDefSorting = (columns, columnId, sortingFn) => {
    const patched = columns.map((column) => {
        const childColumns = column.columns;
        if (childColumns?.length) {
            const patchedChildren = patchLeafColumnDefSorting(childColumns, columnId, sortingFn);
            return patchedChildren === childColumns ? column : { ...column, columns: patchedChildren };
        }
        return resolveColumnDefId(column) === columnId ? { ...column, sortingFn } : column;
    });
    return patched.some((column, index) => column !== columns[index]) ? patched : columns;
};
const getUserColumnSizing = (columns) => {
    const result = {};
    // First declaration wins: when two columns resolve to the same id, keep the
    // earlier column's sizing hints rather than letting a later duplicate clobber
    // them. Surfacing a collision as data loss would be worse than deterministically
    // honouring the column the consumer declared first.
    const keepFirst = (columnId, sizing) => {
        if (!(columnId in result)) {
            result[columnId] = sizing;
        }
    };
    for (const column of columns) {
        const childColumns = column.columns;
        if (childColumns?.length) {
            for (const [childId, childSizing] of Object.entries(getUserColumnSizing(childColumns))) {
                keepFirst(childId, childSizing);
            }
            continue;
        }
        const columnId = resolveColumnDefId(column);
        if (!columnId)
            continue;
        // TanStack applies default `size`, `minSize`, and `maxSize` to runtime
        // column definitions. Read the original input defs so only user-provided
        // sizing becomes rendered CSS.
        keepFirst(columnId, {
            hasSize: column.size !== undefined,
            hasMinSize: column.minSize !== undefined,
            hasMaxSize: column.maxSize !== undefined
        });
    }
    return result;
};
const normalizeColumnDimension = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0 ? `${Math.round(value)}px` : null;
    }
    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        return trimmedValue ? trimmedValue : null;
    }
    return null;
};
const normalizeCellMaxLines = (value) => {
    // Only a positive, non-finite value (i.e. +Infinity) means "unlimited lines".
    // -Infinity and NaN are not usable line counts, so they fall back to the default
    // alongside zero and negative finite values.
    if (!Number.isFinite(value) && value > 0) {
        return null;
    }
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : DEFAULT_CELL_MAX_LINES;
};
const getNumericColumnWidth = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const pixelMatch = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());
    if (!pixelMatch) {
        return null;
    }
    const width = Number(pixelMatch[1]);
    return Number.isFinite(width) && width >= 0 ? Math.round(width) : null;
};

const RESIZE_KEYBOARD_STEP = 8;
const RESIZE_KEYBOARD_STEP_LARGE = 40;
/**
 * Minimum resize width for a column that does not declare its own `minSize`.
 * TanStack defaults `minSize` to 20px, which is narrower than the resize handle
 * hit area (`--nat-table-resize-handle-hit`, 24px / the WCAG 2.5.8 AA target):
 * a column dragged that small swallows its own handle (it overflows the cell and
 * stops being grabbable) and, in fill layout, collapses every neighbour to the
 * same sliver while the grown column overflows the region. Twice the hit target
 * keeps the handle fully inside the column plus a grabbable header strip. An
 * explicit `minSize` is always honoured as-is.
 */
const DEFAULT_MIN_COLUMN_WIDTH = 48;

/** Resize bounds for a column: honoured `minSize`/`maxSize`, else the default minimum. */
const getColumnResizeBounds = (column, userColumnSizing, minWidth = DEFAULT_MIN_COLUMN_WIDTH) => {
    const explicitMin = readColumnEntry(userColumnSizing, column.id)?.hasMinSize === true;
    const rawMin = explicitMin ? column.columnDef.minSize : minWidth;
    // `?? minWidth` only substitutes null/undefined, so a NaN minSize would slip
    // through and poison `Math.max`. Guard with `Number.isFinite` (as the maxSize
    // path does) so a bad min falls back to the safe default width.
    const safeMin = typeof rawMin === 'number' && Number.isFinite(rawMin) ? rawMin : minWidth;
    const min = Math.max(Math.round(safeMin), 1);
    const rawMax = column.columnDef.maxSize;
    const max = typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax < Number.MAX_SAFE_INTEGER ? Math.round(rawMax) : null;
    return { min, max };
};
/** Clamps a width into `[min, max]` (max optional) and rounds to a positive integer. */
const clampWidth = (width, bounds) => {
    const { min, max } = bounds;
    // A non-finite min (NaN) would make `Math.max` return NaN and defeat the
    // floor-at-one safety net; treat it as "no lower bound" so the universal floor
    // of 1 applies instead.
    const safeMin = Number.isFinite(min) ? min : 1;
    const clamped = Math.max(safeMin, max !== null ? Math.min(max, width) : width);
    return Math.max(Math.round(clamped), 1);
};
/**
 * Target width for one keyboard resize step, or `null` when the key is not a
 * resize key. Arrow keys step by `RESIZE_KEYBOARD_STEP` toward/away from the
 * inline edge (direction-aware); Home/End jump to the min/max.
 */
const computeKeyboardResizeWidth = ({ key, current, min, max, isRtl }) => {
    const step = RESIZE_KEYBOARD_STEP;
    const towardEdge = isRtl ? -step : step;
    let next;
    switch (key) {
        case 'ArrowLeft':
            next = current - towardEdge;
            break;
        case 'ArrowRight':
            next = current + towardEdge;
            break;
        case 'Home':
            next = min;
            break;
        case 'End':
            next = max ?? current + RESIZE_KEYBOARD_STEP_LARGE;
            break;
        default:
            return null;
    }
    return Math.max(min, max !== null ? Math.min(max, next) : next);
};
/**
 * Clamps every entry of a column-sizing map to its column's resize bounds,
 * returning the original reference when nothing changed.
 */
const clampColumnSizingWidths = (sizing, getColumn, clampColumnWidth) => {
    let result = null;
    for (const columnId of Object.keys(sizing)) {
        const column = getColumn(columnId);
        if (!column)
            continue;
        const clamped = clampColumnWidth(column, sizing[columnId]);
        if (clamped !== sizing[columnId]) {
            (result ??= { ...sizing })[columnId] = clamped;
        }
    }
    return result ?? sizing;
};

const isUsableVirtualItem = (item, rowCount, totalSize) => Number.isInteger(item.index) &&
    item.index >= 0 &&
    item.index < rowCount &&
    Number.isFinite(item.start) &&
    item.start >= 0 &&
    Number.isFinite(item.end) &&
    item.end > item.start &&
    item.end <= totalSize;
const renderAllRows = (rows, windowOffset) => ({
    rows: rows.map((row, index) => ({ kind: 'row', row, logicalIndex: windowOffset + index, beforeSize: 0 })),
    afterSize: 0
});
/**
 * `NatTableRowRenderStrategy` is a public SPI, so these rejections are
 * reachable from consumer code — and both fail invisibly. Rejected metrics
 * mount every row (a frozen page on a large dataset), and discarded items
 * leave a table that looks structurally correct, spacers and scrollbar
 * included, with rows simply missing.
 *
 * Keyed by a short tag rather than the message so a per-call count can vary
 * without re-warning, and kept terse: the strings ship to production even
 * though `isDevMode()` stops them printing there.
 */
const warned = new Set();
const warnOnce = (tag, message) => {
    if (!isDevMode() || warned.has(tag)) {
        return;
    }
    warned.add(tag);
    console.warn(`[ng-advanced-table] Row-render strategy: ${message}`);
};
/**
 * Remote windowing extent supplied by the strategy, normalized so the loaded
 * rows always fit inside it: the logical count is clamped up to the loaded row
 * count, and the window offset is clamped into `[0, count - loaded]`. `null`
 * when the strategy declares no remote extent — the loaded rows are the extent.
 */
const resolveLogicalExtent = (strategy, loadedRowCount) => {
    const logicalRowCount = strategy.logicalRowCount?.() ?? null;
    if (logicalRowCount === null) {
        return null;
    }
    if (!Number.isInteger(logicalRowCount) || logicalRowCount < 0) {
        warnOnce('logical-count', `unusable logicalRowCount ${logicalRowCount}; treating the loaded rows as the full extent.`);
        return null;
    }
    const rowCount = Math.max(logicalRowCount, loadedRowCount);
    const suppliedOffset = strategy.rowWindowOffset?.() ?? 0;
    const windowOffset = Number.isInteger(suppliedOffset) ? Math.min(Math.max(suppliedOffset, 0), rowCount - loadedRowCount) : 0;
    if (windowOffset !== suppliedOffset) {
        warnOnce('window-offset', `rowWindowOffset ${suppliedOffset} does not fit the logical extent; clamping to ${windowOffset}.`);
    }
    return { rowCount, windowOffset };
};
/**
 * Body plan for the table template. No strategy — the default — renders every
 * row with no spacers. A strategy declaring a remote `logicalRowCount` renders
 * a placeholder entry for every mounted logical index outside the loaded
 * window. See `NatTableRowRenderStrategy` for the contract.
 */
const buildNatTableBodyRenderPlan = (rows, strategy) => {
    if (!strategy) {
        return renderAllRows(rows, 0);
    }
    const extent = resolveLogicalExtent(strategy, rows.length);
    const rowCount = extent?.rowCount ?? rows.length;
    const windowOffset = extent?.windowOffset ?? 0;
    const rowHeight = strategy.rowHeight();
    const totalSize = strategy.totalSize();
    if (!Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(totalSize) || totalSize < rowCount * rowHeight) {
        warnOnce('metrics', `unusable metrics (rowHeight ${rowHeight}, totalSize ${totalSize}, rows ${rowCount}); rendering every loaded row.`);
        return renderAllRows(rows, windowOffset);
    }
    const supplied = strategy.items();
    const items = supplied
        .filter((item) => isUsableVirtualItem(item, rowCount, totalSize))
        .sort((left, right) => left.index - right.index);
    if (rowCount > 0 && items.length === 0) {
        warnOnce('empty', 'no usable items for a non-empty row model; rendering every loaded row.');
        return renderAllRows(rows, windowOffset);
    }
    const renderedRows = [];
    let previousEnd = 0;
    let previousIndex = -1;
    for (const item of items) {
        if (item.index === previousIndex || item.start < previousEnd) {
            continue;
        }
        const loadedIndex = item.index - windowOffset;
        const row = loadedIndex >= 0 && loadedIndex < rows.length ? rows[loadedIndex] : undefined;
        const beforeSize = Math.max(0, item.start - previousEnd);
        previousIndex = item.index;
        renderedRows.push(row === undefined
            ? { kind: 'placeholder', logicalIndex: item.index, beforeSize }
            : { kind: 'row', row, logicalIndex: item.index, beforeSize });
        previousEnd = Math.max(previousEnd, item.end);
    }
    if (renderedRows.length < supplied.length) {
        // Covers both rejection paths: unusable shape, and duplicate/overlapping
        // extents dropped by the walk above.
        warnOnce('items', `${supplied.length - renderedRows.length} of ${supplied.length} items discarded; indices must be unique in-range integers and extents finite and increasing.`);
    }
    return { rows: renderedRows, afterSize: Math.max(0, totalSize - previousEnd) };
};

const uniqueStringValues = (values) => {
    const seen = new Set();
    return values.filter((value) => {
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};
const normalizeColumnOrder = (columnOrder, allLeafColumnIds) => {
    const validColumnIds = new Set(allLeafColumnIds);
    const nextOrder = uniqueStringValues(columnOrder.filter((columnId) => validColumnIds.has(columnId)));
    for (const columnId of allLeafColumnIds) {
        if (!nextOrder.includes(columnId)) {
            nextOrder.push(columnId);
        }
    }
    return nextOrder;
};
/**
 * User-state variant of `normalizeColumnOrder`: unknown column ids are retained in
 * place instead of dropped, so state referencing columns the current renderer does
 * not have (e.g. a table/list swap with different column sets) survives the swap.
 * Leaf ids missing from the order are still appended.
 */
const retainColumnOrder = (columnOrder, allLeafColumnIds) => {
    const nextOrder = uniqueStringValues(columnOrder);
    for (const columnId of allLeafColumnIds) {
        if (!nextOrder.includes(columnId)) {
            nextOrder.push(columnId);
        }
    }
    return nextOrder;
};
/**
 * User-state variant of `normalizeColumnPinning`: zones are deduplicated but unknown
 * column ids are retained, so pinning that references columns the current renderer
 * does not have survives a renderer swap. Render-facing state stays on
 * `normalizeColumnPinning`.
 */
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
    // `.at(0)` on the removed-elements array is honestly typed `string | undefined`:
    // an out-of-range fromIndex makes splice return [], so movedValue is undefined.
    const movedValue = nextValues.splice(fromIndex, 1).at(0);
    if (movedValue === undefined)
        return nextValues;
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
        if (!movableIds.has(columnId)) {
            return columnId;
        }
        return nextValues.shift() ?? columnId;
    });
};
const hasSameStringOrder = (left, right) => {
    if (left.length !== right.length) {
        return false;
    }
    return left.every((value, index) => value === right[index]);
};
/** Accumulates sticky pinned offsets in iteration order: each column's offset is the running width sum before it. */
const accumulatePinnedOffsets = (columns, widths) => {
    const offsets = {};
    let offset = 0;
    for (const column of columns) {
        offsets[column.id] = offset;
        offset += widths[column.id] ?? 0;
    }
    return offsets;
};
/** Resolves a pinning zone's column ids to their visible Column objects, preserving order. */
const resolvePinnedZoneColumns = (zoneColumnIds, visibleColumnsById) => (zoneColumnIds ?? [])
    .map((columnId) => visibleColumnsById.get(columnId))
    .filter((column) => !!column);
/** Maps a column's pin state to its reorder zone. */
const getColumnZone = (column) => {
    const pinnedState = column.getIsPinned();
    if (pinnedState === 'left') {
        return 'left';
    }
    if (pinnedState === 'right') {
        return 'right';
    }
    return 'center';
};

const normalizeColumnLabel = (label) => {
    const normalized = label?.trim() ?? '';
    return normalized || null;
};
const resolveColumnLabel = (column) => {
    const hiddenHeaderLabel = normalizeColumnLabel(column.columnDef.meta?.hiddenHeaderLabel);
    if (hiddenHeaderLabel) {
        return hiddenHeaderLabel;
    }
    const metaLabel = normalizeColumnLabel(column.columnDef.meta?.label);
    if (metaLabel) {
        return metaLabel;
    }
    if (typeof column.columnDef.header === 'string') {
        const headerLabel = normalizeColumnLabel(column.columnDef.header);
        if (headerLabel) {
            return headerLabel;
        }
    }
    const accessorKey = column.columnDef.accessorKey;
    return typeof accessorKey === 'string' ? accessorKey : column.id || 'Column';
};
const isPrimitiveHeaderContent = (header) => {
    return typeof header === 'string' || typeof header === 'number';
};
/** Leaf column ids of a header row, skipping placeholder headers. */
const getHeaderRowColumnIds = (headerGroup) => headerGroup.headers.filter((header) => !header.isPlaceholder).map((header) => header.column.id);
/** Whether the primitive header label should be hidden in favour of the screen-reader-only label. */
const shouldHidePrimitiveHeaderLabel = (header, columnState) => !!columnState?.hiddenHeaderLabel && isPrimitiveHeaderContent(header.column.columnDef.header);

/**
 * The rendered body/header width for a column: a resized width wins (falling back to the
 * column's own size), otherwise an explicitly-sized column uses its def size, else null.
 */
const resolveColumnRenderWidth = (column, sizing, resizedWidth, widths) => {
    const hasExplicitWidth = sizing?.hasSize === true || resizedWidth !== undefined;
    if (!hasExplicitWidth) {
        return null;
    }
    const numeric = resizedWidth !== undefined ? (widths[column.id] ?? column.getSize()) : column.getSize();
    return normalizeColumnDimension(numeric);
};
/** A min/max dimension: the explicit def value when the column declares it, else the resolved width. */
const resolveSizedDimension = (hasBound, boundValue, width) => {
    if (hasBound) {
        return normalizeColumnDimension(boundValue);
    }
    return width;
};
/** Normalizes an optional meta dimension (size/height) to a CSS string or null. */
const normalizeMetaDimension = (value) => value !== undefined ? normalizeColumnDimension(value) : null;
/** A header min/max bound: the explicit meta value when set, else the resolved header width. */
const resolveHeaderBound = (metaValue, headerWidth) => {
    if (metaValue !== undefined) {
        return normalizeColumnDimension(metaValue);
    }
    return headerWidth;
};
/** Body/header width trio (width drives min/max defaults when no explicit bound is set). */
const buildColumnWidths = (column, sizing, resizedWidth, widths) => {
    const width = resolveColumnRenderWidth(column, sizing, resizedWidth, widths);
    return {
        width,
        minWidth: resolveSizedDimension(sizing?.hasMinSize === true, column.columnDef.minSize, width),
        maxWidth: resolveSizedDimension(sizing?.hasMaxSize === true, column.columnDef.maxSize, width)
    };
};
/** Header width trio. A user-resized column drives the header too; otherwise header-only meta sizing applies. */
const buildHeaderWidths = (meta, resizedDimension) => {
    const headerWidth = resizedDimension ?? normalizeMetaDimension(meta?.headerSize);
    return {
        headerWidth,
        headerMinWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMinSize, headerWidth),
        headerMaxWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMaxSize, headerWidth)
    };
};

/** Pinned-edge flags and sticky offsets for a column within its zone. */
const buildPinnedEdges = (column, context) => {
    const pinnedLeft = context.leftPinnedIds.has(column.id);
    const pinnedRight = context.rightPinnedIds.has(column.id);
    return {
        pinnedLeft,
        pinnedRight,
        hasPinnedEdgeLeft: pinnedLeft && context.leftVisibleColumns.at(-1)?.id === column.id,
        hasPinnedEdgeRight: pinnedRight && context.rightVisibleColumns.at(0)?.id === column.id,
        left: pinnedLeft ? (context.leftOffsets[column.id] ?? 0) : null,
        right: pinnedRight ? (context.rightOffsets[column.id] ?? 0) : null
    };
};
/** The primary (first) sort entry for a column, or null when it is not the primary sort. */
const findPrimarySortEntry = (context, columnId) => {
    if (context.primarySortColumnId !== columnId) {
        return null;
    }
    return context.state.sorting.find((entry) => entry.id === columnId) ?? null;
};
/** Maps the primary sort entry to its aria-sort value. */
const resolveAriaSort = (primarySortEntry) => {
    if (!primarySortEntry) {
        return null;
    }
    return primarySortEntry.desc ? 'descending' : 'ascending';
};
/** Joins truthy entries into a space-separated class string. */
const buildClassMap = (entries) => entries.filter(Boolean).join(' ');
/** Header class map for a column's `<th>`. */
const buildHeaderClassMap = (edges, flags) => buildClassMap([
    'header-cell',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    flags.alignEnd && 'is-align-end',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    flags.headerConstrainedWidth && 'is-width-constrained'
]);
/** Cell class map for a column's `<td>` / row-header `<th>`. */
const buildCellClassMap = (edges, flags) => buildClassMap([
    'data-cell',
    flags.isRowHeader && 'data-row-header',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    flags.alignEnd && 'is-align-end',
    flags.cellClamped && 'is-cell-clamped',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    flags.constrainedWidth && 'is-width-constrained'
]);
/** Builds one column's full render state from the shared context. */
const buildColumnRenderState = (column, context) => {
    const { state, userColumnSizing, widths } = context;
    const sizing = userColumnSizing[column.id];
    const resizedWidth = readColumnEntry(state.columnSizing, column.id);
    const meta = column.columnDef.meta;
    const { width, minWidth, maxWidth } = buildColumnWidths(column, sizing, resizedWidth, widths);
    const resizedDimension = resizedWidth !== undefined ? width : null;
    const { headerWidth, headerMinWidth, headerMaxWidth } = buildHeaderWidths(meta, resizedDimension);
    const edges = buildPinnedEdges(column, context);
    const primarySortEntry = findPrimarySortEntry(context, column.id);
    const cellMaxLines = normalizeCellMaxLines(meta?.cellMaxLines ?? DEFAULT_CELL_MAX_LINES);
    const flags = {
        alignEnd: meta?.align === 'end',
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
        headerClassMap: buildHeaderClassMap(edges, flags),
        cellClassMap: buildCellClassMap(edges, flags)
    };
};

/**
 * Fill-flex widths: resized columns keep their clamped width, unresized columns
 * share the remaining region surplus weighted by their intrinsic size.
 */
const computeFillFlexWidths = (visibleColumns, columnSizing, deps) => {
    const { container, clamp, getBounds, getColumn } = deps;
    const widths = {};
    const flex = [];
    let sumPinned = 0;
    let totalWeight = 0;
    let sumFlexMins = 0;
    for (const column of visibleColumns) {
        const resizedWidth = readColumnEntry(columnSizing, column.id);
        if (resizedWidth !== undefined) {
            const width = clamp(column, resizedWidth);
            widths[column.id] = width;
            sumPinned += width;
        }
        else {
            const rawSize = column.getSize();
            // A NaN size must not poison the shared `totalWeight` (and thus every flex
            // column's distributed width). Fall back to the floor weight of 1, matching
            // the safe default the maxSize path already guards for with `Number.isFinite`.
            const weight = Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1;
            const min = getBounds(column).min;
            flex.push({ id: column.id, weight, min });
            totalWeight += weight;
            sumFlexMins += min;
        }
    }
    if (flex.length === 0) {
        return widths;
    }
    const surplus = Math.max(0, container - sumPinned - sumFlexMins);
    let distributedSurplus = 0;
    flex.forEach(({ id, weight, min }, index) => {
        const extra = index === flex.length - 1 ? surplus - distributedSurplus : Math.floor((surplus * weight) / totalWeight);
        distributedSurplus += extra;
        const flexColumn = getColumn(id);
        const flexMax = flexColumn ? getBounds(flexColumn).max : null;
        const width = min + Math.max(0, extra);
        widths[id] = flexMax !== null ? Math.min(width, flexMax) : width;
    });
    return widths;
};
/** Per-column intrinsic width used when the table does not fill-flex. */
const resolveIntrinsicColumnWidth = (column, context, clamp) => {
    const { measuredWidth, sizing, resizedWidth, usesAuthoritativeLayout } = context;
    if (resizedWidth !== undefined) {
        return clamp(column, resizedWidth);
    }
    if (!usesAuthoritativeLayout && measuredWidth !== undefined && measuredWidth > 0) {
        return measuredWidth;
    }
    const rawSize = column.getSize();
    const fixedWidth = sizing?.hasSize === true ? getNumericColumnWidth(rawSize) : null;
    // Guard NaN so the floor-at-one default stays a real safe fallback instead of
    // silently propagating NaN through as a resolved width.
    const defaultWidth = Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1;
    return fixedWidth ?? defaultWidth;
};
/** Intrinsic widths for every visible column (resized width wins, else measured, else def size). */
const computeIntrinsicWidths = (visibleColumns, columnSizing, deps) => {
    const { measured, userSizing, usesAuthoritativeLayout, clamp } = deps;
    const result = {};
    for (const column of visibleColumns) {
        result[column.id] = resolveIntrinsicColumnWidth(column, {
            measuredWidth: measured[column.id],
            sizing: userSizing[column.id],
            resizedWidth: columnSizing[column.id],
            usesAuthoritativeLayout
        }, clamp);
    }
    return result;
};

const DEFAULT_ROW_ID_INDEX_PREFIX = '__nat-table-row-index__:';
const MAX_FILTER_VALUE_NODES = 10_000;
const primitiveMatchesFilterQuery = (value, normalizedQuery) => {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && typeof value !== 'bigint') {
        return false;
    }
    return String(value).toLowerCase().includes(normalizedQuery);
};
const dateMatchesFilterQuery = (value, normalizedQuery) => value instanceof Date && Number.isFinite(value.getTime()) && value.toISOString().toLowerCase().includes(normalizedQuery);
const isNullish = (value) => value === null || value === undefined;
const shouldSkipArrayTraversal = (value, visitedArrays) => !Array.isArray(value) || visitedArrays.has(value);
const resolveDefaultRowId = (row, index, parent) => {
    const id = typeof row === 'object' && row !== null ? row.id : undefined;
    if (typeof id === 'string' && id.trim()) {
        return id;
    }
    if (typeof id === 'number' && Number.isFinite(id)) {
        return String(id);
    }
    const fallbackId = `${DEFAULT_ROW_ID_INDEX_PREFIX}${index}`;
    return parent ? `${parent.id}.${fallbackId}` : fallbackId;
};
/** Collapses a multi-row selection map to its first selected key by sort order in single mode. */
const normalizeRowSelection = (selection, allowMulti) => {
    if (allowMulti) {
        return selection;
    }
    const selectedIds = Object.keys(selection)
        .filter((id) => selection[id])
        .sort();
    if (selectedIds.length <= 1) {
        return selection;
    }
    return { [selectedIds[0]]: true };
};
const serializeRowSelection = (selection) => {
    return Object.keys(selection)
        .filter((id) => selection[id])
        .sort()
        .join('|');
};
const normalizeDataStatus = (status) => {
    return status === NAT_TABLE_DATA_STATUS.loading || status === NAT_TABLE_DATA_STATUS.error ? status : NAT_TABLE_DATA_STATUS.success;
};
const matchesFilterQuery = (value, query) => {
    const normalizedQuery = query.toLowerCase();
    const pendingValues = [value];
    const visitedArrays = new WeakSet();
    let examinedNodes = 0;
    while (pendingValues.length > 0 && examinedNodes < MAX_FILTER_VALUE_NODES) {
        const currentValue = pendingValues.pop();
        examinedNodes += 1;
        if (isNullish(currentValue)) {
            continue;
        }
        if (primitiveMatchesFilterQuery(currentValue, normalizedQuery) || dateMatchesFilterQuery(currentValue, normalizedQuery)) {
            return true;
        }
        if (currentValue instanceof Date) {
            continue;
        }
        if (shouldSkipArrayTraversal(currentValue, visitedArrays)) {
            continue;
        }
        // The traversal guard above narrows at runtime; this branch is only reached for arrays.
        const currentArray = currentValue;
        visitedArrays.add(currentArray);
        const remainingCapacity = MAX_FILTER_VALUE_NODES - examinedNodes - pendingValues.length;
        const scheduledItemCount = Math.min(currentArray.length, Math.max(remainingCapacity, 0));
        for (let index = scheduledItemCount - 1; index >= 0; index -= 1) {
            pendingValues.push(currentArray[index]);
        }
    }
    return false;
};
const hasSameWidths = (left, right) => {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
        return false;
    }
    for (const key of leftKeys) {
        if (left[key] !== right[key]) {
            return false;
        }
    }
    return true;
};
const hasSameColumnVisibility = (current, next) => {
    if (current.length !== next.length) {
        return false;
    }
    // Intentionally ignores label changes so swapping i18n labels (or any other
    // purely cosmetic column-def change) does not flow through to a misleading
    // visibility announcement on the live region.
    return current.every((column) => {
        const nextColumn = next.find((candidate) => candidate.id === column.id);
        if (!nextColumn) {
            return false;
        }
        return nextColumn.visible === column.visible;
    });
};

const genericGlobalFilter = (row, columnId, filterValue) => {
    const query = String(filterValue ?? '')
        .trim()
        .toLowerCase();
    if (!query) {
        return true;
    }
    return matchesFilterQuery(row.getValue(columnId), query) || matchesFilterQuery(row.id, query);
};

/** Keyboard keys that drive a column resize (Alt+Arrow steps; Alt+Home/End jump to bounds). */
const RESIZE_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);
/** Whether a keyboard event's key is one of the column-resize keys. */
const isResizeKey = (event) => RESIZE_KEYS.has(event.key);
/**
 * Whether a column resolves to resizable: its own `enableResizing` flag when set,
 * otherwise the surface enabler. Surface on → resizable unless the column opts out
 * with `enableResizing: false`; surface off → not resizable unless the column opts
 * in with `enableResizing: true`.
 */
const isColumnResizable = (column, surfaceEnabled) => column.columnDef.enableResizing ?? surfaceEnabled;
/**
 * Whether a column resolves to reorderable: its own `meta.reorderable` flag when set,
 * otherwise the surface enabler. Surface on → reorderable unless the column opts out
 * with `meta.reorderable: false`; surface off → not reorderable (drag, keyboard, menu)
 * unless the column opts in with `meta.reorderable: true`.
 */
const isColumnReorderable = (column, surfaceEnabled) => column.columnDef.meta?.reorderable ?? surfaceEnabled;
/** A non-placeholder header whose column resolves to resizable under the surface enabler. */
const canResizeColumn = (header, surfaceEnabled) => !header.isPlaceholder && isColumnResizable(header.column, surfaceEnabled);
/** Resolves the per-cell tone from the column's `meta.cellTone` callback. */
const getCellTone = (column, context) => column.columnDef.meta?.cellTone?.(context) ?? null;
/** Resolves which column id a header drag moved, falling back to the source row slot. */
const resolveDraggedColumnId = (event, rowColumnIds) => {
    const draggedColumnId = event.item.data;
    if (typeof draggedColumnId === 'string' && rowColumnIds.includes(draggedColumnId)) {
        return draggedColumnId;
    }
    return rowColumnIds[event.previousIndex] ?? null;
};
/** Whether the event originated from an interactive descendant of the current target. */
const originatesFromInteractiveDescendant = (event) => {
    const target = event.target;
    const currentTarget = event.currentTarget;
    if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
        return false;
    }
    const interactive = target.closest(ROW_ACTIVATE_INTERACTIVE_SELECTOR);
    if (!interactive) {
        return false;
    }
    return interactive !== currentTarget && currentTarget.contains(interactive);
};
/** Scrolls `element` just into view horizontally within `scrollContainer`. */
const scrollElementHorizontallyIntoView = (scrollContainer, element) => {
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (elementRect.left < containerRect.left) {
        scrollContainer.scrollLeft -= containerRect.left - elementRect.left;
        return;
    }
    if (elementRect.right > containerRect.right) {
        scrollContainer.scrollLeft += elementRect.right - containerRect.right;
    }
};

/** Removes duplicate sort entries by id, keeping the first occurrence. */
const dedupeSortEntries = (sorting) => {
    const seen = new Set();
    const deduped = [];
    for (const entry of sorting) {
        if (seen.has(entry.id)) {
            continue;
        }
        seen.add(entry.id);
        deduped.push(entry);
    }
    return deduped;
};
const normalizeSortingState = (sorting, allowMulti) => {
    if (!sorting.length) {
        return sorting;
    }
    const deduped = dedupeSortEntries(sorting);
    if (allowMulti) {
        // No duplicates removed → preserve the original reference for change detection.
        return deduped.length === sorting.length ? sorting : deduped;
    }
    const normalized = deduped.slice(0, 1);
    if (normalized.length === sorting.length && normalized[0] === sorting[0]) {
        return sorting;
    }
    const single = normalized[0];
    const original = sorting[0];
    if (normalized.length === 1 && sorting.length === 1 && single.id === original.id && single.desc === original.desc) {
        return sorting;
    }
    return normalized;
};
const serializeSorting = (sorting) => {
    return sorting.map((entry) => `${entry.id}:${entry.desc ? 'desc' : 'asc'}`).join('|');
};
// Filter values are expected to be JSON-serializable consumer state. This guard
// only keeps accessibility snapshotting from crashing when a consumer passes an
// unsupported value; it does not try to define semantics for arbitrary objects.
const serializeColumnFilterValue = (value) => {
    try {
        const serialized = JSON.stringify(value);
        return serialized ?? String(value);
    }
    catch {
        return '[unserializable]';
    }
};
const serializeColumnFilters = (columnFilters) => {
    return columnFilters.map((entry) => `${entry.id}:${serializeColumnFilterValue(entry.value)}`).join('|');
};
/** Maps a `desc` flag to its sort-direction announcement value. */
const sortDirection = (desc) => (desc ? 'descending' : 'ascending');
/** Maps active filter sources to the announcement filter-state value. */
const resolveFilterState = (hasGlobalFilter, hasColumnFilters) => {
    if (hasGlobalFilter) {
        return hasColumnFilters ? 'global-and-column' : 'global';
    }
    return hasColumnFilters ? 'column' : 'none';
};

const isUnavailableRequiredInputError = (error) => {
    return error instanceof Error && Math.abs(error.code ?? 0) === 950;
};
/** Resolves a TanStack `Updater<T>` (value or function) against the current value. */
const resolveUpdater = (currentValue, updater) => {
    if (updater === undefined) {
        return currentValue;
    }
    return updater instanceof Function ? updater(currentValue) : updater;
};
/** Resets pagination to the first page while preserving page size. */
const firstPageUpdater = (currentPagination) => ({
    ...currentPagination,
    pageIndex: 0
});
/**
 * Reads a required signal input, returning `fallback` while the input is still
 * unavailable (Angular throws NG0950 before the first binding). Re-throws anything else.
 */
const readRequiredInput = (reader, fallback) => {
    try {
        return reader();
    }
    catch (error) {
        if (isUnavailableRequiredInputError(error)) {
            return fallback;
        }
        throw error;
    }
};
/** Returns `value` when defined, otherwise `fallback` (kept as a call so callers stay `??`-free). */
const orDefault = (value, fallback) => value ?? fallback;
/**
 * Fills every slice of a partial initial state from `defaults`, leaving the caller to
 * apply `this`-dependent normalization (sorting/selection) and the globalFilter gate.
 */
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

/**
 * Prepends the forced ascending sub-header entry to the user sorting. Returns
 * the input unchanged (same reference) when no sub-header column is active.
 * A user entry for the same column is dropped so the forced entry stays primary.
 */
const prependForcedSortingEntry = (userSorting, columnId) => {
    if (columnId === null) {
        return userSorting;
    }
    return [{ id: columnId, desc: false }, ...userSorting.filter((entry) => entry.id !== columnId)];
};
/**
 * Removes the forced sub-header entry from a TanStack-facing sorting state,
 * yielding the user-visible sorting. Preserves the input reference when the
 * forced entry is absent.
 */
const stripNatTableSubHeaderSorting = (sorting, columnId) => {
    if (columnId === null) {
        return sorting;
    }
    const stripped = sorting.filter((entry) => entry.id !== columnId);
    return stripped.length === sorting.length ? sorting : stripped;
};
/** Numeric ascending compare with NaN sorted last. */
const compareNumbersAscending = (a, b) => {
    if (Number.isNaN(a)) {
        return Number.isNaN(b) ? 0 : 1;
    }
    if (Number.isNaN(b)) {
        return -1;
    }
    if (a === b) {
        return 0;
    }
    return a > b ? 1 : -1;
};
/**
 * Natural ascending compare used for values outside the configured order:
 * numbers compare numerically, everything else by case-insensitive string.
 */
const compareNaturalAscending = (a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
        return compareNumbersAscending(a, b);
    }
    const aText = String(a ?? '').toLowerCase();
    const bText = String(b ?? '').toLowerCase();
    if (aText === bText) {
        return 0;
    }
    return aText > bText ? 1 : -1;
};
/** Rank of a value in the configured order; unlisted values rank after every listed one. */
const resolveOrderRank = (order, value) => {
    // findIndex + Object.is instead of indexOf, so a listed NaN still matches.
    const rank = order.findIndex((candidate) => Object.is(candidate, value));
    return rank === -1 ? order.length : rank;
};
/**
 * Builds the TanStack sorting function for a consumer-supplied sub-header
 * value order. Listed values sort in array order; unlisted values sort after
 * all listed ones in natural ascending order. Equal listed ranks compare as
 * equal so secondary user sort entries decide the order within a group.
 */
const createSubHeaderOrderSortingFn = (order) => {
    return (rowA, rowB, columnId) => {
        const valueA = rowA.getValue(columnId);
        const valueB = rowB.getValue(columnId);
        const rankA = resolveOrderRank(order, valueA);
        const rankB = resolveOrderRank(order, valueB);
        if (rankA !== rankB) {
            return rankA < rankB ? -1 : 1;
        }
        return rankA === order.length ? compareNaturalAscending(valueA, valueB) : 0;
    };
};
/**
 * Maps each page row that starts a sub-header group segment (the first page
 * row, or any row whose sub-header value differs from the previous row) to its
 * group. Keyed by the starting row's id so the template can look segments up
 * during row iteration. Group row counts come from the pre-pagination rows so
 * a group spanning pages reports its full size.
 */
const buildSubHeaderRowGroups = (pageRows, prePaginationRows, columnId) => {
    const groups = new Map();
    if (!pageRows.length) {
        return groups;
    }
    // Map keys use SameValueZero, so a NaN group still counts correctly.
    const groupRowCounts = new Map();
    for (const row of prePaginationRows) {
        const value = row.getValue(columnId);
        groupRowCounts.set(value, (groupRowCounts.get(value) ?? 0) + 1);
    }
    let previousValue;
    let hasPreviousValue = false;
    for (const row of pageRows) {
        const value = row.getValue(columnId);
        if (!hasPreviousValue || !Object.is(value, previousValue)) {
            groups.set(row.id, { value, rowCountValue: groupRowCounts.get(value) ?? 0, row });
        }
        previousValue = value;
        hasPreviousValue = true;
    }
    return groups;
};
/** Human-readable text for a sub-header group value used in generated announcement copy. */
const resolveSubHeaderValueText = (value) => (value == null ? '' : String(value));
/**
 * Prefix sum of sub-header rows rendered at or before each page row, by page
 * index; see `NatTableRowWindowHost.subHeaderRowOffsets` for why the offsets
 * cannot come from the DOM. Empty when no sub-header renders, so the common
 * case allocates nothing per row model.
 */
const buildSubHeaderRowOffsets = (pageRows, groups) => {
    if (groups.size === 0) {
        return [];
    }
    let renderedSubHeaders = 0;
    return pageRows.map((row) => {
        if (groups.has(row.id)) {
            renderedSubHeaders += 1;
        }
        return renderedSubHeaders;
    });
};

/* eslint-disable max-lines -- irreducible per-instance reactive store: a single @Injectable owns the signal graph + TanStack table instance; further splitting only relocates coupling into cross-service signal reads and Injector.get() cycles. Pure arithmetic (widths, resize math, const defaults) already extracted to utils/common. */
// ─── Constants ───
let nextTableId = 0;
/**
 * Per-table state store that owns TanStack table creation, all internal state
 * signals, column width resolution, resize/reorder state logic, and derived
 * computeds.
 *
 * The `NatTable` component and its companion directives consume this store's
 * signals for rendering and delegate user actions to its methods.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableState]), not root.
class NatTableState {
    natTableService = inject(NatTableService);
    directionality = inject(Directionality, { optional: true });
    // `self` keeps a nested renderer from inheriting the outer table's window;
    // `optional` covers renderers that provide no registry (NatList).
    rowRenderStrategies = inject(NatTableRowRenderStrategyRegistry, { optional: true, self: true });
    rowRenderStrategy = computed(() => this.rowRenderStrategies?.strategy() ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowRenderStrategy" }] : /* istanbul ignore next */ []));
    hasRowRenderStrategy = computed(() => this.rowRenderStrategy() !== null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasRowRenderStrategy" }] : /* istanbul ignore next */ []));
    /**
     * Remote row count declared by the row-render strategy, or `null` when the
     * loaded row model is the full extent. Deliberately not clamped against the
     * row model: this computed feeds the TanStack options `meta`, and reading
     * `bodyRows` here would read the table from inside its own options.
     */
    strategyLogicalRowCount = computed(() => {
        const logicalRowCount = this.rowRenderStrategy()?.logicalRowCount?.() ?? null;
        return logicalRowCount !== null && Number.isInteger(logicalRowCount) && logicalRowCount >= 0 ? logicalRowCount : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "strategyLogicalRowCount" }] : /* istanbul ignore next */ []));
    /** `strategyLogicalRowCount` clamped so the loaded rows always fit inside it. */
    remoteRowCount = computed(() => {
        const logicalRowCount = this.strategyLogicalRowCount();
        return logicalRowCount === null ? null : Math.max(logicalRowCount, this.bodyRows().length);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "remoteRowCount" }] : /* istanbul ignore next */ []));
    /** `NatTableRowWindowHost` bridge; keeps the cell-interaction predicate internal. */
    isDelegatedCellControl(cell, target) {
        return isNatTableDelegatedCellControl(cell, target);
    }
    // ─── Input bridging signals (written by the NatTable component) ───
    /** The row data signal, set from the component's required input. */
    data = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    /** The column definitions signal, set from the component's required input. */
    columnDefs = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnDefs" }] : /* istanbul ignore next */ []));
    /** Data lifecycle status, set from the component's input. */
    dataStatus = signal(NAT_TABLE_DATA_STATUS.success, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []));
    /** Optional error payload, set from the component's input. */
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** Whether row selection is enabled, set from the component's input. */
    enableRowSelection = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableRowSelection" }] : /* istanbul ignore next */ []));
    /** Selection cardinality, set from the component's input. */
    selectionMode = signal('multiple', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    /** Optional global filter function override. */
    globalFilterFn = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "globalFilterFn" }] : /* istanbul ignore next */ []));
    /** Optional row id resolver. */
    getRowId = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "getRowId" }] : /* istanbul ignore next */ []));
    /** Accessible name when no caption. */
    accessibleName = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    /** Visible table caption. */
    caption = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []));
    /** Whether to emit row render timing events. */
    emitRowRenderEvents = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emitRowRenderEvents" }] : /* istanbul ignore next */ []));
    /** Leaf column id whose value groups rows under sub-header rows, set from the component's input. */
    subHeaderColumn = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []));
    /** Optional explicit sub-header group value order, set from the component's input. */
    subHeaderOrder = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []));
    /** Renderer-level sub-header gate: false ignores the sub-header config entirely. */
    enableSubHeaders = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableSubHeaders" }] : /* istanbul ignore next */ []));
    // ─── Service-derived computeds ───
    initialState = computed(() => this.natTableService.surfaceInitialState(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initialState" }] : /* istanbul ignore next */ []));
    state = computed(() => this.natTableService.state(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    enablePagination = computed(() => this.natTableService.hasPagination(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enablePagination" }] : /* istanbul ignore next */ []));
    enableGlobalFilter = computed(() => this.natTableService.hasSearch(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableGlobalFilter" }] : /* istanbul ignore next */ []));
    manualPagination = computed(() => this.natTableService.manualPagination(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualPagination" }] : /* istanbul ignore next */ []));
    manualSorting = computed(() => this.natTableService.manualSorting(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualSorting" }] : /* istanbul ignore next */ []));
    manualFiltering = computed(() => this.natTableService.manualFiltering(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualFiltering" }] : /* istanbul ignore next */ []));
    manualPageCount = computed(() => this.natTableService.manualPageCount(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "manualPageCount" }] : /* istanbul ignore next */ []));
    enableAnnouncements = computed(() => this.natTableService.enableAnnouncements(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableAnnouncements" }] : /* istanbul ignore next */ []));
    stickyHeader = computed(() => this.natTableService.stickyHeader(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stickyHeader" }] : /* istanbul ignore next */ []));
    enableMultiSort = computed(() => this.natTableService.enableMultiSort(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableMultiSort" }] : /* istanbul ignore next */ []));
    locale = computed(() => this.natTableService.locale(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    accessibilityText = computed(() => this.natTableService.accessibilityText(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibilityText" }] : /* istanbul ignore next */ []));
    columnResizeMode = computed(() => this.natTableService.columnResizeMode(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnResizeMode" }] : /* istanbul ignore next */ []));
    columnSizingMode = computed(() => this.natTableService.columnSizingMode(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnSizingMode" }] : /* istanbul ignore next */ []));
    resizingEnabled = computed(() => this.natTableService.enableColumnResizing(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resizingEnabled" }] : /* istanbul ignore next */ []));
    enableReordering = computed(() => this.natTableService.enableReordering(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableReordering" }] : /* istanbul ignore next */ []));
    enableSorting = computed(() => this.natTableService.enableSorting(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enableSorting" }] : /* istanbul ignore next */ []));
    enablePinning = computed(() => this.natTableService.enablePinning(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enablePinning" }] : /* istanbul ignore next */ []));
    isFixedLayout = computed(() => this.columnSizingMode() === 'fixed', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isFixedLayout" }] : /* istanbul ignore next */ []));
    direction = computed(() => this.natTableService.direction(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "direction" }] : /* istanbul ignore next */ []));
    // ─── Internal state signals ───
    internalSorting = signal(DEFAULT_TABLE_STATE.sorting, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalSorting" }] : /* istanbul ignore next */ []));
    internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalGlobalFilter" }] : /* istanbul ignore next */ []));
    internalColumnFilters = signal(DEFAULT_TABLE_STATE.columnFilters, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalColumnFilters" }] : /* istanbul ignore next */ []));
    internalColumnVisibility = signal(DEFAULT_TABLE_STATE.columnVisibility, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalColumnVisibility" }] : /* istanbul ignore next */ []));
    internalColumnOrder = signal(DEFAULT_TABLE_STATE.columnOrder, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalColumnOrder" }] : /* istanbul ignore next */ []));
    internalColumnPinning = signal(DEFAULT_TABLE_STATE.columnPinning, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalColumnPinning" }] : /* istanbul ignore next */ []));
    internalColumnSizing = signal(DEFAULT_TABLE_STATE.columnSizing, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalColumnSizing" }] : /* istanbul ignore next */ []));
    resizeSeedSizing = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resizeSeedSizing" }] : /* istanbul ignore next */ []));
    internalRowSelection = signal(DEFAULT_TABLE_STATE.rowSelection, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalRowSelection" }] : /* istanbul ignore next */ []));
    internalPagination = signal(DEFAULT_TABLE_STATE.pagination, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "internalPagination" }] : /* istanbul ignore next */ []));
    hasSeededInitialState = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasSeededInitialState" }] : /* istanbul ignore next */ []));
    // ─── Stable DOM id ───
    tableElementId = signal(`nat-table-${nextTableId++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableElementId" }] : /* istanbul ignore next */ []));
    // ─── ARIA element ids ───
    tableCaptionId = computed(() => `${this.tableElementId()}-caption`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableCaptionId" }] : /* istanbul ignore next */ []));
    tableSummaryId = computed(() => `${this.tableElementId()}-summary`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableSummaryId" }] : /* istanbul ignore next */ []));
    tableDescriptionId = computed(() => `${this.tableElementId()}-description`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableDescriptionId" }] : /* istanbul ignore next */ []));
    tableKeyboardInstructionsId = computed(() => `${this.tableElementId()}-instructions`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableKeyboardInstructionsId" }] : /* istanbul ignore next */ []));
    // ─── Intl/locale ───
    tableIntlConfig = inject(NAT_TABLE_INTL);
    localeId = computed(() => this.locale() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    tableIntl = computed(() => resolveNatTableIntl(this.tableIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableIntl" }] : /* istanbul ignore next */ []));
    resolvedAccessibilityText = computed(() => mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.accessibilityText()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedAccessibilityText" }] : /* istanbul ignore next */ []));
    // ─── Derived column state ───
    allLeafColumnIds = computed(() => getColumnDefLeafIds(this.columnDefs()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allLeafColumnIds" }] : /* istanbul ignore next */ []));
    userColumnSizing = computed(() => getUserColumnSizing(this.columnDefs()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "userColumnSizing" }] : /* istanbul ignore next */ []));
    // ─── Sub-header grouping ───
    /** Active sub-header leaf column id, or null when disabled, unset, or not a leaf column. */
    resolvedSubHeaderColumnId = computed(() => {
        const columnId = this.subHeaderColumn();
        if (!this.enableSubHeaders() || columnId === undefined || columnId === '') {
            return null;
        }
        return this.allLeafColumnIds().includes(columnId) ? columnId : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedSubHeaderColumnId" }] : /* istanbul ignore next */ []));
    /**
     * Column defs handed to TanStack: when a sub-header value order is set, the
     * sub-header column carries the order-aware sorting function; otherwise the
     * consumer defs pass through by reference.
     */
    resolvedColumnDefs = computed(() => {
        const columnId = this.resolvedSubHeaderColumnId();
        const order = this.subHeaderOrder();
        if (columnId === null || !order?.length) {
            return this.columnDefs();
        }
        return patchLeafColumnDefSorting(this.columnDefs(), columnId, createSubHeaderOrderSortingFn(order));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedColumnDefs" }] : /* istanbul ignore next */ []));
    // User-facing order/pinning retain ids unknown to this renderer's columns, so
    // shared surface state survives a renderer swap (e.g. table <-> list with
    // different column sets). Only the TanStack-facing state below filters them.
    resolvedColumnOrder = computed(() => retainColumnOrder(this.state().columnOrder ?? this.internalColumnOrder(), this.allLeafColumnIds()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedColumnOrder" }] : /* istanbul ignore next */ []));
    resolvedColumnPinning = computed(() => retainColumnPinning(this.state().columnPinning ?? this.internalColumnPinning()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedColumnPinning" }] : /* istanbul ignore next */ []));
    tanstackColumnOrder = computed(() => normalizeColumnOrder(this.resolvedColumnOrder(), this.allLeafColumnIds()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tanstackColumnOrder" }] : /* istanbul ignore next */ []));
    tanstackColumnPinning = computed(() => normalizeColumnPinning(this.resolvedColumnPinning(), this.allLeafColumnIds()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tanstackColumnPinning" }] : /* istanbul ignore next */ []));
    resolvedColumnSizing = computed(() => {
        const resolved = this.state().columnSizing ?? this.internalColumnSizing();
        const seed = this.resizeSeedSizing();
        let merged = null;
        for (const columnId of Object.keys(seed)) {
            if (!(columnId in resolved)) {
                (merged ??= { ...resolved })[columnId] = seed[columnId];
            }
        }
        return merged ?? resolved;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedColumnSizing" }] : /* istanbul ignore next */ []));
    // ─── Merged state ───
    mergedState = computed(() => ({
        sorting: normalizeSortingState(this.state().sorting ?? this.internalSorting(), this.enableMultiSort()),
        globalFilter: this.enableGlobalFilter() ? (this.state().globalFilter ?? this.internalGlobalFilter()) : '',
        columnFilters: this.state().columnFilters ?? this.internalColumnFilters(),
        columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
        columnOrder: this.resolvedColumnOrder(),
        columnPinning: this.resolvedColumnPinning(),
        columnSizing: this.resolvedColumnSizing(),
        rowSelection: normalizeRowSelection(this.state().rowSelection ?? this.internalRowSelection(), this.selectionMode() === 'multiple'),
        pagination: this.state().pagination ?? this.internalPagination()
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mergedState" }] : /* istanbul ignore next */ []));
    /**
     * Sorting handed to TanStack: the forced sub-header entry prepended to the
     * user-visible sorting. Deliberately kept out of `mergedState`, so aria-sort,
     * a11y snapshots, and `sortingChange` never see the forced entry.
     */
    tanstackSortingState = computed(() => {
        // Read the order so an order change produces a fresh sorting reference:
        // TanStack's sorted-row-model memo keys on the sorting state (not on
        // column-def sortingFn identity), so a changed order would otherwise keep
        // serving the stale sorted rows.
        this.subHeaderOrder();
        return prependForcedSortingEntry(this.mergedState().sorting, this.resolvedSubHeaderColumnId());
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tanstackSortingState" }] : /* istanbul ignore next */ []));
    // ─── Resolved a11y text / status computeds ───
    resolvedDescription = computed(() => this.resolvedAccessibilityText().description ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedDescription" }] : /* istanbul ignore next */ []));
    resolvedEmptyState = computed(() => this.resolvedAccessibilityText().emptyState ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedEmptyState" }] : /* istanbul ignore next */ []));
    resolvedLoadingState = computed(() => this.resolvedAccessibilityText().loadingState ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedLoadingState" }] : /* istanbul ignore next */ []));
    resolvedErrorState = computed(() => this.resolvedAccessibilityText().errorState ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedErrorState" }] : /* istanbul ignore next */ []));
    resolvedDataStatus = computed(() => normalizeDataStatus(this.dataStatus()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedDataStatus" }] : /* istanbul ignore next */ []));
    resolvedCaption = computed(() => this.caption()?.trim() ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedCaption" }] : /* istanbul ignore next */ []));
    resolvedDirection = computed(() => this.direction() ?? this.directionality?.value ?? 'ltr', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedDirection" }] : /* istanbul ignore next */ []));
    // ─── TanStack table instance ───
    table = createAngularTable(() => ({
        data: this.data(),
        columns: this.resolvedColumnDefs(),
        state: {
            ...this.mergedState(),
            sorting: this.tanstackSortingState(),
            columnOrder: this.tanstackColumnOrder(),
            columnPinning: this.tanstackColumnPinning()
        },
        pageCount: this.manualPagination() ? this.manualPageCount() : undefined,
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
        enableMultiRowSelection: this.selectionMode() === 'multiple',
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
        globalFilterFn: (this.globalFilterFn() ?? genericGlobalFilter),
        getRowId: (row, index, parent) => this.resolveRowId(row, index, parent),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: this.manualFiltering() ? undefined : getFilteredRowModel(),
        getSortedRowModel: this.manualSorting() ? undefined : getSortedRowModel(),
        getPaginationRowModel: !this.manualPagination() && this.enablePagination() ? getPaginationRowModel() : undefined,
        onSortingChange: (updater) => this.applySortingChange(updater),
        onGlobalFilterChange: (updater) => this.updateState({ globalFilter: updater, pagination: firstPageUpdater }),
        onColumnFiltersChange: (updater) => this.updateState({ columnFilters: updater, pagination: firstPageUpdater }),
        onColumnVisibilityChange: (updater) => this.updateState({ columnVisibility: updater }),
        onColumnOrderChange: (updater) => this.updateState({ columnOrder: updater }),
        onColumnPinningChange: (updater) => this.updateState({ columnPinning: updater }),
        onColumnSizingChange: (updater) => this.applyColumnSizingChange(updater),
        onRowSelectionChange: (updater) => this.updateState({ rowSelection: updater }),
        onPaginationChange: (updater) => this.updateState({ pagination: updater })
    }));
    // ─── Derived TanStack computeds ───
    headerGroups = computed(() => this.table.getHeaderGroups(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "headerGroups" }] : /* istanbul ignore next */ []));
    bodyRows = computed(() => this.table.getRowModel().rows, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bodyRows" }] : /* istanbul ignore next */ []));
    bodyRenderPlan = computed(() => buildNatTableBodyRenderPlan(this.bodyRows(), this.rowRenderStrategy()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bodyRenderPlan" }] : /* istanbul ignore next */ []));
    allLeafColumns = computed(() => this.table.getAllLeafColumns(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allLeafColumns" }] : /* istanbul ignore next */ []));
    hasResizableColumns = computed(() => this.allLeafColumns().some((column) => isColumnResizable(column, this.resizingEnabled())), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasResizableColumns" }] : /* istanbul ignore next */ []));
    hasReorderableColumns = computed(() => someLeafColumnDef(this.columnDefs(), (column) => column.meta?.reorderable ?? this.enableReordering()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasReorderableColumns" }] : /* istanbul ignore next */ []));
    // Physical left-to-right render order: pinned zones follow their `columnPinning`
    // array order, which `getVisibleLeafColumns()` ignores (it stays in `columnOrder`).
    // The `<colgroup>` maps `<col>` widths to columns by position, so it must match the
    // header/body order or a reordered pinned column resizes its neighbor (issue #273).
    visibleColumns = computed(() => [
        ...this.table.getLeftVisibleLeafColumns(),
        ...this.table.getCenterVisibleLeafColumns(),
        ...this.table.getRightVisibleLeafColumns()
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleColumns" }] : /* istanbul ignore next */ []));
    leafHeaderRowId = computed(() => this.table.getHeaderGroups().at(-1)?.id ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "leafHeaderRowId" }] : /* istanbul ignore next */ []));
    visibleColumnCount = computed(() => this.visibleColumns().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleColumnCount" }] : /* istanbul ignore next */ []));
    visibleRowCount = computed(() => this.bodyRows().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleRowCount" }] : /* istanbul ignore next */ []));
    totalRowCount = computed(() => this.data().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalRowCount" }] : /* istanbul ignore next */ []));
    /**
     * Logical rows the grid represents: the strategy's remote total under remote
     * windowing, otherwise the loaded row model. Drives `aria-rowcount` and the
     * rows/empty body decision, so an empty loaded window inside a non-empty
     * remote extent still renders placeholder rows instead of the empty state.
     */
    logicalRowCount = computed(() => this.remoteRowCount() ?? this.visibleRowCount(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "logicalRowCount" }] : /* istanbul ignore next */ []));
    resolvedPageCount = computed(() => {
        if (this.manualPagination()) {
            return this.manualPageCount() ?? 1;
        }
        return this.enablePagination() ? Math.max(this.table.getPageCount(), 1) : 1;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedPageCount" }] : /* istanbul ignore next */ []));
    visibleColumnIds = computed(() => this.visibleColumns()
        .map((column) => column.id)
        .join('|'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleColumnIds" }] : /* istanbul ignore next */ []));
    emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyStateColSpan" }] : /* istanbul ignore next */ []));
    tableAriaBusy = computed(() => (this.resolvedDataStatus() === NAT_TABLE_DATA_STATUS.loading ? 'true' : null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableAriaBusy" }] : /* istanbul ignore next */ []));
    bodyState = computed(() => {
        const dataStatus = this.resolvedDataStatus();
        if (dataStatus === NAT_TABLE_DATA_STATUS.error) {
            return NAT_TABLE_BODY_STATE.error;
        }
        if (dataStatus === NAT_TABLE_DATA_STATUS.loading && this.totalRowCount() === 0) {
            return NAT_TABLE_BODY_STATE.loading;
        }
        return this.logicalRowCount() > 0 ? NAT_TABLE_BODY_STATE.rows : NAT_TABLE_BODY_STATE.empty;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bodyState" }] : /* istanbul ignore next */ []));
    headerRowCount = computed(() => this.headerGroups().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "headerRowCount" }] : /* istanbul ignore next */ []));
    renderedVisibleRowCount = computed(() => this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.visibleRowCount() : 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "renderedVisibleRowCount" }] : /* istanbul ignore next */ []));
    /**
     * Sub-header group segments keyed by the id of the page row that opens each
     * segment. Empty when no sub-header column is active or no data rows render.
     */
    subHeaderGroups = computed(() => {
        const columnId = this.resolvedSubHeaderColumnId();
        // Remote windowing disables sub-headers: groups computed over a loaded
        // window would misstate the dataset, and their extra rows have no slot on
        // the remote fixed-height grid. The virtualize directive warns in dev.
        if (columnId === null || this.bodyState() !== NAT_TABLE_BODY_STATE.rows || this.remoteRowCount() !== null) {
            return new Map();
        }
        return buildSubHeaderRowGroups(this.bodyRows(), this.table.getPrePaginationRowModel().rows, columnId);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderGroups" }] : /* istanbul ignore next */ []));
    /** See `NatTableRowWindowHost.subHeaderRowOffsets`; empty when no sub-header renders. */
    subHeaderRowOffsets = computed(() => buildSubHeaderRowOffsets(this.bodyRows(), this.subHeaderGroups()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderRowOffsets" }] : /* istanbul ignore next */ []));
    /**
     * `aria-rowcount`, counted from the logical row model because a windowed
     * body mounts a subset — and from the remote total under remote windowing,
     * because the loaded window is itself a subset of the represented dataset.
     */
    gridRowCount = computed(() => this.headerRowCount() +
        this.subHeaderGroups().size +
        (this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.logicalRowCount() : 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "gridRowCount" }] : /* istanbul ignore next */ []));
    stateTotalRowCount = computed(() => {
        const bodyState = this.bodyState();
        if (bodyState === NAT_TABLE_BODY_STATE.loading || bodyState === NAT_TABLE_BODY_STATE.error) {
            return 0;
        }
        // Under remote windowing the represented dataset is the remote total, not
        // the loaded `data` array — summaries and announcements report it so a
        // reader is never told the loaded window is everything.
        return this.remoteRowCount() ?? this.totalRowCount();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stateTotalRowCount" }] : /* istanbul ignore next */ []));
    renderedPageIndex = computed(() => this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.mergedState().pagination.pageIndex : 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "renderedPageIndex" }] : /* istanbul ignore next */ []));
    renderedPageCount = computed(() => (this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.resolvedPageCount() : 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "renderedPageCount" }] : /* istanbul ignore next */ []));
    // ─── DOM context (written by the component, read by services) ───
    /** Scrollable wrapper around the rendered `<table>`. Set by the component after render. */
    tableRegionRef = signal(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []));
    // ─── ARIA attribute computeds ───
    resolvedKeyboardInstructions = computed(() => {
        const text = this.resolvedAccessibilityText();
        const instructions = (text.keyboardInstructions ?? '').trim();
        const reorderInstructions = text.reorderKeyboardInstructions?.trim() ?? '';
        const resizeInstructions = text.resizeKeyboardInstructions?.trim() ?? '';
        const parts = [instructions];
        if (this.hasReorderableColumns()) {
            parts.push(reorderInstructions);
        }
        if (this.hasResizableColumns()) {
            parts.push(resizeInstructions);
        }
        return parts.filter((value) => !!value).join(' ');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedKeyboardInstructions" }] : /* istanbul ignore next */ []));
    /**
     * Keyboard instructions for a list rendering with composite item navigation.
     * Item-phrased copy with no reorder/resize appendixes (a list has neither);
     * falls back to the grid `keyboardInstructions` when only that one is
     * overridden, mirroring the other `list*` accessibility entries.
     */
    resolvedListKeyboardInstructions = computed(() => {
        const text = this.resolvedAccessibilityText();
        return (text.listKeyboardInstructions ?? text.keyboardInstructions ?? '').trim();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedListKeyboardInstructions" }] : /* istanbul ignore next */ []));
    tableAriaLabel = computed(() => {
        if (this.resolvedCaption()) {
            return null;
        }
        const name = this.accessibleName()?.trim();
        return name === undefined || name === '' ? null : name;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableAriaLabel" }] : /* istanbul ignore next */ []));
    tableAriaLabelledBy = computed(() => (this.resolvedCaption() ? this.tableCaptionId() : null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableAriaLabelledBy" }] : /* istanbul ignore next */ []));
    tableClassMap = computed(() => [
        'data-table',
        this.stickyHeader() && 'has-sticky-header',
        this.usesAuthoritativeLayout() && 'is-fixed-layout',
        this.hasRowRenderStrategy() && 'is-virtualized'
    ]
        .filter(Boolean)
        .join(' '), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableClassMap" }] : /* istanbul ignore next */ []));
    // ─── Header measurement signals (written by the header-measurement service) ───
    measuredHeaderWidths = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "measuredHeaderWidths" }] : /* istanbul ignore next */ []));
    regionViewportWidth = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "regionViewportWidth" }] : /* istanbul ignore next */ []));
    // ─── Column width resolution ───
    /**
     * Fill layout with a measured region and either a resizable column or a
     * registered row-render strategy. The table then renders authoritative widths
     * (a colgroup under `table-layout: fixed`) that sum to the region, so resizing
     * a column is pixel-exact while the other columns flex to keep the table
     * filled — and a windowed body keeps its column widths when a different row
     * window mounts. This also gates `resolvedColumnWidths` and the resize
     * distribution, so the strategy branch widens more than the colgroup.
     */
    isFillFlexLayout = computed(() => !this.isFixedLayout() && (this.hasResizableColumns() || this.hasRowRenderStrategy()) && this.regionViewportWidth() > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isFillFlexLayout" }] : /* istanbul ignore next */ []));
    /**
     * Authoritative widths drive the layout: explicit `fixed` sizing mode, fill
     * flex, or a registered row-render strategy — which needs the colgroup even
     * before the region has been measured. Renders the colgroup and switches the
     * table to `table-layout: fixed`.
     */
    usesAuthoritativeLayout = computed(() => this.isFixedLayout() || this.isFillFlexLayout() || this.hasRowRenderStrategy(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usesAuthoritativeLayout" }] : /* istanbul ignore next */ []));
    /**
     * Per-column widths used for sticky pinned offsets, the colgroup, and the keyboard
     * resize base.
     */
    resolvedColumnWidths = computed(() => {
        const visibleColumns = this.visibleColumns();
        const columnSizing = this.mergedState().columnSizing;
        const clamp = (column, width) => this.clampColumnWidth(column, width);
        if (this.isFillFlexLayout()) {
            return computeFillFlexWidths(visibleColumns, columnSizing, {
                container: this.regionViewportWidth(),
                clamp,
                getBounds: (column) => this.getResizeBounds(column),
                getColumn: (columnId) => this.table.getColumn(columnId)
            });
        }
        return computeIntrinsicWidths(visibleColumns, columnSizing, {
            measured: this.measuredHeaderWidths(),
            userSizing: this.userColumnSizing(),
            usesAuthoritativeLayout: this.usesAuthoritativeLayout(),
            clamp
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedColumnWidths" }] : /* istanbul ignore next */ []));
    fixedLayoutTableWidth = computed(() => {
        const widths = this.resolvedColumnWidths();
        return this.visibleColumns().reduce((total, column) => total + (widths[column.id] ?? 0), 0);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fixedLayoutTableWidth" }] : /* istanbul ignore next */ []));
    // ─── Column render state ───
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
        for (const column of visibleColumns) {
            result[column.id] = buildColumnRenderState(column, context);
        }
        return result;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnRenderStates" }] : /* istanbul ignore next */ []));
    // ─── Render cycle tracking ───
    renderCycleToken = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "renderCycleToken" }] : /* istanbul ignore next */ []));
    renderCycleStartedAt = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "renderCycleStartedAt" }] : /* istanbul ignore next */ []));
    // ─── Resize state (no DOM) ───
    /**
     * Commit info from the in-progress pointer/touch resize drag, used by the
     * resize directive for announcing the final width on drag end.
     */
    resizeCommit = null;
    getResizeBounds(column) {
        return getColumnResizeBounds(column, this.userColumnSizing());
    }
    getResizeFitBounds(column) {
        const { min, max: ownMax } = this.getResizeBounds(column);
        const fit = this.getViewportFitMax(column, this.regionViewportWidth());
        if (fit === null)
            return { min, max: ownMax };
        const cappedMax = ownMax !== null ? Math.min(ownMax, fit) : fit;
        return { min, max: Math.max(Math.round(cappedMax), min) };
    }
    /**
     * Viewport cap on a column's resize, or `null` when no cap applies (the column may grow to
     * its own maxSize and scroll). Fixed layout caps only pinned columns (see getPinnedFixedFitMax);
     * fill/flex caps every column so the table fills the region without overflowing (getFillFitMax).
     */
    getViewportFitMax(column, region) {
        if (region <= 0)
            return null;
        if (this.isFixedLayout()) {
            return column.getIsPinned() !== false ? this.getPinnedFixedFitMax(column, region) : null;
        }
        return this.getFillFitMax(column, region);
    }
    /**
     * Largest width a pinned column may take in fixed layout while all pinned columns still fit
     * within the viewport AND leave a scrollable strip for the non-pinned columns. Never below the
     * column's current width, so an already-overflowing pin set doesn't force a shrink.
     *
     * A pinned column is sticky: growing it past the viewport pushes the following pinned columns'
     * sticky offsets beyond the viewport edge (an empty band opens on the left). And if the pinned
     * columns cover the entire viewport, the sticky cells hide the non-pinned columns for good —
     * no amount of scrolling can reveal them. So reserve room for the widest non-pinned column (up
     * to half the viewport) so it can be scrolled fully into view. Non-pinned columns themselves
     * keep growing and scrolling freely — fixed mode's intended overflow.
     */
    getPinnedFixedFitMax(column, region) {
        const widths = this.resolvedColumnWidths();
        let sumOtherPinned = 0;
        let widestNonPinned = 0;
        for (const other of this.visibleColumns()) {
            if (other.id === column.id)
                continue;
            if (other.getIsPinned() === false) {
                widestNonPinned = Math.max(widestNonPinned, widths[other.id] ?? this.getColumnEffectiveWidth(other));
            }
            else {
                sumOtherPinned += widths[other.id] ?? this.getColumnEffectiveWidth(other);
            }
        }
        const nonPinnedReserve = Math.min(widestNonPinned, region / 2);
        const current = widths[column.id] ?? this.getColumnEffectiveWidth(column);
        return Math.max(current, region - sumOtherPinned - nonPinnedReserve);
    }
    /**
     * Largest width a column may take in fill/flex layout: the viewport minus what the other
     * columns can yield (their minimums when unsized in fill flex, otherwise their current
     * widths), so the table fills the region without overflowing. Never below the column's
     * current width.
     */
    getFillFitMax(column, region) {
        const widths = this.resolvedColumnWidths();
        const columnSizing = this.mergedState().columnSizing;
        let sumOthers = 0;
        for (const other of this.visibleColumns()) {
            if (other.id === column.id)
                continue;
            sumOthers +=
                this.isFillFlexLayout() && readColumnEntry(columnSizing, other.id) === undefined
                    ? this.getResizeBounds(other).min
                    : (widths[other.id] ?? 0);
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
    /**
     * Seed an auto-sized column's `columnSizing` entry with its real rendered
     * width before a pointer resize begins.
     */
    seedColumnSizingFromMeasuredWidth(column) {
        const alreadyResized = readColumnEntry(this.mergedState().columnSizing, column.id) !== undefined;
        const explicitlySized = readColumnEntry(this.userColumnSizing(), column.id)?.hasSize === true;
        if (alreadyResized || (explicitlySized && !this.isFillFlexLayout())) {
            return;
        }
        const measuredWidth = this.getColumnEffectiveWidth(column);
        this.updateState({
            columnSizing: (current) => ({ ...current, [column.id]: measuredWidth })
        });
        this.resizeSeedSizing.set({ [column.id]: measuredWidth });
        // Flush the seed synchronously so the TanStack resize handler reads it.
        this.table.getState();
    }
    /**
     * Resize `column` by one keyboard step. Returns the new width for
     * announcement by the caller, or null if no change occurred.
     */
    resizeColumnFromKey(event, column) {
        if (!isColumnResizable(column, this.resizingEnabled()))
            return null;
        const { min, max } = this.getResizeFitBounds(column);
        const current = this.getColumnEffectiveWidth(column);
        const clamped = computeKeyboardResizeWidth({
            key: event.key,
            current,
            min,
            max,
            isRtl: this.resolvedDirection() === 'rtl'
        });
        if (clamped === null) {
            return null;
        }
        event.preventDefault();
        event.stopPropagation();
        if (clamped === current) {
            return { width: current, changed: false };
        }
        this.updateState({
            columnSizing: (currentSizing) => ({ ...currentSizing, [column.id]: clamped })
        });
        return { width: clamped, changed: true };
    }
    /**
     * Commit a column-sizing change from TanStack's pointer/touch resize handler.
     */
    applyColumnSizingChange(updater) {
        const resizingColumnId = this.table.getState().columnSizingInfo.isResizingColumn;
        if (typeof resizingColumnId !== 'string') {
            this.updateState({ columnSizing: updater });
            return;
        }
        const next = {
            ...resolveUpdater(this.mergedState().columnSizing, updater)
        };
        const column = this.table.getColumn(resizingColumnId);
        const raw = readColumnEntry(next, resizingColumnId);
        if (column && raw !== undefined) {
            const { min, max } = this.getResizeFitBounds(column);
            const capped = Math.max(min, max !== null ? Math.min(max, raw) : raw);
            next[resizingColumnId] = capped;
            this.resizeCommit = { columnId: resizingColumnId, width: Math.round(capped) };
        }
        else {
            this.resizeCommit = null;
        }
        this.updateState({ columnSizing: next });
    }
    // ─── Reorder state (no DOM) ───
    canMoveColumn(columnId, direction) {
        return this.canMoveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
    }
    moveColumn(columnId, direction) {
        return this.moveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
    }
    canMoveColumnByDelta(columnId, directionDelta) {
        const column = this.table.getColumn(columnId);
        if (!column || !isColumnReorderable(column, this.enableReordering()))
            return false;
        const zone = this.getColumnZoneById(columnId);
        if (!zone)
            return false;
        const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
        return getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta) !== null;
    }
    moveColumnByDelta(columnId, directionDelta) {
        const column = this.table.getColumn(columnId);
        if (!column || !isColumnReorderable(column, this.enableReordering()))
            return null;
        const zone = this.getColumnZoneById(columnId);
        if (!zone)
            return null;
        const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
        const currentIndex = visibleZoneColumnIds.indexOf(columnId);
        const nextIndex = getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta);
        if (nextIndex === null)
            return null;
        const nextVisibleZoneOrder = moveItemInArrayCopy(visibleZoneColumnIds, currentIndex, nextIndex);
        return this.applyVisibleZoneReorder(zone, columnId, nextVisibleZoneOrder);
    }
    applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder) {
        const movingColumn = this.table.getColumn(movingColumnId);
        if (!movingColumn || !isColumnReorderable(movingColumn, this.enableReordering()))
            return null;
        const currentState = this.mergedState();
        const currentVisibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
        if (!currentVisibleZoneColumnIds.length || hasSameStringOrder(currentVisibleZoneColumnIds, nextVisibleZoneOrder)) {
            return null;
        }
        const result = { movingColumnId, zone, nextVisibleZoneOrder };
        if (zone === 'center') {
            const nextColumnOrder = replaceIdsInSlots(currentState.columnOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));
            if (hasSameStringOrder(currentState.columnOrder, nextColumnOrder)) {
                return null;
            }
            this.updateState({ columnOrder: nextColumnOrder });
            return result;
        }
        // `zone` narrows to 'left' | 'right' here because the center branch above returns.
        const currentPinnedZoneOrder = currentState.columnPinning[zone] ?? [];
        const nextPinnedZoneOrder = replaceIdsInSlots(currentPinnedZoneOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));
        if (hasSameStringOrder(currentPinnedZoneOrder, nextPinnedZoneOrder)) {
            return null;
        }
        this.updateState({
            columnPinning: {
                ...currentState.columnPinning,
                [zone]: nextPinnedZoneOrder
            }
        });
        return result;
    }
    isDropIndexWithinZone(rowColumnIds, zone, currentIndex) {
        const zoneIndices = rowColumnIds.reduce((indices, columnId, index) => {
            if (this.getColumnZoneById(columnId) === zone) {
                indices.push(index);
            }
            return indices;
        }, []);
        if (!zoneIndices.length) {
            return false;
        }
        return currentIndex >= zoneIndices[0] && currentIndex <= zoneIndices[zoneIndices.length - 1];
    }
    getColumnZoneById(columnId) {
        const column = this.table.getColumn(columnId);
        return column ? getColumnZone(column) : null;
    }
    getVisibleZoneColumnIds(zone) {
        // visibleColumns() is pin-aware (left/center/right zone getters); TanStack's
        // getVisibleLeafColumns() orders pinned columns by columnOrder, not by the
        // columnPinning arrays, so after a pinned reorder it reports the stale order
        // and the next reorder in that zone is wrongly rejected as a no-op.
        return this.visibleColumns()
            .filter((column) => getColumnZone(column) === zone)
            .map((column) => column.id);
    }
    // ─── State management ───
    seedInitialState(initialState) {
        const seed = resolveSeedState(initialState, DEFAULT_TABLE_STATE);
        this.internalSorting.set(normalizeSortingState(seed.sorting, this.enableMultiSort()));
        this.internalGlobalFilter.set(this.enableGlobalFilter() ? seed.globalFilter : '');
        this.internalColumnFilters.set(seed.columnFilters);
        this.internalColumnVisibility.set(seed.columnVisibility);
        this.internalColumnOrder.set(seed.columnOrder);
        this.internalColumnPinning.set(seed.columnPinning);
        this.internalColumnSizing.set(seed.columnSizing);
        this.internalRowSelection.set(normalizeRowSelection(seed.rowSelection, this.selectionMode() === 'multiple'));
        this.internalPagination.set(seed.pagination);
        this.hasSeededInitialState.set(true);
        this.natTableService.notifyStateChange(this.mergedState());
    }
    patchState(updaters) {
        this.updateState(updaters);
    }
    /**
     * Commits a sorting change from TanStack. The functional updater runs
     * against the TanStack-facing sorting (forced sub-header entry included);
     * the forced entry is then stripped so user-visible state stays clean.
     */
    applySortingChange(updater) {
        const next = resolveUpdater(this.tanstackSortingState(), updater);
        this.updateState({ sorting: stripNatTableSubHeaderSorting(next, this.resolvedSubHeaderColumnId()) });
    }
    updateState(updaters) {
        const currentState = this.mergedState();
        const nextState = {
            sorting: normalizeSortingState(resolveUpdater(currentState.sorting, updaters.sorting), this.enableMultiSort()),
            globalFilter: resolveUpdater(currentState.globalFilter, updaters.globalFilter),
            columnFilters: resolveUpdater(currentState.columnFilters, updaters.columnFilters),
            columnVisibility: resolveUpdater(currentState.columnVisibility, updaters.columnVisibility),
            columnOrder: retainColumnOrder(resolveUpdater(currentState.columnOrder, updaters.columnOrder), this.allLeafColumnIds()),
            columnPinning: retainColumnPinning(resolveUpdater(currentState.columnPinning, updaters.columnPinning)),
            columnSizing: this.clampColumnSizing(resolveUpdater(currentState.columnSizing, updaters.columnSizing)),
            rowSelection: normalizeRowSelection(resolveUpdater(currentState.rowSelection, updaters.rowSelection), this.selectionMode() === 'multiple'),
            pagination: resolveUpdater(currentState.pagination, updaters.pagination)
        };
        this.commitInternalState(nextState);
        this.natTableService.notifyStateChange(nextState);
    }
    commitInternalState(nextState) {
        const controlled = this.state();
        if (controlled.sorting === undefined) {
            this.internalSorting.set(nextState.sorting);
        }
        if (controlled.globalFilter === undefined) {
            this.internalGlobalFilter.set(nextState.globalFilter);
        }
        if (controlled.columnFilters === undefined) {
            this.internalColumnFilters.set(nextState.columnFilters);
        }
        if (controlled.columnVisibility === undefined) {
            this.internalColumnVisibility.set(nextState.columnVisibility);
        }
        if (controlled.columnOrder === undefined) {
            this.internalColumnOrder.set(nextState.columnOrder);
        }
        if (controlled.columnPinning === undefined) {
            this.internalColumnPinning.set(nextState.columnPinning);
        }
        if (controlled.columnSizing === undefined) {
            this.internalColumnSizing.set(nextState.columnSizing);
        }
        if (controlled.rowSelection === undefined) {
            this.internalRowSelection.set(nextState.rowSelection);
        }
        if (controlled.pagination === undefined) {
            this.internalPagination.set(nextState.pagination);
        }
    }
    // ─── Template state contexts ───
    getStateTemplateBaseContext() {
        return {
            table: this.table,
            visibleRowsValue: this.renderedVisibleRowCount(),
            totalRowsValue: this.stateTotalRowCount(),
            visibleColumnsValue: this.visibleColumnCount(),
            filtered: this.isFiltered()
        };
    }
    /** Template context for a rendered sub-header row. */
    getSubHeaderTemplateContext(group) {
        return {
            $implicit: group.value,
            value: group.value,
            rowCountValue: group.rowCountValue,
            row: group.row,
            table: this.table
        };
    }
    /** Template context for one placeholder cell of an unfetched logical row slot. */
    getRowPlaceholderTemplateContext(logicalIndex, column) {
        return {
            $implicit: logicalIndex,
            logicalIndex,
            column,
            table: this.table
        };
    }
    /** Screen-reader text rendered inside a placeholder row for an unfetched logical slot. */
    getRowPlaceholderAnnouncement(logicalIndex) {
        const formatter = this.resolvedAccessibilityText().placeholderRow;
        if (!formatter) {
            return '';
        }
        const totalRowsValue = this.logicalRowCount();
        return formatter({
            positionValue: logicalIndex + 1,
            positionText: this.formatAccessibilityNumber(logicalIndex + 1),
            totalRowsValue,
            totalRowsText: this.formatAccessibilityNumber(totalRowsValue)
        });
    }
    /** Screen-reader announcement text for a sub-header row, phrased per renderer. */
    getSubHeaderAnnouncement(group, renderer) {
        const accessibilityText = this.resolvedAccessibilityText();
        const formatter = renderer === 'list' ? (accessibilityText.listSubHeaderRow ?? accessibilityText.subHeaderRow) : accessibilityText.subHeaderRow;
        if (!formatter) {
            return '';
        }
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
        return formatNatTableNumber(this.tableIntl(), value, undefined, this.localeId());
    }
    // ─── Private helpers ───
    resolveRowId(row, index, parent) {
        const getRowIdFn = this.getRowId();
        return getRowIdFn ? getRowIdFn(row, index, parent) : resolveDefaultRowId(row, index, parent);
    }
    // ─── Lifecycle effects (seed + render cycle) ───
    /**
     * Self-seeding effect: applies the initial state when it becomes available.
     * Must be called in the injection context (constructor or field initializer).
     */
    registerSeedEffect() {
        effect(() => {
            if (this.hasSeededInitialState()) {
                return;
            }
            this.seedInitialState(this.initialState());
        });
    }
    /**
     * Dev-mode warnings for sub-header misconfiguration. Must be called in the
     * injection context (constructor or field initializer).
     */
    registerSubHeaderValidationEffect() {
        effect(() => {
            // A disabled renderer deliberately ignores the config — no warnings.
            if (!isDevMode() || !this.enableSubHeaders()) {
                return;
            }
            const columnId = this.subHeaderColumn();
            const hasColumnKey = columnId !== undefined && columnId !== '';
            const leafColumnIds = this.allLeafColumnIds();
            if (hasColumnKey && leafColumnIds.length > 0 && !leafColumnIds.includes(columnId)) {
                console.warn(`[ng-advanced-table] subHeaderColumn "${columnId}" does not match any leaf column id; sub-headers are disabled.`);
            }
            if (!hasColumnKey && this.subHeaderOrder() !== undefined) {
                console.warn('[ng-advanced-table] subHeaderOrder is set but subHeaderColumn is not; the order has no effect.');
            }
        });
    }
    /**
     * Drives row-render event timing. A cycle is one row-model rebuild; a moved
     * row window restamps the clock without opening one, because the rows that
     * stayed mounted did not re-render — re-timing them would report afterRender
     * latency as render cost.
     */
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
            // Tracked, not read: the plan is a plain computed, so a moved window
            // hands out a new object and restamps the clock below.
            this.bodyRenderPlan();
            this.renderCycleStartedAt.set(performance.now());
            if (rows !== previousRows) {
                previousRows = rows;
                this.renderCycleToken.update((token) => token + 1);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableState, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableState });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableState, decorators: [{
            type: Injectable
        }] });

/** Pagination context object shared by the page-size and page-index announcements. */
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
/** Announcement text for a page-size change captured in the snapshot. */
const describePageSizeChange = (snapshot, text, formatNumber, renderer = 'table') => {
    const formatter = (renderer === 'list' ? text.listPageSizeChange : undefined) ?? text.pageSizeChange;
    const context = getPaginationAnnouncementContext(snapshot, formatNumber);
    if (formatter) {
        return formatter(context);
    }
    return '';
};
/** Announcement text for a page-index change captured in the snapshot. */
const describePageChange = (snapshot, text, formatNumber, renderer = 'table') => {
    const formatter = (renderer === 'list' ? text.listPageChange : undefined) ?? text.pageChange;
    const context = getPaginationAnnouncementContext(snapshot, formatNumber);
    if (formatter) {
        return formatter(context);
    }
    return '';
};

/** Announcement text for a data-lifecycle change captured in the snapshot. */
const describeDataStatusChange = (snapshot, text) => {
    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.loading) {
        return text.loadingState ?? '';
    }
    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.error) {
        return text.errorState ?? '';
    }
    if (snapshot.visibleRows === 0) {
        return text.emptyState ?? '';
    }
    return '';
};
/** Announcement text for a sorting change captured in the snapshot. */
const describeSortingChange = (snapshot, text) => {
    const sortingState = snapshot.sorting;
    const formatter = text.sortingChange;
    const entry = sortingState.at(0);
    const columnLabel = entry ? (snapshot.columns.find((column) => column.id === entry.id)?.label ?? entry.id) : null;
    const sortState = entry ? sortDirection(entry.desc) : 'none';
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
    return formatter?.(context) ?? '';
};
/** Announcement text for a filtering change captured in the snapshot. */
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
    if (formatter) {
        return formatter(context);
    }
    return '';
};
/** Announcement text for one or more column-visibility changes between snapshots. */
const describeColumnVisibilityChange = (previous, next, text, formatNumber, renderer = 'table') => {
    const changedColumns = next.reduce((result, column) => {
        const previousColumn = previous.find((candidate) => candidate.id === column.id);
        // Report a column when it is newly added (no `previousColumn`, so the optional
        // read is `undefined` and never equals a boolean) or when a column present in
        // both snapshots flipped visibility. An added column announces its arrival with
        // the `next` visibility state so the change that triggered the diff is never
        // silently dropped.
        if (previousColumn?.visible !== column.visible) {
            result.push({
                id: column.id,
                label: column.label,
                visibilityState: column.visible ? 'visible' : 'hidden'
            });
        }
        return result;
    }, []);
    // Columns dropped from `next` are no longer visible, so announce them as hidden
    // after the next-column entries.
    for (const column of previous) {
        if (!next.some((candidate) => candidate.id === column.id)) {
            changedColumns.push({ id: column.id, label: column.label, visibilityState: 'hidden' });
        }
    }
    const visibleCount = next.filter((column) => column.visible).length;
    const formatter = (renderer === 'list' ? text.listColumnVisibilityChange : undefined) ?? text.columnVisibilityChange;
    const context = {
        changedColumns,
        visibleColumnsValue: visibleCount,
        visibleColumnsText: formatNumber(visibleCount),
        totalColumnsValue: next.length,
        totalColumnsText: formatNumber(next.length)
    };
    if (formatter) {
        return formatter(context);
    }
    return '';
};
/** Announcement text for a row-selection change captured in the snapshot. */
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
    return formatter?.(context) ?? '';
};
/**
 * Diffs two accessibility snapshots and returns the announcement for the first
 * changed dimension, or `null` when nothing announceable changed. Mirrors the
 * priority order the service applied inline.
 *
 * `resolveText` is a thunk, not a value: it is invoked only inside the matching
 * branch, so the accessibility-text signal stays a *conditional* dependency of
 * the caller's effect — read only when there is an announceable change, exactly
 * as the pre-refactor inline dispatcher did.
 */
const describeAccessibilityChange = (previous, next, resolveText, formatNumber, renderer = 'table') => {
    if (previous.dataStatus !== next.dataStatus) {
        return describeDataStatusChange(next, resolveText());
    }
    if (previous.sortingKey !== next.sortingKey) {
        return describeSortingChange(next, resolveText());
    }
    if (previous.globalFilter !== next.globalFilter || previous.columnFiltersKey !== next.columnFiltersKey) {
        return describeFilteringChange(next, resolveText(), formatNumber);
    }
    if (!hasSameColumnVisibility(previous.columns, next.columns)) {
        return describeColumnVisibilityChange(previous.columns, next.columns, resolveText(), formatNumber, renderer);
    }
    if (previous.rowSelectionKey !== next.rowSelectionKey) {
        return describeSelectionChange(next, resolveText(), formatNumber);
    }
    if (previous.pagination.pageSize !== next.pagination.pageSize) {
        return describePageSizeChange(next, resolveText(), formatNumber, renderer);
    }
    if (previous.pagination.pageIndex !== next.pagination.pageIndex) {
        return describePageChange(next, resolveText(), formatNumber, renderer);
    }
    return null;
};

/** Builds the `aria-describedby` summary context from captured summary state. */
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
        filterState: snapshot.isFiltered ? 'filtered' : 'unfiltered',
        paginationState: snapshot.paginationEnabled ? 'enabled' : 'disabled'
    };
};
/** Builds the column-reorder announcement context from captured reorder state. */
const buildColumnReorderContext = (input, formatNumber) => ({
    columnId: input.columnId,
    label: input.label,
    zone: input.zone,
    positionValue: input.positionValue,
    positionText: formatNumber(input.positionValue),
    totalValue: input.totalValue,
    totalText: formatNumber(input.totalValue)
});
/** Builds the column-resize announcement context from captured resize state. */
const buildColumnResizeContext = (input, formatNumber) => ({
    columnId: input.columnId,
    label: input.label,
    widthValue: input.widthValue,
    widthText: formatNumber(input.widthValue),
    atMinimum: input.widthValue <= input.min,
    atMaximum: input.max !== null && input.widthValue >= input.max
});

/* eslint-disable max-lines -- a11y service residual: DI + the liveMessage signal + snapshot capture that must read live signals + the summary computeds + five effect/afterRenderEffect registrations (the shared pair self-registers in the constructor; renderer-specific sets register through registerGridEffects/registerListEffects so each renderer opts into what it supports), plus the thin announce* capture-then-delegate call sites. All pure announcement/summary/context formatting was extracted to the table-announcement, table-pagination-announcement, and table-summary utils. */
/**
 * Cross-cutting accessibility service for the table.
 *
 * Owns the live-region text signal, all `announce*()` methods that format
 * and push screen-reader announcements, snapshot capture, state-change diffing,
 * and ARIA multiselectable management.
 *
 * Provided alongside `NatTableState` in the component's `providers`. The
 * effects every renderer needs register themselves in the constructor, so a
 * renderer that merely provides the service still announces state changes;
 * `registerGridEffects` adds the `<table>`-only behavior, `registerListEffects`
 * adds the list-renderer set, and a non-grid renderer selects its announcement
 * copy through `setRenderer`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableA11yService]), not root.
class NatTableA11yService {
    natTableService = inject(NatTableService);
    state = inject(NatTableState);
    renderer = 'table';
    lastAccessibilitySnapshot = null;
    previousResizingColumnId = null;
    /** Text written to the live region for screen-reader announcements. */
    liveMessage = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "liveMessage" }] : /* istanbul ignore next */ []));
    /** Whether announcements are enabled (gate signal from NatTableService). */
    enableAnnouncements = this.natTableService.enableAnnouncements;
    /** Table summary string for `aria-describedby`. */
    tableSummary = computed(() => this.buildTableSummary(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableSummary" }] : /* istanbul ignore next */ []));
    /**
     * List summary string for `aria-describedby`, phrased as items and fields.
     * Falls back to the `tableSummary` formatter when a consumer overrode only
     * that one.
     */
    listSummary = computed(() => this.buildTableSummary('listSummary'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listSummary" }] : /* istanbul ignore next */ []));
    constructor() {
        // The effects every renderer needs — state-change announcements and the
        // dev-mode accessible-name check — register here, not behind an opt-in
        // call: the service is public API, and a renderer that provides it but
        // forgets a registration call would be silently inert, the hardest kind
        // of a11y regression to notice.
        this.registerAnnouncementEffect();
        this.registerAccessibleNameValidationEffect();
    }
    /**
     * Selects renderer-specific announcement copy, so a list announces items and
     * fields where a grid (the default) announces rows and columns.
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    /**
     * Registers the grid-only effects: column-resize announcements, the
     * `aria-multiselectable` writer (which targets the rendered `<table>`), and
     * keybinding validation for the grid's resize/reorder shortcuts. A list
     * renderer supports none of these, so it skips them.
     */
    registerGridEffects() {
        this.registerResizeAnnouncementEffect();
        this.registerAriaMultiSelectableEffect();
        this.registerKeybindingValidationEffect();
    }
    /**
     * Registers the effects a list renderer needs: the `aria-multiselectable`
     * writer (self-gating — it only targets a rendered `[role="grid"]` element,
     * so a plain list stays untouched) and dev-mode keybinding validation (the
     * list shares the `rowActivate` and cell-interaction shortcuts). Column
     * resize announcements stay grid-only.
     */
    registerListEffects() {
        this.registerAriaMultiSelectableEffect();
        this.registerKeybindingValidationEffect();
    }
    // ─── Announce helpers ───
    /**
     * Low-level announce: clears the live region, then sets the message on the
     * next microtask so the browser re-reads the region even when the text is
     * identical to the previous announcement.
     */
    announce(message) {
        this.liveMessage.set('');
        queueMicrotask(() => this.liveMessage.set(message));
    }
    /**
     * Format a number for screen-reader readout using the resolved locale.
     */
    formatAccessibilityNumber(value) {
        return this.state.formatAccessibilityNumber(value);
    }
    /**
     * Announce a column reorder. Called by `NatTableReorderService` and
     * companion header-action controls after applying the column order change.
     */
    announceColumnReorder(movingColumnId, zone, nextVisibleZoneOrder) {
        const movingColumn = this.state.table.getColumn(movingColumnId);
        if (!movingColumn)
            return;
        const label = resolveColumnLabel(movingColumn);
        const nextIndex = nextVisibleZoneOrder.indexOf(movingColumnId);
        if (nextIndex === -1) {
            return;
        }
        const formatter = this.state.resolvedAccessibilityText().columnReorder;
        const context = buildColumnReorderContext({
            columnId: movingColumnId,
            label,
            zone,
            positionValue: nextIndex + 1,
            totalValue: nextVisibleZoneOrder.length
        }, (value) => this.formatAccessibilityNumber(value));
        this.announce(formatter?.(context) ?? '');
    }
    /**
     * Announce a column resize. Called by the resize service when a pointer
     * resize ends or by keyboard resize.
     */
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
        this.announce(formatter?.(context) ?? '');
    }
    // ─── State-change announcement effect ───
    registerAnnouncementEffect() {
        effect(() => {
            if (!this.state.hasSeededInitialState()) {
                return;
            }
            const snapshot = this.captureAccessibilitySnapshot();
            const previousSnapshot = this.lastAccessibilitySnapshot;
            this.lastAccessibilitySnapshot = snapshot;
            if (!previousSnapshot || !this.enableAnnouncements()) {
                return;
            }
            const message = describeAccessibilityChange(previousSnapshot, snapshot, () => this.state.resolvedAccessibilityText(), (value) => this.formatAccessibilityNumber(value), this.renderer);
            if (message) {
                this.announce(message);
            }
        });
    }
    // ─── Resize-end announcement effect ───
    registerResizeAnnouncementEffect() {
        effect(() => {
            const resizingColumnId = this.state.table.getState().columnSizingInfo.isResizingColumn || null;
            untracked(() => this.handleResizeEnd(resizingColumnId));
        });
    }
    handleResizeEnd(resizingColumnId) {
        const previous = this.previousResizingColumnId;
        this.previousResizingColumnId = resizingColumnId;
        if (!previous || resizingColumnId || !this.enableAnnouncements()) {
            return;
        }
        const commit = this.state.resizeCommit;
        this.state.resizeCommit = null;
        if (commit?.columnId !== previous) {
            return;
        }
        const column = this.state.table.getColumn(previous);
        if (column) {
            this.announceColumnResize(column, commit.width);
        }
    }
    // ─── ARIA multiselectable ───
    /**
     * Sets `aria-multiselectable` imperatively on the rendered grid element —
     * the `<table>` or, for a list with composite item navigation, the `<ul>`
     * carrying `role="grid"` (a plain list renders no grid element, so the
     * effect is inert there; `aria-multiselectable` is invalid on `role="list"`).
     * Written via `afterRenderEffect` because `ngGrid` clobbers template bindings.
     */
    registerAriaMultiSelectableEffect() {
        afterRenderEffect(() => {
            const multiSelectable = this.state.enableRowSelection() && this.state.selectionMode() === 'multiple';
            const grid = this.state.tableRegionRef()?.nativeElement.querySelector(':scope > table, :scope > ul[role="grid"]');
            if (!grid) {
                return;
            }
            if (multiSelectable) {
                grid.setAttribute('aria-multiselectable', 'true');
            }
            else {
                grid.removeAttribute('aria-multiselectable');
            }
        });
    }
    // ─── Summary ───
    buildTableSummary(formatterKey = 'tableSummary') {
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
        const formatter = accessibilityText[formatterKey] ?? accessibilityText.tableSummary;
        return formatter?.(summaryContext) ?? '';
    }
    // ─── Snapshot capture ───
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
    // ─── Dev-mode validation effects ───
    registerAccessibleNameValidationEffect() {
        afterRenderEffect(() => {
            if (!isDevMode() || this.state.resolvedCaption() || this.state.accessibleName()?.trim()) {
                return;
            }
            // Only the grid accepts a `caption`, so a list must not be told to add one.
            const requirement = this.renderer === 'table' ? 'either `caption` or `accessibleName`' : '`accessibleName`';
            console.warn(`[ng-advanced-table] <nat-${this.renderer}> requires ${requirement} for an accessible name.`);
        });
    }
    registerKeybindingValidationEffect() {
        effect(() => {
            const bindings = this.natTableService.keybindings();
            if (isDevMode()) {
                const warnings = validateKeybindings(bindings);
                for (const warning of warnings) {
                    console.warn(`[ng-advanced-table] ${warning}`);
                }
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableA11yService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableA11yService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableA11yService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Per-table service that manages header-cell ResizeObserver lifecycle and
 * viewport-width measurement. Writes measured widths back to the store
 * so the authoritative column-width layout stays in sync.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
class NatTableHeaderMeasurementService {
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
    // ─── ResizeObserver lifecycle ───
    initializeHeaderObservation() {
        if (typeof ResizeObserver === 'undefined' || this.headerResizeObserver)
            return;
        this.headerResizeObserver = new ResizeObserver(() => {
            this.measureHeaderWidths();
            this.measureRegionViewportWidth();
        });
        this.reattachHeaderObservers();
    }
    reattachHeaderObservers() {
        const observer = this.headerResizeObserver;
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!observer || !region)
            return;
        observer.disconnect();
        observer.observe(region);
        const headerCells = region.querySelectorAll('thead th[data-column-id]');
        for (const cell of headerCells) {
            observer.observe(cell);
        }
        this.measureHeaderWidths();
        this.measureRegionViewportWidth();
    }
    measureHeaderWidths() {
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!region) {
            return;
        }
        const headerCells = region.querySelectorAll('thead th[data-column-id]');
        const next = {};
        for (const cell of headerCells) {
            const columnId = cell.dataset['columnId'];
            if (!columnId) {
                continue;
            }
            next[columnId] = cell.getBoundingClientRect().width;
        }
        if (hasSameWidths(this.state.measuredHeaderWidths(), next)) {
            return;
        }
        this.state.measuredHeaderWidths.set(next);
    }
    measureRegionViewportWidth() {
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!region) {
            return;
        }
        const width = region.clientWidth;
        if (width > 0 && width !== this.state.regionViewportWidth()) {
            this.state.regionViewportWidth.set(width);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderMeasurementService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderMeasurementService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderMeasurementService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

const elementDepth = (element) => {
    let value = 0;
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        value += 1;
    }
    return value;
};
const getNatTableCellsWithin = (root) => {
    const cells = Array.from(root.querySelectorAll(NAT_TABLE_CELL_SELECTOR));
    if (root.matches(NAT_TABLE_CELL_SELECTOR)) {
        cells.unshift(root);
    }
    return cells;
};
/** Returns shallowest candidate roots while excluding candidates nested below another selected root. */
const getOutermostElementRoots = (roots) => {
    const candidates = Array.from(roots).sort((left, right) => elementDepth(left) - elementDepth(right));
    const selectedRoots = new WeakSet();
    return candidates.filter((root) => {
        for (let parent = root.parentElement; parent; parent = parent.parentElement) {
            if (selectedRoots.has(parent))
                return false;
        }
        selectedRoots.add(root);
        return true;
    });
};
/**
 * Prepares a single interactive control for the cell keyboard model.
 *
 * Exposed as a method on an object so unit tests can spy without redefining
 * the ESM export binding (which Angular/Vitest marks non-configurable).
 */
const natTableCellControlPreparation = {
    prepare(control) {
        if (control.hasAttribute('ngGridCellWidget') || control.hasAttribute('disabled'))
            return;
        // Menus attached inside a cell (e.g. header-action menus rendered as popover
        // children of the <th>) own their items' roving tabindex. Managing those
        // items fights the menu's own model on every render and can strand its
        // active-item state, so menu-owned controls are never cell controls.
        if (control.closest('[role="menu"], [role="menubar"]'))
            return;
        if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex < 0)
            return;
        if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)) {
            control.setAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, '');
        }
        if (control.tabIndex !== -1) {
            control.tabIndex = -1;
        }
    }
};
const prepareNatTableCellControl = (control) => natTableCellControlPreparation.prepare(control);

/**
 * Forgets known cells that sit outside this table once removal records are
 * delivered, so a later reinsertion receives a fresh control-preparation scan.
 *
 * A removed node still owned by this table was moved rather than detached, so
 * its cells stay known and no subtree is rescanned. Mutations inside a detached
 * subtree are never observed, which bounds what this can recover: a cell
 * detached, mutated, and reinserted within a single observer delivery is
 * indistinguishable from a move and stays known, so controls added in that
 * window are only prepared when the reinsertion lands in a later delivery.
 */
const forgetDetachedNatTableCells = (removedNodes, knownCells, host) => {
    for (const removedNode of removedNodes) {
        if (!(removedNode instanceof HTMLElement))
            continue;
        // Still owned: the node moved within this table, and every cell below it moved with it.
        if (removedNode.closest(NAT_TABLE_HOST_SELECTOR) === host)
            continue;
        for (const cell of getNatTableCellsWithin(removedNode)) {
            if (cell.closest(NAT_TABLE_HOST_SELECTOR) !== host)
                knownCells.delete(cell);
        }
    }
};

/**
 * Per-table manager for native controls rendered inside grid cells.
 *
 * It performs one initial table-level sweep, then observes only DOM mutations
 * that can add or change cell controls. Existing cells are tracked so Angular
 * DOM moves during sorting and reordering do not trigger subtree rescans.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table manager, provided by NatTable rather than shared across tables.
class NatTableCellControlManager {
    host = inject(ElementRef).nativeElement;
    destroyRef = inject(DestroyRef);
    knownCells = new WeakSet();
    started = false;
    observer = null;
    /**
     * Starts the one-time initial sweep and MutationObserver for this table.
     *
     * Called only from the `NatTable` constructor after the manager is provided on
     * the table injector. Safe to call more than once; subsequent calls no-op.
     */
    startCellControlPreparation() {
        if (this.started)
            return;
        this.started = true;
        const mutationObserverCtor = globalThis.MutationObserver;
        if (typeof mutationObserverCtor === 'undefined') {
            // Retain correctness with one table-level snapshot per render rather than one scan per cell.
            afterEveryRender({
                earlyRead: () => this.readSnapshot(),
                write: (snapshot) => this.prepareSnapshot(snapshot)
            });
            return;
        }
        afterNextRender({
            earlyRead: () => {
                const snapshot = this.readSnapshot();
                // Observe before any write callback can add controls, independent of Angular's callback ordering.
                this.observe(mutationObserverCtor);
                return snapshot;
            },
            write: (snapshot) => {
                this.prepareSnapshot(snapshot);
                const pendingMutations = this.observer?.takeRecords() ?? [];
                if (pendingMutations.length > 0)
                    this.prepareMutations(pendingMutations);
            }
        });
        this.destroyRef.onDestroy(() => this.observer?.disconnect());
    }
    readSnapshot() {
        const cells = Array.from(this.host.querySelectorAll(NAT_TABLE_CELL_SELECTOR)).filter((cell) => this.isOwnedCell(cell));
        const controls = Array.from(this.host.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)).filter((control) => this.isOwnedControl(control));
        return { cells, controls };
    }
    prepareSnapshot(snapshot) {
        for (const cell of snapshot.cells) {
            this.knownCells.add(cell);
        }
        for (const control of snapshot.controls) {
            prepareNatTableCellControl(control);
        }
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
    /**
     * Prepare direct interactive attribute targets immediately, then batch child
     * mutations into new-cell roots or additions within known cells. Known cells
     * that were only moved produce no preparation work.
     */
    prepareMutations(mutations) {
        const newCells = new Set();
        const newCellRoots = new Set();
        const addedSubtrees = new Set();
        for (const mutation of mutations) {
            this.collectMutationWork(mutation, newCells, newCellRoots, addedSubtrees);
        }
        for (const root of getOutermostElementRoots(newCellRoots)) {
            this.prepareSubtree(root);
        }
        for (const cell of newCells) {
            this.knownCells.add(cell);
        }
        for (const subtree of getOutermostElementRoots(addedSubtrees)) {
            const owner = subtree.closest(NAT_TABLE_CELL_SELECTOR);
            if (owner && !newCells.has(owner) && this.knownCells.has(owner)) {
                this.prepareSubtree(subtree, owner);
            }
        }
    }
    collectMutationWork(mutation, newCells, newCellRoots, addedSubtrees) {
        if (mutation.type === 'attributes') {
            const target = mutation.target;
            if (target instanceof HTMLElement && target.matches(ROW_ACTIVATE_INTERACTIVE_SELECTOR) && this.isOwnedControl(target)) {
                prepareNatTableCellControl(target);
            }
            return;
        }
        forgetDetachedNatTableCells(mutation.removedNodes, this.knownCells, this.host);
        for (const addedNode of mutation.addedNodes) {
            if (addedNode instanceof HTMLElement) {
                this.collectAddedSubtree(addedNode, newCells, newCellRoots, addedSubtrees);
            }
        }
    }
    collectAddedSubtree(addedNode, newCells, newCellRoots, addedSubtrees) {
        const containedCells = getNatTableCellsWithin(addedNode).filter((cell) => this.isOwnedCell(cell));
        let containsNewCell = false;
        for (const cell of containedCells) {
            if (!this.knownCells.has(cell)) {
                newCells.add(cell);
                containsNewCell = true;
            }
        }
        if (containsNewCell) {
            newCellRoots.add(addedNode);
            return;
        }
        if (addedNode.matches(NAT_TABLE_CELL_SELECTOR))
            return;
        const owner = addedNode.closest(NAT_TABLE_CELL_SELECTOR);
        if (owner && this.isOwnedCell(owner)) {
            addedSubtrees.add(addedNode);
        }
    }
    prepareSubtree(root, ownerCell) {
        if (root.matches(ROW_ACTIVATE_INTERACTIVE_SELECTOR) && this.isOwnedControl(root, ownerCell)) {
            prepareNatTableCellControl(root);
        }
        for (const control of root.querySelectorAll(ROW_ACTIVATE_INTERACTIVE_SELECTOR)) {
            if (this.isOwnedControl(control, ownerCell)) {
                prepareNatTableCellControl(control);
            }
        }
    }
    isOwnedCell(cell) {
        return cell.closest(NAT_TABLE_HOST_SELECTOR) === this.host;
    }
    isOwnedControl(control, ownerCell) {
        const cell = control.closest(NAT_TABLE_CELL_SELECTOR);
        return cell !== null && (ownerCell ? cell === ownerCell : this.isOwnedCell(cell));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableCellControlManager, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableCellControlManager });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableCellControlManager, decorators: [{
            type: Injectable
        }] });

class NatTableCell {
    natTableService = inject(NatTableService);
    onKeydown(event) {
        handleCellInteractionKeydown(event, this.natTableService.keyboard().cellInteraction);
    }
    // Host (focusin) handler. Bound to the imported helper directly — the cell
    // delegation rule needs no instance state, so this is a function reference,
    // not a method (keeps it off `class-methods-use-this`).
    onFocusIn = handleCellInteractionFocusIn;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableCell, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.1.1", type: NatTableCell, isStandalone: true, selector: "[natTableCell]", host: { listeners: { "keydown": "onKeydown($event)", "focusin": "onFocusIn($event)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableCell, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTableCell]',
                    host: {
                        '(keydown)': 'onKeydown($event)',
                        '(focusin)': 'onFocusIn($event)'
                    }
                }]
        }] });

/**
 * Per-table service that manages column-reorder logic and scroll-into-view behavior.
 *
 * After a column is reordered (drag-drop or keyboard), this service applies
 * the state change, announces the move for screen readers, and scrolls the
 * moved header into the visible viewport.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
class NatTableReorderService {
    injector = inject(Injector);
    state = inject(NatTableState);
    a11yService = inject(NatTableA11yService);
    // ─── Template-facing helpers ───
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
        return (isColumnReorderable(column, this.isReorderingEnabled()) && this.state.getVisibleZoneColumnIds(getColumnZone(column)).length > 1);
    }
    // ─── Drag-drop reorder ───
    onHeaderDrop(event, headerGroup) {
        try {
            if (!this.isLeafHeaderRow(headerGroup))
                return;
            const rowColumnIds = getHeaderRowColumnIds(headerGroup);
            const movingColumnId = resolveDraggedColumnId(event, rowColumnIds);
            if (!movingColumnId) {
                return;
            }
            const movingColumn = this.state.table.getColumn(movingColumnId);
            if (!movingColumn || !isColumnReorderable(movingColumn, this.isReorderingEnabled())) {
                return;
            }
            const zone = this.state.getColumnZoneById(movingColumnId);
            if (!zone) {
                return;
            }
            const nextVisibleZoneOrder = this.resolveDropZoneOrder(event, rowColumnIds, zone, movingColumnId);
            if (!nextVisibleZoneOrder) {
                return;
            }
            const result = this.state.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);
            if (!result)
                return;
            this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
            this.scrollHeaderIntoView(movingColumnId);
        }
        finally {
            this.restoreDraggedHeaderPinnedOffset(event);
        }
    }
    /**
     * CDK hides the dragged header mid-drag by stomping its inline `left` and
     * restores it to `''` before emitting `dropped`. Angular rewrites the
     * `[style.left.px]` host binding only when its value changes, so a rejected
     * (no-op) drop would leave a pinned header without its sticky offset — it
     * then scrolls away with the center columns. Re-apply it on every drop.
     */
    restoreDraggedHeaderPinnedOffset(event) {
        const draggedColumnId = typeof event.item.data === 'string' ? event.item.data : null;
        if (!draggedColumnId)
            return;
        const headerElement = this.getHeaderElement(draggedColumnId);
        const left = readColumnEntry(this.state.columnRenderStates(), draggedColumnId)?.left ?? null;
        if (headerElement && left !== null) {
            headerElement.style.left = `${left}px`;
        }
    }
    /**
     * Resolves the moving column's next in-zone order at drop time.
     *
     * CDK's `event.currentIndex` comes from live clientRects, which the sticky
     * pinned headers skew under horizontal scroll — wrongly rejecting valid
     * in-zone drops (issue #288). So prefer the drop point: slot the moving column
     * among its same-zone neighbors by their header centers. Fall back to
     * `currentIndex` when no geometry is available (jsdom / synthetic unit-test
     * events with no drop point). Returns `null` to reject the drop.
     */
    resolveDropZoneOrder(event, rowColumnIds, zone, movingColumnId) {
        const neighborIds = rowColumnIds.filter((id) => id !== movingColumnId && this.state.getColumnZoneById(id) === zone);
        // CDK types `dropPoint` as always-present, but synthetic unit-test events omit it.
        const dropX = event.dropPoint?.x;
        if (typeof dropX === 'number' && Number.isFinite(dropX)) {
            const centers = neighborIds.map((id) => this.getHeaderCenterX(id));
            // Use geometry whenever the layout is real (at least one neighbor has a
            // laid-out rect). Only pure jsdom, where every center is null, falls
            // through to the CDK index path — a degenerate rect in a real browser
            // must not re-trigger the scroll-skew bug (#288).
            if (!centers.every((center) => center === null)) {
                const isRtl = this.state.resolvedDirection() === 'rtl';
                const beyondDrop = centers.findIndex((center) => center !== null && (isRtl ? dropX > center : dropX < center));
                const nextOrder = [...neighborIds];
                nextOrder.splice(beyondDrop === -1 ? neighborIds.length : beyondDrop, 0, movingColumnId);
                return nextOrder;
            }
        }
        if (!this.state.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) {
            return null;
        }
        return moveItemInArrayCopy(rowColumnIds, event.previousIndex, event.currentIndex).filter((id) => this.state.getColumnZoneById(id) === zone);
    }
    /** Viewport-x center of a column's header cell, or `null` when it has no laid-out rect (jsdom). */
    getHeaderCenterX(columnId) {
        const rect = this.getHeaderElement(columnId)?.getBoundingClientRect();
        return rect && rect.width > 0 ? rect.left + rect.width / 2 : null;
    }
    // ─── Keyboard reorder ───
    /**
     * Handles the keyboard reorder portion of a header keydown.
     * Returns `true` if the event was handled (reorder occurred), `false` otherwise.
     */
    handleKeyboardReorder(event, column, directionDelta) {
        if (!isColumnReorderable(column, this.isReorderingEnabled()))
            return false;
        const zone = getColumnZone(column);
        const visibleZoneColumnIds = this.state.getVisibleZoneColumnIds(zone);
        const currentIndex = visibleZoneColumnIds.indexOf(column.id);
        if (currentIndex === -1 || visibleZoneColumnIds.length < 2)
            return false;
        event.preventDefault();
        event.stopPropagation();
        const result = this.state.moveColumnByDelta(column.id, directionDelta);
        if (result) {
            this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
        }
        this.scrollHeaderIntoView(column.id);
        return true;
    }
    // ─── Scroll into view ───
    /**
     * Scroll a column header into view after reordering.
     */
    scrollHeaderIntoView(columnId) {
        afterNextRender({
            write: () => {
                const scrollContainer = this.state.tableRegionRef()?.nativeElement ?? null;
                const headerElement = this.getHeaderElement(columnId);
                if (!scrollContainer || !headerElement) {
                    return;
                }
                scrollElementHorizontallyIntoView(scrollContainer, headerElement);
            }
        }, { injector: this.injector });
    }
    getHeaderElement(columnId) {
        const tableRegion = this.state.tableRegionRef()?.nativeElement;
        if (!tableRegion) {
            return null;
        }
        const headers = tableRegion.querySelectorAll('thead th[data-column-id]');
        for (const header of headers) {
            if (header.getAttribute('data-column-id') === columnId) {
                return header;
            }
        }
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableReorderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableReorderService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableReorderService, decorators: [{
            type: Injectable
        }] });

/**
 * Per-table service that manages column-resize DOM interactions.
 *
 * Owns the resize guide position state, pointer resize-start coordination,
 * and keyboard resize delegation. The `NatTable` component keeps the template
 * event bindings and delegates to methods on this service.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
class NatTableResizeService {
    state = inject(NatTableState);
    a11yService = inject(NatTableA11yService);
    /** Pixel offset of the dragged column's resize edge within the scrollable region content box. */
    resizeGuideOrigin = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resizeGuideOrigin" }] : /* istanbul ignore next */ []));
    /** True when the column being resized is pinned (sticky), so the guide must compensate for scroll. */
    resizeGuidePinned = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resizeGuidePinned" }] : /* istanbul ignore next */ []));
    /** `region.scrollLeft` captured at drag start, the baseline for the pinned-guide scroll compensation. */
    resizeStartScrollLeft = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resizeStartScrollLeft" }] : /* istanbul ignore next */ []));
    /** Live `region.scrollLeft`, updated by the scroll listener while a drag is active. */
    regionScrollLeft = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "regionScrollLeft" }] : /* istanbul ignore next */ []));
    constructor() {
        // A sticky (pinned) column edge stays viewport-fixed on horizontal scroll, but the
        // absolutely-positioned guide scrolls with the content — so mid-drag scroll drifts the
        // guide off the edge (#289). The guide recomputes on every pointer move, but a pure
        // wheel/trackpad scroll fires no pointer event, so feed scrollLeft in as a signal to
        // drive the recompute. Only written while resizing, to avoid change-detection churn on idle scroll.
        effect((onCleanup) => {
            const region = this.state.tableRegionRef()?.nativeElement;
            if (!region)
                return;
            const onScroll = () => {
                if (this.isColumnResizing())
                    this.regionScrollLeft.set(region.scrollLeft);
            };
            region.addEventListener('scroll', onScroll, { passive: true });
            onCleanup(() => region.removeEventListener('scroll', onScroll));
        });
    }
    /** Full-height drag guide position: column edge + live drag delta, or null when idle. */
    columnResizeGuide = computed(() => {
        const info = this.state.table.getState().columnSizingInfo;
        const origin = this.resizeGuideOrigin();
        const resizingId = info.isResizingColumn;
        if (resizingId === false || origin === null)
            return null;
        // For a pinned (sticky) column the edge is viewport-fixed; cancel the guide's own scroll
        // translation so it stays glued to that edge. Center columns scroll with the content and
        // already track, so their origin stays in content space untouched.
        const left = this.resizeGuidePinned() ? origin + (this.regionScrollLeft() - this.resizeStartScrollLeft()) : origin;
        const widthDelta = info.deltaOffset ?? 0;
        const column = this.state.table.getColumn(resizingId);
        if (!column)
            return { left, offset: widthDelta };
        const { min, max } = this.state.getResizeFitBounds(column);
        const startSize = info.startSize ?? this.state.getColumnEffectiveWidth(column);
        const clampedDelta = Math.max(min - startSize, max !== null ? Math.min(max - startSize, widthDelta) : widthDelta);
        return {
            left,
            offset: this.state.resolvedDirection() === 'rtl' ? -clampedDelta : clampedDelta
        };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnResizeGuide" }] : /* istanbul ignore next */ []));
    /** True while a pointer/touch column-resize drag is in progress. */
    isColumnResizing = computed(() => this.state.table.getState().columnSizingInfo.isResizingColumn !== false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isColumnResizing" }] : /* istanbul ignore next */ []));
    /**
     * Start a pointer/touch column resize.
     * Called by the component's template `(mousedown)` / `(touchstart)` handler.
     */
    startResize(event, header) {
        if (!canResizeColumn(header, this.state.resizingEnabled()))
            return;
        event.stopPropagation();
        this.state.seedColumnSizingFromMeasuredWidth(header.column);
        this.captureGuideOrigin(event, header);
        header.getResizeHandler()(event);
        this.state.resizeSeedSizing.set({});
    }
    /**
     * Resize a column from a keyboard event (Alt+Arrow).
     * Called by the component's header keydown handler.
     */
    resizeFromKey(event, column) {
        const result = this.state.resizeColumnFromKey(event, column);
        if (result) {
            this.a11yService.announceColumnResize(column, result.width);
        }
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
        const edge = this.state.resolvedDirection() === 'rtl' ? handleRect.left : handleRect.right;
        const scrollLeft = region.scrollLeft;
        this.resizeGuidePinned.set(header.column.getIsPinned() !== false);
        this.resizeStartScrollLeft.set(scrollLeft);
        this.regionScrollLeft.set(scrollLeft);
        this.resizeGuideOrigin.set(edge - regionRect.left + scrollLeft);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableResizeService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableResizeService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableResizeService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

const roundToSingleDecimal = (value) => Number(value.toFixed(1));
/**
 * Internal directive attached to each body row when row-render events are
 * enabled on `<nat-table>`. Emits timing information relative to the current
 * render cycle's `renderStartedAt` timestamp.
 *
 * Not exported from the public API — consumers subscribe to the
 * `(rowRendered)` output on `<nat-table>` instead.
 */
class NatTableRowRenderEmitter {
    // Property names equal their binding names: each input/output is named for the
    // namespaced host binding on the shared `tr[natTableRowRenderEmitter]` selector,
    // so no alias is needed. `rowId`'s alias equals the directive selector, which
    // no-input-rename permits — it stays aliased.
    rowId = input.required({ ...(ngDevMode ? { debugName: "rowId" } : /* istanbul ignore next */ {}), alias: 'natTableRowRenderEmitter' });
    natTableRowRenderToken = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTableRowRenderToken" }] : /* istanbul ignore next */ []));
    natTableRowRenderStartedAt = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTableRowRenderStartedAt" }] : /* istanbul ignore next */ []));
    natTableRowRenderEnabled = input(false, { ...(ngDevMode ? { debugName: "natTableRowRenderEnabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    natTableRowRendered = output();
    lastEmissionKey = '';
    constructor() {
        afterRenderEffect({
            read: () => {
                if (!this.natTableRowRenderEnabled())
                    return;
                const rowId = this.rowId();
                const renderToken = this.natTableRowRenderToken();
                const renderStartedAt = this.natTableRowRenderStartedAt();
                if (renderToken <= 0 || renderStartedAt <= 0)
                    return;
                const emissionKey = `${renderToken}:${rowId}`;
                if (this.lastEmissionKey === emissionKey)
                    return;
                this.lastEmissionKey = emissionKey;
                this.natTableRowRendered.emit({
                    rowId,
                    renderToken,
                    durationMs: roundToSingleDecimal(Math.max(performance.now() - renderStartedAt, 0.1))
                });
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowRenderEmitter, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableRowRenderEmitter, isStandalone: true, selector: "tr[natTableRowRenderEmitter]", inputs: { rowId: { classPropertyName: "rowId", publicName: "natTableRowRenderEmitter", isSignal: true, isRequired: true, transformFunction: null }, natTableRowRenderToken: { classPropertyName: "natTableRowRenderToken", publicName: "natTableRowRenderToken", isSignal: true, isRequired: true, transformFunction: null }, natTableRowRenderStartedAt: { classPropertyName: "natTableRowRenderStartedAt", publicName: "natTableRowRenderStartedAt", isSignal: true, isRequired: true, transformFunction: null }, natTableRowRenderEnabled: { classPropertyName: "natTableRowRenderEnabled", publicName: "natTableRowRenderEnabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { natTableRowRendered: "natTableRowRendered" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableRowRenderEmitter, decorators: [{
            type: Directive,
            args: [{
                    selector: 'tr[natTableRowRenderEmitter]'
                }]
        }], ctorParameters: () => [], propDecorators: { rowId: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableRowRenderEmitter", required: true }] }], natTableRowRenderToken: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableRowRenderToken", required: true }] }], natTableRowRenderStartedAt: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableRowRenderStartedAt", required: true }] }], natTableRowRenderEnabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableRowRenderEnabled", required: false }] }], natTableRowRendered: [{ type: i0.Output, args: ["natTableRowRendered"] }] } });

/**
 * Host-styles a header cell's pinned offsets and width bounds. Moving these
 * runtime values into `host` (instead of template `[style.*]` bindings) keeps
 * the template free of inline styles while rendering identically. The input
 * alias equals the selector, so `no-input-rename` permits it without a rename.
 */
class NatTableHeaderCellLayout {
    state = input.required({ ...(ngDevMode ? { debugName: "state" } : /* istanbul ignore next */ {}), alias: 'natTableHeaderCellLayout' });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderCellLayout, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableHeaderCellLayout, isStandalone: true, selector: "th[natTableHeaderCellLayout]", inputs: { state: { classPropertyName: "state", publicName: "natTableHeaderCellLayout", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.left.px": "state()?.left", "style.right.px": "state()?.right", "style.width": "state()?.headerWidth", "style.min-width": "state()?.headerMinWidth", "style.max-width": "state()?.headerMaxWidth" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHeaderCellLayout, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[natTableHeaderCellLayout]',
                    host: {
                        '[style.left.px]': 'state()?.left',
                        '[style.right.px]': 'state()?.right',
                        '[style.width]': 'state()?.headerWidth',
                        '[style.min-width]': 'state()?.headerMinWidth',
                        '[style.max-width]': 'state()?.headerMaxWidth'
                    }
                }]
        }], propDecorators: { state: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableHeaderCellLayout", required: true }] }] } });
/**
 * Host-styles a body cell's pinned offsets, width bounds, height, and the
 * `--nat-table-cell-max-lines` clamp custom property. Applied to both the
 * row-header `<th>` and the data `<td>`.
 */
class NatTableBodyCellLayout {
    state = input.required({ ...(ngDevMode ? { debugName: "state" } : /* istanbul ignore next */ {}), alias: 'natTableBodyCellLayout' });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableBodyCellLayout, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableBodyCellLayout, isStandalone: true, selector: "[natTableBodyCellLayout]", inputs: { state: { classPropertyName: "state", publicName: "natTableBodyCellLayout", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.--nat-table-cell-max-lines": "state()?.cellMaxLines", "style.height": "state()?.cellHeight", "style.left.px": "state()?.left", "style.right.px": "state()?.right", "style.width": "state()?.width", "style.min-width": "state()?.minWidth", "style.max-width": "state()?.maxWidth" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableBodyCellLayout, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTableBodyCellLayout]',
                    host: {
                        '[style.--nat-table-cell-max-lines]': 'state()?.cellMaxLines',
                        '[style.height]': 'state()?.cellHeight',
                        '[style.left.px]': 'state()?.left',
                        '[style.right.px]': 'state()?.right',
                        '[style.width]': 'state()?.width',
                        '[style.min-width]': 'state()?.minWidth',
                        '[style.max-width]': 'state()?.maxWidth'
                    }
                }]
        }], propDecorators: { state: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableBodyCellLayout", required: true }] }] } });
/**
 * Host-styles an element's pixel width from a runtime value. Used for both the
 * authoritative-layout `<table>` width and each `<col>` width; a `null`/absent
 * value clears the inline width exactly as the previous binding did.
 */
class NatTablePxWidth {
    natTablePxWidth = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTablePxWidth" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePxWidth, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTablePxWidth, isStandalone: true, selector: "[natTablePxWidth]", inputs: { natTablePxWidth: { classPropertyName: "natTablePxWidth", publicName: "natTablePxWidth", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.width.px": "natTablePxWidth()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePxWidth, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTablePxWidth]',
                    host: {
                        '[style.width.px]': 'natTablePxWidth()'
                    }
                }]
        }], propDecorators: { natTablePxWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTablePxWidth", required: true }] }] } });
/** Host-styles an element's pixel height from a runtime layout value. */
class NatTablePxHeight {
    natTablePxHeight = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTablePxHeight" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePxHeight, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTablePxHeight, isStandalone: true, selector: "[natTablePxHeight]", inputs: { natTablePxHeight: { classPropertyName: "natTablePxHeight", publicName: "natTablePxHeight", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.height.px": "natTablePxHeight()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTablePxHeight, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTablePxHeight]',
                    host: {
                        '[style.height.px]': 'natTablePxHeight()'
                    }
                }]
        }], propDecorators: { natTablePxHeight: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTablePxHeight", required: true }] }] } });
/**
 * Host-styles the column-resize drag guide: its left anchor plus the live
 * `translateX` that follows the pointer during a drag.
 */
class NatTableResizeGuide {
    guide = input.required({ ...(ngDevMode ? { debugName: "guide" } : /* istanbul ignore next */ {}), alias: 'natTableResizeGuide' });
    transform = computed(() => `translateX(${this.guide().offset}px)`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "transform" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableResizeGuide, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableResizeGuide, isStandalone: true, selector: "[natTableResizeGuide]", inputs: { guide: { classPropertyName: "guide", publicName: "natTableResizeGuide", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.left.px": "guide().left", "style.transform": "transform()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableResizeGuide, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natTableResizeGuide]',
                    host: {
                        '[style.left.px]': 'guide().left',
                        '[style.transform]': 'transform()'
                    }
                }]
        }], propDecorators: { guide: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableResizeGuide", required: true }] }] } });

/* eslint-disable max-lines -- table component: presentational template consumer + input bridging. A11y, resize, reorder, and header measurement logic live in injectable services. */
/**
 * Track expression for the body plan: loaded rows keep their stable TanStack
 * row id, placeholder slots key on their logical index. The prefix keeps a
 * placeholder key from colliding with a consumer row id.
 */
const trackNatTableBodyRow = (renderedRow) => renderedRow.kind === 'row' ? renderedRow.row.id : `nat-table-placeholder:${renderedRow.logicalIndex}`;
/**
 * Signals-first Angular table primitive built on TanStack Table.
 *
 * The core component renders the table structure only. Optional controls,
 * header actions, and themed surfaces live in companion packages.
 *
 * State ownership, TanStack wiring, column widths, resize/reorder state logic
 * and derived computeds are delegated to the injected `NatTableState`.
 * Accessibility announcements are handled by `NatTableA11yService`.
 * Resize DOM interactions are handled by `NatTableResizeService`.
 * Reorder scroll-into-view is handled by `NatTableReorderService`.
 * Header measurement is handled by `NatTableHeaderMeasurementService`.
 */
class NatTable {
    // ─── Inputs ───
    /** Row data rendered by the table. */
    data = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    /** TanStack column definitions for the current row type. */
    columns = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    /** Accessible name announced for the grid when no visible caption is rendered. */
    accessibleName = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    /** Visible table caption. When present, it provides the grid's accessible name. */
    caption = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []));
    /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
    dataStatus = input(NAT_TABLE_DATA_STATUS.success, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []));
    /** Optional error payload passed through to `natTableError` templates. */
    error = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** Enables row selection (`aria-selected`, selection state, companion checkbox column). */
    enableRowSelection = input(false, { ...(ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    selectionMode = input('multiple', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    /** Optional override for the global filter implementation. */
    globalFilterFn = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []));
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    getRowId = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "getRowId" }] : /* istanbul ignore next */ []));
    /** Emits one `rowRendered` event per body row per cycle. Off by default (adds an `afterRenderEffect` per row). */
    emitRowRenderEvents = input(false, { ...(ngDevMode ? { debugName: "emitRowRenderEvents" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /**
     * Leaf column id whose value groups rows under rendered sub-header rows.
     * The table always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    subHeaderColumn = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []));
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    subHeaderOrder = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []));
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this table only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    enableSubHeaders = input(true, { ...(ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /**
     * Layout mode for the sub-header row.
     * - `'colspan'` (default): Renders a single cell spanning the entire row.
     * - `'cells'`: Renders individual cells matching the column structure, preserving pinned column boundaries.
     */
    subHeaderLayout = input('colspan', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderLayout" }] : /* istanbul ignore next */ []));
    // ─── Outputs ───
    /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
    rowRendered = output();
    /** Emits on row click or Enter/Space unless the event started on an interactive descendant. */
    rowActivate = output();
    // ─── Injected services and directives ───
    natTableService = inject(NatTableService);
    state = inject(NatTableState);
    a11yService = inject(NatTableA11yService);
    resizeService = inject(NatTableResizeService);
    reorderService = inject(NatTableReorderService);
    destroyRef = inject(DestroyRef);
    // ─── State-derived template aliases ───
    // These expose state signals to the template with the same names the template expects.
    /** Public: NatTableUiController consumers (surface `[for]="grid"`) need these. */
    enablePagination = this.state.enablePagination;
    enableGlobalFilter = this.state.enableGlobalFilter;
    table = this.state.table;
    /** Stable DOM id for the rendered `<table>` element. */
    tableElementId = this.state.tableElementId;
    /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
    tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []));
    /** Resolved locale id (from the surface or the built-in English default). */
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
    // ─── ARIA computeds (delegated to state, except ariaDescribedBy which bridges state + service) ───
    tableCaptionId = this.state.tableCaptionId;
    tableSummaryId = this.state.tableSummaryId;
    tableDescriptionId = this.state.tableDescriptionId;
    tableKeyboardInstructionsId = this.state.tableKeyboardInstructionsId;
    tableAriaLabel = this.state.tableAriaLabel;
    tableAriaLabelledBy = this.state.tableAriaLabelledBy;
    resolvedKeyboardInstructions = this.state.resolvedKeyboardInstructions;
    ariaDescribedBy = computed(() => {
        const ids = [];
        if (this.tableSummary().trim()) {
            ids.push(this.tableSummaryId());
        }
        if (this.resolvedDescription().trim()) {
            ids.push(this.tableDescriptionId());
        }
        if (this.resolvedKeyboardInstructions().trim()) {
            ids.push(this.tableKeyboardInstructionsId());
        }
        return ids.length ? ids.join(' ') : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []));
    // ─── Template ref queries (component-owned, DOM-coupled) ───
    loadingTemplate = contentChild(NatTableLoadingTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []));
    emptyTemplate = contentChild(NatTableEmptyTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []));
    errorTemplate = contentChild(NatTableErrorTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []));
    subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []));
    rowPlaceholderTemplate = contentChild(NatTableRowPlaceholderTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowPlaceholderTemplate" }] : /* istanbul ignore next */ []));
    loadingTemplateRef = computed(() => {
        const templateRef = this.loadingTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplateRef" }] : /* istanbul ignore next */ []));
    emptyTemplateRef = computed(() => {
        const templateRef = this.emptyTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplateRef" }] : /* istanbul ignore next */ []));
    errorTemplateRef = computed(() => {
        const templateRef = this.errorTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplateRef" }] : /* istanbul ignore next */ []));
    subHeaderTemplateRef = computed(() => {
        const templateRef = this.subHeaderTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []));
    rowPlaceholderTemplateRef = computed(() => {
        const templateRef = this.rowPlaceholderTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowPlaceholderTemplateRef" }] : /* istanbul ignore next */ []));
    // ─── Sub-header groups (delegated to state) ───
    subHeaderGroups = this.state.subHeaderGroups;
    subHeaderRowOffsets = this.state.subHeaderRowOffsets;
    getSubHeaderContext(group) {
        return this.state.getSubHeaderTemplateContext(group);
    }
    getSubHeaderAriaText(group) {
        return this.state.getSubHeaderAnnouncement(group, 'table');
    }
    getRowPlaceholderContext(logicalIndex, column) {
        return this.state.getRowPlaceholderTemplateContext(logicalIndex, column);
    }
    getRowPlaceholderAriaText(logicalIndex) {
        return this.state.getRowPlaceholderAnnouncement(logicalIndex);
    }
    /** Bound to the body plan `@for` track; see `trackNatTableBodyRow`. */
    bodyRowTrackId = (trackNatTableBodyRow);
    loadingTemplateContext = computed(() => ({
        ...this.state.getStateTemplateBaseContext(),
        $implicit: NAT_TABLE_BODY_STATE.loading,
        status: NAT_TABLE_BODY_STATE.loading
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplateContext" }] : /* istanbul ignore next */ []));
    emptyTemplateContext = computed(() => ({
        ...this.state.getStateTemplateBaseContext(),
        $implicit: NAT_TABLE_BODY_STATE.empty,
        status: NAT_TABLE_BODY_STATE.empty
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplateContext" }] : /* istanbul ignore next */ []));
    errorTemplateContext = computed(() => {
        const error = this.error();
        return {
            ...this.state.getStateTemplateBaseContext(),
            $implicit: error,
            status: NAT_TABLE_BODY_STATE.error,
            error
        };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplateContext" }] : /* istanbul ignore next */ []));
    // ─── A11y (delegated to service) ───
    tableSummary = this.a11yService.tableSummary;
    liveMessage = this.a11yService.liveMessage;
    // ─── Resize (delegated to service) ───
    columnResizeGuide = this.resizeService.columnResizeGuide;
    isColumnResizing = this.resizeService.isColumnResizing;
    // ─── DOM-coupled state ───
    tableRegionRef = viewChild('tableRegion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []));
    // ─── Template-bound util aliases ───
    getHeaderRowColumnIds = (getHeaderRowColumnIds);
    shouldHidePrimitiveHeaderLabel = (shouldHidePrimitiveHeaderLabel);
    getCellTone = (getCellTone);
    canResizeColumn = (header) => canResizeColumn(header, this.state.resizingEnabled());
    isLeafHeaderRow = (headerGroup) => this.reorderService.isLeafHeaderRow(headerGroup);
    hasReorderableColumns = () => this.reorderService.hasReorderableColumns();
    canReorderHeader = (header) => !header.isPlaceholder && this.reorderService.canReorderHeader(header.column);
    // ─── Constructor ───
    constructor() {
        // NatTableHeaderMeasurementService is self-contained; injecting triggers its constructor lifecycle.
        inject(NatTableHeaderMeasurementService);
        inject(NatTableCellControlManager).startCellControlPreparation();
        this.natTableService.setController(this);
        // ── Accessibility effects ──
        // The shared effects self-register in the service constructor; only the
        // grid-only trio (resize announcements, aria-multiselectable, keybinding
        // validation) is opt-in.
        this.a11yService.registerGridEffects();
        // ── Signal-based input bridging ──
        // Sync component inputs → state writable signals via effects (no ngOnChanges).
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
        // ── Wire table region ref to state (read by all services) ──
        effect(() => this.state.tableRegionRef.set(this.tableRegionRef()));
        // ── Lifecycle effects (seed + render cycle delegated to state) ──
        this.state.registerSeedEffect();
        this.state.registerRenderCycleEffect();
        this.state.registerSubHeaderValidationEffect();
        this.destroyRef.onDestroy(() => {
            this.natTableService.clearController(this);
        });
    }
    // ─── NatTableUiController implementation (public API, delegates to state) ───
    patchState(updaters) {
        this.state.patchState(updaters);
    }
    // ─── Template event handlers ───
    onHeaderDrop(event, headerGroup) {
        this.reorderService.onHeaderDrop(event, headerGroup);
    }
    onHeaderKeydown(event, column) {
        const keyboard = this.natTableService.keyboard();
        // `defaultPrevented` also covers the NatTableCell host listener on the same
        // header cell, so a key it consumed can never fall through to resize/reorder.
        if (event.defaultPrevented)
            return;
        if (handleCellInteractionKeydown(event, keyboard.cellInteraction))
            return;
        if (event.altKey && !event.shiftKey && isResizeKey(event)) {
            this.resizeService.resizeFromKey(event, column);
            return;
        }
        const directionDelta = keyboard.columnReorderDirection(event);
        if (directionDelta === null)
            return;
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
        if (event.button !== 0 || event.defaultPrevented) {
            return;
        }
        if (originatesFromInteractiveDescendant(event)) {
            return;
        }
        this.rowActivate.emit({
            rowData: row.original,
            row,
            originalEvent: event
        });
    }
    onRowKeydown(event, row) {
        if (event.defaultPrevented) {
            return;
        }
        if (!this.natTableService.keyboard().rowActivate(event)) {
            return;
        }
        if (originatesFromInteractiveDescendant(event)) {
            return;
        }
        if (isSpaceShortcutKey(event.key)) {
            event.preventDefault();
        }
        this.rowActivate.emit({
            rowData: row.original,
            row,
            originalEvent: event
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTable, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTable, isStandalone: true, selector: "nat-table", inputs: { data: { classPropertyName: "data", publicName: "data", isSignal: true, isRequired: true, transformFunction: null }, columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: true, transformFunction: null }, accessibleName: { classPropertyName: "accessibleName", publicName: "accessibleName", isSignal: true, isRequired: false, transformFunction: null }, caption: { classPropertyName: "caption", publicName: "caption", isSignal: true, isRequired: false, transformFunction: null }, dataStatus: { classPropertyName: "dataStatus", publicName: "dataStatus", isSignal: true, isRequired: false, transformFunction: null }, error: { classPropertyName: "error", publicName: "error", isSignal: true, isRequired: false, transformFunction: null }, enableRowSelection: { classPropertyName: "enableRowSelection", publicName: "enableRowSelection", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, globalFilterFn: { classPropertyName: "globalFilterFn", publicName: "globalFilterFn", isSignal: true, isRequired: false, transformFunction: null }, getRowId: { classPropertyName: "getRowId", publicName: "getRowId", isSignal: true, isRequired: false, transformFunction: null }, emitRowRenderEvents: { classPropertyName: "emitRowRenderEvents", publicName: "emitRowRenderEvents", isSignal: true, isRequired: false, transformFunction: null }, subHeaderColumn: { classPropertyName: "subHeaderColumn", publicName: "subHeaderColumn", isSignal: true, isRequired: false, transformFunction: null }, subHeaderOrder: { classPropertyName: "subHeaderOrder", publicName: "subHeaderOrder", isSignal: true, isRequired: false, transformFunction: null }, enableSubHeaders: { classPropertyName: "enableSubHeaders", publicName: "enableSubHeaders", isSignal: true, isRequired: false, transformFunction: null }, subHeaderLayout: { classPropertyName: "subHeaderLayout", publicName: "subHeaderLayout", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { rowRendered: "rowRendered", rowActivate: "rowActivate" }, providers: [
            NatTableRowRenderStrategyRegistry,
            NatTableState,
            { provide: NAT_TABLE_ROW_WINDOW_HOST, useExisting: NatTableState },
            NatTableA11yService,
            NatTableResizeService,
            NatTableReorderService,
            NatTableHeaderMeasurementService,
            NatTableCellControlManager
        ], queries: [{ propertyName: "loadingTemplate", first: true, predicate: NatTableLoadingTemplate, descendants: true, isSignal: true }, { propertyName: "emptyTemplate", first: true, predicate: NatTableEmptyTemplate, descendants: true, isSignal: true }, { propertyName: "errorTemplate", first: true, predicate: NatTableErrorTemplate, descendants: true, isSignal: true }, { propertyName: "subHeaderTemplate", first: true, predicate: NatTableSubHeaderTemplate, descendants: true, isSignal: true }, { propertyName: "rowPlaceholderTemplate", first: true, predicate: NatTableRowPlaceholderTemplate, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "tableRegionRef", first: true, predicate: ["tableRegion"], descendants: true, isSignal: true }], exportAs: ["natTable"], ngImport: i0, template: "<!-- eslint-disable max-lines -- single cohesive table template (header/body/state rows + resize guide); splitting into partials would fragment the grid structure. -->\n<div #tableRegion [class.is-resizing]=\"isColumnResizing()\" class=\"table-region\" data-testid=\"nat-table-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (resolvedKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedKeyboardInstructions() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.aria-rowcount]=\"gridRowCount()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\"\n    colWrap=\"nowrap\"\n    ngGrid\n    rowWrap=\"nowrap\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      <ng-template #headerCellContent let-columnState=\"columnState\" let-header=\"header\">\n        @if (!header.isPlaceholder) {\n          @let headerContext = header.getContext();\n          @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n          @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n          <div class=\"header-cell-content\">\n            <span class=\"header-cell-primary\">\n              @if (hiddenHeaderLabel) {\n                <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n              }\n\n              @if (!hidePrimitiveHeaderLabel) {\n                <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                  {{ rendered }}\n                </ng-container>\n              }\n            </span>\n          </div>\n\n          @if (canResizeColumn(header)) {\n            <span\n              [attr.data-testid]=\"`nat-table-resize-handle-${header.column.id}`\"\n              [class.is-resizing]=\"header.column.getIsResizing()\"\n              aria-hidden=\"true\"\n              class=\"column-resize-handle\"\n              (click)=\"$event.stopPropagation()\"\n              (mousedown)=\"onResizeStart($event, header)\"\n              (pointerdown)=\"$event.stopPropagation()\"\n              (touchstart)=\"onResizeStart($event, header)\"></span>\n          }\n        }\n      </ng-template>\n      @let tableHeaderGroups = headerGroups();\n      @for (headerGroup of tableHeaderGroups; track headerGroup.id; let headerRowIndex = $index) {\n        @let isReorderableHeaderRow = hasReorderableColumns() && isLeafHeaderRow(headerGroup);\n        @if (isReorderableHeaderRow) {\n          <tr\n            [cdkDropListData]=\"getHeaderRowColumnIds(headerGroup)\"\n            [rowIndex]=\"headerRowIndex + 1\"\n            cdkDropList\n            cdkDropListOrientation=\"horizontal\"\n            ngGridRow\n            (cdkDropListDropped)=\"onHeaderDrop($event, headerGroup)\">\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [cdkDragData]=\"header.column.id\"\n                [cdkDragDisabled]=\"!canReorderHeader(header)\"\n                [class]=\"columnState?.headerClassMap\"\n                [class.is-reorderable]=\"canReorderHeader(header)\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                cdkDrag\n                cdkDragLockAxis=\"x\"\n                cdkDragPreviewContainer=\"parent\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        } @else {\n          <tr [rowIndex]=\"headerRowIndex + 1\" ngGridRow>\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [class]=\"columnState?.headerClassMap\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        }\n      }\n    </thead>\n    <tbody>\n      @let bodyPlan = bodyRenderPlan();\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @let subHeaderOffsets = subHeaderRowOffsets();\n          @for (renderedRow of bodyPlan.rows; track bodyRowTrackId(renderedRow)) {\n            @let dataRowIndex = headerRowCount() + renderedRow.logicalIndex + (subHeaderOffsets.at(renderedRow.logicalIndex) ?? 0) + 1;\n            @if (renderedRow.beforeSize > 0) {\n              <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n                <td\n                  [colSpan]=\"emptyStateColSpan()\"\n                  [natTablePxHeight]=\"renderedRow.beforeSize\"\n                  aria-hidden=\"true\"\n                  class=\"virtual-spacer-cell\"></td>\n              </tr>\n            }\n            @if (renderedRow.kind === 'placeholder') {\n              <!-- An unfetched logical slot under remote windowing: a real grid row\n                   holding one structurally correct fixed-height cell per column, told\n                   apart from data by aria-busy and the loading copy \u2014 never by fake\n                   content. -->\n              <tr\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [rowIndex]=\"dataRowIndex\"\n                aria-busy=\"true\"\n                class=\"data-row placeholder-row\"\n                data-testid=\"nat-table-row-placeholder\"\n                ngGridRow>\n                @for (column of visibleColumns(); track column.id; let columnIndex = $index) {\n                  @let columnState = columnStates[column.id];\n                  <td\n                    [attr.data-column-id]=\"column.id\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    natTableCell\n                    ngGridCell>\n                    <span class=\"data-cell-content\">\n                      @if (columnIndex === 0) {\n                        @if (getRowPlaceholderAriaText(renderedRow.logicalIndex); as ariaText) {\n                          <span class=\"sr-only\">{{ ariaText }}</span>\n                        }\n                      }\n                      @if (rowPlaceholderTemplateRef(); as templateRef) {\n                        <ng-container\n                          [ngTemplateOutlet]=\"templateRef\"\n                          [ngTemplateOutletContext]=\"getRowPlaceholderContext(renderedRow.logicalIndex, column)\" />\n                      }\n                    </span>\n                  </td>\n                }\n              </tr>\n            } @else {\n              @let row = renderedRow.row;\n              @let visibleCells = row.getVisibleCells();\n              @let subHeader = groups.get(row.id);\n              @if (subHeader) {\n                <ng-template #subHeaderInnerContent>\n                  <div class=\"sub-header-content\">\n                    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                      <span class=\"sr-only\">{{ ariaText }}</span>\n                    }\n                    @if (subHeaderTemplateRef(); as templateRef) {\n                      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                    } @else {\n                      <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                    }\n                  </div>\n                </ng-template>\n                <tr [rowIndex]=\"dataRowIndex - 1\" class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\" ngGridRow>\n                  @if (subHeaderLayout() === 'colspan') {\n                    <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\" natTableCell ngGridCell>\n                      <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                    </td>\n                  } @else {\n                    <!-- `cells` layout: one td per visible column instead of one\n                         full-width colspan cell. A colspan cell cannot be pinned, so\n                         with the colspan layout a horizontally scrolled table shows\n                         pinned columns' sticky offsets and backgrounds stopping at\n                         every group row. Here each td takes its own column's layout\n                         state (width, pinned offset, pinned background) via\n                         natTableBodyCellLayout, so the pinned zones run unbroken\n                         through the sub-header row. The group label renders once,\n                         inside the first cell; the rest stay empty. -->\n                    @for (cell of visibleCells; track cell.id; let first = $first) {\n                      @let columnState = columnStates[cell.column.id];\n                      <td\n                        [attr.data-column-id]=\"cell.column.id\"\n                        [class]=\"columnState?.cellClassMap\"\n                        [class.sub-header-cell]=\"true\"\n                        [natTableBodyCellLayout]=\"columnState\"\n                        natTableCell\n                        ngGridCell>\n                        @if (first) {\n                          <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                        }\n                      </td>\n                    }\n                  }\n                </tr>\n              }\n              <tr\n                [attr.aria-selected]=\"rowAriaSelected(row)\"\n                [attr.data-row-id]=\"row.id\"\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [natTableRowRenderEmitter]=\"row.id\"\n                [natTableRowRenderEnabled]=\"emitRowRenderEvents()\"\n                [natTableRowRenderStartedAt]=\"renderCycleStartedAt()\"\n                [natTableRowRenderToken]=\"renderCycleToken()\"\n                [rowIndex]=\"dataRowIndex\"\n                class=\"data-row\"\n                data-testid=\"nat-table-row\"\n                ngGridRow\n                (click)=\"onRowClick($event, row)\"\n                (keydown)=\"onRowKeydown($event, row)\"\n                (natTableRowRendered)=\"onRowRendered($event)\">\n                @for (cell of visibleCells; track cell.id) {\n                  @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                  @let cellTone = getCellTone(cell.column, cellContext);\n                  @if (columnState?.rowHeader) {\n                    <th\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell\n                      role=\"rowheader\"\n                      scope=\"row\">\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </th>\n                  } @else {\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell>\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </td>\n                  }\n                }\n              </tr>\n            }\n          }\n          @if (bodyPlan.afterSize > 0) {\n            <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n              <td\n                [colSpan]=\"emptyStateColSpan()\"\n                [natTablePxHeight]=\"bodyPlan.afterSize\"\n                aria-hidden=\"true\"\n                class=\"virtual-spacer-cell\"></td>\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  @if (columnResizeGuide(); as guide) {\n    <div [natTableResizeGuide]=\"guide\" aria-hidden=\"true\" class=\"column-resize-guide\"></div>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom:0}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:right}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;left:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: Grid, selector: "[ngGrid]", inputs: ["enableSelection", "disabled", "softDisabled", "focusMode", "rowWrap", "colWrap", "multi", "selectionMode", "tabindex"], exportAs: ["ngGrid"] }, { kind: "directive", type: GridCell, selector: "[ngGridCell]", inputs: ["id", "role", "rowSpan", "colSpan", "rowIndex", "colIndex", "disabled", "selected", "selectable", "tabindex"], outputs: ["selectedChange"], exportAs: ["ngGridCell"] }, { kind: "directive", type: GridRow, selector: "[ngGridRow]", inputs: ["rowIndex"], exportAs: ["ngGridRow"] }, { kind: "directive", type: CdkDropList, selector: "[cdkDropList], cdk-drop-list", inputs: ["cdkDropListConnectedTo", "cdkDropListData", "cdkDropListOrientation", "id", "cdkDropListLockAxis", "cdkDropListDisabled", "cdkDropListSortingDisabled", "cdkDropListEnterPredicate", "cdkDropListSortPredicate", "cdkDropListAutoScrollDisabled", "cdkDropListAutoScrollStep", "cdkDropListElementContainer", "cdkDropListHasAnchor"], outputs: ["cdkDropListDropped", "cdkDropListEntered", "cdkDropListExited", "cdkDropListSorted"], exportAs: ["cdkDropList"] }, { kind: "directive", type: CdkDrag, selector: "[cdkDrag]", inputs: ["cdkDragData", "cdkDragLockAxis", "cdkDragRootElement", "cdkDragBoundary", "cdkDragStartDelay", "cdkDragFreeDragPosition", "cdkDragDisabled", "cdkDragConstrainPosition", "cdkDragPreviewClass", "cdkDragPreviewContainer", "cdkDragScale"], outputs: ["cdkDragStarted", "cdkDragReleased", "cdkDragEnded", "cdkDragEntered", "cdkDragExited", "cdkDragDropped", "cdkDragMoved"], exportAs: ["cdkDrag"] }, { kind: "directive", type: FlexRender, selector: "[flexRender]", inputs: ["flexRender", "flexRenderProps", "flexRenderInjector"] }, { kind: "directive", type: NatTableRowRenderEmitter, selector: "tr[natTableRowRenderEmitter]", inputs: ["natTableRowRenderEmitter", "natTableRowRenderToken", "natTableRowRenderStartedAt", "natTableRowRenderEnabled"], outputs: ["natTableRowRendered"] }, { kind: "directive", type: NatTableCell, selector: "[natTableCell]" }, { kind: "directive", type: NatTableHeaderCellLayout, selector: "th[natTableHeaderCellLayout]", inputs: ["natTableHeaderCellLayout"] }, { kind: "directive", type: NatTableBodyCellLayout, selector: "[natTableBodyCellLayout]", inputs: ["natTableBodyCellLayout"] }, { kind: "directive", type: NatTablePxHeight, selector: "[natTablePxHeight]", inputs: ["natTablePxHeight"] }, { kind: "directive", type: NatTablePxWidth, selector: "[natTablePxWidth]", inputs: ["natTablePxWidth"] }, { kind: "directive", type: NatTableResizeGuide, selector: "[natTableResizeGuide]", inputs: ["natTableResizeGuide"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTable, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table', exportAs: 'natTable', imports: [
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
                    ], providers: [
                        NatTableRowRenderStrategyRegistry,
                        NatTableState,
                        { provide: NAT_TABLE_ROW_WINDOW_HOST, useExisting: NatTableState },
                        NatTableA11yService,
                        NatTableResizeService,
                        NatTableReorderService,
                        NatTableHeaderMeasurementService,
                        NatTableCellControlManager
                    ], template: "<!-- eslint-disable max-lines -- single cohesive table template (header/body/state rows + resize guide); splitting into partials would fragment the grid structure. -->\n<div #tableRegion [class.is-resizing]=\"isColumnResizing()\" class=\"table-region\" data-testid=\"nat-table-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (resolvedKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedKeyboardInstructions() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.aria-rowcount]=\"gridRowCount()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\"\n    colWrap=\"nowrap\"\n    ngGrid\n    rowWrap=\"nowrap\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      <ng-template #headerCellContent let-columnState=\"columnState\" let-header=\"header\">\n        @if (!header.isPlaceholder) {\n          @let headerContext = header.getContext();\n          @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n          @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n          <div class=\"header-cell-content\">\n            <span class=\"header-cell-primary\">\n              @if (hiddenHeaderLabel) {\n                <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n              }\n\n              @if (!hidePrimitiveHeaderLabel) {\n                <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                  {{ rendered }}\n                </ng-container>\n              }\n            </span>\n          </div>\n\n          @if (canResizeColumn(header)) {\n            <span\n              [attr.data-testid]=\"`nat-table-resize-handle-${header.column.id}`\"\n              [class.is-resizing]=\"header.column.getIsResizing()\"\n              aria-hidden=\"true\"\n              class=\"column-resize-handle\"\n              (click)=\"$event.stopPropagation()\"\n              (mousedown)=\"onResizeStart($event, header)\"\n              (pointerdown)=\"$event.stopPropagation()\"\n              (touchstart)=\"onResizeStart($event, header)\"></span>\n          }\n        }\n      </ng-template>\n      @let tableHeaderGroups = headerGroups();\n      @for (headerGroup of tableHeaderGroups; track headerGroup.id; let headerRowIndex = $index) {\n        @let isReorderableHeaderRow = hasReorderableColumns() && isLeafHeaderRow(headerGroup);\n        @if (isReorderableHeaderRow) {\n          <tr\n            [cdkDropListData]=\"getHeaderRowColumnIds(headerGroup)\"\n            [rowIndex]=\"headerRowIndex + 1\"\n            cdkDropList\n            cdkDropListOrientation=\"horizontal\"\n            ngGridRow\n            (cdkDropListDropped)=\"onHeaderDrop($event, headerGroup)\">\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [cdkDragData]=\"header.column.id\"\n                [cdkDragDisabled]=\"!canReorderHeader(header)\"\n                [class]=\"columnState?.headerClassMap\"\n                [class.is-reorderable]=\"canReorderHeader(header)\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                cdkDrag\n                cdkDragLockAxis=\"x\"\n                cdkDragPreviewContainer=\"parent\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        } @else {\n          <tr [rowIndex]=\"headerRowIndex + 1\" ngGridRow>\n            @for (header of headerGroup.headers; track header.id) {\n              @let columnState = columnStates[header.column.id];\n              <th\n                [attr.aria-sort]=\"columnState?.ariaSort\"\n                [attr.data-column-id]=\"header.column.id\"\n                [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n                [class]=\"columnState?.headerClassMap\"\n                [natTableHeaderCellLayout]=\"columnState\"\n                natTableCell\n                ngGridCell\n                role=\"columnheader\"\n                scope=\"col\"\n                (keydown)=\"onHeaderKeydown($event, header.column)\">\n                <ng-container\n                  [ngTemplateOutlet]=\"headerCellContent\"\n                  [ngTemplateOutletContext]=\"{ header, columnState }\"\n                  ngTemplateOutletInjector=\"outlet\" />\n              </th>\n            }\n          </tr>\n        }\n      }\n    </thead>\n    <tbody>\n      @let bodyPlan = bodyRenderPlan();\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @let subHeaderOffsets = subHeaderRowOffsets();\n          @for (renderedRow of bodyPlan.rows; track bodyRowTrackId(renderedRow)) {\n            @let dataRowIndex = headerRowCount() + renderedRow.logicalIndex + (subHeaderOffsets.at(renderedRow.logicalIndex) ?? 0) + 1;\n            @if (renderedRow.beforeSize > 0) {\n              <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n                <td\n                  [colSpan]=\"emptyStateColSpan()\"\n                  [natTablePxHeight]=\"renderedRow.beforeSize\"\n                  aria-hidden=\"true\"\n                  class=\"virtual-spacer-cell\"></td>\n              </tr>\n            }\n            @if (renderedRow.kind === 'placeholder') {\n              <!-- An unfetched logical slot under remote windowing: a real grid row\n                   holding one structurally correct fixed-height cell per column, told\n                   apart from data by aria-busy and the loading copy \u2014 never by fake\n                   content. -->\n              <tr\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [rowIndex]=\"dataRowIndex\"\n                aria-busy=\"true\"\n                class=\"data-row placeholder-row\"\n                data-testid=\"nat-table-row-placeholder\"\n                ngGridRow>\n                @for (column of visibleColumns(); track column.id; let columnIndex = $index) {\n                  @let columnState = columnStates[column.id];\n                  <td\n                    [attr.data-column-id]=\"column.id\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    natTableCell\n                    ngGridCell>\n                    <span class=\"data-cell-content\">\n                      @if (columnIndex === 0) {\n                        @if (getRowPlaceholderAriaText(renderedRow.logicalIndex); as ariaText) {\n                          <span class=\"sr-only\">{{ ariaText }}</span>\n                        }\n                      }\n                      @if (rowPlaceholderTemplateRef(); as templateRef) {\n                        <ng-container\n                          [ngTemplateOutlet]=\"templateRef\"\n                          [ngTemplateOutletContext]=\"getRowPlaceholderContext(renderedRow.logicalIndex, column)\" />\n                      }\n                    </span>\n                  </td>\n                }\n              </tr>\n            } @else {\n              @let row = renderedRow.row;\n              @let visibleCells = row.getVisibleCells();\n              @let subHeader = groups.get(row.id);\n              @if (subHeader) {\n                <ng-template #subHeaderInnerContent>\n                  <div class=\"sub-header-content\">\n                    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                      <span class=\"sr-only\">{{ ariaText }}</span>\n                    }\n                    @if (subHeaderTemplateRef(); as templateRef) {\n                      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                    } @else {\n                      <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                    }\n                  </div>\n                </ng-template>\n                <tr [rowIndex]=\"dataRowIndex - 1\" class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\" ngGridRow>\n                  @if (subHeaderLayout() === 'colspan') {\n                    <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\" natTableCell ngGridCell>\n                      <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                    </td>\n                  } @else {\n                    <!-- `cells` layout: one td per visible column instead of one\n                         full-width colspan cell. A colspan cell cannot be pinned, so\n                         with the colspan layout a horizontally scrolled table shows\n                         pinned columns' sticky offsets and backgrounds stopping at\n                         every group row. Here each td takes its own column's layout\n                         state (width, pinned offset, pinned background) via\n                         natTableBodyCellLayout, so the pinned zones run unbroken\n                         through the sub-header row. The group label renders once,\n                         inside the first cell; the rest stay empty. -->\n                    @for (cell of visibleCells; track cell.id; let first = $first) {\n                      @let columnState = columnStates[cell.column.id];\n                      <td\n                        [attr.data-column-id]=\"cell.column.id\"\n                        [class]=\"columnState?.cellClassMap\"\n                        [class.sub-header-cell]=\"true\"\n                        [natTableBodyCellLayout]=\"columnState\"\n                        natTableCell\n                        ngGridCell>\n                        @if (first) {\n                          <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                        }\n                      </td>\n                    }\n                  }\n                </tr>\n              }\n              <tr\n                [attr.aria-selected]=\"rowAriaSelected(row)\"\n                [attr.data-row-id]=\"row.id\"\n                [attr.data-row-index]=\"renderedRow.logicalIndex\"\n                [natTableRowRenderEmitter]=\"row.id\"\n                [natTableRowRenderEnabled]=\"emitRowRenderEvents()\"\n                [natTableRowRenderStartedAt]=\"renderCycleStartedAt()\"\n                [natTableRowRenderToken]=\"renderCycleToken()\"\n                [rowIndex]=\"dataRowIndex\"\n                class=\"data-row\"\n                data-testid=\"nat-table-row\"\n                ngGridRow\n                (click)=\"onRowClick($event, row)\"\n                (keydown)=\"onRowKeydown($event, row)\"\n                (natTableRowRendered)=\"onRowRendered($event)\">\n                @for (cell of visibleCells; track cell.id) {\n                  @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                  @let cellTone = getCellTone(cell.column, cellContext);\n                  @if (columnState?.rowHeader) {\n                    <th\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell\n                      role=\"rowheader\"\n                      scope=\"row\">\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </th>\n                  } @else {\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [attr.data-tone]=\"cellTone\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [natTableBodyCellLayout]=\"columnState\"\n                      natTableCell\n                      ngGridCell>\n                      <span class=\"data-cell-content\">\n                        <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                          {{ rendered }}\n                        </ng-container>\n                      </span>\n                    </td>\n                  }\n                }\n              </tr>\n            }\n          }\n          @if (bodyPlan.afterSize > 0) {\n            <tr aria-hidden=\"true\" class=\"virtual-spacer-row\" data-testid=\"nat-table-virtual-spacer\" role=\"presentation\">\n              <td\n                [colSpan]=\"emptyStateColSpan()\"\n                [natTablePxHeight]=\"bodyPlan.afterSize\"\n                aria-hidden=\"true\"\n                class=\"virtual-spacer-cell\"></td>\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr [rowIndex]=\"headerRowCount() + 1\" ngGridRow>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\" natTableCell ngGridCell>\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  @if (columnResizeGuide(); as guide) {\n    <div [natTableResizeGuide]=\"guide\" aria-hidden=\"true\" class=\"column-resize-guide\"></div>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom:0}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:right}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;left:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: true }] }], columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], accessibleName: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibleName", required: false }] }], caption: [{ type: i0.Input, args: [{ isSignal: true, alias: "caption", required: false }] }], dataStatus: [{ type: i0.Input, args: [{ isSignal: true, alias: "dataStatus", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], enableRowSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableRowSelection", required: false }] }], selectionMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectionMode", required: false }] }], globalFilterFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "globalFilterFn", required: false }] }], getRowId: [{ type: i0.Input, args: [{ isSignal: true, alias: "getRowId", required: false }] }], emitRowRenderEvents: [{ type: i0.Input, args: [{ isSignal: true, alias: "emitRowRenderEvents", required: false }] }], subHeaderColumn: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderColumn", required: false }] }], subHeaderOrder: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderOrder", required: false }] }], enableSubHeaders: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableSubHeaders", required: false }] }], subHeaderLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderLayout", required: false }] }], rowRendered: [{ type: i0.Output, args: ["rowRendered"] }], rowActivate: [{ type: i0.Output, args: ["rowActivate"] }], loadingTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }] }], emptyTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }] }], errorTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }] }], subHeaderTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }] }], rowPlaceholderTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableRowPlaceholderTemplate), { isSignal: true }] }], tableRegionRef: [{ type: i0.ViewChild, args: ['tableRegion', { isSignal: true }] }] } });

/**
 * Assigns a list field to its named grid area (the column id), letting
 * consumers position fields via `--nat-list-item-areas`.
 */
class NatListFieldArea {
    natListFieldArea = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natListFieldArea" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatListFieldArea, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatListFieldArea, isStandalone: true, selector: "[natListFieldArea]", inputs: { natListFieldArea: { classPropertyName: "natListFieldArea", publicName: "natListFieldArea", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "style.grid-area": "natListFieldArea()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatListFieldArea, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natListFieldArea]',
                    host: {
                        '[style.grid-area]': 'natListFieldArea()'
                    }
                }]
        }], propDecorators: { natListFieldArea: [{ type: i0.Input, args: [{ isSignal: true, alias: "natListFieldArea", required: true }] }] } });

/**
 * Finds a row's cell for a column id, or `null` when the column has no cell.
 *
 * Reads TanStack's memoized per-row record instead of scanning `getAllCells()`:
 * the template calls this per field on every change-detection pass, so an
 * O(columns) scan here would cost rows x columns^2 comparisons per pass.
 */
const findRowCell = (row, columnId) => 
// eslint-disable-next-line no-underscore-dangle -- TanStack's memoized internal accessor; implementation files may import TanStack internals directly.
row._getAllCellsByColumnId()[columnId] ?? null;
/**
 * Whether the column resolves a plain-text field label (`meta.hiddenHeaderLabel`,
 * `meta.label`, or a string `header`). Columns without one render their header
 * def (component, template, or returned text) through `flexRender` instead.
 */
const hasStaticLabel = (column) => {
    const { header, meta } = column.columnDef;
    return typeof header === 'string' || !!meta?.label || !!meta?.hiddenHeaderLabel;
};
/**
 * Whether the column's resolved label comes from `meta.hiddenHeaderLabel`,
 * which renders as screen-reader-only text — same contract as the table's
 * hidden header labels. Setting it (without `meta.label`) removes the visible
 * field label from the list while keeping the accessible name.
 */
const isSrOnlyLabel = (column) => !!column.columnDef.meta?.hiddenHeaderLabel;

/**
 * Presentation for the non-row body states. All three share the `list-state`
 * base class and add one state modifier, so consumers can theme them together
 * through the shared `--nat-list-state-*` tokens or individually through
 * the per-state accent tokens.
 */
const LIST_STATE_VIEWS = {
    [NAT_TABLE_BODY_STATE.loading]: { className: 'list-state list-state-loading', testId: 'nat-list-loading-state' },
    [NAT_TABLE_BODY_STATE.empty]: { className: 'list-state list-state-empty', testId: 'nat-list-empty-state' },
    [NAT_TABLE_BODY_STATE.error]: { className: 'list-state list-state-error', testId: 'nat-list-error-state' }
};

/**
 * Presentation for the current body state, or `null` while rows are shown.
 * Keeps all three states on one markup shape so they share a base design.
 */
const resolveListStateView = (bodyState, messages) => {
    if (bodyState === NAT_TABLE_BODY_STATE.rows) {
        return null;
    }
    return { ...LIST_STATE_VIEWS[bodyState], state: bodyState, message: messages[bodyState] };
};
/**
 * Builds the context handed to a consumer state template. The error state also
 * carries the consumer-supplied payload, matching the table's contract.
 */
const buildListStateTemplateContext = (base, bodyState, error) => {
    if (bodyState === NAT_TABLE_BODY_STATE.error) {
        return { ...base, $implicit: error, status: NAT_TABLE_BODY_STATE.error, error };
    }
    if (bodyState === NAT_TABLE_BODY_STATE.loading) {
        return { ...base, $implicit: NAT_TABLE_BODY_STATE.loading, status: NAT_TABLE_BODY_STATE.loading };
    }
    return { ...base, $implicit: NAT_TABLE_BODY_STATE.empty, status: NAT_TABLE_BODY_STATE.empty };
};

/* eslint-disable max-lines -- list component shell, mirroring table.ts: inputs/outputs, the NatTableUiController surface, state-signal aliases, and input bridging. All pure logic (state views, template contexts, column label resolution) lives in ./utils and ./common. */
/**
 * SPIKE: list renderer sharing the table engine (`NatTableState`).
 *
 * Renders each row as a stacked list item whose fields follow the visible
 * column order, so sorting, filtering, column order, and column visibility
 * state drive the list exactly as they drive the table. Implements
 * `NatTableUiController`, so surface-bound companion controls resolve it.
 *
 * `enableItemNavigation` opts into the table's composite grid pattern
 * (`@angular/aria/grid` + the cell-interaction model) with one gridcell per
 * item.
 *
 * Deliberately omitted: column resizing, pinning, header measurement, and
 * reorder DOM affordances — consumers drive sorting and field order through
 * surface state / `patchState`.
 */
class NatList {
    // ─── Inputs ───
    /** Row data rendered by the list. */
    data = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    /** TanStack column definitions for the current row type. */
    columns = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    /** Accessible name announced for the list. */
    accessibleName = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    /** Data lifecycle status. The list renders state items; consumers still own loading, retry, and error handling. */
    dataStatus = input(NAT_TABLE_DATA_STATUS.success, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []));
    /** Optional error payload. */
    error = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** Optional override for the global filter implementation. */
    globalFilterFn = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []));
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    getRowId = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "getRowId" }] : /* istanbul ignore next */ []));
    /**
     * Enables row selection state. Pair with a selection column (for example
     * `withNatTableSelectionColumn(...)`) to render a per-item checkbox; the
     * item then carries `data-selected` for styling.
     */
    enableRowSelection = input(false, { ...(ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    selectionMode = input('multiple', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    /**
     * Makes items activatable: each item renders a stretched activator button
     * that emits `rowActivate` on click and Enter/Space.
     *
     * A real `<button>` rather than a focusable `<li>`: a focusable listitem
     * exposes no interactive role, so assistive technology would announce it as
     * plain text with no way to discover that Enter does anything (WCAG 4.1.2).
     * Opt-in because it adds a tab stop per item.
     *
     * With `enableItemNavigation` the activator is not rendered: the focusable
     * gridcell already carries an interactive role, so items activate on click
     * and on the `rowActivate` shortcut directly, exactly like table rows.
     */
    enableRowActivation = input(false, { ...(ngDevMode ? { debugName: "enableRowActivation" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /**
     * Leaf column id whose value groups items under rendered sub-header items.
     * The list always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    subHeaderColumn = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []));
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    subHeaderOrder = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []));
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this list only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    enableSubHeaders = input(true, { ...(ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /**
     * Enables composite item navigation (the APG layout-grid pattern, shared
     * with `NatTable`): the list becomes one tab stop, Up/Down arrows move a
     * roving focus between items, Enter steps into an item's controls, Tab
     * cycles through them, and Escape returns to the item. Items render as
     * `role="row"`/`role="gridcell"` instead of plain list items, items emit
     * `rowActivate` on click and on the `rowActivate` shortcut, and native
     * controls inside fields are managed into the roving tab order.
     *
     * Opt-in: the default plain list keeps browse-mode-friendly `role="list"`
     * semantics, which suit short lists; composite navigation suits long lists
     * where one tab stop per item would make keyboard traversal expensive.
     */
    enableItemNavigation = input(false, { ...(ngDevMode ? { debugName: "enableItemNavigation" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    // ─── Outputs ───
    /** Emits when an item's activator button is clicked or keyboard-activated. */
    rowActivate = output();
    // ─── Injected services ───
    natTableService = inject(NatTableService);
    state = inject(NatTableState);
    a11yService = inject(NatTableA11yService);
    destroyRef = inject(DestroyRef);
    // ─── NatTableUiController contract ───
    enablePagination = this.state.enablePagination;
    enableGlobalFilter = this.state.enableGlobalFilter;
    table = this.state.table;
    /** Stable DOM id for the rendered `<ul>` element. */
    tableElementId = this.state.tableElementId;
    /** Scrollable wrapper around the rendered list for companion scroll controls. */
    tableScrollContainer = computed(() => this.listRegionRef()?.nativeElement ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []));
    /** Resolved locale id (from the surface or the built-in English default). */
    localeId = this.state.localeId;
    // ─── State-derived template aliases ───
    bodyRows = this.state.bodyRows;
    visibleColumns = this.state.visibleColumns;
    bodyState = this.state.bodyState;
    /**
     * Default stacked `grid-template-areas` for a list item: one row per visible
     * column, named by column id. Written to the internal `--sys-*` bridge so a
     * consumer's `--nat-list-item-areas` (plus `-columns`) can lay out the
     * named field areas freely; each field carries `grid-area: <column-id>`.
     */
    defaultItemAreas = computed(() => this.visibleColumns()
        .map((column) => `'${column.id}'`)
        .join(' '), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "defaultItemAreas" }] : /* istanbul ignore next */ []));
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
    /**
     * Rendered loading/empty/error item, or `null` while rows are shown. Keeps
     * the three states on one markup shape so they share a base design.
     */
    stateView = computed(() => resolveListStateView(this.bodyState(), {
        [NAT_TABLE_BODY_STATE.loading]: this.resolvedLoadingState(),
        [NAT_TABLE_BODY_STATE.empty]: this.resolvedEmptyState(),
        [NAT_TABLE_BODY_STATE.error]: this.resolvedErrorState()
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stateView" }] : /* istanbul ignore next */ []));
    // ─── Consumer state templates (same directives the table accepts) ───
    loadingTemplate = contentChild(NatTableLoadingTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []));
    emptyTemplate = contentChild(NatTableEmptyTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []));
    errorTemplate = contentChild(NatTableErrorTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []));
    subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []));
    // ─── Sub-header groups (delegated to state) ───
    subHeaderGroups = this.state.subHeaderGroups;
    subHeaderTemplateRef = computed(() => {
        const templateRef = this.subHeaderTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []));
    getSubHeaderContext(group) {
        return this.state.getSubHeaderTemplateContext(group);
    }
    getSubHeaderAriaText(group) {
        return this.state.getSubHeaderAnnouncement(group, 'list');
    }
    /**
     * Active consumer state template plus its context, or `null` to fall back to
     * the built-in indicator and message. The template replaces the state item's
     * content while keeping the shared `list-state` shell and its style tokens.
     */
    stateTemplateView = computed(() => {
        const bodyState = this.bodyState();
        if (bodyState === NAT_TABLE_BODY_STATE.rows) {
            return null;
        }
        const templateRefs = {
            [NAT_TABLE_BODY_STATE.loading]: this.loadingTemplate()?.templateRef,
            [NAT_TABLE_BODY_STATE.empty]: this.emptyTemplate()?.templateRef,
            [NAT_TABLE_BODY_STATE.error]: this.errorTemplate()?.templateRef
        };
        const templateRef = templateRefs[bodyState];
        return templateRef
            ? { templateRef, context: buildListStateTemplateContext(this.state.getStateTemplateBaseContext(), bodyState, this.error()) }
            : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stateTemplateView" }] : /* istanbul ignore next */ []));
    // ─── A11y (delegated to service) ───
    listSummary = this.a11yService.listSummary;
    liveMessage = this.a11yService.liveMessage;
    ariaDescribedBy = computed(() => {
        const ids = [];
        if (this.listSummary().trim()) {
            ids.push(this.listSummaryId());
        }
        if (this.resolvedDescription().trim()) {
            ids.push(this.tableDescriptionId());
        }
        // Keyboard instructions only exist in composite mode — a plain list has
        // no grid keyboard model to describe.
        if (this.enableItemNavigation() && this.resolvedListKeyboardInstructions().trim()) {
            ids.push(this.tableKeyboardInstructionsId());
        }
        return ids.length ? ids.join(' ') : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []));
    // ─── DOM-coupled state ───
    listRegionRef = viewChild('listRegion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listRegionRef" }] : /* istanbul ignore next */ []));
    // ─── Template-bound util aliases ───
    resolveColumnLabel = (resolveColumnLabel);
    cellForColumn = (findRowCell);
    hasStaticLabel = (hasStaticLabel);
    isSrOnlyLabel = (isSrOnlyLabel);
    /**
     * Selected flag for a list item, or `null` when selection is disabled.
     *
     * Exposed as `data-selected` rather than `aria-selected`: `aria-selected` is
     * invalid on `role="listitem"`, and the selection control inside the item
     * (a real checkbox) already conveys state to assistive technology. In
     * composite mode the item row additionally carries `aria-selected` (valid on
     * `role="row"`) via `rowAriaSelected`, mirroring the table.
     */
    rowSelectedAttribute(row) {
        return this.enableRowSelection() ? String(row.getIsSelected()) : null;
    }
    /** `aria-selected` for a composite-mode item row, mirroring `NatTable`. */
    rowAriaSelected(row) {
        return this.enableRowSelection() ? row.getIsSelected() : null;
    }
    /** Leaf header contexts by column id, for rendering non-string header defs as field labels. */
    leafHeaderContexts = computed(() => {
        const leafHeaders = this.state.headerGroups().at(-1)?.headers ?? [];
        return new Map(leafHeaders.filter((header) => !header.isPlaceholder).map((header) => [header.column.id, header.getContext()]));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "leafHeaderContexts" }] : /* istanbul ignore next */ []));
    // ─── Constructor ───
    constructor() {
        // Prepares native controls inside `[natTableCell]` gridcells (roving
        // `tabindex="-1"` + managed-widget marker). Inert in plain list mode:
        // only the composite branch renders `[natTableCell]` elements, so the
        // manager finds no owned cells until item navigation is enabled.
        inject(NatTableCellControlManager).startCellControlPreparation();
        this.natTableService.setController(this);
        // ── Accessibility copy ──
        // The shared a11y effects self-register in the service constructor; the
        // list selects its announcement copy (items/fields, not rows/columns) and
        // registers the list-renderer set — the `aria-multiselectable` writer
        // (self-gating on a rendered `[role="grid"]`) and keybinding validation.
        // Column-resize announcements stay `registerGridEffects`-only.
        this.a11yService.setRenderer('list');
        this.a11yService.registerListEffects();
        // ── Signal-based input bridging (same pattern as NatTable) ──
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
        this.destroyRef.onDestroy(() => {
            this.natTableService.clearController(this);
        });
    }
    // ─── Row activation ───
    /**
     * Id of the item's first visible field, naming the activator button via
     * `aria-labelledby`. Keyed by render index, not `row.id`: row ids come from
     * the consumer's `getRowId` and may contain whitespace or other characters
     * that break an id reference (`aria-labelledby` is a space-separated list),
     * which would leave the activator with no accessible name.
     */
    activatorLabelId(index) {
        return `${this.tableElementId()}-item-${index}-label`;
    }
    // No interactive-descendant guard here: the activator is a stretched sibling
    // of the fields, so events from controls inside fields never reach it — they
    // stack above it in CSS.
    onActivatorClick(event, row) {
        if (event.defaultPrevented || event.button !== 0) {
            return;
        }
        this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
    }
    onActivatorKeydown(event, row) {
        if (event.defaultPrevented || !this.natTableService.keyboard().rowActivate(event)) {
            return;
        }
        // Emit through the configured keybinding (so a surface rebind applies to
        // the list) and suppress the button's own native activation: without this,
        // Enter/Space would synthesize a click and emit twice, and Space would
        // scroll the page.
        event.preventDefault();
        this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
    }
    // ─── Composite-mode item activation (mirrors NatTable's row handlers) ───
    // Bound on the item row (not the gridcell) so the cell-interaction model on
    // the cell handles Enter/Tab/Escape first and stops propagation when it
    // does; only unhandled events bubble here. Emits unconditionally like table
    // rows — the focusable gridcell is the activation affordance, so
    // `enableRowActivation` (a plain-mode tab-stop trade-off) does not gate it.
    onItemClick(event, row) {
        if (event.button !== 0 || event.defaultPrevented) {
            return;
        }
        if (originatesFromInteractiveDescendant(event)) {
            return;
        }
        this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
    }
    onItemKeydown(event, row) {
        if (event.defaultPrevented) {
            return;
        }
        if (!this.natTableService.keyboard().rowActivate(event)) {
            return;
        }
        if (originatesFromInteractiveDescendant(event)) {
            return;
        }
        if (isSpaceShortcutKey(event.key)) {
            event.preventDefault();
        }
        this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
    }
    // ─── NatTableUiController implementation (delegates to state) ───
    patchState(updaters) {
        this.state.patchState(updaters);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatList, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatList, isStandalone: true, selector: "nat-list", inputs: { data: { classPropertyName: "data", publicName: "data", isSignal: true, isRequired: true, transformFunction: null }, columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: true, transformFunction: null }, accessibleName: { classPropertyName: "accessibleName", publicName: "accessibleName", isSignal: true, isRequired: false, transformFunction: null }, dataStatus: { classPropertyName: "dataStatus", publicName: "dataStatus", isSignal: true, isRequired: false, transformFunction: null }, error: { classPropertyName: "error", publicName: "error", isSignal: true, isRequired: false, transformFunction: null }, globalFilterFn: { classPropertyName: "globalFilterFn", publicName: "globalFilterFn", isSignal: true, isRequired: false, transformFunction: null }, getRowId: { classPropertyName: "getRowId", publicName: "getRowId", isSignal: true, isRequired: false, transformFunction: null }, enableRowSelection: { classPropertyName: "enableRowSelection", publicName: "enableRowSelection", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, enableRowActivation: { classPropertyName: "enableRowActivation", publicName: "enableRowActivation", isSignal: true, isRequired: false, transformFunction: null }, subHeaderColumn: { classPropertyName: "subHeaderColumn", publicName: "subHeaderColumn", isSignal: true, isRequired: false, transformFunction: null }, subHeaderOrder: { classPropertyName: "subHeaderOrder", publicName: "subHeaderOrder", isSignal: true, isRequired: false, transformFunction: null }, enableSubHeaders: { classPropertyName: "enableSubHeaders", publicName: "enableSubHeaders", isSignal: true, isRequired: false, transformFunction: null }, enableItemNavigation: { classPropertyName: "enableItemNavigation", publicName: "enableItemNavigation", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { rowActivate: "rowActivate" }, host: { properties: { "style.--sys-nat-table-list-item-areas": "defaultItemAreas()" } }, providers: [NatTableState, NatTableA11yService, NatTableCellControlManager], queries: [{ propertyName: "loadingTemplate", first: true, predicate: NatTableLoadingTemplate, descendants: true, isSignal: true }, { propertyName: "emptyTemplate", first: true, predicate: NatTableEmptyTemplate, descendants: true, isSignal: true }, { propertyName: "errorTemplate", first: true, predicate: NatTableErrorTemplate, descendants: true, isSignal: true }, { propertyName: "subHeaderTemplate", first: true, predicate: NatTableSubHeaderTemplate, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "listRegionRef", first: true, predicate: ["listRegion"], descendants: true, isSignal: true }], exportAs: ["natList"], ngImport: i0, template: "<!-- eslint-disable max-lines -- single cohesive list template (shared field/sub-header/state templates + the plain and composite ul branches); splitting into partials would fragment the renderer switch. -->\n<div #listRegion class=\"list-region\" data-testid=\"nat-list-region\">\n  @if (listSummary().trim()) {\n    <p [id]=\"listSummaryId()\" class=\"sr-only\">{{ listSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (enableItemNavigation() && resolvedListKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedListKeyboardInstructions() }}</p>\n  }\n\n  <!-- One item's fields, shared by the plain and composite branches. The\n       activator label id only exists while the plain branch renders the\n       stretched activator button (`withActivator`); the composite branch has\n       no activator to name. -->\n  <ng-template\n    #itemFields\n    let-headerContexts=\"headerContexts\"\n    let-itemIndex=\"itemIndex\"\n    let-listColumns=\"listColumns\"\n    let-row=\"row\"\n    let-withActivator=\"withActivator\">\n    @for (column of listColumns; track column.id) {\n      @let cell = cellForColumn(row, column.id);\n      @if (cell) {\n        <div\n          [attr.data-column-id]=\"column.id\"\n          [attr.id]=\"withActivator && $first ? activatorLabelId(itemIndex) : null\"\n          [natListFieldArea]=\"column.id\"\n          class=\"list-field\">\n          <span [class.sr-only]=\"isSrOnlyLabel(column)\" class=\"list-field-label\">\n            @let headerDef = column.columnDef.header;\n            @let headerContext = headerContexts.get(column.id);\n            @if (!hasStaticLabel(column) && headerDef && headerContext) {\n              <ng-container *flexRender=\"headerDef; props: headerContext; let renderedLabel\">\n                {{ renderedLabel }}\n              </ng-container>\n            } @else {\n              {{ resolveColumnLabel(column) }}\n            }\n          </span>\n          <span [class.list-field-value--fill]=\"isSrOnlyLabel(column)\" class=\"list-field-value\">\n            <ng-container *flexRender=\"cell.column.columnDef.cell; props: cell.getContext(); let rendered\">\n              {{ rendered }}\n            </ng-container>\n          </span>\n        </div>\n      }\n    }\n  </ng-template>\n\n  <!-- One group's sub-header content (sr-only announcement + template or value),\n       shared by both branches. -->\n  <ng-template #subHeaderContent let-subHeader=\"subHeader\">\n    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n      <span class=\"sr-only\">{{ ariaText }}</span>\n    }\n    @if (subHeaderTemplateRef(); as templateRef) {\n      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-sub-header-value\">{{ subHeader.value }}</span>\n    }\n  </ng-template>\n\n  <!-- Loading/empty/error item content, shared by both branches. -->\n  <ng-template #stateItemContent let-state=\"state\">\n    @if (stateTemplateView(); as stateTemplate) {\n      <ng-container [ngTemplateOutlet]=\"stateTemplate.templateRef\" [ngTemplateOutletContext]=\"stateTemplate.context\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-state-indicator\"></span>\n      <span class=\"list-state-message\">{{ state.message }}</span>\n    }\n  </ng-template>\n\n  @if (enableItemNavigation()) {\n    <!-- Composite item navigation: the APG layout-grid pattern shared with\n         NatTable. One tab stop for the whole list, roving focus between items\n         via `@angular/aria`'s grid, one gridcell per item, and the\n         cell-interaction model (Enter/Tab/Escape) for controls inside items.\n         The `<ul>` keeps HTML validity (ul only permits li children), while\n         `role=\"grid\"`/`role=\"row\"`/`role=\"gridcell\"` replace list semantics. -->\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      colWrap=\"nowrap\"\n      data-testid=\"nat-list\"\n      ngGrid\n      rowWrap=\"nowrap\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <!-- Sub-headers join the grid as rows with one gridcell, exactly\n                   like the table's sub-header rows, so arrow navigation passes\n                   through them instead of skipping the group boundary. -->\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\" ngGridRow>\n                <div class=\"list-sub-header-content\" natTableCell ngGridCell>\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <!-- Activation handlers sit on the row, not the gridcell: the\n                 cell-interaction model on the cell handles Enter/Tab/Escape\n                 first and stops propagation when it does, so only unhandled\n                 events reach the row \u2014 same layering as the table. -->\n            <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- focus lives on the roving gridcell child; the row only receives bubbled events, mirroring the table's tr handlers. -->\n            <li\n              [attr.aria-selected]=\"rowAriaSelected(row)\"\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"list-row\"\n              data-testid=\"nat-list-item\"\n              ngGridRow\n              (click)=\"onItemClick($event, row)\"\n              (keydown)=\"onItemKeydown($event, row)\">\n              <div class=\"list-item\" data-testid=\"nat-list-item-cell\" natTableCell ngGridCell>\n                <ng-container\n                  [ngTemplateOutlet]=\"itemFields\"\n                  [ngTemplateOutletContext]=\"{ row, itemIndex: $index, listColumns, headerContexts, withActivator: false }\" />\n              </div>\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li class=\"list-row\" ngGridRow>\n              <div [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\" ngGridCell>\n                <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n              </div>\n            </li>\n          }\n        }\n      }\n    </ul>\n  } @else {\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      data-testid=\"nat-list\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          <!-- Iterate the reactive visibleColumns() signal (not row.getVisibleCells())\n               so column order and visibility changes re-render the fields. -->\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\">\n                <div class=\"list-sub-header-content\">\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <li\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              [class.is-activatable]=\"enableRowActivation()\"\n              class=\"list-item\"\n              data-testid=\"nat-list-item\">\n              @if (enableRowActivation()) {\n                <!-- A real button, so the activation affordance has an interactive\n                     role (WCAG 4.1.2) \u2014 a focusable listitem announces as plain\n                     text. A stretched sibling rather than a wrapper: nesting the\n                     fields (and e.g. a selection checkbox) inside a button would\n                     be invalid HTML and can hide the nested controls from\n                     assistive technology. Interactive descendants stack above it\n                     in CSS, which replaces the old event-origin guard. Named by\n                     the item's FIRST visible field (label + value), so screen\n                     readers get a concise name instead of re-hearing the whole\n                     item; the id is index-keyed because row ids are consumer\n                     input and may contain characters invalid in an id list.\n                     Trade-off, documented in the docs topic: the stretched\n                     overlay owns mousedown, so field text cannot be mouse-\n                     selected while activation is enabled. -->\n                <!-- eslint-disable-next-line @angular-eslint/template/elements-content -- named via aria-labelledby from the item's first field; visible content would duplicate it. -->\n                <button\n                  [attr.aria-labelledby]=\"activatorLabelId($index)\"\n                  class=\"list-item-activator\"\n                  data-testid=\"nat-list-item-activator\"\n                  type=\"button\"\n                  (click)=\"onActivatorClick($event, row)\"\n                  (keydown)=\"onActivatorKeydown($event, row)\"></button>\n              }\n              <ng-container\n                [ngTemplateOutlet]=\"itemFields\"\n                [ngTemplateOutletContext]=\"{\n                  row,\n                  itemIndex: $index,\n                  listColumns,\n                  headerContexts,\n                  withActivator: enableRowActivation()\n                }\" />\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\">\n              <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n            </li>\n          }\n        }\n      }\n    </ul>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-list-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [".list-region{position:relative}.nat-list{display:flex;flex-direction:column;gap:var(--nat-list-gap, var(--sys-nat-table-list-gap, .5rem));padding:0;margin:0;list-style:none}.list-sub-header{display:flex;align-items:center;font-weight:var(--nat-list-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-list-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));background:var(--nat-list-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-list-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-list-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.list-sub-header-content{position:relative;padding:var(--nat-list-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 0))}.list-item{position:relative;display:grid;grid-template-areas:var(--nat-list-item-areas, var(--sys-nat-table-list-item-areas, none));grid-template-columns:var(--nat-list-item-columns, var(--sys-nat-table-list-item-columns, 1fr));gap:var(--nat-list-item-gap, var(--sys-nat-table-list-item-gap, .25rem));padding:var(--nat-list-item-padding, var(--sys-nat-table-list-item-padding, .75rem 1rem));background:var(--nat-list-item-background, var(--sys-nat-table-list-item-background, transparent));border-color:var( --nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent)) );border-style:solid;border-width:var(--nat-list-item-border-width, var(--sys-nat-table-list-item-border-width, 1px));border-radius:var(--nat-list-item-radius, var(--sys-nat-table-list-item-radius, 8px))}.list-item-activator{position:absolute;inset:0;padding:0;appearance:none;cursor:pointer;background:none;border:0;border-radius:inherit}.list-item-activator:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentcolor));outline-offset:-2px}.list-item.is-activatable .list-field :is(a[href],button,input,select,textarea,summary,[contenteditable=true],[role=button],[role=link],[role=checkbox],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=tab],[role=switch],[role=combobox],[role=textbox],[role=searchbox],label,[tabindex]){position:relative;z-index:1}.list-item[data-selected=true],.list-row[data-selected=true]>.list-item{background:var(--nat-list-item-background-selected, var(--sys-nat-table-list-item-background-selected, transparent))}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.list-field{display:flex;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));min-width:0}.list-field-value{min-width:0;overflow-wrap:anywhere}.list-field-value--fill{display:flex;flex:1;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));width:100%;height:100%}.list-field-label{font-size:var(--nat-list-label-font-size, var(--sys-nat-table-list-label-font-size, 14px));font-weight:var(--nat-list-label-font-weight, var(--sys-nat-table-list-label-font-weight, 400));color:var(--nat-list-label-color, var(--sys-nat-table-list-label-color, currentColor))}.list-state{display:flex;gap:var(--nat-list-state-gap, var(--sys-nat-table-list-state-gap, .625rem));align-items:center;justify-content:var(--nat-list-state-justify, var(--sys-nat-table-list-state-justify, flex-start));min-height:var(--nat-list-state-min-height, var(--sys-nat-table-list-state-min-height, auto));padding:var(--nat-list-state-padding, var(--sys-nat-table-list-state-padding, 1.25rem 1rem));color:var(--nat-list-state-color, var(--sys-nat-table-list-state-color, inherit));background:var(--nat-list-state-background, var(--sys-nat-table-list-state-background, transparent));border:1px var(--nat-list-state-border-style, var(--sys-nat-table-list-state-border-style, dashed)) var(--nat-list-state-border-color, var(--sys-nat-table-list-state-border-color, color-mix(in srgb, currentcolor 20%, transparent)));border-radius:var(--nat-list-state-radius, var(--sys-nat-table-list-state-radius, 8px))}.list-state-indicator{flex:none;width:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));height:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));border-radius:999px}.list-state-message{min-width:0;overflow-wrap:anywhere}.list-state-loading .list-state-indicator{background:var(--nat-list-loading-accent, var(--sys-nat-table-list-loading-accent, var(--nat-table-color-accent, currentcolor)));animation:nat-list-state-pulse 1.2s ease-in-out infinite}.list-state-empty .list-state-indicator{border:1px solid var(--nat-list-empty-accent, var(--sys-nat-table-list-empty-accent, var(--nat-table-color-text-muted, currentcolor)))}.list-state-error{color:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, inherit)))}.list-state-error .list-state-indicator{background:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, currentcolor)))}@keyframes nat-list-state-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}@media(prefers-reduced-motion:reduce){.list-state-loading .list-state-indicator{animation:none}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"], dependencies: [{ kind: "directive", type: FlexRender, selector: "[flexRender]", inputs: ["flexRender", "flexRenderProps", "flexRenderInjector"] }, { kind: "directive", type: Grid, selector: "[ngGrid]", inputs: ["enableSelection", "disabled", "softDisabled", "focusMode", "rowWrap", "colWrap", "multi", "selectionMode", "tabindex"], exportAs: ["ngGrid"] }, { kind: "directive", type: GridCell, selector: "[ngGridCell]", inputs: ["id", "role", "rowSpan", "colSpan", "rowIndex", "colIndex", "disabled", "selected", "selectable", "tabindex"], outputs: ["selectedChange"], exportAs: ["ngGridCell"] }, { kind: "directive", type: GridRow, selector: "[ngGridRow]", inputs: ["rowIndex"], exportAs: ["ngGridRow"] }, { kind: "directive", type: NatListFieldArea, selector: "[natListFieldArea]", inputs: ["natListFieldArea"] }, { kind: "directive", type: NatTableCell, selector: "[natTableCell]" }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatList, decorators: [{
            type: Component,
            args: [{ selector: 'nat-list', exportAs: 'natList', host: {
                        '[style.--sys-nat-table-list-item-areas]': 'defaultItemAreas()'
                    }, imports: [FlexRender, Grid, GridCell, GridRow, NatListFieldArea, NatTableCell, NgTemplateOutlet], providers: [NatTableState, NatTableA11yService, NatTableCellControlManager], template: "<!-- eslint-disable max-lines -- single cohesive list template (shared field/sub-header/state templates + the plain and composite ul branches); splitting into partials would fragment the renderer switch. -->\n<div #listRegion class=\"list-region\" data-testid=\"nat-list-region\">\n  @if (listSummary().trim()) {\n    <p [id]=\"listSummaryId()\" class=\"sr-only\">{{ listSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n  @if (enableItemNavigation() && resolvedListKeyboardInstructions().trim()) {\n    <p [id]=\"tableKeyboardInstructionsId()\" class=\"sr-only\">{{ resolvedListKeyboardInstructions() }}</p>\n  }\n\n  <!-- One item's fields, shared by the plain and composite branches. The\n       activator label id only exists while the plain branch renders the\n       stretched activator button (`withActivator`); the composite branch has\n       no activator to name. -->\n  <ng-template\n    #itemFields\n    let-headerContexts=\"headerContexts\"\n    let-itemIndex=\"itemIndex\"\n    let-listColumns=\"listColumns\"\n    let-row=\"row\"\n    let-withActivator=\"withActivator\">\n    @for (column of listColumns; track column.id) {\n      @let cell = cellForColumn(row, column.id);\n      @if (cell) {\n        <div\n          [attr.data-column-id]=\"column.id\"\n          [attr.id]=\"withActivator && $first ? activatorLabelId(itemIndex) : null\"\n          [natListFieldArea]=\"column.id\"\n          class=\"list-field\">\n          <span [class.sr-only]=\"isSrOnlyLabel(column)\" class=\"list-field-label\">\n            @let headerDef = column.columnDef.header;\n            @let headerContext = headerContexts.get(column.id);\n            @if (!hasStaticLabel(column) && headerDef && headerContext) {\n              <ng-container *flexRender=\"headerDef; props: headerContext; let renderedLabel\">\n                {{ renderedLabel }}\n              </ng-container>\n            } @else {\n              {{ resolveColumnLabel(column) }}\n            }\n          </span>\n          <span [class.list-field-value--fill]=\"isSrOnlyLabel(column)\" class=\"list-field-value\">\n            <ng-container *flexRender=\"cell.column.columnDef.cell; props: cell.getContext(); let rendered\">\n              {{ rendered }}\n            </ng-container>\n          </span>\n        </div>\n      }\n    }\n  </ng-template>\n\n  <!-- One group's sub-header content (sr-only announcement + template or value),\n       shared by both branches. -->\n  <ng-template #subHeaderContent let-subHeader=\"subHeader\">\n    @if (getSubHeaderAriaText(subHeader); as ariaText) {\n      <span class=\"sr-only\">{{ ariaText }}</span>\n    }\n    @if (subHeaderTemplateRef(); as templateRef) {\n      <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-sub-header-value\">{{ subHeader.value }}</span>\n    }\n  </ng-template>\n\n  <!-- Loading/empty/error item content, shared by both branches. -->\n  <ng-template #stateItemContent let-state=\"state\">\n    @if (stateTemplateView(); as stateTemplate) {\n      <ng-container [ngTemplateOutlet]=\"stateTemplate.templateRef\" [ngTemplateOutletContext]=\"stateTemplate.context\" />\n    } @else {\n      <span aria-hidden=\"true\" class=\"list-state-indicator\"></span>\n      <span class=\"list-state-message\">{{ state.message }}</span>\n    }\n  </ng-template>\n\n  @if (enableItemNavigation()) {\n    <!-- Composite item navigation: the APG layout-grid pattern shared with\n         NatTable. One tab stop for the whole list, roving focus between items\n         via `@angular/aria`'s grid, one gridcell per item, and the\n         cell-interaction model (Enter/Tab/Escape) for controls inside items.\n         The `<ul>` keeps HTML validity (ul only permits li children), while\n         `role=\"grid\"`/`role=\"row\"`/`role=\"gridcell\"` replace list semantics. -->\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      colWrap=\"nowrap\"\n      data-testid=\"nat-list\"\n      ngGrid\n      rowWrap=\"nowrap\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <!-- Sub-headers join the grid as rows with one gridcell, exactly\n                   like the table's sub-header rows, so arrow navigation passes\n                   through them instead of skipping the group boundary. -->\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\" ngGridRow>\n                <div class=\"list-sub-header-content\" natTableCell ngGridCell>\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <!-- Activation handlers sit on the row, not the gridcell: the\n                 cell-interaction model on the cell handles Enter/Tab/Escape\n                 first and stops propagation when it does, so only unhandled\n                 events reach the row \u2014 same layering as the table. -->\n            <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -- focus lives on the roving gridcell child; the row only receives bubbled events, mirroring the table's tr handlers. -->\n            <li\n              [attr.aria-selected]=\"rowAriaSelected(row)\"\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"list-row\"\n              data-testid=\"nat-list-item\"\n              ngGridRow\n              (click)=\"onItemClick($event, row)\"\n              (keydown)=\"onItemKeydown($event, row)\">\n              <div class=\"list-item\" data-testid=\"nat-list-item-cell\" natTableCell ngGridCell>\n                <ng-container\n                  [ngTemplateOutlet]=\"itemFields\"\n                  [ngTemplateOutletContext]=\"{ row, itemIndex: $index, listColumns, headerContexts, withActivator: false }\" />\n              </div>\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li class=\"list-row\" ngGridRow>\n              <div [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\" ngGridCell>\n                <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n              </div>\n            </li>\n          }\n        }\n      }\n    </ul>\n  } @else {\n    <ul\n      [attr.aria-busy]=\"tableAriaBusy()\"\n      [attr.aria-describedby]=\"ariaDescribedBy()\"\n      [attr.aria-label]=\"listAriaLabel()\"\n      [attr.dir]=\"resolvedDirection()\"\n      [id]=\"tableElementId()\"\n      class=\"nat-list\"\n      data-testid=\"nat-list\">\n      @switch (bodyState()) {\n        @case ('rows') {\n          <!-- Iterate the reactive visibleColumns() signal (not row.getVisibleCells())\n               so column order and visibility changes re-render the fields. -->\n          @let listColumns = visibleColumns();\n          @let headerContexts = leafHeaderContexts();\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <li class=\"list-sub-header\" data-testid=\"nat-list-sub-header\">\n                <div class=\"list-sub-header-content\">\n                  <ng-container [ngTemplateOutlet]=\"subHeaderContent\" [ngTemplateOutletContext]=\"{ subHeader }\" />\n                </div>\n              </li>\n            }\n            <li\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              [class.is-activatable]=\"enableRowActivation()\"\n              class=\"list-item\"\n              data-testid=\"nat-list-item\">\n              @if (enableRowActivation()) {\n                <!-- A real button, so the activation affordance has an interactive\n                     role (WCAG 4.1.2) \u2014 a focusable listitem announces as plain\n                     text. A stretched sibling rather than a wrapper: nesting the\n                     fields (and e.g. a selection checkbox) inside a button would\n                     be invalid HTML and can hide the nested controls from\n                     assistive technology. Interactive descendants stack above it\n                     in CSS, which replaces the old event-origin guard. Named by\n                     the item's FIRST visible field (label + value), so screen\n                     readers get a concise name instead of re-hearing the whole\n                     item; the id is index-keyed because row ids are consumer\n                     input and may contain characters invalid in an id list.\n                     Trade-off, documented in the docs topic: the stretched\n                     overlay owns mousedown, so field text cannot be mouse-\n                     selected while activation is enabled. -->\n                <!-- eslint-disable-next-line @angular-eslint/template/elements-content -- named via aria-labelledby from the item's first field; visible content would duplicate it. -->\n                <button\n                  [attr.aria-labelledby]=\"activatorLabelId($index)\"\n                  class=\"list-item-activator\"\n                  data-testid=\"nat-list-item-activator\"\n                  type=\"button\"\n                  (click)=\"onActivatorClick($event, row)\"\n                  (keydown)=\"onActivatorKeydown($event, row)\"></button>\n              }\n              <ng-container\n                [ngTemplateOutlet]=\"itemFields\"\n                [ngTemplateOutletContext]=\"{\n                  row,\n                  itemIndex: $index,\n                  listColumns,\n                  headerContexts,\n                  withActivator: enableRowActivation()\n                }\" />\n            </li>\n          }\n        }\n        @default {\n          @if (stateView(); as state) {\n            <li [attr.data-state]=\"state.state\" [attr.data-testid]=\"state.testId\" [class]=\"state.className\">\n              <ng-container [ngTemplateOutlet]=\"stateItemContent\" [ngTemplateOutletContext]=\"{ state }\" />\n            </li>\n          }\n        }\n      }\n    </ul>\n  }\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-list-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [".list-region{position:relative}.nat-list{display:flex;flex-direction:column;gap:var(--nat-list-gap, var(--sys-nat-table-list-gap, .5rem));padding:0;margin:0;list-style:none}.list-sub-header{display:flex;align-items:center;font-weight:var(--nat-list-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-list-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));background:var(--nat-list-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-list-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-list-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.list-sub-header-content{position:relative;padding:var(--nat-list-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 0))}.list-item{position:relative;display:grid;grid-template-areas:var(--nat-list-item-areas, var(--sys-nat-table-list-item-areas, none));grid-template-columns:var(--nat-list-item-columns, var(--sys-nat-table-list-item-columns, 1fr));gap:var(--nat-list-item-gap, var(--sys-nat-table-list-item-gap, .25rem));padding:var(--nat-list-item-padding, var(--sys-nat-table-list-item-padding, .75rem 1rem));background:var(--nat-list-item-background, var(--sys-nat-table-list-item-background, transparent));border-color:var( --nat-list-item-border-color, var(--sys-nat-table-list-item-border-color, color-mix(in srgb, currentcolor 15%, transparent)) );border-style:solid;border-width:var(--nat-list-item-border-width, var(--sys-nat-table-list-item-border-width, 1px));border-radius:var(--nat-list-item-radius, var(--sys-nat-table-list-item-radius, 8px))}.list-item-activator{position:absolute;inset:0;padding:0;appearance:none;cursor:pointer;background:none;border:0;border-radius:inherit}.list-item-activator:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentcolor));outline-offset:-2px}.list-item.is-activatable .list-field :is(a[href],button,input,select,textarea,summary,[contenteditable=true],[role=button],[role=link],[role=checkbox],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=tab],[role=switch],[role=combobox],[role=textbox],[role=searchbox],label,[tabindex]){position:relative;z-index:1}.list-item[data-selected=true],.list-row[data-selected=true]>.list-item{background:var(--nat-list-item-background-selected, var(--sys-nat-table-list-item-background-selected, transparent))}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.list-field{display:flex;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));min-width:0}.list-field-value{min-width:0;overflow-wrap:anywhere}.list-field-value--fill{display:flex;flex:1;flex-direction:var(--nat-list-field-flex-direction, var(--sys-nat-table-list-field-flex-direction, row));gap:var(--nat-list-field-gap, var(--sys-nat-table-list-field-gap, .5rem));align-items:var(--nat-list-field-align, var(--sys-nat-table-list-field-align, baseline));justify-content:var(--nat-list-field-justify, var(--sys-nat-table-list-field-justify, flex-start));width:100%;height:100%}.list-field-label{font-size:var(--nat-list-label-font-size, var(--sys-nat-table-list-label-font-size, 14px));font-weight:var(--nat-list-label-font-weight, var(--sys-nat-table-list-label-font-weight, 400));color:var(--nat-list-label-color, var(--sys-nat-table-list-label-color, currentColor))}.list-state{display:flex;gap:var(--nat-list-state-gap, var(--sys-nat-table-list-state-gap, .625rem));align-items:center;justify-content:var(--nat-list-state-justify, var(--sys-nat-table-list-state-justify, flex-start));min-height:var(--nat-list-state-min-height, var(--sys-nat-table-list-state-min-height, auto));padding:var(--nat-list-state-padding, var(--sys-nat-table-list-state-padding, 1.25rem 1rem));color:var(--nat-list-state-color, var(--sys-nat-table-list-state-color, inherit));background:var(--nat-list-state-background, var(--sys-nat-table-list-state-background, transparent));border:1px var(--nat-list-state-border-style, var(--sys-nat-table-list-state-border-style, dashed)) var(--nat-list-state-border-color, var(--sys-nat-table-list-state-border-color, color-mix(in srgb, currentcolor 20%, transparent)));border-radius:var(--nat-list-state-radius, var(--sys-nat-table-list-state-radius, 8px))}.list-state-indicator{flex:none;width:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));height:var(--nat-list-state-indicator-size, var(--sys-nat-table-list-state-indicator-size, .5rem));border-radius:999px}.list-state-message{min-width:0;overflow-wrap:anywhere}.list-state-loading .list-state-indicator{background:var(--nat-list-loading-accent, var(--sys-nat-table-list-loading-accent, var(--nat-table-color-accent, currentcolor)));animation:nat-list-state-pulse 1.2s ease-in-out infinite}.list-state-empty .list-state-indicator{border:1px solid var(--nat-list-empty-accent, var(--sys-nat-table-list-empty-accent, var(--nat-table-color-text-muted, currentcolor)))}.list-state-error{color:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, inherit)))}.list-state-error .list-state-indicator{background:var(--nat-list-error-accent, var(--sys-nat-table-list-error-accent, var(--nat-table-color-danger, currentcolor)))}@keyframes nat-list-state-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}@media(prefers-reduced-motion:reduce){.list-state-loading .list-state-indicator{animation:none}}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: true }] }], columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], accessibleName: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibleName", required: false }] }], dataStatus: [{ type: i0.Input, args: [{ isSignal: true, alias: "dataStatus", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], globalFilterFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "globalFilterFn", required: false }] }], getRowId: [{ type: i0.Input, args: [{ isSignal: true, alias: "getRowId", required: false }] }], enableRowSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableRowSelection", required: false }] }], selectionMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectionMode", required: false }] }], enableRowActivation: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableRowActivation", required: false }] }], subHeaderColumn: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderColumn", required: false }] }], subHeaderOrder: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderOrder", required: false }] }], enableSubHeaders: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableSubHeaders", required: false }] }], enableItemNavigation: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableItemNavigation", required: false }] }], rowActivate: [{ type: i0.Output, args: ["rowActivate"] }], loadingTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }] }], emptyTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }] }], errorTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }] }], subHeaderTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }] }], listRegionRef: [{ type: i0.ViewChild, args: ['listRegion', { isSignal: true }] }] } });

/* eslint-disable max-lines -- static renderer component shell, mirroring table.ts: inputs/outputs, the NatTableUiController surface, state-signal aliases, and input bridging. Pure logic lives in the shared engine and utils. */
/**
 * Static table renderer sharing the table engine (`NatTableState`).
 *
 * Renders the same surface-driven state as `NatTable` — sorting, filtering,
 * pinning, column order/visibility/sizing, sub-headers, and data states — as a
 * plain semantic `<table>` with no ARIA grid: no grid roles, no roving cell
 * keyboard model, no cell tab stops, and no managed in-cell controls. Controls
 * rendered inside cells stay in the natural tab order. Implements
 * `NatTableUiController`, so surface-bound companion controls resolve it.
 *
 * Deliberately omitted: the grid keyboard model, drag/keyboard column
 * reordering, column resize affordances, cell-interaction management, and
 * virtualization — none of `@angular/aria` or the CDK drag machinery is
 * imported, so consumers using only the static renderer tree-shake them away.
 * Cells built on `ngGridCellWidget` require the grid context and cannot render
 * here; exclude those columns, as with `NatList`.
 */
class NatTableStatic {
    // ─── Inputs ───
    /** Row data rendered by the table. */
    data = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    /** TanStack column definitions for the current row type. */
    columns = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columns" }] : /* istanbul ignore next */ []));
    /** Accessible name announced for the table when no visible caption is rendered. */
    accessibleName = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    /** Visible table caption. When present, it provides the table's accessible name. */
    caption = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []));
    /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
    dataStatus = input(NAT_TABLE_DATA_STATUS.success, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dataStatus" }] : /* istanbul ignore next */ []));
    /** Optional error payload passed through to `natTableError` templates. */
    error = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** Enables row selection state. Selected rows carry `data-selected` for styling. */
    enableRowSelection = input(false, { ...(ngDevMode ? { debugName: "enableRowSelection" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    selectionMode = input('multiple', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    /** Optional override for the global filter implementation. */
    globalFilterFn = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "globalFilterFn" }] : /* istanbul ignore next */ []));
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    getRowId = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "getRowId" }] : /* istanbul ignore next */ []));
    /**
     * Leaf column id whose value groups rows under rendered sub-header rows.
     * The table always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    subHeaderColumn = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderColumn" }] : /* istanbul ignore next */ []));
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    subHeaderOrder = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderOrder" }] : /* istanbul ignore next */ []));
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this table only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    enableSubHeaders = input(true, { ...(ngDevMode ? { debugName: "enableSubHeaders" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /**
     * Layout mode for the sub-header row.
     * - `'colspan'` (default): Renders a single cell spanning the entire row.
     * - `'cells'`: Renders individual cells matching the column structure, preserving pinned column boundaries.
     */
    subHeaderLayout = input('colspan', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderLayout" }] : /* istanbul ignore next */ []));
    // ─── Outputs ───
    /** Emits on row click unless the event started on an interactive descendant. */
    rowActivate = output();
    // ─── Injected services ───
    natTableService = inject(NatTableService);
    state = inject(NatTableState);
    a11yService = inject(NatTableA11yService);
    destroyRef = inject(DestroyRef);
    // ─── NatTableUiController contract ───
    enablePagination = this.state.enablePagination;
    enableGlobalFilter = this.state.enableGlobalFilter;
    table = this.state.table;
    /** Stable DOM id for the rendered `<table>` element. */
    tableElementId = this.state.tableElementId;
    /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
    tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableScrollContainer" }] : /* istanbul ignore next */ []));
    /** Resolved locale id (from the surface or the built-in English default). */
    localeId = this.state.localeId;
    // ─── State-derived template aliases ───
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
    /**
     * No keyboard-instructions id here: a static table has no grid keyboard
     * model to describe, so `aria-describedby` carries summary + description only.
     */
    ariaDescribedBy = computed(() => {
        const ids = [];
        if (this.tableSummary().trim()) {
            ids.push(this.tableSummaryId());
        }
        if (this.resolvedDescription().trim()) {
            ids.push(this.tableDescriptionId());
        }
        return ids.length ? ids.join(' ') : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaDescribedBy" }] : /* istanbul ignore next */ []));
    // ─── Consumer state templates (same directives the table accepts) ───
    loadingTemplate = contentChild(NatTableLoadingTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplate" }] : /* istanbul ignore next */ []));
    emptyTemplate = contentChild(NatTableEmptyTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []));
    errorTemplate = contentChild(NatTableErrorTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplate" }] : /* istanbul ignore next */ []));
    subHeaderTemplate = contentChild(NatTableSubHeaderTemplate, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplate" }] : /* istanbul ignore next */ []));
    loadingTemplateRef = computed(() => {
        const templateRef = this.loadingTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplateRef" }] : /* istanbul ignore next */ []));
    emptyTemplateRef = computed(() => {
        const templateRef = this.emptyTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplateRef" }] : /* istanbul ignore next */ []));
    errorTemplateRef = computed(() => {
        const templateRef = this.errorTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplateRef" }] : /* istanbul ignore next */ []));
    subHeaderTemplateRef = computed(() => {
        const templateRef = this.subHeaderTemplate()?.templateRef;
        return templateRef ? templateRef : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subHeaderTemplateRef" }] : /* istanbul ignore next */ []));
    loadingTemplateContext = computed(() => ({
        ...this.state.getStateTemplateBaseContext(),
        $implicit: NAT_TABLE_BODY_STATE.loading,
        status: NAT_TABLE_BODY_STATE.loading
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loadingTemplateContext" }] : /* istanbul ignore next */ []));
    emptyTemplateContext = computed(() => ({
        ...this.state.getStateTemplateBaseContext(),
        $implicit: NAT_TABLE_BODY_STATE.empty,
        status: NAT_TABLE_BODY_STATE.empty
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplateContext" }] : /* istanbul ignore next */ []));
    errorTemplateContext = computed(() => {
        const error = this.error();
        return {
            ...this.state.getStateTemplateBaseContext(),
            $implicit: error,
            status: NAT_TABLE_BODY_STATE.error,
            error
        };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorTemplateContext" }] : /* istanbul ignore next */ []));
    // ─── Sub-header groups (delegated to state) ───
    subHeaderGroups = this.state.subHeaderGroups;
    getSubHeaderContext(group) {
        return this.state.getSubHeaderTemplateContext(group);
    }
    getSubHeaderAriaText(group) {
        return this.state.getSubHeaderAnnouncement(group, 'table');
    }
    // ─── A11y (delegated to service) ───
    tableSummary = this.a11yService.tableSummary;
    liveMessage = this.a11yService.liveMessage;
    // ─── DOM-coupled state ───
    tableRegionRef = viewChild('tableRegion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableRegionRef" }] : /* istanbul ignore next */ []));
    // ─── Template-bound util aliases ───
    shouldHidePrimitiveHeaderLabel = (shouldHidePrimitiveHeaderLabel);
    getCellTone = (getCellTone);
    /** `data-selected` for styling; `aria-selected` is invalid on a plain table row. */
    rowSelectedAttribute(row) {
        return this.enableRowSelection() ? String(row.getIsSelected()) : null;
    }
    // ─── Constructor ───
    constructor() {
        this.natTableService.setController(this);
        // The shared a11y effects (state-change announcements, summaries)
        // self-register in the service constructor; the grid-only and list-only
        // effect sets are deliberately not registered — a static table has no
        // roving keyboard model, resize announcements, or managed widgets.
        // ── Signal-based input bridging (same pattern as NatTable) ──
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
        this.destroyRef.onDestroy(() => {
            this.natTableService.clearController(this);
        });
    }
    // ─── NatTableUiController implementation (public API, delegates to state) ───
    patchState(updaters) {
        this.state.patchState(updaters);
    }
    // ─── Template event handlers ───
    onRowClick(event, row) {
        if (event.button !== 0 || event.defaultPrevented) {
            return;
        }
        if (originatesFromInteractiveDescendant(event)) {
            return;
        }
        this.rowActivate.emit({
            rowData: row.original,
            row,
            originalEvent: event
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableStatic, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatTableStatic, isStandalone: true, selector: "nat-table-static", inputs: { data: { classPropertyName: "data", publicName: "data", isSignal: true, isRequired: true, transformFunction: null }, columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: true, transformFunction: null }, accessibleName: { classPropertyName: "accessibleName", publicName: "accessibleName", isSignal: true, isRequired: false, transformFunction: null }, caption: { classPropertyName: "caption", publicName: "caption", isSignal: true, isRequired: false, transformFunction: null }, dataStatus: { classPropertyName: "dataStatus", publicName: "dataStatus", isSignal: true, isRequired: false, transformFunction: null }, error: { classPropertyName: "error", publicName: "error", isSignal: true, isRequired: false, transformFunction: null }, enableRowSelection: { classPropertyName: "enableRowSelection", publicName: "enableRowSelection", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, globalFilterFn: { classPropertyName: "globalFilterFn", publicName: "globalFilterFn", isSignal: true, isRequired: false, transformFunction: null }, getRowId: { classPropertyName: "getRowId", publicName: "getRowId", isSignal: true, isRequired: false, transformFunction: null }, subHeaderColumn: { classPropertyName: "subHeaderColumn", publicName: "subHeaderColumn", isSignal: true, isRequired: false, transformFunction: null }, subHeaderOrder: { classPropertyName: "subHeaderOrder", publicName: "subHeaderOrder", isSignal: true, isRequired: false, transformFunction: null }, enableSubHeaders: { classPropertyName: "enableSubHeaders", publicName: "enableSubHeaders", isSignal: true, isRequired: false, transformFunction: null }, subHeaderLayout: { classPropertyName: "subHeaderLayout", publicName: "subHeaderLayout", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { rowActivate: "rowActivate" }, providers: [NatTableState, NatTableA11yService], queries: [{ propertyName: "loadingTemplate", first: true, predicate: NatTableLoadingTemplate, descendants: true, isSignal: true }, { propertyName: "emptyTemplate", first: true, predicate: NatTableEmptyTemplate, descendants: true, isSignal: true }, { propertyName: "errorTemplate", first: true, predicate: NatTableErrorTemplate, descendants: true, isSignal: true }, { propertyName: "subHeaderTemplate", first: true, predicate: NatTableSubHeaderTemplate, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "tableRegionRef", first: true, predicate: ["tableRegion"], descendants: true, isSignal: true }], exportAs: ["natTableStatic"], ngImport: i0, template: "<!-- eslint-disable max-lines -- single cohesive static-table template (header/body/state rows); splitting into partials would fragment the table structure. -->\n<div #tableRegion class=\"table-region\" data-testid=\"nat-table-static-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      @for (headerGroup of headerGroups(); track headerGroup.id) {\n        <tr>\n          @for (header of headerGroup.headers; track header.id) {\n            @let columnState = columnStates[header.column.id];\n            <th\n              [attr.aria-sort]=\"columnState?.ariaSort\"\n              [attr.colspan]=\"header.colSpan > 1 ? header.colSpan : null\"\n              [attr.data-column-id]=\"header.column.id\"\n              [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n              [attr.scope]=\"header.colSpan > 1 ? 'colgroup' : 'col'\"\n              [class]=\"columnState?.headerClassMap\"\n              [natTableHeaderCellLayout]=\"columnState\">\n              @if (!header.isPlaceholder) {\n                @let headerContext = header.getContext();\n                @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n                @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n                <div class=\"header-cell-content\">\n                  <span class=\"header-cell-primary\">\n                    @if (hiddenHeaderLabel) {\n                      <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n                    }\n\n                    @if (!hidePrimitiveHeaderLabel) {\n                      <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    }\n                  </span>\n                </div>\n              }\n            </th>\n          }\n        </tr>\n      }\n    </thead>\n    <tbody>\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let visibleCells = row.getVisibleCells();\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <ng-template #subHeaderInnerContent>\n                <div class=\"sub-header-content\">\n                  @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                    <span class=\"sr-only\">{{ ariaText }}</span>\n                  }\n                  @if (subHeaderTemplateRef(); as templateRef) {\n                    <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                  } @else {\n                    <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                  }\n                </div>\n              </ng-template>\n              <tr class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\">\n                @if (subHeaderLayout() === 'colspan') {\n                  <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\">\n                    <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                  </td>\n                } @else {\n                  <!-- `cells` layout mirrors NatTable: one td per visible column so\n                       pinned zones run unbroken through the sub-header row. -->\n                  @for (cell of visibleCells; track cell.id; let first = $first) {\n                    @let columnState = columnStates[cell.column.id];\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [class.sub-header-cell]=\"true\"\n                      [natTableBodyCellLayout]=\"columnState\">\n                      @if (first) {\n                        <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                      }\n                    </td>\n                  }\n                }\n              </tr>\n            }\n            <tr\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"data-row\"\n              data-testid=\"nat-table-row\"\n              (click)=\"onRowClick($event, row)\">\n              @for (cell of visibleCells; track cell.id) {\n                @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                @let cellTone = getCellTone(cell.column, cellContext);\n                @if (columnState?.rowHeader) {\n                  <th\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    scope=\"row\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </th>\n                } @else {\n                  <td\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </td>\n                }\n              }\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\">\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\">\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\">\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom:0}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:right}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;left:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"], dependencies: [{ kind: "directive", type: FlexRender, selector: "[flexRender]", inputs: ["flexRender", "flexRenderProps", "flexRenderInjector"] }, { kind: "directive", type: NatTableBodyCellLayout, selector: "[natTableBodyCellLayout]", inputs: ["natTableBodyCellLayout"] }, { kind: "directive", type: NatTableHeaderCellLayout, selector: "th[natTableHeaderCellLayout]", inputs: ["natTableHeaderCellLayout"] }, { kind: "directive", type: NatTablePxWidth, selector: "[natTablePxWidth]", inputs: ["natTablePxWidth"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableStatic, decorators: [{
            type: Component,
            args: [{ selector: 'nat-table-static', exportAs: 'natTableStatic', imports: [FlexRender, NatTableBodyCellLayout, NatTableHeaderCellLayout, NatTablePxWidth, NgTemplateOutlet], providers: [NatTableState, NatTableA11yService], template: "<!-- eslint-disable max-lines -- single cohesive static-table template (header/body/state rows); splitting into partials would fragment the table structure. -->\n<div #tableRegion class=\"table-region\" data-testid=\"nat-table-static-region\">\n  @if (tableSummary().trim()) {\n    <p [id]=\"tableSummaryId()\" class=\"sr-only\">{{ tableSummary() }}</p>\n  }\n  @if (resolvedDescription().trim()) {\n    <p [id]=\"tableDescriptionId()\" class=\"sr-only\">{{ resolvedDescription() }}</p>\n  }\n\n  <table\n    [attr.aria-busy]=\"tableAriaBusy()\"\n    [attr.aria-describedby]=\"ariaDescribedBy()\"\n    [attr.aria-label]=\"tableAriaLabel()\"\n    [attr.aria-labelledby]=\"tableAriaLabelledBy()\"\n    [attr.dir]=\"resolvedDirection()\"\n    [class]=\"tableClassMap()\"\n    [id]=\"tableElementId()\"\n    [natTablePxWidth]=\"usesAuthoritativeLayout() ? fixedLayoutTableWidth() : null\">\n    @if (resolvedCaption(); as caption) {\n      <caption [id]=\"tableCaptionId()\">\n        {{\n          caption\n        }}\n      </caption>\n    }\n    @let columnStates = columnRenderStates();\n    @if (usesAuthoritativeLayout()) {\n      @let layoutWidths = resolvedColumnWidths();\n      <colgroup>\n        @for (column of visibleColumns(); track column.id) {\n          <col [natTablePxWidth]=\"layoutWidths[column.id]\" />\n        }\n      </colgroup>\n    }\n    <thead>\n      @for (headerGroup of headerGroups(); track headerGroup.id) {\n        <tr>\n          @for (header of headerGroup.headers; track header.id) {\n            @let columnState = columnStates[header.column.id];\n            <th\n              [attr.aria-sort]=\"columnState?.ariaSort\"\n              [attr.colspan]=\"header.colSpan > 1 ? header.colSpan : null\"\n              [attr.data-column-id]=\"header.column.id\"\n              [attr.data-testid]=\"`nat-table-header-${header.column.id}`\"\n              [attr.scope]=\"header.colSpan > 1 ? 'colgroup' : 'col'\"\n              [class]=\"columnState?.headerClassMap\"\n              [natTableHeaderCellLayout]=\"columnState\">\n              @if (!header.isPlaceholder) {\n                @let headerContext = header.getContext();\n                @let hidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel(header, columnState);\n                @let hiddenHeaderLabel = columnState?.hiddenHeaderLabel;\n\n                <div class=\"header-cell-content\">\n                  <span class=\"header-cell-primary\">\n                    @if (hiddenHeaderLabel) {\n                      <span class=\"sr-only\">{{ hiddenHeaderLabel }}</span>\n                    }\n\n                    @if (!hidePrimitiveHeaderLabel) {\n                      <ng-container *flexRender=\"header.column.columnDef.header; props: headerContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    }\n                  </span>\n                </div>\n              }\n            </th>\n          }\n        </tr>\n      }\n    </thead>\n    <tbody>\n      @switch (bodyState()) {\n        @case ('rows') {\n          @let groups = subHeaderGroups();\n          @for (row of bodyRows(); track row.id) {\n            @let visibleCells = row.getVisibleCells();\n            @let subHeader = groups.get(row.id);\n            @if (subHeader) {\n              <ng-template #subHeaderInnerContent>\n                <div class=\"sub-header-content\">\n                  @if (getSubHeaderAriaText(subHeader); as ariaText) {\n                    <span class=\"sr-only\">{{ ariaText }}</span>\n                  }\n                  @if (subHeaderTemplateRef(); as templateRef) {\n                    <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"getSubHeaderContext(subHeader)\" />\n                  } @else {\n                    <span aria-hidden=\"true\">{{ subHeader.value }}</span>\n                  }\n                </div>\n              </ng-template>\n              <tr class=\"sub-header-row\" data-testid=\"nat-table-sub-header-row\">\n                @if (subHeaderLayout() === 'colspan') {\n                  <td [colSpan]=\"emptyStateColSpan()\" class=\"sub-header-cell\">\n                    <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                  </td>\n                } @else {\n                  <!-- `cells` layout mirrors NatTable: one td per visible column so\n                       pinned zones run unbroken through the sub-header row. -->\n                  @for (cell of visibleCells; track cell.id; let first = $first) {\n                    @let columnState = columnStates[cell.column.id];\n                    <td\n                      [attr.data-column-id]=\"cell.column.id\"\n                      [class]=\"columnState?.cellClassMap\"\n                      [class.sub-header-cell]=\"true\"\n                      [natTableBodyCellLayout]=\"columnState\">\n                      @if (first) {\n                        <ng-container [ngTemplateOutlet]=\"subHeaderInnerContent\" />\n                      }\n                    </td>\n                  }\n                }\n              </tr>\n            }\n            <tr\n              [attr.data-row-id]=\"row.id\"\n              [attr.data-selected]=\"rowSelectedAttribute(row)\"\n              class=\"data-row\"\n              data-testid=\"nat-table-row\"\n              (click)=\"onRowClick($event, row)\">\n              @for (cell of visibleCells; track cell.id) {\n                @let columnState = columnStates[cell.column.id]; @let cellContext = cell.getContext();\n                @let cellTone = getCellTone(cell.column, cellContext);\n                @if (columnState?.rowHeader) {\n                  <th\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\"\n                    scope=\"row\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </th>\n                } @else {\n                  <td\n                    [attr.data-column-id]=\"cell.column.id\"\n                    [attr.data-tone]=\"cellTone\"\n                    [class]=\"columnState?.cellClassMap\"\n                    [natTableBodyCellLayout]=\"columnState\">\n                    <span class=\"data-cell-content\">\n                      <ng-container *flexRender=\"cell.column.columnDef.cell; props: cellContext; let rendered\">\n                        {{ rendered }}\n                      </ng-container>\n                    </span>\n                  </td>\n                }\n              }\n            </tr>\n          }\n        }\n        @case ('loading') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state loading-state\">\n              <div class=\"table-state-content\">\n                @if (loadingTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"loadingTemplateContext()\" />\n                } @else {\n                  {{ resolvedLoadingState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('error') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state error-state\">\n              <div class=\"table-state-content\">\n                @if (errorTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"errorTemplateContext()\" />\n                } @else {\n                  {{ resolvedErrorState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n        @case ('empty') {\n          <tr>\n            <td [colSpan]=\"emptyStateColSpan()\" class=\"table-state empty-state\">\n              <div class=\"table-state-content\">\n                @if (emptyTemplateRef(); as templateRef) {\n                  <ng-container [ngTemplateOutlet]=\"templateRef\" [ngTemplateOutletContext]=\"emptyTemplateContext()\" />\n                } @else {\n                  {{ resolvedEmptyState() }}\n                }\n              </div>\n            </td>\n          </tr>\n        }\n      }\n    </tbody>\n  </table>\n\n  <p aria-atomic=\"true\" aria-live=\"polite\" class=\"sr-only\" data-testid=\"nat-table-live-region\">{{ liveMessage() }}</p>\n</div>\n", styles: [":host{display:block;font-family:var(--nat-table-font-family, var(--sys-nat-table-font-family, inherit));color:var(--nat-table-color-text, var(--sys-nat-table-color-text, inherit))}.table-region{position:relative;display:flex;flex-direction:column;height:var(--nat-table-height, var(--sys-nat-table-height, inherit));min-height:var(--nat-table-min-height, var(--sys-nat-table-min-height, auto));max-height:var(--nat-table-max-height, var(--sys-nat-table-max-height, inherit));container-type:inline-size;overflow:var( --nat-table-region-overflow-x, var(--sys-nat-table-region-overflow-x, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) ) var( --nat-table-region-overflow-y, var(--sys-nat-table-region-overflow-y, var(--nat-table-region-overflow, var(--sys-nat-table-region-overflow, auto))) );overscroll-behavior:var( --nat-table-region-overscroll-behavior-x, var( --sys-nat-table-region-overscroll-behavior-x, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, none)) ) ) var( --nat-table-region-overscroll-behavior-y, var( --sys-nat-table-region-overscroll-behavior-y, var(--nat-table-region-overscroll-behavior, var(--sys-nat-table-region-overscroll-behavior, auto)) ) );background:var(--nat-table-region-background, var(--sys-nat-table-region-background, transparent));border:var(--nat-table-region-border-width, var(--sys-nat-table-region-border-width, 1px)) solid var(--nat-table-region-border-color, var(--sys-nat-table-region-border-color, rgb(128 128 128 / 24%)));border-radius:var(--nat-table-radius-region, var(--sys-nat-table-radius-region, 0))}.table-region:has(:focus-visible){border-color:var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}.data-table{min-width:100%;table-layout:auto;border-spacing:0;border-collapse:separate}.data-table:has(.table-state){flex:1 1 auto}.data-table.is-fixed-layout{min-width:0;table-layout:fixed}.header-cell,.data-cell{box-sizing:border-box;padding-block:var(--nat-table-space-cell-y, var(--sys-nat-table-space-cell-y, 0));text-align:start;border-bottom:var(--nat-table-cell-border-width, var(--sys-nat-table-cell-border-width, 1px)) solid var(--nat-table-cell-border-color, var(--sys-nat-table-cell-border-color, rgb(128 128 128 / 24%)))}.header-cell.is-width-constrained,.data-cell.is-width-constrained{overflow:hidden;text-overflow:ellipsis}.header-cell{position:relative;padding-inline:var( --nat-table-space-header-cell-x, var(--sys-nat-table-space-header-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );font-size:var(--nat-table-font-size-header, var(--sys-nat-table-font-size-header, .84rem));font-weight:var(--nat-table-font-weight-header, var(--sys-nat-table-font-weight-header, 600));color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));text-transform:var(--nat-table-text-transform-header, var(--sys-nat-table-text-transform-header, uppercase));letter-spacing:var(--nat-table-letter-spacing-header, var(--sys-nat-table-letter-spacing-header, .08em));white-space:nowrap;background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom:var(--nat-table-header-border-width, var(--sys-nat-table-header-border-width, 1px)) solid var( --nat-table-header-border-color, var( --sys-nat-table-header-border-color, var(--nat-table-color-border, var(--sys-nat-table-color-border, rgb(128 128 128 / 30%))) ) )}.header-cell-content{display:flex;gap:var(--nat-table-space-header-content-gap, var(--sys-nat-table-space-header-content-gap, 8px));align-items:center;justify-content:space-between;min-width:0;max-width:100%}.header-cell-primary{display:block;flex:1 1 auto;inline-size:100%;min-width:0;max-width:100%}.header-cell.is-width-constrained .header-cell-primary{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.data-cell-content{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;overflow-wrap:break-word;white-space:normal}.header-cell.is-width-constrained:has(:focus-visible),.data-cell.is-width-constrained:has(:focus-visible),.header-cell.is-width-constrained:has(:focus-visible) .header-cell-primary,.data-cell:has(:focus-visible) .data-cell-content{overflow:visible}.data-cell{padding-inline:var( --nat-table-space-data-cell-x, var(--sys-nat-table-space-data-cell-x, var(--nat-table-space-cell-x, var(--sys-nat-table-space-cell-x, 0))) );line-height:var(--nat-table-line-height-cell, var(--sys-nat-table-line-height-cell, 1.4));vertical-align:middle;white-space:normal}tbody .data-row:last-child .data-cell{border-bottom:0}.data-cell.is-cell-clamped .data-cell-content{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2));line-clamp:var(--nat-table-cell-max-lines, var(--sys-nat-table-cell-max-lines, 2))}.column-resize-handle{position:absolute;inset-inline-end:0;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-handle, var(--sys-nat-table-z-index-resize-handle, 8));inline-size:var(--nat-table-resize-handle-hit, var(--sys-nat-table-resize-handle-hit, 24px));touch-action:none;cursor:col-resize;-webkit-user-select:none;user-select:none}.column-resize-handle:after{position:absolute;inset-inline-end:calc(50% - 1px);top:18%;bottom:18%;inline-size:2px;content:\"\";background:var( --nat-table-resize-handle-color, var(--sys-nat-table-resize-handle-color, color-mix(in srgb, currentColor 24%, transparent)) );border-radius:1px;opacity:0;transition:opacity .12s ease}.header-cell:hover .column-resize-handle:not(.is-resizing):after,.column-resize-handle:not(.is-resizing):hover:after,.column-resize-handle:not(.is-resizing):active:after{opacity:1}.column-resize-handle.is-resizing:after{opacity:0}.column-resize-guide{position:absolute;top:0;bottom:0;z-index:var(--nat-table-z-index-resize-guide, var(--sys-nat-table-z-index-resize-guide, 9));inline-size:2px;margin-inline-start:-1px;pointer-events:none;background:var( --nat-table-resize-handle-active-color, var( --sys-nat-table-resize-handle-active-color, var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight)) ) )}.header-cell.is-reorderable{touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}.header-cell.is-reorderable:active{cursor:grabbing}.table-region.is-resizing,.table-region.is-resizing *{cursor:col-resize}.table-region.is-resizing{-webkit-user-select:none;user-select:none}.header-cell.cdk-drag-preview{z-index:var(--nat-table-z-index-drag-preview, var(--sys-nat-table-z-index-drag-preview, 12));display:table-cell;color:var(--nat-table-header-color, var(--sys-nat-table-header-color, inherit));background:var( --nat-table-header-background, var(--sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas))) );border-bottom-color:var(--nat-table-header-border-color, var(--sys-nat-table-header-border-color, rgb(128 128 128 / 30%)));box-shadow:var( --nat-table-drag-preview-shadow, var(--sys-nat-table-drag-preview-shadow, 0 14px 30px rgb(15 23 42 / 16%), 0 0 0 1px rgb(128 128 128 / 30%)) );opacity:.98}.header-cell.is-pinned-left.cdk-drag-preview,.header-cell.is-pinned-right.cdk-drag-preview{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.header-cell.cdk-drag-placeholder{opacity:.4}.cdk-drop-list-dragging .header-cell.is-reorderable:not(.cdk-drag-placeholder){transition:transform .18s ease}.header-cell.cdk-drag-animating{transition:transform .18s ease}.data-row{background:var(--nat-table-row-background, var(--sys-nat-table-row-background, transparent))}.data-table.is-virtualized :is(.data-row,.data-cell,.sub-header-row,.sub-header-cell){height:var(--sys-nat-table-virtual-row-height)}.data-table.is-virtualized :is(.data-cell-content,.sub-header-content){max-height:var(--sys-nat-table-virtual-row-height)}:is(.virtual-spacer-row,.virtual-spacer-cell){padding:0;line-height:0;pointer-events:none;border:0}.data-row:has(:focus-visible){background:var(--nat-table-row-background-focus, var(--sys-nat-table-row-background-focus, rgb(128 128 128 / 12%)))}.data-row:has(:focus-visible) .is-pinned-left,.data-row:has(:focus-visible) .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))),var(--nat-table-row-background-focus-pinned, var(--sys-nat-table-row-background-focus-pinned, rgb(128 128 128 / 16%))))}@media(hover:hover)and (pointer:fine){.data-row:hover{background:var(--nat-table-row-background-hover, var(--sys-nat-table-row-background-hover, rgb(128 128 128 / 8%)))}.data-row:hover .is-pinned-left,.data-row:hover .is-pinned-right{background-image:linear-gradient(var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))),var(--nat-table-row-background-hover-pinned, var(--sys-nat-table-row-background-hover-pinned, rgb(128 128 128 / 12%))))}}.data-cell{transition:background-color .12s ease}.data-row-header{font-weight:var(--nat-table-font-weight-row-header, var(--sys-nat-table-font-weight-row-header, 600))}.has-sticky-header .header-cell{position:sticky;top:var(--nat-table-sticky-top, var(--sys-nat-table-sticky-top, 0));z-index:var(--nat-table-z-index-sticky-header, var(--sys-nat-table-z-index-sticky-header, 4))}.has-sticky-header .is-pinned-left,.has-sticky-header .is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-cell, var(--sys-nat-table-z-index-pinned-cell, 5))}.is-pinned-left,.is-pinned-right{background:var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) )}.has-sticky-header .header-cell.is-pinned-left,.has-sticky-header .header-cell.is-pinned-right,.header-cell.is-pinned-left,.header-cell.is-pinned-right{position:sticky;z-index:var(--nat-table-z-index-pinned-header, var(--sys-nat-table-z-index-pinned-header, 6));background:var( --nat-table-pinned-header-background, var( --sys-nat-table-pinned-header-background, var( --nat-table-pinned-background, var( --sys-nat-table-pinned-background, var( --nat-table-header-background, var( --sys-nat-table-header-background, var(--nat-table-color-surface-sticky, var(--sys-nat-table-color-surface-sticky, canvas)) ) ) ) ) ) )}.has-pinned-edge-left{box-shadow:inset -1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.has-pinned-edge-right{box-shadow:inset 1px 0 0 var(--nat-table-pinned-divider-color, var(--sys-nat-table-pinned-divider-color, rgb(128 128 128 / 34%))),calc(-1 * var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px))) 0 var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) calc(var(--nat-table-pinned-edge-shadow-size, var(--sys-nat-table-pinned-edge-shadow-size, 6px)) / -2) var(--nat-table-pinned-divider-shadow-color, var(--sys-nat-table-pinned-divider-shadow-color, transparent))}.header-cell.is-align-end,.data-cell.is-align-end{text-align:right}.data-cell.is-align-end{font-variant-numeric:tabular-nums}.data-cell[data-tone=positive]{color:var( --nat-table-cell-color-positive, var(--sys-nat-table-cell-color-positive, var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor))) )}.data-cell[data-tone=negative]{color:var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) )}.data-cell[data-tone=warning]{color:var( --nat-table-cell-color-warning, var(--sys-nat-table-cell-color-warning, var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor))) )}.data-cell[data-tone=neutral]{color:var( --nat-table-cell-color-neutral, var(--sys-nat-table-cell-color-neutral, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, currentColor))) )}.table-state{padding:var(--nat-table-space-empty-state, var(--sys-nat-table-space-empty-state, 40px 24px));font-size:var(--nat-table-font-size-empty-state, var(--sys-nat-table-font-size-empty-state, 1rem));line-height:var(--nat-table-line-height-empty-state, var(--sys-nat-table-line-height-empty-state, 1.6));color:var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) );white-space:normal;animation:nat-table-state-enter var(--nat-table-state-transition-duration, var(--sys-nat-table-state-transition-duration, .14s)) var(--nat-table-state-transition-timing, var(--sys-nat-table-state-transition-timing, ease-out)) both}.table-state-content{position:sticky;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100cqi;min-height:var( --nat-table-state-min-height, var(--sys-nat-table-state-min-height, var(--nat-table-min-height, var(--sys-nat-table-min-height, 0))) );text-align:center}.loading-state{color:var( --nat-table-loading-state-color, var( --sys-nat-table-loading-state-color, var( --nat-table-empty-state-color, var(--sys-nat-table-empty-state-color, var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))) ) ) )}.empty-state,.error-state,.loading-state{padding-right:0;padding-left:0}.error-state{color:var( --nat-table-error-state-color, var( --sys-nat-table-error-state-color, var( --nat-table-cell-color-negative, var(--sys-nat-table-cell-color-negative, var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor))) ) ) )}.sub-header-cell{position:relative;padding:0!important;overflow:visible!important;font-weight:var(--nat-table-font-weight-sub-header, var(--sys-nat-table-font-weight-sub-header, 600));color:var(--nat-table-sub-header-color, var(--sys-nat-table-sub-header-color, currentColor));white-space:normal;background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent));border:var(--nat-table-sub-header-border, var(--sys-nat-table-sub-header-border, none));border-width:var(--nat-table-sub-header-border-width, var(--sys-nat-table-sub-header-border-width, 0))}.sub-header-cell.is-pinned-left,.sub-header-cell.is-pinned-right{background:var(--nat-table-sub-header-background, var(--sys-nat-table-sub-header-background, transparent))}.sub-header-content{position:sticky;left:0;z-index:1;box-sizing:border-box;display:inline-flex;align-items:center;max-width:100cqi;padding:var(--nat-table-space-sub-header, var(--sys-nat-table-space-sub-header, 8px 12px))}@keyframes nat-table-state-enter{0%{opacity:var(--nat-table-state-transition-opacity-from, var(--sys-nat-table-state-transition-opacity-from, 0));transform:translateY(var(--nat-table-state-transition-distance, var(--sys-nat-table-state-transition-distance, 2px)))}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.table-state{animation:none}}[ngGridCell]:focus-visible{outline:none;box-shadow:inset 0 0 0 var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, Highlight))}[ngGridCell]:focus-visible:is(.is-pinned-left,.is-pinned-right){z-index:var(--nat-table-z-index-focus-cell, var(--sys-nat-table-z-index-focus-cell, 7))}@media(forced-colors:active){[ngGridCell]:focus-visible{outline:2px solid Highlight;outline-offset:-2px}}[ngGridCell]:focus-visible:not(.is-pinned-left,.is-pinned-right,.header-cell){position:relative}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;white-space:nowrap;border:0;clip-path:inset(50%)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: true }] }], columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], accessibleName: [{ type: i0.Input, args: [{ isSignal: true, alias: "accessibleName", required: false }] }], caption: [{ type: i0.Input, args: [{ isSignal: true, alias: "caption", required: false }] }], dataStatus: [{ type: i0.Input, args: [{ isSignal: true, alias: "dataStatus", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], enableRowSelection: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableRowSelection", required: false }] }], selectionMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectionMode", required: false }] }], globalFilterFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "globalFilterFn", required: false }] }], getRowId: [{ type: i0.Input, args: [{ isSignal: true, alias: "getRowId", required: false }] }], subHeaderColumn: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderColumn", required: false }] }], subHeaderOrder: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderOrder", required: false }] }], enableSubHeaders: [{ type: i0.Input, args: [{ isSignal: true, alias: "enableSubHeaders", required: false }] }], subHeaderLayout: [{ type: i0.Input, args: [{ isSignal: true, alias: "subHeaderLayout", required: false }] }], rowActivate: [{ type: i0.Output, args: ["rowActivate"] }], loadingTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableLoadingTemplate), { isSignal: true }] }], emptyTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableEmptyTemplate), { isSignal: true }] }], errorTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableErrorTemplate), { isSignal: true }] }], subHeaderTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NatTableSubHeaderTemplate), { isSignal: true }] }], tableRegionRef: [{ type: i0.ViewChild, args: ['tableRegion', { isSignal: true }] }] } });

const readTrimmedText = (nativeEl) => (nativeEl.textContent || nativeEl.innerText || '').trim();
/**
 * Directive to manage keyboard shortcut screen reader readouts and ARIA attributes.
 * Updates `aria-keyshortcuts` and appends shortcut descriptions to `aria-label`
 * without losing the element's base text.
 */
class NatTableHotkeyA11y {
    el = inject(ElementRef);
    renderer = inject(Renderer2);
    destroyRef = inject(DestroyRef);
    natTableService = inject(NatTableService, { optional: true });
    globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
    // Support multiple selector aliases as inputs
    natHotkeyA11y = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natHotkeyA11y" }] : /* istanbul ignore next */ []));
    natTableHotkeyA11y = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTableHotkeyA11y" }] : /* istanbul ignore next */ []));
    appHotkeyA11y = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appHotkeyA11y" }] : /* istanbul ignore next */ []));
    // Resolve the active action key
    actionKey = computed(() => {
        const val = this.natHotkeyA11y() || this.natTableHotkeyA11y() || this.appHotkeyA11y();
        return val ? val : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actionKey" }] : /* istanbul ignore next */ []));
    // Resolve the active keybindings configuration
    keybindings = computed(() => {
        if (this.natTableService) {
            return this.natTableService.keybindings();
        }
        return mergeNatTableKeybindings({}, this.globalKeybindings);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "keybindings" }] : /* istanbul ignore next */ []));
    // Get and format the shortcut string representation
    shortcut = computed(() => {
        const key = this.actionKey();
        if (!key)
            return '';
        const bindings = this.keybindings();
        const value = bindings[key];
        return serializeShortcutValue(value);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "shortcut" }] : /* istanbul ignore next */ []));
    // Track the original aria-label and inner text of the host element
    originalAriaLabel = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "originalAriaLabel" }] : /* istanbul ignore next */ []));
    originalInnerText = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "originalInnerText" }] : /* istanbul ignore next */ []));
    // Compute the base label (aria-label has higher priority than innerText)
    baseLabel = computed(() => {
        return this.originalAriaLabel() ?? this.originalInnerText();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "baseLabel" }] : /* istanbul ignore next */ []));
    // Guards against the directive's own attribute writes re-triggering the observer.
    updatingAttributes = false;
    constructor() {
        const nativeEl = this.el.nativeElement;
        // Initialize base values
        this.originalAriaLabel.set(nativeEl.getAttribute('aria-label'));
        this.originalInnerText.set(readTrimmedText(nativeEl));
        // Observe changes to attributes or content to stay in sync when a DOM observer exists.
        const observer = this.createMutationObserver(nativeEl);
        if (!observer) {
            afterEveryRender(() => {
                this.syncExternalAriaLabel(nativeEl);
                this.originalInnerText.set(readTrimmedText(nativeEl));
            });
        }
        this.destroyRef.onDestroy(() => observer?.disconnect());
        // Effect to update ARIA attributes
        effect(() => {
            const currentShortcut = this.shortcut();
            const base = this.baseLabel();
            this.updatingAttributes = true;
            try {
                this.writeAriaAttributes(nativeEl, currentShortcut, base);
            }
            finally {
                this.updatingAttributes = false;
            }
        });
    }
    createMutationObserver(nativeEl) {
        const mutationObserverCtor = globalThis.MutationObserver;
        if (typeof mutationObserverCtor === 'undefined')
            return null;
        const observer = new mutationObserverCtor((mutations) => this.syncFromMutations(nativeEl, mutations));
        observer.observe(nativeEl, {
            attributes: true,
            attributeFilter: ['aria-label'],
            childList: true,
            characterData: true,
            subtree: true
        });
        return observer;
    }
    /** Re-reads aria-label / text into the original-* signals when changed from outside this directive. */
    syncFromMutations(nativeEl, mutations) {
        if (this.updatingAttributes)
            return;
        const isAriaLabel = (mutation) => mutation.type === 'attributes' && mutation.attributeName === 'aria-label';
        const isTextMutation = (mutation) => mutation.type === 'childList' || mutation.type === 'characterData';
        if (mutations.some(isAriaLabel)) {
            this.syncExternalAriaLabel(nativeEl);
        }
        if (mutations.some(isTextMutation)) {
            this.originalInnerText.set(readTrimmedText(nativeEl));
        }
    }
    /** Captures an aria-label edit made outside this directive (one not carrying our shortcut suffix). */
    syncExternalAriaLabel(nativeEl) {
        const newAriaLabel = nativeEl.getAttribute('aria-label');
        if (!newAriaLabel) {
            this.originalAriaLabel.set(null);
            return;
        }
        const currentShortcut = this.shortcut();
        const suffix = currentShortcut ? ` (Shortcut: ${currentShortcut})` : '';
        if (!suffix || !newAriaLabel.endsWith(suffix)) {
            this.originalAriaLabel.set(newAriaLabel);
        }
    }
    /** Writes aria-keyshortcuts and the shortcut-suffixed aria-label, or restores the originals when no shortcut applies. */
    writeAriaAttributes(nativeEl, currentShortcut, base) {
        if (!currentShortcut) {
            this.renderer.removeAttribute(nativeEl, 'aria-keyshortcuts');
            const original = this.originalAriaLabel();
            if (original) {
                this.renderer.setAttribute(nativeEl, 'aria-label', original);
            }
            else {
                this.renderer.removeAttribute(nativeEl, 'aria-label');
            }
            return;
        }
        this.renderer.setAttribute(nativeEl, 'aria-keyshortcuts', currentShortcut);
        if (base) {
            this.renderer.setAttribute(nativeEl, 'aria-label', `${base} (Shortcut: ${currentShortcut})`);
        }
        else {
            this.renderer.removeAttribute(nativeEl, 'aria-label');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHotkeyA11y, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableHotkeyA11y, isStandalone: true, selector: "[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]", inputs: { natHotkeyA11y: { classPropertyName: "natHotkeyA11y", publicName: "natHotkeyA11y", isSignal: true, isRequired: false, transformFunction: null }, natTableHotkeyA11y: { classPropertyName: "natTableHotkeyA11y", publicName: "natTableHotkeyA11y", isSignal: true, isRequired: false, transformFunction: null }, appHotkeyA11y: { classPropertyName: "appHotkeyA11y", publicName: "appHotkeyA11y", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableHotkeyA11y, decorators: [{
            type: Directive,
            args: [{
                    selector: '[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]'
                }]
        }], ctorParameters: () => [], propDecorators: { natHotkeyA11y: [{ type: i0.Input, args: [{ isSignal: true, alias: "natHotkeyA11y", required: false }] }], natTableHotkeyA11y: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableHotkeyA11y", required: false }] }], appHotkeyA11y: [{ type: i0.Input, args: [{ isSignal: true, alias: "appHotkeyA11y", required: false }] }] } });

/** Provides global keyboard shortcut overrides for every nat-table in the injector scope. */
const provideNatTableKeybindings = (keybindings) => ({
    provide: NAT_TABLE_KEYBINDINGS,
    useValue: keybindings
});

/**
 * Generated bundle index. Do not edit.
 */

export { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS, NAT_TABLE_KEYBINDINGS, NAT_TABLE_ROW_WINDOW_HOST, NatList, NatTable, NatTableA11yService, NatTableEmptyTemplate, NatTableErrorTemplate, NatTableHeaderMeasurementService, NatTableHotkeyA11y, NatTableLoadingTemplate, NatTableReorderService, NatTableResizeService, NatTableRowPlaceholderTemplate, NatTableRowRenderStrategyRegistry, NatTableService, NatTableStatic, NatTableSubHeaderTemplate, createNatTableKeyboard, hasNatTableStateValueChanged, provideNatTableKeybindings, serializeShortcutValue, stripNatTableSubHeaderSorting };
//# sourceMappingURL=ng-advanced-table.mjs.map
