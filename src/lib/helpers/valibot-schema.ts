import * as v from 'valibot';

const digitsRegex = /^\d+$/;
const decimalRegex = /^\d+(?:\.\d+)?$/;

export function isRealIsoDate(value: string) {
	const date = new Date(`${value}T00:00:00.000Z`);

	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const requiredString = (message: string) => v.pipe(v.string(), v.nonEmpty(message));

export const digitsString = (field: string) =>
	v.pipe(v.string(), v.nonEmpty(`${field} harus diisi`), v.regex(digitsRegex, `${field} harus berupa angka`));

export const decimalString = (field: string) =>
	v.pipe(v.string(), v.nonEmpty(`${field} harus diisi`), v.regex(decimalRegex, `${field} harus berupa angka`));
