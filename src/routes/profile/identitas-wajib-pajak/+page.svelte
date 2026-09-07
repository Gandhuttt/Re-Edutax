<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const identityChanges = [
		'Nama Wajib Pajak',
		'Nomor Identitas',
		'Tempat dan Tanggal Lahir',
		'Status Perkawinan',
		'Kewarganegaraan',
		'Nomor Telepon dan Email'
	];
</script>

<svelte:head><title>Perubahan Identitas Wajib Pajak</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Perubahan Identitas Wajib Pajak</h1></header>
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
					<label>Jenis Wajib Pajak<input placeholder="Jenis Wajib Pajak" disabled /></label>
					<label>Status Wajib Pajak<input placeholder="Status terdaftar" disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Data yang Akan Diubah</legend>
				<p class="hint">Pilih data identitas yang menjadi bagian dari permohonan perubahan.</p>
				<div class="choice-grid">
					{#each identityChanges as item}
						<label class="check-row"><input type="checkbox" /> {item}</label>
					{/each}
				</div>
			</fieldset>

			<fieldset>
				<legend>Identitas Baru</legend>
				<div class="form-grid">
					<label>Nama Lengkap / Nama Badan *<input required placeholder="Masukkan nama sesuai dokumen" /></label>
					<label>Jenis Identitas *
						<select required><option value="">Silakan Pilih</option><option>NIK</option><option>Paspor</option><option>Nomor Identitas Lain</option></select>
					</label>
					<label>Nomor Identitas *<input required inputmode="numeric" /></label>
					<label>Nomor Kartu Keluarga<input inputmode="numeric" /></label>
					<label>Tempat Lahir / Tempat Pendirian<input /></label>
					<label>Tanggal Lahir / Tanggal Pendirian<input type="date" /></label>
					<label>Jenis Kelamin<select><option value="">Silakan Pilih</option><option>Laki-laki</option><option>Perempuan</option></select></label>
					<label>Status Perkawinan<select><option value="">Silakan Pilih</option><option>Belum Kawin</option><option>Kawin</option><option>Cerai</option></select></label>
					<label>Kewarganegaraan *<select required><option value="">Silakan Pilih</option><option>Indonesia</option><option>Asing</option></select></label>
					<label>Negara Asal<select><option value="">Silakan Pilih</option><option>Indonesia</option><option>Negara Lain</option></select></label>
					<label>Nomor Telepon<input type="tel" placeholder="Contoh: 081234567890" /></label>
					<label>Alamat Email<input type="email" placeholder="nama@contoh.id" /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Dokumen Pendukung</legend>
				<div class="upload-grid">
					<label>Dokumen Identitas *<input type="file" required accept=".pdf,.jpg,.jpeg,.png" /></label>
					<label>Dokumen Pendukung Perubahan<input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label>
				</div>
				<p class="hint">Format berkas PDF, JPG, JPEG, atau PNG.</p>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai ketentuan peraturan perundang-undangan, saya menyatakan bahwa data yang saya sampaikan adalah benar dan lengkap.</label>
			</fieldset>

			{#if saved}<p class="success" role="status">Permohonan perubahan identitas telah disimpan.</p>{/if}
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
	.choice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .25rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	input, select { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	input:disabled, select:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: .75rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	.hint { margin: 0 0 .75rem; color: #52525b; font-size: .9rem; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.success { padding: .75rem; border: 1px solid #15803d; background: #dcfce7; color: #166534; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid, .upload-grid, .choice-grid { grid-template-columns: 1fr; } }
</style>
