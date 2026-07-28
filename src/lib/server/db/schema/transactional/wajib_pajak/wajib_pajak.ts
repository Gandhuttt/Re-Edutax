import { sqliteTable, text, } from "drizzle-orm/sqlite-core";

export const wajib_pajak = sqliteTable('wajib_pajak', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    npwp: text('npwp').unique().notNull(),
    nama: text('nama').notNull().notNull(),
    email: text('email').notNull(),
    nomor_telepon: text('nomor_telepon'),
});
