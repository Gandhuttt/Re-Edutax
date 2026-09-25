<script lang="ts">
    import { kodeUntuk, type DaftarReferensi, type KodeReferensi } from "../referensi";
    import {
        ActionButton,
        DataTable,
        FieldGrid,
        FormField,
        InstitutionalModal,
        RupiahField,
        SelectField,
        Stack,
        TableActions
    } from "$lib/re-ui-components";
    import { formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisPengurang } from "./types";

    // B. PENGURANG PENGHASILAN NETO. Feeds Induk row 3 together with L-5 A's
    // kompensasiTahunIni column: JUMLAH PENGURANG PENGHASILAN NETO is their sum.
    interface Props {
        rows: BarisPengurang[];
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, kodeReferensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisPengurang => ({ kode: '', jenisPengurang: '', jumlah: 0 });
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisPengurang>(kosong());

    // Coretax derives the disabled KODE cell from the chosen description.
    let kode = $derived(kodeUntuk(kodeReferensi, 'l5_b_jenis', draft.jenisPengurang));
    let errors = $state<Record<string, string>>({});
    let modalOpen = $state(false);

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(rows.reduce((s, r) => s + Number(r.jumlah || 0), 0));

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
        if (!draft.jenisPengurang) next.jenisPengurang = 'Kolom ini wajib diisi!';
        if (!draft.jumlah) next.jumlah = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        draft.kode = kode;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalOpen = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian B?`)) rows = [];
    }
</script>

{#if bisaEdit}
    <div class="toolbar">
        <Stack direction="horizontal" gap="8px" align="center">
            <ActionButton onclick={bukaTambah}>Tambah</ActionButton>
            <ActionButton tone="danger" onclick={hapusSemua}>Hapus Semua</ActionButton>
        </Stack>
    </div>
{/if}

<DataTable
    label="Pengurang penghasilan neto"
    minWidth="820px"
    headerTone="navy"
    density="compact"
>
    <table>
        <thead>
            <tr>
                {#if bisaEdit}<th class="action-cell" scope="col">TINDAKAN</th>{/if}
                <th scope="col">NO.</th>
                <th scope="col">KODE</th>
                <th scope="col">JENIS PENGURANG PENGHASILAN NETO</th>
                <th class="right" scope="col">JUMLAH PENGURANG PENGHASILAN NETO</th>
            </tr>
        </thead>
        <tbody>
            {#each rows as row, index}
                <tr>
                    {#if bisaEdit}
                        <td class="action-cell">
                            <TableActions
                                visibleCount={2}
                                ariaLabel={`Aksi baris ${index + 1}`}
                                actions={[
                                    { label: 'Ubah', onclick: () => bukaUbah(index) },
                                    { label: 'Hapus', danger: true, onclick: () => hapus(index) }
                                ]}
                            />
                        </td>
                    {/if}
                    <td>{index + 1}</td>
                    <td>{row.kode}</td>
                    <td>{row.jenisPengurang}</td>
                    <td class="number">{formatRupiahDerived(row.jumlah)}</td>
                </tr>
            {:else}
                <tr>
                    <td colspan={bisaEdit ? 5 : 4} class="empty">Tidak ada data untuk ditampilkan.</td>
                </tr>
            {/each}
        </tbody>
        <tfoot>
            <tr>
                <th scope="row" colspan={bisaEdit ? 4 : 3}>JUMLAH</th>
                <td class="number amount">{formatRupiahDerived(total)}</td>
            </tr>
        </tfoot>
    </table>
</DataTable>

<InstitutionalModal
    bind:open={modalOpen}
    eyebrow="LAMPIRAN L-5"
    title="Pengurangan Penghasilan Neto"
    size="wide"
>
    <FieldGrid columns={1}>
        <FormField id="l5b-kode" label="Kode" value={kode} disabled />
        <SelectField
            label="Jenis Pengurang Penghasilan Neto"
            bind:value={draft.jenisPengurang}
            options={[
                { value: '', label: 'Silakan pilih' },
                ...(referensi.l5_b_jenis ?? []).map((opsi) => ({ value: opsi, label: opsi }))
            ]}
            error={errors.jenisPengurang}
            floatingPanel
            required
        />
        <RupiahField
            id="l5b-jumlah"
            label="Jumlah Pengurang Penghasilan Neto"
            bind:value={draft.jumlah}
            error={errors.jumlah}
            required
        />
    </FieldGrid>

    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

<style>
    .toolbar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
    }
</style>
