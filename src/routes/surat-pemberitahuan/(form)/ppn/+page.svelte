<script lang="ts">
	import Accordion from '$lib/components/AccordionItem.svelte';
	import Footer from '../Footer.svelte';
	import Header from '../Header.svelte';
	import Navbar from '../Navbar.svelte';
	import I from './components/I.svelte';
	import II from './components/II.svelte';
	import III from './components/III.svelte';
	import IV from './components/IV.svelte';
	import IX from './components/IX.svelte';
	import LampiranA1 from './components/LampiranA1.svelte';
	import LampiranA2 from './components/LampiranA2.svelte';
	import LampiranB1 from './components/LampiranB1.svelte';
	import LampiranB2 from './components/LampiranB2.svelte';
	import LampiranB3 from './components/LampiranB3.svelte';
	import LampiranC from './components/LampiranC.svelte';
	import V from './components/V.svelte';
	import VI from './components/VI.svelte';
	import VII from './components/VII.svelte';
	import VIII from './components/VIII.svelte';
	import X from './components/X.svelte';
	import { tick } from 'svelte';
	import { newSptPpn } from '../../konsep/newSptPpn.remote';
	import { getSptPpn } from './getSptPpn.remote';
	import { postSptPpn } from './postSptPpn.remote';
	import { saveSptPpn } from './saveSptPpn.remote';
	import { uploadRetailInvoiceXml } from './uploadRetailInvoiceXml.remote';

	const { id, readonly, taxpayer, spt, lampiranA2, lampiranB2, lampiranC } = await getSptPpn();
	const postForm = postSptPpn.for(id);
	const saveForm = saveSptPpn.for(id);
	const uploadForm = uploadRetailInvoiceXml.for(id);
	const displayedSpt = $derived(
		postForm.result
			? { ...spt, ...postForm.result.fields }
			: uploadForm.result
				? { ...spt, ...uploadForm.result.fields }
				: spt
	);
	const displayedLampiranA2 = $derived(postForm.result?.lampiran.a2 ?? lampiranA2);
	const displayedLampiranB2 = $derived(postForm.result?.lampiran.b2 ?? lampiranB2);
	const displayedLampiranC = $derived(postForm.result?.lampiran.c ?? lampiranC);

	let currentTab = $state('Induk');
	const tabs = [
		{ tab: 'Induk', visibility: true },
		{ tab: 'A-1', visibility: true },
		{ tab: 'A-2', visibility: true },
		{ tab: 'B-1', visibility: true },
		{ tab: 'B-2', visibility: true },
		{ tab: 'B-3', visibility: true },
		{ tab: 'C', visibility: true }
	];

	let switchMasaPajak = $state(spt.masaPajak);
	let switchTahun = $state(spt.tahun);

	async function handlePeriodeChange(bulan: number, tahun: number) {
		switchMasaPajak = bulan;
		switchTahun = tahun;
		await tick();
		await newSptPpn.submit();
	}
</script>

<form {...postForm} id="spt-post-form"></form>
<form {...uploadForm} id="upload-retail-invoice-form" enctype="multipart/form-data">
	<input type="hidden" name="id" value={id} />
</form>
<form {...newSptPpn} class="tw:hidden">
	<input type="hidden" name="masaPajak" value={switchMasaPajak} />
	<input type="hidden" name="tahun" value={switchTahun} />
</form>

