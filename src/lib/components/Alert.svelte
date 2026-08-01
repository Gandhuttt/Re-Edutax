<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        head: Snippet;
        body: Snippet;
        bg: string;
    }

    let { head, body, bg }: Props = $props();
</script>

<div style:--bg-color={bg} class="tw:bg-(--bg-color) tw:w-fit tw:max-w-[30rem] tw:flex tw:flex-row tw:gap-5 tw:py-1 px-2 tw:break-all tw:rounded-sm">
    <div class="tw:flex tw:justify-center tw:items-center">
        {@render head()}
    </div>
    <div class="tw:flex tw:justify-center tw:items-center">
        {@render body()}
    </div>
</div>