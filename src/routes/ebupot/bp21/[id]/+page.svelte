<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import { getContext, untrack } from 'svelte';
	import { getFasilitasPajakBp21 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBp21 } from '../../objekPajakBp21.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBp21 } from './getBp21.remote';
	import { submitBp21 } from './submitBp21.remote';
	import { terbitkanBp21 } from '../terbitkanBp21.remote';
	import { updateBp21 } from './updateBp21.remote';

	const bp21 = await getBp21();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([
		getObjekPajakBp21(),
		getFasilitasPajakBp21(),
		getJenisDokumenEbupot()
	]);

	let masaPajakState = $state(bp21.masaPajak);
	let tahunState = $state(bp21.tahun);
	let nomorIdentitasWpState = $state(bp21.nomorIdentitasWp);
	let namaPenerimaState = $state(bp21.namaPenerima);
	let statusPtkpState = $state(bp21.statusPtkp ?? '');
	let kodeObjekPajakIdState = $state(bp21.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bp21.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPenerima = $derived(nomorIdentitasWpState ? `${nomorIdentitasWpState}000000` : '');
	const nitkuPemotong = `${bp21.npwpPemotong}000000`;

	// Object codes with the cumulative Pasal 17 bracket (pesangon/pensiun
	// sekaligus) -- see resolveBp21.ts and docs/ui-reference/coretax/ebupot/
	// NOTES.md "BP21: cumulative bruto".
	const cumulativeObjectCodes = ['21-401-01', '21-401-02'];
	const isCumulativeObject = $derived(
		selectedObjekPajak ? cumulativeObjectCodes.includes(selectedObjekPajak.kode) : false
	);

	let penghasilanBrutoState = $state(bp21.penghasilanBruto);
	let pendapatanBrutoSebelumnyaState = $state(bp21.pendapatanBrutoSebelumnya);

	const bandContains = (band: { Min: number; Max: number }, amount: number) =>
		amount >= band.Min && amount <= band.Max;

	const taxAtCumulativeBracket = (
		bands: { Min: number; Max: number; Rate: number; Minus?: number }[],
		amount: number
	) => {
		if (amount <= 0) return { tax: 0, rate: 0 };
		const band = bands.find((b) => bandContains(b, amount));
		if (!band) return { tax: 0, rate: 0 };
		return { tax: amount * (band.Rate / 100) - (band.Minus ?? 0), rate: band.Rate };
	};

	// Client-side mirror of resolveBp21.ts, for display only -- the server
	// is the source of truth at save time. See docs/ui-reference/coretax/
	// ebupot/NOTES.md "BP21: TER, flat, and cumulative-bracket formulas".
	const resolvedBp21 = $derived.by(() => {
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

		const cumulativeBands = item.Rates?.filter((band) => band.Minus !== undefined) ?? [];
		if (cumulativeBands.length > 0) {
			const total = pendapatanBrutoSebelumnyaState + penghasilanBrutoState;
			const { tax: taxOnTotal, rate } = taxAtCumulativeBracket(cumulativeBands, total);
			const { tax: taxOnPrevious } = taxAtCumulativeBracket(
				cumulativeBands,
				pendapatanBrutoSebelumnyaState
			);
			return {
				dppPercent: 100,
				tarif: rate,
				manualDpp,
				manualTarif,
				manualIncomeTax,
				pajakPenghasilanOverride: Math.round(taxOnTotal - taxOnPrevious)
			};
		}

		const terBands = item.Rates?.filter((band) => band.TaxExemptionStatus !== undefined) ?? [];
		if (terBands.length > 0) {
			const applicable = terBands.filter((band) =>
				band.TaxExemptionStatus?.includes(statusPtkpState)
			);
			const band = applicable.find((b) => bandContains(b, penghasilanBrutoState));
			return {
				dppPercent,
				tarif: band?.Rate ?? 0,
				manualDpp,
				manualTarif,
				manualIncomeTax,
				pajakPenghasilanOverride: undefined
			};
		}

		if (typeof item.Rate === 'number') {
			return {
				dppPercent,
				tarif: item.Rate,
				manualDpp,
				manualTarif,
				manualIncomeTax,
				pajakPenghasilanOverride: undefined
			};
		}

		return {
			dppPercent,
			tarif: 0,
			manualDpp,
			manualTarif,
			manualIncomeTax,
			pajakPenghasilanOverride: undefined
		};
	});

	let dppManualState = $state(bp21.dpp);
	let tarifManualState = $state(bp21.tarif);
	$effect(() => {
		// Every combo change resets DPP/Tarif to Coretax's default for it,
		// even when manual entry is allowed -- same reset-on-combo-change
		// rule BPU's Tarif field already uses.
		if (resolvedBp21) {
			dppManualState = resolvedBp21.dppPercent;
			tarifManualState = resolvedBp21.tarif;
		}
	});

	const pajakPenghasilanDefault = $derived(
		resolvedBp21?.pajakPenghasilanOverride ??
			Math.round((penghasilanBrutoState * dppManualState * tarifManualState) / 10000)
	);
	let pajakPenghasilanManualState = $state(bp21.pajakPenghasilan);
	$effect(() => {
		// Resets only when the combo changes, not on every Bruto/DPP/Tarif
		// keystroke -- see updateBp21.remote.ts's counterpart in the BPU
		// form (bpu/[id]/+page.svelte) for why untrack is needed here.
		if (resolvedBp21) pajakPenghasilanManualState = untrack(() => pajakPenghasilanDefault);
	});

	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) namaPenerimaState = wp.nama;
	}

	const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

