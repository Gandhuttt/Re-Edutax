<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Navbar from '../Navbar.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1 from './components/L-1/_L1.svelte';
	import { getSptPphOrangPribadi } from './getSptPphOrangPribadi.remote';
	import { getReferensiLampiran } from './getReferensiLampiran.remote';
	import { saveSptPphOrangPribadi } from './saveSptPphOrangPribadi.remote';
	import { hitungInduk, type PtkpStatus } from './components/Induk/hitungPphOrangPribadi';
	import type { LampiranRow } from './components/lampiran/types';

	const {
		readonly,
		spt,
		identitas,
		sumberPenghasilan: sumberAwal,
		lampiran1
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
	// L-1 is built, so 1.a, 10a, 14a and 14b are live and derived below from its
	// rows. The rest stay 0 until their lampiran land.
	let l1Harta = $state<Record<'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6', LampiranRow[]>>({
		a1: lampiran1.harta.a1.map((row) => ({ ...row }) as LampiranRow),
		a2: lampiran1.harta.a2.map((row) => ({ ...row }) as LampiranRow),
		a3: lampiran1.harta.a3.map((row) => ({ ...row }) as LampiranRow),
		a4: lampiran1.harta.a4.map((row) => ({ ...row }) as LampiranRow),
		a5: lampiran1.harta.a5.map((row) => ({ ...row }) as LampiranRow),
		a6: lampiran1.harta.a6.map((row) => ({ ...row }) as LampiranRow)
	});
	let l1Utang = $state<LampiranRow[]>(lampiran1.utang.map((row) => ({ ...row }) as LampiranRow));
	let l1Keluarga = $state<LampiranRow[]>(
		lampiran1.keluarga.map((row) => ({ ...row }) as LampiranRow)
	);
	let l1Pekerjaan = $state<LampiranRow[]>(
		lampiran1.pekerjaan.map((row) => ({ ...row }) as LampiranRow)
	);
	let l1BuktiPotong = $state<LampiranRow[]>(
		lampiran1.buktiPotong.map((row) => ({ ...row }) as LampiranRow)
	);

	const jumlah = (rows: LampiranRow[], key: string) =>
		rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);

	// 1.a takes the JUMLAH BAGIAN D footer, which totals the neto, not the bruto.
	let n1a = $derived(jumlah(l1Pekerjaan, 'penghasilanNeto'));
	// 10a will also need L-2 C's kredit pajak luar negeri once L-2 exists: the
	// JUMLAH BAGIAN E footer is this grid's own total plus that imported row.
	let n10a = $derived(jumlah(l1BuktiPotong, 'pphDipotong'));
	let n14a = $derived(
		(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'] as const).reduce(
			(sum, key) => sum + jumlah(l1Harta[key], 'nilaiSaatIni'),
			0
		)
	);
	// 14b takes the L-1 Bagian B utang total.
	let n14b = $derived(jumlah(l1Utang, 'saldo'));

	let n1b = $state(0);
	let n1c = $state(0);
	let n1d = $state(0);
	let n3 = $state(0);
	let n8 = $state(0);

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
		// L-3A-1/2/3 are the sektor variants reached from the 1.b family; only one
		// can exist at a time. L-3A-4 is gated on 1.c and coexists with them.
		{ tab: 'L-3A-1', visibility: Boolean(b1b1PenghasilanUsaha) },
		{ tab: 'L-3A-4', visibility: Boolean(b1cPenghasilanDalamNegeriLainnya) },
		{ tab: 'L-3B', visibility: Boolean(b1b1PenghasilanUsaha && b1b2Oppt) },
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
			<!-- Figures from lampiran that do not exist yet. 1.a, 10a and 14a are
			     absent because L-1 supplies them and the server recomputes them
			     from the rows above rather than trusting a submitted total. -->
			<input type="hidden" name="n1b" value={n1b} />
			<input type="hidden" name="n1c" value={n1c} />
			<input type="hidden" name="n1d" value={n1d} />
			<input type="hidden" name="n3" value={n3} />
			<input type="hidden" name="n8" value={n8} />

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
			/>

			<L1
				{currentTab}
				{referensi}
				bind:harta={l1Harta}
				bind:utang={l1Utang}
				keluarga={l1Keluarga}
				bind:pekerjaan={l1Pekerjaan}
				bind:buktiPotong={l1BuktiPotong}
				{i14bMemilikiUtang}
				{b1aPenghasilanPekerjaan}
				{d10aAdaPphDipotongPihakLain}
				{readonly}
			/>

			<!-- The remaining lampiran tabs are gated above but not built yet. -->
			{#if currentTab !== 'Induk' && currentTab !== 'L-1'}
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
