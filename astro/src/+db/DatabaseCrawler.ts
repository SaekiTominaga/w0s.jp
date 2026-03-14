import path from 'node:path';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect, type LogEvent } from 'kysely';
import type { Logger } from 'pino';
import { sqliteToJS } from '@w0s/sqlite-utility';
import type { DB, MCategory, MPriority } from '../../../@types/db_crawler.d.ts';
import { getLogger } from '../logger.ts';

/**
 * ウェブ巡回
 */
export default class CrawlerDao {
	readonly #logger: Logger;

	protected readonly db: Kysely<DB>;

	/**
	 * @param filePath - DB ファイルパス
	 * @param options - オプション
	 */
	constructor(filePath: string, options?: Readonly<Pick<SQLite.Options, 'readonly'>>) {
		this.#logger = getLogger(path.basename(filePath));

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
			log: (event: LogEvent) => {
				switch (event.level) {
					case 'error': {
						this.#logger.error(event.query.parameters, event.query.sql);
						break;
					}
					default: {
						this.#logger.info(event.query.parameters, event.query.sql);
					}
				}
			},
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
