<script lang="ts">
	import type { Spt2126Detail, Spt2126Source } from '$lib/helpers/spt-pph-2126';
	import { DataTableBody, DataTableViewport, DisclosureItem, FieldGrid, FormField, FormSection, PaginationBar } from '$lib/re-ui-components';

	type Kind = 'ia' | 'ib' | 'ii' | 'iii';
	type Table = { key: string; title: string; kind: Kind; jenis: Spt2126Source['jenis']; kap: string };
	type Props = { detail: Spt2126Detail; tab: string; sources: Spt2126Source[] };

	let { detail, tab, sources }: Props = $props();

	const KAP21 = '411121-100';
	const KAP26 = '411127-100';
	const tablesByTab: Record<string, { list: string; tables: Table[] }> = {
		'L-IA': { list: 'LIST-IA', tables: [{ key: 'mp', title: 'MP', kind: 'ia', jenis: 'MP', kap: KAP21 }] },
		'L-IB': {
			list: 'LIST-IB',
			tables: [
				{ key: 'ib-bpa1', title: 'BPA1', kind: 'ib', jenis: 'BPA1', kap: KAP21 },
				{ key: 'ib-bpa2', title: 'BPA2', kind: 'ib', jenis: 'BPA2', kap: KAP21 }
			]
		},
		'L-II': {
			list: 'LIST-II',
			tables: [
				{ key: 'ii-bpa1', title: 'BPA1', kind: 'ii', jenis: 'BPA1', kap: KAP21 },
				{ key: 'ii-bpa2', title: 'BPA2', kind: 'ii', jenis: 'BPA2', kap: KAP21 }
			]
		},
		'L-III': {
			list: 'LIST-III',
			tables: [
				{ key: 'bp21', title: 'BP21', kind: 'iii', jenis: 'BP21', kap: KAP21 },
				{ key: 'bp26', title: 'BP26', kind: 'iii', jenis: 'BP26', kap: KAP26 }
			]
		}
	};
	// Number of columns before "Penghasilan Bruto", and after "Pajak Penghasilan" (tarif sits between them on L-IA only).
	const layout: Record<Kind, { lead: number; trail: number; columns: number }> = {
		ia: { lead: 6, trail: 5, columns: 14 },
		ib: { lead: 6, trail: 5, columns: 13 },
		ii: { lead: 6, trail: 4, columns: 12 },
		iii: { lead: 8, trail: 4, columns: 14 }
	};

	const allTables = Object.values(tablesByTab).flatMap((entry) => entry.tables);
	const active = $derived(tablesByTab[tab]);
	let openHeader = $state(true);
	let openList = $state(true);
	let filters = $state<Record<string, { identitas: string; nama: string; nomor: string }>>(Object.fromEntries(allTables.map((t) => [t.key, { identitas: '', nama: '', nomor: '' }])));
	let pages = $state<Record<string, number>>(Object.fromEntries(allTables.map((t) => [t.key, 1])));
	let sizes = $state<Record<string, number>>(Object.fromEntries(allTables.map((t) => [t.key, 10])));

	const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
	const percent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 });
	const maskedPeriod = $derived(`${String(detail.masaPajak).padStart(2, '0')}-${detail.tahun}`);

	const amount = (value: number | null | undefined) => (value === null || value === undefined ? '—' : number.format(value));
	const text = (value: string | null | undefined) => (value && value.trim() ? value : '—');
	function tanggal(value: string | null | undefined) {
		const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
		return match ? `${match[3]}-${match[2]}-${match[1]}` : text(value);
	}
	function status(value: string) {
		if (value === 'NORMAL' || value === 'SUBMITTED') return 'Normal';
		if (value === 'AMENDMENT') return 'Pembetulan';
		return text(value);
	}
	function brutoOf(row: Spt2126Source, kind: Kind) {
		return kind === 'ii' ? (row.brutoTahunan ?? 0) : row.bruto;
	}
	function pajakOf(row: Spt2126Source, kind: Kind) {
		return kind === 'ii' ? (row.pajakTahunan ?? 0) : row.pajak;
	}
	function dtpOf(row: Spt2126Source, kind: Kind) {
		return kind === 'ii' ? (row.dtpTahunan ?? 0) : row.dtp;
	}
	function preventFilterSubmit(event: KeyboardEvent) {
		if (event.key === 'Enter') event.preventDefault();
	}
	function rowsFor(table: Table) {
		return sources.filter((row) => row.jenis === table.jenis);
	}
	function filtered(table: Table) {
		const filter = filters[table.key];
		const contains = (value: string, query: string) => value.toLowerCase().includes(query.trim().toLowerCase());
		return rowsFor(table).filter((row) => contains(row.identitas ?? '', filter.identitas) && contains(row.nama ?? '', filter.nama) && contains(row.nomor ?? '', filter.nomor));
	}
	function paged(table: Table) {
		const rows = filtered(table);
		const size = Math.max(1, sizes[table.key] || 10);
		const pageCount = Math.max(1, Math.ceil(rows.length / size));
		const page = Math.min(Math.max(1, pages[table.key] || 1), pageCount);
		return rows.slice((page - 1) * size, page * size);
	}
	function isDtp(row: Spt2126Source) {
		const code = row.meta?.fasilitasKode;
		return code != null ? code === '4' || code === '11' : row.dtp !== 0;
	}
	function totals(table: Table) {
		const t = { dtpBruto: 0, dtpPajak: 0, potongBruto: 0, potongPajak: 0, bruto: 0, pajak: 0 };
		for (const row of rowsFor(table)) {
			const bruto = brutoOf(row, table.kind);
			const pajak = pajakOf(row, table.kind);
			t.bruto += bruto;
			t.pajak += pajak;
			if (table.kind !== 'ii' && isDtp(row)) {
				t.dtpBruto += bruto;
				t.dtpPajak += pajak;
			} else {
				t.potongBruto += bruto;
				t.potongPajak += pajak - dtpOf(row, table.kind);
			}
		}
		return t;
	}
