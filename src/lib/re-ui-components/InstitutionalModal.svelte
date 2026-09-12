<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLDialogAttributes } from "svelte/elements";

	export type InstitutionalModalSize = "regular" | "wide" | "large";

	export type InstitutionalModalProps = {
		open?: boolean;
		eyebrow?: string;
		title: string;
		closeLabel?: string;
		size?: InstitutionalModalSize;
		scrollable?: boolean;
		children: Snippet;
		actions?: Snippet;
	} & Omit<
		HTMLDialogAttributes,
		"open" | "title" | "children" | "onclose" | "oncancel" | "onclick"
	>;
</script>

<script lang="ts">
	let {
		open = $bindable(false),
		eyebrow = "KONFIRMASI TINDAKAN",
		title,
		closeLabel = "Tutup dialog",
		size = "regular",
		scrollable = false,
		children,
		actions,
		class: className,
		...dialogProps
	}: InstitutionalModalProps = $props();

	const id = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let closing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const currentDialog = dialog;
		if (!currentDialog) return;
		if (open) {
			if (closeTimer) clearTimeout(closeTimer);
			closing = false;
			if (!currentDialog.open) currentDialog.showModal();
		} else if (currentDialog.open && !closing) {
			closing = true;
			const reduceMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			closeTimer = setTimeout(
				() => {
					currentDialog.close();
					closing = false;
				},
				reduceMotion ? 0 : 170,
			);
		}
	});

	function dismiss() {
		open = false;
	}
</script>

<dialog
	{...dialogProps}
	bind:this={dialog}
	class="{className ?? ""}"
	class:closing
	class:wide={size === "wide"}
	class:large={size === "large"}
	class:scrollable
	aria-labelledby="{id}-title"
	onclose={() => {
		open = false;
		closing = false;
	}}
	oncancel={(event) => {
		event.preventDefault();
		dismiss();
	}}
	onclick={(event) => {
		if (event.target === dialog) dismiss();
	}}
>
	<section class="institutional-modal" role="document">
		<header>
			<div>
				{#if eyebrow}<span>{eyebrow}</span>{/if}
				<h2 id="{id}-title">{title}</h2>
			</div>
			<button class="close" type="button" aria-label={closeLabel} onclick={dismiss}
				>×</button
			>
		</header>
		<div class="body">{@render children()}</div>
		{#if actions}<footer>{@render actions()}</footer>{/if}
	</section>
</dialog>

<style>
	dialog {
		position: fixed;
		inset: 0;
		width: min(600px, calc(100vw - 32px));
		height: max-content;
		max-width: none;
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		overflow: visible;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: var(--ui-ink);
		box-shadow: 0 24px 70px rgba(8, 20, 34, 0.32);
		animation: dialog-arrive 210ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	dialog.wide {
		width: min(780px, calc(100vw - 32px));
	}
	dialog.large {
		width: min(980px, calc(100vw - 32px));
	}
	dialog.scrollable {
		overflow: auto;
	}
	dialog::backdrop {
		background: rgba(10, 25, 42, 0.62);
		animation: backdrop-arrive 180ms ease-out;
	}
	dialog.closing {
		pointer-events: none;
		animation: dialog-leave 160ms cubic-bezier(0.4, 0, 1, 1) forwards;
	}
	dialog.closing::backdrop {
		animation: backdrop-leave 160ms ease-in forwards;
	}
	.institutional-modal {
		border: 1px solid #9c9b96;
		border-top: 5px solid var(--ui-yellow);
		background: var(--ui-paper);
	}
	header {
		min-height: 78px;
		padding: 17px 20px 15px 24px;
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 20px;
		border-bottom: 1px solid var(--ui-line);
		background: var(--ui-navy);
		color: white;
	}
	header span {
		display: block;
		margin-bottom: 5px;
		color: var(--ui-yellow);
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.14em;
	}
	h2 {
		margin: 0;
		font-family: var(--ui-font-display);
		font-size: 22px;
		font-weight: 600;
	}
	.close {
		width: 34px;
		height: 34px;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.32);
		border-radius: 2px;
		background: transparent;
		color: white;
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
	}
	.close:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.close:focus-visible {
		outline: 3px solid var(--ui-yellow);
		outline-offset: 2px;
	}
	.body {
		padding: 24px;
	}
	footer {
		padding: 14px 20px;
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		border-top: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}
	@keyframes dialog-arrive {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes backdrop-arrive {
		from {
			background: rgba(10, 25, 42, 0);
		}
		to {
			background: rgba(10, 25, 42, 0.62);
		}
	}
	@keyframes dialog-leave {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(8px) scale(0.99);
		}
	}
	@keyframes backdrop-leave {
		from {
			background: rgba(10, 25, 42, 0.62);
		}
		to {
			background: rgba(10, 25, 42, 0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		dialog,
		dialog::backdrop,
		dialog.closing,
		dialog.closing::backdrop {
			animation: none;
		}
	}
	@media (max-height: 520px) {
		dialog {
			overflow: auto;
		}
	}
</style>
