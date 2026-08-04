<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L10-A" ? "DAFTAR TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA" : currentTab.title})
</script>