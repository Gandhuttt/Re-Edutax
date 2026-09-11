<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		message = "",
		children,
	}: { message?: string; children: Snippet } = $props();
</script>

<footer class="form-actions">
	{#if message}<span>{message}</span>{/if}
	<div class="actions">{@render children()}</div>
</footer>

<style>
	.form-actions {
		min-height: 64px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		border-top: 1px solid var(--ui-line-strong);
		background: var(--ui-paper);
	}
	.form-actions > span {
		color: var(--ui-muted);
		font-size: 10px;
	}
	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
	}
	@media (max-width: 650px) {
		.form-actions {
			align-items: flex-start;
			flex-direction: column;
		}
		.actions {
			flex-wrap: wrap;
			justify-content: flex-start;
		}
	}
</style>
