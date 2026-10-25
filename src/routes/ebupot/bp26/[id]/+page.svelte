<script lang="ts">
	import { page as appPage } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import { isObjectAvailable, periodOptions, todayIso } from '$lib/helpers/bp-parity';
	import { computeBp26Amounts, resolveBp26 } from '$lib/helpers/resolveBp26';
	import {
		ActionButton,
		Breadcrumbs,
		DocumentWorkspace,
		FieldGrid,
		FormActions,
		FormField,
		FormIssueSummary,
		FormSection,
		InlineAlert,
		DateField,
		PageLayout,
		RupiahField,
		SelectField,
		ServiceWorkspace,
		Stack,
		remoteFailureFrom
	} from '$lib/re-ui-components';
	import { getFasilitasPajakBp26 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getNegara } from '../../negara.remote';
	import { getObjekPajakBp26 } from '../../objekPajakBp26.remote';
	import { getBpLookupContext, lookupBpInvoice } from '../../bpLookup.remote';
	import { terbitkanBp26 } from '../terbitkanBp26.remote';
	import { getBp26 } from './getBp26.remote';
	import { updateBp26 } from './updateBp26.remote';

	type FieldName =
		| 'masaPajak'
		| 'nomorIdentitasWp'
		| 'nama'
		| 'alamat'
		| 'negaraAsalId'
		| 'tanggalLahir'
		| 'tempatLahir'
		| 'nomorPaspor'
		| 'nomorKitasKitap'
		| 'kodeObjekPajakId'
		| 'fasilitasPajakId'
		| 'receiptNumber'
		| 'penghasilanBruto'
		| 'dppManual'
		| 'tarifManual'
		| 'jenisDokumenId'
		| 'nomorDokumen'
		| 'tanggalDokumen'
		| 'tanggalPemotongan'
		| 'nitkuPemotong';

	const bp26 = await getBp26();
	const ro = !bp26.canEdit;
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions, negaraOptions, initialContext] = await Promise.all([
		getObjekPajakBp26(),
		getFasilitasPajakBp26(),
		getJenisDokumenEbupot(),
		getNegara(),
		getBpLookupContext({ tin: bp26.nomorIdentitasWp })
	]);

	const today = todayIso();
	const tanpaFasilitasId = fasilitasOptions.find((f) => f.kode === '9')?.id ?? '';

	// All state starts from the persisted row; nothing below overwrites it on mount.
	let context = $state(initialContext);
	let period = $state(`${bp26.tahun}-${bp26.masaPajak}`);
	let nomorIdentitasWpState = $state(bp26.nomorIdentitasWp);
	let namaState = $state(bp26.nama);
	let alamatState = $state(bp26.alamat);
	let negaraAsalIdState = $state(bp26.negaraAsalId ?? '');
	let tanggalLahirState = $state(bp26.tanggalLahir ?? '');
	let tempatLahirState = $state(bp26.tempatLahir);
	let nomorPasporState = $state(bp26.nomorPaspor);
	let nomorKitasKitapState = $state(bp26.nomorKitasKitap);
	let kodeObjekPajakIdState = $state(bp26.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bp26.fasilitasPajakId ?? (ro ? '' : tanpaFasilitasId));
	let receiptNumberState = $state(bp26.receiptNumber ?? '');
	let penghasilanBrutoState = $state(bp26.penghasilanBruto);
	let dppState = $state(String(bp26.dpp));
	let tarifState = $state(String(bp26.tarif));
	let jenisDokumenIdState = $state(bp26.jenisDokumenId ?? '');
	let nomorDokumenState = $state(bp26.nomorDokumen);
	let tanggalDokumenState = $state(bp26.tanggalDokumen ?? '');
	let tanggalPemotonganState = $state(bp26.tanggalPemotongan ?? '');
	let nitkuPemotongState = $state(bp26.nitkuPemotong ?? '');
	let showDetails = $state(false);
	let brutoAtFocus = bp26.penghasilanBruto;
	let lookupNotice = $state<{ tone: 'info' | 'warning' | 'error' | 'success'; title: string; message: string } | null>(null);
	let submitFailure = $state('');
	let sidebarOpen = $state(false);

	const tahun = $derived(Number(period.split('-')[0]));
	const masaPajak = $derived(Number(period.split('-')[1]));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const selectedJenisDokumen = $derived(jenisDokumenOptions.find((j) => j.id === jenisDokumenIdState));
	const isTaxInvoice = $derived(selectedJenisDokumen?.kode === 'TAXINVOICE');
	const isSkd = $derived(selectedFasilitas?.kode === '7');

	const periodChoices = $derived.by(() => {
		const list = periodOptions().map((o) => ({ value: `${o.tahun}-${o.masaPajak}`, label: o.label }));
		const persisted = `${bp26.tahun}-${bp26.masaPajak}`;
		if (!list.some((o) => o.value === persisted)) list.push({ value: persisted, label: `${formatMonth(bp26.masaPajak)} ${bp26.tahun}` });
		return list;
	});
	const objekChoices = $derived(
		objekPajakOptions.filter((o) => (selectedFasilitas ? isObjectAvailable(o, selectedFasilitas.kode, tahun, masaPajak) : o.aktif))
	);
	const selectedObjekPajak = $derived(objekChoices.find((o) => o.id === kodeObjekPajakIdState));
	const branchChoices = $derived.by(() => {
		const list = context.ownBranches.map((b) => ({ value: b.nitku, label: `${b.nitku} — ${b.nama}` }));
		if (nitkuPemotongState && !list.some((b) => b.value === nitkuPemotongState)) list.push({ value: nitkuPemotongState, label: nitkuPemotongState });
		return list;
	});

	// The shared resolver is the only source of default DPP/tarif/limits.
	function resolveFor(objekId: string, fasilitasId: string, bruto: number) {
		const objek = objekPajakOptions.find((o) => o.id === objekId);
		const fasilitas = fasilitasOptions.find((f) => f.id === fasilitasId);
		if (!objek || !fasilitas) return null;
		try {
			return resolveBp26(objek.parameterData, fasilitas.kode, bruto);
		} catch {
			return null;
		}
	}
	const resolved = $derived(resolveFor(kodeObjekPajakIdState, fasilitasPajakIdState, penghasilanBrutoState));
	const amounts = $derived(
		ro
			? { dpp: bp26.dpp, tarif: bp26.tarif, pajakPenghasilan: bp26.pajakPenghasilan }
			: resolved
				? computeBp26Amounts(resolved, penghasilanBrutoState, { dppManual: dppState, tarifManual: tarifState })
				: { dpp: 0, tarif: 0, pajakPenghasilan: 0 }
	);

	function seedDefaults(objekId: string, fasilitasId: string, bruto: number) {
		const defaults = resolveFor(objekId, fasilitasId, bruto);
		dppState = String(defaults?.dppPercent ?? 0);
		tarifState = String(defaults?.tarif ?? 0);
	}
	function clearObjectAndDerived() {
		kodeObjekPajakIdState = '';
		dppState = '0';
		tarifState = '0';
	}

	const err = (name: FieldName) => updateBp26.fields[name].issues()?.[0]?.message ?? '';
	const detailErrors = $derived(
		(['alamat', 'negaraAsalId', 'tanggalLahir', 'tempatLahir', 'nomorPaspor', 'nomorKitasKitap'] as const).some((name) => err(name) !== '')
	);
	const detailsOpen = $derived(showDetails || detailErrors);

	async function refreshContext() {
		try {
			context = await getBpLookupContext({ tin: nomorIdentitasWpState.trim() });
			return true;
		} catch (cause) {
			lookupNotice = { tone: 'error', title: 'Data penerima gagal dimuat', message: remoteFailureFrom(cause).message };
			return false;
		}
	}
	async function lookupIdentity() {
		if (ro || !(await refreshContext())) return;
		const known = context.knownTaxpayer?.nama;
		if (known && !namaState.trim()) namaState = known;
		if (isTaxInvoice) await lookupInvoice();
	}
	async function lookupInvoice() {
		if (ro || !isTaxInvoice) return;
		const tin = nomorIdentitasWpState.trim();
		const nomor = nomorDokumenState.trim();
		if (!tin || !nomor) return;
		try {
			const invoice = await lookupBpInvoice({ tin, nomorDokumen: nomor });
			if (invoice) {
				tanggalDokumenState = invoice.tanggalFaktur;
				lookupNotice = { tone: 'success', title: 'Faktur pajak ditemukan', message: `Tanggal dokumen diambil dari faktur ${invoice.nomorFaktur}.` };
			} else {
				tanggalDokumenState = '';
				lookupNotice = { tone: 'warning', title: 'Faktur pajak tidak ditemukan', message: 'Tidak ada faktur masukan terbit dari penerima ini dengan nomor tersebut. Konsep tetap dapat disimpan, Submit akan ditolak.' };
			}
		} catch (cause) {
			lookupNotice = { tone: 'error', title: 'Faktur gagal dicek', message: remoteFailureFrom(cause).message };
		}
	}

	function onPeriodChange() {
		clearObjectAndDerived();
	}
	function onFasilitasChange(value: string | number) {
		fasilitasPajakIdState = String(value);
		clearObjectAndDerived();
		receiptNumberState = '';
		lookupNotice = null;
	}
	function onObjekChange(value: string | number) {
		seedDefaults(String(value), fasilitasPajakIdState, penghasilanBrutoState);
	}
	function onBrutoFocus() {
		brutoAtFocus = penghasilanBrutoState;
	}
	// Re-seed default rates only when the gross actually changed since focus.
	function onBrutoBlur() {
		if (penghasilanBrutoState !== brutoAtFocus) seedDefaults(kodeObjekPajakIdState, fasilitasPajakIdState, penghasilanBrutoState);
	}

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const select = (options: { id: string; nama?: string; label?: string }[]) => options.map((option) => ({ value: option.id, label: option.nama ?? option.label ?? option.id }));
</script>

