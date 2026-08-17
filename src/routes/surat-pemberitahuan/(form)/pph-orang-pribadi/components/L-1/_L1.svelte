<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
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

    interface Props {
        currentTab: string;
        referensi: Record<string, string[]>;
        harta: Harta;
        utang: BarisUtang[];
        keluarga: BarisKeluarga[];
        pekerjaan: BarisPekerjaan[];
        buktiPotong: BarisBuktiPotong[];
        // Imported into Bagian E's footer from L-2 C.
        kreditPajakLuarNegeri: number;
        // Grid editability tracks the Induk answer that routes to it. A grid can
        // be present but read-only, which is a different state from absent.
        i14bMemilikiUtang: boolean | undefined;
        b1aPenghasilanPekerjaan: boolean | undefined;
        d10aAdaPphDipotongPihakLain: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        harta = $bindable(),
        utang = $bindable(),
        keluarga,
        pekerjaan = $bindable(),
        buktiPotong = $bindable(),
        kreditPajakLuarNegeri,
        i14bMemilikiUtang,
        b1aPenghasilanPekerjaan,
        d10aAdaPphDipotongPihakLain,
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-1' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. HARTA PADA AKHIR TAHUN PAJAK"}>
            <div class="tw:p-5">
                <A1 bind:rows={harta.a1} {referensi} {readonly} />
                <A2 bind:rows={harta.a2} {referensi} {readonly} />
                <A3 bind:rows={harta.a3} {referensi} {readonly} />
                <A4 bind:rows={harta.a4} {referensi} {readonly} />
                <A5 bind:rows={harta.a5} {referensi} {readonly} />
                <A6 bind:rows={harta.a6} {referensi} {readonly} />
                <A7 {harta} />
            </div>
        </Accordion>
        <Accordion item={"B. UTANG PADA AKHIR TAHUN PAJAK"}>
            <div class="tw:p-5">
                <B bind:rows={utang} {referensi} dapatDiubah={Boolean(i14bMemilikiUtang)} {readonly} />
            </div>
        </Accordion>
        <Accordion item={"C. DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN"}>
            <div class="tw:p-5">
                <C rows={keluarga} />
            </div>
        </Accordion>
        <Accordion item={"D. PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN"}>
            <div class="tw:p-5">
                <D bind:rows={pekerjaan} {referensi} dapatDiubah={Boolean(b1aPenghasilanPekerjaan)} {readonly} />
            </div>
        </Accordion>
        <Accordion item={"E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh"}>
            <div class="tw:p-5">
                <E
                    bind:rows={buktiPotong}
                    {referensi}
                    {kreditPajakLuarNegeri}
                    dapatDiubah={Boolean(d10aAdaPphDipotongPihakLain)}
                    {readonly}
                />
            </div>
        </Accordion>
    </div>
</div>