</script>

{#snippet sourceTable(table: Table)}
	{@const cfg = layout[table.kind]}
	{@const total = totals(table)}
	{@const count = filtered(table).length}
	<FormSection title={table.title}>

		<DataTableViewport label={`${active.list} ${table.title}`} minWidth={table.kind === 'iii' ? '1700px' : '1560px'} framed={false} headerTone="navy" density="compact">
			<table>
				<thead>
					<tr>
						<th scope="col">No</th>
						<th scope="col">NIK/NPWP</th>
						<th scope="col">Nama</th>
						{#if table.kind === 'iii'}<th scope="col">Jenis Pajak</th>{/if}
						<th scope="col">Nomor Bukti Potong</th>
						<th scope="col">Tanggal Bukti Pemotongan</th>
						<th scope="col">Kode Objek Pajak</th>
						{#if table.kind === 'iii'}<th scope="col">Objek Pajak</th>{/if}
						<th scope="col" class="right">Penghasilan Bruto (Rp)</th>
						{#if table.kind === 'ia'}<th scope="col" class="right">Tarif Pajak (%)</th>{/if}
						<th scope="col" class="right">Pajak Penghasilan (Rp)</th>
						{#if table.kind === 'ii'}
							<th scope="col">Masa Perolehan Penghasilan</th>
							<th scope="col">Negara</th>
						{:else if table.kind === 'iii'}
							<th scope="col">Fasilitas Perpajakan</th>
						{:else}
							<th scope="col">Fasilitas Perpajakan</th>
							<th scope="col">Negara</th>
						{/if}
						<th scope="col">ID Tempat Kegiatan Usaha</th>
						{#if table.kind !== 'ii'}<th scope="col">KAP-KJS</th>{/if}
						<th scope="col">Status</th>
					</tr>
					<tr>
						<th></th>
						<th scope="col"><FormField label="Filter NIK/NPWP" labelHidden bind:value={filters[table.key].identitas} oninput={() => (pages[table.key] = 1)} onkeydown={preventFilterSubmit} /></th>
						<th scope="col"><FormField label="Filter Nama" labelHidden bind:value={filters[table.key].nama} oninput={() => (pages[table.key] = 1)} onkeydown={preventFilterSubmit} /></th>
						{#if table.kind === 'iii'}<th></th>{/if}
						<th scope="col"><FormField label="Filter Nomor Bukti Potong" labelHidden bind:value={filters[table.key].nomor} oninput={() => (pages[table.key] = 1)} onkeydown={preventFilterSubmit} /></th>
						<th colspan={cfg.columns - (table.kind === 'iii' ? 5 : 4)}></th>
					</tr>
				</thead>
				<DataTableBody
					items={paged(table)}
					getKey={(row) => `${row.jenis}-${row.id}`}
					emptyColspan={cfg.columns}
					emptyText="Tidak ada data yang ditemukan."
					motion={false}
				>
					{#snippet row(row, index)}
						<td>{(Math.max(1, pages[table.key] || 1) - 1) * Math.max(1, sizes[table.key] || 10) + index + 1}</td>
						<td>{text(row.identitas)}</td>
						<td>{text(row.nama)}</td>
						{#if table.kind === 'iii'}<td>{table.jenis === 'BP21' ? 'PPh Pasal 21' : 'PPh Pasal 26'}</td>{/if}
						<td>{text(row.nomor)}</td>
						<td>{tanggal(row.meta?.tanggalPemotongan)}</td>
						<td>{text(row.kodeObjek)}</td>
						{#if table.kind === 'iii'}<td>{text(row.meta?.namaObjek)}</td>{/if}
						<td class="number amount">{amount(brutoOf(row, table.kind))}</td>
						{#if table.kind === 'ia'}<td class="number">{row.meta?.tarif == null ? '—' : percent.format(row.meta.tarif)}</td>{/if}
						<td class="number amount">{amount(pajakOf(row, table.kind))}</td>
						{#if table.kind === 'ii'}
							<td>{text(row.meta?.periodePenghasilan)}</td>
							<td>{text(row.meta?.negara)}</td>
						{:else if table.kind === 'iii'}
							<td>{text(row.meta?.fasilitas)}</td>
						{:else}
							<td>{text(row.meta?.fasilitas)}</td>
							<td>{text(row.meta?.negara)}</td>
						{/if}
						<td>{text(row.meta?.nitku)}</td>
						{#if table.kind !== 'ii'}<td>{table.kap}</td>{/if}
						<td>{status(row.status)}</td>
					{/snippet}
				</DataTableBody>
				<tfoot>
					{#if table.kind === 'ii'}
						<tr>
							<th scope="row" colspan={cfg.lead}>TOTAL</th>
							<td class="number amount">{amount(total.bruto)}</td>
							<td class="number amount">{amount(total.pajak)}</td>
							<td colspan={cfg.trail}></td>
						</tr>
					{:else}
						<tr>
							<th scope="row" colspan={cfg.lead}>JUMLAH PENGHASILAN BRUTO DAN PAJAK PENGHASILAN YANG DITANGGUNG OLEH PEMERINTAH</th>
							<td class="number amount">{amount(total.dtpBruto)}</td>
							{#if table.kind === 'ia'}<td></td>{/if}
							<td class="number amount">{amount(total.dtpPajak)}</td>
							<td colspan={cfg.trail}></td>
						</tr>
						<tr>
							<th scope="row" colspan={cfg.lead}>JUMLAH PENGHASILAN BRUTO DAN PAJAK PENGHASILAN YANG DIPOTONG</th>
							<td class="number amount">{amount(total.potongBruto)}</td>
							{#if table.kind === 'ia'}<td></td>{/if}
							<td class="number amount">{amount(total.potongPajak)}</td>
							<td colspan={cfg.trail}></td>
						</tr>
						<tr>
							<th scope="row" colspan={cfg.lead}>JUMLAH TOTAL PENGHASILAN BRUTO DAN PAJAK PENGHASILAN YANG DITANGGUNG OLEH PEMERINTAH SERTA PAJAK PENGHASILAN YANG DIPOTONG</th>
							<td class="number amount">{amount(total.bruto)}</td>
							{#if table.kind === 'ia'}<td></td>{/if}
							<td class="number amount">{amount(total.pajak)}</td>
							<td colspan={cfg.trail}></td>
						</tr>
					{/if}
				</tfoot>
			</table>
		</DataTableViewport>
		<PaginationBar bind:page={pages[table.key]} bind:pageSize={sizes[table.key]} totalItems={count} itemLabel={table.jenis} ariaLabel={`Navigasi halaman ${active.list} ${table.jenis}`} />
	</FormSection>
{/snippet}

{#if active}
	<DisclosureItem title="HEADER" bind:open={openHeader}>
		<FieldGrid columns={2}>
			<FormField label="Nomor Identitas WP" value={detail.npwpPemotong || ''} disabled />
			<FormField label="MASA PAJAK (MM-YYYY)" value={maskedPeriod} disabled />
		</FieldGrid>
	</DisclosureItem>
	<DisclosureItem title={active.list} bind:open={openList}>
		{#each active.tables as table (table.key)}
			{@render sourceTable(table)}
		{/each}
	</DisclosureItem>
{/if}
