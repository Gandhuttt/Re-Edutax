<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Label from "$lib/components/Label.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
	import Card from "$lib/components/Card.svelte";
    import Button from "$lib/components/Button.svelte";
    import { getContext } from "svelte";
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-5">
    <div class="tw:flex tw:flex-row tw:w-full">
        <span class="tw:inline-block tw:basis-1/3 tw:shrink">a.1. Laporan Keuangan/Laporan Keuangan yang Telah Diaduit*</span>
        <div class="tw:basis-auto tw:grow tw:shrink-[2]">
            <Card>
                {#snippet head()}
                    <div class="tw:py-2">
                        <Button --color={'#FFD230'} type={"button"}>
                            <Label class={"tw:w-full tw:h-full"}>
                                <Input id={getContext("id")} type={"file"} placeholder={"test"}/>
                                <span>Pilih</span>
                            </Label>
                        </Button>
                        <Button --color={'#FFD230'} type={"button"}>
                            <span>Unggah</span>
                        </Button>
                        <Button --color={'#FFD230'} type={"button"}>
                            <span>Batal</span>
                        </Button>
                    </div>
                {/snippet}
                {#snippet body()}
                    <span>PLACEHOLDER</span>
                {/snippet}
            </Card>
        </div>
    </div>
    <div class="tw:flex tw:flex-row tw:w-full">
        <span class="tw:inline-block tw:basis-1/3 tw:shrink">Files Uploaded</span>
        <Table class={"tw:min-w-0! tw:basis-auto tw:grow tw:shrink-[2] tw:border-1 tw:border-[#A9A9A9]"}>
            {#snippet head()}
                <tr class="tw:hidden">
                    <td><Input hidden/></td>
                </tr>
            {/snippet}
            {#snippet body()}
                <tr>
                    <th><span>NO</span></th>
                    <th><span>NAMA DOKUMEN</span></th>
                    <th><span>TINDAKAN</span></th>
                </tr>
                <tr>
                    <td><span>PLACEHOLDER</span></td>
                    <td><span>PLACEHOLDER</span></td>
                    <td><span>PLACEHOLDER</span></td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

<style>
    tr {
        border: none;
    }
    td, th {
        padding: .25rem .5rem;
        border: 1px solid #A9A9A9;
    }
    th {
        text-align: center;
        font-weight: 600;
        background-color: #FFD230;
    }
    td {
        text-align: right;
        &:last-child {
            text-align: center;
        }
    }
    span {
        font-size: .8rem;
    }
</style>