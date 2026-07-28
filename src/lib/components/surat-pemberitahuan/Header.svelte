<script lang="ts">
	import { formatMonth } from '$lib/helpers/date';
	import Input from '../Input.svelte';
	import Label from '../Label.svelte';
	import Select from '../Select.svelte';

	const currentDate = new Date();
	const monthOptions = Array.from({ length: 12 }, (_, index) => ({
		key: index + 1,
		label: formatMonth(index + 1)
	}));

	const {
		namaPKP = '',
		alamat = '',
		noTelepon = '',
		teleponSeluler = '',
		npwp = '',
		klasifikasiLapanganUsaha = '',
		periode = { bulan: currentDate.getMonth() + 1, tahun: currentDate.getFullYear() },
		readonly = true,
		postFormId
		// periode
	}: {
		namaPKP?: string;
		alamat?: string;
		noTelepon?: string;
		teleponSeluler?: string;
		npwp?: string;
		klasifikasiLapanganUsaha?: string;
		periode?: { bulan: number; tahun: number };
		readonly?: boolean;
		postFormId?: string;
	} = $props();
</script>

<div class="tw:flex tw:w-full tw:flex-row tw:gap-2">
	<div class="tw:basis-1/2">
		<table class="table table-borderless table-sm align-middle tw:w-full">
			<tbody>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Nama Pengusaha Kena Pajak*</span>
								<Input type={'text'} disabled required value={namaPKP} />
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Alamat*</span>
								<Input type={'text'} disabled required value={alamat} />
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Nomor Telepon</span>
								<Input type={'text'} disabled value={noTelepon} />
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Telepon Seluler*</span>
								<Input type={'text'} disabled required value={teleponSeluler} />
							</div>
						</Label>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="tw:basis-1/2">
		<table class="table table-borderless table-sm align-middle tw:w-full">
			<tbody>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>NPWP*</span>
								<Input type={'text'} disabled required value={npwp} />
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Klasifikasi Lapangan Usaha*</span>
								<Input type={'text'} disabled required value={klasifikasiLapanganUsaha} />
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Periode*</span>
								<div class="tw:flex tw:w-full tw:flex-row tw:gap-5">
									<div class="tw:flex tw:w-full tw:basis-1/2 tw:items-center tw:gap-2">
										<Select
											name="periodeBulan"
											class={'tw:h-[2rem]! tw:basis-auto tw:text-sm! tw:leading-[100%]'}
											value={periode.bulan}
										>
											{#each monthOptions as month}
												<option value={month.key} class="tw:w-full">{month.label}</option>
											{/each}
										</Select>
										<Select
											class={'tw:h-[2rem]! tw:basis-3/5 tw:text-sm! tw:leading-[100%]'}
											value={periode.tahun}
											disabled
										>
											<option value={2025}>2025</option>
											<option value={2024}>2024</option>
											<option value={2026}>2026</option>
										</Select>
									</div>
									<Label class={'tw:w-full tw:basis-1/2'}>
										<div class="tw:flex tw:flex-row tw:items-center">
											<span class="tw:w-full!">Periode Pembukuan*</span>
											<Input
												type={'text'}
												class={'tw:h-[2rem]! tw:basis-2/4 tw:text-sm!'}
												value="01-12"
												disabled
											/>
										</div>
									</Label>
								</div>
								<!-- <div class="tw:flex tw:flex-row">
								</div> -->
							</div>
						</Label>
					</td>
				</tr>
				<tr>
					<td>
						<Label class={'tw:w-full'}>
							<div class="tw:flex tw:flex-row tw:items-center tw:gap-5">
								<span>Normal/Pembetulan*</span>
								<select name="" id="" class="form-select form-select-sm" disabled>
									<option value="1">Normal</option>
									<option value="2">Pembetulan</option>
								</select>
							</div>
						</Label>
					</td>
				</tr>
				<!-- <tr><td colspan="3">
					<Label>
						<div class="tw:flex tw:flex-row tw:gap-5">
							<span class="tw:text-sm">NPWP*</span>
							<Input type={'text'} disabled required />
							</div>
							</Label>
							</td></tr>
							<tr><td colspan="3"><Label>Klasifikasi Lapangan Usaha*<Input disabled /></Label></td></tr> -->
				<!-- <tr>
					<Label>Periode*<Input type={'text'} disabled required /></Label>
					<Label>Periode Pembukuan<Input type={'text'} disabled required /></Label>
				</tr> -->
				<!-- <tr>
					<td class="tw:text-sm">Normal/Pembetulan</td>
					<td colspan="3">
						<select name="" id="" class="form-select form-select-sm">
							<option value="1">Normal</option>
							<option value="2">Pembetulan</option>
						</select>
					</td>
				</tr> -->
			</tbody>
		</table>
	</div>
</div>
<div class="tw:flex tw:flex-row">
	{#if readonly === false}
		<div class="tw:mr-5">
			<button class="btn btn-success" form={postFormId} name="action" value="Post">Posting SPT</button>
		</div>
		<p class="tw:hidden">Posting belum pernah dilakukan</p>
	{/if}
</div>

<style>
	tr {
		border: none;
	}
	span {
		font-size: 0.875rem;
		width: 50%;
	}
</style>
