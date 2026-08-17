<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Label from "$lib/components/Label.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import { applyRupiahInput, formatRupiah } from "$lib/helpers/rupiahInput";
    import type { BarisLuarNegeri } from "./types";

    // C. PENGHASILAN NETO LUAR NEGERI.
    //
    // The most divergent grid in the form:
    //   - it is the only one carrying foreign currency, so it shows both the
    //     asing and rupiah amounts side by side rather than converting
    //   - its empty state reads "Tidak ada data untuk ditampilkan." where every
    //     L-1 grid says "Tidak ada data yang ditemukan."
    //   - it has two consumers, not one
    //
    // Feeds Induk 1.d via JUMLAH PENGHASILAN NETO, and separately feeds L-1
    // Bagian E its KREDIT PAJAK ATAS PENGHASILAN LUAR NEGERI row, which rolls on
    // into Induk 10a. That second edge is lampiran-to-lampiran and was only found
    // because every grid was populated at once.
    interface Props {
        rows: BarisLuarNegeri[];
        referensi: Record<string, string[]>;
        dapatDiubah?: boolean;
        readonly?: boolean;
    }

    let { rows = $bindable(), referensi, dapatDiubah = true, readonly = false }: Props = $props();

    const kosong = (): BarisLuarNegeri => ({
        namaSumber: '', negara: '', tanggalTransaksi: '', jenisPenghasilan: '',
        kodePenghasilan: '', penghasilanNeto: 0, pajakLuarNegeriAsing: 0,
        mataUang: '', pajakLuarNegeriRupiah: 0, kreditPajakDiperhitungkan: 0
    });

    let modalTerbuka = $state(false);
    let indeksDiubah = $state<number | null>(null);
    let draft = $state<BarisLuarNegeri>(kosong());
    let errors = $state<Record<string, string>>({});

    let bisaEdit = $derived(dapatDiubah && !readonly);
    let totalNeto = $derived(rows.reduce((s, r) => s + Number(r.penghasilanNeto || 0), 0));
    let totalKredit = $derived(rows.reduce((s, r) => s + Number(r.kreditPajakDiperhitungkan || 0), 0));

    function bukaTambah() {
        indeksDiubah = null;
        draft = kosong();
        errors = {};
        modalTerbuka = true;
    }

    function bukaUbah(index: number) {
        indeksDiubah = index;
        draft = { ...rows[index] };
        errors = {};
        modalTerbuka = true;
    }

    function simpanModal() {
        const next: Record<string, string> = {};
        if (!draft.namaSumber) next.namaSumber = 'Kolom ini wajib diisi!';
        if (!draft.negara) next.negara = 'Kolom ini wajib diisi!';
        if (!draft.tanggalTransaksi) next.tanggalTransaksi = 'Kolom ini wajib diisi!';
        if (!draft.jenisPenghasilan) next.jenisPenghasilan = 'Kolom ini wajib diisi!';
        if (!draft.penghasilanNeto) next.penghasilanNeto = 'Kolom ini wajib diisi!';
        if (!draft.pajakLuarNegeriAsing) next.pajakLuarNegeriAsing = 'Kolom ini wajib diisi!';
        if (!draft.mataUang) next.mataUang = 'Kolom ini wajib diisi!';
        if (!draft.pajakLuarNegeriRupiah) next.pajakLuarNegeriRupiah = 'Kolom ini wajib diisi!';
        if (!draft.kreditPajakDiperhitungkan) next.kreditPajakDiperhitungkan = 'Kolom ini wajib diisi!';
        errors = next;
        if (Object.keys(next).length > 0) return;

        if (indeksDiubah === null) rows = [...rows, draft];
        else rows = rows.map((r, i) => (i === indeksDiubah ? draft : r));
        modalTerbuka = false;
    }

    function hapus(index: number) {
        rows = rows.filter((_, i) => i !== index);
    }

    function hapusSemua() {
        if (rows.length > 0 && confirm(`Hapus semua ${rows.length} baris pada Bagian C?`)) rows = [];
    }
</script>

