<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import type { BarisLainnya } from "./types";
    import type { DaftarReferensi, KodeReferensi } from "../referensi";

    interface Props {
        currentTab: string;
        referensi: DaftarReferensi;
        kodeReferensi: KodeReferensi;
        lainnya: BarisLainnya[];
        b1cPenghasilanDalamNegeriLainnya: boolean | undefined;
        // Bagian A (Norma). Nama/jenis/bruto are derived from L-3B Bagian C;
        // only normaPersen is typed, and it persists on the L-3B TKU registry
        // row. Gated on 1.b.3 = Norma, independently of 1.c above.
        normaAktif: boolean;
        namaUsaha: string;
        jenisUsahaPekerjaanBebas: string;
        peredaranBrutoNorma: number;
        normaPersen: number;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        kodeReferensi,
        lainnya = $bindable(),
        b1cPenghasilanDalamNegeriLainnya,
        normaAktif,
        namaUsaha,
        jenisUsahaPekerjaanBebas,
        peredaranBrutoNorma,
        normaPersen = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-3A-4' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN PENCATATAN"}>
            <div class="tw:p-5">
                <A
                    {namaUsaha}
                    {jenisUsahaPekerjaanBebas}
                    peredaranBruto={peredaranBrutoNorma}
                    bind:normaPersen
                    dapatDiubah={normaAktif}
                    {readonly}
                />
            </div>
        </Accordion>
        <Accordion item={"B. PENGHASILAN NETO DALAM NEGERI LAINNYA"}>
            <div class="tw:p-5">
                <B
                    bind:rows={lainnya}
                    {referensi}
                    {kodeReferensi}
                    dapatDiubah={Boolean(b1cPenghasilanDalamNegeriLainnya)}
                    {readonly}
                />
            </div>
        </Accordion>
    </div>
</div>
