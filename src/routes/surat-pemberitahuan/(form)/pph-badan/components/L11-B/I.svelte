<script lang="ts">
    import InputGroup from "$lib/components/InputGroup.svelte";
</script>

<div class="tw:flex tw:flex-col tw:gap-10 tw:p-5">
    <div class="tw:w-full tw:flex tw:flex-col">
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">1. PENHGASILAN NETO KOMERSIAL</span>
            <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
        </div>
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">2. BEBAN PENYUSUTAN DAN AMORTISASI</span>
            <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
        </div>
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">3. BEBAN PAJAK PENGHASILAN</span>
            <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
        </div>
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">4. BEBAN BIAYA PINJAMAN</span>
            <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
        </div>
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">5. EBITDA</span>
            <InputGroup class={"tw:text-right"} type={"number"}>Rp.</InputGroup>
        </div>
        <div class="tw:flex tw:flex-row tw:items-center tw:gap-5 tw:p-1 tw:border-b-1 tw:border-(--color-disabled)">
            <span class="tw:block tw:w-[50rem]">6. EBITDA (25%)</span>
            <InputGroup class={"tw:text-right"} type={"number"} readonly>Rp.</InputGroup>
        </div>
    </div>
</div>