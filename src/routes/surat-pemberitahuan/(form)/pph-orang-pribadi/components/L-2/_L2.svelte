<script lang="ts">
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
    <h3 class="tw:text-lg">A. PENGHASILAN YANG DIKENAKAN PAJAK PENGHASILAN BERSIFAT FINAL</h3>
    <A bind:rows={final} {referensi} dapatDiubah={Boolean(i14cPenghasilanFinal)} {readonly} />

    <h3 class="tw:text-lg">B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK</h3>
    <B bind:rows={bukanObjek} {referensi} dapatDiubah={Boolean(i14dBukanObjekPajak)} {readonly} />

    <h3 class="tw:text-lg">C. PENGHASILAN NETO LUAR NEGERI</h3>
    <C bind:rows={luarNegeri} {referensi} dapatDiubah={Boolean(b1dPenghasilanLuarNegeri)} {readonly} />
</div>

<style>
    h3 {
        margin: 1rem 0 0.5rem;
    }
</style>
