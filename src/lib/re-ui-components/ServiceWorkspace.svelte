<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type ServiceWorkspaceIdentity = {
		name: string;
		eyebrow?: string;
		identifier?: string;
		description?: string;
		mark?: string;
	};

	export type ServiceWorkspaceLink = {
		label: string;
		description?: string;
		href?: string;
		active?: boolean;
		disabled?: boolean;
		onclick?: (event: MouseEvent, link: ServiceWorkspaceLink) => void;
	};

	export type ServiceWorkspaceGroup = {
		label?: string;
		links: readonly ServiceWorkspaceLink[];
	};

	export type ServiceWorkspaceProps = {
		identity: ServiceWorkspaceIdentity;
		groups?: readonly ServiceWorkspaceGroup[];
		navLabel?: string;
		menuLabel?: string;
		sidebarOpen?: boolean;
		children: Snippet;
		onnavigate?: (link: ServiceWorkspaceLink, event: MouseEvent) => void;
	} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
</script>

<script lang="ts">
	let {
		identity,
		groups = [],
		navLabel = "Navigasi layanan",
		menuLabel = "Menu layanan",
		sidebarOpen = $bindable(false),
		children,
		onnavigate,
		class: className,
		...props
	}: ServiceWorkspaceProps = $props();

	const id = $props.id();

	function activate(link: ServiceWorkspaceLink, event: MouseEvent) {
		if (link.disabled) {
			event.preventDefault();
			return;
		}
		link.onclick?.(event, link);
		onnavigate?.(link, event);
		sidebarOpen = false;
	}
</script>

<div {...props} class="service-workspace {className ?? ""}">
	<button
		class="drawer-trigger"
		type="button"
		aria-controls="{id}-sidebar"
		aria-expanded={sidebarOpen}
		onclick={() => (sidebarOpen = !sidebarOpen)}
	>
		<span>{menuLabel}</span><span aria-hidden="true">{sidebarOpen ? "×" : "☰"}</span>
	</button>
	<aside id="{id}-sidebar" class:open={sidebarOpen}>
		<div class="identity">
			{#if identity.mark}<span class="identity-mark" aria-hidden="true">{identity.mark}</span>{/if}
			<div class="identity-copy">
				{#if identity.eyebrow}<span class="eyebrow">{identity.eyebrow}</span>{/if}
				<strong>{identity.name}</strong>
				{#if identity.identifier}<code>{identity.identifier}</code>{/if}
				{#if identity.description}<small>{identity.description}</small>{/if}
			</div>
		</div>
		<nav aria-label={navLabel}>
			{#each groups as group}
				<section>
					{#if group.label}<h2>{group.label}</h2>{/if}
					<div class="nav-links">
						{#each group.links as link}
							{#if link.href && !link.disabled}
								<a
									href={link.href}
									class:active={link.active}
									aria-current={link.active ? "page" : undefined}
									onclick={(event) => activate(link, event)}
								>
									<span>{link.label}</span>
									{#if link.description}<small>{link.description}</small>{/if}
								</a>
							{:else}
								<button
									type="button"
									class:active={link.active}
									disabled={link.disabled}
									aria-current={link.active ? "page" : undefined}
									onclick={(event) => activate(link, event)}
								>
									<span>{link.label}</span>
									{#if link.description}<small>{link.description}</small>{/if}
								</button>
							{/if}
						{/each}
					</div>
				</section>
			{/each}
		</nav>
	</aside>
	<div class="service-content">
		{@render children()}
	</div>
</div>

<style>
	.service-workspace {
		position: relative;
		min-width: 0;
		display: grid;
		grid-template-columns: 250px minmax(0, 1fr);
		align-items: start;
		gap: 20px;
	}
	.drawer-trigger { display: none; }
	aside {
		min-width: 0;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
		box-shadow: 0 6px 18px rgba(25, 36, 49, 0.06);
		animation: sidebar-arrive 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	.identity {
		padding: 18px;
		display: flex;
		align-items: flex-start;
		gap: 11px;
		border-bottom: 3px solid var(--ui-yellow);
		background: var(--ui-navy);
		color: white;
	}
	.identity-mark {
		width: 39px;
		height: 39px;
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		border: 1px solid rgba(255, 255, 255, 0.32);
		background: rgba(255, 255, 255, 0.08);
		color: var(--ui-yellow);
		font-family: var(--ui-font-display);
		font-size: 14px;
		font-weight: 800;
	}
	.identity-copy { min-width: 0; }
	.identity-copy > * { display: block; }
	.eyebrow {
		margin-bottom: 3px;
		color: #cbd5df;
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.identity strong {
		font-family: var(--ui-font-display);
		font-size: 15px;
		line-height: 1.25;
	}
	.identity code { margin-top: 4px; color: var(--ui-yellow); font: 700 9px var(--ui-font-mono); }
	.identity small { margin-top: 6px; color: #d7e0e8; font-size: 9px; line-height: 1.4; }
	nav { padding: 7px 0 12px; }
	nav section + section { margin-top: 5px; padding-top: 7px; border-top: 1px solid var(--ui-line); }
	h2 {
		margin: 0;
		padding: 8px 15px 5px;
		color: var(--ui-muted);
		font-size: 8px;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.nav-links { display: grid; }
	.nav-links a, .nav-links button {
		position: relative;
		width: 100%;
		min-height: 39px;
		padding: 9px 15px;
		display: block;
		border: 0;
		border-left: 4px solid transparent;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		font-size: 11px;
		font-weight: 700;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition: background 140ms ease, border-color 140ms ease, padding-left 160ms ease;
	}
	.nav-links a:hover, .nav-links button:hover:not(:disabled),
	.nav-links a:focus-visible, .nav-links button:focus-visible {
		padding-left: 18px;
		background: var(--ui-paper-deep);
		outline: 0;
	}
	.nav-links .active {
		border-left-color: var(--ui-yellow);
		background: #fffefa;
		color: var(--ui-navy);
	}
	.nav-links button:disabled { color: var(--ui-muted); opacity: 0.5; cursor: not-allowed; }
	.nav-links small { display: block; margin-top: 2px; color: var(--ui-muted); font-size: 9px; font-weight: 400; line-height: 1.35; }
	.service-content {
		min-width: 0;
		animation: content-arrive 320ms 60ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	@keyframes sidebar-arrive {
		from { opacity: 0; transform: translateX(-7px); }
		to { opacity: 1; transform: none; }
	}
	@keyframes content-arrive {
		from { opacity: 0; transform: translateY(7px); }
		to { opacity: 1; transform: none; }
	}
	@media (max-width: 860px) {
		.service-workspace { grid-template-columns: minmax(0, 1fr); gap: 10px; }
		.drawer-trigger {
			width: 100%;
			min-height: 42px;
			padding: 9px 13px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border: 1px solid var(--ui-line-strong);
			border-bottom: 3px solid var(--ui-yellow);
			border-radius: 2px;
			background: var(--ui-navy);
			color: white;
			font: inherit;
			font-size: 12px;
			font-weight: 800;
			cursor: pointer;
		}
		.drawer-trigger:focus-visible { outline: 3px solid var(--ui-yellow); outline-offset: 2px; }
		.drawer-trigger span:last-child { color: var(--ui-yellow); font-size: 17px; }
		aside { display: none; animation: drawer-open 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
		aside.open { display: block; }
	}
	@keyframes drawer-open {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: none; }
	}
	@media (prefers-reduced-motion: reduce) {
		aside, aside.open, .service-content { animation: none; }
		.nav-links a, .nav-links button { transition: none; }
	}
</style>
