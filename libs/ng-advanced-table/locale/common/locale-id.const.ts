/** Locale id for the built-in English locale dictionaries. */
export const NAT_EN_LOCALE_ID = 'en';

/** Locale id for the built-in Danish locale dictionaries. */
export const NAT_DA_LOCALE_ID = 'da';

/** Locale id for the built-in Finnish locale dictionaries. */
export const NAT_FI_LOCALE_ID = 'fi';

/** Locale id for the built-in Norwegian Bokmål locale dictionaries. */
export const NAT_NB_LOCALE_ID = 'nb';

/**
 * Conventional id for the Norwegian macrolanguage. Nothing registers it on its
 * own, and id lookup cannot reach Bokmål from it: `no` is not a prefix of `nb`,
 * so register {@link NAT_NB_LOCALE_LABELS} under both this id and
 * {@link NAT_NB_LOCALE_ID} when an application sets either. Nynorsk is a
 * separate written standard and is not covered.
 */
export const NAT_NO_LOCALE_ID = 'no';

/** Locale id for the built-in Swedish locale dictionaries. */
export const NAT_SV_LOCALE_ID = 'sv';
