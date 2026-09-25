<script lang="ts">
	import { DisclosureItem, Stack } from '$lib/re-ui-components';
	import A from './A.svelte';
	import B from './B.svelte';
	import C from './C.svelte';
	import ModalEdit from './_ModalEdit.svelte';
	import type { L9Row } from './types';

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l9: L9Row[];
		readonly?: boolean;
		jenisHartaOptions: {
			value: string;
			label: string;
			kelompok: 'harta_berwujud' | 'bangunan' | 'harta_tidak_berwujud';
		}[];
		metodePenyusutanOptions: { value: string; label: string; jenis: 'komersial' | 'fiskal' }[];
		jumlahPenyusutanKomersialA: number;
		jumlahPenyusutanKomersialB: number;
		jumlahAmortisasiKomersialC: number;
	}

	let {
		currentTab = $bindable(),
		l9 = $bindable(),
		readonly = false,
		jenisHartaOptions,
		metodePenyusutanOptions,
		jumlahPenyusutanKomersialA = $bindable(),
		jumlahPenyusutanKomersialB = $bindable(),
		jumlahAmortisasiKomersialC = $bindable()
	}: Props = $props();

	let metodeKomersialOptions = $derived(
		metodePenyusutanOptions.filter((option) => option.jenis === 'komersial')
	);
	let metodeFiskalOptions = $derived(
		metodePenyusutanOptions.filter((option) => option.jenis === 'fiskal')
	);

	$effect(() => {
		currentTab.title =
			currentTab.tab === 'L9'
				? 'DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL'
				: currentTab.title;
	});

	let jenisHartaKelompokByValue = $derived(
		new Map(jenisHartaOptions.map((option) => [option.value, option.kelompok]))
	);
	let jenisHartaOptionsBerwujud = $derived(
		jenisHartaOptions.filter((option) => option.kelompok === 'harta_berwujud')
	);
	let jenisHartaOptionsBangunan = $derived(
		jenisHartaOptions.filter((option) => option.kelompok === 'bangunan')
	);
	let jenisHartaOptionsTidakBerwujud = $derived(
		jenisHartaOptions.filter((option) => option.kelompok === 'harta_tidak_berwujud')
	);
	let dataBerwujud = $derived(
		l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'harta_berwujud')
	);
	let dataBangunan = $derived(
		l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'bangunan')
	);
	let dataTidakBerwujud = $derived(
		l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'harta_tidak_berwujud')
	);

	let editing = $state<Partial<L9Row>>({});
	let editingOptions = $state<{ value: string; label: string }[]>([]);
	let modalOpen = $state(false);

	function emptyRow(kelompokPenyusutan: L9Row['kelompokPenyusutan']): Partial<L9Row> {
		return {
			kelompokPenyusutan,
			jenisHarta: '',
			kodeHarta: '',
			bulanTahunPerolehan: '',
			hargaPerolehan: 0,
			nilaiSisaBukuFiskalAwalTahun: 0,
			metodePenyusutanKomersial: '',
			metodePenyusutanFiskal: '',
			penyusutanAmortisasiFiskalTahunIni: 0,
			penyusutanAmortisasiKomersialTahunIni: 0,
			akumulasiPenyusutanAmortisasiFiskal: 0,
			nilaiSisaBukuFiskalAkhirTahun: 0,
			keterangan: ''
		};
	}

	function openModal(
		row: L9Row | null,
		kelompokPenyusutan: L9Row['kelompokPenyusutan'],
		options: { value: string; label: string }[]
	) {
		editing = row ? { ...row } : emptyRow(kelompokPenyusutan);
		editingOptions = options;
		modalOpen = true;
	}

	function saveItem() {
		const index = l9.findIndex((row) => row.id === editing.id);
		if (index !== -1) {
			l9[index] = { ...(editing as L9Row) };
		} else {
			l9.push({ ...(editing as L9Row), id: Date.now() });
		}
	}

	function deleteItem(id: string | number) {
		l9 = l9.filter((row) => row.id !== id);
	}
</script>

<div id="spt-panel-l9" role="tabpanel" hidden={currentTab.tab !== 'L9'}>
	<Stack gap="14px">
		<DisclosureItem title="HARTA BERWUJUD">
			<A
				data={dataBerwujud}
				{openModal}
				{deleteItem}
				jenisHartaOptions={jenisHartaOptionsBerwujud}
				bind:jumlahPenyusutanKomersial={jumlahPenyusutanKomersialA}
				{readonly}
			/>
		</DisclosureItem>
		<DisclosureItem title="BANGUNAN">
			<B
				data={dataBangunan}
				{openModal}
				{deleteItem}
				jenisHartaOptions={jenisHartaOptionsBangunan}
				bind:jumlahPenyusutanKomersial={jumlahPenyusutanKomersialB}
				{readonly}
			/>
		</DisclosureItem>
		<DisclosureItem title="HARTA TIDAK BERWUJUD">
			<C
				data={dataTidakBerwujud}
				{openModal}
				{deleteItem}
				jenisHartaOptions={jenisHartaOptionsTidakBerwujud}
				bind:jumlahAmortisasiKomersial={jumlahAmortisasiKomersialC}
				{readonly}
			/>
		</DisclosureItem>
	</Stack>
</div>

<ModalEdit
	bind:open={modalOpen}
	bind:data={editing}
	{saveItem}
	jenisHartaOptions={editingOptions}
	{metodeKomersialOptions}
	{metodeFiskalOptions}
	{readonly}
/>
