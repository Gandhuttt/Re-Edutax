<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		FieldGrid,
		FormActions,
		FormField,
		FormIssueSummary,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		Stack
	} from '$lib/re-ui-components';
	import {
		getTempatKegiatanUsaha,
		hapusTempatKegiatanUsaha,
		simpanTempatKegiatanUsaha
	} from './tempatKegiatanUsaha.remote';

	const data = $derived(await getTempatKegiatanUsaha());
	const editing = $derived(Boolean(simpanTempatKegiatanUsaha.fields.id.value()));

	type Tku = (typeof data.rows)[number];

	function ubah(row: Tku) {
		const f = simpanTempatKegiatanUsaha.fields;
		f.id.set(row.id);
		f.nitku.set(row.nitku);
		f.nama.set(row.nama);
		f.email.set(row.email ?? '');
		f.nomorTelepon.set(row.nomorTelepon ?? '');
		f.alamat.set(row.alamat ?? '');
		f.kodePos.set(row.kodePos ?? '');
	}
</script>

<svelte:head><title>Tempat Kegiatan Usaha</title></svelte:head>

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[{ label: 'Profil Saya', href: '/profile' }, { label: 'Tempat Kegiatan Usaha' }]}
	/>

	<PageHeading
		eyebrow="Profil Saya"
		title="Tempat Kegiatan Usaha"
		description="Kelola tempat kegiatan usaha beserta NITKU yang tercatat pada akun wajib pajak."
	/>

	<Stack gap="18px">
		<FormSection title="Daftar Tempat Kegiatan Usaha" bordered padded={false}>
			<DataTableViewport label="Daftar Tempat Kegiatan Usaha" minWidth="1000px" framed={false} headerTone="navy">
				<table>
					<thead>
						<tr>
							<th scope="col">NITKU</th><th scope="col">Nama TKU</th><th scope="col">Alamat</th>
							<th scope="col">Kode Pos</th><th scope="col">Email</th><th scope="col">Telepon</th>
							<th scope="col" style="width:220px">Aksi</th>
						</tr>
					</thead>
					<DataTableBody
						items={data.rows}
						getKey={(row) => row.id}
						emptyColspan={7}
						emptyText="Belum ada tempat kegiatan usaha."
					>
						{#snippet row(row)}
							{@const hapus = hapusTempatKegiatanUsaha.for(row.id)}
							<td>{row.nitku}</td>
							<td>{row.nama}</td>
							<td>{row.alamat ?? '—'}</td>
							<td>{row.kodePos ?? '—'}</td>
							<td>{row.email ?? '—'}</td>
							<td>{row.nomorTelepon ?? '—'}</td>
							<td>
								<ActionButton tone="secondary" onclick={() => ubah(row)} aria-label={`Ubah TKU ${row.nitku}`}>Ubah</ActionButton>
								<form {...hapus} style="display:inline">
									<input {...hapus.fields.id.as('hidden', row.id)} />
									<ActionButton type="submit" tone="danger" aria-label={`Hapus TKU ${row.nitku}`} pending={hapus.pending > 0}>Hapus</ActionButton>
								</form>
								{#each hapus.fields.allIssues() ?? [] as issue (issue.message)}<p role="alert">{issue.message}</p>{/each}
								{#if hapus.result?.message}<p role="status">{hapus.result.message}</p>{/if}
							</td>
						{/snippet}
					</DataTableBody>
				</table>
			</DataTableViewport>
		</FormSection>

		<FormSection
			title={editing ? 'Ubah Tempat Kegiatan Usaha' : 'Tambah Tempat Kegiatan Usaha'}
			description="NITKU terdiri dari 22 digit dan diawali NPWP akun Anda."
			bordered
		>
			<form {...simpanTempatKegiatanUsaha} novalidate>
				<Stack gap="12px">
					<input {...simpanTempatKegiatanUsaha.fields.id.as('hidden', '')} />
					<FieldGrid gap="16px 24px">
						<FormField
							label="NITKU (22 digit)"
							field={simpanTempatKegiatanUsaha.fields.nitku}
							required
							readonly={editing}
							inputmode="numeric"
							maxlength={22}
							hint={editing ? 'NITKU tidak dapat diubah' : `Diawali ${data.owner}`}
						/>
						<FormField label="Nama TKU" field={simpanTempatKegiatanUsaha.fields.nama} required />
						<FormField label="Alamat" field={simpanTempatKegiatanUsaha.fields.alamat} />
						<FormField label="Kode Pos" field={simpanTempatKegiatanUsaha.fields.kodePos} />
						<FormField label="Email" field={simpanTempatKegiatanUsaha.fields.email} type="email" />
						<FormField label="Nomor Telepon" field={simpanTempatKegiatanUsaha.fields.nomorTelepon} />
					</FieldGrid>
					<FormIssueSummary source={simpanTempatKegiatanUsaha.fields} />
					{#if simpanTempatKegiatanUsaha.result?.message}
						<InlineAlert tone="success" message={simpanTempatKegiatanUsaha.result.message} />
					{/if}
					<FormActions>
						<ActionButton type="reset" tone="quiet" onclick={() => simpanTempatKegiatanUsaha.fields.set({ id: '', nitku: '', nama: '', email: '', nomorTelepon: '', alamat: '', kodePos: '' })}>{editing ? 'Batal' : 'Kosongkan'}</ActionButton>
						<ActionButton type="submit" pending={simpanTempatKegiatanUsaha.pending > 0} pendingLabel="Menyimpan...">
							{editing ? 'Simpan Perubahan' : 'Tambah TKU'}
						</ActionButton>
					</FormActions>
				</Stack>
			</form>
		</FormSection>
	</Stack>
</PageLayout>
