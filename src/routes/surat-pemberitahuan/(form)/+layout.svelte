<script lang="ts">
    import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<div class="tw:w-full tw:p-10">
    {@render children()}
</div>