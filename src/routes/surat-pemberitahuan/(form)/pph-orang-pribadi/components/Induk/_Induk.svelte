<script lang="ts">
    import Accordion from "$lib/components/AccordionItem.svelte";
    import Header from "./_Header.svelte";
    import A from "./A.svelte";
    import B from "./B.svelte";
    import C from "./C.svelte";
    import D from "./D.svelte";
    import E from "./E.svelte";
    import F from "./F.svelte";
    import G from "./G.svelte";
    import H from "./H.svelte";
    import I from "./I.svelte";
    import J from "./J.svelte";
    import K from "./K.svelte";
    import type { getSptPphOrangPribadi } from "../../getSptPphOrangPribadi.remote";
    import type { hitungInduk } from "./hitungPphOrangPribadi";

    type OpInterface = Awaited<ReturnType<typeof getSptPphOrangPribadi>>;

    interface Props {
        currentTab: string;
        spt: OpInterface['spt'];
        identitas: OpInterface['identitas'];
        readonly: boolean;
        computed: ReturnType<typeof hitungInduk>;

        metodePembukuan: string;
        periodeBulanMulai: number;
        periodeBulanSelesai: number;
        sumberPenghasilan: string[];

        a7StatusKewajibanSuamiIstri: string;
        a8NpwpSuamiIstri: string;

        b1aPenghasilanPekerjaan: boolean | undefined;
        b1b1PenghasilanUsaha: boolean | undefined;
        b1b2Oppt: string;
        b1b3Norma: string;
        b1b4Sektor: string;
        b1cPenghasilanDalamNegeriLainnya: boolean | undefined;
        b1dPenghasilanLuarNegeri: boolean | undefined;

        c3AdaPengurangPenghasilanNeto: boolean | undefined;
        c5PtkpStatus: string;
        c8AdaPengurangPphTerutang: boolean | undefined;

        d10bAngsuranPph25: number;
        d10cStpPph25: number;
        d10aAdaPphDipotongPihakLain: boolean | undefined;
        d10dAdaPengembalianKreditLuarNegeri: boolean | undefined;
        d10dJumlah: number;

        e11bAdaSkPengangsuranPenundaan: boolean | undefined;
        e11bJumlah: number;

        f12a: number;
        f12aGantiSptSebelumnya: boolean | undefined;

        gMetodePengembalian: string;
        gNomorRekening: string;
        gNamaBank: string;
        gNamaPemilikRekening: string;

        h13aAngsuranTeratur: boolean | undefined;
        h13bPerhitunganTersendiri: boolean | undefined;
        h13cAngsuranOppt: boolean | undefined;
        // L-4 Bagian A's computed Angsuran PPh Pasal 25, mirrored onto 13.b's
        // inline amount cell once answered Ya. See H.svelte.
        l4AngsuranPph25: number;

        i14bMemilikiUtang: boolean | undefined;
        i14cPenghasilanFinal: boolean | undefined;
        i14dBukanObjekPajak: boolean | undefined;
        i14ePenyusutanAmortisasiFiskal: boolean | undefined;
        i14fBiayaEntertainment: boolean | undefined;
        i14gDividenLuarNegeri: boolean | undefined;
        i14hKelebihanPphFinal: number;

        jaLaporanKeuangan: boolean | undefined;
        jbBuktiZakat: boolean | undefined;
        jcBuktiPotongLuarNegeri: boolean | undefined;
        jdSuratKuasaKhusus: boolean | undefined;
        jeDokumenLainnya: boolean | undefined;

        pernyataanBenar: boolean;
        penandatangan: string;

        // Lampiran-fed figures. All zero until the lampiran are built.
        n1a: number;
        n1b: number;
        n1c: number;
        n1d: number;
        n10a: number;
        n14a: number;
        n14b: number;
        n14c: number;
        n14d: number;
    }

    let {
        currentTab,
        spt,
        identitas,
        readonly,
        computed,
        metodePembukuan = $bindable(),
        periodeBulanMulai = $bindable(),
        periodeBulanSelesai = $bindable(),
        sumberPenghasilan = $bindable(),
        a7StatusKewajibanSuamiIstri = $bindable(),
        a8NpwpSuamiIstri = $bindable(),
        b1aPenghasilanPekerjaan = $bindable(),
        b1b1PenghasilanUsaha = $bindable(),
        b1b2Oppt = $bindable(),
        b1b3Norma = $bindable(),
        b1b4Sektor = $bindable(),
        b1cPenghasilanDalamNegeriLainnya = $bindable(),
        b1dPenghasilanLuarNegeri = $bindable(),
        c3AdaPengurangPenghasilanNeto = $bindable(),
        c5PtkpStatus = $bindable(),
        c8AdaPengurangPphTerutang = $bindable(),
        d10aAdaPphDipotongPihakLain = $bindable(),
        d10bAngsuranPph25 = $bindable(),
        d10cStpPph25 = $bindable(),
        d10dAdaPengembalianKreditLuarNegeri = $bindable(),
        d10dJumlah = $bindable(),
        e11bAdaSkPengangsuranPenundaan = $bindable(),
        e11bJumlah = $bindable(),
        f12a,
        f12aGantiSptSebelumnya = $bindable(),
        gMetodePengembalian = $bindable(),
        gNomorRekening = $bindable(),
        gNamaBank = $bindable(),
        gNamaPemilikRekening = $bindable(),
        h13aAngsuranTeratur = $bindable(),
        h13bPerhitunganTersendiri = $bindable(),
        h13cAngsuranOppt = $bindable(),
        l4AngsuranPph25,
        i14bMemilikiUtang = $bindable(),
        i14cPenghasilanFinal = $bindable(),
        i14dBukanObjekPajak = $bindable(),
        i14ePenyusutanAmortisasiFiskal = $bindable(),
        i14fBiayaEntertainment = $bindable(),
        i14gDividenLuarNegeri = $bindable(),
        i14hKelebihanPphFinal = $bindable(),
        jaLaporanKeuangan = $bindable(),
        jbBuktiZakat = $bindable(),
        jcBuktiPotongLuarNegeri = $bindable(),
        jdSuratKuasaKhusus = $bindable(),
        jeDokumenLainnya = $bindable(),
        pernyataanBenar = $bindable(),
        penandatangan = $bindable(),
        n1a,
        n1b,
        n1c,
        n1d,
        n10a,
        n14a,
        n14b,
        n14c,
        n14d
    }: Props = $props();

    // Section F applies only to a pembetulan, section G only when the return is
    // in a refund position. Both are driven by the computed outcome rather than
    // by the header's Status field: "status" is overloaded on this form, and the
    // Nihil / Kurang Bayar / Lebih Bayar chip is the computed one.
    //
    // These gate the *fields*, not the sections. Coretax renders F and G on every
    // return and says so in their titles; hiding them outright (as this did until
    // 2026-08-20) loses that instruction and makes the Induk look truncated.
    let adaPembetulan = $derived(spt.pembetulanKe > 0);
    let adaLebihBayar = $derived(computed.statusSpt === 'lebih_bayar');

    const statusLabel: Record<string, string> = {
        nihil: 'Nihil',
        kurang_bayar: 'Kurang Bayar',
        lebih_bayar: 'Lebih Bayar'
    };
