<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisPeredaranBulanan } from "./types";

    // C. PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN).
    //
    // JUMLAH PPh is always 0: the norma percentage/classification reference
    // table isn't available to us, see L3B.md's "Not captured" list, so the
    // neto derivation from JENIS USAHA/PEKERJAAN BEBAS cannot be modeled.
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

    let modalTerbuka = $state(false);
    let draft = $state<BarisPeredaranBulanan[]>(rows.map((r) => ({ ...r })));
    let draftJenisUsaha = $state('');

    function bukaUbah() {
        draft = rows.map((r) => ({ ...r }));
        draftJenisUsaha = jenisUsahaPekerjaanBebas;
        modalTerbuka = true;
    }

    function simpanModal() {
        rows = draft.map((r) => ({ ...r, peredaranBruto: Number(r.peredaranBruto || 0) }));
        jenisUsahaPekerjaanBebas = draftJenisUsaha;
        modalTerbuka = false;
    }
</script>

<div class="tw:mb-6">
    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[6rem]">TINDAKAN</th>{/if}
                    <th>NAMA TKU</th>
                    <th>JENIS USAHA/PEKERJAAN BEBAS</th>
                    {#each bulanNames as bulan}
                        <th class="tw:text-end">{bulan}</th>
                    {/each}
                    <th class="tw:text-end">JUMLAH</th>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr>
                    {#if bisaEdit}
                        <td>
                            <Button type="button" onclick={bukaUbah}>Ubah</Button>
                        </td>
                    {/if}
                    <td>{namaTku}</td>
                    <td>{jenisUsahaPekerjaanBebas}</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiah(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiah(jumlahBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td colspan="2">JUMLAH PEREDARAN BRUTO</td>
                    {#each rows as row}
                        <td class="tw:text-end">{formatRupiah(row.peredaranBruto)}</td>
                    {/each}
                    <td class="tw:text-end">{formatRupiah(jumlahBruto)}</td>
                </tr>
                <tr class="footer">
                    {#if bisaEdit}<td></td>{/if}
                    <td colspan="2">JUMLAH PPh</td>
                    {#each bulanNames as _}
                        <td class="tw:text-end">0</td>
                    {/each}
                    <td class="tw:text-end">0</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO - {namaTku}</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field tw:mb-3">
                    <Label for="l3bc-jenis"><span>Jenis Usaha/Pekerjaan Bebas</span></Label>
                    <Input id="l3bc-jenis" type={"text"} bind:value={draftJenisUsaha} />
                </div>
                <table class="tw:w-full tw:text-sm">
                    <thead>
                        <tr>
                            <th class="tw:text-left">Bulan</th>
                            <th class="tw:text-end">Peredaran Bruto</th>
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
                                        value={formatRupiah(item.peredaranBruto)}
                                        oninput={(e) => (draft[index].peredaranBruto = applyRupiahInput(e))}
                                        class="tw:w-full tw:text-end"
                                    />
                                </td>
                            </tr>
                        {/each}
                        <tr class="tw:font-bold">
                            <td>JUMLAH</td>
                            <td class="tw:text-end">
                                {formatRupiah(draft.reduce((s, r) => s + Number(r.peredaranBruto || 0), 0))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <footer>
                <Button type="button" onclick={() => (modalTerbuka = false)}>Tutup</Button>
                <Button type="button" onclick={simpanModal} color="var(--color-secondary)">
                    <span class="tw:text-white">Simpan</span>
                </Button>
            </footer>
        </div>
    </div>
{/if}

<style>
    th {
    	font-size: .7rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .4rem .5rem;
    	white-space: nowrap;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
    td {
    	font-size: .75rem;
    	padding: .3rem .4rem;
    	white-space: nowrap;
    	border: 1px solid white;
    }
    tr:not(.total):not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
    }
    tr.footer td {
    	font-weight: bold;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }
    .modal {
        background: white;
        width: min(32rem, 92vw);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 0.25rem;
    }
    header, footer {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
    }
    header { justify-content: space-between; border-bottom: 1px solid #ddd; }
    header button { font-size: 1.5rem; line-height: 1; background: none; border: none; cursor: pointer; }
    footer { justify-content: flex-end; gap: 0.5rem; border-top: 1px solid #ddd; }
    .body { overflow-y: auto; padding: 1rem; }
    .body table th, .body table td { padding: .3rem .4rem; }
    .field { display: grid; gap: 0.25rem; }
</style>
