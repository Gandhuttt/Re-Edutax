<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import A2 from "./A2.svelte";
    import Footer from "./Footer.svelte";
    import type { BarisLabaRugi, BarisNeraca, FooterL3A, KodeKoreksiFiskal, Sektor } from "./types";

    // Only one of L-3A-1/2/3 exists at a time, tracking Induk 1.b.4 directly
    // (Dagang/Jasa/Industri), unlike the usual OR-of-gates tab rule: changing
    // 1.b.4 replaces the tab rather than adding one. See L3A.md.
    //
    // Section A holds three things, in this order: A.1 laba rugi, A.2 neraca,
    // and a footer of five fields that sit outside both tables.
    interface AkunRow {
        id: string;
        kode: string | null;
        namaAkun: string;
        rowType: 'header' | 'data' | 'sum';
        classification: 'income' | 'expense' | null;
        parentKode: string | null;
        sign: number | null;
    }

    interface NeracaAkunRow {
        id: string;
        kode: string | null;
        namaAkun: string;
        rowType: 'header' | 'data' | 'sum';
        section: 'aset' | 'liabilitas_ekuitas';
        parentKode: string | null;
        sign: number | null;
    }

    interface Props {
        currentTab: string;
        sektor: Sektor | null | undefined;
        akunPerSektor: Record<Sektor, AkunRow[]>;
        neracaAkunPerSektor: Record<Sektor, NeracaAkunRow[]>;
        labaRugi: BarisLabaRugi[];
        neraca: BarisNeraca[];
        footer: FooterL3A;
        kodeKoreksiFiskal: KodeKoreksiFiskal[];
        readonly?: boolean;
    }

    let {
        currentTab,
        sektor,
        akunPerSektor,
        neracaAkunPerSektor,
        labaRugi = $bindable(),
        neraca = $bindable(),
        footer = $bindable(),
        kodeKoreksiFiskal,
        readonly = false
    }: Props = $props();

    const TAB_BY_SEKTOR: Record<Sektor, string> = {
        dagang: 'L-3A-1',
        jasa: 'L-3A-2',
        industri: 'L-3A-3'
    };
    const JUDUL: Record<Sektor, string> = {
        dagang: 'DAGANG',
        jasa: 'JASA',
        industri: 'INDUSTRI'
    };

    let tabTerkini = $derived(sektor ? TAB_BY_SEKTOR[sektor] : null);
</script>

{#if sektor}
    <div class="{currentTab === tabTerkini ? '' : 'tw:hidden'}">
        <h3 class="tw:text-lg">REKONSILIASI LAPORAN KEUANGAN ({JUDUL[sektor]})</h3>
        <div class="accordion">
            <Accordion item={"A. PENGHASILAN NETO DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN LAPORAN KEUANGAN"}>
                <div class="tw:p-5 tw:flex tw:flex-col tw:gap-6">
                    <A akun={akunPerSektor[sektor]} bind:labaRugi {kodeKoreksiFiskal} {readonly} />
                    <A2 akun={neracaAkunPerSektor[sektor]} bind:neraca {readonly} />
                    <Footer bind:footer {readonly} />
                </div>
            </Accordion>
        </div>
    </div>
{/if}

<style>
    h3 {
        margin: 1rem 0 0.5rem;
    }
</style>
