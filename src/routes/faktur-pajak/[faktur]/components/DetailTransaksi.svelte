<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { updateFaktur } from '../updateFaktur.remote';

	type FakturTransaksi = {
		id: string;
		nama: string;
		kodeItem: string;
		satuanUkur: string;
		kuantitas: number;
		hargaSatuan: number;
		hargaPotongan: number;
		dppNilaiLain: number;
		tarifPPN: number;
		tarifPPnBM: number;
		tipe: number;
	};

	let {
		requestCreate,
		requestDelete,
		requestEdit,
		values,
		idTarget,
		canEdit
	}: {
		requestCreate: () => void;
		requestEdit: (index: number) => void;
		requestDelete: (index: number) => void;
		values: FakturTransaksi[];
		idTarget: string;
		canEdit: boolean;
	} = $props();
</script>

<Card>
	{#snippet head()}
		<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
			<span class="tw:text-xl">Detail Transaksi</span>
			{#if canEdit}
				<Button
					color="#FFD230"
					type="button"
					data-bs-toggle="modal"
					data-bs-target="#{idTarget}"
					onclick={requestCreate}
				>
					<span>Buat Transaksi</span>
				</Button>
			{/if}
		</div>
	{/snippet}
	{#snippet body()}
		<div class="tw:overflow-scroll">
			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						<th class="tw:w-[12rem]">Action</th>
						<th class="tw:w-[10rem]">Tipe</th>
						<th class="tw:w-[10rem]">Nama</th>
						<th class="tw:w-[10rem]">Kode</th>
						<th class="tw:w-[10rem]">Satuan Ukur</th>
						<th class="tw:w-[10rem]">Kuantitas</th>
						<th class="tw:w-[10rem]">Harga Satuan</th>
						<th class="tw:w-[10rem]">Total Harga</th>
						<th class="tw:w-[10rem]">Potongan Harga</th>
						<th class="tw:w-[10rem]">DPP</th>
						<th class="tw:w-[10rem]">DPP Nilai Lain</th>
						<th class="tw:w-[10rem]">Tarif PPN</th>
						<th class="tw:w-[10rem]">PPN</th>
						<th class="tw:w-[10rem]">Tarif PPnBM</th>
						<th class="tw:w-[10rem]">PPnBM</th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each values as value, i}
						{@const transaksiFields = updateFaktur.fields.transaksi[i]}
						{@const hargaTotal = value.kuantitas * value.hargaSatuan}
						{@const dpp = hargaTotal - value.hargaPotongan}
						{@const ppn = (value.dppNilaiLain > 0 ? value.dppNilaiLain : dpp) * (value.tarifPPN / 100)}
						{@const ppnbm = dpp * (value.tarifPPnBM / 100)}
						<tr>
							<td>
								<div class="tw:flex tw:flex-row tw:gap-2">
									<Button
										color="#FFD230"
										type="button"
										data-bs-toggle="modal"
										data-bs-target="#{idTarget}"
										onclick={() => requestEdit(i)}
									>
										<span>{canEdit ? 'Edit' : 'Lihat'}</span>
									</Button>
									{#if canEdit}
										<Button color="#FFD230" type="button" onclick={() => requestDelete(i)}>
											<span>Hapus</span>
										</Button>
									{/if}
								</div>
							</td>
							<td>{value.tipe ? 'Jasa' : 'Barang'}</td>
							<td>{value.nama}</td>
							<td>{value.kodeItem}</td>
							<td>{value.satuanUkur}</td>
							<td>{value.kuantitas}</td>
							<td>{value.hargaSatuan}</td>
							<td>{hargaTotal}</td>
							<td>{value.hargaPotongan}</td>
							<td>{dpp}</td>
							<td>{value.dppNilaiLain}</td>
							<td>{value.tarifPPN}</td>
							<td>{ppn}</td>
							<td>{value.tarifPPnBM}</td>
							<td>{ppnbm}</td>
						</tr>
						{#if canEdit}
							<tr class="tw:hidden" aria-hidden="true">
								<td colspan="15">
									<input name={transaksiFields.nama.as('text').name} value={value.nama} />
									<input name={transaksiFields.kodeItem.as('text').name} value={value.kodeItem} />
									<input name={transaksiFields.satuanUkur.as('text').name} value={value.satuanUkur} />
									<input
										name={transaksiFields.kuantitas.as('text').name}
										value={String(value.kuantitas)}
									/>
									<input
										name={transaksiFields.hargaSatuan.as('text').name}
										value={String(value.hargaSatuan)}
									/>
									<input
										name={transaksiFields.hargaPotongan.as('text').name}
										value={String(value.hargaPotongan)}
									/>
									<input
										name={transaksiFields.dppNilaiLain.as('text').name}
										value={String(value.dppNilaiLain)}
									/>
									<input name={transaksiFields.tarifPpn.as('text').name} value={String(value.tarifPPN)} />
									<input
										name={transaksiFields.tarifPpnBm.as('text').name}
										value={String(value.tarifPPnBM)}
									/>
								</td>
							</tr>
						{/if}
					{/each}
				{/snippet}
			</Table>
		</div>
	{/snippet}
</Card>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>
