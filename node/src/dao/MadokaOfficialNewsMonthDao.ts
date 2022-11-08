import dayjs, { Dayjs } from 'dayjs';
import DbUtil from '../util/DbUtil.js';
import MadokaOfficialNewsDao from './MadokaOfficialNewsDao.js';

/**
 * まどか☆マギカ・公式サイトニュース 月ごとのページ
 */
export default class MadokaOfficialNewsMonthDao extends MadokaOfficialNewsDao {
	/**
	 * 指定された月のニュース記事（劇場版）を取得
	 *
	 * @param {Dayjs} month - 対象月
	 *
	 * @returns {object[]} 指定された月のニュース記事
	 */
	async getNewsListMovie(month: Dayjs): Promise<MadokaOfficialNewsView.NewsMovie[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				d.id AS id,
				d.date AS date,
				d.title AS title,
				d.message AS message,
				(SELECT GROUP_CONCAT(i.filename, " ") FROM d_madoka_image i WHERE d.id = i.news_id) AS image_file_name
			FROM
				d_madoka d
			WHERE
				d.month = :month
			ORDER BY
				d.date DESC,
				d.id DESC
		`);
		await sth.bind({
			':month': DbUtil.dayjsToUnix(month),
		});

		const rows = await sth.all();
		await sth.finalize();

		const newsList: MadokaOfficialNewsView.NewsMovie[] = [];
		for (const row of rows) {
			newsList.push({
				id: row.id,
				date: DbUtil.unixToDayjs(row.date),
				title: row.title,
				message: row.message,
				image_file_name: row.image_file_name !== null ? row.image_file_name.split(' ') : [],
			});
		}

		return newsList;
	}

	/**
	 * 指定された月のニュース記事（TVシリーズ）を取得
	 *
	 * @param {Dayjs} month - 対象月
	 *
	 * @returns {object[]} 指定された月のニュース記事
	 */
	async getNewsListTv(month: Dayjs): Promise<MadokaOfficialNewsView.NewsTv[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				d.id AS id,
				d.date AS date,
				d.title AS title,
				d.description AS description,
				(SELECT GROUP_CONCAT(i.filename, " ") FROM d_madoka_tv_image i WHERE d.id = i.news_id) AS image_file_name
			FROM
				d_madoka_tv d
			WHERE
				d.month = :month
			ORDER BY
				d.date DESC,
				d.id DESC
		`);
		await sth.bind({
			':month': DbUtil.dayjsToUnix(month),
		});

		const rows = await sth.all();
		await sth.finalize();

		const newsList: MadokaOfficialNewsView.NewsTv[] = [];
		for (const row of rows) {
			newsList.push({
				id: row.id,
				date: DbUtil.unixToDayjs(row.date),
				title: row.title,
				description: row.description,
				image_file_name: row.image_file_name !== null ? row.image_file_name.split(' ') : [],
			});
		}

		return newsList;
	}

	/**
	 * 前のニュース記事がある月を取得
	 *
	 * @param {Dayjs} month - 対象月
	 *
	 * @returns {Dayjs | null} 前のニュース記事がある月（最古月の場合は null）
	 */
	async getPrevMonthDate(month: Dayjs): Promise<Dayjs | null> {
		const dbh = await this.getDbh();

		const sthMovie = await dbh.prepare(`
			SELECT
				month
			FROM
				d_madoka
			WHERE
				month < :month
			ORDER BY
				month DESC
			LIMIT 1
		`);
		await sthMovie.bind({
			':month': DbUtil.dayjsToUnix(month),
		});

		const rowMovie = await sthMovie.get();
		await sthMovie.finalize();

		if (rowMovie !== undefined) {
			return dayjs.unix(rowMovie.month);
		}

		const sthTv = await dbh.prepare(`
			SELECT
				month
			FROM
				d_madoka_tv
			WHERE
				month < :month
			ORDER BY
				month DESC
			LIMIT 1
		`);
		await sthTv.bind({
			':month': DbUtil.dayjsToUnix(month),
		});
		const rowTv = await sthTv.get();
		await sthTv.finalize();

		if (rowTv !== undefined) {
			return dayjs.unix(rowTv.month);
		}

		return null;
	}

	/**
	 * 次のニュース記事がある月を取得
	 *
	 * @param {Dayjs} month - 対象月
	 *
	 * @returns {Dayjs | null} 次のニュース記事がある月（最古月の場合は null）
	 */
	async getNextMonthDate(month: Dayjs): Promise<Dayjs | null> {
		const dbh = await this.getDbh();

		const sthTv = await dbh.prepare(`
			SELECT
				month
			FROM
				d_madoka_tv
			WHERE
				month > :month
			ORDER BY
				month
			LIMIT 1
		`);
		await sthTv.bind({
			':month': DbUtil.dayjsToUnix(month),
		});

		const rowTv = await sthTv.get();
		await sthTv.finalize();

		if (rowTv !== undefined) {
			return dayjs.unix(rowTv.month);
		}

		const sthMovie = await dbh.prepare(`
			SELECT
				month
			FROM
				d_madoka
			WHERE
				month > :month
			ORDER BY
				month
			LIMIT 1
		`);
		await sthMovie.bind({
			':month': DbUtil.dayjsToUnix(month),
		});
		const rowMovie = await sthMovie.get();
		await sthMovie.finalize();

		if (rowMovie !== undefined) {
			return dayjs.unix(rowMovie.month);
		}

		return null;
	}
}
