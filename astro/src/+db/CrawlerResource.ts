import { jsToSQLiteAssignment, jsToSQLiteComparison, sqliteToJS } from '@w0s/sqlite-utility';
import type { Insertable } from 'kysely';
import type { DResource } from '../../../@types/db_crawler';
import DatabaseCrawler from './DatabaseCrawler.ts';

/**
 * ウェブ巡回（リソース）
 */
export default class CrawlerResourceDao extends DatabaseCrawler {
	/**
	 * 巡回ページデータを取得する
	 *
	 * @returns 巡回ページデータ
	 */
	async getResourcePageList(): Promise<
		(Omit<DResource, 'category' | 'priority'> & {
			category: string;
			priority: string;
		})[]
	> {
		const query = this.db
			.selectFrom(['d_resource as r', 'm_category as c', 'm_priority as p'])
			.select([
				'r.url as url',
				'r.error as error',
				'r.title as title',
				'c.name as category',
				'p.name as priority',
				'r.browser as browser',
				'r.selector as selector',
				'r.content_hash as content_hash',
			])
			.whereRef('r.category', '=', 'c.fk')
			.whereRef('r.priority', '=', 'p.fk')
			.orderBy('c.sort')
			.orderBy('r.title');

		const rows = await query.execute();

		return rows.map((row) => ({
			url: sqliteToJS(row.url, 'url'),
			title: sqliteToJS(row.title),
			category: sqliteToJS(row.category),
			priority: sqliteToJS(row.priority),
			browser: sqliteToJS(row.browser, 'boolean'),
			selector: sqliteToJS(row.selector),
			content_hash: sqliteToJS(row.content_hash),
			error: sqliteToJS(row.error),
		}));
	}

	/**
	 * 巡回ページデータを登録する
	 *
	 * @param data - 登録データ
	 */
	async insert(data: Readonly<Insertable<Omit<DResource, 'content_hash' | 'error'>>>): Promise<void> {
		let query = this.db.insertInto('d_resource');
		query = query.values({
			url: jsToSQLiteAssignment(data.url),
			title: jsToSQLiteAssignment(data.title),
			category: jsToSQLiteAssignment(data.category),
			priority: jsToSQLiteAssignment(data.priority),
			browser: jsToSQLiteAssignment(data.browser),
			selector: jsToSQLiteAssignment(data.selector),
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
	async update(data: Readonly<Omit<DResource, 'content_hash' | 'error'>>, baseUrl: string): Promise<void> {
		const query = this.db
			.updateTable('d_resource')
			.set({
				url: jsToSQLiteAssignment(data.url),
				title: jsToSQLiteAssignment(data.title),
				category: jsToSQLiteAssignment(data.category),
				priority: jsToSQLiteAssignment(data.priority),
				browser: jsToSQLiteAssignment(data.browser),
				selector: jsToSQLiteAssignment(data.selector),
			})
			.where('url', '=', jsToSQLiteComparison(baseUrl));

		await query.executeTakeFirst();
	}

	/**
	 * 巡回ページデータを削除する
	 *
	 * @param url - 削除対象の URL
	 */
	async delete(url: string): Promise<void> {
		const query = this.db.deleteFrom('d_resource').where('url', '=', jsToSQLiteComparison(url));

		await query.executeTakeFirst();
	}

	/**
	 * 修正する巡回ページデータを取得する
	 *
	 * @param url - 対象データの URL
	 *
	 * @returns 巡回情報データ
	 */
	async getReviseData(url: string): Promise<Omit<DResource, 'content_hash' | 'error'> | undefined> {
		const query = this.db
			.selectFrom('d_resource')
			.select(['title', 'category', 'priority', 'browser', 'selector'])
			.where('url', '=', jsToSQLiteComparison(url));

		const row = await query.executeTakeFirst();
		if (row === undefined) {
			return undefined;
		}

		return {
			url: sqliteToJS(url, 'url'),
			title: sqliteToJS(row.title),
			category: sqliteToJS(row.category),
			priority: sqliteToJS(row.priority),
			browser: sqliteToJS(row.browser, 'boolean'),
			selector: sqliteToJS(row.selector),
		};
	}
}
