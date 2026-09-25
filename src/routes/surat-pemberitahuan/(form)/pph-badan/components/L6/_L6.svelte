<script lang="ts">
	import { FormSection, RupiahField, Stack } from "$lib/re-ui-components";

	interface Props {
		currentTab: {
			tab: string;
			title: string;
		};
		dasarAngsuran: number;
		kompensasiKerugian: number;
		pphTerutang: number;
		kreditPajakTahunLalu: number;
		onKompensasiKerugianEdit?: () => void;
		onPphTerutangEdit?: () => void;
		readonly?: boolean;
	}

	let {
		currentTab = $bindable(),
		dasarAngsuran = $bindable(),
		kompensasiKerugian = $bindable(),
		pphTerutang = $bindable(),
		kreditPajakTahunLalu = $bindable(),
		onKompensasiKerugianEdit,
		onPphTerutangEdit,
		readonly = false
	}: Props = $props();

	$effect(() => {
		currentTab.title = currentTab.tab === "L6" ? "ANGSURAN PAJAK PENGHASILAN TAHUN PAJAK BERJALAN" : currentTab.title;
	});

	let penghasilanKenaPajak = $derived(Number(dasarAngsuran || 0) - Number(kompensasiKerugian || 0));
	let pphDibayarSendiri = $derived(Number(pphTerutang || 0) - Number(kreditPajakTahunLalu || 0));
	let angsuranPph25 = $derived(Math.floor(pphDibayarSendiri / 12));
</script>

<div id="spt-panel-l6" role="tabpanel" hidden={currentTab.tab !== "L6"}>
	<FormSection title="Angsuran Pajak Penghasilan Tahun Pajak Berjalan" bordered>
		<Stack gap="16px">
			<RupiahField
				label="1. Penghasilan yang menjadi dasar penghitungan angsuran"
				bind:value={dasarAngsuran}
				disabled={readonly}
			/>
			<RupiahField
				label="2. Kompensasi kerugian fiskal (Diisi dari Formulir Lampiran-07 Jumlah Kompensasi Kerugian Fiskal Tahun Pajak Berjalan)"
				bind:value={kompensasiKerugian}
				disabled={readonly}
				oninput={() => onKompensasiKerugianEdit?.()}
			/>
			<RupiahField label="3. Penghasilan kena pajak" value={penghasilanKenaPajak} disabled />
			<RupiahField
				label="4. PPh yang terutang (Diisi dari Formulir Lampiran-08 Jumlah PPh Terutang)"
				bind:value={pphTerutang}
				disabled={readonly}
				oninput={() => onPphTerutangEdit?.()}
			/>
			<RupiahField
				label="5. Kredit pajak tahun pajak yang lalu atas penghasilan yang termasuk dalam angka 1 yang dipotong/dipungut pihak lain"
				bind:value={kreditPajakTahunLalu}
				disabled={readonly}
			/>
			<RupiahField label="6. PPh yang harus dibayar sendiri" value={pphDibayarSendiri} disabled />
			<RupiahField label="7. Angsuran PPh Pasal 25" value={angsuranPph25} disabled />
		</Stack>
	</FormSection>
</div>
