<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Select from '$lib/components/Select.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { listSptPphBadan } from '../listSptPphBadan.remote';
	import { listSptPphOrangPribadi } from '../listSptPphOrangPribadi.remote';
	import { listSptPpn } from '../listSptPpn.remote';
	import { newSptPphBadan } from './newSptPphBadan.remote';
	import { newSptPphOrangPribadi } from './newSptPphOrangPribadi.remote';
	import { newSptPpn } from './newSptPpn.remote';
	import { deleteSptPphBadan } from './deleteSptPphBadan.remote';
	import { deleteSptPphOrangPribadi } from './deleteSptPphOrangPribadi.remote';

	const rupiah = new Intl.NumberFormat('id-ID');

	const today = new Date();
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const years = Array.from({ length: 6 }, (_, i) => today.getFullYear() - 3 + i);
	// Both SPT PPh implementations follow tax-year-2025 rules specifically (rates, facilities,
	// thresholds; PTKP and the progressive tariff on the orang pribadi side) - restrict creation
	// to that year until a future year is verified.
	const pphTahunPajakOptions = [2025];

	// Which SPT the "Buat SPT" modal will create. The three creation remotes take
	// different fields (PPN is a monthly return and needs masa + tahun; both PPh
	// returns are annual and need only tahunPajak), so the modal swaps the whole
	// form rather than trying to share one set of inputs.
	type JenisSpt = 'ppn' | 'pph-badan' | 'pph-orang-pribadi';

	const jenisSptOptions: { value: JenisSpt; label: string }[] = [
		{ value: 'ppn', label: 'SPT Masa PPN' },
		{ value: 'pph-badan', label: 'SPT Tahunan PPh Badan' },
		{ value: 'pph-orang-pribadi', label: 'SPT Tahunan PPh Orang Pribadi' }
	];

	let jenisSpt = $state<JenisSpt>('ppn');
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Konsep SPT</span>
				<Button data-bs-toggle="modal" data-bs-target="#modalBuatSpt">Buat SPT</Button>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[10rem]">Action</th>
							<th class="tw:w-[15rem]">Jenis SPT</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[8rem]">Tahun</th>
							<th class="tw:w-[12rem]">Pembetulan</th>
							<th class="tw:w-[14rem]">PPN Keluaran</th>
							<th class="tw:w-[14rem]">PPN Masukan</th>
							<th class="tw:w-[14rem]">Kurang/Lebih Bayar</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listSptPpn({ status: 'konsep' }) as row}
							<tr>
								<td>
									<a href="/surat-pemberitahuan/ppn?id={row.id}" class="tw:text-black!">
										<Button>Buka</Button>
									</a>
								</td>
								<td>SPT Masa PPN</td>
								<td>{formatMonth(row.masaPajak)}</td>
								<td>{row.tahun}</td>
								<td>{row.pembetulanKe}</td>
								<td>{rupiah.format(row.totalPpnKeluaran)}</td>
								<td>{rupiah.format(row.totalPpnMasukan)}</td>
								<td>{rupiah.format(row.ppnKurangLebihBayar)}</td>
							</tr>
						{/each}
						{#each await listSptPphBadan({ status: 'konsep' }) as row}
							<tr>
								<td class="tw:flex tw:gap-2">
									<a href="/surat-pemberitahuan/pph-badan?id={row.id}" class="tw:text-black!">
										<Button>Buka</Button>
									</a>
									<form
										{...deleteSptPphBadan.enhance(async (form) => {
											if (confirm('Hapus konsep SPT PPh Badan ini?')) await form.submit();
										})}
									>
										<input type="hidden" name="id" value={row.id} />
										<Button class={"tw:text-white"} color="var(--color-danger)">Hapus</Button>
									</form>
								</td>
								<td>SPT Tahunan PPh Badan</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>-</td>
								<td>-</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
							</tr>
						{/each}
						{#each await listSptPphOrangPribadi({ status: 'konsep' }) as row}
							<tr>
								<td class="tw:flex tw:gap-2">
									<a href="/surat-pemberitahuan/pph-orang-pribadi?id={row.id}" class="tw:text-black!">
										<Button>Buka</Button>
									</a>
									<form
										{...deleteSptPphOrangPribadi.enhance(async (form) => {
											if (confirm('Hapus konsep SPT PPh Orang Pribadi ini?')) await form.submit();
										})}
									>
										<input type="hidden" name="id" value={row.id} />
										<Button class={"tw:text-white"} color="var(--color-danger)">Hapus</Button>
									</form>
								</td>
								<td>SPT Tahunan PPh Orang Pribadi</td>
								<td>-</td>
								<td>{row.tahunPajak}</td>
								<td>{row.pembetulanKe}</td>
								<td>-</td>
								<td>-</td>
								<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
							</tr>
						{/each}
					{/snippet}
				</Table>
			</div>
		{/snippet}
	</Card>
</div>


<!-- Buat SPT. The jenis picker sits outside the form so switching it does not
     tear down and rebuild the select the user is currently using; each branch
     renders its own form, and the footer's submit reaches it by id. Only one
     branch exists at a time, so the shared id is never duplicated. -->
<div class="modal fade" id="modalBuatSpt" tabindex="-1" aria-labelledby="modalBuatSptLabel" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="modalBuatSptLabel" style="font-weight: bold; text-transform: uppercase;">
					Buat SPT
				</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
			</div>
			<div class="modal-body">
				<div style="display: flex; flex-direction: column; gap: 10px;">
					<div style="display: flex; align-items: center;">
						<label for="modalBuatSpt-jenis" style="width: 180px;">Jenis SPT *</label>
						<div style="flex: 1;">
							<Select id="modalBuatSpt-jenis" bind:value={jenisSpt}>
								{#each jenisSptOptions as opsi}
									<option value={opsi.value}>{opsi.label}</option>
								{/each}
							</Select>
						</div>
					</div>

					{#if jenisSpt === 'ppn'}
						<form {...newSptPpn} id="formBuatSpt" style="display: contents;">
							<div style="display: flex; align-items: center;">
								<label for="modalBuatSpt-masa" style="width: 180px;">Masa Pajak *</label>
								<div style="flex: 1;">
									<Select id="modalBuatSpt-masa" name="masaPajak" value={String(today.getMonth() + 1)}>
										{#each months as month}
											<option value={String(month)}>{formatMonth(month)}</option>
										{/each}
									</Select>
								</div>
							</div>
							<div style="display: flex; align-items: center;">
								<label for="modalBuatSpt-tahun" style="width: 180px;">Tahun *</label>
								<div style="flex: 1;">
									<Select id="modalBuatSpt-tahun" name="tahun" value={String(today.getFullYear())}>
										{#each years as year}
											<option value={String(year)}>{year}</option>
										{/each}
									</Select>
								</div>
							</div>
						</form>
					{:else if jenisSpt === 'pph-badan'}
						<form {...newSptPphBadan} id="formBuatSpt" style="display: contents;">
							<div style="display: flex; align-items: center;">
								<label for="modalBuatSpt-tahun-badan" style="width: 180px;">Tahun Pajak *</label>
								<div style="flex: 1;">
									<Select id="modalBuatSpt-tahun-badan" name="tahunPajak" value={String(pphTahunPajakOptions[0])}>
										{#each pphTahunPajakOptions as year}
											<option value={String(year)}>{year}</option>
										{/each}
									</Select>
								</div>
							</div>
						</form>
					{:else}
						<form {...newSptPphOrangPribadi} id="formBuatSpt" style="display: contents;">
							<div style="display: flex; align-items: center;">
								<label for="modalBuatSpt-tahun-op" style="width: 180px;">Tahun Pajak *</label>
								<div style="flex: 1;">
									<Select id="modalBuatSpt-tahun-op" name="tahunPajak" value={String(pphTahunPajakOptions[0])}>
										{#each pphTahunPajakOptions as year}
											<option value={String(year)}>{year}</option>
										{/each}
									</Select>
								</div>
							</div>
						</form>
					{/if}
				</div>
			</div>
			<div class="modal-footer" style="justify-content: flex-end;">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
				<button type="submit" form="formBuatSpt" class="btn btn-primary" style="background-color: #1c398e; color: white;">
					Buat
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>
