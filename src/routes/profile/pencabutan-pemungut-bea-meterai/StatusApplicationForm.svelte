<script lang="ts">
	export type FormField = {
		name: string;
		label: string;
		type?: 'text' | 'date' | 'number' | 'email' | 'select' | 'textarea' | 'file';
		placeholder?: string;
		options?: string[];
		required?: boolean;
		full?: boolean;
		help?: string;
		accept?: string;
	};

	export type FormSection = {
		title: string;
		description?: string;
		fields: FormField[];
	};

	export type StatusFormConfig = {
		title: string;
		intro: string;
		sections: FormSection[];
	};

	let { config }: { config: StatusFormConfig } = $props();
	let represented = $state(false);
	let agreed = $state(false);
	let saved = $state(false);

	const today = new Intl.DateTimeFormat('en-CA').format(new Date());

	function save(event: SubmitEvent) {
		event.preventDefault();
		saved = true;
	}
</script>

<svelte:head><title>{config.title}</title></svelte:head>

<div class="page-shell">
	<section class="card">
		<header class="card-header"><h1>{config.title}</h1></header>
		<form
			class="card-body"
			onsubmit={save}
			oninput={() => {
				saved = false;
			}}
		>
			<p class="intro">{config.intro}</p>

			<fieldset>
				<legend>Manajemen Kasus</legend>
				<div class="form-grid">
					<label>Kanal *<input value="Daring (Portal Wajib Pajak)" disabled /></label>
					<label>Tanggal Permohonan<input type="date" value={today} disabled /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Kuasa Wajib Pajak</legend>
				<label class="check-row">
					<input type="checkbox" bind:checked={represented} /> Diisi oleh wakil atau kuasa Wajib Pajak?
				</label>
				<div class="form-grid">
					<label>
						ID Penunjukan Wakil/Kuasa{represented ? ' *' : ''}
						<input name="representative-id" required={represented} disabled={!represented} placeholder="Masukkan ID penunjukan" />
					</label>
					<label>NIK/NPWP Wakil/Kuasa<input disabled placeholder="Terisi setelah ID diverifikasi" /></label>
					<label>Nama Wakil/Kuasa<input disabled placeholder="Terisi setelah ID diverifikasi" /></label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Identitas Wajib Pajak</legend>
				<div class="form-grid">
					<label>NIK/NPWP *<input disabled placeholder="Sesuai akun Wajib Pajak" /></label>
					<label>Nama Wajib Pajak<input disabled placeholder="Sesuai akun Wajib Pajak" /></label>
					<label class="full">Alamat Terdaftar<textarea rows="2" disabled placeholder="Sesuai profil Wajib Pajak"></textarea></label>
				</div>
			</fieldset>

			{#each config.sections as section}
				<fieldset>
					<legend>{section.title}</legend>
					{#if section.description}<p class="section-description">{section.description}</p>{/if}
					<div class="form-grid">
						{#each section.fields as field}
							<label class:full={field.full || field.type === 'textarea' || field.type === 'file'}>
								<span>{field.label}{field.required ? ' *' : ''}</span>
								{#if field.type === 'select'}
									<select name={field.name} required={field.required ?? false}>
										<option value="">Silakan Pilih</option>
										{#each field.options ?? [] as option}<option value={option}>{option}</option>{/each}
									</select>
								{:else if field.type === 'textarea'}
									<textarea name={field.name} rows="3" placeholder={field.placeholder} required={field.required ?? false}></textarea>
								{:else if field.type === 'file'}
									<input name={field.name} type="file" accept={field.accept} required={field.required ?? false} />
								{:else}
									<input
										name={field.name}
										type={field.type ?? 'text'}
										placeholder={field.placeholder}
										required={field.required ?? false}
										min={field.type === 'number' ? '0' : undefined}
									/>
								{/if}
								{#if field.help}<small>{field.help}</small>{/if}
							</label>
						{/each}
					</div>
				</fieldset>
			{/each}

			<fieldset>
				<legend>Pernyataan Wajib Pajak</legend>
				<label class="check-row declaration">
					<input type="checkbox" bind:checked={agreed} required />
					<span>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi sesuai ketentuan yang berlaku, saya menyatakan bahwa data dan dokumen yang disampaikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.</span>
				</label>
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
	.intro { margin: 0 0 1.25rem; line-height: 1.5; }
	fieldset { margin: 0 0 1.25rem; padding: 1rem; border: 1px solid #a9a9a9; }
	legend { width: auto; margin: 0; padding: 0 .5rem; font-size: 1.1rem; font-weight: 700; }
	.section-description { margin: 0 0 1rem; color: #4b5563; }
	.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem 1.5rem; }
	label { display: flex; flex-direction: column; gap: .35rem; font-weight: 700; }
	label.full { grid-column: 1 / -1; }
	input, select, textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--color-input-secondary); border-radius: 5px; background: var(--color-input-primary); padding: .5rem; font: inherit; font-weight: 400; }
	textarea { resize: vertical; }
	input:disabled, textarea:disabled { background: var(--color-disabled); }
	input:focus, select:focus, textarea:focus { outline: 2px solid color-mix(in srgb, var(--color-primary) 45%, transparent); outline-offset: 1px; }
	.check-row { flex-direction: row; align-items: flex-start; margin-bottom: 1rem; font-weight: 400; }
	.check-row input { width: 1.25rem; min-height: 1.25rem; flex: 0 0 auto; }
	.declaration { margin: 0; line-height: 1.5; }
	small { color: #4b5563; font-weight: 400; line-height: 1.35; }
	.actions { display: flex; justify-content: flex-end; }
	button { min-width: 6rem; padding: .5rem .9rem; border: 0; border-radius: 5px; background: var(--color-primary); color: var(--color-text); }
	button:disabled { filter: grayscale(.7); opacity: .6; }
	.success { margin: 0 0 1rem; padding: .75rem; border: 1px solid #15803d; background: #dcfce7; color: #166534; }
	@media (max-width: 720px) { .page-shell { padding: 2rem; } .form-grid { grid-template-columns: 1fr; } label.full { grid-column: auto; } }
</style>
