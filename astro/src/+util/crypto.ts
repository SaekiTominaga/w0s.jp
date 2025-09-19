import crypto from 'node:crypto';

const base64UrlEncode = (str: string): string => {
	const base64 = btoa(str);
	return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/v, '');
};

export const getId = (str?: string): string => {
	if (str !== undefined) {
		const hash = crypto.createHash('md5');
		hash.update(str);

		return base64UrlEncode(hash.digest('hex'));
	}

	const array = new Uint8Array(16);
	crypto.getRandomValues(array);

	return base64UrlEncode(String.fromCharCode(...array));
};
