<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import CheckableSelect from "$lib/components/CheckableSelect.svelte";

    interface Props {
        tahunPajak: number;
        statusSpt: string;
        metodePembukuan: string;
        periodeBulanMulai: number;
        periodeBulanSelesai: number;
        sumberPenghasilan: string[];
        readonly?: boolean;
        postFormId?: string;
    }

    let {
        tahunPajak,
        statusSpt,
        metodePembukuan = $bindable(),
        periodeBulanMulai = $bindable(),
        periodeBulanSelesai = $bindable(),
        sumberPenghasilan = $bindable(),
        readonly = false,
        postFormId
    }: Props = $props();

    // Three values, not the two the label implies: Pembukuan splits into akrual
    // and kas.
    const metodeOptions = [
        { value: 'pembukuan_akrual', label: 'Pembukuan stelsel akrual' },
        { value: 'pembukuan_kas', label: 'Pembukuan stelsel kas' },
        { value: 'pencatatan', label: 'Pencatatan' }
    ];

    const sumberOptions = [
        { value: 'kegiatan_usaha', label: 'Kegiatan Usaha' },
        { value: 'pekerjaan', label: 'Pekerjaan' },
        { value: 'pekerjaan_bebas', label: 'Pekerjaan Bebas' }
    ];
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <tr>
                <td class="tw:w-[25rem]"><span>Tahun Pajak/Bagian Tahun Pajak</span></td>
                <td><Input type={"text"} value={tahunPajak} disabled /></td>
            </tr>
            <tr>
                <td><span>Status</span></td>
                <td>
                    <!-- Read-only once a returnsheet exists: the control does not
                         open on an existing draft. -->
                    <Input type={"text"} value={statusSpt === 'pembetulan' ? 'Pembetulan' : 'Normal'} disabled />
                </td>
            </tr>
            <tr>
                <td><span>Metode Pembukuan/Pencatatan</span></td>
                <td>
                    <Select bind:value={metodePembukuan} disabled={readonly}>
                        {#each metodeOptions as metode}
                            <option class="tw:text-black" value={metode.value}>{metode.label}</option>
                        {/each}
                    </Select>
                </td>
            </tr>
            <tr>
                <td><span>Periode Pembukuan</span></td>
                <td>
                    <div class="tw:flex tw:items-center tw:gap-2">
                        <Input class={"tw:w-[6rem]! tw:text-end"} type={"number"} min={1} max={12} bind:value={periodeBulanMulai} disabled={readonly}/>
                        <span>s.d.</span>
                        <Input class={"tw:w-[6rem]! tw:text-end"} type={"number"} min={1} max={12} bind:value={periodeBulanSelesai} disabled={readonly}/>
                    </div>
                </td>
            </tr>
            <tr>
                <td><span>Sumber Penghasilan *</span></td>
                <td>
                    <!-- Multi-select: a taxpayer can hold more than one source at
                         once. Section B can clear this, see B.svelte. -->
                    <CheckableSelect
                        bind:value={sumberPenghasilan}
                        options={sumberOptions}
                        placeholder={"Pilih sumber penghasilan"}
                        disabled={readonly}
                    />
                </td>
            </tr>
        {/snippet}
    </Table>
    <div class="tw:flex tw:flex-row tw:my-2">
        <div class="tw:mr-5">
            <button class="btn btn-success" form={postFormId} name="action" value="Post" disabled={readonly}>Prefill SPT</button>
        </div>
    </div>
</div>

<style>
    tr {
        border: none;
        &:nth-child(even) { background-color: #F9F6EE; }
    }
    td { padding: .25rem .5rem; }
    span { font-size: .8rem; }
</style>
