<script lang="ts">
	import { DataTable, FormSection } from "$lib/re-ui-components";
	import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
	import type { L13BBRow } from "./types";

	let {
		data = $bindable(),
		readonly = false,
	}: {
		data: L13BBRow[];
		readonly?: boolean;
	} = $props();

	const rupiah = new Intl.NumberFormat("id-ID");
	let total = $derived(data.reduce((sum, row) => sum + Number(row.nilai || 0), 0));
</script>

<FormSection title="Rekapitulasi biaya kegiatan" padded>
	<DataTable
		label="Rekapitulasi biaya kegiatan praktik kerja, pemagangan, dan pembelajaran"
		minWidth="760px"
		headerTone="navy"
		density="compact"
	>
		<table>
			<thead>
				<tr>
					<th scope="col">No.</th>
					<th scope="col">Deskripsi</th>
					<th scope="col" class="right">Jumlah biaya</th>
				</tr>
			</thead>
			<tbody>
				{#each data as kegiatan, index (kegiatan.kode)}
					<tr>
						<td class="center">{index + 1}</td>
						<td>{kegiatan.nama}</td>
						<td>
							<input
								class="amount-input"
								type="text"
								inputmode="numeric"
								aria-label={`Jumlah biaya ${kegiatan.nama}`}
								value={formatRupiah(kegiatan.nilai)}
								disabled={readonly}
								oninput={(event) => (kegiatan.nilai = applyRupiahInput(event))}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan="2">Total biaya terkait kegiatan praktik kerja, pemagangan, dan/atau pembelajaran dalam rangka pembinaan dan pengembangan sumber daya manusia berbasis kompetensi tertentu</th>
					<td class="right amount">{rupiah.format(total)}</td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</FormSection>

<style>
	.center {
		text-align: center;
	}
	.right,
	.amount-input {
		text-align: right;
	}
	.amount-input {
		width: 100%;
		height: 36px;
		padding: 0 10px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
	}
	.amount-input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.amount-input:disabled {
		background: #e9e7df;
		color: #666b70;
	}
</style>
