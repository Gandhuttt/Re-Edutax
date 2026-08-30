<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { bpa1PtkpOptions } from '$lib/helpers/ptkp-bpa1';
	import { getContext } from 'svelte';
	import { getObjekPajakBpa2 } from '../../objekPajakBpa2.remote';
	import { getWajibPajak } from '../../../getWajibPajak.remote';
	import { getBpa2 } from './getBpa2.remote';
	import { submitBpa2 } from './submitBpa2.remote';
	import { terbitkanBpa2 } from '../terbitkanBpa2.remote';
	import { updateBpa2 } from './updateBpa2.remote';

	const bpa2 = await getBpa2();
	const objekPajakOptions = await getObjekPajakBpa2();

	let masaPajakAwalState = $state(bpa2.masaPajakAwal);
	let tahunAwalState = $state(bpa2.tahunAwal);
	let masaPajakAkhirState = $state(bpa2.masaPajakAkhir);
	let tahunAkhirState = $state(bpa2.tahunAkhir);
	let bekerjaLebihState = $state(String(bpa2.bekerjaDiLebihDariSatuPemberiKerja));
	let nomorIdentitasWpState = $state(bpa2.nomorIdentitasWp);
	let namaState = $state(bpa2.nama);
	let nipState = $state(bpa2.nip);
	let pangkatGolonganState = $state(bpa2.pangkatGolongan);
	let statusPtkpState = $state(bpa2.statusPtkp ?? '');
	let posisiState = $state(bpa2.posisi);
	let kodeObjekPajakIdState = $state(bpa2.kodeObjekPajakId ?? '');
	let jenisPemotonganState = $state(bpa2.jenisPemotongan ?? '');
	const selectedObjekPajak = $derived(objekPajakOptions.find((o) => o.id === kodeObjekPajakIdState));
	const nitkuPemotong = `${bpa2.npwpPemotong}000000`;

	let gajiPokokState = $state(bpa2.gajiPokokPensiun);
	let tunjanganIstriState = $state(bpa2.tunjanganIstri);
	let tunjanganAnakState = $state(bpa2.tunjanganAnak);
	let tunjanganPerbaikanState = $state(bpa2.tunjanganPerbaikanPenghasilan);
	let tunjanganStrukturalState = $state(bpa2.tunjanganStrukturalFungsional);
	let tunjanganBerasState = $state(bpa2.tunjanganBeras);
	let tunjanganLainLainState = $state(bpa2.tunjanganLainLain);
	let penghasilanTetapLainnyaState = $state(bpa2.penghasilanTetapTeraturLainnya);
	const jumlahPenghasilanBruto = $derived(
		gajiPokokState +
			tunjanganIstriState +
			tunjanganAnakState +
			tunjanganPerbaikanState +
			tunjanganStrukturalState +
			tunjanganBerasState +
			tunjanganLainLainState +
			penghasilanTetapLainnyaState
	);

	const monthCount = $derived(
		(tahunAkhirState - tahunAwalState) * 12 + (masaPajakAkhirState - masaPajakAwalState) + 1
	);
	const biayaJabatan = $derived(
		Math.min(Math.round(jumlahPenghasilanBruto * 0.05), 500_000 * Math.max(monthCount, 0))
	);
	let iuranPensiunState = $state(bpa2.iuranPensiun);
	let zakatState = $state(bpa2.zakat);
	const jumlahPengurangan = $derived(biayaJabatan + iuranPensiunState + zakatState);
	const penghasilanNeto = $derived(jumlahPenghasilanBruto - jumlahPengurangan);

	let nomorBuktiSebelumnyaState = $state(bpa2.nomorBuktiSebelumnya);
	let penghasilanNetoSebelumnyaState = $state(bpa2.penghasilanNetoSebelumnya);
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

	// Client-side mirror of resolveBpa2Tax, for display only -- the server
	// is the source of truth at save time. No facility selector for BPA2, so
	// this just picks the ItemList entry that carries real bracket data.
	const resolvedTax = $derived.by(() => {
		if (!selectedObjekPajak) return { tarif: 0, pajakPenghasilan: 0 };
		const item = selectedObjekPajak.parameterData.ItemList.find(
			(entry) => entry.Rates && entry.Rates.length > 0
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
	let pphDipotongSebelumnyaState = $state(bpa2.pphPasal21DipotongSebelumnya);
	const pphTerutangPadaIni = $derived(pphPasal21Terutang - pphDipotongSebelumnyaState);
	// System-computed on real Coretax (pulled from monthly withholding
	// history this app doesn't have) -- always 0 here, same as the server.
	const pphYangTelahDipotong = 0;
	const pphKurangLebihDesember = $derived(pphTerutangPadaIni - pphYangTelahDipotong);

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
							disabled={!bpa2.canEdit}
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
								disabled={!bpa2.canEdit}
							>
								{#each months as m (m)}
									<option value={m}>{formatMonth(m)}</option>
								{/each}
							</Select>
							<Input
								name="tahunAwal"
								type="number"
								bind:value={tahunAwalState}
								disabled={!bpa2.canEdit}
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
								disabled={!bpa2.canEdit}
							>
								{#each months as m (m)}
									<option value={m}>{formatMonth(m)}</option>
								{/each}
							</Select>
							<Input
								name="tahunAkhir"
								type="number"
								bind:value={tahunAkhirState}
								disabled={!bpa2.canEdit}
								class="tw:w-30"
							/>
						</div>
					</Label>
					<Label>
						<span>Status</span>
						<Input type="text" id={getContext('id')} value={bpa2.status} disabled />
					</Label>
					<Label>
						<span>Nomor Identitas WP</span>
						<div class="tw:flex tw:flex-row">
							<Input
								class={bpa2.canEdit ? 'tw:rounded-e-none! tw:border-e-0' : ''}
								name="nomorIdentitasWp"
								type="text"
								id={getContext('id')}
								bind:value={nomorIdentitasWpState}
								disabled={!bpa2.canEdit}
							/>
							{#if bpa2.canEdit}
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
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>NIP/NRP</span>
						<Input
							name="nip"
							type="text"
							id={getContext('id')}
							bind:value={nipState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Pangkat/Golongan</span>
						<Input
							name="pangkatGolongan"
							type="text"
							id={getContext('id')}
							bind:value={pangkatGolonganState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Status PTKP</span>
						<Select
							name="statusPtkp"
							id={getContext('id')}
							bind:value={statusPtkpState}
							disabled={!bpa2.canEdit}
						>
							<option value="" disabled>Please select</option>
							{#each bpa1PtkpOptions as p (p.value)}
								<option value={p.value}>{p.label}</option>
							{/each}
						</Select>
					</Label>
					<Label>
						<span>Posisi</span>
						<Input
							name="posisi"
							type="text"
							id={getContext('id')}
							bind:value={posisiState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Nama Objek Pajak</span>
						<Select
							name="kodeObjekPajakId"
							id={getContext('id')}
							bind:value={kodeObjekPajakIdState}
							disabled={!bpa2.canEdit}
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
							disabled={!bpa2.canEdit}
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
						<span>Gaji Pokok/Pensiun (Rp)</span>
						<Input
							name="gajiPokokPensiun"
							type="rupiah"
							id={getContext('id')}
							bind:value={gajiPokokState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Istri (Rp)</span>
						<Input
							name="tunjanganIstri"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganIstriState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Anak (Rp)</span>
						<Input
							name="tunjanganAnak"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganAnakState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Perbaikan Penghasilan (Rp)</span>
						<Input
							name="tunjanganPerbaikanPenghasilan"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganPerbaikanState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Struktural/Fungsional (Rp)</span>
						<Input
							name="tunjanganStrukturalFungsional"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganStrukturalState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Beras (Rp)</span>
						<Input
							name="tunjanganBeras"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganBerasState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Tunjangan Lain-lain (Rp)</span>
						<Input
							name="tunjanganLainLain"
							type="rupiah"
							id={getContext('id')}
							bind:value={tunjanganLainLainState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Penghasilan Tetap dan Teratur Lainnya yang Pembayarannya Terpisah dari Pembayaran Gaji (Rp)</span>
						<Input
							name="penghasilanTetapTeraturLainnya"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanTetapLainnyaState}
							disabled={!bpa2.canEdit}
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
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Zakat atau Sumbangan Keagamaan yang Bersifat Wajib (Rp)</span>
						<Input
							name="zakat"
							type="rupiah"
							id={getContext('id')}
							bind:value={zakatState}
							disabled={!bpa2.canEdit}
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
						<span>Nomor Bukti Pemotongan BPA2 dari Pemberi Kerja Sebelumnya (Apabila ada)</span>
						<Input
							name="nomorBuktiSebelumnya"
							type="text"
							id={getContext('id')}
							bind:value={nomorBuktiSebelumnyaState}
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>Penghasilan Neto dari Pemotongan Sebelumnya (Rp)</span>
						<Input
							name="penghasilanNetoSebelumnya"
							type="rupiah"
							id={getContext('id')}
							bind:value={penghasilanNetoSebelumnyaState}
							disabled={!bpa2.canEdit}
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
							disabled={!bpa2.canEdit}
						/>
					</Label>
					<Label>
						<span>PPh Pasal 21 Terutang pada Bukti Pemotongan Ini (Dapat Dikreditkan Pada SPT Tahunan) (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphTerutangPadaIni} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 yang Telah Dipotong (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphYangTelahDipotong} disabled />
					</Label>
					<Label>
						<span>PPh Pasal 21 Kurang (Lebih) Dipotong pada Masa Pajak Desember / Masa Pajak Terakhir (Rp)</span>
						<Input type="rupiah" id={getContext('id')} value={pphKurangLebihDesember} disabled />
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
						BPA2 tidak memiliki mekanisme Fasilitas Pajak/DTP seperti BPA1 -- "PPh Pasal 21 yang
						Telah Dipotong" dihitung dari riwayat pemotongan bulanan (Bukti Pemotongan Bulanan
						Pegawai Tetap) yang belum tersedia di aplikasi ini, sehingga selalu 0 dan "Kurang
						(Lebih) Dipotong pada Masa Pajak Desember" akan sama dengan PPh Terutang pada Bukti
						Ini.
					</p>
				</div>
			{/snippet}
		</Card>

		{#if bpa2.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2">
				<a href="/ebupot/bpa2" class="tw:text-black!"><Button type="button">Kembali</Button></a>
				<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
					Simpan Konsep
				</Button>
			</div>
		{:else}
			<div class="tw:flex tw:flex-row tw:justify-end">
				<a href="/ebupot/bpa2" class="tw:text-black!"><Button type="button">Kembali</Button></a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="tw:w-full tw:p-25">
	<div class="tw:text-2xl tw:mb-5">EBUPOT BPA2</div>
	{#if bpa2.canEdit}
		<form {...updateBpa2}>{@render formContent()}</form>
		<div class="tw:flex tw:flex-row tw:justify-end tw:items-center tw:mt-3 tw:gap-2">
			{#if bpa2.status !== 'SUBMITTED'}
				<form {...submitBpa2}>
					<Button type="submit" class="tw:text-white" color="var(--color-danger)">Submit</Button>
				</form>
			{:else}
				<form {...terbitkanBpa2.for(bpa2.id)}>
					<Button type="submit" class="tw:text-white" color="var(--color-secondary)">
						Terbitkan
					</Button>
				</form>
			{/if}
		</div>
	{:else}
		{#if bpa2.nomorPemotongan}
			<p class="tw:text-sm tw:text-gray-600 tw:mb-3">
				Nomor Pemotongan: <span class="tw:font-mono">{bpa2.nomorPemotongan}</span>
			</p>
		{/if}
		{@render formContent()}
	{/if}
</div>
