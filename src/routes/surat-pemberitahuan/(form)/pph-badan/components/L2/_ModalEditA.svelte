<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField
	} from '$lib/re-ui-components';

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			nama: string;
			alamat?: string;
			negara: string;
			npwp: string;
			jabatan?: string;
			nilaiModal?: number;
			persentase?: number;
			dividen?: number;
		},
		saveItem,
		negaraOptions,
		readonly = false
	}: {
		open?: boolean;
		data: {
			id: string | number;
			nama: string;
			alamat?: string;
			negara: string;
			npwp: string;
			jabatan?: string;
			nilaiModal?: number;
			persentase?: number;
			dividen?: number;
		};
		saveItem: () => void;
		negaraOptions: { value: string; label: string }[];
		readonly?: boolean;
	} = $props();

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	bind:open
	eyebrow="LAMPIRAN 2A"
	title="Edit Daftar Pemegang Saham/Pemilik Modal dan Jumlah Dividen yang Akan Dibagikan serta Daftar Direksi dan Komisaris"
	size="large"
	scrollable
>
	<FieldGrid columns={2} gap="14px 16px">
		<FormField label="Nama" bind:value={data.nama} required disabled={readonly} />
		<FormField
			label="Alamat"
			value={data.alamat ?? ''}
			oninput={(event) => (data.alamat = event.currentTarget.value)}
			required
			disabled={readonly}
		/>
		<SelectField
			label="Negara"
			bind:value={data.negara}
			options={negaraOptions}
			placeholder="Pilih negara"
			searchable
			disabled={readonly}
		/>
		<FormField label="NPWP/NIK" bind:value={data.npwp} disabled={readonly} />
		<SelectField
			label="Jabatan"
			value={data.jabatan ?? ''}
			onchange={(value) => (data.jabatan = String(value))}
			options={[{ value: 'Direktur', label: 'Direktur' }]}
			required
			disabled={readonly}
		/>
		<RupiahField
			label="Nilai Modal Disetor"
			bind:value={() => Number(data.nilaiModal ?? 0), (value) => (data.nilaiModal = value)}
			required
			disabled={readonly}
		/>
		<FormField
			label="Persentase Modal Disetor (%)"
			type="number"
			bind:value={() => String(data.persentase ?? ''), (value) => (data.persentase = Number(value))}
			required
			disabled={readonly}
		/>
		<RupiahField
			label="Dividen/Pembagian Laba"
			bind:value={() => Number(data.dividen ?? 0), (value) => (data.dividen = value)}
			disabled={readonly}
		/>
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
