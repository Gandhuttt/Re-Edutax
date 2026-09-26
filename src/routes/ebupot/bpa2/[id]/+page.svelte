<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormSection, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack } from '$lib/re-ui-components';
	import { formatMonth } from '$lib/helpers/date';
	import { bpa1PtkpOptions } from '$lib/helpers/ptkp-bpa1';
	import { getObjekPajakBpa2 } from '../../objekPajakBpa2.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa2 } from './getBpa2.remote';
	import { submitBpa2 } from './submitBpa2.remote';
	import { terbitkanBpa2 } from '../terbitkanBpa2.remote';
	import { updateBpa2 } from './updateBpa2.remote';

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
	const jumlahPenghasilanBruto = $derived(
		gajiPokokState +
			tunjanganIstriState +
			tunjanganAnakState +
			tunjanganPerbaikanState +
			tunjanganStrukturalState +
			tunjanganBerasState +
			tunjanganLainLainState +
			penghasilanTetapLainnyaState
	);

	const monthCount = $derived(
		(tahunAkhirState - tahunAwalState) * 12 + (masaPajakAkhirState - masaPajakAwalState) + 1
	);
	const biayaJabatan = $derived(
		Math.min(Math.round(jumlahPenghasilanBruto * 0.05), 500_000 * Math.max(monthCount, 0))
	);
	let iuranPensiunState = $state(bpa2.iuranPensiun);
	let zakatState = $state(bpa2.zakat);
	const jumlahPengurangan = $derived(biayaJabatan + iuranPensiunState + zakatState);
	const penghasilanNeto = $derived(jumlahPenghasilanBruto - jumlahPengurangan);

	let nomorBuktiSebelumnyaState = $state(bpa2.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa2.penghasilanNetoSebelumnya);
	const netoGabungan = $derived(penghasilanNeto + penghasilanNetoSebelumnyaState);
	const isDisetahunkan = $derived(jenisPemotonganState === 'KURANG_SETAHUN_DISETAHUNKAN');
	const penghasilanNetoSetahunDisetahunkan = $derived(
		isDisetahunkan && monthCount > 0 ? Math.round((netoGabungan * 12) / monthCount) : netoGabungan
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

	// Client-side mirror of resolveBpa2Tax, for display only -- the server
	// is the source of truth at save time. No facility selector for BPA2, so
	// this just picks the ItemList entry that carries real bracket data.
	const resolvedTax = $derived.by(() => {
		if (!selectedObjekPajak) return { tarif: 0, pajakPenghasilan: 0 };
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) => entry.Rates && entry.Rates.length > 0
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
		isDisetahunkan && monthCount > 0
			? Math.round((resolvedTax.pajakPenghasilan * monthCount) / 12)
			: resolvedTax.pajakPenghasilan
	);
	let pphDipotongSebelumnyaState = $state(bpa2.pphPasal21DipotongSebelumnya);
	const pphTerutangPadaIni = $derived(pphPasal21Terutang - pphDipotongSebelumnyaState);
	// System-computed on real Coretax (pulled from monthly withholding
	// history this app doesn't have) -- always 0 here, same as the server.
	const pphYangTelahDipotong = 0;
	const pphKurangLebihDesember = $derived(pphTerutangPadaIni - pphYangTelahDipotong);

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
		<FormSection number="01" title="Informasi Umum" bordered>
			<FieldGrid>
				<SelectField label="Bekerja di Lebih dari Satu Pemberi Kerja" name="bekerjaDiLebihDariSatuPemberiKerja" bind:value={bekerjaLebihState} disabled={!bpa2.canEdit} options={[{ value: 'false', label: 'Tidak' }, { value: 'true', label: 'Ya' }]} />
				<SelectField label="Masa Pajak Awal" name="masaPajakAwal" bind:value={masaPajakAwalState} disabled={!bpa2.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
				<FormField label="Tahun Awal" name="tahunAwal" type="number" bind:value={() => String(tahunAwalState), (v) => (tahunAwalState = Number(v))} disabled={!bpa2.canEdit} />
				<SelectField label="Masa Pajak Akhir" name="masaPajakAkhir" bind:value={masaPajakAkhirState} disabled={!bpa2.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
				<FormField label="Tahun Akhir" name="tahunAkhir" type="number" bind:value={() => String(tahunAkhirState), (v) => (tahunAkhirState = Number(v))} disabled={!bpa2.canEdit} />
				<FormField label="Status" value={bpa2.status} disabled />
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
				<RupiahField label="Jumlah Penghasilan Bruto" value={jumlahPenghasilanBruto} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="03" title="Pengurang" bordered>
			<FieldGrid>
				<RupiahField label="Biaya Jabatan / Biaya Pensiun" value={biayaJabatan} disabled />
				<RupiahField label="Iuran terkait Pensiun atau Hari Tua" name="iuranPensiun" bind:value={iuranPensiunState} disabled={!bpa2.canEdit} />
				<RupiahField label="Zakat atau Sumbangan Keagamaan yang Bersifat Wajib" name="zakat" bind:value={zakatState} disabled={!bpa2.canEdit} />
				<RupiahField label="Jumlah Pengurangan" value={jumlahPengurangan} disabled />
				<RupiahField label="Jumlah Penghasilan Neto" value={penghasilanNeto} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="04" title="Penghitungan PPh Pasal 21" bordered>
			<FieldGrid>
				<FormField label="Nomor Bukti Pemotongan BPA2 dari Pemberi Kerja Sebelumnya (Apabila ada)" name="nomorBuktiSebelumnya" bind:value={nomorBuktiSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="Penghasilan Neto dari Pemotongan Sebelumnya" name="penghasilanNetoSebelumnya" bind:value={penghasilanNetoSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21 (Setahun/Disetahunkan)" value={penghasilanNetoSetahunDisetahunkan} disabled />
				<RupiahField label="Penghasilan Tidak Kena Pajak" value={penghasilanTidakKenaPajak} disabled />
				<RupiahField label="Penghasilan Kena Pajak Setahun / Disetahunkan" value={penghasilanKenaPajak} disabled />
				<FormField label="Tarif (%)" value={String(resolvedTax.tarif)} disabled />
				<RupiahField label="PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan" value={resolvedTax.pajakPenghasilan} disabled />
				<RupiahField label="PPh Pasal 21 Terutang" value={pphPasal21Terutang} disabled />
				<RupiahField label="PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya" name="pphPasal21DipotongSebelumnya" bind:value={pphDipotongSebelumnyaState} disabled={!bpa2.canEdit} />
				<RupiahField label="PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan)" value={pphTerutangPadaIni} disabled />
				<RupiahField label="PPh Pasal 21 yang Telah Dipotong" value={pphYangTelahDipotong} disabled />
				<RupiahField label="PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir" value={pphKurangLebihDesember} disabled />
				<FormField label="KAP-KJS" value={selectedObjekPajak?.kap ?? ''} disabled />
				<FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
			</FieldGrid>
			<p>BPA2 tidak memiliki mekanisme Fasilitas Pajak/DTP seperti BPA1. “PPh Pasal 21 yang Telah Dipotong” dihitung dari riwayat pemotongan bulanan yang belum tersedia di aplikasi ini.</p>
		</FormSection>
		<FormActions>
			<ActionButton tone="quiet" type="button" onclick={() => (window.location.href = '/ebupot/bpa2')}>Kembali</ActionButton>
			{#if bpa2.canEdit}<ActionButton type="submit">Simpan Konsep</ActionButton>{/if}
		</FormActions>
	</Stack>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/' }, { label: 'e-Bupot' }, { label: 'BPA2' }]} />
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
				{#if bpa2.canEdit}<form {...updateBpa2}>{@render content()}</form>{:else}{@render content()}{/if}
				{#if bpa2.canEdit}
					<FormActions>
						{#if bpa2.status !== 'SUBMITTED'}<form {...submitBpa2}><ActionButton type="submit" tone="danger">Submit</ActionButton></form>
						{:else}<form {...terbitkanBpa2.for(bpa2.id)}><ActionButton type="submit">Terbitkan</ActionButton></form>{/if}
					</FormActions>
				{/if}
			</DocumentWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
