import path from 'node:path';
import slash from 'slash';

interface Options {
	root: string; // ルートディレクトリ
	extensions: string[] | undefined; // ファイル拡張子のフォールバック（e.g. ["html"] ）
	indexes: string[] | undefined; // ディレクトリのインデックスファイル名（e.g. ["index.html"] ）
}

export default class PageUrl {
	readonly #root: string;

	readonly #extensions: string[] | undefined;

	readonly #indexes: string[] | undefined;

	/**
	 * @param {Options} options - Options
	 */
	constructor(options: Options) {
		this.#root = options.root;
		this.#extensions = options.extensions?.map((extension) => `.${extension}`);
		this.#indexes = options.indexes;
	}

	/**
	 * 実ファイルパスを元にレスポンス URL のパスを取得する
	 *
	 * @param {string} filePath - 実ファイルパス
	 *
	 * @returns {string} レスポンス URL のパス（ルート相対パス）
	 */
	getUrl(filePath: string): string {
		const filePathNormalize = slash(path.normalize(slash(filePath))); // Unix 環境で Windows 形式のパスのテストを通すために slash() を2回掛ける

		if (!filePathNormalize.startsWith(`${this.#root}/`)) {
			throw new Error(`'${filePathNormalize}' must be under the root path.`);
		}

		const parsed = path.parse(filePathNormalize);
		const urlBaseDirectory = parsed.dir.substring(this.#root.length);

		if (this.#indexes?.includes(parsed.base)) {
			/* インデックスファイルはファイル名を省略する */
			return `${urlBaseDirectory}/`;
		}

		if (this.#extensions?.includes(parsed.ext)) {
			/* 指定された拡張子を除去する */
			return `${urlBaseDirectory}/${parsed.name}`;
		}

		return `${urlBaseDirectory}/${parsed.name}${parsed.ext}`;
	}
}
