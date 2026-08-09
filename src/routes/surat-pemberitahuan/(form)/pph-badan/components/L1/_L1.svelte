<script lang="ts">
	import Accordion from '$lib/components/AccordionItem.svelte';
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
		kodePenyesuaianFiskal: string;
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
		kodeKoreksiFiskalOptions: { value: string; label: string }[];
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

	let editing = $state<any>({});

	function openModal(row: any) {
		editing = { ...row };
	}

	function saveItem() {
		const index = labaRugi.findIndex((item) => item.akunId === editing.akunId);
		if (index === -1) return;

		labaRugi[index] = {
			...labaRugi[index],
			nilaiKomersial: Number(editing.nilaiKomersial) || 0,
			nonObjekPajak: Number(editing.nonObjekPajak) || 0,
			dikenakanPphFinal: Number(editing.dikenakanPphFinal) || 0,
			penyesuaianFiskalPositif: Number(editing.penyesuaianFiskalPositif) || 0,
			penyesuaianFiskalNegatif: Number(editing.penyesuaianFiskalNegatif) || 0,
			kodePenyesuaianFiskal: editing.kodePenyesuaianFiskal ?? ''
		};
	}
</script>

<div class="{currentTab.tab === 'L1' ? '' : 'tw:hidden'}">
	<div class="accordion tw:mt-5">
		<Accordion item="A. TRANSKRIP LAPORAN LABA RUGI">
			<A {sektorUsaha} {templatesBySektor} bind:labaRugi {readonly} {openModal} />
		</Accordion>
		<Accordion item="B. TRANSKRIP NERACA">
			<B {sektorUsaha} {neracaTemplatesBySektor} bind:neraca {readonly} />
		</Accordion>
	</div>
</div>

<ModalEditLabaRugi bind:data={editing} {saveItem} {kodeKoreksiFiskalOptions} />
