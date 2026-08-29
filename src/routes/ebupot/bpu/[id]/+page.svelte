<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getContext } from 'svelte';
	import { getFasilitasPajakBpu } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBpu } from '../../objekPajakBpu.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpu } from './getBpu.remote';
	import { submitBpu } from './submitBpu.remote';
	import { terbitkanBpu } from '../terbitkanBpu.remote';
	import { updateBpu } from './updateBpu.remote';

	const bpu = await getBpu();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([
		getObjekPajakBpu(),
		getFasilitasPajakBpu(),
		getJenisDokumenEbupot()
	]);

	let masaPajakState = $state(bpu.masaPajak);
	let tahunState = $state(bpu.tahun);
	let nomorIdentitasWpState = $state(bpu.nomorIdentitasWp);
	let namaPenerimaState = $state(bpu.namaPenerima);
	let kodeObjekPajakIdState = $state(bpu.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bpu.fasilitasPajakId ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const selectedFasilitas = $derived(fasilitasOptions.find((f) => f.id === fasilitasPajakIdState));
	const nitkuPenerima = $derived(nomorIdentitasWpState ? `${nomorIdentitasWpState}000000` : '');
	const nitkuPemotong = `${bpu.npwpPemotong}000000`;

	// Client-side mirror of resolveTarif.ts, for display only -- the server
	// is the source of truth at save time. See docs/ui-reference/coretax/
	// ebupot/NOTES.md "BPU: Fasilitas Pajak and manual-rate objects": Coretax
	// unlocks Tarif(%) for manual entry when the matching ItemList entry has
	// ManualTaxRate: "TRUE", instead of leaving it derived-and-readonly.
	const resolvedTarif = $derived.by(() => {
		if (!selectedObjekPajak || !selectedFasilitas) return null;
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) =>
				entry.TaxCertificateCode === selectedFasilitas.kode ||
				entry.TaxCertificateCodes?.includes(selectedFasilitas.kode)
		);
		if (!item) return null;
		const manual = item.ManualTaxRate?.toUpperCase() === 'TRUE';
		const tarif = typeof item.Rate === 'number' ? item.Rate : (item.Rates?.[0]?.Rate ?? 0);
		return { tarif, manual };
	});

	let tarifManualState = $state(bpu.tarif);
	$effect(() => {
		// Every combo change resets Tarif to Coretax's default for it, even
		// when manual entry is allowed -- matches live behavior (switching
		// Fasilitas re-populates Tarif with the new default rather than
		// preserving a prior manual override).
		if (resolvedTarif) tarifManualState = resolvedTarif.tarif;
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
										disabled={!bpu.canEdit}
									>
										{#each months as m (m)}
											<option value={m}>{formatMonth(m)}</option>
										{/each}
									</Select>
									<Input
										name="tahun"
										type="number"
										bind:value={tahunState}
										disabled={!bpu.canEdit}
										class="tw:w-30"
									/>
								</div>
							</Label>
							<Label>
								<span>Status</span>
								<Input type="text" id={getContext('id')} value={bpu.status} disabled />
							</Label>
							<Label>
								<span>Nomor Identitas WP (Penerima)</span>
								<div class="tw:flex tw:flex-row">
									<Input
										class={bpu.canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
										name="nomorIdentitasWp"
										type="text"
										id={getContext('id')}
										bind:value={nomorIdentitasWpState}
										disabled={!bpu.canEdit}
									/>
									{#if bpu.canEdit}
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
									disabled={!bpu.canEdit}
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
									value={bpu.jenisDokumenId ?? ''}
									disabled={!bpu.canEdit}
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
									value={bpu.nomorDokumen}
									disabled={!bpu.canEdit}
								/>
							</Label>
							<Label>
								<span>Tanggal Dokumen</span>
								<Input
									name="tanggalDokumen"
									type="date"
									id={getContext('id')}
									value={bpu.tanggalDokumen ?? ''}
									disabled={!bpu.canEdit}
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
						<span>Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan</span>
						<Select
							name="fasilitasPajakId"
							id={getContext('id')}
							bind:value={fasilitasPajakIdState}
							disabled={!bpu.canEdit}
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
							disabled={!bpu.canEdit}
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
						<span>Dasar Pengenaan Pajak (Rp)</span>
						<Input
							name="dasarPengenaanPajak"
							type="text"
							id={getContext('id')}
							value={bpu.dasarPengenaanPajak}
							disabled={!bpu.canEdit}
						/>
					</Label>
					<Label>
						<span>Tarif (%)</span>
						{#if resolvedTarif?.manual}
							<Input
								name="tarifManual"
								type="text"
								id={getContext('id')}
								bind:value={tarifManualState}
								disabled={!bpu.canEdit}
							/>
						{:else}
							<Input type="text" id={getContext('id')} value={resolvedTarif?.tarif ?? bpu.tarif} disabled />
						{/if}
					</Label>
					<Label>
						<span>KAP</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kap ?? ''} disabled />
					</Label>
					<p class="tw:text-sm tw:text-gray-500">
						{#if resolvedTarif?.manual}
							Tarif untuk kombinasi ini dapat diisi manual. Pajak Penghasilan dihitung otomatis
							dari Dasar Pengenaan Pajak x Tarif saat disimpan.
						{:else}
							Tarif dan Pajak Penghasilan dihitung otomatis dari kombinasi Nama Objek Pajak dan
							Fasilitas Pajak saat disimpan.
						{/if}
					</p>
				</div>
			{/snippet}
		</Card>

		{#if bpu.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/bpu" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/bpu" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT BPU</div>
	{#if bpu.canEdit}
		<form {...updateBpu}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if bpu.status !== 'SUBMITTED'}
				<form {...submitBpu}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanBpu.for(bpu.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if bpu.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{bpu.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
