<script lang="ts">
	import { onDestroy } from "svelte";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(true),
		title,
		message = "",
		children,
		closeLabel = "Tutup pemberitahuan",
		contentWidth = "1320px",
	}: {
		open?: boolean;
		title: string;
		message?: string;
		children?: Snippet;
		closeLabel?: string;
		contentWidth?: string;
	} = $props();

	let visible = $state(open);
	let closing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (open) {
			clearTimeout(closeTimer);
			visible = true;
			closing = false;
		} else if (visible && !closing) {
			close();
		}
	});

	function close() {
		if (!visible || closing) return;
		closing = true;
		open = false;
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		closeTimer = setTimeout(
			() => {
				visible = false;
				closing = false;
			},
			reduced ? 0 : 190,
		);
	}

	onDestroy(() => clearTimeout(closeTimer));
</script>

{#if visible}
	<div
		class="announcement"
		class:closing
		style:--announcement-content-width={contentWidth}
		role="status"
	>
		<strong>{title}</strong>
		<div class="message">
			{#if children}{@render children()}{:else}{message}{/if}
		</div>
		<button type="button" aria-label={closeLabel} onclick={close}>×</button>
	</div>
{/if}

<style>
	.announcement {
		min-height: 38px;
		padding: 7px max(24px, calc((100vw - var(--announcement-content-width)) / 2));
		display: flex;
		align-items: center;
		gap: 14px;
		background: #f7edc6;
		border-bottom: 1px solid #dccd91;
		color: #5e4c18;
		font: inherit;
		font-size: 12px;
	}
	strong {
		padding-right: 14px;
		border-right: 1px solid #cdbd7d;
	}
	.message {
		min-width: 0;
	}
	button {
		width: 26px;
		height: 26px;
		margin-left: auto;
		padding: 0;
		display: grid;
		place-items: center;
		flex: 0 0 auto;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
		transition:
			background 140ms ease,
			color 140ms ease;
	}
	button:hover {
		background: rgba(189, 141, 19, 0.16);
		color: var(--ui-navy);
	}
	button:focus-visible {
		outline: 2px solid var(--ui-navy);
		outline-offset: 1px;
	}
	.closing {
		overflow: hidden;
		pointer-events: none;
		animation: announcement-leave 190ms cubic-bezier(0.4, 0, 1, 1) forwards;
	}
	@keyframes announcement-leave {
		from {
			min-height: 38px;
			max-height: 38px;
			opacity: 1;
			transform: translateY(0);
		}
		to {
			min-height: 0;
			max-height: 0;
			padding-top: 0;
			padding-bottom: 0;
			opacity: 0;
			transform: translateY(-5px);
		}
	}
	@media (max-width: 600px) {
		.announcement {
			padding-right: 12px;
			padding-left: 12px;
		}
		.message {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.closing {
			animation: none;
		}
		button {
			transition: none;
		}
	}
</style>
