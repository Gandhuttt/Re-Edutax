<script lang="ts">
	import type { PageProps } from './$types';
	import type { Spt2126Source } from '$lib/helpers/spt-pph-2126';
	import { ActionButton, AmountSummary, Breadcrumbs, CheckboxField, DataTableViewport, DisclosureItem, DocumentTabs, DocumentWorkspace, FieldGrid, FormActions, FormField, FormSection, InlineAlert, KeyValueGrid, LinkButton, PageHeading, PageLayout, ResponsiveGrid, SelectField, Stack, StatusBadge, TextAreaField, TextBlock } from '$lib/re-ui-components';

	let { data, form }: PageProps = $props();
	let currentTab = $state('Induk');
	let dirty = $state(false);
	const tabs = ['Induk', 'L-IA', 'L-IB', 'L-II', 'L-III'].map((label) => ({ label, panelId: `spt2126-${label}` }));
	const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
	const month = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' });
	const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });
	const detail = $derived(data.detail);
	const editable = $derived(detail.status === 'konsep');
	const values = $derived(form?.values ?? detail.input);
	const totals = $derived(detail.snapshot ?? detail.preview);
	const canSubmit = $derived(editable && detail.posted && !detail.sourcesChanged && detail.input.pernyataan && !dirty);
	const statusLabel = $derived(detail.status === 'dilaporkan' ? 'Dilaporkan (simulasi)' : detail.status === 'menunggu_pembayaran' ? 'Menunggu pembayaran simulasi' : 'Konsep');
	const annualRows = $derived(totals.sources.filter((row) => row.jenis === 'BPA1' || row.jenis === 'BPA2'));
	const periodLabel = $derived(`${month.format(new Date(Date.UTC(detail.tahun, detail.masaPajak - 1, 1)))} ${detail.tahun}`);
	const sourceState = $derived(detail.sourcesChanged ? 'Sumber berubah' : detail.posted ? 'Sudah diposting' : 'Belum diposting');
</script>

<svelte:head><title>SPT Masa PPh 21/26 — Simulasi</title></svelte:head>

