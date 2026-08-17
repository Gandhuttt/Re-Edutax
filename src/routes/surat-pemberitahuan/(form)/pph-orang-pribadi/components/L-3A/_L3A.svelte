<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import type { BarisLabaRugi, KodeKoreksiFiskal, Sektor } from "./types";

    // Only one of L-3A-1/2/3 exists at a time, tracking Induk 1.b.4 directly
    // (Dagang/Jasa/Industri), unlike the usual OR-of-gates tab rule: changing
    // 1.b.4 replaces the tab rather than adding one. See L3A.md.
    interface AkunRow {
        id: string;
        kode: string | null;
        namaAkun: string;
        rowType: 'header' | 'data' | 'sum';
        classification: 'income' | 'expense' | null;
        parentKode: string | null;
        sign: number | null;
    }

    interface Props {
        currentTab: string;
        sektor: Sektor | null | undefined;
        akunPerSektor: Record<Sektor, AkunRow[]>;
        labaRugi: BarisLabaRugi[];
        kodeKoreksiFiskal: KodeKoreksiFiskal[];
        readonly?: boolean;
    }

    let { currentTab, sektor, akunPerSektor, labaRugi = $bindable(), kodeKoreksiFiskal, readonly = false }: Props = $props();

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
                <div class="tw:p-5">
                    <A akun={akunPerSektor[sektor]} bind:labaRugi {kodeKoreksiFiskal} {readonly} />
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
