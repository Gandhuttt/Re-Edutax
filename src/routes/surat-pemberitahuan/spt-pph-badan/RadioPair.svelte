<script lang="ts">
	import Label from '$lib/components/Label.svelte';

	let {
		name,
		value = $bindable(false),
		disabled = false,
		falseLabel = 'Tidak',
		trueLabel = 'Ya'
	}: {
		name: string;
		value: boolean;
		disabled?: boolean;
		falseLabel?: string;
		trueLabel?: string;
	} = $props();
</script>

<div class="tw:flex tw:gap-5">
	<Label class="tw:flex tw:items-center tw:gap-1">
		<input type="radio" {name} bind:group={value} value={false} {disabled} />
		<span>{falseLabel}</span>
	</Label>
	<Label class="tw:flex tw:items-center tw:gap-1">
		<input type="radio" {name} bind:group={value} value={true} {disabled} />
		<span>{trueLabel}</span>
	</Label>
</div>
