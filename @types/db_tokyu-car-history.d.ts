import type { Generated } from 'kysely';

type TypeTransform<T> = T extends boolean ? 0 | 1 : T extends Date ? number : T extends URL ? string : T;
type NullTransform<T> = Exclude<T, undefined> | (undefined extends T ? null : never);
type Transform<T> = TypeTransform<NullTransform<T>>;

export interface DCar {
	num: string;
	type: string;
	annual: number;
	annual_display: string | undefined;
	register_date: string; // YYYY-MM-DD
	renewal: number | undefined;
	scrap: boolean;
	transfer: string | undefined;
	note: string | undefined;
}

export interface DChange {
	now_num: string;
	before_num: string;
	before_type: string;
	change_date: string; // YYYY-MM-DD
}

export interface MRenewal {
	fk: number;
	name: string;
}

export interface MSeries {
	fk: string;
	name: string;
	display: number;
	display_cargroup: number;
	first_manufacture: number; // YYYY
	company: number;
	retire: number;
}

export interface MSign {
	fk: string;
	name: string;
	sort: number;
}

export interface MType {
	fk: string;
	name: string;
	sign: string;
	series: string;
}

export interface VAnnual {
	num: string | undefined;
	annual: string | undefined;
}

export interface DB {
	d_car: { [K in keyof DCar]: Transform<DCar[K]> };
	d_change: { [K in keyof DChange]: Transform<DChange[K]> };
	m_renewal: { [K in keyof MRenewal]: Transform<MRenewal[K]> };
	m_series: { [K in keyof MSeries]: Transform<MSeries[K]> };
	m_sign: { [K in keyof MSign]: Transform<MSign[K]> };
	m_type: { [K in keyof MType]: Transform<MType[K]> };
	v_annual: { [K in keyof VAnnual]: Transform<VAnnual[K]> };
}
