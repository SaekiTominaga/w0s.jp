/**
 * Converting an empty string to null
 *
 * @param string - character string
 *
 * @returns character string
 */
export const emptyToNull = (string: string | null): string | null => (string !== '' ? string : null);
