<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import { createBatch } from './createBatch.remote';
	import { createPeserta } from './createPeserta.remote';
	import { createPesertaBatch } from './createPesertaBatch.remote';
	import { listBatch } from './listBatch.remote';
	import { listPeserta } from './listPeserta.remote';
	import { resetPesertaPassword } from './resetPesertaPassword.remote';
	import { setPesertaBanned } from './setPesertaBanned.remote';
	import { updateBatch } from './updateBatch.remote';

	const daftarBatch = $derived(await listBatch());

	// '' = lone peserta, numbered outside the reserved batch digits.
	let batchDipilih = $state('');
	const batchAktif = $derived(daftarBatch.batches.find((batch) => batch.id === batchDipilih));
	const npwpBerikutnya = $derived(
		batchAktif ? batchAktif.npwpBerikutnya : daftarBatch.npwpLoneBerikutnya
	);
	const emailBerikutnya = $derived(
		batchAktif && batchAktif.urutBerikutnya
			? batchAktif.polaEmail.replaceAll('{n}', String(batchAktif.urutBerikutnya))
			: ''
	);

	let batchMassal = $state('');
	const nomorBatchBaru = $derived(daftarBatch.nomorBatchBerikutnya);

	// Same idea as the batch table: the fields carry rules that the inputs cannot show.
	const petunjukPeserta = {
		batch:
			'Menentukan penomoran NPWP, pola email, dan password default peserta. Pilih "Tanpa batch" untuk peserta lepas, yang nomornya diambil dari populasi terpisah agar tidak memakai digit batch.',
		npwp: 'Biarkan kosong agar sistem menerbitkan nomor berikutnya. Isi hanya bila ingin memakai nomor tertentu; nomor yang pernah diterbitkan akan ditolak karena tidak boleh dipakai ulang.',
		nama: 'Dipakai sebagai nama akun sekaligus nama wajib pajak, dan tercatat sebagai pemilik pertama nomor NPWP.',
		email:
			'Harus unik antar akun. Terisi otomatis dari pola email batch yang dipilih, boleh diubah sebelum disimpan.',
		password:
			'Password awal peserta, minimal 3 karakter. Terisi dari password default batch dan dapat direset kapan saja lewat tombol Reset di daftar peserta.'
	};

	// The batch table encodes several rules that are not obvious from the values alone —
	// what is permanent, what only applies to future peserta, what cannot be undone.
	const kolomBatch = [
		{
			judul: 'Nomor',
			lebar: 'tw:w-[6rem]',
			keterangan:
				'Diberikan sistem (nomor tertinggi + 1) dan tertanam di NPWP setiap anggota, sehingga tidak dapat diubah maupun dipakai ulang.'
		},
		{
			judul: 'Nama',
			lebar: 'tw:w-[14rem]',
			keterangan: 'Label batch di dasbor. Aman diubah kapan saja, tidak memengaruhi penomoran.'
		},
		{
			judul: 'Pola Email',
			lebar: 'tw:w-[24rem]',
			keterangan:
				'Email peserta baru. {n} diganti nomor urut peserta yang diterbitkan. Perubahan hanya berlaku untuk peserta berikutnya, email yang sudah dibuat tidak ikut berubah.'
		},
		{
			judul: 'Password Default',
			lebar: 'tw:w-[10rem]',
			keterangan:
				'Password untuk peserta baru di batch ini. Tidak mengubah password peserta yang sudah ada. Gunakan tombol Reset pada daftar peserta untuk itu.'
		},
		{
			judul: 'Peserta',
			lebar: 'tw:w-[8rem]',
			keterangan: 'Jumlah peserta yang terdaftar di batch ini, termasuk yang dinonaktifkan.'
		},
		{
			judul: 'NPWP Berikutnya',
			lebar: 'tw:w-[16rem]',
			keterangan:
				'Nomor yang akan diterbitkan untuk peserta berikutnya. Nomor yang pernah terbit tidak pernah dipakai ulang, jadi urutannya hanya maju. Maksimal 99 peserta per batch.'
		},
		{
			judul: 'Action',
			lebar: 'tw:w-[10rem]',
			keterangan:
				'Menyimpan perubahan nama, pola email, dan password default. Batch tidak dapat dihapus.'
		}
	];
</script>

<svelte:head>
	<title>Dasbor Administrator</title>
</svelte:head>

