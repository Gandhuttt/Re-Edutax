<script lang="ts">
	import Accordion from "$lib/components/AccordionItem.svelte";
    import ModalEdit from "./_ModalEdit.svelte";
	import A from "./A.svelte";
    import B from "./B.svelte";

    interface Props {
        currentTab: {
            tab: string;
            title: string;
        }
    }

    const { currentTab = $bindable() }: Props = $props();
    $effect(() => {currentTab.title = currentTab.tab === "L2" ? "DAFTAR KEPEMILIKAN" : ''});

    // State for A
    let pemegangSaham = $state([
        { id: 1, nama: 'PEMEGANG SAHAM SATU', alamat: 'JL. JALAN SATU', negara: 'INDONESIA', npwp: '330000000000010100000000000000', jabatan: 'DIREKTUR', nilaiModal: 0, persentase: 0, dividen: 0 }
    ]);

    // State for B
    let penyertaanModal = $state([
        { id: 130, nama: 'PLACEHOLDER', negara: 'PLACEHOLDER', npwp: '3300000000000101', modalNilai: 0, modalPersen: 0, utangNilai: 0, utangTahun: 0, utangBunga: 0, piutangNilai: 0, piutangTahun: 0, piutangBunga: 0 }
    ]);

    let editingItem = $state({
        type: 'A', // or 'B'
        data: {} as any
    });

    function openModal(type: 'A' | 'B', item: any) {
        editingItem.type = type;
        editingItem.data = item ? { ...item } : {};
    }

    function saveItem() {
        if (editingItem.type === 'A') {
            const index = pemegangSaham.findIndex(i => i.id === editingItem.data.id);
            if (index !== -1) {
                pemegangSaham[index] = { ...editingItem.data };
            } else {
                pemegangSaham.push({ ...editingItem.data, id: Date.now() });
            }
        }
        // Similar logic for B can be added later
    }
</script>

<div class="{currentTab.tab === "L2" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. DAFTAR PEMEGANG SAHAM/PEMILIK MODAL DAN JUMLAH DIVIDE/ PEMBAGIAN LABA YANG DIBAGIKAN SERTA DAFTAR SUSUNAN PENGURUS DAN KOMISARIS"}>
            <A data={pemegangSaham} {openModal}></A>
        </Accordion>
        <Accordion item={"B. DAFTAR PENYERTAAN MODAL, UTANG, DAN/ATAU PIUTANG PADA PERUSAHAAN AFILIASI"}>
            <B data={penyertaanModal} {openModal}></B>
        </Accordion>
    </div>
</div>

<ModalEdit bind:data={editingItem.data} {saveItem} />