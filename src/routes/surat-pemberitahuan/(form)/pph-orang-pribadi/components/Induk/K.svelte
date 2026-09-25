<script lang="ts">
    import { CheckboxField, FieldGrid, FormField, RadioGroup, Stack } from "$lib/re-ui-components";

    interface Props {
        identitas: { npwp: string; nama: string } | null;
        pernyataanBenar: boolean;
        penandatangan: string;
        readonly?: boolean;
    }

    let {
        identitas,
        pernyataanBenar = $bindable(),
        penandatangan = $bindable(),
        readonly = false
    }: Props = $props();

    let penandatanganOptions = $derived([
        { value: 'wajib_pajak', label: 'Wajib Pajak', disabled: readonly },
        { value: 'kuasa_wajib_pajak', label: 'Kuasa Wajib Pajak', disabled: readonly }
    ]);
</script>

<Stack gap="18px">
    <CheckboxField
        label="Pernyataan kebenaran dan kelengkapan SPT"
        description="Dengan menyadari sepenuhnya akan segala akibatnya, saya menyatakan bahwa apa yang telah saya beritahukan di atas beserta lampiran-lampirannya adalah benar, lengkap dan jelas."
        bind:checked={pernyataanBenar}
        required
        disabled={readonly}
    />
    <RadioGroup
        label="Penandatangan"
        name="Penandatangan"
        bind:value={penandatangan}
        options={penandatanganOptions}
        required
    />
    <FieldGrid columns={2}>
        <FormField label="NPWP" value={identitas?.npwp ?? ''} disabled />
        <FormField label="Nama Lengkap" value={identitas?.nama ?? ''} disabled />
    </FieldGrid>
</Stack>
