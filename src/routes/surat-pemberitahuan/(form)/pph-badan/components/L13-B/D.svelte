<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import InputGroup from "$lib/components/InputGroup.svelte";
    import Label from "$lib/components/Label.svelte";

    let {
        jumlahTambahanPengurangLitbang,
        termanfaatkanTahunSebelumnya = $bindable(),
        readonly = false
    }: {
        jumlahTambahanPengurangLitbang: number;
        termanfaatkanTahunSebelumnya: number;
        readonly?: boolean;
    } = $props();

    const rupiah = new Intl.NumberFormat('id-ID');

    let belumTermanfaatkanTahunIni = $derived(
        jumlahTambahanPengurangLitbang - Number(termanfaatkanTahunSebelumnya || 0)
    );

    const batas40Persen = 0;

    let dapatDibebankanTahunIni = $derived(Math.min(belumTermanfaatkanTahunIni, batas40Persen));

    let sisaBelumTermanfaatkan = $derived(belumTermanfaatkanTahunIni - dapatDibebankanTahunIni);
</script>

<div class="tw:p-5 tw:flex tw:flex-col tw:gap-3">
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">1. JUMLAH TAMBAHAN PENGURANG PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"text"} value={rupiah.format(jumlahTambahanPengurangLitbang)} readonly>Rp.</InputGroup>
    </Label>
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">2. JUMLAH TAMBAHAN PENGURANGAN PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN YANG TERMANFAATKAN TAHUN-TAHUN SEBELUMNYA</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"number"} bind:value={termanfaatkanTahunSebelumnya} disabled={readonly}>Rp.</InputGroup>
    </Label>
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">3. JUMLAH TAMBAHAN PENGURANGAN PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN YANG BELUM TERMANFAATKAN TAHUN INI</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"text"} value={rupiah.format(belumTermanfaatkanTahunIni)} readonly>Rp.</InputGroup>
    </Label>
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">4. 40% x PENGHASILAN KENA PAJAK SEBELUM FASILITAS</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"text"} value={rupiah.format(batas40Persen)} readonly>Rp.</InputGroup>
    </Label>
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">5. TAMBAHAN PENGURANG PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN YANG DAPAT DIBEBANKAN PADA TAHUN INI</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"text"} value={rupiah.format(dapatDibebankanTahunIni)} readonly>Rp.</InputGroup>
    </Label>
    <Label class={"tw:flex! tw:flex-row tw:w-full tw:items-center"}>
        <span class="tw:flex tw:w-full tw:text-sm">6. SISA TAMBAHAN PENGURANGAN PENGHASILAN BRUTO PENELITIAN DAN PENGEMBANGAN YANG BELUM TERMANFAATKAN TAHUN INI</span>
        <InputGroup class={"tw:w-[25rem]! tw:text-right"} type={"text"} value={rupiah.format(sisaBelumTermanfaatkan)} readonly>Rp.</InputGroup>
    </Label>
</div>
