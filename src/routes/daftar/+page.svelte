<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FileUploadField,
		FormActions,
		FormField,
		FormSection,
		InlineAlert,
		ReUiRoot,
		SelectField,
		Stack,
		TextAreaField
	} from '$lib/re-ui-components';
	import {
		BERKAS,
		BERKAS_DITERIMA,
		BERKAS_DITERIMA_GAMBAR,
		KELAS_PENDAFTARAN,
		PEKERJAAN,
		PENDIDIKAN
	} from '$lib/helpers/pendaftaran';
	import type { PageProps } from './$types';
	import { daftar } from './daftar.remote';
	import TurnstileWidget from './TurnstileWidget.svelte';

	let { data }: PageProps = $props();

	// SelectField falls back to showing options[0] when the value matches no
	// option, so an empty-valued first option is what makes it read "Pilih..."
	// instead of silently displaying (and appearing to choose) the first real one.
	const withPlaceholder = (options: readonly { value: string; label: string }[]) => [
		{ value: '', label: 'Pilih...' },
		...options
	];

	const pendidikanOptions = withPlaceholder(PENDIDIKAN.map((value) => ({ value, label: value })));
	const pekerjaanOptions = withPlaceholder(PEKERJAAN.map((value) => ({ value, label: value })));
	// Only classes an admin has mapped to a batch can be registered for.
	const kelasOptions = $derived(
		withPlaceholder(
			KELAS_PENDAFTARAN.filter((kelas) => data.kelasDibuka.some((dibuka) => dibuka.kode === kelas.kode)).map((kelas) => ({
				value: kelas.kode,
				label: kelas.label
			}))
		)
	);
	const bisaDaftar = $derived(data.tersedia && data.kelasDibuka.length > 0);

	const HINT_BANYAK = 'Unggah hingga 5 berkas JPG, PNG, WEBP, atau PDF. Maksimal 10 MB per berkas.';
	const HINT_SATU = 'Unggah 1 berkas JPG, PNG, WEBP, atau PDF. Maksimal 10 MB.';

	let widget = $state<TurnstileWidget>();

	const kelasTerpilih = $derived(daftar.fields.kelasKode.value());
	const perluNik = $derived(
		data.kelasDibuka.some((kelas) => kelas.kode === kelasTerpilih && kelas.perluNik)
	);

	const issues = $derived(daftar.fields.allIssues() ?? []);
	// Field-level problems show next to their field; only form-level ones (path []) need the banner.
	const bannerMessages = $derived(issues.filter((issue) => issue.path.length === 0));
	const adaIsianBermasalah = $derived(issues.some((issue) => issue.path.length > 0));
</script>

<svelte:head>
	<title>Pendaftaran Kelas | Edutaxindo Praktika</title>
	<meta
		name="description"
		content="Formulir pendaftaran Brevet Pajak & Kursus Akuntansi Edutaxindo."
	/>
</svelte:head>

