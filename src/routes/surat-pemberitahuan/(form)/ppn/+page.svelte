<script lang="ts">
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Footer from '$lib/components/surat-pemberitahuan/Footer.svelte';
	import Header from '$lib/components/surat-pemberitahuan/Header.svelte';
	import I from '$lib/components/surat-pemberitahuan/rekap/I.svelte';
	import II from '$lib/components/surat-pemberitahuan/rekap/II.svelte';
	import III from '$lib/components/surat-pemberitahuan/rekap/III.svelte';
	import IV from '$lib/components/surat-pemberitahuan/rekap/IV.svelte';
	import IX from '$lib/components/surat-pemberitahuan/rekap/IX.svelte';
	import V from '$lib/components/surat-pemberitahuan/rekap/V.svelte';
	import VI from '$lib/components/surat-pemberitahuan/rekap/VI.svelte';
	import VII from '$lib/components/surat-pemberitahuan/rekap/VII.svelte';
	import VIII from '$lib/components/surat-pemberitahuan/rekap/VIII.svelte';
	import X from '$lib/components/surat-pemberitahuan/rekap/X.svelte';
	import { tick } from 'svelte';
	import { newSptPpn } from '../../konsep/newSptPpn.remote';
	import { getSptPpn } from './getSptPpn.remote';
	import { postSptPpn } from './postSptPpn.remote';
	import { saveSptPpn } from './saveSptPpn.remote';

	const { id, readonly, taxpayer, blob } = await getSptPpn();
	const postForm = postSptPpn.for(id);
	const saveForm = saveSptPpn.for(id);
	const displayedBlob = $derived(postForm.result?.blob ?? blob);

	let switchMasaPajak = $state(blob.periodeBulan);
	let switchTahun = $state(blob.periodeTahun);

	async function handlePeriodeChange(bulan: number, tahun: number) {
		switchMasaPajak = bulan;
		switchTahun = tahun;
		await tick();
		await newSptPpn.submit();
	}
</script>

<form {...postForm} id="spt-post-form"></form>
<form {...newSptPpn} class="tw:hidden">
	<input type="hidden" name="masaPajak" value={switchMasaPajak} />
	<input type="hidden" name="tahun" value={switchTahun} />
</form>

<div class="accordion" id="accordionSPT">
	<form {...saveForm} id="spt-save-form">
		<input type="hidden" name="sptBlob" value={JSON.stringify(displayedBlob)} />
		<input type="hidden" name="sptPosted" value={postForm.result ? 'true' : ''} />
		<Accordion item="Header" target="#accordionSPT">
			<Header
				{readonly}
				postFormId="spt-post-form"
				npwp={taxpayer.npwp}
				namaPKP={taxpayer.nama}
				alamat={taxpayer.alamat}
				noTelepon={taxpayer.noTelepon}
				teleponSeluler={taxpayer.teleponSeluler}
				klasifikasiLapanganUsaha={taxpayer.klasifikasiLapanganUsaha}
				periode={{ bulan: displayedBlob.periodeBulan, tahun: displayedBlob.periodeTahun }}
				onPeriodeChange={handlePeriodeChange}
			/>
		</Accordion>
		<Accordion item="I. PENYERAHAN BARANG DAN JASA" target="#accordionSPT"><I sptItem={displayedBlob.I} /></Accordion>
		<Accordion item="II. PEROLEHAN BARANG DAN JASA" target="#accordionSPT"><II sptItem={displayedBlob.II} /></Accordion>
		<Accordion item="III. PERHITUNGAN PPN KURANG BAYAR / LEBIH BAYAR" target="#accordionSPT">
			<III sptItem={displayedBlob.III} />
		</Accordion>
		<Accordion item="IV. PPN TERUTANG ATAS KEGIATAN MEMBANGUN SENDIRI" target="#accordionSPT">
			<IV sptItem={displayedBlob.IV} />
		</Accordion>
		<Accordion item="V. PEMBAYARAN KEMBALI PAJAK MASUKAN YANG TIDAK DAPAT DIKREDITKAN" target="#accordionSPT">
			<V sptItem={displayedBlob.V} />
		</Accordion>
		<Accordion item="VI. PAJAK PENJUALAN ATAS BARANG MEWAH" target="#accordionSPT"><VI sptItem={displayedBlob.VI} /></Accordion>
		<Accordion item="VII. PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PEMUNGUT PPN" target="#accordionSPT">
			<VII sptItem={displayedBlob.VII} />
		</Accordion>
		<Accordion item="VIII. PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PIHAK LAIN" target="#accordionSPT">
			<VIII sptItem={displayedBlob.VIII} />
		</Accordion>
		<Accordion item="IX. KELENGKAPAN" target="#accordionSPT"><IX sptItem={displayedBlob.IX} /></Accordion>
		<Accordion item="X. PERNYATAAN" target="#accordionSPT"><X sptItem={displayedBlob.X} /></Accordion>

		<Footer {readonly} saveFormId="spt-save-form" reportFormId="spt-save-form" />
	</form>
</div>
