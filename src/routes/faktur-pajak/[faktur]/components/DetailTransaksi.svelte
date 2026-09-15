<script lang="ts">
	import { DataTableBody, DataTableViewport, TableActions } from '$lib/re-ui-components';
	import type { UpdateFakturFields } from '../updateFaktur.remote';

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
		hargaTotal: number;
		DPP: number;
		PPN: number;
		PPnBM: number;
	};

	let {
		requestDelete,
		requestEdit,
		values,
		canEdit,
		transactionFields
	}: {
		requestEdit: (index: number) => void;
		requestDelete: (index: number) => void;
		values: FakturTransaksi[];
		canEdit: boolean;
		transactionFields: UpdateFakturFields['transaksi'];
	} = $props();

	const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
</script>

<DataTableViewport
	label="Detail transaksi faktur"
	minWidth="1940px"
	framed={false}
	headerTone="navy"
	density="compact"
	stickyFirstColumn
>
	<table>
		<thead>
			<tr>
				<th style="width: 150px">Aksi</th>
				<th style="width: 90px">Tipe</th>
				<th style="width: 210px">Nama</th>
				<th style="width: 130px">Kode</th>
				<th style="width: 135px">Satuan ukur</th>
				<th class="right" style="width: 100px">Kuantitas</th>
				<th class="right" style="width: 135px">Harga satuan</th>
				<th class="right" style="width: 135px">Total harga</th>
				<th class="right" style="width: 135px">Potongan harga</th>
				<th class="right" style="width: 135px">DPP</th>
				<th class="right" style="width: 140px">DPP nilai lain</th>
				<th class="right" style="width: 100px">Tarif PPN</th>
				<th class="right" style="width: 130px">PPN</th>
				<th class="right" style="width: 110px">Tarif PPnBM</th>
				<th class="right" style="width: 130px">PPnBM</th>
			</tr>
		</thead>
		<DataTableBody
			items={values}
			getKey={(item) => item.id}
			emptyColspan={15}
			emptyText="Belum ada transaksi pada faktur ini."
		>
			{#snippet row(value, index)}
				{@const transaksiFields = transactionFields[index]}
				{@const hargaTotal = value.kuantitas * value.hargaSatuan}
				{@const dpp = hargaTotal - value.hargaPotongan}
				{@const ppn = ((value.dppNilaiLain > 0 ? value.dppNilaiLain : dpp) * value.tarifPPN) / 100}
				{@const ppnbm = (dpp * value.tarifPPnBM) / 100}
				<td class="action-cell">
					<TableActions
						visibleCount={4}
						actions={[
							{ label: canEdit ? 'Edit' : 'Lihat', onclick: () => requestEdit(index) },
							...(canEdit
								? [{ label: 'Hapus', danger: true, onclick: () => requestDelete(index) }]
								: [])
						]}
					/>
					{#if canEdit}
						<input type="hidden" name={transaksiFields.nama.as('text').name} value={value.nama} />
						<input type="hidden" name={transaksiFields.kodeItem.as('text').name} value={value.kodeItem} />
						<input type="hidden" name={transaksiFields.satuanUkur.as('text').name} value={value.satuanUkur} />
						<input type="hidden" name={transaksiFields.kuantitas.as('text').name} value={String(value.kuantitas)} />
						<input type="hidden" name={transaksiFields.hargaSatuan.as('text').name} value={String(value.hargaSatuan)} />
						<input type="hidden" name={transaksiFields.hargaPotongan.as('text').name} value={String(value.hargaPotongan)} />
						<input type="hidden" name={transaksiFields.dppNilaiLain.as('text').name} value={String(value.dppNilaiLain)} />
						<input type="hidden" name={transaksiFields.tarifPpn.as('text').name} value={String(value.tarifPPN)} />
						<input type="hidden" name={transaksiFields.tarifPpnBm.as('text').name} value={String(value.tarifPPnBM)} />
					{/if}
				</td>
				<td>{value.tipe ? 'Jasa' : 'Barang'}</td>
				<td><strong>{value.nama}</strong></td>
				<td><code>{value.kodeItem}</code></td>
				<td><code>{value.satuanUkur}</code></td>
				<td class="number">{number.format(value.kuantitas)}</td>
				<td class="number amount">{number.format(value.hargaSatuan)}</td>
				<td class="number amount">{number.format(hargaTotal)}</td>
				<td class="number">{number.format(value.hargaPotongan)}</td>
				<td class="number amount">{number.format(dpp)}</td>
				<td class="number">{number.format(value.dppNilaiLain)}</td>
				<td class="number">{number.format(value.tarifPPN)}%</td>
				<td class="number amount">{number.format(ppn)}</td>
				<td class="number">{number.format(value.tarifPPnBM)}%</td>
				<td class="number amount">{number.format(ppnbm)}</td>
			{/snippet}
		</DataTableBody>
	</table>
</DataTableViewport>
