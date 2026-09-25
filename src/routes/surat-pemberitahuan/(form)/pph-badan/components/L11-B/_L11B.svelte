<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import I from "./I.svelte";
	import II from "./II.svelte";
	import III from "./III.svelte";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
	}

	let { currentTab = $bindable() }: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L11-B" ? "PENGHITUNGAN BIAYA PINJAMAN YANG DAPAT DIBEBANKAN UNTUK KEPERLUAR PENGHITUNGAN PAJAK PENGHASILAN" : currentTab.title;
	});
</script>

<div id="spt-panel-l11-b" role="tabpanel" hidden={currentTab.tab !== "L11-B"}>
	<Stack gap="0">
		<DisclosureItem title="I. PERHITUNGAN EBITDA">
			<I />
		</DisclosureItem>
		<DisclosureItem title="II. PERBANDINGAN ANTARA UTANG DAN MODAL (DEBT TO EQUITY RATIO)">
			<II />
		</DisclosureItem>
		<DisclosureItem title="III. PENGHITUNGAN BIAYA PINJAMAN">
			<III />
		</DisclosureItem>
	</Stack>
</div>
