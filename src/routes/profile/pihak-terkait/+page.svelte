<script lang="ts">
	import {
		ActionButton,
		Breadcrumbs,
		CollapsiblePanel,
		DataTableViewport,
		FormField,
		FormSection,
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
		"NIK/NPWP Orang",
		"Nama PJ",
		"Kewarganegaraan",
		"Nomor Paspor",
		"Negara Asal",
		"NPWP Negara Asal",
		"Jenis Orang Terkait",
		"Subjenis Orang Terkait",
		"Jenis WP Terkait",
		"Keterangan",
		"Klasifikasi Saham",
		"Persentase Saham",
		"Kriteria Pemilik Manfaat",
		"Orang Terkait",
		"WP Terkait",
		"Penanggung Jawab",
		"Data Eksternal",
		"Tanggal Mulai",
		"Tanggal Berakhir",
	];
	const rows = [
		[
			"00.000.000.0-000.001",
			"Andi Contoh",
			"Indonesia",
			"-",
			"Indonesia",
			"-",
			"Pengurus",
			"Direktur",
			"Orang Pribadi",
			"Penanggung jawab utama",
			"Saham langsung",
			"60%",
			"Kepemilikan saham",
			"Ya",
			"Ya",
			"Ya",
			"Tidak",
			"15/01/2020",
			"-",
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

<svelte:head><title>Pihak Terkait</title></svelte:head>

{#snippet tableActions()}
	<Stack direction="horizontal" gap="7px" align="center" wrap>
		<ActionButton tone="quiet" onclick={resetFilters}>Muat ulang</ActionButton>
		<ActionButton
			tone={filterOpen ? "secondary" : "quiet"}
			aria-expanded={filterOpen}
			aria-controls="related-party-filter"
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
			{ label: "Pihak Terkait" },
		]}
	/>
	<PageHeading eyebrow="Profil Saya" title="Pihak Terkait" />

	<FormSection title="Daftar Pihak Terkait" actions={tableActions} bordered padded={false}>
		<CollapsiblePanel
			open={filterOpen}
			id="related-party-filter"
			label="Filter pihak terkait"
		>
			<div class="filter-field">
				<FormField
					label="Cari pihak terkait"
					bind:value={query}
					placeholder="NIK/NPWP, nama, jenis, atau keterangan"
					oninput={() => (page = 1)}
				/>
			</div>
		</CollapsiblePanel>

		<DataTableViewport
			label="Daftar pihak terkait"
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
						<tr><td class="empty" colspan={columns.length}>Tidak ada pihak terkait yang sesuai.</td></tr>
					{/each}
				</tbody>
			</table>
		</DataTableViewport>

		<PaginationBar
			bind:page
			bind:pageSize
			totalItems={filteredRows.length}
			itemLabel="pihak terkait"
		/>
	</FormSection>
</PageLayout>

<style>
	.filter-field {
		max-width: 520px;
	}

	td {
		white-space: nowrap;
	}
</style>
