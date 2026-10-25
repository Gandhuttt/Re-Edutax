<script lang="ts">
	import { page as appPage } from '$app/state';
	import { isAllowedPeriod, isObjectAvailable, periodOptions, todayIso } from '$lib/helpers/bp-parity';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import { computeBp21Amounts, resolveBp21, type ResolvedBp21 } from '$lib/helpers/resolveBp21';
	import { formatRupiah } from '$lib/helpers/rupiahInput';
	import { getFasilitasPajakBp21 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBp21 } from '../../objekPajakBp21.remote';
	import { getBpLookupContext, lookupBpInvoice } from '../../bpLookup.remote';
	import { getBp21 } from './getBp21.remote';
	import { terbitkanBp21 } from '../terbitkanBp21.remote';
	import { updateBp21 } from './updateBp21.remote';
	import { ActionButton, Breadcrumbs, DateField, DocumentWorkspace, FieldGrid, FormActions, FormField, FormIssueSummary, FormSection, InlineAlert, LookupField, PageLayout, RupiahField, SelectField, ServiceWorkspace, Stack, StatusBadge } from '$lib/re-ui-components';

	const GENERIC_TIN = '9990000000999000';
	const cumulativeObjectCodes = ['21-401-01', '21-401-02'];
	const statusLabel: Record<string, string> = { NORMAL: 'Normal', SAVEDINVALID: 'Disimpan Tidak Valid', SUBMITTED: 'Disimpan (Submit)', AMENDMENT: 'Pembetulan', AMENDED: 'Telah Dibetulkan', CANCELLED: 'Dibatalkan', DELETED: 'Dihapus' };
	const pad = (n: number) => String(n).padStart(2, '0');

	const bp21 = await getBp21();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([getObjekPajakBp21(), getFasilitasPajakBp21(), getJenisDokumenEbupot()]);
	const initialContext = await getBpLookupContext({ tin: bp21.nomorIdentitasWp });
	const editable = bp21.canEdit;
	const today = todayIso();

	// Form state: all initialised from the persisted row, only changed by real user actions (never by mount effects).
	let periodeState = $state(`${bp21.tahun}-${pad(bp21.masaPajak)}`);
	let nomorIdentitasWpState = $state(bp21.nomorIdentitasWp);
	let namaPenerimaState = $state(bp21.namaPenerima);
	let nitkuPemotongState = $state(bp21.nitkuPemotong ?? '');
	let nitkuPenerimaState = $state(bp21.nitkuPenerima ?? '');
	let tanggalPemotonganState = $state(bp21.tanggalPemotongan ?? '');
	let statusPtkpState = $state(bp21.statusPtkp ?? '');
	let fasilitasPajakIdState = $state(bp21.fasilitasPajakId ?? '');
	let kodeObjekPajakIdState = $state(bp21.kodeObjekPajakId ?? '');
	let penghasilanBrutoState = $state(bp21.penghasilanBruto);
	let pendapatanBrutoSebelumnyaState = $state(bp21.pendapatanBrutoSebelumnya);
	let dppManualState = $state(bp21.dpp);
	let tarifManualState = $state(bp21.tarif);
	let pajakPenghasilanManualState = $state(bp21.pajakPenghasilan);
	let jenisDokumenIdState = $state(bp21.jenisDokumenId ?? '');
	let nomorDokumenState = $state(bp21.nomorDokumen);
	let tanggalDokumenState = $state(bp21.tanggalDokumen ?? '');

	let ctx = $state(initialContext);
	let committedTin = $state(bp21.nomorIdentitasWp);
	let dirty = $state(false);
	let lookupMessage = $state('');
	let invoiceMessage = $state('');
	let brutoAtFocus = 0;
	let sidebarOpen = $state(false);

	const touch = () => (dirty = true);
	const tahunState = $derived(Number(periodeState.slice(0, 4)));
	const masaPajakState = $derived(Number(periodeState.slice(5, 7)));
	const periodValue = (o: { tahun: number; masaPajak: number }) => `${o.tahun}-${pad(o.masaPajak)}`;
	const allowedPeriods = periodOptions();
	const periodOutOfRange = $derived(!isAllowedPeriod(tahunState, masaPajakState));
	const periodSelectOptions = $derived([
		...(periodOutOfRange ? [{ value: periodeState, label: `${periodeState} (di luar rentang yang diizinkan)` }] : []),
		...allowedPeriods.map((o) => ({ value: periodValue(o), label: o.label }))
	]);

	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const fasilitasSelectOptions = fasilitasOptions.map((f) => ({ value: f.id, label: f.nama }));
	const objekAvailableIds = $derived(new Set(selectedFasilitas ? objekPajakOptions.filter((o) => isObjectAvailable(o, selectedFasilitas.kode, tahunState, masaPajakState)).map((o) => o.id) : []));
	const objekSelectOptions = $derived(objekPajakOptions.filter((o) => objekAvailableIds.has(o.id) || o.id === kodeObjekPajakIdState).map((o) => ({ value: o.id, label: `${o.kode} — ${o.nama}` })));
	const objekMismatch = $derived(Boolean(selectedObjekPajak) && !objekAvailableIds.has(selectedObjekPajak!.id));
	const isCumulativeObject = $derived(selectedObjekPajak ? cumulativeObjectCodes.includes(selectedObjekPajak.kode) : false);

	const ownBranchOptions = $derived([...ctx.ownBranches.map((b) => ({ value: b.nitku, label: `${b.nitku} — ${b.nama}` })), ...(nitkuPemotongState && !ctx.ownBranches.some((b) => b.nitku === nitkuPemotongState) ? [{ value: nitkuPemotongState, label: `${nitkuPemotongState} (tidak terdaftar)` }] : [])]);
	const recipientBranchOptions = $derived([...ctx.recipientBranches.map((b) => ({ value: b.nitku, label: `${b.nitku} — ${b.nama}` })), ...(nitkuPenerimaState && !ctx.recipientBranches.some((b) => b.nitku === nitkuPenerimaState) ? [{ value: nitkuPenerimaState, label: `${nitkuPenerimaState} (tidak terdaftar)` }] : [])]);

	const jenisDokumenSelected = $derived(jenisDokumenOptions.find((d) => d.id === jenisDokumenIdState));
	const isTaxInvoice = $derived(jenisDokumenSelected?.kode === 'TAXINVOICE');

	const resolved = $derived.by<ResolvedBp21 | null>(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		try {
			return resolveBp21(selectedObjekPajak.parameterData, selectedFasilitas.kode, statusPtkpState, penghasilanBrutoState, isCumulativeObject ? pendapatanBrutoSebelumnyaState : 0);
		} catch {
			return null;
		}
	});
	const amounts = $derived(resolved ? computeBp21Amounts(resolved, penghasilanBrutoState, { dppManual: dppManualState, tarifManual: tarifManualState, pajakPenghasilanManual: pajakPenghasilanManualState }) : null);
	const overCeiling = $derived(resolved?.maxBruto !== undefined && penghasilanBrutoState > resolved.maxBruto);

	// Reset the manual inputs to the resolver's defaults (a deliberate user-driven action).
	function resetManualToResolved() {
		if (!resolved) return;
		dppManualState = resolved.dppPercent;
		tarifManualState = resolved.tarif;
		pajakPenghasilanManualState = resolved.pajakPenghasilanOverride ?? Math.round((penghasilanBrutoState * resolved.dppPercent * resolved.tarif) / 10000);
	}
	function clearObjectAndDerived() {
		kodeObjekPajakIdState = '';
		dppManualState = 0;
		tarifManualState = 0;
		pajakPenghasilanManualState = 0;
	}

	async function refreshContext(tin: string) {
		committedTin = tin;
		ctx = await getBpLookupContext({ tin });
		if (nitkuPenerimaState && !ctx.recipientBranches.some((b) => b.nitku === nitkuPenerimaState)) nitkuPenerimaState = '';
	}
	function changePeriode(value: string) {
		touch();
		periodeState = value;
		clearObjectAndDerived();
	}
	function changeFasilitas(value: string) {
		touch();
		fasilitasPajakIdState = value;
		clearObjectAndDerived();
	}
	function changeObjek(value: string) {
		touch();
		kodeObjekPajakIdState = value;
		resetManualToResolved();
	}
	function changePtkp(value: string) {
		touch();
		statusPtkpState = value;
		resetManualToResolved();
	}
	function changeJenisDokumen(value: string) {
		touch();
		jenisDokumenIdState = value;
		invoiceMessage = '';
		if (jenisDokumenOptions.find((d) => d.id === value)?.kode === 'TAXINVOICE') tanggalDokumenState = '';
	}

	async function cariNpwpPenerima() {
		touch();
		lookupMessage = '';
		const tin = nomorIdentitasWpState.trim();
		await refreshContext(tin);
		if (ctx.knownTaxpayer) {
			namaPenerimaState = ctx.knownTaxpayer.nama;
		} else if (tin && tin !== GENERIC_TIN && confirm(`TIN ${tin} saat ini belum terdaftar dalam sistem. Sistem akan otomatis menggunakan TIN ${GENERIC_TIN} sebagai TIN penerima penghasilan.`)) {
			namaPenerimaState = `PENERIMA PENGHASILAN#${tin}`;
			nomorIdentitasWpState = GENERIC_TIN;
			await refreshContext(GENERIC_TIN);
		} else if (tin !== GENERIC_TIN) {
			lookupMessage = 'TIN tidak ditemukan dan penggunaan TIN generik tidak dikonfirmasi.';
		}
	}

	async function cariFaktur() {
		touch();
		invoiceMessage = '';
		const invoice = await lookupBpInvoice({ tin: nomorIdentitasWpState.trim(), nomorDokumen: nomorDokumenState.trim() });
		if (invoice) {
			tanggalDokumenState = invoice.tanggalFaktur;
			invoiceMessage = `Faktur ditemukan, tanggal dokumen diisi otomatis (${invoice.tanggalFaktur}).`;
		} else {
			tanggalDokumenState = '';
			invoiceMessage = 'Faktur pajak tidak ditemukan: harus faktur yang diterbitkan penerima (penjual) kepada Anda (pembeli).';
		}
	}

	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const issue = (name: string): string => (updateBp21.fields as any)[name]?.issues?.()?.[0]?.message ?? '';
