import dayjs, { type Dayjs } from 'dayjs';
import CrawlerDao from '@dao/CrawlerDao.js';

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
	 * @param url - 対象データの URL
	 *
	 * @returns 新着データ
	 */
	async getNewsDataList(url: string): Promise<NewsData[]> {
		interface Select {
			uuid: string;
			date: number | null;
			content: string;
			refer_url: string | null;
		}

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

		const rows: Select[] = await sth.all();
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
	 * @param id - 削除対象の ID
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

			await dbh.exec('COMMIT');
		} catch (e) {
			await dbh.exec('ROLLBACK');
			throw e;
		}
	}
}
