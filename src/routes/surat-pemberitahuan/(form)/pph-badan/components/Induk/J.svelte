<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { getContext } from "svelte";

    let isAgree = $state(false);
    let penandatangan = $state();
</script>

<div class="tw:flex tw:flex-col tw:p-5">

    <!-- Persetujuan -->
    <Label class={"tw:flex! tw:items-center tw:gap-2 tw:mb-5"} for={getContext("id")}>
        <Input type={"checkbox"} bind:checked={isAgree} required/>
        <span>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas.</span>
    </Label>

    <!-- Tanda Tangan -->
    <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:flex tw:flex-row tw:w-full tw:h-10">
            <span class="tw:flex tw:w-[20rem]">Penandatangan*</span>
            <div class="tw:flex tw:w-full tw:gap-5">
                <Label for={getContext("id")}>
                    <Input type={"radio"} name={"penandatangan"} bind:group={penandatangan} disabled={!isAgree} required/>
                    <span>Wajib Pajak</span>
                </Label>
                <Label for={getContext("id")}>
                    <Input type={"radio"} name={"penandatangan"} bind:group={penandatangan} disabled={!isAgree} required/>
                    <span>Kuasa Wajib Pajak</span>
                </Label>
            </div>
        </div>
        <Label class={"tw:flex! tw:flex-row tw:w-full tw:h-10 tw:items-center"}>
            <span class="tw:flex tw:w-[20rem]">Tanda Tangan</span>
        </Label>
        <Label class={"tw:flex! tw:flex-row tw:w-full tw:h-10 tw:items-center"}>
            <span class="tw:flex tw:w-[20rem]">NPWP</span>
            <Input type={"text"} readonly></Input>
        </Label>
        <Label class={"tw:flex! tw:flex-row tw:w-full tw:h-10 tw:items-center"}>
            <span class="tw:flex tw:w-[20rem]">Nama</span>
            <Input type={"text"} readonly></Input>
        </Label>
        <Label class={"tw:flex! tw:flex-row tw:w-full tw:h-10 tw:items-center"}>
            <span class="tw:flex tw:w-[20rem]">Jabatan</span>
            <Input type={"text"}></Input>
        </Label>
    </div>
</div>

<style>
    span {
        font-size: .8rem;
    }
</style>