<script lang="ts">
    import { FieldGrid, FormField, SelectField } from "$lib/re-ui-components";

    interface Props {
        identitas: { npwp: string; nama: string; email: string; nomorTelepon: string | null } | null;
        a7StatusKewajibanSuamiIstri: string;
        a8NpwpSuamiIstri: string;
        readonly?: boolean;
    }

    let {
        identitas,
        a7StatusKewajibanSuamiIstri = $bindable(),
        a8NpwpSuamiIstri = $bindable(),
        readonly = false
    }: Props = $props();

    const statusOptions = [
        { value: '', label: '' },
        { value: 'ph', label: 'Pisah Harta (PH)' },
        { value: 'mt', label: 'Memilih Terpisah (MT)' }
    ];
</script>

<FieldGrid columns={2}>
    <FormField label="1. NIK/NPWP" value={identitas?.npwp ?? ''} disabled />
    <FormField label="2. Nama" value={identitas?.nama ?? ''} disabled />
    <FormField label="3. Jenis ID" value="KTP" disabled />
    <FormField label="4. No. ID" value={identitas?.npwp ?? ''} disabled />
    <FormField label="5. No. Telepon" value={identitas?.nomorTelepon ?? ''} disabled />
    <FormField label="6. Email" value={identitas?.email ?? ''} disabled />
    <SelectField
        label="7. Status Kewajiban Perpajakan Suami dan Istri (isi jika status adalah PH/MT)"
        bind:value={a7StatusKewajibanSuamiIstri}
        options={statusOptions}
        disabled={readonly}
    />
    <FormField label="8. NIK/NPWP Suami/Istri" value={a8NpwpSuamiIstri} disabled />
</FieldGrid>
