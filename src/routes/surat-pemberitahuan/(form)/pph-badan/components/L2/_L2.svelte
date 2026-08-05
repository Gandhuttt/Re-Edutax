<script lang="ts">
	import Accordion from "$lib/components/AccordionItem.svelte";
    import ModalEditA from "./_ModalEditA.svelte";
    import ModalEditB from "./_ModalEditB.svelte";
	import A from "./A.svelte";
    import B from "./B.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
        l2a: Array<{
            id: string | number;
            nama: string;
            alamat: string;
            negara: string;
            npwp: string;
            jabatan: string;
            nilaiModal: number;
            persentase: number;
            dividen: number;
        }>;
        l2b: Array<{
            id: string | number;
            nama: string;
            negara: string;
            npwp: string;
            modalNilai: number;
            modalPersen: number;
            utangNilai: number;
            utangTahun: number;
            utangBunga: number;
            piutangNilai: number;
            piutangTahun: number;
            piutangBunga: number;
        }>;
        readonly?: boolean;
        negaraOptions: { value: string; label: string }[];
    }

    let {
        currentTab = $bindable(),
        l2a: pemegangSaham = $bindable(),
        l2b: penyertaanModal = $bindable(),
        readonly = false,
        negaraOptions
    }: Props = $props();
    $effect(() => {currentTab.title = currentTab.tab === "L2" ? "DAFTAR KEPEMILIKAN" : ''});

    let editingA = $state<any>({});
    let editingB = $state<any>({});

    function openModalA(item: any) {
        editingA = item ? { ...item } : {};
    }

    function openModalB(item: any) {
        editingB = item ? { ...item } : {};
    }

    function saveItemA() {
        const index = pemegangSaham.findIndex(i => i.id === editingA.id);
        if (index !== -1) {
            pemegangSaham[index] = { ...editingA };
        } else {
            pemegangSaham.push({ ...editingA, id: Date.now() });
        }
    }

    function saveItemB() {
        const index = penyertaanModal.findIndex(i => i.id === editingB.id);
        if (index !== -1) {
            penyertaanModal[index] = { ...editingB };
        } else {
            penyertaanModal.push({ ...editingB, id: Date.now() });
        }
    }

    function deleteItemA(id: string | number) {
        pemegangSaham = pemegangSaham.filter(item => item.id !== id);
    }

    function deleteItemB(id: string | number) {
        penyertaanModal = penyertaanModal.filter(item => item.id !== id);
    }
</script>

<div class="{currentTab.tab === "L2" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. DAFTAR PEMEGANG SAHAM/PEMILIK MODAL DAN JUMLAH DIVIDE/ PEMBAGIAN LABA YANG DIBAGIKAN SERTA DAFTAR SUSUNAN PENGURUS DAN KOMISARIS"}>
            <A data={pemegangSaham} openModal={openModalA} deleteItem={deleteItemA}></A>
        </Accordion>
        <Accordion item={"B. DAFTAR PENYERTAAN MODAL, UTANG, DAN/ATAU PIUTANG PADA PERUSAHAAN AFILIASI"}>
            <B data={penyertaanModal} openModal={openModalB} deleteItem={deleteItemB}></B>
        </Accordion>
    </div>
</div>

<ModalEditA bind:data={editingA} saveItem={saveItemA} {negaraOptions} />
<ModalEditB bind:data={editingB} saveItem={saveItemB} {negaraOptions} />
