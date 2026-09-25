<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
	} from "$lib/re-ui-components";
	import type { L13BCRow } from "./types";

	let {
		open = $bindable(false),
		data = $bindable(),
		saveItem,
		readonly = false,
	}: {
		open?: boolean;
		data: Partial<L13BCRow>;
		saveItem: () => void;
		readonly?: boolean;
	} = $props();

	let tambahanPengurang = $derived(
		Math.round((Number(data.jumlahBiaya || 0) * Number(data.persentaseFasilitasPajak || 0)) / 100),
	);

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

<InstitutionalModal
	id="modalL13BC"
	bind:open
	eyebrow="LAMPIRAN 13-B"
	title="Edit Fasilitas Penelitian dan Pengembangan"
	size="wide"
	scrollable
>
	<FieldGrid columns={2}>
		<FormField label="Nomor Proposal" bind:value={data.nomorProposal!} disabled={readonly} />
		<label class="number-field">
			<span>Jangka Waktu Pengeluaran Biaya - Dari Tahun</span>
			<input type="number" bind:value={data.jangkaWaktuDariTahun} disabled={readonly} />
		</label>
		<label class="number-field">
			<span>Jangka Waktu Pengeluaran Biaya - Sampai Tahun</span>
			<input type="number" bind:value={data.jangkaWaktuSampaiTahun} disabled={readonly} />
		</label>
		<RupiahField label="Jumlah Biaya" bind:value={data.jumlahBiaya!} disabled={readonly} />
		<label class="number-field">
			<span>Tahun Perolehan Hak Kekayaan Intelektual / Komersialisasi</span>
			<input type="number" bind:value={data.tahunPerolehanHki} disabled={readonly} />
		</label>
		<label class="number-field">
			<span>Persentase Fasilitas Pajak (%)</span>
			<input type="number" bind:value={data.persentaseFasilitasPajak} disabled={readonly} />
		</label>
		<RupiahField
			label="Tambahan Pengurangan Penghasilan Bruto Penelitian dan Pengembangan"
			value={tambahanPengurang}
			readonly
		/>
	</FieldGrid>

	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
		<ActionButton onclick={handleSave} disabled={readonly}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

<style>
	.number-field {
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.number-field span {
		color: var(--ui-ink);
		font-size: 14px;
		font-weight: 700;
	}
	.number-field input {
		width: 100%;
		height: 40px;
		padding: 0 11px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 3px;
		background: #fffefa;
		color: var(--ui-ink);
		font: inherit;
		font-size: 16px;
	}
	.number-field input:focus {
		outline: 3px solid var(--ui-yellow-soft);
		border-color: var(--ui-navy);
	}
	.number-field input:disabled {
		background: #e9e7df;
		color: #666b70;
	}
</style>
