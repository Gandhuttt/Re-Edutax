<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { bpa1PtkpOptions, type Bpa1Ptkp } from '$lib/helpers/ptkp-bpa1';
	import { BPA_MAX_ANNUALIZED_MONTHS, calculateBpa } from '$lib/helpers/bpa-calc';
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		DocumentWorkspace,
		FieldGrid,
		FormActions,
		FormField,
		FormSection,
		FormIssueSummary,
		InlineAlert,
		LookupField,
		PageLayout,
		RupiahField,
		SelectField,
		ServiceWorkspace,
		Stack,
		StatusBadge,
		remoteFailureFrom
	} from '$lib/re-ui-components';
	import { getFasilitasPajakBpa1 } from '../../fasilitasPajak.remote';
	import { getPriorMonthlyWithheld } from '../../priorMonthlyWithheld.remote';
	import { getObjekPajakBpa1 } from '../../objekPajakBpa1.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa1 } from './getBpa1.remote';
	import { updateBpa1 } from './updateBpa1.remote';

	const statusLabel: Record<string, string> = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan (Submit)', AMENDMENT: 'Pembetulan', AMENDED: 'Telah Dibetulkan', CANCELLED: 'Dibatalkan', DELETED: 'Dihapus' };
	const bpa1 = await getBpa1();
	const [objekPajakOptions, fasilitasOptions] = await Promise.all([
		getObjekPajakBpa1(),
		getFasilitasPajakBpa1()
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
	let submitFailure = $state('');
	let fasilitasPajakIdState = $state(
		bpa1.fasilitasPajakId ?? fasilitasOptions.find((f) => f.kode === '9')?.id ?? ''
	);
	let jenisPemotonganState = $state(bpa1.jenisPemotongan ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bpa1.npwpPemotong}000000`;

	let gajiState = $state(bpa1.gajiPensiunThtJht);
	let isGrossUpState = $state(bpa1.isGrossUp);
	let tunjanganPphState = $state(bpa1.tunjanganPph);
	let tunjanganLainnyaState = $state(bpa1.tunjanganLainnya);
	let honorariumState = $state(bpa1.honorarium);
	let premiAsuransiState = $state(bpa1.premiAsuransi);
	let naturaState = $state(bpa1.natura);
	let tantiemBonusState = $state(bpa1.tantiemBonus);
	let jumlahBulanState = $state<number | undefined>(bpa1.jumlahBulan ?? undefined);
	let iuranPensiunState = $state(bpa1.iuranPensiun);
	let zakatState = $state(bpa1.zakat);

	let nomorBuktiSebelumnyaState = $state(bpa1.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa1.penghasilanNetoSebelumnya);
	let pphDipotongSebelumnyaState = $state(bpa1.pphPasal21DipotongSebelumnya);
	const isDisetahunkan = $derived(jenisPemotonganState === 'KURANG_SETAHUN_DISETAHUNKAN');
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));

	// Coretax refreshes "PPh Pasal 21 yang Dipotong" from the monthly MP slips
	// whenever identity, object or period changes; the server recomputes on save.
	const pphDipotongBulanan = $derived(
		selectedObjekPajak && nomorIdentitasWpState && selectedFasilitas?.kode !== '11'
			? await getPriorMonthlyWithheld({
					nomorIdentitasWp: nomorIdentitasWpState,
					nama: namaState,
					kodeObjekPajakId: selectedObjekPajak.id,
					masaPajakAwal: masaPajakAwalState,
					tahunAwal: tahunAwalState,
					masaPajakAkhir: masaPajakAkhirState,
					tahunAkhir: tahunAkhirState
				})
			: 0
	);

	// Same calculation the server runs at Simpan Konsep (bpa-calc.ts), for display.
	const calc = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas || !statusPtkpState) return null;
		try {
			return calculateBpa({
				brutoTanpaTunjanganPph:
					gajiState + tunjanganLainnyaState + honorariumState + premiAsuransiState + naturaState + tantiemBonusState,
				tunjanganPph: tunjanganPphState,
				grossUp: isGrossUpState,
				masaPajakAwal: masaPajakAwalState,
				tahunAwal: tahunAwalState,
				masaPajakAkhir: masaPajakAkhirState,
				tahunAkhir: tahunAkhirState,
				kodeObjek: selectedObjekPajak.kode,
				disetahunkan: isDisetahunkan,
				jumlahBulan: jumlahBulanState ?? null,
				iuranPensiun: iuranPensiunState,
				zakat: zakatState,
				penghasilanNetoSebelumnya: penghasilanNetoSebelumnyaState,
				statusPtkp: statusPtkpState as Bpa1Ptkp,
				pphDipotongSebelumnya: pphDipotongSebelumnyaState,
				parameterData: selectedObjekPajak.parameterData,
				facilityKode: selectedFasilitas.kode,
				dtp: selectedFasilitas.kode === '11',
				pphDipotongBulanan
			});
		} catch {
			return null;
		}
	});

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
		{#if !bpa1.canEdit}
			<InlineAlert tone="warning" title={bpa1.diterbitkan ? 'Telah diterbitkan' : `Status ${statusLabel[bpa1.status] ?? bpa1.status}`}>Bukti potong ini tidak dapat diubah.</InlineAlert>
		{/if}
		{#if bpa1.pembetulanKe > 0 || bpa1.pembetulanDariId}
			<InlineAlert tone="info" title={`Pembetulan ke-${bpa1.pembetulanKe}`}>{#if bpa1.pembetulanDari}Pembetulan dari <a href={`/ebupot/bpa1/${bpa1.pembetulanDari.id}`}>{bpa1.pembetulanDari.nomorPemotongan ?? 'bukti potong asal'}</a>.{:else}Bukti potong asal tidak dapat ditampilkan.{/if}</InlineAlert>
		{/if}
		<FormSection number="01" title="Informasi Umum" bordered><FieldGrid columns={2}>
			<SelectField label="Bekerja di Lebih dari Satu Pemberi Kerja" name="bekerjaDiLebihDariSatuPemberiKerja" bind:value={bekerjaLebihState} disabled={!bpa1.canEdit} options={[{value:'false',label:'Tidak'},{value:'true',label:'Ya'}]} />
			<SelectField label="Pegawai Asing" name="pegawaiAsing" bind:value={pegawaiAsingState} disabled={!bpa1.canEdit} options={[{value:'false',label:'Tidak'},{value:'true',label:'Ya'}]} />
			<SelectField label="Masa Pajak Awal" name="masaPajakAwal" bind:value={masaPajakAwalState} disabled={!bpa1.canEdit} options={months.map((m) => ({value:m,label:formatMonth(m)}))} />
			<FormField label="Tahun Awal" name="tahunAwal" type="number" bind:value={() => String(tahunAwalState), (v) => (tahunAwalState = Number(v))} disabled={!bpa1.canEdit} />
			<SelectField label="Masa Pajak Akhir" name="masaPajakAkhir" bind:value={masaPajakAkhirState} disabled={!bpa1.canEdit} options={months.map((m) => ({value:m,label:formatMonth(m)}))} />
			<FormField label="Tahun Akhir" name="tahunAkhir" type="number" bind:value={() => String(tahunAkhirState), (v) => (tahunAkhirState = Number(v))} disabled={!bpa1.canEdit} />
			<FormField label="Status" value={statusLabel[bpa1.status] ?? bpa1.status} disabled />
			<LookupField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={bpa1.canEdit} disabled={!bpa1.canEdit} inputmode="numeric" maxlength={16} onlookup={cariNpwpPenerima} />
			<FormField label="Nama" name="nama" bind:value={namaState} disabled={!bpa1.canEdit} />
			<SelectField label="Status PTKP" name="statusPtkp" bind:value={statusPtkpState} disabled={!bpa1.canEdit} options={bpa1PtkpOptions.map((p) => ({value:p.value,label:p.label}))} />
			<FormField label="Jabatan" name="jabatan" bind:value={jabatanState} disabled={!bpa1.canEdit} />
			<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" bind:value={kodeObjekPajakIdState} disabled={!bpa1.canEdit} options={objekPajakOptions.map((o) => ({value:o.id,label:o.nama}))} />
			<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled /><FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
			<SelectField label="Jenis Pemotongan" name="jenisPemotongan" bind:value={jenisPemotonganState} disabled={!bpa1.canEdit} options={jenisPemotonganOptions} />
			{#if isDisetahunkan}<FormField label="Number Of Months" name="jumlahBulan" type="number" min="1" max={String(BPA_MAX_ANNUALIZED_MONTHS)} step="1" bind:value={() => jumlahBulanState === undefined ? '' : String(jumlahBulanState), (v) => (jumlahBulanState = v === '' ? undefined : Number(v))} required disabled={!bpa1.canEdit} />{/if}
		</FieldGrid></FormSection>
		<FormSection number="02" title="Penghasilan Bruto" bordered><FieldGrid columns={2}>
			<RupiahField label="Gaji/Pensiun atau THT/JHT (Rp)" name="gajiPensiunThtJht" bind:value={gajiState} disabled={!bpa1.canEdit} />
			<CheckboxField label="Penghitungan Gross Up" bind:checked={isGrossUpState} disabled={!bpa1.canEdit} /><input type="hidden" name="isGrossUp" value={String(isGrossUpState)} />
			{#if isGrossUpState}<RupiahField label="Tunjangan PPh (Rp)" value={calc?.tunjanganPph ?? 0} disabled /><input type="hidden" name="tunjanganPph" value="0" />{:else}<RupiahField label="Tunjangan PPh (Rp)" name="tunjanganPph" bind:value={tunjanganPphState} disabled={!bpa1.canEdit} />{/if}
			<RupiahField label="Tunjangan Lainnya, Uang Lembur dan Sebagainya (Rp)" name="tunjanganLainnya" bind:value={tunjanganLainnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Honorarium dan Imbalan Lain Sejenisnya (Rp)" name="honorarium" bind:value={honorariumState} disabled={!bpa1.canEdit} /><RupiahField label="Premi Asuransi yang Dibayar Pemberi Kerja (Rp)" name="premiAsuransi" bind:value={premiAsuransiState} disabled={!bpa1.canEdit} /><RupiahField label="Penerimaan Dalam bentuk Natura dan Kenikmatan Lainnya (Rp)" name="natura" bind:value={naturaState} disabled={!bpa1.canEdit} /><RupiahField label="Tantiem, Bonus, Gratifikasi, Jasa Produksi dan THR (Rp)" name="tantiemBonus" bind:value={tantiemBonusState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Penghasilan Bruto (Rp)" value={calc?.penghasilanBruto ?? 0} disabled />
		</FieldGrid></FormSection>
		<FormSection number="03" title="Pengurang" bordered><FieldGrid columns={2}>
			<RupiahField label="Biaya Jabatan / Biaya Pensiun (Rp)" value={calc?.biayaJabatan ?? 0} disabled /><RupiahField label="Iuran terkait Pensiun atau Hari Tua (Rp)" name="iuranPensiun" bind:value={iuranPensiunState} disabled={!bpa1.canEdit} /><RupiahField label="Zakat atau Sumbangan Keagamaan yang Bersifat Wajib (Rp)" name="zakat" bind:value={zakatState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Pengurangan (Rp)" value={calc?.jumlahPengurangan ?? 0} disabled /><RupiahField label="Jumlah Penghasilan Neto (Rp)" value={calc?.penghasilanNeto ?? 0} disabled />
		</FieldGrid></FormSection>
		<FormSection number="04" title="Penghitungan PPh Pasal 21" bordered><FieldGrid columns={2}>
			<FormField label="Nomor Bukti Pemotongan BPA1 dari Pemberi Kerja Sebelumnya (Apabila ada)" name="nomorBuktiSebelumnya" bind:value={nomorBuktiSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Penghasilan Neto dari Pemotongan Sebelumnya (Rp)" name="penghasilanNetoSebelumnya" bind:value={penghasilanNetoSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21 (Setahun/Disetahunkan) (Rp)" value={calc?.penghasilanNetoSetahunDisetahunkan ?? 0} disabled /><RupiahField label="Penghasilan Tidak Kena Pajak (Rp)" value={calc?.penghasilanTidakKenaPajak ?? 0} disabled /><RupiahField label="Penghasilan Kena Pajak Setahun / Disetahunkan (Rp)" value={calc?.penghasilanKenaPajak ?? 0} disabled /><FormField label="Tarif (%)" value={String(calc?.tarif ?? 0)} disabled /><RupiahField label="PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan (Rp)" value={calc?.pphPasal21AtasPkp ?? 0} disabled /><RupiahField label="PPh Pasal 21 Terutang (Rp)" value={calc?.pphPasal21Terutang ?? 0} disabled /><RupiahField label="PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya (Rp)" name="pphPasal21DipotongSebelumnya" bind:value={pphDipotongSebelumnyaState} disabled={!bpa1.canEdit} /><RupiahField label="PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan) (Rp)" value={calc?.pphPasal21TerutangPadaIni ?? 0} disabled /><RupiahField label="PPh Pasal 21 yang Dipotong/Ditanggung Pemerintah (Rp)" value={calc?.pphDipotongAtauDitanggung ?? 0} disabled /><RupiahField label="PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir (Rp)" value={calc?.pphKurangLebihDipotongDesember ?? 0} disabled /><SelectField label="Jenis Fasilitas pada Masa Pajak Desember/Masa Pajak Terakhir" name="fasilitasPajakId" bind:value={fasilitasPajakIdState} disabled={!bpa1.canEdit} options={fasilitasOptions.map((f) => ({value:f.id,label:f.nama}))} /><FormField label="KAP-KJS" value={selectedObjekPajak?.kap ?? ''} disabled /><FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
		</FieldGrid><InlineAlert title="Informasi perhitungan" message="PPh Pasal 21 yang Dipotong diambil dari Bukti Pemotongan Bulanan Pegawai Tetap yang telah terbit untuk penerima dan objek pajak yang sama sebelum masa pajak terakhir. Fasilitas PPh Pasal 21 Ditanggung Pemerintah memindahkan seluruh PPh Terutang ke kolom tersebut." tone="info" /></FormSection>
		{#if bpa1.canEdit}
			{#if !selectedObjekPajak}
				<InlineAlert tone="info" compact message="Pilih Nama Objek Pajak pada Informasi Umum agar KAP-KJS terisi otomatis." />
			{/if}
			<FormIssueSummary source={updateBpa1.fields} />
			{#if submitFailure}<InlineAlert tone="error" title="Penyimpanan gagal" message={submitFailure} />{/if}
			<FormActions>
				<ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpa1')}>Kembali</ActionButton>
				<ActionButton type="submit" name="intent" value="draft" tone="secondary" pending={updateBpa1.pending > 0}>Simpan Konsep</ActionButton>
				<ActionButton type="submit" name="intent" value="submit" tone="danger" pending={updateBpa1.pending > 0}>Submit</ActionButton>
			</FormActions>
		{:else}
			<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpa1')}>Kembali</ActionButton></FormActions>
		{/if}
	</Stack>
{/snippet}

<svelte:head><title>e-Bupot BPA1</title></svelte:head>
<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{label:'Beranda',href:'/dashboard'},{label:'e-Bupot',href:'/ebupot/bpa1'},{label:'BPA1'}]} /><ServiceWorkspace identity={{eyebrow:'Wajib Pajak',name:String(appPage.data.user?.name ?? 'Wajib Pajak'),identifier:String(appPage.data.user?.username ?? ''),mark:'EB'}} groups={[{label:'e-Bupot',links:[{label:'Bukti Potong Saya',href:'/ebupot/bukti-potong-saya'},{label:'BPPU',href:'/ebupot/bpu'},{label:'BP21',href:'/ebupot/bp21'},{label:'BP26',href:'/ebupot/bp26'},{label:'BPA1',href:'/ebupot/bpa1',active:true},{label:'BPA2',href:'/ebupot/bpa2'},{label:'Bukti Pemotongan Bulanan Pegawai Tetap',href:'/ebupot/mp'}]}]}><DocumentWorkspace>
	{#if bpa1.nomorPemotongan}<p>Nomor Pemotongan: <code>{bpa1.nomorPemotongan}</code> <StatusBadge label="Telah Terbit" tone="success" /></p>{/if}
	{#if bpa1.canEdit}
		<form {...updateBpa1.enhance(async (form) => {
			submitFailure = '';
			try {
				await form.submit();
			} catch (cause) {
				submitFailure = remoteFailureFrom(cause).message;
			}
		})}>{@render formContent()}</form>
	{:else}{@render formContent()}{/if}
</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>
