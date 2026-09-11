<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type TextBlockProps = {
		children: Snippet;
		tone?: "default" | "muted";
		size?: "small" | "regular";
	} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;
</script>

<script lang="ts">
	let {
		children,
		tone = "default",
		size = "regular",
		class: className,
		...props
	}: TextBlockProps = $props();
</script>

<p
	{...props}
	class="text-block {className ?? ""}"
	class:muted={tone === "muted"}
	class:small={size === "small"}
>
	{@render children()}
</p>

<style>
	.text-block {
		margin: 0;
		color: var(--ui-ink);
		font-size: 14px;
		line-height: 1.55;
	}

	.muted {
		color: var(--ui-muted);
	}

	.small {
		font-size: 12px;
	}
</style>
