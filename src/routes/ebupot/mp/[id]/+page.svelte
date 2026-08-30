<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import { formatRupiah } from '$lib/helpers/rupiahInput';
	import { getContext, untrack } from 'svelte';
	import { getFasilitasPajakMp } from '../../fasilitasPajak.remote';
	import { getObjekPajakMp } from '../../objekPajakMp.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getMp } from './getMp.remote';
	import { submitMp } from './submitMp.remote';
	import { terbitkanMp } from '../terbitkanMp.remote';
	import { updateMp } from './updateMp.remote';

	const mp = await getMp();
	const [objekPajakOptions, fasilitasOptions] = await Promise.all([
		getObjekPajakMp(),
		getFasilitasPajakMp()
	]);

	let masaPajakState = $state(mp.masaPajak);
	let tahunState = $state(mp.tahun);
	let pegawaiAsingState = $state(String(mp.pegawaiAsing));
	let nomorIdentitasWpState = $state(mp.nomorIdentitasWp);
	let namaState = $state(mp.nama);
	let statusPtkpState = $state(mp.statusPtkp ?? '');
	let jabatanState = $state(mp.jabatan);
	let kodeObjekPajakIdState = $state(mp.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(mp.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPemotong = `${mp.npwpPemotong}000000`;

	let penghasilanBrutoState = $state(mp.penghasilanBruto);

	const bandContains = (band: { Min: number; Max: number }, amount: number) =>
		amount >= band.Min && amount <= band.Max;

	// Client-side mirror of resolveBp21.ts's TER/manual branches, for display
	// only -- the server is the source of truth at save time. MP's objects
	// never carry a cumulative bracket or a plain bruto-only bracket, so
	// only the TER and manual-facility branches are relevant here (see
	// docs/ui-reference/coretax/ebupot/NOTES.md "MP").
	const resolvedMp = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) =>
				entry.TaxCertificateCode === selectedFasilitas.kode ||
				entry.TaxCertificateCodes?.includes(selectedFasilitas.kode)
		);
		if (!item) return null;

		const manualDpp = item.ManualDeemedRate?.toUpperCase() === 'TRUE';
		const manualTarif = item.ManualTaxRate?.toUpperCase() === 'TRUE';
		const manualIncomeTax = item.ManualIncomeTaxWithheld?.toUpperCase() === 'TRUE';
		const dppPercent = item.DeemedRate ?? 100;

		const maxBruto = item.Rates?.length
			? Math.max(...item.Rates.map((band) => band.Max)) / (dppPercent / 100)
			: undefined;

		const terBands = item.Rates?.filter((band) => band.TaxExemptionStatus !== undefined) ?? [];
		if (terBands.length > 0) {
			const applicable = terBands.filter((band) =>
				band.TaxExemptionStatus?.includes(statusPtkpState)
			);
			const band = applicable.find((b) => bandContains(b, penghasilanBrutoState));
			return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax, maxBruto };
		}

		if (typeof item.Rate === 'number') {
			return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
		}

		return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
	});

	let dppManualState = $state(0);
	let tarifManualState = $state(mp.tarif);
	$effect(() => {
		// Every combo change resets Tarif to Coretax's default for it, even
		// when manual entry is allowed -- same reset-on-combo-change rule
		// BP21's Tarif field uses.
		if (resolvedMp) {
			dppManualState = resolvedMp.dppPercent;
			tarifManualState = resolvedMp.tarif;
		}
	});

	const pajakPenghasilanDefault = $derived(
		Math.round((penghasilanBrutoState * dppManualState * tarifManualState) / 10000)
	);
	let pajakPenghasilanManualState = $state(mp.pajakPenghasilanDipotong);
	$effect(() => {
		if (resolvedMp) pajakPenghasilanManualState = untrack(() => pajakPenghasilanDefault);
	});

	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) namaState = wp.nama;
	}

	const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

