<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisFinalBulanan, BarisPeredaranBulanan, TkuL3B } from "./types";

    // REKAPITULASI PEREDARAN BRUTO. DAFTAR TKU here is pre-filled from DJP
    // records and read-only on the live form; we have no such source, so it is
    // user-editable instead, same divergence as Badan's L-5 TKU rows (manually
    // entered rather than DJP-prefilled). Only one TKU is modeled, matching the
    // only case ever observed live (see L3B.md's "Not captured" list).
    //
    // All three sections render unconditionally; only the section matching the
    // current Induk 1.b.2/1.b.3 gate gets a working TINDAKAN column, mirroring
    // the "a lampiran grid is editable only when its own gate is on" rule and
    // the measured Bagian A freeze-not-delete behavior when the gate moves off.
    interface Props {
        currentTab: string;
        npwp: string;
        metodePembukuan: string;
        tku: TkuL3B;
        a: BarisFinalBulanan[];
        b: BarisPeredaranBulanan[];
        c: BarisPeredaranBulanan[];
        b1b2Oppt: string;
        b1b3Norma: string;
        readonly?: boolean;
    }

    let {
        currentTab,
        npwp,
        metodePembukuan,
        tku = $bindable(),
        a = $bindable(),
        b = $bindable(),
        c = $bindable(),
        b1b2Oppt,
        b1b3Norma,
        readonly = false
    }: Props = $props();

    const metodeLabel: Record<string, string> = {
        pencatatan: '1 (Pencatatan)',
        pembukuan_kas: '2 (Pembukuan Stelsel Kas)',
        pembukuan_akrual: '2 (Pembukuan Stelsel Akrual)'
    };

    let idTku = $derived(`${npwp}000000`);

    let modalTerbuka = $state(false);
    let draft = $state<TkuL3B>({ ...tku });

    function bukaUbah() {
        draft = { ...tku };
        modalTerbuka = true;
    }

    function simpanModal() {
        tku = { ...draft };
        modalTerbuka = false;
    }
</script>

<div class="{currentTab === 'L-3B' ? '' : 'tw:hidden'}">
    <div class="tw:mb-6">
        <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
            <span class="tw:text-sm tw:font-bold">DAFTAR TEMPAT KEGIATAN USAHA (TKU)</span>
            {#if !readonly}
                <Button type="button" onclick={bukaUbah}>Ubah</Button>
            {/if}
        </div>
        <div class="tw:overflow-x-auto">
            <Table class="tw:min-w-full">
                {#snippet head()}
                    <tr>
                        <th>ID TKU</th>
                        <th>NAMA</th>
                        <th>ALAMAT</th>
                        <th>KELURAHAN/DESA</th>
                        <th>KECAMATAN</th>
                        <th>KOTA/KABUPATEN</th>
                        <th>PROVINSI</th>
                    </tr>
                {/snippet}
                {#snippet body()}
                    <tr>
                        <td>{idTku}</td>
                        <td>{tku.nama}</td>
                        <td>{tku.alamat}</td>
                        <td>{tku.kelurahan}</td>
                        <td>{tku.kecamatan}</td>
                        <td>{tku.kabupaten}</td>
                        <td>{tku.provinsi}</td>
                    </tr>
                {/snippet}
            </Table>
        </div>
    </div>

    <A
        bind:rows={a}
        namaTku={tku.nama}
        dapatDiubah={b1b2Oppt === 'peredaran_bruto_tertentu'}
        {readonly}
    />
    <B
        bind:rows={b}
        namaTku={tku.nama}
        metodePembukuanLabel={metodeLabel[metodePembukuan] ?? metodePembukuan}
        dapatDiubah={b1b2Oppt === 'pengusaha_tertentu'}
        {readonly}
    />
    <C
        bind:rows={c}
        namaTku={tku.nama}
        bind:jenisUsahaPekerjaanBebas={tku.jenisUsahaPekerjaanBebas}
        dapatDiubah={b1b3Norma === 'ya_norma'}
        {readonly}
    />
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">TEMPAT KEGIATAN USAHA</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l3btku-id"><span>ID TKU (tidak dapat diubah)</span></Label>
                    <Input id="l3btku-id" type={"text"} value={idTku} disabled />
                </div>
                <div class="field">
                    <Label for="l3btku-nama"><span>Nama</span></Label>
                    <Input id="l3btku-nama" type={"text"} bind:value={draft.nama} />
                </div>
                <div class="field">
                    <Label for="l3btku-alamat"><span>Alamat</span></Label>
                    <Input id="l3btku-alamat" type={"text"} bind:value={draft.alamat} />
                </div>
                <div class="field">
                    <Label for="l3btku-kelurahan"><span>Kelurahan/Desa</span></Label>
                    <Input id="l3btku-kelurahan" type={"text"} bind:value={draft.kelurahan} />
                </div>
                <div class="field">
                    <Label for="l3btku-kecamatan"><span>Kecamatan</span></Label>
                    <Input id="l3btku-kecamatan" type={"text"} bind:value={draft.kecamatan} />
                </div>
                <div class="field">
                    <Label for="l3btku-kabupaten"><span>Kota/Kabupaten</span></Label>
                    <Input id="l3btku-kabupaten" type={"text"} bind:value={draft.kabupaten} />
                </div>
                <div class="field">
                    <Label for="l3btku-provinsi"><span>Provinsi</span></Label>
                    <Input id="l3btku-provinsi" type={"text"} bind:value={draft.provinsi} />
                </div>
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
    	font-size: .8rem;
    	padding: .25rem .5rem;
    	border: 1px solid white;
    }
    tr:not(.total):not(.footer):nth-child(odd) {
    	background-color: #F9F6EE;
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
    .body { overflow-y: auto; padding: 1rem; display: grid; gap: 0.75rem; }
    .field { display: grid; gap: 0.25rem; }
</style>
