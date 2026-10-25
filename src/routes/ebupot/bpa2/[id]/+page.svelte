<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormSection, InlineAlert, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack, StatusBadge } from '$lib/re-ui-components';
	import { formatMonth } from '$lib/helpers/date';
	import { BPA_MAX_ANNUALIZED_MONTHS, calculateBpa } from '$lib/helpers/bpa-calc';
	import { bpa1PtkpOptions, type Bpa1Ptkp } from '$lib/helpers/ptkp-bpa1';
	import { getObjekPajakBpa2 } from '../../objekPajakBpa2.remote';
	import { getPriorMonthlyWithheld } from '../../priorMonthlyWithheld.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa2 } from './getBpa2.remote';
	import { updateBpa2 } from './updateBpa2.remote';

	const statusLabel: Record<string, string> = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan (Submit)', AMENDMENT: 'Pembetulan', AMENDED: 'Telah Dibetulkan', CANCELLED: 'Dibatalkan', DELETED: 'Dihapus' };
	const bpa2 = await getBpa2();
	const objekPajakOptions = await getObjekPajakBpa2();

	let masaPajakAwalState = $state(bpa2.masaPajakAwal);
	let tahunAwalState = $state(bpa2.tahunAwal);
	let masaPajakAkhirState = $state(bpa2.masaPajakAkhir);
	let tahunAkhirState = $state(bpa2.tahunAkhir);
	let bekerjaLebihState = $state(String(bpa2.bekerjaDiLebihDariSatuPemberiKerja));
	let nomorIdentitasWpState = $state(bpa2.nomorIdentitasWp);
	let namaState = $state(bpa2.nama);
	let nipState = $state(bpa2.nip);
	let pangkatGolonganState = $state(bpa2.pangkatGolongan);
	let statusPtkpState = $state(bpa2.statusPtkp ?? '');
	let posisiState = $state(bpa2.posisi);
	let kodeObjekPajakIdState = $state(bpa2.kodeObjekPajakId ?? '');
	let jenisPemotonganState = $state(bpa2.jenisPemotongan ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bpa2.npwpPemotong}000000`;

	let gajiPokokState = $state(bpa2.gajiPokokPensiun);
	let tunjanganIstriState = $state(bpa2.tunjanganIstri);
	let tunjanganAnakState = $state(bpa2.tunjanganAnak);
	let tunjanganPerbaikanState = $state(bpa2.tunjanganPerbaikanPenghasilan);
	let tunjanganStrukturalState = $state(bpa2.tunjanganStrukturalFungsional);
	let tunjanganBerasState = $state(bpa2.tunjanganBeras);
	let tunjanganLainLainState = $state(bpa2.tunjanganLainLain);
	let penghasilanTetapLainnyaState = $state(bpa2.penghasilanTetapTeraturLainnya);
	let jumlahBulanState = $state<number | undefined>(bpa2.jumlahBulan ?? undefined);
	let iuranPensiunState = $state(bpa2.iuranPensiun);
	let zakatState = $state(bpa2.zakat);
	let nomorBuktiSebelumnyaState = $state(bpa2.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa2.penghasilanNetoSebelumnya);
	let pphDipotongSebelumnyaState = $state(bpa2.pphPasal21DipotongSebelumnya);
	const isDisetahunkan = $derived(jenisPemotonganState === 'KURANG_SETAHUN_DISETAHUNKAN');

	// Coretax refreshes "PPh Pasal 21 yang Telah Dipotong" from the monthly MP
	// slips whenever identity, object or period changes; the server recomputes on save.
	const pphDipotongBulanan = $derived(
		selectedObjekPajak && nomorIdentitasWpState
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
		if (!selectedObjekPajak || !statusPtkpState) return null;
		try {
			return calculateBpa({
				brutoTanpaTunjanganPph:
					gajiPokokState +
					tunjanganIstriState +
					tunjanganAnakState +
					tunjanganPerbaikanState +
					tunjanganStrukturalState +
					tunjanganBerasState +
					tunjanganLainLainState +
					penghasilanTetapLainnyaState,
				tunjanganPph: 0,
				grossUp: false,
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
				facilityKode: null,
				dtp: false,
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
{#snippet content()}
	<Stack gap="18px">
		{#if !bpa2.canEdit}
			<InlineAlert tone="warning" title={bpa2.diterbitkan ? 'Telah diterbitkan' : `Status ${statusLabel[bpa2.status] ?? bpa2.status}`}>Bukti potong ini tidak dapat diubah.</InlineAlert>
		{/if}
		{#if bpa2.pembetulanKe > 0 || bpa2.pembetulanDariId}
			<InlineAlert tone="info" title={`Pembetulan ke-${bpa2.pembetulanKe}`}>{#if bpa2.pembetulanDari}Pembetulan dari <a href={`/ebupot/bpa2/${bpa2.pembetulanDari.id}`}>{bpa2.pembetulanDari.nomorPemotongan ?? 'bukti potong asal'}</a>.{:else}Bukti potong asal tidak dapat ditampilkan.{/if}</InlineAlert>
		{/if}
		<FormSection number="01" title="Informasi Umum" bordered>
			<FieldGrid>
				<SelectField label="Bekerja di Lebih dari Satu Pemberi Kerja" name="bekerjaDiLebihDariSatuPemberiKerja" bind:value={bekerjaLebihState} disabled={!bpa2.canEdit} options={[{ value: 'false', label: 'Tidak' }, { value: 'true', label: 'Ya' }]} />
				<SelectField label="Masa Pajak Awal" name="masaPajakAwal" bind:value={masaPajakAwalState} disabled={!bpa2.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
				<FormField label="Tahun Awal" name="tahunAwal" type="number" bind:value={() => String(tahunAwalState), (v) => (tahunAwalState = Number(v))} disabled={!bpa2.canEdit} />
				<SelectField label="Masa Pajak Akhir" name="masaPajakAkhir" bind:value={masaPajakAkhirState} disabled={!bpa2.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
				<FormField label="Tahun Akhir" name="tahunAkhir" type="number" bind:value={() => String(tahunAkhirState), (v) => (tahunAkhirState = Number(v))} disabled={!bpa2.canEdit} />
				<FormField label="Status" value={statusLabel[bpa2.status] ?? bpa2.status} disabled />
				<LookupField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={bpa2.canEdit} disabled={!bpa2.canEdit} inputmode="numeric" maxlength={16} onlookup={cariNpwpPenerima} />
				<FormField label="Nama" name="nama" bind:value={namaState} disabled={!bpa2.canEdit} />
				<FormField label="NIP/NRP" name="nip" bind:value={nipState} disabled={!bpa2.canEdit} />
				<FormField label="Pangkat/Golongan" name="pangkatGolongan" bind:value={pangkatGolonganState} disabled={!bpa2.canEdit} />
				<SelectField label="Status PTKP" name="statusPtkp" bind:value={statusPtkpState} disabled={!bpa2.canEdit} options={bpa1PtkpOptions.map((p) => ({ value: p.value, label: p.label }))} />
				<FormField label="Posisi" name="posisi" bind:value={posisiState} disabled={!bpa2.canEdit} />
				<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" bind:value={kodeObjekPajakIdState} disabled={!bpa2.canEdit} options={objekPajakOptions.map((o) => ({ value: o.id, label: o.nama }))} />
				<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled />
				<FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
				<SelectField label="Jenis Pemotongan" name="jenisPemotongan" bind:value={jenisPemotonganState} disabled={!bpa2.canEdit} options={jenisPemotonganOptions} />
				{#if isDisetahunkan}<FormField label="Number Of Months" name="jumlahBulan" type="number" min="1" max={String(BPA_MAX_ANNUALIZED_MONTHS)} step="1" bind:value={() => jumlahBulanState === undefined ? '' : String(jumlahBulanState), (v) => (jumlahBulanState = v === '' ? undefined : Number(v))} required disabled={!bpa2.canEdit} />{/if}
			</FieldGrid>
		</FormSection>
		<FormSection number="02" title="Penghasilan Bruto" bordered>
			<FieldGrid>
				<RupiahField label="Gaji Pokok/Pensiun" name="gajiPokokPensiun" bind:value={gajiPokokState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Istri" name="tunjanganIstri" bind:value={tunjanganIstriState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Anak" name="tunjanganAnak" bind:value={tunjanganAnakState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Perbaikan Penghasilan" name="tunjanganPerbaikanPenghasilan" bind:value={tunjanganPerbaikanState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Struktural/Fungsional" name="tunjanganStrukturalFungsional" bind:value={tunjanganStrukturalState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Beras" name="tunjanganBeras" bind:value={tunjanganBerasState} disabled={!bpa2.canEdit} />
				<RupiahField label="Tunjangan Lain-lain" name="tunjanganLainLain" bind:value={tunjanganLainLainState} disabled={!bpa2.canEdit} />
				<RupiahField label="Penghasilan Tetap dan Teratur Lainnya yang Pembayarannya Terpisah dari Pembayaran Gaji" name="penghasilanTetapTeraturLainnya" bind:value={penghasilanTetapLainnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="Jumlah Penghasilan Bruto" value={calc?.penghasilanBruto ?? 0} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="03" title="Pengurang" bordered>
			<FieldGrid>
				<RupiahField label="Biaya Jabatan / Biaya Pensiun" value={calc?.biayaJabatan ?? 0} disabled />
				<RupiahField label="Iuran terkait Pensiun atau Hari Tua" name="iuranPensiun" bind:value={iuranPensiunState} disabled={!bpa2.canEdit} />
				<RupiahField label="Zakat atau Sumbangan Keagamaan yang Bersifat Wajib" name="zakat" bind:value={zakatState} disabled={!bpa2.canEdit} />
				<RupiahField label="Jumlah Pengurangan" value={calc?.jumlahPengurangan ?? 0} disabled />
				<RupiahField label="Jumlah Penghasilan Neto" value={calc?.penghasilanNeto ?? 0} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="04" title="Penghitungan PPh Pasal 21" bordered>
			<FieldGrid>
				<FormField label="Nomor Bukti Pemotongan BPA2 dari Pemberi Kerja Sebelumnya (Apabila ada)" name="nomorBuktiSebelumnya" bind:value={nomorBuktiSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="Penghasilan Neto dari Pemotongan Sebelumnya" name="penghasilanNetoSebelumnya" bind:value={penghasilanNetoSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21 (Setahun/Disetahunkan)" value={calc?.penghasilanNetoSetahunDisetahunkan ?? 0} disabled />
				<RupiahField label="Penghasilan Tidak Kena Pajak" value={calc?.penghasilanTidakKenaPajak ?? 0} disabled />
				<RupiahField label="Penghasilan Kena Pajak Setahun / Disetahunkan" value={calc?.penghasilanKenaPajak ?? 0} disabled />
				<FormField label="Tarif (%)" value={String(calc?.tarif ?? 0)} disabled />
				<RupiahField label="PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan" value={calc?.pphPasal21AtasPkp ?? 0} disabled />
				<RupiahField label="PPh Pasal 21 Terutang" value={calc?.pphPasal21Terutang ?? 0} disabled />
				<RupiahField label="PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya" name="pphPasal21DipotongSebelumnya" bind:value={pphDipotongSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan)" value={calc?.pphPasal21TerutangPadaIni ?? 0} disabled />
				<RupiahField label="PPh Pasal 21 yang Telah Dipotong" value={calc?.pphDipotongAtauDitanggung ?? 0} disabled />
				<RupiahField label="PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir" value={calc?.pphKurangLebihDipotongDesember ?? 0} disabled />
				<FormField label="KAP-KJS" value={selectedObjekPajak?.kap ?? ''} disabled />
				<FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
			</FieldGrid>
			<p>“PPh Pasal 21 yang Telah Dipotong” diambil dari Bukti Pemotongan Bulanan Pegawai Tetap yang telah terbit untuk penerima dan objek pajak yang sama sebelum masa pajak terakhir.</p>
		</FormSection>
		{#if bpa2.canEdit}
			<FormActions>
				<ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpa2')}>Kembali</ActionButton>
				<ActionButton type="submit" name="intent" value="draft" tone="secondary" pending={updateBpa2.pending > 0}>Simpan Konsep</ActionButton>
				<ActionButton type="submit" name="intent" value="submit" tone="danger" pending={updateBpa2.pending > 0}>Submit</ActionButton>
			</FormActions>
		{:else}
			<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpa2')}>Kembali</ActionButton></FormActions>
		{/if}
	</Stack>
{/snippet}

<svelte:head><title>e-Bupot BPA2</title></svelte:head>
<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot', href: '/ebupot/bpa2' }, { label: 'BPA2' }]} />
		<ServiceWorkspace
			identity={{ eyebrow: 'Wajib Pajak', name: String(appPage.data.user?.name ?? 'Wajib Pajak'), identifier: String(appPage.data.user?.username ?? ''), mark: 'EB' }}
			groups={[{ label: 'e-Bupot', links: [
				{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' },
				{ label: 'BPPU', href: '/ebupot/bpu' },
				{ label: 'BP21', href: '/ebupot/bp21' },
				{ label: 'BP26', href: '/ebupot/bp26' },
				{ label: 'BPA1', href: '/ebupot/bpa1' },
				{ label: 'BPA2', href: '/ebupot/bpa2', active: true },
				{ label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
			]}]}
		>
			<DocumentWorkspace>
				{#if bpa2.nomorPemotongan}<p>Nomor Pemotongan: <code>{bpa2.nomorPemotongan}</code> <StatusBadge label="Telah Terbit" tone="success" /></p>{/if}
				{#if bpa2.canEdit}<form {...updateBpa2}>{@render content()}</form>{:else}{@render content()}{/if}
			</DocumentWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
