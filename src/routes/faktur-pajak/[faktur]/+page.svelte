<script lang="ts">
	import { page as appPage } from '$app/state';
	import { computeFakturAmounts } from '$lib/helpers/fakturAmounts';
	import {
		ActionButton,
		Breadcrumbs,
		DocumentForm,
		FormActions,
		FormIssueSummary,
		PageLayout,
		ServiceWorkspace,
		Stack
	} from '$lib/re-ui-components';
	import DetailTransaksi from './components/DetailTransaksi.svelte';
	import DokumenTransaksi from './components/DokumenTransaksi.svelte';
	import InformasiPembeli from './components/InformasiPembeli.svelte';
	import ModalTransaksi from './components/ModalTransaksi.svelte';
	import { getFaktur } from './getFaktur.remote';
	import { getFakturReferensi } from './getFakturReferensi.remote';
	import { getJenisInformasiTambahanFaktur } from '../jenisInformasiTambahan.remote';
	import { getKodeItemTransaksiFaktur } from '../kodeItemTransaksi.remote';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { getSatuanUkurTransaksiFaktur } from '../satuanUkurTransaksi.remote';
	import { updateFaktur } from './updateFaktur.remote';

	const faktur = await getFaktur();
	const updateFakturForm = updateFaktur.for(faktur.id);
	const [transactionCodeOptions, additionalInfoOptions, itemCodeOptions, unitOptions] =
		await Promise.all([
			getKodeTransaksiFaktur(),
			getJenisInformasiTambahanFaktur(),
			getKodeItemTransaksiFaktur(),
			getSatuanUkurTransaksiFaktur()
		]);

	let transaksi = $state(faktur.transaksi.map((item) => ({ ...item })));
	let selectedTransaksi = $state<number | null>(null);
	let transactionModalOpen = $state(false);
	let sidebarOpen = $state(false);
	let uangMuka = $state(faktur.uangMuka);
	let pelunasan = $state(faktur.pelunasan);
	let nilaiUangMuka = $state(faktur.nilaiUangMuka);
	let fakturReferensiId = $state(faktur.fakturReferensiId);
	let totalUangMukaSebelumnya = $state(faktur.totalUangMukaSebelumnya);
	let npwpPembeli = $state(faktur.npwpPembeli);
	let referenceLoading = $state(false);
	let referenceError = $state('');
	let referenceRequest = 0;

	const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const isOutputInvoice = $derived(faktur.npwpPenjual === accountNpwp);
	const documentKind = $derived(isOutputInvoice ? 'Faktur Pajak Keluaran' : 'Faktur Pajak Masukan');
	const documentStatus = $derived(
		!faktur.diupload ? 'Draf' : faktur.dikreditkan ? 'Dikreditkan' : 'Diunggah'
	);
	const amounts = $derived.by(() =>
		computeFakturAmounts(
			transaksi.map((item) => ({
				kuantitas: item.kuantitas,
				hargaSatuan: item.hargaSatuan,
				hargaPotongan: item.hargaPotongan,
				dppNilaiLain: item.dppNilaiLain,
				tarifPpn: item.tarifPPN,
				tarifPpnBm: item.tarifPPnBM
			})),
			{ uangMuka, pelunasan, nilaiUangMuka }
		)
	);
	const totals = $derived([
		{ label: 'Jumlah DPP', value: `Rp ${rupiah.format(amounts.taxable.dpp)}` },
		{ label: 'Jumlah PPN', value: `Rp ${rupiah.format(amounts.taxable.ppn)}` },
		{ label: 'Jumlah PPnBM', value: `Rp ${rupiah.format(amounts.taxable.ppnbm)}` },
		{
			label: 'Total faktur',
			value: `Rp ${rupiah.format(
				amounts.taxable.dpp + amounts.taxable.ppn + amounts.taxable.ppnbm
			)}`,
			emphasis: true
		}
	]);

	function createTransaction() {
		selectedTransaksi = null;
		transactionModalOpen = true;
	}

	function editTransaction(index: number) {
		selectedTransaksi = index;
		transactionModalOpen = true;
	}

	function saveTransaction(item: (typeof transaksi)[number]) {
		if (selectedTransaksi === null) transaksi.push(item);
		else transaksi[selectedTransaksi] = item;
		selectedTransaksi = null;
	}

	async function changeFakturReferensi(id: string) {
		fakturReferensiId = id;
		referenceError = '';
		if (!id) return;

		const request = ++referenceRequest;
		referenceLoading = true;
		try {
			const reference = await getFakturReferensi({ id });
			if (request !== referenceRequest) return;

			transaksi = reference.transaksi;
			npwpPembeli = reference.npwpPembeli;
			updateFakturForm.fields.informasiPembeli.npwpPembeli.set(npwpPembeli);
			nilaiUangMuka = pelunasan ? reference.totalUangMukaSebelumnya : 0;
			totalUangMukaSebelumnya = reference.totalUangMukaSebelumnya;
			updateFakturForm.fields.dokumenTransaksi.nilaiUangMuka.set(String(nilaiUangMuka));
		} catch (error) {
			if (request !== referenceRequest) return;
			referenceError =
				error instanceof Error ? error.message : 'Detail faktur referensi gagal dimuat';
		} finally {
			if (request === referenceRequest) referenceLoading = false;
		}
	}

	function changeUangMuka(checked: boolean) {
		uangMuka = checked;
		if (!checked) {
			if (!pelunasan) nilaiUangMuka = 0;
			return;
		}
		pelunasan = false;
		updateFakturForm.fields.dokumenTransaksi.pelunasan.set(false);
	}

	function changePelunasan(checked: boolean) {
		pelunasan = checked;
		if (!checked) {
			if (!uangMuka) nilaiUangMuka = 0;
			return;
		}
		uangMuka = false;
		updateFakturForm.fields.dokumenTransaksi.uangMuka.set(false);
		if (fakturReferensiId) void changeFakturReferensi(fakturReferensiId);
	}
