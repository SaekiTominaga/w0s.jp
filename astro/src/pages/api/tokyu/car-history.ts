import type { APIRoute } from 'astro';
import dayjs from 'dayjs';
import { env } from '@w0s/env-value-type';
import TokyuCarHistoryDao from '@db/TokyuCarHistory.js';

interface Car {
	number: string;
	sign: string;
	series: string;
	type: string;
	annual: string | undefined;
	register: string;
	changes: {
		number: string;
		sign: string;
		date: string;
	}[];
	renewal: string | undefined;
	age: number;
	scrap: boolean;
	transfer: string | undefined;
}

export type ResponseJson = Car[][];

export const prerender = false;

/**
 * 日付データを表示用に整形する
 *
 * @param date - 日付データ
 * @param era - 表示フォーマット
 *
 * @returns 整形後の日付データ
 */
const dateFormat = (date: Date, era: string | undefined): string => {
	switch (era) {
		case 'ja':
			return date.toLocaleDateString('ja-JP-u-ca-japanese', { dateStyle: 'short' }).replaceAll('/', '.');
		default:
	}

	return dayjs(date).format('YYYY-MM-DD');
};

export const GET = (async ({ locals }) => {
	const requestParamNumber = locals.requestParams.get('num');
	const requestParamNumberOld = Boolean(locals.requestParams.get('old'));
	const requestParamSeries = locals.requestParams.getAll('series');
	const requestParamRegistStart = locals.requestParams.get('regist-start') ?? undefined;
	const requestParamRegistEnd = locals.requestParams.get('regist-end') ?? undefined;
	const requestParamSort = locals.requestParams.get('sort') ?? undefined;
	const requestParamEra = locals.requestParams.get('era') ?? undefined;

	const dao = new TokyuCarHistoryDao(`${env('ROOT')}/${env('SQLITE_DIR')}/${env('SQLITE_TOKYU_CAR_HISTORY')}`);

	const carsDto = await dao.getCarData(
		requestParamNumber?.replaceAll('.', '_').replaceAll('*', '%'),
		requestParamNumberOld,
		requestParamSeries.length === 0 ? (await dao.getCarSeries()).map((data) => data.id) : requestParamSeries, // 車種未指定時は全車種を対象とする
		requestParamRegistStart,
		requestParamRegistEnd,
		requestParamSort,
	);

	const cars: Car[][] = [];

	carsDto.forEach((carDto, index) => {
		const car = {
			number: carDto.number,
			sign: carDto.sign,
			series: carDto.series,
			type: carDto.type,
			annual: carDto.annual,
			register: dateFormat(carDto.register, requestParamEra),
			changes:
				carDto.change?.map((change) => ({
					number: change.number,
					sign: change.sign,
					date: dateFormat(change.date, requestParamEra),
				})) ?? [],
			renewal: carDto.renewal,
			age: dayjs().diff(dayjs(carDto.register), 'y'), // https://day.js.org/docs/en/display/difference
			scrap: carDto.scrap,
			transfer: carDto.transfer,
		};

		if (index === 0 || carDto.series !== carsDto.at(index - 1)?.series) {
			cars.push([car]);
		} else {
			cars.at(-1)?.push(car);
		}
	});

	return new Response(JSON.stringify(cars satisfies ResponseJson), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}) satisfies APIRoute;
