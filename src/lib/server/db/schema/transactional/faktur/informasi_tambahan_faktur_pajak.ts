import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { jenis_informasi_tambahan_faktur_pajak } from '../../references/faktur/jenis_informasi_tambahan_faktur_pajak';
import { faktur_pajak } from './faktur_pajak';

export const informasi_tambahan_faktur_pajak = sqliteTable(
	'informasi_tambahan_faktur_pajak',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),

		fakturPajakId: text('faktur_pajak_id')
			.notNull()
			.references(() => faktur_pajak.id, { onDelete: 'cascade' }),
		jenisInformasiTambahanId: text('jenis_informasi_tambahan_id')
			.notNull()
			.references(() => jenis_informasi_tambahan_faktur_pajak.id),
		dokumenPendukung: text('dokumen_pendukung')
	},
	(t) => [
		uniqueIndex('informasi_tambahan_faktur_pajak_faktur_unique').on(t.fakturPajakId)
	]
);
