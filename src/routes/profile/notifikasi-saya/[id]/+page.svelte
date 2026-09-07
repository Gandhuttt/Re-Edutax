<script lang="ts">
	import { page } from '$app/state';
	import { notificationData } from '../notifications';

	const notification = $derived(notificationData.find((item) => item.id === Number(page.params.id)));
</script>

<svelte:head><title>Detail Pesan</title></svelte:head>

<div class="detail-page">
	<section class="card">
		<header class="card-header"><h1>Detail Pesan</h1></header>
		<div class="card-body">
			{#if notification}
				<div class="field">
					<label for="sender">Pengirim</label>
					<input id="sender" value={notification.sender} disabled />
				</div>
				<div class="field">
					<label for="subject">Subjek</label>
					<input id="subject" value={notification.subject} disabled />
				</div>
				<div class="field">
					<label for="content">Isi</label>
					<div id="content" class="message-content">{notification.content}</div>
				</div>
				<div class="actions"><a href="/profile/notifikasi-saya">Pergi ke notifikasi</a></div>
			{:else}
				<p>Notifikasi tidak ditemukan.</p>
				<div class="actions"><a href="/profile/notifikasi-saya">Kembali</a></div>
			{/if}
		</div>
	</section>
</div>

<style>
	.detail-page { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { height: 2.5rem; display: flex; align-items: center; margin: 0; font-size: 1.5rem; font-weight: 400; }
	.card-body { min-height: 25rem; padding: 1.5rem; }
	.field { display: grid; grid-template-columns: 12rem minmax(0, 1fr); align-items: start; gap: 1rem; margin-bottom: 1rem; }
	label { padding-top: .6rem; font-weight: 700; }
	input, .message-content { width: 100%; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .6rem .75rem; color: var(--color-text); }
	input { height: 2.75rem; }
	input:disabled { background: var(--color-disabled); opacity: 1; }
	.message-content { min-height: 12rem; white-space: pre-wrap; }
	.actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
	.actions a { min-width: 10rem; padding: .6rem .75rem; border-radius: 5px; background: var(--color-primary); color: var(--color-text); text-align: center; text-decoration: none; }
	.actions a:hover { filter: brightness(.95); }
	@media (max-width: 720px) { .detail-page { padding: 2rem; } .field { grid-template-columns: 1fr; gap: .25rem; } label { padding-top: 0; } }
</style>
