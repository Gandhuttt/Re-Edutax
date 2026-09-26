<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { bpa1PtkpOptions } from '$lib/helpers/ptkp-bpa1';
	import {
		ActionButton,
		Breadcrumbs,
		DocumentWorkspace,
		FieldGrid,
		FormActions,
		FormField,
		FormSection,
		InlineAlert,
		LookupField,
		PageLayout,
		RupiahField,
		SelectField,
		ServiceWorkspace,
		Stack
	} from '$lib/re-ui-components';
	import { getFasilitasPajakBpa1 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBpa1 } from '../../objekPajakBpa1.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa1 } from './getBpa1.remote';
	import { submitBpa1 } from './submitBpa1.remote';
	import { terbitkanBpa1 } from '../terbitkanBpa1.remote';
	import { updateBpa1 } from './updateBpa1.remote';

	const bpa1 = await getBpa1();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([
		getObjekPajakBpa1(),
		getFasilitasPajakBpa1(),
		getJenisDokumenEbupot()
	]);

	let masaPajakAwalState = $state(bpa1.masaPajakAwal);
	let tahunAwalState = $state(bpa1.tahunAwal);
	let masaPajakAkhirState = $state(bpa1.masaPajakAkhir);
	let tahunAkhirState = $state(bpa1.tahunAkhir);
	let bekerjaLebihState = $state(String(bpa1.bekerjaDiLebihDariSatuPemberiKerja));
	let pegawaiAsingState = $state(String(bpa1.pegawaiAsing));
	let nomorIdentitasWpState = $state(bpa1.nomorIdentitasWp);
	let namaState = $state(bpa1.nama);
	let statusPtkpState = $state(bpa1.statusPtkp ?? '');
	let jabatanState = $state(bpa1.jabatan);
	let kodeObjekPajakIdState = $state(bpa1.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(
		bpa1.fasilitasPajakId ?? fasilitasOptions.find((f) => f.kode === '9')?.id ?? ''
	);
	let jenisPemotonganState = $state(bpa1.jenisPemotongan ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bpa1.npwpPemotong}000000`;

	let gajiState = $state(bpa1.gajiPensiunThtJht);
	let tunjanganPphState = $state(bpa1.tunjanganPph);
	let tunjanganLainnyaState = $state(bpa1.tunjanganLainnya);
	let honorariumState = $state(bpa1.honorarium);
	let premiAsuransiState = $state(bpa1.premiAsuransi);
	let naturaState = $state(bpa1.natura);
	let tantiemBonusState = $state(bpa1.tantiemBonus);
	const jumlahPenghasilanBruto = $derived(
		gajiState +
			tunjanganPphState +
			tunjanganLainnyaState +
			honorariumState +
			premiAsuransiState +
			naturaState +
			tantiemBonusState
	);

	const monthCount = $derived(
		(tahunAkhirState - tahunAwalState) * 12 + (masaPajakAkhirState - masaPajakAwalState) + 1
	);
	let jumlahBulanState = $state<number | undefined>(bpa1.jumlahBulan ?? undefined);
	const biayaJabatan = $derived(
		Math.min(Math.round(jumlahPenghasilanBruto * 0.05), 500_000 * Math.max(monthCount, 0))
	);
	let iuranPensiunState = $state(bpa1.iuranPensiun);
	let zakatState = $state(bpa1.zakat);
	const jumlahPengurangan = $derived(biayaJabatan + iuranPensiunState + zakatState);
	const penghasilanNeto = $derived(jumlahPenghasilanBruto - jumlahPengurangan);

	let jenisDokumenIdState = $state(bpa1.jenisDokumenId ?? '');
	let nomorDokumenState = $state(bpa1.nomorDokumen);
	let tanggalDokumenState = $state(bpa1.tanggalDokumen ?? '');

	let nomorBuktiSebelumnyaState = $state(bpa1.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa1.penghasilanNetoSebelumnya);
	const netoGabungan = $derived(penghasilanNeto + penghasilanNetoSebelumnyaState);
	const isDisetahunkan = $derived(jenisPemotonganState === 'KURANG_SETAHUN_DISETAHUNKAN');
	const penghasilanNetoSetahunDisetahunkan = $derived(
		!isDisetahunkan
			? netoGabungan
			: jumlahBulanState && jumlahBulanState > 0
				? Math.round((netoGabungan * 12) / jumlahBulanState)
				: 0
	);

	const ptkpAmounts: Record<string, number> = {
		TK0: 54_000_000,
		TK1: 58_500_000,
		TK2: 63_000_000,
		TK3: 67_500_000,
		K0: 58_500_000,
		K1: 63_000_000,
		K2: 67_500_000,
		K3: 72_000_000
	};
	const penghasilanTidakKenaPajak = $derived(ptkpAmounts[statusPtkpState] ?? 0);
	const penghasilanKenaPajak = $derived(
		Math.max(
			0,
			Math.floor((penghasilanNetoSetahunDisetahunkan - penghasilanTidakKenaPajak) / 1000) * 1000
		)
	);

	// Client-side mirror of resolveBpa1Tax, for display only -- the server
	// is the source of truth at save time. Same tax(x) = x*Rate/100-Minus
	// mechanism as BP21's cumulative branch.
	const resolvedTax = $derived.by(() => {
		if (!selectedObjekPajak) return { tarif: 0, pajakPenghasilan: 0 };
		const fasilitas = fasilitasOptions.find((f) => f.id === fasilitasPajakIdState);
		if (!fasilitas) return { tarif: 0, pajakPenghasilan: 0 };
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) =>
				entry.TaxCertificateCode === fasilitas.kode ||
				entry.TaxCertificateCodes?.includes(fasilitas.kode)
		);
		if (!item || penghasilanKenaPajak <= 0) return { tarif: 0, pajakPenghasilan: 0 };
		const band = item.Rates?.find(
			(b) => penghasilanKenaPajak >= b.Min && penghasilanKenaPajak <= b.Max
		);
		if (!band) return { tarif: 0, pajakPenghasilan: 0 };
		return {
			tarif: band.Rate,
			pajakPenghasilan: Math.round(penghasilanKenaPajak * (band.Rate / 100) - (band.Minus ?? 0))
		};
	});
	const pphPasal21Terutang = $derived(
		!isDisetahunkan
			? resolvedTax.pajakPenghasilan
			: jumlahBulanState && jumlahBulanState > 0
				? Math.round((resolvedTax.pajakPenghasilan * jumlahBulanState) / 12)
				: 0
	);
	let pphDipotongSebelumnyaState = $state(bpa1.pphPasal21DipotongSebelumnya);
	const pphTerutangPadaIni = $derived(pphPasal21Terutang - pphDipotongSebelumnyaState);

	// Fasilitas code 11 = PPh Pasal 21 DTP -- moves this bukti's tax to
	// "Ditanggung Pemerintah" instead of the employee's own credit.
	const pphDitanggungPemerintah = $derived.by(() => {
		const fasilitas = fasilitasOptions.find((f) => f.id === fasilitasPajakIdState);
		return fasilitas?.kode === '11' ? pphTerutangPadaIni : 0;
	});
	// Live-verified on Coretax: with no prior monthly Bukti Pemotongan
	// Bulanan Pegawai Tetap recorded, this equals PPh Terutang pada Ini
	// minus PPh Ditanggung Pemerintah -- see updateBpa1.remote.ts.
	const pphKurangLebihDesember = $derived(pphTerutangPadaIni - pphDitanggungPemerintah);

	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) {
			namaState = wp.nama;
		} else if (
			nomorIdentitasWpState &&
			confirm(
				`TIN ${nomorIdentitasWpState} saat ini belum terdaftar dalam sistem. Sistem akan otomatis menggunakan TIN 9990000000999000 sebagai TIN penerima penghasilan.`
			)
		) {
			namaState = `PENERIMA PENGHASILAN#${nomorIdentitasWpState}`;
			nomorIdentitasWpState = '9990000000999000';
		}
	}

	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const jenisPemotonganOptions = [
		{ value: 'KURANG_SETAHUN', label: 'Kurang dari Setahun' },
		{
			value: 'KURANG_SETAHUN_DISETAHUNKAN',
			label: 'Kurang dari setahun yang penghasilannya disetahunkan'
		},
		{ value: 'SETAHUN_PENUH', label: 'Setahun Penuh' }
	];