<svelte:head><title>BP26</title></svelte:head>
{#snippet formContent()}
	<FormIssueSummary source={updateBp26.fields} />
	{#if submitFailure}<InlineAlert tone="error" title="Penyimpanan gagal" message={submitFailure} />{/if}
	{#if ro}<InlineAlert tone="info" title={bp26.diterbitkan ? 'BP26 sudah diterbitkan' : 'BP26 final'} message={`Status ${bp26.status}. Dokumen ini hanya dapat dilihat.`} />{/if}
	{#if bp26.sumberPembetulan}<InlineAlert tone="info" title="Pembetulan">Pembetulan ke-{bp26.pembetulanKe} dari <a href={`/ebupot/bp26/${bp26.sumberPembetulan.id}`}>{bp26.sumberPembetulan.nomorPemotongan ?? bp26.sumberPembetulan.id}</a> (status {bp26.sumberPembetulan.status}).</InlineAlert>{/if}
	<FormSection number="01" title="Informasi Umum"><FieldGrid>
		<input type="hidden" name="masaPajak" value={masaPajak} />
		<input type="hidden" name="tahun" value={tahun} />
		<SelectField label="Masa Pajak" bind:value={period} disabled={ro} options={periodChoices} error={err('masaPajak')} onchange={onPeriodChange} />
		<FormField label="Status" value={bp26.status} disabled />
		<DateField label="Tanggal Pemotongan" name="tanggalPemotongan" max={today} bind:value={tanggalPemotonganState} disabled={ro} error={err('tanggalPemotongan')} />
		<SelectField label="NITKU/Nomor Identitas Sub Unit Organisasi" name="nitkuPemotong" bind:value={nitkuPemotongState} disabled={ro} options={branchChoices} placeholder="Pilih NITKU cabang" error={err('nitkuPemotong')} hint={context.ownBranches.length === 0 ? 'Belum ada NITKU. Tambahkan di Profil Saya › Tempat Kegiatan Usaha.' : ''} />
	</FieldGrid></FormSection>
	<FormSection number="02" title="Pajak Penghasilan">
	<FieldGrid>
		<SelectField label="Nama Fasilitas" name="fasilitasPajakId" value={fasilitasPajakIdState} disabled={ro} options={select(fasilitasOptions)} placeholder="Pilih fasilitas" error={err('fasilitasPajakId')} onchange={(value) => onFasilitasChange(value)} />
		{#if isSkd}<FormField label="Receipt Number" name="receiptNumber" bind:value={receiptNumberState} disabled={ro} maxlength={80} error={err('receiptNumber')} />{/if}
		<FormField label="Nomor Identitas WP" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} disabled={ro} error={err('nomorIdentitasWp')} onblur={lookupIdentity} />
		<FormField label="Nama" name="nama" bind:value={namaState} disabled={ro} error={err('nama')} />
	</FieldGrid>
	{#if lookupNotice}<InlineAlert tone={lookupNotice.tone} title={lookupNotice.title} message={lookupNotice.message} />{/if}
	{#if !ro}<ActionButton type="button" tone="quiet" aria-expanded={detailsOpen} onclick={() => (showDetails = !detailsOpen)}>{detailsOpen ? 'Sembunyikan Detail Identitas' : 'Tampilkan Detail Identitas'}</ActionButton>{/if}
	<div hidden={!detailsOpen && !ro}><FieldGrid>
		<FormField label="Alamat" name="alamat" bind:value={alamatState} disabled={ro} error={err('alamat')} />
		<SelectField label="Negara Asal" name="negaraAsalId" bind:value={negaraAsalIdState} disabled={ro} options={select(negaraOptions)} placeholder="Pilih negara" error={err('negaraAsalId')} />
		<DateField label="Tanggal Lahir" name="tanggalLahir" min="1900-01-01" max={today} bind:value={tanggalLahirState} disabled={ro} error={err('tanggalLahir')} />
		<FormField label="Tempat Lahir" name="tempatLahir" bind:value={tempatLahirState} disabled={ro} error={err('tempatLahir')} />
		<FormField label="Nomor Paspor" name="nomorPaspor" bind:value={nomorPasporState} disabled={ro} error={err('nomorPaspor')} />
		<FormField label="Nomor KITAS/KITAP" name="nomorKitasKitap" bind:value={nomorKitasKitapState} disabled={ro} error={err('nomorKitasKitap')} />
	</FieldGrid></div>
	<FieldGrid>
		<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" bind:value={kodeObjekPajakIdState} disabled={ro} options={select(objekChoices)} placeholder="Pilih objek pajak" error={err('kodeObjekPajakId')} onchange={(value) => onObjekChange(value)} />
		<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled />
		<FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
		<FormField label="Sifat Pajak Penghasilan" value={selectedObjekPajak?.sifat ?? ''} disabled />
		<RupiahField label="Penghasilan Bruto (Rp)" name="penghasilanBruto" bind:value={penghasilanBrutoState} disabled={ro} error={err('penghasilanBruto')} onfocus={onBrutoFocus} onblur={onBrutoBlur} />
	</FieldGrid>
	{#if resolved?.maxBruto !== undefined && penghasilanBrutoState > resolved.maxBruto}<InlineAlert tone="warning" title="Batas Penghasilan Bruto" message="Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini. Konsep dapat disimpan, Submit akan ditolak." />{/if}
	<FieldGrid>
		{#if !ro && resolved?.manualDpp}<FormField label="DPP (%)" name="dppManual" inputmode="decimal" bind:value={dppState} error={err('dppManual')} />{:else}<FormField label="DPP (%)" value={String(amounts.dpp)} disabled />{/if}
		{#if !ro && resolved?.manualTarif}<FormField label="Tarif (%)" name="tarifManual" inputmode="decimal" bind:value={tarifState} error={err('tarifManual')} />{:else}<FormField label="Tarif (%)" value={String(amounts.tarif)} disabled />{/if}
		<RupiahField label="Pajak Penghasilan (Rp)" value={amounts.pajakPenghasilan} disabled />
		<FormField label="KAP" value={selectedObjekPajak?.kap ?? ''} disabled />
	</FieldGrid>
	<p>{#if resolved?.manualDpp || resolved?.manualTarif}DPP dan/atau Tarif untuk kombinasi ini dapat diisi manual (mis. Surat Keterangan Domisili/tarif tax treaty). Mengubah Penghasilan Bruto mengembalikan nilai ke default.{:else}DPP dan Tarif dihitung otomatis dari kombinasi Nama Objek Pajak dan Fasilitas Pajak, dan dihitung ulang server saat disimpan.{/if}</p>
	</FormSection>
	<FormSection number="03" title="Dokumen Referensi"><FieldGrid>
		<SelectField label="Jenis Dokumen" name="jenisDokumenId" bind:value={jenisDokumenIdState} disabled={ro} options={select(jenisDokumenOptions)} placeholder="Pilih jenis dokumen" error={err('jenisDokumenId')} onchange={() => { if (!ro) queueMicrotask(lookupInvoice); }} />
		<FormField label="Nomor Dokumen" name="nomorDokumen" bind:value={nomorDokumenState} disabled={ro} error={err('nomorDokumen')} onblur={lookupInvoice} />
		<DateField label="Tanggal Dokumen" name="tanggalDokumen" max={today} bind:value={tanggalDokumenState} disabled={ro || isTaxInvoice} error={err('tanggalDokumen')} hint={isTaxInvoice ? 'Tanggal diisi otomatis dari faktur pajak.' : ''} />
	</FieldGrid></FormSection>
	{#if !ro}
		<FormActions>
			<ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton>
			<ActionButton type="submit" name="intent" value="draft" tone="secondary" pending={updateBp26.pending > 0}>Simpan Konsep</ActionButton>
			<ActionButton type="submit" name="intent" value="submit" tone="primary" pending={updateBp26.pending > 0}>Submit</ActionButton>
		</FormActions>
	{:else}
		<FormActions><ActionButton type="button" tone="quiet" onclick={() => history.back()}>Kembali</ActionButton></FormActions>
	{/if}
{/snippet}
<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'BP26', href: '/ebupot/bp26' }, { label: bp26.nama || 'Detail' }]} />
<ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [
	{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26', active: true }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }
] }]}>
<DocumentWorkspace>
{#if bp26.canEdit}
	<form
		{...updateBp26.enhance(async (form) => {
			submitFailure = '';
			try {
				await form.submit();
			} catch (cause) {
				submitFailure = remoteFailureFrom(cause).message;
			}
		})}
	>{@render formContent()}</form>
{:else}{@render formContent()}{/if}
{#if bp26.canEdit && bp26.status === 'SUBMITTED'}<FormActions><form {...terbitkanBp26.for(bp26.id)}><input type="hidden" name="id" value={bp26.id} /><ActionButton type="submit">Terbitkan</ActionButton></form></FormActions>{:else if bp26.nomorPemotongan}<p>Nomor Pemotongan: <strong>{bp26.nomorPemotongan}</strong></p>{/if}
</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>
