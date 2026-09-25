<script lang="ts">
	import {
		CheckboxField,
		DateField,
		FieldGrid,
		FormSection,
		Stack
	} from '$lib/re-ui-components';

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		dokumenIndukA: boolean;
		dokumenIndukB: boolean;
		dokumenIndukC: boolean;
		dokumenIndukD: boolean;
		dokumenIndukE: boolean;
		dokumenLokalA: boolean;
		dokumenLokalB: boolean;
		dokumenLokalC: boolean;
		dokumenLokalD: boolean;
		dokumenLokalE: boolean;
		tanggalDokumenIndukTersedia: string;
		tanggalDokumenLokalTersedia: string;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		dokumenIndukA = $bindable(),
		dokumenIndukB = $bindable(),
		dokumenIndukC = $bindable(),
		dokumenIndukD = $bindable(),
		dokumenIndukE = $bindable(),
		dokumenLokalA = $bindable(),
		dokumenLokalB = $bindable(),
		dokumenLokalC = $bindable(),
		dokumenLokalD = $bindable(),
		dokumenLokalE = $bindable(),
		tanggalDokumenIndukTersedia = $bindable(),
		tanggalDokumenLokalTersedia = $bindable(),
		readonly = false
	}: Props = $props();

	$effect(() => {
		currentTab.title =
			currentTab.tab === 'L10-D'
				? 'IKHTISAR DOKUMEN INDUK DAN DOKUMEN LOKAL'
				: currentTab.title;
	});
</script>

<div id="spt-panel-l10-d" role="tabpanel" hidden={currentTab.tab !== 'L10-D'}>
	<Stack gap="16px">
		<FormSection
			number="I."
			title="Ikhtisar Dokumen Induk"
			description="Bahwasanya kami telah menyelenggarakan dokumen induk yang menjadi dasar penerapan Prinsip Kewajaran dan Kelaziman Usaha (arm's length principle), yang memuat informasi mengenai grup usaha sebagai berikut:"
			bordered
		>
			<Stack gap="10px">
				<CheckboxField
					label="Struktur dan bagan kepemilikan grup usaha serta negara atau yurisdiksi masing-masing anggota grup usaha"
					bind:checked={dokumenIndukA}
					disabled={readonly}
				/>
				<CheckboxField
					label="Kegiatan usaha yang dilakukan oleh grup usaha"
					bind:checked={dokumenIndukB}
					disabled={readonly}
				/>
				<CheckboxField
					label="Harta tidak berwujud yang dimiliki grup usaha"
					bind:checked={dokumenIndukC}
					disabled={readonly}
				/>
				<CheckboxField
					label="Aktivitas pembiayaan dan keuangan dalam grup usaha"
					bind:checked={dokumenIndukD}
					disabled={readonly}
				/>
				<CheckboxField
					label="Laporan keuangan konsolidasi entitas induk dan informasi perpajakan terkait transaksi afiliasi"
					bind:checked={dokumenIndukE}
					disabled={readonly}
				/>
			</Stack>
		</FormSection>

		<FormSection
			number="II."
			title="Ikhtisar Dokumen Lokal"
			description="Bahwasanya kami telah menyelenggarakan dokumen lokal yang menjadi dasar penerapan Prinsip Kewajaran dan Kelaziman Usaha (arm's length principle), yang memuat informasi mengenai grup usaha sebagai berikut:"
			bordered
		>
			<Stack gap="10px">
				<CheckboxField
					label="Identitas dan kegiatan usaha yang dilakukan Wajib Pajak"
					bind:checked={dokumenLokalA}
					disabled={readonly}
				/>
				<CheckboxField
					label="Informasi transaksi afiliasi dan transaksi independen yang dilakukan Wajib Pajak"
					bind:checked={dokumenLokalB}
					disabled={readonly}
				/>
				<CheckboxField
					label="Penerapan prinsip kewajaran dan kelaziman usaha"
					bind:checked={dokumenLokalC}
					disabled={readonly}
				/>
				<CheckboxField
					label="Informasi Keuangan Wajib Pajak"
					bind:checked={dokumenLokalD}
					disabled={readonly}
				/>
				<CheckboxField
					label="Peristiwa-peristiwa/kejadian-kejadian/fakta-fakta non keuangan yang mempengaruhi pembentukan harga atau tingkat laba"
					bind:checked={dokumenLokalE}
					disabled={readonly}
				/>
			</Stack>
		</FormSection>

		<FormSection
			number="III."
			title="Pernyataan Penyelenggaraan dan Penyediaan Dokumen Induk dan Dokumen Lokal"
			description="Bahwasanya kami telah menyelenggarakan dokumen induk dan dokumen lokal berdasarkan data dan informasi yang tersedia saat dilakukannya Transaksi Afililasi."
			bordered
		>
			<FieldGrid columns={2} gap="16px 18px">
				<DateField
					label="1. Dokumen Induk telah tersedia pada tanggal"
					bind:value={tanggalDokumenIndukTersedia}
					disabled={readonly}
				/>
				<DateField
					label="2. Dokumen Lokal telah tersedia pada tanggal"
					bind:value={tanggalDokumenLokalTersedia}
					disabled={readonly}
				/>
			</FieldGrid>
		</FormSection>
	</Stack>
</div>