<div class="tw:w-full tw:p-25 tw:flex tw:flex-col tw:gap-6">
	<div class="tw:flex tw:gap-6 tw:items-start">
		<Card>
			{#snippet head()}
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Tambah Peserta</span>
			{/snippet}
			{#snippet body()}
				<form {...createPeserta} class="tw:flex tw:flex-col tw:gap-2">
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">
							<abbr title={petunjukPeserta.batch}>Batch</abbr>
						</span>
						<Select name="batchId" bind:value={batchDipilih} class="tw:w-full">
							<option value="">Tanpa batch</option>
							{#each daftarBatch.batches as batch}
								<option value={batch.id}>{batch.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">
							<abbr title={petunjukPeserta.npwp}>NPWP</abbr>
						</span>
						<Input
							type="text"
							name="npwp"
							inputmode="numeric"
							title={petunjukPeserta.npwp}
							placeholder={npwpBerikutnya ?? 'penuh'}
						/>
					</Label>
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">
							<abbr title={petunjukPeserta.nama}>Nama</abbr>
						</span>
						<Input type="text" name="nama" title={petunjukPeserta.nama} required />
					</Label>
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">
							<abbr title={petunjukPeserta.email}>Email</abbr>
						</span>
						<Input
							type="email"
							name="email"
							value={emailBerikutnya}
							title={petunjukPeserta.email}
							required
						/>
					</Label>
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">
							<abbr title={petunjukPeserta.password}>Password</abbr>
						</span>
						<Input
							type="text"
							name="_password"
							value={batchAktif?.passwordDefault ?? '123'}
							title={petunjukPeserta.password}
							required
						/>
					</Label>

					<p class="tw:text-sm tw:text-gray-600">
						Nomor otomatis: <code>{npwpBerikutnya ?? 'kuota habis'}</code>
						{batchAktif ? '' : '(tanpa batch)'}
					</p>

					{#if createPeserta.fields.allIssues()?.[0]}
						<p class="pesan-galat">{createPeserta.fields.allIssues()?.[0]?.message}</p>
					{:else if createPeserta.result?.message}
						<p class="pesan-sukses">{createPeserta.result.message}</p>
					{/if}

					<Button class="tw:w-full" disabled={createPeserta.pending > 0}>
						{createPeserta.pending > 0 ? 'Menyimpan...' : 'Buat Peserta'}
					</Button>
				</form>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Tambah Peserta Massal</span>
			{/snippet}
			{#snippet body()}
				<form {...createPesertaBatch} class="tw:flex tw:flex-col tw:gap-2">
					<Label class="tw:flex! tw:flex-row tw:items-center">
						<span class="tw:block tw:w-[12rem]">Batch</span>
						<Select name="batchId" bind:value={batchMassal} class="tw:w-full" required>
							<option value="" disabled>Pilih batch</option>
							{#each daftarBatch.batches as batch}
								<option value={batch.id}>{batch.nama} ({batch.jumlahAnggota} peserta)</option>
							{/each}
						</Select>
					</Label>
					<Label class="tw:flex! tw:flex-col">
						<span class="tw:block">Daftar nama (satu nama per baris)</span>
						<textarea
							name="daftarNama"
							rows="8"
							class="form-control tw:w-full"
							placeholder={'Yunita Wulandari S.E.\nDian Rahmawati, S.Ak.'}
							required
						></textarea>
					</Label>

					<p class="tw:text-sm tw:text-gray-600">
						NPWP, email dan password diambil dari batch yang dipilih.
					</p>

					{#if createPesertaBatch.fields.allIssues()?.[0]}
						<p class="pesan-galat">{createPesertaBatch.fields.allIssues()?.[0]?.message}</p>
					{:else if createPesertaBatch.result?.message}
						<p class="pesan-sukses">{createPesertaBatch.result.message}</p>
						{#each createPesertaBatch.result.hasil.filter((row) => !row.ok) as gagal}
							<p class="pesan-galat">{gagal.nama}: {gagal.message}</p>
						{/each}
					{/if}

					<Button class="tw:w-full" disabled={createPesertaBatch.pending > 0}>
						{createPesertaBatch.pending > 0 ? 'Menyimpan...' : 'Tambahkan ke Batch'}
					</Button>
				</form>
			{/snippet}
		</Card>
	</div>

	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Batch</span>
				{#if nomorBatchBaru}
					<form {...createBatch} class="tw:flex tw:gap-2 tw:items-center">
						<span class="tw:text-sm tw:text-gray-600 tw:whitespace-nowrap">
							Nomor otomatis: <strong>{nomorBatchBaru}</strong>
						</span>
						<Input
							type="text"
							name="nama"
							value={`Batch ${String(nomorBatchBaru).padStart(2, '0')}`}
							class="tw:w-[12rem]"
						/>
						<Input
							type="text"
							name="polaEmail"
							value={`batch${String(nomorBatchBaru).padStart(2, '0')}.peserta{n}@example.com`}
							class="tw:w-[22rem]"
							required
						/>
						<Input type="text" name="passwordDefault" value="123" class="tw:w-[8rem]" required />
						<Button disabled={createBatch.pending > 0}>Buat Batch</Button>
					</form>
				{:else}
					<span class="pesan-galat">Nomor batch sudah mencapai batas 999.</span>
				{/if}
			</div>
		{/snippet}
		{#snippet body()}
			{#if createBatch.fields.allIssues()?.[0]}
				<p class="pesan-galat">{createBatch.fields.allIssues()?.[0]?.message}</p>
			{:else if createBatch.result?.message}
				<p class="pesan-sukses">{createBatch.result.message}</p>
			{/if}

			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						{#each kolomBatch as kolom}
							<th class={kolom.lebar}>
								<abbr title={kolom.keterangan}>{kolom.judul}</abbr>
							</th>
						{/each}
					</tr>
				{/snippet}
				{#snippet body()}
					{#each daftarBatch.batches as batch}
						{@const formUbah = updateBatch.for(batch.id)}
						<tr>
							<td>{batch.nomor}</td>
							<td><Input type="text" name="nama" value={batch.nama} form="batch-{batch.id}" /></td>
							<td>
								<Input type="text" name="polaEmail" value={batch.polaEmail} form="batch-{batch.id}" />
							</td>
							<td>
								<Input
									type="text"
									name="passwordDefault"
									value={batch.passwordDefault}
									form="batch-{batch.id}"
								/>
							</td>
							<td>{batch.jumlahAnggota}</td>
							<td>{batch.npwpBerikutnya ?? 'penuh'}</td>
							<td>
								<form {...formUbah} id="batch-{batch.id}">
									<input type="hidden" name="id" value={batch.id} />
									<Button disabled={formUbah.pending > 0}>Simpan</Button>
								</form>
							</td>
						</tr>
						{#if formUbah.fields.allIssues()?.[0]}
							<tr>
								<td colspan="7" class="pesan-galat">
									{formUbah.fields.allIssues()?.[0]?.message}
								</td>
							</tr>
						{/if}
					{:else}
						<tr><td colspan="7">Belum ada batch.</td></tr>
					{/each}
				{/snippet}
			</Table>
		{/snippet}
	</Card>

	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Daftar Peserta</span>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[18rem]">Action</th>
							<th class="tw:w-[14rem]">NPWP</th>
							<th class="tw:w-[12rem]">Batch</th>
							<th class="tw:w-[18rem]">Nama</th>
							<th class="tw:w-[18rem]">Email</th>
							<th class="tw:w-[8rem]">Status</th>
							<th class="tw:w-[8rem]">PPh Badan</th>
							<th class="tw:w-[8rem]">PPN</th>
							<th class="tw:w-[8rem]">Faktur</th>
							<th class="tw:w-[20rem]">Keterangan</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listPeserta() as peserta}
							{@const formReset = resetPesertaPassword.for(peserta.id)}
							{@const formStatus = setPesertaBanned.for(peserta.id)}
							<tr>
								<td class="tw:flex tw:gap-2">
									<a href="/admin/peserta/{peserta.npwp}" class="tw:text-black!">
										<Button>Lihat</Button>
									</a>
									<form
										{...formReset.enhance(async (form) => {
											const password = prompt(`Password baru untuk ${peserta.nama}`, '123');
											if (!password) return;
											// The enhance callback has no handle on the FormData, so the value is
											// written back into the hidden field before submitting.
											const field = form.element.elements.namedItem('_password');
											if (field instanceof HTMLInputElement) field.value = password;
											await form.submit();
										})}
									>
										<input type="hidden" name="userId" value={peserta.id} />
										<input type="hidden" name="_password" value="" />
										<Button color="var(--color-secondary)">Reset</Button>
									</form>
									<form {...formStatus}>
										<input type="hidden" name="userId" value={peserta.id} />
										<input type="hidden" name="banned" value={peserta.banned ? 'false' : 'true'} />
										<Button color="var(--color-secondary)">
											{peserta.banned ? 'Aktifkan' : 'Nonaktifkan'}
										</Button>
									</form>
								</td>
								<td>{peserta.npwp}</td>
								<td>{peserta.batchNama ?? 'Tanpa batch'}</td>
								<td>{peserta.nama}</td>
								<td>{peserta.email}</td>
								<td>{peserta.banned ? 'Nonaktif' : 'Aktif'}</td>
								<td>{peserta.jumlahSptPphBadan}</td>
								<td>{peserta.jumlahSptPpn}</td>
								<td>{peserta.jumlahFaktur}</td>
								<td>
									{#if formReset.fields.allIssues()?.[0]}
										<span class="pesan-galat">{formReset.fields.allIssues()?.[0]?.message}</span>
									{:else if formReset.result?.message}
										<span class="pesan-sukses">{formReset.result.message}</span>
									{:else if formStatus.result?.message}
										<span class="pesan-sukses">{formStatus.result.message}</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/snippet}
				</Table>
			</div>
		{/snippet}
	</Card>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}

	abbr {
		text-decoration: underline dotted;
		text-underline-offset: 3px;
		cursor: help;
	}

	.pesan-galat {
		margin: 0;
		color: #b42318;
		font-size: 0.95rem;
	}

	.pesan-sukses {
		margin: 0;
		color: #067647;
		font-size: 0.95rem;
	}
</style>
