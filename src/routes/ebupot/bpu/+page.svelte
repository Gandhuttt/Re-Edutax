<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { deleteBpu } from './deleteBpu.remote';
	import { listBpu } from './listBpu.remote';
	import { newEmpty } from './newEmpty.remote';

	const rows = await listBpu();

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });
</script>

<div class="tw:w-full tw:p-6">
	<Card>
		{#snippet head()}
			<div class="tw:flex tw:w-full tw:items-center tw:justify-between">
				<span class="tw:font-semibold">eBupot BPU</span>
				<form {...newEmpty}>
					<Button type="submit">+ Create eBupot BPU</Button>
				</form>
			</div>
		{/snippet}
		{#snippet body()}
			<Table class="tw:w-full tw:text-sm">
				{#snippet head()}
					<tr class="tw:bg-gray-200 tw:text-left">
						<th class="tw:p-2">Masa Pajak</th>
						<th class="tw:p-2">Nomor Identitas WP</th>
						<th class="tw:p-2">Nama Penerima</th>
						<th class="tw:p-2">Objek Pajak</th>
						<th class="tw:p-2 tw:text-right">Pajak Penghasilan (Rp)</th>
						<th class="tw:p-2">Status</th>
						<th class="tw:p-2"></th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each rows as row (row.id)}
						<tr class="tw:border-b">
							<td class="tw:p-2">{formatMonth(row.masaPajak)} {row.tahun}</td>
							<td class="tw:p-2">{row.nomorIdentitasWp}</td>
							<td class="tw:p-2">{row.namaPenerima}</td>
							<td class="tw:p-2">{row.namaObjekPajak ?? '-'}</td>
							<td class="tw:p-2 tw:text-right">{rupiah.format(row.pajakPenghasilan)}</td>
							<td class="tw:p-2">{row.diterbitkan ? 'Telah Terbit' : 'Belum Terbit'}</td>
							<td class="tw:p-2 tw:flex tw:gap-2">
								<a href="/ebupot/bpu/{row.id}">Buka</a>
								{#if !row.diterbitkan}
									<form {...deleteBpu}>
										<input type="hidden" name="id" value={row.id} />
										<button type="submit">Hapus</button>
									</form>
								{/if}
							</td>
						</tr>
					{:else}
						<tr>
							<td class="tw:p-2" colspan="7">Tidak ada data yang ditemukan.</td>
						</tr>
					{/each}
				{/snippet}
			</Table>
		{/snippet}
	</Card>
</div>
