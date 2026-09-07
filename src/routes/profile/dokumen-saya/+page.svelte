<script lang="ts">
	type DocumentRow = {
		number: string;
		documentDate: string;
		title: string;
		type: string;
		caseNumber: string;
		createdDate: string;
		createdBy: string;
	};

	const documents: DocumentRow[] = [
		{
			number: 'DOC-PPN-2026-00021',
			documentDate: '26/08/2026',
			title: 'Surat Tagihan Pajak Pertambahan Nilai',
			type: 'Surat Tagihan Pajak Pertambahan Nilai',
			caseNumber: 'CASE-2026-00148',
			createdDate: '26/08/2026',
			createdBy: '-'
		},
		{
			number: 'DOC-PPN-2026-00020',
			documentDate: '26/08/2026',
			title: 'Surat Tagihan Pajak Pertambahan Nilai',
			type: 'Surat Tagihan Pajak Pertambahan Nilai',
			caseNumber: 'CASE-2026-00147',
			createdDate: '26/08/2026',
			createdBy: '-'
		},
		{
			number: '',
			documentDate: '23/08/2026',
			title: '',
			type: 'Dokumen Lain-Lain dari Wajib Pajak',
			caseNumber: '',
			createdDate: '23/08/2026',
			createdBy: 'Wajib Pajak'
		},
		{
			number: '',
			documentDate: '23/08/2026',
			title: 'Lampiran SPT Masa PPN',
			type: 'Lampiran SPT Masa PPN',
			caseNumber: '',
			createdDate: '23/08/2026',
			createdBy: 'Wajib Pajak'
		},
		{
			number: 'BILL-2026-00042',
			documentDate: '11/08/2026',
			title: 'BILLING_CODE',
			type: 'Cetakan Kode Billing',
			caseNumber: '',
			createdDate: '11/08/2026',
			createdBy: 'Wajib Pajak'
		},
		{
			number: 'S-00491/TGR/2026',
			documentDate: '05/08/2026',
			title: 'Surat Teguran',
			type: 'Surat Teguran',
			caseNumber: '',
			createdDate: '05/08/2026',
			createdBy: '-'
		}
	];

	let filterOpen = $state(false);
	let query = $state('');
	let pageSize = $state('10');

	const filteredDocuments = $derived(
		documents.filter((item) => Object.values(item).some((value) => value.toLowerCase().includes(query.toLowerCase())))
	);

	function exportDocuments() {
		const headings = ['Nomor Dokumen', 'Tanggal Dokumen', 'Judul Dokumen', 'Jenis Dokumen', 'Nomor Kasus', 'Tanggal Pembuatan', 'Pengguna Pembuatan'];
		const rows = filteredDocuments.map((item) => [
			item.number,
			item.documentDate,
			item.title,
			item.type,
			item.caseNumber,
			item.createdDate,
			item.createdBy
		]);
		const csv = [headings, ...rows]
			.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
			.join('\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'dokumen-saya.csv';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Dokumen Saya</title></svelte:head>

<div class="documents-page">
	<section class="document-card">
		<header class="card-heading">
			<h1>Dokumen</h1>
			<div class="heading-actions">
				<button class="button button-plain" type="button">Hasilkan Dokumen</button>
				<label class="button button-primary" for="document-upload">Unggah Dokumen</label>
				<input id="document-upload" type="file" hidden />
			</div>
		</header>

		<div class="table-panel">
			<div class="toolbar">
				<button class="button tool-button" type="button">Muat Ulang</button>
				<button class:active={filterOpen} class="button tool-button" type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
				<button class="button tool-button" type="button">Atur Kolom</button>
				<button class="button tool-button" type="button" onclick={exportDocuments}>Export</button>
			</div>

			{#if filterOpen}
				<div class="filter-row">
					<label for="document-filter">Cari dokumen</label>
					<input id="document-filter" bind:value={query} placeholder="Nomor, judul, jenis, atau nomor kasus" />
				</div>
			{/if}

			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>NOMOR DOKUMEN</th>
							<th>TANGGAL DOKUMEN</th>
							<th>JUDUL DOKUMEN</th>
							<th>JENIS DOKUMEN</th>
							<th>NOMOR KASUS</th>
							<th>TANGGAL PEMBUATAN</th>
							<th>PENGGUNA PEMBUATAN</th>
							<th>AKSI</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredDocuments.slice(0, Number(pageSize)) as item}
							<tr>
								<td>{item.number}</td>
								<td>{item.documentDate}</td>
								<td>{item.title}</td>
								<td>{item.type}</td>
								<td>{item.caseNumber}</td>
								<td>{item.createdDate}</td>
								<td>{item.createdBy}</td>
								<td><button class="download-button" type="button">Unduh</button></td>
							</tr>
						{:else}
							<tr><td class="empty" colspan="8">Tidak ada dokumen yang sesuai.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>

			<footer class="pagination">
				<button type="button" disabled aria-label="Halaman sebelumnya">Sebelumnya</button>
				<button class="current-page" type="button">1</button>
				<button type="button" disabled aria-label="Halaman berikutnya">Berikutnya</button>
				<select bind:value={pageSize} aria-label="Jumlah baris per halaman">
					<option value="10">10</option><option value="25">25</option><option value="50">50</option>
				</select>
			</footer>
		</div>
	</section>
</div>

<style>
	.documents-page { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); }
	.document-card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-heading { min-height: 4.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { display: flex; align-items: center; height: 2.5rem; gap: .5rem; margin: 0; color: var(--color-text); font-size: 1.5rem; font-weight: 400; }
	.heading-actions, .toolbar { display: flex; align-items: center; gap: .75rem; }
	.button, .download-button { border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); cursor: pointer; }
	.button { min-height: 2.5rem; display: inline-flex; align-items: center; gap: .45rem; padding: .5rem .75rem; }
	.button:hover, .download-button:hover { filter: brightness(.95); }
	.button-plain { background: transparent; }
	.button-primary, .tool-button.active { background: var(--color-secondary); color: #fff; }
	.table-panel { min-height: 25rem; padding: .75rem; overflow: hidden; }
	.toolbar { justify-content: flex-end; min-height: 3.5rem; padding: 0 0 .75rem; }
	.tool-button { background: var(--color-primary); }
	.filter-row { display: grid; grid-template-columns: auto minmax(15rem, 32rem); align-items: center; gap: 1rem; padding: 0 0 .75rem; }
	.filter-row label { font-weight: 700; }
	.filter-row input { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; min-width: 105rem; border-collapse: collapse; table-layout: auto; }
	th, td { padding: .5rem 1rem; text-align: left; vertical-align: top; }
	th { font-size: .8rem; white-space: nowrap; }
	td { max-width: 24rem; }
	tbody tr:hover { background: rgb(255 255 255 / .45); }
	.download-button { min-width: 5rem; padding: .5rem; }
	.empty { padding: 3rem; text-align: center; }
	.pagination { min-height: 4rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }
	.pagination button { min-width: 2.5rem; height: 2.5rem; padding: 0 .5rem; border: 0; border-radius: 5px; background: transparent; color: var(--color-text); }
	.pagination .current-page { background: var(--color-secondary); color: #fff; }
	.pagination select { width: 6rem; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); color: var(--color-text); }
	@media (max-width: 720px) {
		.documents-page { padding: 2rem; }
		.card-heading { align-items: flex-start; flex-direction: column; }
		.heading-actions, .toolbar { width: 100%; flex-wrap: wrap; }
		.toolbar { justify-content: flex-start; }
		.filter-row { grid-template-columns: 1fr; }
	}
</style>
