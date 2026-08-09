<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import I from "./I.svelte";
    import II from "./II.svelte";
    import III from "./III.svelte";
    import IV from "./IV.svelte";
    import V from "./V.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L11-A" ? "RINCIAN BIAYA TERTENTU" : currentTab.title})
</script>

<div class="{currentTab.tab === "L11-A" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"I. DAFTAR NOMINATIF BIAYA PROMOSI DAN PENJUALAN, SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN"}>
            <I/>
        </Accordion>
        <Accordion item={"II. DAFTAR NOMINATIF BIAYA ENTERTAINMENT"}>
            <II/>
        </Accordion>
        <Accordion item={"III. DAFTAR PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH"}>
            <III/>
        </Accordion>
        <Accordion item={"IV. RINCIAN BAGI WAJIB PAJAK PEMBERI NATURA DAN/ATAU KENIKMATAN"}>
            <IV/>
        </Accordion>
        <Accordion item={"V. DAFTAR DEBITUR NON-PERFORMING LOAN"}>
            <V/>
        </Accordion>
    </div>
</div>