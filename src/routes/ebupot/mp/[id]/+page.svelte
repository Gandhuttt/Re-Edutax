<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import { formatRupiah } from '$lib/helpers/rupiahInput';
	import { untrack } from 'svelte';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormIssueSummary, FormSection, InlineAlert, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack } from '$lib/re-ui-components';
	import { getFasilitasPajakMp } from '../../fasilitasPajak.remote';
	import { getObjekPajakMp } from '../../objekPajakMp.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getMp } from './getMp.remote';
	import { submitMp } from './submitMp.remote';
	import { terbitkanMp } from '../terbitkanMp.remote';
	import { updateMp } from './updateMp.remote';

	const mp = await getMp();
	const updateForm = updateMp.for(mp.id);
	const [objekPajakOptions, fasilitasOptions] = await Promise.all([getObjekPajakMp(), getFasilitasPajakMp()]);
	let masaPajakState = $state(mp.masaPajak);
	let tahunState = $state(mp.tahun);
	let pegawaiAsingState = $state(String(mp.pegawaiAsing));
	let nomorIdentitasWpState = $state(mp.nomorIdentitasWp);
	let namaState = $state(mp.nama);
	let statusPtkpState = $state(mp.statusPtkp ?? '');
	let jabatanState = $state(mp.jabatan);
	let kodeObjekPajakIdState = $state(mp.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(mp.fasilitasPajakId ?? '');
	let penghasilanBrutoState = $state(mp.penghasilanBruto);
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPemotong = `${mp.npwpPemotong}000000`;
	const bandContains = (band: { Min: number; Max: number }, amount: number) => amount >= band.Min && amount <= band.Max;
	const resolvedMp = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		const item = selectedObjekPajak.parameterData.ItemList.find((entry) => entry.TaxCertificateCode === selectedFasilitas.kode || entry.TaxCertificateCodes?.includes(selectedFasilitas.kode));
		if (!item) return null;
		const manualDpp = item.ManualDeemedRate?.toUpperCase() === 'TRUE';
		const manualTarif = item.ManualTaxRate?.toUpperCase() === 'TRUE';
		const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';
		const dppPercent = item.DeemedRate ?? 100;
		const maxBruto = item.Rates?.length ? Math.max(...item.Rates.map((band) => band.Max)) / (dppPercent / 100) : undefined;
		const terBands = item.Rates?.filter((band) => band.TaxExemptionStatus !== undefined) ?? [];
		if (terBands.length > 0) {
			const applicable = terBands.filter((band) => band.TaxExemptionStatus?.includes(statusPtkpState));
			const band = applicable.find((b) => bandContains(b, penghasilanBrutoState));
			return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax, maxBruto };
		}
		if (typeof item.Rate === 'number') return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
		return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
	});
	let dppManualState = $state(0);
	let tarifManualState = $state(mp.tarif);
	$effect(() => { if (resolvedMp) { dppManualState = resolvedMp.dppPercent; tarifManualState = resolvedMp.tarif; } });
	const pajakPenghasilanDefault = $derived(Math.round((penghasilanBrutoState * dppManualState * tarifManualState) / 10000));
	let pajakPenghasilanManualState = $state(mp.pajakPenghasilanDipotong);
	$effect(() => { if (resolvedMp) pajakPenghasilanManualState = untrack(() => pajakPenghasilanDefault); });
	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) namaState = wp.nama;
		else if (nomorIdentitasWpState && confirm(`TIN ${nomorIdentitasWpState} saat ini belum terdaftar dalam sistem. Sistem akan otomatis menggunakan TIN 9990000000999000 sebagai TIN penerima penghasilan.`)) {
			namaState = `PENERIMA PENGHASILAN#${nomorIdentitasWpState}`;
			nomorIdentitasWpState = '9990000000999000';
		}
	}
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>Bukti Pemotongan Bulanan Pegawai Tetap</title></svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }, { label: 'Detail' }]} />
		<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
			{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp', active: true }
		]}]}>
			<DocumentWorkspace>
				<form {...updateForm}>
					<Stack gap="18px">
						<FormSection number="01" title="Informasi Umum" bordered>
							<FieldGrid>
								<SelectField label="Masa Pajak" name="masaPajak" value={masaPajakState} options={months.map((m) => ({ value: m, label: formatMonth(m) }))} disabled={!mp.canEdit} onchange={(v) => (masaPajakState = Number(v))} />
								<FormField label="Tahun" name="tahun" type="number" value={String(tahunState)} disabled={!mp.canEdit} oninput={(e) => (tahunState = Number(e.currentTarget.value))} />
								<FormField label="Status" value={mp.status} disabled />
								<SelectField label="Pegawai Asing" name="pegawaiAsing" value={pegawaiAsingState} options={[{ value: 'false', label: 'Tidak' }, { value: 'true', label: 'Ya' }]} disabled={!mp.canEdit} onchange={(v) => (pegawaiAsingState = String(v))} />
								<LookupField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={mp.canEdit} disabled={!mp.canEdit} inputmode="numeric" maxlength={16} onlookup={cariNpwpPenerima} />
								<FormField label="Nama" name="nama" value={namaState} disabled={!mp.canEdit} oninput={(e) => (namaState = e.currentTarget.value)} />
								<SelectField label="Status PTKP" name="statusPtkp" value={statusPtkpState} options={ptkpEbupotOptions.map((p) => ({ value: p.value, label: p.label }))} disabled={!mp.canEdit} onchange={(v) => (statusPtkpState = String(v))} />
								<FormField label="Jabatan" name="jabatan" value={jabatanState} disabled={!mp.canEdit} oninput={(e) => (jabatanState = e.currentTarget.value)} />
							</FieldGrid>
						</FormSection>
						<FormSection number="02" title="Fasilitas Perpajakan" bordered>
							<FieldGrid>
								<SelectField label="Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan" name="fasilitasPajakId" value={fasilitasPajakIdState} options={fasilitasOptions.map((f) => ({ value: f.id, label: f.nama }))} disabled={!mp.canEdit} onchange={(v) => (fasilitasPajakIdState = String(v))} />
								<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" value={kodeObjekPajakIdState} options={objekPajakOptions.map((o) => ({ value: o.id, label: o.nama }))} disabled={!mp.canEdit} onchange={(v) => (kodeObjekPajakIdState = String(v))} />
								<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled /><FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
								<RupiahField label="Penghasilan Bruto (Rp)" name="penghasilanBruto" value={penghasilanBrutoState} disabled={!mp.canEdit} oninput={(e) => (penghasilanBrutoState = Number(e.currentTarget.value.replace(/\D/g, '')))} />
								{#if resolvedMp?.maxBruto !== undefined && penghasilanBrutoState > resolvedMp.maxBruto}<InlineAlert tone="warning" title="Batas penghasilan bruto" message={`Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp${formatRupiah(resolvedMp.maxBruto)}).`} />{/if}
								{#if resolvedMp?.manualTarif}<FormField label="Tarif (%)" name="tarifManual" type="number" value={String(tarifManualState)} disabled={!mp.canEdit} oninput={(e) => (tarifManualState = Number(e.currentTarget.value))} />{:else}<FormField label="Tarif (%)" value={String(resolvedMp?.tarif ?? mp.tarif)} disabled />{/if}
								{#if resolvedMp?.manualIncomeTax}<RupiahField label="Pajak Penghasilan yang Dipotong (Rp)" name="pajakPenghasilanManual" value={pajakPenghasilanManualState} disabled={!mp.canEdit} oninput={(e) => (pajakPenghasilanManualState = Number(e.currentTarget.value.replace(/\D/g, '')))} />{:else}<RupiahField label="Pajak Penghasilan yang Dipotong (Rp)" value={pajakPenghasilanDefault} disabled />{/if}
								<FormField label="KAP-KJS" value={selectedObjekPajak?.kap ?? ''} disabled /><FormField label="NITKU/Nomor Identitas Sub Unit Organisasi" value={nitkuPemotong} disabled />
								<p>{resolvedMp?.manualTarif || resolvedMp?.manualIncomeTax ? 'Tarif dan/atau Pajak Penghasilan untuk kombinasi ini dapat diisi manual.' : 'Tarif dan Pajak Penghasilan dihitung otomatis (TER) dari kombinasi Status PTKP, Nama Objek Pajak, Fasilitas Pajak, dan Penghasilan Bruto saat disimpan.'}</p>
							</FieldGrid>
						</FormSection>
						{#if mp.canEdit}<FormIssueSummary source={updateForm.fields} /><FormActions><ActionButton type="submit" pending={updateForm.pending > 0} pendingLabel="Menyimpan...">Simpan Konsep</ActionButton><ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton></FormActions>{:else}<FormActions><ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton></FormActions>{/if}
					</Stack>
				</form>
				{#if mp.canEdit}<div class="lifecycle">{#if mp.status !== 'SUBMITTED'}<form {...submitMp}><ActionButton type="submit" tone="danger">Submit</ActionButton></form>{:else}<form {...terbitkanMp.for(mp.id)}><ActionButton type="submit" tone="secondary">Terbitkan</ActionButton></form>{/if}</div>{:else if mp.nomorPemotongan}<p>Nomor Pemotongan: <code>{mp.nomorPemotongan}</code></p>{/if}
			</DocumentWorkspace>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
