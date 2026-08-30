<script lang="ts">
	import Accordion from "$lib/components/AccordionItem.svelte";
    import ModalEditA from "./_ModalEditA.svelte";
    import ModalEditB from "./_ModalEditB.svelte";
    import ModalImportEbupotB from "./_ModalImportEbupotB.svelte";
	import A from "./A.svelte";
    import B from "./B.svelte";
    import { listBuktiPotongBpuForImport } from "./listBuktiPotongBpuForImport.remote";

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
            sumberBuktiPotongJenis?: 'BPU' | 'BP21' | 'BP26' | 'BPA1' | 'BPA2' | 'MP' | null;
            sumberBuktiPotongId?: string | null;
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

    // "Impor dari eBupot" -- pulls in already-issued BPU withholding slips
    // this taxpayer received (as recipient) instead of retyping every
    // field. Nothing is written to the database here: imported rows are
    // appended to the same bound pphDipotong array Tambah pushes into, and
    // only persist when the user clicks the SPT form's own Simpan Konsep,
    // same as every other row on this grid.
    //
    // jenis_pajak_dipotong_dipungut_spt_pph_badan only has rows for Pasal
    // 15/22/23/26 (no Pasal 4(2) -- final tax isn't creditable here, see
    // listBuktiPotongBpuForImport.remote.ts), so the map only needs to
    // cover those four.
    const pasalKeKodeJenisPajak: Record<string, string> = {
        'Pasal 15': 'pph_pasal_15',
        'Pasal 22': 'pph_pasal_22',
        'Pasal 23': 'pph_pasal_23',
        'Pasal 26': 'pph_pasal_26'
    };

    let calonImporB = $state<Awaited<ReturnType<typeof listBuktiPotongBpuForImport>>>([]);
    let mengambilImporB = $state(false);

    async function bukaImportB() {
        mengambilImporB = true;
        try {
            const sudahDiimpor = new Set(pphDipotong.map((r) => r.sumberBuktiPotongId).filter(Boolean));
            const semua = await listBuktiPotongBpuForImport();
            calonImporB = semua.filter((row) => !sudahDiimpor.has(row.id));
        } finally {
            mengambilImporB = false;
        }
    }

    function simpanImporB(dipilih: string[]) {
        const terpilih = calonImporB.filter((row) => dipilih.includes(row.id));
        const baris = terpilih
            .map((row) => {
                const kode = row.pasal ? pasalKeKodeJenisPajak[row.pasal] : undefined;
                if (!kode) return null;
                return {
                    id: `import-${row.id}`,
                    namaPemotongPemungut: row.namaPemotong,
                    npwp: row.npwpPemotong,
                    jenisPajak: kode,
                    dpp: row.dasarPengenaanPajak,
                    pph: row.pajakPenghasilan,
                    nomorBukti: row.nomorPemotongan ?? '',
                    tanggalBukti: row.tanggalDokumen ?? '',
                    sumberBuktiPotongJenis: 'BPU' as const,
                    sumberBuktiPotongId: row.id
                };
            })
            .filter((row) => row !== null);
        pphDipotong = [...pphDipotong, ...baris];
    }
</script>

<div class="{currentTab.tab === "L3" ? "" : "tw:hidden"}">
    <div class="accordion tw:mt-5">
        <Accordion item={"A. PENGHASILAN DARI LUAR NEGERI"}>
            <A data={penghasilanLuarNegeri} openModal={openModalA} deleteItem={deleteItemA} bind:pengembalianPengurangan={l3aPengembalianPengurangan}></A>
        </Accordion>
        <Accordion item={"B. PPh YANG DIPOTONG/DIPUNGUT PIHAK LAIN"}>
            <B data={pphDipotong} openModal={openModalB} deleteItem={deleteItemB} openImportModal={bukaImportB} kreditPajakLuarNegeri={jumlahKreditPajakLuarNegeriDapatDiperhitungkan}></B>
        </Accordion>
    </div>
</div>

<ModalEditA bind:data={editingA} saveItem={saveItemA} {negaraOptions} {jenisPenghasilanOptions} {mataUangOptions} />
<ModalEditB bind:data={editingB} saveItem={saveItemB} {jenisPajakOptions} />
<ModalImportEbupotB calon={calonImporB} mengambil={mengambilImporB} simpanImpor={simpanImporB} />
