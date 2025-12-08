import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { sqliteToJS } from '@w0s/sqlite-utility';
import type { DB, MCategory, MPriority } from '../../../@types/db_crawler.ts';

/**
 * ウェブ巡回
 */
export default class CrawlerDao {
	protected readonly db: Kysely<DB>;

	/**
	 * @param filePath - DB ファイルパス
	 * @param options - オプション
	 */
	constructor(filePath: string, options?: Readonly<Pick<SQLite.Options, 'readonly'>>) {
		const sqlite = new SQLite(filePath, {
			/* https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options */
			readonly: options?.readonly ?? false,
			fileMustExist: true,
		});
		sqlite.pragma('journal_mode = WAL');

		this.db = new Kysely<DB>({
			dialect: new SqliteDialect({
				database: sqlite,
			}),
		});
	}

	/**
	 * カテゴリー情報を取得
	 *
	 * @returns カテゴリー情報
	 */
	async getCategoryMaster(): Promise<Pick<MCategory, 'fk' | 'name'>[]> {
		const query = this.db.selectFrom('m_category').select(['fk', 'name']).orderBy('sort');

		const rows = await query.execute();

		return rows.map((row) => ({
			fk: sqliteToJS(row.fk),
			name: sqliteToJS(row.name),
		}));
	}

	/**
	 * 優先度情報を取得
	 *
	 * @returns 優先度情報
	 */
	async getPriorityMaster(): Promise<MPriority[]> {
		const query = this.db.selectFrom('m_priority').select(['fk', 'name']).orderBy('fk');

		const rows = await query.execute();

		return rows.map((row) => ({
			fk: sqliteToJS(row.fk),
			name: sqliteToJS(row.name),
		}));
	}
}
