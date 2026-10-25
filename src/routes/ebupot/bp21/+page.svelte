<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton } from '$lib/re-ui-components';
	import BpListWorkspace from '$lib/re-ui-components/BpListWorkspace.svelte';
	import { listBp21 } from './listBp21.remote';
	import { mutateBp21 } from './lifecycle.remote';
	import { newEmpty } from './newEmpty.remote';

	const rows = $derived(await listBp21());
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>e-Bupot BP21</title></svelte:head>

{#snippet createAction()}
	<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot BP21</ActionButton></form>
{/snippet}

<BpListWorkspace
	kind="bp21"
	{rows}
	{accountName}
	{accountNpwp}
	{createAction}
	onmutate={(action, ids) => mutateBp21({ action, ids }).updates(listBp21())}
/>
