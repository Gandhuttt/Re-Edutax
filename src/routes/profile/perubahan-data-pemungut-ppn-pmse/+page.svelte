<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const changeTypes = ['Identitas Pemungut', 'Alamat dan Negara', 'Kontak', 'Situs/Aplikasi', 'Rekening Pembayaran'];
</script>

<svelte:head><title>Perubahan Data Pemungut PPN PMSE</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Perubahan Data Pemungut PPN PMSE dengan Kepdirjen</h1></header>
		<form class="card-body" onsubmit={(event) => { event.preventDefault(); saved = true; }}>
			<fieldset>
				<legend>Manajemen Kasus</legend>
				<div class="form-grid">
					<label>Kanal *<input value="Daring (Portal Wajib Pajak)" disabled /></label>
					<label>Tanggal Permohonan<input type="date" value={today} disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Kuasa Wajib Pajak</legend>
				<label class="check-row"><input type="checkbox" bind:checked={represented} /> Diisi oleh perwakilan Wajib Pajak?</label>
				<div class="form-grid">
					<label>ID Penunjukan Wakil Wajib Pajak<input placeholder="Masukkan ID penunjukan" /></label>
					<label>NIK/NPWP Perwakilan<input placeholder="Masukkan NIK/NPWP" /></label>
					<label>Nama Wakil/Kuasa<input placeholder="Nama akan ditampilkan setelah verifikasi" disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Identitas Wajib Pajak</legend>
				<div class="form-grid">
					<label>NIK/TIN *<input placeholder="NIK/NPWP Wajib Pajak" disabled /></label>
					<label>Nama Wajib Pajak<input placeholder="Nama terdaftar" disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Data Penunjukan Pemungut PPN PMSE</legend>
				<div class="form-grid">
					<label>Nomor Kepdirjen<input placeholder="Nomor keputusan penunjukan" disabled /></label>
					<label>Tanggal Penunjukan<input type="date" disabled /></label>
					<label>Status Penunjukan<input placeholder="Status pemungut" disabled /></label>
					<label>ID Pemungut PPN PMSE<input placeholder="ID terdaftar" disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Jenis Perubahan</legend>
				<div class="choice-grid">
					{#each changeTypes as item}
						<label class="check-row"><input type="checkbox" /> {item}</label>
					{/each}
				</div>
			</fieldset>

			<fieldset>
				<legend>Data Pemungut PPN PMSE Baru</legend>
				<div class="form-grid">
					<label>Nama Badan Usaha *<input required /></label>
					<label>Nama Dagang / Merek<input /></label>
					<label>Nomor Identitas Pajak Negara Asal *<input required /></label>
					<label>Negara Asal *<select required><option value="">Silakan Pilih</option><option>Singapura</option><option>Malaysia</option><option>Negara Lain</option></select></label>
					<label class="full">Alamat Kantor Pusat *<textarea rows="3" required></textarea></label>
					<label>Kota<input /></label>
					<label>Kode Pos<input /></label>
					<label>Nomor Telepon *<input type="tel" required /></label>
					<label>Alamat Email *<input type="email" required /></label>
					<label>Nama Narahubung *<input required /></label>
					<label>Email Narahubung *<input type="email" required /></label>
					<label>Situs Web Utama *<input type="url" required placeholder="https://contoh.com" /></label>
					<label>Nama Aplikasi / Platform<input /></label>
					<label>Nama Bank / Penyelenggara Pembayaran<input /></label>
					<label>Nomor Rekening Pembayaran<input /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Dokumen Pendukung</legend>
				<div class="upload-grid">
					<label>Surat Permohonan Perubahan *<input type="file" required accept=".pdf,.jpg,.jpeg,.png" /></label>
					<label>Dokumen Legalitas Badan Usaha *<input type="file" required accept=".pdf,.jpg,.jpeg,.png" /></label>
					<label>Dokumen Pendukung Perubahan<input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label>
				</div>
				<p class="hint">Format berkas PDF, JPG, JPEG, atau PNG.</p>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Saya menyatakan bahwa data dan dokumen perubahan Pemungut PPN PMSE yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.</label>
			</fieldset>

			{#if saved}<p class="success" role="status">Permohonan perubahan data Pemungut PPN PMSE telah disimpan.</p>{/if}
			<div class="actions"><button type="submit" disabled={!agreed}>Simpan</button></div>
		</form>
	</section>
</div>

<style>
	.page-shell { width: 100%; padding: 6.25rem; color: var(--color-text); }
	.card { overflow: hidden; border: 1px solid #a9a9a9; border-radius: 2px; background: #f3f4f6; }
	.card-header { min-height: 4.25rem; display: flex; align-items: center; padding: .5rem .75rem; border-bottom: 1px solid #a9a9a9; background: #e5e7eb; }
	h1 { margin: 0; font-size: 1.5rem; font-weight: 400; }
	.card-body { padding: .75rem; }
	fieldset { margin: 0 0 1.5rem; padding: 1rem; border: 1px solid #a9a9a9; }
	legend { width: auto; margin: 0; padding: 0 .5rem; font-size: 1.15rem; font-weight: 700; }
	.form-grid, .upload-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.5rem; }
	.choice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .25rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, select:disabled, textarea:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: .75rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	.hint { margin: .75rem 0 0; color: #52525b; font-size: .9rem; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.success { padding: .75rem; border: 1px solid #15803d; background: #dcfce7; color: #166534; }
	@media (max-width: 840px) { .choice-grid { grid-template-columns: 1fr 1fr; } }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid, .upload-grid, .choice-grid { grid-template-columns: 1fr; } label.full { grid-column: auto; } }
</style>
