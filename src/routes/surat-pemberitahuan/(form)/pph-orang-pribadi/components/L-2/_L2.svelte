<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisBukanObjek, BarisFinal, BarisLuarNegeri } from "./types";

    // L-2's three sections each own their own table and modal markup, same as
    // every L-1 grid: A has no Hapus Semua on the live form, C carries foreign
    // currency and a different empty-state string.
    interface Props {
        currentTab: string;
        referensi: Record<string, string[]>;
        final: BarisFinal[];
        bukanObjek: BarisBukanObjek[];
        luarNegeri: BarisLuarNegeri[];
        // Each grid is editable exactly when the Induk question routing to it is
        // Ya. The tab itself tracks the OR of all three, handled on the page.
        i14cPenghasilanFinal: boolean | undefined;
        i14dBukanObjekPajak: boolean | undefined;
        b1dPenghasilanLuarNegeri: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        final = $bindable(),
        bukanObjek = $bindable(),
        luarNegeri = $bindable(),
        i14cPenghasilanFinal,
        i14dBukanObjekPajak,
        b1dPenghasilanLuarNegeri,
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-2' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL"}>
            <A bind:rows={final} {referensi} dapatDiubah={Boolean(i14cPenghasilanFinal)} {readonly} />
        </Accordion>
        <Accordion item={"B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK"}>
            <B bind:rows={bukanObjek} {referensi} dapatDiubah={Boolean(i14dBukanObjekPajak)} {readonly} />
        </Accordion>
        <Accordion item={"C. PENGHASILAN NETO LUAR NEGERI"}>
            <C bind:rows={luarNegeri} {referensi} dapatDiubah={Boolean(b1dPenghasilanLuarNegeri)} {readonly} />
        </Accordion>
    </div>
</div>
