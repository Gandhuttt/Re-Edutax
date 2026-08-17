<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import B from "./B.svelte";
    import type { BarisLainnya } from "./types";

    interface Props {
        currentTab: string;
        referensi: Record<string, string[]>;
        lainnya: BarisLainnya[];
        b1cPenghasilanDalamNegeriLainnya: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        lainnya = $bindable(),
        b1cPenghasilanDalamNegeriLainnya,
        readonly = false
    }: Props = $props();
</script>

<div class="{currentTab === 'L-3A-4' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN PENCATATAN"}>
            <div class="tw:p-5">
                <!-- The Norma calculation. Never capturable on the live form
                     (see L3B.md), so it is not implemented: only the
                     instruction line is shown. -->
                <p class="tw:text-sm tw:italic">
                    Wajib Pajak yang menyelenggarakan pencatatan wajib mengisi Lampiran 3B
                    untuk menyampaikan rincian penghasilan bruto. Bagian ini belum
                    diimplementasikan.
                </p>
            </div>
        </Accordion>
        <Accordion item={"B. PENGHASILAN NETO DALAM NEGERI LAINNYA"}>
            <div class="tw:p-5">
                <B
                    bind:rows={lainnya}
                    {referensi}
                    dapatDiubah={Boolean(b1cPenghasilanDalamNegeriLainnya)}
                    {readonly}
                />
            </div>
        </Accordion>
    </div>
</div>
