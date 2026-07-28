<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import List from '$lib/components/surat-pemberitahuan/PenyerahanList.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';

	let { sptItem }: { sptItem: SptPpnBlob['I'] } = $props();
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th></th>
			<th class="inputHead">Harga Jual/Penggantian/nilai Ekspor/DPP (Rupiah)</th>
			<th class="inputHead">DPP Nilai Lain/DPP (Rupiah)</th>
			<th class="inputHead">PPN (Rupiah)</th>
			<th class="inputHead">PPnBM (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td>A.</td>
			<td colspan="5">Penyerahan BKP/JKP yang terutang PPN</td>
		</tr>
		<tr>
			<td></td>
			<td><List index={'1.'} description={'Ekspor BKP/BKP Tidak Berwujud/JKP'} /></td>
			<td><Input type={'text'} value={sptItem.A[0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[1][0]} name="I_A_2_i" />
				<Input type={'hidden'} value={sptItem.A[1][1]} name="I_A_2_ii" />
				<Input type={'hidden'} value={sptItem.A[1][2]} name="I_A_2_iii" />
				<Input type={'hidden'} value={sptItem.A[1][3]} name="I_A_2_iv" />
			</td>
			<td
				><List
					index={'2.'}
					description={'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan DPP Nilai Lain atau Besaran Tertentu (dengan Faktur Pajak Kode 04 dan 05)'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[1][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[1][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[1][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[1][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[2][0]} name="I_A_3_i" />
				<Input type={'hidden'} value={sptItem.A[2][1]} name="I_A_3_ii" />
				<Input type={'hidden'} value={sptItem.A[2][2]} name="I_A_3_iii" />
				<Input type={'hidden'} value={sptItem.A[2][3]} name="I_A_3_iv" />
			</td>
			<td
				><List
					index={'3.'}
					description={'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri kepada turis sesuai dengan Pasal 16E UU PPN (dengan Faktur Pajak Kode 06)'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[2][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[2][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[2][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[2][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[3][0]} name="I_A_4_i" />
				<Input type={'hidden'} value={sptItem.A[3][1]} name="I_A_4_ii" />
				<Input type={'hidden'} value={sptItem.A[3][2]} name="I_A_4_iii" />
			</td>
			<td
				><List
					index={'4.'}
					description={'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri lainnya (dengan Faktur Pajak Kode 01, 09 dan 10)'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[3][0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.A[3][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[3][2]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[4][0]} name="I_A_5_i" />
				<Input type={'hidden'} value={sptItem.A[4][1]} name="I_A_5_ii" />
				<Input type={'hidden'} value={sptItem.A[4][2]} name="I_A_5_iii" />
				<Input type={'hidden'} value={sptItem.A[4][3]} name="I_A_5_iv" />
			</td>
			<td
				><List
					index={'5.'}
					description={'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut sendiri dengan Faktur Pajak yang dilaporkan secara digunggung'}
					isUpload
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[4][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[4][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[4][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[4][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[5][0]} name="I_A_6_i" />
				<Input type={'hidden'} value={sptItem.A[5][1]} name="I_A_6_ii" />
				<Input type={'hidden'} value={sptItem.A[5][2]} name="I_A_6_iii" />
				<Input type={'hidden'} value={sptItem.A[5][3]} name="I_A_6_iv" />
			</td>
			<td
				><List
					index={'6.'}
					description={'Penyerahan yang PPN atau PPN dan PPnBM-nya harus dipungut oleh Pemungut PPN (dengan Faktur Pajak Kode 02 dan 03)'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[5][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[5][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[5][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[5][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[6][0]} name="I_A_7_i" />
				<Input type={'hidden'} value={sptItem.A[6][1]} name="I_A_7_ii" />
				<Input type={'hidden'} value={sptItem.A[6][2]} name="I_A_7_iii" />
				<Input type={'hidden'} value={sptItem.A[6][3]} name="I_A_7_iv" />
			</td>
			<td
				><List
					index={'7.'}
					description={'Penyerahan yang mendapat fasilitas PPN atau PPnBM Tidak Dipungut (dengan Faktur Pajak Kode 07'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[6][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[6][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[6][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[6][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[7][0]} name="I_A_8_i" />
				<Input type={'hidden'} value={sptItem.A[7][1]} name="I_A_8_ii" />
				<Input type={'hidden'} value={sptItem.A[7][2]} name="I_A_8_iii" />
				<Input type={'hidden'} value={sptItem.A[7][3]} name="I_A_8_iv" />
			</td>
			<td
				><List
					index={'8.'}
					description={'Penyerahan yang mendapat fasilitas PPN atau PPnBM Dibebaskan (dengan Faktur Pajak Kode 08'}
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[7][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[7][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[7][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[7][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[8][0]} name="I_A_9_i" />
				<Input type={'hidden'} value={sptItem.A[8][1]} name="I_A_9_ii" />
				<Input type={'hidden'} value={sptItem.A[8][2]} name="I_A_9_iii" />
				<Input type={'hidden'} value={sptItem.A[8][3]} name="I_A_9_iv" />
			</td>
			<td
				><List
					index={'9.'}
					description={'Penyerahan yang mendapat fasilitas PPN atau PPnBM dengan Faktur Pajak yang dilaporkan secara digunggung'}
					isUpload
				/></td
			>
			<td><Input type={'text'} value={sptItem.A[8][0]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[8][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[8][2]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[8][3]} disabled /></td>
		</tr>
		<tr>
			<td>
				<Input type={'hidden'} value={sptItem.A[9][0]} name="I_A_T_i" />
				<Input type={'hidden'} value={sptItem.A[9][1]} name="I_A_T_ii" />
				<Input type={'hidden'} value={sptItem.A[9][2]} name="I_A_T_iii" />
			</td>
			<td>Jumlah (I.A.1 + I.A.2 + I.A.3 + I.A.4 + I.A.5 + I.A.6 + I.A.7 + I.A.8 + I.A.9)</td>
			<td><Input type={'text'} value={sptItem.A[9][0]} disabled /></td>
			<td class="tw:text-center">-</td>
			<td><Input type={'text'} value={sptItem.A[9][1]} disabled /></td>
			<td><Input type={'text'} value={sptItem.A[9][2]} disabled /></td>
		</tr>
		<tr>
			<td>B.</td>
			<td
				>Penyerahan barang/jasa yang tidak terutang PPN
				<!-- <Upload label={"Unggah XML"} icon={"bi bi-upload"}/> -->
				<Input type={'hidden'} value={sptItem.B} name="I_B" />
			</td>
			<td><Input type={'text'} value={sptItem.B} disabled /></td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
			<td class="tw:text-center">-</td>
		</tr>
		<tr>
			<td
				>C.
				<Input type={'hidden'} value={sptItem.B} name="I_C" />
			</td>
			<td>Jumlah seluruh penyerahan barang dan jasa (I.A + I.B)</td>
			<td><Input type={'text'} value={sptItem.C} disabled /></td>
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
		width: 10rem;
		text-align: center;
		vertical-align: middle;
	}
</style>
