<script lang="ts">
	import type { PageProps } from './$types';
	import type { Spt2126Source } from '$lib/helpers/spt-pph-2126';
	import { Breadcrumbs, DataTableViewport, DocumentTabs, DocumentWorkspace, FormSection, InlineAlert, PageHeading, PageLayout, Stack, StatusBadge } from '$lib/re-ui-components';

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
</script>

<svelte:head><title>SPT Masa PPh 21/26 — Simulasi</title></svelte:head>

{#snippet headingActions()}
	<StatusBadge label={statusLabel} tone={detail.status === 'dilaporkan' ? 'success' : detail.status === 'menunggu_pembayaran' ? 'attention' : 'neutral'} />
{/snippet}

{#snippet sourceTable(rows: Spt2126Source[], annual = false)}
	{#if rows.length === 0}
		<p class="empty">Tidak ada bukti potong aktif dan diterbitkan untuk lampiran ini pada masa pajak terpilih.</p>
	{:else}
		<DataTableViewport label="Rincian bukti potong sumber" minWidth="1120px" density="compact">
			<table>
				<thead><tr><th>No.</th><th>Jenis / nomor</th><th>Penerima penghasilan</th><th>Identitas</th><th>Kode objek</th><th>Masa / tahun</th><th class="right">Penghasilan bruto</th><th class="right">Total PPh (termasuk DTP)</th><th class="right">PPh DTP</th><th>Status / ID sumber</th></tr></thead>
				<tbody>
					{#each rows as row, index (`${row.jenis}-${row.id}`)}
						<tr>
							<td>{index + 1}</td><td>{row.jenis}<br /><strong>{row.nomor || 'Tanpa nomor'}</strong></td>
							<td>{row.nama || '—'}</td><td>{row.identitas || '—'}</td><td>{row.kodeObjek || '—'}</td><td>{row.masaPajak} / {row.tahun}</td>
							<td class="right">{money.format(annual ? row.brutoTahunan ?? 0 : row.bruto)}</td>
							<td class="right">{money.format(annual ? row.pajakTahunan ?? 0 : row.pajak)}</td>
							<td class="right">{money.format(annual ? row.dtpTahunan ?? 0 : row.dtp)}</td>
							<td>{row.status}<br /><small class="source-id">{row.id}</small></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>
	{/if}
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Surat Pemberitahuan', href: '/surat-pemberitahuan/konsep' }, { label: 'SPT Masa PPh 21/26' }]} />
	<PageHeading title="SPT Masa PPh 21/26" eyebrow={`NONMIGRASI · ${month.format(new Date(Date.UTC(detail.tahun, detail.masaPajak - 1, 1)))} ${detail.tahun} · ${detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}`}`} actions={headingActions} />
	<div class="spt-form">
		<Stack gap="16px">
			<InlineAlert compact title="Simulator lokal" message="Tidak mengirim data ke DJP/Coretax dan tidak menerbitkan bukti pelaporan atau pembayaran resmi. Kesetaraan akhir backend, termasuk pembetulan baru, belum dinyatakan terverifikasi pada Coretax." />
			{#if form?.message}<InlineAlert tone="error" title="Tindakan belum berhasil" message={form.message} />{/if}
			{#if data.notice}<InlineAlert tone="success" message={data.notice} />{/if}
			<DocumentWorkspace>
				<Stack gap="16px">
					<FormSection title="Identitas dan periode" description="Dikunci dari akun pemotong dan konsep SPT; tidak dapat diubah melalui formulir ini.">
						<dl class="identity">
							<div><dt>Nama pemotong</dt><dd>{detail.namaPemotong || '—'}</dd></div><div><dt>NPWP pemotong</dt><dd>{detail.npwpPemotong}</dd></div>
							<div><dt>Masa / tahun pajak</dt><dd>{detail.masaPajak} / {detail.tahun}</dd></div><div><dt>Jenis SPT</dt><dd>{detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}`}</dd></div>
							<div><dt>Posting terakhir (WIB)</dt><dd>{detail.tanggalPosting ? date.format(new Date(detail.tanggalPosting)) : 'Belum diposting'}</dd></div>
							<div><dt>Dilaporkan (simulasi, WIB)</dt><dd>{detail.tanggalDilaporkan ? date.format(new Date(detail.tanggalDilaporkan)) : 'Belum dilaporkan'}</dd></div>
						</dl>
						<details class="technical"><summary>Identitas rekaman simulasi</summary><dl class="identity"><div><dt>ID SPT</dt><dd>{detail.id}</dd></div><div><dt>Rantai normal / pembetulan</dt><dd>{detail.chainId}</dd></div><div><dt>Revisi</dt><dd>{detail.revision}</dd></div><div><dt>Dibuat (WIB)</dt><dd>{date.format(new Date(detail.createdAt))}</dd></div></dl></details>
						<details class="technical"><summary>Versi dan nilai sumber posting</summary><pre class="signature">{detail.sourceSignature ?? 'Belum ada snapshot sumber.'}</pre></details>
					</FormSection>
					<FormSection title="Posting dan kelengkapan sumber">
						<p class="note">{detail.snapshot ? 'Angka dan lampiran di bawah berasal dari snapshot posting, bukan sumber langsung.' : 'Angka di bawah adalah pratinjau sumber aktif. Posting diperlukan untuk menyimpan snapshot.'}</p>
						{#if editable && detail.sourcesChanged}<InlineAlert tone="warning" compact message="Bukti potong sumber berubah sejak posting. Posting ulang sebelum melaporkan." />{/if}
						{#if !editable}<p class="note">SPT telah dikunci. Perubahan bukti potong tidak mengubah snapshot ini. Gunakan pembetulan setelah pelaporan.</p>{/if}
						{#if editable}
							<div class="actions"><form method="POST" action={`?/post&id=${detail.id}`}><button class="secondary" disabled={dirty}>Posting SPT</button></form><a class="text-link" href={`/surat-pemberitahuan/pph-21-26?id=${detail.id}`}>Muat ulang / periksa sumber</a></div>
							<p class="note">Urutan: simpan konsep → posting → laporkan simulasi. Posting menggunakan isian yang sudah tersimpan.</p>
						{/if}
					</FormSection>
					<DocumentTabs {tabs} bind:active={currentTab} ariaLabel="Lampiran SPT Masa PPh 21/26" />
					<div id="spt2126-Induk" role="tabpanel" aria-label="Induk" hidden={currentTab !== 'Induk'}>
						<Stack gap="16px">
							<FormSection title="Induk — rekap pemotongan" description="PPh 21 = L-IA + L-IB + L-III Pasal 21. PPh 26 = L-III Pasal 26. L-II merupakan informasi tahunan dan tidak ditambahkan lagi.">
								<DataTableViewport label="Rekap lampiran" minWidth="720px">
									<table><thead><tr><th>Lampiran</th><th class="right">Jumlah bukti</th><th class="right">Bruto</th><th class="right">Total PPh (termasuk DTP)</th><th class="right">DTP</th></tr></thead><tbody>
										{#each [{ label: 'L-IA — MP bulanan', summary: totals.lia }, { label: 'L-IB — masa terakhir BPA1/BPA2', summary: totals.lib }, { label: 'L-II — tahunan (informasi)', summary: totals.lii }, { label: 'L-III — Pasal 21', summary: totals.liii21 }, { label: 'L-III — Pasal 26', summary: totals.liii26 }] as item}
											<tr><th scope="row">{item.label}</th><td class="right">{item.summary.jumlah}</td><td class="right">{money.format(item.summary.bruto)}</td><td class="right">{money.format(item.summary.pajak)}</td><td class="right">{money.format(item.summary.dtp)}</td></tr>
										{/each}
									</tbody></table>
								</DataTableViewport>
							</FormSection>
							<FormSection title="Perhitungan kurang / lebih bayar" description="Hasil server, dipisahkan per pasal. Nilai negatif tetap ditampilkan sebagai lebih bayar; tidak saling diperhitungkan antara Pasal 21 dan 26.">
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
								<FormSection title="Kompensasi dan SP2D simulasi" description="Hanya masukan ini yang dapat diedit. Simpan untuk memperbarui perhitungan; penyimpanan membatalkan posting sebelumnya.">
									<fieldset disabled={!editable}>
										<label>Skenario wajib pajak simulator<select name="jenisWajibPajak" value={values.jenisWajibPajak}><option value="perusahaan">Perusahaan</option><option value="instansi_pemerintah">Instansi pemerintah</option></select></label>
										<p class="note">Skenario simulator, bukan klasifikasi WP DJP. SP2D hanya dapat digunakan dalam skenario instansi pemerintah.</p>
										<div class="fields">
											{#each [21, 26] as pasal}
												{@const selectedSource = pasal === 21 ? values.kompensasi21SumberId : values.kompensasi26SumberId}
												<div class="article-fields"><h4>PPh Pasal {pasal}</h4>
													<label>Sumber kompensasi<select name={`kompensasi${pasal}SumberId`} value={pasal === 21 ? values.kompensasi21SumberId ?? '' : values.kompensasi26SumberId ?? ''}>
														<option value="">Tidak menggunakan kompensasi</option>
														{#if selectedSource && !detail.kompensasiTersedia.some((source) => source.id === selectedSource && source.pasal === pasal)}<option value={selectedSource}>Sumber tersimpan {selectedSource} · tidak tersedia untuk penggunaan baru</option>{/if}
														{#each detail.kompensasiTersedia.filter((source) => source.pasal === pasal) as source (source.id)}<option value={source.id}>{source.masaPajak}/{source.tahun} · sisa {money.format(source.tersedia)}</option>{/each}
													</select></label>
													<label>Nilai kompensasi (Rp)<input name={`kompensasi${pasal}`} type="number" min="0" step="1" inputmode="numeric" value={pasal === 21 ? values.kompensasi21 : values.kompensasi26} /></label>
													<label>SP2D simulator (Rp)<input name={`sp2d${pasal}`} type="number" min="0" step="1" inputmode="numeric" value={pasal === 21 ? values.sp2d21 : values.sp2d26} /></label>
												</div>
											{/each}
										</div>
										<p class="note">Sumber kompensasi hanya dari lebih bayar yang tersedia pada simulator. Nilai tidak boleh melebihi sisa sumber dan tidak dapat dipakai ganda.</p>
										<label>Keterangan SP2D simulator<textarea name="sp2dKeterangan" rows="3" maxlength="1000" value={values.sp2dKeterangan}></textarea></label>
										<p class="note">SP2D adalah isian latihan terbatas, bukan validasi atau pencairan SP2D pemerintah. Keterangan wajib diisi jika nilainya lebih dari nol.</p>
										<label class="declaration"><input type="checkbox" name="pernyataan" checked={values.pernyataan} /><span>Saya menyatakan telah memeriksa identitas, bukti potong, dan perhitungan SPT ini untuk pelaporan simulasi. Pernyataan tidak wajib saat menyimpan konsep, tetapi wajib sebelum melaporkan.</span></label>
										{#if editable}<div class="actions"><button class="primary">Simpan konsep</button>{#if dirty}<span class="note" role="status">Ada perubahan belum disimpan.</span>{/if}</div>{/if}
									</fieldset>
								</FormSection>
							</form>
						</Stack>
					</div>
					<div id="spt2126-L-IA" role="tabpanel" aria-label="L-IA" hidden={currentTab !== 'L-IA'}><FormSection title="L-IA — pemotongan bulanan MP" description="Bukti MP aktif dan diterbitkan pada masa / tahun pajak SPT.">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'MP'))}</FormSection></div>
					<div id="spt2126-L-IB" role="tabpanel" aria-label="L-IB" hidden={currentTab !== 'L-IB'}><FormSection title="L-IB — masa terakhir BPA1/BPA2" description="Aturan simulator: bruto masa terakhir = bruto tahunan dikurangi MP efektif sebelumnya pada pemotong, penerima, objek, dan periode BPA yang sama. PPh memakai nilai kurang / lebih dipotong masa terakhir, termasuk nilai negatif.">{@render sourceTable(annualRows)}</FormSection></div>
					<div id="spt2126-L-II" role="tabpanel" aria-label="L-II" hidden={currentTab !== 'L-II'}><FormSection title="L-II — rincian tahunan / bagian tahun BPA1/BPA2" description="Bukti yang sama dengan L-IB, memakai bruto dan PPh tahunan. Tidak dibagi 12 dan tidak ditambahkan kembali ke Induk.">{@render sourceTable(annualRows, true)}</FormSection></div>
					<div id="spt2126-L-III" role="tabpanel" aria-label="L-III" hidden={currentTab !== 'L-III'}><Stack gap="16px"><FormSection title="L-III — BP21 (Pasal 21)">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'BP21'))}</FormSection><FormSection title="L-III — BP26 (Pasal 26)">{@render sourceTable(totals.sources.filter((row) => row.jenis === 'BP26'))}</FormSection></Stack></div>
					<FormSection title="Tindakan SPT simulasi">
						{#if editable}
							<p class="note">Pelaporan memerlukan pernyataan tersimpan dan posting yang masih mutakhir. Kurang bayar positif per pasal masuk ke status menunggu pembayaran; nol / lebih bayar langsung dilaporkan.</p>
							{#if !detail.input.pernyataan}<p class="warning">Centang pernyataan pada Induk, simpan konsep, lalu posting untuk mengaktifkan pelaporan.</p>{/if}
							{#if !detail.posted}<p class="warning">Konsep belum memiliki posting yang berlaku.</p>{/if}
							<div class="actions"><form method="POST" action={`?/submit&id=${detail.id}`}><button class="primary" disabled={!canSubmit}>Laporkan simulasi</button></form><form method="POST" action={`?/delete&id=${detail.id}`} onsubmit={(event) => { if (!confirm('Hapus konsep SPT ini? Tindakan tidak dapat dibatalkan.')) event.preventDefault(); }}><button class="danger">Hapus konsep</button></form></div>
						{:else if detail.status === 'menunggu_pembayaran'}
							<p class="note">Simulasikan pembayaran nilai positif masing-masing pasal untuk menyelesaikan pelaporan. Tidak ada transaksi bank atau penerbitan NTPN resmi.</p>
							{#if detail.sourcesChanged}<InlineAlert tone="warning" compact message="Sumber berubah. Kembalikan ke konsep, periksa isian, dan posting ulang sebelum melanjutkan." />{/if}
							<div class="actions"><form method="POST" action={`?/pay&id=${detail.id}`}><button class="primary" disabled={detail.sourcesChanged}>Bayar dan selesaikan simulasi</button></form><form method="POST" action={`?/reopen&id=${detail.id}`}><button class="secondary">Kembali ke konsep</button></form></div>
							<p class="note">Kembali ke konsep menghapus posting dan pernyataan serta melepaskan reservasi kompensasi. Tidak membatalkan tagihan DJP karena seluruh proses ini hanya simulasi.</p>
						{:else}
							<p class="note">SPT dilaporkan dan hanya dapat dibaca. Pembetulan membuat konsep baru dalam rantai yang sama dengan nilai pengganti penuh, bukan selisih bukti potong.</p>
							<form method="POST" action={`?/amend&id=${detail.id}`}><button class="primary">Buat konsep pembetulan</button></form>
						{/if}
					</FormSection>
				</Stack>
			</DocumentWorkspace>
		</Stack>
	</div>
</PageLayout>

<style>
	.spt-form, .spt-form :global(form), .spt-form :global([role='tabpanel']) { min-width: 0; max-width: 100%; }
	.identity { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin: 0; }
	.identity div { min-width: 0; }
	dt { color: var(--ui-muted); font-size: 12px; margin-bottom: 5px; }
	dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
	.signature { white-space: pre-wrap; overflow-wrap: anywhere; max-width: 100%; font-size: 11px; }
	.technical { margin-top: 18px; font-size: 13px; }
	.technical summary { cursor: pointer; margin-bottom: 12px; }
	.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
	.article-fields { min-width: 0; display: grid; gap: 14px; }
	h4 { margin: 0; color: var(--ui-navy); }
	fieldset { min-width: 0; border: 0; margin: 0; padding: 0; }
	label { display: grid; gap: 7px; font-size: 14px; font-weight: 600; color: var(--ui-navy); }
	input:not([type='checkbox']), select, textarea { box-sizing: border-box; width: 100%; min-width: 0; max-width: 100%; border: 1px solid var(--ui-line-strong); border-radius: 3px; background: var(--ui-paper); color: var(--ui-ink, #243247); padding: 11px; font: inherit; }
	textarea { resize: vertical; }
	input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid var(--ui-yellow); outline-offset: 2px; }
	fieldset:disabled { opacity: .8; }
	.declaration { display: flex; align-items: flex-start; gap: 10px; line-height: 1.6; margin: 20px 0; }
	.declaration input { flex: 0 0 auto; margin-top: 5px; width: 18px; height: 18px; }
	.note { font-size: 13px; line-height: 1.6; color: var(--ui-muted); margin: 12px 0; }
	.warning { color: #895416; font-size: 13px; }
	.empty { padding: 20px 0; margin: 0; color: var(--ui-muted); line-height: 1.6; }
	.actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 16px; }
	button { border: 1px solid var(--ui-navy); padding: 11px 16px; min-height: 44px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; border-radius: 3px; }
	.primary { background: var(--ui-navy); color: white; }
	.secondary { background: var(--ui-paper); color: var(--ui-navy); }
	.danger { border-color: #a13c31; background: var(--ui-paper); color: #a13c31; }
	button:disabled { opacity: .45; cursor: not-allowed; }
	.text-link { color: var(--ui-navy); font-size: 14px; }
	.right { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
	.source-id { display: block; max-width: 220px; overflow-wrap: anywhere; }
	@media (max-width: 650px) { .identity, .fields { grid-template-columns: minmax(0, 1fr); } .actions { align-items: stretch; } .actions form, .actions button { width: 100%; } }
</style>
