<script lang="ts">
	import { formatMonth } from '$lib/helpers/date';
	import {
		ActionButton,
		FieldGrid,
		KeyValueGrid,
		SelectField,
		Stack
	} from '$lib/re-ui-components';
	import { untrack } from 'svelte';

	const currentDate = new Date();
	const monthOptions = Array.from({ length: 12 }, (_, index) => ({
		value: index + 1,
		label: formatMonth(index + 1)
	}));
	const yearOptions = Array.from({ length: 6 }, (_, index) => ({
		value: currentDate.getFullYear() - 3 + index,
		label: String(currentDate.getFullYear() - 3 + index)
	}));

	const {
		namaPKP = '',
		alamat = '',
		noTelepon = '',
		teleponSeluler = '',
		npwp = '',
		klasifikasiLapanganUsaha = '',
		periode = { bulan: currentDate.getMonth() + 1, tahun: currentDate.getFullYear() },
		readonly = true,
		postFormId,
		showPostButton = true,
		onPeriodeChange
	}: {
		namaPKP?: string;
		alamat?: string;
		noTelepon?: string;
		teleponSeluler?: string;
		npwp?: string;
		klasifikasiLapanganUsaha?: string;
		periode?: { bulan: number; tahun: number };
		readonly?: boolean;
		postFormId?: string;
		showPostButton?: boolean;
		onPeriodeChange?: (bulan: number, tahun: number) => void;
	} = $props();

	let selectedMonth = $state<number>(untrack(() => periode.bulan));
	let selectedYear = $state<number>(untrack(() => periode.tahun));

	$effect(() => {
		selectedMonth = periode.bulan;
		selectedYear = periode.tahun;
	});
</script>

<Stack gap="18px">
	<KeyValueGrid
		columns={3}
		items={[
			{ label: 'Nama Pengusaha Kena Pajak', value: namaPKP || '—' },
			{ label: 'NPWP', value: npwp || '—' },
			{ label: 'Klasifikasi Lapangan Usaha', value: klasifikasiLapanganUsaha || '—' },
			{ label: 'Alamat', value: alamat || '—' },
			{ label: 'Nomor Telepon', value: noTelepon || '—' },
			{ label: 'Telepon Seluler', value: teleponSeluler || '—' }
		]}
	/>

	<FieldGrid columns={3}>
		<SelectField
			label="Masa Pajak"
			options={monthOptions}
			bind:value={selectedMonth}
			onchange={(value) => onPeriodeChange?.(Number(value), selectedYear)}
		/>
		<SelectField
			label="Tahun Pajak"
			options={yearOptions}
			bind:value={selectedYear}
			onchange={(value) => onPeriodeChange?.(selectedMonth, Number(value))}
		/>
		<KeyValueGrid
			columns={1}
			compact
			items={[
				{ label: 'Periode Pembukuan', value: '01–12' },
				{ label: 'Jenis Pelaporan', value: 'Normal' }
			]}
		/>
	</FieldGrid>

	{#if !readonly && showPostButton}
		<Stack direction="horizontal" gap="8px" wrap>
			<ActionButton type="submit" form={postFormId} tone="secondary">Posting SPT</ActionButton>
		</Stack>
	{/if}
</Stack>
