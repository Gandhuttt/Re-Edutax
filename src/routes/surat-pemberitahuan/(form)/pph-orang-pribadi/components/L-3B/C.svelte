<script lang="ts">
    import {
        ActionButton,
        DataTable,
        FormField,
        InstitutionalModal,
        Stack,
        TableActions
    } from "$lib/re-ui-components";
    import { applyRupiahInput, formatRupiah, formatRupiahDerived } from "$lib/helpers/rupiahInput";
    import type { BarisPeredaranBulanan } from "./types";

    // C. PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN).
    //
    // JUMLAH PPh is always 0 here, matching the live form: section C carries no
    // tax of its own. The neto derivation lives in L-3A-4 Bagian A.
    const bulanNames = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ];

    interface Props {
        rows: BarisPeredaranBulanan[];
        namaTku: string;
        jenisUsahaPekerjaanBebas: string;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let {
        rows = $bindable(),
        namaTku,
        jenisUsahaPekerjaanBebas = $bindable(),
        dapatDiubah = true,
        readonly = false
    }: Props = $props();

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let jumlahBruto = $derived(rows.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0));
    let modalOpen = $state(false);
    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));
    let draftJenisUsaha = $state("");

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        draftJenisUsaha = jenisUsahaPekerjaanBebas;
        modalOpen = true;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        jenisUsahaPekerjaanBebas = draftJenisUsaha;
        modalOpen = false;
    }
</script>

<DataTable
    label="Peredaran bruto pengguna norma penghitungan penghasilan neto"
    minWidth="1900px"
    framed={false}
    headerTone="navy"
    density="compact"
>
    <table>
        <thead>
            <tr>
                {#if bisaEdit}<th scope="col">Tindakan</th>{/if}
                <th scope="col">Nama TKU</th>
                <th scope="col">Jenis Usaha/Pekerjaan Bebas</th>
                {#each bulanNames as bulan}
                    <th scope="col" class="right">{bulan}</th>
                {/each}
                <th scope="col" class="right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                {#if bisaEdit}
                    <td class="action-cell">
                        <TableActions
                            visibleCount={1}
                            actions={[{ label: "Ubah", onclick: bukaUbah }]}
                        />
                    </td>
                {/if}
                <td>{namaTku}</td>
                <td>{jenisUsahaPekerjaanBebas}</td>
                {#each rows as row}
                    <td class="right number">{formatRupiahDerived(row.peredaranBruto)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(jumlahBruto)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row" colspan="2">Jumlah Peredaran Bruto</th>
                {#each rows as row}
                    <td class="right number">{formatRupiahDerived(row.peredaranBruto)}</td>
                {/each}
                <td class="right number amount">{formatRupiahDerived(jumlahBruto)}</td>
            </tr>
            <tr class="summary-row">
                {#if bisaEdit}<td></td>{/if}
                <th scope="row" colspan="2">Jumlah PPh</th>
                {#each bulanNames as _}
                    <td class="right number">0</td>
                {/each}
                <td class="right number amount">0</td>
            </tr>
        </tbody>
    </table>
</DataTable>

<InstitutionalModal
    bind:open={modalOpen}
    title={`Pengguna Norma Penghitungan Penghasilan Neto - ${namaTku}`}
    size="wide"
    scrollable
>
    <Stack gap="18px">
        <FormField
            label="Jenis Usaha/Pekerjaan Bebas"
            id="l3bc-jenis"
            bind:value={draftJenisUsaha}
        />
        <DataTable
            label={`Peredaran bruto bulanan NPPN ${namaTku}`}
            minWidth="520px"
            framed={false}
            headerTone="navy"
            density="compact"
        >
            <table>
                <thead>
                    <tr>
                        <th scope="col">Bulan</th>
                        <th scope="col" class="right">Peredaran Bruto (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    {#each draft as item, index}
                        <tr>
                            <td>{bulanNames[index]}</td>
                            <td>
                                <input
                                    type="text"
                                    inputmode="numeric"
                                    aria-label={`Peredaran bruto ${bulanNames[index]}`}
                                    value={formatRupiah(item.peredaranBruto)}
                                    oninput={(e) => (draft[index].peredaranBruto = applyRupiahInput(e))}
                                    class="table-rupiah-input"
                                />
                            </td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr>
                        <th scope="row">Jumlah</th>
                        <td class="right number amount">
                            {formatRupiahDerived(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </DataTable>
    </Stack>
    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

<style>
    .table-rupiah-input {
        width: 100%;
        min-width: 100px;
        padding: 6px 8px;
        border: 1px solid var(--ui-line-strong);
        border-radius: 3px;
        background: #fffefa;
        text-align: right;
    }

    .table-rupiah-input:focus {
        outline: 3px solid var(--ui-yellow-soft);
        border-color: var(--ui-navy);
    }

    .summary-row th,
    .summary-row td {
        font-weight: 700;
        background: var(--ui-paper-deep);
    }
</style>