{#snippet headingActions()}
	<StatusBadge label={statusLabel} tone={detail.status === 'dilaporkan' ? 'success' : detail.status === 'menunggu_pembayaran' ? 'attention' : 'neutral'} />
{/snippet}

{#snippet sourceTable(rows: Spt2126Source[], annual = false)}
	{#if rows.length === 0}
		<InlineAlert compact title="Belum ada bukti potong" message="Bukti potong aktif yang sudah diterbitkan pada masa ini akan tampil di sini." />
	{:else}
		<DataTableViewport label="Rincian bukti potong sumber" minWidth="1120px" density="compact">
			<table>
				<thead><tr><th>No.</th><th>Bukti potong</th><th>Penerima penghasilan</th><th>Kode objek</th><th>Masa / tahun</th><th class="right">Penghasilan bruto</th><th class="right">Total PPh</th><th class="right">PPh DTP</th><th>Status</th></tr></thead>
				<tbody>
					{#each rows as row, index (`${row.jenis}-${row.id}`)}
						<tr>
							<td>{index + 1}</td><td>{row.jenis}<br /><strong>{row.nomor || 'Tanpa nomor'}</strong></td>
							<td>{row.nama || '—'}<br /><small>{row.identitas || '—'}</small></td><td>{row.kodeObjek || '—'}</td><td>{row.masaPajak} / {row.tahun}</td>
							<td class="right">{money.format(annual ? row.brutoTahunan ?? 0 : row.bruto)}</td>
							<td class="right">{money.format(annual ? row.pajakTahunan ?? 0 : row.pajak)}</td>
							<td class="right">{money.format(annual ? row.dtpTahunan ?? 0 : row.dtp)}</td>
							<td><details><summary>{row.status}</summary><code>{row.id}</code></details></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>
	{/if}
{/snippet}

<PageLayout contentWidth="1320px">
	<Breadcrumbs items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Surat Pemberitahuan', href: '/surat-pemberitahuan/konsep' }, { label: 'SPT Masa PPh 21/26' }]} />
	<PageHeading title="SPT Masa PPh 21/26" eyebrow={`${periodLabel} · ${detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}`}`} actions={headingActions} />
		<Stack gap="16px">
			<InlineAlert compact title="Mode latihan · Nonmigrasi" message="Pelaporan dan pembayaran hanya simulasi. Tidak ada data yang dikirim ke DJP/Coretax." />
			{#if form?.message}<InlineAlert tone="error" title="Tindakan belum berhasil" message={form.message} />{/if}
			{#if data.notice}<InlineAlert tone="success" message={data.notice} />{/if}
			<DocumentWorkspace>
				<Stack gap="24px">
					<FormSection title={detail.namaPemotong || 'Wajib pajak pemotong'} description={`NPWP ${detail.npwpPemotong}`}>
						<KeyValueGrid columns={3} surface="paper" items={[
							{ label: 'Masa pajak', value: periodLabel },
							{ label: 'Sumber bukti potong', value: sourceState },
							{ label: 'Posting terakhir (WIB)', value: detail.tanggalPosting ? date.format(new Date(detail.tanggalPosting)) : 'Belum diposting' }
						]} />
						{#if editable}
							<FormActions message={detail.snapshot ? 'Angka dan lampiran mengikuti posting terakhir.' : 'Simpan konsep → posting sumber → laporkan simulasi.'}>
								<LinkButton href={`/surat-pemberitahuan/pph-21-26?id=${detail.id}`} tone="text" size="sm" icon="">Periksa sumber</LinkButton>
								<form method="POST" action={`?/post&id=${detail.id}`}><ActionButton type="submit" tone="quiet" disabled={dirty}>Posting SPT</ActionButton></form>
							</FormActions>
						{/if}
					</FormSection>
					{#if editable && detail.sourcesChanged}<InlineAlert tone="warning" compact message="Bukti potong sumber berubah. Posting ulang sebelum melaporkan." />{/if}
					{#if dirty}<InlineAlert tone="warning" compact message="Ada perubahan belum disimpan. Simpan konsep sebelum posting dan pelaporan." />{/if}
					<DisclosureItem title="Detail dokumen dan posting">
						<Stack gap="16px">
						<KeyValueGrid columns={3} items={[
							{ label: 'Masa pajak', value: periodLabel },
							{ label: 'Jenis SPT', value: detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}` },
							{ label: 'Posting terakhir (WIB)', value: detail.tanggalPosting ? date.format(new Date(detail.tanggalPosting)) : 'Belum diposting' },
							{ label: 'Dilaporkan (WIB)', value: detail.tanggalDilaporkan ? date.format(new Date(detail.tanggalDilaporkan)) : 'Belum dilaporkan' },
							{ label: 'ID SPT', value: detail.id },
							{ label: 'Rantai normal / pembetulan', value: detail.chainId },
							{ label: 'Revisi', value: detail.revision },
							{ label: 'Dibuat (WIB)', value: date.format(new Date(detail.createdAt)) }
						]} />
							<DisclosureItem title="Versi sumber posting"><KeyValueGrid columns={1} items={[{ label: 'Snapshot sumber', value: detail.sourceSignature ?? 'Belum ada snapshot sumber.' }]} /></DisclosureItem>
							<TextBlock tone="muted" size="small">SPT dilaporkan menyimpan snapshot tetap. Kesetaraan validasi akhir backend dan Pembetulan baru pada Coretax belum terverifikasi.</TextBlock>
						</Stack>
					</DisclosureItem>
					<DocumentTabs {tabs} bind:active={currentTab} ariaLabel="Lampiran SPT Masa PPh 21/26" />
					<div id="spt2126-Induk" role="tabpanel" aria-label="Induk" hidden={currentTab !== 'Induk'}>
						<Stack gap="24px">
							<ResponsiveGrid columns={2} gap="16px" aria-label="Ringkasan kewajiban pajak">
								{#each [{ pasal: 21, total: totals.pasal21 }, { pasal: 26, total: totals.pasal26 }] as item}
									<AmountSummary label={`PPh Pasal ${item.pasal}`} value={money.format(Math.abs(item.total.harusDibayar))} description="Setelah kompensasi, SP2D, dan pembayaran terdahulu">
										{#snippet status()}<StatusBadge label={item.total.harusDibayar < 0 ? 'Lebih bayar' : item.total.harusDibayar > 0 ? 'Kurang bayar' : 'Nihil'} tone={item.total.harusDibayar > 0 ? 'attention' : 'neutral'} />{/snippet}
									</AmountSummary>
								{/each}
							</ResponsiveGrid>
							<FormSection number="01" title="Rekap bukti potong" description="L-II adalah informasi tahunan dan tidak dijumlahkan kembali ke Induk." bordered>
								<DataTableViewport label="Rekap lampiran" minWidth="720px">
									<table><thead><tr><th>Lampiran</th><th class="right">Jumlah bukti</th><th class="right">Bruto</th><th class="right">Total PPh (termasuk DTP)</th><th class="right">DTP</th></tr></thead><tbody>
										{#each [{ label: 'L-IA — MP bulanan', summary: totals.lia }, { label: 'L-IB — masa terakhir BPA1/BPA2', summary: totals.lib }, { label: 'L-II — tahunan (informasi)', summary: totals.lii }, { label: 'L-III — Pasal 21', summary: totals.liii21 }, { label: 'L-III — Pasal 26', summary: totals.liii26 }] as item}
											<tr><th scope="row">{item.label}</th><td class="right">{item.summary.jumlah}</td><td class="right">{money.format(item.summary.bruto)}</td><td class="right">{money.format(item.summary.pajak)}</td><td class="right">{money.format(item.summary.dtp)}</td></tr>
										{/each}
									</tbody></table>
								</DataTableViewport>
							</FormSection>
							<FormSection number="02" title="Perhitungan pajak" description="Lebih bayar satu pasal tidak mengurangi kurang bayar pasal lainnya." bordered>
								<DataTableViewport label="Perhitungan per pasal" minWidth="650px">
									<table><thead><tr><th>Uraian</th><th class="right">PPh Pasal 21</th><th class="right">PPh Pasal 26</th></tr></thead><tbody>
										{#each [
											{ label: 'Penghasilan bruto', a: totals.pasal21.bruto, b: totals.pasal26.bruto },
											{ label: 'Total PPh (termasuk DTP)', a: totals.pasal21.pajak, b: totals.pasal26.pajak },
											{ label: 'PPh ditanggung pemerintah (fasilitas kode 4 / 11)', a: totals.pasal21.dtp, b: totals.pasal26.dtp },
											{ label: 'Kompensasi terpilih', a: totals.pasal21.kompensasi, b: totals.pasal26.kompensasi },
											{ label: 'SP2D simulator', a: totals.pasal21.sp2d, b: totals.pasal26.sp2d },
											{ label: 'Kurang / (lebih) bayar', a: totals.pasal21.kurangLebihBayar, b: totals.pasal26.kurangLebihBayar },
											{ label: 'Pembayaran terdahulu dalam rantai dan periode sama', a: totals.pasal21.pembayaranSebelumnya, b: totals.pasal26.pembayaranSebelumnya },
											{ label: 'Selisih wajib dibayar / (lebih bayar)', a: totals.pasal21.harusDibayar, b: totals.pasal26.harusDibayar },
											{ label: 'Kredit lebih bayar simulator pada SPT ini', a: detail.kredit21, b: detail.kredit26 },
											{ label: 'Pembayaran pada SPT ini (simulasi)', a: detail.pembayaran21, b: detail.pembayaran26 }
										] as item}<tr><th scope="row">{item.label}</th><td class="right">{money.format(item.a)}</td><td class="right">{money.format(item.b)}</td></tr>{/each}
									</tbody></table>
								</DataTableViewport>
							</FormSection>
							<form method="POST" action={`?/save&id=${detail.id}`} oninput={() => dirty = true} onchange={() => dirty = true}>
								<FormSection number="03" title="Kompensasi dan penyesuaian" description="Simpan perubahan, lalu posting ulang untuk memperbarui perhitungan." bordered>
										<Stack gap="24px">
											<FieldGrid>
												<SelectField label="Skenario wajib pajak" name="jenisWajibPajak" value={values.jenisWajibPajak} disabled={!editable} options={[{ value: 'perusahaan', label: 'Perusahaan' }, { value: 'instansi_pemerintah', label: 'Instansi pemerintah' }]} onchange={() => dirty = true} hint="Skenario latihan, bukan klasifikasi WP DJP. SP2D hanya untuk instansi pemerintah." />
											</FieldGrid>
											<ResponsiveGrid columns={2}>
												{#each [21, 26] as pasal}
													{@const selectedSource = pasal === 21 ? values.kompensasi21SumberId : values.kompensasi26SumberId}
													<FormSection title={`PPh Pasal ${pasal}`} bordered>
														<Stack gap="18px">
														<SelectField label="Sumber kompensasi" name={`kompensasi${pasal}SumberId`} value={selectedSource ?? ''} disabled={!editable} onchange={() => dirty = true} options={[
															{ value: '', label: 'Tidak menggunakan kompensasi' },
															...(selectedSource && !detail.kompensasiTersedia.some((source) => source.id === selectedSource && source.pasal === pasal) ? [{ value: selectedSource, label: 'Sumber tersimpan · tidak tersedia untuk penggunaan baru' }] : []),
															...detail.kompensasiTersedia.filter((source) => source.pasal === pasal).map((source) => ({ value: source.id, label: `${source.masaPajak}/${source.tahun} · sisa ${money.format(source.tersedia)}` }))
														]} />
														<FormField label="Nilai kompensasi (Rp)" name={`kompensasi${pasal}`} type="number" min="0" step="1" inputmode="numeric" disabled={!editable} value={String(pasal === 21 ? values.kompensasi21 : values.kompensasi26)} />
														<FormField label="SP2D simulasi (Rp)" name={`sp2d${pasal}`} type="number" min="0" step="1" inputmode="numeric" disabled={!editable} value={String(pasal === 21 ? values.sp2d21 : values.sp2d26)} />
														</Stack>
													</FormSection>
												{/each}
											</ResponsiveGrid>
											<TextAreaField label="Keterangan SP2D simulasi" name="sp2dKeterangan" rows={3} maxLength={1000} value={values.sp2dKeterangan} disabled={!editable} hint="Wajib jika SP2D lebih dari nol. Isian latihan, bukan pencairan SP2D pemerintah." />
											<TextBlock tone="muted" size="small">Kompensasi hanya dari saldo lebih bayar yang tersedia. Nilai tidak boleh melebihi sisa sumber atau digunakan ganda.</TextBlock>
											<CheckboxField name="pernyataan" checked={values.pernyataan} disabled={!editable} label="Saya telah memeriksa data SPT ini" description="Identitas, bukti potong, dan perhitungan sudah diperiksa untuk pelaporan simulasi. Pernyataan wajib disimpan sebelum melaporkan." />
											{#if editable}<FormActions><ActionButton type="submit">Simpan konsep</ActionButton></FormActions>{/if}
										</Stack>
								</FormSection>
							</form>
						</Stack>
					</div>
					<div id="spt2126-L-IA" role="tabpanel" aria-label="L-IA" hidden={currentTab !== 'L-IA'}><FormSection title="L-IA — pemotongan bulanan MP" description="Bukti MP aktif dan diterbitkan pada masa / tahun pajak SPT.">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'MP'))}</FormSection></div>
					<div id="spt2126-L-IB" role="tabpanel" aria-label="L-IB" hidden={currentTab !== 'L-IB'}><FormSection title="L-IB — masa terakhir BPA1/BPA2" description="Aturan simulator: bruto masa terakhir = bruto tahunan dikurangi MP efektif sebelumnya pada pemotong, penerima, objek, dan periode BPA yang sama. PPh memakai nilai kurang / lebih dipotong masa terakhir, termasuk nilai negatif.">{@render sourceTable(annualRows)}</FormSection></div>
					<div id="spt2126-L-II" role="tabpanel" aria-label="L-II" hidden={currentTab !== 'L-II'}><FormSection title="L-II — rincian tahunan / bagian tahun BPA1/BPA2" description="Bukti yang sama dengan L-IB, memakai bruto dan PPh tahunan. Tidak dibagi 12 dan tidak ditambahkan kembali ke Induk.">{@render sourceTable(annualRows, true)}</FormSection></div>
					<div id="spt2126-L-III" role="tabpanel" aria-label="L-III" hidden={currentTab !== 'L-III'}><Stack gap="16px"><FormSection title="L-III — BP21 (Pasal 21)">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'BP21'))}</FormSection><FormSection title="L-III — BP26 (Pasal 26)">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'BP26'))}</FormSection></Stack></div>
					<FormSection title={editable ? 'Selesaikan SPT' : detail.status === 'menunggu_pembayaran' ? 'Pembayaran simulasi' : 'SPT telah dilaporkan'} bordered>
						{#if editable}
							<TextBlock tone="muted" size="small">Simpan konsep, posting sumber, lalu laporkan. Kurang bayar akan dilanjutkan ke pembayaran simulasi.</TextBlock>
							{#if !canSubmit}
								<TextBlock tone="muted" size="small" role="status">{dirty ? 'Simpan perubahan terlebih dahulu.' : !detail.input.pernyataan ? 'Centang dan simpan pernyataan di tab Induk sebelum melaporkan.' : !detail.posted ? 'Posting SPT untuk mengaktifkan pelaporan.' : 'Posting ulang sumber yang berubah sebelum melaporkan.'}</TextBlock>
							{/if}
							<FormActions><form method="POST" action={`?/submit&id=${detail.id}`}><ActionButton type="submit" disabled={!canSubmit}>Laporkan simulasi</ActionButton></form><form method="POST" action={`?/delete&id=${detail.id}`} onsubmit={(event) => { if (!confirm('Hapus konsep SPT ini? Tindakan tidak dapat dibatalkan.')) event.preventDefault(); }}><ActionButton type="submit" tone="danger">Hapus konsep</ActionButton></form></FormActions>
						{:else if detail.status === 'menunggu_pembayaran'}
							<TextBlock tone="muted" size="small">Simulasikan pembayaran nilai positif masing-masing pasal untuk menyelesaikan pelaporan. Tidak ada transaksi bank atau penerbitan NTPN resmi.</TextBlock>
							{#if detail.sourcesChanged}<InlineAlert tone="warning" compact message="Sumber berubah. Kembalikan ke konsep, periksa isian, dan posting ulang sebelum melanjutkan." />{/if}
							<FormActions><form method="POST" action={`?/pay&id=${detail.id}`}><ActionButton type="submit" disabled={detail.sourcesChanged}>Bayar dan selesaikan simulasi</ActionButton></form><form method="POST" action={`?/reopen&id=${detail.id}`}><ActionButton type="submit" tone="quiet">Kembali ke konsep</ActionButton></form></FormActions>
							<TextBlock tone="muted" size="small">Kembali ke konsep menghapus posting dan pernyataan serta melepaskan reservasi kompensasi. Tidak membatalkan tagihan DJP karena seluruh proses ini hanya simulasi.</TextBlock>
						{:else}
							<TextBlock tone="muted" size="small">SPT dilaporkan dan hanya dapat dibaca. Pembetulan membuat konsep baru dalam rantai yang sama dengan nilai pengganti penuh, bukan selisih bukti potong.</TextBlock>
							<form method="POST" action={`?/amend&id=${detail.id}`}><ActionButton type="submit">Buat konsep pembetulan</ActionButton></form>
						{/if}
					</FormSection>
				</Stack>
			</DocumentWorkspace>
		</Stack>
</PageLayout>

