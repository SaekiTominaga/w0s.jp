import dayjs, { type Dayjs } from 'dayjs';
import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';

/**
 * Obtaining GET method parameters
 *
 * @param url - URL
 *
 * @returns URLSearchParams
 */
export const getParams = (url: URL): URLSearchParams => new URLSearchParamsCustomSeparator(url, [';']).searchParams;

/**
 * Convert to string type
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const string = (request: unknown): string | undefined => (typeof request === 'string' ? request : undefined);

/**
 * Convert to string type (if empty string to undefined)
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const stringEmpty = (request: unknown): string | undefined => {
	const requestString = string(request);
	return requestString !== '' ? requestString : undefined;
};

/**
 * Convert to string[] type
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const strings = (request: unknown): string[] => (Array.isArray(request) ? (request as string[]) : []);

/**
 * Convert to number type
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const number = (request: unknown): number | undefined => (typeof request === 'string' ? Number(request) : undefined);

/**
 * Convert to boolean type
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const boolean = (request: unknown): boolean => Boolean(request);

/**
 * Convert to Dayjs type (YYYY-MM)
 *
 * @param request - Request string
 *
 * @returns Converted
 */
export const dateYYYYMM = (request: unknown): Dayjs | undefined =>
	typeof request === 'string' ? dayjs(new Date(Number(request.substring(0, 4)), Number(request.substring(5, 7)) - 1)) : undefined;
