<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Table from "$lib/components/Table.svelte";
    import { getContext } from "svelte";

    interface Props {
        identitas: { npwp: string; nama: string } | null;
        pernyataanBenar: boolean;
        penandatangan: string;
        readonly?: boolean;
    }

    let {
        identitas,
        pernyataanBenar = $bindable(),
        penandatangan = $bindable(),
        readonly = false
    }: Props = $props();
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td colspan="2">
                    <Label for={getContext("id")} class="tw:flex! tw:items-start tw:gap-2">
                        <input type="checkbox" bind:checked={pernyataanBenar} disabled={readonly}>
                        <span>
                            Dengan menyadari sepenuhnya akan segala akibatnya, saya menyatakan bahwa
                            apa yang telah saya beritahukan di atas beserta lampiran-lampirannya
                            adalah benar, lengkap dan jelas.
                        </span>
                    </Label>
                </td>
            </tr>
            <tr>
                <td class="tw:w-[25rem]"><span>Penandatangan</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex! tw:items-center tw:gap-1">
                            <input type="radio" name="Penandatangan" value={"wajib_pajak"} bind:group={penandatangan} disabled={readonly}>
                            <span>Wajib Pajak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex! tw:items-center tw:gap-1">
                            <input type="radio" name="Penandatangan" value={"kuasa_wajib_pajak"} bind:group={penandatangan} disabled={readonly}>
                            <span>Kuasa Wajib Pajak</span>
                        </Label>
                    </div>
                </td>
            </tr>
            <tr>
                <td><span>NPWP</span></td>
                <td><Input type={"text"} value={identitas?.npwp ?? ''} disabled /></td>
            </tr>
            <tr>
                <td><span>Nama Lengkap</span></td>
                <td><Input type={"text"} value={identitas?.nama ?? ''} disabled /></td>
            </tr>
        {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) { background-color: #F9F6EE; }
    }
    td { padding: .25rem .5rem; }
    span { font-size: .8rem; }
</style>
