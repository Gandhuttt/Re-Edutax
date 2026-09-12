<script module lang="ts">
	import type { Snippet } from "svelte";

	export type InlineAlertTone = "info" | "warning" | "success" | "error";

	export type InlineAlertProps = {
		tone?: InlineAlertTone;
		title?: string;
		message?: string;
		compact?: boolean;
		dismissible?: boolean;
		dismissLabel?: string;
		ondismiss?: () => void;
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	let {
		tone = "info",
		title = "",
		message = "",
		compact = false,
		dismissible = false,
		dismissLabel = "Tutup pemberitahuan",
		ondismiss,
		children,
	}: InlineAlertProps = $props();
	let visible = $state(true);
	let closing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const icon = $derived(
		tone === "success" ? "✓" : tone === "warning" ? "!" : tone === "error" ? "×" : "i",
	);
	const role = $derived(tone === "error" || tone === "warning" ? "alert" : "status");
	const live = $derived(tone === "error" ? "assertive" : "polite");

	function dismiss() {
		if (closing) return;
		closing = true;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		closeTimer = setTimeout(
			() => {
				visible = false;
				ondismiss?.();
			},
			reduceMotion ? 0 : 150,
		);
	}

	onDestroy(() => clearTimeout(closeTimer));
</script>


{#if visible}
	<div class="alert {tone}" class:compact class:closing {role} aria-live={live} aria-atomic="true">
		<span class="icon" aria-hidden="true">{icon}</span>
		<div class="content">
			{#if title}<strong>{title}</strong>{/if}
			{#if children}
				<div class="body">{@render children()}</div>
			{:else if message}
				<div class="body">{message}</div>
			{/if}
		</div>
		{#if dismissible}
			<button class="dismiss" type="button" aria-label={dismissLabel} onclick={dismiss}>×</button>
		{/if}
	</div>
{/if}

<style>
	.alert {
		--alert-accent: var(--ui-navy);
		--alert-surface: #eef3f7;
		min-height: 48px;
		padding: 10px 12px;
		display: grid;
		grid-template-columns: 22px minmax(0, 1fr);
		align-items: start;
		gap: 9px;
		border: 1px solid var(--ui-line);
		border-left: 4px solid var(--alert-accent);
		border-radius: 2px;
		background: var(--alert-surface);
		color: var(--ui-ink);
		transition:
			opacity 140ms ease,
			transform 150ms cubic-bezier(0.4, 0, 1, 1);
	}
	.alert:has(.dismiss) {
		grid-template-columns: 22px minmax(0, 1fr) 28px;
	}
	.alert.closing {
		opacity: 0;
		transform: translateY(-5px);
	}
	.alert.warning {
		--alert-accent: var(--ui-yellow-deep);
		--alert-surface: var(--ui-yellow-soft);
	}
	.alert.success {
		--alert-accent: var(--ui-success);
		--alert-surface: var(--ui-success-surface);
	}
	.alert.error {
		--alert-accent: var(--ui-danger);
		--alert-surface: var(--ui-danger-surface);
	}
	.alert.compact {
		min-height: 36px;
		padding: 7px 9px;
		grid-template-columns: 18px minmax(0, 1fr);
		gap: 7px;
	}
	.alert.compact:has(.dismiss) {
		grid-template-columns: 18px minmax(0, 1fr) 28px;
	}
	.icon {
		width: 20px;
		height: 20px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--alert-accent);
		color: white;
		font-family: var(--ui-font-body);
		font-size: 12px;
		font-weight: 900;
		line-height: 1;
	}
	.compact .icon {
		width: 17px;
		height: 17px;
		font-size: 10px;
	}
	.dismiss {
		width: 28px;
		height: 28px;
		margin: -3px -4px 0 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 2px;
		background: transparent;
		color: var(--alert-accent);
		font: 700 19px/1 var(--ui-font-body);
		cursor: pointer;
		transition:
			background 130ms ease,
			border-color 130ms ease;
	}
	.dismiss:hover {
		border-color: color-mix(in srgb, var(--alert-accent) 35%, transparent);
		background: color-mix(in srgb, var(--alert-accent) 9%, transparent);
	}
	.dismiss:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 1px;
	}
	.content {
		min-width: 0;
		font-size: 12px;
		line-height: 1.45;
	}
	.content strong {
		display: block;
		color: var(--alert-accent);
		font-size: 12px;
	}
	.body {
		color: var(--ui-ink);
	}
	.content strong + .body {
		margin-top: 2px;
	}
	.compact .content,
	.compact .content strong {
		font-size: 11px;
	}
	@media (prefers-reduced-motion: reduce) {
		.alert,
		.dismiss {
			transition: none;
		}
	}
</style>
