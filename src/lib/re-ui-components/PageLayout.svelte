<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type PageLayoutProps = {
		children: Snippet;
		contentWidth?: string;
		padding?: string;
	} & Omit<HTMLAttributes<HTMLElement>, "children">;
</script>

<script lang="ts">
	let {
		children,
		contentWidth = "1320px",
		padding = "22px 0 56px",
		class: className,
		...props
	}: PageLayoutProps = $props();
</script>

<div class="page-layout">
	<main
		{...props}
		class="page-content {className ?? ""}"
		style:--page-content-width={contentWidth}
		style:--page-content-padding={padding}
	>
		{@render children()}
	</main>
</div>

<style>
	.page-layout {
		min-height: 100vh;
		background: var(--ui-canvas, #ece9df);
	}

	.page-content {
		width: min(var(--page-content-width), calc(100% - 48px));
		margin: 0 auto;
		padding: var(--page-content-padding);
	}

	@media (max-width: 600px) {
		.page-content {
			width: min(var(--page-content-width), calc(100% - 24px));
		}
	}
</style>
