<script lang="ts">
    import {
        ActionButton,
        DataTable,
        DisclosureItem,
        FieldGrid,
        FormField,
        InstitutionalModal,
        Stack
    } from "$lib/re-ui-components";
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
        pencatatan: "1 (Pencatatan)",
        pembukuan_kas: "2 (Pembukuan Stelsel Kas)",
        pembukuan_akrual: "2 (Pembukuan Stelsel Akrual)"
    };

    let idTku = $derived(`${npwp}000000`);
    let draft = $state<TkuL3B>({ ...tku });
    let modalOpen = $state(false);

    function bukaUbah() {
        draft = { ...tku };
        modalOpen = true;
    }

    function simpanModal() {
        tku = { ...draft };
        modalOpen = false;
    }
</script>

<div class:hidden={currentTab !== "L-3B"}>
    <Stack gap="0">
        <DisclosureItem title="DAFTAR TEMPAT KEGIATAN USAHA (TKU)">
            <Stack gap="16px">
                {#if !readonly}
                    <div class="actions"><ActionButton onclick={bukaUbah}>Ubah</ActionButton></div>
                {/if}
                <DataTable label="Daftar tempat kegiatan usaha" minWidth="920px" framed={false} headerTone="navy" density="compact">
                    <table>
                        <thead><tr>
                            <th scope="col">ID TKU</th><th scope="col">Nama</th><th scope="col">Alamat</th>
                            <th scope="col">Kelurahan/Desa</th><th scope="col">Kecamatan</th>
                            <th scope="col">Kota/Kabupaten</th><th scope="col">Provinsi</th>
                        </tr></thead>
                        <tbody><tr>
                            <td>{idTku}</td><td>{tku.nama}</td><td>{tku.alamat}</td><td>{tku.kelurahan}</td>
                            <td>{tku.kecamatan}</td><td>{tku.kabupaten}</td><td>{tku.provinsi}</td>
                        </tr></tbody>
                    </table>
                </DataTable>
            </Stack>
        </DisclosureItem>
        <DisclosureItem title="A. PEREDARAN BRUTO TERTENTU YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL">
            <A bind:rows={a} namaTku={tku.nama} dapatDiubah={b1b2Oppt === "peredaran_bruto_tertentu"} {readonly} />
        </DisclosureItem>
        <DisclosureItem title="B. ORANG PRIBADI PENGUSAHA TERTENTU (OPPT)">
            <B bind:rows={b} namaTku={tku.nama} metodePembukuanLabel={metodeLabel[metodePembukuan] ?? metodePembukuan} dapatDiubah={b1b2Oppt === "pengusaha_tertentu"} {readonly} />
        </DisclosureItem>
        <DisclosureItem title="C. PENGGUNA NORMA PENGHITUNGAN PENGHASILAN NETO (NPPN)">
            <C bind:rows={c} namaTku={tku.nama} bind:jenisUsahaPekerjaanBebas={tku.jenisUsahaPekerjaanBebas} dapatDiubah={b1b3Norma === "ya_norma"} {readonly} />
        </DisclosureItem>
    </Stack>
</div>

<InstitutionalModal bind:open={modalOpen} title="Tempat Kegiatan Usaha" eyebrow="LAMPIRAN L-3B" size="wide">
    <FieldGrid columns={2}>
        <FormField label="ID TKU (tidak dapat diubah)" value={idTku} readonly />
        <FormField label="Nama" bind:value={draft.nama} />
        <FormField label="Alamat" bind:value={draft.alamat} />
        <FormField label="Kelurahan/Desa" bind:value={draft.kelurahan} />
        <FormField label="Kecamatan" bind:value={draft.kecamatan} />
        <FormField label="Kota/Kabupaten" bind:value={draft.kabupaten} />
        <FormField label="Provinsi" bind:value={draft.provinsi} />
    </FieldGrid>
    {#snippet actions()}
        <ActionButton tone="quiet" onclick={() => (modalOpen = false)}>Tutup</ActionButton>
        <ActionButton onclick={simpanModal}>Simpan</ActionButton>
    {/snippet}
</InstitutionalModal>

<style>
    .hidden { display: none; }
    .actions { display: flex; justify-content: flex-end; }
</style>
