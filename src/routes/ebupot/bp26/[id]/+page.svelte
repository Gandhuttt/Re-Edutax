<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormSection, InlineAlert, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack } from '$lib/re-ui-components';
	import { getFasilitasPajakBp26 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getNegara } from '../../negara.remote';
	import { getObjekPajakBp26 } from '../../objekPajakBp26.remote';
	import { terbitkanBp26 } from '../terbitkanBp26.remote';
	import { getBp26 } from './getBp26.remote';
	import { submitBp26 } from './submitBp26.remote';
	import { updateBp26 } from './updateBp26.remote';

	const bp26 = await getBp26();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions, negaraOptions] = await Promise.all([getObjekPajakBp26(), getFasilitasPajakBp26(), getJenisDokumenEbupot(), getNegara()]);
	let masaPajakState = $state(bp26.masaPajak); let tahunState = $state(bp26.tahun);
	let nomorIdentitasWpState = $state(bp26.nomorIdentitasWp); let namaState = $state(bp26.nama); let alamatState = $state(bp26.alamat);
	let negaraAsalIdState = $state(bp26.negaraAsalId ?? ''); let tanggalLahirState = $state(bp26.tanggalLahir ?? ''); let tempatLahirState = $state(bp26.tempatLahir);
	let nomorPasporState = $state(bp26.nomorPaspor); let nomorKitasKitapState = $state(bp26.nomorKitasKitap);
	let kodeObjekPajakIdState = $state(bp26.kodeObjekPajakId ?? ''); let fasilitasPajakIdState = $state(bp26.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bp26.npwpPemotong}000000`;
	const resolvedBp26 = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		const item = selectedObjekPajak.parameterData.ItemList.find((entry) => entry.TaxCertificateCode === selectedFasilitas.kode || entry.TaxCertificateCodes?.includes(selectedFasilitas.kode));
		if (!item) return null;
		const manualDpp = item.ManualDeemedRate?.toUpperCase() === 'TRUE'; const manualTarif = item.ManualTaxRate?.toUpperCase() === 'TRUE'; const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';
		const dppPercent = item.DeemedRate ?? 100; const maxBruto = item.Rates?.length ? Math.max(...item.Rates.map((band) => band.Max)) / (dppPercent / 100) : undefined;
		if (item.Rates?.length) { const band = item.Rates.find((b) => penghasilanBrutoState >= b.Min && penghasilanBrutoState <= b.Max); return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax, maxBruto }; }
		if (typeof item.Rate === 'number') return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
		return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
	});
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	let penghasilanBrutoState = $state(bp26.penghasilanBruto); let dppManualState = $state(bp26.dpp); let tarifManualState = $state(bp26.tarif);
	$effect(() => { if (resolvedBp26) { dppManualState = resolvedBp26.dppPercent; tarifManualState = resolvedBp26.tarif; } });
	const pajakPenghasilanDefault = $derived(Math.round((penghasilanBrutoState * dppManualState * tarifManualState) / 10000));
	const months = Array.from({ length: 12 }, (_, i) => i + 1); let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak')); const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const select = (options: { id: string; nama?: string; label?: string }[]) => options.map((option) => ({ value: option.id, label: option.nama ?? option.label ?? option.id }));
	function setTahun(event: Event & { currentTarget: HTMLInputElement }) { tahunState = Number(event.currentTarget.value); }
	function setDpp(event: Event & { currentTarget: HTMLInputElement }) { dppManualState = Number(event.currentTarget.value); }
	function setTarif(event: Event & { currentTarget: HTMLInputElement }) { tarifManualState = Number(event.currentTarget.value); }
</script>

<svelte:head><title>BP26</title></svelte:head>
{#snippet formContent()}
	<FormSection number="01" title="Informasi Umum"><FieldGrid>
		<SelectField label="Masa Pajak" name="masaPajak" bind:value={masaPajakState} disabled={!bp26.canEdit} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} />
		<FormField label="Tahun" name="tahun" type="number" value={String(tahunState)} oninput={setTahun} disabled={!bp26.canEdit} />
		<FormField label="Status" value={bp26.status} disabled />
		<FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
	</FieldGrid></FormSection>
	<FormSection number="02" title="Dokumen Referensi"><FieldGrid>
		<SelectField label="Jenis Dokumen" name="jenisDokumenId" value={bp26.jenisDokumenId ?? ''} disabled={!bp26.canEdit} options={select(jenisDokumenOptions)} placeholder="Pilih jenis dokumen" />
		<FormField label="Nomor Dokumen" name="nomorDokumen" value={bp26.nomorDokumen} disabled={!bp26.canEdit} />
		<FormField label="Tanggal Dokumen" name="tanggalDokumen" type="date" value={bp26.tanggalDokumen ?? ''} disabled={!bp26.canEdit} />
	</FieldGrid></FormSection>
	<FormSection number="03" title="Penghitungan Pajak Penghasilan"><FieldGrid>
		<SelectField label="Nama Fasilitas" name="fasilitasPajakId" bind:value={fasilitasPajakIdState} disabled={!bp26.canEdit} options={select(fasilitasOptions)} placeholder="Pilih fasilitas" />
		<FormField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} disabled={!bp26.canEdit} />
		<FormField label="Nama" name="nama" bind:value={namaState} disabled={!bp26.canEdit} />
		<FormField label="Alamat" name="alamat" bind:value={alamatState} disabled={!bp26.canEdit} />
		<SelectField label="Negara Asal" name="negaraAsalId" bind:value={negaraAsalIdState} disabled={!bp26.canEdit} options={select(negaraOptions)} placeholder="Pilih negara" />
		<FormField label="Tanggal Lahir" name="tanggalLahir" type="date" bind:value={tanggalLahirState} disabled={!bp26.canEdit} />
		<FormField label="Tempat Lahir" name="tempatLahir" bind:value={tempatLahirState} disabled={!bp26.canEdit} />
		<FormField label="Nomor Paspor" name="nomorPaspor" bind:value={nomorPasporState} disabled={!bp26.canEdit} />
		<FormField label="Nomor KITAS/KITAP" name="nomorKitasKitap" bind:value={nomorKitasKitapState} disabled={!bp26.canEdit} />
		<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" bind:value={kodeObjekPajakIdState} disabled={!bp26.canEdit} options={select(objekPajakOptions)} placeholder="Pilih objek pajak" />
		<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled />
		<FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
		<FormField label="Sifat Pajak Penghasilan" value={selectedObjekPajak?.sifat ?? ''} disabled />
		<RupiahField label="Penghasilan Bruto (Rp)" name="penghasilanBruto" bind:value={penghasilanBrutoState} disabled={!bp26.canEdit} />
	</FieldGrid>
	{#if resolvedBp26?.maxBruto !== undefined && penghasilanBrutoState > resolvedBp26.maxBruto}<InlineAlert tone="warning" title="Batas Penghasilan Bruto" message="Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini." />{/if}
	<FieldGrid>
		{#if resolvedBp26?.manualDpp}<FormField label="DPP (%)" name="dppManual" value={String(dppManualState)} oninput={setDpp} disabled={!bp26.canEdit} />{:else}<FormField label="DPP (%)" value={String(resolvedBp26?.dppPercent ?? bp26.dpp)} disabled />{/if}
		{#if resolvedBp26?.manualTarif}<FormField label="Tarif (%)" name="tarifManual" value={String(tarifManualState)} oninput={setTarif} disabled={!bp26.canEdit} />{:else}<FormField label="Tarif (%)" value={String(resolvedBp26?.tarif ?? bp26.tarif)} disabled />{/if}
		<RupiahField label="Pajak Penghasilan (Rp)" value={pajakPenghasilanDefault} disabled />
		<FormField label="KAP" value={selectedObjekPajak?.kap ?? ''} disabled />
	</FieldGrid>
	<p>{#if resolvedBp26?.manualDpp || resolvedBp26?.manualTarif}DPP dan/atau Tarif untuk kombinasi ini dapat diisi manual (mis. Surat Keterangan Domisili/tarif tax treaty).{:else}DPP dan Tarif dihitung otomatis dari kombinasi Nama Objek Pajak dan Fasilitas Pajak saat disimpan.{/if}</p>
	</FormSection>
	{#if bp26.canEdit}<FormActions><ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton><ActionButton type="submit" tone="primary">Simpan Konsep</ActionButton></FormActions>{:else}<FormActions><ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton></FormActions>{/if}
{/snippet}
<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/' }, { label: 'e-Bupot' }, { label: 'BP26' }, { label: bp26.nama }]} />
<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
	{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26', active: true }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
] }]}>
<DocumentWorkspace>
{#if bp26.canEdit}<form {...updateBp26}>{@render formContent()}</form>{:else}{@render formContent()}{/if}
{#if bp26.canEdit}<FormActions>{#if bp26.status !== 'SUBMITTED'}<form {...submitBp26}><ActionButton type="submit" tone="danger">Submit</ActionButton></form>{:else}<form {...terbitkanBp26.for(bp26.id)}><ActionButton type="submit">Terbitkan</ActionButton></form>{/if}</FormActions>{:else if bp26.nomorPemotongan}<p>Nomor Pemotongan: <strong>{bp26.nomorPemotongan}</strong></p>{/if}
</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>
