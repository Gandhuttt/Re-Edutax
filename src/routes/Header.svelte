<script lang="ts">
	import { page } from '$app/state';
	import { logout } from './auth/logout/logout.remote';

	let {
		authenticated = false,
		loggedUsername = 'guest',
		isAdmin = false
	}: { authenticated?: boolean; loggedUsername?: string; isAdmin?: boolean } = $props();

	const displayName = $derived(loggedUsername.replace(/'/g, ''));

	const portalSayaSections = [
		{
			items: [
				'Dokumen Saya',
				'Notifikasi Saya',
				'Kasus Saya',
				'Kasus Berjalan Saya',
				'Pengukuhan PKP',
				'Pendaftaran Objek Pajak PBB P5L',
				'Penghapusan & Pencabutan'
			]
		},
		{
			label: 'Perubahan Data',
			items: [
				'Identitas Wajib Pajak',
				'Perubahan Alamat Utama',
				'Perubahan Data Objek Pajak PBB P5L',
				'Perubahan Data Pemungut PPN PMSE dengan Kepdirjen'
			]
		},
		{
			label: 'Perubahan Status',
			items: [
				'Penetapan Wajib Pajak Nonaktif',
				'Pengaktifan Kembali Wajib Pajak Nonaktif',
				'Penunjukan Pemungut PMSE Dalam Negeri',
				'Penetapan Pemungut Bea Meterai',
				'Pencabutan Pemungut Bea Meterai',
				'Penunjukan Pemotong atau Pemungut PPh/PPN',
				'Pencabutan Pemotong atau Pemungut PPh/PPN',
				'Pencabutan Pemungut PPN PMSE',
				'Lembaga Keuangan Pelapor - Penetapan',
				'Lembaga Keuangan Pelapor - Pencabutan',
				'Lembaga Keuangan Pelapor - Perubahan Data',
				'Penambahan Status Sebagai Wajib Pajak GloBE'
			]
		},
		{
			label: 'Profil Saya',
			items: [
				'Ikhtisar Profil Wajib Pajak',
				'Informasi Umum',
				'Alamat',
				'Detail Kontak',
				'Pihak Terkait',
				'Objek Pajak Bumi dan Bangunan (PBB)',
				'Klasifikasi Lapangan Usaha (KLU)',
				'Detail Bank',
				'Data Unit Keluarga',
				'Tempat Kegiatan Usaha/Sub Unit',
				'Nomor Identifikasi Eksternal',
				'Jenis Pajak',
				'Wakil/Kuasa Saya',
				'Wajib Pajak yang Diwakili',
				'Verifikasi Dua Langkah',
				'Permohonan Tertunda',
				'Semua Permintaan'
			]
		}
	];

	const portalRoutes: Record<string, string> = {
		'Dokumen Saya': '/portal-saya/dokumen-saya',
		'Notifikasi Saya': '/portal-saya/notifikasi-saya',
		'Kasus Saya': '/portal-saya/kasus-saya',
		'Kasus Berjalan Saya': '/portal-saya/kasus-berjalan-saya',
		'Ikhtisar Profil Wajib Pajak': '/profile',
		'Informasi Umum': '/profile/informasi-umum',
		Alamat: '/profile/alamat',
		'Detail Kontak': '/profile/detail-kontak',
		'Pihak Terkait': '/profile/pihak-terkait',
		'Objek Pajak Bumi dan Bangunan (PBB)': '/profile/objek-pajak-pbb',
		'Klasifikasi Lapangan Usaha (KLU)': '/profile/klasifikasi-lapangan-usaha',
		'Detail Bank': '/profile/detail-bank',
		'Data Unit Keluarga': '/profile/data-unit-keluarga',
		'Tempat Kegiatan Usaha/Sub Unit': '/profile/tempat-kegiatan-usaha',
		'Nomor Identifikasi Eksternal': '/profile/nomor-identifikasi-eksternal',
		'Jenis Pajak': '/profile/jenis-pajak',
		'Wakil/Kuasa Saya': '/profile/wakil-kuasa-saya',
		'Wajib Pajak yang Diwakili': '/profile/wajib-pajak-yang-diwakili',
		'Verifikasi Dua Langkah': '/profile/verifikasi-dua-langkah',
		'Permohonan Tertunda': '/profile/permohonan-tertunda',
		'Semua Permintaan': '/profile/semua-permintaan',
		'Pengukuhan PKP': '/portal-saya/pengukuhan-pkp',
		'Pendaftaran Objek Pajak PBB P5L': '/portal-saya/pendaftaran-objek-pajak-pbb-p5l',
		'Penghapusan & Pencabutan': '/portal-saya/penghapusan-pencabutan',
		'Identitas Wajib Pajak': '/perubahan-data/identitas-wajib-pajak',
		'Perubahan Alamat Utama': '/perubahan-data/perubahan-alamat-utama',
		'Perubahan Data Objek Pajak PBB P5L': '/perubahan-data/perubahan-data-objek-pajak-pbb-p5l',
		'Perubahan Data Pemungut PPN PMSE dengan Kepdirjen': '/perubahan-data/perubahan-data-pemungut-ppn-pmse',
		'Penetapan Wajib Pajak Nonaktif': '/perubahan-status/penetapan-wajib-pajak-nonaktif',
		'Pengaktifan Kembali Wajib Pajak Nonaktif': '/perubahan-status/pengaktifan-kembali-wajib-pajak-nonaktif',
		'Penunjukan Pemungut PMSE Dalam Negeri': '/perubahan-status/penunjukan-pemungut-pmse-dalam-negeri',
		'Penetapan Pemungut Bea Meterai': '/perubahan-status/penetapan-pemungut-bea-meterai',
		'Pencabutan Pemungut Bea Meterai': '/perubahan-status/pencabutan-pemungut-bea-meterai',
		'Penunjukan Pemotong atau Pemungut PPh/PPN': '/perubahan-status/penunjukan-pemotong-pemungut-pph-ppn',
		'Pencabutan Pemotong atau Pemungut PPh/PPN': '/perubahan-status/pencabutan-pemotong-pemungut-pph-ppn',
		'Pencabutan Pemungut PPN PMSE': '/perubahan-status/pencabutan-pemungut-ppn-pmse',
		'Lembaga Keuangan Pelapor - Penetapan': '/perubahan-status/lembaga-keuangan-pelapor-penetapan',
		'Lembaga Keuangan Pelapor - Pencabutan': '/perubahan-status/lembaga-keuangan-pelapor-pencabutan',
		'Lembaga Keuangan Pelapor - Perubahan Data': '/perubahan-status/lembaga-keuangan-pelapor-perubahan-data',
		'Penambahan Status Sebagai Wajib Pajak GloBE': '/perubahan-status/penambahan-status-wajib-pajak-globe'
	};

	const portalMenuActive = $derived(
		['/portal-saya', '/perubahan-data', '/perubahan-status', '/profile'].some((prefix) =>
			page.url.pathname.startsWith(prefix)
		)
	);
</script>

<header>
	<nav>
		<ul class="nav-ul">
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			{#if isAdmin}
				<!-- Admins are not wajib pajak: the faktur/SPT sections have no data for them. -->
				<li aria-current={page.url.pathname.startsWith('/admin') ? 'page' : undefined}>
					<a href="/admin">Dasbor Admin</a>
				</li>
			{:else}
				<li
					class="dropdown"
					aria-current={page.url.pathname.startsWith('/faktur-pajak') ? 'page' : undefined}
				>
					<button class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Faktur</button>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="/faktur-pajak/masukan">Faktur Pajak Masukan</a></li>
						<li><a class="dropdown-item" href="/faktur-pajak/keluaran">Faktur Pajak Keluaran</a></li>
					</ul>
				</li>
				<li
					class="dropdown"
					aria-current={page.url.pathname.startsWith('/surat-pemberitahuan') ? 'page' : undefined}
				>
					<button class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">SPT</button>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="/surat-pemberitahuan/konsep">Konsep SPT</a></li>
						<li><a class="dropdown-item" href="/surat-pemberitahuan/pembayaran">SPT Menunggu Pembayaran</a></li>
						<li><a class="dropdown-item" href="/surat-pemberitahuan/laporan">SPT Dilaporkan</a></li>
					</ul>
				</li>
				<li class="dropdown" aria-current={page.url.pathname.startsWith('/ebupot') ? 'page' : undefined}>
					<button class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">eBupot</button>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="/ebupot/bukti-potong-saya">Bukti Potong Saya</a></li>
						<li><a class="dropdown-item" href="/ebupot/bpu">BPU</a></li>
						<li><a class="dropdown-item" href="/ebupot/bp21">BP21</a></li>
						<li><a class="dropdown-item" href="/ebupot/bp26">BP26</a></li>
						<li><a class="dropdown-item" href="/ebupot/bpa1">BPA1</a></li>
						<li><a class="dropdown-item" href="/ebupot/bpa2">BPA2</a></li>
						<li><a class="dropdown-item" href="/ebupot/mp">MP</a></li>
					</ul>
				</li>
			{/if}
		</ul>
		<div class="corner">
			<ul class="nav-ul">
				{#if authenticated && !isAdmin}
					<li
						class="dropdown portal-dropdown"
						aria-current={portalMenuActive ? 'page' : undefined}
					>
						<button
							class="dropdown-toggle tw:w-auto tw:text-base tw:text-[.8em] tw:overflow-clip"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							{displayName}
						</button>
						<ul class="dropdown-menu dropdown-menu-end portal-menu">
							{#each portalSayaSections as section}
								<li class="portal-section">
								{#if section.label}
									<h6 class="dropdown-header">{section.label}</h6>
								{:else}
									<h6 class="dropdown-header">Portal Saya</h6>
								{/if}
								<ul class="portal-section-list">
									{#each section.items as item}
										<li>
										<a
											class="dropdown-item"
											href={portalRoutes[item]}
										>{item}</a
										>
										</li>
									{/each}
								</ul>
								</li>
							{/each}
						</ul>
					</li>
				{:else}
					<li aria-current={page.url.pathname === '/profile' ? 'page' : undefined}>
						<a class="tw:w-auto tw:text-base tw:text-[.8em] tw:overflow-clip" href="/profile"
							>{displayName}</a
						>
					</li>
				{/if}
			</ul>
			<div class="tw:w-20">
				{#if authenticated}
				<form {...logout}>
					<button type="submit">Logout</button>
				</form>
				{:else}
				<a href="/auth/login">Login</a>
				{/if}
			</div>
		</div>
	</nav>
	<svg viewBox="0 0 2 3" aria-hidden="true">
		<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
	</svg>
</header>

<style>
	header {
		display: flex;
		justify-content: start;
		font-size: 16px;
		position: sticky;
		top: 0rem;
		z-index: 1;
	}

	.corner {
		display: flex;
		align-items: center;
		width: auto;
		min-width: 15rem;
		font-weight: 700;
		color: var(--color-text);
		overflow: visible;
		justify-content: right;
		gap: 1rem;
	}

	nav {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 0 5rem;
		padding-right: 1rem;
		--background: rgb(255, 255, 255);
		background: var(--background);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: rgb(255, 255, 255);
	}

	.nav-ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	form {
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav button,
	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		background: transparent;
		font-weight: 700;
		font-size: 0.8em;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
		&:hover {
			color: var(--color-theme-1);
		}
	}

	nav button::after {
		content: '';
	}

	.dropdown-toggle,
	form button {
		border: 0;
	}

	.dropdown-menu {
		padding: 0;
	}

	.portal-menu {
		width: min(72rem, calc(100vw - 2rem));
		max-width: calc(100vw - 2rem);
		max-height: calc(100vh - 4rem);
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0.75rem;
	}

	.portal-menu.show {
		display: grid;
		grid-template-columns: repeat(4, minmax(13rem, 1fr));
		gap: 0.75rem;
	}

	.portal-section {
		height: auto;
		min-width: 0;
	}

	.portal-section + .portal-section {
		border-left: 1px solid var(--color-bg-0);
	}

	.portal-section-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.portal-menu .dropdown-header {
		padding: 0.75rem 1rem 0.4rem;
		color: var(--color-theme-1);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.portal-menu .dropdown-item {
		min-width: 0;
		padding: 0.55rem 1rem;
		white-space: normal;
		overflow-wrap: anywhere;
	}

	@media (max-width: 1200px) {
		.portal-menu.show {
			grid-template-columns: repeat(2, minmax(13rem, 1fr));
			width: min(40rem, calc(100vw - 2rem));
		}

		.portal-section:nth-child(odd) {
			border-left: 0;
		}
	}

	@media (max-width: 800px) {
		.portal-menu.show {
			display: block;
			width: min(26rem, calc(100vw - 2rem));
		}

		.portal-section + .portal-section {
			border-top: 1px solid var(--color-bg-0);
			border-left: 0;
		}
	}

	.dropdown-item {
		padding: 1rem;
		border-bottom: 1px solid var(--color-bg-0);
	}
</style>
