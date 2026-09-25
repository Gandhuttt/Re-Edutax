<script lang="ts">
	import { DisclosureItem, Stack } from '$lib/re-ui-components';
	import A from './A.svelte';
	import B from './B.svelte';
	import type { BarisLainnya } from './types';
	import type { DaftarReferensi, KodeReferensi } from '../referensi';

	interface Props {
		currentTab: string;
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		lainnya: BarisLainnya[];
		b1cPenghasilanDalamNegeriLainnya: boolean | undefined;
		normaAktif: boolean;
		namaUsaha: string;
		jenisUsahaPekerjaanBebas: string;
		peredaranBrutoNorma: number;
		normaPersen: number;
		readonly?: boolean;
	}
	let { currentTab, referensi, kodeReferensi, lainnya = $bindable(), b1cPenghasilanDalamNegeriLainnya, normaAktif, namaUsaha, jenisUsahaPekerjaanBebas, peredaranBrutoNorma, normaPersen = $bindable(), readonly = false }: Props = $props();
	let sectionAOpen = $state(true);
	let sectionBOpen = $state(true);
</script>

<div id="spt-panel-l-3a-4" role="tabpanel" hidden={currentTab !== 'L-3A-4'}>
	<Stack gap="0">
		<DisclosureItem title="A. Penghasilan Neto Dalam Negeri dari Usaha dan/atau Pekerjaan Bebas Berdasarkan Pencatatan" bind:open={sectionAOpen}>
			<A {namaUsaha} {jenisUsahaPekerjaanBebas} peredaranBruto={peredaranBrutoNorma} bind:normaPersen dapatDiubah={normaAktif} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="B. Penghasilan Neto Dalam Negeri Lainnya" bind:open={sectionBOpen}>
			<B bind:rows={lainnya} {referensi} {kodeReferensi} dapatDiubah={Boolean(b1cPenghasilanDalamNegeriLainnya)} {readonly} />
		</DisclosureItem>
	</Stack>
</div>
