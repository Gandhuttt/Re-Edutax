<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Button from '$lib/components/Button.svelte';
	import { computeLabaRugiRows, type LabaRugiAkunTemplate } from './labaRugiRollup';

	interface LabaRugiLeaf {
		id?: string;
		akunId: string;
		nilaiKomersial: number;
		nonObjekPajak: number;
		dikenakanPphFinal: number;
		penyesuaianFiskalPositif: number;
		penyesuaianFiskalNegatif: number;
		kodePenyesuaianFiskal: string[];
	}

	interface Props {
		sektorUsaha: string;
		templatesBySektor: Map<string, { lampiranKode: string | null; rows: LabaRugiAkunTemplate[] }>;
		labaRugi: LabaRugiLeaf[];
		readonly?: boolean;
		openModal: (row: unknown) => void;
	}

	let {
		sektorUsaha,
		templatesBySektor,
		labaRugi = $bindable(),
		readonly = false,
		openModal
	}: Props = $props();

	const rupiah = new Intl.NumberFormat('id-ID');

	const activeTemplate = $derived(templatesBySektor.get(sektorUsaha));
	const template = $derived(activeTemplate?.rows ?? []);
	const lampiranKode = $derived(activeTemplate?.lampiranKode ?? null);
	const computedRows = $derived(computeLabaRugiRows(template, labaRugi));
	const belumTersimpan = $derived(
		template.some((row) => row.rowType === 'data') &&
			!computedRows.some((row) => row.rowType === 'data' && row.id)
	);
	const formatNilai = (value: number) => (value === 0 ? '' : rupiah.format(value));
	const showFiskalSplit = (row: (typeof computedRows)[number]) => row.rowType !== 'sum' || row.kode === '4800';
	const formatCell = (row: (typeof computedRows)[number], value: number) =>
		row.kode === '4800' ? rupiah.format(value) : formatNilai(value);

	// Ensure every data row of the currently selected sektor's template has a
	// local labaRugi entry to edit, even before the SPT has been saved once
	// with that sektor (which is when these rows actually get persisted).
	$effect(() => {
		const existingAkunIds = new Set(labaRugi.map((row) => row.akunId));
		const missing = template.filter((row) => row.rowType === 'data' && !existingAkunIds.has(row.id));

		if (missing.length === 0) return;

		labaRugi.push(
			...missing.map((row) => ({
				akunId: row.id,
				nilaiKomersial: 0,
				nonObjekPajak: 0,
				dikenakanPphFinal: 0,
				penyesuaianFiskalPositif: 0,
				penyesuaianFiskalNegatif: 0,
				kodePenyesuaianFiskal: []
			}))
		);
	});
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-2">
	{#if lampiranKode}
		<span class="tw:text-sm tw:font-bold">Lampiran 1-{lampiranKode}</span>
		{#if belumTersimpan}
			<span class="tw:text-sm">Perubahan sektor usaha belum disimpan. Klik Simpan Konsep untuk menyimpan baris ini.</span>
		{/if}
	{:else}
		<span class="tw:text-sm">Belum ada transkrip untuk sektor usaha yang dipilih.</span>
	{/if}
	<div class="tw:overflow-scroll">
		<Table class="tw:w-full">
			{#snippet head()}
				<tr class="tw:hidden">
					<td><input type="text" /></td>
				</tr>
			{/snippet}
			{#snippet body()}
				<tr class="header tw:bg-[var(--color-primary)] tw:font-bold tw:text-center">
					<td class="tw:w-[6rem]"><span>TINDAKAN</span></td>
					<td class="tw:w-[6rem]"><span>KODE AKUN</span></td>
					<td class="tw:w-[16rem]"><span>NAMA AKUN</span></td>
					<td class="tw:w-[8rem]"><span>NILAI KOMERSIAL</span></td>
					<td class="tw:w-[8rem]"><span>TIDAK TERMASUK OBJEK PAJAK</span></td>
					<td class="tw:w-[8rem]"><span>DIKENAKAN PPh BERSIFAT FINAL</span></td>
					<td class="tw:w-[8rem]"><span>OBJEK PAJAK TIDAK FINAL</span></td>
					<td class="tw:w-[8rem]"><span>PENYESUAIAN FISKAL POSITIF</span></td>
					<td class="tw:w-[8rem]"><span>PENYESUAIAN FISKAL NEGATIF</span></td>
					<td class="tw:w-[8rem]"><span>KODE PENYESUAIAN FISKAL</span></td>
					<td class="tw:w-[8rem]"><span>NILAI FISKAL</span></td>
				</tr>
				{#each computedRows as row (row.nomorUrut)}
					{#if row.rowType === 'header'}
						<tr class="group-header">
							<td colspan="11">{row.namaAkun}</td>
						</tr>
					{:else}
						<tr class={row.rowType === 'sum' ? 'sum-row' : 'data-row'}>
							<td class="tw:text-center">
								{#if row.rowType === 'data'}
									<Button
										type="button"
										class="tw:min-w-15!"
										disabled={readonly}
										onclick={() => openModal(row)}
										data-bs-toggle="modal"
										data-bs-target="#modalL1"
									>
										Edit
									</Button>
								{/if}
							</td>
							<td>{row.kode}</td>
							<td>{row.namaAkun}</td>
							<td class="tw:text-end">{formatCell(row, row.nilaiKomersial)}</td>
							<td class="tw:text-end">{showFiskalSplit(row) ? formatCell(row, row.nonObjekPajak) : ''}</td>
							<td class="tw:text-end">{showFiskalSplit(row) ? formatCell(row, row.dikenakanPphFinal) : ''}</td>
							<td class="tw:text-end">{formatCell(row, row.objekPajakTidakFinal)}</td>
							<td class="tw:text-end">{showFiskalSplit(row) ? formatCell(row, row.penyesuaianFiskalPositif) : ''}</td>
							<td class="tw:text-end">{showFiskalSplit(row) ? formatCell(row, row.penyesuaianFiskalNegatif) : ''}</td>
							<td class="tw:text-center">{row.kodePenyesuaianFiskal.join(', ')}</td>
							<td class="tw:text-end">{formatCell(row, row.nilaiFiskal)}</td>
						</tr>
					{/if}
				{/each}
			{/snippet}
		</Table>
	</div>
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
