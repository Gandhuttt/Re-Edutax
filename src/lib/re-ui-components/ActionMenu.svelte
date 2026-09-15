<script module lang="ts">
	export type ActionMenuTone = "navy" | "secondary" | "quiet";

	export type ActionMenuItem = {
		label: string;
		description?: string;
		disabled?: boolean;
		onclick?: (event: MouseEvent, item: ActionMenuItem) => void;
	};

	export type ActionMenuProps = {
		label: string;
		items?: readonly ActionMenuItem[];
		tone?: ActionMenuTone;
		disabled?: boolean;
		menuLabel?: string;
		align?: "start" | "end";
		onaction?: (item: ActionMenuItem, event: MouseEvent) => void;
	};
</script>

<script lang="ts">
	import { onDestroy, tick } from "svelte";

	let {
		label,
		items = [],
		tone = "navy",
		disabled = false,
		menuLabel = label,
		align = "start",
		onaction,
	}: ActionMenuProps = $props();

	const id = $props.id();
	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);
	let closing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const expanded = $derived(open && !closing);

	function availableItems() {
		if (!root) return [];
		return Array.from(root.querySelectorAll<HTMLButtonElement>("[role='menuitem']:not(:disabled)"));
	}

	async function openMenu(focus: "none" | "first" | "last" = "none") {
		if (disabled || !items.length) return;
		clearTimeout(closeTimer);
		closing = false;
		open = true;
		if (focus !== "none") {
			await tick();
			const entries = availableItems();
			entries[focus === "first" ? 0 : entries.length - 1]?.focus();
		}
	}

	function closeMenu(returnFocus = false) {
		if (!open || closing) return;
		closing = true;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		closeTimer = setTimeout(
			() => {
				open = false;
				closing = false;
				if (returnFocus) trigger?.focus();
			},
			reduceMotion ? 0 : 140,
		);
	}

	function toggleMenu() {
		if (expanded) closeMenu();
		else openMenu();
	}

	function activate(item: ActionMenuItem, event: MouseEvent) {
		if (item.disabled) return;
		item.onclick?.(event, item);
		onaction?.(item, event);
		closeMenu(true);
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			openMenu(event.key === "ArrowDown" ? "first" : "last");
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		const entries = availableItems();
		if (event.key === "Escape") {
			event.preventDefault();
			closeMenu(true);
			return;
		}
		if (!entries.length) return;
		const current = Math.max(0, entries.indexOf(document.activeElement as HTMLButtonElement));
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const offset = event.key === "ArrowDown" ? 1 : -1;
			entries[(current + offset + entries.length) % entries.length]?.focus();
		} else if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			entries[event.key === "Home" ? 0 : entries.length - 1]?.focus();
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && expanded) {
			event.preventDefault();
			closeMenu(true);
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node)) closeMenu();
	}

	function handleOutsideFocus(event: FocusEvent) {
		if (expanded && root && !root.contains(event.target as Node)) closeMenu();
	}

	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window
	onclick={handleOutsideClick}
	onfocusin={handleOutsideFocus}
	onkeydown={handleWindowKeydown}
/>

