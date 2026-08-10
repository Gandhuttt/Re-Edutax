<script lang="ts">
	import CheckableSelect from '$lib/components/CheckableSelect.svelte';

	let {
		data = $bindable() as {
			id?: string;
			kode?: string | null;
			namaAkun?: string;
			classification?: 'income' | 'expense' | null;
			hasFiskalSplit?: boolean;
			nilaiKomersial?: number;
			nonObjekPajak?: number;
			dikenakanPphFinal?: number;
			penyesuaianFiskalPositif?: number;
			penyesuaianFiskalNegatif?: number;
			kodePenyesuaianFiskal?: string[];
		},
		saveItem,
		kodeKoreksiFiskalOptions
	}: {
		data: {
			id?: string;
			kode?: string | null;
			namaAkun?: string;
			classification?: 'income' | 'expense' | null;
			hasFiskalSplit?: boolean;
			nilaiKomersial?: number;
			nonObjekPajak?: number;
			dikenakanPphFinal?: number;
			penyesuaianFiskalPositif?: number;
			penyesuaianFiskalNegatif?: number;
			kodePenyesuaianFiskal?: string[];
		};
		saveItem: () => void;
		kodeKoreksiFiskalOptions: { value: string; label: string; group?: string }[];
	} = $props();

	const hasFiskalSplit = $derived(Boolean(data.hasFiskalSplit));

	const objekPajakTidakFinal = $derived(
		hasFiskalSplit
			? Number(data.nilaiKomersial || 0) - Number(data.nonObjekPajak || 0) - Number(data.dikenakanPphFinal || 0)
			: Number(data.nilaiKomersial || 0)
	);
	const fiskalSign = $derived(data.classification === 'expense' ? -1 : 1);
	const nilaiFiskal = $derived(
		objekPajakTidakFinal +
			fiskalSign * (Number(data.penyesuaianFiskalPositif || 0) - Number(data.penyesuaianFiskalNegatif || 0))
	);

	function handleSave(): void {
		saveItem();
	}

	function formatRupiah(value: number | undefined): string {
		return value ? value.toLocaleString('id-ID') : '';
	}

	function handleRupiahInput(
		e: Event,
		field: 'nilaiKomersial' | 'nonObjekPajak' | 'dikenakanPphFinal' | 'penyesuaianFiskalPositif' | 'penyesuaianFiskalNegatif'
	): void {
		const target = e.target as HTMLInputElement;
		const digits = target.value.replace(/\D/g, '');
		const num = digits ? Number(digits) : 0;
		data[field] = num;
		target.value = formatRupiah(num);
	}
</script>

<!-- Modal -->
<div class="modal fade" id="modalL1" tabindex="-1" aria-labelledby="modalL1Label" aria-hidden="true">
	<div class="modal-dialog modal-lg modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="modalL1Label" style="font-weight: bold; text-transform: uppercase;">
					Edit {data.kode} — {data.namaAkun}
				</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>

			<div class="modal-body">
				<div style="display: flex; flex-direction: column; gap: 10px;">
					<div style="display: flex; align-items: center;">
						<label for="nilaiKomersial" style="width: 220px;">Nilai Komersial *</label>
						<input
							type="text"
							inputmode="numeric"
							id="nilaiKomersial"
							value={formatRupiah(data.nilaiKomersial)}
							oninput={(e) => handleRupiahInput(e, 'nilaiKomersial')}
							style="flex: 1; text-align: right;"
						/>
					</div>

					<div style="display: flex; align-items: center;">
						<label for="nonObjekPajak" style="width: 220px;">Tidak Termasuk Objek Pajak</label>
						<input
							type="text"
							inputmode="numeric"
							id="nonObjekPajak"
							value={formatRupiah(data.nonObjekPajak)}
							oninput={(e) => handleRupiahInput(e, 'nonObjekPajak')}
							style="flex: 1; text-align: right;"
							disabled={!hasFiskalSplit}
						/>
					</div>
					<div style="display: flex; align-items: center;">
						<label for="dikenakanPphFinal" style="width: 220px;">Dikenakan PPh Bersifat Final</label>
						<input
							type="text"
							inputmode="numeric"
							id="dikenakanPphFinal"
							value={formatRupiah(data.dikenakanPphFinal)}
							oninput={(e) => handleRupiahInput(e, 'dikenakanPphFinal')}
							style="flex: 1; text-align: right;"
							disabled={!hasFiskalSplit}
						/>
					</div>

					<div style="display: flex; align-items: center;">
						<label for="objekPajakTidakFinal" style="width: 220px;">Objek Pajak Tidak Final</label>
						<input
							type="text"
							id="objekPajakTidakFinal"
							value={objekPajakTidakFinal.toLocaleString('id-ID')}
							style="flex: 1; text-align: right;"
							disabled
						/>
					</div>

					<div style="display: flex; align-items: center;">
						<label for="penyesuaianFiskalPositif" style="width: 220px;">Penyesuaian Fiskal Positif</label>
						<input
							type="text"
							inputmode="numeric"
							id="penyesuaianFiskalPositif"
							value={formatRupiah(data.penyesuaianFiskalPositif)}
							oninput={(e) => handleRupiahInput(e, 'penyesuaianFiskalPositif')}
							style="flex: 1; text-align: right;"
						/>
					</div>
					<div style="display: flex; align-items: center;">
						<label for="penyesuaianFiskalNegatif" style="width: 220px;">Penyesuaian Fiskal Negatif</label>
						<input
							type="text"
							inputmode="numeric"
							id="penyesuaianFiskalNegatif"
							value={formatRupiah(data.penyesuaianFiskalNegatif)}
							oninput={(e) => handleRupiahInput(e, 'penyesuaianFiskalNegatif')}
							style="flex: 1; text-align: right;"
						/>
					</div>
					<div style="display: flex; align-items: center;">
						<label for="kodePenyesuaianFiskal" style="width: 220px;">Kode Penyesuaian Fiskal</label>
						<CheckableSelect
							id="kodePenyesuaianFiskal"
							bind:value={data.kodePenyesuaianFiskal!}
							options={kodeKoreksiFiskalOptions}
							placeholder="Tidak ada"
						/>
					</div>

					<div style="display: flex; align-items: center;">
						<label for="nilaiFiskal" style="width: 220px;">Nilai Fiskal (Sebelum Fasilitas)</label>
						<input
							type="text"
							id="nilaiFiskal"
							value={nilaiFiskal.toLocaleString('id-ID')}
							style="flex: 1; text-align: right;"
							disabled
						/>
					</div>
				</div>
			</div>

			<div class="modal-footer" style="justify-content: flex-end;">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"> Tutup </button>
				<button
					type="button"
					class="btn btn-primary"
					style="background-color: #1c398e; color: white;"
					onclick={handleSave}
					data-bs-dismiss="modal"
				>
					Simpan
				</button>
			</div>
		</div>
	</div>
</div>
