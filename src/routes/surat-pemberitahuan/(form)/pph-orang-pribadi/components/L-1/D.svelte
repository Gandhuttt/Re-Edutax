<script lang="ts">
	import { ActionButton, DataTable, FieldGrid, FormField, InstitutionalModal, RupiahField, Stack, TableActions } from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import type { BarisPekerjaan } from "./types";

	interface Props {
		rows: BarisPekerjaan[];
		referensi: Record<string, string[]>;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), dapatDiubah = true, readonly = false }: Props = $props();
	const kosong = (): BarisPekerjaan => ({
		nomorIdentitasPemberiKerja: "", namaPemberiKerja: "",
		penghasilanBruto: 0, pengurangPenghasilanBruto: 0, penghasilanNeto: 0
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisPekerjaan>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let total = $derived(rows.reduce((sum, row) => sum + Number(row.penghasilanNeto || 0), 0));
	let draftNeto = $derived(Number(draft.penghasilanBruto || 0) - Number(draft.pengurangPenghasilanBruto || 0));

	function bukaTambah() {
		indeksDiubah = null;
		draft = kosong();
		errors = {};
		modalTerbuka = true;
	}
	function bukaUbah(index: number) {
		indeksDiubah = index;
		draft = { ...rows[index] };
		errors = {};
		modalTerbuka = true;
	}
	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.nomorIdentitasPemberiKerja) next.nomorIdentitasPemberiKerja = "Kolom ini wajib diisi!";
		if (!draft.namaPemberiKerja) next.namaPemberiKerja = "Kolom ini wajib diisi!";
		if (!draft.penghasilanBruto) next.penghasilanBruto = "Kolom ini wajib diisi!";
		if (!draft.pengurangPenghasilanBruto) next.pengurangPenghasilanBruto = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		const baris = { ...draft, penghasilanNeto: draftNeto };
		if (indeksDiubah === null) rows = [...rows, baris];
		else rows = rows.map((row, index) => (index === indeksDiubah ? baris : row));
		modalTerbuka = false;
	}
	function hapus(index: number) {
		rows = rows.filter((_, rowIndex) => rowIndex !== index);
	}
	function hapusSemua() {
		if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian D?`)) rows = [];
	}
</script>

<Stack gap="12px">
	{#if bisaEdit}
		<Stack direction="horizontal" align="end">
			<ActionButton onclick={bukaTambah}>Tambah</ActionButton>
			<ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
		</Stack>
	{/if}
	<DataTable label="Penghasilan neto dalam negeri dari pekerjaan" minWidth="980px" headerTone="navy" density="compact">
		<table>
			<thead><tr>
				{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Nama Pemberi Kerja</th>
				<th scope="col">Nomor Identitas Pemberi Kerja</th><th scope="col" class="right">Penghasilan Bruto</th>
				<th scope="col" class="right">Pengurang Penghasilan Bruto/Biaya</th><th scope="col" class="right">Penghasilan Neto</th>
			</tr></thead>
			<tbody>
				{#each rows as row, index}<tr>
					{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
					<td>{index + 1}</td><td>{row.namaPemberiKerja}</td><td>{row.nomorIdentitasPemberiKerja}</td>
					<td class="number amount">{formatRupiahDerived(row.penghasilanBruto)}</td>
					<td class="number amount">{formatRupiahDerived(row.pengurangPenghasilanBruto)}</td>
					<td class="number amount">{formatRupiahDerived(row.penghasilanNeto)}</td>
				</tr>{:else}<tr><td colspan={bisaEdit ? 7 : 6} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}
			</tbody>
			<tfoot><tr><th scope="row" colspan={bisaEdit ? 6 : 5}>Jumlah Bagian D</th><td class="number amount">{formatRupiahDerived(total)}</td></tr></tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalTerbuka} title="Penghasilan Neto Dalam Negeri dari Pekerjaan" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Nomor Identitas Pemberi Kerja" bind:value={draft.nomorIdentitasPemberiKerja} error={errors.nomorIdentitasPemberiKerja} required />
		<FormField label="Nama Pemberi Kerja" bind:value={draft.namaPemberiKerja} error={errors.namaPemberiKerja} required />
		<RupiahField label="Penghasilan Bruto" bind:value={draft.penghasilanBruto} error={errors.penghasilanBruto} required />
		<RupiahField label="Pengurang Penghasilan Bruto/Biaya" bind:value={draft.pengurangPenghasilanBruto} error={errors.pengurangPenghasilanBruto} required />
		<FormField label="Penghasilan Neto" value={formatRupiahDerived(draftNeto)} readonly />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
