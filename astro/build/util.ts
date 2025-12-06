import path from 'node:path';
import slash from 'slash';

/**
 * 実ファイルパスを元にレスポンス URL のパスを取得する
 *
 * @param filePath - 実ファイルパス
 *
 * @returns  レスポンス URL のパス（ルート相対パス）
 */
export const getPageUrl = (filePath: string): string => {
	const parsed = path.parse(slash(filePath));
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
