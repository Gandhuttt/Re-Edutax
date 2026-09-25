<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import A1 from "./A1.svelte";
	import A2 from "./A2.svelte";
	import A3 from "./A3.svelte";
	import A4 from "./A4.svelte";
	import A5 from "./A5.svelte";
	import A6 from "./A6.svelte";
	import A7 from "./A7.svelte";
	import B from "./B.svelte";
	import C from "./C.svelte";
	import D from "./D.svelte";
	import E from "./E.svelte";
	import type { BarisBuktiPotong, BarisKeluarga, BarisPekerjaan, BarisUtang, Harta } from "./types";
	import type { DaftarReferensi, KodeReferensi } from "../referensi";

	interface Props {
		currentTab: string;
		referensi: DaftarReferensi;
		kodeReferensi: KodeReferensi;
		harta: Harta;
		utang: BarisUtang[];
		keluarga: BarisKeluarga[];
		pekerjaan: BarisPekerjaan[];
		buktiPotong: BarisBuktiPotong[];
		kreditPajakLuarNegeri: number;
		i14bMemilikiUtang: boolean | undefined;
		b1aPenghasilanPekerjaan: boolean | undefined;
		d10aAdaPphDipotongPihakLain: boolean | undefined;
		readonly?: boolean;
	}

	let {
		currentTab,
		referensi,
		kodeReferensi,
		harta = $bindable(),
		utang = $bindable(),
		keluarga = $bindable(),
		pekerjaan = $bindable(),
		buktiPotong = $bindable(),
		kreditPajakLuarNegeri,
		i14bMemilikiUtang,
		b1aPenghasilanPekerjaan,
		d10aAdaPphDipotongPihakLain,
		readonly = false
	}: Props = $props();
</script>

<div class:hidden={currentTab !== "L-1"}>
	<Stack gap="0">
		<DisclosureItem title="A. HARTA PADA AKHIR TAHUN PAJAK">
			<Stack gap="20px">
				<A1 bind:rows={harta.a1} {referensi} {kodeReferensi} {readonly} />
				<A2 bind:rows={harta.a2} {referensi} {kodeReferensi} {readonly} />
				<A3 bind:rows={harta.a3} {referensi} {kodeReferensi} {readonly} />
				<A4 bind:rows={harta.a4} {referensi} {kodeReferensi} {readonly} />
				<A5 bind:rows={harta.a5} {referensi} {kodeReferensi} {readonly} />
				<A6 bind:rows={harta.a6} {referensi} {kodeReferensi} {readonly} />
				<A7 {harta} />
			</Stack>
		</DisclosureItem>
		<DisclosureItem title="B. UTANG PADA AKHIR TAHUN PAJAK">
			<B bind:rows={utang} {referensi} {kodeReferensi} dapatDiubah={Boolean(i14bMemilikiUtang)} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="C. DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN">
			<C bind:rows={keluarga} {referensi} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="D. PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN">
			<D bind:rows={pekerjaan} {referensi} dapatDiubah={Boolean(b1aPenghasilanPekerjaan)} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh">
			<E
				bind:rows={buktiPotong}
				{referensi}
				{kreditPajakLuarNegeri}
				dapatDiubah={Boolean(d10aAdaPphDipotongPihakLain)}
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
