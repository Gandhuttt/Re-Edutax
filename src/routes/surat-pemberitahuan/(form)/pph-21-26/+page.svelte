<script lang="ts">
	import type { PageProps } from './$types';
	import {
		ActionButton, Breadcrumbs, CheckboxField, DisclosureItem, DocumentTabs,
		DocumentWorkspace, FieldGrid, FormActions, FormField, InlineAlert,
		PageHeading, PageLayout, Stack, StatusBadge
	} from '$lib/re-ui-components';
	import Spt2126Annex from './components/Spt2126Annex.svelte';
	import Spt2126Article from './components/Spt2126Article.svelte';

	let { data, form }: PageProps = $props();
	let currentTab = $state('Induk');
	let dirty = $state(false);
	let headerOpen = $state(true);
	let identityOpen = $state(true);
	let article21Open = $state(true);
	let article26Open = $state(true);
	let declarationOpen = $state(true);

	const tabs = ['Induk', 'L-IA', 'L-IB', 'L-II', 'L-III'].map((label) => ({
		label, panelId: `spt2126-${label}`
	}));
	const month = new Intl.DateTimeFormat('id-ID', { month: 'long', timeZone: 'UTC' });
	const detail = $derived(data.detail);
	const editable = $derived(detail.status === 'konsep');
	const values = $derived(form?.values ?? detail.input);
	const totals = $derived(detail.snapshot ?? detail.preview);
	const canSubmit = $derived(editable && detail.posted && !detail.sourcesChanged && detail.input.pernyataan && !dirty);
	const statusLabel = $derived(detail.status === 'dilaporkan' ? 'Dilaporkan' : detail.status === 'menunggu_pembayaran' ? 'Menunggu pembayaran' : 'Konsep');
	const periodLabel = $derived(`${month.format(new Date(Date.UTC(detail.tahun, detail.masaPajak - 1, 1)))} ${detail.tahun}`);
	const kindLabel = $derived(detail.pembetulanKe === 0 ? 'Normal' : `Pembetulan ke-${detail.pembetulanKe}`);
	const touch = () => { dirty = true; };
	function touchInput(event: Event) {
		if (event.target instanceof HTMLInputElement && event.target.name) touch();
	}
	const reportInstruction = $derived(dirty ? 'Simpan perubahan sebelum posting.'
		: !detail.input.pernyataan ? 'Lengkapi pernyataan pada bagian D, simpan konsep, lalu posting SPT.'
		: !detail.posted ? 'Posting SPT sebelum melaporkan.'
		: detail.sourcesChanged ? 'Sumber berubah. Posting ulang sebelum melaporkan.' : '');
</script>

<svelte:head><title>SPT Masa PPh 21/26</title></svelte:head>

<form id="spt2126-post-form" method="POST" action={`?/post&id=${detail.id}`} hidden></form>
<form id="spt2126-report-form" method="POST" action={`?/submit&id=${detail.id}`} hidden></form>
<form id="spt2126-pay-form" method="POST" action={`?/pay&id=${detail.id}`} hidden></form>
<form id="spt2126-reopen-form" method="POST" action={`?/reopen&id=${detail.id}`} hidden></form>
<form id="spt2126-amend-form" method="POST" action={`?/amend&id=${detail.id}`} hidden></form>
<form id="spt2126-delete-form" method="POST" action={`?/delete&id=${detail.id}`} hidden
	onsubmit={(event) => { if (!confirm('Hapus konsep SPT ini? Tindakan tidak dapat dibatalkan.')) event.preventDefault(); }}></form>

