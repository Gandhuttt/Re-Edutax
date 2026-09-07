<script lang="ts">
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);
	const today = new Intl.DateTimeFormat('en-CA').format(new Date());
</script>

<svelte:head><title>Penghapusan dan Pencabutan</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>Penghapusan NPWP dan/atau Pencabutan Pengukuhan PKP/SKT PBB P5L</h1></header>
		<form class="card-body" onsubmit={(event) => { event.preventDefault(); saved = true; }}>
			<fieldset>
				<legend>Manajemen Kasus</legend>
				<div class="form-grid">
					<label>Kanal *<input value="Daring (Portal Wajib Pajak)" disabled /></label>
					<label>Tanggal Permohonan<input type="date" value={today} disabled /></label>
					<label>Jenis Pembatalan *
						<select required>
							<option value="">Silakan Pilih</option>
							<option>Penghapusan NPWP</option>
							<option>Pencabutan Pengukuhan PKP</option>
							<option>Pencabutan SKT PBB P5L</option>
							<option>Penghapusan NPWP dan Pencabutan Pengukuhan PKP</option>
						</select>
					</label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Kuasa Wajib Pajak</legend>
				<label class="check-row"><input type="checkbox" bind:checked={represented} /> Diisi oleh perwakilan Wajib Pajak?</label>
				<div class="form-grid">
					<label>ID Penunjukan Wakil Wajib Pajak {represented ? '*' : ''}<input required={represented} disabled={!represented} /></label>
					<label>NIK/NPWP Perwakilan {represented ? '*' : ''}<input disabled /></label>
					<label>Nama Wakil/Kuasa {represented ? '*' : ''}<input disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Identitas Wajib Pajak</legend>
				<div class="form-grid">
					<label>NIK/TIN *<input placeholder="NIK/NPWP Wajib Pajak" disabled /></label>
					<label>Nama Wajib Pajak<input disabled /></label>
					<label class="full">Alamat<textarea rows="3" disabled></textarea></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Penghapusan NPWP dan/atau Pencabutan Pengukuhan PKP/SKT PBB P5L</legend>
				<p>Pastikan dokumen yang diunggah telah memenuhi persyaratan permohonan.</p>
				<label>Unggah File *<input type="file" required /></label>
			</fieldset>

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration"><input type="checkbox" bind:checked={agreed} required /> Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang saya sampaikan di atas adalah benar dan lengkap, dan saya menyetujui untuk menggunakan Akun Wajib Pajak saya sebagai sarana penerimaan surat dan dokumen perpajakan.</label>
			</fieldset>

			{#if saved}<p class="success" role="status">Data permohonan telah disimpan.</p>{/if}
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
	.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, textarea:disabled { background: var(--color-disabled); }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: 1rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { line-height: 1.5; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.success { padding: .75rem; border: 1px solid #15803d; background: #dcfce7; color: #166534; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid { grid-template-columns: 1fr; } }
</style>
