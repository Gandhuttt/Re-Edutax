<script lang="ts">
	import { ActionButton, DataTable, FieldGrid, FormField, InstitutionalModal, RupiahField, SelectField, Stack, TableActions } from "$lib/re-ui-components";
	import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
	import type { BarisBuktiPotong } from "./types";

	interface Props {
		rows: BarisBuktiPotong[];
		referensi: Record<string, string[]>;
		kreditPajakLuarNegeri: number;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, kreditPajakLuarNegeri, dapatDiubah = true, readonly = false }: Props = $props();
	const kosong = (): BarisBuktiPotong => ({
		namaPemotong: "", npwpPemotong: "", nomorBukti: "", tanggalBukti: "",
		jenisPajak: "", penghasilanBruto: 0, pphDipotong: 0
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisBuktiPotong>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let jumlah = $derived(rows.reduce((sum, row) => sum + Number(row.pphDipotong || 0), 0));
	let jumlahBagianE = $derived(jumlah + kreditPajakLuarNegeri);
	let jenisPajakOptions = $derived([
		{ value: "", label: "Silakan pilih" },
		...(referensi.l1_e_jenis_pajak ?? []).map((value) => ({ value, label: value }))
	]);

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
		if (!draft.namaPemotong) next.namaPemotong = "Kolom ini wajib diisi!";
		if (!draft.npwpPemotong) next.npwpPemotong = "Kolom ini wajib diisi!";
		if (!draft.nomorBukti) next.nomorBukti = "Kolom ini wajib diisi!";
		if (!draft.tanggalBukti) next.tanggalBukti = "Kolom ini wajib diisi!";
		if (!draft.jenisPajak) next.jenisPajak = "Kolom ini wajib diisi!";
		if (!draft.penghasilanBruto) next.penghasilanBruto = "Kolom ini wajib diisi!";
		if (!draft.pphDipotong) next.pphDipotong = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalTerbuka = false;
	}
	function hapus(index: number) {
		rows = rows.filter((_, rowIndex) => rowIndex !== index);
	}
	function hapusSemua() {
		if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian E?`)) rows = [];
	}
</script>

<Stack gap="12px">
	{#if bisaEdit}
		<Stack direction="horizontal" align="end">
			<ActionButton onclick={bukaTambah}>Tambah</ActionButton>
			<ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
		</Stack>
	{/if}
	<DataTable label="Daftar bukti pemotongan atau pemungutan PPh" minWidth="1240px" headerTone="navy" density="compact">
		<table>
			<thead><tr>
				{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Nama Pemotong/Pemungut PPh</th>
				<th scope="col">NPWP Pemotong/Pemungut PPh</th><th scope="col">Nomor Bukti Pemotongan/Pemungutan</th>
				<th scope="col">Tanggal Bukti Pemotongan/Pemungutan</th><th scope="col">Jenis Pajak</th>
				<th scope="col" class="right">Penghasilan Bruto</th><th scope="col" class="right">PPh yang Dipotong/Dipungut</th>
			</tr></thead>
			<tbody>
				{#each rows as row, index}<tr>
					{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
					<td>{index + 1}</td><td>{row.namaPemotong}{#if row.sumberBuktiPotongId}<span class="badge-impor">Diimpor</span>{/if}</td>
					<td>{row.npwpPemotong}</td><td>{row.nomorBukti}</td><td>{row.tanggalBukti}</td><td>{row.jenisPajak}</td>
					<td class="number amount">{formatRupiahDerived(row.penghasilanBruto)}</td><td class="number amount">{formatRupiahDerived(row.pphDipotong)}</td>
				</tr>{:else}<tr><td colspan={bisaEdit ? 9 : 8} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}
			</tbody>
			<tfoot>
				<tr><th scope="row" colspan={bisaEdit ? 8 : 7}>Jumlah</th><td class="number amount">{formatRupiahDerived(jumlah)}</td></tr>
				<tr><th scope="row" colspan={bisaEdit ? 8 : 7}>Kredit Pajak atas Penghasilan Luar Negeri</th><td class="number amount">{formatRupiahDerived(kreditPajakLuarNegeri)}</td></tr>
				<tr><th scope="row" colspan={bisaEdit ? 8 : 7}>Jumlah Bagian E</th><td class="number amount">{formatRupiahDerived(jumlahBagianE)}</td></tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalTerbuka} title="Penghasilan Bruto" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Nama Pemotong/Pemungut PPh" bind:value={draft.namaPemotong} error={errors.namaPemotong} required />
		<FormField label="NPWP Pemotong/Pemungut PPh" bind:value={draft.npwpPemotong} error={errors.npwpPemotong} required />
		<FormField label="Nomor Bukti Pemotongan/Pemungutan" bind:value={draft.nomorBukti} error={errors.nomorBukti} required />
		<FormField label="Tanggal Bukti Pemotongan/Pemungutan" type="date" bind:value={draft.tanggalBukti} error={errors.tanggalBukti} required />
		<SelectField label="Jenis Pajak" bind:value={draft.jenisPajak} options={jenisPajakOptions} error={errors.jenisPajak} required />
		<RupiahField label="Penghasilan Bruto" bind:value={draft.penghasilanBruto} error={errors.penghasilanBruto} required />
		<RupiahField label="PPh yang Dipotong/Dipungut" bind:value={draft.pphDipotong} error={errors.pphDipotong} required />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>

<style>
	.badge-impor {
		display: inline-block;
		margin-left: 0.4rem;
		padding: 0.05rem 0.4rem;
		font-size: 0.8rem;
		font-weight: bold;
		color: white;
		background-color: var(--color-secondary);
		border-radius: 0.25rem;
	}
</style>
