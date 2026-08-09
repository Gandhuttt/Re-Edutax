<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import D from "./D.svelte";
    import type { L13BARow, L13BBRow, L13BCRow } from "./types";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l13bA: L13BARow[];
        l13bB: L13BBRow[];
        l13bC: L13BCRow[];
        l13bDTermanfaatkanTahunSebelumnya: number;
        readonly?: boolean;
    }

    let {
        currentTab = $bindable(),
        l13bA = $bindable(),
        l13bB = $bindable(),
        l13bC = $bindable(),
        l13bDTermanfaatkanTahunSebelumnya = $bindable(),
        readonly = false
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L13-B" ? "DAFTAR TAMBAHAN PENGURANGAN PENGHASILAN BRUTO" : currentTab.title})

    const tambahanPengurangPerRow = (row: L13BCRow) =>
        Math.round((Number(row.jumlahBiaya || 0) * Number(row.persentaseFasilitasPajak || 0)) / 100);

    let jumlahTambahanPengurangLitbang = $derived(
        l13bC.reduce((sum, row) => sum + tambahanPengurangPerRow(row), 0)
    );
</script>

<div class="{currentTab.tab === "L13-B" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETENSI TERTENTU"}>
            <A bind:data={l13bA} {readonly}></A>
        </Accordion>
        <Accordion item={"B. REKAPITULASI BIAYA KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETNESI TERTENTU"}>
            <B bind:data={l13bB} {readonly}></B>
        </Accordion>
        <Accordion item={"C. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK PENELITIAN DAN PENGEMBANGAN"}>
            <C bind:data={l13bC} {readonly}></C>
        </Accordion>
        <Accordion item={"D. PENGHITUNGAN TAMBAHAN PENGURANG PENGHASILAN BRUTO"}>
            <D
                {jumlahTambahanPengurangLitbang}
                bind:termanfaatkanTahunSebelumnya={l13bDTermanfaatkanTahunSebelumnya}
                {readonly}
            ></D>
        </Accordion>
    </div>
</div>
