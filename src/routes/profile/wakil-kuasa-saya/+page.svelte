<script lang="ts">
	type Representative = {
		id: number;
		npwp: string;
		name: string;
		role: string;
		startDate: string;
		endDate: string;
		status: string;
	};

	const representatives: Representative[] = [
		{ id: 1, npwp: '00.000.000.0-000.001', name: 'Pengguna Demo A', role: 'Wakil Wajib Pajak', startDate: '01/01/2026', endDate: '-', status: 'Aktif' },
		{ id: 2, npwp: '00.000.000.0-000.002', name: 'Pengguna Demo B', role: 'Kuasa Wajib Pajak', startDate: '15/03/2026', endDate: '15/03/2027', status: 'Aktif' }
	];

	let filterOpen = $state(false);
	let query = $state('');
	let status = $state('');
	let showHistory = $state(false);

	const rows = $derived(
		representatives.filter((item) => {
			const search = query.trim().toLowerCase();
			return (!search || `${item.npwp} ${item.name} ${item.role}`.toLowerCase().includes(search)) && (!status || item.status === status);
		})
	);

	function clearFilters() {
		query = '';
		status = '';
	}
</script>

<svelte:head><title>Wakil/Kuasa Saya</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header">
			<div><h1>Wakil/Kuasa Saya</h1><p>Kelola pihak yang diberi kewenangan untuk mewakili akun ini.</p></div>
			<button class="primary" type="button">Tambah Wakil/Kuasa</button>
		</header>
		<div class="card-body">
			<div class="summary"><strong>{representatives.filter((item) => item.status === 'Aktif').length}</strong><span>Wakil/kuasa aktif</span></div>
			<div class="toolbar">
				<button type="button">Muat Ulang</button>
				<button class:active={filterOpen} type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
				<button type="button">Atur Kolom</button>
				<button type="button">Export</button>
				<button type="button" onclick={() => (showHistory = !showHistory)}>{showHistory ? 'Tutup Riwayat' : 'Riwayat'}</button>
			</div>
			{#if filterOpen}
				<div class="filters">
					<label>Cari<input bind:value={query} placeholder="NPWP, nama, atau peran" /></label>
					<label>Status<select bind:value={status}><option value="">Semua status</option><option>Aktif</option><option>Berakhir</option></select></label>
					<button type="button" onclick={clearFilters}>Hapus Filter</button>
				</div>
			{/if}
			{#if showHistory}<div class="history"><strong>Riwayat perubahan</strong><span>Belum ada perubahan kewenangan yang tercatat pada sesi demo ini.</span></div>{/if}
			<div class="table-scroll">
				<table>
					<thead><tr><th>NPWP/NIK</th><th>NAMA WAKIL/KUASA</th><th>JENIS PERAN</th><th>TANGGAL MULAI</th><th>TANGGAL BERAKHIR</th><th>STATUS</th><th>AKSI</th></tr></thead>
					<tbody>
						{#each rows as item}
							<tr><td>{item.npwp}</td><td>{item.name}</td><td>{item.role}</td><td>{item.startDate}</td><td>{item.endDate}</td><td><span class="status">{item.status}</span></td><td><button class="row-action" type="button">Lihat</button></td></tr>
						{:else}<tr><td class="empty" colspan="7"><strong>Tidak ada wakil/kuasa yang ditemukan.</strong><span>Ubah kriteria filter atau tambahkan wakil/kuasa baru.</span></td></tr>{/each}
					</tbody>
				</table>
			</div>
			<footer class="pagination"><span>Menampilkan {rows.length ? `1–${rows.length} dari ${rows.length}` : '0–0 dari 0'}</span><div><button disabled type="button">Sebelumnya</button><button class="current" type="button">1</button><button disabled type="button">Berikutnya</button><select aria-label="Jumlah baris"><option>10</option><option>25</option></select></div></footer>
		</div>
	</section>
</div>

<style>
	.page-shell { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .65rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { margin: 0; font-size: 1.5rem; font-weight: 400; } .card-header p { margin: .2rem 0 0; color: #4b5563; font-size: .88rem; }
	.card-body { min-height: 25rem; padding: .75rem; } button { min-height: 2.5rem; min-width: 5rem; padding: .45rem .7rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:hover:not(:disabled) { filter: brightness(.95); } button.primary, button.active, button.current { background: var(--color-secondary); color: #fff; }
	.summary { width: 13rem; display: flex; flex-direction: column; gap: .15rem; padding: .75rem; border: 1px solid #b8b8b8; background: #e5e7eb; } .summary strong { font-size: 1.3rem; font-weight: 500; } .summary span { color: #4b5563; font-size: .82rem; }
	.toolbar { min-height: 3.75rem; display: flex; justify-content: flex-end; align-items: center; gap: .6rem; flex-wrap: wrap; }
	.filters { display: grid; grid-template-columns: minmax(15rem, 2fr) minmax(11rem, 1fr) auto; align-items: end; gap: .75rem; padding: .75rem; border: 1px solid #b8b8b8; background: #e5e7eb; }
	label { display: flex; flex-direction: column; gap: .3rem; font-size: .82rem; font-weight: 700; } input, select { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .45rem .55rem; color: var(--color-text); }
	.history { display: flex; gap: 1rem; margin-top: .75rem; padding: .75rem; border-left: 3px solid #858585; background: #e5e7eb; } .history span { color: #4b5563; }
	.table-scroll { margin-top: .75rem; overflow-x: auto; } table { width: 100%; min-width: 72rem; border-collapse: collapse; } th, td { padding: .65rem .8rem; border-bottom: 1px solid #d1d5db; text-align: left; vertical-align: middle; } th { font-size: .78rem; white-space: nowrap; } tbody tr:hover { background: rgb(255 255 255 / .5); }
	.status { display: inline-block; padding: .2rem .55rem; border: 1px solid #868686; border-radius: 1rem; background: #e5e7eb; font-size: .78rem; } .row-action { min-height: 2rem; padding: .25rem .55rem; }
	.empty { height: 9rem; text-align: center; } .empty strong, .empty span { display: block; } .empty span { margin-top: .35rem; color: #6b7280; font-weight: 400; }
	.pagination { min-height: 4rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: #4b5563; font-size: .85rem; } .pagination div { display: flex; align-items: center; gap: .5rem; } .pagination select { width: 5rem; } .pagination button:disabled { opacity: .45; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .card-header { align-items: flex-start; flex-direction: column; } .toolbar { justify-content: flex-start; } .filters { grid-template-columns: 1fr; } .pagination { align-items: flex-start; flex-direction: column; padding-top: 1rem; } }
</style>
