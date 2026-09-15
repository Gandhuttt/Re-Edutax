<script lang="ts">
	import {
		ActionButton,
		CheckboxField,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField,
		Stack
	} from '$lib/re-ui-components';

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
		open = $bindable(false),
		canEdit,
		value,
		itemCodeOptions,
		unitOptions,
		requestSave
	}: {
		open: boolean;
		canEdit: boolean;
		value: FakturTransaksi | null;
		itemCodeOptions: ItemOption[];
		unitOptions: UnitOption[];
		requestSave: (value: FakturTransaksi) => void;
	} = $props();

	let gunakanDppNilaiLain = $state(false);
	let nama = $state('');
	let satuanUkur = $state('');
	let hargaSatuan = $state(0);
	let kuantitas = $state(0);
	let hargaPotongan = $state(0);
	let dppNilaiLain = $state(0);
	let tarifPPN = $state(12);
	let tarifPPnBM = $state(0);
	let kodeItem = $state('');
	let tipe = $state<number | string>(0);
	let pendingSave = $state<FakturTransaksi | null>(null);

	const kodeOptions = $derived(
		itemCodeOptions.filter((option) => option.tipe === (Number(tipe) === 0 ? 'Barang' : 'Jasa'))
	);
	const satuanOptions = $derived(unitOptions.filter((option) => option.tipe === Number(tipe)));
	const hargaTotal = $derived(hargaSatuan * kuantitas);
	const dpp = $derived(hargaTotal - hargaPotongan);
	const ppn = $derived(((gunakanDppNilaiLain ? dppNilaiLain : dpp) * tarifPPN) / 100);
	const ppnBM = $derived((dpp * tarifPPnBM) / 100);

	$effect(() => {
		if (!open) return;
		const current = value;
		if (!current) {
			gunakanDppNilaiLain = false;
			nama = '';
			tipe = 0;
			kodeItem = '';
			satuanUkur = unitOptions.find((option) => option.tipe === 0)?.index ?? '';
			hargaSatuan = 0;
			kuantitas = 0;
			hargaPotongan = 0;
			dppNilaiLain = 0;
			tarifPPN = 12;
			tarifPPnBM = 0;
			return;
		}

		gunakanDppNilaiLain = current.dppNilaiLain !== 0;
		nama = current.nama;
		tipe = current.tipe;
		kodeItem = current.kodeItem;
		satuanUkur = current.satuanUkur;
		hargaSatuan = current.hargaSatuan;
		kuantitas = current.kuantitas;
		hargaPotongan = current.hargaPotongan;
		dppNilaiLain = current.dppNilaiLain;
		tarifPPN = current.tarifPPN;
		tarifPPnBM = current.tarifPPnBM;
	});

	function changeType(nextValue: string | number) {
		tipe = Number(nextValue);
		kodeItem = '';
		satuanUkur = unitOptions.find((option) => option.tipe === Number(nextValue))?.index ?? '';
	}

	function save() {
		pendingSave = {
			id: value?.id ?? `transaksi-draft-${crypto.randomUUID()}`,
			nama,
			kodeItem,
			satuanUkur,
			kuantitas,
			hargaSatuan,
			hargaPotongan,
			dppNilaiLain: gunakanDppNilaiLain ? dppNilaiLain : 0,
			tarifPPN,
			tarifPPnBM,
			tipe: Number(tipe),
			hargaTotal,
			DPP: dpp,
			PPN: ppn,
			PPnBM: ppnBM
		};
		open = false;
	}

	function finishClose() {
		if (!pendingSave) return;
		requestSave(pendingSave);
		pendingSave = null;
	}
</script>

{#snippet actions()}
	<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
	{#if canEdit}
		<ActionButton tone="secondary" onclick={save}>Simpan transaksi</ActionButton>
	{/if}
{/snippet}

<InstitutionalModal
	bind:open
	eyebrow={canEdit ? 'Rincian faktur' : 'Informasi transaksi'}
	title={value ? (canEdit ? 'Ubah transaksi' : 'Detail transaksi') : 'Tambah transaksi'}
	size="large"
	scrollable
	onafterclose={finishClose}
	{actions}
>
	<Stack gap="18px">
		<FieldGrid gap="14px 16px">
			<SelectField
				label="Tipe"
				value={tipe}
				disabled={!canEdit}
				floatingPanel
				options={[
					{ value: 0, label: 'Barang' },
					{ value: 1, label: 'Jasa' }
				]}
				onchange={changeType}
			/>
			<SelectField
				label="Kode"
				bind:value={kodeItem}
				disabled={!canEdit}
				searchable
				floatingPanel
				searchPlaceholder="Cari kode atau nama item"
				options={[
					{ value: '', label: 'Pilih kode barang atau jasa' },
					...kodeOptions.map((option) => ({
						value: option.kodeItem,
						label: `${option.kodeItem} — ${option.labelIndonesia}`,
						searchText: option.labelInggris
					}))
				]}
			/>
			<FormField label="Nama" bind:value={nama} disabled={!canEdit} />
			<SelectField
				label="Satuan ukur"
				bind:value={satuanUkur}
				disabled={!canEdit}
				searchable
				floatingPanel
				options={satuanOptions.map((option) => ({
					value: option.index,
					label: `${option.index} — ${option.label}`
				}))}
			/>
			<RupiahField label="Harga satuan" bind:value={hargaSatuan} disabled={!canEdit} />
			<FormField label="Kuantitas" type="number" min="0" step="1" bind:value={() => String(kuantitas), (value) => (kuantitas = Number(value))} disabled={!canEdit} />
			<RupiahField label="Total harga" value={hargaTotal} disabled />
			<RupiahField label="Potongan harga" bind:value={hargaPotongan} disabled={!canEdit} />
			<RupiahField label="DPP" value={dpp} disabled />
			<Stack gap="8px">
				<CheckboxField label="Gunakan DPP nilai lain" bind:checked={gunakanDppNilaiLain} disabled={!canEdit} compact />
				<RupiahField label="DPP nilai lain" bind:value={dppNilaiLain} disabled={!gunakanDppNilaiLain || !canEdit} />
			</Stack>
			<FormField label="Tarif PPN (%)" type="number" value={String(tarifPPN)} disabled />
			<RupiahField label="PPN" value={ppn} disabled />
			<FormField label="Tarif PPnBM (%)" type="number" min="0" step="1" bind:value={() => String(tarifPPnBM), (value) => (tarifPPnBM = Number(value))} disabled={!canEdit} />
			<RupiahField label="PPnBM" value={ppnBM} disabled />
		</FieldGrid>
	</Stack>
</InstitutionalModal>
