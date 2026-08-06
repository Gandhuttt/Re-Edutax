<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import Label from "./Label.svelte";
    import { getContext } from "svelte";

    interface Props {
        falseLabel?: string;
        trueLabel?: string;
    }

    let { 
        name,
        group = $bindable(),
        disabled,
        falseLabel = "Tidak",
        trueLabel = "Ya" }: Props & HTMLInputAttributes = $props();
</script>

<div class="tw:flex tw:gap-5">
    <Label for={getContext("id")} class="tw:flex! tw:items-center tw:gap-1">
        <input type="radio" {name} value={false} bind:group={group} {disabled}>
        <span>{falseLabel}</span>
    </Label>
    <Label for={getContext("id")} class="tw:flex! tw:items-center tw:gap-1">
        <input type="radio" {name} value={true} bind:group={group} {disabled}>
        <span>{trueLabel}</span>
    </Label>
</div>