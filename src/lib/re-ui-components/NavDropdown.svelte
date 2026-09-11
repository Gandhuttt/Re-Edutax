<script module lang="ts">
	export type NavDropdownItem = {
		label: string;
		description?: string;
		href?: string;
		target?: string;
		rel?: string;
		disabled?: boolean;
		onselect?: (event: MouseEvent) => void;
	};

	export type NavDropdownSection = {
		heading: string;
		items: NavDropdownItem[];
	};

	export type NavDropdownProps = {
		label: string;
		sections?: NavDropdownSection[];
		menuLabel?: string;
		columns?: number;
		onselect?: (item: NavDropdownItem, event: MouseEvent) => void;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	let {
		label,
		sections = [],
		menuLabel = "PILIH LAYANAN",
		columns = 2,
		onselect,
	}: NavDropdownProps = $props();
	const id = $props.id();
	let open = $state(false);
	let closing = $state(false);
	let root = $state<HTMLDivElement>();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const expanded = $derived(open && !closing);

	function show() {
		if (expanded) {
			dismiss();
			return;
		}
		if (closeTimer) clearTimeout(closeTimer);
		closing = false;
		open = true;
	}
	function dismiss() {
		if (!open || closing) return;
		closing = true;
		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		closeTimer = setTimeout(
			() => {
				open = false;
				closing = false;
			},
			reduceMotion ? 0 : 140,
		);
	}
	function handleWindowClick(event: MouseEvent) {
		if (open && root && !root.contains(event.target as Node)) dismiss();
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") dismiss();
	}
	function select(item: NavDropdownItem, event: MouseEvent) {
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		item.onselect?.(event);
		onselect?.(item, event);
		dismiss();
	}
	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<div class="nav-item" bind:this={root}>
	<button
		class="trigger"
		class:open
		type="button"
		aria-expanded={expanded}
		aria-haspopup="menu"
		aria-controls="{id}-menu"
		onclick={show}>{label}<span aria-hidden="true">⌄</span></button
	>
	{#if open}
		<div
			class="menu"
			class:closing
			id="{id}-menu"
			role="menu"
			aria-label={label}
		>
			<div class="menu-label">{menuLabel}</div>
			<div class="menu-grid" style:--columns={columns}>
				{#each sections as section}
					<section>
						<h3>{section.heading}</h3>
						{#each section.items as item}
							{#if item.href}<a
									class="menu-entry"
									role="menuitem"
									href={item.href}
									target={item.target}
									rel={item.rel}
									aria-disabled={item.disabled ? "true" : undefined}
									onclick={(event) => select(item, event)}
									><strong>{item.label}</strong
								>{#if item.description}<small
										>{item.description}</small
									>{/if}</a
								>{:else}<button
									class="menu-entry"
									type="button"
									role="menuitem"
									disabled={item.disabled}
									onclick={(event) => select(item, event)}
									><strong>{item.label}</strong
								>{#if item.description}<small
										>{item.description}</small
									>{/if}</button
								>{/if}
						{/each}
					</section>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.nav-item {
		position: relative;
		display: flex;
		align-self: stretch;
	}
	.trigger {
		position: relative;
		padding: 0 16px;
		display: flex;
		align-items: center;
		gap: 7px;
		border: 0;
		border-bottom: 3px solid transparent;
		background: transparent;
		color: #dce3ea;
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition:
			background 140ms ease,
			color 140ms ease;
	}
	.trigger:hover,
	.trigger.open {
		background: rgba(255, 255, 255, 0.055);
		color: white;
	}
	.trigger.open {
		border-bottom-color: var(--ui-yellow);
	}
	.trigger span {
		color: var(--ui-yellow);
		font-size: 13px;
	}
	.trigger:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: -4px;
	}
	.menu {
		position: absolute;
		z-index: 80;
		top: calc(100% + 4px);
		left: 0;
		width: min(680px, calc(100vw - 32px));
		border: 1px solid var(--ui-line-strong);
		border-top: 4px solid var(--ui-yellow);
		background: var(--ui-paper);
		color: var(--ui-ink);
		box-shadow: 0 18px 36px rgba(8, 20, 34, 0.2);
		transform-origin: top;
		animation: menu-enter 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.menu.closing {
		pointer-events: none;
		animation: menu-leave 140ms ease-in forwards;
	}
	.menu-label {
		padding: 11px 16px;
		border-bottom: 1px solid var(--ui-line);
		color: var(--ui-muted);
		font-size: 9px;
		font-weight: 900;
		letter-spacing: 0.13em;
	}
	.menu-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns, 2), 1fr);
	}
	section {
		padding: 16px;
		border-right: 1px solid var(--ui-line);
	}
	section:last-child {
		border-right: 0;
	}
	h3 {
		margin: 0 0 8px;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 15px;
	}
	section .menu-entry {
		position: relative;
		padding: 9px 9px 9px 11px;
		display: block;
		width: 100%;
		border-right: 0;
		border-bottom: 0;
		border-left: 0;
		background: transparent;
		border-top: 1px solid var(--ui-line);
		color: var(--ui-ink);
		font: inherit;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition:
			background 130ms ease,
			padding-left 150ms ease;
	}
	section .menu-entry::before {
		content: "";
		position: absolute;
		left: 0;
		top: 9px;
		bottom: 9px;
		width: 2px;
		background: var(--ui-yellow);
		opacity: 0;
		transition: opacity 130ms ease;
	}
	section .menu-entry:hover,
	section .menu-entry:focus-visible {
		padding-left: 15px;
		background: var(--ui-paper-deep);
		outline: 0;
	}
	section .menu-entry:hover::before,
	section .menu-entry:focus-visible::before {
		opacity: 1;
	}
	section .menu-entry:disabled,
	section .menu-entry[aria-disabled="true"] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	section .menu-entry strong,
	section .menu-entry small {
		display: block;
	}
	section .menu-entry strong {
		font-size: 12px;
	}
	section .menu-entry small {
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 10px;
		line-height: 1.4;
	}
	@keyframes menu-enter {
		from {
			opacity: 0;
			transform: translateY(-6px) scaleY(0.97);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes menu-leave {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scaleY(0.98);
		}
	}
	@media (max-width: 720px) {
		.menu {
			position: fixed;
			top: 72px;
			left: 16px;
			right: 16px;
			width: auto;
		}
		.menu-grid {
			grid-template-columns: 1fr;
		}
		section {
			border-right: 0;
			border-bottom: 1px solid var(--ui-line);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.trigger,
		section .menu-entry,
		section .menu-entry::before {
			transition: none;
		}
		.menu,
		.menu.closing {
			animation: none;
		}
	}
</style>
