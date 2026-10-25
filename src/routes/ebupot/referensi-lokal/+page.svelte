<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ptkpEbupotOptions } from '$lib/helpers/ptkp-ebupot';
	import {
		ActionButton,
		Breadcrumbs,
		CheckboxField,
		DataTableBody,
		DataTableViewport,
		DateField,
		FieldGrid,
		FormActions,
		FormField,
		FormIssueSummary,
		FormSection,
		InlineAlert,
		LinkButton,
		PageLayout,
		SelectField,
		ServiceWorkspace,
		Stack,
		StatusBadge
	} from '$lib/re-ui-components';
	import {
		getReferensiLokal,
		hapusCabang,
		hapusProfil,
		simpanCabang,
		simpanPengaturan,
		simpanProfil,
		simpanReceipt,
		simpanSertifikat,
		ubahStatusReceipt,
		ubahStatusSertifikat
	} from './manage.remote';

	const data = $derived(await getReferensiLokal());
	let sidebarOpen = $state(false);
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));

	const jenisWpOptions = [
		{ value: 'orang_pribadi', label: 'Orang Pribadi' },
		{ value: 'badan', label: 'Badan' },
		{ value: 'luar_negeri', label: 'Luar Negeri' }
	];
	const jenisWpLabel = Object.fromEntries(jenisWpOptions.map((o) => [o.value, o.label]));
	const fasilitasOptions = [
		{ value: '4', label: '4 - Fasilitas kode 4' },
		{ value: '8', label: '8 - Fasilitas kode 8' },
		{ value: '10', label: '10 - Fasilitas kode 10' }
	];
	const ptkpOptions = [{ value: '', label: 'Tidak ada / bukan orang pribadi' }, ...ptkpEbupotOptions];
	const negaraOptions = $derived(data.negara.map((n) => ({ value: n.id, label: n.nama })));

	const editingCabang = $derived(Boolean(simpanCabang.fields.id.value()));
	const editingSertifikat = $derived(Boolean(simpanSertifikat.fields.id.value()));
	const editingReceipt = $derived(Boolean(simpanReceipt.fields.id.value()));

	$effect(() => {
		simpanPengaturan.fields.instansiPemerintah.set(data.government);
	});

	type Cabang = (typeof data.branches)[number];
	type Profil = (typeof data.profiles)[number];
	type Sertifikat = (typeof data.certificates)[number];
	type Receipt = (typeof data.receipts)[number];

	function ubahCabang(row: Cabang) {
		const f = simpanCabang.fields;
		f.id.set(row.id);
		f.nitku.set(row.nitku);
		f.nama.set(row.nama);
		f.email.set(row.email ?? '');
		f.nomorTelepon.set(row.nomorTelepon ?? '');
		f.alamat.set(row.alamat ?? '');
		f.kodePos.set(row.kodePos ?? '');
	}
	function ubahProfil(row: Profil) {
		const f = simpanProfil.fields;
		f.nomorIdentitasWp.set(row.nomorIdentitasWp);
		f.nama.set(row.nama);
		f.jenisWp.set(row.jenisWp);
		f.statusPtkp.set(row.statusPtkp ?? '');
	}
	function ubahSertifikat(row: Sertifikat) {
		const f = simpanSertifikat.fields;
		f.id.set(row.id);
		f.nomorIdentitasWp.set(row.nomorIdentitasWp);
		f.fasilitasKode.set(row.fasilitasKode);
		f.nomorSertifikat.set(row.nomorSertifikat);
		f.berlakuDari.set(row.berlakuDari);
		f.berlakuSampai.set(row.berlakuSampai);
	}
	function ubahReceipt(row: Receipt) {
		const f = simpanReceipt.fields;
		f.id.set(row.id);
		f.nomorReceipt.set(row.nomorReceipt);
		f.nomorIdentitasWp.set(row.nomorIdentitasWp);
		f.nama.set(row.nama);
		f.alamat.set(row.alamat);
		f.negaraAsalId.set(row.negaraAsalId);
		f.berlakuDari.set(row.berlakuDari);
		f.berlakuSampai.set(row.berlakuSampai);
	}
