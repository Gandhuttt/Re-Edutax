<script lang="ts">
	import { page as appPage } from '$app/state';
	import { ActionButton } from '$lib/re-ui-components';
	import BpListWorkspace from '$lib/re-ui-components/BpListWorkspace.svelte';
	import { listMp } from './listMp.remote';
	import { mutateMp } from './lifecycle.remote';
	import { newEmpty } from './newEmpty.remote';

	const rows = $derived(await listMp());
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
</script>

<svelte:head><title>e-Bupot MP</title></svelte:head>

{#snippet createAction()}
	<form {...newEmpty}><ActionButton type="submit" pending={newEmpty.pending > 0} pendingLabel="Membuka...">Buat e-Bupot MP</ActionButton></form>
{/snippet}

<BpListWorkspace
	kind="mp"
	{rows}
	{accountName}
	{accountNpwp}
	{createAction}
	onmutate={async (action, ids) => {
		const result = await mutateMp({ action, ids });
		await listMp().refresh();
		return result;
	}}
/>
