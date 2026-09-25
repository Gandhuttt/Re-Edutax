<script lang="ts">
    import {
        DataTable,
        DisclosureItem,
        FormField,
        RupiahField,
        SelectField,
        Stack
    } from "$lib/re-ui-components";
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
    // gate. Confirmed 2026-08-18 against the live form: the accordion is
    // fully absent (not just disabled) while row 7 is unset.
    interface Props {
        currentTab: string;
        data: LampiranL4;
        // Induk row 4 (Penghasilan neto setelah pengurang penghasilan neto),
        // mirrored read-only into Bagian B's WP column. Section A's own
        // "Penghasilan neto" field above is a separate, independently typed
        // value — do not conflate the two.
        n4: number;
        // Induk row 2 (Penghasilan neto setahun). Bagian B's WP "Penghasilan
        // Neto" cell mirrors this row, NOT row 4 — Coretax patches Value13 from
        // annualNetIncome (valueC1) and Value15 from netIncomeSummary
        // (valueC3). It feeds no formula, so this is display fidelity only.
        n2: number;
        // Induk 13b (chkH2). Bagian A is gated on it independently of this
        // tab's own visibility: on a PH/MT return with 13b = Tidak the tab is
        // present for Bagian B alone and Coretax hides Bagian A entirely.
        bagianAGated: boolean;
        statusKewajibanSuamiIstri: string;
        identitas: { npwp: string; nama: string } | null;
        npwpSuamiIstri: string;
        readonly?: boolean;
    }

    let {
        currentTab,
        data = $bindable(),
        n4,
        n2,
        bagianAGated,
        statusKewajibanSuamiIstri,
        identitas,
        npwpSuamiIstri,
        readonly = false
    }: Props = $props();

    let sectionBGated = $derived(
        statusKewajibanSuamiIstri === 'ph' || statusKewajibanSuamiIstri === 'mt'
    );

    type ManualField = Exclude<
        keyof LampiranL4,
        'ptkpStatus' | 'ptkpGabunganStatus' | 'namaSuamiIstri'
    >;

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
            kreditPajak: Number(data.kreditPajak),
            // PH/MT locks this section's PTKP to 0; the joint PTKP is claimed
            // in Bagian B instead.
            phMt: sectionBGated
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
    <Stack gap="16px">
        {#if bagianAGated}
            <DisclosureItem
                title="A. PENGHITUNGAN ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA"
                open
            >
                <DataTable
                    label="Penghitungan angsuran PPh Pasal 25 tahun pajak berikutnya"
                    minWidth="680px"
                    headerTone="navy"
                    density="compact"
                >
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">URAIAN</th>
                                <th class="right" scope="col">JUMLAH (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each fields as field}
                                <tr>
                                    <th scope="row">{field.label}</th>
                                    <td class="field-cell">
                                        <RupiahField
                                            label={field.label}
                                            bind:value={data[field.key]}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                            {/each}
                            <tr>
                                <th scope="row">Jumlah penghasilan neto</th>
                                <td class="field-cell">
                                    <RupiahField
                                        label="Jumlah penghasilan neto"
                                        value={computed.jumlahPenghasilanNeto}
                                        disabled
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Penghasilan tidak kena pajak *</th>
                                <td>
                                    <!-- PH/MT locks this field to zero because joint PTKP is claimed in Bagian B. -->
                                    <SelectField
                                        label="Penghasilan tidak kena pajak"
                                        bind:value={data.ptkpStatus}
                                        options={[
                                            { value: '', label: 'Silakan pilih' },
                                            ...PTKP_OPTIONS
                                        ]}
                                        disabled={readonly || sectionBGated}
                                        labelHidden
                                        floatingPanel
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Penghasilan Kena Pajak</th>
                                <td class="field-cell">
                                    <RupiahField
                                        label="Penghasilan Kena Pajak"
                                        value={computed.penghasilanKenaPajak}
                                        disabled
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Pajak Terutang</th>
                                <td class="field-cell">
                                    <RupiahField
                                        label="Pajak Terutang"
                                        value={computed.pajakTerutang}
                                        disabled
                                    />
                                </td>
                            </tr>
                            {#each fieldsAfterPtkp as field}
                                <tr>
                                    <th scope="row">{field.label}</th>
                                    <td class="field-cell">
                                        <RupiahField
                                            label={field.label}
                                            bind:value={data[field.key]}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                            {/each}
                            <tr>
                                <th scope="row">PPh yang harus dibayar</th>
                                <td class="field-cell">
                                    <RupiahField
                                        label="PPh yang harus dibayar"
                                        value={computed.pphYangHarusDibayar}
                                        disabled
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Angsuran PPh Pasal 25 Tahun Pajak Berikutnya</th>
                                <td class="field-cell">
                                    <RupiahField
                                        label="Angsuran PPh Pasal 25 Tahun Pajak Berikutnya"
                                        value={computed.angsuranPph25}
                                        disabled
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DataTable>
            </DisclosureItem>
        {/if}

        {#if sectionBGated}
            <DisclosureItem title="B. PENGHITUNGAN PPh TERUTANG WAJIB PAJAK DAN SUAMI/ISTRI" open>
                <Stack gap="16px">
                    <DataTable
                        label="Penghitungan PPh terutang Wajib Pajak dan suami atau istri"
                        minWidth="880px"
                        headerTone="navy"
                        density="compact"
                    >
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">URAIAN</th>
                                    <th class="right" scope="col">WAJIB PAJAK (Rp)</th>
                                    <th class="right" scope="col">SUAMI/ISTRI (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">Penghasilan Bruto</th>
                                    <td class="field-cell">
                                        <RupiahField
                                            label="Penghasilan Bruto Wajib Pajak"
                                            bind:value={data.brutoWp}
                                            disabled={readonly}
                                        />
                                    </td>
                                    <td class="field-cell">
                                        <RupiahField
                                            label="Penghasilan Bruto Suami/Istri"
                                            bind:value={data.brutoSuamiIstri}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Penghasilan Neto</th>
                                    <td class="field-cell">
                                        <RupiahField label="Penghasilan Neto Wajib Pajak" value={n2} disabled />
                                    </td>
                                    <td class="field-cell">
                                        <RupiahField
                                            label="Penghasilan Neto Suami/Istri"
                                            bind:value={data.netoSuamiIstri}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        Penghasilan neto setelah dikurangi zakat/sumbangan keagamaan wajib
                                        dan kompensasi kerugian
                                    </th>
                                    <td class="field-cell">
                                        <RupiahField
                                            label="Penghasilan neto Wajib Pajak setelah pengurang"
                                            value={n4}
                                            disabled
                                        />
                                    </td>
                                    <td class="field-cell">
                                        <RupiahField
                                            label="Penghasilan neto Suami/Istri setelah pengurang"
                                            bind:value={data.setelahDikurangiSuamiIstri}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        Penghasilan neto setelah dikurangi zakat/sumbangan keagamaan wajib
                                        dan kompensasi kerugian gabungan
                                    </th>
                                    <td class="field-cell" colspan="2">
                                        <RupiahField
                                            label="Penghasilan neto gabungan setelah pengurang"
                                            value={computedB.netoGabungan}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Penghasilan tidak kena pajak gabungan</th>
                                    <td colspan="2">
                                        <SelectField
                                            label="Penghasilan tidak kena pajak gabungan"
                                            bind:value={data.ptkpGabunganStatus}
                                            options={[
                                                { value: '', label: 'Silakan pilih' },
                                                ...PTKP_OPTIONS
                                            ]}
                                            disabled={readonly}
                                            labelHidden
                                            floatingPanel
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Penghasilan kena pajak gabungan</th>
                                    <td class="field-cell" colspan="2">
                                        <RupiahField
                                            label="Penghasilan kena pajak gabungan"
                                            value={computedB.penghasilanKenaPajakGabungan}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">PPh terutang gabungan</th>
                                    <td class="field-cell" colspan="2">
                                        <RupiahField
                                            label="PPh terutang gabungan"
                                            value={computedB.pphTerutangGabungan}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">PPh terutang yang ditanggung oleh Wajib Pajak</th>
                                    <td class="field-cell" colspan="2">
                                        <RupiahField
                                            label="PPh terutang yang ditanggung oleh Wajib Pajak"
                                            value={computedB.pphDitanggungWp}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">PPh terutang yang ditanggung oleh suami/istri</th>
                                    <td class="field-cell" colspan="2">
                                        <RupiahField
                                            label="PPh terutang yang ditanggung oleh suami/istri"
                                            value={computedB.pphDitanggungSuamiIstri}
                                            disabled
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTable>

                    <DataTable
                        label="Identitas Wajib Pajak"
                        minWidth="560px"
                        headerTone="navy"
                        density="compact"
                    >
                        <table>
                            <thead><tr><th colspan="2" scope="colgroup">WAJIB PAJAK</th></tr></thead>
                            <tbody>
                                <tr>
                                    <th scope="row">NIK/NPWP</th>
                                    <td class="field-cell">
                                        <FormField
                                            label="NIK/NPWP Wajib Pajak"
                                            value={identitas?.npwp ?? ''}
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">NAMA</th>
                                    <td class="field-cell">
                                        <FormField
                                            label="Nama Wajib Pajak"
                                            value={identitas?.nama ?? ''}
                                            disabled
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTable>

                    <DataTable
                        label="Identitas suami atau istri"
                        minWidth="560px"
                        headerTone="navy"
                        density="compact"
                    >
                        <table>
                            <thead><tr><th colspan="2" scope="colgroup">SUAMI/ISTRI</th></tr></thead>
                            <tbody>
                                <tr>
                                    <th scope="row">NIK/NPWP</th>
                                    <td class="field-cell">
                                        <FormField label="NIK/NPWP Suami/Istri" value={npwpSuamiIstri} disabled />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">NAMA</th>
                                    <td class="field-cell">
                                        <!-- This remains manual because there is no equivalent DJP spouse lookup. -->
                                        <FormField
                                            label="Nama Suami/Istri"
                                            bind:value={data.namaSuamiIstri}
                                            disabled={readonly}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTable>
                </Stack>
            </DisclosureItem>
        {/if}
    </Stack>
</div>

<style>
    .field-cell :global(.label) {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .field-cell :global(.field),
    .field-cell :global(label) {
        gap: 0;
    }
</style>
