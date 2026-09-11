<script module lang="ts">
	import type { Snippet } from "svelte";

	export type ActionShowcaseGroup = {
		label: string;
		content: Snippet;
		danger?: boolean;
	};
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	type Props = {
		groups: ActionShowcaseGroup[];
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, "class" | "children">;

	let {
		groups,
		class: className = "",
		...attributes
	}: Props = $props();
</script>

<div class={`action-showcase ${className}`} {...attributes}>
	{#each groups as group}
		<div class="group" class:danger={group.danger}>
			<span class="label">{group.label}</span>
			<div class="actions">{@render group.content()}</div>
		</div>
	{/each}
</div>

<style>
	.action-showcase {
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 18px 28px;
	}
	.group {
		min-width: 0;
		display: grid;
		align-content: end;
		gap: 7px;
	}
	.label {
		color: var(--ui-muted);
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.07em;
		line-height: 1.35;
		text-transform: uppercase;
	}
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	.group.danger {
		padding-left: 28px;
		border-left: 1px solid var(--ui-line);
	}
	@media (max-width: 600px) {
		.action-showcase {
			align-items: stretch;
			flex-direction: column;
		}
		.group.danger {
			padding-top: 18px;
			padding-left: 0;
			border-top: 1px solid var(--ui-line);
			border-left: 0;
		}
	}
</style>
