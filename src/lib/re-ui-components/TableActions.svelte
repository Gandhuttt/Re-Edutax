<script module lang="ts">
	export type TableAction = {
		label: string;
		ariaLabel?: string;
		href?: string;
		target?: "_self" | "_blank" | "_parent" | "_top";
		rel?: string;
		disabled?: boolean;
		danger?: boolean;
		onclick?: (event: MouseEvent, action: TableAction) => void;
	};

	export type TableActionsProps = {
		actions?: TableAction[];
		visibleCount?: number;
		moreLabel?: string;
		ariaLabel?: string;
		onaction?: (action: TableAction, event: MouseEvent) => void;
	};
</script>

<script lang="ts">
	import { onDestroy, tick } from "svelte";

	let {
		actions = [],
		visibleCount = 2,
		moreLabel = "Lainnya",
		ariaLabel = "Aksi baris",
		onaction,
	}: TableActionsProps = $props();

	let root = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let open = $state(false);
	let closing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const splitAt = $derived(Math.max(0, Math.min(visibleCount, actions.length)));
	const visibleActions = $derived(actions.slice(0, splitAt));
	const overflowActions = $derived(actions.slice(splitAt));
	const expanded = $derived(open && !closing);

	async function openMenu(focusFirst = false) {
		clearTimeout(closeTimer);
		closing = false;
		open = true;
		if (focusFirst) {
			await tick();
			menuItems()[0]?.focus();
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
			reduceMotion ? 0 : 130,
		);
	}

	function toggleMenu() {
		if (expanded) closeMenu();
		else openMenu();
	}

	function menuItems() {
		if (!root) return [];
		return Array.from(
			root.querySelectorAll<HTMLElement>(
				'.menu a:not([aria-disabled="true"]), .menu button:not(:disabled)',
			),
		);
	}

	function activate(event: MouseEvent, action: TableAction, inMenu = false) {
		if (action.disabled) {
			event.preventDefault();
			return;
		}
		action.onclick?.(event, action);
		onaction?.(action, event);
		if (inMenu) closeMenu();
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			openMenu(true);
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		const items = menuItems();
		if (!items.length) return;
		const index = Math.max(0, items.indexOf(document.activeElement as HTMLElement));
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const direction = event.key === "ArrowDown" ? 1 : -1;
			items[(index + direction + items.length) % items.length]?.focus();
		} else if (event.key === "Home" || event.key === "End") {
			event.preventDefault();
			items[event.key === "Home" ? 0 : items.length - 1]?.focus();
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node)) closeMenu();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && expanded) {
			event.preventDefault();
			closeMenu(true);
		}
	}

	function handleWindowFocus(event: FocusEvent) {
		if (expanded && root && !root.contains(event.target as Node)) closeMenu();
	}

	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window
	onclick={handleOutsideClick}
	onkeydown={handleWindowKeydown}
	onfocusin={handleWindowFocus}
/>

