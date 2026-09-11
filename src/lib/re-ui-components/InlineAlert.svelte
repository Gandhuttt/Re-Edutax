<script module lang="ts">
	import type { Snippet } from "svelte";

	export type InlineAlertTone = "info" | "warning" | "success" | "error";

	export type InlineAlertProps = {
		tone?: InlineAlertTone;
		title?: string;
		message?: string;
		compact?: boolean;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		tone = "info",
		title = "",
		message = "",
		compact = false,
		children,
	}: InlineAlertProps = $props();

	const icon = $derived(
		tone === "success" ? "✓" : tone === "warning" ? "!" : tone === "error" ? "×" : "i",
	);
	const role = $derived(tone === "error" || tone === "warning" ? "alert" : "status");
	const live = $derived(tone === "error" ? "assertive" : "polite");
</script>

<div class="alert {tone}" class:compact {role} aria-live={live} aria-atomic="true">
	<span class="icon" aria-hidden="true">{icon}</span>
	<div class="content">
		{#if title}<strong>{title}</strong>{/if}
		{#if children}
			<div class="body">{@render children()}</div>
		{:else if message}
			<div class="body">{message}</div>
		{/if}
	</div>
</div>

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
</style>
