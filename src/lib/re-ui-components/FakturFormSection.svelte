<script lang="ts">
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import ActionButton from "./ActionButton.svelte";
	import CheckboxField from "./CheckboxField.svelte";
	import ConditionalField from "./ConditionalField.svelte";
	import DataTableViewport from "./DataTableViewport.svelte";
	import DateField from "./DateField.svelte";
	import DocumentForm from "./DocumentForm.svelte";
	import FieldGrid from "./FieldGrid.svelte";
	import FormActions from "./FormActions.svelte";
	import FormField from "./FormField.svelte";
	import InlineAlert from "./InlineAlert.svelte";
	import LookupField from "./LookupField.svelte";
	import SelectField from "./SelectField.svelte";
	import Stack from "./Stack.svelte";
	import TableActions from "./TableActions.svelte";

	let transactionCode = $state("01");
	let invoiceDate = $state("2026-09-10");
	let advancePayment = $state(false);
	let settlement = $state(false);
	let buyerNpwp = $state("0123456789012345");
	let buyerFound = $state(true);
	let rows = $state([
		{
			id: 1,
			kind: "Jasa",
			code: "070200",
			name: "Jasa teknologi informasi",
			unit: "Paket",
			quantity: 1,
			unitPrice: 125000000,
			discount: 0,
			vatRate: 11,
		},
	]);
	const subtotal = $derived(
		rows.reduce(
			(sum, row) => sum + row.quantity * row.unitPrice - row.discount,
			0,
		),
	);
	const vat = $derived(
		rows.reduce(
			(sum, row) =>
				sum +
				((row.quantity * row.unitPrice - row.discount) * row.vatRate) /
					100,
			0,
		),
	);
	const rupiah = new Intl.NumberFormat("id-ID");

	function lookupBuyer() {
		buyerFound = buyerNpwp.replace(/\D/g, "").length >= 15;
	}
	function addRow() {
		const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
		rows.push({
			id,
			kind: "Barang",
			code: "050200",
			name: "Peralatan elektronik",
			unit: "Unit",
			quantity: 1,
			unitPrice: 8500000,
			discount: 0,
			vatRate: 11,
		});
	}
</script>

<DocumentForm
	eyebrow="Contoh komposisi formulir"
	title="Faktur Pajak Keluaran"
	status="Draf"
	primarySection={{ number: "01", title: "Dokumen transaksi" }}
	secondarySection={{ number: "02", title: "Informasi pembeli" }}
	ledgerSection={{ number: "03", title: "Detail transaksi" }}
	totals={[
		{ label: "Jumlah DPP", value: `Rp ${rupiah.format(subtotal)}` },
		{ label: "Jumlah PPN", value: `Rp ${rupiah.format(vat)}` },
		{
			label: "Total faktur",
			value: `Rp ${rupiah.format(subtotal + vat)}`,
			emphasis: true,
		},
	]}
