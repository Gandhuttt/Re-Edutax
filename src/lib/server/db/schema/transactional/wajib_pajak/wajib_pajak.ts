import { sqliteTable, text, } from "drizzle-orm/sqlite-core";
import { batch_peserta } from "./batch_peserta";

export const wajib_pajak = sqliteTable('wajib_pajak', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    npwp: text('npwp').unique().notNull(),
    nama: text('nama').notNull().notNull(),
    email: text('email').notNull(),
    nomor_telepon: text('nomor_telepon'),
    // Null for peserta created outside a cohort (and for the demo badan accounts).
    batchId: text('batch_id').references(() => batch_peserta.id),
});
