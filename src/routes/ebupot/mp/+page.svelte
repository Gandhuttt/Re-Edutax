<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { deleteMp } from './deleteMp.remote';
	import { listMp } from './listMp.remote';
	import { newEmpty } from './newEmpty.remote';
	import { terbitkanMp } from './terbitkanMp.remote';

	const rupiah = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 });

	const statusLabel = {
		NORMAL: 'Normal',
		SAVEDINVALID: 'Disimpan Tidak Valid',
		SUBMITTED: 'Disimpan'
	} as const;

	const tabs = ['Belum Terbit', 'Telah Terbit', 'Tidak Valid'] as const;
	let activeTab: (typeof tabs)[number] = $state('Belum Terbit');

	function filterRows(rows: Awaited<ReturnType<typeof listMp>>, tab: (typeof tabs)[number]) {
		if (tab === 'Telah Terbit') return rows.filter((r) => r.diterbitkan);
		if (tab === 'Tidak Valid') return [];
		return rows.filter((r) => !r.diterbitkan);
	}
</script>

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:h-10 tw:flex tw:items-center tw:mb-3">
		eBupot Bukti Pemotongan Bulanan Pegawai Tetap
	</div>

	<div class="tw:flex tw:flex-row tw:gap-5">
		<div class="tw:w-[12rem] tw:shrink-0 tw:rounded-sm tw:bg-gray-100 tw:border tw:border-[#a9a9a9]">
			<div class="tw:px-3 tw:py-2 tw:font-semibold tw:border-b tw:border-b-[#a9a9a9]">MP</div>
			<div class="tw:flex tw:flex-col">
				{#each tabs as tab (tab)}
					<button
						type="button"
						class="tw:text-left tw:px-3 tw:py-2"
						class:tw:bg-amber-100={activeTab === tab}
						onclick={() => (activeTab = tab)}
					>
						{tab}
					</button>
				{/each}
			</div>
		</div>

		<div class="tw:grow tw:min-h-100 tw:overflow-scroll tw:rounded-sm tw:bg-gray-100 tw:border tw:border-[#a9a9a9]">
			<div
				class="tw:px-3 tw:py-2 tw:font-semibold tw:border-b tw:border-b-[#a9a9a9] tw:flex tw:flex-row tw:justify-between tw:items-center"
			>
				<span class="tw:uppercase">EBUPOT MP {activeTab}</span>
				{#if activeTab === 'Belum Terbit'}
					<form {...newEmpty}><Button type="submit">+ Create eBupot MP</Button></form>
				{/if}
			</div>
			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						<th class="tw:w-[20rem]">Action</th>
						<th class="tw:w-[10rem]">Masa Pajak</th>
						<th class="tw:w-[15rem]">Nomor Identitas WP</th>
						<th class="tw:w-[15rem]">Nama</th>
						<th class="tw:w-[20rem]">Objek Pajak</th>
						<th class="tw:w-[10rem]">Pajak Penghasilan (Rp)</th>
						<th class="tw:w-[10rem]">Status</th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each filterRows(await listMp(), activeTab) as row}
						{@const hapusMp = deleteMp.for(row.id)}
						{@const terbitkanRow = terbitkanMp.for(row.id)}
						<tr>
							<td>
								<div class="tw:flex tw:flex-row tw:gap-1">
									<a href="/ebupot/mp/{row.id}" class="tw:text-black!">
										<Button>Buka</Button>
									</a>
									{#if !row.diterbitkan}
										{#if row.status === 'SUBMITTED'}
											<form {...terbitkanRow}>
												<Button color="var(--color-secondary)" class="tw:text-white">
													Terbitkan
												</Button>
											</form>
										{/if}
										<form {...hapusMp}>
											<Button color="var(--color-danger)" class="tw:text-white">Hapus</Button>
										</form>
									{/if}
								</div>
							</td>
							<td>{formatMonth(row.masaPajak)} {row.tahun}</td>
							<td>{row.nomorIdentitasWp}</td>
							<td>{row.nama}</td>
							<td>{row.namaObjekPajak ?? ''}</td>
							<td>{rupiah.format(row.pajakPenghasilanDipotong)}</td>
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
	</div>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>
