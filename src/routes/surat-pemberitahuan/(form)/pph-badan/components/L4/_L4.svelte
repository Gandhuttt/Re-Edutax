<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import ModalEditA from "./_ModalEditA.svelte";
	import ModalEditB from "./_ModalEditB.svelte";
	import A from "./A.svelte";
	import B from "./B.svelte";

	interface Props {
		currentTab: { tab: string; title: string };
		l4a: Array<{
			id: string | number;
			npwpPemotongPemungutPenyetor: string;
			namaPemotongPemungutPenyetor: string;
			objekPajak: string;
			dasarPengenaanPajak: number;
			tarif: number;
			pphFinalTerutang: number;
			nomorBuktiPotong: string;
			tanggalBuktiPotong: string;
			keterangan: string;
		}>;
		l4b: Array<{
			id: string | number;
			jenisPenghasilan: string;
			sumberPenghasilan: string;
			penghasilanBruto: number;
		}>;
		readonly?: boolean;
		objekPajakOptions: { value: string; label: string }[];
		jenisPenghasilanOptions: { value: string; label: string }[];
	}

	let {
		currentTab = $bindable(),
		l4a: penghasilanFinal = $bindable(),
		l4b: bukanObjekPajak = $bindable(),
		readonly = false,
		objekPajakOptions,
		jenisPenghasilanOptions
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L4"
			? "PENGHASILAN YANG DIKENAKAN PAJAK FINAL DAN DAFTAR PENGHASILAN YANG BUKAN OBJEK PAJAK"
			: currentTab.title;
	});

	let editingA = $state<any>({});
	let modalAOpen = $state(false);

	function openModalA(item: any) {
		editingA = item ? { ...item } : {};
		modalAOpen = true;
	}

	function saveItemA() {
		const index = penghasilanFinal.findIndex((item) => item.id === editingA.id);
		if (index !== -1) penghasilanFinal[index] = { ...editingA };
		else penghasilanFinal.push({ ...editingA, id: Date.now() });
	}

	function deleteItemA(id: string | number) {
		penghasilanFinal = penghasilanFinal.filter((item) => item.id !== id);
	}

	let editingB = $state<any>({});
	let modalBOpen = $state(false);

	function openModalB(item: any) {
		editingB = item ? { ...item } : {};
		modalBOpen = true;
	}

	function saveItemB() {
		const index = bukanObjekPajak.findIndex((item) => item.id === editingB.id);
		if (index !== -1) bukanObjekPajak[index] = { ...editingB };
		else bukanObjekPajak.push({ ...editingB, id: Date.now() });
	}

	function deleteItemB(id: string | number) {
		bukanObjekPajak = bukanObjekPajak.filter((item) => item.id !== id);
	}
</script>

<div id="spt-panel-l4" role="tabpanel" hidden={currentTab.tab !== "L4"}>
	<Stack gap="14px">
		<DisclosureItem title="A. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL">
			<A data={penghasilanFinal} openModal={openModalA} deleteItem={deleteItemA} {objekPajakOptions} {readonly} />
		</DisclosureItem>
		<DisclosureItem title="B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK">
			<B data={bukanObjekPajak} openModal={openModalB} deleteItem={deleteItemB} {jenisPenghasilanOptions} {readonly} />
		</DisclosureItem>
	</Stack>
</div>

<ModalEditA bind:open={modalAOpen} bind:data={editingA} saveItem={saveItemA} {objekPajakOptions} />
<ModalEditB bind:open={modalBOpen} bind:data={editingB} saveItem={saveItemB} {jenisPenghasilanOptions} />