</script>

<svelte:head><title>{documentKind}</title></svelte:head>

{#snippet formSummary()}
	<FormIssueSummary source={updateFakturForm.fields} />
{/snippet}

{#snippet documentFields()}
	<DokumenTransaksi
		canEdit={faktur.canEdit}
		uangMuka={uangMuka}
		pelunasan={pelunasan}
		nomorFaktur={faktur.nomorFaktur}
		fakturReferensiId={fakturReferensiId}
		previousInvoices={faktur.previousInvoices}
		kodeTransaksi={faktur.kodeTransaksi}
		tanggalFaktur={faktur.tanggalFaktur}
		jenisFaktur="Normal"
		referensi={faktur.referensi}
		alamat={faktur.alamat}
		idtku="000000"
		informasiTambahan={faktur.extradata?.kodeInformasiTambahan}
		dokumenPendukung={faktur.extradata?.dokumenPendukung}
		{transactionCodeOptions}
		{additionalInfoOptions}
		formFields={updateFakturForm.fields.dokumenTransaksi}
		onUangMukaChange={changeUangMuka}
		onPelunasanChange={changePelunasan}
		onFakturReferensiChange={(id) => void changeFakturReferensi(id)}
		{referenceLoading}
		{referenceError}
	/>
{/snippet}

{#snippet buyerFields()}
	<InformasiPembeli
		canEdit={faktur.canEdit}
		bind:npwpPembeli
		formFields={updateFakturForm.fields.informasiPembeli}
	/>
{/snippet}

{#snippet ledgerActions()}
	{#if faktur.canEdit}
		<ActionButton tone="secondary" onclick={createTransaction}>+ Tambah transaksi</ActionButton>
	{/if}
{/snippet}

{#snippet ledger()}
	<DetailTransaksi
		canEdit={faktur.canEdit}
		values={transaksi}
		requestEdit={editTransaction}
		requestDelete={(index) => transaksi.splice(index, 1)}
		transactionFields={updateFakturForm.fields.transaksi}
		nilaiUangMukaField={updateFakturForm.fields.dokumenTransaksi.nilaiUangMuka}
		uangMuka={uangMuka}
		pelunasan={pelunasan}
		nilaiUangMuka={nilaiUangMuka}
		{totalUangMukaSebelumnya}
		onNilaiUangMukaChange={(value) => (nilaiUangMuka = value)}
	/>
{/snippet}

{#snippet footer(pending: boolean)}
	{#if faktur.canEdit}
		<FormActions>
			<ActionButton type="submit" pending={pending} pendingLabel="Menyimpan...">
				Simpan faktur
			</ActionButton>
		</FormActions>
	{/if}
{/snippet}

<PageLayout contentWidth="1540px">
	<Stack gap="16px">
		<Breadcrumbs
			separator="›"
			items={[
				{ label: 'Beranda', href: '/' },
				{ label: 'e-Faktur' },
				{
					label: isOutputInvoice ? 'Pajak Keluaran' : 'Pajak Masukan',
					href: isOutputInvoice ? '/faktur-pajak/keluaran' : '/faktur-pajak/masukan'
				},
				{ label: 'Detail faktur' }
			]}
		/>

		<ServiceWorkspace
			bind:sidebarOpen
			identity={{
				eyebrow: 'Wajib Pajak',
				name: accountName,
				identifier: accountNpwp,
				mark: 'EF'
			}}
			groups={[
				{
					label: 'e-Faktur',
					links: [
						{ label: 'Pajak Keluaran', href: '/faktur-pajak/keluaran', active: isOutputInvoice },
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan', active: !isOutputInvoice },
						{ label: 'Retur Pajak Masukan', href: '/faktur-pajak/retur-masukan' },
						{ label: 'Retur Pajak Keluaran', href: '/faktur-pajak/retur-keluaran' }
					]
				}
			]}
		>
			<DocumentForm
				remote={faktur.canEdit ? updateFakturForm : undefined}
				eyebrow={faktur.nomorFaktur ? `Nomor ${faktur.nomorFaktur}` : 'Dokumen belum diterbitkan'}
				title={documentKind}
				status={documentStatus}
				primarySection={{ number: '01', title: 'Dokumen transaksi' }}
				secondarySection={{ number: '02', title: 'Informasi pembeli' }}
				ledgerSection={{ number: '03', title: 'Detail transaksi' }}
				primary={documentFields}
				secondary={buyerFields}
				ledger={ledger}
				{ledgerActions}
				summary={faktur.canEdit ? formSummary : undefined}
				{totals}
				{footer}
			/>
		</ServiceWorkspace>
	</Stack>
</PageLayout>

<ModalTransaksi
	bind:open={transactionModalOpen}
	canEdit={faktur.canEdit}
	value={transaksi[selectedTransaksi ?? -1] ?? null}
	{itemCodeOptions}
	{unitOptions}
	requestSave={saveTransaction}
/>
