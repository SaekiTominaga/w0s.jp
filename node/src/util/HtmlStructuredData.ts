import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { JSDOM } from 'jsdom';

interface StructuredDataUrl {
	readonly path: string;
	readonly name: string;
}

interface StructuredData {
	readonly '@type'?: string; // 現状は使用していない
	readonly title: string;
	readonly headline?: string;
	readonly subHeadline?: string;
	dateModified?: import('dayjs').Dayjs;
	readonly description?: string;
	readonly image?: string;
	readonly breadcrumb?: StructuredDataUrl[];
	readonly localNav?: StructuredDataUrl[];
}

interface SchemaOrgBreadcrumbListItem {
	readonly '@context'?: string;
	readonly '@type': string;
	readonly position: number;
	readonly name: string;
	readonly item?: string;
} // https://schema.org/ListItem; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=ja#list-item

interface SchemaOrgBreadcrumbList {
	readonly '@context'?: string;
	readonly '@type': string;
	readonly itemListElement: SchemaOrgBreadcrumbListItem[];
} // https://schema.org/BreadcrumbList; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=ja#breadcrumb-list

/**
 * HTML
 */
export default class HtmlStructuredData {
	/**
	 * HTML（EJS）ファイルからページの構造データを取得
	 *
	 * @param {string} htmlFilePath - HTML（EJS）ファイルパス
	 * @param {string} selector - 構造データを定義した要素のセレクター
	 *
	 * @returns {object} 構造データ
	 */
	static async getForHtml(htmlFilePath: string, selector: string): Promise<StructuredData> {
		const fileData = (await fs.promises.readFile(htmlFilePath)).toString();

		const structuredDataText = new JSDOM(fileData).window.document.querySelector(selector)?.textContent; // 構造データ
		if (structuredDataText === null || structuredDataText === undefined) {
			throw new Error(`Structured data is not defined: ${htmlFilePath}`);
		}

		return HtmlStructuredData.#getStructuredData(structuredDataText);
	}

	/**
	 * JSON ファイルからページの構造データを取得
	 *
	 * @param {string} htmlFilePath - HTML（EJS）ファイルパス
	 *
	 * @returns {object} 構造データ
	 */
	static async getForJson(htmlFilePath: string): Promise<StructuredData> {
		const parsed = path.parse(htmlFilePath);
		const jsonFilePath = `${parsed.dir}/${parsed.name}.json`;

		const fileData = (await fs.promises.readFile(jsonFilePath)).toString(); // 同一ファイル名で拡張子 .json のファイルを読み込む

		return HtmlStructuredData.#getStructuredData(fileData);
	}

	/**
	 * 構造データを取得する
	 *
	 * @param {string} fileData - ファイルから取得したデータ
	 *
	 * @returns {object} 構造データ
	 */
	static #getStructuredData(fileData: string): StructuredData {
		const structuredData: StructuredData = JSON.parse(fileData);

		/* 型変換 */
		if (structuredData.dateModified !== undefined) {
			structuredData.dateModified = dayjs(structuredData.dateModified);
		}

		return structuredData;
	}

	/**
	 * JSON-LD 用のデータを構築
	 *
	 * @param {object} structuredData - ページで指定された構造データ
	 *
	 * @returns {object} JSON-LD データ
	 */
	static getJsonLd(structuredData: StructuredData): SchemaOrgBreadcrumbList | undefined {
		if (structuredData.breadcrumb === undefined) {
			return undefined;
		}

		const jsonLdBreadcrumbItemList: SchemaOrgBreadcrumbListItem[] = structuredData.breadcrumb.map((item, index) => {
			const listItem = {
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: `https://w0s.jp${item.path}`, // 絶対 URL 化
			};
			return listItem;
		});
		jsonLdBreadcrumbItemList.push({
			'@type': 'ListItem',
			position: jsonLdBreadcrumbItemList.length + 1,
			name: structuredData.title,
		}); // 最後に現在ページを追加

		const jsonLd: SchemaOrgBreadcrumbList = {
			'@context': 'https://schema.org/',
			'@type': 'BreadcrumbList',
			itemListElement: jsonLdBreadcrumbItemList,
		};

		return jsonLd;
	}
}
