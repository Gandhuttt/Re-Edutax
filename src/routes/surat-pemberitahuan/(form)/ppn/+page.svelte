<script lang="ts">
	import { formatMonth } from '$lib/helpers/date';
	import {
		Breadcrumbs,
		DisclosureItem,
		DocumentWorkspace,
		FormSection,
		PageHeading,
		PageLayout,
		Stack,
		StatusBadge
	} from '$lib/re-ui-components';
	import { tick } from 'svelte';
	import { newSptPpn } from '../../konsep/newSptPpn.remote';
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
	import PpnFooter from './components/PpnFooter.svelte';
	import PpnHeader from './components/PpnHeader.svelte';
	import PpnNavbar from './components/PpnNavbar.svelte';
	import V from './components/V.svelte';
	import VI from './components/VI.svelte';
	import VII from './components/VII.svelte';
	import VIII from './components/VIII.svelte';
	import X from './components/X.svelte';
	import { getSptPpn } from './getSptPpn.remote';
	import { postSptPpn } from './postSptPpn.remote';
	import { saveSptPpn } from './saveSptPpn.remote';
	import { uploadRetailInvoiceXml } from './uploadRetailInvoiceXml.remote';

	const { id, status, readonly, taxpayer, spt, lampiranA2, lampiranB2, lampiranC } =
		await getSptPpn();
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
	let headerOpen = $state(true);
	let sectionIOpen = $state(true);
	let sectionIIOpen = $state(false);
	let sectionIIIOpen = $state(false);
	let sectionIVOpen = $state(false);
	let sectionVOpen = $state(false);
	let sectionVIOpen = $state(false);
	let sectionVIIOpen = $state(false);
	let sectionVIIIOpen = $state(false);
	let sectionIXOpen = $state(false);
	let sectionXOpen = $state(false);
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

	const statusLabel =
		status === 'dilaporkan'
			? 'Dilaporkan'
			: status === 'menunggu_pembayaran'
				? 'Menunggu pembayaran'
				: 'Konsep';
	const statusTone =
		status === 'dilaporkan' ? 'success' : status === 'menunggu_pembayaran' ? 'attention' : 'neutral';

	async function handlePeriodeChange(bulan: number, tahun: number) {
		switchMasaPajak = bulan;
		switchTahun = tahun;
		await tick();
		await newSptPpn.submit();
	}
</script>

<svelte:head><title>SPT Masa PPN</title></svelte:head>

<form {...postForm} id="spt-post-form" hidden></form>
<form {...uploadForm} id="upload-retail-invoice-form" enctype="multipart/form-data" hidden>
	<input type="hidden" name="id" value={id} />
</form>
<form {...newSptPpn} hidden>
	<input type="hidden" name="masaPajak" value={switchMasaPajak} />
	<input type="hidden" name="tahun" value={switchTahun} />
</form>

{#snippet headingActions()}
	<StatusBadge label={statusLabel} tone={statusTone} />
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: 'Beranda', href: '/' },
			{ label: 'Surat Pemberitahuan', href: '/surat-pemberitahuan/konsep' },
			{ label: 'SPT Masa PPN' }
		]}
	/>
	<PageHeading
		eyebrow={`Masa Pajak ${formatMonth(spt.masaPajak)} ${spt.tahun}`}
		title="SPT Masa PPN"
		actions={headingActions}
	/>

	<form {...saveForm} id="spt-save-form">
		<DocumentWorkspace>
			<Stack gap="14px">
				<PpnNavbar {tabs} bind:currentTab />

				<DisclosureItem title="Identitas dan periode pelaporan" meta="Data PKP" bind:open={headerOpen}>
					<PpnHeader
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
				</DisclosureItem>

				<div id="spt-panel-induk" role="tabpanel" hidden={currentTab !== 'Induk'}>
					<DisclosureItem title="I. Penyerahan Barang dan Jasa" bind:open={sectionIOpen}>
						<I sptItem={displayedSpt} {readonly} uploadFormId="upload-retail-invoice-form" />
					</DisclosureItem>
					<DisclosureItem title="II. Perolehan Barang dan Jasa" bind:open={sectionIIOpen}>
						<II sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem
						title="III. Perhitungan PPN Kurang Bayar / Lebih Bayar"
						bind:open={sectionIIIOpen}
					>
						<III sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem
						title="IV. PPN Terutang atas Kegiatan Membangun Sendiri"
						bind:open={sectionIVOpen}
					>
						<IV sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem
						title="V. Pembayaran Kembali Pajak Masukan yang Tidak Dapat Dikreditkan"
						bind:open={sectionVOpen}
					>
						<V sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem title="VI. Pajak Penjualan atas Barang Mewah" bind:open={sectionVIOpen}>
						<VI sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem
						title="VII. Pemungutan PPN atau PPN dan PPnBM oleh Pemungut PPN"
						bind:open={sectionVIIOpen}
					>
						<VII sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem
						title="VIII. Pemungutan PPN atau PPN dan PPnBM oleh Pihak Lain"
						bind:open={sectionVIIIOpen}
					>
						<VIII sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem title="IX. Kelengkapan" bind:open={sectionIXOpen}>
						<IX sptItem={displayedSpt} />
					</DisclosureItem>
					<DisclosureItem title="X. Pernyataan" bind:open={sectionXOpen}>
						<X sptItem={displayedSpt} />
					</DisclosureItem>
				</div>

				<div id="spt-panel-a-1" role="tabpanel" hidden={currentTab !== 'A-1'}>
					<FormSection title="Daftar Ekspor BKP, BKP Tidak Berwujud dan/atau JKP" padded={false} bordered>
						<LampiranA1 />
					</FormSection>
				</div>
				<div id="spt-panel-a-2" role="tabpanel" hidden={currentTab !== 'A-2'}>
					<FormSection
						title="Daftar Pajak Keluaran atas Penyerahan Dalam Negeri dengan Faktur Pajak"
						padded={false}
						bordered
					>
						<LampiranA2 rows={displayedLampiranA2} />
					</FormSection>
				</div>
				<div id="spt-panel-b-1" role="tabpanel" hidden={currentTab !== 'B-1'}>
					<FormSection
						title="Daftar Pajak Masukan atas Dokumen Tertentu yang Diperlakukan sebagai Faktur Pajak"
						padded={false}
						bordered
					>
						<LampiranB1 />
					</FormSection>
				</div>
				<div id="spt-panel-b-2" role="tabpanel" hidden={currentTab !== 'B-2'}>
					<FormSection
						title="Daftar Pajak Masukan yang Dapat Dikreditkan atas Perolehan BKP/JKP Dalam Negeri"
						padded={false}
						bordered
					>
						<LampiranB2 rows={displayedLampiranB2} />
					</FormSection>
				</div>
				<div id="spt-panel-b-3" role="tabpanel" hidden={currentTab !== 'B-3'}>
					<FormSection
						title="Daftar Pajak Masukan atas Impor dan Pemanfaatan dari Luar Daerah Pabean"
						padded={false}
						bordered
					>
						<LampiranB3 />
					</FormSection>
				</div>
				<div id="spt-panel-c" role="tabpanel" hidden={currentTab !== 'C'}>
					<FormSection
						title="Daftar Pemungutan PPN atau PPN dan PPnBM oleh Pemungut PPN"
						padded={false}
						bordered
					>
						<LampiranC rows={displayedLampiranC} />
					</FormSection>
				</div>

			<PpnFooter {readonly} saveFormId="spt-save-form" reportFormId="spt-save-form" />
			</Stack>
		</DocumentWorkspace>
	</form>
</PageLayout>

