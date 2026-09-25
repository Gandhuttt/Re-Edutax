<script lang="ts">
	import { DisclosureItem, Stack } from "$lib/re-ui-components";
	import ModalEditA from "./_ModalEditA.svelte";
	import ModalEditB from "./_ModalEditB.svelte";
	import A from "./A.svelte";
	import B from "./B.svelte";

	type Bulanan = {
		bulan: number;
		jumlahPeredaranBruto: number;
	};

	type Tku = {
		id: string | number;
		nitku: string;
		nama: string;
		alamat: string;
		kelurahan: string;
		kecamatan: string;
		kabupaten: string;
		provinsi: string;
		bulanan: Bulanan[];
	};

	function emptyBulanan(): Bulanan[] {
		return Array.from({ length: 12 }, (_, i) => ({
			bulan: i + 1,
			jumlahPeredaranBruto: 0
		}));
	}

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		l5a: Tku[];
		l5bDipotong: Array<{ bulan: number; nilai: number }>;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		l5a = $bindable(),
		l5bDipotong = $bindable(),
		readonly = false
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L5" ? "REKAPITULASI PEREDARAN BRUTO" : currentTab.title;
	});

	let editingA = $state<Partial<Tku>>({});
	let modalAOpen = $state(false);

	function openModalA(item: unknown) {
		editingA = item ? { ...(item as Tku) } : {};
		modalAOpen = true;
	}

	function saveItemA() {
		const index = l5a.findIndex((i) => i.id === editingA.id);
		if (index !== -1) {
			l5a[index] = { ...l5a[index], ...editingA } as Tku;
		} else {
			l5a.push({
				id: Date.now(),
				nitku: '',
				nama: '',
				alamat: '',
				kelurahan: '',
				kecamatan: '',
				kabupaten: '',
				provinsi: '',
				...editingA,
				bulanan: emptyBulanan()
			} as Tku);
		}
		modalAOpen = false;
	}

	function deleteItemA(id: string | number) {
		l5a = l5a.filter((item) => item.id !== id);
	}

	let editingB = $state<{ tkuId: string | number; nama: string; bulanan: Bulanan[] }>({
		tkuId: '',
		nama: '',
		bulanan: emptyBulanan()
	});
	let modalBOpen = $state(false);

	function openModalB(item: unknown) {
		const tku = item as Tku;
		editingB = {
			tkuId: tku.id,
			nama: tku.nama,
			bulanan: tku.bulanan.map((b) => ({ ...b }))
		};
		modalBOpen = true;
	}

	function saveItemB() {
		const index = l5a.findIndex((i) => i.id === editingB.tkuId);
		if (index !== -1) {
			l5a[index].bulanan = editingB.bulanan.map((b) => ({ ...b }));
		}
		modalBOpen = false;
	}
</script>

<div id="spt-panel-l5" role="tabpanel" hidden={currentTab.tab !== "L5"}>
	<Stack gap="14px">
		<DisclosureItem title="A. ALAMAT TEMPAT KEGIATAN USAHA:">
			<A data={l5a} openModal={openModalA} deleteItem={deleteItemA} />
		</DisclosureItem>
		<DisclosureItem title="B. REKAPITULASI PEREDARAN BRUTO DAN PPh YANG TELAH DIBAYAR:">
			<B data={l5a} bind:dipotongBulanan={l5bDipotong} openModal={openModalB} />
		</DisclosureItem>
	</Stack>
</div>

<ModalEditA bind:open={modalAOpen} bind:data={editingA as any} saveItem={saveItemA} />
<ModalEditB bind:open={modalBOpen} bind:data={editingB} saveItem={saveItemB} />
