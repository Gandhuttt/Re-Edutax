<script lang="ts">
	const columns = [
		{ key: 'number', label: 'Nomor Kasus', type: 'text' },
		{ key: 'npwp', label: 'NPWP Wajib Pajak Pusat', type: 'text' },
		{ key: 'name', label: 'Nama Wajib Pajak Pusat', type: 'text' },
		{ key: 'type', label: 'Jenis Kasus', type: 'text' },
		{ key: 'status', label: 'Status Kasus', type: 'select', options: ['Dalam Proses', 'Selesai', 'Dibatalkan'] },
		{ key: 'created', label: 'Dibuat', type: 'date' },
		{ key: 'createdBy', label: 'Dibuat Oleh Pengguna', type: 'text' },
		{ key: 'finished', label: 'Selesai', type: 'select', options: ['Ya', 'Tidak'] },
		{ key: 'workflow', label: 'Langkah Alur Kerja', type: 'text' },
		{ key: 'dueDate', label: 'Tanggal Jatuh Tempo Tertinggi', type: 'date' },
		{ key: 'endDate', label: 'Tanggal Akhir', type: 'date' },
		{ key: 'region', label: 'Kantor Wilayah', type: 'select', options: [] },
		{ key: 'office', label: 'Kantor Pelayanan Pajak', type: 'select', options: [] }
	] as const;

	let filtersVisible = $state(true);
	let filters = $state<Record<string, string>>({});

	function clearFilters() {
		filters = {};
	}
</script>

<svelte:head><title>Kasus Saya</title></svelte:head>

<div class="case-page">
	<section class="card">
		<header class="card-header"><h1>Kasus Saya</h1></header>
		<div class="card-body">
			<div class="toolbar">
				<button type="button">Muat Ulang</button>
				<button class:active={filtersVisible} type="button" onclick={() => (filtersVisible = !filtersVisible)}>Filter</button>
				<button type="button">Atur Kolom</button>
				<button type="button">Export</button>
				<button type="button" onclick={clearFilters}>Hapus Filter</button>
			</div>

			<div class="table-scroll">
				<table>
					<thead>
						<tr>{#each columns as column}<th>{column.label}</th>{/each}</tr>
						{#if filtersVisible}
							<tr class="filter-row">
								{#each columns as column}
									<th>
										{#if column.type === 'select'}
											<select bind:value={filters[column.key]} aria-label="Filter {column.label}">
												<option value="">Pilih {column.label}</option>
												{#each column.options as option}<option value={option}>{option}</option>{/each}
											</select>
										{:else}
											<input type={column.type} bind:value={filters[column.key]} aria-label="Filter {column.label}" />
										{/if}
									</th>
								{/each}
							</tr>
						{/if}
					</thead>
					<tbody><tr><td class="empty" colspan={columns.length}>Tidak ada data yang ditemukan.</td></tr></tbody>
				</table>
			</div>

			<footer class="pagination">
				<button type="button" disabled>Sebelumnya</button>
				<button type="button" disabled>Berikutnya</button>
				<select disabled aria-label="Jumlah baris per halaman"><option>10</option></select>
			</footer>
		</div>
	</section>
</div>

<style>
	.case-page { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { height: 2.5rem; display: flex; align-items: center; margin: 0; font-size: 1.5rem; font-weight: 400; }
	.card-body { min-height: 25rem; padding: .75rem; }
	.toolbar { min-height: 4rem; display: flex; align-items: center; justify-content: flex-end; gap: .75rem; flex-wrap: wrap; }
	button { min-width: 5rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:hover:not(:disabled) { filter: brightness(.95); }
	button.active { background: var(--color-secondary); color: #fff; }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; min-width: 155rem; border-collapse: collapse; table-layout: fixed; }
	th, td { padding: .5rem 1rem; text-align: left; vertical-align: top; }
	th { width: 12rem; }
	th:nth-child(3), th:nth-child(4), th:nth-child(9) { width: 18rem; }
	th:nth-child(10), th:nth-child(12), th:nth-child(13) { width: 16rem; }
	.filter-row th { padding-top: 0; }
	input, select { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .4rem .5rem; font-weight: 400; }
	.empty { height: 10rem; text-align: center; vertical-align: middle; }
	.pagination { min-height: 4rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }
	.pagination button { background: transparent; }
	.pagination select { width: 6rem; }
	@media (max-width: 720px) { .case-page { padding: 2rem; } .toolbar { justify-content: flex-start; } }
</style>
