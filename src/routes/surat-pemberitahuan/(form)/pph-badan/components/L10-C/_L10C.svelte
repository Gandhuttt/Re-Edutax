<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-C" ? "PERNYATAAN TRANSAKSI DENGAN PIHAK YANG MERUPAKAN PENDUDUK TAX HAVEN COUNTRY" : currentTab.title})
</script>