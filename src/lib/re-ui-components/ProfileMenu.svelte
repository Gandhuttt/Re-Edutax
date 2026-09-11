<script module lang="ts">
	export type ProfileMenuItem = {
		label: string;
		href?: string;
		target?: string;
		rel?: string;
		disabled?: boolean;
		onselect?: (event: MouseEvent) => void;
	};

	export type ProfileMenuGroup = {
		id?: string;
		label: string;
		heading?: string;
		portalHeading?: string;
		countLabel?: string;
		items: ProfileMenuItem[];
	};

	export type ProfileMenuProps = {
		name: string;
		role: string;
		initials: string;
		groups?: ProfileMenuGroup[];
		accountLabel?: string;
		menuLabel?: string;
		portalHeading?: string;
		serviceLabel?: string;
		logoutLabel?: string;
		logoutHref?: string;
		logoutTarget?: string;
		logoutRel?: string;
		onselect?: (
			item: ProfileMenuItem,
			group: ProfileMenuGroup,
			event: MouseEvent,
		) => void;
		onlogout?: (event: MouseEvent) => void;
	};
</script>

<script lang="ts">
	import { onDestroy } from "svelte";

	let {
		name,
		role,
		initials,
		groups = [],
		accountLabel = "Masuk sebagai",
		menuLabel = "Menu profil",
		portalHeading = "PORTAL WAJIB PAJAK",
		serviceLabel = "layanan",
		logoutLabel = "Keluar dari akun",
		logoutHref,
		logoutTarget,
		logoutRel,
		onselect,
		onlogout,
	}: ProfileMenuProps = $props();
	let open = $state(false);
	let closing = $state(false);
	let selectedGroup = $state<string | null>(null);
	let previewedGroup = $state<string | null>(null);
	let root = $state<HTMLDivElement>();
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const expanded = $derived(open && !closing);
	function groupKey(group: ProfileMenuGroup) {
		return group.id ?? group.label;
	}
	function toggle() {
		if (expanded) {
			dismiss();
			return;
		}
		clearTimeout(closeTimer);
		open = true;
		closing = false;
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
				selectedGroup = null;
				previewedGroup = null;
			},
			reduceMotion ? 0 : 140,
		);
	}
	function outside(event: MouseEvent) {
		if (open && root && !root.contains(event.target as Node)) dismiss();
	}
	function stopFocusPreview(event: FocusEvent, group: string) {
		if (
			event.currentTarget instanceof HTMLElement &&
			event.relatedTarget instanceof Node &&
			event.currentTarget.contains(event.relatedTarget)
		)
			return;
		if (previewedGroup === group) previewedGroup = null;
	}
	function select(
		item: ProfileMenuItem,
		group: ProfileMenuGroup,
		event: MouseEvent,
	) {
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		item.onselect?.(event);
		onselect?.(item, group, event);
		dismiss();
	}
	function logout(event: MouseEvent) {
		onlogout?.(event);
		dismiss();
	}
	onDestroy(() => clearTimeout(closeTimer));
</script>

<svelte:window
	onclick={outside}
	onkeydown={(event) => {
		if (event.key === "Escape") dismiss();
	}}
/>

