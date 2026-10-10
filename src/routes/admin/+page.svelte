<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		ResponsiveGrid,
		SelectField,
		Stack,
		StatusBadge,
		SummaryStrip,
		TableActions,
		TextAreaField,
	} from '$lib/re-ui-components';
	import { createBatch } from './createBatch.remote';
	import { createPeserta } from './createPeserta.remote';
	import { createPesertaBatch } from './createPesertaBatch.remote';
	import { listBatch } from './listBatch.remote';
	import { listPeserta } from './listPeserta.remote';
	import { resetPesertaPassword } from './resetPesertaPassword.remote';
	import { setPesertaBanned } from './setPesertaBanned.remote';
	import { updateBatch } from './updateBatch.remote';

	const daftarBatch = $derived(await listBatch());
	const peserta = $derived(await listPeserta());

	let batchDipilih = $state('');
	let batchMassal = $state('');
	const batchAktif = $derived(daftarBatch.batches.find((batch) => batch.id === batchDipilih));
	const npwpBerikutnya = $derived(
		batchAktif ? batchAktif.npwpBerikutnya : daftarBatch.npwpLoneBerikutnya,
	);
	const emailBerikutnya = $derived(
		batchAktif && batchAktif.urutBerikutnya
			? batchAktif.polaEmail.replaceAll('{n}', String(batchAktif.urutBerikutnya))
			: '',
	);
	const nomorBatchBaru = $derived(daftarBatch.nomorBatchBerikutnya);
	const pesertaAktif = $derived(peserta.filter((item) => !item.banned).length);
	const batchOptions = $derived([
		{ value: '', label: 'Tanpa batch' },
		...daftarBatch.batches.map((batch) => ({
			value: batch.id,
			label: `${batch.nama} (${batch.jumlahAnggota} peserta)`,
		})),
	]);

	function submitForm(id: string) {
		const form = document.getElementById(id);
		if (form instanceof HTMLFormElement) form.requestSubmit();
	}
</script>

<svelte:head>
	<title>Dasbor Administrator | Edutaxindo Praktika</title>
</svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="18px">
		<Breadcrumbs items={[{ label: 'Administrasi' }]} />
		<PageHeading
			eyebrow="Administrasi sistem"
			title="Dasbor Administrator"
			description="Kelola akun peserta, alokasi NPWP, dan konfigurasi batch pelatihan."
		/>

		<SummaryStrip
			columns={3}
			items={[
				{ label: 'Seluruh peserta', value: peserta.length },
				{ label: 'Peserta aktif', value: pesertaAktif },
				{ label: 'Batch tersedia', value: daftarBatch.batches.length },
			]}
		/>

		<div class="creation-grid">
			<FormSection
				title="Tambah Peserta"
				description="Buat satu akun peserta dengan NPWP otomatis atau nomor yang ditentukan."
				bordered
			>
				<form {...createPeserta} class="form-stack">
					<SelectField
						label="Batch"
						name="batchId"
						bind:value={batchDipilih}
						options={batchOptions}
						hint="Tanpa batch memakai populasi nomor peserta terpisah."
					/>
					<ResponsiveGrid columns={2} gap="16px">
						<FormField
							label="NPWP"
							name="npwp"
							inputmode="numeric"
							placeholder={npwpBerikutnya ?? 'Kuota penuh'}
							hint="Kosongkan untuk memakai nomor otomatis."
						/>
						<FormField label="Nama" name="nama" required />
						<FormField
							label="Email"
							name="email"
							type="email"
							value={emailBerikutnya}
							required
						/>
						<FormField
							label="Password awal"
							name="_password"
							type="text"
							value={batchAktif?.passwordDefault ?? '123'}
							required
						/>
					</ResponsiveGrid>

					{#if createPeserta.fields.allIssues()?.[0]}
						<InlineAlert
							tone="error"
							title="Peserta belum dibuat"
							message={createPeserta.fields.allIssues()?.[0]?.message}
						/>
					{:else if createPeserta.result?.message}
						<InlineAlert tone="success" message={createPeserta.result.message} />
					{/if}

					<ActionButton
						type="submit"
						pending={createPeserta.pending > 0}
						pendingLabel="Menyimpan..."
					>
						Buat Peserta
					</ActionButton>
				</form>
			</FormSection>

			<FormSection
				title="Tambah Peserta Massal"
				description="Tambahkan beberapa peserta sekaligus menggunakan konfigurasi batch."
				bordered
			>
				<form {...createPesertaBatch} class="form-stack">
					<SelectField
						label="Batch tujuan"
						name="batchId"
						bind:value={batchMassal}
						options={[
							{ value: '', label: 'Pilih batch' },
							...daftarBatch.batches.map((batch) => ({
								value: batch.id,
								label: `${batch.nama} (${batch.jumlahAnggota} peserta)`,
							})),
						]}
						required
					/>
					<TextAreaField
						label="Daftar nama"
						name="daftarNama"
						rows={8}
						placeholder={'Yunita Wulandari S.E.\nDian Rahmawati, S.Ak.'}
						hint="Satu nama peserta per baris. Email, NPWP, dan password mengikuti batch."
						required
					/>

					{#if createPesertaBatch.fields.allIssues()?.[0]}
						<InlineAlert
							tone="error"
							title="Peserta belum ditambahkan"
							message={createPesertaBatch.fields.allIssues()?.[0]?.message}
						/>
					{:else if createPesertaBatch.result?.message}
						<InlineAlert tone="success" message={createPesertaBatch.result.message} />
						{#each createPesertaBatch.result.hasil.filter((row) => !row.ok) as gagal}
							<InlineAlert tone="error" message={`${gagal.nama}: ${gagal.message}`} compact />
						{/each}
					{/if}

					<ActionButton
						type="submit"
						pending={createPesertaBatch.pending > 0}
						pendingLabel="Menambahkan..."
					>
						Tambahkan ke Batch
					</ActionButton>
				</form>
			</FormSection>
		</div>

		<FormSection
			title="Konfigurasi Batch"
			description="Nomor batch bersifat permanen karena menjadi bagian dari NPWP peserta."
			bordered
			padded={false}
		>
			{#if nomorBatchBaru}
				<form {...createBatch} class="batch-create-form">
					<span class="batch-number">Batch berikutnya <strong>{nomorBatchBaru}</strong></span>
					<FormField
						label="Nama batch"
						name="nama"
						value={`Batch ${String(nomorBatchBaru).padStart(2, '0')}`}
						required
					/>
					<FormField
						label="Pola email"
						name="polaEmail"
						value={`batch${String(nomorBatchBaru).padStart(2, '0')}.peserta{n}@example.com`}
						required
					/>
					<FormField
						label="Password default"
						name="passwordDefault"
						value="123"
						required
					/>
					<ActionButton
						type="submit"
						pending={createBatch.pending > 0}
						pendingLabel="Membuat..."
					>
						Buat Batch
					</ActionButton>
				</form>
			{:else}
				<div class="section-alert">
					<InlineAlert tone="warning" message="Nomor batch sudah mencapai batas 999." />
				</div>
			{/if}

			{#if createBatch.fields.allIssues()?.[0]}
				<div class="section-alert">
					<InlineAlert tone="error" message={createBatch.fields.allIssues()?.[0]?.message} />
				</div>
			{:else if createBatch.result?.message}
				<div class="section-alert">
					<InlineAlert tone="success" message={createBatch.result.message} />
				</div>
			{/if}

			<DataTableViewport label="Daftar batch" minWidth="1180px" framed={false} headerTone="navy">
				<table>
					<thead>
						<tr>
							<th>Nomor</th>
							<th>Nama</th>
							<th>Pola Email</th>
							<th>Password Default</th>
							<th class="number">Peserta</th>
							<th>NPWP Berikutnya</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each daftarBatch.batches as batch}
							{@const formUbah = updateBatch.for(batch.id)}
							<tr>
								<td><strong>{batch.nomor}</strong></td>
								<td>
									<input class="table-input" aria-label={`Nama ${batch.nama}`} name="nama" value={batch.nama} form={`batch-${batch.id}`} />
								</td>
								<td>
									<input class="table-input wide" aria-label={`Pola email ${batch.nama}`} name="polaEmail" value={batch.polaEmail} form={`batch-${batch.id}`} />
								</td>
								<td>
									<input class="table-input" aria-label={`Password default ${batch.nama}`} name="passwordDefault" value={batch.passwordDefault} form={`batch-${batch.id}`} />
								</td>
								<td class="number">{batch.jumlahAnggota}</td>
								<td><code>{batch.npwpBerikutnya ?? 'penuh'}</code></td>
								<td>
									<form {...formUbah} id={`batch-${batch.id}`}>
										<input type="hidden" name="id" value={batch.id} />
										<ActionButton type="submit" pending={formUbah.pending > 0} pendingLabel="Menyimpan...">Simpan</ActionButton>
									</form>
								</td>
							</tr>
							{#if formUbah.fields.allIssues()?.[0] || formUbah.result?.message}
								<tr class="feedback-row">
									<td colspan="7">
										<InlineAlert
											tone={formUbah.fields.allIssues()?.[0] ? 'error' : 'success'}
											message={formUbah.fields.allIssues()?.[0]?.message ?? formUbah.result?.message}
											compact
										/>
									</td>
								</tr>
							{/if}
						{:else}
							<tr><td class="empty" colspan="7">Belum ada batch.</td></tr>
						{/each}
					</tbody>
				</table>
			</DataTableViewport>
		</FormSection>

		<FormSection
			title="Daftar Peserta"
			description="Kelola akses akun dan tinjau aktivitas perpajakan setiap peserta."
			bordered
			padded={false}
		>
			<DataTableViewport label="Daftar peserta" minWidth="1420px" framed={false} headerTone="yellow" stickyFirstColumn>
				<table>
					<thead>
						<tr>
							<th style="width: 250px">Aksi</th>
							<th>NPWP</th>
							<th>Batch</th>
							<th>Nama</th>
							<th>Email</th>
							<th>Status</th>
							<th class="number">PPh Badan</th>
							<th class="number">PPN</th>
							<th class="number">Faktur</th>
							<th>Keterangan</th>
						</tr>
					</thead>
					<DataTableBody items={peserta} getKey={(item) => item.id} emptyColspan={10} emptyText="Belum ada peserta.">
						{#snippet row(item)}
							{@const formReset = resetPesertaPassword.for(item.id)}
							{@const formStatus = setPesertaBanned.for(item.id)}
							<td class="action-cell">
								<form
									{...formReset.enhance(async (form) => {
										const password = prompt(`Password baru untuk ${item.nama}`, '123');
										if (!password) return;
										const field = form.element.elements.namedItem('_password');
										if (field instanceof HTMLInputElement) field.value = password;
										await form.submit();
									})}
									id={`reset-${item.id}`}
									hidden
								>
									<input type="hidden" name="userId" value={item.id} />
									<input type="hidden" name="_password" value="" />
								</form>
								<form {...formStatus} id={`status-${item.id}`} hidden>
									<input type="hidden" name="userId" value={item.id} />
									<input type="hidden" name="banned" value={item.banned ? 'false' : 'true'} />
								</form>
								<TableActions
									visibleCount={3}
									actions={[
										{ label: 'Lihat', href: `/admin/peserta/${item.npwp}` },
										{ label: 'Reset password', onclick: () => submitForm(`reset-${item.id}`) },
										{
											label: item.banned ? 'Aktifkan' : 'Nonaktifkan',
											danger: !item.banned,
											onclick: () => submitForm(`status-${item.id}`),
										},
									]}
								/>
							</td>
							<td><code>{item.npwp}</code></td>
							<td>{item.batchNama ?? 'Tanpa batch'}</td>
							<td><strong>{item.nama}</strong></td>
							<td>{item.email}</td>
							<td><StatusBadge label={item.banned ? 'Nonaktif' : 'Aktif'} tone={item.banned ? 'error' : 'success'} /></td>
							<td class="number">{item.jumlahSptPphBadan}</td>
							<td class="number">{item.jumlahSptPpn}</td>
							<td class="number">{item.jumlahFaktur}</td>
							<td>
								{#if formReset.fields.allIssues()?.[0]}
									<span class="feedback error">{formReset.fields.allIssues()?.[0]?.message}</span>
								{:else if formReset.result?.message}
									<span class="feedback success">{formReset.result.message}</span>
								{:else if formStatus.result?.message}
									<span class="feedback success">{formStatus.result.message}</span>
								{/if}
							</td>
						{/snippet}
					</DataTableBody>
				</table>
			</DataTableViewport>
		</FormSection>
	</Stack>
</PageLayout>

<style>
	.creation-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}

	.form-stack {
		display: grid;
		gap: 16px;
	}

	.form-stack :global(button[type='submit']) {
		justify-self: start;
	}

	.batch-create-form {
		padding: 20px;
		display: grid;
		grid-template-columns: auto minmax(180px, 0.8fr) minmax(300px, 1.5fr) minmax(170px, 0.7fr) auto;
		align-items: end;
		gap: 12px;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-paper);
	}

	.batch-number {
		align-self: center;
		color: var(--ui-muted);
		font-size: 12px;
		white-space: nowrap;
	}

	.batch-number strong {
		display: block;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 24px;
	}

	.section-alert {
		padding: 14px 20px 0;
	}

	.table-input {
		width: 100%;
		min-width: 150px;
		height: 36px;
		padding: 0 9px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 13px;
	}

	.table-input.wide {
		min-width: 260px;
	}

	.table-input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}

	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.feedback-row td {
		padding: 8px 12px;
		background: #fffefa;
	}

	.feedback {
		font-size: 12px;
	}

	.feedback.error {
		color: var(--ui-danger);
	}

	.feedback.success {
		color: var(--ui-success);
	}

	code {
		font-family: var(--ui-font-mono);
		font-size: 12px;
	}

	@media (max-width: 1050px) {
		.creation-grid {
			grid-template-columns: 1fr;
		}

		.batch-create-form {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.batch-number {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 620px) {
		.batch-create-form {
			grid-template-columns: 1fr;
		}

		.batch-number {
			grid-column: auto;
		}
	}
</style>
