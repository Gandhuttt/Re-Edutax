<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import {
        hitungLampiranL4,
        hitungLampiranL4SectionB,
        PTKP_OPTIONS,
        type PtkpStatus
    } from "../Induk/hitungPphOrangPribadi";
    import type { LampiranL4 } from "./types";

    // A. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA. Gated on
    // Induk 13b = Ya (h13bPerhitunganTersendiri). Flat one-row scalar form,
    // not a repeating grid (see L4.md), same shape as L-3B's TKU registry row.
    //
    // Confirmed 2026-08-18 against the live form with real numbers (see
    // L4.md's "Measured test cases"): five of the eleven fields are DERIVED,
    // not manual input. They are computed here via hitungLampiranL4, reusing
    // Induk's own PTKP table and UU HPP bracket function rather than
    // reimplementing them.
    //
    // B. PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI. Gated on
    // Induk row 7 (statusKewajibanSuamiIstri) being 'ph' or 'mt' — a
    // DIFFERENT gate from this tab's own 13b visibility, and from Bagian A's
    // gate. Follows L-3B's present-but-disabled convention (see
    // no_shared_grid_modal_component / the L-3B Bagian A/B/C accordions):
    // the accordion always renders, but its inputs are only enabled while
    // the row 7 gate is open.
    interface Props {
        currentTab: string;
        data: LampiranL4;
        // Induk row 4 (Penghasilan neto setelah pengurang penghasilan neto),
        // mirrored read-only into Bagian B's WP column. Section A's own
        // "Penghasilan neto" field above is a separate, independently typed
        // value — do not conflate the two.
        n4: number;
        statusKewajibanSuamiIstri: string;
        identitas: { npwp: string; nama: string } | null;
        npwpSuamiIstri: string;
        readonly?: boolean;
    }

    let {
        currentTab,
        data = $bindable(),
        n4,
        statusKewajibanSuamiIstri,
        identitas,
        npwpSuamiIstri,
        readonly = false
    }: Props = $props();

    let sectionBGated = $derived(
        statusKewajibanSuamiIstri === 'ph' || statusKewajibanSuamiIstri === 'mt'
    );
    let sectionBEditable = $derived(sectionBGated && !readonly);

    type ManualField = Exclude<keyof LampiranL4, 'ptkpStatus'>;

    const fields: { key: ManualField; label: string }[] = [
        { key: 'penghasilanNeto', label: 'Penghasilan neto *' },
        { key: 'kompensasiKerugian', label: 'Kompensasi kerugian tahun berikutnya' },
        { key: 'zakatSumbangan', label: 'Zakat/sumbangan keagamaan yang bersifat wajib' }
    ];

    const fieldsAfterPtkp: { key: ManualField; label: string }[] = [
        { key: 'pengurangPphTerutang', label: 'Pengurang PPh Terutang' },
        { key: 'kreditPajak', label: 'Kredit pajak' }
    ];

    let computed = $derived(
        hitungLampiranL4({
            penghasilanNeto: Number(data.penghasilanNeto),
            kompensasiKerugian: Number(data.kompensasiKerugian),
            zakatSumbangan: Number(data.zakatSumbangan),
            ptkpStatus: (data.ptkpStatus || null) as PtkpStatus | null,
            pengurangPphTerutang: Number(data.pengurangPphTerutang),
            kreditPajak: Number(data.kreditPajak)
        })
    );

    let computedB = $derived(
        hitungLampiranL4SectionB({
            netoWp: Number(n4),
            setelahDikurangiSuamiIstri: Number(data.setelahDikurangiSuamiIstri),
            ptkpGabunganStatus: (data.ptkpGabunganStatus || null) as PtkpStatus | null
        })
    );
</script>

