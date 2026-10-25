<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton } from '$lib/re-ui-components';
	import BpListWorkspace from '$lib/re-ui-components/BpListWorkspace.svelte';
	import { listBpa1 } from './listBpa1.remote';
	import { mutateBpa1 } from './lifecycle.remote';
	import { newEmpty } from './newEmpty.remote';

	const rows = $derived(await listBpa1());
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>e-Bupot BPA1</title></svelte:head>

{#snippet createAction()}
	<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BPA1</ActionButton></form>
{/snippet}

<BpListWorkspace
	kind="bpa1"
	{rows}
	{accountName}
	{accountNpwp}
	{createAction}
	onmutate={async (action, ids) => {
		const result = await mutateBpa1({ action, ids });
		await listBpa1().refresh();
		return result;
	}}
/>
