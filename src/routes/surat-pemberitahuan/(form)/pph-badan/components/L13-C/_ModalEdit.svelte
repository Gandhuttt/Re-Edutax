<script lang="ts">
	import {
		ActionButton,
		DateField,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
	} from "$lib/re-ui-components";

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<InstitutionalModal
	id="modalL13C"
	bind:open
	eyebrow="LAMPIRAN 13-C"
	title="Edit Fasilitas Pajak untuk Pengurangan Pajak Penghasilan Badan"
	size="wide"
	scrollable
>
	<FieldGrid columns={2}>
		<FormField label="Nomor Keputusan Pemberian Fasilitas" />
		<DateField label="Tanggal Keputusan Pemberian Fasilitas" />
		<FormField label="Nomor Keputusan Pemanfaatan Fasilitas" />
		<DateField label="Tanggal Keputusan Pemanfaatan Fasilitas" />
		<FormField label="Jangka Waktu Fasilitas (Tahun)" />
		<FormField label="Pemanfaatan Tahun Ke-" />
		<FormField label="Persentase Pengurangan PPh (%)" type="number" />
		<RupiahField label="Penghasilan Kena Pajak" />
		<RupiahField label="PPh Terutang" />
		<RupiahField label="Besaran Fasilitas Pengurangan PPh Terutang" disabled />
	</FieldGrid>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={() => (open = false)}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
