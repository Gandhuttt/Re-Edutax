<script lang="ts">
	import type { PageProps } from './$types';
	import { UNIFIKASI_ARTICLES, type SptUnifikasiTaxRow } from '$lib/helpers/spt-unifikasi';
	import {
		ActionButton, Breadcrumbs, CheckboxField, DataTableBody, DataTableViewport,
		DisclosureItem, DocumentTabs, DocumentWorkspace, FieldGrid, FormActions,
		FormField, FormSection, InlineAlert, PageHeading, PageLayout, PaginationBar,
		Stack, StatusBadge
	} from '$lib/re-ui-components';

	let { data, form }: PageProps = $props();
	let currentTab = $state('Induk');
	let headerOpen = $state(true);
	let identityOpen = $state(true);
	let summaryOpen = $state(true);
	let declarationOpen = $state(true);
	let sourceOpen = $state(true);
	let filter = $state({ identitas: '', nama: '', nomor: '' });
	let page = $state(1);
	let pageSize = $state(10);

	const tabs = ['Induk', 'Daftar-I', 'Daftar-II', 'Lampiran-I'].map((label) => ({
		label, panelId: `unifikasi-${label}`
	}));
	const month = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' });
	const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
	const percentFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 });
	const dateTime = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

	const detail = $derived(data.detail);
	const snapshot = $derived(detail.snapshot);
	const editable = $derived(detail.status === 'konsep');
	const statusLabel = $derived(detail.status === 'dilaporkan' ? 'Dilaporkan' : detail.status === 'menunggu_pembayaran' ? 'Menunggu pembayaran' : 'Konsep');
	const periodLabel = $derived(`${month.format(new Date(Date.UTC(detail.tahun, detail.masaPajak - 1, 1)))} ${detail.tahun}`);
	const kindLabel = $derived(detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}`);
	const rp = (value: number) => numberFormat.format(value);
	const text = (value: string | null | undefined) => (value && value.trim() ? value : '—');
	const savedAt = $derived(detail.tanggalDiperbarui ? dateTime.format(detail.tanggalDiperbarui) : 'belum pernah diperbarui');

	const articleGroups = $derived(UNIFIKASI_ARTICLES.map((pasal) => {
		const rows: SptUnifikasiTaxRow[] = snapshot.rows.filter((row) => row.pasal === pasal);
		const sum = (pick: (row: SptUnifikasiTaxRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
		return {
			pasal, rows,
			pemotongan: sum((row) => row.pemotongan),
			dtp: sum((row) => row.dtp),
			terutang: sum((row) => row.terutang),
			pembayaranSebelumnya: sum((row) => row.pembayaranSebelumnya),
			kurangLebihBayar: sum((row) => row.kurangLebihBayar),
			harusDibayar: sum((row) => row.harusDibayar)
		};
	}));

	function tanggal(value: string | null | undefined) {
		const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
		return match ? `${match[3]}-${match[2]}-${match[1]}` : text(value);
	}
	function sourceStatus(value: string) {
		if (value === 'NORMAL' || value === 'SUBMITTED') return 'Normal';
		return text(value);
	}
	const contains = (value: string, query: string) => value.toLowerCase().includes(query.trim().toLowerCase());
	const filtered = $derived(snapshot.sources.filter((row) =>
		contains(row.identitas ?? '', filter.identitas) && contains(row.nama ?? '', filter.nama) && contains(row.nomor ?? '', filter.nomor)));
	const pageSizeSafe = $derived(Math.max(1, pageSize || 10));
	const pageSafe = $derived(Math.min(Math.max(1, page || 1), Math.max(1, Math.ceil(filtered.length / pageSizeSafe))));
	const paged = $derived(filtered.slice((pageSafe - 1) * pageSizeSafe, pageSafe * pageSizeSafe));
	function preventFilterSubmit(event: KeyboardEvent) {
		if (event.key === 'Enter') event.preventDefault();
	}

	const instruction = $derived(
		editable && detail.sourcesChanged ? 'Data BPPU berubah sejak snapshot terakhir. Klik "Perbarui data BPPU" sebelum menyampaikan SPT.'
		: editable ? 'Periksa snapshot BPPU, centang pernyataan, lalu bayar dan lapor (simulasi).'
		: detail.status === 'menunggu_pembayaran' ? 'Pembayaran simulasi — tidak ada transaksi bank atau penerbitan NTPN.'
		: 'SPT simulasi telah dilaporkan dan tidak dapat diubah.'
	);
</script>

<svelte:head><title>SPT Masa PPh Unifikasi</title></svelte:head>

<form id="unifikasi-refresh-form" method="POST" action={`?/refresh&id=${detail.id}`} hidden></form>
<form id="unifikasi-pay-form" method="POST" action={`?/pay&id=${detail.id}`} hidden></form>
<form id="unifikasi-reopen-form" method="POST" action={`?/reopen&id=${detail.id}`} hidden></form>
<form id="unifikasi-amend-form" method="POST" action={`?/amend&id=${detail.id}`} hidden></form>
<form id="unifikasi-delete-form" method="POST" action={`?/delete&id=${detail.id}`} hidden
	onsubmit={(event) => { if (!confirm('Hapus konsep SPT ini? Tindakan tidak dapat dibatalkan.')) event.preventDefault(); }}></form>

{#snippet headingActions()}
	<StatusBadge label={statusLabel} tone={detail.status === 'dilaporkan' ? 'success' : detail.status === 'menunggu_pembayaran' ? 'attention' : 'neutral'} />
{/snippet}

{#snippet unsupported(title: string, description: string)}
	<DisclosureItem title={title} open>
		<Stack gap="12px">
			<InlineAlert tone="info" message={`${description} Sumber data tersebut belum didukung pada cakupan SPT Unifikasi saat ini, yang hanya memuat Bukti Pemotongan/Pemungutan Unifikasi (BPPU) berstatus diterbitkan. Tidak ada data simulasi yang ditampilkan.`} />
			<p class="unsupported">Tidak tersedia pada simulator ini.</p>
		</Stack>
	</DisclosureItem>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[
		{ label: 'Beranda', href: '/dashboard' },
		{ label: 'Surat Pemberitahuan', href: '/surat-pemberitahuan/konsep' },
		{ label: 'SPT Masa PPh Unifikasi' }
	]} />
	<PageHeading title="SPT Masa PPh Unifikasi" eyebrow={`Masa Pajak ${periodLabel} · ${kindLabel}`} actions={headingActions} />

	<DocumentWorkspace>
		<Stack gap="14px">
			<DocumentTabs {tabs} bind:active={currentTab} ariaLabel="Bagian SPT Masa PPh Unifikasi" />
			{#if form?.message}<InlineAlert tone="error" message={form.message} />{/if}
			{#if data.notice}<InlineAlert tone="success" compact message={data.notice} />{/if}
			{#if detail.sourcesChanged}
				<InlineAlert tone="warning" compact message={editable
					? 'Data BPPU berubah sejak snapshot terakhir. Perbarui data BPPU sebelum menyampaikan SPT.'
					: 'Data BPPU berubah sejak snapshot terakhir. Pembayaran dinonaktifkan; kembalikan SPT ke konsep lalu perbarui data BPPU.'} />
			{:else if detail.status === 'dilaporkan'}
				<InlineAlert tone="info" compact message={`Snapshot pelaporan dikunci (${savedAt}); perubahan BPPU berikutnya tidak mengubah laporan ini.`} />
			{:else}
				<InlineAlert tone="info" compact message={`Snapshot BPPU tersimpan (${savedAt}) sesuai dengan data BPPU saat ini.`} />
			{/if}

			<div id="unifikasi-Induk" role="tabpanel" aria-label="Induk" hidden={currentTab !== 'Induk'}>
				<DisclosureItem title="HEADER" bind:open={headerOpen}>
					<Stack gap="18px">
						<FieldGrid columns={4}>
							<FormField label="Masa Pajak" value={String(detail.masaPajak).padStart(2, '0')} disabled />
							<FormField label="Tahun Pajak" value={String(detail.tahun)} disabled />
							<FormField label="Status SPT" value={kindLabel} disabled />
							<FormField label="Status Penyampaian" value={statusLabel} disabled />
						</FieldGrid>
						{#if editable}
							<Stack direction="horizontal" gap="8px" wrap>
								<ActionButton type="submit" form="unifikasi-refresh-form" tone="secondary">Perbarui data BPPU</ActionButton>
							</Stack>
							<p class="hint">Data BPPU hanya dibaca ulang saat tombol ini diklik. Tombol hanya mengambil BPPU diterbitkan berstatus normal pada masa pajak ini.</p>
						{/if}
					</Stack>
				</DisclosureItem>
				<DisclosureItem title="A. IDENTITAS PEMOTONG" bind:open={identityOpen}>
					<FieldGrid columns={2}>
						<FormField label="1. NPWP" value={detail.npwpPemotong} disabled />
						<FormField label="2. Nama" value={detail.namaPemotong} disabled />
						<FormField label="3. Alamat" value={detail.alamatPemotong ?? '—'} disabled />
						<FormField label="4. Nomor Telepon" value={detail.teleponPemotong ?? '—'} disabled />
					</FieldGrid>
				</DisclosureItem>
				<DisclosureItem title="B. PAJAK PENGHASILAN YANG DIPOTONG/DIPUNGUT (BPPU)" bind:open={summaryOpen}>
					<Stack gap="14px">
						<p class="hint">Pajak bersumber dari BPPU dan tidak dihitung ulang. Pembayaran sebelumnya adalah pembayaran aktual SPT sebelumnya per KAP-KJS; tidak ada kompensasi antar KAP-KJS.</p>
						{#each articleGroups as group (group.pasal)}
							<FormSection title={`PPh ${group.pasal}`} bordered>
								<DataTableViewport label={`Ringkasan PPh ${group.pasal}`} minWidth="1100px" headerTone="navy" density="compact">
									<table>
										<thead>
											<tr>
												<th scope="col">KAP-KJS</th>
												<th scope="col" class="number">Pajak Dipotong/Dipungut (Rp)</th>
												<th scope="col" class="number">Ditanggung Pemerintah/DTP (Rp)</th>
												<th scope="col" class="number">Pajak Terutang (Rp)</th>
												<th scope="col" class="number">Pembayaran SPT Sebelumnya (Rp)</th>
												<th scope="col" class="number">Kurang (Lebih) Bayar (Rp)</th>
												<th scope="col" class="number">Harus Dibayar (Rp)</th>
											</tr>
										</thead>
										<tbody>
											{#each group.rows as row (row.kapKjs)}
												<tr>
													<td>{row.kapKjs}</td>
													<td class="number">{rp(row.pemotongan)}</td>
													<td class="number">{rp(row.dtp)}</td>
													<td class="number">{rp(row.terutang)}</td>
													<td class="number">{rp(row.pembayaranSebelumnya)}</td>
													<td class="number">{rp(row.kurangLebihBayar)}</td>
													<td class="number">{rp(row.harusDibayar)}</td>
												</tr>
											{:else}
												<tr><td>—</td><td class="number">0</td><td class="number">0</td><td class="number">0</td><td class="number">0</td><td class="number">0</td><td class="number">0</td></tr>
											{/each}
										</tbody>
										<tfoot>
											<tr>
												<th scope="row">JUMLAH</th>
												<td class="number">{rp(group.pemotongan)}</td>
												<td class="number">{rp(group.dtp)}</td>
												<td class="number">{rp(group.terutang)}</td>
												<td class="number">{rp(group.pembayaranSebelumnya)}</td>
												<td class="number">{rp(group.kurangLebihBayar)}</td>
												<td class="number">{rp(group.harusDibayar)}</td>
											</tr>
										</tfoot>
									</table>
								</DataTableViewport>
							</FormSection>
						{/each}
						<FormSection title="TOTAL" bordered>
							<FieldGrid columns={3}>
								<FormField label="Total DPP BPPU (Rp)" value={rp(snapshot.totalDpp)} disabled />
								<FormField label="Total pajak dipotong/dipungut (Rp)" value={rp(snapshot.totalPemotongan)} disabled />
								<FormField label="Total ditanggung pemerintah/DTP (Rp)" value={rp(snapshot.totalDtp)} disabled />
								<FormField label="Total pajak terutang (Rp)" value={rp(snapshot.totalTerutang)} disabled />
								<FormField label="Total pembayaran SPT sebelumnya (Rp)" value={rp(snapshot.totalPembayaranSebelumnya)} disabled />
								<FormField label="Total kurang (lebih) bayar (Rp)" value={rp(snapshot.kurangLebihBayar)} disabled />
								<FormField label="Total harus dibayar (Rp)" value={rp(snapshot.harusDibayar)} disabled />
							</FieldGrid>
							{#if snapshot.kurangLebihBayar < 0}
								<InlineAlert tone="info" compact message="Terdapat lebih bayar pada sebagian KAP-KJS. Simulator tidak memproses restitusi/pengembalian otomatis dan tidak mengompensasi antar KAP-KJS." />
							{/if}
						</FormSection>
					</Stack>
				</DisclosureItem>
				<DisclosureItem title="C. PERNYATAAN DAN TANDA TANGAN" bind:open={declarationOpen}>
					<form id="unifikasi-submit-form" method="POST" action={`?/submit&id=${detail.id}`}>
						<input type="hidden" name="revision" value={detail.revision} />
						<Stack gap="18px">
							<CheckboxField name="pernyataan" value="true" checked={detail.pernyataan} disabled={!editable}
								label="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, Saya menyatakan bahwa apa yang telah Saya beritahukan di atas adalah benar, lengkap, dan jelas." />
							<FieldGrid columns={2}>
								<FormField label="Ditandatangani oleh" value="Wajib Pajak" disabled />
								<FormField label="Nama" value={detail.namaPemotong} disabled />
							</FieldGrid>
							<p class="hint">Simulasi pembelajaran: tidak ada tanda tangan elektronik, penagihan, atau pengiriman ke DJP.</p>
						</Stack>
					</form>
				</DisclosureItem>
			</div>

			<div id="unifikasi-Daftar-I" role="tabpanel" aria-label="Daftar-I" hidden={currentTab !== 'Daftar-I'}>
				<DisclosureItem title="HEADER" open>
					<FieldGrid columns={2}>
						<FormField label="Nomor Identitas WP" value={detail.npwpPemotong} disabled />
						<FormField label="MASA PAJAK (MM-YYYY)" value={`${String(detail.masaPajak).padStart(2, '0')}-${detail.tahun}`} disabled />
					</FieldGrid>
				</DisclosureItem>
				<DisclosureItem title="DAFTAR-I BUKTI PEMOTONGAN/PEMUNGUTAN UNIFIKASI (BPPU)" bind:open={sourceOpen}>
					<FormSection title="BPPU">
						<DataTableViewport label="Daftar-I BPPU" minWidth="1900px" framed={false} headerTone="navy" density="compact">
							<table>
								<thead>
									<tr>
										<th scope="col">No</th>
										<th scope="col">Nomor Bukti Potong</th>
										<th scope="col">NIK/NPWP</th>
										<th scope="col">Nama</th>
										<th scope="col">Tanggal Dokumen</th>
										<th scope="col">Kode Objek Pajak</th>
										<th scope="col">Objek Pajak</th>
										<th scope="col" class="right">DPP (Rp)</th>
										<th scope="col" class="right">Tarif (%)</th>
										<th scope="col" class="right">Pajak (Rp)</th>
										<th scope="col">Fasilitas Perpajakan</th>
										<th scope="col">ID Tempat Kegiatan Usaha</th>
										<th scope="col">KAP-KJS</th>
										<th scope="col">Status</th>
									</tr>
									<tr>
										<th></th>
										<th scope="col"><FormField label="Filter Nomor Bukti Potong" labelHidden bind:value={filter.nomor} oninput={() => (page = 1)} onkeydown={preventFilterSubmit} /></th>
										<th scope="col"><FormField label="Filter NIK/NPWP" labelHidden bind:value={filter.identitas} oninput={() => (page = 1)} onkeydown={preventFilterSubmit} /></th>
										<th scope="col"><FormField label="Filter Nama" labelHidden bind:value={filter.nama} oninput={() => (page = 1)} onkeydown={preventFilterSubmit} /></th>
										<th colspan="10"></th>
									</tr>
								</thead>
								<DataTableBody
									items={paged}
									getKey={(row) => row.id}
									emptyColspan={14}
									emptyText="Tidak ada BPPU yang ditemukan pada snapshot."
									motion={false}
								>
									{#snippet row(row, index)}
										<td>{(pageSafe - 1) * pageSizeSafe + index + 1}</td>
										<td>{text(row.nomor)}</td>
										<td>{text(row.identitas)}</td>
										<td>{text(row.nama)}</td>
										<td>{tanggal(row.tanggalDokumen)}</td>
										<td>{text(row.kodeObjek)}</td>
										<td>{text(row.namaObjek)}</td>
										<td class="number amount">{rp(row.dpp)}</td>
										<td class="number">{percentFormat.format(row.tarif)}</td>
										<td class="number amount">{rp(row.pajak)}</td>
										<td>{row.fasilitasKode ? `${row.fasilitasKode} · ${text(row.fasilitas)}` : text(row.fasilitas)}{row.dtp ? ` (DTP Rp ${rp(row.dtp)})` : ''}</td>
										<td>{text(row.nitku)}</td>
										<td>{text(row.kapKjs)}</td>
										<td>{sourceStatus(row.status)}</td>
									{/snippet}
								</DataTableBody>
								<tfoot>
									<tr>
										<th scope="row" colspan="7">JUMLAH SELURUH BPPU</th>
										<td class="number amount">{rp(snapshot.totalDpp)}</td>
										<td></td>
										<td class="number amount">{rp(snapshot.totalPemotongan)}</td>
										<td colspan="4"></td>
									</tr>
								</tfoot>
							</table>
						</DataTableViewport>
						<PaginationBar bind:page bind:pageSize totalItems={filtered.length} itemLabel="BPPU" ariaLabel="Navigasi halaman Daftar-I BPPU" />
					</FormSection>
				</DisclosureItem>
			</div>

			<div id="unifikasi-Daftar-II" role="tabpanel" aria-label="Daftar-II" hidden={currentTab !== 'Daftar-II'}>
				{@render unsupported('DAFTAR-II', 'Daftar-II memuat penyetoran sendiri dan pemotongan secara digunggung.')}
			</div>
			<div id="unifikasi-Lampiran-I" role="tabpanel" aria-label="Lampiran-I" hidden={currentTab !== 'Lampiran-I'}>
				{@render unsupported('LAMPIRAN-I', 'Lampiran-I memuat dokumen yang dipersamakan dengan bukti pemotongan/pemungutan.')}
			</div>

			{#if editable}
				<FormActions message={instruction}>
					<ActionButton type="submit" form="unifikasi-delete-form" tone="danger">Hapus Konsep</ActionButton>
					<ActionButton type="submit" form="unifikasi-refresh-form" tone="quiet">Perbarui data BPPU</ActionButton>
					<ActionButton type="submit" form="unifikasi-submit-form" disabled={detail.sourcesChanged}>Bayar dan Lapor (Simulasi)</ActionButton>
				</FormActions>
			{:else if detail.status === 'menunggu_pembayaran'}
				<FormActions message={instruction}>
					<ActionButton type="submit" form="unifikasi-reopen-form" tone="quiet">Kembali ke Konsep</ActionButton>
					<ActionButton type="submit" form="unifikasi-pay-form" disabled={detail.sourcesChanged}>Bayar dan Lapor (Simulasi)</ActionButton>
				</FormActions>
			{:else}
				<FormActions message={instruction}>
					{#if detail.isLatest}
						<ActionButton type="submit" form="unifikasi-amend-form">Buat Pembetulan</ActionButton>
					{:else}
						<span class="hint">Pembetulan hanya dapat dibuat dari SPT terbaru pada rantai ini.</span>
					{/if}
				</FormActions>
			{/if}
		</Stack>
	</DocumentWorkspace>
</PageLayout>

<style>
	.hint, .unsupported { margin: 0; color: var(--color-text-muted, #5b6472); font-size: 0.875rem; }
</style>
