<script lang="ts">
	import { DisclosureItem, Stack } from '$lib/re-ui-components';
	import A from './A.svelte';
	import A2 from './A2.svelte';
	import Footer from './Footer.svelte';
	import type { BarisLabaRugi, BarisNeraca, FooterL3A, KodeKoreksiFiskal, Sektor } from './types';

	interface AkunRow { id: string; kode: string | null; namaAkun: string; rowType: 'header' | 'data' | 'sum'; classification: 'income' | 'expense' | null; parentKode: string | null; sign: number | null; }
	interface NeracaAkunRow { id: string; kode: string | null; namaAkun: string; rowType: 'header' | 'data' | 'sum'; section: 'aset' | 'liabilitas_ekuitas'; parentKode: string | null; sign: number | null; }
	interface Props {
		currentTab: string;
		sektor: Sektor | null | undefined;
		akunPerSektor: Record<Sektor, AkunRow[]>;
		neracaAkunPerSektor: Record<Sektor, NeracaAkunRow[]>;
		labaRugi: BarisLabaRugi[];
		neraca: BarisNeraca[];
		footer: FooterL3A;
		kodeKoreksiFiskal: KodeKoreksiFiskal[];
		readonly?: boolean;
	}
	let { currentTab, sektor, akunPerSektor, neracaAkunPerSektor, labaRugi = $bindable(), neraca = $bindable(), footer = $bindable(), kodeKoreksiFiskal, readonly = false }: Props = $props();
	const TAB_BY_SEKTOR: Record<Sektor, string> = { dagang: 'L-3A-1', jasa: 'L-3A-2', industri: 'L-3A-3' };
	const JUDUL: Record<Sektor, string> = { dagang: 'DAGANG', jasa: 'JASA', industri: 'INDUSTRI' };
	let tabTerkini = $derived(sektor ? TAB_BY_SEKTOR[sektor] : null);
	let sectionOpen = $state(true);
</script>

{#if sektor}
	<div id={`spt-panel-${tabTerkini?.toLowerCase()}`} role="tabpanel" hidden={currentTab !== tabTerkini}>
		<Stack gap="12px">
			<h3>Rekonsiliasi Laporan Keuangan ({JUDUL[sektor]})</h3>
			<DisclosureItem title="A. Penghasilan Neto dari Usaha dan/atau Pekerjaan Bebas Berdasarkan Laporan Keuangan" bind:open={sectionOpen}>
				<Stack gap="24px">
					<A akun={akunPerSektor[sektor]} bind:labaRugi {kodeKoreksiFiskal} {readonly} />
					<A2 akun={neracaAkunPerSektor[sektor]} bind:neraca {readonly} />
					<Footer bind:footer {readonly} />
				</Stack>
			</DisclosureItem>
		</Stack>
	</div>
{/if}

<style>h3 { margin: 1rem 0 0.5rem; color: var(--ui-navy); font-family: var(--ui-font-display); font-size: 18px; }</style>
