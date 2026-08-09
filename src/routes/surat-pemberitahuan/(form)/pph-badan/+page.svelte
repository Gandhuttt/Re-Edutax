<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1 from './components/L1/_L1.svelte';
	import L2 from './components/L2/_L2.svelte';
	import L3 from './components/L3/_L3.svelte';
	import L4 from './components/L4/_L4.svelte';
	import L5 from './components/L5/_L5.svelte';
	import L6 from './components/L6/_L6.svelte';
	import L7 from './components/L7/_L7.svelte';
	import L8 from './components/L8/_L8.svelte';
	import L9 from './components/L9/_L9.svelte';
	import L10A from './components/L10-A/_L10A.svelte';
	import L10B from './components/L10-B/_L10B.svelte';
	import L10C from './components/L10-C/_L10C.svelte';
	import L10D from './components/L10-D/_L10D.svelte';
	import L13A from './components/L13-A/_L13A.svelte';
	import L13B from './components/L13-B/_L13B.svelte';
	import L14 from './components/L14/_L14.svelte';
	import { getSptPphBadan } from './getSptPphBadan.remote';
	import { getOpiniAuditor } from './components/Induk/getOpiniAuditor.remote';
	import { getSektorUsaha } from './components/Induk/getSektorUsaha.remote';
	import { getNegara } from './components/L2/getNegara.remote';
	import { getKodeKoreksiFiskal } from './components/L1/getKodeKoreksiFiskal.remote';
	import { getLampiran1LabaRugiTemplates } from './components/L1/getLampiran1LabaRugiTemplates.remote';
	import { getLampiran1NeracaTemplates } from './components/L1/getLampiran1NeracaTemplates.remote';
	import { getJenisPenghasilanKreditPajakLuarNegeri } from './components/L3/getJenisPenghasilanKreditPajakLuarNegeri.remote';
	import { getMataUang } from './components/L3/getMataUang.remote';
	import { getJenisPajakDipotongDipungut } from './components/L3/getJenisPajakDipotongDipungut.remote';
	import { getObjekPajak } from './components/L4/getObjekPajak.remote';
	import { getJenisPenghasilanBukanObjekPajak } from './components/L4/getJenisPenghasilanBukanObjekPajak.remote';
	import { hitungFasilitas31E } from './components/L8/fasilitas31e';
	import { getJenisHarta } from './components/L9/getJenisHarta.remote';
	import { getMetodePenyusutan } from './components/L9/getMetodePenyusutan.remote';
	import { getBentukHubungan } from './components/L10-A/getBentukHubungan.remote';
	import { getJenisTransaksi } from './components/L10-A/getJenisTransaksi.remote';
	import { getMetodeHargaTransfer } from './components/L10-A/getMetodeHargaTransfer.remote';
	import { saveSptPphBadan } from './saveSptPphBadan.remote';

	const {
		readonly,
		spt,
		lampiran1,
		lampiran2,
		lampiran3,
		lampiran4,
		lampiran5,
		lampiran6,
		lampiran7,
		lampiran8,
		lampiran9,
		lampiran10a
	} = await getSptPphBadan();
	const opiniAuditorOptions = await getOpiniAuditor();
	const sektorUsahaOptions = await getSektorUsaha();
	const negaraOptions = await getNegara();
	const kodeKoreksiFiskalOptions = await getKodeKoreksiFiskal();
	const lampiran1LabaRugiTemplates = await getLampiran1LabaRugiTemplates();
	const lampiran1NeracaTemplates = await getLampiran1NeracaTemplates();
	const jenisPenghasilanKreditPajakLuarNegeriOptions = await getJenisPenghasilanKreditPajakLuarNegeri();
	const mataUangOptions = await getMataUang();
	const jenisPajakDipotongDipungutOptions = await getJenisPajakDipotongDipungut();
	const objekPajakOptions = await getObjekPajak();
	const jenisPenghasilanBukanObjekPajakOptions = await getJenisPenghasilanBukanObjekPajak();
	const jenisHartaOptions = await getJenisHarta();
	const metodePenyusutanOptions = await getMetodePenyusutan();
	const bentukHubunganOptions = await getBentukHubungan();
	const jenisTransaksiOptions = await getJenisTransaksi();
	const metodeHargaTransferOptions = await getMetodeHargaTransfer();
	const saveForm = saveSptPphBadan.for(spt.id);

	const lampiran1LabaRugiTemplatesBySektor = new Map<
		string,
		{ lampiranKode: string | null; rows: typeof lampiran1LabaRugiTemplates }
	>();
	for (const row of lampiran1LabaRugiTemplates) {
		const entry = lampiran1LabaRugiTemplatesBySektor.get(row.sektorUsahaKode) ?? {
			lampiranKode: row.lampiranKode,
			rows: []
		};
		entry.rows.push(row);
		lampiran1LabaRugiTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	const lampiran1NeracaTemplatesBySektor = new Map<string, { rows: typeof lampiran1NeracaTemplates }>();
	for (const row of lampiran1NeracaTemplates) {
		const entry = lampiran1NeracaTemplatesBySektor.get(row.sektorUsahaKode) ?? { rows: [] };
		entry.rows.push(row);
		lampiran1NeracaTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	let sektorUsaha = $state(spt.sektorUsahaKode ?? '');

	let labaRugi = $state(
		lampiran1.nilai.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilaiKomersial: row.nilaiKomersial,
			nonObjekPajak: row.nonObjekPajak,
			dikenakanPphFinal: row.dikenakanPphFinal,
			penyesuaianFiskalPositif: row.penyesuaianFiskalPositif,
			penyesuaianFiskalNegatif: row.penyesuaianFiskalNegatif,
			kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
		}))
	);

	let neraca = $state(
		lampiran1.neraca.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilai: row.nilai
		}))
	);

	let l2a = $state(
		lampiran2.pemegangSaham.map((row) => ({
			id: row.id,
			nama: row.nama,
			alamat: row.alamat,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			jabatan: row.jabatan,
			nilaiModal: row.nilaiModal,
			persentase: row.persentase,
			dividen: row.dividen
		}))
	);
	let l2b = $state(
		lampiran2.penyertaanModal.map((row) => ({
			id: row.id,
			nama: row.nama,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			modalNilai: row.modalNilai,
			modalPersen: row.modalPersen,
			utangNilai: row.utangNilai,
			utangTahun: row.utangTahun ?? 0,
			utangBunga: row.utangBunga,
			piutangNilai: row.piutangNilai,
			piutangTahun: row.piutangTahun ?? 0,
			piutangBunga: row.piutangBunga
		}))
	);

	let l3a = $state(
		lampiran3.penghasilanLuarNegeri.map((row) => ({
			id: row.id,
			namaPemberiPenghasilan: row.namaPemberiPenghasilan,
			negara: row.negaraKode,
			tanggal: row.tanggal,
			jenisPenghasilan: row.jenisPenghasilanKode,
			penghasilanNeto: row.penghasilanNeto,
			pphLuarNegeri: row.pphLuarNegeri,
			mataUang: row.mataUangKode,
			pphLuarNegeriMataUangAsing: row.pphLuarNegeriMataUangAsing,
			kreditPajakYangDapatDikreditkan: row.kreditPajakYangDapatDikreditkan,
			keterangan: row.keterangan
		}))
	);

	let l3aPengembalianPengurangan = $state(lampiran3.pengembalianPenguranganPphLuarNegeriTahunSebelumnya);

	let l3b = $state(
		lampiran3.pphDipotong.map((row) => ({
			id: row.id,
			namaPemotongPemungut: row.namaPemotongPemungut,
			npwp: row.npwp,
			jenisPajak: row.jenisPajakKode,
			dpp: row.dpp,
			pph: row.pph,
			nomorBukti: row.nomorBukti,
			tanggalBukti: row.tanggalBukti
		}))
	);

	let l4a = $state(
		lampiran4.penghasilanFinal.map((row) => ({
			id: row.id,
			npwpPemotongPemungutPenyetor: row.npwpPemotongPemungutPenyetor,
			namaPemotongPemungutPenyetor: row.namaPemotongPemungutPenyetor,
			objekPajak: row.objekPajakKode,
			dasarPengenaanPajak: row.dasarPengenaanPajak,
			tarif: row.tarif,
			pphFinalTerutang: row.pphFinalTerutang,
			nomorBuktiPotong: row.nomorBuktiPotong,
			tanggalBuktiPotong: row.tanggalBuktiPotong ?? '',
			keterangan: row.keterangan
		}))
	);

	let l4b = $state(
		lampiran4.bukanObjekPajak.map((row) => ({
			id: row.id,
			jenisPenghasilan: row.jenisPenghasilanKode,
			sumberPenghasilan: row.sumberPenghasilan,
			penghasilanBruto: row.penghasilanBruto
		}))
	);

	let l5a = $state(
		lampiran5.tku.map((t) => ({
			id: t.id,
			nitku: t.nitku,
			nama: t.nama,
			alamat: t.alamat,
			kelurahan: t.kelurahan,
			kecamatan: t.kecamatan,
			kabupaten: t.kabupaten,
			provinsi: t.provinsi,
			bulanan: Array.from({ length: 12 }, (_, i) => {
				const bulan = i + 1;
				const existing = lampiran5.bulanan.find((b) => b.tkuId === t.id && b.bulan === bulan);
				return {
					bulan,
					jumlahPeredaranBruto: existing?.jumlahPeredaranBruto ?? 0
				};
			})
		}))
	);

	let l5bDipotong = $state(
		Array.from({ length: 12 }, (_, i) => {
			const bulan = i + 1;
			const existing = lampiran5.dipotongBulanan.find((b) => b.bulan === bulan);
			return { bulan, nilai: existing?.nilai ?? 0 };
		})
	);

	let l6DasarAngsuran = $state(lampiran6.dasarAngsuran);
	let l6KompensasiKerugian = $state(lampiran6.kompensasiKerugian);
	let l6PphTerutang = $state(lampiran6.pphTerutang);
	let l6KreditPajakTahunLalu = $state(lampiran6.kreditPajakTahunLalu);
	let l6KompensasiKerugianTouched = $state(false);
	let l6PphTerutangTouched = $state(false);

	let l7 = $state(lampiran7.map((row) => ({ ...row })));

	let l8JumlahPeredaranBruto = $state(lampiran8.jumlahPeredaranBruto);

	let l9 = $state(
		lampiran9.rows.map((row) => ({
			id: row.id,
			kelompokPenyusutan: row.kelompokPenyusutan,
			jenisHarta: row.jenisHartaKode,
			kodeHarta: row.kodeHarta,
			bulanTahunPerolehan: row.bulanTahunPerolehan,
			hargaPerolehan: row.hargaPerolehan,
			nilaiSisaBukuFiskalAwalTahun: row.nilaiSisaBukuFiskalAwalTahun,
			metodePenyusutanKomersial: row.metodePenyusutanKomersial,
			metodePenyusutanFiskal: row.metodePenyusutanFiskal,
			penyusutanAmortisasiFiskalTahunIni: row.penyusutanAmortisasiFiskalTahunIni,
			penyusutanAmortisasiKomersialTahunIni: row.penyusutanAmortisasiKomersialTahunIni,
			akumulasiPenyusutanAmortisasiFiskal: row.akumulasiPenyusutanAmortisasiFiskal,
			nilaiSisaBukuFiskalAkhirTahun: row.nilaiSisaBukuFiskalAkhirTahun,
			keterangan: row.keterangan
		}))
	);

	let l9AJumlahPenyusutanKomersial = $state(lampiran9.jumlahPenyusutanKomersialA);
	let l9BJumlahPenyusutanKomersial = $state(lampiran9.jumlahPenyusutanKomersialB);
	let l9CJumlahAmortisasiKomersial = $state(lampiran9.jumlahAmortisasiKomersialC);

	let l10a = $state(
		lampiran10a.map((row) => ({
			id: row.id,
			nama: row.nama,
			npwpTin: row.npwpTin,
			negara: row.negaraKode,
			bentukHubungan: row.bentukHubunganKode,
			kegiatanUsaha: row.kegiatanUsaha,
			jenisTransaksi: row.jenisTransaksiKode,
			nilaiTransaksi: row.nilaiTransaksi,
			metodePenentuanHargaTransfer: row.metodePenentuanHargaTransferKode,
			alasanPenggunaanMetode: row.alasanPenggunaanMetode
		}))
	);

	let l6KompensasiKerugianAuto = $derived(
		l7.reduce((sum, row) => sum + Number(row.kompensasiTahunIni || 0), 0)
	);

	let l6PenghasilanKenaPajak = $derived(Number(l6DasarAngsuran || 0) - Number(l6KompensasiKerugian || 0));

	let l8PenghasilanKenaPajak = $derived(l6PenghasilanKenaPajak);

	let l8Hasil = $derived(hitungFasilitas31E(Number(l8JumlahPeredaranBruto || 0), Number(l8PenghasilanKenaPajak || 0)));

	$effect(() => {
		if (!l6KompensasiKerugianTouched) {
			l6KompensasiKerugian = l6KompensasiKerugianAuto;
		}
	});

	$effect(() => {
		if (!l6PphTerutangTouched) {
			l6PphTerutang = l8Hasil.pphTerutangJumlah;
		}
	});

	let menerimaPenghasilanPp23 = $state(Boolean(spt.menerimaPenghasilanPp23));
	let hanyaPenghasilanPp23 = $state(Boolean(spt.hanyaPenghasilanPp23));
	let menerimaPenghasilanFinal = $state(Boolean(spt.menerimaPenghasilanFinal));
	let menerimaPenghasilanBukanObjekPajak = $state(Boolean(spt.menerimaPenghasilanBukanObjekPajak));
	let diaudit = $state(Boolean(spt.opiniAuditorKode));
	let fasilitasPenanamanModal = $state(false);
	let fasilitasVokasi = $state(false);
	let kompensasiKerugian = $state(false);
	let fasilitasLitbang = $state(false);
	let kreditPajak = $state(false);
	let fasilitasPenguranganPph = $state(false);
	let persetujuanAngsuran = $state(false);
	let pengembalianPendahuluan = $state(false);
	let wajibLaporAngsuranPph25 = $state(false);
	let transaksiHubunganIstimewa = $state(false);
	let dokumenTransferPricing = $state(false);
	let penanamanModalAfiliasi = $state(false);
	let utangPiutangAfiliasi = $state(false);
	let penyusutanFiskal = $state(false);
	let biayaEntertainment = $state(false);
	let fasilitasDaerahTertentu = $state(false);
	let sisaLebihSarana = $state(false);
	let dividenLuarNegeri = $state(false);
	let pernyataanBenar = $state(false);
	let penandatangan = $state('wajib-pajak');
	let currentTab = $state({
		tab: 'Induk',
		title: ''
	});
	let saveError = $state('');

	const tarifPajakOptions = [
		'Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh',
		'Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh',
		'Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh',
		'Tarif Pajak Lainnya'
	];
	const tabs = ['Induk', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10-A', 'L10-B', 'L10-C', 'L10-D', 'L11-B', 'L13-A', 'L13-B', 'L14'];
	const tabLabel = (tab: string) => {
		if (tab !== 'L1') return tab;
		const lampiranKode = lampiran1LabaRugiTemplatesBySektor.get(sektorUsaha)?.lampiranKode;
		return `L1${lampiranKode ? `-${lampiranKode}` : ''}`;
	};
</script>

<div class="tw:w-full tw:p-10">
	<Card>
		{#snippet head()}
			<div class="tw:flex tw:w-full tw:items-center tw:justify-between">
				<span class="tw:text-2xl">SPT Tahunan PPh Badan</span>
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
								: 'Gagal menyimpan SPT PPh Badan.';
					}
				})}
			>
				<input type="hidden" name="labaRugi" value={JSON.stringify(labaRugi)} />
				<input type="hidden" name="neraca" value={JSON.stringify(neraca)} />
				<input type="hidden" name="l2a" value={JSON.stringify(l2a)} />
				<input type="hidden" name="l2b" value={JSON.stringify(l2b)} />
				<input type="hidden" name="l3a" value={JSON.stringify(l3a)} />
				<input type="hidden" name="l3aPengembalianPengurangan" value={l3aPengembalianPengurangan} />
				<input type="hidden" name="l3b" value={JSON.stringify(l3b)} />
				<input type="hidden" name="l4a" value={JSON.stringify(l4a)} />
				<input type="hidden" name="l4b" value={JSON.stringify(l4b)} />
				<input type="hidden" name="l5a" value={JSON.stringify(l5a)} />
				<input type="hidden" name="l5bDipotong" value={JSON.stringify(l5bDipotong)} />
				<input type="hidden" name="l6DasarAngsuran" value={l6DasarAngsuran} />
				<input type="hidden" name="l6KompensasiKerugian" value={l6KompensasiKerugian} />
				<input type="hidden" name="l6PphTerutang" value={l6PphTerutang} />
				<input type="hidden" name="l6KreditPajakTahunLalu" value={l6KreditPajakTahunLalu} />
				<input type="hidden" name="l7" value={JSON.stringify(l7)} />
				<input type="hidden" name="l8JumlahPeredaranBruto" value={l8JumlahPeredaranBruto} />
				<input type="hidden" name="l8PenghasilanKenaPajak" value={l8PenghasilanKenaPajak} />
				<input type="hidden" name="l9" value={JSON.stringify(l9)} />
				<input type="hidden" name="l9AJumlahPenyusutanKomersial" value={l9AJumlahPenyusutanKomersial} />
				<input type="hidden" name="l9BJumlahPenyusutanKomersial" value={l9BJumlahPenyusutanKomersial} />
				<input type="hidden" name="l9CJumlahAmortisasiKomersial" value={l9CJumlahAmortisasiKomersial} />
				<input type="hidden" name="l10a" value={JSON.stringify(l10a)} />
				<header class="tw:mb-5">
					<nav class="tw:overflow-x-auto tw:border-b tw:border-[#A9A9A9]">
						<ul class="tw:m-0! tw:flex tw:min-w-max tw:flex-row tw:p-0!">
							{#each tabs as tab}
								<li class:active-tab={currentTab.tab === tab}>
									<button type="button" onclick={() => (currentTab.tab = tab)}>{tabLabel(tab)}</button>
								</li>
							{/each}
						</ul>
					</nav>
				</header>

				<Induk bind:currentTab {spt} {readonly} bind:sektorUsaha></Induk>

				<!-- Lampiran -->
				<div class="{currentTab.tab === "Induk" ? "tw:hidden" : ""}">
					<h2>{currentTab.title}</h2>

					<!-- Header -->
					<Card>
					{#snippet head()}
						<span class="tw:text-xl!">HEADER</span>
					{/snippet}
					{#snippet body()}
						<div>
							<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
							{#snippet head()}
								<tr class="tw:hidden">
									<td><Input hidden/></td>
								</tr>
							{/snippet}
							{#snippet body()}
								<tr>
									<td class="tw:w-[20rem]"><span>Tahun Pajak/Bagian Tahun Pajak</span></td>
									<td><Input type={"text"} value={spt.tahunPajak} disabled /></td>
								</tr>
								<tr>
									<td><span class="tw:mr-10">Nomor Identitas WP</span></td>
									<td><Input type={"text"} value={"00000000000000000"} disabled /></td>
								</tr>
							{/snippet}
							</Table>
						</div>
					{/snippet}
					</Card>
				</div>

				<L1
					bind:currentTab
					{sektorUsaha}
					templatesBySektor={lampiran1LabaRugiTemplatesBySektor}
					bind:labaRugi
					neracaTemplatesBySektor={lampiran1NeracaTemplatesBySektor}
					bind:neraca
					{readonly}
					{kodeKoreksiFiskalOptions}
				/>
				<L2 bind:currentTab bind:l2a bind:l2b {readonly} {negaraOptions}/>
				<L3
					bind:currentTab
					bind:l3a
					bind:l3aPengembalianPengurangan
					bind:l3b
					{readonly}
					{negaraOptions}
					jenisPenghasilanOptions={jenisPenghasilanKreditPajakLuarNegeriOptions}
					{mataUangOptions}
					jenisPajakOptions={jenisPajakDipotongDipungutOptions}
				/>
				<L4 bind:currentTab bind:l4a bind:l4b {readonly} {objekPajakOptions} jenisPenghasilanOptions={jenisPenghasilanBukanObjekPajakOptions}/>
				<L5 bind:currentTab bind:l5a bind:l5bDipotong {readonly}/>
				<L6
					bind:currentTab
					bind:dasarAngsuran={l6DasarAngsuran}
					bind:kompensasiKerugian={l6KompensasiKerugian}
					bind:pphTerutang={l6PphTerutang}
					bind:kreditPajakTahunLalu={l6KreditPajakTahunLalu}
					onKompensasiKerugianEdit={() => (l6KompensasiKerugianTouched = true)}
					onPphTerutangEdit={() => (l6PphTerutangTouched = true)}
					{readonly}
				/>
				<L7 bind:currentTab bind:l7 {readonly}/>
				<L8
					bind:currentTab
					bind:jumlahPeredaranBruto={l8JumlahPeredaranBruto}
					penghasilanKenaPajak={l8PenghasilanKenaPajak}
					{readonly}
				/>
				<L9
					bind:currentTab
					bind:l9
					bind:jumlahPenyusutanKomersialA={l9AJumlahPenyusutanKomersial}
					bind:jumlahPenyusutanKomersialB={l9BJumlahPenyusutanKomersial}
					bind:jumlahAmortisasiKomersialC={l9CJumlahAmortisasiKomersial}
					{readonly}
					{jenisHartaOptions}
					{metodePenyusutanOptions}
				/>
				<L10A
					bind:currentTab
					bind:l10a
					{readonly}
					{negaraOptions}
					{bentukHubunganOptions}
					{jenisTransaksiOptions}
					{metodeHargaTransferOptions}
				/>
				<L10B bind:currentTab/>
				<L10C bind:currentTab/>
				<L10D bind:currentTab/>
				<L13A bind:currentTab/>
				<L13B bind:currentTab/>
				<L14 bind:currentTab/>

				{#if saveError}
					<div class="tw:mt-4">
						<Alert bg={'#dc2626'}>
							{#snippet head()}
								<span>!</span>
							{/snippet}
							{#snippet body()}
								<span>{saveError}</span>
							{/snippet}
						</Alert>
					</div>
				{/if}

				{#if !readonly}
					<div class="tw:mt-4 tw:flex tw:gap-2">
						<Button type="submit" name="action" value="Simpan Konsep" color="var(--color-secondary)"><span class="tw:text-white">Simpan Konsep</span></Button>
						<Button type="submit" name="action" value="Simpan Lapor" color="var(--color-secondary)"><span class="tw:text-white">Simpan Lapor</span></Button>
					</div>
				{/if}
			</form>
		{/snippet}
	</Card>
</div>

<style>
	nav button {
		padding: 1rem;
	}

	nav li {
		position: relative;
	}

	nav li::before {
		bottom: 0;
		left: 0;
		height: 1px;
		width: 0;
		background-color: brown;
		content: '';
		position: absolute;
		transition: 300ms;
	}

	nav li:hover::before,
	nav li.active-tab::before {
		width: 100%;
	}
</style>
