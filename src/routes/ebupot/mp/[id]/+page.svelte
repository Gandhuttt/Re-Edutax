<script lang="ts">
	import { page as appPage } from '$app/state';
	import { isObjectAvailable } from '$lib/helpers/bp-parity';
	import { MP_DEFAULT_FASILITAS_KODE, MP_GENERIC_TIN, computeMpAmounts, isAllowedMpPeriod, mpPeriodOptions, resolveMp } from '$lib/helpers/mp-parity';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import type { ResolvedBp21 } from '$lib/helpers/resolveBp21';
	import { formatRupiah } from '$lib/helpers/rupiahInput';
	import { getFasilitasPajakMp } from '../../fasilitasPajak.remote';
	import { getObjekPajakMp } from '../../objekPajakMp.remote';
	import { getBpLookupContext } from '../../bpLookup.remote';
	import { getMp } from './getMp.remote';
	import { updateMp } from './updateMp.remote';
	import { ActionButton, Breadcrumbs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormIssueSummary, FormSection, InlineAlert, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack, StatusBadge } from '$lib/re-ui-components';

	const statusLabel: Record<string, string> = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan (Submit)', AMENDMENT: 'Pembetulan', AMENDED: 'Telah Dibetulkan', CANCELLED: 'Dibatalkan', DELETED: 'Dihapus' };
	const pad = (n: number) => String(n).padStart(2, '0');

	const mp = await getMp();
	const [objekPajakOptions, fasilitasOptions] = await Promise.all([getObjekPajakMp(), getFasilitasPajakMp()]);
	const initialContext = await getBpLookupContext({ tin: mp.nomorIdentitasWp });
	const editable = mp.canEdit;

	// Saved values (including manual tarif/PPh) are authoritative; defaults only fill what is blank.
	let periodeState = $state(`${mp.tahun}-${pad(mp.masaPajak)}`);
	let pegawaiAsingState = $state(String(mp.pegawaiAsing));
	let nomorIdentitasWpState = $state(mp.nomorIdentitasWp);
	let namaState = $state(!editable || (mp.nomorIdentitasWp === MP_GENERIC_TIN && /^PENERIMA PENGHASILAN#\d{3,16}$/.test(mp.nama)) ? mp.nama : initialContext.knownTaxpayer?.nama ?? '');
	let nitkuPemotongState = $state(mp.nitkuPemotong ?? (editable ? initialContext.ownBranches.find((b) => b.nitku.endsWith('000000'))?.nitku ?? '' : ''));
	let statusPtkpState = $state(mp.statusPtkp ?? '');
	let jabatanState = $state(mp.jabatan);
	let fasilitasPajakIdState = $state(mp.fasilitasPajakId ?? (editable ? fasilitasOptions.find((f) => f.kode === MP_DEFAULT_FASILITAS_KODE)?.id ?? '' : ''));
	let kodeObjekPajakIdState = $state(mp.kodeObjekPajakId ?? '');
	let penghasilanBrutoState = $state(mp.penghasilanBruto);
	let tarifManualState = $state(mp.tarif);
	let pajakPenghasilanManualState = $state(mp.pajakPenghasilanDipotong);

	let ctx = $state(initialContext);
	let committedTin = $state(mp.nomorIdentitasWp);
	let lookupMessage = $state('');
	let sidebarOpen = $state(false);

	const tahunState = $derived(Number(periodeState.slice(0, 4)));
	const masaPajakState = $derived(Number(periodeState.slice(5, 7)));
	const periodValue = (o: { tahun: number; masaPajak: number }) => `${o.tahun}-${pad(o.masaPajak)}`;
	const allowedPeriods = mpPeriodOptions();
	const periodOutOfRange = $derived(!isAllowedMpPeriod(tahunState, masaPajakState));
	// Coretax locks the period of a saved MP; a legacy out-of-range period stays correctable.
	const periodLocked = $derived(!editable || (mp.status !== 'NORMAL' && !periodOutOfRange));
	const periodSelectOptions = $derived([
		...(periodOutOfRange ? [{ value: periodeState, label: `${periodeState} (di luar rentang yang diizinkan)` }] : []),
		...allowedPeriods.map((o) => ({ value: periodValue(o), label: o.label }))
	]);

	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const fasilitasSelectOptions = fasilitasOptions.map((f) => ({ value: f.id, label: f.nama }));
	const objekAvailableIds = $derived(new Set(selectedFasilitas && !periodOutOfRange ? objekPajakOptions.filter((o) => isObjectAvailable(o, selectedFasilitas.kode, tahunState, masaPajakState)).map((o) => o.id) : []));
	const objekSelectOptions = $derived(objekPajakOptions.filter((o) => objekAvailableIds.has(o.id) || o.id === kodeObjekPajakIdState).map((o) => ({ value: o.id, label: `${o.kode} — ${o.nama}` })));
	const objekMismatch = $derived(Boolean(selectedObjekPajak) && !objekAvailableIds.has(selectedObjekPajak!.id));

	const ownBranchOptions = $derived([...ctx.ownBranches.map((b) => ({ value: b.nitku, label: `${b.nitku} — ${b.nama}` })), ...(nitkuPemotongState && !ctx.ownBranches.some((b) => b.nitku === nitkuPemotongState) ? [{ value: nitkuPemotongState, label: `${nitkuPemotongState} (tidak terdaftar)` }] : [])]);

	const resolved = $derived.by<ResolvedBp21 | null>(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		try {
			return resolveMp(selectedObjekPajak.parameterData, selectedFasilitas.kode, statusPtkpState, penghasilanBrutoState);
		} catch {
			return null;
		}
	});
	const amounts = $derived(resolved ? computeMpAmounts(resolved, penghasilanBrutoState, { tarifManual: tarifManualState, pajakPenghasilanManual: pajakPenghasilanManualState }) : null);
	const overCeiling = $derived(resolved?.maxBruto !== undefined && penghasilanBrutoState > resolved.maxBruto);

	// Manual tarif/PPh are only cleared by a deliberate change of period, facility or object --
	// never by loading the saved row, changing PTKP or editing bruto.
	function clearObjectAndManual() {
		kodeObjekPajakIdState = '';
		tarifManualState = 0;
		pajakPenghasilanManualState = 0;
	}
	function changePeriode(value: string) {
		periodeState = value;
		clearObjectAndManual();
	}
	function changeFasilitas(value: string) {
		fasilitasPajakIdState = value;
		clearObjectAndManual();
	}
	function changeObjek(value: string) {
		kodeObjekPajakIdState = value;
		tarifManualState = 0;
		pajakPenghasilanManualState = 0;
	}

	async function refreshContext(tin: string) {
		const nextContext = await getBpLookupContext({ tin });
		if (nomorIdentitasWpState.trim() !== tin) return false;
		committedTin = tin;
		ctx = nextContext;
		return true;
	}
	async function cariNpwpPenerima() {
		lookupMessage = '';
		const tin = nomorIdentitasWpState.trim();
		if (!/^\d{3,16}$/.test(tin)) {
			namaState = '';
			lookupMessage = 'Nomor Identitas WP harus berupa 3 sampai 16 digit angka.';
			return;
		}
		if (!(await refreshContext(tin))) return;
		if (tin === accountNpwp) {
			namaState = '';
			lookupMessage = 'Nomor Identitas WP penerima tidak boleh sama dengan NPWP pemotong.';
		} else if (ctx.knownTaxpayer) {
			if (tin !== MP_GENERIC_TIN || !/^PENERIMA PENGHASILAN#\d{3,16}$/.test(namaState)) namaState = ctx.knownTaxpayer.nama;
		} else if (tin !== MP_GENERIC_TIN && confirm(`TIN ${tin} saat ini belum terdaftar dalam sistem. Sistem akan otomatis menggunakan TIN ${MP_GENERIC_TIN} sebagai TIN penerima penghasilan.`)) {
			namaState = `PENERIMA PENGHASILAN#${tin}`;
			nomorIdentitasWpState = MP_GENERIC_TIN;
			await refreshContext(MP_GENERIC_TIN);
		} else if (tin !== MP_GENERIC_TIN) {
			namaState = '';
			lookupMessage = 'TIN tidak ditemukan dan penggunaan TIN generik tidak dikonfirmasi.';
		}
	}

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const issue = (name: string): string => {
		const field = (updateMp.fields as unknown as Record<string, { issues?: () => { message: string }[] | undefined } | undefined>)[name];
		return field?.issues?.()?.[0]?.message ?? '';
	};
</script>

<svelte:head><title>Bukti Pemotongan Bulanan Pegawai Tetap</title></svelte:head>
{#snippet formContent()}
	<div class="form-stack">
		{#if !editable}
			<InlineAlert tone="warning" title={mp.diterbitkan ? 'Telah diterbitkan' : `Status ${statusLabel[mp.status] ?? mp.status}`}>Bukti potong ini tidak dapat diubah.</InlineAlert>
		{/if}
		{#if editable}<FormIssueSummary source={updateMp.fields} />{/if}

		<FormSection number="01" title="Informasi Umum" bordered>
			<FieldGrid>
				<SelectField label="Masa Pajak" required name="periode" value={periodeState} disabled={periodLocked} options={periodSelectOptions} error={issue('periode')} onchange={(v) => changePeriode(String(v))} />
				<FormField label="Status" required value={statusLabel[mp.status] ?? mp.status} disabled />
				{#if periodOutOfRange}<div class="wide"><InlineAlert tone="error" title="Masa pajak tidak sesuai">Masa pajak tersimpan berada di luar rentang yang diizinkan (Desember tidak tersedia untuk MP). Pilih masa pajak yang valid sebelum Submit.</InlineAlert></div>{/if}
				{#if mp.pembetulanKe > 0 || mp.pembetulanDariId}
					<div class="wide"><InlineAlert tone="info" title={`Pembetulan ke-${mp.pembetulanKe}`}>{#if mp.pembetulanDari}Pembetulan dari <a href={`/ebupot/mp/${mp.pembetulanDari.id}`}>{mp.pembetulanDari.nomorPemotongan ?? 'bukti potong asal'}</a>.{:else}Bukti potong asal tidak dapat ditampilkan.{/if}</InlineAlert></div>
				{/if}
				<SelectField label="Pegawai Asing" name="pegawaiAsing" value={pegawaiAsingState} options={[{ value: 'false', label: 'Tidak' }, { value: 'true', label: 'Ya' }]} disabled={!editable} onchange={(v) => (pegawaiAsingState = String(v))} />
				<LookupField label="Nomor Identitas WP" required name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={editable} disabled={!editable} inputmode="numeric" minlength={3} maxlength={16} error={issue('nomorIdentitasWp')} hint={lookupMessage} onlookup={cariNpwpPenerima} onvaluechange={() => (namaState = '')} onblur={() => { if (editable && nomorIdentitasWpState.trim() !== committedTin) cariNpwpPenerima(); }} />
				<FormField label="Nama" required name="nama" minlength={3} maxlength={150} bind:value={namaState} readonly error={issue('nama')} />
				<SelectField label="Status PTKP" required name="statusPtkp" value={statusPtkpState} disabled={!editable} placeholder="Pilih Status PTKP" options={ptkpEbupotOptions.map((p) => ({ value: p.value, label: p.label }))} error={issue('statusPtkp')} onchange={(v) => (statusPtkpState = String(v))} />
				<FormField label="Jabatan" required name="jabatan" maxlength={150} bind:value={jabatanState} disabled={!editable} error={issue('jabatan')} />
			</FieldGrid>
		</FormSection>

		<FormSection number="02" title="Pajak Penghasilan (Rp)" bordered>
			<FieldGrid>
				<SelectField label="Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan" required name="fasilitasPajakId" value={fasilitasPajakIdState} disabled={!editable || periodOutOfRange} placeholder="Pilih fasilitas pajak" options={fasilitasSelectOptions} error={issue('fasilitasPajakId')} onchange={(v) => changeFasilitas(String(v))} />
				<SelectField label="Nama Objek Pajak" required name="kodeObjekPajakId" value={kodeObjekPajakIdState} disabled={!editable || periodOutOfRange || !selectedFasilitas} searchable placeholder={selectedFasilitas ? 'Pilih objek pajak' : 'Pilih fasilitas pajak terlebih dahulu'} options={objekSelectOptions} error={issue('kodeObjekPajakId') || (objekMismatch ? 'Objek pajak tersimpan tidak berlaku untuk fasilitas/masa pajak ini, pilih ulang.' : '')} onchange={(v) => changeObjek(String(v))} />
				<FormField label="Jenis Pajak" required value={selectedObjekPajak?.pasal ?? ''} readonly />
				<FormField label="Kode Objek Pajak" required value={selectedObjekPajak?.kode ?? ''} readonly />
				<FormField label="Sifat Pajak Penghasilan" required value={selectedObjekPajak?.sifat ?? ''} readonly />
				<RupiahField label="Penghasilan Bruto (Rp)" required name="penghasilanBruto" bind:value={penghasilanBrutoState} disabled={!editable} error={issue('penghasilanBruto')} />
				{#if overCeiling && resolved?.maxBruto !== undefined}<div class="wide"><InlineAlert tone="error" title="Peringatan">Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp{formatRupiah(resolved.maxBruto)}). Konsep masih dapat disimpan, tetapi tidak dapat di-Submit.</InlineAlert></div>{/if}
				{#if resolved?.manualTarif}<FormField label="Tarif (%)" required name="tarifManual" type="number" step="any" min="0" bind:value={() => String(tarifManualState), (v) => { tarifManualState = Number(v); }} disabled={!editable} error={issue('tarifManual')} />{:else}<FormField label="Tarif (%)" required value={String(amounts?.tarif ?? 0)} readonly />{/if}
				{#if resolved?.manualIncomeTax}<RupiahField label="Pajak Penghasilan (Rp)" required name="pajakPenghasilanManual" bind:value={pajakPenghasilanManualState} disabled={!editable} error={issue('pajakPenghasilanManual')} />{:else}<RupiahField label="Pajak Penghasilan (Rp)" required value={amounts?.pajakPenghasilanDipotong ?? 0} disabled />{/if}
				<FormField label="KAP-KJS" required value={selectedObjekPajak?.kap ?? ''} readonly />
				<SelectField label="NITKU /Nomor Identitas Subunit Organisasi Pemotong" required name="nitkuPemotong" value={nitkuPemotongState} disabled={!editable} options={ownBranchOptions} placeholder="Pilih NITKU pemotong" error={issue('nitkuPemotong')} hint={ctx.ownBranches.length === 0 ? 'Belum ada NITKU. Tambahkan di Profil Saya › Tempat Kegiatan Usaha.' : ''} onchange={(v) => (nitkuPemotongState = String(v))} />
			</FieldGrid>
		</FormSection>

		{#if editable}
			<FormActions>
				<ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/mp')}>Kembali</ActionButton>
				<ActionButton type="submit" name="intent" value="draft" formnovalidate tone="secondary" pending={updateMp.pending > 0}>Simpan Konsep</ActionButton>
				<ActionButton type="submit" name="intent" value="submit" tone="danger" pending={updateMp.pending > 0}>Submit</ActionButton>
			</FormActions>
		{:else}
			<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/mp')}>Kembali</ActionButton></FormActions>
		{/if}
	</div>
{/snippet}
<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }, { label: 'Detail' }]} /><ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21' }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp', active: true }]}]}><DocumentWorkspace>
	{#if mp.nomorPemotongan}<p>Nomor Pemotongan: <code>{mp.nomorPemotongan}</code> <StatusBadge label="Telah Terbit" tone="success" /></p>{/if}
	{#if editable}
		<form {...updateMp}>{@render formContent()}</form>
	{:else}
		{@render formContent()}
	{/if}
</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>

<style>
.form-stack { display: grid; gap: 18px; min-width: 0; }
.wide { grid-column: 1 / -1; }
</style>
