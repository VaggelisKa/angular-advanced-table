/**
 * RFC 4647 §3.4 lookup: the best registered match for a locale id, or `null`.
 *
 * An exact match always wins. Otherwise the id is truncated one subtag at a
 * time, so `da-DK` resolves the registered `da` dictionary — Angular's own
 * `LOCALE_ID` is a BCP 47 tag, so applications bind region-tagged ids, and
 * `Intl.NumberFormat` already negotiates them. Truncation skips a trailing
 * singleton subtag (`de-DE-u-co-phonebk` → `de-DE`), which is never a language
 * match on its own. Macrolanguage pairs such as `no` and `nb` share no prefix
 * and still need registering under both ids.
 */
export const matchNatTableLocaleId = (locales: Readonly<Record<string, unknown>> | undefined, localeId: string): string | null => {
  if (!locales) {
    return null;
  }

  let candidate = localeId;

  while (candidate.length > 0) {
    if (locales[candidate] !== undefined) {
      return candidate;
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
