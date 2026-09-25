<script lang="ts">
	import { DisclosureItem, Stack } from '$lib/re-ui-components';
	import type { DaftarReferensi, KodeReferensi } from '../referensi';
	import A from './A.svelte';
	import B from './B.svelte';
	import C from './C.svelte';
	import type { BarisBukanObjek, BarisFinal, BarisLuarNegeri } from './types';

	interface Props {
		currentTab: string;
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		final: BarisFinal[];
		bukanObjek: BarisBukanObjek[];
		luarNegeri: BarisLuarNegeri[];
		i14cPenghasilanFinal: boolean | undefined;
		i14dBukanObjekPajak: boolean | undefined;
		b1dPenghasilanLuarNegeri: boolean | undefined;
		readonly?: boolean;
	}

	let {
		currentTab,
		referensi,
		kodeReferensi,
		final = $bindable(),
		bukanObjek = $bindable(),
		luarNegeri = $bindable(),
		i14cPenghasilanFinal,
		i14dBukanObjekPajak,
		b1dPenghasilanLuarNegeri,
		readonly = false
	}: Props = $props();

	let sectionAOpen = $state(true);
	let sectionBOpen = $state(true);
	let sectionCOpen = $state(true);
</script>

<div id="spt-panel-l-2" role="tabpanel" hidden={currentTab !== 'L-2'}>
	<Stack gap="0">
		<DisclosureItem title="A. Penghasilan yang Dikenakan Pajak Penghasilan Bersifat Final" bind:open={sectionAOpen}>
			<A bind:rows={final} {referensi} {kodeReferensi} dapatDiubah={Boolean(i14cPenghasilanFinal)} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="B. Penghasilan yang Tidak Termasuk Objek Pajak" bind:open={sectionBOpen}>
			<B bind:rows={bukanObjek} {referensi} {kodeReferensi} dapatDiubah={Boolean(i14dBukanObjekPajak)} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="C. Penghasilan Neto Luar Negeri" bind:open={sectionCOpen}>
			<C bind:rows={luarNegeri} {referensi} {kodeReferensi} dapatDiubah={Boolean(b1dPenghasilanLuarNegeri)} {readonly} />
		</DisclosureItem>
	</Stack>
</div>
