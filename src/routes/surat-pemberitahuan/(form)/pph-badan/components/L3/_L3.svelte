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
        l3a: Array<{
            id: string | number;
            namaPemberiPenghasilan: string;
            negara: string;
            tanggal: string;
            jenisPenghasilan: string;
            penghasilanNeto: number;
            pphLuarNegeri: number;
            mataUang: string;
            pphLuarNegeriMataUangAsing: number;
            kreditPajakYangDapatDikreditkan: number;
            keterangan: string;
        }>;
        l3aPengembalianPengurangan: number;
        l3b: Array<{
            id: string | number;
            namaPemotongPemungut: string;
            npwp: string;
            jenisPajak: string;
            dpp: number;
            pph: number;
            nomorBukti: string;
            tanggalBukti: string;
        }>;
        readonly?: boolean;
        negaraOptions: { value: string; label: string }[];
        jenisPenghasilanOptions: { value: string; label: string }[];
        mataUangOptions: { value: string; label: string }[];
        jenisPajakOptions: { value: string; label: string }[];
    }

    let {
        currentTab = $bindable(),
        l3a: penghasilanLuarNegeri = $bindable(),
        l3aPengembalianPengurangan = $bindable(),
        l3b: pphDipotong = $bindable(),
        readonly = false,
        negaraOptions,
        jenisPenghasilanOptions,
        mataUangOptions,
        jenisPajakOptions
    }: Props = $props();
    $effect(() => {currentTab.title = currentTab.tab === "L3" ? "DAFTAR PAJAK PENGHASILAN YANG DIPOTONG/ DIPUNGUT OLEH PIHAK LAIN" : currentTab.title});

    let totalKreditPajakLuarNegeri = $derived(
        penghasilanLuarNegeri.reduce((sum, item) => sum + Number(item.kreditPajakYangDapatDikreditkan || 0), 0)
    );
    let jumlahKreditPajakLuarNegeriDapatDiperhitungkan = $derived(
        totalKreditPajakLuarNegeri - Number(l3aPengembalianPengurangan || 0)
    );

    let editingA = $state<any>({});

    function openModalA(item: any) {
        editingA = item ? { ...item } : {};
    }

    function saveItemA() {
        const index = penghasilanLuarNegeri.findIndex(i => i.id === editingA.id);
        if (index !== -1) {
            penghasilanLuarNegeri[index] = { ...editingA };
        } else {
            penghasilanLuarNegeri.push({ ...editingA, id: Date.now() });
        }
    }

    function deleteItemA(id: string | number) {
        penghasilanLuarNegeri = penghasilanLuarNegeri.filter(item => item.id !== id);
    }

    let editingB = $state<any>({});

    function openModalB(item: any) {
        editingB = item ? { ...item } : {};
    }

    function saveItemB() {
        const index = pphDipotong.findIndex(i => i.id === editingB.id);
        if (index !== -1) {
            pphDipotong[index] = { ...editingB };
        } else {
            pphDipotong.push({ ...editingB, id: Date.now() });
        }
    }

    function deleteItemB(id: string | number) {
        pphDipotong = pphDipotong.filter(item => item.id !== id);
    }
</script>

<div class="{currentTab.tab === "L3" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. PENGHASILAN DARI LUAR NEGERI"}>
            <A data={penghasilanLuarNegeri} openModal={openModalA} deleteItem={deleteItemA} bind:pengembalianPengurangan={l3aPengembalianPengurangan}></A>
        </Accordion>
        <Accordion item={"B. PPh YANG DIPOTONG/DIPUNGUT PIHAK LAIN"}>
            <B data={pphDipotong} openModal={openModalB} deleteItem={deleteItemB} kreditPajakLuarNegeri={jumlahKreditPajakLuarNegeriDapatDiperhitungkan}></B>
        </Accordion>
    </div>
</div>

<ModalEditA bind:data={editingA} saveItem={saveItemA} {negaraOptions} {jenisPenghasilanOptions} {mataUangOptions} />
<ModalEditB bind:data={editingB} saveItem={saveItemB} {jenisPajakOptions} />