<ReUiRoot>
	<header class="site-bar">
		<a class="brand-lockup" href="/" aria-label="Edutaxindo Praktika, ke beranda">
			<img class="brand-logo" src="/brand/wsd-mark-inverse.svg" alt="" width="45" height="36" />
			<span class="brand-name">
				<strong>Edutaxindo Praktika</strong>
				<small>Layanan Administrasi Perpajakan</small>
			</span>
		</a>
	</header>

	<main class="page">
		<div class="intro">
			<p class="eyebrow">Pendaftaran</p>
			<h1>Brevet Pajak &amp; Kursus Akuntansi Edutaxindo</h1>
			<p class="lead">Mohon lengkapi data pendaftaran Anda.</p>
			<p class="required-note"><span aria-hidden="true">*</span> Wajib diisi</p>
		</div>

		{#if daftar.result?.nama}
			<InlineAlert
				tone="success"
				title="Pendaftaran berhasil"
				message={daftar.result.pakaiNik
					? `Terima kasih, ${daftar.result.nama}. Akun Anda sudah dibuat dengan NIK yang Anda isi sebagai NPWP. Admin akan mengirimkan password ke email yang Anda daftarkan.`
					: `Terima kasih, ${daftar.result.nama}. Akun Anda sudah dibuat. Admin akan mengirimkan NPWP dan password ke email yang Anda daftarkan.`}
			/>
		{:else if !bisaDaftar}
			<InlineAlert
				tone="warning"
				title="Pendaftaran belum dibuka"
				message="Pendaftaran online belum tersedia saat ini. Silakan coba lagi nanti atau hubungi admin."
			/>
		{:else}
			<form
				class="register-form"
				enctype="multipart/form-data"
				{...daftar.enhance(async ({ submit }) => {
					await submit();
					// The token was spent by this attempt, successful or not.
					widget?.reset();
				})}
			>
				<Stack gap="18px">
					<FormSection
						number="01"
						title="Data diri"
						description="Gunakan data sesuai KTP."
						bordered
					>
						<Stack gap="18px">
							<FormField
								label="Email"
								field={daftar.fields.email}
								type="email"
								autocomplete="email"
								placeholder="nama@contoh.com"
								required
							/>
							<FormField
								label="Nama"
								field={daftar.fields.nama}
								type="text"
								autocomplete="name"
								hint="Isikan nama Anda dengan gelar, jika ada."
								required
							/>
							<FieldGrid columns={2}>
								<FormField
									label="Tahun lahir"
									field={daftar.fields.tahunLahir}
									type="text"
									inputmode="numeric"
									maxlength={4}
									placeholder="1998"
									hint="Isi dengan 4 angka tahun lahir Anda. Contoh: 1998"
									required
								/>
								<FormField
									label="Nomor telepon/HP"
									field={daftar.fields.telepon}
									type="tel"
									inputmode="tel"
									autocomplete="tel"
									required
								/>
							</FieldGrid>
						</Stack>
					</FormSection>

					<FormSection number="02" title="Pendidikan dan pekerjaan" bordered>
						<Stack gap="18px">
							<FieldGrid columns={2}>
								<SelectField
									label="Pendidikan terakhir"
									field={daftar.fields.pendidikan}
									options={pendidikanOptions}
									required
								/>
								<FormField
									label="Bidang keilmuan Anda"
									field={daftar.fields.bidangKeilmuan}
									type="text"
									hint="Bidang keilmuan dari pendidikan terakhir, misalnya Akuntansi, Hukum, Rekayasa Perangkat Lunak. Boleh kosong."
								/>
							</FieldGrid>
							<FieldGrid columns={2}>
								<SelectField
									label="Pekerjaan saat ini"
									field={daftar.fields.pekerjaan}
									options={pekerjaanOptions}
									required
								/>
								<FormField
									label="Bidang usaha/industri"
									field={daftar.fields.bidangUsaha}
									type="text"
									hint="Bidang usaha/industri dari bisnis Anda atau tempat Anda bekerja, misalnya Retail, Pelayanan Kesehatan, Pertambangan. Boleh kosong."
								/>
							</FieldGrid>
						</Stack>
					</FormSection>

					<FormSection number="03" title="Alamat domisili" bordered>
						<Stack gap="18px">
							<TextAreaField
								label="Alamat domisili"
								field={daftar.fields.alamat}
								rows={3}
								hint="Tuliskan nama jalan, nomor rumah, RT/RW, desa/kelurahan, kecamatan."
								required
							/>
							<FieldGrid columns={2}>
								<FormField
									label="Kota/kabupaten tempat domisili"
									field={daftar.fields.kota}
									type="text"
									required
								/>
								<FormField
									label="Provinsi tempat domisili"
									field={daftar.fields.provinsi}
									type="text"
									required
								/>
							</FieldGrid>
						</Stack>
					</FormSection>

					<FormSection number="04" title="Pilihan kelas" bordered>
						<Stack gap="18px">
							<div class="jadwal">
								<p>
									<strong>Kelas Senin–Jumat:</strong> 3 kali seminggu pada hari yang disepakati
									bersama peserta, pukul 18.30–21.00 WIB; bukan setiap hari. Pilihan offline di
									Purwokerto atau online melalui Zoom.
								</p>
								<p>
									<strong>Kelas Sabtu–Minggu:</strong> pukul 09.00–16.00 WIB. Batch 20 berlangsung
									28 November–20 Desember 2026; pilihan offline di Tebet, Jakarta Selatan, atau
									online melalui Zoom pada jadwal yang sama.
								</p>
								<p>Pilih sesuai lokasi, jadwal, dan format kelas yang Anda daftarkan.</p>
							</div>
							<SelectField
								label="Pilihan Kelas"
								field={daftar.fields.kelasKode}
								options={kelasOptions}
								required
							/>
							{#if perluNik}
								<FormField
									label="NIK"
									field={daftar.fields.nik}
									type="text"
									inputmode="numeric"
									maxlength={16}
									placeholder="16 digit NIK sesuai KTP"
									hint="NIK Anda menjadi NPWP dan username untuk masuk ke aplikasi."
									required
								/>
							{/if}
						</Stack>
					</FormSection>

					<FormSection
						number="05"
						title="Berkas pendukung"
						description="Format yang didukung: JPG, PNG, WEBP, atau PDF. Total ukuran maksimal 30 MB."
						bordered
					>
						<Stack gap="18px">
							<FileUploadField
								label="Sertakan scan KTP"
								field={daftar.fields.ktp}
								accept={BERKAS_DITERIMA}
								hint={HINT_BANYAK}
								multiple
								required
							/>
							<FileUploadField
								label="Pas Foto Berwarna"
								field={daftar.fields.pasFoto}
								accept={BERKAS_DITERIMA_GAMBAR}
								hint="Unggah 1 berkas JPG, PNG, atau WEBP. Maksimal 10 MB."
							/>
							<FileUploadField
								label="Ijazah Terakhir (opsional)"
								field={daftar.fields.ijazah}
								accept={BERKAS_DITERIMA}
								hint={HINT_BANYAK}
								multiple
							/>
							<FileUploadField
								label="KTM (jika mahasiswa)"
								field={daftar.fields.ktm}
								accept={BERKAS_DITERIMA}
								hint={HINT_BANYAK}
								multiple
							/>
							<FileUploadField
								label="Bukti Pembayaran"
								field={daftar.fields.buktiPembayaran}
								accept={BERKAS_DITERIMA}
								hint={HINT_SATU}
								required
							/>
						</Stack>
					</FormSection>

					<div class="submit-panel">
						<div class="submit-body">
							{#each bannerMessages as issue}
								<InlineAlert tone="error" message={issue.message} />
							{/each}
							{#if adaIsianBermasalah}
								<InlineAlert
									tone="error"
									message="Beberapa isian belum benar. Periksa isian yang ditandai merah."
								/>
							{/if}
							<TurnstileWidget bind:this={widget} siteKey={data.turnstileSiteKey} action="daftar" />
						</div>
						<FormActions>
							<ActionButton type="button" tone="quiet" onclick={() => location.reload()}>
								Kosongkan formulir
							</ActionButton>
							<ActionButton
								type="submit"
								pending={daftar.pending > 0}
								pendingLabel="Mengirim..."
							>
								Kirim pendaftaran
							</ActionButton>
						</FormActions>
					</div>
				</Stack>
			</form>
		{/if}
	</main>
</ReUiRoot>

<style>
	.site-bar {
		padding: 14px clamp(16px, 4vw, 48px);
		border-bottom: 3px solid var(--ui-yellow);
		background: var(--ui-navy);
	}

	.brand-lockup {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: white;
		text-decoration: none;
	}

	.brand-logo {
		display: block;
		width: auto;
		height: 36px;
	}

	.brand-name {
		display: grid;
		line-height: 1.2;
	}

	.brand-name strong {
		font-family: var(--ui-font-display);
		font-size: 18px;
		font-weight: 600;
	}

	.brand-name small {
		color: rgba(255, 255, 255, 0.72);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.page {
		width: min(860px, calc(100% - 32px));
		margin: 0 auto;
		padding: 36px 0 72px;
	}

	.intro {
		margin-bottom: 24px;
	}

	.eyebrow {
		margin: 0 0 6px;
		color: var(--ui-yellow-deep);
		font-size: 11px;
		font-weight: 900;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: clamp(26px, 4vw, 36px);
		font-weight: 600;
		line-height: 1.2;
	}

	.lead {
		margin: 10px 0 0;
		color: var(--ui-muted);
	}

	.required-note {
		margin: 8px 0 0;
		color: var(--ui-muted);
		font-size: 13px;
	}

	.required-note span {
		color: var(--ui-danger);
		font-weight: 800;
	}

	.jadwal {
		padding: 12px 14px;
		border-left: 3px solid var(--ui-yellow);
		background: var(--ui-yellow-soft);
		color: var(--ui-ink);
		font-size: 14px;
	}

	.jadwal p {
		margin: 0;
	}

	.jadwal p + p {
		margin-top: 8px;
	}

	.submit-panel {
		display: grid;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
	}

	.submit-body {
		display: grid;
		gap: 12px;
		padding: 16px 20px;
	}
</style>
