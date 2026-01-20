import { jsToSQLiteAssignment, jsToSQLiteComparison, sqliteToJS } from '@w0s/sqlite-utility';
import type { Insertable } from 'kysely';
import type { DNews } from '../../../@types/db_crawler.d.ts';
import DatabaseCrawler from './DatabaseCrawler.ts';

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDao extends DatabaseCrawler {
	/**
	 * 巡回ページデータを取得する
	 *
	 * @returns 巡回ページデータ
	 */
	async getNewsPageList(): Promise<
		(Omit<DNews, 'category' | 'priority' | 'error'> & {
			category: string;
			priority: string;
		})[]
	> {
		const query = this.db
			.selectFrom(['d_news as n', 'm_category as c', 'm_priority as p'])
			.select([
				'n.random_id as random_id',
				'n.url as url',
				'n.title as title',
				'c.name as category',
				'p.name as priority',
				'n.browser as browser',
				'n.selector_wrap as selector_wrap',
				'n.selector_date as selector_date',
				'n.selector_content as selector_content',
			])
			.whereRef('n.category', '=', 'c.fk')
			.whereRef('n.priority', '=', 'p.fk')
			.orderBy('c.sort')
			.orderBy('n.title');

		const rows = await query.execute();

		return rows.map((row) => ({
			random_id: sqliteToJS(row.random_id),
			url: sqliteToJS(row.url, 'url'),
			title: sqliteToJS(row.title),
			category: sqliteToJS(row.category),
			priority: sqliteToJS(row.priority),
			browser: sqliteToJS(row.browser, 'boolean'),
			selector_wrap: sqliteToJS(row.selector_wrap),
			selector_date: sqliteToJS(row.selector_date),
			selector_content: sqliteToJS(row.selector_content),
		}));
	}

	/**
	 * 巡回ページデータを登録する
	 *
	 * @param data - 登録データ
	 */
	async insert(data: Readonly<Insertable<Omit<DNews, 'random_id' | 'error'>>>): Promise<void> {
		let query = this.db.insertInto('d_news');
		// @ts-expect-error: ts(2345) 将来的に INSERT 文に DEFAULT 値が扱えるようになれば解消可能
		query = query.values({
			url: jsToSQLiteAssignment(data.url),
			title: jsToSQLiteAssignment(data.title),
			category: jsToSQLiteAssignment(data.category),
			priority: jsToSQLiteAssignment(data.priority),
			browser: jsToSQLiteAssignment(data.browser),
			selector_wrap: jsToSQLiteAssignment(data.selector_wrap),
			selector_date: jsToSQLiteAssignment(data.selector_date),
			selector_content: jsToSQLiteAssignment(data.selector_content),
			error: jsToSQLiteAssignment(0),
		});

		await query.executeTakeFirst();
	}

	/**
	 * 巡回ページデータを更新する
	 *
	 * @param data - 更新データ
	 * @param baseUrl - 元 URL
	 */
	async update(data: Readonly<Omit<DNews, 'random_id' | 'error'>>, baseUrl: string): Promise<void> {
		const query = this.db
			.updateTable('d_news')
			.set({
				url: jsToSQLiteAssignment(data.url),
				title: jsToSQLiteAssignment(data.title),
				category: jsToSQLiteAssignment(data.category),
				priority: jsToSQLiteAssignment(data.priority),
				browser: jsToSQLiteAssignment(data.browser),
				selector_wrap: jsToSQLiteAssignment(data.selector_wrap),
				selector_date: jsToSQLiteAssignment(data.selector_date),
				selector_content: jsToSQLiteAssignment(data.selector_content),
			})
			.where('url', '=', jsToSQLiteComparison(baseUrl));

		query.compile();

		await query.executeTakeFirst();
	}

	/**
	 * 巡回ページデータを削除する
	 *
	 * @param id - 削除対象のニュース ID
	 */
	async delete(id: string): Promise<void> {
		const queryNews = this.db.deleteFrom('d_news').where('random_id', '=', jsToSQLiteComparison(id));
		const queryNewsData = this.db.deleteFrom('d_news_data').where('news_id', '=', jsToSQLiteComparison(id));

		await queryNewsData.execute();
		await queryNews.executeTakeFirst(); // FOREIGN KEY の関係で d_news_data より後に削除する必要がある
	}

	/**
	 * 修正する巡回ページデータを取得する
	 *
	 * @param id - 対象データのニュース ID
	 *
	 * @returns 巡回情報データ
	 */
	async getReviseData(id: string): Promise<Omit<DNews, 'random_id' | 'error'> | undefined> {
		const query = this.db
			.selectFrom('d_news')
			.select(['url', 'title', 'category', 'priority', 'browser', 'selector_wrap', 'selector_date', 'selector_content'])
			.where('random_id', '=', jsToSQLiteComparison(id));

		const row = await query.executeTakeFirst();
		if (row === undefined) {
			return undefined;
		}

		return {
			url: sqliteToJS(row.url, 'url'),
			title: sqliteToJS(row.title),
			category: sqliteToJS(row.category),
			priority: sqliteToJS(row.priority),
			browser: sqliteToJS(row.browser, 'boolean'),
			selector_wrap: sqliteToJS(row.selector_wrap),
			selector_date: sqliteToJS(row.selector_date),
			selector_content: sqliteToJS(row.selector_content),
		};
	}
}
