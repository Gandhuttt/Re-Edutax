<script lang="ts">
	import {
		applyFakturPaymentAdjustment,
		computeFakturAmounts
	} from '$lib/helpers/fakturAmounts';
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
		transactionFields,
		uangMuka,
		pelunasan,
		nilaiUangMuka
	}: {
		requestEdit: (index: number) => void;
		requestDelete: (index: number) => void;
		values: FakturTransaksi[];
		canEdit: boolean;
		transactionFields: UpdateFakturFields['transaksi'];
		uangMuka: boolean;
		pelunasan: boolean;
		nilaiUangMuka: number;
	} = $props();

	const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
	const amounts = $derived(
		computeFakturAmounts(
			values.map((item) => ({
				kuantitas: item.kuantitas,
				hargaSatuan: item.hargaSatuan,
				hargaPotongan: item.hargaPotongan,
				dppNilaiLain: item.dppNilaiLain,
				tarifPpn: item.tarifPPN,
				tarifPpnBm: item.tarifPPnBM
			})),
			{ uangMuka, pelunasan, nilaiUangMuka }
		)
	);
	const advanceAmounts = $derived(
		applyFakturPaymentAdjustment(amounts.gross, {
			uangMuka: true,
			nilaiUangMuka
		})
	);
	const advanceBalance = $derived({
		dpp: Math.max(0, amounts.gross.dpp - advanceAmounts.dpp),
		dppNilaiLain: Math.max(0, amounts.gross.dppNilaiLain - advanceAmounts.dppNilaiLain),
		ppn: Math.max(0, amounts.gross.ppn - advanceAmounts.ppn),
		ppnbm: Math.max(0, amounts.gross.ppnbm - advanceAmounts.ppnbm)
	});
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
		<tfoot>
			<tr class="summary-row">
				<th colspan="9" scope="row">Jumlah</th>
				<td class="number amount">{number.format(amounts.gross.dpp)}</td>
				<td class="number">{number.format(amounts.gross.dppNilaiLain)}</td>
				<td></td>
				<td class="number amount">{number.format(amounts.gross.ppn)}</td>
				<td></td>
				<td class="number amount">{number.format(amounts.gross.ppnbm)}</td>
			</tr>
			{#if uangMuka || pelunasan}
				<tr class="payment-row">
					<th colspan="9" scope="row">Uang Muka</th>
					<td class="number amount">{number.format(advanceAmounts.dpp)}</td>
					<td class="number">{number.format(advanceAmounts.dppNilaiLain)}</td>
					<td></td>
					<td class="number amount">{number.format(advanceAmounts.ppn)}</td>
					<td></td>
					<td class="number amount">{number.format(advanceAmounts.ppnbm)}</td>
				</tr>
				<tr class="payment-row">
					<th colspan="9" scope="row">DPP</th>
					<td class="number amount">{number.format(amounts.taxable.dpp)}</td>
					<td class="number">{number.format(amounts.taxable.dppNilaiLain)}</td>
					<td></td>
					<td class="number amount">{number.format(amounts.taxable.ppn)}</td>
					<td></td>
					<td class="number amount">{number.format(amounts.taxable.ppnbm)}</td>
				</tr>
				<tr class="payment-row">
					<th colspan="9" scope="row">Saldo Uang Muka</th>
					<td class="number amount">{number.format(pelunasan ? 0 : advanceBalance.dpp)}</td>
					<td class="number">{number.format(pelunasan ? 0 : advanceBalance.dppNilaiLain)}</td>
					<td></td>
					<td class="number amount">{number.format(pelunasan ? 0 : advanceBalance.ppn)}</td>
					<td></td>
					<td class="number amount">{number.format(pelunasan ? 0 : advanceBalance.ppnbm)}</td>
				</tr>
			{/if}
		</tfoot>
	</table>
</DataTableViewport>

<style>
	tfoot th,
	tfoot td {
		padding: 9px 11px;
		border-top: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}

	tfoot th {
		text-align: right;
		color: var(--ui-navy);
		font-size: 11px;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.summary-row th,
	.summary-row td {
		border-top-color: var(--ui-line-strong);
		font-weight: 800;
	}

	.payment-row th,
	.payment-row td {
		background: #f8f6ee;
	}

</style>
