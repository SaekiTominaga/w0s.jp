import crypto from 'node:crypto';

export const getIdHash = (str: string): string => {
	const hash = crypto.createHash('md5');
	hash.update(str);
	return hash.digest('hex');
};
