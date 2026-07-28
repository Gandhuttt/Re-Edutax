<script lang="ts">
	import Button from '$lib/components/Button.svelte';
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
	let selectedTransaksi: number | null = $state(null);

	function handleKeydown(event: KeyboardEvent) {
		const isModalOpen = document.body.classList.contains('modal-open');
		if (event.key === 'Enter' && isModalOpen) {
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet detailContent()}
	<div class="tw:w-full tw:px-40 tw:pt-20 tw:mb-10">
		<div class="tw:flex tw:flex-row tw:gap-5 tw:mb-10">
			<div class="tw:basis-1/2 tw:h-fit">
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
			</div>
			<div class="tw:basis-1/2 tw:h-fit">
				<InformasiPembeli canEdit={faktur.canEdit} npwpPembeli={faktur.npwpPembeli} />
			</div>
		</div>
		<DetailTransaksi
			canEdit={faktur.canEdit}
			idTarget="itemTransaksi"
			values={transaksi}
			requestCreate={() => {
				selectedTransaksi = null;
			}}
			requestEdit={(index) => {
				selectedTransaksi = index;
			}}
			requestDelete={(index) => {
				transaksi.splice(index, 1);
			}}
		/>
		<ModalTransaksi
			id="itemTransaksi"
			canEdit={faktur.canEdit}
			isUploaded={faktur.diupload}
			value={transaksi[selectedTransaksi ?? -1] ?? null}
			{itemCodeOptions}
			{unitOptions}
			requestSave={(item) => {
				if (selectedTransaksi !== null) {
					transaksi[selectedTransaksi] = item;
				} else {
					transaksi.push(item);
				}
				selectedTransaksi = null;
			}}
		/>
		{#if faktur.canEdit}
			<div class="tw:flex tw:flex-row tw:justify-end tw:mt-5">
				<Button color="#FFD230">Submit</Button>
			</div>
		{/if}
	</div>
{/snippet}

{#if faktur.canEdit}
	<form {...updateFaktur}>
		{@render detailContent()}
	</form>
{:else}
	{@render detailContent()}
{/if}
