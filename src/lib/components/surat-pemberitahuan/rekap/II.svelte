<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';

	let { sptItem }: { sptItem: SptPpnBlob['II'] } = $props();
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th></th>
			<th class="inputHead">Harga Jual/Penggantian/Nilai Impor/DPP (Rupiah)</th>
			<th class="inputHead">DPP Nilai Lain/DPP (Rupiah)</th>
			<th class="inputHead">PPN (Rupiah)</th>
			<th class="inputHead">PPnBM (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[0][0]} name="II_A_i" />
				<Input type={'hidden'} value={sptItem[0][1]} name="II_A_ii" />
				<Input type={'hidden'} value={sptItem[0][2]} name="II_A_iii" />
				A.</td
			>
			<td
				>Impor BKP, Pemanfaatan BKP Tidak Berwujud dan/atau JKP dari luar Daerah Pabean di dalam
				Daerah Pabean yang Pajak Masukannya dapat dikreditkan</td
			>
			<td><Input type={'text'} value={sptItem[0][0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem[0][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem[0][2]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[1][0]} name="II_B_i" />
				<Input type={'hidden'} value={sptItem[1][1]} name="II_B_ii" />
				<Input type={'hidden'} value={sptItem[1][2]} name="II_B_iii" />
				<Input type={'hidden'} value={sptItem[1][3]} name="II_B_iv" />
				B.</td
			>
			<td
				>Perolehan BKP/JKP dari dalam negeri dengan DPP Nilai Lain atau Besaran Tertentu yang Pajak
				Masukannya dapat dikreditkan (dengan Faktur Pajak Kode 04 dan 05)</td
			>
			<td><Input type={'text'} value={sptItem[1][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem[1][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem[1][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem[1][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[2][0]} name="II_C_i" />
				<Input type={'hidden'} value={sptItem[2][1]} name="II_C_ii" />
				<Input type={'hidden'} value={sptItem[2][2]} name="II_C_iii" />
				C.</td
			>
			<td
				>Perolehan BKP/JKP dari dalam negeri selain dengan DPP Nilai Lain yang Pajak Masukannya
				dapat dikreditkan (dengan Faktur Pajak Kode 01, 09, dan 10)</td
			>
			<td><Input type={'text'} value={sptItem[2][0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem[2][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem[2][2]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[3][0]} name="II_D_i" />
				<Input type={'hidden'} value={sptItem[3][1]} name="II_D_ii" />
				<Input type={'hidden'} value={sptItem[3][2]} name="II_D_iii" />
				<Input type={'hidden'} value={sptItem[3][3]} name="II_D_iv" />
				D.</td
			>
			<td
				>Perolehan BKP/JKP dari dalam negeri sebagai Pemungutan PPN yang Pajak Masukannya dapat
				dikreditkan (dengan Faktur Pajak Kode 02 dan 03)</td
			>
			<td><Input type={'text'} value={sptItem[3][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem[3][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem[3][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem[3][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[4]} name="II_E_i" />
				E.</td
			>
			<td>Kompensasi kelebihan Pajak Masukan</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem[4]} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[5]} name="II_F_i" />
				F.</td
			>
			<td>Hasil penghitungan kembali Pajak Masukan yang telah dikreditkan</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem[5]} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[6][0]} name="II_G_i" />
				<Input type={'hidden'} value={sptItem[6][1]} name="II_G_ii" />
				G.</td
			>
			<td>Jumlah Pajak Masukan yang dapat diperhitungkan (II.A + II.B + II.C + II.D + II.F)</td>
			<td><Input type={'text'} value={sptItem[6][0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem[6][1]} disabled /></td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[7][0]} name="II_H_i" />
				<Input type={'hidden'} value={sptItem[7][1]} name="II_H_ii" />
				<Input type={'hidden'} value={sptItem[7][2]} name="II_H_iii" />
				<Input type={'hidden'} value={sptItem[7][3]} name="II_H_iv" />
				H.</td
			>
			<td
				>Impor atau perolehan BKP/JKP yang Pajak Masukannya tidak dikreditkan dan/atau impor atau
				perolehan BKP/JKP yang mendapat fasilitas</td
			>
			<td><Input type={'text'} value={sptItem[7][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem[7][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem[7][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem[7][3]} disabled /></td>
		</tr>
		<tr>
			<td>I.</td>
			<td>
				<Input type={'hidden'} value={sptItem[8]} name="II_I" />
				Impor atau perolehan BKP/JKP dengan Faktur Pajak yang dilaporkan secara digunggung dan barang/jasa
				yang tidak terutang PPN</td
			>
			<td><Input type={'text'} value={sptItem[8]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem[9]} name="II_J" />
				J.</td
			>
			<td>Jumlah Perolehan (II.A + II.B + II.C + II.H + II.I)</td>
			<td><Input type={'text'} value={sptItem[9]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
	{/snippet}
</Table>

<style>
	th,
	td {
		font-size: 0.9rem;
		padding: 0.5rem;
	}
	.inputHead {
		width: 10%;
		text-align: center;
		vertical-align: middle;
	}
</style>
