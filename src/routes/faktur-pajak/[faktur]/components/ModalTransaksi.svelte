<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Label from '$lib/components/Label.svelte';
	import SvelteSelect from 'svelte-select';

	type FakturTransaksi = {
		id: string;
		nama: string;
		kodeItem: string;
		satuanUkur: string;
		kuantitas: number;
		hargaSatuan: number;
		hargaPotongan: number;
		dppNilaiLain: number;
		tarifPPN: number;
		tarifPPnBM: number;
		tipe: number;
		hargaTotal: number;
		DPP: number;
		PPN: number;
		PPnBM: number;
	};

	type ItemOption = {
		id: string;
		tipe: 'Barang' | 'Jasa';
		kodeItem: string;
		labelIndonesia: string;
		labelInggris: string;
	};

	type UnitOption = {
		id: string;
		jenisItemId: string | null;
		tipe: number;
		index: string;
		label: string;
	};

	let {
		id,
		canEdit,
		isUploaded,
		value,
		itemCodeOptions,
		unitOptions,
		requestSave
	}: {
		id: string;
		canEdit: boolean;
		isUploaded: boolean;
		value: FakturTransaksi | null;
		itemCodeOptions: ItemOption[];
		unitOptions: UnitOption[];
		requestSave: (value: FakturTransaksi) => void;
	} = $props();

	let gunakanDppNilaiLain = $state(false);
	let nama = $state('');
	let satuanUkur = $state('000024');
	let hargaSatuan = $state(0);
	let kuantitas = $state(0);
	let hargaPotongan = $state(0);
	let dppNilaiLain = $state(0);
	let tarifPPN = $state(12);
	let tarifPPnBM = $state(0);
	let kodeItem = $state('');
	let tipe = $state(0);

	const hargaTotal = $derived(hargaSatuan * kuantitas);
	const dpp = $derived(hargaTotal - hargaPotongan);
	const ppn = $derived(((gunakanDppNilaiLain ? dppNilaiLain : dpp) * tarifPPN) / 100);
	const ppnBM = $derived((dpp * tarifPPnBM) / 100);
	const kodeOptions = $derived(itemCodeOptions.filter((option) => option.tipe === (tipe === 0 ? 'Barang' : 'Jasa')));
	const satuanOptions = $derived(unitOptions.filter((option) => option.tipe === tipe));
	let selectedOption = $state<ItemOption | null>(null);

	$effect(() => {
		if (!value) {
			gunakanDppNilaiLain = false;
			nama = '';
			satuanUkur = '000024';
			hargaSatuan = 0;
			kuantitas = 0;
			hargaPotongan = 0;
			dppNilaiLain = 0;
			tarifPPN = 12;
			tarifPPnBM = 0;
			kodeItem = '';
			tipe = 0;
			selectedOption = null;
			return;
		}

		gunakanDppNilaiLain = value.dppNilaiLain !== 0;
		nama = value.nama;
		satuanUkur = value.satuanUkur;
		hargaSatuan = value.hargaSatuan;
		kuantitas = value.kuantitas;
		hargaPotongan = value.hargaPotongan;
		dppNilaiLain = value.dppNilaiLain;
		tarifPPN = value.tarifPPN;
		tarifPPnBM = value.tarifPPnBM;
		kodeItem = value.kodeItem;
		tipe = value.tipe;
		selectedOption = itemCodeOptions.find((option) => option.kodeItem === value.kodeItem) ?? null;
	});

	$effect(() => {
		kodeItem = selectedOption?.kodeItem ?? '';
	});

	function save() {
		requestSave({
			id: value?.id ?? `transaksi-draft-${Date.now()}`,
			nama,
			kodeItem,
			satuanUkur,
			kuantitas,
			hargaSatuan,
			hargaPotongan,
			dppNilaiLain: gunakanDppNilaiLain ? dppNilaiLain : 0,
			tarifPPN,
			tarifPPnBM,
			tipe,
			hargaTotal,
			DPP: dpp,
			PPN: ppn,
			PPnBM: ppnBM
		});
	}
</script>

<div class="modal fade" {id} tabindex="-1" aria-labelledby="transaksiModalLabel">
	<div class="modal-dialog modal-dialog-centered" style="min-width: 75%;">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="transaksiModalLabel">Tambah Transaksi</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="tw:flex tw:w-full tw:flex-row tw:gap-4">
					<div class="tw:flex tw:basis-1/2 tw:flex-col tw:gap-4">
						<Label>
							<span>Tipe</span>
							<select bind:value={tipe} disabled={!canEdit}>
								<option value={0}>Barang</option>
								<option value={1}>Jasa</option>
							</select>
						</Label>
						<Label>
							<span>Kode</span>
							<SvelteSelect
								items={kodeOptions}
								bind:value={selectedOption}
								itemId="kodeItem"
								label="labelIndonesia"
								placeholder="Search..."
								disabled={!canEdit}
							/>
						</Label>
						<Label>
							<span>Nama</span>
							<input type="text" bind:value={nama} disabled={!canEdit} />
						</Label>
						<Label>
							<span>Satuan</span>
							<select bind:value={satuanUkur} disabled={!canEdit}>
								{#each satuanOptions as option}
									<option value={option.index}>{option.label}</option>
								{/each}
							</select>
						</Label>
						<Label>
							<span>Harga Satuan</span>
							<input type="number" bind:value={hargaSatuan} disabled={!canEdit} />
						</Label>
						<Label>
							<span>Kuantitas</span>
							<input type="number" bind:value={kuantitas} disabled={!canEdit} />
						</Label>
						<Label>
							<span>Total Harga</span>
							<input type="number" value={hargaTotal} disabled />
						</Label>
						<Label>
							<span>Potongan Harga</span>
							<input type="number" bind:value={hargaPotongan} disabled={!canEdit} />
						</Label>
					</div>

					<div class="tw:flex tw:basis-1/2 tw:flex-col tw:gap-4">
						<Label>
							<span>DPP</span>
							<input type="number" disabled value={dpp} />
						</Label>
						<Label>
							<div class="tw:flex tw:items-center tw:justify-end tw:gap-2">
								<span>DPP Nilai Lain/DPP</span>
								<input type="checkbox" bind:checked={gunakanDppNilaiLain} disabled={!canEdit} />
							</div>
						</Label>
						<input type="number" bind:value={dppNilaiLain} disabled={!gunakanDppNilaiLain || !canEdit} />
						<Label>
							<span>Tarif PPN (%)</span>
							<input type="number" disabled bind:value={tarifPPN} />
						</Label>
						<Label>
							<span>PPN</span>
							<input type="number" disabled value={ppn} />
						</Label>
						<Label>
							<span>Tarif PPnBM (%)</span>
							<input type="number" bind:value={tarifPPnBM} disabled={!canEdit} />
						</Label>
						<Label>
							<span>PPnBM</span>
							<input type="number" disabled value={ppnBM} />
						</Label>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				{#if !isUploaded}
					<Button color="#FFD230" data-bs-dismiss="modal" type="button" onclick={save}>
						<span>Simpan</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	input[type='text'],
	input[type='number'],
	select {
		height: 2.5rem;
		width: 100%;
		border-color: var(--color-input-secondary);
		border-radius: 4px;
		background: var(--color-input-primary);
	}
</style>
