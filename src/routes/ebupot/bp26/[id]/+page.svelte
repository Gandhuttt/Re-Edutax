<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getContext, untrack } from 'svelte';
	import { getFasilitasPajakBp26 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getNegara } from '../../negara.remote';
	import { getObjekPajakBp26 } from '../../objekPajakBp26.remote';
	import { getBp26 } from './getBp26.remote';
	import { submitBp26 } from './submitBp26.remote';
	import { terbitkanBp26 } from '../terbitkanBp26.remote';
	import { updateBp26 } from './updateBp26.remote';

	const bp26 = await getBp26();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions, negaraOptions] = await Promise.all([
		getObjekPajakBp26(),
		getFasilitasPajakBp26(),
		getJenisDokumenEbupot(),
		getNegara()
	]);

	let masaPajakState = $state(bp26.masaPajak);
	let tahunState = $state(bp26.tahun);
	let nomorIdentitasWpState = $state(bp26.nomorIdentitasWp);
	let namaState = $state(bp26.nama);
	let alamatState = $state(bp26.alamat);
	let negaraAsalIdState = $state(bp26.negaraAsalId ?? '');
	let tanggalLahirState = $state(bp26.tanggalLahir ?? '');
	let tempatLahirState = $state(bp26.tempatLahir);
	let nomorPasporState = $state(bp26.nomorPaspor);
	let nomorKitasKitapState = $state(bp26.nomorKitasKitap);
	let kodeObjekPajakIdState = $state(bp26.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bp26.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPemotong = `${bp26.npwpPemotong}000000`;

	// Client-side mirror of resolveBp26.ts, for display only -- the server
	// is the source of truth at save time. See docs/ui-reference/coretax/
	// ebupot/NOTES.md "BP26".
	const resolvedBp26 = $derived.by(() => {
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

		if (item.Rates?.length) {
			const band = item.Rates.find((b) => penghasilanBrutoState >= b.Min && penghasilanBrutoState <= b.Max);
			return { dppPercent, tarif: band?.Rate ?? 0, manualDpp, manualTarif, manualIncomeTax, maxBruto };
		}

		if (typeof item.Rate === 'number') {
			return { dppPercent, tarif: item.Rate, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
		}

		return { dppPercent, tarif: 0, manualDpp, manualTarif, manualIncomeTax, maxBruto: undefined };
	});

	let penghasilanBrutoState = $state(bp26.penghasilanBruto);
	let dppManualState = $state(bp26.dpp);
	let tarifManualState = $state(bp26.tarif);
	$effect(() => {
		// Every combo change resets DPP/Tarif to Coretax's default for it,
		// even when manual entry is allowed -- same reset-on-combo-change
		// rule established for BPU/BP21.
		if (resolvedBp26) {
			dppManualState = resolvedBp26.dppPercent;
			tarifManualState = resolvedBp26.tarif;
		}
	});

	const pajakPenghasilanDefault = $derived(
		Math.round((penghasilanBrutoState * dppManualState * tarifManualState) / 10000)
	);

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
										disabled={!bp26.canEdit}
									>
										{#each months as m (m)}
											<option value={m}>{formatMonth(m)}</option>
										{/each}
									</Select>
									<Input
										name="tahun"
										type="number"
										bind:value={tahunState}
										disabled={!bp26.canEdit}
										class="tw:w-30"
									/>
								</div>
							</Label>
							<Label>
								<span>Status</span>
								<Input type="text" id={getContext('id')} value={bp26.status} disabled />
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
									value={bp26.jenisDokumenId ?? ''}
									disabled={!bp26.canEdit}
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
									value={bp26.nomorDokumen}
									disabled={!bp26.canEdit}
								/>
							</Label>
							<Label>
								<span>Tanggal Dokumen</span>
								<Input
									name="tanggalDokumen"
									type="date"
									id={getContext('id')}
									value={bp26.tanggalDokumen ?? ''}
									disabled={!bp26.canEdit}
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
				<span class="tw:text-xl">Penghitungan Pajak Penghasilan</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Nama Fasilitas</span>
						<Select
							name="fasilitasPajakId"
							id={getContext('id')}
							bind:value={fasilitasPajakIdState}
							disabled={!bp26.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each fasilitasOptions as f (f.id)}
								<option value={f.id}>{f.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Nomor Identitas WP</span>
						<Input
							name="nomorIdentitasWp"
							type="text"
							id={getContext('id')}
							bind:value={nomorIdentitasWpState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Nama</span>
						<Input
							name="nama"
							type="text"
							id={getContext('id')}
							bind:value={namaState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Alamat</span>
						<Input
							name="alamat"
							type="text"
							id={getContext('id')}
							bind:value={alamatState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Negara Asal</span>
						<Select
							name="negaraAsalId"
							id={getContext('id')}
							bind:value={negaraAsalIdState}
							disabled={!bp26.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each negaraOptions as n (n.id)}
								<option value={n.id}>{n.label}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Tanggal Lahir</span>
						<Input
							name="tanggalLahir"
							type="date"
							id={getContext('id')}
							bind:value={tanggalLahirState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Tempat Lahir</span>
						<Input
							name="tempatLahir"
							type="text"
							id={getContext('id')}
							bind:value={tempatLahirState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Nomor Paspor</span>
						<Input
							name="nomorPaspor"
							type="text"
							id={getContext('id')}
							bind:value={nomorPasporState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Nomor KITAS/KITAP</span>
						<Input
							name="nomorKitasKitap"
							type="text"
							id={getContext('id')}
							bind:value={nomorKitasKitapState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					<Label>
						<span>Nama Objek Pajak</span>
						<Select
							name="kodeObjekPajakId"
							id={getContext('id')}
							bind:value={kodeObjekPajakIdState}
							disabled={!bp26.canEdit}
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
					<Label>
						<span>Penghasilan Bruto (Rp)</span>
						<Input
							name="penghasilanBruto"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanBrutoState}
							disabled={!bp26.canEdit}
						/>
					</Label>
					{#if resolvedBp26?.maxBruto !== undefined && penghasilanBrutoState > resolvedBp26.maxBruto}
						<p class="tw:text-sm tw:text-red-600">
							Penghasilan Bruto melebihi nilai maksimum untuk objek pajak ini.
						</p>
					{/if}
					<Label>
						<span>DPP (%)</span>
						{#if resolvedBp26?.manualDpp}
							<Input
								name="dppManual"
								type="text"
								id={getContext('id')}
								bind:value={dppManualState}
								disabled={!bp26.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedBp26?.dppPercent ?? bp26.dpp} disabled />
						{/if}
					</Label>
					<Label>
						<span>Tarif (%)</span>
						{#if resolvedBp26?.manualTarif}
							<Input
								name="tarifManual"
								type="text"
								id={getContext('id')}
								bind:value={tarifManualState}
								disabled={!bp26.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedBp26?.tarif ?? bp26.tarif} disabled />
						{/if}
					</Label>
					<Label>
						<span>Pajak Penghasilan (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pajakPenghasilanDefault} disabled />
					</Label>
					<Label>
						<span>KAP</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kap ?? ''} disabled />
					</Label>
					<p class="tw:text-sm tw:text-gray-500">
						{#if resolvedBp26?.manualDpp || resolvedBp26?.manualTarif}
							DPP dan/atau Tarif untuk kombinasi ini dapat diisi manual (mis. Surat Keterangan
							Domisili/tarif tax treaty).
						{:else}
							DPP dan Tarif dihitung otomatis dari kombinasi Nama Objek Pajak dan Fasilitas Pajak
							saat disimpan.
						{/if}
					</p>
				</div>
			{/snippet}
		</Card>

		{#if bp26.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/bp26" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/bp26" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT BP26</div>
	{#if bp26.canEdit}
		<form {...updateBp26}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if bp26.status !== 'SUBMITTED'}
				<form {...submitBp26}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanBp26.for(bp26.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if bp26.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{bp26.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
