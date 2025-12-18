import path from 'node:path';
import slash from 'slash';

/**
 * 実ファイルパスを元にレスポンス URL を取得する
 *
 * @param filePath - 実ファイルパス
 *
 * @returns レスポンス URL（パス絶対 URL）
 */
export const getPageUrl = (filePath: string): string => {
	const filePathUnix = slash(filePath);
	if (!filePathUnix.startsWith('/')) {
		throw new Error('The file path must begin with a slash.');
	}

	const parsed = path.parse(slash(filePathUnix));
	const dir = parsed.dir === '/' ? '' : parsed.dir;

	if (['index.html'].includes(parsed.base)) {
		/* インデックスファイルはファイル名を省略する */
		return `${dir}/`;
	}

	if (['.html'].includes(parsed.ext)) {
		/* 指定された拡張子を除去する */
		return `${dir}/${parsed.name}`;
	}

	return `${dir}/${parsed.name}${parsed.ext}`;
};
