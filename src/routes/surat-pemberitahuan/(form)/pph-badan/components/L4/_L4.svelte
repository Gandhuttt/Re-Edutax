<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import ModalEditA from "./_ModalEditA.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        };
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
        readonly?: boolean;
        objekPajakOptions: { value: string; label: string }[];
    }

    let {
        currentTab = $bindable(),
        l4a: penghasilanFinal = $bindable(),
        readonly = false,
        objekPajakOptions
    }: Props = $props();

    $effect(() => {currentTab.title = currentTab.tab === "L4" ? "PENGHASILAN YANG DIKENAKAN PAJAK FINAL DAN DAFTAR PENGHASILAN YANG BUKAN OBJEK PAJAK" : currentTab.title})

    let editingA = $state<any>({});

    function openModalA(item: any) {
        editingA = item ? { ...item } : {};
    }

    function saveItemA() {
        const index = penghasilanFinal.findIndex(i => i.id === editingA.id);
        if (index !== -1) {
            penghasilanFinal[index] = { ...editingA };
        } else {
            penghasilanFinal.push({ ...editingA, id: Date.now() });
        }
    }

    function deleteItemA(id: string | number) {
        penghasilanFinal = penghasilanFinal.filter(item => item.id !== id);
    }
</script>

<div class="{currentTab.tab === "L4" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. PENGHASILAN YANG DIKENAKAN PPh YANG BERSIFAT FINAL"}>
            <A data={penghasilanFinal} openModal={openModalA} deleteItem={deleteItemA} {objekPajakOptions}></A>
        </Accordion>
        <Accordion item={"B. PENGHASILAN YANG TIDAK TERMASUK OBJEK PAJAK"}>
            <B></B>
        </Accordion>
    </div>
</div>

<ModalEditA bind:data={editingA} saveItem={saveItemA} {objekPajakOptions} />