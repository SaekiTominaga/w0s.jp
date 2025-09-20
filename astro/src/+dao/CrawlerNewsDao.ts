import { sqliteToJS, prepareSelect, prepareInsert, prepareUpdate, prepareDelete } from '@w0s/sqlite-utility';
import CrawlerDao from '@dao/CrawlerDao.js';

interface NewsPage {
	url: string;
	title: string;
	category: string;
	priority: string;
	browser: boolean;
	selectorWrap: string;
	selectorDate: string | undefined;
	selectorContent: string | undefined;
}

interface ReviseData {
	url: string;
	title: string;
	category: number;
	priority: number;
	browser: boolean;
	selectorWrap: string;
	selectorDate: string | undefined;
	selectorVontent: string | undefined;
}

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDao extends CrawlerDao {
	/**
	 * 巡回ページデータを取得する
	 *
	 * @returns 巡回ページデータ
	 */
	async getNewsPageList(): Promise<NewsPage[]> {
		interface Select {
			url: string;
			title: string;
			category: string;
			priority: string;
			browser: number;
			selector_wrap: string;
			selector_date: string | null;
			selector_content: string | null;
		}

		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				n.url AS url,
				n.title AS title,
				c.name AS category,
				p.name AS priority,
				n.browser AS browser,
				n.selector_wrap AS selector_wrap,
				n.selector_date AS selector_date,
				n.selector_content AS selector_content
			FROM
				d_news n,
				m_category c,
				m_priority p
			WHERE
				n.category = c.fk AND
				n.priority = p.fk
			ORDER BY
				c.sort,
				n.title
		`);

		const rows = await sth.all<Select[]>();
		await sth.finalize();

		const newsPage: NewsPage[] = [];
		for (const row of rows) {
			newsPage.push({
				url: sqliteToJS(row.url),
				title: sqliteToJS(row.title),
				category: sqliteToJS(row.category),
				priority: sqliteToJS(row.priority),
				browser: sqliteToJS(row.browser, 'boolean'),
				selectorWrap: sqliteToJS(row.selector_wrap),
				selectorDate: sqliteToJS(row.selector_date),
				selectorContent: sqliteToJS(row.selector_content),
			});
		}

		return newsPage;
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
	 * @param data.selectorWrap - セレクター文字列（包括要素）
	 * @param data.selectorDate - 包括要素からのセレクター文字列（日付）
	 * @param data.selectorContent - 包括要素からのセレクター文字列（内容）
	 */
	async insert(data: {
		url: string;
		title: string;
		category: number;
		priority: number;
		browser: boolean;
		selectorWrap: string;
		selectorDate: string | undefined;
		selectorContent: string | undefined;
	}): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const { sqlInto, sqlValues, bindParams } = prepareInsert({
				url: data.url,
				title: data.title,
				category: data.category,
				priority: data.priority,
				browser: data.browser,
				selector_wrap: data.selectorWrap,
				selector_date: data.selectorDate,
				selector_content: data.selectorContent,
			});

			const sth = await dbh.prepare(`
				INSERT INTO
					d_news
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
	 * @param data.selectorWrap - セレクター文字列（包括要素）
	 * @param data.selectorDate - 包括要素からのセレクター文字列（日付）
	 * @param data.selectorContent - 包括要素からのセレクター文字列（内容）
	 * @param data.baseUrl - 元 URL
	 */
	async update(data: {
		url: string;
		title: string;
		category: number;
		priority: number;
		browser: boolean;
		selectorWrap: string;
		selectorDate: string | undefined;
		selectorContent: string | undefined;
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
					selector_wrap: data.selectorWrap,
					selector_date: data.selectorDate,
					selector_content: data.selectorContent,
				},
				{
					url: data.baseUrl,
				},
			);

			const sth = await dbh.prepare(`
				UPDATE
					d_news
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

			const newsSth = await dbh.prepare(`
				DELETE FROM
					d_news
				WHERE
					${sqlWhere}
			`);
			await newsSth.run(bindParams);
			await newsSth.finalize();

			const { sqlWhere: sqlWhereData, bindParams: bindParamsData } = prepareDelete({
				url: url,
			});

			const newsDataSth = await dbh.prepare(`
				DELETE FROM
					d_news_data
				WHERE
					${sqlWhereData}
			`);
			await newsDataSth.run(bindParamsData);
			await newsDataSth.finalize();

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
			selector_wrap: string;
			selector_date: string | null;
			selector_content: string | null;
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
				selector_wrap,
				selector_date,
				selector_content
			FROM
				d_news
			WHERE
				${sqlWhere}
		`);
		await sth.bind(bindParams);

		const row = await sth.get<Select>();
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
			selectorWrap: sqliteToJS(row.selector_wrap),
			selectorDate: sqliteToJS(row.selector_date),
			selectorVontent: sqliteToJS(row.selector_content),
		};
	}
}
