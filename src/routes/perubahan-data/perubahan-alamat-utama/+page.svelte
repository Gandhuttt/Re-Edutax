<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const addressTypes = ['Tempat Tinggal', 'Tempat Kedudukan', 'Tempat Kegiatan Usaha'];
</script>

<svelte:head><title>Perubahan Alamat Utama</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Perubahan Alamat Utama</h1></header>
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
				<legend>Alamat Utama Saat Ini</legend>
				<div class="form-grid">
					<label>Jenis Alamat<input value="Alamat Utama" disabled /></label>
					<label>Kode KPP<input placeholder="KPP terdaftar" disabled /></label>
					<label class="full">Detail Alamat<textarea rows="3" placeholder="Alamat terdaftar" disabled></textarea></label>
					<label>Provinsi<input disabled /></label><label>Kabupaten/Kota<input disabled /></label>
					<label>Kecamatan<input disabled /></label><label>Kelurahan/Desa<input disabled /></label>
					<label>RT/RW<input disabled /></label><label>Kode Pos<input disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Alamat Utama Baru</legend>
				<div class="form-grid">
					<label>Jenis Alamat *<select required><option value="">Silakan Pilih</option>{#each addressTypes as type}<option>{type}</option>{/each}</select></label>
					<label>Nama Jalan / Blok *<input required /></label>
					<label class="full">Detail Alamat *<textarea rows="3" required placeholder="Nama gedung, nomor rumah, dan keterangan alamat"></textarea></label>
					<label>Provinsi *<select required><option value="">Silakan Pilih</option><option>DKI Jakarta</option><option>Jawa Barat</option><option>Provinsi Lain</option></select></label>
					<label>Kabupaten/Kota *<select required><option value="">Silakan Pilih</option></select></label>
					<label>Kecamatan *<select required><option value="">Silakan Pilih</option></select></label>
					<label>Kelurahan/Desa *<select required><option value="">Silakan Pilih</option></select></label>
					<label>RT<input inputmode="numeric" maxlength="3" placeholder="000" /></label>
					<label>RW<input inputmode="numeric" maxlength="3" placeholder="000" /></label>
					<label>Kode Pos *<input required inputmode="numeric" maxlength="5" /></label>
					<label>Nomor Telepon<input type="tel" /></label>
					<label>Data Geometri<input placeholder="Diisi setelah alamat ditandai" disabled /></label>
					<div class="field-action"><button type="button" class="secondary">Tandai Alamat</button></div>
				</div>
			</fieldset>

			<fieldset>
				<legend>Dokumen Pendukung</legend>
				<div class="upload-grid">
					<label>Bukti Kepemilikan/Penguasaan Tempat *<input type="file" required accept=".pdf,.jpg,.jpeg,.png" /></label>
					<label>Dokumen Pendukung Lainnya<input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label>
				</div>
				<p class="hint">Format berkas PDF, JPG, JPEG, atau PNG.</p>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Saya menyatakan bahwa alamat dan dokumen yang saya sampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan sesuai ketentuan yang berlaku.</label>
			</fieldset>

			{#if saved}<p class="success" role="status">Permohonan perubahan alamat utama telah disimpan.</p>{/if}
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
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, select:disabled, textarea:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: .75rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	.field-action { display: flex; align-items: flex-end; }
	.hint { margin: .75rem 0 0; color: #52525b; font-size: .9rem; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button.secondary { border: 1px solid #a9a9a9; background: #e5e7eb; }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.success { padding: .75rem; border: 1px solid #15803d; background: #dcfce7; color: #166534; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid, .upload-grid { grid-template-columns: 1fr; } label.full { grid-column: auto; } }
</style>
