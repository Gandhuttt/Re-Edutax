<script lang="ts">
    import {
        ActionButton,
        FieldGrid,
        FormField,
        MultiSelectField,
        SelectField,
        Stack
    } from "$lib/re-ui-components";

    interface Props {
        tahunPajak: number;
        statusSpt: string;
        metodePembukuan: string;
        periodeBulanMulai: number;
        periodeBulanSelesai: number;
        sumberPenghasilan: string[];
        readonly?: boolean;
        postFormId?: string;
    }

    let {
        tahunPajak,
        statusSpt,
        metodePembukuan = $bindable(),
        periodeBulanMulai = $bindable(),
        periodeBulanSelesai = $bindable(),
        sumberPenghasilan = $bindable(),
        readonly = false,
        postFormId
    }: Props = $props();

    const metodeOptions = [
        { value: 'pembukuan_akrual', label: 'Pembukuan stelsel akrual' },
        { value: 'pembukuan_kas', label: 'Pembukuan stelsel kas' },
        { value: 'pencatatan', label: 'Pencatatan' }
    ];

    const bulanOptions = Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: String(index + 1)
    }));

    const sumberOptions = [
        { value: 'kegiatan_usaha', label: 'Kegiatan Usaha' },
        { value: 'pekerjaan', label: 'Pekerjaan' },
        { value: 'pekerjaan_bebas', label: 'Pekerjaan Bebas' }
    ];
</script>

<Stack gap="18px">
    <FieldGrid columns={2}>
        <FormField label="Tahun Pajak/Bagian Tahun Pajak" value={String(tahunPajak)} disabled />
        <FormField
            label="Status"
            value={statusSpt === 'pembetulan' ? 'Pembetulan' : 'Normal'}
            disabled
        />
        <SelectField
            label="Metode Pembukuan/Pencatatan"
            bind:value={metodePembukuan}
            options={metodeOptions}
            disabled={readonly}
        />
        <MultiSelectField
            label="Sumber Penghasilan"
            bind:value={sumberPenghasilan}
            options={sumberOptions}
            placeholder="Pilih sumber penghasilan"
            required
            disabled={readonly}
        />
    </FieldGrid>

    <FieldGrid columns={2}>
        <SelectField
            label="Periode Pembukuan Mulai"
            bind:value={periodeBulanMulai}
            options={bulanOptions}
            disabled={readonly}
        />
        <SelectField
            label="Periode Pembukuan Selesai"
            bind:value={periodeBulanSelesai}
            options={bulanOptions}
            disabled={readonly}
        />
    </FieldGrid>

    <Stack direction="horizontal" gap="8px" wrap>
        <ActionButton
            type="submit"
            form={postFormId}
            name="action"
            value="Post"
            tone="secondary"
            disabled={readonly}
        >Prefill SPT</ActionButton>
    </Stack>
</Stack>
