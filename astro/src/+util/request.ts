import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';

/**
 * Obtaining GET method parameters
 *
 * @param url - URL
 *
 * @returns URLSearchParams
 */
export const getParams = (url: URL): URLSearchParams => new URLSearchParamsCustomSeparator(url, [';']).searchParams;
