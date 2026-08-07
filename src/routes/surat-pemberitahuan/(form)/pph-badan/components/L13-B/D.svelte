<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
</script>

<div class="tw:p-5">
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-[40rem] tw:text-sm">1. JUMLAH TAMBAHAN PENGURANG PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN</span>
        <div class="tw:flex tw:flex-row tw:items-center">
            <span class="tw:flex tw:items-center tw:bg-(--color-disabled) tw:h-[2.5rem] tw:px-3 tw:rounded-s-sm tw:border-1 tw:border-(--color-input-secondary)">Rp.</span>
            <Input class={"tw:w-[20rem]! tw:border-s-0 tw:rounded-s-none! tw:text-right"} type={"text"} value={0.00} readonly/>
        </div>
    </Label>
</div>