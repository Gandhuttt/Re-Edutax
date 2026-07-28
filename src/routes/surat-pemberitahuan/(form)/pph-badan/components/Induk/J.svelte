<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { getContext } from "svelte";
</script>

<div class="tw:flex tw:flex-col tw:p-5">
    <Label class={"tw:flex! tw:items-center tw:gap-2"}>
        <Input type={"checkbox"} id={getContext("id")}/>
        <span>Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas.</span>
    </Label>
    <div class="tw:flex tw:flex-row tw:w-fulls">
        <span class="tw:flex">Penandatangan*</span>
        <Label>
            <Input type={"radio"}/>
            <span>Wajib Pajak</span>
        </Label>
        <Label>
            <Input type={"radio"}/>
            <span>Kuasa Wajib Pajak</span>
        </Label>
    </div>
</div>

<style>
    span {
        font-size: .8rem;
    }
</style>