>
	{#snippet primary()}
		<Stack gap="16px">
			<Stack direction="horizontal" gap="18px" wrap>
				<CheckboxField
					label="Uang muka"
					bind:checked={advancePayment}
					compact
				/>
				<CheckboxField
					label="Pelunasan"
					bind:checked={settlement}
					compact
				/>
			</Stack>
			<FieldGrid gap="14px 16px">
				<FormField
					label="Nomor faktur"
					value="Terbentuk setelah disimpan"
					disabled
				/>
				<SelectField
					label="Kode transaksi"
					bind:value={transactionCode}
					required
					options={[
						{ value: "01", label: "01 — Penyerahan dalam negeri" },
						{ value: "04", label: "04 — DPP nilai lain" },
						{ value: "07", label: "07 — Tidak dipungut" },
						{ value: "08", label: "08 — Dibebaskan" },
					]}
				/>
				<DateField
					label="Tanggal faktur"
					bind:value={invoiceDate}
					required
					max="2026-09-10"
				/>
				<FormField label="Jenis faktur" value="Normal" disabled />
				<FormField label="Masa pajak" value="September 2026" disabled />
				<FormField label="Referensi" value="PO/EDT/IX/2026/0187" />
			</FieldGrid>
			{#if transactionCode === "07" || transactionCode === "08"}
				<ConditionalField>
					<SelectField
						label="Informasi tambahan"
						value="fasilitas"
						options={[
							{
								value: "fasilitas",
								label: "Fasilitas berdasarkan peraturan pemerintah",
							},
							{
								value: "lain",
								label: "Dokumen fasilitas lainnya",
							},
						]}
						hint="Muncul karena kode transaksi yang dipilih."
					/>
				</ConditionalField>
			{/if}
		</Stack>
	{/snippet}

	{#snippet secondary()}
		<Stack gap="16px">
			<LookupField
				label="NPWP pembeli"
				bind:value={buyerNpwp}
				buttonLabel="Cari NPWP"
				inputmode="numeric"
				maxlength={16}
				onlookup={lookupBuyer}
				onvaluechange={() => (buyerFound = false)}
			/>
			{#if buyerFound}
				<InlineAlert
					tone="success"
					compact
					title="Data wajib pajak ditemukan"
					message="Terakhir diperbarui 10 September 2026"
				/>
			{:else}
				<InlineAlert
					compact
					message="Jalankan pencarian untuk memuat data resmi pembeli."
				/>
			{/if}
			<FieldGrid gap="14px 16px">
				<FormField
					label="Nama"
					value={buyerFound ? "PT Sumber Data Nusantara" : "—"}
					disabled
				/>
				<FormField
					label="Negara"
					value={buyerFound ? "Indonesia" : "—"}
					disabled
				/>
				<FormField
					label="Email"
					value={buyerFound ? "pajak@sumberdata.co.id" : "—"}
					disabled
				/>
				<FormField
					label="NITKU"
					value={buyerFound ? "0123456789012345000000" : "—"}
					disabled
				/>
			</FieldGrid>
		</Stack>
	{/snippet}

	{#snippet ledgerActions()}
			<ActionButton tone="secondary" onclick={addRow}
				>+ Tambah transaksi</ActionButton
			>
	{/snippet}

	{#snippet ledger()}
		<DataTableViewport
			label="Detail transaksi faktur"
			minWidth="1680px"
			framed={false}
			headerTone="navy"
			density="compact"
			stickyFirstColumn
		>
			<table>
				<thead
					><tr
						><th>Tindakan</th><th>Jenis</th><th>Kode</th><th
							>Nama barang/jasa</th
						><th>Satuan</th><th class="number">Kuantitas</th><th
							class="number">Harga satuan</th
						><th class="number">DPP</th><th class="number">PPN</th
						></tr
					></thead
				>
				<tbody>
					{#each rows as row (row.id)}
						<tr
							animate:flip={{ duration: 190 }}
							in:fly={{ x: -10, duration: 180 }}
							out:fly={{ x: 10, duration: 140 }}
							><td class="action-cell"
								><TableActions
									ariaLabel={`Tindakan untuk ${row.name}`}
									visibleCount={2}
									moreLabel="Lainnya"
									actions={[
										{
											label: "Lihat",
											ariaLabel: `Lihat ${row.name}`,
										},
										{
											label: "Ubah",
											ariaLabel: `Ubah ${row.name}`,
										},
										{
											label: "Salin",
											ariaLabel: `Salin ${row.name}`,
										},
										{
											label: "Hapus",
											ariaLabel: `Hapus ${row.name}`,
											danger: true,
											onclick: () =>
												(rows = rows.filter(
													(entry) => entry.id !== row.id,
												)),
										},
									]}
								/></td
							><td>{row.kind}</td><td><code>{row.code}</code></td
							><td><strong>{row.name}</strong></td><td
								>{row.unit}</td
							><td class="number">{row.quantity}</td><td
								class="number"
								>Rp {rupiah.format(row.unitPrice)}</td
							><td class="number"
								>Rp {rupiah.format(
									row.quantity * row.unitPrice - row.discount,
								)}</td
							><td class="number"
								>Rp {rupiah.format(
									((row.quantity * row.unitPrice -
										row.discount) *
										row.vatRate) /
										100,
								)}</td
							></tr
						>
					{:else}
						<tr
							><td class="empty" colspan="9"
								>Belum ada transaksi. Tambahkan barang atau jasa
								untuk memulai.</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>
	{/snippet}

	{#snippet footer(pending)}
		<FormActions message="Perubahan disimpan sebagai draf sampai faktur diterbitkan.">
			<ActionButton tone="quiet">Simpan draf</ActionButton>
			<ActionButton type="submit" disabled={pending}>
				{pending ? "Menyimpan..." : "Periksa dan terbitkan →"}
			</ActionButton>
		</FormActions>
	{/snippet}
</DocumentForm>
