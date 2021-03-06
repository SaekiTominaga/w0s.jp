import CrawlerDao from './CrawlerDao.js';
import dayjs, { Dayjs } from 'dayjs';
import DbUtil from '../util/DbUtil.js';

interface ResourcePage {
	url: string;
	title: string;
	category: string;
	priority: string;
	browser: boolean;
	selector: string | null;
	content_length: number;
	last_modified: Dayjs | null;
}

interface ReviseData {
	url: string;
	title: string;
	category: number;
	priority: number;
	browser: boolean;
	selector: string | null;
}

/**
 * ウェブ巡回（リソース）
 */
export default class CrawlerResourceDao extends CrawlerDao {
	/**
	 * 巡回ページデータを取得する
	 *
	 * @returns {ResourcePage[]} 巡回ページデータ
	 */
	public async getResourcePageList(): Promise<ResourcePage[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				r.url AS url,
				r.title AS title,
				c.name AS category,
				p.name AS priority,
				r.browser AS browser,
				r.selector AS selector,
				r.content_length AS content_length,
				r.last_modified AS last_modified
			FROM
				d_resource r,
				m_class c,
				m_priority p
			WHERE
				r.class = c.fk AND
				r.priority = p.fk
			ORDER BY
				c.sort,
				r.title
		`);

		const rows = await sth.all();
		await sth.finalize();

		const resourcePage: ResourcePage[] = [];
		for (const row of rows) {
			resourcePage.push({
				url: row.url,
				title: row.title,
				category: row.category,
				priority: row.priority,
				browser: Boolean(row.browser),
				selector: row.selector,
				content_length: row.content_length,
				last_modified: row.last_modified !== null ? dayjs.unix(row.last_modified) : null,
			});
		}

		return resourcePage;
	}

	/**
	 * 巡回ページデータを登録する
	 *
	 * @param {string} url - URL
	 * @param {string} title - タイトル
	 * @param {number} category - カテゴリー
	 * @param {number} priority - 優先度
	 * @param {boolean} browser - ウェブブラウザでアクセスするか
	 * @param {string} selector - セレクター文字列
	 */
	async insert(url: string, title: string, category: number, priority: number, browser: boolean, selector: string | null): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				INSERT INTO
					d_resource
					(url, title, class, priority, browser, selector)
				VALUES
					(:url, :title, :category, :priority, :browser, :selector)
			`);
			await sth.run({
				':url': url,
				':title': title,
				':category': category,
				':priority': priority,
				':browser': browser,
				':selector': DbUtil.emptyToNull(selector),
			});
			await sth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 巡回ページデータを更新する
	 *
	 * @param {string} url - URL
	 * @param {string} title - タイトル
	 * @param {number} category - カテゴリー
	 * @param {number} priority - 優先度
	 * @param {boolean} browser - ウェブブラウザでアクセスするか
	 * @param {string} selector - セレクター文字列
	 */
	async update(url: string, title: string, category: number, priority: number, browser: boolean, selector: string | null): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				UPDATE
					d_resource
				SET
					title = :title,
					class = :category,
					priority = :priority,
					browser = :browser,
					selector = :selector
				WHERE
					url = :url
			`);
			await sth.run({
				':title': title,
				':category': category,
				':priority': priority,
				':browser': browser,
				':selector': DbUtil.emptyToNull(selector),
				':url': url,
			});
			await sth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 巡回ページデータを削除する
	 *
	 * @param {string} url - 削除対象の URL
	 */
	async delete(url: string): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				DELETE FROM
					d_resource
				WHERE
					url = :url
			`);
			await sth.run({
				':url': url,
			});
			await sth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 修正する巡回ページデータを取得する
	 *
	 * @param {string} url - 対象データの URL
	 *
	 * @returns {ReviseData} 巡回情報データ
	 */
	public async getReviseData(url: string): Promise<ReviseData | null> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				title,
				class AS category,
				priority,
				browser,
				selector
			FROM
				d_resource
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
			selector: row.selector,
		};
	}
}