{#snippet headingActions()}
	<StatusBadge label={statusLabel} tone={detail.status === 'dilaporkan' ? 'success' : detail.status === 'menunggu_pembayaran' ? 'attention' : 'neutral'} />
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs items={[
		{ label: 'Beranda', href: '/dashboard' },
		{ label: 'Surat Pemberitahuan', href: '/surat-pemberitahuan/konsep' },
		{ label: 'SPT Masa PPh 21/26' }
	]} />
	<PageHeading title="SPT Masa PPh 21/26" eyebrow={`Masa Pajak ${periodLabel} · ${kindLabel}`} actions={headingActions} />

	<form id="spt2126-save-form" method="POST" action={`?/save&id=${detail.id}`}
		oninput={touchInput} onchange={touchInput}>
		<input type="hidden" name="jenisWajibPajak" value={values.jenisWajibPajak} />
		<input type="hidden" name="sp2dKeterangan" value={values.sp2dKeterangan} />
		<DocumentWorkspace>
			<Stack gap="14px">
				<DocumentTabs {tabs} bind:active={currentTab} ariaLabel="Bagian SPT Masa PPh 21/26" />
				{#if form?.message}<InlineAlert tone="error" message={form.message} />{/if}
				{#if data.notice}<InlineAlert tone="success" compact message={data.notice} />{/if}
				{#if detail.sourcesChanged}<InlineAlert tone="warning" compact message="Bukti potong sumber berubah. Posting ulang SPT sebelum melanjutkan." />{/if}
				{#if dirty}<InlineAlert tone="warning" compact message="Ada perubahan belum disimpan." />{/if}

				<div id="spt2126-Induk" role="tabpanel" aria-label="Induk" hidden={currentTab !== 'Induk'}>
					<DisclosureItem title="HEADER" bind:open={headerOpen}>
						<Stack gap="18px">
							<FieldGrid columns={4}>
								<FormField label="Masa Pajak" value={String(detail.masaPajak).padStart(2, '0')} disabled />
								<FormField label="Tahun Pajak" value={String(detail.tahun)} disabled />
								<FormField label="Status SPT" value={kindLabel} disabled />
								<FormField label="Status Penyampaian" value={statusLabel} disabled />
							</FieldGrid>
							{#if editable}
								<Stack direction="horizontal" gap="8px" wrap>
									<ActionButton type="submit" form="spt2126-post-form" tone="secondary" disabled={dirty}>Posting SPT</ActionButton>
								</Stack>
							{/if}
						</Stack>
					</DisclosureItem>
					<DisclosureItem title="A. IDENTITAS PEMOTONG" bind:open={identityOpen}>
						<FieldGrid columns={2}>
							<FormField label="1. NPWP" value={detail.npwpPemotong} disabled />
							<FormField label="2. Nama" value={detail.namaPemotong} disabled />
							<FormField label="3. Alamat" value={detail.alamatPemotong ?? '—'} disabled />
							<FormField label="4. Nomor Telepon" value={detail.teleponPemotong ?? '—'} disabled />
						</FieldGrid>
					</DisclosureItem>
					<DisclosureItem title="B. PAJAK PENGHASILAN PASAL 21" bind:open={article21Open}>
						<Spt2126Article pasal={21} total={totals.pasal21} {detail} {values} {editable} ontouch={touch} />
					</DisclosureItem>
					<DisclosureItem title="C. PAJAK PENGHASILAN PASAL 26" bind:open={article26Open}>
						<Spt2126Article pasal={26} total={totals.pasal26} {detail} {values} {editable} ontouch={touch} />
					</DisclosureItem>
					<DisclosureItem title="D. PERNYATAAN DAN TANDA TANGAN" bind:open={declarationOpen}>
						<Stack gap="18px">
							<CheckboxField name="pernyataan" checked={values.pernyataan} disabled={!editable}
								label="Dengan menyadari sepenuhnya akan segala akibatnya termasuk sanksi-sanksi sesuai dengan ketentuan perundang-undangan yang berlaku, Saya menyatakan bahwa apa yang telah Saya beritahukan di atas adalah benar, lengkap, dan jelas." />
							<FieldGrid columns={2}>
								<FormField label="Ditandatangani oleh" value="Wajib Pajak" disabled />
								<FormField label="Nama" value={detail.namaPemotong} disabled />
							</FieldGrid>
						</Stack>
					</DisclosureItem>
				</div>

				{#each ['L-IA', 'L-IB', 'L-II', 'L-III'] as tab}
					<div id={`spt2126-${tab}`} role="tabpanel" aria-label={tab} hidden={currentTab !== tab}>
						<Spt2126Annex {detail} {tab} sources={totals.sources} />
					</div>
				{/each}

				{#if editable}
					<FormActions message={reportInstruction || 'Simulasi pembelajaran — tidak dikirim ke DJP.'}>
						<ActionButton type="submit" form="spt2126-delete-form" tone="danger">Hapus Konsep</ActionButton>
						<ActionButton type="submit" form="spt2126-save-form" tone="quiet">Simpan Konsep</ActionButton>
						<ActionButton type="submit" form="spt2126-report-form" disabled={!canSubmit}>Bayar dan Lapor</ActionButton>
					</FormActions>
				{:else if detail.status === 'menunggu_pembayaran'}
					<FormActions message="Pembayaran simulasi — tidak ada transaksi bank atau penerbitan NTPN.">
						<ActionButton type="submit" form="spt2126-reopen-form" tone="quiet">Kembali ke Konsep</ActionButton>
						<ActionButton type="submit" form="spt2126-pay-form" disabled={detail.sourcesChanged}>Bayar dan Lapor</ActionButton>
					</FormActions>
				{:else}
					<FormActions message="SPT simulasi telah dilaporkan dan tidak dapat diubah.">
						<ActionButton type="submit" form="spt2126-amend-form">Buat Pembetulan</ActionButton>
					</FormActions>
				{/if}
			</Stack>
		</DocumentWorkspace>
	</form>
</PageLayout>
