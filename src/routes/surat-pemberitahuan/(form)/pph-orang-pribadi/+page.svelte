<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Navbar from '../Navbar.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1 from './components/L-1/_L1.svelte';
	import L2 from './components/L-2/_L2.svelte';
	import L3A from './components/L-3A/_L3A.svelte';
	import L3A4 from './components/L-3A-4/_L3A4.svelte';
	import L3B from './components/L-3B/_L3B.svelte';
	import L5 from './components/L-5/_L5.svelte';
	import { getSptPphOrangPribadi } from './getSptPphOrangPribadi.remote';
	import { getReferensiLampiran } from './getReferensiLampiran.remote';
	import { saveSptPphOrangPribadi } from './saveSptPphOrangPribadi.remote';
	import { hitungInduk, type PtkpStatus } from './components/Induk/hitungPphOrangPribadi';
	import { computeLabaRugiRows } from '../pph-badan/components/L1/labaRugiRollup';
	import type {
		BarisA1,
		BarisA2,
		BarisA3,
		BarisA4,
		BarisA5,
		BarisA6,
		BarisBuktiPotong,
		BarisKeluarga,
		BarisPekerjaan,
		BarisUtang,
		Harta
	} from './components/L-1/types';
	import type { BarisBukanObjek, BarisFinal, BarisLuarNegeri } from './components/L-2/types';
	import type { BarisLabaRugi, KodeKoreksiFiskal, Sektor } from './components/L-3A/types';
	import type { BarisLainnya } from './components/L-3A-4/types';
	import type { BarisFinalBulanan, BarisPeredaranBulanan, TkuL3B } from './components/L-3B/types';
	import type { BarisKompensasi, BarisPengurang } from './components/L-5/types';

	const {
		readonly,
		spt,
		identitas,
		sumberPenghasilan: sumberAwal,
		lampiran1,
		lampiran2,
		lampiran3a,
		lampiran3a4,
		lampiran3b,
		lampiran5
	} = await getSptPphOrangPribadi();
	const referensi = await getReferensiLampiran();
	const saveForm = saveSptPphOrangPribadi.for(spt.id);

	let metodePembukuan = $state(spt.metodePembukuan);
	let periodeBulanMulai = $state(spt.periodeBulanMulai);
	let periodeBulanSelesai = $state(spt.periodeBulanSelesai);
	let sumberPenghasilan = $state<string[]>([...sumberAwal]);

	let a7StatusKewajibanSuamiIstri = $state(spt.a7StatusKewajibanSuamiIstri ?? '');
	let a8NpwpSuamiIstri = $state(spt.a8NpwpSuamiIstri ?? '');

	// Answers load as `undefined` when never given, which is distinct from Tidak:
	// an unanswered question shows no hint chip at all.
	let b1aPenghasilanPekerjaan = $state(spt.b1aPenghasilanPekerjaan ?? undefined);
	let b1b1PenghasilanUsaha = $state(spt.b1b1PenghasilanUsaha ?? undefined);
	let b1b2Oppt = $state(spt.b1b2Oppt ?? '');
	let b1b3Norma = $state(spt.b1b3Norma ?? '');
	let b1b4Sektor = $state(spt.b1b4Sektor ?? '');
	let b1cPenghasilanDalamNegeriLainnya = $state(spt.b1cPenghasilanDalamNegeriLainnya ?? undefined);
	let b1dPenghasilanLuarNegeri = $state(spt.b1dPenghasilanLuarNegeri ?? undefined);

	let c3AdaPengurangPenghasilanNeto = $state(spt.c3AdaPengurangPenghasilanNeto ?? undefined);
	let c5PtkpStatus = $state(spt.c5PtkpStatus ?? '');
	let c8AdaPengurangPphTerutang = $state(spt.c8AdaPengurangPphTerutang ?? undefined);

	let d10aAdaPphDipotongPihakLain = $state(spt.d10aAdaPphDipotongPihakLain ?? undefined);
	let d10bAngsuranPph25 = $state(spt.d10bAngsuranPph25);
	let d10cStpPph25 = $state(spt.d10cStpPph25);
	let d10dAdaPengembalianKreditLuarNegeri = $state(
		spt.d10dAdaPengembalianKreditLuarNegeri ?? undefined
	);
	let d10dJumlah = $state(spt.d10dJumlah);

	let e11bAdaSkPengangsuranPenundaan = $state(spt.e11bAdaSkPengangsuranPenundaan ?? undefined);
	let e11bJumlah = $state(spt.e11bJumlah);

	let f12aGantiSptSebelumnya = $state(spt.f12aGantiSptSebelumnya ?? undefined);

	let gMetodePengembalian = $state(spt.gMetodePengembalian ?? '');
	let gNomorRekening = $state(spt.gNomorRekening ?? '');
	let gNamaBank = $state(spt.gNamaBank ?? '');
	let gNamaPemilikRekening = $state(spt.gNamaPemilikRekening ?? '');

	let h13aAngsuranTeratur = $state(spt.h13aAngsuranTeratur ?? undefined);
	let h13bPerhitunganTersendiri = $state(spt.h13bPerhitunganTersendiri ?? undefined);
	let h13cAngsuranOppt = $state(spt.h13cAngsuranOppt ?? undefined);

	let i14bMemilikiUtang = $state(spt.i14bMemilikiUtang ?? undefined);
	let i14cPenghasilanFinal = $state(spt.i14cPenghasilanFinal ?? undefined);
	let i14dBukanObjekPajak = $state(spt.i14dBukanObjekPajak ?? undefined);
	let i14ePenyusutanAmortisasiFiskal = $state(spt.i14ePenyusutanAmortisasiFiskal ?? undefined);
	let i14fBiayaEntertainment = $state(spt.i14fBiayaEntertainment ?? undefined);
	let i14gDividenLuarNegeri = $state(spt.i14gDividenLuarNegeri ?? undefined);
	let i14hKelebihanPphFinal = $state(spt.i14hKelebihanPphFinal);

	let jaLaporanKeuangan = $state(spt.jaLaporanKeuangan ?? undefined);
	let jbBuktiZakat = $state(spt.jbBuktiZakat ?? undefined);
	let jcBuktiPotongLuarNegeri = $state(spt.jcBuktiPotongLuarNegeri ?? undefined);
	let jdSuratKuasaKhusus = $state(spt.jdSuratKuasaKhusus ?? undefined);
	let jeDokumenLainnya = $state(spt.jeDokumenLainnya ?? undefined);

	let pernyataanBenar = $state(false);
	let penandatangan = $state(spt.penandatangan);

	// Figures the lampiran feed into the Induk. The chain is four levels deep on
	// the real form (row arithmetic -> section footer -> Induk field -> Induk
	// formula), and these are the third level. They stay 0 until the lampiran are
	// built, which is why every derived row below currently reads 0.
	//
	// Feed map, all measured (see spt-1770-lampiran/BEHAVIOR.md):
	//   1.a  <- L-1 D  JUMLAH BAGIAN D
	//   1.b  <- L-3A   4800 NILAI FISKAL
	//   1.c  <- L-3A-4 B
	//   1.d  <- L-2 C  JUMLAH PENGHASILAN NETO
	//   3    <- L-5 A (kolom tahun pajak ini) + L-5 B
	//   8    <- L-5 C
	//   10a  <- L-1 E  JUMLAH BAGIAN E (which itself imports from L-2 C)
	//   14a  <- L-1 A7 rollup
	//
	// Every lampiran above is now built, including L-3A (the sektor-gated
	// 4xxx/5xxx fiscal grid for 1.b, reusing the SPT Badan L1 rollup as-is).
	// Every Induk row that BEHAVIOR.md documents a feed for is live below.
	// DB columns for the fields that only some harta sub-tables use are nullable
	// (which fields a sub-table shows is a property of its modal, not of the
	// storage), so loading coerces null to the same empty value a fresh row
	// starts with.
	let l1Harta = $state<Harta>({
		a1: lampiran1.harta.a1.map(
			(row): BarisA1 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				nomorAkun: row.nomorAkun ?? '',
				atasNama: row.atasNama ?? '',
				namaBankInstitusi: row.namaBankInstitusi ?? '',
				lokasiHarta: row.lokasiHarta ?? '',
				tahunPerolehan: row.tahunPerolehan ?? 0,
				nilaiSaatIni: row.nilaiSaatIni,
				keterangan: row.keterangan
			})
		),
		a2: lampiran1.harta.a2.map(
			(row): BarisA2 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				lokasiHarta: row.lokasiHarta ?? '',
				nomorIdentitasPenerima: row.nomorIdentitasPenerima ?? '',
				namaPenerimaPinjaman: row.namaPenerimaPinjaman ?? '',
				nilaiPiutang: row.nilaiPiutang ?? 0,
				tahunDimulai: row.tahunDimulai ?? 0,
				nilaiSaatIni: row.nilaiSaatIni,
				keterangan: row.keterangan
			})
		),
		a3: lampiran1.harta.a3.map(
			(row): BarisA3 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				lokasiHarta: row.lokasiHarta ?? '',
				nomorIdentitasPenerima: row.nomorIdentitasPenerima ?? '',
				namaBankInstitusi: row.namaBankInstitusi ?? '',
				nomorAkun: row.nomorAkun ?? '',
				hargaPerolehan: row.hargaPerolehan,
				tahunPerolehan: row.tahunPerolehan ?? 0,
				nilaiSaatIni: row.nilaiSaatIni,
				keterangan: row.keterangan
			})
		),
		a4: lampiran1.harta.a4.map(
			(row): BarisA4 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				merkModel: row.merkModel ?? '',
				nomorPolisiRegistrasi: row.nomorPolisiRegistrasi ?? '',
				kepemilikan: row.kepemilikan ?? '',
				nomorIdentitasPemilik: row.nomorIdentitasPemilik ?? '',
				namaPemilik: row.namaPemilik ?? '',
				tahunPerolehan: row.tahunPerolehan ?? 0,
				hargaPerolehan: row.hargaPerolehan,
				nilaiSaatIni: row.nilaiSaatIni,
				keterangan: row.keterangan
			})
		),
		a5: lampiran1.harta.a5.map(
			(row): BarisA5 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				lokasiHarta: row.lokasiHarta ?? '',
				ukuranTanah: row.ukuranTanah ?? '',
				ukuranBangunan: row.ukuranBangunan ?? '',
				sumberKepemilikan: row.sumberKepemilikan ?? '',
				nomorSertifikat: row.nomorSertifikat ?? '',
				tahunPerolehan: row.tahunPerolehan ?? 0,
				hargaPerolehan: row.hargaPerolehan,
				nilaiSaatIni: row.nilaiSaatIni,
				keterangan: row.keterangan
			})
		),
		a6: lampiran1.harta.a6.map(
			(row): BarisA6 => ({
				kode: row.kode,
				deskripsi: row.deskripsi,
				tahunPerolehan: row.tahunPerolehan ?? 0,
				hargaPerolehan: row.hargaPerolehan,
				nilaiSaatIni: row.nilaiSaatIni,
				buktiKepemilikan: row.buktiKepemilikan ?? '',
				informasiTambahan: row.informasiTambahan ?? '',
				keterangan: row.keterangan
			})
		)
	});
	let l1Utang = $state<BarisUtang[]>(
		lampiran1.utang.map((row) => ({ ...row, tahunPeminjaman: row.tahunPeminjaman ?? 0 }))
	);
	let l1Keluarga = $state<BarisKeluarga[]>(lampiran1.keluarga.map((row) => ({ ...row })));
	let l1Pekerjaan = $state<BarisPekerjaan[]>(lampiran1.pekerjaan.map((row) => ({ ...row })));
	let l1BuktiPotong = $state<BarisBuktiPotong[]>(lampiran1.buktiPotong.map((row) => ({ ...row })));

	function jumlah<T>(rows: T[], key: keyof T): number {
		return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
	}

	let l2Final = $state<BarisFinal[]>(lampiran2.final.map((row) => ({ ...row })));
	let l2BukanObjek = $state<BarisBukanObjek[]>(lampiran2.bukanObjek.map((row) => ({ ...row })));
	let l2LuarNegeri = $state<BarisLuarNegeri[]>(lampiran2.luarNegeri.map((row) => ({ ...row })));

	let l3a4Lainnya = $state<BarisLainnya[]>(lampiran3a4.lainnya.map((row) => ({ ...row })));

	let l3bTku = $state<TkuL3B>({ ...lampiran3b.tku });
	let l3bA = $state<BarisFinalBulanan[]>(lampiran3b.a.map((row) => ({ ...row })));
	let l3bB = $state<BarisPeredaranBulanan[]>(lampiran3b.b.map((row) => ({ ...row })));
	let l3bC = $state<BarisPeredaranBulanan[]>(lampiran3b.c.map((row) => ({ ...row })));

	let l5Kompensasi = $state<BarisKompensasi[]>(lampiran5.kompensasi.map((row) => ({ ...row })));
	let l5PengurangNeto = $state<BarisPengurang[]>(lampiran5.pengurangNeto.map((row) => ({ ...row })));
	let l5PengurangPph = $state<BarisPengurang[]>(lampiran5.pengurangPph.map((row) => ({ ...row })));

	// 1.a takes the JUMLAH BAGIAN D footer, which totals the neto, not the bruto.
	let n1a = $derived(jumlah(l1Pekerjaan, 'penghasilanNeto'));
	// 10a is the JUMLAH BAGIAN E footer, which is L-1 E's own total plus the
	// KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI row imported from L-2 C. Two
	// lampiran feed one Induk row, so the graph has lampiran-to-lampiran edges.
	let n10a = $derived(
		jumlah(l1BuktiPotong, 'pphDipotong') + jumlah(l2LuarNegeri, 'kreditPajakDiperhitungkan')
	);
	let n1d = $derived(jumlah(l2LuarNegeri, 'penghasilanNeto'));
	// 14c takes the DPP, not the PPh Terutang.
	let n14c = $derived(jumlah(l2Final, 'dasarPengenaanPajak'));
	let n14d = $derived(jumlah(l2BukanObjek, 'penghasilanBruto'));
	let n14a = $derived(
		jumlah(l1Harta.a1, 'nilaiSaatIni') +
			jumlah(l1Harta.a2, 'nilaiSaatIni') +
			jumlah(l1Harta.a3, 'nilaiSaatIni') +
			jumlah(l1Harta.a4, 'nilaiSaatIni') +
			jumlah(l1Harta.a5, 'nilaiSaatIni') +
			jumlah(l1Harta.a6, 'nilaiSaatIni')
	);
	// 14b takes the L-1 Bagian B utang total.
	let n14b = $derived(jumlah(l1Utang, 'saldo'));
	// 1.c feeds straight from L-3A-4 B, no other source.
	let n1c = $derived(jumlah(l3a4Lainnya, 'penghasilanNeto'));
	// Row 3 is L-5 A's kompensasiTahunIni column plus the whole of Bagian B.
	// Only the tahun-pajak-ini column of the fixed ten-row matrix counts; the
	// other five are historical record only and do not reach the Induk.
	let n3 = $derived(
		jumlah(l5Kompensasi, 'kompensasiTahunIni') + jumlah(l5PengurangNeto, 'jumlah')
	);
	// Row 8 is L-5 C in full.
	let n8 = $derived(jumlah(l5PengurangPph, 'jumlah'));

	// L-3A. All three sektor templates are loaded regardless of which one is
	// currently selected (see getLampiranL3A.server.ts), so switching Induk
	// 1.b.4 needs no extra round trip.
	const l3aAkunPerSektor = lampiran3a.akunPerSektor;
	const l3aKodeKoreksiFiskal: KodeKoreksiFiskal[] = lampiran3a.kodeKoreksiFiskal;
	let l3aLabaRugi = $state<BarisLabaRugi[]>(
		lampiran3a.labaRugi.map((row) => ({
			akunId: row.akunId,
			nilaiKomersial: row.nilaiKomersial,
			nonObjekPajak: row.nonObjekPajak,
			dikenakanPphFinal: row.dikenakanPphFinal,
			penyesuaianFiskalPositif: row.penyesuaianFiskalPositif,
			penyesuaianFiskalNegatif: row.penyesuaianFiskalNegatif,
			kodePenyesuaianFiskal: [...row.kodePenyesuaianFiskal]
		}))
	);

	// 1.b.5 reads L-3A's 4800 NILAI FISKAL directly. Computed the same way as
	// the server (computeLabaRugiRows is pure logic, reused as-is), scoped to
	// whichever sektor is currently selected; rows left over from an abandoned
	// sektor are harmless here for the same reason they are on save, see
	// BarisLabaRugi's own note.
	let n1b = $derived.by(() => {
		if (!b1b4Sektor) return 0;
		const akun = l3aAkunPerSektor[b1b4Sektor as Sektor] ?? [];
		const template = akun.map((row, index) => ({
			id: row.id,
			nomorUrut: index + 1,
			kode: row.kode,
			namaAkun: row.namaAkun,
			rowType: row.rowType,
			classification: row.classification,
			parentKode: row.parentKode,
			sign: row.sign
		}));
		const computed = computeLabaRugiRows(template, l3aLabaRugi);
		return computed.find((row) => row.kode === '4800')?.nilaiFiskal ?? 0;
	});

	let f12a = $derived(spt.pembetulanKe > 0 ? (spt.previousPphKurangLebihBayar ?? 0) : 0);

	let computed = $derived(
		hitungInduk({
			n1a: Number(n1a),
			n1b: Number(n1b),
			n1c: Number(n1c),
			n1d: Number(n1d),
			c3AdaPengurangPenghasilanNeto: Boolean(c3AdaPengurangPenghasilanNeto),
			n3: Number(n3),
			c5PtkpStatus: (c5PtkpStatus || null) as PtkpStatus | null,
			c8AdaPengurangPphTerutang: Boolean(c8AdaPengurangPphTerutang),
			n8: Number(n8),
			d10aAdaPphDipotongPihakLain: Boolean(d10aAdaPphDipotongPihakLain),
			n10a: Number(n10a),
			d10bAngsuranPph25: Number(d10bAngsuranPph25),
			d10cStpPph25: Number(d10cStpPph25),
			d10dAdaPengembalianKreditLuarNegeri: Boolean(d10dAdaPengembalianKreditLuarNegeri),
			d10dJumlah: Number(d10dJumlah),
			e11bAdaSkPengangsuranPenundaan: Boolean(e11bAdaSkPengangsuranPenundaan),
			e11bJumlah: Number(e11bJumlah),
			f12a
		})
	);

	let currentTab = $state('Induk');

	// Which lampiran exist is derived state, computed from the Induk answers, not
	// a one-way side effect of ever having answered Ya. A tab is present exactly
	// while at least one gate routing to it is Ya, so each entry below is the OR
	// of that lampiran's gates.
	//
	// Unlike Coretax, turning the last gate off does NOT delete that lampiran's
	// rows here: it only hides the tab. See the hidden-input note on the form
	// below, which is what makes that true.
	let tabs = $derived([
		{ tab: 'Induk', visibility: true },
		// L-1: A (harta, always), B (14b), D (1.a), E (10a). A and C are
		// unconditional, so the tab itself is always present.
		{ tab: 'L-1', visibility: true },
		{
			tab: 'L-2',
			visibility: Boolean(i14cPenghasilanFinal || i14dBukanObjekPajak || b1dPenghasilanLuarNegeri)
		},
		// L-3A-1/2/3 are the sektor variants reached from Induk 1.b.4: exactly one
		// exists at a time, tracking the selected sektor directly rather than the
		// usual OR-of-gates rule (changing 1.b.4 replaces the tab, see L3A.md).
		// L-3A-4 is gated on 1.c and coexists with whichever of these is showing.
		{ tab: 'L-3A-1', visibility: b1b4Sektor === 'dagang' },
		{ tab: 'L-3A-2', visibility: b1b4Sektor === 'jasa' },
		{ tab: 'L-3A-3', visibility: b1b4Sektor === 'industri' },
		{ tab: 'L-3A-4', visibility: Boolean(b1cPenghasilanDalamNegeriLainnya) },
		// Gated on 1.b.2 (either "Ya" option, see L3B.md) OR 1.b.3 = Norma. The live
		// doc only observed the 1.b.2 gate (Norma is blocked server-side on that
		// account), but Norma is freely selectable in our training app and needs a
		// way to reach L-3B Bagian C, so the Norma gate is added here.
		{
			tab: 'L-3B',
			visibility:
				b1b2Oppt === 'peredaran_bruto_tertentu' ||
				b1b2Oppt === 'pengusaha_tertentu' ||
				b1b3Norma === 'ya_norma'
		},
		{ tab: 'L-4', visibility: Boolean(h13bPerhitunganTersendiri) },
		{
			tab: 'L-5',
			visibility: Boolean(c3AdaPengurangPenghasilanNeto || c8AdaPengurangPphTerutang)
		}
	]);

	let saveError = $state('');
