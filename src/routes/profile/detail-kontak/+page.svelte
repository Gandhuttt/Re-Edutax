<script lang="ts">
	let filterOpen = $state(false);
	const columns = ['Jenis Kontak', 'Nomor Telepon', 'Nomor Handphone', 'Nomor Faksimile', 'Alamat Email', 'Alamat Situs Web', 'Keterangan', 'Tanggal Mulai', 'Tanggal Berakhir'];
	const rows = [
		['Kontak Utama', '(021) 555-0100', '0812-0000-0000', '-', 'info@contoh.test', 'https://contoh.test', 'Kontak administrasi', '15/01/2020', '-'],
		['Kontak Alternatif', '-', '0813-0000-0000', '-', 'administrasi@contoh.test', '-', 'Kontak korespondensi', '01/07/2024', '-']
	];
</script>

<svelte:head><title>Kontak</title></svelte:head>
<div class="page-shell"><section class="card">
	<header class="card-header"><h1>Kontak</h1></header>
	<div class="card-body">
		<div class="toolbar"><button type="button">Muat ulang</button><button class:active={filterOpen} type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button><button type="button">Atur Kolom</button><button type="button">Export</button><button type="button">Riwayat</button></div>
		{#if filterOpen}<div class="filter"><label for="contact-search">Cari kontak</label><input id="contact-search" placeholder="Telepon, email, situs web, atau keterangan" /></div>{/if}
		<div class="table-scroll"><table><thead><tr>{#each columns as column}<th>{column}</th>{/each}</tr></thead><tbody>{#each rows as row}<tr>{#each row as value}<td>{value}</td>{/each}</tr>{/each}</tbody></table></div>
		<footer>Menampilkan 1–2 dari 2</footer>
	</div>
</section></div>

<style>
	.page-shell { width: 100%; padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { margin: 0; font-size: 1.5rem; font-weight: 400; } .card-body { padding: .75rem; }
	.toolbar { min-height: 3.75rem; display: flex; align-items: center; justify-content: flex-end; gap: .5rem; flex-wrap: wrap; }
	button { min-height: 2.35rem; padding: .45rem .75rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); cursor: pointer; } button.active { background: var(--color-secondary); color: #fff; }
	.filter { display: flex; align-items: center; gap: .75rem; padding: 0 0 .75rem; } .filter label { font-weight: 700; }
	.filter input { width: min(100%, 30rem); height: 2.35rem; padding: .5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); }
	.table-scroll { width: 100%; overflow-x: auto; border: 1px solid #c5c5c5; }
	table { width: 100%; min-width: 110rem; border-collapse: collapse; }
	th, td { padding: .6rem .75rem; border-right: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db; text-align: left; white-space: nowrap; }
	th { background: #e5e7eb; font-size: .78rem; text-transform: uppercase; } footer { padding: .8rem 0; color: #52525b; font-size: .88rem; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .toolbar { justify-content: flex-start; } .filter { align-items: flex-start; flex-direction: column; } }
</style>
