import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';

/**
 * 久米田康治 Twitter
 */
export default class KumetaTwitterDao {
	#dbh: sqlite.Database<sqlite3.Database, sqlite3.Statement> | null = null;

	readonly #filepath: string;

	/**
	 * @param {string} filepath - DB ファイルパス
	 * @param {sqlite.Database} dbh - DB 接続情報
	 */
	constructor(filepath: string, dbh?: sqlite.Database<sqlite3.Database, sqlite3.Statement>) {
		this.#filepath = filepath;

		if (dbh !== undefined) {
			this.#dbh = dbh;
		}
	}

	/**
	 * DB 接続情報を取得する
	 *
	 * @returns {sqlite.Database} DB 接続情報
	 */
	async getDbh(): Promise<sqlite.Database<sqlite3.Database, sqlite3.Statement>> {
		if (this.#dbh !== null) {
			return this.#dbh;
		}

		const dbh = await sqlite.open({
			filename: this.#filepath,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * Twitter アカウント情報を取得
	 *
	 * @param {string} id - Twitter ID
	 *
	 * @returns {object} Twitter アカウント情報
	 */
	async getAccountData(id: string): Promise<KumetaTwitterView.Account | null> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				account,
				name,
				location,
				description,
				url,
				created
			FROM
				d_user
			WHERE
				id = :id
		`);
		await sth.bind({
			':id': id,
		});

		const row = await sth.get();
		await sth.finalize();

		if (row === undefined) {
			return null;
		}

		return {
			account: row.account,
			name: row.name,
			location: row.location,
			description: row.description,
			url: row.url,
			created: dayjs.unix(row.created),
		};
	}

	/**
	 * アイコン履歴情報を取得
	 *
	 * @param {string} id - Twitter ID
	 *
	 * @returns {object[]} アイコン履歴情報
	 */
	async getProfileImages(id: string): Promise<KumetaTwitterView.ProfileImage[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				i.file_name AS file_name,
				i.regist_date AS regist_date
			FROM
				d_user u,
				d_profileimage i
			WHERE
				u.id = :id AND
				u.id = i.id
			ORDER BY
				i.regist_date DESC
		`);
		await sth.bind({
			':id': id,
		});

		const rows = await sth.all();
		await sth.finalize();

		const profileImages: KumetaTwitterView.ProfileImage[] = [];
		for (const row of rows) {
			profileImages.push({
				regist_date: dayjs.unix(row.regist_date),
				file_name: row.file_name,
			});
		}

		return profileImages;
	}

	/**
	 * バナー履歴情報を取得
	 *
	 * @param {string} id - Twitter ID
	 *
	 * @returns {object[]} バナー履歴情報
	 */
	async getBanners(id: string): Promise<KumetaTwitterView.Banner[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				b.file_name AS file_name,
				b.regist_date AS regist_date
			FROM
				d_user u,
				d_banner b
			WHERE
				u.id = :id AND
				u.id = b.id
			ORDER BY
				b.regist_date DESC
		`);
		await sth.bind({
			':id': id,
		});

		const rows = await sth.all();
		await sth.finalize();

		const banner: KumetaTwitterView.Banner[] = [];
		for (const row of rows) {
			banner.push({
				regist_date: dayjs.unix(row.regist_date),
				file_name: row.file_name,
			});
		}

		return banner;
	}
}