</script>

<svelte:head><title>e-Bupot BP21</title></svelte:head>
{#snippet formContent()}
	<div class="form-stack">
		{#if !editable}
			<InlineAlert tone="warning" title={bp21.diterbitkan ? 'Telah diterbitkan' : `Status ${statusLabel[bp21.status] ?? bp21.status}`}>Bukti potong ini tidak dapat diubah.</InlineAlert>
		{/if}
		{#if editable}<FormIssueSummary source={updateBp21.fields} />{/if}

		<FormSection number="01" title="Informasi Umum" bordered>
			<FieldGrid>
				<SelectField label="Masa Pajak" name="periode" value={periodeState} disabled={!editable} options={periodSelectOptions} error={issue('periode')} onchange={(v) => changePeriode(String(v))} />
				<FormField label="Status" value={statusLabel[bp21.status] ?? bp21.status} disabled />
				{#if periodOutOfRange}<div class="wide"><InlineAlert tone="error" title="Masa pajak tidak sesuai">Masa pajak tersimpan berada di luar rentang yang diizinkan. Pilih masa pajak yang valid sebelum Submit.</InlineAlert></div>{/if}
				{#if bp21.pembetulanKe > 0 || bp21.pembetulanDariId}
					<div class="wide"><InlineAlert tone="info" title={`Pembetulan ke-${bp21.pembetulanKe}`}>{#if bp21.pembetulanDari}Pembetulan dari <a href={`/ebupot/bp21/${bp21.pembetulanDari.id}`}>{bp21.pembetulanDari.nomorPemotongan ?? 'bukti potong asal'}</a>.{:else}Bukti potong asal tidak dapat ditampilkan.{/if}</InlineAlert></div>
				{/if}
				<FormField label="NPWP/NIK Pemotong" value={accountNpwp} disabled />
				<SelectField label="NITKU Pemotong" name="nitkuPemotong" value={nitkuPemotongState} disabled={!editable} options={ownBranchOptions} placeholder="Pilih NITKU pemotong" error={issue('nitkuPemotong')} hint={ctx.ownBranches.length === 0 ? 'Belum ada NITKU. Tambahkan di Profil Saya › Tempat Kegiatan Usaha.' : ''} onchange={(v) => { touch(); nitkuPemotongState = String(v); }} />
				<LookupField label="Nomor Identitas WP (Penerima)" name="nomorIdentitasWp" bind:value={nomorIdentitasWpState} buttonLabel="Cari NPWP" buttonVisible={editable} disabled={!editable} inputmode="numeric" maxlength={16} error={issue('nomorIdentitasWp')} hint={lookupMessage} onlookup={cariNpwpPenerima} onvaluechange={touch} onblur={() => { if (editable && nomorIdentitasWpState.trim() !== committedTin) refreshContext(nomorIdentitasWpState.trim()); }} />
				<FormField label="Nama Penerima" name="namaPenerima" maxlength={100} bind:value={namaPenerimaState} disabled={!editable} error={issue('namaPenerima')} oninput={touch} />
				<SelectField label="NITKU Penerima Penghasilan" name="nitkuPenerima" value={nitkuPenerimaState} disabled={!editable} options={recipientBranchOptions} placeholder="Pilih NITKU penerima" error={issue('nitkuPenerima')} onchange={(v) => { touch(); nitkuPenerimaState = String(v); }} />
				<DateField label="Tanggal Pemotongan" name="tanggalPemotongan" bind:value={tanggalPemotonganState} max={today} disabled={!editable} error={issue('tanggalPemotongan')} onchange={touch} />
			</FieldGrid>
		</FormSection>

		<FormSection number="02" title="Pajak Penghasilan (Rp)" bordered>
			<FieldGrid>
				<SelectField label="Status PTKP" name="statusPtkp" value={statusPtkpState} disabled={!editable} placeholder="Pilih Status PTKP" options={ptkpEbupotOptions.map((p) => ({ value: p.value, label: p.label }))} error={issue('statusPtkp')} onchange={(v) => changePtkp(String(v))} />
				<SelectField label="Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan" name="fasilitasPajakId" value={fasilitasPajakIdState} disabled={!editable} placeholder="Pilih fasilitas pajak" options={fasilitasSelectOptions} error={issue('fasilitasPajakId')} onchange={(v) => changeFasilitas(String(v))} />
				<SelectField label="Nama Objek Pajak" name="kodeObjekPajakId" value={kodeObjekPajakIdState} disabled={!editable} searchable placeholder={selectedFasilitas ? 'Pilih objek pajak' : 'Pilih fasilitas pajak terlebih dahulu'} options={objekSelectOptions} error={issue('kodeObjekPajakId') || (objekMismatch ? 'Objek pajak tersimpan tidak berlaku untuk fasilitas/masa pajak ini, pilih ulang.' : '')} onchange={(v) => changeObjek(String(v))} />
				<FormField label="Jenis Pajak" value={selectedObjekPajak?.pasal ?? ''} disabled />
				<FormField label="Kode Objek Pajak" value={selectedObjekPajak?.kode ?? ''} disabled />
				<FormField label="Sifat Pajak Penghasilan" value={selectedObjekPajak?.sifat ?? ''} disabled />
				{#if isCumulativeObject}<RupiahField label="Pendapatan Bruto yang Telah Dibayar Sebelumnya (Khusus 21-401-01 dan 21-401-02)" name="pendapatanBrutoSebelumnya" bind:value={pendapatanBrutoSebelumnyaState} disabled={!editable} error={issue('pendapatanBrutoSebelumnya')} oninput={touch} />{/if}
				<RupiahField label="Penghasilan Bruto (Rp)" name="penghasilanBruto" bind:value={penghasilanBrutoState} disabled={!editable} error={issue('penghasilanBruto')} oninput={touch} onfocus={() => (brutoAtFocus = penghasilanBrutoState)} onblur={() => { if (penghasilanBrutoState !== brutoAtFocus) resetManualToResolved(); }} />
				{#if overCeiling && resolved?.maxBruto !== undefined}<div class="wide"><InlineAlert tone="error" title="Peringatan">Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp{formatRupiah(resolved.maxBruto)}). Konsep masih dapat disimpan, tetapi tidak dapat di-Submit.</InlineAlert></div>{/if}
				{#if resolved?.manualDpp}<FormField label="DPP (%)" name="dppManual" type="number" step="any" min="0" bind:value={() => String(dppManualState), (v) => { touch(); dppManualState = Number(v); }} disabled={!editable} error={issue('dppManual')} />{:else}<FormField label="DPP (%)" value={String(amounts?.dpp ?? 0)} disabled />{/if}
				{#if resolved?.manualTarif}<FormField label="Tarif (%)" name="tarifManual" type="number" step="any" min="0" bind:value={() => String(tarifManualState), (v) => { touch(); tarifManualState = Number(v); }} disabled={!editable} error={issue('tarifManual')} />{:else}<FormField label="Tarif (%)" value={String(amounts?.tarif ?? 0)} disabled />{/if}
				{#if resolved?.manualIncomeTax}<RupiahField label="Pajak Penghasilan (Rp)" name="pajakPenghasilanManual" bind:value={pajakPenghasilanManualState} disabled={!editable} error={issue('pajakPenghasilanManual')} oninput={touch} />{:else}<RupiahField label="Pajak Penghasilan (Rp)" value={amounts?.pajakPenghasilan ?? 0} disabled />{/if}
			</FieldGrid>
		</FormSection>

		<FormSection number="03" title="Dokumen Referensi" bordered>
			<FieldGrid>
				<SelectField label="Jenis Dokumen" name="jenisDokumenId" value={jenisDokumenIdState} disabled={!editable} placeholder="Pilih jenis dokumen" options={jenisDokumenOptions.map((d) => ({ value: d.id, label: d.nama }))} error={issue('jenisDokumenId')} onchange={(v) => changeJenisDokumen(String(v))} />
				{#if isTaxInvoice}
					<LookupField label="Nomor Dokumen (Faktur Pajak)" name="nomorDokumen" bind:value={nomorDokumenState} buttonLabel="Cari Faktur" buttonVisible={editable} disabled={!editable} error={issue('nomorDokumen')} hint={invoiceMessage} onlookup={cariFaktur} onvaluechange={touch} />
				{:else}
					<FormField label="Nomor Dokumen" name="nomorDokumen" bind:value={nomorDokumenState} disabled={!editable} error={issue('nomorDokumen')} oninput={touch} />
				{/if}
				<DateField label="Tanggal Dokumen" name="tanggalDokumen" bind:value={tanggalDokumenState} max={today} disabled={!editable || isTaxInvoice} error={issue('tanggalDokumen')} hint={isTaxInvoice ? 'Tanggal diisi otomatis dari faktur pajak (Cari Faktur).' : ''} onchange={touch} />
			</FieldGrid>
		</FormSection>

		{#if editable}
			<FormActions>
				<ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bp21')}>Kembali</ActionButton>
				<ActionButton type="submit" name="intent" value="draft" tone="secondary" pending={updateBp21.pending > 0}>Simpan Konsep</ActionButton>
				<ActionButton type="submit" name="intent" value="submit" tone="danger" pending={updateBp21.pending > 0}>Submit</ActionButton>
			</FormActions>
		{:else}
			<FormActions><ActionButton type="button" tone="quiet" onclick={() => (window.location.href = '/ebupot/bp21')}>Kembali</ActionButton></FormActions>
		{/if}
	</div>
{/snippet}
<PageLayout contentWidth="1540px"><Stack gap="16px"><Breadcrumbs separator="›" items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'e-Bupot', href: '/ebupot/bp21' }, { label: 'BP21' }]} /><ServiceWorkspace bind:sidebarOpen identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: accountNpwp, mark: 'EB' }} groups={[{ label: 'e-Bupot', links: [{ label: 'Bukti Potong Saya', href: '/ebupot/bukti-potong-saya' }, { label: 'BPPU', href: '/ebupot/bpu' }, { label: 'BP21', href: '/ebupot/bp21', active: true }, { label: 'BP26', href: '/ebupot/bp26' }, { label: 'BPA1', href: '/ebupot/bpa1' }, { label: 'BPA2', href: '/ebupot/bpa2' }, { label: 'Bukti Pemotongan Bulanan Pegawai Tetap', href: '/ebupot/mp' }]}]}><DocumentWorkspace>
	{#if bp21.nomorPemotongan}<p>Nomor Pemotongan: <code>{bp21.nomorPemotongan}</code> <StatusBadge label="Telah Terbit" tone="success" /></p>{/if}
	{#if editable}
		<form {...updateBp21}>{@render formContent()}</form>
		{#if bp21.status === 'SUBMITTED'}
			<form {...terbitkanBp21.for(bp21.id)} class="issue-form">
				<input type="hidden" name="id" value={bp21.id} />
				{#if dirty}<p class="hint">Ada perubahan yang belum disimpan. Klik Submit terlebih dahulu sebelum menerbitkan.</p>{/if}
				<ActionButton type="submit" tone="secondary" disabled={dirty}>Terbitkan</ActionButton>
			</form>
		{/if}
	{:else}
		{@render formContent()}
	{/if}
</DocumentWorkspace></ServiceWorkspace></Stack></PageLayout>

<style>
.form-stack { display: grid; gap: 18px; min-width: 0; }
.wide { grid-column: 1 / -1; }
.hint { color: var(--ui-muted); font-size: 13px; }
.issue-form { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
</style>
