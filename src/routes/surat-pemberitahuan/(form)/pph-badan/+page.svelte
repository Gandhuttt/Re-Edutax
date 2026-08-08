<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { tick } from 'svelte';
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import Induk from './components/Induk/_Induk.svelte';
	import L1 from './components/L1/_L1.svelte';
	import L2 from './components/L2/_L2.svelte';
	import L3 from './components/L3/_L3.svelte';
	import L4 from './components/L4/_L4.svelte';
	import L5 from './components/L5/_L5.svelte';
	import L6 from './components/L6/_L6.svelte';
	import L7 from './components/L7/_L7.svelte';
	import L10A from './components/L10-A/_L10A.svelte';
	import L10B from './components/L10-B/_L10B.svelte';
	import L10C from './components/L10-C/_L10C.svelte';
	import L10D from './components/L10-D/_L10D.svelte';
	import L13A from './components/L13-A/_L13A.svelte';
	import L13B from './components/L13-B/_L13B.svelte';
	import { getSptPphBadan } from './getSptPphBadan.remote';
	import IndukRows from './IndukRows.svelte';
	import RadioPair from './RadioPair.svelte';
	import { getOpiniAuditor } from './components/Induk/getOpiniAuditor.remote';
	import { getSektorUsaha } from './components/Induk/getSektorUsaha.remote';
	import { getNegara } from './components/L2/getNegara.remote';
	import { getKodeKoreksiFiskal } from './components/L1/getKodeKoreksiFiskal.remote';
	import { getLampiran1LabaRugiTemplates } from './components/L1/getLampiran1LabaRugiTemplates.remote';
	import { getLampiran1NeracaTemplates } from './components/L1/getLampiran1NeracaTemplates.remote';
	import { getJenisPenghasilanKreditPajakLuarNegeri } from './components/L3/getJenisPenghasilanKreditPajakLuarNegeri.remote';
	import { getMataUang } from './components/L3/getMataUang.remote';
	import { getJenisPajakDipotongDipungut } from './components/L3/getJenisPajakDipotongDipungut.remote';
	import { getObjekPajak } from './components/L4/getObjekPajak.remote';
	import { saveSptPphBadan } from './saveSptPphBadan.remote';

	const { readonly, spt, lampiran1, lampiran2, lampiran3, lampiran4, lampiran5 } = await getSptPphBadan();
	const opiniAuditorOptions = await getOpiniAuditor();
	const sektorUsahaOptions = await getSektorUsaha();
	const negaraOptions = await getNegara();
	const kodeKoreksiFiskalOptions = await getKodeKoreksiFiskal();
	const lampiran1LabaRugiTemplates = await getLampiran1LabaRugiTemplates();
	const lampiran1NeracaTemplates = await getLampiran1NeracaTemplates();
	const jenisPenghasilanKreditPajakLuarNegeriOptions = await getJenisPenghasilanKreditPajakLuarNegeri();
	const mataUangOptions = await getMataUang();
	const jenisPajakDipotongDipungutOptions = await getJenisPajakDipotongDipungut();
	const objekPajakOptions = await getObjekPajak();
	const saveForm = saveSptPphBadan.for(spt.id);

	const lampiran1LabaRugiTemplatesBySektor = new Map<
		string,
		{ lampiranKode: string | null; rows: typeof lampiran1LabaRugiTemplates }
	>();
	for (const row of lampiran1LabaRugiTemplates) {
		const entry = lampiran1LabaRugiTemplatesBySektor.get(row.sektorUsahaKode) ?? {
			lampiranKode: row.lampiranKode,
			rows: []
		};
		entry.rows.push(row);
		lampiran1LabaRugiTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	const lampiran1NeracaTemplatesBySektor = new Map<string, { rows: typeof lampiran1NeracaTemplates }>();
	for (const row of lampiran1NeracaTemplates) {
		const entry = lampiran1NeracaTemplatesBySektor.get(row.sektorUsahaKode) ?? { rows: [] };
		entry.rows.push(row);
		lampiran1NeracaTemplatesBySektor.set(row.sektorUsahaKode, entry);
	}

	let sektorUsaha = $state(spt.sektorUsahaKode ?? '');

	let labaRugi = $state(
		lampiran1.nilai.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilaiKomersial: row.nilaiKomersial,
			nonObjekPajak: row.nonObjekPajak,
			dikenakanPphFinal: row.dikenakanPphFinal,
			penyesuaianFiskalPositif: row.penyesuaianFiskalPositif,
			penyesuaianFiskalNegatif: row.penyesuaianFiskalNegatif,
			kodePenyesuaianFiskal: row.kodePenyesuaianFiskal
		}))
	);

	let neraca = $state(
		lampiran1.neraca.map((row) => ({
			id: row.id,
			akunId: row.akunId,
			nilai: row.nilai
		}))
	);

	let l2a = $state(
		lampiran2.pemegangSaham.map((row) => ({
			id: row.id,
			nama: row.nama,
			alamat: row.alamat,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			jabatan: row.jabatan,
			nilaiModal: row.nilaiModal,
			persentase: row.persentase,
			dividen: row.dividen
		}))
	);
	let l2b = $state(
		lampiran2.penyertaanModal.map((row) => ({
			id: row.id,
			nama: row.nama,
			negara: row.negaraKode ?? '',
			npwp: row.npwp,
			modalNilai: row.modalNilai,
			modalPersen: row.modalPersen,
			utangNilai: row.utangNilai,
			utangTahun: row.utangTahun ?? 0,
			utangBunga: row.utangBunga,
			piutangNilai: row.piutangNilai,
			piutangTahun: row.piutangTahun ?? 0,
			piutangBunga: row.piutangBunga
		}))
	);

	let l3a = $state(
		lampiran3.penghasilanLuarNegeri.map((row) => ({
			id: row.id,
			namaPemberiPenghasilan: row.namaPemberiPenghasilan,
			negara: row.negaraKode,
			tanggal: row.tanggal,
			jenisPenghasilan: row.jenisPenghasilanKode,
			penghasilanNeto: row.penghasilanNeto,
			pphLuarNegeri: row.pphLuarNegeri,
			mataUang: row.mataUangKode,
			pphLuarNegeriMataUangAsing: row.pphLuarNegeriMataUangAsing,
			kreditPajakYangDapatDikreditkan: row.kreditPajakYangDapatDikreditkan,
			keterangan: row.keterangan
		}))
	);

	let l3aPengembalianPengurangan = $state(lampiran3.pengembalianPenguranganPphLuarNegeriTahunSebelumnya);

	let l3b = $state(
		lampiran3.pphDipotong.map((row) => ({
			id: row.id,
			namaPemotongPemungut: row.namaPemotongPemungut,
			npwp: row.npwp,
			jenisPajak: row.jenisPajakKode,
			dpp: row.dpp,
			pph: row.pph,
			nomorBukti: row.nomorBukti,
			tanggalBukti: row.tanggalBukti
		}))
	);

	let l4a = $state(
		lampiran4.penghasilanFinal.map((row) => ({
			id: row.id,
			npwpPemotongPemungutPenyetor: row.npwpPemotongPemungutPenyetor,
			namaPemotongPemungutPenyetor: row.namaPemotongPemungutPenyetor,
			objekPajak: row.objekPajakKode,
			dasarPengenaanPajak: row.dasarPengenaanPajak,
			tarif: row.tarif,
			pphFinalTerutang: row.pphFinalTerutang,
			nomorBuktiPotong: row.nomorBuktiPotong,
			tanggalBuktiPotong: row.tanggalBuktiPotong ?? '',
			keterangan: row.keterangan
		}))
	);

	let l5a = $state(
		lampiran5.tku.map((t) => ({
			id: t.id,
			nitku: t.nitku,
			nama: t.nama,
			alamat: t.alamat,
			kelurahan: t.kelurahan,
			kecamatan: t.kecamatan,
			kabupaten: t.kabupaten,
			provinsi: t.provinsi,
			bulanan: Array.from({ length: 12 }, (_, i) => {
				const bulan = i + 1;
				const existing = lampiran5.bulanan.find((b) => b.tkuId === t.id && b.bulan === bulan);
				return {
					bulan,
					jumlahPeredaranBruto: existing?.jumlahPeredaranBruto ?? 0
				};
			})
		}))
	);

	let l5bDipotong = $state(
		Array.from({ length: 12 }, (_, i) => {
			const bulan = i + 1;
			const existing = lampiran5.dipotongBulanan.find((b) => b.bulan === bulan);
			return { bulan, nilai: existing?.nilai ?? 0 };
		})
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
	let currentTab = $state({
		tab: 'Induk',
		title: ''
	});
	let saveError = $state('');

	const tarifPajakOptions = [
		'Tarif Ketentuan Umum sebagaimana Pasal 17 ayat (1) huruf b UU PPh',
		'Tarif fasilitas sebagaimana Pasal 17 ayat (2b) UU PPh',
		'Tarif fasilitas sebagaimana Pasal 31E ayat (1) UU PPh',
		'Tarif Pajak Lainnya'
	];
	const tabs = ['Induk', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10-A', 'L10-B', 'L10-C', 'L10-D', 'L11-B', 'L13-A', 'L13-B'];
	const tabLabel = (tab: string) => {
		if (tab !== 'L1') return tab;
		const lampiranKode = lampiran1LabaRugiTemplatesBySektor.get(sektorUsaha)?.lampiranKode;
		return `L1${lampiranKode ? `-${lampiranKode}` : ''}`;
	};
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
			<form
				novalidate
				{...saveForm.enhance(async (form) => {
					saveError = '';

					try {
						if (await form.submit()) {
							await tick();
							form.element.reset();
						} else {
							const issues = form.fields.allIssues();
							saveError = issues?.length
								? issues.map((issue) => issue.message).join('; ')
								: 'Periksa kembali data yang diisi.';
						}
					} catch (e) {
						console.error(e);
						saveError = isHttpError(e)
							? e.body.message
							: e instanceof Error
								? e.message
								: 'Gagal menyimpan SPT PPh Badan.';
					}
				})}
			>
				<input type="hidden" name="labaRugi" value={JSON.stringify(labaRugi)} />
				<input type="hidden" name="neraca" value={JSON.stringify(neraca)} />
				<input type="hidden" name="l2a" value={JSON.stringify(l2a)} />
				<input type="hidden" name="l2b" value={JSON.stringify(l2b)} />
				<input type="hidden" name="l3a" value={JSON.stringify(l3a)} />
				<input type="hidden" name="l3aPengembalianPengurangan" value={l3aPengembalianPengurangan} />
				<input type="hidden" name="l3b" value={JSON.stringify(l3b)} />
				<input type="hidden" name="l4a" value={JSON.stringify(l4a)} />
				<input type="hidden" name="l5a" value={JSON.stringify(l5a)} />
				<input type="hidden" name="l5bDipotong" value={JSON.stringify(l5bDipotong)} />
				<header class="tw:mb-5">
					<nav class="tw:overflow-x-auto tw:border-b tw:border-[#A9A9A9]">
						<ul class="tw:m-0! tw:flex tw:min-w-max tw:flex-row tw:p-0!">
							{#each tabs as tab}
								<li class:active-tab={currentTab.tab === tab}>
									<button type="button" onclick={() => (currentTab.tab = tab)}>{tabLabel(tab)}</button>
								</li>
							{/each}
						</ul>
					</nav>
				</header>

				<Induk bind:currentTab {spt} {readonly} bind:sektorUsaha></Induk>

				<!-- Lampiran -->
				<div class="{currentTab.tab === "Induk" ? "tw:hidden" : ""}">
					<h2>{currentTab.title}</h2>

					<!-- Header -->
					<Card>
					{#snippet head()}
						<span class="tw:text-xl!">HEADER</span>
					{/snippet}
					{#snippet body()}
						<div>
							<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
							{#snippet head()}
								<tr class="tw:hidden">
									<td><Input hidden/></td>
								</tr>
							{/snippet}
							{#snippet body()}
								<tr>
									<td class="tw:w-[20rem]"><span>Tahun Pajak/Bagian Tahun Pajak</span></td>
									<td><Input type={"text"} value={spt.tahunPajak} disabled /></td>
								</tr>
								<tr>
									<td><span class="tw:mr-10">Nomor Identitas WP</span></td>
									<td><Input type={"text"} value={"00000000000000000"} disabled /></td>
								</tr>
							{/snippet}
							</Table>
						</div>
					{/snippet}
					</Card>
				</div>

				<L1
					bind:currentTab
					{sektorUsaha}
					templatesBySektor={lampiran1LabaRugiTemplatesBySektor}
					bind:labaRugi
					neracaTemplatesBySektor={lampiran1NeracaTemplatesBySektor}
					bind:neraca
					{readonly}
					{kodeKoreksiFiskalOptions}
				/>
				<L2 bind:currentTab bind:l2a bind:l2b {readonly} {negaraOptions}/>
				<L3
					bind:currentTab
					bind:l3a
					bind:l3aPengembalianPengurangan
					bind:l3b
					{readonly}
					{negaraOptions}
					jenisPenghasilanOptions={jenisPenghasilanKreditPajakLuarNegeriOptions}
					{mataUangOptions}
					jenisPajakOptions={jenisPajakDipotongDipungutOptions}
				/>
				<L4 bind:currentTab bind:l4a {readonly} {objekPajakOptions}/>
				<L5 bind:currentTab bind:l5a bind:l5bDipotong {readonly}/>
				<L6 bind:currentTab/>
				<L7 bind:currentTab/>
				<L10A bind:currentTab/>
				<L10B bind:currentTab/>
				<L10C bind:currentTab/>
				<L10D bind:currentTab/>
				<L13A bind:currentTab/>
				<L13B bind:currentTab/>

					<!--
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

						<!-- <div class="tw:border tw:border-[#A9A9A9] tw:p-5">
							<span class="tw:text-sm">{currentTab} belum memiliki UI lama yang bisa dipakai.</span>
						</div> -->

				{#if saveError}
					<div class="tw:mt-4">
						<Alert bg={'#dc2626'}>
							{#snippet head()}
								<span>!</span>
							{/snippet}
							{#snippet body()}
								<span>{saveError}</span>
							{/snippet}
						</Alert>
					</div>
				{/if}

				{#if !readonly}
					<div class="tw:mt-4 tw:flex tw:gap-2">
						<Button type="submit" name="action" value="Simpan Konsep" color="var(--color-secondary)"><span class="tw:text-white">Simpan Konsep</span></Button>
						<Button type="submit" name="action" value="Simpan Lapor" color="var(--color-secondary)"><span class="tw:text-white">Simpan Lapor</span></Button>
					</div>
				{/if}
			</form>
		{/snippet}
	</Card>
</div>

<style>
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
