<script lang="ts">
	type RequestRow = {
		number: string;
		type: string;
		taxpayer: string;
		submitted: string;
		updated: string;
		status: string;
		step: string;
	};

	let { variant = 'all' }: { variant?: 'all' | 'pending' } = $props();

	const requests: RequestRow[] = [
		{ number: 'REQ-DEMO-2026-001', type: 'Perubahan Data Wajib Pajak', taxpayer: 'PT Contoh Sentosa', submitted: '02/09/2026', updated: '04/09/2026', status: 'Dalam Penelitian', step: 'Verifikasi dokumen' },
		{ number: 'REQ-DEMO-2026-002', type: 'Permohonan Layanan Perpajakan', taxpayer: 'Usaha Demo Mandiri', submitted: '28/08/2026', updated: '03/09/2026', status: 'Menunggu Kelengkapan', step: 'Kelengkapan pemohon' },
		{ number: 'REQ-DEMO-2026-003', type: 'Pembaruan Kontak', taxpayer: 'PT Contoh Sentosa', submitted: '14/08/2026', updated: '16/08/2026', status: 'Selesai', step: 'Selesai' },
		{ number: 'REQ-DEMO-2026-004', type: 'Pencabutan Permohonan', taxpayer: 'Usaha Demo Mandiri', submitted: '08/08/2026', updated: '09/08/2026', status: 'Dibatalkan', step: 'Ditutup' }
	];

	let filtersVisible = $state(false);
	let historyVisible = $state(false);
	let query = $state('');
	let status = $state('');
	let submittedFrom = $state('');
	let pageSize = $state('10');

	const baseRows = $derived(variant === 'pending' ? requests.filter((item) => !['Selesai', 'Dibatalkan'].includes(item.status)) : requests);
	const rows = $derived(
		baseRows.filter((item) => {
			const search = query.trim().toLowerCase();
			return (!search || Object.values(item).some((value) => value.toLowerCase().includes(search))) && (!status || item.status === status);
		})
	);

	const title = $derived(variant === 'pending' ? 'Permohonan Tertunda' : 'Semua Permintaan');
	const description = $derived(variant === 'pending' ? 'Pantau permohonan yang masih memerlukan proses atau tindakan.' : 'Telusuri seluruh riwayat permintaan dan status penyelesaiannya.');

	function clearFilters() {
		query = '';
		status = '';
		submittedFrom = '';
	}
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><div><h1>{title}</h1><p>{description}</p></div><button class="primary" type="button">Buat Permintaan</button></header>
		<div class="card-body">
			<div class="toolbar">
				<button type="button">Muat Ulang</button>
				<button class:active={filtersVisible} type="button" onclick={() => (filtersVisible = !filtersVisible)}>Filter</button>
				<button type="button">Atur Kolom</button>
				<button type="button">Export</button>
				<button type="button" onclick={() => (historyVisible = !historyVisible)}>{historyVisible ? 'Tutup Riwayat' : 'Riwayat'}</button>
				{#if query || status || submittedFrom}<button type="button" onclick={clearFilters}>Hapus Filter</button>{/if}
			</div>

			{#if filtersVisible}
				<div class="filters">
					<label>Cari<input bind:value={query} placeholder="Nomor, jenis, atau wajib pajak" /></label>
					<label>Status<select bind:value={status}><option value="">Semua status</option><option>Dalam Penelitian</option><option>Menunggu Kelengkapan</option><option>Selesai</option><option>Dibatalkan</option></select></label>
					<label>Diajukan sejak<input type="date" bind:value={submittedFrom} /></label>
				</div>
			{/if}

			{#if historyVisible}<div class="history"><strong>Aktivitas terbaru</strong><span>Pembaruan status terakhir pada 04/09/2026 untuk data demonstrasi.</span></div>{/if}

			<div class="table-scroll">
				<table>
					<thead><tr><th>NOMOR PERMINTAAN</th><th>JENIS PERMINTAAN</th><th>WAJIB PAJAK</th><th>TANGGAL DIAJUKAN</th><th>PEMBARUAN TERAKHIR</th><th>STATUS</th><th>LANGKAH SAAT INI</th><th>AKSI</th></tr></thead>
					<tbody>
						{#each rows.slice(0, Number(pageSize)) as item}
							<tr><td>{item.number}</td><td>{item.type}</td><td>{item.taxpayer}</td><td>{item.submitted}</td><td>{item.updated}</td><td><span class="status">{item.status}</span></td><td>{item.step}</td><td><button class="row-action" type="button">Lihat</button></td></tr>
						{:else}<tr><td class="empty" colspan="8"><strong>{variant === 'pending' ? 'Tidak ada permohonan tertunda.' : 'Tidak ada permintaan yang ditemukan.'}</strong><span>{query || status || submittedFrom ? 'Coba ubah atau hapus kriteria filter.' : 'Permintaan yang dibuat akan tampil di tabel ini.'}</span></td></tr>{/each}
					</tbody>
				</table>
			</div>

			<footer class="pagination"><span>Menampilkan {rows.length ? `1–${Math.min(rows.length, Number(pageSize))} dari ${rows.length}` : '0–0 dari 0'}</span><div><button disabled type="button">Sebelumnya</button><button class="current" type="button">1</button><button disabled type="button">Berikutnya</button><select bind:value={pageSize} aria-label="Jumlah baris"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></div></footer>
		</div>
	</section>
</div>

<style>
	.page-shell { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); } .card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .65rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; } h1 { margin: 0; font-size: 1.5rem; font-weight: 400; } .card-header p { margin: .2rem 0 0; color: #4b5563; font-size: .88rem; }
	.card-body { min-height: 25rem; padding: .75rem; } button { min-height: 2.5rem; min-width: 5rem; padding: .45rem .7rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); } button:hover:not(:disabled) { filter: brightness(.95); } button.primary, button.active, button.current { background: var(--color-secondary); color: #fff; }
	.toolbar { min-height: 3.75rem; display: flex; justify-content: flex-end; align-items: center; gap: .6rem; flex-wrap: wrap; } .filters { display: grid; grid-template-columns: minmax(16rem, 2fr) minmax(12rem, 1fr) minmax(11rem, 1fr); gap: .75rem; padding: .75rem; border: 1px solid #b8b8b8; background: #e5e7eb; }
	label { display: flex; flex-direction: column; gap: .3rem; font-size: .82rem; font-weight: 700; } input, select { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .45rem .55rem; color: var(--color-text); }
	.history { display: flex; gap: 1rem; margin-top: .75rem; padding: .75rem; border-left: 3px solid #858585; background: #e5e7eb; } .history span { color: #4b5563; }
	.table-scroll { margin-top: .75rem; overflow-x: auto; } table { width: 100%; min-width: 98rem; border-collapse: collapse; table-layout: auto; } th, td { padding: .65rem .8rem; border-bottom: 1px solid #d1d5db; text-align: left; vertical-align: middle; } th { font-size: .78rem; white-space: nowrap; } td:nth-child(2), td:nth-child(7) { min-width: 16rem; } tbody tr:hover { background: rgb(255 255 255 / .5); }
	.status { display: inline-block; padding: .2rem .55rem; border: 1px solid #868686; border-radius: 1rem; background: #e5e7eb; font-size: .78rem; white-space: nowrap; } .row-action { min-height: 2rem; padding: .25rem .55rem; } .empty { height: 10rem; text-align: center; } .empty strong, .empty span { display: block; } .empty span { margin-top: .35rem; color: #6b7280; font-weight: 400; }
	.pagination { min-height: 4rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: #4b5563; font-size: .85rem; } .pagination div { display: flex; align-items: center; gap: .5rem; } .pagination select { width: 5rem; } .pagination button:disabled { opacity: .45; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .card-header { align-items: flex-start; flex-direction: column; } .toolbar { justify-content: flex-start; } .filters { grid-template-columns: 1fr; } .pagination { align-items: flex-start; flex-direction: column; padding-top: 1rem; } }
</style>