<div class="profile-menu" bind:this={root}>
	<button
		class="profile-trigger"
		class:open
		type="button"
		aria-expanded={expanded}
		aria-haspopup="menu"
		onclick={toggle}
	>
		<span class="account-copy"
			><small>{accountLabel}</small><strong>{name}</strong></span
		>
		<span class="avatar">{initials}</span>
		<span class="indicator" aria-hidden="true">⌄</span>
	</button>
	{#if open}
		<div class="panel" class:closing role="menu">
			<div class="identity-card">
				<span class="avatar large">{initials}</span>
				<span><strong>{name}</strong><small>{role}</small></span>
			</div>
			<nav class="primary-nav" aria-label={menuLabel}>
				{#each groups as group}
					{@const key = groupKey(group)}
					<div
						class="submenu-row"
						role="none"
						class:active={previewedGroup === key ||
							(previewedGroup === null &&
								selectedGroup === key)}
						class:selected={selectedGroup === key}
						onmouseenter={() => (previewedGroup = key)}
						onmouseleave={() => (previewedGroup = null)}
						onfocusin={() => (previewedGroup = key)}
						onfocusout={(event) =>
							stopFocusPreview(event, key)}
					>
						<button
							type="button"
							role="menuitem"
							aria-haspopup="menu"
							aria-expanded={previewedGroup === key ||
								(previewedGroup === null &&
									selectedGroup === key)}
							onclick={() => (selectedGroup = key)}
						>
							<span>{group.label}</span><small
								>{group.countLabel ?? `${group.items.length} ${serviceLabel}`}</small
							><b aria-hidden="true">‹</b>
						</button>
						<div
							class="flyout"
							role="menu"
							aria-label={group.heading ?? group.label}
						>
							<div class="flyout-head">
								<span>{group.portalHeading ?? portalHeading}</span><strong
									>{group.heading ?? group.label}</strong
								>
							</div>
							<div class="flyout-grid">
								{#each group.items as item}
									{#if item.href}<a
											class="flyout-item"
											role="menuitem"
											href={item.href}
											target={item.target}
											rel={item.rel}
											aria-disabled={item.disabled ? "true" : undefined}
											onclick={(event) => select(item, group, event)}
											>{item.label}</a
										>{:else}<button
											class="flyout-item"
											type="button"
											role="menuitem"
											disabled={item.disabled}
											onclick={(event) => select(item, group, event)}
											>{item.label}</button
										>{/if}
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</nav>
			<div class="panel-footer">
				{#if logoutHref}<a
						class="logout-action"
						href={logoutHref}
						target={logoutTarget}
						rel={logoutRel}
						onclick={logout}>{logoutLabel}</a
					>{:else}<button
						class="logout-action"
						type="button"
						onclick={logout}>{logoutLabel}</button
					>{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-menu {
		position: relative;
		margin-left: auto;
		align-self: stretch;
		display: flex;
		align-items: center;
	}
	.profile-trigger {
		min-height: 50px;
		padding: 5px 8px 5px 12px;
		display: grid;
		grid-template-columns: auto 36px 14px;
		align-items: center;
		column-gap: 9px;
		border: 1px solid transparent;
		border-radius: 3px;
		background: transparent;
		color: white;
		font: inherit;
		text-align: right;
		cursor: pointer;
		transition:
			background 140ms ease,
			border-color 140ms ease;
	}
	.profile-trigger:hover,
	.profile-trigger.open {
		background: rgba(255, 255, 255, 0.07);
		border-color: rgba(255, 255, 255, 0.16);
	}
	.profile-trigger:focus-visible {
		outline: 2px solid var(--ui-yellow);
		outline-offset: 2px;
	}
	.account-copy small,
	.account-copy strong {
		display: block;
	}
	.account-copy small {
		color: #aebdcb;
		font-size: 10px;
	}
	.account-copy strong {
		font-size: 12px;
	}
	.avatar {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #e7e2d5;
		color: var(--ui-navy);
		font-size: 12px;
		font-weight: 800;
	}
	.indicator {
		color: var(--ui-yellow);
		font-size: 13px;
	}
	.panel {
		position: absolute;
		z-index: 90;
		top: calc(100% + 4px);
		right: 0;
		width: 270px;
		border: 1px solid var(--ui-line-strong);
		border-top: 4px solid var(--ui-yellow);
		background: var(--ui-paper);
		color: var(--ui-ink);
		box-shadow: 0 18px 36px rgba(8, 20, 34, 0.22);
		animation: profile-enter 170ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.panel.closing {
		pointer-events: none;
		animation: profile-leave 140ms ease-in forwards;
	}
	.identity-card {
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 11px;
		border-bottom: 1px solid var(--ui-line);
		background: #e4e7e5;
	}
	.avatar.large {
		width: 42px;
		height: 42px;
	}
	.identity-card strong,
	.identity-card small {
		display: block;
	}
	.identity-card strong {
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 15px;
	}
	.identity-card small {
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 10px;
	}
	.primary-nav {
		display: block;
		padding: 5px;
	}
	.submenu-row {
		position: relative;
	}
	.submenu-row > button {
		width: 100%;
		padding: 10px 10px;
		display: grid;
		grid-template-columns: 1fr auto 12px;
		align-items: center;
		gap: 7px;
		border: 0;
		border-radius: 2px;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			background 130ms ease,
			padding-left 150ms ease;
	}
	.submenu-row > button:hover,
	.submenu-row > button:focus-visible,
	.submenu-row.active > button {
		padding-left: 14px;
		background: var(--ui-paper-deep);
		outline: 0;
	}
	.submenu-row.selected > button {
		box-shadow: inset 3px 0 var(--ui-yellow);
	}
	.submenu-row > button span {
		font-size: 12px;
		font-weight: 750;
	}
	.submenu-row > button small {
		color: var(--ui-muted);
		font-size: 9px;
	}
	.submenu-row > button b {
		color: var(--ui-yellow-deep);
		font-size: 16px;
	}
	.flyout {
		position: absolute;
		z-index: 2;
		right: 100%;
		top: -5px;
		width: 560px;
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		border: 1px solid var(--ui-line-strong);
		border-top: 4px solid var(--ui-yellow);
		background: #fffefa;
		box-shadow: -12px 16px 30px rgba(8, 20, 34, 0.16);
		transform: translateX(7px);
		transition:
			opacity 140ms ease,
			transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1),
			visibility 0s linear 140ms;
	}
	.submenu-row.active > .flyout {
		visibility: visible;
		opacity: 1;
		pointer-events: auto;
		transform: none;
		transition-delay: 0s;
	}
	.flyout-head {
		padding: 12px 15px;
		border-bottom: 1px solid var(--ui-line);
		background: #e4e7e5;
	}
	.flyout-head span,
	.flyout-head strong {
		display: block;
	}
	.flyout-head span {
		margin-bottom: 3px;
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.12em;
	}
	.flyout-head strong {
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 16px;
	}
	.flyout-grid {
		padding: 7px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
	}
	.flyout-grid .flyout-item {
		padding: 9px 10px;
		width: 100%;
		border-top: 0;
		border-right: 0;
		border-bottom: 0;
		border-left: 2px solid transparent;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 11px;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition:
			background 130ms ease,
			border-color 130ms ease,
			padding-left 150ms ease;
	}
	.flyout-grid .flyout-item:hover,
	.flyout-grid .flyout-item:focus-visible {
		padding-left: 13px;
		border-left-color: var(--ui-yellow);
		background: var(--ui-paper-deep);
		outline: 0;
	}
	.flyout-grid .flyout-item:disabled,
	.flyout-grid .flyout-item[aria-disabled="true"] {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.panel-footer {
		padding: 10px;
		border-top: 1px solid var(--ui-line);
		background: #efede5;
	}
	.panel-footer .logout-action {
		width: 100%;
		padding: 8px 10px;
		display: block;
		border: 1px solid var(--ui-line-strong);
		border-radius: 2px;
		background: #fffefa;
		color: #8f2823;
		font: inherit;
		font-size: 11px;
		font-weight: 750;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.panel-footer .logout-action:hover {
		border-color: #9f3833;
		background: #fff8f7;
	}
	@keyframes profile-enter {
		from {
			opacity: 0;
			transform: translateY(-6px) scaleY(0.97);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes profile-leave {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scaleY(0.98);
		}
	}
	@media (max-width: 900px) {
		.flyout {
			position: static;
			width: auto;
			display: none;
			border: 0;
			border-top: 1px solid var(--ui-line);
			box-shadow: none;
			transform: none;
		}
		.submenu-row.active > .flyout {
			display: block;
		}
		.flyout-grid {
			grid-template-columns: 1fr;
		}
		.flyout-head {
			display: none;
		}
	}
	@media (max-width: 600px) {
		.account-copy {
			display: none;
		}
		.profile-trigger {
			grid-template-columns: 36px 14px;
			padding-left: 7px;
		}
		.panel {
			position: fixed;
			top: 72px;
			right: 12px;
			width: min(310px, calc(100vw - 24px));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.profile-trigger,
		.submenu-row > button,
		.flyout,
		.flyout-grid .flyout-item {
			transition: none;
		}
		.panel,
		.panel.closing {
			animation: none;
		}
	}
</style>
