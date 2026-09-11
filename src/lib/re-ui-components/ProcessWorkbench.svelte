<script module lang="ts">
	import type { Snippet } from "svelte";

	export type ProcessWorkbenchStep = {
		value: string;
		label: string;
		status?: string;
	};

	export type ProcessWorkbenchHelp = {
		title: string;
		description: string;
		label: string;
		href: string;
	};

	export type ProcessWorkbenchProps = {
		steps: readonly ProcessWorkbenchStep[];
		active?: string;
		navLabel: string;
		navTitle: string;
		help?: ProcessWorkbenchHelp;
		children: Snippet<[string]>;
	};
</script>

<script lang="ts">
	let {
		steps,
		active = $bindable(""),
		navLabel,
		navTitle,
		help,
		children,
	}: ProcessWorkbenchProps = $props();
</script>

<div class="process-workbench">
	<aside class="process-sidebar">
		<nav aria-label={navLabel}>
			<div class="nav-title">{navTitle}</div>
			{#each steps as step, index (step.value)}
				<button
					type="button"
					class:active={active === step.value}
					aria-current={active === step.value ? "step" : undefined}
					onclick={() => (active = step.value)}
				>
					<span class="step-number" aria-hidden="true">
						{String(index + 1).padStart(2, "0")}
					</span>
					<span class="step-details">
						<span>{step.label}</span>
						{#if step.status}<small>{step.status}</small>{/if}
					</span>
				</button>
			{/each}
		</nav>
		{#if help}
			<div class="sidebar-help">
				<strong>{help.title}</strong>
				<p>{help.description}</p>
				<a href={help.href}>{help.label} <span aria-hidden="true">→</span></a>
			</div>
		{/if}
	</aside>
	<section class="content-panel">
		{@render children(active)}
	</section>
</div>

<style>
	.process-workbench {
		display: grid;
		grid-template-columns: 245px minmax(0, 1fr);
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
		box-shadow: 0 8px 24px rgba(25, 36, 49, 0.07);
		animation: workbench-arrive 420ms 100ms cubic-bezier(0.2, 0.8, 0.2, 1)
			both;
	}

	.process-sidebar {
		min-width: 0;
		border-right: 1px solid var(--ui-line-strong);
		background: #e4e7e5;
	}

	.process-sidebar nav {
		display: block;
	}

	.nav-title {
		padding: 18px 18px 11px;
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	.process-sidebar button {
		position: relative;
		display: flex;
		width: 100%;
		gap: 12px;
		padding: 13px 16px;
		border: 0;
		border-top: 1px solid transparent;
		border-bottom: 1px solid transparent;
		background: transparent;
		color: var(--ui-ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			background 150ms ease,
			color 150ms ease,
			padding-left 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.process-sidebar button:hover {
		background: #eceeea;
	}

	.process-sidebar button:focus-visible {
		z-index: 1;
		outline: 2px solid var(--ui-navy);
		outline-offset: -3px;
	}

	.process-sidebar button.active {
		padding-left: 20px;
		border-color: var(--ui-line-strong);
		background: var(--ui-paper);
		color: var(--ui-navy);
	}

	.process-sidebar button.active::before {
		position: absolute;
		inset: 0 auto 0 0;
		width: 4px;
		background: var(--ui-yellow);
		content: "";
		transform-origin: top;
		animation: active-marker-grow 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.step-number {
		color: #7b858d;
		font: 700 10px/1.7 var(--ui-font-mono);
	}

	.step-details > span {
		font-size: 13px;
		font-weight: 700;
	}

	.step-details small {
		display: block;
		margin-top: 2px;
		color: var(--ui-muted);
		font-size: 10px;
		font-weight: 400;
	}

	.sidebar-help {
		margin: 18px;
		padding: 16px;
		border-top: 2px solid var(--ui-navy);
		background: #f2efe6;
		font-size: 11px;
	}

	.sidebar-help p {
		margin: 0.75em 0;
		color: var(--ui-muted);
		line-height: 1.5;
	}

	.sidebar-help a {
		color: var(--ui-navy);
		font-weight: 700;
	}

	.content-panel {
		min-width: 0;
	}

	@keyframes workbench-arrive {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes active-marker-grow {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}

	@media (max-width: 900px) {
		.process-workbench {
			grid-template-columns: minmax(0, 1fr);
		}

		.process-sidebar {
			display: flex;
			overflow-x: auto;
			border-right: 0;
			border-bottom: 1px solid var(--ui-line-strong);
		}

		.process-sidebar nav {
			display: flex;
		}

		.nav-title,
		.sidebar-help,
		.step-details small {
			display: none;
		}

		.process-sidebar button {
			width: auto;
			white-space: nowrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.process-workbench,
		.process-sidebar button.active::before {
			animation: none;
		}

		.process-sidebar button {
			transition: none;
		}
	}
</style>
