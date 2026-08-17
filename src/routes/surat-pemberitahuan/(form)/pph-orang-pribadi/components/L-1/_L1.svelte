<script lang="ts">
    import Table from "$lib/components/Table.svelte";
    import Grid from "../lampiran/Grid.svelte";
    import { formatRupiah } from "$lib/helpers/rupiahInput";
    import type { LampiranRow } from "../lampiran/types";
    import * as spec from "./specs";

    interface Props {
        currentTab: string;
        referensi: Record<string, string[]>;
        harta: Record<'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6', LampiranRow[]>;
        utang: LampiranRow[];
        keluarga: LampiranRow[];
        pekerjaan: LampiranRow[];
        buktiPotong: LampiranRow[];
        // Grid editability tracks the Induk answer that routes to it. A grid can
        // be present but read-only, which is a different state from absent.
        i14bMemilikiUtang: boolean | undefined;
        b1aPenghasilanPekerjaan: boolean | undefined;
        d10aAdaPphDipotongPihakLain: boolean | undefined;
        readonly?: boolean;
    }

    let {
        currentTab,
        referensi,
        harta = $bindable(),
        utang = $bindable(),
        keluarga,
        pekerjaan = $bindable(),
        buktiPotong = $bindable(),
        i14bMemilikiUtang,
        b1aPenghasilanPekerjaan,
        d10aAdaPphDipotongPihakLain,
        readonly = false
    }: Props = $props();

    const subTabel = [
        { key: 'a1', judul: '1. KAS DAN SETARA KAS', fields: spec.A1_FIELDS, columns: spec.A1_COLUMNS },
        { key: 'a2', judul: '2. PIUTANG', fields: spec.A2_FIELDS, columns: spec.A2_COLUMNS },
        { key: 'a3', judul: '3. INVESTASI/SEKURITAS', fields: spec.A3_FIELDS, columns: spec.A3_COLUMNS },
        { key: 'a4', judul: '4. HARTA BERGERAK', fields: spec.A4_FIELDS, columns: spec.A4_COLUMNS },
        { key: 'a5', judul: '5. HARTA TIDAK BERGERAK (TERMASUK TANAH BANGUNAN)', fields: spec.A5_FIELDS, columns: spec.A5_COLUMNS },
        { key: 'a6', judul: '6. HARTA LAINNYA', fields: spec.A6_FIELDS, columns: spec.A6_COLUMNS }
    ] as const;

    // A7 is a rollup of A1 to A6 and read-only by design. It has two columns
    // where A1 has a single Saldo; on the live form that one value populated
    // both, which is why A1 writes its amount into nilaiSaatIni and the harga
    // side falls back to it.
    let ikhtisar = $derived(
        subTabel.map((sub) => {
            const rows = harta[sub.key];
            const nilaiSaatIni = rows.reduce((sum, row) => sum + Number(row.nilaiSaatIni || 0), 0);
            const hargaPerolehan = rows.reduce(
                (sum, row) => sum + Number(row.hargaPerolehan || row.nilaiSaatIni || 0),
                0
            );
            return { deskripsi: sub.judul, hargaPerolehan, nilaiSaatIni };
        })
    );

    let totalHargaPerolehan = $derived(ikhtisar.reduce((sum, row) => sum + row.hargaPerolehan, 0));
    let totalNilaiSaatIni = $derived(ikhtisar.reduce((sum, row) => sum + row.nilaiSaatIni, 0));
</script>

