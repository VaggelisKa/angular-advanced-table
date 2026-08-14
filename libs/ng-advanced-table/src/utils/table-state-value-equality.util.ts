type SeenPairs = Map<object, Set<object>>;
type ComparisonContext = { seen: SeenPairs; budget: { remainingWork: number }; depth: number };
type ValueMatcher = (left: unknown, right: unknown, context: ComparisonContext) => boolean;

const MAX_STATE_COMPARISON_DEPTH = 128;
const MAX_STATE_COMPARISON_WORK = 1_000;

let valuesMatch: ValueMatcher = () => false;

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const enumerableKeys = (value: object): PropertyKey[] =>
  Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));

const hasSeenPair = (left: object, right: object, seen: SeenPairs): boolean => {
  const rightValues = seen.get(left);

  if (rightValues?.has(right)) {
    return true;
  }

  if (rightValues) {
    rightValues.add(right);
  } else {
    seen.set(left, new Set([right]));
  }

  return false;
};

const cloneSeenPairs = (seen: SeenPairs): SeenPairs =>
  new Map(Array.from(seen, ([left, rightValues]) => [left, new Set(rightValues)]));

const replaceSeenPairs = (target: SeenPairs, source: SeenPairs): void => {
  target.clear();

  for (const [left, rightValues] of source) {
    target.set(left, new Set(rightValues));
  }
};

const valuesMatchWithoutFailedPairSideEffects = (left: unknown, right: unknown, context: ComparisonContext): boolean => {
  const trialSeen = cloneSeenPairs(context.seen);

  if (!valuesMatch(left, right, { ...context, seen: trialSeen })) {
    return false;
  }

  replaceSeenPairs(context.seen, trialSeen);

  return true;
};

const datesMatch = (left: object, right: object): boolean =>
  left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime());

const regexpsMatch = (left: object, right: object): boolean =>
  left instanceof RegExp && right instanceof RegExp && left.source === right.source && left.flags === right.flags;

const isDateComparison = (left: object, right: object): boolean => left instanceof Date || right instanceof Date;
const isRegExpComparison = (left: object, right: object): boolean => left instanceof RegExp || right instanceof RegExp;
const isMapComparison = (left: object, right: object): boolean => left instanceof Map || right instanceof Map;
const isSetComparison = (left: object, right: object): boolean => left instanceof Set || right instanceof Set;

const valuesMatchNested = (left: unknown, right: unknown, context: ComparisonContext): boolean =>
  valuesMatch(left, right, { ...context, depth: context.depth + 1 });

const arraysMatch = (left: object, right: object, context: ComparisonContext): boolean =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => valuesMatchNested(value, right[index], context));

const mapsMatch = (left: object, right: object, context: ComparisonContext): boolean => {
  if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) {
    return false;
  }

  if (left.size * 2 > context.budget.remainingWork) {
    return false;
  }

  const leftMap = left as ReadonlyMap<unknown, unknown>;
  const rightEntries: Array<readonly [unknown, unknown]> = Array.from((right as ReadonlyMap<unknown, unknown>).entries());

  return Array.from(leftMap.entries()).every(
    ([key, value], index) =>
      valuesMatchNested(key, rightEntries[index]?.[0], context) && valuesMatchNested(value, rightEntries[index]?.[1], context)
  );
};

const setsMatch = (left: object, right: object, context: ComparisonContext): boolean => {
  if (!(left instanceof Set) || !(right instanceof Set) || left.size !== right.size) {
    return false;
  }

  if (left.size > context.budget.remainingWork) {
    return false;
  }

  const leftSet = left as ReadonlySet<unknown>;
  const unmatchedRightValues = Array.from((right as ReadonlySet<unknown>).values());

  return Array.from(leftSet.values()).every((leftValue) => {
    const matchingIndex = unmatchedRightValues.findIndex((rightValue) =>
      valuesMatchWithoutFailedPairSideEffects(leftValue, rightValue, { ...context, depth: context.depth + 1 })
    );

    if (matchingIndex < 0) {
      return false;
    }

    unmatchedRightValues.splice(matchingIndex, 1);

    return true;
  });
};

const plainObjectsMatch = (left: object, right: object, context: ComparisonContext): boolean => {
  const leftPrototype = Object.getPrototypeOf(left) as unknown;

  if (leftPrototype !== Object.getPrototypeOf(right)) {
    return false;
  }

  if (leftPrototype !== Object.prototype && leftPrototype !== null) {
    return false;
  }

  const leftKeys = enumerableKeys(left);
  const rightKeys = new Set(enumerableKeys(right));
  const leftRecord = left as Record<PropertyKey, unknown>;
  const rightRecord = right as Record<PropertyKey, unknown>;

  return (
    leftKeys.length === rightKeys.size &&
    leftKeys.length <= context.budget.remainingWork &&
    leftKeys.every((key) => rightKeys.has(key) && valuesMatchNested(leftRecord[key], rightRecord[key], context))
  );
};

const specialObjectsMatch = (left: object, right: object, context: ComparisonContext): boolean | null => {
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

valuesMatch = (left, right, context): boolean => {
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
export const hasNatTableStateValueChanged = (left: unknown, right: unknown): boolean =>
  !valuesMatch(left, right, {
    seen: new Map<object, Set<object>>(),
    budget: { remainingWork: MAX_STATE_COMPARISON_WORK },
    depth: 0
  });
