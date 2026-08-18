<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import Select from "$lib/components/Select.svelte";
    import Table from "$lib/components/Table.svelte";
    import RowTanya from "./RowTanya.svelte";
    import RowNilai from "./RowNilai.svelte";
    import { HINTS } from "./hints";

    interface Props {
        b1aPenghasilanPekerjaan: boolean | undefined;
        b1b1PenghasilanUsaha: boolean | undefined;
        b1b2Oppt: string;
        b1b3Norma: string;
        b1b4Sektor: string;
        b1cPenghasilanDalamNegeriLainnya: boolean | undefined;
        b1dPenghasilanLuarNegeri: boolean | undefined;
        sumberPenghasilan: string[];
        // Rows 1a to 1d are fed from the lampiran, so they arrive as computed
        // figures rather than being typed here.
        n1a: number;
        n1b: number;
        n1c: number;
        n1d: number;
        readonly?: boolean;
    }

    let {
        b1aPenghasilanPekerjaan = $bindable(),
        b1b1PenghasilanUsaha = $bindable(),
        b1b2Oppt = $bindable(),
        b1b3Norma = $bindable(),
        b1b4Sektor = $bindable(),
        b1cPenghasilanDalamNegeriLainnya = $bindable(),
        b1dPenghasilanLuarNegeri = $bindable(),
        sumberPenghasilan = $bindable(),
        n1a,
        n1b,
        n1c,
        n1d,
        readonly = false
    }: Props = $props();

    // The option labels are full routing sentences rather than short values,
    // which is why these two are dropdowns and not Ya/Tidak radios: each has
    // three branches. 1.b.2 has two distinct Ya branches (PP 23 final-rate and
    // OPPT are different regimes) and 1.b.3 has two distinct Tidak branches.
    const opptOptions = [
        { value: '', label: '' },
        { value: 'tidak', label: 'Tidak, lanjutkan ke pertanyaan selanjutnya' },
        {
            value: 'peredaran_bruto_tertentu',
            label: 'Ya, saya termasuk Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu yang dikenai pajak bersifat final.'
        },
        { value: 'pengusaha_tertentu', label: 'Ya, saya termasuk orang pribadi pengusaha tertentu' }
    ];

    const normaOptions = [
        { value: '', label: '' },
        { value: 'tidak_pembukuan', label: 'Tidak, saya menyelenggarakan pembukuan.' },
        {
            value: 'tidak_final_tanpa_pembukuan',
            label: 'Tidak, saya hanya menerima penghasilan dari usaha yang dikenakan pajak bersifat final dan tidak menyelenggarakan pembukuan.'
        },
        { value: 'ya_norma', label: 'Ya, saya berhak menggunakan Norma Penghitungan Penghasilan Neto.' }
    ];

    // 1.b.4 appears only when 1.b.3 = "Tidak, saya menyelenggarakan pembukuan.".
    // Only one sektor can be selected at a time; changing it replaces the
    // lampiran tab rather than adding another, unlike every other gate on this
    // form. See L3A.md.
    const sektorOptions = [
        { value: '', label: '' },
        { value: 'dagang', label: 'Dagang' },
        { value: 'jasa', label: 'Jasa' },
        { value: 'industri', label: 'Industri' }
    ];

    // Section B writes back into the HEADER. With neither pekerjaan nor usaha
    // income declared, a previously selected Sumber Penghasilan is no longer
    // valid and the real form clears it (and then flags it as required). The
    // coupling is bidirectional, so treating the header as settings entered once
    // up front would get this wrong.
    $effect(() => {
        if (b1aPenghasilanPekerjaan === false && b1b1PenghasilanUsaha === false) {
            if (sumberPenghasilan.length > 0) sumberPenghasilan = [];
        }
    });

    // Confirmed 2026-08-18 against the live form: answering 1.b.1 Ya AND 1.b.2
    // with either "Ya" branch (OPPT) auto-checks Kegiatan Usaha in the header;
    // reverting 1.b.2 to Tidak auto-unchecks it again. 1.b.1 Ya alone does
    // neither.
    $effect(() => {
        const oppt = b1b1PenghasilanUsaha === true &&
            (b1b2Oppt === 'peredaran_bruto_tertentu' || b1b2Oppt === 'pengusaha_tertentu');
        const has = sumberPenghasilan.includes('kegiatan_usaha');
        if (oppt && !has) {
            sumberPenghasilan = [...sumberPenghasilan, 'kegiatan_usaha'];
        } else if (!oppt && has) {
            sumberPenghasilan = sumberPenghasilan.filter((s) => s !== 'kegiatan_usaha');
        }
    });

    // 1.b.4 only exists while 1.b.3 is "Tidak, saya menyelenggarakan
    // pembukuan.". Answers collapse whole rows on this form rather than
    // merely hiding them (see the 1.b.1 note above), so the sektor answer is
    // cleared along with the row.
    $effect(() => {
        if (b1b3Norma !== 'tidak_pembukuan' && b1b4Sektor) {
            b1b4Sektor = '';
        }
    });
