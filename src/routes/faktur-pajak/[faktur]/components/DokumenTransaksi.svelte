<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import Input from '$lib/components/Input.svelte';
	import Label from '$lib/components/Label.svelte';
	import Select from '$lib/components/Select.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getContext } from 'svelte';
	import { updateFaktur } from '../updateFaktur.remote';

	type TransactionCodeOption = {
		id: string;
		key: number;
		value: string;
	};

	type AdditionalInfoOption = {
		id: string;
		kodeTransaksiId: string;
		kode: number;
		informasiTambahan: string;
		requiresDocument: boolean;
	};

	let {
		canEdit,
		uangMuka,
		pelunasan,
		nomorFaktur,
		kodeTransaksi,
		tanggalFaktur,
		jenisFaktur,
		referensi,
		alamat,
		idtku,
		informasiTambahan,
		dokumenPendukung,
		transactionCodeOptions,
		additionalInfoOptions
	}: {
		canEdit: boolean;
		uangMuka: boolean;
		pelunasan: boolean;
		nomorFaktur: string | undefined;
		kodeTransaksi: number;
		tanggalFaktur: string;
		jenisFaktur: string;
		referensi: string;
		alamat: string;
		idtku: string;
		informasiTambahan: number | undefined;
		dokumenPendukung: string | undefined;
		transactionCodeOptions: TransactionCodeOption[];
		additionalInfoOptions: AdditionalInfoOption[];
	} = $props();

	const formFields = updateFaktur.fields.dokumenTransaksi;

	let initialized = $state(false);
	let kodeTransaksiState = $state<number>(1);
	let informasiTambahanState = $state<number>(1);
	let dokumenPendukungState = $state('');
	let tanggalFakturState = $state('');
	const masaPajakState = $derived(formatMonth(new Date(tanggalFakturState).getMonth() + 1));
	const selectedKodeTransaksiId = $derived(
		transactionCodeOptions.find((transaction) => transaction.key === Number(kodeTransaksiState))?.id
	);
	const filteredAdditionalInfoOptions = $derived(
		additionalInfoOptions.filter((option) => option.kodeTransaksiId === selectedKodeTransaksiId)
	);
	const requireDokumenPendukung = $derived(
		[7, 8].includes(Number(kodeTransaksiState)) &&
			filteredAdditionalInfoOptions.find(
				(option) => option.kode === Number(informasiTambahanState)
			)
				?.requiresDocument === true
	);

	$effect(() => {
		if (initialized) return;

		kodeTransaksiState = kodeTransaksi;
		informasiTambahanState = informasiTambahan ?? additionalInfoOptions[0]?.kode ?? 1;
		dokumenPendukungState = dokumenPendukung ?? '';
		tanggalFakturState = tanggalFaktur;
		initialized = true;
	});
</script>

<Card>
	{#snippet head()}
		<span class="tw:text-xl">Dokumen Transaksi</span>
	{/snippet}
	{#snippet body()}
		<div class="tw:flex tw:flex-col tw:gap-3 tw:px-3">
			<div class="tw:flex tw:flex-col tw:w-full tw:gap-2">
				<Label class="tw:flex! tw:items-center tw:gap-5">
					<Input
						name={formFields.uangMuka.as('checkbox').name}
						type="checkbox"
						id={getContext('id')}
						checked={uangMuka}
						disabled={!canEdit}
					/>
					<span>Uang Muka</span>
				</Label>
				<Label class="tw:flex! tw:items-center tw:gap-5">
					<Input
						name={formFields.pelunasan.as('checkbox').name}
						type="checkbox"
						id={getContext('id')}
						checked={pelunasan}
						disabled={!canEdit}
					/>
					<span>Pelunasan</span>
				</Label>
			</div>

			<Label>
				<span>Nomor Faktur</span>
				<Input type="text" id={getContext('id')} value={nomorFaktur} disabled />
			</Label>
			<Label>
				<span>Kode Transaksi</span>
				<Select
					id={getContext('id')}
					name={formFields.kodeTransaksi.as('number').name}
					bind:value={kodeTransaksiState}
					disabled={!canEdit}
				>
					{#each transactionCodeOptions as option, i}
						<option value={option.key}>{i + 1}. {option.value}</option>
					{/each}
				</Select>
			</Label>
			<Label>
				<span>Tanggal Faktur</span>
				<Input
					name={formFields.tanggalFaktur.as('date').name}
					type="date"
					id={getContext('id')}
					bind:value={tanggalFakturState}
					disabled={!canEdit}
				/>
			</Label>
			<Label>
				<span>Jenis Faktur</span>
				<Input type="text" id={getContext('id')} value={jenisFaktur} disabled />
			</Label>
			<Label>
				<span>Masa Pajak</span>
				<Input type="text" id={getContext('id')} value={masaPajakState} disabled />
			</Label>
			<Label>
				<span>Referensi</span>
				<Input
					name={formFields.referensi.as('text').name}
					type="text"
					id={getContext('id')}
					value={referensi}
					disabled={!canEdit}
				/>
			</Label>
			<Label>
				<span>Alamat</span>
				<Input
					name={formFields.alamat.as('text').name}
					type="text"
					id={getContext('id')}
					value={alamat}
					disabled={!canEdit}
				/>
			</Label>
			<Label>
				<span>IDTKU</span>
				<Input type="text" id={getContext('id')} value={idtku} disabled />
			</Label>

			{#if [7, 8].includes(Number(kodeTransaksiState))}
				<Label>
					<span>Informasi Tambahan</span>
					<Select
						name={formFields.kodeInformasiTambahan.as('number').name}
						bind:value={informasiTambahanState}
						disabled={!canEdit}
					>
						{#each filteredAdditionalInfoOptions as option}
							<option value={option.kode}>{option.informasiTambahan}</option>
						{/each}
					</Select>
				</Label>
				{#if requireDokumenPendukung}
					<Label>
						<span>Dokumen Pendukung</span>
						<Input
							name={formFields.dokumenPendukung.as('text').name}
							type="text"
							id={getContext('id')}
							bind:value={dokumenPendukungState}
							disabled={!canEdit}
						/>
					</Label>
				{/if}
			{/if}
		</div>
	{/snippet}
</Card>
