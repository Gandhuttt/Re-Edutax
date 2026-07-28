<script lang="ts">
	import Table from '$lib/components/Table.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { SptPpnBlob } from '$lib/schemas/surat-pemberitahuan/spt-ppn';

	let { sptItem }: { sptItem: SptPpnBlob['III'] } = $props();
	// let checkbox = $state(false);
	// let isDisabled = $derived(!checkbox);
</script>

<Table class="tw:table-fixed tw:min-w-full tw:border-collapse" >
	{#snippet head()}
		<tr>
			<th></th>
			<th></th>
			<th></th>
			<th class="inputHead">PPN (Rupiah)</th>
		</tr>
	{/snippet}
	{#snippet body()}
		<tr>
			<td class="tw:w-1">A.</td>
			<td colspan="2">Pajak Keluaran yang harus dipungut sendiri (I.A.2 + I.A.3 + I.A.4 + I.A.5)</td
			>
			<td>
				<Input type={'hidden'} value={sptItem[0]} name="III_A" />
				<Input type={'text'} value={sptItem[0]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">B.</td>
			<td colspan="2">PPN disetor di muka dalam masa pajak yang sama</td>
			<td>
				<Input type={'hidden'} value={sptItem[1]} name="III_B" />
				<Input type={'text'} value={sptItem[1]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">C.</td>
			<td colspan="2">Pajak Masukan yang dapat diperhitungkan (II.G)</td>
			<td>
				<Input type={'hidden'} value={sptItem[2]} name="III_C" />
				<Input type={'text'} value={sptItem[2]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">D.</td>
			<td colspan="2">Kelebihan pemungutan PPN oleh Pemungut PPN</td>
			<td>
				<Input type={'hidden'} value={sptItem[3]} name="III_D" />
				<Input type={'text'} value={sptItem[3]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">E.</td>
			<td colspan="2">PPN kurang atau (lebih) bayar (III.A - III.B - III.C - III.D)</td>
			<td>
				<Input type={'hidden'} value={sptItem[4]} name="III_E" />
				<Input type={'text'} value={sptItem[4]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">F.</td>
			<td colspan="2">PPN kurang atau (lebih) bayar pada SPT yang dibetulkan sebelumnya</td>
			<td>
				<Input type={'hidden'} value={sptItem[5]} name="III_F" />
				<Input type={'text'} value={sptItem[5]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">G.</td>
			<td colspan="2">PPN kurang atau (lebih) bayar karena pembetulan SPT (III.E - III.F)</td>
			<td>
				<Input type={'hidden'} value={sptItem[6]} name="III_G" />
				<Input type={'text'} value={sptItem[6]} disabled /></td
			>
		</tr>
		<tr>
			<td class="tw:w-1">H.</td>
			<td>Diminta untuk</td>
			<td colspan="2">
				<div class="tw:flex tw:flex-row tw:justify-center">
					<div class="tw:mr-5 tw:flex tw:flex-col">
						<div class="form-check">
							<Input type={'checkbox'} id={'III-H-1'} name={'check-ganti'} />
							<label class="form-check-label" for="III-H-1">Ganti SPT sebelumnya</label>
						</div>
						<div class="form-check">
							<Input
								type={'radio'}
								id={'III-H-2'}
								name={'radio-ganti'}
								checked={sptItem[7].tindakan === 'dikompensasikan'}
								value={'dikompensasikan'}
							/>
							<label class="form-check-label" for="III-H-2">1. Dikompensasikan</label>
						</div>
						<div class="form-check">
							<Input
								type={'radio'}
								id={'III-H-3'}
								name={'radio-ganti'}
								checked={sptItem[7].tindakan === 'dikembalikan_pendahuluan'}
								value={'dikembalikan_pendahuluan'}
							/>
							<label class="form-check-label" for="III-H-3"
								>2. Dikembalikan melalui pengembalian pendahuluan</label
							>
						</div>
						<div class="form-check">
							<Input
								type={'radio'}
								id={'III-H-4'}
								name={'radio-ganti'}
								checked={sptItem[7].tindakan === 'dikembalikan_pemeriksaan'}
								value={'dikembalikan_pemeriksaan'}
							/>
							<label class="form-check-label" for="III-H-4"
								>3. Dikembalikan melalui pemeriksaan</label
							>
						</div>
					</div>
					<div>
						<table>
							<tbody>
								<tr style="border: none;">
									<td class="tw:w-[10rem]"><label for="III-H-5">Pilih Rekening Bank</label></td>
									<td
										><Input
											type={'file'}
											id={'III-H-5'}
											value={sptItem[7].rekening?.pilihRekeningBank}
										/></td
									>
								</tr>
								<tr style="border: none;">
									<td class="tw:w-[10rem]"><label for="III-H-6">Nomor Rekening</label></td>
									<td>
										<Input
											type={'text'}
											id={'III-H-6'}
											name="III_H_rekening_nomor"
											value={sptItem[7].rekening?.nomor}
										/></td
									>
								</tr>
								<tr style="border: none;">
									<td class="tw:w-[10rem]"><label for="III-H-7">Nama Bank</label></td>
									<td
										><Input
											type={'text'}
											id={'III-H-7'}
											name="III_H_rekening_namaBank"
											value={sptItem[7].rekening?.namaBank}
										/></td
									>
								</tr>
								<tr style="border: none;">
									<td class="tw:w-[10rem]"><label for="III-H-8">Nama Pemilik Rekening</label></td>
									<td>
										<Input
											type={'text'}
											id={'III-H-8'}
											name="III_H_rekening_namaPemilik"
											value={sptItem[7].rekening?.namaPemilik}
										/></td
									>
								</tr>
							</tbody>
						</table>
						<div class="tw:flex">
							<div class="tw:h-1 tw:w-5"></div>
						</div>
					</div>
				</div>
			</td>
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
