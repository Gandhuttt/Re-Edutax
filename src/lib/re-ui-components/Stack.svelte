<script module lang="ts">
	export type StackDirection = "vertical" | "horizontal";
	export type StackAlignment =
		| "stretch"
		| "start"
		| "center"
		| "end"
		| "baseline";
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		children: Snippet;
		direction?: StackDirection;
		gap?: string;
		align?: StackAlignment;
		wrap?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children">;

	let {
		children,
		direction = "vertical",
		gap = "12px",
		align = "stretch",
		wrap = false,
		class: className = "",
		...attributes
	}: Props = $props();
</script>

<div
	class={`stack ${className}`}
	class:horizontal={direction === "horizontal"}
	class:wrap
	style:--stack-gap={gap}
	style:--stack-align={align}
	{...attributes}
>
	{@render children()}
</div>

<style>
	.stack {
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: var(--stack-align);
		gap: var(--stack-gap);
	}
	.stack.horizontal {
		flex-direction: row;
	}
	.stack.wrap {
		flex-wrap: wrap;
	}
</style>
