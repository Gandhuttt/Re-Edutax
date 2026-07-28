<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPpn } from '../listSptPpn.remote';

	const rupiah = new Intl.NumberFormat('id-ID');
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}<span class="tw:text-2xl">SPT Dilaporkan</span>{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[10rem]">Action</th>
							<th class="tw:w-[15rem]">Jenis SPT</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[8rem]">Tahun</th>
							<th class="tw:w-[12rem]">Pembetulan</th>
							<th class="tw:w-[14rem]">Kurang/Lebih Bayar</th>
							<th class="tw:w-[14rem]">Tanggal Lapor</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listSptPpn({ status: 'dilaporkan' }) as row}
							<tr>
								<td>
									<a href="/surat-pemberitahuan/ppn?id={row.id}" class="tw:text-black!">
										<Button color="#FFD230">Lihat</Button>
									</a>
								</td>
								<td>SPT Masa PPN</td>
								<td>{formatMonth(row.masaPajak)}</td>
								<td>{row.tahun}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.ppnKurangLebihBayar)}</td>
								<td>{row.tanggalDilaporkan?.toLocaleDateString('id-ID') ?? ''}</td>
							</tr>
						{/each}
						{#each await listSptPphBadan({ status: 'dilaporkan' }) as row}
							<tr>
								<td>
									<a href="/surat-pemberitahuan/pph-badan?id={row.id}" class="tw:text-black!">
										<Button color="#FFD230">Lihat</Button>
									</a>
								</td>
								<td>SPT Tahunan PPh Badan</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
								<td>{row.tanggalDilaporkan?.toLocaleDateString('id-ID') ?? ''}</td>
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
