<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CollapsiblePanel,
		DataTableViewport,
		FormField,
		FormSection,
		KeyValueGrid,
		PageHeading,
		PageLayout,
		PaginationBar,
		Stack,
	} from "$lib/re-ui-components";

	let filterOpen = $state(false);
	let query = $state("");
	let page = $state(1);
	let pageSize = $state(10);

	const columns = [
		"Jenis Alamat",
		"Detail Alamat",
		"RT",
		"RW",
		"Kelurahan/Desa",
		"Kecamatan",
		"Kota/Kabupaten",
		"Provinsi",
		"Negara",
		"Kode Wilayah",
		"Kode Pos",
		"Data Geometri",
		"Lokasi yang Disewa",
		"NIK/TIN Pemilik",
		"Nama Pemilik",
		"Tanggal Mulai Sewa",
		"Tanggal Berakhir Sewa",
		"Kantor Virtual",
		"Tanggal Mulai",
		"Tanggal Berakhir",
		"Nama Pengawas",
	];
	const rows = [
		[
			"Alamat Utama",
			"Jalan Contoh No. 10",
			"001",
			"002",
			"Kelurahan Contoh",
			"Kecamatan Contoh",
			"Kota Contoh",
			"Provinsi Contoh",
			"Indonesia",
			"000000",
			"10000",
			"-",
			"Tidak",
			"-",
			"-",
			"-",
			"-",
			"Tidak",
			"15/01/2020",
			"-",
			"Petugas Pengawas",
		],
	];

	const filteredRows = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase("id-ID");
		return rows.filter(
			(row) =>
				!needle ||
				row.some((value) => value.toLocaleLowerCase("id-ID").includes(needle)),
		);
	});
	const pagedRows = $derived(
		filteredRows.slice((page - 1) * pageSize, page * pageSize),
	);

	function resetFilters() {
		query = "";
		page = 1;
	}
</script>

<svelte:head><title>Alamat Wajib Pajak</title></svelte:head>

{#snippet tableActions()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={resetFilters}>Muat ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="address-filter"
			onclick={() => (filterOpen = !filterOpen)}
		>
			Filter
		</ActionButton>
		<ActionButton tone="quiet">Atur Kolom</ActionButton>
		<ActionButton tone="quiet">Export</ActionButton>
		<ActionButton tone="quiet">Riwayat</ActionButton>
	</Stack>
{/snippet}

<PageLayout contentWidth="1500px">
	<Breadcrumbs
		items={[
			{ label: "Profil", href: "/profile" },
			{ label: "Alamat Wajib Pajak" },
		]}
	/>
	<PageHeading eyebrow="Profil Saya" title="Alamat Wajib Pajak" />

	<Stack gap="18px">
		<FormSection title="Alamat Utama" bordered>
			<KeyValueGrid
				columns={3}
				surface="paper"
				items={[
					{ label: "Jenis Alamat", value: "Alamat Utama" },
					{
						label: "Alamat Lengkap",
						value: "Jalan Contoh No. 10, Kelurahan Contoh, Kota Contoh 10000",
					},
					{ label: "Negara", value: "Indonesia" },
				]}
			/>
		</FormSection>

		<FormSection title="Alamat" actions={tableActions} bordered padded={false}>
			<CollapsiblePanel open={filterOpen} id="address-filter" label="Filter alamat">
				<div class="filter-field">
					<FormField
						label="Cari alamat"
						bind:value={query}
						placeholder="Jenis, detail, wilayah, atau pemilik"
						oninput={() => (page = 1)}
					/>
				</div>
			</CollapsiblePanel>

			<DataTableViewport
				label="Daftar alamat wajib pajak"
				minWidth="2300px"
				framed={false}
				headerTone="navy"
			>
				<table>
					<thead>
						<tr>
							{#each columns as column}
								<th scope="col">{column}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each pagedRows as row}
							<tr>
								{#each row as value}<td>{value}</td>{/each}
							</tr>
						{:else}
							<tr><td class="empty" colspan={columns.length}>Tidak ada alamat yang sesuai.</td></tr>
						{/each}
					</tbody>
				</table>
			</DataTableViewport>

			<PaginationBar
				bind:page
				bind:pageSize
				totalItems={filteredRows.length}
				itemLabel="alamat"
			/>
		</FormSection>
	</Stack>
</PageLayout>

<style>
	.filter-field {
		max-width: 520px;
	}

	td {
		white-space: nowrap;
	}
</style>
