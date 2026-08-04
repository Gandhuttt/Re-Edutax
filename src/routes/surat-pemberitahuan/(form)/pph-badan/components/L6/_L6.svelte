<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L6" ? "ANGSURAN PAJAK PENGHASILAN TAHUN PAJAK BERJALAN" : currentTab.title})
</script>