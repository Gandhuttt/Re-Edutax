<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { listSptPpn } from '../listSptPpn.remote';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPphOrangPribadi } from '../listSptPphOrangPribadi.remote';
	import { paySptPpn } from './paySptPpn.remote';
	import { paySptPphBadan } from './paySptPphBadan.remote';
	import { paySptPphOrangPribadi } from './paySptPphOrangPribadi.remote';

	const rupiah = new Intl.NumberFormat('id-ID');
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}<span class="tw:text-2xl">SPT Menunggu Pembayaran</span>{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[15rem]">Action</th>
							<th class="tw:w-[15rem]">Jenis SPT</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[8rem]">Tahun</th>
							<th class="tw:w-[12rem]">Pembetulan</th>
							<th class="tw:w-[14rem]">Kurang Bayar</th>
							<th class="tw:w-[14rem]">Tanggal Posting</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listSptPpn({ status: 'menunggu_pembayaran' }) as row}
							{@const payForm = paySptPpn.for(row.id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/surat-pemberitahuan/ppn?id={row.id}" class="tw:text-black!">
											<Button>Lihat</Button>
										</a>
										<form {...payForm}>
											<Button>Bayar</Button>
										</form>
									</div>
								</td>
								<td>SPT Masa PPN</td>
								<td>{formatMonth(row.masaPajak)}</td>
								<td>{row.tahun}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.ppnKurangLebihBayar)}</td>
								<td>{row.tanggalPosting?.toLocaleDateString('id-ID') ?? ''}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="tw:text-center tw:py-8">Belum ada SPT PPN yang menunggu pembayaran.</td>
							</tr>
						{/each}
						{#each await listSptPphBadan({ status: 'menunggu_pembayaran' }) as row}
							{@const payForm = paySptPphBadan.for(row.id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/surat-pemberitahuan/pph-badan?id={row.id}" class="tw:text-black!">
											<Button>Lihat</Button>
										</a>
										<form {...payForm}>
											<Button>Bayar</Button>
										</form>
									</div>
								</td>
								<td>SPT Tahunan PPh Badan</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
								<td>{row.tanggalPosting?.toLocaleDateString('id-ID') ?? ''}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="tw:text-center tw:py-8">Belum ada SPT PPh Badan yang menunggu pembayaran.</td>
							</tr>
						{/each}
						{#each await listSptPphOrangPribadi({ status: 'menunggu_pembayaran' }) as row}
							{@const payForm = paySptPphOrangPribadi.for(row.id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/surat-pemberitahuan/pph-orang-pribadi?id={row.id}" class="tw:text-black!">
											<Button>Lihat</Button>
										</a>
										<form {...payForm}>
											<Button>Bayar</Button>
										</form>
									</div>
								</td>
								<td>SPT Tahunan PPh Orang Pribadi</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
								<td>{row.tanggalPosting?.toLocaleDateString('id-ID') ?? ''}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="7" class="tw:text-center tw:py-8">Belum ada SPT PPh Orang Pribadi yang menunggu pembayaran.</td>
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
