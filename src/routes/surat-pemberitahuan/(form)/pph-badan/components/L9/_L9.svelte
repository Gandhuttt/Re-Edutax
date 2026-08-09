<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
    import type { L9Row } from "./types";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l9: L9Row[];
        readonly?: boolean;
        jenisHartaOptions: { value: string; label: string; kelompok: 'harta_berwujud' | 'bangunan' | 'harta_tidak_berwujud' }[];
        metodePenyusutanOptions: { value: string; label: string; jenis: 'komersial' | 'fiskal' }[];
        jumlahPenyusutanKomersialA: number;
        jumlahPenyusutanKomersialB: number;
        jumlahAmortisasiKomersialC: number;
    }

    let {
        currentTab = $bindable(),
        l9 = $bindable(),
        readonly = false,
        jenisHartaOptions,
        metodePenyusutanOptions,
        jumlahPenyusutanKomersialA = $bindable(),
        jumlahPenyusutanKomersialB = $bindable(),
        jumlahAmortisasiKomersialC = $bindable()
    }: Props = $props();

    let metodeKomersialOptions = $derived(metodePenyusutanOptions.filter((o) => o.jenis === 'komersial'));
    let metodeFiskalOptions = $derived(metodePenyusutanOptions.filter((o) => o.jenis === 'fiskal'));

    $effect(() => {currentTab.title = currentTab.tab === "L9" ? "DAFTAR PENYUSUTAN DAN AMORTISASI FISKAL" : currentTab.title})

    let jenisHartaKelompokByValue = $derived(new Map(jenisHartaOptions.map((o) => [o.value, o.kelompok])));

    let jenisHartaOptionsBerwujud = $derived(jenisHartaOptions.filter((o) => o.kelompok === 'harta_berwujud'));
    let jenisHartaOptionsBangunan = $derived(jenisHartaOptions.filter((o) => o.kelompok === 'bangunan'));
    let jenisHartaOptionsTidakBerwujud = $derived(jenisHartaOptions.filter((o) => o.kelompok === 'harta_tidak_berwujud'));

    let dataBerwujud = $derived(l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'harta_berwujud'));
    let dataBangunan = $derived(l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'bangunan'));
    let dataTidakBerwujud = $derived(l9.filter((row) => jenisHartaKelompokByValue.get(row.jenisHarta) === 'harta_tidak_berwujud'));

    let editing = $state<Partial<L9Row>>({});
    let editingOptions = $state<{ value: string; label: string }[]>([]);

    function emptyRow(kelompokPenyusutan: L9Row['kelompokPenyusutan']): Partial<L9Row> {
        return {
            kelompokPenyusutan,
            jenisHarta: '',
            kodeHarta: '',
            bulanTahunPerolehan: '',
            hargaPerolehan: 0,
            nilaiSisaBukuFiskalAwalTahun: 0,
            metodePenyusutanKomersial: '',
            metodePenyusutanFiskal: '',
            penyusutanAmortisasiFiskalTahunIni: 0,
            penyusutanAmortisasiKomersialTahunIni: 0,
            akumulasiPenyusutanAmortisasiFiskal: 0,
            nilaiSisaBukuFiskalAkhirTahun: 0,
            keterangan: ''
        };
    }

    function openModal(
        row: L9Row | null,
        kelompokPenyusutan: L9Row['kelompokPenyusutan'],
        options: { value: string; label: string }[]
    ) {
        editing = row ? { ...row } : emptyRow(kelompokPenyusutan);
        editingOptions = options;
    }

    function saveItem() {
        const index = l9.findIndex((row) => row.id === editing.id);
        if (index !== -1) {
            l9[index] = { ...(editing as L9Row) };
        } else {
            l9.push({ ...(editing as L9Row), id: Date.now() });
        }
    }

    function deleteItem(id: string | number) {
        l9 = l9.filter((row) => row.id !== id);
    }
</script>

<div class="{currentTab.tab === "L9" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"HARTA BERWUJUD"}>
            <A data={dataBerwujud} {openModal} {deleteItem} jenisHartaOptions={jenisHartaOptionsBerwujud} bind:jumlahPenyusutanKomersial={jumlahPenyusutanKomersialA} {readonly}></A>
        </Accordion>
        <Accordion item={"BANGUNAN"}>
            <B data={dataBangunan} {openModal} {deleteItem} jenisHartaOptions={jenisHartaOptionsBangunan} bind:jumlahPenyusutanKomersial={jumlahPenyusutanKomersialB} {readonly}></B>
        </Accordion>
        <Accordion item={"HARTA TIDAK BERWUJUD"}>
            <C data={dataTidakBerwujud} {openModal} {deleteItem} jenisHartaOptions={jenisHartaOptionsTidakBerwujud} bind:jumlahAmortisasiKomersial={jumlahAmortisasiKomersialC} {readonly}></C>
        </Accordion>
    </div>
</div>

<ModalEdit bind:data={editing} {saveItem} jenisHartaOptions={editingOptions} {metodeKomersialOptions} {metodeFiskalOptions} {readonly}/>
