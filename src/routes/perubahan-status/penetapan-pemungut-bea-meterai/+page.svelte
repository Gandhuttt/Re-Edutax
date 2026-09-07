<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	let error = $state('');

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const documentTypes = ['Dokumen perjanjian atau surat lainnya', 'Dokumen transaksi surat berharga', 'Dokumen lelang', 'Dokumen transaksi keuangan', 'Dokumen lainnya'];

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		if (!form.checkValidity() || !agreed) {
			error = 'Lengkapi seluruh data dan pernyataan yang wajib diisi.';
			saved = false;
			form.reportValidity();
			return;
		}
		error = '';
		saved = true;
	}
</script>

<svelte:head><title>Penetapan Pemungut Bea Meterai</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Penetapan Pemungut Bea Meterai</h1></header>
		<form class="card-body" onsubmit={submit} oninput={() => { saved = false; error = ''; }} novalidate>
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
					<label>ID Penunjukan Wakil Wajib Pajak {represented ? '*' : ''}<input required={represented} disabled={!represented} /></label>
					<label>NIK/NPWP Perwakilan<input disabled /></label>
					<label>Nama Wakil/Kuasa<input disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Identitas Wajib Pajak</legend>
				<div class="form-grid">
					<label>NIK/TIN *<input placeholder="NIK/NPWP Wajib Pajak" disabled /></label>
					<label>Nama Wajib Pajak<input disabled /></label>
					<label>Nomor Induk Berusaha<input inputmode="numeric" /></label>
					<label class="full">Alamat<textarea rows="2" disabled></textarea></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Data Pemungut Bea Meterai</legend>
				<div class="form-grid">
					<label>Nama Unit atau Tempat Kegiatan Usaha *<input required /></label>
					<label>Tanggal Mulai Pemungutan *<input type="date" required /></label>
					<label>Jenis Dokumen Terutang Bea Meterai *<select required><option value="">Silakan Pilih</option>{#each documentTypes as type}<option>{type}</option>{/each}</select></label>
					<label>Perkiraan Jumlah Dokumen per Bulan *<input type="number" min="1" step="1" required /></label>
					<label>Mekanisme Pembuatan Dokumen *
						<select required><option value="">Silakan Pilih</option><option>Dokumen Kertas</option><option>Dokumen Elektronik</option><option>Kertas dan Elektronik</option></select>
					</label>
					<label>Lokasi Pemungutan *<input required /></label>
					<label class="full">Uraian Kegiatan Usaha *<textarea rows="3" maxlength="1000" required></textarea></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Penanggung Jawab</legend>
				<div class="form-grid">
					<label>Nama Lengkap *<input required /></label>
					<label>Jabatan *<input required /></label>
					<label>Nomor Telepon *<input type="tel" inputmode="tel" required /></label>
					<label>Alamat Email *<input type="email" required /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Dokumen Persyaratan</legend>
				<div class="upload-grid">
					<label>Surat Permohonan Penetapan *<input type="file" accept=".pdf" required /></label>
					<label>Daftar Jenis Dokumen *<input type="file" accept=".pdf,.xls,.xlsx" required /></label>
				</div>
				<small>Unggah dokumen yang jelas dan dapat dibaca.</small>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Saya menyatakan bahwa seluruh informasi dan dokumen yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.</label>
			</fieldset>

			{#if error}<p class="message error" role="alert">{error}</p>{/if}
			{#if saved}<p class="message success" role="status">Permohonan penetapan pemungut Bea Meterai telah disimpan.</p>{/if}
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
	fieldset { margin: 0 0 1.25rem; padding: 1rem; border: 1px solid #a9a9a9; }
	legend { width: auto; margin: 0; padding: 0 .5rem; font-size: 1.15rem; font-weight: 700; }
	.form-grid, .upload-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, select:disabled, textarea:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: 1rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	small { display: block; margin-top: .35rem; color: #5f6368; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.message { padding: .75rem; border: 1px solid; }
	.success { border-color: #15803d; background: #dcfce7; color: #166534; }
	.error { border-color: #b91c1c; background: #fee2e2; color: #991b1b; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid, .upload-grid { grid-template-columns: 1fr; } label.full { grid-column: auto; } }
</style>