</script>

<div class="tw:p-5">
    <Table class="tw:min-w-full">
        {#snippet head()}
            <tr class="tw:hidden"><td><Input hidden/></td></tr>
        {/snippet}
        {#snippet body()}
            <RowTanya
                nomor={"1.a"}
                label={"Apakah Anda menerima penghasilan dalam negeri dari pekerjaan?"}
                name={"B1a"}
                bind:answer={b1aPenghasilanPekerjaan}
                hint={HINTS.b1a}
                amount={"derived"}
                amountValue={n1a}
                {readonly}
            />
            <RowTanya
                nomor={"1.b.1"}
                label={"Apakah Anda menerima penghasilan dalam negeri dari usaha dan/atau pekerjaan bebas?"}
                name={"B1b1"}
                bind:answer={b1b1PenghasilanUsaha}
                hint={HINTS.b1b1}
                {readonly}
            />

            <!-- Answering 1.b.1 Tidak removes 1.b.2, 1.b.3 and 1.b.5 from the DOM
                 entirely rather than disabling them. The sub-rows under 1.b are a
                 conditional block, which is why the numbering appears to skip
                 1.b.4 in a captured state. -->
            {#if b1b1PenghasilanUsaha}
                <tr>
                    <td class="tw:w-10"><span>1.b.2</span></td>
                    <td class="tw:w-[40rem]"><span>Apakah Anda termasuk WP OP yang memiliki peredaran bruto tertentu atau OPPT?</span></td>
                    <td colspan="3">
                        <Select bind:value={b1b2Oppt} disabled={readonly}>
                            {#each opptOptions as option}
                                <option class="tw:text-black" value={option.value}>{option.label}</option>
                            {/each}
                        </Select>
                    </td>
                </tr>
                <tr>
                    <td><span>1.b.3</span></td>
                    <td><span>Apakah Anda menggunakan Norma dalam menghitung penghasilan neto?</span></td>
                    <td colspan="3">
                        <Select bind:value={b1b3Norma} disabled={readonly}>
                            {#each normaOptions as option}
                                <option class="tw:text-black" value={option.value}>{option.label}</option>
                            {/each}
                        </Select>
                    </td>
                </tr>
                {#if b1b3Norma === 'tidak_pembukuan'}
                    <tr>
                        <td><span>1.b.4</span></td>
                        <td><span>Anda menyelenggarakan pembukuan. Sebutkan sektor usaha yang Anda lakukan?</span></td>
                        <td colspan="3">
                            <Select bind:value={b1b4Sektor} disabled={readonly}>
                                {#each sektorOptions as option}
                                    <option class="tw:text-black" value={option.value}>{option.label}</option>
                                {/each}
                            </Select>
                        </td>
                    </tr>
                {/if}
                <RowNilai
                    nomor={"1.b.5"}
                    label={"Penghasilan neto dari usaha dan/atau pekerjaan bebas"}
                    value={n1b}
                />
            {/if}

            <RowTanya
                nomor={"1.c"}
                label={"Apakah Anda menerima penghasilan dalam negeri lainnya?"}
                name={"B1c"}
                bind:answer={b1cPenghasilanDalamNegeriLainnya}
                hint={HINTS.b1c}
                amount={"derived"}
                amountValue={n1c}
                {readonly}
            />
            <RowTanya
                nomor={"1.d"}
                label={"Apakah Anda menerima penghasilan luar negeri?"}
                name={"B1d"}
                bind:answer={b1dPenghasilanLuarNegeri}
                hint={HINTS.b1d}
                amount={"derived"}
                amountValue={n1d}
                {readonly}
            />
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
