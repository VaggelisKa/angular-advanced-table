/*
 * RFC 4647 §2.1: language tags are not case sensitive. `DA-DK` therefore has
 * to reach a registered `da`, the same way `Intl.NumberFormat` already
 * formats it as Danish. An exact key still wins, so a registry holding two
 * spellings of one id resolves the one the caller asked for.
 */
const findRegisteredId = (locales: Readonly<Record<string, unknown>>, candidate: string): string | null => {
  if (locales[candidate] !== undefined) {
    return candidate;
  }

  const folded = candidate.toLowerCase();

  return Object.keys(locales).find((id) => id.toLowerCase() === folded && locales[id] !== undefined) ?? null;
};

/**
 * RFC 4647 §3.4 lookup: the best registered match for a locale id, or `null`.
 *
 * An exact match always wins. Otherwise the id is truncated one subtag at a
 * time, so `da-DK` resolves the registered `da` dictionary — Angular's own
 * `LOCALE_ID` is a BCP 47 tag, so applications bind region-tagged ids, and
 * `Intl.NumberFormat` already negotiates them. Truncation skips a trailing
 * singleton subtag (`de-DE-u-co-phonebk` → `de-DE`), which is never a language
 * match on its own. Matching ignores case. Macrolanguage pairs such as `no`
 * and `nb` share no prefix and still need registering under both ids.
 */
export const matchNatTableLocaleId = (locales: Readonly<Record<string, unknown>> | undefined, localeId: string): string | null => {
  if (!locales) {
    return null;
  }

  let candidate = localeId;

  while (candidate.length > 0) {
    const registeredId = findRegisteredId(locales, candidate);

    if (registeredId !== null) {
      return registeredId;
    }

    const lastSeparator = candidate.lastIndexOf('-');

    if (lastSeparator < 0) {
      return null;
    }

    candidate = candidate.slice(0, lastSeparator);

    const singletonAt = candidate.lastIndexOf('-');

    if (singletonAt >= 0 && candidate.length - singletonAt === 2) {
      candidate = candidate.slice(0, singletonAt);
    }
  }

  return null;
};
