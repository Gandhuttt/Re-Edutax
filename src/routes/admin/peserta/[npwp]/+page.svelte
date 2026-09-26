<script lang="ts">
	import { page } from '$app/state';
	import { formatMonth } from '$lib/helpers/date';
	import {
		ActionButton,
		Breadcrumbs,
		DataTableBody,
		DataTableViewport,
		FieldGrid,
		FormActions,
		FormField,
		FormSection,
		InlineAlert,
		PageHeading,
		PageLayout,
		Stack,
		StatusBadge,
		SummaryStrip,
	} from '$lib/re-ui-components';
	import { updatePeserta } from '../../updatePeserta.remote';
	import { getPesertaDetail } from './getPesertaDetail.remote';

	const rupiah = new Intl.NumberFormat('id-ID');
	const npwp = $derived(page.params.npwp ?? '');
	const detail = $derived(await getPesertaDetail(npwp));
	const jumlahFaktur = $derived(detail.fakturKeluaran.length + detail.fakturMasukan.length);
</script>

<svelte:head>
	<title>Peserta {npwp} | EduTax</title>
</svelte:head>

<PageLayout contentWidth="1540px">
	<Stack gap="18px">
		<Breadcrumbs
			items={[
				{ label: 'Administrasi', href: '/admin' },
				{ label: 'Peserta' },
				{ label: detail.akun.npwp },
			]}
		/>
		<PageHeading
			eyebrow="Administrasi peserta"
			title={detail.akun.nama}
			description={`NPWP ${detail.akun.npwp} · ${detail.profil?.batchNama ?? 'Tanpa batch'}`}
		>
			{#snippet actions()}
				<StatusBadge
					label={detail.akun.banned ? 'Akun Nonaktif' : 'Akun Aktif'}
					tone={detail.akun.banned ? 'error' : 'success'}
				/>
			{/snippet}
		</PageHeading>

		<SummaryStrip
			columns={4}
			items={[
				{ label: 'SPT PPh Badan', value: detail.sptPphBadan.length },
				{ label: 'SPT PPN', value: detail.sptPpn.length },
				{ label: 'Faktur', value: jumlahFaktur },
				{ label: 'Batch', value: detail.profil?.batchNama ?? 'Tanpa batch' },
			]}
		/>

		<FormSection
			title="Informasi Akun"
			description="Perbarui data identitas dan kontak peserta."
			bordered
		>
			<form
				{...updatePeserta.enhance(async (form) => {
					await form.submit();
					await getPesertaDetail(npwp).refresh();
				})}
			>
				<input type="hidden" name="userId" value={detail.akun.id} />
				<Stack gap="18px">
					<FieldGrid columns={3}>
						<FormField label="Nama" name="nama" value={detail.akun.nama} required />
						<FormField label="Email" name="email" type="email" value={detail.akun.email} required />
						<FormField
							label="Nomor telepon"
							name="nomorTelepon"
							type="tel"
							value={detail.profil?.nomor_telepon ?? ''}
						/>
						<FormField label="NPWP" value={detail.akun.npwp} disabled />
						<FormField label="Batch" value={detail.profil?.batchNama ?? 'Tanpa batch'} disabled />
						<FormField label="Status akun" value={detail.akun.banned ? 'Nonaktif' : 'Aktif'} disabled />
					</FieldGrid>

					{#if updatePeserta.fields.allIssues()?.[0]}
						<InlineAlert
							tone="error"
							title="Perubahan belum disimpan"
							message={updatePeserta.fields.allIssues()?.[0]?.message}
						/>
					{:else if updatePeserta.result?.message}
						<InlineAlert tone="success" message={updatePeserta.result.message} />
					{/if}

					<FormActions>
						<ActionButton type="submit" pending={updatePeserta.pending > 0} pendingLabel="Menyimpan...">
							Simpan Perubahan
						</ActionButton>
					</FormActions>
				</Stack>
			</form>
		</FormSection>

		<FormSection title="SPT Tahunan PPh Badan" bordered padded={false}>
			<DataTableViewport label="SPT Tahunan PPh Badan" minWidth="880px" framed={false} headerTone="navy">
				<table>
					<thead>
						<tr>
							<th>Tahun</th>
							<th>Pembetulan</th>
							<th>Status SPT</th>
							<th>Status Draft</th>
							<th class="number">Kurang/Lebih Bayar</th>
							<th>Dilaporkan</th>
						</tr>
					</thead>
					<DataTableBody
						items={detail.sptPphBadan}
						getKey={(row) => `${row.tahunPajak}-${row.pembetulanKe}`}
						emptyColspan={6}
						emptyText="Belum ada SPT PPh Badan."
					>
						{#snippet row(row)}
							<td><strong>{row.tahunPajak}</strong></td>
							<td>{row.pembetulanKe}</td>
							<td>{row.statusSpt}</td>
							<td>{row.statusDraft}</td>
							<td class="number">{rupiah.format(row.pphKurangLebihBayar)}</td>
							<td>{row.tanggalDilaporkan ?? '—'}</td>
						{/snippet}
					</DataTableBody>
				</table>
			</DataTableViewport>
		</FormSection>

		<FormSection title="SPT Masa PPN" bordered padded={false}>
			<DataTableViewport label="SPT Masa PPN" minWidth="880px" framed={false} headerTone="navy">
				<table>
					<thead>
						<tr>
							<th>Masa Pajak</th>
							<th>Tahun</th>
							<th>Pembetulan</th>
							<th>Status</th>
							<th class="number">Kurang/Lebih Bayar</th>
							<th>Dilaporkan</th>
						</tr>
					</thead>
					<DataTableBody
						items={detail.sptPpn}
						getKey={(row) => `${row.tahun}-${row.masaPajak}-${row.pembetulanKe}`}
						emptyColspan={6}
						emptyText="Belum ada SPT PPN."
					>
						{#snippet row(row)}
							<td><strong>{formatMonth(row.masaPajak)}</strong></td>
							<td>{row.tahun}</td>
							<td>{row.pembetulanKe}</td>
							<td>{row.status}</td>
							<td class="number">{rupiah.format(row.ppnKurangLebihBayar)}</td>
							<td>{row.tanggalDilaporkan ?? '—'}</td>
						{/snippet}
					</DataTableBody>
				</table>
			</DataTableViewport>
		</FormSection>

		<FormSection title="Faktur Pajak" bordered padded={false}>
			<DataTableViewport label="Faktur Pajak peserta" minWidth="1040px" framed={false} headerTone="yellow">
				<table>
					<thead>
						<tr>
							<th>Jenis</th>
							<th>Nomor Faktur</th>
							<th>Kode</th>
							<th>Lawan Transaksi</th>
							<th>Tanggal</th>
							<th>Diupload</th>
							<th>Dikreditkan</th>
						</tr>
					</thead>
					<DataTableBody
						items={[...detail.fakturKeluaran, ...detail.fakturMasukan]}
						getKey={(row) => row.id}
						emptyColspan={7}
						emptyText="Belum ada faktur."
					>
						{#snippet row(row)}
							{@const keluaran = row.npwpPenjual === detail.akun.npwp}
							<td><StatusBadge label={keluaran ? 'Keluaran' : 'Masukan'} tone={keluaran ? 'attention' : 'neutral'} /></td>
							<td><code>{row.nomorFaktur || '—'}</code></td>
							<td>{row.kodeTransaksi}</td>
							<td>{keluaran ? row.npwpPembeli || '—' : row.npwpPenjual}</td>
							<td>{row.tanggalFaktur}</td>
							<td>{row.diupload ? 'Ya' : 'Tidak'}</td>
							<td>{row.dikreditkan ? 'Ya' : 'Tidak'}</td>
						{/snippet}
					</DataTableBody>
				</table>
			</DataTableViewport>
		</FormSection>
	</Stack>
</PageLayout>

<style>
	.number {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	code {
		font-family: var(--ui-font-mono);
		font-size: 12px;
	}
</style>
