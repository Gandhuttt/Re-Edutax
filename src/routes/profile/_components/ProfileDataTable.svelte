<script lang="ts">
	type DataSet = { label?: string; columns: string[]; rows: string[][] };
	type Props = {
		title: string;
		data?: DataSet;
		tabs?: DataSet[];
		history?: DataSet;
	};

	let { title, data, tabs = [], history }: Props = $props();
	let activeTab = $state('');
	let view = $state<'Tabel' | 'Kartu'>('Tabel');
	let filterOpen = $state(false);
	let query = $state('');
	let pageSize = $state('10');
	let page = $state(1);

	const selectedTab = $derived(activeTab || tabs[0]?.label || '');
	const current = $derived(tabs.find((tab) => tab.label === selectedTab) ?? data ?? { columns: [], rows: [] });
	const filteredRows = $derived(
		current.rows.filter((row) => row.some((value) => value.toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id'))))
	);
	const pageCount = $derived(Math.max(1, Math.ceil(filteredRows.length / Number(pageSize))));
	const visibleRows = $derived(filteredRows.slice((page - 1) * Number(pageSize), page * Number(pageSize)));

	function resetPage() {
		page = 1;
	}

	function exportRows() {
		const csv = [current.columns, ...filteredRows]
			.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
			.join('\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = `${title.toLocaleLowerCase('id').replaceAll(/[^a-z0-9]+/g, '-')}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>{title}</h1></header>
		<div class="card-body">
			{#if tabs.length}
				<nav class="tabs" aria-label={title}>
					{#each tabs as tab}
						<button class:active={selectedTab === tab.label} type="button" onclick={() => { activeTab = tab.label ?? ''; query = ''; resetPage(); }}>{tab.label}</button>
					{/each}
				</nav>
			{/if}

			<div class="toolbar" aria-label="Peralatan tabel">
				<button class:active={view === 'Tabel'} type="button" onclick={() => (view = 'Tabel')}>Tabel</button>
				<button class:active={view === 'Kartu'} type="button" onclick={() => (view = 'Kartu')}>Kartu</button>
				<button class:active={filterOpen} type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
				<button type="button">Atur Kolom</button>
				<button type="button" onclick={exportRows}>Export</button>
			</div>

			{#if filterOpen}
				<div class="filter-row">
					<label for="profile-table-filter">Cari data</label>
					<input id="profile-table-filter" bind:value={query} oninput={resetPage} placeholder="Masukkan kata kunci" />
				</div>
			{/if}

			{#if view === 'Kartu'}
				<div class="card-grid">
					{#each visibleRows as row}
						<article>{#each current.columns as column, index}<div><span>{column}</span><strong>{row[index] ?? '-'}</strong></div>{/each}</article>
					{:else}
						<p class="empty-card">Tidak ada data.</p>
					{/each}
				</div>
			{:else}
				<div class="table-scroll">
					<table>
						<thead><tr>{#each current.columns as column}<th>{column}</th>{/each}</tr></thead>
						<tbody>
							{#each visibleRows as row}<tr>{#each current.columns as _, index}<td>{row[index] ?? '-'}</td>{/each}</tr>
							{:else}<tr><td class="empty" colspan={current.columns.length || 1}>Tidak ada data.</td></tr>{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<footer class="pagination">
				<span>Menampilkan {filteredRows.length ? `${(page - 1) * Number(pageSize) + 1}–${Math.min(page * Number(pageSize), filteredRows.length)} dari ${filteredRows.length}` : '0–0 dari 0'}</span>
				<div>
					<button type="button" disabled={page === 1} onclick={() => (page -= 1)}>Sebelumnya</button>
					<span class="current-page">{page}</span>
					<button type="button" disabled={page === pageCount} onclick={() => (page += 1)}>Berikutnya</button>
					<select bind:value={pageSize} onchange={resetPage} aria-label="Jumlah baris per halaman"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
				</div>
			</footer>

			{#if history}
				<section class="history">
					<h2>{history.label ?? 'Riwayat'}</h2>
					<div class="table-scroll"><table><thead><tr>{#each history.columns as column}<th>{column}</th>{/each}</tr></thead><tbody>{#each history.rows as row}<tr>{#each history.columns as _, index}<td>{row[index] ?? '-'}</td>{/each}</tr>{:else}<tr><td class="empty" colspan={history.columns.length}>Tidak ada riwayat.</td></tr>{/each}</tbody></table></div>
				</section>
			{/if}
		</div>
	</section>
</div>

<style>
	.page-shell { width: 100%; min-width: 0; padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1, h2 { margin: 0; font-weight: 400; } h1 { font-size: 1.5rem; } h2 { margin-bottom: .75rem; font-size: 1.2rem; }
	.card-body { min-width: 0; padding: .75rem; }
	.tabs { display: flex; gap: .25rem; overflow-x: auto; border-bottom: 1px solid #a9a9a9; }
	.tabs button { flex: 0 0 auto; border-radius: 0; border-bottom: 3px solid transparent; background: transparent; }
	.tabs button.active { border-bottom-color: var(--color-secondary); background: #d1d5db; color: var(--color-text); }
	.toolbar { min-height: 3.75rem; display: flex; align-items: center; justify-content: flex-end; gap: .5rem; flex-wrap: wrap; }
	button { min-height: 2.35rem; padding: .45rem .75rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); cursor: pointer; }
	button.active, .current-page { background: var(--color-secondary); color: #fff; } button:disabled { cursor: default; opacity: .5; }
	.filter-row { display: flex; align-items: center; gap: .75rem; padding: 0 0 .75rem; }
	.filter-row label { font-weight: 700; }
	.filter-row input { width: min(100%, 30rem); height: 2.35rem; padding: .5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); }
	.table-scroll { width: 100%; overflow-x: auto; border: 1px solid #c5c5c5; }
	table { width: max-content; min-width: 100%; border-collapse: collapse; }
	th, td { min-width: 10rem; padding: .6rem .75rem; border-right: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; text-align: left; vertical-align: top; white-space: nowrap; }
	th { background: #e5e7eb; font-size: .78rem; text-transform: uppercase; }
	.empty { padding: 2.5rem; text-align: center; }
	.card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: .75rem; }
	.card-grid article { border: 1px solid #a9a9a9; background: #f9fafb; }
	.card-grid article div { display: grid; grid-template-columns: minmax(9rem, 42%) 1fr; border-bottom: 1px solid #d1d5db; }
	.card-grid span, .card-grid strong { min-width: 0; padding: .55rem .65rem; overflow-wrap: anywhere; }
	.card-grid span { background: #e5e7eb; font-weight: 700; } .card-grid strong { font-weight: 400; }
	.empty-card { padding: 2rem; text-align: center; }
	.pagination { min-height: 4rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: #52525b; font-size: .88rem; }
	.pagination div { display: flex; align-items: center; gap: .5rem; }
	.current-page { min-width: 2.35rem; min-height: 2.35rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 5px; }
	.pagination select { width: 5rem; height: 2.35rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); color: var(--color-text); }
	.history { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #a9a9a9; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .toolbar { justify-content: flex-start; } .filter-row, .pagination { align-items: flex-start; flex-direction: column; } .card-grid article div { grid-template-columns: 1fr; } }
</style>
