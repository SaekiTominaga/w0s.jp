import CrawlerDao from './CrawlerDao.js';
import dayjs, { Dayjs } from 'dayjs';

interface NewsData {
	id: string;
	date: Dayjs | null;
	content: string;
	refer_url: string | null;
}

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDataDao extends CrawlerDao {
	/**
	 * 新着データを取得する
	 *
	 * @param {string} url - 対象データの URL
	 *
	 * @returns {NewsData[]} 新着データ
	 */
	public async getNewsDataList(url: string): Promise<NewsData[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				uuid,
				date,
				content,
				refer_url
			FROM
				d_news_data
			WHERE
				url = :url
			ORDER BY
				date DESC
		`);
		await sth.run({
			':url': url,
		});

		const rows = await sth.all();
		await sth.finalize();

		const newsData: NewsData[] = [];
		for (const row of rows) {
			newsData.push({
				id: row.uuid,
				date: row.date !== null ? dayjs.unix(row.date) : null,
				content: row.content,
				refer_url: row.refer_url,
			});
		}

		return newsData;
	}

	/**
	 * 新着データを削除する
	 *
	 * @param {string} id - 削除対象の ID
	 */
	async delete(id: string): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				DELETE FROM
					d_news_data
				WHERE
					uuid = :uuid
			`);
			await sth.run({
				':uuid': id,
			});
			await sth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}
}
