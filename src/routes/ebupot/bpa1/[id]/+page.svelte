<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { bpa1PtkpOptions } from '$lib/helpers/ptkp-bpa1';
	import { getContext } from 'svelte';
	import { getFasilitasPajakBpa1 } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBpa1 } from '../../objekPajakBpa1.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa1 } from './getBpa1.remote';
	import { submitBpa1 } from './submitBpa1.remote';
	import { terbitkanBpa1 } from '../terbitkanBpa1.remote';
	import { updateBpa1 } from './updateBpa1.remote';

	const bpa1 = await getBpa1();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([
		getObjekPajakBpa1(),
		getFasilitasPajakBpa1(),
		getJenisDokumenEbupot()
	]);

	let masaPajakAwalState = $state(bpa1.masaPajakAwal);
	let tahunAwalState = $state(bpa1.tahunAwal);
	let masaPajakAkhirState = $state(bpa1.masaPajakAkhir);
	let tahunAkhirState = $state(bpa1.tahunAkhir);
	let bekerjaLebihState = $state(String(bpa1.bekerjaDiLebihDariSatuPemberiKerja));
	let pegawaiAsingState = $state(String(bpa1.pegawaiAsing));
	let nomorIdentitasWpState = $state(bpa1.nomorIdentitasWp);
	let namaState = $state(bpa1.nama);
	let statusPtkpState = $state(bpa1.statusPtkp ?? '');
	let jabatanState = $state(bpa1.jabatan);
	let kodeObjekPajakIdState = $state(bpa1.kodeObjekPajakId ?? '');
	let fasilitasPajakIdState = $state(bpa1.fasilitasPajakId ?? '');
	let jenisPemotonganState = $state(bpa1.jenisPemotongan ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bpa1.npwpPemotong}000000`;

	let gajiState = $state(bpa1.gajiPensiunThtJht);
	let tunjanganPphState = $state(bpa1.tunjanganPph);
	let tunjanganLainnyaState = $state(bpa1.tunjanganLainnya);
	let honorariumState = $state(bpa1.honorarium);
	let premiAsuransiState = $state(bpa1.premiAsuransi);
	let naturaState = $state(bpa1.natura);
	let tantiemBonusState = $state(bpa1.tantiemBonus);
	const jumlahPenghasilanBruto = $derived(
		gajiState +
			tunjanganPphState +
			tunjanganLainnyaState +
			honorariumState +
			premiAsuransiState +
			naturaState +
			tantiemBonusState
	);

	const monthCount = $derived(
		(tahunAkhirState - tahunAwalState) * 12 + (masaPajakAkhirState - masaPajakAwalState) + 1
	);
	const biayaJabatan = $derived(
		Math.min(Math.round(jumlahPenghasilanBruto * 0.05), 500_000 * Math.max(monthCount, 0))
	);
	let iuranPensiunState = $state(bpa1.iuranPensiun);
	let zakatState = $state(bpa1.zakat);
	const jumlahPengurangan = $derived(biayaJabatan + iuranPensiunState + zakatState);
	const penghasilanNeto = $derived(jumlahPenghasilanBruto - jumlahPengurangan);

	let jenisDokumenIdState = $state(bpa1.jenisDokumenId ?? '');
	let nomorDokumenState = $state(bpa1.nomorDokumen);
	let tanggalDokumenState = $state(bpa1.tanggalDokumen ?? '');

	let nomorBuktiSebelumnyaState = $state(bpa1.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa1.penghasilanNetoSebelumnya);
	const netoGabungan = $derived(penghasilanNeto + penghasilanNetoSebelumnyaState);
	const isDisetahunkan = $derived(jenisPemotonganState === 'KURANG_SETAHUN_DISETAHUNKAN');
	const penghasilanNetoSetahunDisetahunkan = $derived(
		isDisetahunkan && monthCount > 0 ? Math.round((netoGabungan * 12) / monthCount) : netoGabungan
	);

	const ptkpAmounts: Record<string, number> = {
		TK0: 54_000_000,
		TK1: 58_500_000,
		TK2: 63_000_000,
		TK3: 67_500_000,
		K0: 58_500_000,
		K1: 63_000_000,
		K2: 67_500_000,
		K3: 72_000_000
	};
	const penghasilanTidakKenaPajak = $derived(ptkpAmounts[statusPtkpState] ?? 0);
	const penghasilanKenaPajak = $derived(
		Math.max(
			0,
			Math.floor((penghasilanNetoSetahunDisetahunkan - penghasilanTidakKenaPajak) / 1000) * 1000
		)
	);

	// Client-side mirror of resolveBpa1Tax, for display only -- the server
	// is the source of truth at save time. Same tax(x) = x*Rate/100-Minus
	// mechanism as BP21's cumulative branch.
	const resolvedTax = $derived.by(() => {
		if (!selectedObjekPajak) return { tarif: 0, pajakPenghasilan: 0 };
		const fasilitas = fasilitasOptions.find((f) => f.id === fasilitasPajakIdState);
		if (!fasilitas) return { tarif: 0, pajakPenghasilan: 0 };
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) =>
				entry.TaxCertificateCode === fasilitas.kode ||
				entry.TaxCertificateCodes?.includes(fasilitas.kode)
		);
		if (!item || penghasilanKenaPajak <= 0) return { tarif: 0, pajakPenghasilan: 0 };
		const band = item.Rates?.find(
			(b) => penghasilanKenaPajak >= b.Min && penghasilanKenaPajak <= b.Max
		);
		if (!band) return { tarif: 0, pajakPenghasilan: 0 };
		return {
			tarif: band.Rate,
			pajakPenghasilan: Math.round(penghasilanKenaPajak * (band.Rate / 100) - (band.Minus ?? 0))
		};
	});
	const pphPasal21Terutang = $derived(
		isDisetahunkan && monthCount > 0
			? Math.round((resolvedTax.pajakPenghasilan * monthCount) / 12)
			: resolvedTax.pajakPenghasilan
	);
	let pphDipotongSebelumnyaState = $state(bpa1.pphPasal21DipotongSebelumnya);
	const pphTerutangPadaIni = $derived(pphPasal21Terutang - pphDipotongSebelumnyaState);

	// Fasilitas code 11 = PPh Pasal 21 DTP -- moves this bukti's tax to
	// "Ditanggung Pemerintah" instead of the employee's own credit.
	const pphDitanggungPemerintah = $derived.by(() => {
		const fasilitas = fasilitasOptions.find((f) => f.id === fasilitasPajakIdState);
		return fasilitas?.kode === '11' ? pphTerutangPadaIni : 0;
	});
	// Live-verified on Coretax: with no prior monthly Bukti Pemotongan
	// Bulanan Pegawai Tetap recorded, this equals PPh Terutang pada Ini
	// minus PPh Ditanggung Pemerintah -- see updateBpa1.remote.ts.
	const pphKurangLebihDesember = $derived(pphTerutangPadaIni - pphDitanggungPemerintah);

	async function cariNpwpPenerima() {
		const wp = await getWajibPajak({ npwp: nomorIdentitasWpState });
		if (wp) namaState = wp.nama;
	}

	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const jenisPemotonganOptions = [
		{ value: 'KURANG_SETAHUN', label: 'Kurang dari Setahun' },
		{
			value: 'KURANG_SETAHUN_DISETAHUNKAN',
			label: 'Kurang dari setahun yang penghasilannya disetahunkan'
		},
		{ value: 'SETAHUN_PENUH', label: 'Setahun Penuh' }
	];
</script>

{#snippet formContent()}
	<div class="tw:flex tw:flex-col tw:gap-5 tw:w-full">
		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Informasi Umum</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Bekerja di Lebih dari Satu Pemberi Kerja</span>
						<Select
							name="bekerjaDiLebihDariSatuPemberiKerja"
							id={getContext('id')}
							bind:value={bekerjaLebihState}
							disabled={!bpa1.canEdit}
						>
							<option value="false">Tidak</option>
							<option value="true">Ya</option>
						</Select>
					</Label>
					<Label>
						<span>Masa Pajak Awal</span>
						<div class="tw:flex tw:flex-row tw:gap-2">
							<Select
								name="masaPajakAwal"
								id={getContext('id')}
								bind:value={masaPajakAwalState}
								disabled={!bpa1.canEdit}
							>
								{#each months as m (m)}
									<option value={m}>{formatMonth(m)}</option>
								{/each}
							</Select>
							<Input
								name="tahunAwal"
								type="number"
								bind:value={tahunAwalState}
								disabled={!bpa1.canEdit}
								class="tw:w-30"
							/>
						</div>
					</Label>
					<Label>
						<span>Masa Pajak Akhir</span>
						<div class="tw:flex tw:flex-row tw:gap-2">
							<Select
								name="masaPajakAkhir"
								id={getContext('id')}
								bind:value={masaPajakAkhirState}
								disabled={!bpa1.canEdit}
							>
								{#each months as m (m)}
									<option value={m}>{formatMonth(m)}</option>
								{/each}
							</Select>
							<Input
								name="tahunAkhir"
								type="number"
								bind:value={tahunAkhirState}
								disabled={!bpa1.canEdit}
								class="tw:w-30"
							/>
						</div>
					</Label>
					<Label>
						<span>Status</span>
						<Input type="text" id={getContext('id')} value={bpa1.status} disabled />
					</Label>
					<Label>
						<span>Pegawai Asing</span>
						<Select
							name="pegawaiAsing"
							id={getContext('id')}
							bind:value={pegawaiAsingState}
							disabled={!bpa1.canEdit}
						>
							<option value="false">Tidak</option>
							<option value="true">Ya</option>
						</Select>
					</Label>
					<Label>
						<span>Nomor Identitas WP</span>
						<div class="tw:flex tw:flex-row">
							<Input
								class={bpa1.canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
								name="nomorIdentitasWp"
								type="text"
								id={getContext('id')}
								bind:value={nomorIdentitasWpState}
								disabled={!bpa1.canEdit}
							/>
							{#if bpa1.canEdit}
								<Button
									type="button"
									color="#FFD230"
									class="tw:rounded-s-none! tw:w-30"
									onclick={cariNpwpPenerima}
								>
									Cari NPWP
								</Button>
							{/if}
						</div>
					</Label>
					<Label>
						<span>Nama</span>
						<Input
							name="nama"
							type="text"
							id={getContext('id')}
							bind:value={namaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Status PTKP</span>
						<Select
							name="statusPtkp"
							id={getContext('id')}
							bind:value={statusPtkpState}
							disabled={!bpa1.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each bpa1PtkpOptions as p (p.value)}
								<option value={p.value}>{p.label}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Jabatan</span>
						<Input
							name="jabatan"
							type="text"
							id={getContext('id')}
							bind:value={jabatanState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Nama Objek Pajak</span>
						<Select
							name="kodeObjekPajakId"
							id={getContext('id')}
							bind:value={kodeObjekPajakIdState}
							disabled={!bpa1.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each objekPajakOptions as o (o.id)}
								<option value={o.id}>{o.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Jenis Pajak</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.pasal ?? ''} disabled />
					</Label>
					<Label>
						<span>Kode Objek Pajak</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kode ?? ''} disabled />
					</Label>
					<Label>
						<span>Jenis Pemotongan</span>
						<Select
							name="jenisPemotongan"
							id={getContext('id')}
							bind:value={jenisPemotonganState}
							disabled={!bpa1.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each jenisPemotonganOptions as j (j.value)}
								<option value={j.value}>{j.label}</option>
							{/each}
						</Select>
					</Label>
				</div>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Penghasilan Bruto</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Gaji/Pensiun atau THT/JHT (Rp)</span>
						<Input
							name="gajiPensiunThtJht"
							type="rupiah"
							id={getContext('id')}
							bind:value={gajiState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan PPh (Rp)</span>
						<Input
							name="tunjanganPph"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganPphState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Lainnya, Uang Lembur dan Sebagainya (Rp)</span>
						<Input
							name="tunjanganLainnya"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganLainnyaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Honorarium dan Imbalan Lain Sejenisnya (Rp)</span>
						<Input
							name="honorarium"
							type="rupiah"
							id={getContext('id')}
							bind:value={honorariumState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Premi Asuransi yang Dibayar Pemberi Kerja (Rp)</span>
						<Input
							name="premiAsuransi"
							type="rupiah"
							id={getContext('id')}
							bind:value={premiAsuransiState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Penerimaan Dalam bentuk Natura dan Kenikmatan Lainnya (Rp)</span>
						<Input
							name="natura"
							type="rupiah"
							id={getContext('id')}
							bind:value={naturaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Tantiem, Bonus, Gratifikasi, Jasa Produksi dan THR (Rp)</span>
						<Input
							name="tantiemBonus"
							type="rupiah"
							id={getContext('id')}
							bind:value={tantiemBonusState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Jumlah Penghasilan Bruto (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={jumlahPenghasilanBruto} disabled />
					</Label>
				</div>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Pengurang</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Biaya Jabatan / Biaya Pensiun (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={biayaJabatan} disabled />
					</Label>
					<Label>
						<span>Iuran terkait Pensiun atau Hari Tua (Rp)</span>
						<Input
							name="iuranPensiun"
							type="rupiah"
							id={getContext('id')}
							bind:value={iuranPensiunState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Zakat atau Sumbangan Keagamaan yang Bersifat Wajib (Rp)</span>
						<Input
							name="zakat"
							type="rupiah"
							id={getContext('id')}
							bind:value={zakatState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Jumlah Pengurangan (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={jumlahPengurangan} disabled />
					</Label>
					<Label>
						<span>Jumlah Penghasilan Neto (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={penghasilanNeto} disabled />
					</Label>
				</div>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Penghitungan PPh Pasal 21</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Nomor Bukti Pemotongan BPA1 dari Pemberi Kerja Sebelumnya (Apabila ada)</span>
						<Input
							name="nomorBuktiSebelumnya"
							type="text"
							id={getContext('id')}
							bind:value={nomorBuktiSebelumnyaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Penghasilan Neto dari Pemotongan Sebelumnya (Rp)</span>
						<Input
							name="penghasilanNetoSebelumnya"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanNetoSebelumnyaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Jumlah Penghasilan Neto untuk Perhitungan PPh Pasal 21 (Setahun/Disetahunkan) (Rp)</span>
						<Input
							type="rupiah"
							id={getContext('id')}
							value={penghasilanNetoSetahunDisetahunkan}
							disabled
						/>
					</Label>
					<Label>
						<span>Penghasilan Tidak Kena Pajak (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={penghasilanTidakKenaPajak} disabled />
					</Label>
					<Label>
						<span>Penghasilan Kena Pajak Setahun / Disetahunkan (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={penghasilanKenaPajak} disabled />
					</Label>
					<Label>
						<span>Tarif (%)</span>
						<Input type="text" id={getContext('id')} value={resolvedTax.tarif} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 atas Penghasilan Kena Pajak Setahun/Disetahunkan (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={resolvedTax.pajakPenghasilan} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 Terutang (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphPasal21Terutang} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 Dipotong dari Bukti Pemotongan Sebelumnya (Rp)</span>
						<Input
							name="pphPasal21DipotongSebelumnya"
							type="rupiah"
							id={getContext('id')}
							bind:value={pphDipotongSebelumnyaState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan) (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphTerutangPadaIni} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 yang Dipotong/Ditanggung Pemerintah (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphDitanggungPemerintah} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphKurangLebihDesember} disabled />
					</Label>
					<Label>
						<span>Jenis Fasilitas pada Masa Pajak Desember/Masa Pajak Terakhir</span>
						<Select
							name="fasilitasPajakId"
							id={getContext('id')}
							bind:value={fasilitasPajakIdState}
							disabled={!bpa1.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each fasilitasOptions as f (f.id)}
								<option value={f.id}>{f.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>KAP-KJS</span>
						<Input type="text" id={getContext('id')} value={selectedObjekPajak?.kap ?? ''} disabled />
					</Label>
					<Label>
						<span>NITKU/Nomor Identitas Sub Unit Organisasi</span>
						<Input type="text" id={getContext('id')} value={nitkuPemotong} disabled />
					</Label>
					<p class="tw:text-sm tw:text-gray-500">
						Jenis Fasilitas "PPh Pasal 21 Ditanggung Pemerintah (DTP)" memindahkan PPh Terutang
						pada Bukti Potong ini ke "Ditanggung Pemerintah" alih-alih dipotong dari penerima.
						"Kurang (Lebih) Dipotong pada Masa Pajak Desember" dihitung sebagai PPh Terutang pada
						Bukti Ini dikurangi PPh Ditanggung Pemerintah -- aplikasi ini belum memiliki riwayat
						pemotongan bulanan (Bukti Pemotongan Bulanan Pegawai Tetap), sehingga jika penerima
						sudah dipotong PPh 21 bulanan sepanjang tahun berjalan, angka pada aplikasi ini akan
						lebih tinggi dari yang sebenarnya di Coretax.
					</p>
				</div>
			{/snippet}
		</Card>

		<Card>
			{#snippet head()}
				<span class="tw:text-xl">Dokumen Referensi</span>
			{/snippet}
			{#snippet body()}
				<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
					<Label>
						<span>Jenis Dokumen</span>
						<Select
							name="jenisDokumenId"
							id={getContext('id')}
							bind:value={jenisDokumenIdState}
							disabled={!bpa1.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each jenisDokumenOptions as d (d.id)}
								<option value={d.id}>{d.nama}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Nomor Dokumen</span>
						<Input
							name="nomorDokumen"
							type="text"
							id={getContext('id')}
							bind:value={nomorDokumenState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
					<Label>
						<span>Tanggal Dokumen</span>
						<Input
							name="tanggalDokumen"
							type="date"
							id={getContext('id')}
							bind:value={tanggalDokumenState}
							disabled={!bpa1.canEdit}
						/>
					</Label>
				</div>
			{/snippet}
		</Card>

		{#if bpa1.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/bpa1" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/bpa1" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT BPA1</div>
	{#if bpa1.canEdit}
		<form {...updateBpa1}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if bpa1.status !== 'SUBMITTED'}
				<form {...submitBpa1}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanBpa1.for(bpa1.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if bpa1.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{bpa1.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