<div class="{currentTab === 'L-1' ? '' : 'tw:hidden'}">
    <h3 class="tw:text-lg">A. HARTA PADA AKHIR TAHUN PAJAK</h3>
    {#each subTabel as sub (sub.key)}
        <Grid
            judul={sub.judul}
            columns={sub.columns}
            fields={sub.fields}
            bind:rows={harta[sub.key]}
            {referensi}
            {readonly}
            totalKey={'nilaiSaatIni'}
            totalLabel={`JUMLAH TABEL ${sub.key.slice(1)}`}
        />
    {/each}

    <!-- 7. IKHTISAR HARTA: read-only in every captured state, genuinely not
         user-editable rather than merely gated. Feeds Induk 14a. -->
    <div class="tw:mb-6">
        <span class="tw:text-sm tw:font-bold">7. IKHTISAR HARTA</span>
        <div class="tw:overflow-x-auto tw:mt-2">
            <Table class="tw:min-w-full">
                {#snippet head()}
                    <tr>
                        <th>DESKRIPSI</th>
                        <th class="tw:text-end">HARGA PEROLEHAN</th>
                        <th class="tw:text-end">NILAI SAAT INI</th>
                    </tr>
                {/snippet}
                {#snippet body()}
                    {#each ikhtisar as row}
                        <tr>
                            <td>{row.deskripsi}</td>
                            <td class="tw:text-end">{formatRupiah(row.hargaPerolehan)}</td>
                            <td class="tw:text-end">{formatRupiah(row.nilaiSaatIni)}</td>
                        </tr>
                    {/each}
                    <tr class="total">
                        <td>JUMLAH HARTA PADA AKHIR TAHUN PAJAK</td>
                        <td class="tw:text-end">{formatRupiah(totalHargaPerolehan)}</td>
                        <td class="tw:text-end">{formatRupiah(totalNilaiSaatIni)}</td>
                    </tr>
                {/snippet}
            </Table>
        </div>
    </div>

    <h3 class="tw:text-lg">B. UTANG PADA AKHIR TAHUN PAJAK</h3>
    <Grid
        judul={'UTANG PADA AKHIR TAHUN PAJAK'}
        columns={spec.B_COLUMNS}
        fields={spec.B_FIELDS}
        bind:rows={utang}
        {referensi}
        dapatDiubah={Boolean(i14bMemilikiUtang)}
        {readonly}
        totalKey={'saldo'}
        totalLabel={'JUMLAH BAGIAN B'}
    />

    <h3 class="tw:text-lg">C. DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN</h3>
    <!-- Populated from DJP records rather than typed, so it has no row editor in
         any answer state. Seeded on our side. -->
    <Grid
        judul={'DAFTAR ANGGOTA KELUARGA YANG MENJADI TANGGUNGAN'}
        columns={spec.C_COLUMNS}
        fields={[]}
        rows={keluarga}
        {referensi}
        dapatDiubah={false}
        {readonly}
    />

    <h3 class="tw:text-lg">D. PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN</h3>
    <Grid
        judul={'PENGHASILAN NETO DALAM NEGERI DARI PEKERJAAN'}
        columns={spec.D_COLUMNS}
        fields={spec.D_FIELDS}
        bind:rows={pekerjaan}
        {referensi}
        dapatDiubah={Boolean(b1aPenghasilanPekerjaan)}
        {readonly}
        totalKey={'penghasilanNeto'}
        totalLabel={'JUMLAH BAGIAN D'}
    />

    <h3 class="tw:text-lg">E. DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh</h3>
    <Grid
        judul={'DAFTAR BUKTI PEMOTONGAN/PEMUNGUTAN PPh'}
        columns={spec.E_COLUMNS}
        fields={spec.E_FIELDS}
        bind:rows={buktiPotong}
        {referensi}
        dapatDiubah={Boolean(d10aAdaPphDipotongPihakLain)}
        {readonly}
        totalKey={'pphDipotong'}
        totalLabel={'JUMLAH BAGIAN E'}
    />
</div>

<style>
    h3 {
        margin: 1rem 0 0.5rem;
    }
    th {
        font-size: 0.7rem;
        text-align: left;
        padding: 0.4rem 0.5rem;
    }
    td {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
    }
    tr.total td {
        font-weight: bold;
        background-color: #F9F6EE;
    }
</style>
