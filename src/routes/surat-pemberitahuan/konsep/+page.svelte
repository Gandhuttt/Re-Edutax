<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPpn } from '../listSptPpn.remote';
	import { newSptPphBadan } from './newSptPphBadan.remote';
	import { newSptPpn } from './newSptPpn.remote';

	const rupiah = new Intl.NumberFormat('id-ID');
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Konsep SPT</span>
				<div class="tw:flex tw:gap-2">
					<form {...newSptPpn}>
						<Button color="#FFD230">Buat SPT PPN</Button>
					</form>
					<form {...newSptPphBadan}>
						<Button color="#FFD230">Buat SPT PPh Badan</Button>
					</form>
				</div>
			</div>
		{/snippet}
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
							<th class="tw:w-[14rem]">PPN Keluaran</th>
							<th class="tw:w-[14rem]">PPN Masukan</th>
							<th class="tw:w-[14rem]">Kurang/Lebih Bayar</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listSptPpn({ status: 'konsep' }) as row}
							<tr>
								<td>
									<a href="/surat-pemberitahuan/spt-ppn?id={row.id}" class="tw:text-black!">
										<Button color="#FFD230">Buka</Button>
									</a>
								</td>
								<td>SPT Masa PPN</td>
								<td>{formatMonth(row.masaPajak)}</td>
								<td>{row.tahun}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.totalPpnKeluaran)}</td>
								<td>{rupiah.format(row.totalPpnMasukan)}</td>
								<td>{rupiah.format(row.ppnKurangLebihBayar)}</td>
							</tr>
						{/each}
						{#each await listSptPphBadan({ status: 'konsep' }) as row}
							<tr>
								<td>
									<a href="/surat-pemberitahuan/spt-pph-badan?id={row.id}" class="tw:text-black!">
										<Button color="#FFD230">Buka</Button>
									</a>
								</td>
								<td>SPT Tahunan PPh Badan</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>-</td>
								<td>-</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
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
