import CrawlerDao from '@dao/CrawlerDao.js';
import DbUtil from '@util/Db.js';

interface NewsPage {
	url: string;
	title: string;
	category: string;
	priority: string;
	browser: boolean;
	selector_wrap: string;
	selector_date: string | null;
	selector_content: string | null;
}

interface ReviseData {
	url: string;
	title: string;
	category: number;
	priority: number;
	browser: boolean;
	selector_wrap: string;
	selector_date: string | null;
	selector_content: string | null;
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
				m_class c,
				m_priority p
			WHERE
				n.class = c.fk AND
				n.priority = p.fk
			ORDER BY
				c.sort,
				n.title
		`);

		const rows = await sth.all();
		await sth.finalize();

		const newsPage: NewsPage[] = [];
		for (const row of rows) {
			newsPage.push({
				url: row.url,
				title: row.title,
				category: row.category,
				priority: row.priority,
				browser: Boolean(row.browser),
				selector_wrap: row.selector_wrap,
				selector_date: row.selector_date,
				selector_content: row.selector_content,
			});
		}

		return newsPage;
	}

	/**
	 * 巡回ページデータを登録する
	 *
	 * @param url - URL
	 * @param title - タイトル
	 * @param category - カテゴリー
	 * @param priority - 優先度
	 * @param browser - ウェブブラウザでアクセスするか
	 * @param selectorWrap - セレクター文字列（包括要素）
	 * @param selectorDate - 包括要素からのセレクター文字列（日付）
	 * @param selectorContent - 包括要素からのセレクター文字列（内容）
	 */
	async insert(
		url: string,
		title: string,
		category: number,
		priority: number,
		browser: boolean,
		selectorWrap: string,
		selectorDate: string | null,
		selectorContent: string | null,
	): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				INSERT INTO
					d_news
					(url, title, class, priority, browser, selector_wrap, selector_date, selector_content)
				VALUES
					(:url, :title, :category, :priority, :browser, :selector_wrap, :selector_date, :selector_content)
			`);
			await sth.run({
				':url': url,
				':title': title,
				':category': category,
				':priority': priority,
				':browser': browser,
				':selector_wrap': selectorWrap,
				':selector_date': DbUtil.emptyToNull(selectorDate),
				':selector_content': DbUtil.emptyToNull(selectorContent),
			});
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
	 * @param url - URL
	 * @param title - タイトル
	 * @param category - カテゴリー
	 * @param priority - 優先度
	 * @param browser - ウェブブラウザでアクセスするか
	 * @param selectorWrap - セレクター文字列（包括要素）
	 * @param selectorDate - 包括要素からのセレクター文字列（日付）
	 * @param selectorContent - 包括要素からのセレクター文字列（内容）
	 */
	async update(
		url: string,
		title: string,
		category: number,
		priority: number,
		browser: boolean,
		selectorWrap: string,
		selectorDate: string | null,
		selectorContent: string | null,
	): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				UPDATE
					d_news
				SET
					title = :title,
					class = :category,
					priority = :priority,
					browser = :browser,
					selector_wrap = :selector_wrap,
					selector_date = :selector_date,
					selector_content = :selector_content
				WHERE
					url = :url
			`);
			await sth.run({
				':title': title,
				':category': category,
				':priority': priority,
				':browser': browser,
				':selector_wrap': selectorWrap,
				':selector_date': DbUtil.emptyToNull(selectorDate),
				':selector_content': DbUtil.emptyToNull(selectorContent),
				':url': url,
			});
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
			const newsSth = await dbh.prepare(`
				DELETE FROM
					d_news
				WHERE
					url = :url
			`);
			await newsSth.run({
				':url': url,
			});
			await newsSth.finalize();

			const newsDataSth = await dbh.prepare(`
				DELETE FROM
					d_news_data
				WHERE
					url = :url
			`);
			await newsDataSth.run({
				':url': url,
			});
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
	async getReviseData(url: string): Promise<ReviseData | null> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				title,
				class AS category,
				priority,
				browser,
				selector_wrap,
				selector_date,
				selector_content
			FROM
				d_news
			WHERE
				url = :url
		`);
		await sth.bind({
			':url': url,
		});

		const row = await sth.get();
		await sth.finalize();

		if (row === undefined) {
			return null;
		}

		return {
			url: url,
			title: row.title,
			category: row.category,
			priority: row.priority,
			browser: Boolean(row.browser),
			selector_wrap: row.selector_wrap,
			selector_date: row.selector_date,
			selector_content: row.selector_content,
		};
	}
}
