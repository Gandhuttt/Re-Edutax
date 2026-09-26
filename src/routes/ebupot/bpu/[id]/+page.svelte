<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormSection, InlineAlert, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack } from '$lib/re-ui-components';
	import { untrack } from 'svelte';
	import { getFasilitasPajakBpu } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBpu } from '../../objekPajakBpu.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpu } from './getBpu.remote';
	import { submitBpu } from './submitBpu.remote';
	import { terbitkanBpu } from '../terbitkanBpu.remote';
	import { updateBpu } from './updateBpu.remote';

	const bpu = await getBpu();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([getObjekPajakBpu(), getFasilitasPajakBpu(), getJenisDokumenEbupot()]);
	let masaPajakState = $state(bpu.masaPajak);
	let tahunState = $state(bpu.tahun);
	let nomorIdentitasWpState = $state(bpu.nomorIdentitasWp ?? '');
	let namaPenerimaState = $state(bpu.namaPenerima ?? '');
	let kodeObjekPajakIdState = $state(bpu.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bpu.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPenerima = $derived(nomorIdentitasWpState ? `${nomorIdentitasWpState}000000` : '');
	const nitkuPemotong = `${bpu.npwpPemotong}000000`;
	const resolvedTarif = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		const item = selectedObjekPajak.parameterData.ItemList.find((entry) => entry.TaxCertificateCode === selectedFasilitas.kode || entry.TaxCertificateCodes?.includes(selectedFasilitas.kode));
		if (!item) return null;
		const manual = item.ManualTaxRate?.toUpperCase() === 'TRUE';
		const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';
		const tarif = typeof item.Rate === 'number' ? item.Rate : (item.Rates?.[0]?.Rate ?? 0);
		return { tarif, manual, manualIncomeTax };
	});
	let dasarPengenaanPajakState = $state(bpu.dasarPengenaanPajak);
	let tarifManualState = $state(bpu.tarif);
	$effect(() => { if (resolvedTarif) tarifManualState = resolvedTarif.tarif; });
	const pajakPenghasilanDefault = $derived(Math.round(((dasarPengenaanPajakState ?? 0) * tarifManualState) / 100));
	let pajakPenghasilanManualState = $state(bpu.pajakPenghasilan);
	$effect(() => { if (resolvedTarif) pajakPenghasilanManualState = untrack(() => pajakPenghasilanDefault); });
	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) namaPenerimaState = wp.nama;
		else if (nomorIdentitasWpState && confirm(`TIN ${nomorIdentitasWpState} saat ini belum terdaftar dalam sistem. Sistem akan otomatis menggunakan TIN 9990000000999000 sebagai TIN penerima penghasilan.`)) {
			namaPenerimaState = `PENERIMA PENGHASILAN#${nomorIdentitasWpState}`;
			nomorIdentitasWpState = '9990000000999000';
		}
	}
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>e-Bupot BPPU</title></svelte:head>