</script>

<Card>
	{#snippet head()}
		<div class="tw:flex tw:w-full tw:items-center tw:justify-between">
			<span class="tw:text-2xl">SPT Tahunan PPh Orang Pribadi</span>
			<span class="tw:text-sm">Tahun Pajak {spt.tahunPajak}</span>
		</div>
	{/snippet}
	{#snippet body()}
		<form
			novalidate
			onkeydown={(e) => {
				if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
					e.preventDefault();
				}
			}}
			{...saveForm.enhance(async (form) => {
				saveError = '';

				try {
					if (await form.submit()) {
						await tick();
						form.element.reset();
					} else {
						const issues = form.fields.allIssues();
						saveError = issues?.length
							? issues.map((issue) => issue.message).join('; ')
							: 'Periksa kembali data yang diisi.';
					}
				} catch (e) {
					console.error(e);
					saveError = isHttpError(e)
						? e.body.message
						: e instanceof Error
							? e.message
							: 'Gagal menyimpan SPT PPh Orang Pribadi.';
				}
			})}
		>
			<!--
				These hidden inputs MUST stay here, outside every tab conditional.
				That is what makes a gate flip non-destructive: the save replaces
				each section wholesale, so a value that is not submitted is a value
				that gets deleted. Rendering one of these inside an {#if visible}
				block would mean answering a gating question Tidak silently wipes
				that lampiran's data, which is exactly the behaviour we chose not to
				copy from Coretax.

				Same reason the lampiran components (once they exist) must self-hide
				via a class rather than being mounted behind an {#if}.
			-->
			<input type="hidden" name="id" value={spt.id} />
			<input type="hidden" name="metodePembukuan" value={metodePembukuan} />
			<input type="hidden" name="periodeBulanMulai" value={periodeBulanMulai} />
			<input type="hidden" name="periodeBulanSelesai" value={periodeBulanSelesai} />
			<input type="hidden" name="sumberPenghasilan" value={JSON.stringify(sumberPenghasilan)} />
			<input type="hidden" name="a7StatusKewajibanSuamiIstri" value={a7StatusKewajibanSuamiIstri} />
			<input type="hidden" name="a8NpwpSuamiIstri" value={a8NpwpSuamiIstri} />
			<input type="hidden" name="b1aPenghasilanPekerjaan" value={b1aPenghasilanPekerjaan} />
			<input type="hidden" name="b1b1PenghasilanUsaha" value={b1b1PenghasilanUsaha} />
			<input type="hidden" name="b1b2Oppt" value={b1b2Oppt} />
			<input type="hidden" name="b1b3Norma" value={b1b3Norma} />
			<input type="hidden" name="b1b4Sektor" value={b1b4Sektor} />
			<input
				type="hidden"
				name="b1cPenghasilanDalamNegeriLainnya"
				value={b1cPenghasilanDalamNegeriLainnya}
			/>
			<input type="hidden" name="b1dPenghasilanLuarNegeri" value={b1dPenghasilanLuarNegeri} />
			<input
				type="hidden"
				name="c3AdaPengurangPenghasilanNeto"
				value={c3AdaPengurangPenghasilanNeto}
			/>
			<input type="hidden" name="c5PtkpStatus" value={c5PtkpStatus} />
			<input type="hidden" name="c8AdaPengurangPphTerutang" value={c8AdaPengurangPphTerutang} />
			<input
				type="hidden"
				name="d10aAdaPphDipotongPihakLain"
				value={d10aAdaPphDipotongPihakLain}
			/>
			<input type="hidden" name="d10bAngsuranPph25" value={d10bAngsuranPph25} />
			<input type="hidden" name="d10cStpPph25" value={d10cStpPph25} />
			<input
				type="hidden"
				name="d10dAdaPengembalianKreditLuarNegeri"
				value={d10dAdaPengembalianKreditLuarNegeri}
			/>
			<input type="hidden" name="d10dJumlah" value={d10dJumlah} />
			<input
				type="hidden"
				name="e11bAdaSkPengangsuranPenundaan"
				value={e11bAdaSkPengangsuranPenundaan}
			/>
			<input type="hidden" name="e11bJumlah" value={e11bJumlah} />
			<input type="hidden" name="f12aGantiSptSebelumnya" value={f12aGantiSptSebelumnya} />
			<input type="hidden" name="gMetodePengembalian" value={gMetodePengembalian} />
			<input type="hidden" name="gNomorRekening" value={gNomorRekening} />
			<input type="hidden" name="gNamaBank" value={gNamaBank} />
			<input type="hidden" name="gNamaPemilikRekening" value={gNamaPemilikRekening} />
			<input type="hidden" name="h13aAngsuranTeratur" value={h13aAngsuranTeratur} />
			<input type="hidden" name="h13bPerhitunganTersendiri" value={h13bPerhitunganTersendiri} />
			<input type="hidden" name="h13cAngsuranOppt" value={h13cAngsuranOppt} />
			<input type="hidden" name="i14bMemilikiUtang" value={i14bMemilikiUtang} />
			<input type="hidden" name="i14cPenghasilanFinal" value={i14cPenghasilanFinal} />
			<input type="hidden" name="i14dBukanObjekPajak" value={i14dBukanObjekPajak} />
			<input
				type="hidden"
				name="i14ePenyusutanAmortisasiFiskal"
				value={i14ePenyusutanAmortisasiFiskal}
			/>
			<input type="hidden" name="i14fBiayaEntertainment" value={i14fBiayaEntertainment} />
			<input type="hidden" name="i14gDividenLuarNegeri" value={i14gDividenLuarNegeri} />
			<input type="hidden" name="i14hKelebihanPphFinal" value={i14hKelebihanPphFinal} />
			<input type="hidden" name="jaLaporanKeuangan" value={jaLaporanKeuangan} />
			<input type="hidden" name="jbBuktiZakat" value={jbBuktiZakat} />
			<input type="hidden" name="jcBuktiPotongLuarNegeri" value={jcBuktiPotongLuarNegeri} />
			<input type="hidden" name="jdSuratKuasaKhusus" value={jdSuratKuasaKhusus} />
			<input type="hidden" name="jeDokumenLainnya" value={jeDokumenLainnya} />
			<input type="hidden" name="penandatangan" value={penandatangan} />
			<!-- L-1 rows. Note these sit in the same unconditional block for the
			     reason above: the L-1 tab is always visible, but its B, D and E
			     grids are gated on Induk answers, and the save replaces each
			     section wholesale. -->
			<input type="hidden" name="l1HartaA1" value={JSON.stringify(l1Harta.a1)} />
			<input type="hidden" name="l1HartaA2" value={JSON.stringify(l1Harta.a2)} />
			<input type="hidden" name="l1HartaA3" value={JSON.stringify(l1Harta.a3)} />
			<input type="hidden" name="l1HartaA4" value={JSON.stringify(l1Harta.a4)} />
			<input type="hidden" name="l1HartaA5" value={JSON.stringify(l1Harta.a5)} />
			<input type="hidden" name="l1HartaA6" value={JSON.stringify(l1Harta.a6)} />
			<input type="hidden" name="l1Utang" value={JSON.stringify(l1Utang)} />
			<input type="hidden" name="l1Pekerjaan" value={JSON.stringify(l1Pekerjaan)} />
			<input type="hidden" name="l1BuktiPotong" value={JSON.stringify(l1BuktiPotong)} />
			<!-- L-2 rows, same unconditional-block rule as above. -->
			<input type="hidden" name="l2Final" value={JSON.stringify(l2Final)} />
			<input type="hidden" name="l2BukanObjek" value={JSON.stringify(l2BukanObjek)} />
			<input type="hidden" name="l2LuarNegeri" value={JSON.stringify(l2LuarNegeri)} />
			<!-- L-3A-4 Bagian B rows. Bagian A (Norma) is not implemented. -->
			<input type="hidden" name="l3aLabaRugi" value={JSON.stringify(l3aLabaRugi)} />
			<input type="hidden" name="l3a4Lainnya" value={JSON.stringify(l3a4Lainnya)} />
			<!-- L-3B rows. The TKU registry is a single scalar record, not an array. -->
			<input type="hidden" name="l3bTkuNama" value={l3bTku.nama} />
			<input type="hidden" name="l3bTkuAlamat" value={l3bTku.alamat} />
			<input type="hidden" name="l3bTkuKelurahan" value={l3bTku.kelurahan} />
			<input type="hidden" name="l3bTkuKecamatan" value={l3bTku.kecamatan} />
			<input type="hidden" name="l3bTkuKabupaten" value={l3bTku.kabupaten} />
			<input type="hidden" name="l3bTkuProvinsi" value={l3bTku.provinsi} />
			<input
				type="hidden"
				name="l3bTkuJenisUsahaPekerjaanBebas"
				value={l3bTku.jenisUsahaPekerjaanBebas}
			/>
			<input type="hidden" name="l3bA" value={JSON.stringify(l3bA)} />
			<input type="hidden" name="l3bB" value={JSON.stringify(l3bB)} />
			<input type="hidden" name="l3bC" value={JSON.stringify(l3bC)} />
			<!-- L-5 rows. Bagian A is the fixed ten-row matrix. -->
			<input type="hidden" name="l5Kompensasi" value={JSON.stringify(l5Kompensasi)} />
			<input type="hidden" name="l5PengurangNeto" value={JSON.stringify(l5PengurangNeto)} />
			<input type="hidden" name="l5PengurangPph" value={JSON.stringify(l5PengurangPph)} />
			<!-- The only figure still fed by a lampiran that does not exist yet. -->
			<input type="hidden" name="n1b" value={n1b} />

			<Navbar {tabs} bind:currentTab />

			<Induk
				{currentTab}
				{spt}
				{identitas}
				{readonly}
				{computed}
				bind:metodePembukuan
				bind:periodeBulanMulai
				bind:periodeBulanSelesai
				bind:sumberPenghasilan
				bind:a7StatusKewajibanSuamiIstri
				bind:a8NpwpSuamiIstri
				bind:b1aPenghasilanPekerjaan
				bind:b1b1PenghasilanUsaha
				bind:b1b2Oppt
				bind:b1b3Norma
				bind:b1b4Sektor
				bind:b1cPenghasilanDalamNegeriLainnya
				bind:b1dPenghasilanLuarNegeri
				bind:c3AdaPengurangPenghasilanNeto
				bind:c5PtkpStatus
				bind:c8AdaPengurangPphTerutang
				bind:d10aAdaPphDipotongPihakLain
				bind:d10bAngsuranPph25
				bind:d10cStpPph25
				bind:d10dAdaPengembalianKreditLuarNegeri
				bind:d10dJumlah
				bind:e11bAdaSkPengangsuranPenundaan
				bind:e11bJumlah
				{f12a}
				bind:f12aGantiSptSebelumnya
				bind:gMetodePengembalian
				bind:gNomorRekening
				bind:gNamaBank
				bind:gNamaPemilikRekening
				bind:h13aAngsuranTeratur
				bind:h13bPerhitunganTersendiri
				bind:h13cAngsuranOppt
				bind:i14bMemilikiUtang
				bind:i14cPenghasilanFinal
				bind:i14dBukanObjekPajak
				bind:i14ePenyusutanAmortisasiFiskal
				bind:i14fBiayaEntertainment
				bind:i14gDividenLuarNegeri
				bind:i14hKelebihanPphFinal
				bind:jaLaporanKeuangan
				bind:jbBuktiZakat
				bind:jcBuktiPotongLuarNegeri
				bind:jdSuratKuasaKhusus
				bind:jeDokumenLainnya
				bind:pernyataanBenar
				bind:penandatangan
				{n1a}
				{n1b}
				{n1c}
				{n1d}
				{n10a}
				{n14a}
				{n14b}
				{n14c}
				{n14d}
			/>

			<L1
				{currentTab}
				{referensi}
				bind:harta={l1Harta}
				bind:utang={l1Utang}
				keluarga={l1Keluarga}
				bind:pekerjaan={l1Pekerjaan}
				bind:buktiPotong={l1BuktiPotong}
				kreditPajakLuarNegeri={jumlah(l2LuarNegeri, 'kreditPajakDiperhitungkan')}
				{i14bMemilikiUtang}
				{b1aPenghasilanPekerjaan}
				{d10aAdaPphDipotongPihakLain}
				{readonly}
			/>

			<L2
				{currentTab}
				{referensi}
				bind:final={l2Final}
				bind:bukanObjek={l2BukanObjek}
				bind:luarNegeri={l2LuarNegeri}
				{i14cPenghasilanFinal}
				{i14dBukanObjekPajak}
				{b1dPenghasilanLuarNegeri}
				{readonly}
			/>

			<L3A
				{currentTab}
				sektor={b1b4Sektor ? (b1b4Sektor as Sektor) : null}
				akunPerSektor={l3aAkunPerSektor}
				bind:labaRugi={l3aLabaRugi}
				kodeKoreksiFiskal={l3aKodeKoreksiFiskal}
				{readonly}
			/>

			<L3A4
				{currentTab}
				{referensi}
				bind:lainnya={l3a4Lainnya}
				{b1cPenghasilanDalamNegeriLainnya}
				{readonly}
			/>

			<L3B
				{currentTab}
				npwp={spt.npwp}
				metodePembukuan={metodePembukuan ?? ''}
				bind:tku={l3bTku}
				bind:a={l3bA}
				bind:b={l3bB}
				bind:c={l3bC}
				{b1b2Oppt}
				{b1b3Norma}
				{readonly}
			/>

			<L5
				{currentTab}
				{referensi}
				tahunPajak={spt.tahunPajak}
				bind:kompensasi={l5Kompensasi}
				bind:pengurangNeto={l5PengurangNeto}
				bind:pengurangPph={l5PengurangPph}
				{c3AdaPengurangPenghasilanNeto}
				{c8AdaPengurangPphTerutang}
				{readonly}
			/>

			<!-- The remaining lampiran tabs are gated above but not built yet. -->
			{#if currentTab !== 'Induk' && currentTab !== 'L-1' && currentTab !== 'L-2' && currentTab !== 'L-3A-1' && currentTab !== 'L-3A-2' && currentTab !== 'L-3A-3' && currentTab !== 'L-3A-4' && currentTab !== 'L-3B' && currentTab !== 'L-5'}
				<div class="tw:p-5">
					<Alert bg={'var(--color-primary)'}>
						{#snippet head()}
							<span>i</span>
						{/snippet}
						{#snippet body()}
							<span>
								Lampiran {currentTab} belum tersedia. Jawaban pada Induk sudah menentukan lampiran
								mana yang berlaku, dan pengisiannya akan ditambahkan berikutnya.
							</span>
						{/snippet}
					</Alert>
				</div>
			{/if}

			{#if saveError}
				<div class="tw:mt-4">
					<Alert bg={'#dc2626'}>
						{#snippet head()}
							<span class="tw:text-white">!</span>
						{/snippet}
						{#snippet body()}
							<span class="tw:text-white">{saveError}</span>
						{/snippet}
					</Alert>
				</div>
			{/if}

			{#if !readonly}
				<div class="tw:mt-4 tw:flex tw:gap-2">
					<Button type="submit" name="action" value="Simpan Konsep" color="var(--color-secondary)">
						<span class="tw:text-white">Simpan Konsep</span>
					</Button>
					<Button type="submit" name="action" value="Simpan Lapor" color="var(--color-secondary)">
						<span class="tw:text-white">Simpan Lapor</span>
					</Button>
				</div>
			{/if}
		</form>
	{/snippet}
</Card>
