<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import { getContext } from "svelte";

    export type SectionData = {
        '1'?: string;
        '2'?: { _?: boolean; opini?: string };
    };

    const sektorUsaha = [
        { value: 'umum', label: 'Umum' },
        { value: 'perdagangan', label: 'Perdagangan' },
        { value: 'pabrikan', label: 'Pabrikan' },
        { value: 'jasa', label: 'Jasa' }
    ];
    const opiniAuditorIndukA = [
        { value: 'wajar-tanpa-pengecualian', label: 'Wajar Tanpa Pengecualian' },
        { value: 'wajar-dengan-pengecualian', label: 'Wajar Dengan Pengecualian' },
        { value: 'tidak-wajar', label: 'Tidak Wajar' }
    ];

    const {data: sectionData}: {data?: SectionData} = $props();
    const auditData = $derived(sectionData?.['2']);

    let isDiaudit = $state(false);
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full" >

        <!-- Hidden input field -->
        {#snippet head()}
            <tr class="tw:hidden">
                <td><Input hidden/></td>
            </tr>
        {/snippet}

        <!-- Input field -->
        {#snippet body()}
            <tr>
                <td class="tw:w-10"><span>1.</span></td>
                <td class="tw:w-[35rem]"><span>Sektor Usaha Laporan Keuangan pada Lampiran 1 *</span></td>
                <td>
                    <Select class={"tw:invalid:text-gray-500"} required>
                        {#if sectionData}
                            {@const selectedSektor = sektorUsaha.find((v) => v.value === sectionData['1'])}
                            {#if selectedSektor}
                                <option value="{selectedSektor.value}" selected disabled hidden>{selectedSektor.label}</option>
                            {:else}
                                <option value="" selected hidden>Select a business classification</option>
                            {/if}
                        {:else}
                            <option value="" selected disabled hidden>Select a business classification</option>
                        {/if}
                        {#each sektorUsaha as sektor}
                            <option value={sektor.value}>{sektor.label}</option>
                        {/each}
                    </Select>
                </td>
            </tr>
            <tr>
                <td><span>2.</span></td>
                <td><span>Apakah Laporan Keuangan diaudit oleh Akuntan Publik? *</span></td>
                <td>
                    <div class="tw:flex tw:gap-5">
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="diaudit" value={false} bind:group={isDiaudit} checked={true}>
                            <span>Tidak</span>
                        </Label>
                        <Label for={getContext("id")} class="tw:flex tw:items-center tw:gap-1">
                            <input type="radio" name="diaudit" value={true} bind:group={isDiaudit} checked={true}>
                            <span>Ya</span>
                        </Label>
                    </div>
                </td>
            </tr>
            {#if isDiaudit}    
                <tr>
                    <td><span>2.a.</span></td>
                    <td><span>Opini Auditor</span></td>
                    <td>
                        <Select class={"tw:invalid:text-gray-500"} required>
                            {#if auditData?._ === true}
                                {@const selectedOpinion = opiniAuditorIndukA.find((v) => auditData.opini === v.value)}
                                {#if selectedOpinion}
                                    <option value="{selectedOpinion.value}" selected hidden>{selectedOpinion.label}</option>
                                    {:else}
                                    <option value="" selected disabled hidden>Select an auditor opinion</option>
                                {/if}
                            {:else}
                                <option value="" selected disabled hidden>Select an auditor opinion</option>
                            {/if}
                            {#each opiniAuditorIndukA as opiniAuditor}
                                <option value="{opiniAuditor.value}">{opiniAuditor.label}</option>
                            {/each}
                        </Select>
                    </td>
                </tr>
                <tr>
                    <td><span>2.b.</span></td>
                    <td><span>NPWP Kantor Akuntan Publik</span></td>
                    <td><Input type={"text"} value={"0123456789012000"} disabled /></td>
                </tr>
                <tr>
                    <td><span>2.c.</span></td>
                    <td><span>Nama Kantor Akuntan Publik</span></td>
                    <td><Input type={"text"} value={"Akuntan Dummy"} disabled/></td>
                </tr>
            {/if}
        {/snippet}
    </Table>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) {
            background-color: #F9F6EE;
        }
    }
    td {
        padding: .25rem .5rem;
    }
    span {
        font-size: .8rem;
    }
    option {
        color: black;
    }
</style>
