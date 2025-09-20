import { sqliteToJS, prepareSelect, prepareDelete } from '@w0s/sqlite-utility';
import CrawlerDao from '@dao/CrawlerDao.js';

interface NewsData {
	id: string;
	date: Date | undefined;
	content: string;
	referUrl: string | undefined;
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

		const { sqlWhere, bindParams } = prepareSelect({
			url: url,
		});

		const sth = await dbh.prepare(`
			SELECT
				uuid,
				date,
				content,
				refer_url
			FROM
				d_news_data
			WHERE
				${sqlWhere}
			ORDER BY
				date DESC
		`);
		await sth.run(bindParams);

		const rows = await sth.all<Select[]>();
		await sth.finalize();

		const newsData: NewsData[] = [];
		for (const row of rows) {
			newsData.push({
				id: sqliteToJS(row.uuid),
				date: sqliteToJS(row.date, 'date'),
				content: sqliteToJS(row.content),
				referUrl: sqliteToJS(row.refer_url),
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
			const { sqlWhere, bindParams } = prepareDelete({
				uuid: id,
			});

			const sth = await dbh.prepare(`
				DELETE FROM
					d_news_data
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
}
