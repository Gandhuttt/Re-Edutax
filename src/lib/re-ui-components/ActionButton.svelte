<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export type ActionButtonTone = "primary" | "secondary" | "quiet" | "danger";

	export type ActionButtonProps = {
		children: Snippet;
		tone?: ActionButtonTone;
		pending?: boolean;
		pendingLabel?: string;
	} & HTMLButtonAttributes;
</script>

<script lang="ts">
	let {
		children,
		tone = "primary",
		pending = false,
		pendingLabel = "",
		type = "button",
		disabled = false,
		...props
	}: ActionButtonProps = $props();
</script>

<button
	{type}
	disabled={disabled || pending}
	aria-busy={pending || undefined}
	class:primary={tone === "primary"}
	class:secondary={tone === "secondary"}
	class:quiet={tone === "quiet"}
	class:danger={tone === "danger"}
	{...props}
	>{#if pending && pendingLabel}{pendingLabel}{:else}{@render children()}{/if}</button
>

<style>
	button {
		min-height: 38px;
		padding: 8px 14px;
		border: 1px solid transparent;
		border-radius: 3px;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		transition:
			background 140ms ease,
			border-color 140ms ease,
			box-shadow 140ms ease,
			transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	button:hover {
		transform: translateY(-1px);
		box-shadow: 0 3px 7px rgba(15, 34, 55, 0.12);
	}
	button:active {
		transform: translateY(1px);
		box-shadow: none;
	}
	button:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--ui-yellow) 55%, transparent);
		outline-offset: 2px;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
		transform: none;
		box-shadow: none;
	}
	.primary {
		background: var(--ui-navy);
		color: white;
	}
	.primary:hover {
		background: var(--ui-navy-strong);
	}
	.secondary {
		background: var(--ui-yellow);
		color: var(--ui-ink);
		border-color: var(--ui-yellow-deep);
	}
	.secondary:hover {
		background: #f0bd25;
	}
	.quiet {
		background: transparent;
		color: var(--ui-navy);
		border-color: var(--ui-line-strong);
	}
	.quiet:hover {
		background: var(--ui-paper-deep);
	}
	.danger {
		border-color: #9f3833;
		background: #fffafa;
		color: var(--ui-danger);
	}
	.danger:hover {
		background: #9f3833;
		color: white;
	}
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
		button:hover,
		button:active {
			transform: none;
		}
	}
</style>
