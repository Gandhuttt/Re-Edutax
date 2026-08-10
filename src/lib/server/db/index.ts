import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { BatchItem } from 'drizzle-orm/batch';
import { getRequestEvent } from '$app/server';
import * as schema from './schema';

type Schema = typeof schema;

const instances = new WeakMap<D1Database, DrizzleD1Database<Schema>>();

function resolveDb(): DrizzleD1Database<Schema> {
	const { platform } = getRequestEvent();
	const d1 = platform?.env.DB;

	if (!d1) throw new Error('D1 binding "DB" is not available on platform.env');

	let instance = instances.get(d1);
	if (!instance) {
		instance = drizzle(d1, { schema });
		instances.set(d1, instance);
	}
	return instance;
}

export const db: DrizzleD1Database<Schema> = new Proxy({} as DrizzleD1Database<Schema>, {
	get(_target, prop, _receiver) {
		const instance = resolveDb();
		const value = Reflect.get(instance, prop, instance);
		return typeof value === 'function' ? value.bind(instance) : value;
	}
});

/**
 * D1 has no real multi-statement transaction over the Workers binding — only db.batch(),
 * which requires every statement to be built upfront (no reading results back mid-batch).
 * Lampiran save helpers build and return these instead of awaiting them directly.
 */
export type Statement = BatchItem<'sqlite'>;
