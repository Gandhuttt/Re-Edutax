<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type DataWorkspaceProps = {
		title: string;
		children: Snippet;
		primaryActions?: Snippet;
		secondaryActions?: Snippet;
		tools?: Snippet;
	} & Omit<HTMLAttributes<HTMLElement>, "children" | "title">;
</script>

<script lang="ts">
	let {
		title,
		children,
		primaryActions,
		secondaryActions,
		tools,
		class: className,
		...props
	}: DataWorkspaceProps = $props();
</script>

<section {...props} class="data-workspace {className ?? ""}">
	<header>
		<div class="heading-row">
			<h2>{title}</h2>
			{#if primaryActions}<div class="primary-actions">{@render primaryActions()}</div>{/if}
		</div>
		{#if secondaryActions || tools}
			<div class="toolbar">
				{#if secondaryActions}<div class="secondary-actions">{@render secondaryActions()}</div>{/if}
				{#if tools}<div class="tools">{@render tools()}</div>{/if}
			</div>
		{/if}
	</header>
	<div class="workspace-content">{@render children()}</div>
</section>

<style>
	.data-workspace {
		min-width: 0;
		border: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
		box-shadow: 0 8px 22px rgba(25, 36, 49, 0.07);
		animation: workspace-arrive 300ms 70ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	header {
		border-bottom: 1px solid var(--ui-line-strong);
		background: #fffefa;
	}
	.heading-row {
		min-height: 65px;
		padding: 13px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
	}
	h2 {
		margin: 0;
		color: var(--ui-navy);
		font-family: var(--ui-font-display);
		font-size: 20px;
		line-height: 1.2;
	}
	.primary-actions, .secondary-actions, .tools {
		display: flex;
		align-items: center;
		gap: 7px;
		flex-wrap: wrap;
	}
	.primary-actions { justify-content: flex-end; }
	.toolbar {
		min-height: 49px;
		padding: 8px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		border-top: 1px solid var(--ui-line);
		background: var(--ui-paper-deep);
	}
	.tools { margin-left: auto; justify-content: flex-end; }
	.workspace-content { min-width: 0; }
	@keyframes workspace-arrive {
		from { opacity: 0; transform: translateY(7px); }
		to { opacity: 1; transform: none; }
	}
	@media (max-width: 700px) {
		.heading-row, .toolbar { align-items: stretch; flex-direction: column; }
		.heading-row { padding: 15px; }
		.toolbar { padding: 10px 15px; }
		.primary-actions, .secondary-actions, .tools { justify-content: flex-start; }
		.tools { margin-left: 0; }
		.primary-actions :global(> *), .secondary-actions :global(> *), .tools :global(> *) {
			flex: 1 1 auto;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.data-workspace { animation: none; }
	}
</style>
