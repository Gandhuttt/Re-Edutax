<script lang="ts">
	let enabled = $state(false);
	let setupOpen = $state(false);
	let method = $state('Aplikasi autentikator');
	let verificationCode = $state('');
	let notice = $state('');

	function beginSetup() {
		setupOpen = true;
		notice = '';
	}

	function activate() {
		if (!/^\d{6}$/.test(verificationCode)) {
			notice = 'Masukkan kode simulasi 6 digit untuk melanjutkan.';
			return;
		}
		enabled = true;
		setupOpen = false;
		verificationCode = '';
		notice = 'Verifikasi dua langkah berhasil diaktifkan untuk tampilan demo.';
	}

	function disable() {
		enabled = false;
		notice = 'Verifikasi dua langkah dinonaktifkan untuk tampilan demo.';
	}
</script>

<svelte:head><title>Verifikasi Dua Langkah</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><div><h1>Verifikasi Dua Langkah</h1><p>Tambahkan lapisan verifikasi saat masuk ke akun.</p></div></header>
		<div class="card-body">
			{#if notice}<div class="notice" role="status">{notice}</div>{/if}
			<div class="status-card">
				<div><span class="eyebrow">STATUS KEAMANAN</span><h2>{enabled ? 'Aktif' : 'Belum aktif'}</h2><p>{enabled ? `Metode utama: ${method}` : 'Akun ini masih menggunakan kata sandi sebagai satu-satunya langkah masuk.'}</p></div>
				<span class:enabled class="status-badge">{enabled ? 'Aktif' : 'Tidak aktif'}</span>
			</div>

			<div class="settings">
				<div><h2>Metode verifikasi</h2><p>Pilih metode yang akan digunakan setelah memasukkan kata sandi.</p></div>
				<label for="method">Metode<select id="method" bind:value={method} disabled={enabled}><option>Aplikasi autentikator</option><option>Email terdaftar</option></select></label>
			</div>

			{#if setupOpen && !enabled}
				<section class="setup-panel">
					<h2>Siapkan {method}</h2>
					<ol>
						<li>Buka aplikasi atau kotak masuk sesuai metode yang dipilih.</li>
						<li>Gunakan petunjuk simulasi ini untuk menghubungkan akun. Tidak ada secret atau QR autentikasi sungguhan yang ditampilkan.</li>
						<li>Masukkan kode simulasi 6 digit untuk mengonfirmasi konfigurasi.</li>
					</ol>
					<label for="verification-code">Kode verifikasi<input id="verification-code" bind:value={verificationCode} inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" /></label>
					<div class="setup-actions"><button type="button" onclick={() => { setupOpen = false; verificationCode = ''; notice = ''; }}>Batal</button><button class="primary" type="button" onclick={activate}>Aktifkan</button></div>
				</section>
			{/if}

			<div class="actions">
				{#if enabled}<button class="danger" type="button" onclick={disable}>Nonaktifkan</button><button type="button" onclick={() => (notice = 'Kode pemulihan demo diperbarui. Tidak ada kode sungguhan yang dibuat.')}>Perbarui Kode Pemulihan</button>
				{:else if !setupOpen}<button class="primary" type="button" onclick={beginSetup}>Atur Verifikasi Dua Langkah</button>{/if}
			</div>

			<div class="help"><h2>Sebelum mengaktifkan</h2><p>Pastikan email dan nomor telepon pada profil tetap dapat diakses. Simpan kode pemulihan di tempat yang aman setelah aktivasi pada sistem produksi.</p></div>
		</div>
	</section>
</div>

<style>
	.page-shell { width: 100%; min-height: calc(100vh - 3rem); padding: 6.25rem; color: var(--color-text); } .card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .65rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; } h1 { margin: 0; font-size: 1.5rem; font-weight: 400; } .card-header p, p { margin: .25rem 0 0; color: #4b5563; }
	.card-body { min-height: 25rem; padding: 1rem; } .notice { margin-bottom: 1rem; padding: .7rem .8rem; border: 1px solid #8d8d8d; background: #e5e7eb; }
	.status-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid #b3b3b3; background: #e5e7eb; } .eyebrow { color: #555; font-size: .75rem; font-weight: 700; letter-spacing: .06em; } h2 { margin: .2rem 0; font-size: 1.05rem; font-weight: 600; }
	.status-badge { flex: 0 0 auto; padding: .3rem .65rem; border: 1px solid #777; border-radius: 1rem; background: #d1d5db; font-size: .8rem; } .status-badge.enabled { background: #cfd8d0; }
	.settings { display: grid; grid-template-columns: 1fr minmax(15rem, 22rem); gap: 2rem; align-items: end; padding: 1.25rem 0; border-bottom: 1px solid #c8c8c8; } label { display: flex; flex-direction: column; gap: .35rem; font-size: .84rem; font-weight: 700; }
	input, select { width: 100%; height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .45rem .55rem; color: var(--color-text); } select:disabled { opacity: .7; }
	.setup-panel { margin-top: 1rem; padding: 1rem; border: 1px solid #aaa; background: #e9eaec; } ol { margin: .75rem 0 1rem; padding-left: 1.25rem; color: #374151; } li + li { margin-top: .45rem; } .setup-panel label { max-width: 20rem; }
	button { min-height: 2.5rem; padding: .45rem .75rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); } button:hover { filter: brightness(.95); } button.primary { background: var(--color-secondary); color: #fff; } button.danger { border: 1px solid #777; background: transparent; }
	.setup-actions, .actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1rem; } .help { margin-top: 1.5rem; padding: 1rem; border-left: 3px solid #808080; background: #e5e7eb; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .status-card { align-items: flex-start; } .settings { grid-template-columns: 1fr; gap: 1rem; } .actions, .setup-actions { justify-content: flex-start; flex-wrap: wrap; } }
</style>
