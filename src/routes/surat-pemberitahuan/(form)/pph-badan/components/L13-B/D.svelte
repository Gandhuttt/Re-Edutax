<script lang="ts">
	import { FormSection, RupiahField, Stack } from "$lib/re-ui-components";

	let {
		jumlahTambahanPengurangLitbang,
		termanfaatkanTahunSebelumnya = $bindable(),
		penghasilanKenaPajakSebelumFasilitas,
		readonly = false,
	}: {
		jumlahTambahanPengurangLitbang: number;
		termanfaatkanTahunSebelumnya: number;
		penghasilanKenaPajakSebelumFasilitas: number;
		readonly?: boolean;
	} = $props();

	let belumTermanfaatkanTahunIni = $derived(
		jumlahTambahanPengurangLitbang - Number(termanfaatkanTahunSebelumnya || 0),
	);
	let batas40Persen = $derived(0.4 * Number(penghasilanKenaPajakSebelumFasilitas || 0));
	let dapatDibebankanTahunIni = $derived(Math.max(0, Math.min(belumTermanfaatkanTahunIni, batas40Persen)));
	let sisaBelumTermanfaatkan = $derived(belumTermanfaatkanTahunIni - dapatDibebankanTahunIni);
</script>

<FormSection title="Penghitungan tambahan pengurang penghasilan bruto" padded>
	<Stack gap="16px">
		<RupiahField
			label="1. Jumlah tambahan pengurang penghasilan bruto penelitian dan pengembangan"
			value={jumlahTambahanPengurangLitbang}
			readonly
		/>
		<RupiahField
			label="2. Jumlah tambahan pengurangan penghasilan bruto penelitian dan pengembangan yang termanfaatkan tahun-tahun sebelumnya"
			bind:value={termanfaatkanTahunSebelumnya}
			disabled={readonly}
		/>
		<RupiahField
			label="3. Jumlah tambahan pengurangan penghasilan bruto penelitian dan pengembangan yang belum termanfaatkan tahun ini"
			value={belumTermanfaatkanTahunIni}
			readonly
		/>
		<RupiahField
			label="4. 40% × penghasilan kena pajak sebelum fasilitas"
			value={batas40Persen}
			readonly
		/>
		<RupiahField
			label="5. Tambahan pengurang penghasilan bruto penelitian dan pengembangan yang dapat dibebankan pada tahun ini"
			value={dapatDibebankanTahunIni}
			readonly
		/>
		<RupiahField
			label="6. Sisa tambahan pengurangan penghasilan bruto penelitian dan pengembangan yang belum termanfaatkan tahun ini"
			value={sisaBelumTermanfaatkan}
			readonly
		/>
	</Stack>
</FormSection>