{#snippet formContent()}
	<div class="tw:flex tw:flex-col tw:gap-5 tw:w-full">
		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Informasi Umum</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Masa Pajak</span>
						<div class="tw:flex tw:flex-row tw:gap-2">
							<Select
								name="masaPajak"
								id={getContext('id')}
								bind:value={masaPajakState}
								disabled={!mp.canEdit}
							>
								{#each months as m (m)}
									<option value={m}>{formatMonth(m)}</option>
								{/each}
							</Select>
							<Input
								name="tahun"
								type="number"
								bind:value={tahunState}
								disabled={!mp.canEdit}
								class="tw:w-30"
							/>
						</div>
					</Label>
					<Label>
						<span>Status</span>
						<Input type="text" id={getContext('id')} value={mp.status} disabled />
					</Label>
					<Label>
						<span>Pegawai Asing</span>
						<Select
							name="pegawaiAsing"
							id={getContext('id')}
							bind:value={pegawaiAsingState}
							disabled={!mp.canEdit}
						>
							<option value="false">Tidak</option>
							<option value="true">Ya</option>
						</Select>
					</Label>
					<Label>
						<span>Nomor Identitas WP</span>
						<div class="tw:flex tw:flex-row">
							<Input
								class={mp.canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
								name="nomorIdentitasWp"
								type="text"
								id={getContext('id')}
								bind:value={nomorIdentitasWpState}
								disabled={!mp.canEdit}
							/>
							{#if mp.canEdit}
								<Button
									type="button"
									color="#FFD230"
									class="tw:rounded-s-none! tw:w-30"
									onclick={cariNpwpPenerima}
								>
									Cari NPWP
								</Button>
							{/if}
						</div>
					</Label>
					<Label>
						<span>Nama</span>
						<Input
							name="nama"
							type="text"
							id={getContext('id')}
							bind:value={namaState}
							disabled={!mp.canEdit}
						/>
					</Label>
					<Label>
						<span>Status PTKP</span>
						<Select
							name="statusPtkp"
							id={getContext('id')}
							bind:value={statusPtkpState}
							disabled={!mp.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each ptkpEbupotOptions as p (p.value)}
								<option value={p.value}>{p.label}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Jabatan</span>
						<Input
							name="jabatan"
							type="text"
							id={getContext('id')}
							bind:value={jabatanState}
							disabled={!mp.canEdit}
						/>
					</Label>
				</div>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Fasilitas Perpajakan</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan</span>
						<Select
							name="fasilitasPajakId"
							id={getContext('id')}
							bind:value={fasilitasPajakIdState}
							disabled={!mp.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each fasilitasOptions as f (f.id)}
								<option value={f.id}>{f.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Nama Objek Pajak</span>
						<Select
							name="kodeObjekPajakId"
							id={getContext('id')}
							bind:value={kodeObjekPajakIdState}
							disabled={!mp.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each objekPajakOptions as o (o.id)}
								<option value={o.id}>{o.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Jenis Pajak</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.pasal ?? ''} disabled />
					</Label>
					<Label>
						<span>Kode Objek Pajak</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kode ?? ''} disabled />
					</Label>
					<Label>
						<span>Penghasilan Bruto (Rp)</span>
						<Input
							name="penghasilanBruto"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanBrutoState}
							disabled={!mp.canEdit}
						/>
					</Label>
					{#if resolvedMp?.maxBruto !== undefined && penghasilanBrutoState > resolvedMp.maxBruto}
						<p class="tw:text-sm tw:text-red-600">
							Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini (Rp{formatRupiah(
								resolvedMp.maxBruto
							)}).
						</p>
					{/if}
					<Label>
						<span>Tarif (%)</span>
						{#if resolvedMp?.manualTarif}
							<Input
								name="tarifManual"
								type="text"
								id={getContext('id')}
								bind:value={tarifManualState}
								disabled={!mp.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedMp?.tarif ?? mp.tarif} disabled />
						{/if}
					</Label>
					<Label>
						<span>Pajak Penghasilan yang Dipotong (Rp)</span>
						{#if resolvedMp?.manualIncomeTax}
							<Input
								name="pajakPenghasilanManual"
								type="rupiah"
								id={getContext('id')}
								bind:value={pajakPenghasilanManualState}
								disabled={!mp.canEdit}
							/>
						{:else}
							<Input type="rupiah" id={getContext('id')} value={pajakPenghasilanDefault} disabled />
						{/if}
					</Label>
					<Label>
						<span>KAP-KJS</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kap ?? ''} disabled />
					</Label>
					<Label>
						<span>NITKU/Nomor Identitas Sub Unit Organisasi</span>
						<Input type="text" id={getContext('id')} value={nitkuPemotong} disabled />
					</Label>
					<p class="tw:text-sm tw:text-gray-500">
						{#if resolvedMp?.manualTarif || resolvedMp?.manualIncomeTax}
							Tarif dan/atau Pajak Penghasilan untuk kombinasi ini dapat diisi manual.
						{:else}
							Tarif dan Pajak Penghasilan dihitung otomatis (TER) dari kombinasi Status PTKP,
							Nama Objek Pajak, Fasilitas Pajak, dan Penghasilan Bruto saat disimpan.
						{/if}
					</p>
				</div>
			{/snippet}
		</Card>

		{#if mp.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/mp" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/mp" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT Bukti Pemotongan Bulanan Pegawai Tetap</div>
	{#if mp.canEdit}
		<form {...updateMp}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if mp.status !== 'SUBMITTED'}
				<form {...submitMp}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanMp.for(mp.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if mp.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{mp.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
