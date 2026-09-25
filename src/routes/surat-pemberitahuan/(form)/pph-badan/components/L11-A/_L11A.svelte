<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import I from "./I.svelte";
	import II from "./II.svelte";
	import III from "./III.svelte";
	import IV from "./IV.svelte";
	import V from "./V.svelte";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
	}

	let { currentTab = $bindable() }: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L11-A" ? "RINCIAN BIAYA TERTENTU" : currentTab.title;
	});
</script>

<div id="spt-panel-l11-a" role="tabpanel" hidden={currentTab.tab !== "L11-A"}>
	<Stack gap="0">
		<DisclosureItem title="I. DAFTAR NOMINATIF BIAYA PROMOSI DAN PENJUALAN, SERTA PENGGANTIAN ATAU IMBALAN DALAM BENTUK NATURA DAN/ATAU KENIKMATAN">
			<I />
		</DisclosureItem>
		<DisclosureItem title="II. DAFTAR NOMINATIF BIAYA ENTERTAINMENT">
			<II />
		</DisclosureItem>
		<DisclosureItem title="III. DAFTAR PIUTANG YANG NYATA-NYATA TIDAK DAPAT DITAGIH">
			<III />
		</DisclosureItem>
		<DisclosureItem title="IV. RINCIAN BAGI WAJIB PAJAK PEMBERI NATURA DAN/ATAU KENIKMATAN">
			<IV />
		</DisclosureItem>
		<DisclosureItem title="V. DAFTAR DEBITUR NON-PERFORMING LOAN">
			<V />
		</DisclosureItem>
	</Stack>
</div>