</script>

{#snippet formContent()}
	<Stack gap="16px">
		<FormSection number="01" title="Informasi Umum" bordered><FieldGrid columns={2}>
			<SelectField label="Bekerja di Lebih dari Satu Pemberi Kerja" name="bekerjaDiLebihDariSatuPemberiKerja" bind:value={bekerjaLebihState} disabled={!bpa1.canEdit} options={[{value:'false',label:'Tidak'},{value:'true',label:'Ya'}]} />
			<SelectField label="Pegawai Asing" name="pegawaiAsing" bind:value={pegawaiAsingState} disabled={!bpa1.canEdit} options={[{value:'false',label:'Tidak'},{value:'true',label:'Ya'}]} />
			<SelectField label="Masa Pajak Awal" name="masaPajakAwal" bind:value={masaPajakAwalState} disabled={!bpa1.canEdit} options={months.map((m) => ({value:m,label:formatMonth(m)}))} />
			<FormField label="Tahun Awal" name="tahunAwal" type="number" bind:value={() => String(tahunAwalState), (v) => (tahunAwalState = Number(v))} disabled={!bpa1.canEdit} />
			<SelectField label="Masa Pajak Akhir" name="masaPajakAkhir" bind:value={masaPajakAkhirState} disabled={!bpa1.canEdit} options={months.map((m) => ({value:m,label:formatMonth(m)}))} />
			<FormField label="Tahun Akhir" name="tahunAkhir" type="number" bind:value={() => String(tahunAkhirState), (v) => (tahunAkhirState = Number(v))} disabled={!bpa1.canEdit} />
			<FormField label="Status" value={bpa1.status} disabled />
			<LookupField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={bpa1.canEdit} disabled={!bpa1.canEdit} inputmode="numeric" maxlength={16} onlookup={cariNpwpPenerima} />
			<FormField label="Nama" name="nama" bind:value={namaState} disabled={!bpa1.canEdit} />
			<SelectField label="Status PTKP" name="statusPtkp" bind:value={statusPtkpState} disabled={!bpa1.canEdit} options={bpa1PtkpOptions.map((p) => ({value:p.value,label:p.label}))} />
			<FormField label="Jabatan" name="jabatan" bind:value={jabatanState} disabled={!bpa1.canEdit} />
			<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" bind:value={kodeObjekPajakIdState} disabled={!bpa1.canEdit} options={objekPajakOptions.map((o) => ({value:o.id,label:o.nama}))} />
			<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled /><FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
			<SelectField label="Jenis Pemotongan" name="jenisPemotongan" bind:value={jenisPemotonganState} disabled={!bpa1.canEdit} options={jenisPemotonganOptions} />
			{#if isDisetahunkan}<FormField label="Number Of Months" name="jumlahBulan" type="number" min="1" max="12" step="1" bind:value={() => jumlahBulanState === undefined ? '' : String(jumlahBulanState), (v) => (jumlahBulanState = v === '' ? undefined : Number(v))} required disabled={!bpa1.canEdit} />{/if}
		</FieldGrid></FormSection>
		<FormSection number="02" title="Penghasilan Bruto" bordered><FieldGrid columns={2}>
			<RupiahField label="Gaji/Pensiun atau THT/JHT (Rp)" name="gajiPensiunThtJht" bind:value={gajiState} disabled={!bpa1.canEdit} /><RupiahField label="Tunjangan PPh (Rp)" name="tunjanganPph" bind:value={tunjanganPphState} disabled={!bpa1.canEdit} /><RupiahField label="Tunjangan Lainnya, Uang Lembur dan Sebagainya (Rp)" name="tunjanganLainnya" bind:value={tunjanganLainnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Honorarium dan Imbalan Lain Sejenisnya (Rp)" name="honorarium" bind:value={honorariumState} disabled={!bpa1.canEdit} /><RupiahField label="Premi Asuransi yang Dibayar Pemberi Kerja (Rp)" name="premiAsuransi" bind:value={premiAsuransiState} disabled={!bpa1.canEdit} /><RupiahField label="Penerimaan Dalam bentuk Natura dan Kenikmatan Lainnya (Rp)" name="natura" bind:value={naturaState} disabled={!bpa1.canEdit} /><RupiahField label="Tantiem, Bonus, Gratifikasi, Jasa Produksi dan THR (Rp)" name="tantiemBonus" bind:value={tantiemBonusState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Penghasilan Bruto (Rp)" value={jumlahPenghasilanBruto} disabled />
		</FieldGrid></FormSection>
		<FormSection number="03" title="Pengurang" bordered><FieldGrid columns={2}>
			<RupiahField label="Biaya Jabatan / Biaya Pensiun (Rp)" value={biayaJabatan} disabled /><RupiahField label="Iuran terkait Pensiun atau Hari Tua (Rp)" name="iuranPensiun" bind:value={iuranPensiunState} disabled={!bpa1.canEdit} /><RupiahField label="Zakat atau Sumbangan Keagamaan yang Bersifat Wajib (Rp)" name="zakat" bind:value={zakatState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Pengurangan (Rp)" value={jumlahPengurangan} disabled /><RupiahField label="Jumlah Penghasilan Neto (Rp)" value={penghasilanNeto} disabled />
		</FieldGrid></FormSection>
		<FormSection number="04" title="Penghitungan PPh Pasal 21" bordered><FieldGrid columns={2}>
			<FormField label="Nomor Bukti Pemotongan BPA1 dari Pemberi Kerja Sebelumnya (Apabila ada)" name="nomorBuktiSebelumnya" bind:value={nomorBuktiSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Penghasilan Neto dari Pemotongan Sebelumnya (Rp)" name="penghasilanNetoSebelumnya" bind:value={penghasilanNetoSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21 (Setahun/Disetahunkan) (Rp)" value={penghasilanNetoSetahunDisetahunkan} disabled /><RupiahField label="Penghasilan Tidak Kena Pajak (Rp)" value={penghasilanTidakKenaPajak} disabled /><RupiahField label="Penghasilan Kena Pajak Setahun / Disetahunkan (Rp)" value={penghasilanKenaPajak} disabled /><FormField label="Tarif (%)" value={String(resolvedTax.tarif)} disabled /><RupiahField label="PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan (Rp)" value={resolvedTax.pajakPenghasilan} disabled /><RupiahField label="PPh Pasal 21 Terutang (Rp)" value={pphPasal21Terutang} disabled /><RupiahField label="PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya (Rp)" name="pphPasal21DipotongSebelumnya" bind:value={pphDipotongSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan) (Rp)" value={pphTerutangPadaIni} disabled /><RupiahField label="PPh Pasal 21 yang Dipotong/Ditanggung Pemerintah (Rp)" value={pphDitanggungPemerintah} disabled /><RupiahField label="PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir (Rp)" value={pphKurangLebihDesember} disabled /><SelectField label="Jenis Fasilitas pada Masa Pajak Desember/Masa Pajak Terakhir" name="fasilitasPajakId" bind:value={fasilitasPajakIdState} disabled={!bpa1.canEdit} options={fasilitasOptions.map((f) => ({value:f.id,label:f.nama}))} /><FormField label="KAP-KJS" value={selectedObjekPajak?.kap ?? ''} disabled /><FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
		</FieldGrid><InlineAlert title="Informasi perhitungan" message="Fasilitas PPh Pasal 21 Ditanggung Pemerintah memindahkan PPh Terutang ke Ditanggung Pemerintah. Perhitungan belum memiliki riwayat pemotongan bulanan." tone="info" /></FormSection>
		<FormSection number="05" title="Dokumen Referensi" bordered><FieldGrid columns={2}><SelectField label="Jenis Dokumen" name="jenisDokumenId" bind:value={jenisDokumenIdState} disabled={!bpa1.canEdit} options={jenisDokumenOptions.map((d) => ({value:d.id,label:d.nama}))} /><FormField label="Nomor Dokumen" name="nomorDokumen" bind:value={nomorDokumenState} disabled={!bpa1.canEdit} /><FormField label="Tanggal Dokumen" name="tanggalDokumen" type="date" bind:value={tanggalDokumenState} disabled={!bpa1.canEdit} /></FieldGrid></FormSection>
	</Stack>
{/snippet}

<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{label:'Beranda',href:'/'},{label:'e-Bupot'},{label:'BPA1'}]} /><ServiceWorkspace identity={{eyebrow:'Wajib Pajak',name:String(appPage.data.user?.name ?? 'Wajib Pajak'),identifier:String(appPage.data.user?.username ?? ''),mark:'EB'}} groups={[{label:'e-Bupot',links:[{label:'Bukti Potong Saya',href:'/ebupot/bukti-potong-saya'},{label:'BPPU',href:'/ebupot/bpu'},{label:'BP21',href:'/ebupot/bp21'},{label:'BP26',href:'/ebupot/bp26'},{label:'BPA1',href:'/ebupot/bpa1',active:true},{label:'BPA2',href:'/ebupot/bpa2'},{label:'Bukti Pemotongan Bulanan Pegawai Tetap',href:'/ebupot/mp'}]}]}><DocumentWorkspace>{#if bpa1.canEdit}<form {...updateBpa1}>{@render formContent()}<FormActions><a href="/ebupot/bpa1"><ActionButton tone="quiet">Kembali</ActionButton></a><ActionButton type="submit">Simpan Konsep</ActionButton></FormActions></form><FormActions>{#if bpa1.status !== 'SUBMITTED'}<form {...submitBpa1}><ActionButton type="submit" tone="danger">Submit</ActionButton></form>{:else}<form {...terbitkanBpa1.for(bpa1.id)}><ActionButton type="submit">Terbitkan</ActionButton></form>{/if}</FormActions>{:else}{#if bpa1.nomorPemotongan}<p>Nomor Pemotongan: <span>{bpa1.nomorPemotongan}</span></p>{/if}{@render formContent()}{/if}</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>