<div class="{currentTab === 'L-4' ? '' : 'tw:hidden'}">
    <div class="accordion">
        <Accordion item={"A. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA"}>
            <div class="tw:p-5">
                <Table class="tw:min-w-full">
                    {#snippet head()}
                        <tr>
                            <th>URAIAN</th>
                            <th class="tw:text-end">JUMLAH (Rp)</th>
                        </tr>
                    {/snippet}
                    {#snippet body()}
                        {#each fields as field}
                            <tr>
                                <td>{field.label}</td>
                                <td>
                                    <Input
                                        class={"tw:text-end"}
                                        type={"rupiah"}
                                        bind:value={data[field.key]}
                                        disabled={readonly}
                                    />
                                </td>
                            </tr>
                        {/each}
                        <tr>
                            <td>Jumlah penghasilan neto</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computed.jumlahPenghasilanNeto}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Penghasilan tidak kena pajak *</td>
                            <td>
                                <Select bind:value={data.ptkpStatus} disabled={readonly}>
                                    <option class="tw:text-black" value={""}></option>
                                    {#each PTKP_OPTIONS as ptkp}
                                        <option class="tw:text-black" value={ptkp.value}>{ptkp.label}</option>
                                    {/each}
                                </Select>
                            </td>
                        </tr>
                        <tr>
                            <td>Penghasilan Kena Pajak</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computed.penghasilanKenaPajak}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Pajak Terutang</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computed.pajakTerutang}
                                    disabled
                                />
                            </td>
                        </tr>
                        {#each fieldsAfterPtkp as field}
                            <tr>
                                <td>{field.label}</td>
                                <td>
                                    <Input
                                        class={"tw:text-end"}
                                        type={"rupiah"}
                                        bind:value={data[field.key]}
                                        disabled={readonly}
                                    />
                                </td>
                            </tr>
                        {/each}
                        <tr>
                            <td>PPh yang harus dibayar</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computed.pphYangHarusDibayar}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Angsuran PPh Pasal 25 Tahun Pajak Berikutnya</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computed.angsuranPph25}
                                    disabled
                                />
                            </td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </Accordion>
        <Accordion item={"B. PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI"}>
            <div class="tw:p-5">
                {#if !sectionBGated}
                    <p class="tw:mb-3 tw:text-sm">
                        Bagian ini hanya berlaku jika Induk butir 7 (Status Kewajiban Perpajakan
                        Suami dan Istri) diisi PH atau MT.
                    </p>
                {/if}
                <Table class="tw:min-w-full">
                    {#snippet head()}
                        <tr>
                            <th>URAIAN</th>
                            <th class="tw:text-end">WAJIB PAJAK (Rp)</th>
                            <th class="tw:text-end">SUAMI/ISTRI (Rp)</th>
                        </tr>
                    {/snippet}
                    {#snippet body()}
                        <tr>
                            <td>Penghasilan Bruto</td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    bind:value={data.brutoWp}
                                    disabled={!sectionBEditable}
                                />
                            </td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    bind:value={data.brutoSuamiIstri}
                                    disabled={!sectionBEditable}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Penghasilan Neto</td>
                            <td>
                                <Input class={"tw:text-end"} type={"rupiah"} value={n4} disabled />
                            </td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    bind:value={data.netoSuamiIstri}
                                    disabled={!sectionBEditable}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Penghasilan neto setelah dikurangi zakat/sumbangan keagamaan wajib
                                dan kompensasi kerugian
                            </td>
                            <td>
                                <Input class={"tw:text-end"} type={"rupiah"} value={n4} disabled />
                            </td>
                            <td>
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    bind:value={data.setelahDikurangiSuamiIstri}
                                    disabled={!sectionBEditable}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Penghasilan neto setelah dikurangi zakat/sumbangan keagamaan wajib
                                dan kompensasi kerugian gabungan
                            </td>
                            <td colspan="2">
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computedB.netoGabungan}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Penghasilan tidak kena pajak gabungan</td>
                            <td colspan="2">
                                <Select bind:value={data.ptkpGabunganStatus} disabled={!sectionBEditable}>
                                    <option class="tw:text-black" value={""}></option>
                                    {#each PTKP_OPTIONS as ptkp}
                                        <option class="tw:text-black" value={ptkp.value}>{ptkp.label}</option>
                                    {/each}
                                </Select>
                            </td>
                        </tr>
                        <tr>
                            <td>Penghasilan kena pajak gabungan</td>
                            <td colspan="2">
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computedB.penghasilanKenaPajakGabungan}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>PPh terutang gabungan</td>
                            <td colspan="2">
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computedB.pphTerutangGabungan}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>PPh terutang yang ditanggung oleh Wajib Pajak</td>
                            <td colspan="2">
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computedB.pphDitanggungWp}
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>PPh terutang yang ditanggung oleh suami/istri</td>
                            <td colspan="2">
                                <Input
                                    class={"tw:text-end"}
                                    type={"rupiah"}
                                    value={computedB.pphDitanggungSuamiIstri}
                                    disabled
                                />
                            </td>
                        </tr>
                    {/snippet}
                </Table>

                <Table class="tw:mt-4 tw:min-w-full">
                    {#snippet head()}
                        <tr><th colspan="2">WAJIB PAJAK</th></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr>
                            <td>NIK/NPWP</td>
                            <td><Input type={"text"} value={identitas?.npwp ?? ''} disabled /></td>
                        </tr>
                        <tr>
                            <td>NAMA</td>
                            <td><Input type={"text"} value={identitas?.nama ?? ''} disabled /></td>
                        </tr>
                    {/snippet}
                </Table>

                <Table class="tw:mt-4 tw:min-w-full">
                    {#snippet head()}
                        <tr><th colspan="2">SUAMI/ISTRI</th></tr>
                    {/snippet}
                    {#snippet body()}
                        <tr>
                            <td>NIK/NPWP</td>
                            <td><Input type={"text"} value={npwpSuamiIstri} disabled /></td>
                        </tr>
                        <tr>
                            <td>NAMA</td>
                            <td>
                                <!-- The live form auto-fills this from a DJP spousal NPWP
                                     lookup we have no equivalent of, so it is a plain
                                     manual input here. -->
                                <Input
                                    type={"text"}
                                    bind:value={data.namaSuamiIstri}
                                    disabled={!sectionBEditable}
                                />
                            </td>
                        </tr>
                    {/snippet}
                </Table>
            </div>
        </Accordion>
    </div>
</div>

<style>
    th {
    	font-size: .7rem;
    	font-weight: bold;
    	text-align: center;
    	padding: .4rem .5rem;
    	white-space: nowrap;
    	background-color: var(--color-primary);
    	border: 1px solid white;
    }
    td {
    	font-size: .8rem;
    	padding: .4rem .5rem;
    	border: 1px solid white;
    }
    td:first-child {
    	width: 40rem;
    }
    td:last-child {
    	width: 16rem;
    }
    tr:nth-child(odd) {
    	background-color: #F9F6EE;
    }
</style>
