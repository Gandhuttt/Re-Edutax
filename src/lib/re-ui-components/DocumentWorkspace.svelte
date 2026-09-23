<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type DocumentWorkspaceProps = {
		children: Snippet;
	};
</script>

<script lang="ts">
	let { children }: DocumentWorkspaceProps = $props();
</script>

<div class="workspace">
	{@render children()}
</div>

<style>
	.workspace {
		animation: workspace-arrive 420ms 100ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	.workspace :global([role='tabpanel']:not([hidden])) {
		animation: tab-arrive 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes workspace-arrive {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes tab-arrive {
		from {
			opacity: 0;
			transform: translateX(8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.workspace,
		.workspace :global([role='tabpanel']:not([hidden])) {
			animation: none;
		}
	}
</style>
