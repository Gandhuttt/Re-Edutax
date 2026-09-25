<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import A from "./A.svelte";
	import B from "./B.svelte";
	import C from "./C.svelte";
	import D from "./D.svelte";
	import type { L13BARow, L13BBRow, L13BCRow } from "./types";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l13bA: L13BARow[];
		l13bB: L13BBRow[];
		l13bC: L13BCRow[];
		l13bDTermanfaatkanTahunSebelumnya: number;
		penghasilanKenaPajakSebelumFasilitas: number;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		l13bA = $bindable(),
		l13bB = $bindable(),
		l13bC = $bindable(),
		l13bDTermanfaatkanTahunSebelumnya = $bindable(),
		penghasilanKenaPajakSebelumFasilitas,
		readonly = false,
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L13-B"
			? "DAFTAR TAMBAHAN PENGURANGAN PENGHASILAN BRUTO"
			: currentTab.title;
	});

	const tambahanPengurangPerRow = (row: L13BCRow) =>
		Math.round((Number(row.jumlahBiaya || 0) * Number(row.persentaseFasilitasPajak || 0)) / 100);

	let jumlahTambahanPengurangLitbang = $derived(
		l13bC.reduce((sum, row) => sum + tambahanPengurangPerRow(row), 0),
	);
</script>

<div class:hidden={currentTab.tab !== "L13-B"}>
	<Stack gap="0" class="tw:mt-5">
		<DisclosureItem
			id="l13b-a"
			title="A. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETENSI TERTENTU"
			open
		>
			<A bind:data={l13bA} {readonly} />
		</DisclosureItem>
		<DisclosureItem
			id="l13b-b"
			title="B. REKAPITULASI BIAYA KEGIATAN PRAKTIK KERJA, PEMAGANGAN, DAN/ATAU PEMBELAJARAN DALAM RANGKA PEMBINAAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA BERBASIS KOMPETNESI TERTENTU"
			open
		>
			<B bind:data={l13bB} {readonly} />
		</DisclosureItem>
		<DisclosureItem
			id="l13b-c"
			title="C. DALAM HAL PERUSAHAAN MENDAPAT FASILITAS PENGURANGAN PENGHASILAN BRUTO UNTUK PENELITIAN DAN PENGEMBANGAN"
			open
		>
			<C bind:data={l13bC} {readonly} />
		</DisclosureItem>
		<DisclosureItem
			id="l13b-d"
			title="D. PENGHITUNGAN TAMBAHAN PENGURANG PENGHASILAN BRUTO"
			open
		>
			<D
				{jumlahTambahanPengurangLitbang}
				bind:termanfaatkanTahunSebelumnya={l13bDTermanfaatkanTahunSebelumnya}
				{penghasilanKenaPajakSebelumFasilitas}
				{readonly}
			/>
		</DisclosureItem>
	</Stack>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
