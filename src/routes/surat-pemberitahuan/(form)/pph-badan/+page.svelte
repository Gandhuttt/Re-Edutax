<script lang="ts">
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1C from './components/L1-C/L1C.svelte';
	import L2 from './components/L2/_L2.svelte';
	import { getSptPphBadan } from './getSptPphBadan.remote';
	import IndukRows from './IndukRows.svelte';
	import RadioPair from './RadioPair.svelte';
	import { getOpiniAuditor } from './components/Induk/getOpiniAuditor.remote';
	import { getSektorUsaha } from './components/Induk/getSektorUsaha.remote';
	import { saveSptPphBadan } from './saveSptPphBadan.remote';

	const { readonly, spt, lampiran1 } = await getSptPphBadan();
	const opiniAuditorOptions = await getOpiniAuditor();
	const sektorUsahaOptions = await getSektorUsaha();
	const saveForm = saveSptPphBadan.for(spt.id);
	const rupiah = new Intl.NumberFormat('id-ID');

	let labaRugi = $state(
		lampiran1.labaRugi.map((row) => ({
			id: row.id,
			kodeAkun: row.kodeAkun,
			namaAkun: row.namaAkun,
			komersial: row.komersial,
			tidakTermasukObjekPajak: row.tidakTermasukObjekPajak,
			dikenakanPphFinal: row.dikenakanPphFinal,
			fiskal: row.fiskal
		}))
	);
	let neraca = $state(
		lampiran1.neraca.map((row) => ({
			id: row.id,
			sisi: row.sisi,
			kodeAkun: row.kodeAkun,
			namaAkun: row.namaAkun,
			nilai: row.nilai
		}))
	);

	let menerimaPenghasilanPp23 = $state(Boolean(spt.menerimaPenghasilanPp23));
	let hanyaPenghasilanPp23 = $state(Boolean(spt.hanyaPenghasilanPp23));
	let menerimaPenghasilanFinal = $state(Boolean(spt.menerimaPenghasilanFinal));
	let menerimaPenghasilanBukanObjekPajak = $state(Boolean(spt.menerimaPenghasilanBukanObjekPajak));
	let diaudit = $state(Boolean(spt.opiniAuditorKode));
	let fasilitasPenanamanModal = $state(false);
	let fasilitasVokasi = $state(false);
	let kompensasiKerugian = $state(false);
	let fasilitasLitbang = $state(false);
	let kreditPajak = $state(false);
	let fasilitasPenguranganPph = $state(false);
	let persetujuanAngsuran = $state(false);
	let pengembalianPendahuluan = $state(false);
	let wajibLaporAngsuranPph25 = $state(false);
	let transaksiHubunganIstimewa = $state(false);
	let dokumenTransferPricing = $state(false);
	let penanamanModalAfiliasi = $state(false);
	let utangPiutangAfiliasi = $state(false);
	let penyusutanFiskal = $state(false);
	let biayaEntertainment = $state(false);
	let fasilitasDaerahTertentu = $state(false);
	let sisaLebihSarana = $state(false);
	let dividenLuarNegeri = $state(false);
	let pernyataanBenar = $state(false);
	let penandatangan = $state('wajib-pajak');
	let currentTab = $state('Induk');

	const totalFiskal = $derived(labaRugi.reduce((total, row) => total + Number(row.fiskal || 0), 0));
	const totalNeraca = $derived(neraca.reduce((total, row) => total + Number(row.nilai || 0), 0));
	const periodeMulai = $derived(new Date(`${spt.periodePembukuanMulai}T00:00:00`).getMonth() + 1);
	const periodeSelesai = $derived(new Date(`${spt.periodePembukuanSelesai}T00:00:00`).getMonth() + 1);

	const tarifPajakOptions = [
		'Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh',
		'Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh',
		'Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh',
		'Tarif Pajak Lainnya'
	];
	const tabs = ['Induk', 'L1-C', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L11-B'];
</script>

<div class="tw:w-full tw:p-10">
	<Card>
		{#snippet head()}
			<div class="tw:flex tw:w-full tw:items-center tw:justify-between">
				<span class="tw:text-2xl">SPT Tahunan PPh Badan</span>
				<span class="tw:text-sm">Tahun Pajak {spt.tahunPajak}</span>
			</div>
		{/snippet}
		{#snippet body()}
			<form {...saveForm}>
				<input type="hidden" name="labaRugiJson" value={JSON.stringify(labaRugi)} />
				<input type="hidden" name="neracaJson" value={JSON.stringify(neraca)} />
					<header class="tw:mb-5">
						<nav class="tw:overflow-x-auto tw:border-b tw:border-[#A9A9A9]">
							<ul class="tw:m-0! tw:flex tw:min-w-max tw:flex-row tw:p-0!">
								{#each tabs as tab}
									<li class:active-tab={currentTab === tab}>
										<button type="button" onclick={() => (currentTab = tab)}>{tab}</button>
									</li>
								{/each}
							</ul>
						</nav>
					</header>

					{#if currentTab === 'Induk'}
					<Induk></Induk>
						<!-- <div class="accordion" id="accordionSptPphBadan">
					<Accordion item="HEADER" target="#accordionSptPphBadan">
						<div class="tw:p-5">
							<Table class="tw:min-w-full tw:table-fixed tw:border-collapse">
								{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
								{#snippet body()}
									<tr>
										<td><Label class="tw:w-full"><span>Tahun Pajak/Bagian Tahun Pajak</span></Label></td>
										<td><Input type="text" value={spt.tahunPajak} disabled /></td>
									</tr>
									<tr>
										<td><Label class="tw:w-full"><span>Status</span></Label></td>
										<td><Input type="text" value={spt.statusSpt.toUpperCase()} disabled /></td>
									</tr>
									<tr>
										<td><Label><span>Periode Pembukuan</span></Label></td>
										<td>
											<div class="tw:flex tw:flex-row tw:gap-2">
												<Input type="text" value={periodeMulai} disabled />
												<Input type="text" value={periodeSelesai} disabled />
											</div>
										</td>
									</tr>
									<tr>
										<td><Label><span>Metode Pembukuan/Pencatatan</span></Label></td>
										<td>
											<Select name="metodePembukuan" value={spt.metodePembukuan} disabled={readonly}>
												<option value="kas">Akuntansi Berbasis Kas</option>
												<option value="akrual">Akuntansi Berbasis Akrual</option>
											</Select>
										</td>
									</tr>
								{/snippet}
							</Table>
							<div class="tw:my-2 tw:flex tw:flex-row">
								<div class="tw:mr-5">
									<Button type="button" color="#198754" disabled={readonly}>Prefill SPT</Button>
								</div>
								<p class="tw:hidden">Posting belum pernah dilakukan</p>
							</div>
						</div>
					</Accordion>

					<Accordion item="A. IDENTITAS WAJIB PAJAK" target="#accordionSptPphBadan">
						<div class="tw:p-5">
							<Table class="tw:min-w-full old-spt-table">
								{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
								{#snippet body()}
									<tr><td class="tw:w-10">1.</td><td class="tw:w-[35rem]"><Label><span>NPWP</span></Label></td><td><Input type="text" value={spt.npwp} disabled /></td></tr>
									<tr><td>2.</td><td><Label><span>Nama</span></Label></td><td><Input type="text" value="-" disabled /></td></tr>
									<tr><td>3.</td><td><Label><span>Alamat Email</span></Label></td><td><Input type="text" value="-" disabled /></td></tr>
									<tr><td>4.</td><td><Label><span>Nomor Telepon</span></Label></td><td><Input type="text" value="-" disabled /></td></tr>
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="B. INFORMASI LAPORAN KEUANGAN" target="#accordionSptPphBadan">
						<div class="tw:p-5">
							<Table class="tw:min-w-full old-spt-table">
								{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
								{#snippet body()}
									<tr>
										<td class="tw:w-10">1.</td>
										<td class="tw:w-[35rem]"><Label><span>Sektor Usaha Laporan Keuangan pada Lampiran 1 *</span></Label></td>
										<td>
											<Select name="sektorUsaha" value={spt.sektorUsahaKode ?? ''} required disabled={readonly}>
												<option value="" disabled>Pilih sektor usaha</option>
												{#each sektorUsahaOptions as sektorUsaha}
													<option value={sektorUsaha.value}>{sektorUsaha.label}</option>
												{/each}
											</Select>
										</td>
									</tr>
									<tr>
										<td>2.</td>
										<td><Label><span>Apakah Laporan Keuangan diaudit oleh Akuntan Publik? *</span></Label></td>
										<td><RadioPair name="diaudit" bind:value={diaudit} disabled={readonly} /></td>
									</tr>
									{#if diaudit}
										<tr>
											<td>2.a.</td>
											<td><Label><span>Opini Auditor</span></Label></td>
											<td>
												<Select name="opiniAuditor" value={spt.opiniAuditorKode ?? ''} required disabled={readonly}>
													<option value="" disabled>Pilih opini auditor</option>
													{#each opiniAuditorOptions as opiniAuditor}
														<option value={opiniAuditor.value}>{opiniAuditor.label}</option>
													{/each}
												</Select>
											</td>
										</tr>
										<tr>
											<td>2.b.</td>
											<td><Label><span>NPWP Kantor Akuntan Publik</span></Label></td>
											<td>
												<Input
													type="text"
													name="npwpKantorAkuntanPublik"
													value={spt.npwpKantorAkuntanPublik ?? ''}
													disabled={readonly}
												/>
											</td>
										</tr>
										<tr>
											<td>2.c.</td>
											<td><Label><span>Nama Kantor Akuntan Publik</span></Label></td>
											<td>
												<Input
													type="text"
													name="namaKantorAkuntanPublik"
													value={spt.namaKantorAkuntanPublik ?? ''}
													disabled={readonly}
												/>
											</td>
										</tr>
									{/if}
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="C. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL DAN TIDAK TERMASUK OBJEK PAJAK" target="#accordionSptPphBadan">
						<div class="tw:p-5">
							<Table class="tw:min-w-full old-spt-table">
								{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
								{#snippet body()}
									<tr>
										<td class="tw:w-10">1.a.</td>
										<td class="tw:w-[40rem]">Apakah Wajib Pajak menerima atau memperoleh penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</td>
										<td class="tw:w-[10rem]"><RadioPair name="menerimaPenghasilanPp23" bind:value={menerimaPenghasilanPp23} disabled={readonly} /></td>
										<td></td>
									</tr>
									<tr>
										<td>1.b.</td>
										<td>Apakah penghasilan Wajib Pajak semata-mata hanya penghasilan dari usaha dengan peredaran bruto tertentu yang dikenakan PPh yang bersifat Final? *</td>
										<td colspan="2"><RadioPair name="hanyaPenghasilanPp23" bind:value={hanyaPenghasilanPp23} disabled={readonly || !menerimaPenghasilanPp23} /></td>
									</tr>
									<tr>
										<td>2.</td>
										<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang dikenakan PPh yang bersifat final? *</td>
										<td><RadioPair name="menerimaPenghasilanFinal" bind:value={menerimaPenghasilanFinal} disabled={readonly} /></td>
										<td><Input class="tw:text-end" type="text" value="0" disabled /></td>
									</tr>
									<tr>
										<td>3.</td>
										<td>Apakah Wajib Pajak menerima atau memperoleh penghasilan yang tidak termasuk objek pajak? *</td>
										<td><RadioPair name="menerimaPenghasilanBukanObjekPajak" bind:value={menerimaPenghasilanBukanObjekPajak} disabled={readonly} /></td>
										<td><Input class="tw:text-end" type="text" value="0" disabled /></td>
									</tr>
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="D. PENGHITUNGAN PPh" target="#accordionSptPphBadan">
						<div class="tw:p-5">
							<Table class="tw:min-w-full old-spt-table">
								{#snippet head()}<tr class="tw:hidden"><td></td></tr>{/snippet}
								{#snippet body()}
									<tr><td class="tw:w-10">4.</td><td class="tw:w-[40rem]">Penghasilan Neto Fiskal sebelum Fasilitas Pajak</td><td></td><td><Input class="tw:text-end" type="text" value={rupiah.format(totalFiskal)} disabled /></td></tr>
									<tr><td>5.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Perpajakan Dalam Rangka Penanaman Modal berupa pengurangan penghasilan neto? *</td><td class="tw:w-[10rem]"><RadioPair name="D5" bind:value={fasilitasPenanamanModal} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
									<tr><td>6.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan Penghasilan Bruto untuk Kegiatan Praktik Kerja, Pemagangan, dan/atau Pembelajaran Dalam Rangka Pembinaan dan Pengembangan Sumber daya Manusia Berbasis Kompetensi Tertentu? *</td><td><RadioPair name="D6" bind:value={fasilitasVokasi} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
									<tr><td>7.</td><td>Penghasilan Neto Fiskal Setelah Fasilitas Pajak</td><td></td><td><Input class="tw:text-end" type="text" value={rupiah.format(totalFiskal)} disabled /></td></tr>
									<tr><td>8.</td><td>Apakah terdapat kerugian fiskal yang dapat dikompensasikan? *</td><td><RadioPair name="D8" bind:value={kompensasiKerugian} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
									<tr><td>9.</td><td>Penghasilan Kena Pajak</td><td></td><td><Input class="tw:text-end" type="text" value={rupiah.format(totalFiskal)} disabled /></td></tr>
									<tr><td>10.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan Penghasilan Bruto untuk kegiatan Penelitian dan Pengembangan Tertentu? *</td><td><RadioPair name="D10" bind:value={fasilitasLitbang} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
									<tr>
										<td>11.</td><td>Tarif Pajak *</td><td></td>
										<td>
											<Select value={spt.tarifPajak} disabled={readonly}>
												{#each tarifPajakOptions as tarif}
													<option value={tarif}>{tarif}</option>
												{/each}
											</Select>
										</td>
									</tr>
									<tr><td>12.</td><td>PPh Terutang *</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="E. PENGURANGAN PPh TERUTANG" target="#accordionSptPphBadan">
						<IndukRows>
							<tr><td class="tw:w-10">13.</td><td class="tw:w-[40rem]">Apakah terdapat kredit pajak yang dibayarkan di luar negeri dan/atau dipotong/pungut oleh pihak lain?</td><td class="tw:w-[10rem]"><RadioPair name="E13" bind:value={kreditPajak} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
							<tr><td>14.</td><td>Angsuran PPh Pasal 25</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
							<tr><td>15.</td><td>Surat Tagihan Pajak PPh Pasal 25 (hanya pokok pajak)</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled={readonly} /></td></tr>
							<tr><td>16.</td><td>Apakah Wajib Pajak memperoleh Fasilitas Pengurangan PPh Badan? *</td><td><RadioPair name="E16" bind:value={fasilitasPenguranganPph} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
						</IndukRows>
					</Accordion>

					<Accordion item="F. PPh KURANG/LEBIH BAYAR" target="#accordionSptPphBadan">
						<IndukRows>
							<tr><td class="tw:w-10">17.a.</td><td class="tw:w-[40rem]">PPh yang Kurang/Lebih Bayar</td><td class="tw:w-[10rem]"></td><td><Input class="tw:text-end" type="text" value={rupiah.format(spt.pphKurangLebihBayar)} disabled /></td></tr>
							<tr><td>17.b.</td><td>Apakah terdapat Surat Keputusan Persetujuan Pengangsuran atau Penundaan Pembayaran Pajak?</td><td><RadioPair name="F17B" bind:value={persetujuanAngsuran} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled={readonly || !persetujuanAngsuran} /></td></tr>
							<tr><td>17.c.</td><td>PPh yang masih harus dibayar atau lebih dibayar</td><td></td><td><Input class="tw:text-end" type="text" value={rupiah.format(spt.pphKurangLebihBayar)} disabled /></td></tr>
							<tr><td>18.a.</td><td>PPh yang kurang atau lebih bayar pada SPT yang dibetulkan</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
							<tr><td>18.b.</td><td>PPh yang kurang atau lebih bayar karena pembetulan</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
							<tr><td>19.a.</td><td>Lebih bayar pada Angka 17.a. atau 18.b. mohon untuk: (pilih salah satu): *</td><td colspan="2"><RadioPair falseLabel="dikembalikan melalui pemeriksaan" trueLabel="dikembalikan melalui Pengembalian Pendahuluan" name="F19A" bind:value={pengembalianPendahuluan} disabled={readonly} /></td></tr>
						</IndukRows>
						<div class="tw:p-2">
							<Card>
								{#snippet head()}<span>19.b. Informasi Rekening</span>{/snippet}
								{#snippet body()}
									<div class="tw:flex tw:flex-col tw:gap-2">
										<Label><span class="tw:inline-block tw:w-[10rem] tw:text-right">Pilih Rekening Bank</span> <Button type="button" color="#FFD230">File</Button> <Button type="button" color="#FFD230">Clear</Button></Label>
										<Label><span class="tw:inline-block tw:w-[10rem] tw:text-right">Nomor Rekening</span> <Input class="tw:w-[25%]!" type="text" disabled /></Label>
										<Label><span class="tw:inline-block tw:w-[10rem] tw:text-right">Nama Bank</span> <Input class="tw:w-[25%]!" type="text" disabled /></Label>
										<Label><span class="tw:inline-block tw:w-[10rem] tw:text-right">Nama Pemilik Rekening</span> <Input class="tw:w-[25%]!" type="text" disabled /></Label>
									</div>
								{/snippet}
							</Card>
						</div>
					</Accordion>

					<Accordion item="G. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN BERJALAN" target="#accordionSptPphBadan">
						<IndukRows>
							<tr><td class="tw:w-10">20.</td><td class="tw:w-[40rem]">Apakah Wajib Pajak merupakan Wajib Pajak tertentu yang harus menyampaikan Laporan Perhitungan Angsuran PPh Pasal 25? *</td><td class="tw:w-[10rem]"><RadioPair name="G20" bind:value={wajibLaporAngsuranPph25} disabled={readonly} /></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
						</IndukRows>
					</Accordion>

					<Accordion item="H. PERNYATAAN TRANSAKSI" target="#accordionSptPphBadan">
						<IndukRows>
							<tr><td class="tw:w-10">21.a.</td><td class="tw:w-[40rem]">Apakah terdapat transaksi yang dipengaruhi hubungan istimewa atau transaksi dengan pihak yang merupakan penduduk tax haven country?</td><td class="tw:w-[10rem]"><RadioPair name="H21A" bind:value={transaksiHubunganIstimewa} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.b.</td><td>Apakah Wajib Pajak berkewajiban menyampaikan Dokumen Penentuan Harga Transfer? *</td><td><RadioPair name="H21B" bind:value={dokumenTransferPricing} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.c.</td><td>Apakah terdapat penanaman modal pada perusahaan afiliasi? *</td><td><RadioPair name="H21C" bind:value={penanamanModalAfiliasi} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.d.</td><td>Apakah Wajib Pajak memiliki utang dari pemilik modal atau perusahaan afiliasi, dan/atau piutang ke pemilik modal atau perusahaan afiliasi? *</td><td><RadioPair name="H21D" bind:value={utangPiutangAfiliasi} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.e.</td><td>Apakah Wajib Pajak membebankan biaya penyusutan dan/atau amortisasi fiskal? *</td><td><RadioPair name="H21E" bind:value={penyusutanFiskal} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.f.</td><td>Apakah Wajib Pajak membebankan biaya entertainment, biaya promosi dan penjualan, penggantian atau imbalan dalam bentuk natura dan/atau kenikmatan, dan piutang yang nyata-nyata tidak dapat ditagih? *</td><td><RadioPair name="H21F" bind:value={biayaEntertainment} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.g.</td><td>Apakah Wajib Pajak memperoleh fasilitas perpajakan dalam rangka penanaman modal di bidang-bidang usaha tertentu dan/atau daerah-daerah tertentu selain pengurangan penghasilan neto *</td><td><RadioPair name="H21G" bind:value={fasilitasDaerahTertentu} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.h.</td><td>Apakah Wajib Pajak memiliki sisa lebih yang digunakan untuk pembangunan dan pengadaan sarana dan prasarana? *</td><td><RadioPair name="H21H" bind:value={sisaLebihSarana} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.i.</td><td>Apakah Wajib Pajak menerima atau memperoleh penghasilan dividen dari luar negeri dan melaporkannya sebagai penghasilan yang tidak termasuk objek pajak? *</td><td><RadioPair name="H21I" bind:value={dividenLuarNegeri} disabled={readonly} /></td><td></td></tr>
							<tr><td>21.j.</td><td>Kelebihan PPh yang bersifat final atas penghasilan dari usaha dengan peredaran bruto tertentu yang dapat diajukan pengembalian pajak *</td><td></td><td><Input class="tw:text-end" type="text" value="0" disabled /></td></tr>
						</IndukRows>
					</Accordion>

					<Accordion item="I. LAMPIRAN LAINNYA" target="#accordionSptPphBadan">
						<div class="tw:flex tw:flex-col tw:gap-5 tw:p-5">
							<div class="tw:flex tw:w-full tw:flex-row">
								<span class="tw:inline-block tw:basis-1/3 tw:shrink">a.1. Laporan Keuangan/Laporan Keuangan yang Telah Diaudit *</span>
								<div class="tw:basis-auto tw:grow tw:shrink-[2]">
									<Card>
										{#snippet head()}
											<div class="tw:py-2">
												<Button type="button" color="#FFD230" disabled={readonly}>Pilih</Button>
												<Button type="button" color="#FFD230" disabled={readonly}>Unggah</Button>
												<Button type="button" color="#FFD230" disabled={readonly}>Batal</Button>
											</div>
										{/snippet}
										{#snippet body()}<span>Belum ada dokumen</span>{/snippet}
									</Card>
								</div>
							</div>
							<div class="tw:flex tw:w-full tw:flex-row">
								<span class="tw:inline-block tw:basis-1/3 tw:shrink">Files Uploaded</span>
								<Table class="tw:basis-auto tw:grow tw:shrink-[2] tw:border-1 tw:border-[#A9A9A9] attachment-table">
									{#snippet head()}<tr><th>NO</th><th>NAMA DOKUMEN</th><th>TINDAKAN</th></tr>{/snippet}
									{#snippet body()}<tr><td colspan="3" class="tw:text-center">Belum ada dokumen</td></tr>{/snippet}
								</Table>
							</div>
						</div>
					</Accordion>

						<Accordion item="J. PERNYATAAN" target="#accordionSptPphBadan">
							<div class="tw:flex tw:flex-col tw:p-5">
							<Label class="tw:flex! tw:items-center tw:gap-2">
								<Input type="checkbox" bind:checked={pernyataanBenar} disabled={readonly} />
								<span>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas.</span>
							</Label>
							<div class="tw:flex tw:w-fulls tw:flex-row tw:gap-5">
								<span class="tw:flex">Penandatangan *</span>
								<Label class="tw:flex tw:items-center tw:gap-1"><input type="radio" bind:group={penandatangan} value="wajib-pajak" disabled={readonly} /> <span>Wajib Pajak</span></Label>
								<Label class="tw:flex tw:items-center tw:gap-1"><input type="radio" bind:group={penandatangan} value="kuasa" disabled={readonly} /> <span>Kuasa Wajib Pajak</span></Label>
							</div>
							</div>
						</Accordion>
						</div> -->

					{:else if currentTab === 'L1-C'}
						<div class="tw:flex tw:flex-col tw:gap-4">
					<Accordion item="Lampiran 1A - Laba Rugi" target="#accordionSptPphBadan">
						<div class="tw:overflow-x-auto tw:p-5">
							<Table class="tw:w-full attachment-table">
								{#snippet head()}<tr><th>Kode</th><th>Nama Akun</th><th>Komersial</th><th>Tidak Objek Pajak</th><th>PPh Final</th><th>Fiskal</th></tr>{/snippet}
								{#snippet body()}
									{#each labaRugi as row}
										<tr>
											<td>{row.kodeAkun}</td>
											<td>{row.namaAkun}</td>
											<td><Input type="text" bind:value={row.komersial} disabled={readonly} /></td>
											<td><Input type="text" bind:value={row.tidakTermasukObjekPajak} disabled={readonly} /></td>
											<td><Input type="text" bind:value={row.dikenakanPphFinal} disabled={readonly} /></td>
											<td><Input type="text" bind:value={row.fiskal} disabled={readonly} /></td>
										</tr>
									{/each}
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="Lampiran 1B - Neraca" target="#accordionSptPphBadan">
						<div class="tw:overflow-x-auto tw:p-5">
							<Table class="tw:w-full attachment-table">
								{#snippet head()}<tr><th>Sisi</th><th>Kode</th><th>Nama Akun</th><th>Nilai</th></tr>{/snippet}
								{#snippet body()}
									{#each neraca as row}
										<tr>
											<td>{row.sisi}</td>
											<td>{row.kodeAkun}</td>
											<td>{row.namaAkun}</td>
											<td><Input type="text" bind:value={row.nilai} disabled={readonly} /></td>
										</tr>
									{/each}
									<tr><td colspan="3">Total</td><td><Input class="tw:text-end" type="text" value={rupiah.format(totalNeraca)} disabled /></td></tr>
								{/snippet}
							</Table>
						</div>
					</Accordion>

					<Accordion item="Lampiran 1C - Old UI Draft" target="#accordionSptPphBadan">
						<L1C />
					</Accordion>
						</div>

					{:else if currentTab === 'L2'}
						<L2 currentTab="L2" />
					{:else}
						<div class="tw:border tw:border-[#A9A9A9] tw:p-5">
							<span class="tw:text-sm">{currentTab} belum memiliki UI lama yang bisa dipakai.</span>
						</div>
					{/if}

				{#if !readonly}
					<div class="tw:mt-4 tw:flex tw:gap-2">
						<Button type="submit" name="action" value="Simpan Konsep" color="#FFD230">Simpan Konsep</Button>
						<Button type="submit" name="action" value="Simpan Lapor" color="#FFD230">Simpan Lapor</Button>
					</div>
				{/if}
			</form>
		{/snippet}
	</Card>
</div>

<style>
	.old-spt-table tr {
		border: none;
	}

	.old-spt-table tr:nth-child(even) {
		background-color: #f9f6ee;
	}

	.old-spt-table td {
		padding: 0.25rem 0.5rem;
	}

	.old-spt-table span,
	.old-spt-table td,
	.attachment-table span,
	.attachment-table td,
	.attachment-table th {
		font-size: 0.8rem;
	}

	.attachment-table td,
	.attachment-table th {
		border: 1px solid #a9a9a9;
		padding: 0.25rem 0.5rem;
	}

	.attachment-table th {
		background-color: #ffd230;
		font-weight: 600;
		text-align: center;
	}

	.attachment-table td {
		text-align: right;
	}

	.attachment-table td:last-child {
		text-align: center;
	}

	nav button {
		padding: 1rem;
	}

	nav li {
		position: relative;
	}

	nav li::before {
		bottom: 0;
		left: 0;
		height: 1px;
		width: 0;
		background-color: brown;
		content: '';
		position: absolute;
		transition: 300ms;
	}

	nav li:hover::before,
	nav li.active-tab::before {
		width: 100%;
	}
</style>
