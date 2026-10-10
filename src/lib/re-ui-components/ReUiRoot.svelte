<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		children,
		class: className = "",
		...attributes
	}: { children: Snippet; class?: string } & HTMLAttributes<HTMLDivElement> =
		$props();
</script>

<div class={`re-ui-root ${className}`} {...attributes}>
	{@render children()}
</div>

<style>
	.re-ui-root {
		--ui-navy: #18314f;
		--ui-navy-strong: #10243c;
		--ui-yellow: #f4c542;
		--ui-yellow-deep: #bd8d13;
		--ui-yellow-soft: #fff4c9;
		--ui-paper: #f7f4eb;
		--ui-paper-deep: #eeebe2;
		--ui-canvas: #ece9df;
		--ui-ink: #1c2733;
		--ui-muted: #4e5963;
		--ui-line: #d8d4ca;
		--ui-line-strong: #b9b6ae;
		--ui-danger: #8f2823;
		--ui-danger-surface: #fff0ee;
		--ui-success: #345c36;
		--ui-success-surface: #edf4eb;
		--ui-font-body: "TeX Gyre Heros", FreeSans, Arial, sans-serif;
		--ui-font-display: "TeX Gyre Pagella", FreeSerif, Georgia, serif;
		--ui-font-mono: Iosevka, "DejaVu Sans Mono", monospace;

		/* Surface-relative colours. Containers on dark surfaces add the
		   `ui-surface-inverse` class so nested components adapt without props. */
		--ui-surface-heading: var(--ui-navy-strong);
		--ui-surface-text: var(--ui-muted);
		--ui-surface-accent: #87640c;
		--ui-surface-emphasis: #2b557c;
		--ui-surface-line: var(--ui-line);
		--ui-surface-card: #fffefb;

		min-width: 0;
		min-height: 100vh;
		background: var(--ui-canvas);
		color: var(--ui-ink);
		font-family: var(--ui-font-body);
		font-size: 16px;
		line-height: 1.6;
	}

	.re-ui-root,
	.re-ui-root :global(*),
	.re-ui-root :global(*::before),
	.re-ui-root :global(*::after) {
		box-sizing: border-box;
	}

	.re-ui-root :global(.ui-surface-inverse) {
		--ui-surface-heading: white;
		--ui-surface-text: #b9c7d3;
		--ui-surface-accent: #f5d776;
		--ui-surface-emphasis: var(--ui-yellow);
		--ui-surface-line: rgba(255, 255, 255, 0.16);
		--ui-surface-card: rgba(255, 255, 255, 0.04);
	}
</style>
