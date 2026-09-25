<script lang="ts">
	import {
		ActionButton,
		FieldGrid,
		InstitutionalModal,
		MultiSelectField,
		RupiahField,
		Stack
	} from '$lib/re-ui-components';

	let {
		open = $bindable(false),
		data = $bindable() as {
			id?: string;
			kode?: string | null;
			namaAkun?: string;
			classification?: 'income' | 'expense' | null;
			hasFiskalSplit?: boolean;
			nilaiKomersial?: number;
			nonObjekPajak?: number;
			dikenakanPphFinal?: number;
			penyesuaianFiskalPositif?: number;
			penyesuaianFiskalNegatif?: number;
			kodePenyesuaianFiskal?: string[];
		},
		saveItem,
		kodeKoreksiFiskalOptions
	}: {
		open: boolean;
		data: {
			id?: string;
			kode?: string | null;
			namaAkun?: string;
			classification?: 'income' | 'expense' | null;
			hasFiskalSplit?: boolean;
			nilaiKomersial?: number;
			nonObjekPajak?: number;
			dikenakanPphFinal?: number;
			penyesuaianFiskalPositif?: number;
			penyesuaianFiskalNegatif?: number;
			kodePenyesuaianFiskal?: string[];
		};
		saveItem: () => void;
		kodeKoreksiFiskalOptions: { value: string; label: string; group?: string }[];
	} = $props();

	const hasFiskalSplit = $derived(Boolean(data.hasFiskalSplit));
	const objekPajakTidakFinal = $derived(
		hasFiskalSplit
			? Number(data.nilaiKomersial || 0) - Number(data.nonObjekPajak || 0) - Number(data.dikenakanPphFinal || 0)
			: Number(data.nilaiKomersial || 0)
	);
	const fiskalSign = $derived(data.classification === 'expense' ? -1 : 1);
	const nilaiFiskal = $derived(
		objekPajakTidakFinal +
			fiskalSign * (Number(data.penyesuaianFiskalPositif || 0) - Number(data.penyesuaianFiskalNegatif || 0))
	);

	function handleSave(): void {
		saveItem();
		open = false;
	}
</script>

{#snippet actions()}
	<ActionButton tone="quiet" onclick={() => (open = false)}>Tutup</ActionButton>
	<ActionButton tone="secondary" onclick={handleSave}>Simpan</ActionButton>
{/snippet}

<InstitutionalModal
	bind:open
	eyebrow="TRANSKRIP LABA RUGI"
	title={`Edit ${data.kode ?? ''} — ${data.namaAkun ?? ''}`}
	size="large"
	scrollable
	{actions}
>
	<Stack gap="18px">
		<FieldGrid gap="14px 16px">
			<RupiahField
				label="Nilai Komersial"
				required
				bind:value={() => Number(data.nilaiKomersial ?? 0), (value) => (data.nilaiKomersial = value)}
			/>
			<RupiahField
				label="Tidak Termasuk Objek Pajak"
				disabled={!hasFiskalSplit}
				bind:value={() => Number(data.nonObjekPajak ?? 0), (value) => (data.nonObjekPajak = value)}
			/>
			<RupiahField
				label="Dikenakan PPh Bersifat Final"
				disabled={!hasFiskalSplit}
				bind:value={() => Number(data.dikenakanPphFinal ?? 0), (value) => (data.dikenakanPphFinal = value)}
			/>
			<RupiahField label="Objek Pajak Tidak Final" value={objekPajakTidakFinal} disabled />
			<RupiahField
				label="Penyesuaian Fiskal Positif"
				bind:value={() => Number(data.penyesuaianFiskalPositif ?? 0), (value) => (data.penyesuaianFiskalPositif = value)}
			/>
			<RupiahField
				label="Penyesuaian Fiskal Negatif"
				bind:value={() => Number(data.penyesuaianFiskalNegatif ?? 0), (value) => (data.penyesuaianFiskalNegatif = value)}
			/>
			<MultiSelectField
				label="Kode Penyesuaian Fiskal"
				bind:value={() => data.kodePenyesuaianFiskal ?? [], (value) => (data.kodePenyesuaianFiskal = value)}
				options={kodeKoreksiFiskalOptions}
				placeholder="Tidak ada"
			/>
			<RupiahField label="Nilai Fiskal (Sebelum Fasilitas)" value={nilaiFiskal} disabled />
		</FieldGrid>
	</Stack>
</InstitutionalModal>
