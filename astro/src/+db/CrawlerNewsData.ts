import { jsToSQLiteComparison, sqliteToJS } from '@w0s/sqlite-utility';
import type { DNewsData } from '../../../@types/db_crawler.ts';
import DatabaseCrawler from './DatabaseCrawler.ts';

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDataDao extends DatabaseCrawler {
	/**
	 * 新着データを取得する
	 *
	 * @param url - 対象データの URL
	 *
	 * @returns 新着データ
	 */
	async getNewsDataList(url: string): Promise<DNewsData[]> {
		const query = this.db
			.selectFrom('d_news_data')
			.select(['uuid', 'date', 'content', 'refer_url'])
			.where('url', '=', jsToSQLiteComparison(url))
			.orderBy('date', 'desc');

		const rows = await query.execute();

		return rows.map((row) => ({
			uuid: sqliteToJS(row.uuid),
			url: sqliteToJS(url, 'url'),
			date: sqliteToJS(row.date, 'date'),
			content: sqliteToJS(row.content),
			refer_url: sqliteToJS(row.refer_url),
		}));
	}

	/**
	 * 新着データを削除する
	 *
	 * @param id - 削除対象の ID
	 */
	async delete(id: string): Promise<void> {
		const query = this.db.deleteFrom('d_news_data').where('uuid', '=', jsToSQLiteComparison(id));

		await query.executeTakeFirst();
	}
}
