import * as v from 'valibot';

// SPT PPN stores currency-like fields as integer rupiah values.
const rupiah = v.pipe(v.number(), v.integer());
const tuple2 = v.tuple([rupiah, rupiah]);
const tuple3 = v.tuple([rupiah, rupiah, rupiah]);
const tuple4 = v.tuple([rupiah, rupiah, rupiah, rupiah]);

const lebihBayarTindakanSchema = v.nullish(
	v.picklist(['dikompensasikan', 'dikembalikan_pendahuluan', 'dikembalikan_pemeriksaan'])
);

export const SptPpnBlobSchema = v.object({
	// Document metadata. `version` lets us migrate the blob shape later.
	version: v.literal(1),
	periodeBulan: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
	periodeTahun: v.pipe(v.number(), v.integer(), v.minValue(2000)),

	// I. Penyerahan barang dan jasa.
	// A[0] is I.A.1; A[1]..A[8] are I.A.2..I.A.9; A[9] is the I.A total row.
	I: v.object({
		A: v.tuple([rupiah, tuple4, tuple4, tuple3, tuple4, tuple4, tuple4, tuple4, tuple4, tuple3]),
		B: rupiah,
		C: rupiah
	}),

	// II. Perolehan barang dan jasa. Tuple entries map to rows II.A through II.J.
	II: v.tuple([tuple3, tuple4, tuple3, tuple4, rupiah, rupiah, tuple2, tuple4, rupiah, rupiah]),

	// III. Perhitungan PPN kurang bayar / lebih bayar.
	// Entries 0..6 map to rows III.A..III.G; entry 7 stores the III.H more-action fields.
	III: v.tuple([
		rupiah,
		rupiah,
		rupiah,
		rupiah,
		rupiah,
		rupiah,
		rupiah,
		v.object({
			gantiSptSebelumnya: v.optional(v.boolean()),
			tindakan: lebihBayarTindakanSchema,
			lampiranNamaFile: v.nullish(v.string()),
			rekening: v.optional(
				v.object({
					pilihRekeningBank: v.nullish(v.string()),
					nomor: v.nullish(v.string()),
					namaBank: v.nullish(v.string()),
					namaPemilik: v.nullish(v.string())
				})
			)
		})
	]),

	// IV. PPN terutang atas kegiatan membangun sendiri: [DPP, PPN].
	IV: tuple2,
	// V. Pembayaran kembali pajak masukan yang tidak dapat dikreditkan.
	V: rupiah,
	// VI. Pajak penjualan atas barang mewah: rows VI.A..VI.E plus VI.F checkbox.
	VI: v.tuple([rupiah, rupiah, rupiah, rupiah, rupiah, v.boolean()]),
	// VII. Pemungutan PPN/PPnBM oleh pemungut PPN: rows VII.A..VII.C.
	VII: v.tuple([tuple4, tuple4, tuple4]),
	// VIII. Pemungutan PPN/PPnBM oleh pihak lain: rows VIII.A..VIII.C plus VIII.D checkbox.
	VIII: v.tuple([tuple4, tuple4, tuple4, v.boolean()]),
	// IX. Kelengkapan lampiran checklist.
	IX: v.tuple([v.boolean(), v.boolean()]),
	// X. Pernyataan and signer data.
	X: v.object({
		setuju: v.boolean(),
		ditandatanganiOleh: v.nullish(v.picklist(['PKP', 'KuasaWajibPajak'])),
		kotaPenandatanganSPT: v.optional(v.string()),
		nama: v.optional(v.string()),
		jabatan: v.optional(v.string()),
		batasWaktuPenyampaian: v.optional(v.string())
	})
});

export type SptPpnBlob = v.InferOutput<typeof SptPpnBlobSchema>;
