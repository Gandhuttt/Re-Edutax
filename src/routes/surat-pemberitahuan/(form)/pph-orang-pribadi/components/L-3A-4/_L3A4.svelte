<script lang="ts">
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
    <h3 class="tw:text-lg">A. PENGHASILAN NETO DALAM NEGERI DARI USAHA DAN/ATAU PEKERJAAN BEBAS BERDASARKAN PENCATATAN</h3>
    <!-- The Norma calculation. Never capturable on the live form (see L3B.md),
         so it is not implemented: only the instruction line is shown. -->
    <p class="tw:mb-6 tw:text-sm tw:italic">
        Wajib Pajak yang menyelenggarakan pencatatan wajib mengisi Lampiran 3B
        untuk menyampaikan rincian penghasilan bruto. Bagian ini belum
        diimplementasikan.
    </p>

    <h3 class="tw:text-lg">B. PENGHASILAN NETO DALAM NEGERI LAINNYA</h3>
    <B
        bind:rows={lainnya}
        {referensi}
        dapatDiubah={Boolean(b1cPenghasilanDalamNegeriLainnya)}
        {readonly}
    />
</div>

<style>
    h3 {
        margin: 1rem 0 0.5rem;
    }
</style>