</script>

<svelte:head><title>Referensi Lokal e-Bupot BP21/BP26</title></svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/dashboard' },
				{ label: 'e-Bupot' },
				{ label: 'Referensi Lokal' }
			]}
		/>
		<ServiceWorkspace
			bind:sidebarOpen
			identity={{ eyebrow: 'Wajib Pajak', name: accountName, identifier: data.owner, mark: 'EB' }}
			groups={[
				{
					label: 'e-Bupot',
					links: [
						{ label: 'BP21', href: '/ebupot/bp21' },
						{ label: 'BP26', href: '/ebupot/bp26' },
						{ label: 'Referensi Lokal', href: '/ebupot/referensi-lokal', active: true }
					]
				}
			]}
		>
			<Stack gap="20px">
				<InlineAlert
					tone="warning"
					title="Simulasi Pendidikan — Bukan Verifikasi DJP"
					message="Semua data di halaman ini adalah referensi lokal milik akun Anda untuk latihan BP21/BP26. Tidak ada koneksi, token, atau verifikasi ke DJP/Coretax."
				/>
				<div style="display:flex; gap:12px; flex-wrap:wrap">
					<LinkButton href="/ebupot/bp21" tone="primary" size="sm">Kembali ke BP21</LinkButton>
					<LinkButton href="/ebupot/bp26" tone="primary" size="sm">Kembali ke BP26</LinkButton>
				</div>

				<FormSection number="01" title="Pengaturan Pemotong" description="Instansi pemerintah dapat memakai masa pajak hingga 3 bulan ke depan dalam simulasi.">
					<form {...simpanPengaturan} novalidate>
						<Stack gap="12px">
							<CheckboxField
								label="Pemotong adalah instansi pemerintah"
								description="Tersimpan per akun; bawaan: bukan instansi pemerintah."
								field={simpanPengaturan.fields.instansiPemerintah}
							/>
							<FormIssueSummary source={simpanPengaturan.fields} />
							{#if simpanPengaturan.result?.message}
								<InlineAlert tone="success" message={simpanPengaturan.result.message} />
							{/if}
							<FormActions message={data.government ? 'Saat ini: instansi pemerintah' : 'Saat ini: bukan instansi pemerintah'}>
								<ActionButton type="submit" pending={simpanPengaturan.pending > 0} pendingLabel="Menyimpan...">Simpan Pengaturan</ActionButton>
							</FormActions>
						</Stack>
					</form>
				</FormSection>

				<FormSection number="02" title="Cabang / NITKU Saya" description="NITKU 22 digit harus diawali NPWP akun Anda. Cabang penerima dikelola oleh penerima sendiri.">
					<form {...simpanCabang} novalidate>
						<Stack gap="12px">
							<input {...simpanCabang.fields.id.as('hidden', '')} />
							<FieldGrid gap="16px 24px">
								<FormField label="NITKU (22 digit)" field={simpanCabang.fields.nitku} required readonly={editingCabang} inputmode="numeric" maxlength={22} hint={editingCabang ? 'NITKU tidak dapat diubah' : `Diawali ${data.owner}`} />
								<FormField label="Nama Cabang" field={simpanCabang.fields.nama} required />
								<FormField label="Email" field={simpanCabang.fields.email} type="email" />
								<FormField label="Nomor Telepon" field={simpanCabang.fields.nomorTelepon} />
								<FormField label="Alamat" field={simpanCabang.fields.alamat} />
								<FormField label="Kode Pos" field={simpanCabang.fields.kodePos} />
							</FieldGrid>
							<FormIssueSummary source={simpanCabang.fields} />
							{#if simpanCabang.result?.message}
								<InlineAlert tone="success" message={simpanCabang.result.message} />
							{/if}
							<FormActions>
								<ActionButton type="reset" tone="quiet" onclick={() => simpanCabang.fields.set({ id: '', nitku: '', nama: '', email: '', nomorTelepon: '', alamat: '', kodePos: '' })}>Kosongkan</ActionButton>
								<ActionButton type="submit" pending={simpanCabang.pending > 0} pendingLabel="Menyimpan...">{editingCabang ? 'Simpan Perubahan' : 'Tambah Cabang'}</ActionButton>
							</FormActions>
						</Stack>
					</form>
					<DataTableViewport label="Daftar cabang" minWidth="760px" framed={false} headerTone="yellow" density="compact">
						<table>
							<thead><tr><th>NITKU</th><th>Nama</th><th>Alamat</th><th style="width:220px">Aksi</th></tr></thead>
							<DataTableBody items={data.branches} getKey={(row) => row.id} emptyColspan={4} emptyText="Belum ada cabang.">
								{#snippet row(row)}
									{@const hapus = hapusCabang.for(row.id)}
									<td>{row.nitku}</td><td>{row.nama}</td><td>{row.alamat ?? '—'}</td>
									<td>
										<ActionButton tone="secondary" onclick={() => ubahCabang(row)} aria-label={`Ubah cabang ${row.nitku}`}>Ubah</ActionButton>
										<form {...hapus} style="display:inline">
											<input {...hapus.fields.id.as('hidden', row.id)} />
											<ActionButton type="submit" tone="danger" aria-label={`Hapus cabang ${row.nitku}`} pending={hapus.pending > 0}>Hapus</ActionButton>
										</form>
										{#each hapus.fields.allIssues() ?? [] as issue (issue.message)}<p role="alert">{issue.message}</p>{/each}
									</td>
								{/snippet}
							</DataTableBody>
						</table>
					</DataTableViewport>
				</FormSection>

				<FormSection number="03" title="Profil Penerima Penghasilan" description="Jenis WP dan status PTKP dipilih eksplisit; tidak disimpulkan otomatis dari data WP.">
					<form {...simpanProfil} novalidate>
						<Stack gap="12px">
							<FieldGrid gap="16px 24px">
								<FormField label="NPWP/NIK/Nomor Identitas" field={simpanProfil.fields.nomorIdentitasWp} required hint="Menyimpan ulang identitas yang sama memperbarui profil" />
								<FormField label="Nama" field={simpanProfil.fields.nama} required />
								<SelectField label="Jenis WP" field={simpanProfil.fields.jenisWp} options={jenisWpOptions} placeholder="Pilih jenis WP" required />
								<SelectField label="Status PTKP" field={simpanProfil.fields.statusPtkp} options={ptkpOptions} placeholder="Pilih status PTKP" hint="Hanya untuk Orang Pribadi" />
							</FieldGrid>
							<FormIssueSummary source={simpanProfil.fields} />
							{#if simpanProfil.result?.message}
								<InlineAlert tone="success" message={simpanProfil.result.message} />
							{/if}
							<FormActions>
								<ActionButton type="submit" pending={simpanProfil.pending > 0} pendingLabel="Menyimpan...">Simpan Profil</ActionButton>
							</FormActions>
						</Stack>
					</form>
					<DataTableViewport label="Daftar profil penerima" minWidth="760px" framed={false} headerTone="yellow" density="compact">
						<table>
							<thead><tr><th>Identitas</th><th>Nama</th><th>Jenis WP</th><th>PTKP</th><th style="width:220px">Aksi</th></tr></thead>
							<DataTableBody items={data.profiles} getKey={(row) => row.id} emptyColspan={5} emptyText="Belum ada profil.">
								{#snippet row(row)}
									{@const hapus = hapusProfil.for(row.id)}
									<td>{row.nomorIdentitasWp}</td><td>{row.nama}</td><td>{jenisWpLabel[row.jenisWp]}</td><td>{row.statusPtkp ?? '—'}</td>
									<td>
										<ActionButton tone="secondary" onclick={() => ubahProfil(row)} aria-label={`Ubah profil ${row.nomorIdentitasWp}`}>Ubah</ActionButton>
										<form {...hapus} style="display:inline">
											<input {...hapus.fields.id.as('hidden', row.id)} />
											<ActionButton type="submit" tone="danger" aria-label={`Hapus profil ${row.nomorIdentitasWp}`} pending={hapus.pending > 0}>Hapus</ActionButton>
										</form>
									</td>
								{/snippet}
							</DataTableBody>
						</table>
					</DataTableViewport>
				</FormSection>

				<FormSection number="04" title="Sertifikat Fasilitas (Kode 4/8/10)" description="Berlaku bila tanggal akhir masa pajak berada dalam rentang berlaku (inklusif). Simulasi, bukan sertifikat resmi.">
					<form {...simpanSertifikat} novalidate>
						<Stack gap="12px">
							<input {...simpanSertifikat.fields.id.as('hidden', '')} />
							<FieldGrid gap="16px 24px">
								<FormField label="Identitas Penerima" field={simpanSertifikat.fields.nomorIdentitasWp} required />
								<SelectField label="Kode Fasilitas" field={simpanSertifikat.fields.fasilitasKode} options={fasilitasOptions} placeholder="Pilih fasilitas" required />
								<FormField label="Nomor Sertifikat" field={simpanSertifikat.fields.nomorSertifikat} required />
								<DateField label="Berlaku Dari" field={simpanSertifikat.fields.berlakuDari} required />
								<DateField label="Berlaku Sampai" field={simpanSertifikat.fields.berlakuSampai} required />
							</FieldGrid>
							<FormIssueSummary source={simpanSertifikat.fields} />
							{#if simpanSertifikat.result?.message}
								<InlineAlert tone="success" message={simpanSertifikat.result.message} />
							{/if}
							<FormActions>
								<ActionButton type="reset" tone="quiet" onclick={() => simpanSertifikat.fields.set({ id: '', nomorIdentitasWp: '', fasilitasKode: '' as never, nomorSertifikat: '', berlakuDari: '', berlakuSampai: '' })}>Kosongkan</ActionButton>
								<ActionButton type="submit" pending={simpanSertifikat.pending > 0} pendingLabel="Menyimpan...">{editingSertifikat ? 'Simpan Perubahan' : 'Tambah Sertifikat'}</ActionButton>
							</FormActions>
						</Stack>
					</form>
					<DataTableViewport label="Daftar sertifikat" minWidth="860px" framed={false} headerTone="yellow" density="compact">
						<table>
							<thead><tr><th>Identitas</th><th>Fasilitas</th><th>Nomor</th><th>Berlaku</th><th>Status</th><th style="width:240px">Aksi</th></tr></thead>
							<DataTableBody items={data.certificates} getKey={(row) => row.id} emptyColspan={6} emptyText="Belum ada sertifikat.">
								{#snippet row(row)}
									{@const status = ubahStatusSertifikat.for(row.id)}
									<td>{row.nomorIdentitasWp}</td><td>{row.fasilitasKode}</td><td>{row.nomorSertifikat}</td><td>{row.berlakuDari} s.d. {row.berlakuSampai}</td>
									<td><StatusBadge label={row.aktif ? 'Aktif' : 'Nonaktif'} tone={row.aktif ? 'success' : 'attention'} /></td>
									<td>
										<ActionButton tone="secondary" onclick={() => ubahSertifikat(row)} aria-label={`Ubah sertifikat ${row.nomorSertifikat}`}>Ubah</ActionButton>
										<form {...status} style="display:inline">
											<input {...status.fields.id.as('hidden', row.id)} />
											<input {...status.fields.aktif.as('hidden', row.aktif ? '0' : '1')} />
											<ActionButton type="submit" tone={row.aktif ? 'danger' : 'secondary'} aria-label={`${row.aktif ? 'Nonaktifkan' : 'Aktifkan'} sertifikat ${row.nomorSertifikat}`} pending={status.pending > 0}>{row.aktif ? 'Nonaktifkan' : 'Aktifkan'}</ActionButton>
										</form>
									</td>
								{/snippet}
							</DataTableBody>
						</table>
					</DataTableViewport>
				</FormSection>

				<FormSection number="05" title="Receipt SKD Lokal (SIM-SKD-)" description="Nomor wajib diawali SIM-SKD-. Ini receipt simulasi, bukan hasil verifikasi DJP.">
					<form {...simpanReceipt} novalidate>
						<Stack gap="12px">
							<input {...simpanReceipt.fields.id.as('hidden', '')} />
							<FieldGrid gap="16px 24px">
								<FormField label="Nomor Receipt" field={simpanReceipt.fields.nomorReceipt} required readonly={editingReceipt} placeholder="SIM-SKD-0001" hint={editingReceipt ? 'Nomor tidak dapat diubah' : 'Awalan SIM-SKD- wajib'} />
								<FormField label="Identitas WP Luar Negeri" field={simpanReceipt.fields.nomorIdentitasWp} required />
								<FormField label="Nama" field={simpanReceipt.fields.nama} required />
								<FormField label="Alamat" field={simpanReceipt.fields.alamat} required />
								<SelectField label="Negara Asal" field={simpanReceipt.fields.negaraAsalId} options={negaraOptions} placeholder="Pilih negara" searchable required />
								<DateField label="Berlaku Dari" field={simpanReceipt.fields.berlakuDari} required />
								<DateField label="Berlaku Sampai" field={simpanReceipt.fields.berlakuSampai} required />
							</FieldGrid>
							<FormIssueSummary source={simpanReceipt.fields} />
							{#if simpanReceipt.result?.message}
								<InlineAlert tone="success" message={simpanReceipt.result.message} />
							{/if}
							<FormActions>
								<ActionButton type="reset" tone="quiet" onclick={() => simpanReceipt.fields.set({ id: '', nomorReceipt: '', nomorIdentitasWp: '', nama: '', alamat: '', negaraAsalId: '', berlakuDari: '', berlakuSampai: '' })}>Kosongkan</ActionButton>
								<ActionButton type="submit" pending={simpanReceipt.pending > 0} pendingLabel="Menyimpan...">{editingReceipt ? 'Simpan Perubahan' : 'Tambah Receipt'}</ActionButton>
							</FormActions>
						</Stack>
					</form>
					<DataTableViewport label="Daftar receipt" minWidth="980px" framed={false} headerTone="yellow" density="compact">
						<table>
							<thead><tr><th>Nomor</th><th>Identitas</th><th>Nama</th><th>Negara</th><th>Berlaku</th><th>Status</th><th style="width:240px">Aksi</th></tr></thead>
							<DataTableBody items={data.receipts} getKey={(row) => row.id} emptyColspan={7} emptyText="Belum ada receipt.">
								{#snippet row(row)}
									{@const status = ubahStatusReceipt.for(row.id)}
									<td>{row.nomorReceipt}</td><td>{row.nomorIdentitasWp}</td><td>{row.nama}</td><td>{row.negaraNama ?? '—'}</td><td>{row.berlakuDari} s.d. {row.berlakuSampai}</td>
									<td><StatusBadge label={row.aktif ? 'Aktif' : 'Nonaktif'} tone={row.aktif ? 'success' : 'attention'} /></td>
									<td>
										<ActionButton tone="secondary" onclick={() => ubahReceipt(row)} aria-label={`Ubah receipt ${row.nomorReceipt}`}>Ubah</ActionButton>
										<form {...status} style="display:inline">
											<input {...status.fields.id.as('hidden', row.id)} />
											<input {...status.fields.aktif.as('hidden', row.aktif ? '0' : '1')} />
											<ActionButton type="submit" tone={row.aktif ? 'danger' : 'secondary'} aria-label={`${row.aktif ? 'Nonaktifkan' : 'Aktifkan'} receipt ${row.nomorReceipt}`} pending={status.pending > 0}>{row.aktif ? 'Nonaktifkan' : 'Aktifkan'}</ActionButton>
										</form>
									</td>
								{/snippet}
							</DataTableBody>
						</table>
					</DataTableViewport>
				</FormSection>
			</Stack>
		</ServiceWorkspace>
	</Stack>
</PageLayout>
