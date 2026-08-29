<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { deleteBpu } from './deleteBpu.remote';
	import { listBpu } from './listBpu.remote';
	import { newEmpty } from './newEmpty.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });

	// Matches Coretax's Status column wording (EBUPOT_STATUS reference data).
	const statusLabel = {
		NORMAL: 'Normal',
		SAVEDINVALID: 'Disimpan Tidak Valid',
		SUBMITTED: 'Disimpan'
	} as const;
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">eBupot BPU</span>
				<form {...newEmpty}><Button type="submit">+ Create eBupot BPU</Button></form>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[20rem]">Action</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[15rem]">Nomor Identitas WP</th>
							<th class="tw:w-[15rem]">Nama Penerima</th>
							<th class="tw:w-[20rem]">Objek Pajak</th>
							<th class="tw:w-[10rem]">Pajak Penghasilan (Rp)</th>
							<th class="tw:w-[10rem]">Status</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listBpu() as row}
							{@const hapusBpu = deleteBpu.for(row.id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/ebupot/bpu/{row.id}" class="tw:text-black!">
											<Button>Buka</Button>
										</a>
										{#if !row.diterbitkan}
											<form {...hapusBpu}>
												<Button color="var(--color-danger)" class="tw:text-white">Hapus</Button>
											</form>
										{/if}
									</div>
								</td>
								<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
								<td>{row.nomorIdentitasWp}</td>
								<td>{row.namaPenerima}</td>
								<td>{row.namaObjekPajak ?? ''}</td>
								<td>{rupiah.format(row.pajakPenghasilan)}</td>
								<td>
									{row.diterbitkan ? 'Telah Terbit' : statusLabel[row.status]}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7">Tidak ada data yang ditemukan.</td>
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
