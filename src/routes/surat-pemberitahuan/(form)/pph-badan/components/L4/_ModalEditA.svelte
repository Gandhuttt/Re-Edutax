<script lang="ts">
	import { ActionButton, DateField, FieldGrid, FormField, InstitutionalModal, RupiahField, SelectField } from "$lib/re-ui-components";

	let {
		open = $bindable(false),
		data = $bindable() as {
			id: string | number;
			npwpPemotongPemungutPenyetor?: string;
			namaPemotongPemungutPenyetor?: string;
			objekPajak?: string;
			dasarPengenaanPajak?: number;
			tarif?: number;
			pphFinalTerutang?: number;
			nomorBuktiPotong?: string;
			tanggalBuktiPotong?: string;
			keterangan?: string;
		},
		saveItem,
		objekPajakOptions
	}: {
		open?: boolean;
		data: {
			id: string | number;
			npwpPemotongPemungutPenyetor?: string;
			namaPemotongPemungutPenyetor?: string;
			objekPajak?: string;
			dasarPengenaanPajak?: number;
			tarif?: number;
			pphFinalTerutang?: number;
			nomorBuktiPotong?: string;
			tanggalBuktiPotong?: string;
			keterangan?: string;
		};
		saveItem: () => void;
		objekPajakOptions: { value: string; label: string }[];
	} = $props();

	$effect(() => {
		data.pphFinalTerutang = (Number(data.dasarPengenaanPajak || 0) * Number(data.tarif || 0)) / 100;
	});

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal bind:open title="Edit Penghasilan yang Dikenakan PPh Bersifat Final" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="NPWP Pemotong/Pemungut/Penyetor" bind:value={data.npwpPemotongPemungutPenyetor!} />
		<FormField label="Nama Pemotong/Pemungut/Penyetor" bind:value={data.namaPemotongPemungutPenyetor!} />
		<SelectField
			label="Objek Pajak"
			bind:value={data.objekPajak!}
			options={objekPajakOptions}
			placeholder="Pilih objek pajak"
			required
			searchable
			floatingPanel
		/>
		<RupiahField
			label="Dasar Pengenaan Pajak"
			bind:value={data.dasarPengenaanPajak!}
			required
		/>
		<FormField
			label="Tarif (%)"
			type="number"
			bind:value={() => String(data.tarif ?? ''), (value) => (data.tarif = value === '' ? 0 : Number(value))}
			required
		/>
		<RupiahField label="PPh Final Terutang" value={data.pphFinalTerutang ?? 0} required disabled />
		<FormField label="Nomor Bukti Potong/Setor" bind:value={data.nomorBuktiPotong!} />
		<DateField label="Tanggal Bukti Potong/Setor" bind:value={data.tanggalBuktiPotong!} />
		<FormField label="Keterangan" bind:value={data.keterangan!} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