<div class="action-menu" class:align-end={align === "end"} bind:this={root}>
	<button
		bind:this={trigger}
		class="trigger"
		class:navy={tone === "navy"}
		class:secondary={tone === "secondary"}
		class:quiet={tone === "quiet"}
		type="button"
		aria-haspopup="menu"
		aria-expanded={expanded}
		aria-controls="{id}-menu"
		disabled={disabled || !items.length}
		onclick={toggleMenu}
		onkeydown={handleTriggerKeydown}
	>
		<span>{label}</span><span class="chevron" aria-hidden="true">⌄</span>
	</button>
	{#if open}
		<div
			class="menu"
			class:closing
			id="{id}-menu"
			role="menu"
			tabindex="-1"
			aria-label={menuLabel}
			onkeydown={handleMenuKeydown}
		>
			{#each items as item, index (`${index}-${item.label}`)}
				<button
					type="button"
					role="menuitem"
					disabled={item.disabled}
					onclick={(event) => activate(item, event)}
				>
					<strong>{item.label}</strong>
					{#if item.description}<small>{item.description}</small>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.action-menu {
		position: relative;
		display: inline-flex;
	}
	.trigger {
		min-height: 38px;
		padding: 8px 12px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid transparent;
		border-radius: 3px;
		font: inherit;
		font-size: 12px;
		font-weight: 800;
		cursor: pointer;
		transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
	}
	.trigger:hover:not(:disabled) { transform: translateY(-1px); }
	.trigger:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--ui-yellow) 55%, transparent);
		outline-offset: 2px;
	}
	.trigger:disabled { opacity: 0.58; cursor: not-allowed; }
	.trigger.navy { background: var(--ui-navy); color: white; }
	.trigger.navy:hover:not(:disabled), .trigger.navy[aria-expanded="true"] { background: var(--ui-navy-strong); }
	.trigger.secondary {
		border-color: var(--ui-yellow-deep);
		background: var(--ui-yellow);
		color: var(--ui-ink);
	}
	.trigger.secondary:hover:not(:disabled), .trigger.secondary[aria-expanded="true"] { background: #f0bd25; }
	.trigger.quiet {
		border-color: var(--ui-line-strong);
		background: transparent;
		color: var(--ui-navy);
	}
	.trigger.quiet:hover:not(:disabled), .trigger.quiet[aria-expanded="true"] { background: var(--ui-paper-deep); }
	.chevron {
		color: var(--ui-yellow-deep);
		font-size: 14px;
		line-height: 1;
		transition: transform 140ms ease;
	}
	.navy .chevron { color: var(--ui-yellow); }
	.trigger[aria-expanded="true"] .chevron { transform: translateY(2px); }
	.menu {
		position: absolute;
		z-index: 45;
		top: calc(100% + 6px);
		left: 0;
		min-width: 210px;
		max-width: min(320px, calc(100vw - 28px));
		padding: 5px;
		display: grid;
		border: 1px solid var(--ui-line-strong);
		border-top: 3px solid var(--ui-yellow);
		border-radius: 2px;
		background: var(--ui-paper);
		box-shadow: 0 12px 24px rgba(15, 34, 55, 0.17);
		transform-origin: top left;
		animation: menu-enter 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.align-end .menu { right: 0; left: auto; transform-origin: top right; }
	.menu.closing { pointer-events: none; animation: menu-leave 140ms ease-in forwards; }
	.menu button {
		width: 100%;
		min-height: 36px;
		padding: 8px 10px;
		border: 0;
		border-left: 2px solid transparent;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 130ms ease, border-color 130ms ease, padding-left 140ms ease;
	}
	.menu button:hover:not(:disabled), .menu button:focus-visible {
		padding-left: 13px;
		border-left-color: var(--ui-yellow);
		background: var(--ui-paper-deep);
		outline: 0;
	}
	.menu button:disabled { opacity: 0.5; cursor: not-allowed; }
	.menu strong, .menu small { display: block; }
	.menu strong { color: var(--ui-navy); font-size: 11px; }
	.menu small { margin-top: 2px; color: var(--ui-muted); font-size: 9px; line-height: 1.35; }
	@keyframes menu-enter {
		from { opacity: 0; transform: translateY(-5px) scaleY(0.97); }
		to { opacity: 1; transform: none; }
	}
	@keyframes menu-leave {
		from { opacity: 1; transform: none; }
		to { opacity: 0; transform: translateY(-4px) scaleY(0.98); }
	}
	@media (prefers-reduced-motion: reduce) {
		.trigger, .chevron, .menu button { transition: none; }
		.trigger:hover:not(:disabled) { transform: none; }
		.menu, .menu.closing { animation: none; }
	}
</style>
