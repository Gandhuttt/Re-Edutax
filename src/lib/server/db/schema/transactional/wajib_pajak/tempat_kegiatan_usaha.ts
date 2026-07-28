import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { wajib_pajak } from "./wajib_pajak";

export const tempat_kegiatan_usaha = sqliteTable('tempat_kegiatan_usaha', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    nitku: text('nitku').unique().notNull(),
    wajib_pajak: text('wajib_pajak').references(
        () => wajib_pajak.id).notNull(),

    nama: text('nama').notNull(),

    email: text('email'),
    nomor_telepon: text('nomor_telepon'),
    alamat: text('alamat'),
    kode_pos: text('kode_pos')
}, (t) => [unique().on(t.wajib_pajak, t.nitku)]);