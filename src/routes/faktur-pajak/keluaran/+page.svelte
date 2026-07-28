<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Table from '$lib/components/Table.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getWajibPajak } from '../../getWajibPajak.remote';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { deleteFaktur } from './deleteFaktur.remote';
	import { listFaktur } from './listFaktur.remote';
	import { newEmpty } from './newEmpty.remote';
	import { undoUploadFaktur } from './undoUploadFaktur.remote';
	import { uploadFaktur } from './uploadFaktur.remote';

	const transactionCodeOptions = await getKodeTransaksiFaktur();
</script>

<div class="tw:w-full tw:p-25">
	<Card>
		{#snippet head()}
			<div class="tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center">
				<span class="tw:text-2xl tw:h-10 tw:flex tw:items-center">Faktur Keluaran</span>
				<form {...newEmpty}>
					<Button color="#FFD230">Buat Faktur</Button>
				</form>
			</div>
		{/snippet}
		{#snippet body()}
			<div class="tw:min-h-100 tw:overflow-scroll">
				<Table class="tw:w-full">
					{#snippet head()}
						<tr>
							<th class="tw:w-[20rem]">Action</th>
							<th class="tw:w-[15rem]">NPWP Pembeli</th>
							<th class="tw:w-[15rem]">Nama Pembeli</th>
							<th class="tw:w-[20rem]">Kode Transaksi</th>
							<th class="tw:w-[15rem]">Nomor Faktur Pajak</th>
							<th class="tw:w-[10rem]">Masa Pajak</th>
							<th class="tw:w-[10rem]">Status</th>
						</tr>
					{/snippet}
					{#snippet body()}
						{#each await listFaktur() as { id, npwpPembeli, kodeTransaksi, nomorFaktur, masaPajak, dikreditkan, diupload }}
							{@const delFaktur = deleteFaktur.for(id)}
							{@const upldFaktur = uploadFaktur.for(id)}
							{@const undupldFaktur = undoUploadFaktur.for(id)}
							<tr>
								<td>
									<div class="tw:flex tw:flex-row tw:gap-1">
										<a href="/faktur-pajak/{id}" class="tw:text-black!">
											<Button color="#FFD230">{!diupload ? 'Edit' : 'Lihat'}</Button>
										</a>
										{#if !diupload}
											<form {...delFaktur}><Button color="#FFD230">Hapus</Button></form>
											<form {...upldFaktur}><Button color="#FFD230">Upload</Button></form>
										{:else if diupload && !dikreditkan}
											<form {...undupldFaktur}><Button color="#FFD230">Tarik</Button></form>
										{/if}
									</div>
								</td>
								<td>{npwpPembeli}</td>
								<td>{(await getWajibPajak({ npwp: npwpPembeli }))?.nama ?? ''}</td>
								<td>{transactionCodeOptions.find((option) => option.key === kodeTransaksi)?.value ?? ''}</td>
								<td>{nomorFaktur}</td>
								<td>{formatMonth(masaPajak)}</td>
								<td>
									{#if !diupload}
										<span>Pending</span>
									{:else if diupload && !dikreditkan}
										<span>Uploaded</span>
									{:else if diupload && dikreditkan}
										<span>Accepted</span>
									{/if}
								</td>
							</tr>
						{/each}
					{/snippet}
				</Table>
			</div>
		{/snippet}
	</Card>
</div>

<style>
	th,
	td {
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
</style>
