<script lang="ts">
	import { DocumentTabs } from '$lib/re-ui-components';

	interface Props {
		tabs: { tab: string; visibility: boolean }[];
		currentTab: string;
		specialLabel?: (tab: string) => string;
	}

	let { tabs, currentTab = $bindable(), specialLabel }: Props = $props();
	const documentTabs = $derived(
		tabs.map((tab) => ({
			value: tab.tab,
			label: specialLabel ? specialLabel(tab.tab) : tab.tab,
			available: tab.visibility,
			panelId: `spt-panel-${tab.tab.toLocaleLowerCase('id-ID').replaceAll(/[^a-z0-9]+/g, '-')}`
		}))
	);
</script>

<DocumentTabs tabs={documentTabs} bind:active={currentTab} ariaLabel="Bagian SPT" />