<div class="table-actions" bind:this={root} role="group" aria-label={ariaLabel}>
	{#each visibleActions as action, index (`visible-${index}-${action.label}`)}
		{#if action.href && !action.disabled}
			<a
				class="action"
				class:danger={action.danger}
				href={action.href}
				target={action.target}
				rel={action.rel}
				aria-label={action.ariaLabel ?? action.label}
				onclick={(event) => activate(event, action)}>{action.label}</a
			>
		{:else}
			<button
				class="action"
				class:danger={action.danger}
				type="button"
				disabled={action.disabled}
				aria-label={action.ariaLabel ?? action.label}
				onclick={(event) => activate(event, action)}>{action.label}</button
			>
		{/if}
	{/each}

	{#if overflowActions.length}
		<div class="more">
			<button
				bind:this={trigger}
				class="more-trigger"
				type="button"
				aria-haspopup="menu"
				aria-expanded={expanded}
				onclick={toggleMenu}
				onkeydown={handleTriggerKeydown}
			>
				{moreLabel}<span aria-hidden="true">⌄</span>
			</button>
			{#if open}
				<div class="menu" class:closing role="menu" tabindex="-1" onkeydown={handleMenuKeydown}>
					{#each overflowActions as action, index (`menu-${index}-${action.label}`)}
						{#if action.href}
							<a
								class:danger={action.danger}
								class:disabled={action.disabled}
								href={action.disabled ? undefined : action.href}
								target={action.target}
								rel={action.rel}
								role="menuitem"
								aria-disabled={action.disabled ? "true" : undefined}
								aria-label={action.ariaLabel ?? action.label}
								tabindex={action.disabled ? -1 : 0}
								onclick={(event) => activate(event, action, true)}>{action.label}</a
							>
						{:else}
							<button
								class:danger={action.danger}
								type="button"
								role="menuitem"
								disabled={action.disabled}
								aria-label={action.ariaLabel ?? action.label}
								onclick={(event) => activate(event, action, true)}>{action.label}</button
							>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.table-actions {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 5px;
		white-space: nowrap;
	}
	.action,
	.more-trigger {
		min-height: 30px;
		padding: 5px 9px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: var(--ui-navy);
		font: inherit;
		font-size: 10px;
		font-weight: 800;
		line-height: 1.2;
		text-decoration: none;
		cursor: pointer;
		transition:
			border-color 140ms ease,
			background 140ms ease,
			color 140ms ease,
			transform 140ms ease;
	}
	.action:hover:not(:disabled),
	.more-trigger:hover,
	.more-trigger[aria-expanded="true"] {
		border-color: var(--ui-navy);
		background: var(--ui-paper-deep);
		transform: translateY(-1px);
	}
	.action:focus-visible,
	.more-trigger:focus-visible {
		outline: 3px solid var(--ui-yellow-soft);
		outline-offset: 1px;
		border-color: var(--ui-navy);
	}
	.action.danger {
		color: var(--ui-danger);
	}
	.action:disabled {
		color: var(--ui-muted);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.more {
		position: relative;
	}
	.more-trigger span {
		color: var(--ui-yellow-deep);
		font-size: 13px;
		font-weight: 900;
		transition: transform 140ms ease;
	}
	.more-trigger[aria-expanded="true"] span {
		transform: translateY(2px);
	}
	.menu {
		position: absolute;
		z-index: 35;
		top: calc(100% + 5px);
		right: 0;
		min-width: 148px;
		padding: 5px;
		display: grid;
		border: 1px solid var(--ui-line-strong);
		border-top: 3px solid var(--ui-yellow);
		border-radius: 2px;
		background: var(--ui-paper);
		box-shadow: 0 10px 22px rgba(15, 34, 55, 0.16);
		transform-origin: top right;
		animation: menu-enter 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.menu.closing {
		pointer-events: none;
		animation: menu-leave 130ms ease-in forwards;
	}
	.menu a,
	.menu button {
		width: 100%;
		min-height: 34px;
		padding: 7px 9px;
		border: 0;
		border-left: 2px solid transparent;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 11px;
		font-weight: 650;
		line-height: 1.3;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition:
			border-color 140ms ease,
			background 140ms ease,
			padding-left 150ms ease;
	}
	.menu a:hover,
	.menu button:hover:not(:disabled),
	.menu a:focus-visible,
	.menu button:focus-visible {
		padding-left: 12px;
		border-left-color: var(--ui-yellow);
		background: var(--ui-paper-deep);
		outline: none;
	}
	.menu .danger {
		color: var(--ui-danger);
	}
	.menu .disabled,
	.menu button:disabled {
		color: var(--ui-muted);
		opacity: 0.5;
		cursor: not-allowed;
	}
	@keyframes menu-enter {
		from {
			opacity: 0;
			transform: translateY(-5px) scale(0.97);
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
			transform: translateY(-3px) scale(0.98);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.action,
		.more-trigger,
		.more-trigger span,
		.menu,
		.menu a,
		.menu button {
			transition: none;
			animation: none;
		}
	}
</style>
