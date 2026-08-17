<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Table from "$lib/components/Table.svelte";
    import ModalEdit from "./ModalEdit.svelte";
    import { formatRupiah } from "$lib/helpers/rupiahInput";
    import type { ColumnSpec, FieldSpec, LampiranRow } from "./types";

    interface Props {
        judul: string;
        // The row-editor modal's own title. Coretax's differs from the section
        // heading on three grids (and one is untranslated English); we use a
        // consistent Indonesian title instead of copying those strings.
        judulModal?: string;
        columns: ColumnSpec[];
        fields: FieldSpec[];
        rows: LampiranRow[];
        referensi: Record<string, string[]>;
        // A grid is editable exactly when the Induk question routing to it is Ya.
        // A gated-off grid still renders its rows, it just offers no way to add
        // or remove them. Editability is derived state, not per-grid config.
        dapatDiubah?: boolean;
        readonly?: boolean;
        // Which column the JUMLAH footer totals. Omit for grids with no total.
        totalKey?: string;
        totalLabel?: string;
        kosong?: string;
    }

    let {
        judul,
        judulModal,
        columns,
        fields,
        rows = $bindable(),
        referensi,
        dapatDiubah = true,
        readonly = false,
        totalKey,
        totalLabel = 'JUMLAH',
        kosong = 'Tidak ada data yang ditemukan.'
    }: Props = $props();

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let total = $derived(
        totalKey ? rows.reduce((sum, row) => sum + Number(row[totalKey] || 0), 0) : 0
    );

    function baris(): LampiranRow {
        const row: LampiranRow = {};
        for (const field of fields) {
            row[field.key] = field.kind === 'rupiah' || field.kind === 'tahun' ? 0 : '';
        }
        return row;
    }

    function tambah() {
        indeksDiubah = null;
        modalTerbuka = true;
    }

    function ubah(index: number) {
        indeksDiubah = index;
        modalTerbuka = true;
    }

    function simpan(row: LampiranRow) {
        if (indeksDiubah === null) rows = [...rows, row];
        else rows = rows.map((existing, i) => (i === indeksDiubah ? row : existing));
        modalTerbuka = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada ${judul}?`)) {
            rows = [];
        }
    }

    function tampilkan(row: LampiranRow, column: ColumnSpec) {
        const value = row[column.key];
        if (column.kind === 'rupiah') return formatRupiah(Number(value));
        return String(value ?? '');
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">{judul}</span>
        {#if bisaEdit}
            <div class="tw:flex tw:gap-2">
                <Button type="button" onclick={tambah}>Tambah</Button>
                <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
            </div>
        {/if}
    </div>

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    {#each columns as column}
                        <th>{column.label}</th>
                    {/each}
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => ubah(index)}>Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        {#each columns as column}
                            <!-- Escaped by Svelte on render. Coretax stores and
                                 redisplays angle brackets verbatim; we do not. -->
                            <td class={column.kind === 'rupiah' ? 'tw:text-end' : ''}>{tampilkan(row, column)}</td>
                        {/each}
                    </tr>
                {:else}
                    <tr>
                        <td colspan={columns.length + (bisaEdit ? 2 : 1)} class="tw:text-center">{kosong}</td>
                    </tr>
                {/each}
                {#if totalKey}
                    <tr class="total">
                        <td colspan={columns.length + (bisaEdit ? 2 : 1) - 1}>{totalLabel}</td>
                        <td class="tw:text-end">{formatRupiah(total)}</td>
                    </tr>
                {/if}
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <ModalEdit
        judul={judulModal ?? judul}
        {fields}
        rowAwal={() => (indeksDiubah === null ? baris() : { ...rows[indeksDiubah] })}
        {referensi}
        onSimpan={simpan}
        onTutup={() => (modalTerbuka = false)}
    />
{/if}

<style>
    th {
        font-size: 0.7rem;
        text-align: left;
        padding: 0.4rem 0.5rem;
        white-space: nowrap;
    }
    td {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
    }
    tr.total td {
        font-weight: bold;
        background-color: #F9F6EE;
    }
</style>
