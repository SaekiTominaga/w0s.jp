import fs from 'node:fs';
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

	/**
	 * リクエスト URL のパスを元に実ファイルパスを取得する
	 *
	 * @param {string} requestPath - リクエスト URL のパス（ルート相対パス）
	 *
	 * @returns {string} 実ファイルパス
	 */
	getFilePath(requestPath: string): string | undefined {
		if (!requestPath.startsWith('/')) {
			throw new Error('The path must begin with a slash.');
		}

		let pagePath: string | undefined; // 実ファイルパス
		if (requestPath.endsWith('/')) {
			/* ディレクトリトップ（e.g. /foo/ ） */
			const fileName = this.#indexes?.find((name) => fs.existsSync(`${this.#root}${path.sep}${requestPath}${name}`));
			if (fileName !== undefined) {
				pagePath = `/${this.#root}${requestPath}${fileName}`;
			}
		} else if (path.extname(requestPath) === '') {
			/* 拡張子のない URL（e.g. /foo ） */
			const extension = this.#extensions?.find((ext) => fs.existsSync(`${this.#root}${path.sep}${requestPath}${ext}`));
			if (extension !== undefined) {
				pagePath = `/${this.#root}${requestPath}${extension}`;
			}
		} else if (fs.existsSync(`${this.#root}${path.sep}${requestPath}`)) {
			/* 拡張子のある URL（e.g. /foo.txt ） */
			pagePath = `/${this.#root}${requestPath}`;
		}

		return pagePath;
	}
}
