import { booleanRadio, decimalInput, jsonRows, requiredString } from '$lib/helpers/valibot-schema';
import { db, type Statement } from '$lib/server/db';
import {
	jenis_transaksi_hubungan_istimewa_spt_pph_badan,
	spt_pph_badan_lampiran_10c_pernyataan,
	spt_pph_badan_lampiran_10c_transaksi
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getNegaraId } from '../../getNegaraId.server';

export const L10CSchema = v.object({
	l10c: jsonRows(
		v.object({
			namaMitraTransaksi: requiredString('Nama mitra transaksi'),
			jenisTransaksi: requiredString('Jenis transaksi'),
			negara: requiredString('Negara'),
			nilaiTransaksi: v.optional(decimalInput('Nilai transaksi'), 0)
		})
	),
	l10cDitentukanPrinsip: v.optional(booleanRadio(false), false)
});

type L10CInput = v.InferOutput<typeof L10CSchema>;

async function getJenisTransaksiId(kode: string) {
	const [row] = await db
		.select({ id: jenis_transaksi_hubungan_istimewa_spt_pph_badan.id })
		.from(jenis_transaksi_hubungan_istimewa_spt_pph_badan)
		.where(
			and(
				eq(jenis_transaksi_hubungan_istimewa_spt_pph_badan.kode, kode),
				eq(jenis_transaksi_hubungan_istimewa_spt_pph_badan.aktif, true)
			)
		)
		.limit(1);

	if (!row) {
		error(400, 'Jenis transaksi tidak valid');
	}

	return row.id;
}

export async function saveLampiranL10C(sptPphBadanId: string, input: L10CInput): Promise<Statement[]> {
	const statements: Statement[] = [
		db
			.delete(spt_pph_badan_lampiran_10c_transaksi)
			.where(eq(spt_pph_badan_lampiran_10c_transaksi.sptPphBadanId, sptPphBadanId))
	];

	for (const [index, row] of input.l10c.entries()) {
		const jenisTransaksiId = await getJenisTransaksiId(row.jenisTransaksi);
		const negaraId = await getNegaraId(row.negara);

		statements.push(
			db.insert(spt_pph_badan_lampiran_10c_transaksi).values({
				sptPphBadanId,
				nomorUrut: index + 1,
				namaMitraTransaksi: row.namaMitraTransaksi,
				jenisTransaksiId,
				negaraId,
				nilaiTransaksi: Number(row.nilaiTransaksi)
			})
		);
	}

	statements.push(
		db
			.delete(spt_pph_badan_lampiran_10c_pernyataan)
			.where(eq(spt_pph_badan_lampiran_10c_pernyataan.sptPphBadanId, sptPphBadanId)),
		db.insert(spt_pph_badan_lampiran_10c_pernyataan).values({
			sptPphBadanId,
			ditentukanPrinsip: input.l10cDitentukanPrinsip
		})
	);

	return statements;
}
