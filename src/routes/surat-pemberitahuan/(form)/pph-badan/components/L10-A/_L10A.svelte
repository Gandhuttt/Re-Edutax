<script lang="ts">
	import {
		ActionButton,
		DataTable,
		FormSection,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import ModalEdit from './_ModalEdit.svelte';
	import type { L10ARow } from './types';

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l10a: L10ARow[];
		readonly?: boolean;
		negaraOptions: { value: string; label: string }[];
		bentukHubunganOptions: { value: string; label: string }[];
		jenisTransaksiOptions: { value: string; label: string }[];
		metodeHargaTransferOptions: { value: string; label: string }[];
	}

	let {
		currentTab = $bindable(),
		l10a = $bindable(),
		readonly = false,
		negaraOptions,
		bentukHubunganOptions,
		jenisTransaksiOptions,
		metodeHargaTransferOptions
	}: Props = $props();

	$effect(() => {
		currentTab.title =
			currentTab.tab === 'L10-A'
				? 'DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA'
				: currentTab.title;
	});

	const rupiah = new Intl.NumberFormat('id-ID');
	const negaraLabel = (kode: string) => negaraOptions.find((option) => option.value === kode)?.label ?? kode;
	const bentukHubunganLabel = (kode: string) =>
		bentukHubunganOptions.find((option) => option.value === kode)?.label ?? kode;
	const jenisTransaksiLabel = (kode: string) =>
		jenisTransaksiOptions.find((option) => option.value === kode)?.label ?? kode;
	const metodeHargaTransferLabel = (kode: string) =>
		metodeHargaTransferOptions.find((option) => option.value === kode)?.label ?? kode;

	let editing = $state<Partial<L10ARow>>({});
	let modalOpen = $state(false);

	function emptyRow(): Partial<L10ARow> {
		return {
			nama: '',
			npwpTin: '',
			negara: '',
			bentukHubungan: '',
			kegiatanUsaha: '',
			jenisTransaksi: '',
			nilaiTransaksi: 0,
			metodePenentuanHargaTransfer: '',
			alasanPenggunaanMetode: ''
		};
	}

	function openModal(row: L10ARow | null) {
		editing = row ? { ...row } : emptyRow();
		modalOpen = true;
	}

	function saveItem() {
		const index = l10a.findIndex((row) => row.id === editing.id);
		if (index !== -1) {
			l10a[index] = { ...(editing as L10ARow) };
		} else {
			l10a.push({ ...(editing as L10ARow), id: Date.now() });
		}
	}

	function deleteItem(id: string | number) {
		l10a = l10a.filter((row) => row.id !== id);
	}

	let totalNilaiTransaksi = $derived(
		l10a.reduce((sum, row) => sum + Number(row.nilaiTransaksi || 0), 0)
	);
</script>

<div id="spt-panel-l10-a" role="tabpanel" hidden={currentTab.tab !== 'L10-A'}>
	<FormSection
		title="Daftar transaksi yang dipengaruhi hubungan istimewa"
		description="Rincian pihak berelasi, transaksi, nilai, dan metode penentuan harga transfer."
		bordered
	>
		{#snippet actions()}
			<ActionButton tone="secondary" disabled={readonly} onclick={() => openModal(null)}>
				Tambah
			</ActionButton>
		{/snippet}

		<Stack gap="14px">
			<DataTable
				label="Daftar transaksi yang dipengaruhi hubungan istimewa"
				minWidth="1680px"
				headerTone="navy"
				density="compact"
				stickyFirstColumn
			>
				<table>
					<thead>
						<tr>
							<th scope="col">Tindakan</th>
							<th scope="col">Nama</th>
							<th scope="col">NPWP/TIN</th>
							<th scope="col">Negara</th>
							<th scope="col">Bentuk Hubungan</th>
							<th scope="col">Kegiatan Usaha</th>
							<th scope="col">Jenis Transaksi</th>
							<th scope="col" class="number">Nilai Transaksi (Rupiah)</th>
							<th scope="col">Metode Penentuan Harga Transfer yang Digunakan</th>
							<th scope="col">Alasan Penggunaan Metode</th>
						</tr>
					</thead>
					<tbody>
						{#if l10a.length === 0}
							<tr><td class="empty" colspan="10">Tidak ada data yang ditampilkan</td></tr>
						{:else}
							{#each l10a as row (row.id)}
								<tr>
									<td class="action-cell">
										<TableActions
											ariaLabel={`Aksi untuk ${row.nama}`}
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
									<td>{row.nama}</td>
									<td>{row.npwpTin}</td>
									<td>{negaraLabel(row.negara)}</td>
									<td>{bentukHubunganLabel(row.bentukHubungan)}</td>
									<td>{row.kegiatanUsaha}</td>
									<td>{jenisTransaksiLabel(row.jenisTransaksi)}</td>
									<td class="number">{rupiah.format(row.nilaiTransaksi)}</td>
									<td>{metodeHargaTransferLabel(row.metodePenentuanHargaTransfer)}</td>
									<td>{row.alasanPenggunaanMetode}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
					<tfoot>
						<tr>
							<th scope="row" colspan="7">Jumlah</th>
							<td class="number"><strong>{rupiah.format(totalNilaiTransaksi)}</strong></td>
							<td colspan="2"></td>
						</tr>
					</tfoot>
				</table>
			</DataTable>
		</Stack>
	</FormSection>
</div>

<ModalEdit
	bind:open={modalOpen}
	bind:data={editing}
	{saveItem}
	{negaraOptions}
	{bentukHubunganOptions}
	{jenisTransaksiOptions}
	{metodeHargaTransferOptions}
	{readonly}
/>
