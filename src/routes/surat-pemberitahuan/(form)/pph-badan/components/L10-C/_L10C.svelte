<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FormSection,
		RadioGroup,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import ModalEdit from './_ModalEdit.svelte';
	import type { L10CRow } from './types';

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l10c: L10CRow[];
		ditentukanPrinsip: boolean;
		readonly?: boolean;
		negaraOptions: { value: string; label: string }[];
		jenisTransaksiOptions: { value: string; label: string }[];
	}

	let {
		currentTab = $bindable(),
		l10c = $bindable(),
		ditentukanPrinsip = $bindable(),
		readonly = false,
		negaraOptions,
		jenisTransaksiOptions
	}: Props = $props();

	$effect(() => {
		currentTab.title =
			currentTab.tab === 'L10-C'
				? 'PERNYATAAN TRANSAKSI DENGAN PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY'
				: currentTab.title;
	});

	const rupiah = new Intl.NumberFormat('id-ID');
	const negaraLabel = (kode: string) => negaraOptions.find((option) => option.value === kode)?.label ?? kode;
	const jenisTransaksiLabel = (kode: string) =>
		jenisTransaksiOptions.find((option) => option.value === kode)?.label ?? kode;
	const yesNoOptions = $derived([
		{ value: 'false', label: 'Tidak', disabled: readonly },
		{ value: 'true', label: 'Ya', disabled: readonly }
	]);

	let editing = $state<Partial<L10CRow>>({});
	let modalOpen = $state(false);

	function emptyRow(): Partial<L10CRow> {
		return { namaMitraTransaksi: '', jenisTransaksi: '', negara: '', nilaiTransaksi: 0 };
	}

	function openModal(row: L10CRow | null) {
		editing = row ? { ...row } : emptyRow();
		modalOpen = true;
	}

	function saveItem() {
		const index = l10c.findIndex((row) => row.id === editing.id);
		if (index !== -1) {
			l10c[index] = { ...(editing as L10CRow) };
		} else {
			l10c.push({ ...(editing as L10CRow), id: Date.now() });
		}
	}

	function deleteItem(id: string | number) {
		l10c = l10c.filter((row) => row.id !== id);
	}
</script>

<div id="spt-panel-l10-c" role="tabpanel" hidden={currentTab.tab !== 'L10-C'}>
	<Stack gap="16px">
		<FormSection
			number="I."
			title="Transaksi dengan pihak yang merupakan penduduk tax haven country"
			description="Daftar transaksi dalam tahun pajak ini dengan mitra di negara atau yurisdiksi tax haven."
			bordered
		>
			{#snippet actions()}
				<ActionButton tone="secondary" disabled={readonly} onclick={() => openModal(null)}>
					Tambah
				</ActionButton>
			{/snippet}

			<DataTable
				label="Transaksi dengan pihak tax haven country"
				minWidth="980px"
				headerTone="navy"
				density="compact"
				stickyFirstColumn
			>
				<table>
					<thead>
						<tr>
							<th scope="col">Tindakan</th>
							<th scope="col">No.</th>
							<th scope="col">Nama Mitra Transaksi</th>
							<th scope="col">Jenis Transaksi</th>
							<th scope="col">Negara</th>
							<th scope="col" class="number">Nilai Transaksi (Rupiah)</th>
						</tr>
					</thead>
					<tbody>
						{#if l10c.length === 0}
							<tr><td class="empty" colspan="6">Tidak ada data yang ditampilkan</td></tr>
						{:else}
							{#each l10c as row, index (row.id)}
								<tr>
									<td class="action-cell">
										<TableActions
											ariaLabel={`Aksi untuk ${row.namaMitraTransaksi}`}
											actions={[
												{ label: 'Edit', disabled: readonly, onclick: () => openModal(row) },
												{
													label: 'Hapus',
													danger: true,
													disabled: readonly,
													onclick: () => deleteItem(row.id)
												}
											]}
										/>
									</td>
									<td>{index + 1}</td>
									<td>{row.namaMitraTransaksi}</td>
									<td>{jenisTransaksiLabel(row.jenisTransaksi)}</td>
									<td>{negaraLabel(row.negara)}</td>
									<td class="number">{rupiah.format(row.nilaiTransaksi)}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</DataTable>
		</FormSection>

		<FormSection
			number="II."
			title="Penentuan harga transaksi"
			description="Pernyataan penggunaan Prinsip Kewajaran dan Kelaziman Usaha."
			bordered
		>
			<RadioGroup
				label="Harga transaksi di atas ditentukan dengan menggunakan Prinsip Kewajaran dan Kelaziman Usaha"
				name="ditentukanPrinsip"
				value={ditentukanPrinsip ? 'true' : 'false'}
				options={yesNoOptions}
				onchange={(value) => (ditentukanPrinsip = value === 'true')}
			/>
		</FormSection>
	</Stack>
</div>

<ModalEdit
	bind:open={modalOpen}
	bind:data={editing}
	{saveItem}
	{negaraOptions}
	{jenisTransaksiOptions}
	{readonly}
/>