{#snippet formContent()}
	<Stack gap="18px">
		{#if !bpu.canEdit && bpu.nomorPemotongan}<InlineAlert title="Nomor Pemotongan" message={bpu.nomorPemotongan} tone="info" />{/if}
		<FormSection number="01" title="Informasi Umum" bordered>
			<FieldGrid gap="14px 16px">
				<SelectField label="Masa Pajak" name="masaPajak" value={masaPajakState} onchange={(value) => (masaPajakState = Number(value))} disabled={!bpu.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
				<FormField label="Tahun" name="tahun" type="number" bind:value={() => String(tahunState), (value) => (tahunState = Number(value))} disabled={!bpu.canEdit} />
				<FormField label="Status" value={bpu.status} disabled />
				<LookupField label="Nomor Identitas WP (Penerima)" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={bpu.canEdit} disabled={!bpu.canEdit} inputmode="numeric" maxlength={16} onlookup={cariNpwpPenerima} />
				<FormField label="Nama Penerima" name="namaPenerima" bind:value={namaPenerimaState} disabled={!bpu.canEdit} />
				<FormField label="NITKU/Nomor Identitas Subunit Organisasi Penerima Penghasilan" value={nitkuPenerima} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="02" title="Dokumen Referensi" bordered>
			<FieldGrid gap="14px 16px">
				<SelectField label="Jenis Dokumen" name="jenisDokumenId" value={bpu.jenisDokumenId ?? ''} disabled={!bpu.canEdit} options={[{ value: '', label: 'Please select' }, ...jenisDokumenOptions.map((d) => ({ value: d.id, label: d.nama }))]} />
				<FormField label="Nomor Dokumen" name="nomorDokumen" value={bpu.nomorDokumen ?? ''} disabled={!bpu.canEdit} />
				<FormField label="Tanggal Dokumen" name="tanggalDokumen" type="date" value={bpu.tanggalDokumen ?? ''} disabled={!bpu.canEdit} />
				<FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
			</FieldGrid>
		</FormSection>
		<FormSection number="03" title="Pajak Penghasilan (Rp)" bordered>
			<FieldGrid gap="14px 16px">
				<SelectField label="Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan" name="fasilitasPajakId" value={fasilitasPajakIdState} onchange={(value) => (fasilitasPajakIdState = String(value))} disabled={!bpu.canEdit} options={[{ value: '', label: 'Please select' }, ...fasilitasOptions.map((f) => ({ value: f.id, label: f.nama }))]} />
				<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" value={kodeObjekPajakIdState} onchange={(value) => (kodeObjekPajakIdState = String(value))} disabled={!bpu.canEdit} options={[{ value: '', label: 'Please select' }, ...objekPajakOptions.map((o) => ({ value: o.id, label: o.nama }))]} />
				<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled />
				<FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
				<FormField label="Sifat Pajak Penghasilan" value={selectedObjekPajak?.sifat ?? ''} disabled />
				<RupiahField label="Dasar Pengenaan Pajak" name="dasarPengenaanPajak" bind:value={dasarPengenaanPajakState} disabled={!bpu.canEdit} />
				{#if resolvedTarif?.manual}<FormField label="Tarif (%)" name="tarifManual" bind:value={() => String(tarifManualState), (value) => (tarifManualState = Number(value))} disabled={!bpu.canEdit} />{:else}<FormField label="Tarif (%)" value={String(resolvedTarif?.tarif ?? bpu.tarif)} disabled />{/if}
				{#if resolvedTarif?.manualIncomeTax}<RupiahField label="Pajak Penghasilan (Rp)" name="pajakPenghasilanManual" bind:value={pajakPenghasilanManualState} disabled={!bpu.canEdit} />{:else}<RupiahField label="Pajak Penghasilan (Rp)" value={pajakPenghasilanDefault} disabled />{/if}
				<FormField label="KAP" value={selectedObjekPajak?.kap ?? ''} disabled />
			</FieldGrid>
			<InlineAlert title="Informasi perhitungan" message={resolvedTarif?.manual || resolvedTarif?.manualIncomeTax ? 'Tarif dan/atau Pajak Penghasilan untuk kombinasi ini dapat diisi manual.' : 'Tarif dan Pajak Penghasilan dihitung otomatis dari kombinasi Nama Objek Pajak dan Fasilitas Pajak saat disimpan.'} />
		</FormSection>
	</Stack>
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/' }, { label: 'e-Bupot' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'Detail' }]} />
		<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu', active: true }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }]}]}>
			<DocumentWorkspace>
				{#if bpu.canEdit}
					<form {...updateBpu}>
						{@render formContent()}
						<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpu')}>Kembali</ActionButton><ActionButton type="submit">Simpan Konsep</ActionButton></FormActions>
					</form>
					<FormActions>{#if bpu.status !== 'SUBMITTED'}<form {...submitBpu}><ActionButton type="submit" tone="danger">Submit</ActionButton></form>{:else}<form {...terbitkanBpu.for(bpu.id)}><ActionButton type="submit">Terbitkan</ActionButton></form>{/if}</FormActions>
				{:else}
					{@render formContent()}
					<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bpu')}>Kembali</ActionButton></FormActions>
				{/if}
			</DocumentWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