{#snippet formContent()}
	<div class="tw:flex tw:flex-col tw:gap-5 tw:w-full">
		<div class="tw:flex tw:flex-row tw:gap-5">
			<div class="tw:basis-1/2">
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
										disabled={!bp21.canEdit}
									>
										{#each months as m (m)}
											<option value={m}>{formatMonth(m)}</option>
										{/each}
									</Select>
									<Input
										name="tahun"
										type="number"
										bind:value={tahunState}
										disabled={!bp21.canEdit}
										class="tw:w-30"
									/>
								</div>
							</Label>
							<Label>
								<span>Status</span>
								<Input type="text" id={getContext('id')} value={bp21.status} disabled />
							</Label>
							<Label>
								<span>Nomor Identitas WP (Penerima)</span>
								<div class="tw:flex tw:flex-row">
									<Input
										class={bp21.canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
										name="nomorIdentitasWp"
										type="text"
										id={getContext('id')}
										bind:value={nomorIdentitasWpState}
										disabled={!bp21.canEdit}
									/>
									{#if bp21.canEdit}
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
								<span>Nama Penerima</span>
								<Input
									name="namaPenerima"
									type="text"
									id={getContext('id')}
									bind:value={namaPenerimaState}
									disabled={!bp21.canEdit}
								/>
							</Label>
							<Label>
								<span>NITKU/Nomor Identitas Subunit Organisasi Penerima Penghasilan</span>
								<Input type="text" id={getContext('id')} value={nitkuPenerima} disabled />
							</Label>
						</div>
					{/snippet}
				</Card>
			</div>

			<div class="tw:basis-1/2">
				<Card>
					{#snippet head()}
						<span class="tw:text-xl">Dokumen Referensi</span>
					{/snippet}
					{#snippet body()}
						<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
							<Label>
								<span>Jenis Dokumen</span>
								<Select
									name="jenisDokumenId"
									id={getContext('id')}
									value={bp21.jenisDokumenId ?? ''}
									disabled={!bp21.canEdit}
								>
									<option value="" disabled>Please select</option>
									{#each jenisDokumenOptions as d (d.id)}
										<option value={d.id}>{d.nama}</option>
									{/each}
								</Select>
							</Label>
							<Label>
								<span>Nomor Dokumen</span>
								<Input
									name="nomorDokumen"
									type="text"
									id={getContext('id')}
									value={bp21.nomorDokumen}
									disabled={!bp21.canEdit}
								/>
							</Label>
							<Label>
								<span>Tanggal Dokumen</span>
								<Input
									name="tanggalDokumen"
									type="date"
									id={getContext('id')}
									value={bp21.tanggalDokumen ?? ''}
									disabled={!bp21.canEdit}
								/>
							</Label>
							<Label>
								<span>NITKU/Nomor Identitas Sub Unit Organisasi</span>
								<Input type="text" id={getContext('id')} value={nitkuPemotong} disabled />
							</Label>
						</div>
					{/snippet}
				</Card>
			</div>
		</div>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Pajak Penghasilan (Rp)</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Status PTKP</span>
						<Select
							name="statusPtkp"
							id={getContext('id')}
							bind:value={statusPtkpState}
							disabled={!bp21.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each ptkpEbupotOptions as p (p.value)}
								<option value={p.value}>{p.label}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan</span>
						<Select
							name="fasilitasPajakId"
							id={getContext('id')}
							bind:value={fasilitasPajakIdState}
							disabled={!bp21.canEdit}
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
							disabled={!bp21.canEdit}
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
						<span>Sifat Pajak Penghasilan</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.sifat ?? ''} disabled />
					</Label>
					{#if isCumulativeObject}
						<Label>
							<span>
								Pendapatan Bruto yang Telah Dibayar Sebelumnya (Khusus untuk Kode Objek Pajak
								21-401-01 dan 21-401-02)
							</span>
							<Input
								name="pendapatanBrutoSebelumnya"
								type="rupiah"
								id={getContext('id')}
								bind:value={pendapatanBrutoSebelumnyaState}
								disabled={!bp21.canEdit}
							/>
						</Label>
					{/if}
					<Label>
						<span>Penghasilan Bruto (Rp)</span>
						<Input
							name="penghasilanBruto"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanBrutoState}
							disabled={!bp21.canEdit}
						/>
					</Label>
					<Label>
						<span>DPP (%)</span>
						{#if resolvedBp21?.manualDpp}
							<Input
								name="dppManual"
								type="text"
								id={getContext('id')}
								bind:value={dppManualState}
								disabled={!bp21.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedBp21?.dppPercent ?? bp21.dpp} disabled />
						{/if}
					</Label>
					<Label>
						<span>Tarif (%)</span>
						{#if resolvedBp21?.manualTarif}
							<Input
								name="tarifManual"
								type="text"
								id={getContext('id')}
								bind:value={tarifManualState}
								disabled={!bp21.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedBp21?.tarif ?? bp21.tarif} disabled />
						{/if}
					</Label>
					<Label>
						<span>Pajak Penghasilan (Rp)</span>
						{#if resolvedBp21?.manualIncomeTax}
							<Input
								name="pajakPenghasilanManual"
								type="rupiah"
								id={getContext('id')}
								bind:value={pajakPenghasilanManualState}
								disabled={!bp21.canEdit}
							/>
						{:else}
							<Input type="rupiah" id={getContext('id')} value={pajakPenghasilanDefault} disabled />
						{/if}
					</Label>
					<Label>
						<span>KAP-KJS</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kap ?? ''} disabled />
					</Label>
					<p class="tw:text-sm tw:text-gray-500">
						{#if resolvedBp21?.manualDpp || resolvedBp21?.manualTarif || resolvedBp21?.manualIncomeTax}
							DPP, Tarif, dan/atau Pajak Penghasilan untuk kombinasi ini dapat diisi manual.
						{:else}
							DPP, Tarif, dan Pajak Penghasilan dihitung otomatis dari kombinasi Status PTKP,
							Nama Objek Pajak, Fasilitas Pajak, dan Penghasilan Bruto saat disimpan.
						{/if}
					</p>
				</div>
			{/snippet}
		</Card>

		{#if bp21.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/bp21" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/bp21" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT BP21</div>
	{#if bp21.canEdit}
		<form {...updateBp21}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if bp21.status !== 'SUBMITTED'}
				<form {...submitBp21}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanBp21.for(bp21.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if bp21.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{bp21.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
