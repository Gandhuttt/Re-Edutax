<script lang="ts">
	import { FormSection, RadioGroup, Stack } from '$lib/re-ui-components';

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		hubunganA: boolean;
		hubunganB: boolean;
		hubunganC: boolean;
		hubunganD: boolean;
		transaksiA: boolean;
		transaksiB: boolean;
		transaksiC: boolean;
		dokumentasiA: boolean;
		dokumentasiB: boolean;
		dokumentasiC: boolean;
		dokumentasiD: boolean;
		dokumentasiE: boolean;
		dokumenA: boolean;
		dokumenB: boolean;
		dokumenC: boolean;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		hubunganA = $bindable(),
		hubunganB = $bindable(),
		hubunganC = $bindable(),
		hubunganD = $bindable(),
		transaksiA = $bindable(),
		transaksiB = $bindable(),
		transaksiC = $bindable(),
		dokumentasiA = $bindable(),
		dokumentasiB = $bindable(),
		dokumentasiC = $bindable(),
		dokumentasiD = $bindable(),
		dokumentasiE = $bindable(),
		dokumenA = $bindable(),
		dokumenB = $bindable(),
		dokumenC = $bindable(),
		readonly = false
	}: Props = $props();

	$effect(() => {
		currentTab.title =
			currentTab.tab === 'L10-B'
				? 'PERNYATAAN TERKAIT TRANSAKSI YANG DIPENGARUHI HUBUNGAN ISTIMEWA'
				: currentTab.title;
	});

	const yesNoOptions = $derived([
		{ value: 'false', label: 'Tidak', disabled: readonly },
		{ value: 'true', label: 'Ya', disabled: readonly }
	]);
</script>

<div id="spt-panel-l10-b" role="tabpanel" hidden={currentTab.tab !== 'L10-B'}>
	<Stack gap="16px">
		<FormSection
			number="1."
			title="Mengenai Hubungan Istimewa"
			description="Bahwasanya kami telah menerapkan Prinsip Kewajaran dan Kelaziman Usaha."
			bordered
		>
			<Stack gap="12px">
				<RadioGroup
					label="Transaksi dengan pihak yang memiliki hubungan istimewa karena kepemilikan saham/penyertaan"
					name="hubunganA"
					value={hubunganA ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (hubunganA = value === 'true')}
				/>
				<RadioGroup
					label="Transaksi dengan pihak yang memiliki hubungan istimewa karena penguasaan"
					name="hubunganB"
					value={hubunganB ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (hubunganB = value === 'true')}
				/>
				<RadioGroup
					label="Transaksi dengan pihak yang memiliki hubungan istimewa karena hubungan keluarga"
					name="hubunganC"
					value={hubunganC ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (hubunganC = value === 'true')}
				/>
				<RadioGroup
					label="Transaksi yang dilakukan antarpihak yang tidak memiliki hubungan istimewa tetapi Pihak Afiliasi dari salah satu atau kedua pihak yang bertransaksi tersebut menentukan lawan transaksi dan harga transaksi"
					name="hubunganD"
					value={hubunganD ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (hubunganD = value === 'true')}
				/>
			</Stack>
		</FormSection>

		<FormSection
			number="2."
			title="Mengenai Transaksi"
			description="Bahwasanya kami telah menerapkan Prinsip Kewajaran dan Kelaziman Usaha."
			bordered
		>
			<Stack gap="12px">
				<RadioGroup
					label="Berdasarkan keadaan yang sebenarnya."
					name="transaksiA"
					value={transaksiA ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (transaksiA = value === 'true')}
				/>
				<RadioGroup
					label="Pada saat Penentuan Harga Transfer dan/atau saat terjadinya Transaksi yang dipengaruhi Hubungan Istimewa."
					name="transaksiB"
					value={transaksiB ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (transaksiB = value === 'true')}
				/>
				<RadioGroup
					label="Sesuai dengan tahapan penerapan Prinsip Kewajaran dan Kelaziman Usaha; dan tahapan pendahuluan dalam hal terdapat Transaksi Yang Dipengaruhi Hubungan Istimewa tertentu."
					name="transaksiC"
					value={transaksiC ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (transaksiC = value === 'true')}
				/>
			</Stack>
		</FormSection>

		<FormSection
			number="3."
			title="Mengenai Dokumentasi Penerapan Prinsip Kewajaran dan Kelaziman Usaha"
			description="Bahwasanya kami memiliki kriteria dokumentasi berikut."
			bordered
		>
			<Stack gap="12px">
				<RadioGroup
					label="a. nilai peredaran bruto tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp50.000.000.000,00 (lima puluh miliar rupiah);"
					name="dokumentasiA"
					value={dokumentasiA ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumentasiA = value === 'true')}
				/>
				<RadioGroup
					label="b. nilai Transaksi Afiliasi tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp20.000.000.000,00 (dua puluh miliar rupiah) untuk transaksi barang berwujud;"
					name="dokumentasiB"
					value={dokumentasiB ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumentasiB = value === 'true')}
				/>
				<RadioGroup
					label="c. nilai Transaksi Afiliasi tahun pajak sebelumnya dalam satu tahun pajak lebih dari Rp5.000.000.000,00 (5 miliar rupiah) untuk masing-masing penyediaan jasa, pembayaran bunga, pemanfaatan barang tidak berwujud, atau Transaski Afiliasi lainnya;"
					name="dokumentasiC"
					value={dokumentasiC ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumentasiC = value === 'true')}
				/>
				<RadioGroup
					label="d. Pihak Afiliasi yang berada di negara atau yuridikasi dengan tarif pajak penghasilan lebih rendah daripada tarif pajak penghasilan"
					name="dokumentasiD"
					value={dokumentasiD ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumentasiD = value === 'true')}
				/>
				<RadioGroup
					label="e. Grup Usaha dengan peredaran bruto konsolidasi paling sedikit Rp11.000.000.000.000,00 (sebelas triliun rupiah) pada tahun pajak sebelumnya"
					name="dokumentasiE"
					value={dokumentasiE ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumentasiE = value === 'true')}
				/>
			</Stack>
		</FormSection>

		<FormSection
			number="4."
			title="Mengenai Dokumen Penentuan Harga Transfer"
			description="Bahwasanya kami telah menyelenggarakan dokumen berikut."
			bordered
		>
			<Stack gap="12px">
				<RadioGroup
					label="Dokumen Induk"
					name="dokumenA"
					value={dokumenA ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumenA = value === 'true')}
				/>
				<RadioGroup
					label="Dokumen Lokal"
					name="dokumenB"
					value={dokumenB ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumenB = value === 'true')}
				/>
				<RadioGroup
					label="Laporan per Negara"
					name="dokumenC"
					value={dokumenC ? 'true' : 'false'}
					options={yesNoOptions}
					onchange={(value) => (dokumenC = value === 'true')}
				/>
			</Stack>
		</FormSection>
	</Stack>
</div>
