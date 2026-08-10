<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import { applyRupiahInput } from '$lib/helpers/rupiahInput';
	import { computeNeracaRows, type NeracaAkunTemplate, type NeracaComputedRow } from './neracaRollup';

	interface NeracaLeaf {
		id?: string;
		akunId: string;
		nilai: number;
	}

	interface Props {
		sektorUsaha: string;
		neracaTemplatesBySektor: Map<string, { rows: NeracaAkunTemplate[] }>;
		neraca: NeracaLeaf[];
		readonly?: boolean;
	}

	let { sektorUsaha, neracaTemplatesBySektor, neraca = $bindable(), readonly = false }: Props = $props();

	const rupiah = new Intl.NumberFormat('id-ID');

	const activeNeracaTemplate = $derived(neracaTemplatesBySektor.get(sektorUsaha));
	const neracaTemplate = $derived(activeNeracaTemplate?.rows ?? []);
	const computedNeracaRows = $derived(computeNeracaRows(neracaTemplate, neraca));
	const asetRows = $derived(computedNeracaRows.filter((row) => row.section === 'aset'));
	const liabilitasEkuitasRows = $derived(computedNeracaRows.filter((row) => row.section === 'liabilitas_ekuitas'));
	const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));

	// Ensure every data row of the currently selected sektor's neraca template has a
	// local neraca entry to edit, even before the SPT has been saved once with that
	// sektor (which is when these rows actually get persisted).
	$effect(() => {
		const existingAkunIds = new Set(neraca.map((row) => row.akunId));
		const missing = neracaTemplate.filter((row) => row.rowType === 'data' && !existingAkunIds.has(row.id));

		if (missing.length === 0) return;

		neraca.push(...missing.map((row) => ({ akunId: row.id, nilai: 0 })));
	});

	function formatRupiahInput(value: number | undefined): string {
		return value ? value.toLocaleString('id-ID') : '';
	}

	function handleNeracaInput(e: Event, akunId: string): void {
		const num = applyRupiahInput(e);

		const index = neraca.findIndex((item) => item.akunId === akunId);
		if (index !== -1) neraca[index] = { ...neraca[index], nilai: num };
	}
</script>

{#snippet neracaTable(rows: NeracaComputedRow[])}
	<div class="tw:overflow-scroll">
		<Table class="tw:w-full">
			{#snippet head()}
				<tr class="tw:hidden">
					<td><input type="text" /></td>
				</tr>
			{/snippet}
			{#snippet body()}
				<tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
					<td class="tw:w-[6rem]"><span>KODE AKUN</span></td>
					<td class="tw:w-[20rem]"><span>NAMA AKUN</span></td>
					<td class="tw:w-[10rem]"><span>NILAI</span></td>
				</tr>
				{#each rows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header">
							<td colspan="3">{row.namaAkun}</td>
						</tr>
					{:else}
						<tr class={row.rowType === 'sum' ? 'sum-row' : 'data-row'}>
							<td>{row.kode}</td>
							<td>{row.namaAkun}</td>
							<td class="tw:text-end">
								{#if row.rowType === 'data'}
									<input
										type="text"
										inputmode="numeric"
										class="tw:w-full tw:text-end"
										value={formatRupiahInput(row.nilai)}
										disabled={readonly}
										oninput={(e) => handleNeracaInput(e, row.akunId ?? '')}
									/>
								{:else}
									<input
										type="text"
										class="tw:w-full tw:text-end"
										value={formatNilai(row.nilai)}
										readonly
										disabled
									/>
								{/if}
							</td>
						</tr>
					{/if}
				{/each}
			{/snippet}
		</Table>
	</div>
{/snippet}

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-4">
	{#if neracaTemplate.length === 0}
		<span class="tw:text-sm">Belum ada transkrip neraca untuk sektor usaha yang dipilih.</span>
	{:else}
		<div class="tw:flex tw:flex-row tw:gap-4 tw:items-start">
			<div class="tw:flex tw:flex-col tw:gap-2 tw:basis-1/2 tw:min-w-0">
				<span class="tw:text-sm tw:font-bold">ASET</span>
				{@render neracaTable(asetRows)}
			</div>
			<div class="tw:flex tw:flex-col tw:gap-2 tw:basis-1/2 tw:min-w-0">
				<span class="tw:text-sm tw:font-bold">LIABILITAS DAN EKUITAS</span>
				{@render neracaTable(liabilitasEkuitasRows)}
			</div>
		</div>
	{/if}
</div>

<style>
	.group-header td {
		font-weight: bold;
		background-color: #f3f3f3;
	}

	.sum-row {
		font-weight: bold;
	}

	.data-row:nth-child(even) {
		background-color: #f9f6ee;
	}

	.header td {
		border: 1px solid white;
	}

	td {
		padding: 0.5rem 0.75rem;
		word-wrap: break-word;
		font-size: 0.8rem;
	}
</style>
