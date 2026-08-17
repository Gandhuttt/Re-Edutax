<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";

    interface Props {
        tahunPajak: number;
        statusSpt: string;
        metodePembukuan: string;
        periodeBulanMulai: number;
        periodeBulanSelesai: number;
        sumberPenghasilan: string[];
        readonly?: boolean;
    }

    let {
        tahunPajak,
        statusSpt,
        metodePembukuan = $bindable(),
        periodeBulanMulai = $bindable(),
        periodeBulanSelesai = $bindable(),
        sumberPenghasilan,
        readonly = false
    }: Props = $props();

    // Three values, not the two the label implies: Pembukuan splits into akrual
    // and kas.
    const metodeOptions = [
        { value: 'pembukuan_akrual', label: 'Pembukuan stelsel akrual' },
        { value: 'pembukuan_kas', label: 'Pembukuan stelsel kas' },
        { value: 'pencatatan', label: 'Pencatatan' }
    ];

    const sumberLabel: Record<string, string> = {
        kegiatan_usaha: 'Kegiatan Usaha',
        pekerjaan: 'Pekerjaan',
        pekerjaan_bebas: 'Pekerjaan Bebas'
    };
    let sumberPenghasilanText = $derived(
        sumberPenghasilan.length > 0
            ? sumberPenghasilan.map((kode) => sumberLabel[kode] ?? kode).join(', ')
            : ''
    );
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
                <td><span>Sumber Penghasilan</span></td>
                <td>
                    <!-- Derived, not an input: measured on the live form to
                         change on its own as 1.a/1.b.1 are answered, see
                         HEADER-FIELDS.md. -->
                    <Input type={"text"} value={sumberPenghasilanText} disabled />
                </td>
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
