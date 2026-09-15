<script lang="ts">
	import { page as appPage } from '$app/state';
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
	import { getJenisInformasiTambahanFaktur } from '../jenisInformasiTambahan.remote';
	import { getKodeItemTransaksiFaktur } from '../kodeItemTransaksi.remote';
	import { getKodeTransaksiFaktur } from '../kodeTransaksi.remote';
	import { getSatuanUkurTransaksiFaktur } from '../satuanUkurTransaksi.remote';
	import { updateFaktur } from './updateFaktur.remote';

	const faktur = await getFaktur();
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

	const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
	const accountName = $derived(String(appPage.data.user?.name ?? 'Wajib Pajak'));
	const accountNpwp = $derived(String(appPage.data.user?.username ?? ''));
	const isOutputInvoice = $derived(faktur.npwpPenjual === accountNpwp);
	const documentKind = $derived(isOutputInvoice ? 'Faktur Pajak Keluaran' : 'Faktur Pajak Masukan');
	const documentStatus = $derived(
		!faktur.diupload ? 'Draf' : faktur.dikreditkan ? 'Dikreditkan' : 'Diunggah'
	);
	const totals = $derived.by(() => {
		const dpp = transaksi.reduce(
			(sum, item) => sum + item.kuantitas * item.hargaSatuan - item.hargaPotongan,
			0
		);
		const ppn = transaksi.reduce((sum, item) => {
			const rowDpp = item.kuantitas * item.hargaSatuan - item.hargaPotongan;
			return sum + ((item.dppNilaiLain > 0 ? item.dppNilaiLain : rowDpp) * item.tarifPPN) / 100;
		}, 0);
		const ppnbm = transaksi.reduce((sum, item) => {
			const rowDpp = item.kuantitas * item.hargaSatuan - item.hargaPotongan;
			return sum + (rowDpp * item.tarifPPnBM) / 100;
		}, 0);

		return [
			{ label: 'Jumlah DPP', value: `Rp ${rupiah.format(dpp)}` },
			{ label: 'Jumlah PPN', value: `Rp ${rupiah.format(ppn)}` },
			{ label: 'Jumlah PPnBM', value: `Rp ${rupiah.format(ppnbm)}` },
			{ label: 'Total faktur', value: `Rp ${rupiah.format(dpp + ppn + ppnbm)}`, emphasis: true }
		];
	});

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
</script>

<svelte:head><title>{documentKind}</title></svelte:head>

{#snippet formSummary()}
	<FormIssueSummary source={updateFaktur.fields} />
{/snippet}

{#snippet documentFields()}
	<DokumenTransaksi
		canEdit={faktur.canEdit}
		uangMuka={faktur.uangMuka}
		pelunasan={faktur.pelunasan}
		nomorFaktur={faktur.nomorFaktur}
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
	/>
{/snippet}

{#snippet buyerFields()}
	<InformasiPembeli canEdit={faktur.canEdit} npwpPembeli={faktur.npwpPembeli} />
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
						{ label: 'Pajak Masukan', href: '/faktur-pajak/masukan', active: !isOutputInvoice }
					]
				}
			]}
		>
			<DocumentForm
				remote={faktur.canEdit ? updateFaktur : undefined}
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
