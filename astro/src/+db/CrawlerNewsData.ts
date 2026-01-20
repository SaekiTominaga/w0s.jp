import { jsToSQLiteComparison, sqliteToJS } from '@w0s/sqlite-utility';
import type { DNews, DNewsData } from '../../../@types/db_crawler.d.ts';
import DatabaseCrawler from './DatabaseCrawler.ts';

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDataDao extends DatabaseCrawler {
	/**
	 * ニュースデータを取得する
	 *
	 * @param newsId - ニュース ID
	 *
	 * @returns 新着データ
	 */
	async getNews(newsId?: string): Promise<Pick<DNews, 'url' | 'title'> | undefined> {
		if (newsId === undefined) {
			return undefined;
		}

		const query = this.db.selectFrom('d_news').select(['url', 'title']).where('random_id', '=', jsToSQLiteComparison(newsId));

		const row = await query.executeTakeFirst();
		if (row === undefined) {
			return undefined;
		}

		return {
			url: sqliteToJS(row.url, 'url'),
			title: sqliteToJS(row.title),
		};
	}

	/**
	 * 新着データを取得する
	 *
	 * @param newsId - ニュース ID
	 *
	 * @returns 新着データ
	 */
	async getNewsDataList(newsId: string): Promise<DNewsData[]> {
		const query = this.db
			.selectFrom('d_news_data')
			.select(['random_id', 'date', 'content', 'refer_url'])
			.where('news_id', '=', jsToSQLiteComparison(newsId))
			.orderBy('date', 'desc');

		const rows = await query.execute();

		return rows.map((row) => ({
			random_id: sqliteToJS(row.random_id),
			news_id: sqliteToJS(newsId),
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
		const query = this.db.deleteFrom('d_news_data').where('random_id', '=', jsToSQLiteComparison(id));

		await query.executeTakeFirst();
	}
}
