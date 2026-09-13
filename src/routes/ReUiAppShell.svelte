<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		AppHeader,
		NavDropdown,
		NavLink,
		ProfileMenu,
		ReUiRoot,
		type NavDropdownSection,
		type ProfileMenuGroup,
	} from "$lib/re-ui-components";
	import { logout } from "./auth/logout/logout.remote";

	type Account = {
		name?: string | null;
		username?: string | null;
	} | null;

	let {
		user = null,
		children,
	}: {
		user?: Account;
		children: Snippet;
	} = $props();

	let logoutForm = $state<HTMLFormElement>();

	const accountName = $derived(
		String(user?.name ?? "Wajib Pajak").replaceAll("'", ""),
	);
	const accountNpwp = $derived(
		String(user?.username ?? "NPWP tidak tersedia"),
	);
	const accountInitials = $derived(
		accountName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase())
			.join("") || "WP",
	);

	const fakturMenu: NavDropdownSection[] = [
		{
			heading: "Faktur Pajak",
			items: [
				{
					label: "Faktur Pajak Masukan",
					description: "Dokumen pajak dari pemasok",
					href: "/faktur-pajak/masukan",
				},
				{
					label: "Faktur Pajak Keluaran",
					description: "Buat dan kelola faktur penjualan",
					href: "/faktur-pajak/keluaran",
				},
			],
		},
	];

	const sptMenu: NavDropdownSection[] = [
		{
			heading: "Surat Pemberitahuan",
			items: [
				{
					label: "Konsep SPT",
					description: "Lanjutkan dokumen yang belum dilaporkan",
					href: "/surat-pemberitahuan/konsep",
				},
				{
					label: "Menunggu Pembayaran",
					description: "SPT yang masih memiliki kewajiban pembayaran",
					href: "/surat-pemberitahuan/pembayaran",
				},
				{
					label: "SPT Dilaporkan",
					description: "Riwayat dokumen dan bukti penerimaan",
					href: "/surat-pemberitahuan/laporan",
				},
			],
		},
	];

	const ebupotMenu: NavDropdownSection[] = [
		{
			heading: "Dokumen Saya",
			items: [
				{
					label: "Bukti Potong Saya",
					description: "Dokumen yang diterima sebagai penerima penghasilan",
					href: "/ebupot/bukti-potong-saya",
				},
				{ label: "BPU", description: "Bukti potong unifikasi", href: "/ebupot/bpu" },
				{ label: "BP21", description: "Pemotongan PPh Pasal 21", href: "/ebupot/bp21" },
			],
		},
		{
			heading: "Dokumen Lainnya",
			items: [
				{ label: "BP26", description: "Pemotongan PPh Pasal 26", href: "/ebupot/bp26" },
				{ label: "BPA1", description: "Bukti potong formulir A1", href: "/ebupot/bpa1" },
				{ label: "BPA2", description: "Bukti potong formulir A2", href: "/ebupot/bpa2" },
				{ label: "MP", description: "Dokumen pemotongan masa", href: "/ebupot/mp" },
			],
		},
	];

	const profileGroups: ProfileMenuGroup[] = [
		{
			label: "Portal Saya",
			items: [
				{ label: "Dokumen Saya", href: "/portal-saya/dokumen-saya" },
				{ label: "Notifikasi Saya", href: "/portal-saya/notifikasi-saya" },
				{ label: "Kasus Saya", href: "/portal-saya/kasus-saya" },
				{ label: "Kasus Berjalan Saya", href: "/portal-saya/kasus-berjalan-saya" },
				{ label: "Pengukuhan PKP", href: "/portal-saya/pengukuhan-pkp" },
				{
					label: "Pendaftaran Objek Pajak PBB P5L",
					href: "/portal-saya/pendaftaran-objek-pajak-pbb-p5l",
				},
				{
					label: "Penghapusan & Pencabutan",
					href: "/portal-saya/penghapusan-pencabutan",
				},
			],
		},
		{
			label: "Perubahan Data",
			items: [
				{
					label: "Identitas Wajib Pajak",
					href: "/perubahan-data/identitas-wajib-pajak",
				},
				{
					label: "Perubahan Alamat Utama",
					href: "/perubahan-data/perubahan-alamat-utama",
				},
				{
					label: "Perubahan Data Objek Pajak PBB P5L",
					href: "/perubahan-data/perubahan-data-objek-pajak-pbb-p5l",
				},
				{
					label: "Perubahan Data Pemungut PPN PMSE dengan Kepdirjen",
					href: "/perubahan-data/perubahan-data-pemungut-ppn-pmse",
				},
			],
		},
		{
			label: "Perubahan Status",
			items: [
				{
					label: "Penetapan Wajib Pajak Nonaktif",
					href: "/perubahan-status/penetapan-wajib-pajak-nonaktif",
				},
				{
					label: "Pengaktifan Kembali Wajib Pajak Nonaktif",
					href: "/perubahan-status/pengaktifan-kembali-wajib-pajak-nonaktif",
				},
				{
					label: "Penunjukan Pemungut PMSE Dalam Negeri",
					href: "/perubahan-status/penunjukan-pemungut-pmse-dalam-negeri",
				},
				{
					label: "Penetapan Pemungut Bea Meterai",
					href: "/perubahan-status/penetapan-pemungut-bea-meterai",
				},
				{
					label: "Pencabutan Pemungut Bea Meterai",
					href: "/perubahan-status/pencabutan-pemungut-bea-meterai",
				},
				{
					label: "Penunjukan Pemotong atau Pemungut PPh/PPN",
					href: "/perubahan-status/penunjukan-pemotong-pemungut-pph-ppn",
				},
				{
					label: "Pencabutan Pemotong atau Pemungut PPh/PPN",
					href: "/perubahan-status/pencabutan-pemotong-pemungut-pph-ppn",
				},
				{
					label: "Pencabutan Pemungut PPN PMSE",
					href: "/perubahan-status/pencabutan-pemungut-ppn-pmse",
				},
				{
					label: "Lembaga Keuangan Pelapor - Penetapan",
					href: "/perubahan-status/lembaga-keuangan-pelapor-penetapan",
				},
				{
					label: "Lembaga Keuangan Pelapor - Pencabutan",
					href: "/perubahan-status/lembaga-keuangan-pelapor-pencabutan",
				},
				{
					label: "Lembaga Keuangan Pelapor - Perubahan Data",
					href: "/perubahan-status/lembaga-keuangan-pelapor-perubahan-data",
				},
				{
					label: "Penambahan Status Sebagai Wajib Pajak GloBE",
					href: "/perubahan-status/penambahan-status-wajib-pajak-globe",
				},
			],
		},
		{
			label: "Profil Saya",
			items: [
				{ label: "Ikhtisar Profil Wajib Pajak", href: "/profile" },
				{ label: "Informasi Umum", href: "/profile/informasi-umum" },
				{ label: "Alamat", href: "/profile/alamat" },
				{ label: "Detail Kontak", href: "/profile/detail-kontak" },
				{ label: "Pihak Terkait", href: "/profile/pihak-terkait" },
				{
					label: "Objek Pajak Bumi dan Bangunan (PBB)",
					href: "/profile/objek-pajak-pbb",
				},
				{
					label: "Klasifikasi Lapangan Usaha (KLU)",
					href: "/profile/klasifikasi-lapangan-usaha",
				},
				{ label: "Detail Bank", href: "/profile/detail-bank" },
				{ label: "Data Unit Keluarga", href: "/profile/data-unit-keluarga" },
				{
					label: "Tempat Kegiatan Usaha/Sub Unit",
					href: "/profile/tempat-kegiatan-usaha",
				},
				{
					label: "Nomor Identifikasi Eksternal",
					href: "/profile/nomor-identifikasi-eksternal",
				},
				{ label: "Jenis Pajak", href: "/profile/jenis-pajak" },
				{ label: "Wakil/Kuasa Saya", href: "/profile/wakil-kuasa-saya" },
				{
					label: "Wajib Pajak yang Diwakili",
					href: "/profile/wajib-pajak-yang-diwakili",
				},
				{
					label: "Verifikasi Dua Langkah",
					href: "/profile/verifikasi-dua-langkah",
				},
				{ label: "Permohonan Tertunda", href: "/profile/permohonan-tertunda" },
				{ label: "Semua Permintaan", href: "/profile/semua-permintaan" },
			],
		},
	];
</script>

<ReUiRoot>
	<form {...logout} bind:this={logoutForm} hidden></form>
	<AppHeader
		brand="EduTax"
		subtitle="Layanan Administrasi Perpajakan"
		mark="ET"
		homeHref="/"
		homeLabel="Beranda EduTax"
		contentWidth="1500px"
	>
		{#snippet navigation()}
			<NavLink href="/">Beranda</NavLink>
			<NavDropdown label="Faktur" sections={fakturMenu} columns={1} />
			<NavDropdown label="SPT" sections={sptMenu} columns={1} />
			<NavDropdown label="eBupot" sections={ebupotMenu} />
		{/snippet}
		{#snippet account()}
			<ProfileMenu
				name={accountName}
				role={accountNpwp}
				initials={accountInitials}
				groups={profileGroups}
				onlogout={() => logoutForm?.requestSubmit()}
			/>
		{/snippet}
	</AppHeader>

	{@render children()}
</ReUiRoot>
