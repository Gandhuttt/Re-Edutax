import { customType } from 'drizzle-orm/sqlite-core';
import * as v from 'valibot';

export function valibotJson<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
	name: string,
	schema: TSchema
) {
	return customType<{
		data: v.InferOutput<TSchema>;
		driverData: string;
		notNull: false;
		default: false;
	}>({
		dataType() {
			return 'text';
		},
		toDriver(value) {
			return JSON.stringify(v.parse(schema, value));
		},
		fromDriver(value) {
			return v.parse(schema, JSON.parse(value));
		}
	})(name);
}
