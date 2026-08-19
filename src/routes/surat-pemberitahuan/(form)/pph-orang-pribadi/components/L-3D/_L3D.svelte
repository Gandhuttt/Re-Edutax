<script lang="ts">
    import type { DaftarReferensi, KodeReferensi } from "../referensi";
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisEntertainment, BarisPiutang, BarisPromosi } from "./types";

    // L-3D, daftar nominatif.
    //
    // Three independent grids with no totals and no cross-grid arithmetic:
    // Coretax's l3dForm holds only {EntertainmentCosts, PromotionCosts, BadDebts}
    // plus disabled context, and never patches an Induk valueXX.
    interface Props {
        currentTab: string;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        entertainment: BarisEntertainment[];
        promosi: BarisPromosi[];
        piutang: BarisPiutang[];
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        kodeReferensi,
        entertainment = $bindable(),
        promosi = $bindable(),
        piutang = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-3D' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. DAFTAR NOMINATIF BIAYA ENTERTAINMENT"}>
            <div class="tw:p-5">
                <A bind:rows={entertainment} {referensi} {kodeReferensi} {readonly} />
            </div>
        </Accordion>
        <Accordion
            item={"B. DAFTAR NOMINATIF BIAYA PROMOSI SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN"}
        >
            <div class="tw:p-5">
                <B bind:rows={promosi} {referensi} {kodeReferensi} {readonly} />
            </div>
        </Accordion>
        <Accordion item={"C. PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH"}>
            <div class="tw:p-5">
                <C bind:rows={piutang} {referensi} {kodeReferensi} {readonly} />
            </div>
        </Accordion>
    </div>
</div>
