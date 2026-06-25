type SeenPairs = Map<object, Set<object>>;
type ValueMatcher = (left: unknown, right: unknown, seen: SeenPairs) => boolean;

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

const cloneSeenPairs = (seen: SeenPairs): SeenPairs => {
  const clone: SeenPairs = new Map();

  for (const [left, rightValues] of seen) {
    clone.set(left, new Set(rightValues));
  }

  return clone;
};

const replaceSeenPairs = (target: SeenPairs, source: SeenPairs): void => {
  target.clear();

  for (const [left, rightValues] of source) {
    target.set(left, new Set(rightValues));
  }
};

const valuesMatchWithoutFailedPairSideEffects = (left: unknown, right: unknown, seen: SeenPairs): boolean => {
  const trialSeen = cloneSeenPairs(seen);

  if (!valuesMatch(left, right, trialSeen)) {
    return false;
  }

  replaceSeenPairs(seen, trialSeen);

  return true;
};

const isDateComparison = (left: object, right: object): boolean => left instanceof Date || right instanceof Date;

const isRegExpComparison = (left: object, right: object): boolean => left instanceof RegExp || right instanceof RegExp;

const isMapComparison = (left: object, right: object): boolean => left instanceof Map || right instanceof Map;

const isSetComparison = (left: object, right: object): boolean => left instanceof Set || right instanceof Set;

const datesMatch = (left: object, right: object): boolean =>
  left instanceof Date && right instanceof Date && Object.is(left.getTime(), right.getTime());

const regexpsMatch = (left: object, right: object): boolean =>
  left instanceof RegExp && right instanceof RegExp && left.source === right.source && left.flags === right.flags;

const arraysMatch = (left: object, right: object, seen: SeenPairs): boolean =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => valuesMatch(value, right[index], seen));

const mapsMatch = (left: object, right: object, seen: SeenPairs): boolean => {
  if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) {
    return false;
  }

  const leftMap = left as ReadonlyMap<unknown, unknown>;
  const rightEntries: Array<readonly [unknown, unknown]> = Array.from((right as ReadonlyMap<unknown, unknown>).entries());

  return Array.from(leftMap.entries()).every(
    ([key, value], index) => valuesMatch(key, rightEntries[index]?.[0], seen) && valuesMatch(value, rightEntries[index]?.[1], seen)
  );
};

const setsMatch = (left: object, right: object, seen: SeenPairs): boolean => {
  if (!(left instanceof Set) || !(right instanceof Set) || left.size !== right.size) {
    return false;
  }

  const leftSet = left as ReadonlySet<unknown>;
  const unmatchedRightValues = Array.from((right as ReadonlySet<unknown>).values());

  return Array.from(leftSet.values()).every((leftValue) => {
    const matchingIndex = unmatchedRightValues.findIndex((rightValue) =>
      valuesMatchWithoutFailedPairSideEffects(leftValue, rightValue, seen)
    );

    if (matchingIndex < 0) {
      return false;
    }

    unmatchedRightValues.splice(matchingIndex, 1);

    return true;
  });
};

const plainObjectsMatch = (left: object, right: object, seen: SeenPairs): boolean => {
  const leftPrototype = Object.getPrototypeOf(left) as unknown;

  if (leftPrototype !== Object.getPrototypeOf(right)) {
    return false;
  }

  if (leftPrototype !== Object.prototype && leftPrototype !== null) {
    return false;
  }

  const leftKeys = enumerableKeys(left);
  const rightKeys = enumerableKeys(right);
  const leftRecord = left as Record<PropertyKey, unknown>;
  const rightRecord = right as Record<PropertyKey, unknown>;

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => rightKeys.includes(key) && valuesMatch(leftRecord[key], rightRecord[key], seen))
  );
};

const specialObjectsMatch = (left: object, right: object, seen: SeenPairs): boolean | null => {
  if (isDateComparison(left, right)) {
    return datesMatch(left, right);
  }

  if (isRegExpComparison(left, right)) {
    return regexpsMatch(left, right);
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return arraysMatch(left, right, seen);
  }

  if (isMapComparison(left, right)) {
    return mapsMatch(left, right, seen);
  }

  if (isSetComparison(left, right)) {
    return setsMatch(left, right, seen);
  }

  return null;
};

valuesMatch = (left, right, seen): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  if (!isObject(left)) {
    return false;
  }

  if (!isObject(right)) {
    return false;
  }

  if (hasSeenPair(left, right, seen)) {
    return true;
  }

  const specialMatch = specialObjectsMatch(left, right, seen);

  return specialMatch ?? plainObjectsMatch(left, right, seen);
};

/**
 * Avoid JSON serialization: consumer-owned filter values can include BigInt,
 * Sets, Maps, Dates, or RegExps that either throw or stringify incorrectly.
 */
export const hasNatTableStateValueChanged = (left: unknown, right: unknown): boolean =>
  !valuesMatch(left, right, new Map<object, Set<object>>());
