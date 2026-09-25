<script lang="ts">
	import { ActionButton, DataTable, InstitutionalModal } from "$lib/re-ui-components";
	import { applyRupiahInput, formatRupiah } from '$lib/helpers/rupiahInput';

	const bulanNames = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];

	let {
		open = $bindable(false),
		data = $bindable() as {
			tkuId: string | number;
			nama: string;
			bulanan: Array<{
				bulan: number;
				jumlahPeredaranBruto: number;
			}>;
		},
		saveItem
	}: {
		open?: boolean;
		data: {
			tkuId: string | number;
			nama: string;
			bulanan: Array<{
				bulan: number;
				jumlahPeredaranBruto: number;
			}>;
		};
		saveItem: () => void;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal bind:open title={`Edit Peredaran Bruto - ${data.nama}`} size="wide" scrollable>
	<DataTable label={`Peredaran bruto bulanan ${data.nama}`} minWidth="520px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					<th scope="col">Bulan</th>
					<th scope="col">Peredaran Bruto (Rp)</th>
				</tr>
			</thead>
			<tbody>
				{#each data.bulanan as item (item.bulan)}
					<tr>
						<td>{bulanNames[item.bulan - 1]}</td>
						<td>
							<input
								type="text"
								inputmode="numeric"
								aria-label={`Peredaran bruto ${bulanNames[item.bulan - 1]}`}
								value={formatRupiah(item.jumlahPeredaranBruto)}
								oninput={(event) => (item.jumlahPeredaranBruto = applyRupiahInput(event))}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</DataTable>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

<style>
	input {
		width: 100%;
		padding: 7px 9px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		text-align: right;
		font: inherit;
		font-variant-numeric: tabular-nums;
	}
</style>
