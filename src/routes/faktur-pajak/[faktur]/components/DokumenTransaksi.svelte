<script lang="ts">
	import { formatMonth } from '$lib/helpers/date';
	import {
		CheckboxField,
		ConditionalField,
		DateField,
		FieldGrid,
		FormField,
		SelectField,
		Stack
	} from '$lib/re-ui-components';
	import type { UpdateFakturFields } from '../updateFaktur.remote';
	import { untrack } from 'svelte';

	type TransactionCodeOption = { id: string; key: number; value: string };
	type AdditionalInfoOption = {
		id: string;
		kodeTransaksiId: string;
		kode: number;
		informasiTambahan: string;
		requiresDocument: boolean;
	};

	let {
		canEdit, uangMuka, pelunasan, nomorFaktur, kodeTransaksi, tanggalFaktur,
		jenisFaktur, referensi, alamat, idtku, informasiTambahan, dokumenPendukung,
		transactionCodeOptions, additionalInfoOptions, formFields
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
		formFields: UpdateFakturFields['dokumenTransaksi'];
	} = $props();

	let kodeTransaksiState = $state<number>(untrack(() => kodeTransaksi));
	let informasiTambahanState = $state<number | string>(
		untrack(() => informasiTambahan ?? '')
	);
	let tanggalFakturState = $state(untrack(() => tanggalFaktur));

	const selectedKodeTransaksiId = $derived(
		transactionCodeOptions.find((transaction) => transaction.key === Number(kodeTransaksiState))?.id
	);
	const filteredAdditionalInfoOptions = $derived(
		additionalInfoOptions.filter((option) => option.kodeTransaksiId === selectedKodeTransaksiId)
	);
	const selectedAdditionalInfo = $derived(
		filteredAdditionalInfoOptions.find((option) => option.kode === Number(informasiTambahanState))
	);
	const requiresAdditionalInfo = $derived([7, 8].includes(Number(kodeTransaksiState)));
	const requireDokumenPendukung = $derived(
		requiresAdditionalInfo && selectedAdditionalInfo?.requiresDocument === true
	);
	const masaPajakState = $derived.by(() => {
		const [year, month] = tanggalFakturState.split('-').map(Number);
		return year && month ? `${formatMonth(month)} ${year}` : '';
	});

	$effect(() => {
		if (!requiresAdditionalInfo || informasiTambahanState !== '') return;
		informasiTambahanState = filteredAdditionalInfoOptions[0]?.kode ?? '';
	});

	function changeTransactionCode(value: string | number) {
		kodeTransaksiState = Number(value);
		const transactionId = transactionCodeOptions.find(
			(option) => option.key === Number(value)
		)?.id;
		const nextAdditionalInfo = additionalInfoOptions.find(
			(option) => option.kodeTransaksiId === transactionId
		);
		informasiTambahanState = nextAdditionalInfo?.kode ?? '';
		if (canEdit) formFields.kodeInformasiTambahan.set(nextAdditionalInfo?.kode as never);
	}
</script>

<Stack gap="16px">
	<Stack direction="horizontal" gap="12px" wrap>
		<CheckboxField label="Uang muka" field={canEdit ? formFields.uangMuka : undefined} checked={uangMuka} disabled={!canEdit} compact />
		<CheckboxField label="Pelunasan" field={canEdit ? formFields.pelunasan : undefined} checked={pelunasan} disabled={!canEdit} compact />
	</Stack>

	<FieldGrid gap="14px 16px">
		<FormField label="Nomor faktur" value={nomorFaktur || 'Terbentuk setelah diunggah'} disabled />
		<SelectField
			label="Kode transaksi"
			field={canEdit ? formFields.kodeTransaksi : undefined}
			value={kodeTransaksiState}
			disabled={!canEdit}
			required
			options={transactionCodeOptions.map((option) => ({
				value: option.key,
				label: `${String(option.key).padStart(2, '0')} — ${option.value}`
			}))}
			onchange={changeTransactionCode}
		/>
		<DateField
			label="Tanggal faktur"
			field={canEdit ? formFields.tanggalFaktur : undefined}
			value={tanggalFakturState}
			disabled={!canEdit}
			required
			onchange={(value) => (tanggalFakturState = value)}
		/>
		<FormField label="Jenis faktur" value={jenisFaktur} disabled />
		<FormField label="Masa pajak" value={masaPajakState} disabled />
		<FormField label="Referensi" field={canEdit ? formFields.referensi : undefined} value={referensi} disabled={!canEdit} />
		<FormField label="Alamat" field={canEdit ? formFields.alamat : undefined} value={alamat} disabled={!canEdit} />
		<FormField label="IDTKU" value={idtku} disabled />
	</FieldGrid>

	{#if requiresAdditionalInfo}
		<ConditionalField label="Fasilitas transaksi">
			<Stack gap="14px">
				<SelectField
					label="Informasi tambahan"
					field={canEdit ? formFields.kodeInformasiTambahan : undefined}
					value={informasiTambahanState}
					disabled={!canEdit}
					required
					options={filteredAdditionalInfoOptions.map((option) => ({
						value: option.kode,
						label: `${String(option.kode).padStart(2, '0')} — ${option.informasiTambahan}`
					}))}
					onchange={(value) => (informasiTambahanState = value)}
				/>
				{#if requireDokumenPendukung}
					<FormField
						label="Dokumen pendukung"
						field={canEdit ? formFields.dokumenPendukung : undefined}
						value={dokumenPendukung ?? ''}
						disabled={!canEdit}
						required
					/>
				{/if}
			</Stack>
		</ConditionalField>
	{/if}
</Stack>
