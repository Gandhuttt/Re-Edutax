<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	let error = $state('');

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
	const reasons = [
		'Kembali melakukan kegiatan usaha atau pekerjaan bebas',
		'Kembali memenuhi persyaratan subjektif dan/atau objektif',
		'Kembali tinggal atau berada di Indonesia',
		'Alasan lainnya'
	];

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

<svelte:head><title>Pengaktifan Kembali Wajib Pajak Nonaktif</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Pengaktifan Kembali Wajib Pajak Nonaktif</h1></header>
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
					<label>Status Saat Ini<input value="Nonaktif" disabled /></label>
					<label class="full">Alamat<textarea rows="2" disabled></textarea></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Data Pengaktifan Kembali</legend>
				<div class="form-grid">
					<label>Alasan Pengaktifan Kembali *
						<select required><option value="">Silakan Pilih</option>{#each reasons as reason}<option>{reason}</option>{/each}</select>
					</label>
					<label>Tanggal Mulai Aktif yang Diajukan *<input type="date" required /></label>
					<label class="full">Penjelasan Alasan *<textarea rows="4" maxlength="1000" required placeholder="Jelaskan alasan pengaktifan kembali"></textarea></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Dokumen Persyaratan</legend>
				<p>Unggah dokumen yang menunjukkan bahwa persyaratan sebagai Wajib Pajak aktif telah terpenuhi kembali.</p>
				<label>Dokumen Pendukung *<input type="file" accept=".pdf,.jpg,.jpeg,.png" required /></label>
				<small>Format PDF, JPG, JPEG, atau PNG.</small>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Dengan menyadari sepenuhnya segala akibat termasuk sanksi sesuai ketentuan yang berlaku, saya menyatakan bahwa data dan dokumen yang disampaikan adalah benar dan lengkap.</label>
			</fieldset>

			{#if error}<p class="message error" role="alert">{error}</p>{/if}
			{#if saved}<p class="message success" role="status">Permohonan pengaktifan kembali telah disimpan.</p>{/if}
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
	.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, select:disabled, textarea:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: 1rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	p { margin: 0 0 .75rem; }
	small { display: block; margin-top: .35rem; color: #5f6368; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.message { padding: .75rem; border: 1px solid; }
	.success { border-color: #15803d; background: #dcfce7; color: #166534; }
	.error { border-color: #b91c1c; background: #fee2e2; color: #991b1b; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid { grid-template-columns: 1fr; } label.full { grid-column: auto; } }
</style>
