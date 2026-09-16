export type SiteLang = 'en' | 'sq';

export const DEFAULT_LANG: SiteLang = 'en';
export const LANGUAGES: SiteLang[] = ['en', 'sq'];

export function isSiteLang(
  value: string | undefined | null
): value is SiteLang {
  return value === 'en' || value === 'sq';
}

export function normalizePathname(
  pathname: string
) {
  let path = pathname || '/';

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  path = path.replace(/\/+/g, '/');

  if (
    path !== '/' &&
    !path.endsWith('/')
  ) {
    path += '/';
  }

  return path;
}

/**
 * Returns the language represented by a public URL.
 *
 * Existing/root URLs remain English:
 * /about/
 * /fashion/
 *
 * Albanian URLs live under /sq/:
 * /sq/about/
 * /sq/fashion/
 */
export function languageFromPath(
  pathname: string
): SiteLang {
  const path =
    normalizePathname(pathname);

  return path === '/sq/' ||
    path.startsWith('/sq/')
    ? 'sq'
    : 'en';
}

/**
 * Converts any public URL to the canonical English/root path.
 *
 * /about/       -> /about/
 * /sq/about/    -> /about/
 * /sq/          -> /
 */
export function englishPath(
  pathname: string
) {
  const path =
    normalizePathname(pathname);

  if (path === '/sq/') {
    return '/';
  }

  if (path.startsWith('/sq/')) {
    return normalizePathname(
      path.slice(3)
    );
  }

  return path;
}

/**
 * Returns the public path for the requested language.
 *
 * English:
 * /about/
 *
 * Albanian:
 * /sq/about/
 */
export function localizedPath(
  pathname: string,
  lang: SiteLang
) {
  const base =
    englishPath(pathname);

  if (lang === 'en') {
    return base;
  }

  if (base === '/') {
    return '/sq/';
  }

  return normalizePathname(
    `/sq${base}`
  );
}

/**
 * Keeps hash anchors while switching language.
 *
 * /book/#contact
 * becomes
 * /sq/book/#contact
 */
export function localizedHref(
  href: string,
  lang: SiteLang
) {
  if (
    !href ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return href;
  }

  const hashIndex =
    href.indexOf('#');

  const hash =
    hashIndex >= 0
      ? href.slice(hashIndex)
      : '';

  const rawPath =
    hashIndex >= 0
      ? href.slice(0, hashIndex)
      : href;

  if (rawPath === '') {
    return hash;
  }

  return (
    localizedPath(
      rawPath,
      lang
    ) + hash
  );
}

/**
 * Builds the language counterpart URLs for SEO.
 */
export function languageUrls(
  pathname: string,
  site:
    | URL
    | undefined
) {
  if (!site) {
    return {
      en: undefined,
      sq: undefined,
      xDefault: undefined
    };
  }

  const enPath =
    localizedPath(
      pathname,
      'en'
    );

  const sqPath =
    localizedPath(
      pathname,
      'sq'
    );

  const en =
    new URL(
      enPath,
      site
    );

  const sq =
    new URL(
      sqPath,
      site
    );

  return {
    en,
    sq,

    // Existing English/root site stays the default version.
    xDefault: en
  };
}

/**
 * Returns the counterpart URL used by the EN/SQ switch.
 */
export function alternateLanguagePath(
  pathname: string,
  currentLang?: SiteLang
) {
  const lang =
    currentLang ||
    languageFromPath(
      pathname
    );

  return localizedPath(
    pathname,
    lang === 'en'
      ? 'sq'
      : 'en'
  );
}