<div class="tw:mb-6">
    <div class="tw:mb-2 tw:flex tw:items-center tw:justify-between">
        <span class="tw:text-sm tw:font-bold">PENGHASILAN NETO LUAR NEGERI</span>
        {#if bisaEdit}
            <div class="tw:flex tw:gap-2">
                <Button type="button" onclick={bukaTambah}>Tambah</Button>
                <Button type="button" onclick={hapusSemua}>Hapus Semua</Button>
            </div>
        {/if}
    </div>

    <div class="tw:overflow-x-auto">
        <Table class="tw:min-w-full">
            {#snippet head()}
                <tr>
                    {#if bisaEdit}<th class="tw:w-[8rem]">TINDAKAN</th>{/if}
                    <th class="tw:w-[4rem]">NO.</th>
                    <th>SUMBER/PEMBERI PENGHASILAN</th>
                    <th>NEGARA</th>
                    <th>TANGGAL TRANSAKSI</th>
                    <th>JENIS PENGHASILAN</th>
                    <th class="tw:text-end">PENGHASILAN NETO (RUPIAH)</th>
                    <th>MATA UANG ASING</th>
                    <th class="tw:text-end">NILAI DALAM MATA UANG ASING</th>
                    <th class="tw:text-end">NILAI DALAM RUPIAH</th>
                    <th class="tw:text-end">KREDIT PAJAK YANG DAPAT DIPERHITUNGKAN</th>
                </tr>
            {/snippet}
            {#snippet body()}
                {#each rows as row, index}
                    <tr>
                        {#if bisaEdit}
                            <td class="tw:flex tw:gap-1">
                                <Button type="button" onclick={() => bukaUbah(index)}>Ubah</Button>
                                <Button type="button" color="var(--color-danger)" onclick={() => hapus(index)}>
                                    <span class="tw:text-white">Hapus</span>
                                </Button>
                            </td>
                        {/if}
                        <td>{index + 1}</td>
                        <td>{row.namaSumber}</td>
                        <td>{row.negara}</td>
                        <td>{row.tanggalTransaksi}</td>
                        <td>{row.jenisPenghasilan}</td>
                        <td class="tw:text-end">{formatRupiah(row.penghasilanNeto)}</td>
                        <td>{row.mataUang}</td>
                        <td class="tw:text-end">{formatRupiah(row.pajakLuarNegeriAsing)}</td>
                        <td class="tw:text-end">{formatRupiah(row.pajakLuarNegeriRupiah)}</td>
                        <td class="tw:text-end">{formatRupiah(row.kreditPajakDiperhitungkan)}</td>
                    </tr>
                {:else}
                    <!-- Different empty-state wording from the L-1 grids. -->
                    <tr><td colspan={bisaEdit ? 11 : 10} class="tw:text-center">Tidak ada data untuk ditampilkan.</td></tr>
                {/each}
                <tr class="total">
                    <td colspan={bisaEdit ? 6 : 5}>JUMLAH PENGHASILAN NETO</td>
                    <td class="tw:text-end">{formatRupiah(totalNeto)}</td>
                    <td colspan="3"></td>
                    <td class="tw:text-end">{formatRupiah(totalKredit)}</td>
                </tr>
            {/snippet}
        </Table>
    </div>
</div>

{#if modalTerbuka}
    <div class="overlay">
        <div class="modal">
            <header>
                <span class="tw:text-lg">Penghasilan Luar Negeri</span>
                <button type="button" onclick={() => (modalTerbuka = false)} aria-label="Tutup">&times;</button>
            </header>
            <div class="body">
                <div class="field">
                    <Label for="l2c-nama"><span>Nama Sumber/Pemberi Penghasilan *</span></Label>
                    <Input id="l2c-nama" type={"text"} bind:value={draft.namaSumber} />
                    {#if errors.namaSumber}<span class="error">{errors.namaSumber}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-negara"><span>Negara Sumber/Pemberi Penghasilan *</span></Label>
                    <Select id="l2c-negara" bind:value={draft.negara}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.negara ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.negara}<span class="error">{errors.negara}</span>{/if}
                </div>
                <div class="field">
                    <!-- The live form's picker cannot be typed into at all and
                         applies no tax-year validation; an ordinary date input is
                         used instead. -->
                    <Label for="l2c-tanggal"><span>Tanggal Transaksi *</span></Label>
                    <Input id="l2c-tanggal" type={"date"} bind:value={draft.tanggalTransaksi} />
                    {#if errors.tanggalTransaksi}<span class="error">{errors.tanggalTransaksi}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-jenis"><span>Jenis Penghasilan *</span></Label>
                    <Select id="l2c-jenis" bind:value={draft.jenisPenghasilan}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.l2_c_jenis_penghasilan ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.jenisPenghasilan}<span class="error">{errors.jenisPenghasilan}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-kode"><span>Kode Penghasilan</span></Label>
                    <Input id="l2c-kode" type={"text"} bind:value={draft.kodePenghasilan} />
                </div>
                <div class="field">
                    <Label for="l2c-neto"><span>Penghasilan Neto *</span></Label>
                    <Input
                        id="l2c-neto"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.penghasilanNeto)}
                        oninput={(e: Event) => (draft.penghasilanNeto = applyRupiahInput(e))}
                    />
                    {#if errors.penghasilanNeto}<span class="error">{errors.penghasilanNeto}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-pajak-asing"><span>Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Mata Uang Asing *</span></Label>
                    <Input
                        id="l2c-pajak-asing"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.pajakLuarNegeriAsing)}
                        oninput={(e: Event) => (draft.pajakLuarNegeriAsing = applyRupiahInput(e))}
                    />
                    {#if errors.pajakLuarNegeriAsing}<span class="error">{errors.pajakLuarNegeriAsing}</span>{/if}
                </div>
                <div class="field">
                    <!-- The largest modal in the form, and the only one with a Mata
                         Uang dropdown. Its 111 entries are named inconsistently in
                         the source (mostly Indonesian, some English-with-country
                         like "Yuan Renminbi: CHINA"), transcribed as-is. -->
                    <Label for="l2c-mata-uang"><span>Mata Uang *</span></Label>
                    <Select id="l2c-mata-uang" bind:value={draft.mataUang}>
                        <option class="tw:text-black" value={""}>Silakan pilih</option>
                        {#each referensi.mata_uang ?? [] as opsi}
                            <option class="tw:text-black" value={opsi}>{opsi}</option>
                        {/each}
                    </Select>
                    {#if errors.mataUang}<span class="error">{errors.mataUang}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-pajak-rupiah"><span>Pajak yang Dibayar/Dipotong/Terutang di Luar Negeri dalam Rupiah *</span></Label>
                    <Input
                        id="l2c-pajak-rupiah"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.pajakLuarNegeriRupiah)}
                        oninput={(e: Event) => (draft.pajakLuarNegeriRupiah = applyRupiahInput(e))}
                    />
                    {#if errors.pajakLuarNegeriRupiah}<span class="error">{errors.pajakLuarNegeriRupiah}</span>{/if}
                </div>
                <div class="field">
                    <Label for="l2c-kredit"><span>Kredit Pajak yang Dapat Diperhitungkan *</span></Label>
                    <Input
                        id="l2c-kredit"
                        class={"tw:text-end"}
                        type={"text"}
                        value={formatRupiah(draft.kreditPajakDiperhitungkan)}
                        oninput={(e: Event) => (draft.kreditPajakDiperhitungkan = applyRupiahInput(e))}
                    />
                    {#if errors.kreditPajakDiperhitungkan}<span class="error">{errors.kreditPajakDiperhitungkan}</span>{/if}
                </div>
            </div>
            <footer>
                <Button type="button" onclick={() => (modalTerbuka = false)}>Tutup</Button>
                <Button type="button" onclick={simpanModal} color="var(--color-secondary)">
                    <span class="tw:text-white">Simpan</span>
                </Button>
            </footer>
        </div>
    </div>
{/if}

<style>
    th { font-size: .7rem; text-align: left; padding: .4rem .5rem; white-space: nowrap; }
    td { font-size: .8rem; padding: .25rem .5rem; }
    tr.total td { font-weight: bold; background-color: #F9F6EE; }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
    }
    .modal {
        background: white;
        width: min(48rem, 92vw);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        border-radius: 0.25rem;
    }
    header, footer {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
    }
    header { justify-content: space-between; border-bottom: 1px solid #ddd; }
    header button { font-size: 1.5rem; line-height: 1; background: none; border: none; cursor: pointer; }
    footer { justify-content: flex-end; gap: 0.5rem; border-top: 1px solid #ddd; }
    .body { overflow-y: auto; padding: 1rem; display: grid; gap: 0.75rem; }
    .field { display: grid; gap: 0.25rem; }
    .field span { font-size: 0.8rem; }
    .error { background: #fde8e8; color: #b91c1c; font-size: 0.75rem; padding: 0.25rem 0.5rem; }
</style>
