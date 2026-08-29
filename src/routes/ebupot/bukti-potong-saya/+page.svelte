<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { listBuktiPotongSaya } from './listBuktiPotongSaya.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Bukti Potong Saya</span>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[15rem]">Nomor Pemotongan</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[15rem]">NPWP Pemotong</th>
							<th class="tw:w-[15rem]">Nama Pemotong</th>
							<th class="tw:w-[20rem]">Objek Pajak</th>
							<th class="tw:w-[10rem]">Pajak Penghasilan (Rp)</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listBuktiPotongSaya() as row}
							<tr>
								<td class="tw:font-mono">{row.nomorPemotongan}</td>
								<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
								<td>{row.npwpPemotong}</td>
								<td>{row.namaPemotong}</td>
								<td>{row.namaObjekPajak ?? ''}</td>
								<td>{rupiah.format(row.pajakPenghasilan)}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6">Tidak ada data yang ditemukan.</td>
							</tr>
						{/each}
					{/snippet}
				</Table>
			</div>
		{/snippet}
	</Card>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>
