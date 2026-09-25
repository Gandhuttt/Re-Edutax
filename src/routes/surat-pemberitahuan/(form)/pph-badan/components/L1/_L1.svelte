<script lang="ts">
	import { DisclosureItem, Stack } from '$lib/re-ui-components';
	import type { LabaRugiAkunTemplate } from './labaRugiRollup';
	import type { NeracaAkunTemplate } from './neracaRollup';
	import ModalEditLabaRugi from './_ModalEditLabaRugi.svelte';
	import A from './A.svelte';
	import B from './B.svelte';

	interface LabaRugiLeaf {
		id?: string;
		akunId: string;
		nilaiKomersial: number;
		nonObjekPajak: number;
		dikenakanPphFinal: number;
		penyesuaianFiskalPositif: number;
		penyesuaianFiskalNegatif: number;
		kodePenyesuaianFiskal: string[];
	}

	interface NeracaLeaf {
		id?: string;
		akunId: string;
		nilai: number;
	}

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		sektorUsaha: string;
		templatesBySektor: Map<string, { lampiranKode: string | null; rows: LabaRugiAkunTemplate[] }>;
		labaRugi: LabaRugiLeaf[];
		neracaTemplatesBySektor: Map<string, { rows: NeracaAkunTemplate[] }>;
		neraca: NeracaLeaf[];
		readonly?: boolean;
		kodeKoreksiFiskalOptions: { value: string; label: string; group?: string }[];
	}

	let {
		currentTab = $bindable(),
		sektorUsaha,
		templatesBySektor,
		labaRugi = $bindable(),
		neracaTemplatesBySektor,
		neraca = $bindable(),
		readonly = false,
		kodeKoreksiFiskalOptions
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === 'L1' ? 'TRANSKRIP LAPORAN LABA RUGI DAN NERACA' : currentTab.title;
	});

	let editing = $state<any>({ kodePenyesuaianFiskal: [] });
	let modalOpen = $state(false);

	function openModal(row: any) {
		editing = { ...row };
		modalOpen = true;
	}

	function saveItem() {
		const index = labaRugi.findIndex((item) => item.akunId === editing.akunId);
		if (index !== -1) {
			labaRugi[index] = {
				...labaRugi[index],
				nilaiKomersial: Number(editing.nilaiKomersial) || 0,
				nonObjekPajak: Number(editing.nonObjekPajak) || 0,
				dikenakanPphFinal: Number(editing.dikenakanPphFinal) || 0,
				penyesuaianFiskalPositif: Number(editing.penyesuaianFiskalPositif) || 0,
				penyesuaianFiskalNegatif: Number(editing.penyesuaianFiskalNegatif) || 0,
				kodePenyesuaianFiskal: editing.kodePenyesuaianFiskal ?? []
			};
		}
		modalOpen = false;
	}
</script>

<section id="l1" class={currentTab.tab === 'L1' ? '' : 'tw:hidden'}>
	<Stack gap="12px">
		<DisclosureItem title="A. TRANSKRIP LAPORAN LABA RUGI" open>
			<A {sektorUsaha} {templatesBySektor} bind:labaRugi {readonly} {openModal} />
		</DisclosureItem>
		<DisclosureItem title="B. TRANSKRIP NERACA">
			<B {sektorUsaha} {neracaTemplatesBySektor} bind:neraca {readonly} />
		</DisclosureItem>
	</Stack>
</section>

<ModalEditLabaRugi
	bind:open={modalOpen}
	bind:data={editing}
	{saveItem}
	{kodeKoreksiFiskalOptions}
/>
