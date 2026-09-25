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
			negara: string;
			npwp: string;
			modalNilai?: number;
			modalPersen?: number;
			utangNilai?: number;
			utangTahun?: number;
			utangBunga?: number;
			piutangNilai?: number;
			piutangTahun?: number;
			piutangBunga?: number;
		},
		saveItem,
		negaraOptions,
		readonly = false
	}: {
		open?: boolean;
		data: {
			id: string | number;
			nama: string;
			negara: string;
			npwp: string;
			modalNilai?: number;
			modalPersen?: number;
			utangNilai?: number;
			utangTahun?: number;
			utangBunga?: number;
			piutangNilai?: number;
			piutangTahun?: number;
			piutangBunga?: number;
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
	eyebrow="LAMPIRAN 2B"
	title="Edit Daftar Penyertaan Modal, Utang, dan/atau Piutang pada Perusahaan Afiliasi"
	size="large"
	scrollable
>
	<FieldGrid columns={2} gap="14px 16px">
		<FormField label="NPWP/NIK" bind:value={data.npwp} required disabled={readonly} />
		<FormField label="Nama" bind:value={data.nama} required disabled={readonly} />
		<SelectField
			label="Negara"
			bind:value={data.negara}
			options={negaraOptions}
			placeholder="Pilih negara"
			searchable
			disabled={readonly}
		/>
		<RupiahField
			label="Penyertaan Modal"
			bind:value={() => Number(data.modalNilai ?? 0), (value) => (data.modalNilai = value)}
			disabled={readonly}
		/>
		<FormField
			label="Penyertaan Modal (%)"
			type="number"
			bind:value={() => String(data.modalPersen ?? ''), (value) => (data.modalPersen = Number(value))}
			disabled={readonly}
		/>
		<RupiahField
			label="Utang"
			bind:value={() => Number(data.utangNilai ?? 0), (value) => (data.utangNilai = value)}
			disabled={readonly}
		/>
		<FormField
			label="Tahun Utang"
			type="number"
			bind:value={() => String(data.utangTahun ?? ''), (value) => (data.utangTahun = Number(value))}
			disabled={readonly}
		/>
		<FormField
			label="Bunga Utang/Tahun (%)"
			type="number"
			bind:value={() => String(data.utangBunga ?? ''), (value) => (data.utangBunga = Number(value))}
			disabled={readonly}
		/>
		<RupiahField
			label="Piutang"
			bind:value={() => Number(data.piutangNilai ?? 0), (value) => (data.piutangNilai = value)}
			disabled={readonly}
		/>
		<FormField
			label="Tahun Piutang"
			type="number"
			bind:value={() => String(data.piutangTahun ?? ''), (value) => (data.piutangTahun = Number(value))}
			disabled={readonly}
		/>
		<FormField
			label="Bunga Piutang/Tahun (%)"
			type="number"
			bind:value={() => String(data.piutangBunga ?? ''), (value) => (data.piutangBunga = Number(value))}
			disabled={readonly}
		/>
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
