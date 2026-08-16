<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { updatePeserta } from '../../updatePeserta.remote';
	import { getPesertaDetail } from './getPesertaDetail.remote';

	const rupiah = new Intl.NumberFormat('id-ID');
	const npwp = $derived(page.params.npwp ?? '');
	const detail = $derived(await getPesertaDetail(npwp));
</script>

<svelte:head>
	<title>Peserta {npwp}</title>
</svelte:head>

<div class="tw:w-full tw:p-25 tw:flex tw:flex-col tw:gap-6">
	<a href="/admin" class="tw:w-fit">&larr; Kembali ke dasbor</a>

	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">
				{detail.akun.nama} ({detail.akun.npwp})
			</span>
		{/snippet}
		{#snippet body()}
			<form
				{...updatePeserta.enhance(async (form) => {
					await form.submit();
					await getPesertaDetail(npwp).refresh();
				})}
				class="tw:flex tw:flex-col tw:gap-2 tw:max-w-[45rem]"
			>
				<input type="hidden" name="userId" value={detail.akun.id} />
				<Label class="tw:flex! tw:flex-row tw:items-center">
					<span class="tw:block tw:w-[14rem]">Nama</span>
					<Input type="text" name="nama" value={detail.akun.nama} required />
				</Label>
				<Label class="tw:flex! tw:flex-row tw:items-center">
					<span class="tw:block tw:w-[14rem]">Email</span>
					<Input type="email" name="email" value={detail.akun.email} required />
				</Label>
				<Label class="tw:flex! tw:flex-row tw:items-center">
					<span class="tw:block tw:w-[14rem]">Nomor telepon</span>
					<Input type="text" name="nomorTelepon" value={detail.profil?.nomor_telepon ?? ''} />
				</Label>
				<Label class="tw:flex! tw:flex-row tw:items-center">
					<span class="tw:block tw:w-[14rem]">Batch</span>
					<span>{detail.profil?.batchNama ?? 'Tanpa batch'}</span>
				</Label>
				<Label class="tw:flex! tw:flex-row tw:items-center">
					<span class="tw:block tw:w-[14rem]">Status akun</span>
					<span>{detail.akun.banned ? 'Nonaktif' : 'Aktif'}</span>
				</Label>

				{#if updatePeserta.fields.allIssues()?.[0]}
					<p class="pesan-galat">{updatePeserta.fields.allIssues()?.[0]?.message}</p>
				{:else if updatePeserta.result?.message}
					<p class="pesan-sukses">{updatePeserta.result.message}</p>
				{/if}

				<Button class="tw:w-[15rem]" disabled={updatePeserta.pending > 0}>
					{updatePeserta.pending > 0 ? 'Menyimpan...' : 'Simpan Perubahan'}
				</Button>
			</form>
		{/snippet}
	</Card>

	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">SPT Tahunan PPh Badan</span>
		{/snippet}
		{#snippet body()}
			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						<th class="tw:w-[8rem]">Tahun</th>
						<th class="tw:w-[10rem]">Pembetulan</th>
						<th class="tw:w-[12rem]">Status SPT</th>
						<th class="tw:w-[12rem]">Status Draft</th>
						<th class="tw:w-[16rem]">Kurang/Lebih Bayar</th>
						<th class="tw:w-[14rem]">Dilaporkan</th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each detail.sptPphBadan as row}
						<tr>
							<td>{row.tahunPajak}</td>
							<td>{row.pembetulanKe}</td>
							<td>{row.statusSpt}</td>
							<td>{row.statusDraft}</td>
							<td>{rupiah.format(row.pphKurangLebihBayar)}</td>
							<td>{row.tanggalDilaporkan ?? '-'}</td>
						</tr>
					{:else}
						<tr><td colspan="6">Belum ada SPT PPh Badan.</td></tr>
					{/each}
				{/snippet}
			</Table>
		{/snippet}
	</Card>

	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">SPT Masa PPN</span>
		{/snippet}
		{#snippet body()}
			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						<th class="tw:w-[12rem]">Masa Pajak</th>
						<th class="tw:w-[8rem]">Tahun</th>
						<th class="tw:w-[10rem]">Pembetulan</th>
						<th class="tw:w-[12rem]">Status</th>
						<th class="tw:w-[16rem]">Kurang/Lebih Bayar</th>
						<th class="tw:w-[14rem]">Dilaporkan</th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each detail.sptPpn as row}
						<tr>
							<td>{formatMonth(row.masaPajak)}</td>
							<td>{row.tahun}</td>
							<td>{row.pembetulanKe}</td>
							<td>{row.status}</td>
							<td>{rupiah.format(row.ppnKurangLebihBayar)}</td>
							<td>{row.tanggalDilaporkan ?? '-'}</td>
						</tr>
					{:else}
						<tr><td colspan="6">Belum ada SPT PPN.</td></tr>
					{/each}
				{/snippet}
			</Table>
		{/snippet}
	</Card>

	<Card>
		{#snippet head()}
			<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Faktur Pajak</span>
		{/snippet}
		{#snippet body()}
			<Table class="tw:w-full">
				{#snippet head()}
					<tr>
						<th class="tw:w-[10rem]">Jenis</th>
						<th class="tw:w-[18rem]">Nomor Faktur</th>
						<th class="tw:w-[8rem]">Kode</th>
						<th class="tw:w-[16rem]">Lawan Transaksi</th>
						<th class="tw:w-[12rem]">Tanggal</th>
						<th class="tw:w-[10rem]">Diupload</th>
						<th class="tw:w-[10rem]">Dikreditkan</th>
					</tr>
				{/snippet}
				{#snippet body()}
					{#each [...detail.fakturKeluaran, ...detail.fakturMasukan] as row}
						{@const keluaran = row.npwpPenjual === detail.akun.npwp}
						<tr>
							<td>{keluaran ? 'Keluaran' : 'Masukan'}</td>
							<td>{row.nomorFaktur || '-'}</td>
							<td>{row.kodeTransaksi}</td>
							<td>{keluaran ? row.npwpPembeli || '-' : row.npwpPenjual}</td>
							<td>{row.tanggalFaktur}</td>
							<td>{row.diupload ? 'Ya' : 'Tidak'}</td>
							<td>{row.dikreditkan ? 'Ya' : 'Tidak'}</td>
						</tr>
					{:else}
						<tr><td colspan="7">Belum ada faktur.</td></tr>
					{/each}
				{/snippet}
			</Table>
		{/snippet}
	</Card>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}

	.pesan-galat {
		margin: 0;
		color: #b42318;
		font-size: 0.95rem;
	}

	.pesan-sukses {
		margin: 0;
		color: #067647;
		font-size: 0.95rem;
	}
</style>
