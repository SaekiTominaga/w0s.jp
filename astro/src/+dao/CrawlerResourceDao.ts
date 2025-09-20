import { sqliteToJS, prepareSelect, prepareInsert, prepareUpdate, prepareDelete } from '@w0s/sqlite-utility';
import CrawlerDao from '@dao/CrawlerDao.js';

interface ResourcePage {
	url: string;
	title: string;
	category: string;
	priority: string;
	browser: boolean;
	selector: string | undefined;
	contentHash: string;
	error: boolean;
}

interface ReviseData {
	url: string;
	title: string;
	category: number;
	priority: number;
	browser: boolean;
	selector: string | undefined;
}

/**
 * ウェブ巡回（リソース）
 */
export default class CrawlerResourceDao extends CrawlerDao {
	/**
	 * 巡回ページデータを取得する
	 *
	 * @returns 巡回ページデータ
	 */
	async getResourcePageList(): Promise<ResourcePage[]> {
		interface Select {
			url: string;
			title: string;
			category: string;
			priority: string;
			browser: number;
			selector: string | null;
			content_hash: string;
			error: number;
		}

		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				r.url AS url,
				r.title AS title,
				c.name AS category,
				p.name AS priority,
				r.browser AS browser,
				r.selector AS selector,
				r.content_hash AS content_hash,
				r.error AS error
			FROM
				d_resource r,
				m_class c,
				m_priority p
			WHERE
				r.category = c.fk AND
				r.priority = p.fk
			ORDER BY
				c.sort,
				r.title
		`);

		const rows = await sth.all<Select[]>();
		await sth.finalize();

		const resourcePage: ResourcePage[] = [];
		for (const row of rows) {
			resourcePage.push({
				url: sqliteToJS(row.url),
				title: sqliteToJS(row.title),
				category: sqliteToJS(row.category),
				priority: sqliteToJS(row.priority),
				browser: sqliteToJS(row.browser, 'boolean'),
				selector: sqliteToJS(row.selector),
				contentHash: sqliteToJS(row.content_hash),
				error: sqliteToJS(row.error, 'boolean'),
			});
		}

		return resourcePage;
	}

	/**
	 * 巡回ページデータを登録する
	 *
	 * @param data - 登録データ
	 * @param data.url - URL
	 * @param data.title - タイトル
	 * @param data.category - カテゴリー
	 * @param data.priority - 優先度
	 * @param data.browser - ウェブブラウザでアクセスするか
	 * @param data.selector - セレクター文字列
	 */
	async insert(data: { url: string; title: string; category: number; priority: number; browser: boolean; selector: string | undefined }): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const { sqlInto, sqlValues, bindParams } = prepareInsert({
				url: data.url,
				title: data.title,
				category: data.category,
				priority: data.priority,
				browser: data.browser,
				selector: data.selector,
			});

			const sth = await dbh.prepare(`
				INSERT INTO
					d_resource
					${sqlInto}
				VALUES
					${sqlValues}
			`);
			await sth.run(bindParams);
			await sth.finalize();

			await dbh.exec('COMMIT');
		} catch (e) {
			await dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 巡回ページデータを更新する
	 *
	 * @param data - 更新データ
	 * @param data.url - URL
	 * @param data.title - タイトル
	 * @param data.category - カテゴリー
	 * @param data.priority - 優先度
	 * @param data.browser - ウェブブラウザでアクセスするか
	 * @param data.selector - セレクター文字列
	 * @param data.baseUrl - 元 URL
	 */
	async update(data: {
		url: string;
		title: string;
		category: number;
		priority: number;
		browser: boolean;
		selector: string | undefined;
		baseUrl: string;
	}): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const { sqlSet, sqlWhere, bindParams } = prepareUpdate(
				{
					url: data.url,
					title: data.title,
					category: data.category,
					priority: data.priority,
					browser: data.browser,
					selector: data.selector,
				},
				{
					url: data.baseUrl,
				},
			);

			const sth = await dbh.prepare(`
				UPDATE
					d_resource
				SET
					${sqlSet}
				WHERE
					${sqlWhere}
			`);
			await sth.run(bindParams);
			await sth.finalize();

			await dbh.exec('COMMIT');
		} catch (e) {
			await dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 巡回ページデータを削除する
	 *
	 * @param url - 削除対象の URL
	 */
	async delete(url: string): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const { sqlWhere, bindParams } = prepareDelete({
				url: url,
			});

			const sth = await dbh.prepare(`
				DELETE FROM
					d_resource
				WHERE
					${sqlWhere}
			`);
			await sth.run(bindParams);
			await sth.finalize();

			await dbh.exec('COMMIT');
		} catch (e) {
			await dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 修正する巡回ページデータを取得する
	 *
	 * @param url - 対象データの URL
	 *
	 * @returns 巡回情報データ
	 */
	async getReviseData(url: string): Promise<ReviseData | undefined> {
		interface Select {
			title: string;
			category: number;
			priority: number;
			browser: number;
			selector: string | null;
		}

		const dbh = await this.getDbh();

		const { sqlWhere, bindParams } = prepareSelect({
			url: url,
		});

		const sth = await dbh.prepare(`
			SELECT
				title,
				category,
				priority,
				browser,
				selector
			FROM
				d_resource
			WHERE
				${sqlWhere}
		`);
		await sth.bind(bindParams);

		const row: Select | undefined = await sth.get();
		await sth.finalize();

		if (row === undefined) {
			return undefined;
		}

		return {
			url: sqliteToJS(url),
			title: sqliteToJS(row.title),
			category: sqliteToJS(row.category),
			priority: sqliteToJS(row.priority),
			browser: sqliteToJS(row.browser, 'boolean'),
			selector: sqliteToJS(row.selector),
		};
	}
}
