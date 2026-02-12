import { loadEnvFile } from 'node:process';
import type { APIRoute } from 'astro';
import dayjs from 'dayjs';
import { env } from '@w0s/env-value-type';
import TokyuCarHistoryDao from '@db/TokyuCarHistory.js';
import { getParams as getRequestParams } from '@util/request.ts';

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
	renewal: string;
	age: number;
	scrap: boolean;
	transfer: string | undefined;
}

export type ResponseJson = Car[][];

export const prerender = false;

loadEnvFile(!import.meta.env.DEV ? '../.env.production' : '../.env.development');

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

export const GET = (async ({ request }) => {
	const requestParams = getRequestParams(new URL(request.url));

	const requestParamNumber = requestParams.get('number');
	const requestParamNumberOld = Boolean(requestParams.get('number-old'));
	const requestParamSeries = requestParams.getAll('series');
	const requestParamRegisterStart = requestParams.get('register-start') ?? undefined;
	const requestParamRegisterEnd = requestParams.get('register-end') ?? undefined;
	const requestParamSort = requestParams.get('sort') ?? undefined;
	const requestParamEra = requestParams.get('era') ?? undefined;

	const dao = new TokyuCarHistoryDao(`${env('ROOT')}/${env('SQLITE_DIR')}/${env('SQLITE_TOKYU_CAR_HISTORY')}`);

	const carsDto = await dao.getCarData(
		requestParamNumber?.replaceAll('.', '_').replaceAll('*', '%'),
		requestParamNumberOld,
		requestParamSeries,
		requestParamRegisterStart,
		requestParamRegisterEnd,
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
