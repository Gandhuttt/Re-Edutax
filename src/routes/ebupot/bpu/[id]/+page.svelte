<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatMonth } from '$lib/helpers/date';
	import { getFasilitasPajak } from '../../fasilitasPajak.remote';
	import { getJenisDokumenEbupot } from '../../jenisDokumen.remote';
	import { getObjekPajakBpu } from '../../objekPajakBpu.remote';
	import { getBpu } from './getBpu.remote';
	import { updateBpu } from './updateBpu.remote';

	const bpu = await getBpu();
	const [objekPajakOptions, fasilitasOptions, jenisDokumenOptions] = await Promise.all([
		getObjekPajakBpu(),
		getFasilitasPajak(),
		getJenisDokumenEbupot()
	]);

	let selectedObjekPajakId = $state(bpu.kodeObjekPajakId ?? '');
	const selectedObjekPajak = $derived(
		objekPajakOptions.find((o) => o.id === selectedObjekPajakId)
	);

	const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<div class="tw:w-full tw:p-6">
	<Card>
		{#snippet head()}
			<span class="tw:font-semibold">EBUPOT BPU</span>
		{/snippet}
		{#snippet body()}
			<form {...updateBpu} class="tw:flex tw:flex-col tw:gap-3 tw:max-w-2xl">
				<fieldset disabled={!bpu.canEdit} class="tw:flex tw:flex-col tw:gap-3">
					<div class="tw:font-semibold">Informasi Umum</div>
					<label>
						Masa Pajak*
						<select name="masaPajak" value={bpu.masaPajak}>
							{#each months as m (m)}
								<option value={m}>{formatMonth(m)}</option>
							{/each}
						</select>
						<input type="number" name="tahun" value={bpu.tahun} />
					</label>
					<label>
						Nomor Identitas WP (Penerima)*
						<input type="text" name="nomorIdentitasWp" value={bpu.nomorIdentitasWp} />
					</label>
					<label>
						Nama Penerima*
						<input type="text" name="namaPenerima" value={bpu.namaPenerima} />
					</label>

					<div class="tw:font-semibold">Pajak Penghasilan (Rp)</div>
					<label>
						Fasilitas Pajak yang Dimiliki oleh Penerima Penghasilan*
						<select name="fasilitasPajakId" value={bpu.fasilitasPajakId ?? ''}>
							<option value="" disabled>Please select</option>
							{#each fasilitasOptions as f (f.id)}
								<option value={f.id}>{f.nama}</option>
							{/each}
						</select>
					</label>
					<label>
						Nama Objek Pajak*
						<select name="kodeObjekPajakId" bind:value={selectedObjekPajakId}>
							<option value="" disabled>Please select</option>
							{#each objekPajakOptions as o (o.id)}
								<option value={o.id}>{o.nama}</option>
							{/each}
						</select>
					</label>
					<label>
						Jenis Pajak
						<input type="text" value={selectedObjekPajak?.pasal ?? ''} readonly disabled />
					</label>
					<label>
						Kode Objek Pajak
						<input type="text" value={selectedObjekPajak?.kode ?? ''} readonly disabled />
					</label>
					<label>
						Sifat Pajak Penghasilan
						<input type="text" value={selectedObjekPajak?.sifat ?? ''} readonly disabled />
					</label>
					<label>
						Dasar Pengenaan Pajak (Rp)*
						<input type="text" name="dasarPengenaanPajak" value={bpu.dasarPengenaanPajak} />
					</label>
					<label>
						KAP
						<input type="text" value={selectedObjekPajak?.kap ?? ''} readonly disabled />
					</label>
					<p class="tw:text-sm tw:text-gray-600">
						Tarif dan Pajak Penghasilan dihitung otomatis dari kombinasi Nama Objek Pajak dan
						Fasilitas Pajak saat disimpan.
					</p>

					<div class="tw:font-semibold">Dokumen Referensi</div>
					<label>
						Jenis Dokumen*
						<select name="jenisDokumenId" value={bpu.jenisDokumenId ?? ''}>
							<option value="" disabled>Please select</option>
							{#each jenisDokumenOptions as d (d.id)}
								<option value={d.id}>{d.nama}</option>
							{/each}
						</select>
					</label>
					<label>
						Nomor Dokumen*
						<input type="text" name="nomorDokumen" value={bpu.nomorDokumen} />
					</label>
					<label>
						Tanggal Dokumen*
						<input type="date" name="tanggalDokumen" value={bpu.tanggalDokumen ?? ''} />
					</label>
				</fieldset>

				{#if bpu.canEdit}
					<Button type="submit">Simpan Konsep</Button>
				{/if}
				<a href="/ebupot/bpu">Kembali</a>
			</form>
		{/snippet}
	</Card>
</div>
