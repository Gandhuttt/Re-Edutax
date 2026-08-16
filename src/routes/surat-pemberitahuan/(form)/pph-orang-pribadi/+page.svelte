<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import Navbar from "../Navbar.svelte";

    let tabs = $derived([
        {tab: "Induk", visibility: true},
        {tab: "L-1", visibility: true},
        {tab: "L-2", visibility: true},
        {tab: "L-3A-4", visibility: true},
        {tab: "L-3C", visibility: true},
        {tab: "L-5", visibility: true}
    ])
    let currentTab = $state("Induk");
</script>

<Card>
    {#snippet head()}
       <span class="tw:text-2xl">SPT Tahunan PPh Orang Pribadi</span>
    {/snippet}
    {#snippet body()}
        <Navbar {tabs} bind:currentTab={currentTab}/>
        text-sm
    {/snippet}
</Card>