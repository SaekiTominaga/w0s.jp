import { Dayjs } from 'dayjs';

declare namespace MadokaOfficialNewsMonthRequest {
	export interface PageQuery {
		month: Dayjs;
	}
}
