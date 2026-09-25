<script lang="ts">
	import { DocumentTabs } from '$lib/re-ui-components';
	interface Props {
		tabs: { tab: string; visibility: boolean }[];
		currentTab: string;
		specialLabel?: (tab: string) => string;
		onchange: (tab: string) => void;
	}

	let { tabs, currentTab, specialLabel, onchange }: Props = $props();

	const documentTabs = $derived(
		tabs.map((tab) => ({
			label: specialLabel?.(tab.tab) ?? tab.tab,
			value: tab.tab,
			available: tab.visibility,
			panelId: `spt-panel-${tab.tab.toLocaleLowerCase('id-ID').replaceAll(/[^a-z0-9]+/g, '-')}`
		}))
	);
</script>

<DocumentTabs
	tabs={documentTabs}
	active={currentTab}
	onchange={(value) => onchange(value)}
	ariaLabel="Bagian SPT Tahunan"
/>