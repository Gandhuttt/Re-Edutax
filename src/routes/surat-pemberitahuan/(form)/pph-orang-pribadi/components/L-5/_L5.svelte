<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import type { BarisKompensasi, BarisPengurang } from "./types";

    interface Props {
        currentTab: string;
        referensi: Record<string, string[]>;
        tahunPajak: number;
        kompensasi: BarisKompensasi[];
        pengurangNeto: BarisPengurang[];
        pengurangPph: BarisPengurang[];
        // A single gate (Induk row 3) drives both A's editability and B's; C is
        // driven by row 8 independently.
        c3AdaPengurangPenghasilanNeto: boolean | undefined;
        c8AdaPengurangPphTerutang: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        tahunPajak,
        kompensasi = $bindable(),
        pengurangNeto = $bindable(),
        pengurangPph = $bindable(),
        c3AdaPengurangPenghasilanNeto,
        c8AdaPengurangPphTerutang,
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-5' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. PENGHITUNGAN KOMPENSASI KERUGIAN FISKAL"}>
            <div class="tw:p-5">
                <A
                    bind:rows={kompensasi}
                    {tahunPajak}
                    dapatDiubah={Boolean(c3AdaPengurangPenghasilanNeto)}
                    {readonly}
                />
            </div>
        </Accordion>
        <Accordion item={"B. PENGURANG PENGHASILAN NETO"}>
            <div class="tw:p-5">
                <B
                    bind:rows={pengurangNeto}
                    {referensi}
                    dapatDiubah={Boolean(c3AdaPengurangPenghasilanNeto)}
                    {readonly}
                />
            </div>
        </Accordion>
        <Accordion item={"C. PENGURANG PPh TERUTANG"}>
            <div class="tw:p-5">
                <C
                    bind:rows={pengurangPph}
                    {referensi}
                    dapatDiubah={Boolean(c8AdaPengurangPphTerutang)}
                    {readonly}
                />
            </div>
        </Accordion>
    </div>
</div>
