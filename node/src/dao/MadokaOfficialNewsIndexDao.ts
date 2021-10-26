import DbUtil from '../util/DbUtil.js';
import MadokaOfficialNewsDao from './MadokaOfficialNewsDao.js';
import { Dayjs } from 'dayjs';

interface News {
	id: string;
	date: Dayjs | null;
	title: string;
}

/**
 * まどか☆マギカ・公式サイトニュース index ページ
 */
export default class MadokaOfficialNewsIndexDao extends MadokaOfficialNewsDao {
	/**
	 * ニュース記事一覧（劇場版）を取得
	 *
	 * @returns {News[]} ニュース記事一覧
	 */
	async getNewsListMovie(): Promise<News[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				id,
				date,
				title
			FROM
				d_madoka
			ORDER BY
				date DESC,
				id DESC
		`);

		const rows = await sth.all();
		await sth.finalize();

		const newsList: News[] = [];
		for (const row of rows) {
			newsList.push({
				id: row.id,
				date: DbUtil.unixToDayjs(row.date),
				title: row.title,
			});
		}

		return newsList;
	}

	/**
	 * ニュース記事一覧（TVシリーズ）を取得
	 *
	 * @returns {News[]} ニュース記事一覧
	 */
	async getNewsListTv(): Promise<News[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				id,
				date,
				title
			FROM
				d_madoka_tv
			ORDER BY
				date DESC,
				id DESC
		`);

		const rows = await sth.all();
		await sth.finalize();

		const newsList: News[] = [];
		for (const row of rows) {
			newsList.push({
				id: row.id,
				date: DbUtil.unixToDayjs(row.date),
				title: row.title,
			});
		}

		return newsList;
	}
}
