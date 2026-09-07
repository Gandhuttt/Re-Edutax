<script lang="ts">
	import { notificationData, type Notification } from './notifications';

	let notifications = $state<Notification[]>(notificationData.map((item) => ({ ...item })));

	let activeTab = $state<'all' | 'read' | 'unread'>('all');
	let filterOpen = $state(false);
	let query = $state('');

	const visibleNotifications = $derived(
		notifications.filter((item) => {
			const matchesTab = activeTab === 'all' || (activeTab === 'read' ? item.read : !item.read);
			const search = query.toLowerCase();
			return matchesTab && (item.sender.toLowerCase().includes(search) || item.subject.toLowerCase().includes(search));
		})
	);

	function markAllRead() {
		notifications = notifications.map((item) => ({ ...item, read: true }));
	}

	function exportNotifications() {
		const rows = visibleNotifications.map((item) => [item.sender, item.subject, item.sentAt, item.priority]);
		const csv = [['Pengirim', 'Subjek', 'Tanggal Terkirim', 'Prioritas'], ...rows]
			.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
			.join('\n');
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');
		link.href = url;
		link.download = 'notifikasi-saya.csv';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Notifikasi Saya</title></svelte:head>

<div class="notification-page">
	<section class="card">
		<header class="card-header">
			<h1>Kotak Masuk</h1>
			<button class="button secondary" type="button" onclick={markAllRead}>Tandai Semua Telah Dibaca</button>
		</header>

		<div class="card-body">
			<div class="tabs" role="tablist" aria-label="Status notifikasi">
				<button class:active={activeTab === 'all'} type="button" onclick={() => (activeTab = 'all')}>Semua</button>
				<button class:active={activeTab === 'read'} type="button" onclick={() => (activeTab = 'read')}>Baca</button>
				<button class:active={activeTab === 'unread'} type="button" onclick={() => (activeTab = 'unread')}>Belum dibaca</button>
			</div>

			<div class="toolbar">
				<button class="button" type="button">Muat Ulang</button>
				<button class:active={filterOpen} class="button" type="button" onclick={() => (filterOpen = !filterOpen)}>Filter</button>
				<button class="button" type="button">Atur Kolom</button>
				<button class="button" type="button" onclick={exportNotifications}>Export</button>
			</div>

			{#if filterOpen}
				<div class="filter-row">
					<label for="notification-filter">Cari notifikasi</label>
					<input id="notification-filter" bind:value={query} placeholder="Pengirim atau subjek" />
				</div>
			{/if}

			<div class="table-scroll">
				<table>
					<thead><tr><th>AKSI</th><th>PENGIRIM</th><th>SUBJEK</th><th>TANGGAL TERKIRIM</th><th>PRIORITAS</th></tr></thead>
					<tbody>
						{#each visibleNotifications as item}
							<tr class:unread={!item.read}>
								<td><a class="button view-link" href="/profile/notifikasi-saya/{item.id}">Lihat</a></td>
								<td>{item.sender}</td><td>{item.subject}</td><td>{item.sentAt}</td><td>{item.priority}</td>
							</tr>
						{:else}
							<tr><td class="empty" colspan="5">Tidak ada notifikasi yang ditemukan.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>

			<footer class="pagination"><button type="button" disabled>Sebelumnya</button><button class="current" type="button">1</button><button type="button" disabled>Berikutnya</button><select aria-label="Jumlah baris"><option>10</option><option>25</option><option>50</option></select></footer>
		</div>
	</section>
</div>

<style>
	.notification-page { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { height: 2.5rem; display: flex; align-items: center; margin: 0; font-size: 1.5rem; font-weight: 400; }
	.card-body { min-height: 25rem; padding: .75rem; }
	.button { min-width: 5rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	.view-link { display: inline-block; text-align: center; text-decoration: none; }
	.button:hover { filter: brightness(.95); }
	.button.secondary, .button.active { background: var(--color-secondary); color: #fff; }
	.tabs { display: flex; gap: .25rem; border-bottom: 1px solid #a9a9a9; }
	.tabs button { padding: .65rem 1rem; border: 0; border-bottom: 3px solid transparent; background: transparent; color: var(--color-text); }
	.tabs button.active { border-bottom-color: var(--color-secondary); font-weight: 700; }
	.toolbar { min-height: 4rem; display: flex; align-items: center; justify-content: flex-end; gap: .75rem; }
	.filter-row { display: grid; grid-template-columns: auto minmax(15rem, 32rem); align-items: center; gap: 1rem; padding-bottom: .75rem; }
	.filter-row label { font-weight: 700; }
	.filter-row input, select { height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; }
	.table-scroll { overflow-x: auto; }
	table { width: 100%; min-width: 65rem; border-collapse: collapse; table-layout: fixed; }
	th, td { padding: .5rem 1rem; text-align: left; vertical-align: top; }
	th:first-child { width: 8rem; } th:nth-child(2) { width: 13rem; } th:nth-child(4) { width: 14rem; } th:last-child { width: 9rem; }
	tr.unread { background: rgb(255 210 48 / .13); font-weight: 700; }
	tbody tr:hover { background: rgb(255 255 255 / .45); }
	.empty { padding: 3rem; text-align: center; }
	.pagination { min-height: 4rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }
	.pagination button { min-width: 2.5rem; height: 2.5rem; padding: 0 .5rem; border: 0; border-radius: 5px; background: transparent; }
	.pagination .current { background: var(--color-secondary); color: #fff; }
	.pagination select { width: 6rem; }
	@media (max-width: 720px) { .notification-page { padding: 2rem; } .card-header { align-items: flex-start; flex-direction: column; } .toolbar { justify-content: flex-start; flex-wrap: wrap; } .filter-row { grid-template-columns: 1fr; } }
</style>
