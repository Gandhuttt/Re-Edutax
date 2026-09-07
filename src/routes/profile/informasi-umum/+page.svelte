<script lang="ts">
	let activeTab = $state<'Umum' | 'Penanda Wajib Pajak'>('Umum');
	let filterOpen = $state(false);
	let view = $state<'Tabel' | 'Kartu'>('Tabel');

	const generalFields = [
		['Nama Wajib Pajak', 'PT Contoh Nusantara'],
		['NIK/NPWP', '00.000.000.0-000.000'],
		['Jenis Wajib Pajak', 'Badan'],
		['Bentuk Badan Hukum', 'Perseroan Terbatas'],
		['Status NPWP', 'Aktif'],
		['Tanggal Terdaftar', '15 Januari 2020'],
		['Kegiatan Utama', 'Jasa konsultasi manajemen'],
		['Status Pengusaha Kena Pajak', 'Non-PKP'],
		['Kantor Pelayanan Pajak', 'KPP Pratama Contoh'],
		['Seksi Pengawasan', 'Seksi Pengawasan I'],
		['Bahasa Komunikasi', 'Bahasa Indonesia'],
		['Tanggal Pembaruan Terakhir', '20 Agustus 2026']
	];

	const markers = [
		['Status Wajib Pajak', 'Aktif', '15 Januari 2020', '-'],
		['Wajib Pajak Badan', 'Ya', '15 Januari 2020', '-']
	];
</script>

<svelte:head><title>Informasi Umum Wajib Pajak</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Informasi Umum Wajib Pajak</h1><button class="primary" type="button">Edit</button></header>
		<div class="card-body">
			<nav class="tabs" aria-label="Informasi wajib pajak">
				{#each ['Umum', 'Penanda Wajib Pajak'] as tab}
					<button class:active={activeTab === tab} type="button" onclick={() => (activeTab = tab as typeof activeTab)}>{tab}</button>
				{/each}
			</nav>

			<div class="toolbar" aria-label="Peralatan tampilan">
				<button type="button">Muat ulang</button><button class:active={view === 'Tabel'} type="button" onclick={() => (view = 'Tabel')}>Tabel</button>
				<button class:active={view === 'Kartu'} type="button" onclick={() => (view = 'Kartu')}>Kartu</button>
				<button class:active={filterOpen} type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
				<button type="button">Atur Kolom</button><button type="button">Export</button><button type="button">Detail lengkap</button>
			</div>

			{#if activeTab === 'Umum'}
				<div class="field-grid">
					{#each generalFields as field}
						<div class="field"><span>{field[0]}</span><strong>{field[1]}</strong></div>
					{/each}
				</div>
			{:else}
				{#if filterOpen}<div class="filter"><label for="marker-search">Cari penanda</label><input id="marker-search" placeholder="Masukkan kata kunci" /></div>{/if}
				{#if view === 'Kartu'}
					<div class="marker-cards">{#each markers as row}<article><strong>{row[0]}</strong><span>Nilai: {row[1]}</span><span>Mulai: {row[2]}</span><span>Berakhir: {row[3]}</span></article>{/each}</div>
				{:else}
					<div class="table-scroll"><table><thead><tr><th>Penanda</th><th>Nilai</th><th>Tanggal Mulai</th><th>Tanggal Berakhir</th></tr></thead><tbody>{#each markers as row}<tr>{#each row as value}<td>{value}</td>{/each}</tr>{/each}</tbody></table></div>
				{/if}
			{/if}
		</div>
	</section>
</div>

<style>
	.page-shell { width: 100%; padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { margin: 0; font-size: 1.5rem; font-weight: 400; }
	.card-body { padding: .75rem; }
	button { min-height: 2.35rem; padding: .45rem .75rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); cursor: pointer; }
	button.active, button.primary { background: var(--color-secondary); color: #fff; }
	.tabs { display: flex; gap: .25rem; overflow-x: auto; border-bottom: 1px solid #a9a9a9; }
	.tabs button { flex: 0 0 auto; border-radius: 0; border-bottom: 3px solid transparent; background: transparent; }
	.tabs button.active { border-bottom-color: var(--color-secondary); color: var(--color-text); background: #d1d5db; }
	.toolbar { min-height: 3.75rem; display: flex; justify-content: flex-end; align-items: center; gap: .5rem; flex-wrap: wrap; }
	.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #c5c5c5; border-left: 1px solid #c5c5c5; }
	.field { min-width: 0; display: grid; grid-template-columns: minmax(10rem, 42%) 1fr; border-right: 1px solid #c5c5c5; border-bottom: 1px solid #c5c5c5; }
	.field span, .field strong { padding: .65rem .75rem; overflow-wrap: anywhere; }
	.field span { background: #e5e7eb; font-weight: 700; }
	.field strong { font-weight: 400; background: #f9fafb; }
	.filter { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; }
	.filter label { font-weight: 700; }
	.filter input { width: min(100%, 28rem); height: 2.35rem; padding: .5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; min-width: 42rem; border-collapse: collapse; }
	th, td { padding: .6rem .75rem; border-bottom: 1px solid #c5c5c5; text-align: left; white-space: nowrap; }
	th { background: #e5e7eb; font-size: .8rem; text-transform: uppercase; }
	.marker-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: .75rem; }
	.marker-cards article { display: flex; flex-direction: column; gap: .4rem; padding: .75rem; border: 1px solid #a9a9a9; background: #f9fafb; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .card-header { align-items: flex-start; } .toolbar { justify-content: flex-start; } .field-grid { grid-template-columns: 1fr; } .field { grid-template-columns: 1fr; } .filter { align-items: flex-start; flex-direction: column; } }
</style>
