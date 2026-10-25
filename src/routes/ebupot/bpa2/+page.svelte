<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton } from '$lib/re-ui-components';
	import BpListWorkspace from '$lib/re-ui-components/BpListWorkspace.svelte';
	import { listBpa2 } from './listBpa2.remote';
	import { mutateBpa2 } from './lifecycle.remote';
	import { newEmpty } from './newEmpty.remote';

	const rows = $derived(await listBpa2());
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>e-Bupot BPA2</title></svelte:head>

{#snippet createAction()}
	<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BPA2</ActionButton></form>
{/snippet}

<BpListWorkspace
	kind="bpa2"
	{rows}
	{accountName}
	{accountNpwp}
	{createAction}
	onmutate={async (action, ids) => {
		const result = await mutateBpa2({ action, ids });
		await listBpa2().refresh();
		return result;
	}}
/>
