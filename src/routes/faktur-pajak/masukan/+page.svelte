<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getWajibPajak } from '../../getWajibPajak.remote';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { kreditkanFaktur } from './kreditkanFaktur.remote';
	import { listFaktur } from './listFaktur.remote';

	const transactionCodeOptions = await getKodeTransaksiFaktur();
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Faktur Masukan</span>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[20rem]">Action</th>
							<th class="tw:w-[15rem]">NPWP Penjual</th>
							<th class="tw:w-[15rem]">Nama Penjual</th>
							<th class="tw:w-[20rem]">Kode Transaksi</th>
							<th class="tw:w-[15rem]">Nomor Faktur Pajak</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[10rem]">Status</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listFaktur() as { id, npwpPenjual, kodeTransaksi, nomorFaktur, masaPajak, dikreditkan }}
							{@const kreditFaktur = kreditkanFaktur.for(id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/faktur-pajak/{id}" class="tw:text-black!">
											<Button color="#FFD230">Lihat</Button>
										</a>
										{#if !dikreditkan}
											<form {...kreditFaktur}><Button color="#FFD230">Kreditkan</Button></form>
										{/if}
									</div>
								</td>
								<td>{npwpPenjual}</td>
								<td>{(await getWajibPajak({ npwp: npwpPenjual }))?.nama ?? ''}</td>
								<td>{transactionCodeOptions.find((option) => option.key === kodeTransaksi)?.value ?? ''}</td>
								<td>{nomorFaktur}</td>
								<td>{formatMonth(masaPajak)}</td>
								<td>
									{#if !dikreditkan}
										<span>Pending</span>
									{:else}
										<span>Dikreditkan</span>
									{/if}
								</td>
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