</script>

<div class="{currentTab === 'Induk' ? '' : 'tw:hidden'}">
    <div class="tw:mb-3 tw:flex tw:justify-end">
        <span class="tw:text-sm">Status SPT : <strong>{statusLabel[computed.statusSpt]}</strong></span>
    </div>
    <div class="accordion">
        <Accordion item={"HEADER"}>
            <Header
                tahunPajak={spt.tahunPajak}
                statusSpt={spt.statusSpt}
                bind:metodePembukuan
                bind:periodeBulanMulai
                bind:periodeBulanSelesai
                bind:sumberPenghasilan
                {readonly}
            />
        </Accordion>
        <Accordion item={"A. IDENTITAS WAJIB PAJAK"}>
            <A {identitas} bind:a7StatusKewajibanSuamiIstri bind:a8NpwpSuamiIstri {readonly} />
        </Accordion>
        <Accordion item={"B. IKHTISAR PENGHASILAN NETO"}>
            <B
                bind:b1aPenghasilanPekerjaan
                bind:b1b1PenghasilanUsaha
                bind:b1b2Oppt
                bind:b1b3Norma
                bind:b1b4Sektor
                bind:b1cPenghasilanDalamNegeriLainnya
                bind:b1dPenghasilanLuarNegeri
                bind:sumberPenghasilan
                {n1a}
                {n1b}
                {n1c}
                {n1d}
                {readonly}
            />
        </Accordion>
        <Accordion item={"C. PENGHITUNGAN PAJAK TERUTANG"}>
            <C
                {computed}
                bind:c3AdaPengurangPenghasilanNeto
                bind:c5PtkpStatus
                bind:c8AdaPengurangPphTerutang
                phMt={a7StatusKewajibanSuamiIstri === 'ph' || a7StatusKewajibanSuamiIstri === 'mt'}
                {readonly}
            />
        </Accordion>
        <Accordion item={"D. KREDIT PAJAK"}>
            <D
                bind:d10aAdaPphDipotongPihakLain
                {n10a}
                bind:d10bAngsuranPph25
                bind:d10cStpPph25
                bind:d10dAdaPengembalianKreditLuarNegeri
                bind:d10dJumlah
                {readonly}
            />
        </Accordion>
        <Accordion item={"E. PPh KURANG/LEBIH BAYAR"}>
            <E {computed} bind:e11bAdaSkPengangsuranPenundaan bind:e11bJumlah {readonly} />
        </Accordion>
        <Accordion item={"F. PEMBETULAN (DIISI JIKA STATUS SPT ADALAH PEMBETULAN)"}>
            <F {computed} {f12a} bind:f12aGantiSptSebelumnya aktif={adaPembetulan} {readonly} />
        </Accordion>
        <Accordion item={"G. PERMOHONAN PENGEMBALIAN PPh LEBIH BAYAR (DIISI JIKA STATUS SPT ADALAH LEBIH BAYAR)"}>
            <G
                bind:gMetodePengembalian
                bind:gNomorRekening
                bind:gNamaBank
                bind:gNamaPemilikRekening
                aktif={adaLebihBayar}
                {readonly}
            />
        </Accordion>
        <Accordion item={"H. ANGSURAN PPh PASAL 25 TAHUN PAJAK BERIKUTNYA"}>
            <H
                bind:h13aAngsuranTeratur
                bind:h13bPerhitunganTersendiri
                bind:h13cAngsuranOppt
                {l4AngsuranPph25}
                angsuranPph25={computed.angsuranPph25TahunDepan}
                jumlahBulan={computed.jumlahBulan}
                {readonly}
            />
        </Accordion>
        <Accordion item={"I. PERNYATAAN TRANSAKSI LAINNYA"}>
            <I
                {n14a}
                {n14b}
                {n14c}
                {n14d}
                bind:i14bMemilikiUtang
                bind:i14cPenghasilanFinal
                bind:i14dBukanObjekPajak
                bind:i14ePenyusutanAmortisasiFiskal
                bind:i14fBiayaEntertainment
                bind:i14gDividenLuarNegeri
                {b1b3Norma}
                {b1b1PenghasilanUsaha}
                bind:i14hKelebihanPphFinal
                {readonly}
            />
        </Accordion>
        <Accordion item={"J. LAMPIRAN TAMBAHAN"}>
            <J
                bind:jaLaporanKeuangan
                bind:jbBuktiZakat
                bind:jcBuktiPotongLuarNegeri
                bind:jdSuratKuasaKhusus
                bind:jeDokumenLainnya
                {readonly}
            />
        </Accordion>
        <Accordion item={"K. PERNYATAAN"}>
            <K {identitas} bind:pernyataanBenar bind:penandatangan {readonly} />
        </Accordion>
    </div>
</div>
