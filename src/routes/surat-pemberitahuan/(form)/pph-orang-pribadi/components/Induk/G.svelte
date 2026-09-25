<script lang="ts">
    import { FieldGrid, FormField, SelectField } from "$lib/re-ui-components";

    interface Props {
        gMetodePengembalian: string;
        gNomorRekening: string;
        gNamaBank: string;
        gNamaPemilikRekening: string;
        aktif: boolean;
        readonly?: boolean;
    }

    let {
        gMetodePengembalian = $bindable(),
        gNomorRekening = $bindable(),
        gNamaBank = $bindable(),
        gNamaPemilikRekening = $bindable(),
        aktif,
        readonly = false
    }: Props = $props();

    const metodeOptions = [
        { value: '', label: '' },
        { value: 'pemeriksaan', label: 'Pengembalian melalui pemeriksaan' },
        { value: 'pengembalian_pendahuluan', label: 'Pengembalian pendahuluan kelebihan pembayaran pajak' }
    ];
</script>

<FieldGrid columns={2}>
    <SelectField
        label="PPh lebih bayar pada 11a atau 12b mohon"
        bind:value={gMetodePengembalian}
        options={metodeOptions}
        disabled={readonly || !aktif}
    />
    <FormField
        label="Nomor Rekening"
        bind:value={gNomorRekening}
        disabled={readonly || !aktif}
    />
    <FormField label="Nama Bank" bind:value={gNamaBank} disabled={readonly || !aktif} />
    <FormField
        label="Nama Pemilik Rekening"
        bind:value={gNamaPemilikRekening}
        disabled={readonly || !aktif}
    />
</FieldGrid>
