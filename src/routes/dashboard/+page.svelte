<script lang="ts">
	import { page } from '$app/state';
	import {
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		Stack,
		SummaryStrip,
	} from '$lib/re-ui-components';

	const accountName = $derived(String(page.data.user?.name ?? 'Wajib Pajak').replaceAll("'", ''));
	const accountNpwp = $derived(String(page.data.user?.username ?? '—'));

	const services = [
		{
			mark: 'FP',
			title: 'Faktur Pajak',
			description: 'Buat dan kelola faktur keluaran serta faktur masukan.',
			href: '/faktur-pajak/keluaran',
			linkLabel: 'Buka Faktur Pajak',
		},
		{
			mark: 'SPT',
			title: 'Surat Pemberitahuan',
			description: 'Lanjutkan konsep, selesaikan pembayaran, dan lihat laporan SPT.',
			href: '/surat-pemberitahuan/konsep',
			linkLabel: 'Buka SPT',
		},
		{
			mark: 'EB',
			title: 'e-Bupot',
			description: 'Kelola bukti pemotongan dan dokumen yang Anda terima.',
			href: '/ebupot/bukti-potong-saya',
			linkLabel: 'Buka e-Bupot',
		},
		{
			mark: 'WP',
			title: 'Profil Wajib Pajak',
			description: 'Periksa identitas, alamat, kontak, dan data registrasi pajak.',
			href: '/profile',
			linkLabel: 'Buka Profil',
		},
	] as const;
</script>

<svelte:head>
	<title>Beranda | Edutaxindo Praktika</title>
	<meta
		name="description"
		content="Beranda layanan administrasi perpajakan Edutaxindo Praktika."
	/>
</svelte:head>

<PageLayout contentWidth="1500px">
	<Stack gap="18px">
		<PageHeading
			eyebrow="Portal Wajib Pajak"
			title={`Selamat datang, ${accountName}`}
			description="Akses layanan perpajakan dan lanjutkan pekerjaan Anda dari satu ruang kerja."
		/>

		<SummaryStrip
			columns={3}
			items={[
				{ label: 'Nama Wajib Pajak', value: accountName },
				{ label: 'NPWP', value: accountNpwp },
				{ label: 'Status akun', value: 'Aktif' },
			]}
		/>

		<InlineAlert
			title="Lingkungan simulasi Edutaxindo Praktika"
			message="Gunakan data latihan yang tersedia untuk mempelajari alur administrasi perpajakan."
		/>

		<FormSection
			title="Layanan Utama"
			description="Pilih ruang kerja sesuai dokumen atau layanan yang ingin Anda kelola."
			bordered
		>
			<div class="service-grid">
				{#each services as service}
					<a class="service-card" href={service.href} aria-label={service.linkLabel}>
						<span class="service-mark" aria-hidden="true">{service.mark}</span>
						<span class="service-copy">
							<strong>{service.title}</strong>
							<small>{service.description}</small>
						</span>
						<span class="service-arrow" aria-hidden="true">→</span>
					</a>
				{/each}
			</div>
		</FormSection>

		<div class="secondary-grid">
			<a href="/portal-saya/dokumen-saya">
				<span>Dokumen Saya</span>
				<strong>Lihat seluruh dokumen perpajakan</strong>
			</a>
			<a href="/portal-saya/notifikasi-saya">
				<span>Notifikasi Saya</span>
				<strong>Periksa informasi dan pembaruan terbaru</strong>
			</a>
			<a href="/profile/semua-permintaan">
				<span>Semua Permintaan</span>
				<strong>Pantau permohonan layanan Anda</strong>
			</a>
		</div>
	</Stack>
</PageLayout>

<style>
	.service-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.service-card {
		min-width: 0;
		padding: 20px;
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr) auto;
		align-items: center;
		gap: 15px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		text-decoration: none;
		box-shadow: 0 3px 10px rgba(16, 36, 60, 0.05);
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			transform 140ms ease;
	}

	.service-card:hover {
		border-color: var(--ui-yellow-deep);
		box-shadow: 0 8px 20px rgba(16, 36, 60, 0.1);
		transform: translateY(-2px);
	}

	.service-card:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}

	.service-mark {
		width: 48px;
		height: 48px;
		display: grid;
		place-items: center;
		border: 1px solid var(--ui-yellow-deep);
		border-radius: 2px;
		background: var(--ui-yellow-soft);
		color: var(--ui-navy);
		font-family: var(--ui-font-mono);
		font-size: 12px;
		font-weight: 900;
	}

	.service-copy {
		min-width: 0;
		display: grid;
		gap: 4px;
	}

	.service-copy strong {
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 20px;
	}

	.service-copy small {
		color: var(--ui-muted);
		font-size: 13px;
		line-height: 1.5;
	}

	.service-arrow {
		color: var(--ui-yellow-deep);
		font-size: 24px;
		font-weight: 800;
	}

	.secondary-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.secondary-grid a {
		min-width: 0;
		padding: 16px 18px;
		display: grid;
		gap: 4px;
		border-left: 4px solid var(--ui-yellow);
		background: var(--ui-navy);
		color: white;
		text-decoration: none;
	}

	.secondary-grid a:hover {
		background: var(--ui-navy-strong);
	}

	.secondary-grid a:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}

	.secondary-grid span {
		color: var(--ui-yellow);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.secondary-grid strong {
		font-size: 13px;
	}

	@media (max-width: 780px) {
		.service-grid,
		.secondary-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 460px) {
		.service-card {
			grid-template-columns: 42px minmax(0, 1fr);
			padding: 16px;
		}

		.service-mark {
			width: 42px;
			height: 42px;
		}

		.service-arrow {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.service-card {
			transition: none;
		}

		.service-card:hover {
			transform: none;
		}
	}
</style>
