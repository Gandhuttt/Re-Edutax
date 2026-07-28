<script lang="ts">
	import type { Snippet } from 'svelte';

	let { head, body }: { head: Snippet; body: Snippet } = $props();
</script>

<div class="tw:w-full tw:h-full tw:rounded-sm tw:bg-gray-100 tw:border tw:border-[#a9a9a9]">
	<div
		class="tw:w-full tw:min-h-10 tw:flex tw:items-center tw:px-3 tw:py-2 tw:bg-gray-200 tw:rounded-t-sm tw:border-b tw:border-b-[#a9a9a9]"
	>
		{@render head()}
	</div>
	<div class="tw:w-full tw:min-h-10 tw:p-3">
		{@render body()}
	</div>
</div>
