<script lang="ts">
	import {
		ActionButton,
		DataTable,
		DateField,
		FieldGrid,
		FormField,
		InstitutionalModal,
		RupiahField,
		SelectField,
		Stack,
		TableActions
	} from '$lib/re-ui-components';
	import { formatRupiahDerived } from '$lib/helpers/rupiahInput';
	import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from '../referensi';
	import type { BarisLuarNegeri } from './types';

	interface Props {
		rows: BarisLuarNegeri[];
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		dapatDiubah?: boolean;
		readonly?: boolean;
	}

	let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

	const kosong = (): BarisLuarNegeri => ({
		namaSumber: '',
		negara: '',
		tanggalTransaksi: '',
		jenisPenghasilan: '',
		kodePenghasilan: '',
		penghasilanNeto: 0,
		pajakLuarNegeriAsing: 0,
		mataUang: '',
		pajakLuarNegeriRupiah: 0,
		kreditPajakDiperhitungkan: 0
	});
	let indeksDiubah = $state<number | null>(null);
	let draft = $state<BarisLuarNegeri>(kosong());
	let modalOpen = $state(false);
	let errors = $state<Record<string, string>>({});

	let kode = $derived(kodeUntuk(kodeReferensi, 'l2_c_jenis_penghasilan', draft.jenisPenghasilan));
	let bisaEdit = $derived(dapatDiubah && !readonly);
	let totalNeto = $derived(rows.reduce((sum, row) => sum + Number(row.penghasilanNeto || 0), 0));
	let totalPajakRupiah = $derived(rows.reduce((sum, row) => sum + Number(row.pajakLuarNegeriRupiah || 0), 0));
	let totalKredit = $derived(rows.reduce((sum, row) => sum + Number(row.kreditPajakDiperhitungkan || 0), 0));
	let negaraOptions = $derived([
		{ value: '', label: 'Silakan pilih' },
		...(referensi.negara ?? []).map((label) => ({ value: label, label }))
	]);
	let jenisOptions = $derived([
		{ value: '', label: 'Silakan pilih' },
		...(referensi.l2_c_jenis_penghasilan ?? []).map((label) => ({ value: label, label }))
	]);
	let mataUangOptions = $derived([
		{ value: '', label: 'Silakan pilih' },
		...(referensi.mata_uang ?? []).map((label) => ({ value: label, label }))
	]);

	function bukaTambah() {
		indeksDiubah = null;
		draft = kosong();
		errors = {};
		modalOpen = true;
	}

	function bukaUbah(index: number) {
		indeksDiubah = index;
		draft = { ...rows[index] };
		errors = {};
		modalOpen = true;
	}

	function simpanModal() {
		const next: Record<string, string> = {};
		if (!draft.namaSumber) next.namaSumber = 'Kolom ini wajib diisi!';
		if (!draft.negara) next.negara = 'Kolom ini wajib diisi!';
		if (!draft.tanggalTransaksi) next.tanggalTransaksi = 'Kolom ini wajib diisi!';
		if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
		if (!draft.penghasilanNeto) next.penghasilanNeto = 'Kolom ini wajib diisi!';
		if (!draft.pajakLuarNegeriAsing) next.pajakLuarNegeriAsing = 'Kolom ini wajib diisi!';
		if (!draft.mataUang) next.mataUang = 'Kolom ini wajib diisi!';
		if (!draft.pajakLuarNegeriRupiah) next.pajakLuarNegeriRupiah = 'Kolom ini wajib diisi!';
		if (!draft.kreditPajakDiperhitungkan) next.kreditPajakDiperhitungkan = 'Kolom ini wajib diisi!';
		errors = next;
		if (Object.keys(next).length > 0) return;

		draft.kodePenghasilan = kode;
		if (indeksDiubah === null) rows = [...rows, draft];
		else rows = rows.map((row, index) => (index === indeksDiubah ? draft : row));
		modalOpen = false;
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

	<DataTable label="Penghasilan neto luar negeri" minWidth="1580px" headerTone="navy" density="compact">
		<table>
			<thead>
				<tr>
					{#if bisaEdit}<th scope="col">Tindakan</th>{/if}
					<th scope="col">No.</th>
					<th scope="col">Sumber/Pemberi Penghasilan</th>
					<th scope="col">Negara</th>
					<th scope="col">Tanggal Transaksi</th>
					<th scope="col">Jenis Penghasilan</th>
					<th scope="col" class="right">Penghasilan Neto (Rupiah)</th>
					<th scope="col">Mata Uang Asing</th>
					<th scope="col" class="right">Nilai dalam Mata Uang Asing</th>
					<th scope="col" class="right">Nilai dalam Rupiah</th>
					<th scope="col" class="right">Kredit Pajak yang Dapat Diperhitungkan</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row, index}
					<tr>
						{#if bisaEdit}
							<td class="action-cell">
								<TableActions
									actions={[
										{ label: 'Ubah', onclick: () => bukaUbah(index) },
										{ label: 'Hapus', danger: true, onclick: () => hapus(index) }
									]}
								/>
							</td>
						{/if}
						<td>{index + 1}</td>
						<td>{row.namaSumber}</td>
						<td>{row.negara}</td>
						<td>{row.tanggalTransaksi}</td>
						<td>{row.jenisPenghasilan}</td>
						<td class="right amount">{formatRupiahDerived(row.penghasilanNeto)}</td>
						<td>{row.mataUang}</td>
						<td class="right amount">{formatRupiahDerived(row.pajakLuarNegeriAsing)}</td>
						<td class="right amount">{formatRupiahDerived(row.pajakLuarNegeriRupiah)}</td>
						<td class="right amount">{formatRupiahDerived(row.kreditPajakDiperhitungkan)}</td>
					</tr>
				{:else}
					<tr><td colspan={bisaEdit ? 11 : 10} class="empty">Tidak ada data untuk ditampilkan.</td></tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th scope="row" colspan={bisaEdit ? 6 : 5}>Jumlah Penghasilan Neto</th>
					<td class="right amount">{formatRupiahDerived(totalNeto)}</td>
					<td colspan="2"></td>
					<td class="right amount">{formatRupiahDerived(totalPajakRupiah)}</td>
					<td class="right amount">{formatRupiahDerived(totalKredit)}</td>
				</tr>
			</tfoot>
		</table>
	</DataTable>
</Stack>

<InstitutionalModal bind:open={modalOpen} title="Penghasilan Luar Negeri" size="large" scrollable>
	<FieldGrid>
		<FormField label="Nama Sumber/Pemberi Penghasilan" bind:value={draft.namaSumber} required error={errors.namaSumber} />
		<SelectField label="Negara Sumber/Pemberi Penghasilan" bind:value={draft.negara} options={negaraOptions} searchable required error={errors.negara} />
		<DateField label="Tanggal Transaksi" bind:value={draft.tanggalTransaksi} required error={errors.tanggalTransaksi} floatingPanel />
		<SelectField label="Jenis Penghasilan" bind:value={draft.jenisPenghasilan} options={jenisOptions} searchable required error={errors.jenisPenghasilan} />
		<FormField label="Kode Penghasilan" value={kode} readonly />
		<RupiahField label="Penghasilan Neto" bind:value={draft.penghasilanNeto} required error={errors.penghasilanNeto} />
		<RupiahField label="Pajak di Luar Negeri dalam Mata Uang Asing" bind:value={draft.pajakLuarNegeriAsing} required error={errors.pajakLuarNegeriAsing} currencyPrefix="" />
		<SelectField label="Mata Uang" bind:value={draft.mataUang} options={mataUangOptions} searchable required error={errors.mataUang} />
		<RupiahField label="Pajak di Luar Negeri dalam Rupiah" bind:value={draft.pajakLuarNegeriRupiah} required error={errors.pajakLuarNegeriRupiah} />
		<RupiahField label="Kredit Pajak yang Dapat Diperhitungkan" bind:value={draft.kreditPajakDiperhitungkan} required error={errors.kreditPajakDiperhitungkan} />
	</FieldGrid>
	{#snippet actions()}
		<ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
		<ActionButton onclick={simpanModal}>Simpan</ActionButton>
	{/snippet}
</InstitutionalModal>
