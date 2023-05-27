import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
/**
 * HTML 構造データ
 */
export default class HtmlStructuredData {
    /**
     * JSON ファイルからページの構造データを取得
     *
     * @param {string} htmlFilePath - HTML（EJS）ファイルパス
     *
     * @returns {object} 構造データ
     */
    static async getForJson(htmlFilePath) {
        const parsed = path.parse(htmlFilePath);
        const jsonFilePath = `${parsed.dir}/${parsed.name}.json`;
        const fileData = (await fs.promises.readFile(jsonFilePath)).toString(); // 同一ファイル名で拡張子 .json のファイルを読み込む
        return HtmlStructuredData.getStructuredData(fileData);
    }
    /**
     * 構造データを取得する
     *
     * @param {string} fileData - ファイルから取得したデータ
     *
     * @returns {object} 構造データ
     */
    static getStructuredData(fileData) {
        const structuredData = JSON.parse(fileData);
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
    static getJsonLd(structuredData) {
        if (structuredData.breadcrumb === undefined && structuredData.description === undefined) {
            /* パンくずも description もないページは JSON-LD を出力する意味合いが薄い */
            return undefined;
        }
        /* パンくず */
        let breadcrumbList;
        if (structuredData.breadcrumb !== undefined) {
            const breadcrumbItemList = structuredData.breadcrumb.map((item, index) => {
                const listItem = {
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    item: `https://w0s.jp${item.path}`, // 絶対 URL 化
                };
                return listItem;
            });
            breadcrumbItemList.push({
                '@type': 'ListItem',
                position: breadcrumbItemList.length + 1,
                name: structuredData.title,
            }); // 最後に現在ページを追加
            breadcrumbList = {
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbItemList,
            };
        }
        const webPage = new Map([
            ['@context', 'https://schema.org/'],
            ['@type', structuredData['schema-type'] ?? 'WebPage'],
        ]);
        if (breadcrumbList !== undefined) {
            webPage.set('breadcrumb', breadcrumbList);
        }
        if (structuredData.dateModified !== undefined) {
            webPage.set('dateModified', dayjs(structuredData.dateModified).format('YYYY-MM-DD'));
        }
        webPage.set('headline', structuredData.title);
        if (structuredData.description !== undefined) {
            webPage.set('description', structuredData.description);
        }
        if (structuredData.image !== undefined) {
            webPage.set('image', structuredData.image);
        }
        return Object.fromEntries(webPage);
    }
}
