<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    let { currentTab = $bindable() }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L4" ? "PENGHASILAN YANG DIKENAKAN PAJAK FINAL DAN DAFTAR PENGHASILAN YANG BUKAN OBJEK PAJAK" : currentTab.title})
</script>