<script lang="ts">
	import { ActionButton, DataTable, FieldGrid, FormField, InstitutionalModal, SelectField, Stack, TableActions } from "$lib/re-ui-components";
	import type { BarisKeluarga } from "./types";

	interface Props {
		rows: BarisKeluarga[];
		referensi: Record<string, string[]>;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, readonly = false }: Props = $props();
	const kosong = (): BarisKeluarga => ({ nama: "", nik: "", tanggalLahir: "", hubungan: "", pekerjaan: "" });
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisKeluarga>(kosong());
	let errors = $state<Record<string, string>>({});
	let modalTerbuka = $state(false);
	let bisaEdit = $derived(!readonly);
	let hubunganOptions = $derived([
		{ value: "", label: "Silakan pilih" },
		...(referensi.l1_c_hubungan ?? []).map((value) => ({ value, label: value }))
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
		if (!draft.nama) next.nama = "Kolom ini wajib diisi!";
		if (!draft.nik) next.nik = "Kolom ini wajib diisi!";
		if (!draft.tanggalLahir) next.tanggalLahir = "Kolom ini wajib diisi!";
		if (!draft.hubungan) next.hubungan = "Kolom ini wajib diisi!";
		errors = next;
		if (Object.keys(next).length > 0) return;
		const baris = { ...draft };
		if (indeksDiubah === null) rows = [...rows, baris];
		else rows = rows.map((row, index) => (index === indeksDiubah ? baris : row));
		modalTerbuka = false;
	}
	function hapus(index: number) {
		rows = rows.filter((_, rowIndex) => rowIndex !== index);
	}
	function hapusSemua() {
		if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian C?`)) rows = [];
	}
</script>

<Stack gap="12px">
	{#if bisaEdit}
		<Stack direction="horizontal" align="end">
			<ActionButton onclick={bukaTambah}>Tambah</ActionButton>
			<ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
		</Stack>
	{/if}
	<DataTable label="Daftar anggota keluarga yang menjadi tanggungan" minWidth="900px" headerTone="navy" density="compact">
		<table>
			<thead><tr>
				{#if bisaEdit}<th scope="col">Tindakan</th>{/if}<th scope="col">No.</th><th scope="col">Nama</th><th scope="col">NIK</th>
				<th scope="col">Tanggal Lahir</th><th scope="col">Hubungan dengan Wajib Pajak</th><th scope="col">Pekerjaan</th>
			</tr></thead>
			<tbody>
				{#each rows as row, index}<tr>
					{#if bisaEdit}<td class="action-cell"><TableActions actions={[{ label: "Ubah", onclick: () => bukaUbah(index) }, { label: "Hapus", danger: true, onclick: () => hapus(index) }]} /></td>{/if}
					<td>{index + 1}</td><td>{row.nama}</td><td>{row.nik}</td><td>{row.tanggalLahir}</td><td>{row.hubungan}</td><td>{row.pekerjaan}</td>
				</tr>{:else}<tr><td colspan={bisaEdit ? 7 : 6} class="empty">Tidak ada data yang ditemukan.</td></tr>{/each}
			</tbody>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalTerbuka} title="Daftar Anggota Keluarga yang Menjadi Tanggungan" eyebrow="LAMPIRAN L-1" size="wide" scrollable>
	<FieldGrid columns={2}>
		<FormField label="Nama" bind:value={draft.nama} error={errors.nama} required />
		<FormField label="NIK" bind:value={draft.nik} error={errors.nik} required />
		<FormField label="Tanggal Lahir" type="date" bind:value={draft.tanggalLahir} error={errors.tanggalLahir} required />
		<SelectField label="Hubungan dengan Wajib Pajak" bind:value={draft.hubungan} options={hubunganOptions} error={errors.hubungan} required />
		<FormField label="Pekerjaan" bind:value={draft.pekerjaan} error={errors.pekerjaan} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalTerbuka = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