<form {...saveForm} id="spt-save-form">
	<Navbar {tabs} bind:currentTab />

	<div class={currentTab === 'A-1' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">DAFTAR EKSPOR BKP, BKP TIDAK BERWUJUD DAN/ATAU JKP</h3>
	</div>
	<div class={currentTab === 'A-2' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">DAFTAR PAJAK KELUARAN ATAS PENYERAHAN DALAM NEGERI DENGAN FAKTUR PAJAK</h3>
	</div>
	<div class={currentTab === 'B-1' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">DAFTAR PAJAK MASUKAN ATAS DOKUMEN TERTENTU YANG DIPERLAKUKAN SEBAGAI FAKTUR PAJAK</h3>
	</div>
	<div class={currentTab === 'B-2' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">DAFTAR PAJAK MASUKAN YANG DAPAT DIKREDITKAN ATAS PEROLEHAN BKP/JKP DALAM NEGERI</h3>
	</div>
	<div class={currentTab === 'B-3' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">
			DAFTAR PAJAK MASUKAN YANG DAPAT DIKREDITKAN ATAS IMPOR BKP DAN PEMANFAATAN BKP TIDAK
			BERWUJUD/JKP DARI LUAR DAERAH PABEAN
		</h3>
	</div>
	<div class={currentTab === 'C' ? '' : 'tw:hidden'}>
		<h3 class="tw:text-lg">DAFTAR PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PEMUNGUT PPN</h3>
	</div>

	<div class="accordion" id="accordionHeader">
		<Accordion item="Header" target="#accordionHeader">
			<Header
				{readonly}
				postFormId="spt-post-form"
				showPostButton={currentTab === 'Induk'}
				npwp={taxpayer.npwp}
				namaPKP={taxpayer.nama}
				alamat={taxpayer.alamat}
				noTelepon={taxpayer.noTelepon}
				teleponSeluler={taxpayer.teleponSeluler}
				klasifikasiLapanganUsaha={taxpayer.klasifikasiLapanganUsaha}
				periode={{ bulan: spt.masaPajak, tahun: spt.tahun }}
				onPeriodeChange={handlePeriodeChange}
			/>
		</Accordion>
	</div>

	<div class={currentTab === 'Induk' ? '' : 'tw:hidden'}>
		<div class="accordion" id="accordionSPT">
			<Accordion item="I. PENYERAHAN BARANG DAN JASA" target="#accordionSPT">
				<I sptItem={displayedSpt} {readonly} uploadFormId="upload-retail-invoice-form" />
			</Accordion>
			<Accordion item="II. PEROLEHAN BARANG DAN JASA" target="#accordionSPT"><II sptItem={displayedSpt} /></Accordion>
			<Accordion item="III. PERHITUNGAN PPN KURANG BAYAR / LEBIH BAYAR" target="#accordionSPT">
				<III sptItem={displayedSpt} />
			</Accordion>
			<Accordion item="IV. PPN TERUTANG ATAS KEGIATAN MEMBANGUN SENDIRI" target="#accordionSPT">
				<IV sptItem={displayedSpt} />
			</Accordion>
			<Accordion item="V. PEMBAYARAN KEMBALI PAJAK MASUKAN YANG TIDAK DAPAT DIKREDITKAN" target="#accordionSPT">
				<V sptItem={displayedSpt} />
			</Accordion>
			<Accordion item="VI. PAJAK PENJUALAN ATAS BARANG MEWAH" target="#accordionSPT"><VI sptItem={displayedSpt} /></Accordion>
			<Accordion item="VII. PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PEMUNGUT PPN" target="#accordionSPT">
				<VII sptItem={displayedSpt} />
			</Accordion>
			<Accordion item="VIII. PEMUNGUTAN PPN ATAU PPN DAN PPNBM OLEH PIHAK LAIN" target="#accordionSPT">
				<VIII sptItem={displayedSpt} />
			</Accordion>
			<Accordion item="IX. KELENGKAPAN" target="#accordionSPT"><IX sptItem={displayedSpt} /></Accordion>
			<Accordion item="X. PERNYATAAN" target="#accordionSPT"><X sptItem={displayedSpt} /></Accordion>
		</div>
	</div>

	<div class={currentTab === 'A-1' ? '' : 'tw:hidden'}>
		<LampiranA1 />
	</div>
	<div class={currentTab === 'A-2' ? '' : 'tw:hidden'}>
		<LampiranA2 rows={displayedLampiranA2} />
	</div>
	<div class={currentTab === 'B-1' ? '' : 'tw:hidden'}>
		<LampiranB1 />
	</div>
	<div class={currentTab === 'B-2' ? '' : 'tw:hidden'}>
		<LampiranB2 rows={displayedLampiranB2} />
	</div>
	<div class={currentTab === 'B-3' ? '' : 'tw:hidden'}>
		<LampiranB3 />
	</div>
	<div class={currentTab === 'C' ? '' : 'tw:hidden'}>
		<LampiranC rows={displayedLampiranC} />
	</div>

	<Footer {readonly} saveFormId="spt-save-form" reportFormId="spt-save-form" />
</form>
