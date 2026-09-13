<script lang="ts">
	import { page } from "$app/state";
	import {
		Breadcrumbs,
		FormSection,
		InlineAlert,
		KeyValueGrid,
		PageHeading,
		PageLayout,
		Stack,
		StatusBadge,
		TableActions,
		TextBlock,
	} from "$lib/re-ui-components";
	import { notificationData } from "../notifications";

	const notification = $derived(
		notificationData.find((item) => item.id === Number(page.params.id)),
	);
</script>

<svelte:head><title>Detail Pesan</title></svelte:head>

{#snippet pageActions()}
	<TableActions
		visibleCount={1}
		actions={[
			{
				label: "Kembali ke Notifikasi",
				href: "/portal-saya/notifikasi-saya",
			},
		]}
	/>
{/snippet}

<PageLayout contentWidth="1200px">
	<Breadcrumbs
		items={[
			{ label: "Portal Saya", href: "/" },
			{ label: "Notifikasi Saya", href: "/portal-saya/notifikasi-saya" },
			{ label: "Detail Pesan" },
		]}
	/>
	<PageHeading
		eyebrow="Portal Saya"
		title="Detail Pesan"
		description="Rincian pemberitahuan yang diterima pada akun Anda."
		actions={pageActions}
	/>

	{#if notification}
		<FormSection title="Informasi Pesan" bordered>
			<Stack gap="18px">
				<KeyValueGrid
					columns={2}
					items={[
						{ label: "Pengirim", value: notification.sender },
						{ label: "Tanggal terkirim", value: notification.sentAt },
						{ label: "Subjek", value: notification.subject },
						{ label: "Status", value: notification.read ? "Telah dibaca" : "Belum dibaca" },
					]}
				/>
				<div class="priority-row">
					<span>Prioritas</span>
					<StatusBadge
						label={notification.priority}
						tone={notification.priority === "HIGH" ? "attention" : "neutral"}
					/>
				</div>
				<section class="message-content" aria-labelledby="message-content-heading">
					<h2 id="message-content-heading">Isi pesan</h2>
					<TextBlock>{notification.content}</TextBlock>
				</section>
			</Stack>
		</FormSection>
	{:else}
		<InlineAlert
			tone="warning"
			title="Notifikasi tidak ditemukan"
			message="Pesan yang Anda cari tidak tersedia pada data lokal."
		/>
	{/if}
</PageLayout>

<style>
	.priority-row { display: flex; align-items: center; gap: 12px; }
	.priority-row > span { color: var(--ui-muted); font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
	.message-content { min-height: 180px; padding: 20px; border: 1px solid var(--ui-line); background: #fffefa; }
	.message-content h2 { margin: 0 0 12px; color: var(--ui-navy); font-family: var(--ui-font-display); font-size: 15px; }
</style>
